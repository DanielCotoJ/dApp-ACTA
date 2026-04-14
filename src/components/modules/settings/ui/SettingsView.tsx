'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Globe,
  Bell,
  ShieldCheck,
  Info,
  Copy,
  Check,
  LogOut,
  Wallet as WalletIcon,
  ArrowUpRight,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNetwork } from '@/providers/network.provider';
import { useWalletContext } from '@/providers/wallet.provider';
import { useWalletKit } from '@/components/modules/auth/hooks/useWalletKit';

const APP_NAME = 'ACTA dApp';
const APP_VERSION = '1.0.0';

type SectionId = 'account' | 'network' | 'notifications' | 'security' | 'about';

const SECTIONS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'account', label: 'Account', icon: UserIcon },
  { id: 'network', label: 'Network', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'about', label: 'About', icon: Info },
];

function readBool(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  return v === 'true';
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function SettingsView() {
  const { network, setNetwork } = useNetwork();
  const { walletAddress, walletName } = useWalletContext();
  const { connectWithWalletKit, disconnectWalletKit } = useWalletKit();

  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const [notifInApp, setNotifInApp] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(false);
  const [notifSound, setNotifSound] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>('account');

  useEffect(() => {
    setNotifInApp(readBool('notif_in_app', true));
    setNotifBrowser(readBool('notif_browser', false));
    setNotifSound(readBool('notif_sound', true));
  }, []);

  const persistBool = (key: string, value: boolean) => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* ignore */
    }
  };

  const handleConnect = useCallback(async () => {
    try {
      setConnecting(true);
      await connectWithWalletKit();
    } catch {
      /* kit handles errors */
    } finally {
      setConnecting(false);
    }
  }, [connectWithWalletKit]);

  const handleDisconnect = useCallback(async () => {
    try {
      setDisconnecting(true);
      await disconnectWalletKit();
      toast.success('Wallet disconnected');
    } catch {
      toast.error('Failed to disconnect wallet');
    } finally {
      setDisconnecting(false);
    }
  }, [disconnectWalletKit]);

  const copyAddress = useCallback(async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy address');
    }
  }, [walletAddress]);

  const handleBrowserNotif = async (checked: boolean) => {
    if (!checked) {
      setNotifBrowser(false);
      persistBool('notif_browser', false);
      return;
    }
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Browser notifications are not supported');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifBrowser(true);
        persistBool('notif_browser', true);
        toast.success('Browser notifications enabled');
      } else {
        setNotifBrowser(false);
        persistBool('notif_browser', false);
        toast.error('Permission denied');
      }
    } catch {
      toast.error('Could not request permission');
    }
  };

  const explorerUrl = useMemo(() => {
    if (!walletAddress) return null;
    const host = network === 'mainnet' ? 'stellar.expert/explorer/public' : 'stellar.expert/explorer/testnet';
    return `https://${host}/account/${walletAddress}`;
  }, [walletAddress, network]);

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    if (typeof window === 'undefined') return;
    const el = document.getElementById(`settings-section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <div className="border-b border-[#edeed1]/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-sm sm:text-base text-white/50 mt-1">
              Manage your account, network, appearance, and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollTo(id)}
                    className={cn(
                      'flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[#edeed1]/10 text-white border border-[#edeed1]/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6">
            <SectionCard
              id="account"
              title="Account"
              description="Your connected Stellar wallet"
              icon={UserIcon}
            >
              {walletAddress ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 rounded-xl border border-[#edeed1]/20 bg-zinc-900/60 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
                      <WalletIcon className="h-6 w-6 text-[#edeed1]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        {walletName ?? 'Connected wallet'}
                      </p>
                      <p className="mt-1 break-all font-mono text-sm text-white sm:hidden">
                        {shortAddr(walletAddress)}
                      </p>
                      <p className="mt-1 hidden break-all font-mono text-sm text-white sm:block">
                        {walletAddress}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyAddress}
                        className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                      </Button>
                      {explorerUrl && (
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="hidden sm:inline">Explorer</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={disconnecting}
                    onClick={handleDisconnect}
                    className="w-full justify-center rounded-xl border-red-900/50 bg-red-950/20 py-5 text-red-300 hover:bg-red-950/40 hover:text-red-200 sm:w-auto"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {disconnecting ? 'Disconnecting…' : 'Disconnect wallet'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#edeed1]/20 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">No wallet connected</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Connect your Stellar wallet to issue and manage credentials.
                    </p>
                  </div>
                  <Button
                    type="button"
                    disabled={connecting}
                    onClick={handleConnect}
                    className="w-full rounded-xl bg-white py-5 text-black hover:bg-zinc-100 sm:w-auto"
                  >
                    <WalletIcon className="mr-2 h-4 w-4" />
                    {connecting ? 'Connecting…' : 'Connect wallet'}
                  </Button>
                </div>
              )}
            </SectionCard>

            <SectionCard
              id="network"
              title="Network"
              description="Choose which Stellar network you want to operate on"
              icon={Globe}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NetworkOption
                  label="Testnet"
                  description="For development and testing"
                  active={network === 'testnet'}
                  onClick={() => setNetwork('testnet')}
                />
                <NetworkOption
                  label="Mainnet"
                  description="Production network with real assets"
                  active={network === 'mainnet'}
                  onClick={() => setNetwork('mainnet')}
                />
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Current network:{' '}
                <span className="font-medium text-zinc-300">
                  {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                </span>
              </p>
            </SectionCard>

            <SectionCard
              id="notifications"
              title="Notifications"
              description="Control how and when you get notified"
              icon={Bell}
            >
              <div className="divide-y divide-[#edeed1]/10">
                <ToggleRow
                  label="In-app notifications"
                  description="Show alerts inside the dashboard"
                  checked={notifInApp}
                  onChange={(v) => {
                    setNotifInApp(v);
                    persistBool('notif_in_app', v);
                  }}
                />
                <ToggleRow
                  label="Browser notifications"
                  description="Get desktop alerts even when ACTA is in the background"
                  checked={notifBrowser}
                  onChange={handleBrowserNotif}
                />
                <ToggleRow
                  label="Sound"
                  description="Play a sound when new notifications arrive"
                  checked={notifSound}
                  onChange={(v) => {
                    setNotifSound(v);
                    persistBool('notif_sound', v);
                  }}
                />
              </div>
            </SectionCard>

            <SectionCard
              id="security"
              title="Security"
              description="API keys and wallet session"
              icon={ShieldCheck}
            >
              <div className="space-y-3">
                <Link
                  href="/dashboard/api-keys"
                  className="flex items-center justify-between rounded-xl border border-[#edeed1]/20 bg-zinc-900/60 p-4 transition-colors hover:border-[#edeed1]/40 hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edeed1]/10">
                      <KeyRound className="h-5 w-5 text-[#edeed1]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Manage API keys</p>
                      <p className="text-xs text-zinc-400">Request and review your public API key</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                </Link>
                {walletAddress && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disconnecting}
                    onClick={handleDisconnect}
                    className="w-full justify-start rounded-xl border-zinc-800 bg-zinc-900/60 px-4 py-5 text-left text-zinc-200 hover:bg-zinc-800"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">Sign out of wallet</span>
                      <span className="text-xs text-zinc-400">
                        End the current wallet session on this device
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="about"
              title="About"
              description="Application information"
              icon={Info}
            >
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow label="Application" value={APP_NAME} />
                <InfoRow label="Version" value={APP_VERSION} />
                <InfoRow label="Network" value={network === 'mainnet' ? 'Mainnet' : 'Testnet'} />
              </dl>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  children,
}: {
  id: SectionId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`settings-section-${id}`}
      className="scroll-mt-24 rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6"
    >
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
          <Icon className="h-5 w-5 text-[#edeed1]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function NetworkOption({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-all',
        active
          ? 'border-[#edeed1]/60 bg-[#edeed1]/10'
          : 'border-[#edeed1]/15 bg-zinc-900/60 hover:border-[#edeed1]/30 hover:bg-zinc-900'
      )}
    >
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
      </div>
      <span
        className={cn(
          'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
          active ? 'border-[#edeed1] bg-[#edeed1]' : 'border-zinc-600'
        )}
      >
        {active && <span className="h-2 w-2 rounded-full bg-zinc-900" />}
      </span>
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#edeed1]/60',
          checked ? 'bg-[#edeed1]' : 'bg-zinc-700'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-zinc-900 shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#edeed1]/15 bg-zinc-900/60 p-4">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
    </div>
  );
}
