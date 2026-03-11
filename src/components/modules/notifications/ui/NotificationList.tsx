'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationsActions } from '../hooks/useNotificationsActions';
import { NotificationItem } from './NotificationItem';

const PAGE_SIZE = 20;

export function NotificationList() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { notifications, loading, error } = useNotifications({
    unreadOnly,
    limit: PAGE_SIZE,
    offset: 0,
  });
  const { markAsRead } = useNotificationsActions();

  const handleItemClick = (vcId: string | undefined) => {
    if (vcId) {
      router.push(`/credential/${vcId}`);
    } else {
      router.push('/dashboard/notifications');
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-red-400">
        {error instanceof Error ? error.message : 'Failed to load notifications'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            !unreadOnly
              ? 'bg-[#edeed1]/20 text-[#edeed1] border border-[#edeed1]/30'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            unreadOnly
              ? 'bg-[#edeed1]/20 text-[#edeed1] border border-[#edeed1]/30'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          Unread
        </button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-500">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">
            {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onClick={() => handleItemClick(notification.metadata?.vc_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
