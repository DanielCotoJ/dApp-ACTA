'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Copy, Check, Loader2 } from 'lucide-react';
import { useVaultAuthorizedList } from '@/components/modules/vault/hooks/use-vault-authorized-list';
import { toast } from 'sonner';

function shortAddr(addr: string) {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export function AuthorizedIssuersList() {
  const { issuers, revoke, loading, revoking } = useVaultAuthorizedList();
  const [copied, setCopied] = useState<string | null>(null);

  const onRevoke = async (addr: string) => {
    try {
      await revoke(addr);
      toast.success('Revoked');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error revoking';
      toast.error(msg);
    }
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied((v) => (v === text ? null : v)), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
            <Users className="h-5 w-5 text-[#edeed1]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Authorized wallets</h3>
            <p className="text-sm text-zinc-400">
              Derived from issued credentials. A wallet may not appear until it issues.
            </p>
          </div>
        </div>
        <span className="inline-flex self-start items-center gap-2 rounded-full border border-[#edeed1]/30 bg-[#edeed1]/5 px-3 py-1.5 text-xs font-medium text-[#edeed1]">
          {issuers.length} {issuers.length === 1 ? 'wallet' : 'wallets'}
        </span>
      </header>

      {issuers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#edeed1]/20 bg-zinc-950/40 p-10 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#edeed1]/10">
            <Users className="h-5 w-5 text-[#edeed1]" />
          </div>
          <p className="text-sm font-medium text-white">No authorized wallets yet</p>
          <p className="mt-1 max-w-sm text-xs text-zinc-400">
            Once a wallet is authorized and issues a credential, it will appear in this list.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-zinc-800 md:block">
            <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 bg-zinc-950/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              <div className="col-span-6">Address</div>
              <div className="col-span-5">DID</div>
              <div className="col-span-1 text-right">Action</div>
            </div>
            <div className="divide-y divide-zinc-800">
              {issuers.map((it) => {
                const isRevoking = revoking === it.address;
                const wasCopied = copied === it.address;
                return (
                  <div
                    key={it.address}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-800/30"
                  >
                    <div className="col-span-6 flex items-center gap-2 min-w-0">
                      <code className="truncate font-mono text-sm text-white">{it.address}</code>
                      <button
                        type="button"
                        onClick={() => onCopy(it.address)}
                        className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        aria-label="Copy address"
                      >
                        {wasCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="col-span-5 truncate font-mono text-xs text-zinc-400">
                      {it.issuerDid || '—'}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => onRevoke(it.address)}
                        disabled={loading || isRevoking}
                        className="h-9 rounded-lg bg-red-500/10 px-3 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                        aria-label="Revoke"
                      >
                        {isRevoking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {issuers.map((it) => {
              const isRevoking = revoking === it.address;
              const wasCopied = copied === it.address;
              return (
                <div
                  key={it.address}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      Address
                    </p>
                    <button
                      type="button"
                      onClick={() => onCopy(it.address)}
                      className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                      aria-label="Copy address"
                    >
                      {wasCopied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <code className="block break-all font-mono text-sm text-white">
                    {shortAddr(it.address)}
                  </code>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                    DID
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-zinc-400">
                    {it.issuerDid || '—'}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => onRevoke(it.address)}
                    disabled={loading || isRevoking}
                    className="mt-3 h-9 w-full rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    aria-label="Revoke"
                  >
                    {isRevoking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Revoking…
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Revoke
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
