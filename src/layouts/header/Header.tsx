'use client';
import { NetworkToggle } from '@/components/ui/network-toggle';
import { useNetwork } from '@/providers/network.provider';
import { useState } from 'react';
import { NetworkSwitchModal } from '@/components/ui/network-switch-modal';
import { Sparkles } from 'lucide-react';
import { NotificationBell } from '@/components/modules/notifications/ui/NotificationBell';

export function HeaderHome() {
  const { network, setNetwork } = useNetwork();
  const [openConfirm, setOpenConfirm] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 ">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-3" />

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#edeed1]/10 hover:bg-[#edeed1]/20 border border-[#edeed1]/20 text-zinc-400 hover:text-[#edeed1] transition-colors text-sm"
          >
            <Sparkles className="w-4 h-4 text-[#edeed1]" />
            <span className="hidden sm:inline">Ask AI</span>
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] bg-zinc-700/50 rounded border border-zinc-600/50 text-zinc-400">
              Ctrl+K
            </kbd>
          </button>
          <NetworkToggle
            checked={network === 'testnet'}
            onCheckedChange={(checked) => (checked ? setNetwork('testnet') : setOpenConfirm(true))}
          />
        </div>
      </div>
      <NetworkSwitchModal
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={() => setNetwork('mainnet')}
      />
    </header>
  );
}
