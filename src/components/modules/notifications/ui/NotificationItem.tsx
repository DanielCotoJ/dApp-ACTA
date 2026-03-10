'use client';

import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldOff,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import type { Notification, NotificationType } from '../types';
import { NOTIFICATION_TYPE_LABEL } from '../types';
import { formatRelativeTime } from './formatRelativeTime';
import { cn } from '@/lib/utils';

function getIconNode(type: NotificationType): React.ReactNode {
  const iconClass = cn(
    'h-4 w-4',
    type === 'credential_received' && 'text-emerald-500',
    type === 'credential_verified' && 'text-blue-500',
    type === 'credential_expiring_soon' && 'text-amber-500',
    type === 'credential_revoked' && 'text-red-500'
  );
  switch (type) {
    case 'credential_received':
      return <CheckCircle2 className={iconClass} />;
    case 'credential_verified':
      return <ShieldCheck className={iconClass} />;
    case 'credential_expiring_soon':
      return <Clock className={iconClass} />;
    case 'credential_revoked':
      return <ShieldOff className={iconClass} />;
    case 'issuer_authorized':
      return <UserPlus className={iconClass} />;
    case 'issuer_revoked':
      return <UserMinus className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onClick?: () => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
  compact = false,
}: NotificationItemProps) {
  const isUnread = !notification.read_at;
  const iconNode = getIconNode(notification.type);
  const time = formatRelativeTime(notification.created_at);
  const copy = NOTIFICATION_TYPE_LABEL[notification.type];
  const typeLabel = copy?.title ?? 'Notification';
  const typeMessage = copy?.message ?? notification.message;

  const content = (
    <>
      <div className="flex shrink-0 pt-0.5">{iconNode}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', isUnread ? 'font-medium text-zinc-100' : 'text-zinc-300')}>
            {typeLabel}
          </p>
          <span className="shrink-0 text-xs text-zinc-500">{time}</span>
        </div>
        <p className={cn('mt-0.5 text-xs text-zinc-400', compact && 'line-clamp-2')}>
          {typeMessage}
        </p>
      </div>
      {isUnread && onMarkAsRead && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          className="shrink-0 rounded-md border border-[#edeed1]/30 bg-[#edeed1]/10 px-2.5 py-1 text-xs font-medium text-[#edeed1] hover:bg-[#edeed1]/20 transition-colors"
        >
          Mark read
        </button>
      )}
    </>
  );

  const wrapperClass = cn(
    'flex w-full gap-3 rounded-lg p-3 text-left transition-colors',
    (onClick || isUnread) && 'bg-zinc-800/50',
    onClick && 'cursor-pointer hover:bg-zinc-800/70'
  );

  return (
    <div
      className={wrapperClass}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      {content}
    </div>
  );
}
