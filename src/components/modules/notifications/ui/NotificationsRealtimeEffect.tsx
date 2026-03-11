'use client';

import { useNotificationsRealtime } from '../hooks/useNotificationsRealtime';

/**
 * Renders nothing; runs polling and shows Sonner toasts for new notifications
 * when the user is on a dashboard route. Mount only when pathname starts with /dashboard.
 */
export function NotificationsRealtimeEffect() {
  useNotificationsRealtime();
  return null;
}
