'use client';

import { useMemo, useCallback, useState } from 'react';
import { useVault } from '@/components/modules/vault/hooks/use-vault';

function extractGFromDid(did?: string): string | null {
  if (!did) return null;
  const m = did.match(/did:pkh:stellar:(mainnet|testnet):([A-Z0-9]{56})/i);
  return m ? m[2] : null;
}

export function useVaultAuthorizedList() {
  const { vcs, revokeAddress, loading } = useVault();
  const [revoking, setRevoking] = useState<string | null>(null);

  const issuers = useMemo(() => {
    const map = new Map<string, { address: string; issuerDid?: string }>();
    (vcs || []).forEach((vc) => {
      const issuerDid = (vc as Record<string, unknown>)?.issuer_did as string | undefined;
      const addr = extractGFromDid(issuerDid);
      if (addr && !map.has(addr)) {
        map.set(addr, { address: addr, issuerDid });
      }
    });
    return Array.from(map.values());
  }, [vcs]);

  const revoke = useCallback(
    async (address: string) => {
      setRevoking(address);
      try {
        const res = await revokeAddress(address);
        return res;
      } finally {
        setRevoking(null);
      }
    },
    [revokeAddress]
  );

  return { issuers, revoke, loading, revoking };
}
