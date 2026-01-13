'use client';

import { useCallback, useMemo, useState } from 'react';
import { useNetwork } from '@/providers/network.provider';
import { useWalletContext } from '@/providers/wallet.provider';
import type { PublicApiKeyResponse } from '@/@types/api-keys';
import { getActaApiBaseUrl, setStoredApiKey } from '@/lib/actaApi';

export function usePublicApiKey() {
  const { network } = useNetwork();
  const { walletAddress } = useWalletContext();

  // For API key creation, we need to use the direct instance URLs
  // Since there's a proxy that rewrites URLs, we use the direct Railway instance URLs
  // Each instance is already configured for its specific network, so we use /public/api-keys
  const baseUrl = useMemo(() => {
    // Use environment variables if available (these should point directly to Railway instances)
    const envKey =
      network === 'mainnet'
        ? process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_MAINNET
        : process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_TESTNET;

    if (envKey && typeof envKey === 'string' && envKey.trim()) {
      return envKey.trim().replace(/\/$/, '');
    }

    // Use direct Railway instance URLs to bypass proxy URL rewriting
    // These URLs point directly to the specific network instance
    return network === 'mainnet'
      ? 'https://api.mainnet.acta.build'
      : 'https://api.testnet.acta.build';
  }, [network]);

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
        console.warn('[usePublicApiKey] Request already in progress, ignoring duplicate call', {
          isRequesting,
          loading,
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // Generate a unique request ID on the frontend to track duplicate requests
      const frontendRequestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      console.log('[usePublicApiKey] Starting request:', {
        frontendRequestId,
        isRequesting,
        loading,
        timestamp: new Date().toISOString(),
      });

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
            frontend_request_id: frontendRequestId, // Track from frontend
          },
        };

        console.log('[usePublicApiKey] Creating API key:', {
          baseUrl,
          network,
          walletAddress,
          payload,
        });

        // Use the network-specific endpoint with direct Railway instance URLs
        // This bypasses the proxy at acta.build/api that was rewriting URLs
        // We use /{network}/public/api-keys as documented in api/docs/endpoints.md (lines 43-51)
        const endpoint = `/${network}/public/api-keys`;
        const fullUrl = `${baseUrl}${endpoint}`;

        // Validate that we're using the correct instance URL for the network
        const expectedDomain =
          network === 'mainnet' ? 'api.mainnet.acta.build' : 'api.testnet.acta.build';
        if (!fullUrl.includes(expectedDomain)) {
          console.error('[usePublicApiKey] ERROR: URL does not point to correct instance!', {
            baseUrl,
            endpoint,
            fullUrl,
            network,
            expectedDomain,
          });
          throw new Error(`Invalid URL: must use ${expectedDomain} for ${network}`);
        }

        // Validate that the endpoint includes the network prefix
        if (!endpoint.includes(`/${network}/public/api-keys`)) {
          console.error('[usePublicApiKey] ERROR: Endpoint does not include network prefix!', {
            endpoint,
            network,
          });
          throw new Error(`Invalid endpoint: must include /${network}/public/api-keys`);
        }

        console.log('[usePublicApiKey] Full URL:', fullUrl);
        console.log('[usePublicApiKey] Endpoint:', endpoint);
        console.log('[usePublicApiKey] Base URL:', baseUrl);
        console.log('[usePublicApiKey] Network:', network);

        const resp = await fetch(fullUrl, {
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

        // Force a page reload or trigger vault status refresh after API key is created
        // This ensures the vault existence check runs with the new API key
        // Dispatch a custom event that useVault can listen to
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('acta-api-key-created', { detail: { network } }));
        }

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
