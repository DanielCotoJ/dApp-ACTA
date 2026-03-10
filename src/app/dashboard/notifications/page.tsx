import { NotificationList } from '@/components/modules/notifications/ui/NotificationList';

export const metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">Notifications</h1>
      <NotificationList />
    </div>
  );
}
