'use client';

import { useCallback, useMemo, useState } from 'react';
import { useVault } from '@/components/modules/vault/hooks/use-vault';
import type { Credential } from '@/@types/credentials';
import { toast } from 'sonner';
import { useNetwork } from '@/providers/network.provider';

function adaptVcToCredential(vc: unknown): Credential {
  const obj = (vc ?? {}) as Record<string, unknown>;
  let parsed: unknown = null;
  try {
    parsed = typeof obj.data === 'string' ? JSON.parse(obj.data as string) : (obj.data ?? null);
  } catch {
    parsed = null;
  }

  const p = (parsed ?? {}) as Record<string, unknown>;
  const cs = (p.credentialSubject ?? {}) as Record<string, unknown>;
  const title = (p.title as string) || (p.name as string) || (cs.name as string) || 'Credential';
  const issuer =
    (obj.issuer_did as string) || (p.issuer as string) || (p.issuerName as string) || '-';
  const subject = (p.subject as string) || (p.subjectDID as string) || (cs.id as string) || '-';
  const rawType = (p.type as unknown) ?? (p.credentialType as unknown) ?? 'VC';
  let type: string;
  if (Array.isArray(rawType)) {
    const filtered = rawType
      .map((t) => String(t))
      .filter((t) => t.toLowerCase() !== 'verifiablecredential');
    type = filtered.join(', ') || 'Credential';
  } else {
    const parts = String(rawType)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== 'verifiablecredential');
    type = parts.join(', ') || 'Credential';
  }
  const issuedAt = (p.issuedAt as string) || (p.issuanceDate as string) || new Date().toISOString();
  const expirationDate =
    (p.expirationDate as string) ||
    (p.validUntil as string) ||
    (cs.expirationDate as string) ||
    null;
  const birthDate = (cs.birthDate as string) || (p.birthDate as string) || undefined;

  const statusRaw = (obj.status as string) || (p.status as string) || 'valid';
  const statusNorm = String(statusRaw).toLowerCase();
  const status: 'valid' | 'expired' | 'revoked' =
    statusNorm === 'revoked' ? 'revoked' : statusNorm === 'expired' ? 'expired' : 'valid';

  return {
    id: String(obj.id ?? 'unknown'),
    title: String(title),
    issuer: String(issuer),
    subject: String(subject),
    type: String(type),
    issuedAt: String(issuedAt),
    expirationDate: expirationDate ? String(expirationDate) : null,
    status,
    birthDate: birthDate ? String(birthDate) : undefined,
    raw: parsed,
    vaultRecord: obj,
  };
}

export function useCredentialsList() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const { vcs, revokeCredential } = useVault();
  const { network } = useNetwork();

  const source = useMemo<Credential[]>(() => {
    const list = Array.isArray(vcs) ? (vcs as unknown[]).map((vc) => adaptVcToCredential(vc)) : [];
    return list;
  }, [vcs]);

  const [shareOpen, setShareOpen] = useState(false);
  const [toShare, setToShare] = useState<Credential | null>(null);

  const items = useMemo(() => {
    return source.filter((c) => {
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.type.toLowerCase().includes(query.toLowerCase()) ||
        c.issuer.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' ? true : c.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter, source]);

  const openShare = (c: Credential) => {
    setToShare(c);
    setShareOpen(true);
  };

  const closeShare = () => {
    setShareOpen(false);
    setToShare(null);
  };

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const onRevoke = useCallback(
    async (vcId: string) => {
      setRevokingId(vcId);
      try {
        const c = source.find((x) => x.id === vcId);
        void c;
        const { txId } = await revokeCredential(vcId);
        const net = network === 'mainnet' ? 'public' : 'testnet';
        const url = `https://stellar.expert/explorer/${net}/tx/${txId}`;
        toast.success('Credential revoked', {
          description: txId,
          action: {
            label: 'View on Stellar Expert',
            onClick: () => window.open(url, '_blank'),
          },
        });
        return txId;
      } finally {
        setRevokingId(null);
      }
    },
    [revokeCredential, network, source]
  );

  return {
    query,
    setQuery,
    filter,
    setFilter,
    items,
    shareOpen,
    toShare,
    openShare,
    closeShare,
    onRevoke,
    revokingId,
  };
}
