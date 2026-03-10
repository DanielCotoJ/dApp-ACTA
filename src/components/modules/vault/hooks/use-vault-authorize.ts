'use client';

import { useState, useCallback, useEffect } from 'react';
import { useVault } from '@/components/modules/vault/hooks/use-vault';

export function useVaultAuthorize() {
  const { authorizeSelf, authorizeAddress, checkSelfAuthorized } = useVault();
  const [addressInput, setAddressInput] = useState<string>('');
  const [isSelfAuthorized, setIsSelfAuthorized] = useState<boolean>(false);
  const [loadingSelf, setLoadingSelf] = useState<boolean>(false);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(false);

  const authorizeMe = useCallback(async () => {
    setLoadingSelf(true);
    try {
      const res = await authorizeSelf();
      setIsSelfAuthorized(true);
      return res;
    } finally {
      setLoadingSelf(false);
    }
  }, [authorizeSelf]);

  const authorizeWithInput = useCallback(async () => {
    const addr = addressInput.trim();
    if (!addr) throw new Error('Address required');
    setLoadingAddress(true);
    try {
      return await authorizeAddress(addr);
    } finally {
      setLoadingAddress(false);
    }
  }, [authorizeAddress, addressInput]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const already = await checkSelfAuthorized();
        if (mounted) setIsSelfAuthorized(!!already);
      } catch {
        if (mounted) setIsSelfAuthorized(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [checkSelfAuthorized]);

  return {
    addressInput,
    setAddressInput,
    authorizeMe,
    authorizeWithInput,
    loadingSelf,
    loadingAddress,
    isSelfAuthorized,
  };
}
