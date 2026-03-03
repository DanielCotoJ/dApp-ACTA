'use client';

import { CredentialVerifyCard } from './CredentialVerifyCard';
import { useCredentialVerify } from '@/components/modules/credentials/hooks/useCredentialVerify';
import ImpactaCertificate from '@/components/modules/credentials/ui/impacta-bootcamp/Certificate';

export function CredentialVerify({ vcId }: { vcId: string }) {
  const {
    verify,
    revealed,
    zkValid,
    zkStatement,
    reverify,
    reverifyLoading,
    hasVerified,
    hasZkProofInShare,
    shareType,
  } = useCredentialVerify(vcId);

  const isImpacta =
    typeof shareType === 'string' && shareType.includes('ImpactaCertificateCredential');
  const impactaRevealed = (revealed || {}) as Record<string, unknown>;

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
          typeof impactaRevealed.type === 'string'
            ? (impactaRevealed.type as string)
            : undefined
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
        zkValid={zkValid ?? null}
        zkStatement={zkStatement || null}
        hasVerified={hasVerified}
      />
      {hasZkProofInShare && (
        <button
          onClick={reverify}
          disabled={reverifyLoading}
          className="rounded-lg border border-[#edeed1]/30 bg-transparent hover:bg-[#edeed1]/10 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {reverifyLoading ? 'Verifying…' : 'Verify Proof'}
        </button>
      )}
    </div>
  );
}
