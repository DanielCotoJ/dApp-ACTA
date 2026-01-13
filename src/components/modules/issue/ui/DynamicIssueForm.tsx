'use client';

import { useEffect, useState } from 'react';
import type { CredentialTemplate } from '@/@types/templates';
import Image from 'next/image';
import { validateApiKey } from '@/lib/actaApi';
import { useNetwork } from '@/providers/network.provider';
import { toast } from 'sonner';

export default function DynamicIssueForm({
  template,
  values,
  vcId,
  issuing,
  preview,
  error,
  apiKey,
  onSetApiKey,
  onSetField,
  onBuildPreview,
  onSubmit,
}: {
  template: CredentialTemplate | null;
  values: Record<string, string>;
  vcId: string;
  issuing: boolean;
  preview: unknown | null;
  error: string | null;
  apiKey: string;
  onSetApiKey: (value: string) => void;
  onSetField: (key: string, value: string) => void;
  onBuildPreview: () => void;
  onSubmit: () => Promise<void>;
}) {
  void vcId;
  void preview;
  const { network } = useNetwork();
  const [hasExpiration, setHasExpiration] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [keyValidated, setKeyValidated] = useState(false);

  useEffect(() => {
    onBuildPreview();
  }, [template, values, onBuildPreview]);

  const handleApiKeyChange = async (value: string) => {
    onSetApiKey(value);
    setKeyValidationError(null);
    setKeyValidated(false);

    if (value.trim()) {
      setValidatingKey(true);
      try {
        const validation = await validateApiKey(value.trim(), network);
        if (validation.valid) {
          setKeyValidated(true);
          toast.success('API key validated');
        } else {
          setKeyValidationError(validation.error || 'Invalid API key');
        }
      } catch {
        setKeyValidationError('Failed to validate API key');
      } finally {
        setValidatingKey(false);
      }
    }
  };

  void template;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm relative">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white mb-2">
              {template ? `Create credential ${template.title.toLowerCase()}` : 'Form'}
            </h3>
            {template?.id === 'escrow' && (
              <Image
                src="/tw.png"
                alt="Escrow"
                width={120}
                height={120}
                className="absolute top-4 right-4 w-24 h-24 object-contain"
                priority={false}
              />
            )}
            {template?.id === 'contributions' && (
              <Image
                src="/gf.png"
                alt="Contributions"
                width={120}
                height={120}
                className="absolute top-4 right-4 w-24 h-24 object-contain"
                priority={false}
              />
            )}
          </div>
          {template && (
            <div className="mt-4 flex items-center gap-3">
              <input
                id="hasExpiration"
                type="checkbox"
                checked={hasExpiration}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasExpiration(checked);
                  if (!checked) onSetField('expirationDate', '');
                }}
                aria-label="Toggle expiration"
                className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950/50 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="hasExpiration" className="text-sm font-medium text-white">
                Does the credential have an expiration date?
              </label>
            </div>
          )}
          <p className="mt-4 text-sm text-zinc-400">
            {template
              ? 'Complete the fields to create a new credential'
              : 'Select a template above.'}
          </p>
        </div>

        {!template ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            Select a template above to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {template.fields
              .filter((f) => (f.key === 'expirationDate' ? hasExpiration : true))
              .map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-white mb-2">
                    {f.label}
                    {f.required ? ' *' : ''}
                  </label>
                  <input
                    type={f.type === 'date' ? 'date' : 'text'}
                    value={values[f.key] || ''}
                    placeholder={f.placeholder || ''}
                    onChange={(e) => onSetField(f.key, e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 text-white placeholder:text-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              ))}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                API Key *{' '}
                {keyValidated && <span className="text-green-500 text-xs">✓ Validated</span>}
              </label>
              <input
                type="password"
                value={apiKey}
                placeholder="Paste your API key here (can be a custom early/custom key)"
                onChange={(e) => handleApiKeyChange(e.target.value)}
                disabled={validatingKey}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 text-white placeholder:text-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50"
              />
              {keyValidationError && (
                <p className="mt-2 text-xs text-red-400">{keyValidationError}</p>
              )}
              {validatingKey && <p className="mt-2 text-xs text-zinc-500">Validating API key...</p>}
              <p className="mt-2 text-xs text-zinc-500">
                If you have an early or custom API key provided by the team, you can use it here.
                Otherwise, generate one from the API Keys page.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={onSubmit}
                disabled={issuing || !template}
                className="w-full rounded-xl bg-white text-black px-6 py-3 font-medium hover:bg-grey-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {issuing ? 'Issuing...' : 'Issue Credential'}
              </button>
              {error && (
                <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
