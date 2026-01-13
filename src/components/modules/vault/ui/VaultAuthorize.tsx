'use client';

import { useState } from 'react';
import { useVaultAuthorize } from '@/components/modules/vault/hooks/use-vault-authorize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';
import { validateApiKey } from '@/lib/actaApi';
import { useNetwork } from '@/providers/network.provider';

export function VaultAuthorize() {
  const {
    addressInput,
    setAddressInput,
    authorizeMe,
    authorizeWithInput,
    loading,
    isSelfAuthorized,
  } = useVaultAuthorize();

  const { network } = useNetwork();
  const { apiKey, setApiKey } = useActaApiKey();
  const [customApiKey, setCustomApiKey] = useState('');
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);

  const handleCustomApiKeyChange = async (value: string) => {
    setCustomApiKey(value);
    setKeyValidationError(null);

    if (value.trim()) {
      setValidatingKey(true);
      try {
        const validation = await validateApiKey(value.trim(), network);
        if (validation.valid) {
          setApiKey(value.trim());
          toast.success('API key validated and set');
        } else {
          setKeyValidationError(validation.error || 'Invalid API key');
        }
      } catch (error) {
        setKeyValidationError('Failed to validate API key');
      } finally {
        setValidatingKey(false);
      }
    } else {
      // If empty, use the stored API key
      setApiKey(apiKey);
    }
  };

  const onAuthorizeMe = async () => {
    try {
      if (!apiKey && !customApiKey.trim()) {
        toast.error('API key is required. Please enter or validate an API key first.');
        return;
      }
      await authorizeMe();
      toast.success('Authorized');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error authorizing myself';
      toast.error(msg);
    }
  };

  const onAuthorizeAddress = async () => {
    try {
      if (!apiKey && !customApiKey.trim()) {
        toast.error('API key is required. Please enter or validate an API key first.');
        return;
      }
      await authorizeWithInput();
      toast.success('Address authorized');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error authorizing address';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Custom API Key Input */}
      <Card className="p-6 space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Custom API Key (Optional)</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            If you have an early or custom API key provided by the team, you can use it here instead
            of generating a new one.
          </p>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Paste your custom API key here (early/custom)"
            value={customApiKey}
            onChange={(e) => handleCustomApiKeyChange(e.target.value)}
            className="w-full"
            disabled={validatingKey}
          />
          {keyValidationError && <p className="text-sm text-red-500">{keyValidationError}</p>}
          {validatingKey && <p className="text-sm text-neutral-500">Validating API key...</p>}
          {customApiKey.trim() && !keyValidationError && !validatingKey && (
            <p className="text-sm text-green-500">✓ API key valid</p>
          )}
        </div>
      </Card>

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
            disabled={loading || isSelfAuthorized || validatingKey}
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
            <Button
              onClick={onAuthorizeAddress}
              disabled={loading || validatingKey}
              className="rounded-md"
            >
              {loading ? 'Authorizing...' : 'Authorize'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
