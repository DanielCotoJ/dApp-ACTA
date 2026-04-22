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
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { ActaLoaderInline } from '@/components/ui/acta-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePublicApiKey } from '@/components/modules/api-keys/hooks/usePublicApiKey';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import {
  getApiKeyRegistry,
  keyMatchesPreview,
  type ApiKeyRegistryEntry,
} from '@/lib/apiKeyRegistry';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function maskKey(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 6)}${'·'.repeat(Math.min(18, Math.max(4, key.length - 10)))}${key.slice(-4)}`;
}

type RowModel =
  | { kind: 'registry'; entry: ApiKeyRegistryEntry }
  | { kind: 'orphan'; label: string };

function rowKey(r: RowModel): string {
  return r.kind === 'registry' ? r.entry.record.id : 'orphan-local';
}

function resolveFullSecret(
  row: RowModel,
  sessionKey: string | undefined,
  sessionRecordId: string | undefined,
  storedKey: string,
): string | null {
  if (row.kind === 'orphan') return storedKey.trim() || null;
  if (sessionRecordId === row.entry.record.id && sessionKey) return sessionKey;
  const s = storedKey.trim();
  if (s && keyMatchesPreview(s, row.entry.keyPreview)) return s;
  return null;
}

export default function ApiKeys() {
  const { walletAddress } = useWalletContext();
  const { network } = useNetwork();
  const { apiKey } = useActaApiKey();
  const { loading, error, data, requestStandardKey } = usePublicApiKey();

  const [name, setName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const registryForWallet = useMemo(() => {
    if (!walletAddress) return [];
    return getApiKeyRegistry(network)
      .filter((e) => e.wallet_address === walletAddress)
      .sort(
        (a, b) =>
          new Date(b.record.created_at).getTime() - new Date(a.record.created_at).getTime(),
      );
  }, [network, walletAddress, data?.api_key_record?.id]);

  const rows: RowModel[] = useMemo(() => {
    const list: RowModel[] = registryForWallet.map((entry) => ({ kind: 'registry', entry }));
    const stored = apiKey.trim();
    if (
      walletAddress &&
      stored &&
      !registryForWallet.some((e) => keyMatchesPreview(stored, e.keyPreview))
    ) {
      list.push({
        kind: 'orphan',
        label: 'Key stored in this browser',
      });
    }
    return list;
  }, [registryForWallet, apiKey, walletAddress]);

  const hasBlockingKey =
    Boolean(apiKey.trim()) ||
    registryForWallet.length > 0 ||
    Boolean(data?.api_key);

  const disabled = loading || hasBlockingKey || !walletAddress;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const toggleReveal = (id: string) => {
    setReveal((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sessionKey = data?.api_key;
  const sessionRecordId = data?.api_key_record?.id;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/6 px-5 py-4 sm:px-6">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
            <ShieldAlert className="h-4 w-4 text-amber-200" />
          </div>
          <div className="min-w-0 text-sm leading-relaxed text-amber-100/85">
            <p className="font-medium text-amber-50">Before you create a key</p>
            <p className="mt-1 text-xs text-amber-100/70">
              One standard key per wallet. The secret is shown only once at creation — copy it
              immediately. Treat it like a password; it only grants access to resources for this
              wallet.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#edeed1]/15 bg-zinc-900/40 backdrop-blur-sm">
        <div className="flex flex-col gap-1 border-b border-zinc-800/80 px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-semibold tracking-tight text-white">Your API keys</h2>
          <p className="text-sm text-zinc-500">
            Keys created here are listed for this wallet and network. Secrets are never sent back
            from the server — only this browser can show a full key if it is still stored.
          </p>
        </div>

        {!walletAddress ? (
          <div className="flex items-center gap-3 px-5 py-10 sm:px-6">
            <CircleAlert className="h-5 w-5 shrink-0 text-zinc-500" />
            <p className="text-sm text-zinc-400">Connect your wallet to view and create API keys.</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/60">
              <KeyRound className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-300">No keys yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
              Generate a key below. After creation, it will appear in this list for reference
              (metadata only — the secret stays in your browser until you remove it).
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/80">
            {rows.map((row) => {
              const id = rowKey(row);
              const full = resolveFullSecret(row, sessionKey, sessionRecordId, apiKey);
              const isRevealed = reveal[id] ?? false;
              const displaySecret =
                row.kind === 'registry'
                  ? isRevealed && full
                    ? full
                    : `${row.entry.keyPreview.prefix}········${row.entry.keyPreview.suffix}`
                  : isRevealed && full
                    ? full
                    : maskKey(full || apiKey || '········');

              const record = row.kind === 'registry' ? row.entry.record : null;
              const isActive =
                !!full ||
                (row.kind === 'registry' &&
                  apiKey.trim() &&
                  keyMatchesPreview(apiKey.trim(), row.entry.keyPreview));

              return (
                <li key={id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {record?.name?.trim()
                            ? record.name
                            : row.kind === 'registry'
                              ? 'Standard key'
                              : row.label}
                        </span>
                        {isActive && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90">
                            In use
                          </span>
                        )}
                        {record && !record.is_active && (
                          <span className="rounded-full bg-zinc-700/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        {record && (
                          <>
                            <span>
                              <span className="text-zinc-600">Created</span>{' '}
                              {formatDate(record.created_at)}
                            </span>
                            <span>
                              <span className="text-zinc-600">Expires</span>{' '}
                              {formatDate(record.expires_at)}
                            </span>
                            <span className="font-mono text-[11px] text-zinc-500" title={record.id}>
                              ID {record.id.slice(0, 8)}…
                            </span>
                          </>
                        )}
                        {row.kind === 'orphan' && (
                          <span className="text-zinc-600">
                            Paste or import — metadata from creation is not available in this
                            browser.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px]">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                            Secret
                          </span>
                          {full ? (
                            <button
                              type="button"
                              onClick={() => toggleReveal(id)}
                              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-zinc-300"
                              aria-label={isRevealed ? 'Hide secret' : 'Reveal secret'}
                            >
                              {isRevealed ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                              {isRevealed ? 'Hide' : 'Reveal'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-600">Not stored here</span>
                          )}
                        </div>
                        <p className="break-all font-mono text-xs leading-relaxed text-zinc-200">
                          {displaySecret}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!full}
                        onClick={() => full && copyToClipboard(full, id)}
                        className="h-9 rounded-lg border-zinc-700 bg-zinc-900/40 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-45"
                      >
                        {copiedId === id ? (
                          <>
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                            Copy secret
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <section className="rounded-2xl border border-[#edeed1]/15 bg-zinc-900/40 p-5 backdrop-blur-sm sm:p-6">
          <header className="mb-5 flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
              <Sparkles className="h-5 w-5 text-[#edeed1]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create API key</h2>
              <p className="text-sm text-zinc-500">
                Scoped to your wallet on{' '}
                <span className="font-medium text-zinc-300">
                  {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
                </span>
                .
              </p>
            </div>
          </header>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="api-key-name"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500"
              >
                Name <span className="font-normal text-zinc-600">(optional)</span>
              </label>
              <Input
                id="api-key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production integration"
                className="border-zinc-800 bg-zinc-950/60 text-white placeholder:text-zinc-600"
                maxLength={64}
              />
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/35 px-4 py-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                Wallet
              </p>
              {walletAddress ? (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edeed1]/10">
                    <WalletIcon className="h-3.5 w-3.5 text-[#edeed1]" />
                  </div>
                  <code className="min-w-0 flex-1 break-all font-mono text-xs text-zinc-300">
                    {walletAddress}
                  </code>
                </div>
              ) : (
                <p className="flex items-center gap-2 text-sm text-zinc-500">
                  <CircleAlert className="h-4 w-4 shrink-0 text-amber-500/80" />
                  Connect wallet to continue
                </p>
              )}
            </div>

            {error && (
              <div className="flex gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <div>
                  <p className="text-sm font-medium text-red-200">Could not create key</p>
                  <p className="mt-0.5 wrap-break-word text-xs text-red-200/75">{error}</p>
                </div>
              </div>
            )}

            {data?.api_key && (
              <div className="flex gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-sm text-emerald-100/90">
                  Key created — copy it from the list above. It will not be shown again on another
                  device.
                </p>
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
                  <ActaLoaderInline className="mr-2" />
                  Creating…
                </>
              ) : hasBlockingKey ? (
                'Key already available'
              ) : !walletAddress ? (
                'Connect wallet to continue'
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Create API key
                </>
              )}
            </Button>
          </div>
        </section>

        <aside className="rounded-2xl border border-zinc-800/80 bg-zinc-950/30 p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Usage</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Send the key in the{' '}
            <code className="rounded bg-zinc-800/80 px-1 py-0.5 font-mono text-[11px] text-zinc-300">
              X-ACTA-Key
            </code>{' '}
            header on API requests. The app stores your key locally per network so flows like Issue
            and Vault can use it automatically.
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            Network:{' '}
            <span className="text-zinc-400">{network === 'mainnet' ? 'Mainnet' : 'Testnet'}</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
