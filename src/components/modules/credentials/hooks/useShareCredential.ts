'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Credential } from '@/@types/credentials';
import { useNetwork } from '@/providers/network.provider';
import { getActaApiBaseUrl } from '@/lib/actaApi';

export function useShareCredential(credential: Credential | null) {
  const { network } = useNetwork();
  const fields = useMemo(() => {
    const isPresent = (value: unknown) =>
      value !== undefined && value !== null && String(value) !== '';
    const toLabel = (key: string) =>
      key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\w/, (m) => m.toUpperCase());
    const c = (credential ?? {}) as Record<string, unknown>;

    const isImpacta = typeof c.type === 'string' && c.type.includes('ImpactaCertificateCredential');

    if (isImpacta) {
      const next: Array<{ key: string; label: string }> = [];
      if (isPresent(c.issuer)) next.push({ key: 'issuer', label: 'Issuer' });
      if (isPresent(c.subject)) next.push({ key: 'subject', label: 'Holder DID' });
      if (isPresent(c.type)) next.push({ key: 'type', label: 'Credential Type' });
      if (isPresent(c.issuedAt)) next.push({ key: 'issuedAt', label: 'Issued At' });
      if (isPresent(c.status)) next.push({ key: 'status', label: 'Status' });
      if (isPresent(c.holderName)) next.push({ key: 'holderName', label: 'Holder Name' });
      return next;
    }
    const base = [
      { key: 'issuerDid', label: 'Issuer DID' },
      { key: 'issuer', label: 'Issuer' },
      { key: 'subject', label: 'Holder DID' },
      { key: 'type', label: 'Credential Type' },
      { key: 'issuedAt', label: 'Issued At' },
      { key: 'expirationDate', label: 'Expiration Date' },
      { key: 'status', label: 'Status' },
    ];
    const reserved = new Set([
      'id',
      'title',
      'raw',
      'vaultRecord',
      'birthDate',
      'issuerName',
      ...base.map((f) => f.key),
    ]);
    const next: Array<{ key: string; label: string }> = [];
    for (const field of base) {
      if (isPresent(c[field.key])) next.push(field);
    }
    for (const [key, value] of Object.entries(c)) {
      if (reserved.has(key)) continue;
      if (!isPresent(value)) continue;
      next.push({ key, label: toLabel(key) });
    }
    return next;
  }, [credential]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const onSelectAll = () => {
    if (!credential) return;
    const next: Record<string, boolean> = {};
    const c = credential as unknown as Record<string, unknown>;
    for (const f of fields) {
      const val = c[f.key];
      next[f.key] = val !== undefined && val !== null && String(val) !== '';
    }
    setSelected(next);
    setCopied(false);
  };

  const onUnselectAll = () => {
    setSelected({});
    setCopied(false);
  };

  const revealedFields = useMemo(() => {
    const obj: Record<string, unknown> = {};
    if (!credential) return obj;
    const c = credential as unknown as Record<string, unknown>;
    for (const f of fields) {
      if (selected[f.key] && c[f.key] != null) {
        obj[f.key] = c[f.key] as unknown;
      }
    }
    return obj;
  }, [fields, selected, credential]);

  const [shareParam, setShareParam] = useState<string>('');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload: Record<string, unknown> = { revealedFields };
        if (credential?.id) payload.vc_id = credential.id;
        if (credential?.type) payload.type = credential.type;

        const json = JSON.stringify(payload);

        try {
          const apiBase = getActaApiBaseUrl(network);
          const resp = await fetch(`${apiBase}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
          });
          if (resp.ok) {
            const data = (await resp.json()) as { id?: string } | null;
            const id = data && typeof data.id === 'string' ? data.id : null;
            if (id && !cancelled) {
              setShareParam(encodeURIComponent(id));
              return;
            }
          }
        } catch {
          // API unavailable — fall through to inline Base64
        }

        if (cancelled) return;
        const bytes = new TextEncoder().encode(json);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
        setShareParam(encodeURIComponent(b64));
      } catch {
        if (!cancelled) setShareParam('');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [revealedFields, credential, network]);

  const onToggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
    setCopied(false);
  };

  const onCopy = async () => {
    try {
      const vcId = credential?.id || '';
      const url = `${window.location.origin}/credential/${vcId}?share=${shareParam}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {}
  };

  return {
    fields,
    selected,
    copied,
    revealedFields,
    shareParam,
    onSelectAll,
    onUnselectAll,
    onToggle,
    onCopy,
  };
}
