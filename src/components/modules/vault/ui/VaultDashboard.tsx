'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, Search, Key, Lock } from 'lucide-react';
import { useVaultDashboard } from '@/components/modules/vault/hooks/useVaultDashboard';
import { useVaultCards } from '@/components/modules/vault/hooks/useVaultCards';
import ShareCredentialModal from '@/components/modules/credentials/ui/ShareCredentialModal';
import { Skeleton } from '@/components/ui/skeleton';
import { CredentialCard } from '@/components/modules/credentials/ui/SavedCredentialsCard';
import { useMemo, useState, useEffect } from 'react';
import type { Credential } from '@/@types/credentials';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { validateApiKey } from '@/lib/actaApi';
import { useNetwork } from '@/providers/network.provider';
import { toast } from 'sonner';
import { useVault } from '@/components/modules/vault/hooks/use-vault';
import { useWalletContext } from '@/providers/wallet.provider';

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
  const [contentOpen, setContentOpen] = useState(false);
  const [contentCred, setContentCred] = useState<Credential | null>(null);

  const { network } = useNetwork();
  const { apiKey, setApiKey } = useActaApiKey();
  const [customApiKey, setCustomApiKey] = useState('');
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const { refetchDashboard } = useVault();

  const rawJson = useMemo(() => {
    if (!contentCred) return '';
    const raw = (contentCred as unknown as { raw?: unknown }).raw;
    const vaultRecord = (contentCred as unknown as { vaultRecord?: unknown }).vaultRecord;
    const payload = raw ?? vaultRecord ?? contentCred;
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  }, [contentCred]);

  const handleCustomApiKeyChange = async (value: string) => {
    setCustomApiKey(value);
    setKeyValidationError(null);

    if (value.trim()) {
      setValidatingKey(true);
      try {
        const validation = await validateApiKey(value.trim(), network);
        if (validation.valid) {
          setApiKey(value.trim());
          toast.success('API key validated and set');
          // Refetch vault status after setting the API key
          setTimeout(() => {
            void refetchDashboard();
          }, 200);
        } else {
          setKeyValidationError(validation.error || 'Invalid API key');
        }
      } catch (error) {
        setKeyValidationError('Failed to validate API key');
      } finally {
        setValidatingKey(false);
      }
    } else {
      // If empty, use the stored API key
      setApiKey(apiKey);
    }
  };

  // Refetch vault status when API key changes
  useEffect(() => {
    if (apiKey && walletAddress) {
      const timer = setTimeout(() => {
        void refetchDashboard();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, refetchDashboard]);

  const handleCreateVault = async () => {
    // Use custom API key if provided, otherwise use stored one
    const keyToUse = customApiKey.trim() || apiKey;
    if (!keyToUse) {
      toast.error(
        'API key is required to create vault. Please generate an API key from the API Keys page or enter a custom API key above.',
        { duration: 5000 }
      );
      return;
    }
    await onCreateVault();
  };

  // Show create vault screen if:
  // 1. Vault doesn't exist (vaultExists === false), OR
  // 2. We can't determine vault status because there's no API key yet (vaultExists === null && !apiKey)
  // This ensures new wallets see the create vault screen immediately
  const shouldShowCreateVault =
    vaultExists === false || (vaultExists === null && !apiKey && !customApiKey.trim());

  if (shouldShowCreateVault) {
    return (
      <div className="min-h-screen">
        <div className="p-8">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-5xl font-bold tracking-tight text-white">Vault</h1>
            </div>
            <p className="text-white/50 text-lg">Create your vault to view your credentials</p>
          </div>

          {/* Custom API Key Input */}
          <Card className="p-6 mb-6 max-w-2xl mx-auto bg-card border-[#edeed1]/30">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">Custom API Key (Optional)</h3>
                <p className="text-sm text-white/60">
                  If you have an early or custom API key provided by the team, you can use it here
                  instead of generating a new one.
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Paste your custom API key here (early/custom)"
                  value={customApiKey}
                  onChange={(e) => handleCustomApiKeyChange(e.target.value)}
                  className="w-full"
                  disabled={validatingKey}
                />
                {keyValidationError && <p className="text-sm text-red-500">{keyValidationError}</p>}
                {validatingKey && <p className="text-sm text-white/60">Validating API key...</p>}
                {customApiKey.trim() && !keyValidationError && !validatingKey && (
                  <p className="text-sm text-green-500">✓ API key valid</p>
                )}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-center">
            <Button
              onClick={handleCreateVault}
              disabled={validatingKey || (!customApiKey.trim() && !apiKey)}
              className="w-full md:w-1/2 h-12 bg-white hover:bg-white/90 text-black font-semibold shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-all duration-300 rounded-xl disabled:opacity-50"
            >
              Create Vault
            </Button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCredentials.map((credential) => (
                <CredentialCard
                  key={credential.id}
                  name={credential.name}
                  category={credential.category}
                  status={credential.status}
                  wallet={getWalletFromDid(credential.username)}
                  url={credential.url || undefined}
                  onCopy={(text, label) => copyToClipboard(text, label)}
                  onView={() => {
                    const ac = actaById.get(credential.id);
                    if (ac) {
                      setContentCred(ac);
                      setContentOpen(true);
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
      </div>
      {shareOpen && (
        <ShareCredentialModal open={shareOpen} credential={toShare} onClose={closeShare} />
      )}
      {contentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setContentOpen(false);
              setContentCred(null);
            }}
          />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-xl border border-zinc-800 bg-black shadow-2xl overflow-hidden flex flex-col">
            <div className="border-b border-zinc-800 px-6 py-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-white font-semibold text-base sm:text-lg">
                  Credential content
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 font-mono">
                  {contentCred?.id || ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setContentOpen(false);
                  setContentCred(null);
                }}
                className="text-zinc-400 hover:text-white transition-colors p-1.5 hover:bg-zinc-800/50 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-zinc-200 bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 overflow-auto">
                {rawJson || 'No content available'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
