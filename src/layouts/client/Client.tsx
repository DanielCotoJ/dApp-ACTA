'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/sidebar/Sidebar';
import { HeaderHome } from '@/layouts/header/Header';
import { SettingsOverlayHost } from '@/components/modules/settings/ui/SettingsOverlayHost';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import GuidedTour from '@/components/modules/dashboard/ui/GuidedTour';
import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import MobileBottomNav from '@/components/ui/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { NotificationsRealtimeEffect } from '@/components/modules/notifications/ui/NotificationsRealtimeEffect';

export default function DashboardLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useWalletContext();
  useNetwork();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [guidedTourOpen, setGuidedTourOpen] = useState(false);

  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem('guided_tour_shown') === 'true';
      if (!tourSeen) {
        setTimeout(() => setGuidedTourOpen(true), 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => setGuidedTourOpen(true);
    window.addEventListener('open-guided-tour', handler as EventListener);
    return () => window.removeEventListener('open-guided-tour', handler as EventListener);
  }, []);

  return (
    <SidebarProvider>
      {!isMobile && <AppSidebar />}
      <SidebarInset>
        {pathname?.startsWith('/dashboard') && <NotificationsRealtimeEffect />}
        <SettingsOverlayHost />
        <GuidedTour
          open={guidedTourOpen}
          onClose={() => {
            setGuidedTourOpen(false);
            try {
              localStorage.setItem('guided_tour_shown', 'true');
            } catch {}
          }}
        />
        <div className="pl-0 md:pl-64">
          {pathname?.startsWith('/dashboard') && <HeaderHome />}
          <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
