'use client';

import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationPreview } from './NotificationPreview';

export function NotificationBell() {
  const { unreadCount, refetchNotifications } = useNotifications({
    limit: 8,
    unreadOnly: false,
  });

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) void refetchNotifications();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:bg-[#edeed1]/10 hover:text-[#edeed1] transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#edeed1] px-1 text-[10px] font-medium text-zinc-900"
              aria-hidden
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <NotificationPreview />
      </PopoverContent>
    </Popover>
  );
}
