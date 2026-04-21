'use client';

import { CredentialVerifyCard } from './CredentialVerifyCard';
import { useCredentialVerify } from '@/components/modules/credentials/hooks/useCredentialVerify';
import ImpactaCertificate from '@/components/modules/credentials/ui/impacta-bootcamp/Certificate';
import { ActaLoader } from '@/components/ui/acta-loader';

export function CredentialVerify({ vcId }: { vcId: string }) {
  const { verify, revealed, shareType, shareLoading } = useCredentialVerify(vcId);

  const isImpacta =
    typeof shareType === 'string' && shareType.includes('ImpactaCertificateCredential');
  const impactaRevealed = (revealed || {}) as Record<string, unknown>;

  if (shareLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ActaLoader size="lg" text="Loading credential…" />
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
