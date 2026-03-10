'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Notification } from '../types';
import { NOTIFICATION_TYPE_LABEL } from '../types';

export function useNotificationToast() {
  const router = useRouter();

  const showNotificationToast = useCallback(
    (notification: Notification) => {
      const vcId = notification.metadata?.vc_id;
      const action =
        vcId
          ? {
              label: 'View credential' as const,
              onClick: () => router.push(`/credential/${vcId}`),
            }
          : {
              label: 'View all' as const,
              onClick: () => router.push('/dashboard/notifications'),
            };

      const title = NOTIFICATION_TYPE_LABEL[notification.type] ?? 'Notification';
      const description = notification.message;

      switch (notification.type) {
        case 'credential_received':
          toast.success(title, { description, action });
          break;
        case 'credential_verified':
          toast.info(title, { description, action });
          break;
        case 'credential_expiring_soon':
          toast.info(title, { description, action });
          break;
        case 'credential_revoked':
          toast.warning(title, { description, action });
          break;
        case 'issuer_authorized':
          toast.info(title, { description, action });
          break;
        case 'issuer_revoked':
          toast.info(title, { description, action });
          break;
        default:
          toast(title, { description, action });
      }
    },
    [router]
  );

  return { showNotificationToast };
}
