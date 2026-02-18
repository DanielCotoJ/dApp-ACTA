'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/sidebar/Sidebar';
import { HeaderHome } from '@/layouts/header/Header';
import { SettingsOverlayHost } from '@/components/modules/settings/ui/SettingsOverlayHost';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TutorialModal from '@/components/modules/tutorial/ui/TutorialModal';
import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import MobileBottomNav from '@/components/ui/mobile-bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { AIAssistant } from '@/components/modules/ai-assistant/ui/AIAssistant';

export default function DashboardLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useWalletContext();
  useNetwork();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [tutorialClosed, setTutorialClosed] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    try {
      const key = 'tutorial_shown_global';
      const seen = localStorage.getItem(key) === 'true';
      setTimeout(() => setTutorialOpen(!seen), 0);
    } catch {}
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setAiOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = () => setAiOpen(true);
    window.addEventListener('open-ai-assistant', handler);
    return () => window.removeEventListener('open-ai-assistant', handler);
  }, []);

  const handleAiNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

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
      {aiOpen && <AIAssistant onNavigate={handleAiNavigate} onClose={() => setAiOpen(false)} />}
    </SidebarProvider>
  );
}
