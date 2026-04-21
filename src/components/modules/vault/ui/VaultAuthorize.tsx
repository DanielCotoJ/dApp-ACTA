'use client';

import { useVaultAuthorize } from '@/components/modules/vault/hooks/use-vault-authorize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserCheck, UserPlus, CircleCheck, ShieldPlus } from 'lucide-react';
import { ActaLoader, ActaLoaderInline } from '@/components/ui/acta-loader';
import { stellarAddressSchema } from '@/lib/schemas/primitives';

export function VaultAuthorize() {
  const {
    addressInput,
    setAddressInput,
    authorizeMe,
    authorizeWithInput,
    loadingSelf,
    loadingAddress,
    isSelfAuthorized,
    checkingAuth,
  } = useVaultAuthorize();

  const onAuthorizeMe = async () => {
    try {
      await authorizeMe();
      toast.success('Authorized');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error authorizing myself';
      toast.error(msg);
    }
  };

  const onAuthorizeAddress = async () => {
    try {
      await authorizeWithInput();
      toast.success('Address authorized');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error authorizing address';
      toast.error(msg);
    }
  };

  const addrLooksValid = stellarAddressSchema.safeParse(addressInput.trim()).success;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
        <header className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
            <UserCheck className="h-5 w-5 text-[#edeed1]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">Authorize yourself</h3>
            <p className="text-sm text-zinc-400">
              Grant your own wallet permission to issue credentials from this vault.
            </p>
          </div>
        </header>

        {checkingAuth ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[#edeed1]/15 bg-zinc-950/40 p-5 text-center">
            <ActaLoader size="md" text="Checking authorization…" subtext="Verifying issuer permissions on-chain" />
          </div>
        ) : isSelfAuthorized ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <CircleCheck className="h-4 w-4 shrink-0" />
            Your wallet is already authorized as an issuer.
          </div>
        ) : (
          <Button
            onClick={onAuthorizeMe}
            disabled={loadingSelf || loadingAddress}
            aria-busy={loadingSelf}
            className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingSelf ? (
              <>
                <ActaLoaderInline className="mr-2" />
                Authorizing…
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Authorize my wallet
              </>
            )}
          </Button>
        )}
      </section>

      <section className="rounded-2xl border border-[#edeed1]/20 bg-zinc-900/50 p-5 backdrop-blur-sm sm:p-6">
        <header className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edeed1]/10">
            <ShieldPlus className="h-5 w-5 text-[#edeed1]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">Authorize another wallet</h3>
            <p className="text-sm text-zinc-400">
              Let a trusted Stellar wallet issue credentials on behalf of this vault.
            </p>
          </div>
        </header>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="auth-address"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Stellar address
            </label>
            <Input
              id="auth-address"
              placeholder="G…"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="border-zinc-800 bg-zinc-950/60 text-white placeholder:text-zinc-500"
            />
            {addressInput && !addrLooksValid && (
              <p className="mt-1.5 text-xs text-amber-300">
                That doesn&apos;t look like a Stellar public key (G…).
              </p>
            )}
          </div>

          <Button
            onClick={onAuthorizeAddress}
            disabled={loadingSelf || loadingAddress || !addressInput.trim()}
            className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAddress ? (
              <>
                <ActaLoaderInline className="mr-2" />
                Authorizing…
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Authorize address
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
