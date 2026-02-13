'use client';

import { useVaultAuthorize } from '@/components/modules/vault/hooks/use-vault-authorize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function VaultAuthorize() {
  const {
    addressInput,
    setAddressInput,
    authorizeMe,
    authorizeWithInput,
    loading,
    isSelfAuthorized,
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

  return (
    <div className="space-y-6 mt-4">
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="p-6 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Authorize Me</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Grants you permission as an authorized issuer in your vault.
            </p>
          </div>
          <Button
            onClick={onAuthorizeMe}
            disabled={loading || isSelfAuthorized}
            className="w-full rounded-md"
          >
            {loading ? 'Authorizing...' : isSelfAuthorized ? 'Already authorized' : 'Authorize Me'}
          </Button>
        </Card>

        <Card className="p-6 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Authorize Address</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Enter a Stellar wallet (G...) to authorize it.
            </p>
          </div>
          <div className="flex w-full gap-2 items-center">
            <Input
              placeholder="Address to authorize (G...)"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="flex-1 min-w-0"
            />
            <Button onClick={onAuthorizeAddress} disabled={loading} className="rounded-md">
              {loading ? 'Authorizing...' : 'Authorize'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
