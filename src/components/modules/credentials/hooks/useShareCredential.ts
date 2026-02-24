'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Credential, ZkStatement } from '@/@types/credentials';

export function useShareCredential(credential: Credential | null) {
  const fields = useMemo(
    () => [
      { key: 'issuer', label: 'Issuer' },
      { key: 'subject', label: 'Holder DID' },
      { key: 'type', label: 'Credential Type' },
      { key: 'issuedAt', label: 'Issued At' },
      { key: 'expirationDate', label: 'Expiration Date' },
      { key: 'status', label: 'Status' },
    ],
    []
  );

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [predicate, setPredicate] = useState<{
    kind: 'none' | 'isAdult' | 'notExpired' | 'isValid';
  }>({ kind: 'none' });
  const [proof, setProof] = useState<{
    statement: ZkStatement;
    publicSignals: string[];
    proof: string | null;
    ok?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (predicate.kind === 'none') {
      setProof(null);
    }
  }, [predicate.kind]);

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
    (async () => {
      try {
        const payload: Record<string, unknown> = { revealedFields };
        if (credential?.id) payload.vc_id = credential.id;
        if (
          proof &&
          proof.statement !== ('none' as ZkStatement) &&
          typeof proof.proof === 'string' &&
          proof.proof
        ) {
          payload.statement = proof.statement as unknown;
          payload.publicSignals = proof.publicSignals as unknown;
          payload.proof = proof.proof as unknown;
          if (typeof proof.ok === 'boolean') payload.ok = proof.ok as unknown;
        }
        const resp = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (resp.ok) {
          const j = (await resp.json()) as { id?: string };
          if (j?.id) {
            setShareParam(encodeURIComponent(j.id));
            return;
          }
        }
        const json = JSON.stringify(payload);
        const bytes = new TextEncoder().encode(json);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const encoded = encodeURIComponent(btoa(binary));
        setShareParam(encoded);
      } catch {
        setShareParam('');
      }
    })();
  }, [revealedFields, credential, proof]);

  const isExpired = useMemo(() => {
    try {
      const exp = credential?.expirationDate || null;
      if (!exp) return false;
      const t = typeof exp === 'string' ? Date.parse(exp) : Number(exp);
      if (!Number.isFinite(t)) return false;
      return Date.now() >= t;
    } catch {
      return false;
    }
  }, [credential]);

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

  async function onGenerateProof() {
    setLoading(true);
    setError(null);
    setProof(null);
    try {
      const kind = predicate.kind;
      if (kind === 'none') {
        setProof(null);
      } else {
        if (!credential) {
          setProof({ statement: 'none', publicSignals: [], proof: null });
          return;
        }
        if (kind === 'isAdult' && !('birthDate' in credential)) {
          throw new Error('birth_date_missing');
        }
        if (kind === 'notExpired') {
          const exp = credential.expirationDate || null;
          const t = typeof exp === 'string' ? Date.parse(exp || '') : Number(exp);
          if (!exp) {
            throw new Error('expiration_date_missing');
          }
          if (!Number.isFinite(t)) {
            throw new Error('expiration_date_invalid');
          }
          if (Date.now() >= t) {
            setError('Credential is expired. Cannot generate proof.');
            return;
          }
        }
        const { generateZkProof } = await import('@/lib/zk');
        const res = await generateZkProof({
          credential: credential as unknown as Record<string, unknown>,
          revealFields: selected,
          predicate,
        });
        setProof({
          statement: res.statement as ZkStatement,
          publicSignals: res.publicSignals as string[],
          proof: res.proof,
          ok: (res as unknown as { ok?: boolean }).ok === true,
        });
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message?: unknown }).message || '')
          : '';
      const m = msg.toLowerCase();
      let display = 'Proof could not be generated.';
      if (predicate.kind === 'notExpired') {
        display =
          m.includes('satisfy') || m.includes('constraint')
            ? 'Credential is expired. Cannot generate proof.'
            : 'Proof error on expiration test.';
      } else if (predicate.kind === 'isValid') {
        display = 'Credential status is invalid. Cannot generate proof.';
      } else if (predicate.kind === 'isAdult') {
        display = m.includes('missing')
          ? 'Birth date required to generate age proof.'
          : 'Age below threshold. Cannot generate proof.';
      }
      setError(display);
    } finally {
      setLoading(false);
    }
  }

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
    predicate,
    setPredicate,
    loading,
    error,
    onGenerateProof,
    isExpired,
  };
}
