'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/sidebar/Sidebar';
import { HeaderHome } from '@/layouts/header/Header';
import { SettingsOverlayHost } from '@/components/modules/settings/ui/SettingsOverlayHost';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import TutorialModal from '@/components/modules/tutorial/ui/TutorialModal';
import GuidedTour from '@/components/modules/dashboard/ui/GuidedTour';
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
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [guidedTourOpen, setGuidedTourOpen] = useState(false);
  const isFirstVisit = useRef(false);

  useEffect(() => {
    try {
      const tourSeen = localStorage.getItem('guided_tour_shown') === 'true';
      const tutorialSeen = localStorage.getItem('tutorial_shown_global') === 'true';

      if (!tourSeen) {
        isFirstVisit.current = true;
        setTimeout(() => setGuidedTourOpen(true), 0);
      } else if (!tutorialSeen) {
        setTimeout(() => setTutorialOpen(true), 0);
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
        <SettingsOverlayHost />
        <TutorialModal
          open={tutorialOpen}
          onClose={() => {
            try {
              localStorage.setItem('tutorial_shown_global', 'true');
            } catch {}
            setTutorialOpen(false);
          }}
        />
        <GuidedTour
          open={guidedTourOpen}
          onClose={() => {
            setGuidedTourOpen(false);
            try {
              localStorage.setItem('guided_tour_shown', 'true');
            } catch {}
            if (isFirstVisit.current) {
              isFirstVisit.current = false;
              try {
                localStorage.setItem('tutorial_shown_global', 'true');
              } catch {}
            }
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
