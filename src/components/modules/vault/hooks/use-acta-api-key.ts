'use client';

import { useCallback, useEffect, useState } from 'react';
import { useNetwork } from '@/providers/network.provider';
import { getStoredApiKey, setStoredApiKey } from '@/lib/actaApi';

/**
 * React hook to access and persist the ACTA API key (per network).
 */
export function useActaApiKey() {
  const { network } = useNetwork();
  const [apiKey, setApiKeyState] = useState<string>('');

  useEffect(() => {
    setApiKeyState(getStoredApiKey(network));
  }, [network]);

  useEffect(() => {
    const onCreated = (ev: Event) => {
      const detail = (ev as CustomEvent<{ network?: string }>).detail;
      if (detail?.network && detail.network !== network) return;
      setApiKeyState(getStoredApiKey(network));
    };
    window.addEventListener('acta-api-key-created', onCreated);
    return () => window.removeEventListener('acta-api-key-created', onCreated);
  }, [network]);

  const setApiKey = useCallback(
    (next: string) => {
      setApiKeyState(next);
      setStoredApiKey(network, next);
    },
    [network]
  );

  return { network, apiKey, setApiKey };
}
