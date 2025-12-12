'use client';

import { useEffect, useState } from 'react';
import type { ZkStatement } from '@/@types/credentials';
import { useNetwork } from '@/providers/network.provider';
import { useVaultApi, useActaClient } from '@acta-team/acta-sdk';
import { verifyOnChain } from '@/lib/actaOnChain';
import { useWalletContext } from '@/providers/wallet.provider';
import { verifyZkProof } from '@/lib/zk';

type VerifyResult = {
  vc_id: string;
  status: string | null;
  since?: string | null;
};

export function useCredentialVerify(vcId: string) {
  const { network } = useNetwork();
  const { walletAddress } = useWalletContext();
  const [verify, setVerify] = useState<VerifyResult | null>(null);
  const [revealed, setRevealed] = useState<Record<string, unknown> | null>(null);
  const [zkValid, setZkValid] = useState<boolean | null>(null);
  const [zkStatement, setZkStatement] = useState<ZkStatement | null>(null);
  const [hasVerified, setHasVerified] = useState(false);
  const [reverifyLoading, setReverifyLoading] = useState(false);
  const { verifyInVault } = useVaultApi();
  const client = useActaClient();
  const [shareParam, setShareParam] = useState<unknown>(null);
  useEffect(() => {
    const read = async () => {
      if (typeof window === 'undefined') return;
      let raw: string | null = null;
      const sp = new URLSearchParams(window.location.search);
      raw = sp.get('share');
      if (!raw) {
        const hs = String(window.location.hash || '');
        if (hs.startsWith('#share=')) {
          raw = hs.slice('#share='.length);
        } else if (hs.includes('share=')) {
          const idx = hs.indexOf('share=');
          raw = hs.slice(idx + 6);
        }
      }
      if (!raw) {
        setShareParam(null);
        return;
      }
      try {
        let b64 = '';
        try {
          b64 = decodeURIComponent(raw);
        } catch {
          b64 = raw;
        }
        b64 = b64.replace(/\s+/g, '');
        b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4;
        if (pad) b64 = b64 + '='.repeat(4 - pad);
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const json = new TextDecoder().decode(bytes);
        const obj = JSON.parse(json) as unknown;
        setShareParam(obj);
        return;
      } catch {}
      try {
        const resp = await fetch(`/api/share?key=${encodeURIComponent(raw)}`);
        if (resp.ok) {
          const obj = (await resp.json()) as unknown;
          setShareParam(obj);
          return;
        }
      } catch {}
      setShareParam(null);
    };
    read();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const cfg = client.getDefaults();
        const vaultIdOverride = cfg.vaultContractId || '';
        if (shareParam && typeof shareParam === 'object') {
          const sp = shareParam as {
            revealedFields?: Record<string, unknown>;
            statement?: unknown;
            proof?: string;
            ok?: boolean;
          };
          setRevealed(sp.revealedFields || null);
          const st = sp.statement;
          if (st === 'none' || (typeof st === 'object' && st && 'kind' in st)) {
            setZkStatement(st as ZkStatement);
          } else {
            setZkStatement(null);
          }
          // No auto-verification: status must be shown only after user clicks
        }

        if (vcId && walletAddress) {
          try {
            const v = await verifyInVault({
              owner: walletAddress,
              vcId,
              vaultContractId: vaultIdOverride || undefined,
            });
            const norm = (v?.status || '').toLowerCase();
            if (norm === 'valid' || norm === 'revoked') {
              setVerify(v);
              return;
            }
          } catch {}
        }

        const issuanceId = cfg.issuanceContractId || '';
        if (vcId && issuanceId) {
          try {
            const r = await verifyOnChain({
              rpcUrl: cfg.rpcUrl,
              networkPassphrase: cfg.networkPassphrase,
              issuanceContractId: issuanceId,
              vcId,
            });
            const norm = (r?.status || '').toLowerCase();
            if (norm === 'valid' || norm === 'revoked') {
              setVerify(r);
              return;
            }
          } catch {}
        }

        setVerify({ vc_id: vcId, status: 'not_verified' });
      } catch {
        setVerify({ vc_id: vcId, status: 'not_verified' });
      }
    };
    run();
  }, [vcId, network, walletAddress, shareParam, verifyInVault, client]);

  const reverify = async () => {
    if (!shareParam || typeof shareParam !== 'object') return;
    const sp = shareParam as {
      statement?: {
        kind?: string;
        typeHash?: string;
        expectedHash?: string;
        valid?: string;
      };
      publicSignals?: string[];
      proof?: string;
      ok?: boolean;
    };
    try {
      setReverifyLoading(true);
      if (typeof sp.ok === 'boolean') {
        setZkValid(sp.ok === true);
        setHasVerified(true);
        return;
      }
      const ok = await verifyZkProof(sp as unknown as typeof sp);
      setZkValid(ok);
      setHasVerified(true);
    } catch {
    } finally {
      setReverifyLoading(false);
    }
  };

  return { verify, revealed, zkValid, zkStatement, reverify, reverifyLoading, hasVerified };
}
