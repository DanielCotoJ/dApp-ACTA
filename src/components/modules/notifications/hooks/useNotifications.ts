'use client';

import { useQuery } from '@tanstack/react-query';
import { useWalletContext } from '@/providers/wallet.provider';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { actaFetchJson } from '@/lib/actaApi';
import type { Notification } from '../types';

/** The API may return a bare array or a wrapped object like { data: [...], count: N }. */
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

export interface UseNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

function buildListPath(
  walletAddress: string,
  network: string,
  options: UseNotificationsOptions
): string {
  const params = new URLSearchParams({
    wallet_address: walletAddress,
    network,
  });
  if (options.limit != null) params.set('limit', String(options.limit));
  if (options.offset != null) params.set('offset', String(options.offset));
  if (options.unreadOnly === true) params.set('unread_only', 'true');
  return `/notifications?${params.toString()}`;
}

function buildUnreadCountPath(walletAddress: string, network: string): string {
  return `/notifications/unread-count?wallet_address=${encodeURIComponent(walletAddress)}&network=${network}`;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { walletAddress } = useWalletContext();
  const { network, apiKey } = useActaApiKey();
  const enabled = !!(walletAddress && apiKey?.trim());

  const listQuery = useQuery<Notification[]>({
    queryKey: [
      'notifications',
      'list',
      walletAddress,
      network,
      options.unreadOnly,
      options.limit,
      options.offset,
    ],
    queryFn: async () => {
      if (!walletAddress || !apiKey?.trim()) return [];
      const path = buildListPath(walletAddress, network, options);
      const raw = await actaFetchJson<unknown>({
        network,
        apiKey: apiKey.trim(),
        method: 'GET',
        path,
      });
      return extractNotifications(raw);
    },
    enabled,
    staleTime: 30_000,
  });

  const unreadCountQuery = useQuery<{ count: number }>({
    queryKey: ['notifications', 'unreadCount', walletAddress, network],
    queryFn: async () => {
      if (!walletAddress || !apiKey?.trim()) return { count: 0 };
      const path = buildUnreadCountPath(walletAddress, network);
      return actaFetchJson<{ count: number }>({
        network,
        apiKey: apiKey.trim(),
        method: 'GET',
        path,
      });
    },
    enabled,
    staleTime: 30_000,
  });

  const notifications = listQuery.data ?? [];
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const loading = listQuery.isLoading || unreadCountQuery.isLoading;
  const error = listQuery.error ?? unreadCountQuery.error;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetchNotifications: listQuery.refetch,
    refetchUnreadCount: unreadCountQuery.refetch,
  };
}
