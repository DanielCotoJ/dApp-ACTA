'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletContext } from '@/providers/wallet.provider';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { actaFetchJson } from '@/lib/actaApi';

export function useNotificationsActions() {
  const { walletAddress } = useWalletContext();
  const { network, apiKey } = useActaApiKey();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!walletAddress || !apiKey?.trim()) {
        throw new Error('Wallet and API key required');
      }
      const path = `/notifications/${encodeURIComponent(id)}/read?wallet_address=${encodeURIComponent(walletAddress)}`;
      return actaFetchJson<unknown>({
        network,
        apiKey: apiKey.trim(),
        method: 'PATCH',
        path,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutateAsync,
    markAsReadPending: markAsReadMutation.isPending,
    markAsReadError: markAsReadMutation.error,
  };
}
