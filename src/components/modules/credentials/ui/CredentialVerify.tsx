'use client';

import { CredentialVerifyCard } from './CredentialVerifyCard';
import { useCredentialVerify } from '@/components/modules/credentials/hooks/useCredentialVerify';

export function CredentialVerify({ vcId }: { vcId: string }) {
  const { verify, revealed, zkValid, zkStatement, reverify, reverifyLoading, hasVerified, hasZkProofInShare } =
    useCredentialVerify(vcId);

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
