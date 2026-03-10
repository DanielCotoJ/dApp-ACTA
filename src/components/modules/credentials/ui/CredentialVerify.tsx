'use client';

import { CredentialVerifyCard } from './CredentialVerifyCard';
import { useCredentialVerify } from '@/components/modules/credentials/hooks/useCredentialVerify';
import ImpactaCertificate from '@/components/modules/credentials/ui/impacta-bootcamp/Certificate';

export function CredentialVerify({ vcId }: { vcId: string }) {
  const { verify, revealed, shareType, shareLoading } = useCredentialVerify(vcId);

  const isImpacta =
    typeof shareType === 'string' && shareType.includes('ImpactaCertificateCredential');
  const impactaRevealed = (revealed || {}) as Record<string, unknown>;

  if (shareLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-white/50">Loading credential…</p>
        </div>
      </div>
    );
  }

  if (isImpacta) {
    return (
      <ImpactaCertificate
        holderName={
          typeof impactaRevealed.holderName === 'string'
            ? (impactaRevealed.holderName as string)
            : undefined
        }
        issuer={
          typeof impactaRevealed.issuer === 'string'
            ? (impactaRevealed.issuer as string)
            : undefined
        }
        subjectDid={
          typeof impactaRevealed.subject === 'string'
            ? (impactaRevealed.subject as string)
            : undefined
        }
        credentialType={
          typeof impactaRevealed.type === 'string' ? (impactaRevealed.type as string) : undefined
        }
        issuedAt={
          typeof impactaRevealed.issuedAt === 'string'
            ? (impactaRevealed.issuedAt as string)
            : undefined
        }
        status={
          typeof impactaRevealed.status === 'string'
            ? (impactaRevealed.status as string)
            : undefined
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 gap-6">
      <CredentialVerifyCard
        vcId={verify?.vc_id || vcId}
        status={verify?.status}
        since={verify?.since ?? null}
        revealed={revealed || null}
      />
    </div>
  );
}
