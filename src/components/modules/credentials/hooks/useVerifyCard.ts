'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';

export function useVerifyCard(status?: string | null) {
  const displayStatus = useMemo(() => {
    const s = String(status ?? '').toLowerCase();
    if (s === 'revoked') return 'Revoked';
    if (s === 'expired') return 'Expired';
    if (s) return 'Valid';
    return 'Valid';
  }, [status]);

  const statusDisplay = useMemo(() => {
    if (displayStatus === 'Revoked') return { bg: 'bg-red-500/10', color: 'text-red-300' };
    if (displayStatus === 'Expired') return { bg: 'bg-yellow-500/10', color: 'text-yellow-300' };
    return { bg: 'bg-green-500/10', color: 'text-green-300' };
  }, [displayStatus]);

  const shorten = (s: string) => (s && s.length > 12 ? `${s.slice(0, 6)}…${s.slice(-6)}` : s);

  const formatRevealed = (key: string, value: unknown) => {
    const raw = String(value ?? '');
    const lower = key.toLowerCase();
    let text = raw;
    let isWallet = false;
    const walletLike = raw.startsWith('did:') || /^G[0-9A-Za-z]{55}$/.test(raw);
    if ((lower === 'issuer' || lower === 'subject' || lower === 'issuerdid') && walletLike) {
      const wallet = raw.startsWith('did:') ? (raw.split(':').pop() as string) : raw;
      text = shorten(wallet);
      isWallet = true;
    }
    if (lower === 'status') {
      text = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
    }
    return { text, raw, isWallet };
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard?.writeText(value);
      toast.success('Copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return { displayStatus, statusDisplay, formatRevealed, copy };
}
