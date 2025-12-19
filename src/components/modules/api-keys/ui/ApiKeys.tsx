'use client';

import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePublicApiKey } from '@/components/modules/api-keys/hooks/usePublicApiKey';
import { useWalletContext } from '@/providers/wallet.provider';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function ApiKeys() {
  const { walletAddress } = useWalletContext();
  const { loading, error, data, requestStandardKey } = usePublicApiKey();

  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  const expiresLabel = useMemo(() => {
    if (!data?.api_key_record?.expires_at) return '-';
    return formatDate(data.api_key_record.expires_at);
  }, [data]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      void e;
    }
  };

  return (
    <div className="rounded-xl p-6 sm:p-8 border border-white/10 bg-black/20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* Security Warning */}
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="text-amber-400 mt-0.5">⚠️</div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-amber-200">
                  Important Security Information
                </p>
                <ul className="text-xs text-amber-200/90 space-y-1 list-disc list-inside">
                  <li>
                    <strong>One API key per wallet:</strong> You can only create one API key per
                    wallet address. Once created, you cannot create another one.
                  </li>
                  <li>
                    <strong>Save it immediately:</strong> The API key will only be displayed once.
                    If you leave this page, you will not be able to see it again.
                  </li>
                  <li>
                    <strong>Store it securely:</strong> Keep your API key safe and never share it
                    publicly. Treat it like a password.
                  </li>
                  <li>
                    <strong>Access control:</strong> Your API key is linked to your wallet address
                    and can only access credentials belonging to your wallet.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <label className="block text-sm text-white/70 mb-2">Name (optional)</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My ACTA API Key"
            className="bg-black/30 border-white/15 text-white placeholder:text-white/40"
          />
          <p className="mt-2 text-xs text-white/50">
            You will see the API key only once. Save it securely before leaving this page.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90">
              {error}
            </div>
          )}

          {data?.api_key && (
            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200/90">
              <p className="font-semibold mb-1">✅ API Key Created Successfully!</p>
              <p className="text-xs">
                Make sure to copy and save your API key now. You won't be able to see it again after
                leaving this page.
              </p>
            </div>
          )}

          {!walletAddress && (
            <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200/90">
              <p className="font-semibold mb-1">🔐 Wallet Required</p>
              <p className="text-xs">
                Please connect your wallet first to create an API key. Your API key will be linked
                to your wallet address for security.
              </p>
            </div>
          )}

          <div className="mt-4">
            <Button
              type="button"
              className="h-11 bg-white hover:bg-white/90 text-black font-medium rounded-lg"
              disabled={loading || !!data?.api_key || !walletAddress}
              onClick={() => requestStandardKey({ name: name.trim() || undefined })}
            >
              {loading
                ? 'Creating…'
                : data?.api_key
                  ? 'API Key Already Created'
                  : !walletAddress
                    ? 'Connect Wallet First'
                    : 'Request API Key'}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/90">Your API Key</div>
          <div className="mt-3">
            <div className="text-xs text-white/60 mb-1">
              API Key {data?.api_key ? '(copy and save immediately)' : '(will appear here)'}
            </div>
            <div className="rounded-lg border border-white/15 bg-black/30 p-3 font-mono text-xs text-white/90 break-all min-h-[64px]">
              {data?.api_key ? data.api_key : '—'}
            </div>
            {data?.api_key && (
              <div className="mt-2 text-xs text-amber-400/80">
                ⚠️ This is your only chance to see this key. Save it now!
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/20 text-white/90 hover:bg-white/10 bg-transparent"
                disabled={!data?.api_key}
                onClick={() => data?.api_key && copyToClipboard(data.api_key)}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs text-white/60">
            <div className="flex items-center justify-between gap-3">
              <span>Role</span>
              <span className="text-white/90">standard</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Expires at</span>
              <span className="text-white/90">{expiresLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>ID</span>
              <span className="text-white/90 font-mono">{data?.api_key_record?.id ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
