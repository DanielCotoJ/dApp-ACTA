'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/sidebar/Sidebar';
import { HeaderHome } from '@/layouts/header/Header';
import { SettingsOverlayHost } from '@/components/modules/settings/ui/SettingsOverlayHost';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TutorialModal from '@/components/modules/tutorial/ui/TutorialModal';
import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import MobileBottomNav from '@/components/ui/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useWalletContext();
  useNetwork();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [tutorialClosed, setTutorialClosed] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    try {
      const key = 'tutorial_shown_global';
      const seen = localStorage.getItem(key) === 'true';
      setTimeout(() => setTutorialOpen(!seen), 0);
    } catch {}
  }, []);

  return (
    <SidebarProvider>
      {!isMobile && <AppSidebar />}
      <SidebarInset>
        <SettingsOverlayHost />
        <TutorialModal
          open={tutorialOpen && !tutorialClosed}
          onClose={() => {
            try {
              const key = 'tutorial_shown_global';
              localStorage.setItem(key, 'true');
            } catch {}
            setTutorialClosed(true);
            setTutorialOpen(false);
          }}
        />
        <div className="md:pl-16 pl-0">
          {pathname?.startsWith('/dashboard') &&
            !(isMobile && pathname?.startsWith('/dashboard/tutorials')) && <HeaderHome />}
          <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
