'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Search,
  Key,
  Lock,
  X,
  Share2,
  Trash2,
  Eye,
  Loader2,
  Copy,
  Plus,
  Wallet as WalletIcon,
  ShieldCheck,
  CircleAlert,
} from 'lucide-react';
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
    return <VaultStatusScreen title="Checking vault…" subtitle="Detecting if your wallet has a vault" />;
  }

  if (!walletAddress) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-[#edeed1]/20 bg-zinc-900/60 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#edeed1]/10">
            <WalletIcon className="h-6 w-6 text-[#edeed1]" />
          </div>
          <h2 className="text-xl font-semibold text-white">Wallet not connected</h2>
          <p className="mt-2 text-sm text-white/60">
            Connect your Stellar wallet to view and manage your credential vault.
          </p>
        </div>
      </div>
    );
  }

  if (vaultExists === false) {
    if (showCreatingLoader) {
      return (
        <VaultStatusScreen
          title="Creating vault…"
          subtitle="Please sign the transaction in your wallet"
        />
      );
    }
    return (
      <div className="min-h-[60vh]">
        <div className="border-b border-[#edeed1]/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Vault</h1>
            <p className="text-sm sm:text-base text-white/50 mt-1">
              Your personal on-chain storage for credentials
            </p>
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 sm:px-6 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edeed1]/10">
            <Shield className="h-8 w-8 text-[#edeed1]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Create your vault</h2>
            <p className="mt-2 text-sm text-white/60">
              A vault is where all credentials issued to your wallet will be stored securely on
              Stellar. You only need to create it once.
            </p>
          </div>

          <Button
            onClick={handleCreateVault}
            className="h-12 w-full max-w-sm rounded-xl bg-white font-semibold text-black shadow-lg shadow-white/10 transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create vault
          </Button>

          <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            <FeatureChip icon={Shield} label="On-chain security" />
            <FeatureChip icon={Lock} label="Wallet-bound access" />
            <FeatureChip icon={Key} label="One-time setup" />
          </div>
        </div>
      </div>
    );
  }

  if (vaultExists !== true) {
    return <VaultStatusScreen title="Checking vault…" subtitle="Detecting if your wallet has a vault" />;
  }

  return (
    <div className="min-h-screen">
      <div>
        <div className="border-b border-[#edeed1]/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Vault</h1>
                <p className="text-sm sm:text-base text-white/50 mt-1">
                  Manage the credentials stored in your on-chain vault
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vault active
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard icon={Key} label="Total credentials" value={String(actaById.size)} />
            <StatCard icon={Shield} label="Security" value="High" subtext="Wallet-bound access" />
            <StatCard icon={Lock} label="Encryption" value="AES-256" subtext="On-chain storage" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Saved credentials</h2>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search by name, category, wallet…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 border-zinc-800 bg-zinc-950/60 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#edeed1]/20 bg-zinc-900/40 p-10 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#edeed1]/10">
                {query ? (
                  <Search className="h-6 w-6 text-[#edeed1]" />
                ) : (
                  <Shield className="h-6 w-6 text-[#edeed1]" />
                )}
              </div>
              <h3 className="text-base font-semibold text-white">
                {query ? 'No credentials match your search' : 'No credentials yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-white/60">
                {query
                  ? 'Try a different name, category, or wallet address.'
                  : 'Credentials issued to your wallet will appear here automatically.'}
              </p>
            </div>
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

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8 border-t border-[#edeed1]/20 mt-10">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Sponsored vault</h2>
              <p className="text-sm text-white/50">
                Create a vault on behalf of another wallet. Your wallet will sponsor the
                transaction.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#edeed1]/30 bg-[#edeed1]/5 px-3 py-1.5 text-xs font-medium text-[#edeed1]">
              <Sparkle />
              Advanced
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edeed1]/10">
                  <WalletIcon className="h-5 w-5 text-[#edeed1]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Sponsor wallet</p>
                  <p className="text-xs text-white/50">Signs the sponsored transaction</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <code className="flex-1 break-all font-mono text-xs text-white">
                  {walletAddress}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0 p-0 text-white/60 hover:bg-white/10 hover:text-white"
                  onClick={() => copyToClipboard(walletAddress, 'wallet')}
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edeed1]/10">
                  <Shield className="h-5 w-5 text-[#edeed1]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Vault owner</p>
                  <p className="text-xs text-white/50">Wallet that will own the new vault</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="sponsor-owner"
                    className="text-xs font-medium uppercase tracking-wide text-zinc-400"
                  >
                    Owner wallet
                  </label>
                  <Input
                    id="sponsor-owner"
                    type="text"
                    placeholder="G..."
                    value={sponsorOwnerAddress}
                    onChange={(e) => handleSponsorOwnerChange(e.target.value)}
                    className="border-zinc-800 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Derived DID
                  </p>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <code className="flex-1 break-all font-mono text-xs text-white/80">
                      {sponsorOwnerDid || (
                        <span className="text-white/40">Will be derived from the owner wallet</span>
                      )}
                    </code>
                  </div>
                </div>

                {!sponsorOwnerAddress && (
                  <div className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-white/60">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    Paste the wallet address you want to create a vault for.
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreateSponsoredVault}
                disabled={sponsoring || !sponsorOwnerAddress}
                className="mt-4 h-11 w-full rounded-xl bg-white text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sponsoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating sponsored vault…
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create sponsored vault
                  </>
                )}
              </Button>
            </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <Card className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
          <Icon className="h-5 w-5 text-[#edeed1]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          {subtext && <p className="mt-0.5 text-xs text-zinc-400">{subtext}</p>}
        </div>
      </div>
    </Card>
  );
}

function VaultStatusScreen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#edeed1]" />
        </div>
        <p className="text-white/80">{title}</p>
        <p className="mt-1 text-sm text-white/50">{subtitle}</p>
      </div>
    </div>
  );
}

function FeatureChip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#edeed1]/15 bg-zinc-900/60 px-3 py-2.5">
      <Icon className="h-4 w-4 text-[#edeed1]" />
      <span className="text-xs font-medium text-white/80">{label}</span>
    </div>
  );
}

function Sparkle() {
  return (
    <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-[#edeed1]" />
  );
}
