'use client';

import * as StellarSdk from '@stellar/stellar-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import { mapContractErrorToMessage } from '@/lib/utils';
import { actaFetchJson } from '@/lib/actaApi';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';

type ApiConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  actaContractId: string;
};

type TxPrepareResponse = { xdr: string; network: string };

async function fetchApiConfig(params: { network: 'testnet' | 'mainnet'; apiKey: string }) {
  return actaFetchJson<ApiConfig>({
    network: params.network,
    apiKey: params.apiKey,
    method: 'GET',
    path: '/config',
  });
}

async function submitPreparedTx(params: {
  network: 'testnet' | 'mainnet';
  apiKey: string;
  preparePath: string;
  prepareBody: unknown;
  sign: (xdr: string, opts: { networkPassphrase: string }) => Promise<string>;
  networkPassphraseOverride?: string;
}) {
  const prep = await actaFetchJson<TxPrepareResponse>({
    network: params.network,
    apiKey: params.apiKey,
    method: 'POST',
    path: params.preparePath,
    body: params.prepareBody,
  });

  const signedXdr = await params.sign(prep.xdr, {
    networkPassphrase: params.networkPassphraseOverride || prep.network,
  });

  const submit = await actaFetchJson<{ tx_id: string }>({
    network: params.network,
    apiKey: params.apiKey,
    method: 'POST',
    path: params.preparePath,
    body: { signedXdr },
  });

  return submit;
}

export function useVault() {
  const { walletAddress, signTransaction } = useWalletContext();
  const { network } = useNetwork();
  const { apiKey } = useActaApiKey();

  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState<ApiConfig | null>(null);

  const ownerDid = useMemo(() => {
    return walletAddress
      ? `did:pkh:stellar:${network === 'mainnet' ? 'public' : 'testnet'}:${walletAddress}`
      : null;
  }, [walletAddress, network]);

  const ensureConfig = useCallback(async () => {
    if (!apiKey) throw new Error('API key is required');
    if (config) return config;
    const cfg = await fetchApiConfig({ network, apiKey });
    setConfig(cfg);
    return cfg;
  }, [apiKey, config, network]);

  useEffect(() => {
    // Reset cached config when API key or network changes.
    setConfig(null);
  }, [apiKey, network]);

  const checkVaultExists = useCallback(async (): Promise<boolean | null> => {
    if (!walletAddress) return null;
    if (!ownerDid) return null;
    if (!apiKey) return null;

    const cfg = await ensureConfig();

    const server = new StellarSdk.rpc.Server(cfg.rpcUrl);
    const sourceAccount = await server.getAccount(walletAddress);
    const account = new StellarSdk.Account(walletAddress, sourceAccount.sequenceNumber());
    const contract = new StellarSdk.Contract(cfg.actaContractId);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE.toString(),
      networkPassphrase: cfg.networkPassphrase,
    })
      .addOperation(
        contract.call(
          // Existence probe:
          // - If vault is NOT initialized, this fails with ContractError::VaultNotInitialized (#8)
          //   BEFORE requiring auth.
          // - If vault exists, simulation has no signature so it fails with an auth error.
          'set_vault_admin',
          StellarSdk.Address.fromString(walletAddress).toScVal(),
          StellarSdk.Address.fromString(walletAddress).toScVal()
        )
      )
      .setTimeout(60)
      .build();

    const sim = (await server.simulateTransaction(tx)) as { error?: unknown };
    const err = sim.error;
    if (typeof err === 'string') {
      // Vault NOT initialized
      if (/Error\(Contract,\s*#8\)/.test(err) || /VaultNotInitialized/i.test(err)) return false;

      // Any auth error indicates the vault exists but simulation lacks auth.
      if (/Error\(Auth,/i.test(err) || /\bauth\b/i.test(err)) return true;

      // Conservative fallback: unknown error => treat as not existing.
      return false;
    }

    // If no error, the call would succeed => vault exists.
    return true;
  }, [walletAddress, ownerDid, apiKey, ensureConfig]);

  const checkSelfAuthorized = useCallback(async (): Promise<boolean> => {
    if (!walletAddress) return false;
    if (!apiKey) return false;

    const cfg = await ensureConfig();

    const server = new StellarSdk.rpc.Server(cfg.rpcUrl);
    const sourceAccount = await server.getAccount(walletAddress);
    const account = new StellarSdk.Account(walletAddress, sourceAccount.sequenceNumber());
    const contract = new StellarSdk.Contract(cfg.actaContractId);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE.toString(),
      networkPassphrase: cfg.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'authorize_issuer',
          StellarSdk.Address.fromString(walletAddress).toScVal(),
          StellarSdk.Address.fromString(walletAddress).toScVal()
        )
      )
      .setTimeout(60)
      .build();

    const sim = (await server.simulateTransaction(tx)) as { error?: unknown };
    const err = sim.error;

    if (typeof err === 'string') {
      // IssuerAlreadyAuthorized
      if (/Error\(Contract,\s*#3\)/.test(err) || /IssuerAlreadyAuthorized/i.test(err)) return true;
      return false;
    }

    return false;
  }, [walletAddress, apiKey, ensureConfig]);

  const createVault = useCallback(async () => {
    if (!walletAddress) throw new Error('Connect your wallet first');
    if (!ownerDid) throw new Error('Could not compute owner DID');
    if (!apiKey) throw new Error('API key is required');
    if (!signTransaction) throw new Error('Signer unavailable');

    setLoading(true);
    try {
      const submit = await submitPreparedTx({
        network,
        apiKey,
        preparePath: '/contracts/vault/create',
        prepareBody: {
          owner: walletAddress,
          didUri: ownerDid,
          sourcePublicKey: walletAddress,
        },
        sign: signTransaction,
      });

      queryClient.setQueryData(['vault', 'exists', walletAddress, network], true);
      await queryClient.invalidateQueries({
        queryKey: ['vault', 'dashboard', walletAddress, network],
      });

      return { txId: submit.tx_id };
    } catch (e: unknown) {
      throw new Error(mapContractErrorToMessage(e));
    } finally {
      setLoading(false);
    }
  }, [walletAddress, ownerDid, apiKey, signTransaction, network, queryClient]);

  const authorizeSelf = useCallback(async () => {
    if (!walletAddress) throw new Error('Connect your wallet first');
    if (!apiKey) throw new Error('API key is required');
    if (!signTransaction) throw new Error('Signer unavailable');

    setLoading(true);
    try {
      const submit = await submitPreparedTx({
        network,
        apiKey,
        preparePath: '/contracts/vault/authorize-issuer',
        prepareBody: {
          owner: walletAddress,
          issuer: walletAddress,
          sourcePublicKey: walletAddress,
        },
        sign: signTransaction,
      });

      await queryClient.invalidateQueries({
        queryKey: ['vault', 'dashboard', walletAddress, network],
      });
      return { txId: submit.tx_id };
    } catch (e: unknown) {
      throw new Error(mapContractErrorToMessage(e));
    } finally {
      setLoading(false);
    }
  }, [walletAddress, apiKey, signTransaction, network, queryClient]);

  const authorizeAddress = useCallback(
    async (address: string) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!apiKey) throw new Error('API key is required');
      if (!signTransaction) throw new Error('Signer unavailable');
      if (!address) throw new Error('Address required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
          apiKey,
          preparePath: '/contracts/vault/authorize-issuer',
          prepareBody: {
            owner: walletAddress,
            issuer: address,
            sourcePublicKey: walletAddress,
          },
          sign: signTransaction,
        });

        await queryClient.invalidateQueries({
          queryKey: ['vault', 'dashboard', walletAddress, network],
        });
        return { txId: submit.tx_id };
      } catch (e: unknown) {
        throw new Error(mapContractErrorToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, apiKey, signTransaction, network, queryClient]
  );

  const revokeAddress = useCallback(
    async (address: string) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!apiKey) throw new Error('API key is required');
      if (!signTransaction) throw new Error('Signer unavailable');
      if (!address) throw new Error('Address required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
          apiKey,
          preparePath: '/contracts/vault/revoke-issuer',
          prepareBody: {
            owner: walletAddress,
            issuer: address,
            sourcePublicKey: walletAddress,
          },
          sign: signTransaction,
        });

        await queryClient.invalidateQueries({
          queryKey: ['vault', 'dashboard', walletAddress, network],
        });
        return { txId: submit.tx_id };
      } catch (e: unknown) {
        throw new Error(mapContractErrorToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, apiKey, signTransaction, network, queryClient]
  );

  const revokeCredential = useCallback(
    async (vcId: string) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!apiKey) throw new Error('API key is required');
      if (!signTransaction) throw new Error('Signer unavailable');
      if (!vcId) throw new Error('Credential ID required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
          apiKey,
          preparePath: '/contracts/vc/revoke',
          prepareBody: {
            vcId,
            sourcePublicKey: walletAddress,
          },
          sign: signTransaction,
        });

        await queryClient.invalidateQueries({
          queryKey: ['vault', 'dashboard', walletAddress, network],
        });
        return { txId: submit.tx_id };
      } catch (e: unknown) {
        throw new Error(mapContractErrorToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, apiKey, signTransaction, network, queryClient]
  );

  const readDashboard = useCallback(async () => {
    if (!walletAddress) {
      return {
        vaultExists: null as boolean | null,
        vcIds: null as string[] | null,
        vcs: null as unknown[] | null,
        vcReadError: false as boolean,
      };
    }

    if (!apiKey) {
      return {
        vaultExists: null as boolean | null,
        vcIds: [],
        vcs: [],
        vcReadError: true,
      };
    }

    try {
      const [exists, idsResp] = await Promise.all([
        checkVaultExists(),
        actaFetchJson<{ result: string[] }>({
          network,
          apiKey,
          path: '/contracts/vault/list-vc-ids',
          body: { owner: walletAddress },
        }),
      ]);

      const ids = Array.isArray(idsResp?.result) ? idsResp.result : [];

      const items: unknown[] = [];
      for (const id of ids) {
        try {
          const [vcResp, statusResp] = await Promise.all([
            actaFetchJson<{ result: unknown }>({
              network,
              apiKey,
              path: '/contracts/vault/get-vc',
              body: { owner: walletAddress, vcId: id },
            }),
            actaFetchJson<{ status: string; since?: string }>({
              network,
              apiKey,
              path: '/contracts/vault/verify-vc',
              body: { owner: walletAddress, vcId: id },
            }),
          ]);

          const vc = vcResp?.result;
          if (vc) {
            items.push({ ...vc, status: statusResp.status, since: statusResp.since });
          }
        } catch {
          // ignore individual errors
        }
      }

      return {
        vaultExists: exists,
        vcIds: ids,
        vcs: items,
        vcReadError: false,
      };
    } catch {
      return {
        vaultExists: null,
        vcIds: [],
        vcs: [],
        vcReadError: true,
      };
    }
  }, [walletAddress, apiKey, network, checkVaultExists]);

  const dashboardQuery = useQuery<{
    vaultExists: boolean | null;
    vcIds: string[] | null;
    vcs: unknown[] | null;
    vcReadError: boolean;
  }>({
    queryKey: ['vault', 'dashboard', walletAddress, network],
    queryFn: readDashboard,
    enabled: !!walletAddress,
    staleTime: 10_000,
  });

  const [vaultExists, setVaultExists] = useState<boolean | null>(null);
  const [vcIds, setVcIds] = useState<string[] | null>(null);
  const [vcs, setVcs] = useState<unknown[] | null>(null);
  const [vcReadError, setVcReadError] = useState<boolean>(false);

  useEffect(() => {
    const data = dashboardQuery.data;
    if (!data) {
      setVaultExists(null);
      setVcIds(null);
      setVcs(null);
      setVcReadError(false);
      return;
    }
    setVaultExists(data.vaultExists);
    setVcIds(data.vcIds);
    setVcs(data.vcs);
    setVcReadError(!!data.vcReadError);
  }, [dashboardQuery.data]);

  return {
    dashboardStatus: dashboardQuery.status,
    loading,

    // writes
    createVault,
    authorizeSelf,
    authorizeAddress,
    revokeAddress,
    revokeCredential,

    // reads
    ownerDid,
    vaultExists,
    vcIds,
    vcs,
    vcReadError,

    // checks
    checkSelfAuthorized,
  };
}
