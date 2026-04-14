'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  KeyRound,
  FilePlus,
  ShieldCheck,
  Lock,
  Bell,
  Compass,
  Settings,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useWalletContext } from '@/providers/wallet.provider';
import { useWalletKit } from '@/components/modules/auth/hooks/useWalletKit';

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavLinkItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutGrid className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: <KeyRound className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Issue',
    href: '/dashboard/issue',
    icon: <FilePlus className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Authorize',
    href: '/dashboard/authorize',
    icon: <ShieldCheck className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Vault',
    href: '/dashboard/credentials',
    icon: <Lock className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Notifications',
    href: '/dashboard/notifications',
    icon: <Bell className="h-5 w-5 shrink-0" />,
  },
];

function NavLink({ item, isActive }: { item: NavLinkItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
        isActive
          ? 'bg-neutral-100 text-neutral-900'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
      )}
    >
      <span className={cn('shrink-0', isActive ? 'text-neutral-900' : 'text-neutral-400')}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

function NavButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
        'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-left'
      )}
    >
      <span className="shrink-0 text-neutral-400">{icon}</span>
      {label}
    </button>
  );
}

function SidebarWalletCard() {
  const { walletAddress, walletName } = useWalletContext();
  const { connectWithWalletKit, disconnectWalletKit } = useWalletKit();
  const [connecting, setConnecting] = useState(false);

  const shortAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const handleConnect = useCallback(async () => {
    try {
      setConnecting(true);
      await connectWithWalletKit();
    } catch {
      /* modal / kit handles errors */
    } finally {
      setConnecting(false);
    }
  }, [connectWithWalletKit]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectWalletKit();
    } catch {
      /* ignore */
    }
  }, [disconnectWalletKit]);

  if (walletAddress) {
    return (
      <div className="mx-4 mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4">
        <p className="text-xs font-medium text-neutral-500">Wallet</p>
        <p className="mt-1 truncate text-sm font-semibold text-white">
          {walletName ?? 'Connected'}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-neutral-400">
          {shortAddr(walletAddress)}
        </p>
        <button
          type="button"
          onClick={handleDisconnect}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-neutral-700 bg-transparent px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-800"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-neutral-200 p-4">
      <p className="text-sm font-semibold text-neutral-900">Connect your Stellar wallet</p>
      <p className="text-sm font-semibold text-neutral-900">to use ACTA.</p>
      <button
        type="button"
        disabled={connecting}
        onClick={handleConnect}
        className="mt-4 flex w-full items-center justify-between rounded-full bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        <span>{connecting ? 'Connecting…' : 'Connect wallet'}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const matchActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 md:flex',
        className
      )}
    >
      <div className="flex items-center px-6 py-6">
        <Link
          href="/dashboard"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          aria-label="ACTA home"
        >
          <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md" priority />
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={matchActive(item.href)} />
        ))}
        <div className="mt-2 border-t border-neutral-800/80 pt-2">
          <NavButton
            label="Guided tour"
            icon={<Compass className="h-5 w-5 shrink-0" />}
            onClick={() => window.dispatchEvent(new CustomEvent('open-guided-tour'))}
          />
          <NavButton
            label="Settings"
            icon={<Settings className="h-5 w-5 shrink-0" />}
            onClick={() => {
              try {
                window.dispatchEvent(new CustomEvent('open-settings'));
              } catch {
                /* overlay host handles settings */
              }
            }}
          />
        </div>
      </nav>

      <SidebarWalletCard />
    </aside>
  );
}
