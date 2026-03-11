'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWalletContext } from '@/providers/wallet.provider';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { actaFetchJson } from '@/lib/actaApi';
import type { Notification } from '../types';
import { useNotificationToast } from './useNotificationToast';

function extractNotifications(raw: unknown): Notification[] {
  if (Array.isArray(raw)) return raw as Notification[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Notification[];
    if (Array.isArray(obj.notifications)) return obj.notifications as Notification[];
    if (Array.isArray(obj.items)) return obj.items as Notification[];
  }
  return [];
}

function buildListPath(walletAddress: string, network: string, limit: number): string {
  const params = new URLSearchParams({
    wallet_address: walletAddress,
    network,
    unread_only: 'true',
    limit: String(limit),
  });
  return `/notifications?${params.toString()}`;
}

export function useNotificationsRealtime() {
  const pathname = usePathname();
  const { walletAddress } = useWalletContext();
  const { network, apiKey } = useActaApiKey();
  const { showNotificationToast } = useNotificationToast();
  const queryClient = useQueryClient();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const identityRef = useRef<string>('');

  const enabled =
    !!(walletAddress && apiKey?.trim()) &&
    typeof pathname === 'string' &&
    pathname.startsWith('/dashboard');

  const identity = `${walletAddress ?? ''}::${network}`;

  useEffect(() => {
    if (identityRef.current !== identity) {
      seenIdsRef.current = new Set();
      hasInitializedRef.current = false;
      identityRef.current = identity;
    }
  }, [identity]);

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', 'realtime', walletAddress, network, apiKey],
    queryFn: async () => {
      if (!walletAddress || !apiKey?.trim()) return [];
      const path = buildListPath(walletAddress, network, 20);
      const raw = await actaFetchJson<unknown>({
        network,
        apiKey: apiKey.trim(),
        method: 'GET',
        path,
      });
      return extractNotifications(raw);
    },
    enabled,
    refetchInterval: 20_000,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!query.data || !enabled) return;
    if (identityRef.current !== identity) return;

    const seen = seenIdsRef.current;
    const initialized = hasInitializedRef.current;
    let hasNew = false;

    for (const notification of query.data) {
      if (seen.has(notification.id)) continue;
      seen.add(notification.id);
      if (initialized) {
        hasNew = true;
        showNotificationToast(notification);
      }
    }

    hasInitializedRef.current = true;

    if (hasNew) {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    }
  }, [query.data, enabled, identity, showNotificationToast, queryClient]);
}
