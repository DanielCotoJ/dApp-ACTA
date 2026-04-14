'use client';

import { useMemo, useState } from 'react';
import {
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  Wallet as WalletIcon,
  CircleCheck,
  CircleAlert,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePublicApiKey } from '@/components/modules/api-keys/hooks/usePublicApiKey';
import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function maskKey(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 6)}${'•'.repeat(20)}${key.slice(-4)}`;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ApiKeys() {
  const { walletAddress } = useWalletContext();
  const { network } = useNetwork();
  const { loading, error, data, requestStandardKey } = usePublicApiKey();

  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [reveal, setReveal] = useState(true);

  const expiresLabel = useMemo(() => {
    if (!data?.api_key_record?.expires_at) return '-';
    return formatDate(data.api_key_record.expires_at);
  }, [data]);

  const hasKey = Boolean(data?.api_key);
  const disabled = loading || hasKey || !walletAddress;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      {/* Security notice */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-amber-100">Security information</h2>
            <p className="mt-0.5 text-xs text-amber-200/80">
              Read this carefully before generating your API key.
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-xs text-amber-100/90 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>
                  <span className="font-semibold">One key per wallet</span> — once created, it cannot
                  be regenerated.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>
                  <span className="font-semibold">Shown only once</span> — copy and store it before
                  leaving this page.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>
                  <span className="font-semibold">Treat it like a password</span> — never share or
                  commit it to source control.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>
                  <span className="font-semibold">Scoped access</span> — it only unlocks resources
                  owned by your connected wallet.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* Request form */}
        <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
          <header className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
              <Sparkles className="h-5 w-5 text-[#edeed1]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create API key</h2>
              <p className="text-sm text-zinc-400">
                Generate a key scoped to your connected wallet on{' '}
                <span className="font-medium text-zinc-200">
                  {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                </span>
              </p>
            </div>
          </header>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="api-key-name"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400"
              >
                Name (optional)
              </label>
              <Input
                id="api-key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production integration"
                className="border-zinc-800 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                maxLength={64}
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                A friendly label to identify this key. This is the only field you can customise.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Requesting wallet
              </p>
              {walletAddress ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edeed1]/10">
                    <WalletIcon className="h-4 w-4 text-[#edeed1]" />
                  </div>
                  <code className="min-w-0 flex-1 break-all font-mono text-sm text-zinc-200">
                    {walletAddress}
                  </code>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <CircleAlert className="h-4 w-4 text-amber-400" />
                  Connect your wallet to continue.
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                <div>
                  <p className="text-sm font-semibold text-red-200">Request failed</p>
                  <p className="mt-0.5 break-words text-xs text-red-200/80">{error}</p>
                </div>
              </div>
            )}

            {hasKey && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-emerald-200">API key created</p>
                  <p className="mt-0.5 text-xs text-emerald-200/80">
                    Copy your key now — it will not be shown again.
                  </p>
                </div>
              </div>
            )}

            <Button
              type="button"
              disabled={disabled}
              className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) {
                  requestStandardKey({ name: name.trim() || undefined });
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating key…
                </>
              ) : hasKey ? (
                'Key already created'
              ) : !walletAddress ? (
                'Connect wallet to continue'
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Request API key
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Key preview */}
        <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
          <header className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
              <KeyRound className="h-5 w-5 text-[#edeed1]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-white">Your API key</h2>
              <p className="text-sm text-zinc-400">
                {hasKey ? 'Copy and save it now.' : 'It will appear here after creation.'}
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Key
                </span>
                {hasKey && (
                  <button
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-white"
                    aria-label={reveal ? 'Hide key' : 'Reveal key'}
                  >
                    {reveal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {reveal ? 'Hide' : 'Reveal'}
                  </button>
                )}
              </div>
              <div className="min-h-[72px] break-all font-mono text-sm text-zinc-100">
                {hasKey
                  ? reveal
                    ? data?.api_key
                    : maskKey(data!.api_key)
                  : <span className="text-zinc-600">No key generated yet</span>}
              </div>
              {hasKey && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  This is your only chance to copy the key.
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={!hasKey}
              onClick={() => data?.api_key && copyToClipboard(data.api_key)}
              className="w-full rounded-xl border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied to clipboard' : 'Copy key'}
            </Button>

            <dl className="grid grid-cols-1 gap-2">
              <MetaRow label="Role" value="standard" />
              <MetaRow
                label="Network"
                value={network === 'mainnet' ? 'Mainnet' : 'Testnet'}
              />
              <MetaRow label="Expires" value={expiresLabel} />
              <MetaRow
                label="Key ID"
                value={data?.api_key_record?.id ?? '—'}
                mono
              />
              {walletAddress && (
                <MetaRow label="Wallet" value={shortAddr(walletAddress)} mono />
              )}
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd
        className={`truncate text-right text-sm text-zinc-200 ${mono ? 'font-mono text-xs' : ''}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
