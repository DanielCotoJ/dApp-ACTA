'use client';

import { useEffect, useState } from 'react';
import type { CredentialTemplate } from '@/@types/templates';
import Image from 'next/image';
import {
  User,
  FileText,
  KeyRound,
  ShieldCheck,
  Loader2,
  CircleCheck,
  CircleAlert,
  Send,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateApiKey } from '@/lib/actaApi';
import { useNetwork } from '@/providers/network.provider';
import { toast } from 'sonner';

export default function DynamicIssueForm({
  template,
  values,
  vcId,
  owner,
  onSetOwner,
  issuing,
  preview,
  error,
  apiKey,
  onSetApiKey,
  onSetField,
  onBuildPreview,
  onSubmit,
  issuanceCode,
  onSetIssuanceCode,
  issuanceCodeValid,
}: {
  template: CredentialTemplate | null;
  values: Record<string, string>;
  vcId: string;
  owner: string;
  onSetOwner: (value: string) => void;
  issuing: boolean;
  preview: unknown | null;
  error: string | null;
  apiKey: string;
  onSetApiKey: (value: string) => void;
  onSetField: (key: string, value: string) => void;
  onBuildPreview: () => void;
  onSubmit: () => Promise<void>;
  issuanceCode?: string;
  onSetIssuanceCode?: (value: string) => void;
  issuanceCodeValid?: boolean | null;
}) {
  void vcId;
  void preview;
  const { network } = useNetwork();
  const [hasExpiration, setHasExpiration] = useState(false);
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  const [keyValidated, setKeyValidated] = useState(false);
  const supportsExpiration = !!template?.fields.some((f) => f.key === 'expirationDate');
  const isImpacta = template?.id === 'impacta-certificate';

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

  if (!template) {
    return (
      <section className="rounded-2xl border border-dashed border-[#edeed1]/20 bg-zinc-900/40 p-10 text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#edeed1]/10">
          <FileText className="h-6 w-6 text-[#edeed1]" />
        </div>
        <h3 className="text-base font-semibold text-white">Select a template to begin</h3>
        <p className="mt-1 text-sm text-white/60">
          Pick a built-in or custom template above to see its required fields here.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template overview */}
      <section className="relative overflow-hidden rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
            <FileText className="h-5 w-5 text-[#edeed1]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">{template.title}</h2>
            <p className="text-sm text-zinc-400">{template.description}</p>
          </div>
          {template.iconSrc && (
            <Image
              src={template.iconSrc}
              alt={template.title}
              width={96}
              height={96}
              className="hidden h-20 w-20 shrink-0 object-contain sm:block"
              priority={false}
            />
          )}
        </div>

        {supportsExpiration && (
          <label
            htmlFor="hasExpiration"
            className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 transition-colors hover:bg-zinc-900"
          >
            <input
              id="hasExpiration"
              type="checkbox"
              checked={hasExpiration}
              onChange={(e) => {
                const checked = e.target.checked;
                setHasExpiration(checked);
                if (!checked) onSetField('expirationDate', '');
              }}
              className="h-4 w-4 rounded border border-zinc-700 bg-zinc-950 text-[#edeed1] focus:ring-[#edeed1]/50"
            />
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-white">This credential has an expiration date</span>
          </label>
        )}
      </section>

      {/* Recipient */}
      <FormSection
        icon={User}
        title="Recipient"
        description="The wallet that will receive this credential"
      >
        <div>
          <Label htmlFor="owner-address">Recipient wallet (owner)</Label>
          <input
            id="owner-address"
            type="text"
            value={owner}
            placeholder="G… (leave empty to issue to yourself)"
            onChange={(e) => onSetOwner(e.target.value)}
            className={inputClass}
          />
          <Helper>
            Who receives this credential. Leave empty to issue to your connected wallet.
          </Helper>
        </div>
      </FormSection>

      {/* Credential fields */}
      <FormSection
        icon={FileText}
        title="Credential fields"
        description="Fill in the information that will be signed into the credential"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {template.fields
            .filter((f) => (f.key === 'expirationDate' ? hasExpiration : true))
            .map((f) => (
              <div key={f.key} className={f.type === 'date' ? '' : 'sm:col-span-2'}>
                <Label htmlFor={`field-${f.key}`}>
                  {f.label}
                  {f.required && <span className="ml-0.5 text-[#edeed1]">*</span>}
                </Label>
                <input
                  id={`field-${f.key}`}
                  type={f.type === 'date' ? 'date' : 'text'}
                  value={values[f.key] || ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => onSetField(f.key, e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
        </div>
      </FormSection>

      {/* Credentials (API key) */}
      <FormSection
        icon={KeyRound}
        title="API credentials"
        description={
          isImpacta
            ? 'An admin API key is required to issue Impacta certificates.'
            : 'Use an early/custom key provided by the team, or generate one in the API Keys page.'
        }
      >
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="api-key">
              API key {isImpacta ? '(admin)' : ''}
              <span className="ml-0.5 text-[#edeed1]">*</span>
            </Label>
            {keyValidated && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <CircleCheck className="h-3.5 w-3.5" />
                Validated
              </span>
            )}
            {validatingKey && (
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Validating…
              </span>
            )}
          </div>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            placeholder={
              isImpacta ? 'Paste your admin API key' : 'Paste your API key (early/custom supported)'
            }
            onChange={(e) => handleApiKeyChange(e.target.value)}
            disabled={validatingKey}
            className={`${inputClass} disabled:opacity-50`}
            autoComplete="off"
          />
          {keyValidationError && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{keyValidationError}</span>
            </div>
          )}
        </div>

        {isImpacta && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="issuance-code">
                Issuance code<span className="ml-0.5 text-[#edeed1]">*</span>
              </Label>
              {issuanceCodeValid === true && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CircleCheck className="h-3.5 w-3.5" />
                  Authorized
                </span>
              )}
              {issuanceCodeValid === false && (
                <span className="inline-flex items-center gap-1 text-xs text-red-400">
                  <CircleAlert className="h-3.5 w-3.5" />
                  Invalid code
                </span>
              )}
            </div>
            <input
              id="issuance-code"
              type="password"
              value={issuanceCode ?? ''}
              placeholder="Enter your authorized issuance code"
              onChange={(e) => onSetIssuanceCode?.(e.target.value)}
              className={inputClass}
              autoComplete="off"
            />
            <Helper>
              A valid issuance code is required to issue Impacta Bootcamp certificates. Contact an
              administrator if you don&apos;t have one.
            </Helper>
          </div>
        )}
      </FormSection>

      {/* Submit */}
      <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edeed1]/10">
              <ShieldCheck className="h-5 w-5 text-[#edeed1]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ready to issue</p>
              <p className="text-xs text-zinc-400">
                The credential will be signed and stored in the recipient&apos;s vault.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={issuing || !template}
            className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
          >
            {issuing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Issuing…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Issue credential
              </>
            )}
          </Button>
        </div>
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}
      </section>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder:text-zinc-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#edeed1]/50 focus:border-[#edeed1]/40 transition-all';

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
          <Icon className="h-5 w-5 text-[#edeed1]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400"
    >
      {children}
    </label>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-zinc-500">{children}</p>;
}
