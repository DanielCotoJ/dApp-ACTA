'use client';

import { useEffect, useState } from 'react';
import { useNetwork } from '@/providers/network.provider';
import { useWalletContext } from '@/providers/wallet.provider';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { actaFetchJson, getActaApiBaseUrl } from '@/lib/actaApi';

type VerifyResult = {
  vc_id: string;
  status: string | null;
  since?: string | null;
};

export function useCredentialVerify(vcId: string) {
  const { network } = useNetwork();
  const { walletAddress } = useWalletContext();
  const { apiKey } = useActaApiKey();
  const [verify, setVerify] = useState<VerifyResult | null>(null);
  const [revealed, setRevealed] = useState<Record<string, unknown> | null>(null);
  const [shareParam, setShareParam] = useState<unknown>(null);
  const [shareType, setShareType] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(true);

  useEffect(() => {
    const read = async () => {
      if (typeof window === 'undefined') {
        setShareLoading(false);
        return;
      }
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
        setShareLoading(false);
        return;
      }

      let decoded = '';
      try {
        decoded = decodeURIComponent(raw);
      } catch {
        decoded = raw;
      }

      // 1) Try inline Base64 decoding
      try {
        let b64 = decoded.replace(/\s+/g, '');
        b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64.length % 4;
        if (pad) b64 = b64 + '='.repeat(4 - pad);
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const json = new TextDecoder().decode(bytes);
        const obj = JSON.parse(json) as unknown;
        if (
          obj &&
          typeof obj === 'object' &&
          'revealedFields' in (obj as Record<string, unknown>)
        ) {
          setShareParam(obj);
          setShareLoading(false);
          return;
        }
      } catch {}

      // 2) Treat as short ID — fetch from persistent API
      try {
        const apiBase = getActaApiBaseUrl(network);
        const resp = await fetch(`${apiBase}/share/${encodeURIComponent(decoded)}`);
        if (resp.ok) {
          const obj = (await resp.json()) as unknown;
          setShareParam(obj);
          setShareLoading(false);
          return;
        }
      } catch {}

      setShareParam(null);
      setShareLoading(false);
    };
    read();
  }, [network]);

  useEffect(() => {
    const run = async () => {
      try {
        if (shareParam && typeof shareParam === 'object') {
          const sp = shareParam as {
            revealedFields?: Record<string, unknown>;
            type?: unknown;
          };
          setRevealed(sp.revealedFields || null);
          const rawType = sp.type;
          if (typeof rawType === 'string') {
            setShareType(rawType);
          } else if (Array.isArray(rawType)) {
            setShareType((rawType as string[]).join(','));
          } else {
            setShareType(null);
          }
        }

        if (vcId && walletAddress && apiKey.trim()) {
          try {
            const v = await actaFetchJson<{ status: string; since?: string }>({
              network,
              apiKey: apiKey.trim(),
              path: '/contracts/vault/verify-vc',
              body: { owner: walletAddress, vcId },
            });
            const norm = (v?.status || '').toLowerCase();
            if (norm) {
              setVerify({ vc_id: vcId, status: v.status, since: v.since ?? null });
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
  }, [vcId, network, walletAddress, shareParam, apiKey]);

  return {
    verify,
    revealed,
    shareType,
    shareLoading,
  };
}
