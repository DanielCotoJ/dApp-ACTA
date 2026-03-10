'use client';

import Link from 'next/link';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

const PREVIEW_LIMIT = 8;

export function NotificationPreview() {
  const { notifications, loading } = useNotifications({
    limit: PREVIEW_LIMIT,
    unreadOnly: false,
  });

  const previewList = notifications.slice(0, PREVIEW_LIMIT);

  return (
    <div className="flex flex-col">
      <div className="max-h-[320px] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-zinc-500">Loading…</div>
        ) : previewList.length === 0 ? (
          <div className="p-4 text-center text-sm text-zinc-500">No notifications</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {previewList.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} compact />
            ))}
          </div>
        )}
      </div>
      {previewList.length > 0 && (
        <Link
          href="/dashboard/notifications"
          className="border-t border-zinc-800 px-4 py-3 text-center text-sm text-[#edeed1] hover:bg-zinc-800/50"
        >
          View all
        </Link>
      )}
    </div>
  );
}
