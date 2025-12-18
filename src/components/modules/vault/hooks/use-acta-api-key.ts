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

  const setApiKey = useCallback(
    (next: string) => {
      setApiKeyState(next);
      setStoredApiKey(network, next);
    },
    [network]
  );

  return { network, apiKey, setApiKey };
}
