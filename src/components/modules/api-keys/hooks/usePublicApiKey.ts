'use client';

import { useCallback, useMemo, useState } from 'react';
import { useNetwork } from '@/providers/network.provider';
import { useWalletContext } from '@/providers/wallet.provider';
import type { PublicApiKeyResponse } from '@/@types/api-keys';
import { getActaApiBaseUrl, setStoredApiKey } from '@/lib/actaApi';

export function usePublicApiKey() {
  const { network } = useNetwork();
  const { walletAddress } = useWalletContext();

  const baseUrl = useMemo(() => getActaApiBaseUrl(network), [network]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PublicApiKeyResponse | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setLoading(false);
    setIsRequesting(false);
  }, []);

  const requestStandardKey = useCallback(
    async (params?: { name?: string; metadata?: Record<string, unknown> }) => {
      // Prevent multiple simultaneous requests
      if (isRequesting || loading) {
        console.warn('[usePublicApiKey] Request already in progress, ignoring duplicate call');
        return null;
      }

      setIsRequesting(true);
      setLoading(true);
      setError(null);
      setData(null);

      try {
        if (!walletAddress) {
          throw new Error(
            'Wallet address is required to create an API key. Please connect your wallet first.'
          );
        }

        const payload = {
          ...(params?.name ? { name: params.name } : {}),
          wallet_address: walletAddress,
          metadata: {
            ...(params?.metadata ?? {}),
            requested_from: 'dapp-acta',
            network,
          },
        };

        console.log('[usePublicApiKey] Creating API key:', {
          baseUrl,
          network,
          walletAddress,
          payload,
        });

        const resp = await fetch(`${baseUrl}/public/api-keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const json: unknown = await resp.json();

        if (!resp.ok) {
          const msg =
            typeof json === 'object' &&
            json !== null &&
            'message' in json &&
            typeof (json as { message?: unknown }).message === 'string'
              ? ((json as { message?: string }).message ?? 'Failed to create API key')
              : 'Failed to create API key';
          throw new Error(msg);
        }

        if (
          typeof json !== 'object' ||
          json === null ||
          !('api_key' in json) ||
          !('api_key_record' in json) ||
          typeof (json as { api_key?: unknown }).api_key !== 'string'
        ) {
          throw new Error('Invalid response from API');
        }

        const typed = json as PublicApiKeyResponse;
        setData(typed);
        // Store API key for the current network to be used across the app.
        setStoredApiKey(network, typed.api_key);
        return typed;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[usePublicApiKey] Error creating API key:', msg);
        setError(msg || 'Failed to create API key');
        return null;
      } finally {
        setLoading(false);
        setIsRequesting(false);
      }
    },
    [baseUrl, network, walletAddress, isRequesting, loading]
  );

  return {
    network,
    baseUrl,
    loading,
    error,
    data,
    requestStandardKey,
    reset,
  };
}
