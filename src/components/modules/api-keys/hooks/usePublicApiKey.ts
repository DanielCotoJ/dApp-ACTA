'use client';

import { useCallback, useMemo, useState } from 'react';
import { useNetwork } from '@/providers/network.provider';
import { useWalletContext } from '@/providers/wallet.provider';
import type { PublicApiKeyResponse } from '@/@types/api-keys';

function getActaApiBaseUrl(network: 'testnet' | 'mainnet') {
  return network === 'mainnet'
    ? 'https://acta.build/api/mainnet'
    : 'https://acta.build/api/testnet';
}

export function usePublicApiKey() {
  const { network } = useNetwork();
  const { walletAddress } = useWalletContext();

  const baseUrl = useMemo(() => getActaApiBaseUrl(network), [network]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PublicApiKeyResponse | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setLoading(false);
  }, []);

  const requestStandardKey = useCallback(
    async (params?: { name?: string; metadata?: Record<string, unknown> }) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const payload = {
          ...(params?.name ? { name: params.name } : {}),
          metadata: {
            ...(params?.metadata ?? {}),
            ...(walletAddress ? { wallet_address: walletAddress } : {}),
            requested_from: 'dapp-acta',
            network,
          },
        };

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
        return typed;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || 'Failed to create API key');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, network, walletAddress]
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
