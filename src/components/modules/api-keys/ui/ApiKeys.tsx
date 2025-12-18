'use client';

import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePublicApiKey } from '@/components/modules/api-keys/hooks/usePublicApiKey';

function formatDate(iso: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function ApiKeys() {
  const { network, baseUrl, loading, error, data, requestStandardKey, reset } = usePublicApiKey();

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
          <label className="block text-sm text-white/70 mb-2">Name (optional)</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My ACTA API Key"
            className="bg-black/30 border-white/15 text-white placeholder:text-white/40"
          />
          <p className="mt-2 text-xs text-white/50">
            You will see the API key only once. Save it securely.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90">
              {error}
            </div>
          )}

          <div className="mt-4">
            <Button
              type="button"
              className="h-11 bg-white hover:bg-white/90 text-black font-medium rounded-lg"
              disabled={loading}
              onClick={() => requestStandardKey({ name: name.trim() || undefined })}
            >
              {loading ? 'Creating…' : 'Request API Key'}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/20 p-4">
          <div className="text-sm font-semibold text-white/90">Your key</div>
          <div className="mt-3">
            <div className="text-xs text-white/60 mb-1">API Key (save it now)</div>
            <div className="rounded-lg border border-white/15 bg-black/30 p-3 font-mono text-xs text-white/90 break-all min-h-[64px]">
              {data?.api_key ? data.api_key : '—'}
            </div>
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
