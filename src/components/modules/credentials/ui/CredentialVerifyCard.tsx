'use client';

import { Copy, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useVerifyCard } from '@/components/modules/credentials/hooks/useVerifyCard';
import type { CredentialVerifyProps } from '@/@types/credentials';

export function CredentialVerifyCard({ vcId, status, since, revealed }: CredentialVerifyProps) {
  const { displayStatus, formatRevealed, copy } = useVerifyCard(status);
  const StatusIcon =
    displayStatus === 'Revoked'
      ? XCircle
      : displayStatus === 'Expired'
        ? AlertCircle
        : CheckCircle2;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4">
      <div className="relative rounded-2xl w-full max-w-4xl bg-black shadow-2xl overflow-hidden border border-[#edeed1]/20">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Image
            src={'/acta.png'}
            alt=""
            width={1024}
            height={1024}
            className={'w-[1024px] h-[1024px] object-contain'}
          />
        </div>

        <div className="relative z-10 p-5 sm:p-8 space-y-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#edeed1]/20">
            <div className="w-full md:w-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Credential</h2>
              <p className="text-xs sm:text-sm text-zinc-400 break-words">
                {(revealed?.type as string) || 'VerifiableCredential'}
              </p>
            </div>
            <div className="text-left md:text-right w-full md:w-auto">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 sm:mb-3">
                ACTA
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                  displayStatus === 'Revoked'
                    ? 'bg-red-950/50 border-red-500/30 text-red-400'
                    : displayStatus === 'Expired'
                      ? 'bg-yellow-950/50 border-yellow-500/30 text-yellow-400'
                      : 'bg-green-950/50 border-green-500/30 text-green-400'
                }`}
              >
                <StatusIcon className="w-4 h-4" />
                {displayStatus}
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-zinc-900/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-[#edeed1]/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 items-center">
              <span className="text-sm sm:text-base font-medium text-white">VC ID</span>
              <span className="text-xs sm:text-sm text-zinc-500 sm:text-right">
                Verification On-chain
              </span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-zinc-300 break-words leading-relaxed">
              {vcId || '-'}
            </div>
          </div>

          {revealed && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm sm:text-base font-semibold text-white">Revealed fields</h3>
              <div className="space-y-3">
                {Object.entries(revealed).map(([k, v]) => {
                  const { text, raw, isWallet } = formatRevealed(k, v);

                  return (
                    <div
                      key={k}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-6 py-3 border-b border-[#edeed1]/10 last:border-0"
                    >
                      <span className="text-xs sm:text-sm font-medium text-white capitalize min-w-[120px]">
                        {k}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:justify-end">
                        <span className="text-xs sm:text-sm text-zinc-300 sm:text-right break-words font-mono">
                          {text}
                        </span>
                        {isWallet && (
                          <button
                            onClick={() => copy(raw)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#edeed1]/10 transition-colors shrink-0 border border-[#edeed1]/30"
                            title="Copy"
                            aria-label="Copy wallet"
                          >
                            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#edeed1]" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {displayStatus === 'Revoked' && since && (
            <div className="pt-4 border-t border-[#edeed1]/20">
              <div className="text-sm text-red-400 font-medium">Revoked: {since}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
