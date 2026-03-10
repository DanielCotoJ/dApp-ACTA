'use client';

import { useShareCredential } from '@/components/modules/credentials/hooks/useShareCredential';

import type { Credential } from '@/@types/credentials';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CertificateCanvas } from '@/components/modules/credentials/ui/impacta-bootcamp/Certificate';

export default function ShareCredentialModal({
  open,
  credential,
  onClose,
}: {
  open: boolean;
  credential: Credential | null;
  onClose: () => void;
}) {
  const { fields, selected, copied, shareParam, onSelectAll, onUnselectAll, onToggle, onCopy } =
    useShareCredential(credential);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const isImpactaCertificate = !!credential?.type.includes('ImpactaCertificateCredential');

  const impactaHolderName =
    (credential as unknown as { holderName?: string | null })?.holderName ??
    (credential?.raw as unknown as { credentialSubject?: { holderName?: string } } | null)
      ?.credentialSubject?.holderName ??
    undefined;

  const impactaYear =
    credential?.issuedAt && !Number.isNaN(Date.parse(credential.issuedAt))
      ? new Date(credential.issuedAt).getFullYear().toString()
      : undefined;

  useEffect(() => {
    (async () => {
      try {
        const url =
          credential?.id && shareParam
            ? `${window.location.origin}/credential/${credential.id}?share=${shareParam}`
            : '';
        if (!url) {
          setQrDataUrl('');
          return;
        }
        const QR = await import('qrcode');
        const dataUrl = await QR.toDataURL(url, { width: 512, margin: 2 });
        setQrDataUrl(dataUrl);
      } catch {}
    })();
  }, [shareParam, credential?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-full sm:max-w-4xl max-h-[90vh] rounded-xl border border-zinc-800 bg-black shadow-2xl overflow-hidden flex flex-col">
        <div className="border-b border-zinc-800 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white font-semibold text-base sm:text-lg">Share Credential</h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5">
                Select fields and generate a secure QR code
              </p>
            </div>
            <button
              onClick={onClose}
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
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium text-sm">QR Code</h3>
                </div>

                <div className="aspect-square rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 flex items-center justify-center max-w-[320px] sm:max-w-none mx-auto">
                  {qrDataUrl ? (
                    <Image
                      src={qrDataUrl || '/placeholder.svg'}
                      alt="QR Code"
                      width={256}
                      height={256}
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-700 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      <p className="text-[11px] sm:text-xs text-zinc-600">Generate proof</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={async () => {
                      await onCopy();
                    }}
                    disabled={!shareParam}
                    className="rounded-lg bg-white text-black px-3 py-2 text-xs sm:text-[13px] font-medium hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => {
                      if (!qrDataUrl) return;
                      const a = document.createElement('a');
                      a.href = qrDataUrl;
                      a.download = 'credential-qr.png';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    disabled={!qrDataUrl}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 text-white px-3 py-2 text-xs sm:text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {isImpactaCertificate && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4">
                  <div className="w-full max-h-[420px] overflow-hidden rounded-lg bg-black/90 flex items-center justify-center">
                    <div className="scale-[0.5] sm:scale-[0.6] origin-top">
                      <CertificateCanvas holderName={impactaHolderName} year={impactaYear} />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-white font-medium text-sm">Select Fields</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSelectAll}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                    >
                      Select All
                    </button>
                    <button
                      onClick={onUnselectAll}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {fields
                    .filter((f) => (credential?.expirationDate ? true : f.key !== 'expirationDate'))
                    .map((f) => (
                      <label
                        key={f.key}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-2.5 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/60 transition-all group"
                      >
                        <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">
                          {f.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={!!selected[f.key]}
                          onChange={() => onToggle(f.key)}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-white focus:ring-2 focus:ring-white/20 focus:ring-offset-0 cursor-pointer accent-white"
                        />
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
