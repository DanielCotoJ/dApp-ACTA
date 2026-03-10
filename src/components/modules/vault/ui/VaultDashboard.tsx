'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, Search, Key, Lock, X, Share2, Trash2, Eye, Loader2, Copy } from 'lucide-react';
import { useVaultDashboard } from '@/components/modules/vault/hooks/useVaultDashboard';
import { useVaultCards } from '@/components/modules/vault/hooks/useVaultCards';
import ShareCredentialModal from '@/components/modules/credentials/ui/ShareCredentialModal';
import { Skeleton } from '@/components/ui/skeleton';
import { CredentialCard } from '@/components/modules/credentials/ui/SavedCredentialsCard';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Credential } from '@/@types/credentials';
import { useVault } from '@/components/modules/vault/hooks/use-vault';
import { useWalletContext } from '@/providers/wallet.provider';
import { AnimatePresence, motion } from 'motion/react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import Image from 'next/image';
import { useNetwork } from '@/providers/network.provider';
import { toast } from 'sonner';

interface ActiveCredentialView {
  credential: Credential;
  gridCredential: {
    id: string;
    name: string;
    category: string;
    status?: string;
    wallet: string;
    url?: string;
  };
}

export default function VaultPage() {
  const { walletAddress } = useWalletContext();
  const {
    vaultExists,
    onCreateVault,
    dashboardStatus,
    query,
    setQuery,
    shareOpen,
    toShare,
    openShare,
    closeShare,
    onRevoke,
  } = useVaultDashboard();
  const { actaById, getWalletFromDid, filteredCredentials, copyToClipboard } = useVaultCards();
  const [isCreating, setIsCreating] = useState(false);
  const [active, setActive] = useState<ActiveCredentialView | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);
  const motionId = useId();
  const { network } = useNetwork();
  const [sponsorOwnerAddress, setSponsorOwnerAddress] = useState('');
  const [sponsorOwnerDid, setSponsorOwnerDid] = useState('');
  const [sponsoring, setSponsoring] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { loading: creatingVault, createSponsoredVault } = useVault();
  const showCreatingLoader = isCreating || creatingVault;

  const closeExpanded = useCallback(() => {
    setActive(null);
    setShowRawJson(false);
  }, []);

  const handleSponsorOwnerChange = useCallback(
    (value: string) => {
      setSponsorOwnerAddress(value);
      if (value) {
        const networkId = network === 'mainnet' ? 'mainnet' : 'testnet';
        setSponsorOwnerDid(`did:pkh:stellar:${networkId}:${value}`);
      } else {
        setSponsorOwnerDid('');
      }
    },
    [network]
  );

  const handleCreateSponsoredVault = useCallback(async () => {
    if (!sponsorOwnerAddress || !sponsorOwnerDid) {
      toast.error('Owner wallet and DID are required');
      return;
    }
    setSponsoring(true);
    try {
      const { txId } = await createSponsoredVault({
        owner: sponsorOwnerAddress,
        didUri: sponsorOwnerDid,
      });
      toast.success('Sponsored vault created');
      setSponsorOwnerAddress('');
      setSponsorOwnerDid('');
      toast.message('Sponsored vault tx', {
        description: txId,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setSponsoring(false);
    }
  }, [createSponsoredVault, sponsorOwnerAddress, sponsorOwnerDid]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeExpanded();
    }

    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, closeExpanded]);

  useOutsideClick(expandedRef, closeExpanded);

  const handleCreateVault = async () => {
    setIsCreating(true);
    try {
      await onCreateVault();
    } finally {
      setIsCreating(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#edeed1] border-r-transparent mb-4" />
          <p className="text-white/70">Checking vault...</p>
          <p className="text-sm text-white/50 mt-1">Detecting if your wallet has a vault</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white/70">
          <p className="text-lg">Connect your wallet to view your vault</p>
        </div>
      </div>
    );
  }

  if (vaultExists === false) {
    if (showCreatingLoader) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#edeed1] border-r-transparent mb-4" />
            <p className="text-white/70">Creating vault...</p>
            <p className="text-sm text-white/50 mt-1">Please sign the transaction in your wallet</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen">
        <div className="p-8">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-5xl font-bold tracking-tight text-white">Vault</h1>
            </div>
            <p className="text-white/50 text-lg">
              Create your vault to store and view your credentials
            </p>
          </div>

          <div className="flex items-center justify-center">
            <Button
              onClick={handleCreateVault}
              disabled={false}
              className="w-full md:w-1/2 h-12 bg-white hover:bg-white/90 text-black font-semibold shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Vault
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (vaultExists !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#edeed1] border-r-transparent mb-4" />
          <p className="text-white/70">Checking vault...</p>
          <p className="text-sm text-white/50 mt-1">Detecting if your wallet has a vault</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div>
        <div className="border-b border-white/10 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">Vault</h1>
                  <p className="text-base text-white/50 mt-1">Manage your credentials securely</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search credentials..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card border-[#edeed1]/30">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#edeed1]/10">
                <Key className="w-5 h-5 text-[#edeed1]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total credentials</p>
                <p className="text-2xl font-bold text-white">{actaById.size}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card border-[#edeed1]/30">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#edeed1]/10">
                <Shield className="w-5 h-5 text-[#edeed1]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security</p>
                <p className="text-2xl font-bold text-white">High</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card border-[#edeed1]/30">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[#edeed1]/10">
                <Lock className="w-5 h-5 text-[#edeed1]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Encryption</p>
                <p className="text-2xl font-bold text-white">AES-256</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-xl font-semibold mb-4">Saved credentials</h2>
          {dashboardStatus === 'pending' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <Card key={i} className="p-4 bg-card border-border">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredCredentials.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {query
                  ? 'No credentials found'
                  : 'No saved credentials. Add your first credential.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCredentials.map((credential) => (
                <CredentialCard
                  key={credential.id}
                  layoutId={`${credential.id}-${motionId}`}
                  name={credential.name}
                  category={credential.category}
                  status={credential.status}
                  wallet={getWalletFromDid(credential.username)}
                  url={credential.url || undefined}
                  onCopy={(text, label) => copyToClipboard(text, label)}
                  onClick={() => {
                    const ac = actaById.get(credential.id);
                    if (ac) {
                      setActive({
                        credential: ac,
                        gridCredential: {
                          id: credential.id,
                          name: credential.name,
                          category: credential.category,
                          status: credential.status,
                          wallet: getWalletFromDid(credential.username),
                          url: credential.url || undefined,
                        },
                      });
                    }
                  }}
                  onView={() => {
                    const ac = actaById.get(credential.id);
                    if (ac) {
                      setActive({
                        credential: ac,
                        gridCredential: {
                          id: credential.id,
                          name: credential.name,
                          category: credential.category,
                          status: credential.status,
                          wallet: getWalletFromDid(credential.username),
                          url: credential.url || undefined,
                        },
                      });
                    }
                  }}
                  onShare={() => {
                    const ac = actaById.get(credential.id);
                    if (ac) openShare(ac);
                  }}
                  onRevoke={() => onRevoke(credential.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 border-t border-white/10 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Sponsored vault</h2>
              <p className="text-sm text-white/50">
                Create vaults on behalf of other wallets when you are a sponsor.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 bg-card border-border space-y-4">
              <div>
                <p className="text-sm font-medium text-white/80">Your wallet (sponsor)</p>
                <p className="text-xs text-white/50 mb-2">
                  This wallet will sign sponsored vault transactions.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-black/40 rounded-lg p-4 border border-white/10">
                <code className="text-white font-mono text-xs flex-1 break-all">
                  {walletAddress}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-white/10"
                  onClick={() => copyToClipboard(walletAddress, 'wallet')}
                >
                  <Copy className="h-4 w-4 text-white/60" />
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border space-y-4">
              <div>
                <p className="text-sm font-medium text-white/80">Vault owner</p>
                <p className="text-xs text-white/50 mb-2">
                  Enter the wallet address to create a vault for.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-white/60">Owner wallet (G...)</p>
                  <Input
                    type="text"
                    placeholder="G..."
                    value={sponsorOwnerAddress}
                    onChange={(e) => handleSponsorOwnerChange(e.target.value)}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60">Owner DID</p>
                  <div className="flex items-center gap-3 bg-black/40 rounded-lg p-3 border border-white/10">
                    <code className="text-white font-mono text-xs flex-1 break-all">
                      {sponsorOwnerDid || 'will be derived from wallet'}
                    </code>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateSponsoredVault}
                disabled={sponsoring || !sponsorOwnerAddress}
                className="w-full h-10 bg-white hover:bg-white/90 text-black font-semibold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {sponsoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating sponsored vault...
                  </>
                ) : (
                  'Create sponsored vault'
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {shareOpen && (
        <ShareCredentialModal open={shareOpen} credential={toShare} onClose={closeShare} />
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-50 p-4">
            <motion.div
              layoutId={`card-${active.gridCredential.id}-${motionId}`}
              ref={expandedRef}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.4),0_16px_64px_rgba(0,0,0,0.3)] overflow-hidden"
            >
              <div className="relative flex flex-col px-6 pt-4 pb-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      layoutId={`logo-${active.gridCredential.id}-${motionId}`}
                      className="shrink-0 h-16 [filter:drop-shadow(0_0_12px_rgba(237,238,209,0.30))]"
                    >
                      {(() => {
                        const c = String(active.gridCredential.category || '').toLowerCase();
                        const logoSrc = c.includes('escrow')
                          ? '/tw-x-acta.png'
                          : c.includes('contributions')
                            ? '/gf-x-acta.png'
                            : '/acta.png';
                        const translateClass =
                          logoSrc === '/acta.png' ? '-translate-x-2' : '-translate-x-1';
                        return (
                          <Image
                            src={logoSrc}
                            alt="Logo"
                            width={360}
                            height={108}
                            className={`h-16 w-auto object-contain object-left transform ${translateClass}`}
                          />
                        );
                      })()}
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.div
                      layoutId={`badge-${active.gridCredential.id}-${motionId}`}
                      className="relative inline-flex items-center px-3 py-1 rounded-full bg-[#edeed1]/10 backdrop-blur-sm border border-[#edeed1]/30 text-xs font-medium whitespace-nowrap text-white overflow-hidden"
                    >
                      <span className="relative z-10">{active.gridCredential.category}</span>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.05 } }}
                      onClick={closeExpanded}
                      className="p-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Credential Name</p>
                  <motion.p
                    layoutId={`name-${active.gridCredential.id}-${motionId}`}
                    className="text-base font-semibold"
                  >
                    {active.gridCredential.name}
                  </motion.p>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Wallet Address</p>
                  <motion.p
                    layoutId={`wallet-${active.gridCredential.id}-${motionId}`}
                    className="font-mono text-xs font-medium break-all leading-relaxed"
                  >
                    {active.gridCredential.wallet}
                  </motion.p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRawJson((v) => !v)}
                    className={`rounded-xl border text-xs px-4 ${showRawJson ? 'bg-zinc-700/50 border-zinc-600 text-white' : 'bg-zinc-900/40 border-zinc-700/40 hover:bg-zinc-800/40 text-white'}`}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    {showRawJson ? 'Hide JSON' : 'View JSON'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const ac = actaById.get(active.gridCredential.id);
                      if (ac) openShare(ac);
                      closeExpanded();
                    }}
                    className="rounded-xl bg-[#edeed1]/10 border border-[#edeed1]/30 hover:bg-[#edeed1]/20 text-white text-xs px-4"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onRevoke(active.gridCredential.id);
                      closeExpanded();
                    }}
                    className="rounded-xl bg-red-900/20 border border-red-700/40 hover:bg-red-800/30 text-red-400 text-xs px-4"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Revoke
                  </Button>
                </div>
              </div>

              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-auto border-t border-zinc-800 px-4 py-4"
              >
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3">
                  Credential Fields
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'issuer', label: 'Issuer' },
                    { key: 'subject', label: 'Holder DID' },
                    { key: 'type', label: 'Credential Type' },
                    { key: 'issuedAt', label: 'Issued At' },
                    { key: 'expirationDate', label: 'Expiration Date' },
                    { key: 'status', label: 'Status' },
                    { key: 'birthDate', label: 'Birth Date' },
                  ]
                    .filter((f) => {
                      const val = (active.credential as unknown as Record<string, unknown>)[f.key];
                      return val !== undefined && val !== null && String(val).trim() !== '';
                    })
                    .map((f) => {
                      const val = (active.credential as unknown as Record<string, unknown>)[f.key];
                      let display = String(val);
                      if (
                        f.key === 'issuedAt' ||
                        f.key === 'expirationDate' ||
                        f.key === 'birthDate'
                      ) {
                        try {
                          display = new Date(display).toLocaleDateString();
                        } catch {
                          /* keep raw */
                        }
                      }
                      return (
                        <div
                          key={f.key}
                          className="flex items-center justify-between gap-4 px-4 py-3 bg-zinc-800/50 border border-zinc-700/40 rounded-xl"
                        >
                          <span className="text-sm text-zinc-400 shrink-0">{f.label}</span>
                          <span className="text-sm text-white font-medium text-right break-all min-w-0">
                            {display}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRawJson && active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setShowRawJson(false)}
            />
            <div className="fixed inset-0 grid place-items-center z-[70] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-white font-semibold text-sm">Raw JSON</h3>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {active.credential.id}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRawJson(false)}
                    className="p-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <pre className="text-xs text-zinc-200 bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 overflow-auto [scrollbar-width:thin]">
                    {(() => {
                      const raw = (active.credential as unknown as { raw?: unknown }).raw;
                      const vaultRecord = (
                        active.credential as unknown as { vaultRecord?: unknown }
                      ).vaultRecord;
                      const payload = raw ?? vaultRecord ?? active.credential;
                      try {
                        return JSON.stringify(payload, null, 2);
                      } catch {
                        return String(payload);
                      }
                    })()}
                  </pre>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
