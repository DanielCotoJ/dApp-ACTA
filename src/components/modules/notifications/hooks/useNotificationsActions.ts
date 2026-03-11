'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletContext } from '@/providers/wallet.provider';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { getActaApiBaseUrl } from '@/lib/actaApi';

export function useNotificationsActions() {
  const { walletAddress } = useWalletContext();
  const { network, apiKey } = useActaApiKey();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!walletAddress || !apiKey?.trim()) {
        throw new Error('Wallet and API key required');
      }
      const base = getActaApiBaseUrl(network);
      const url = `${base}/notifications/${encodeURIComponent(id)}/read?wallet_address=${encodeURIComponent(walletAddress)}`;
      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-ACTA-Key': apiKey.trim() },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json().catch(() => ({}));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutateAsync,
    markAsReadPending: markAsReadMutation.isPending,
    markAsReadError: markAsReadMutation.error,
  };
}
