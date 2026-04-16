'use client';

import * as StellarSdk from '@stellar/stellar-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import { mapContractErrorToMessage } from '@/lib/utils';
import { actaFetchJson } from '@/lib/actaApi';
import {
  apiConfigSchema,
  txPrepareResponseSchema,
  txSubmitResponseSchema,
  listVcIdsResponseSchema,
  getVcResponseSchema,
  verifyVcResponseSchema,
  type ApiConfig,
} from '@/lib/schemas/acta-api';

/**
 * Returns true if the given owner address already has a vault (so sponsored vault creation can be skipped).
 * Uses RPC simulation of authorize_issuer(owner, owner); contract returns #8 when vault does not exist.
 */
export async function checkVaultExistsForOwner(
  cfg: ApiConfig,
  ownerAddress: string
): Promise<boolean> {
  try {
    const server = new StellarSdk.rpc.Server(cfg.rpcUrl);
    let sourceAccount: { sequenceNumber(): string };
    try {
      sourceAccount = await server.getAccount(ownerAddress);
    } catch {
      return false;
    }
    const account = new StellarSdk.Account(ownerAddress, sourceAccount.sequenceNumber());
    const contract = new StellarSdk.Contract(cfg.actaContractId);
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE.toString(),
      networkPassphrase: cfg.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'authorize_issuer',
          StellarSdk.Address.fromString(ownerAddress).toScVal(),
          StellarSdk.Address.fromString(ownerAddress).toScVal()
        )
      )
      .setTimeout(60)
      .build();

    const sim = (await server.simulateTransaction(tx)) as { error?: unknown };
    if (sim.error) {
      const errStr = String(sim.error);
      if (/Error\(Contract,\s*#8\)/.test(errStr) || /VaultNotInitialized/i.test(errStr)) {
        return false;
      }
    }
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/VaultNotInitialized/i.test(msg) || /Error\(Contract,\s*#8\)/.test(msg)) {
      return false;
    }
    return false;
  }
}

async function fetchApiConfig(params: { network: 'testnet' | 'mainnet'; apiKey?: string }) {
  return actaFetchJson({
    network: params.network,
    apiKey: params.apiKey,
    method: 'GET',
    path: '/config',
    schema: apiConfigSchema,
  });
}

async function submitPreparedTx(params: {
  network: 'testnet' | 'mainnet';
  apiKey?: string;
  preparePath: string;
  prepareBody: unknown;
  sign: (xdr: string, opts: { networkPassphrase: string }) => Promise<string>;
  networkPassphraseOverride?: string;
}) {
  const prep = await actaFetchJson({
    network: params.network,
    apiKey: params.apiKey,
    method: 'POST',
    path: params.preparePath,
    body: params.prepareBody,
    schema: txPrepareResponseSchema,
  });

  const signedXdr = await params.sign(prep.xdr, {
    networkPassphrase: params.networkPassphraseOverride || prep.network,
  });

  const submit = await actaFetchJson({
    network: params.network,
    apiKey: params.apiKey,
    method: 'POST',
    path: params.preparePath,
    body: { signedXdr },
    schema: txSubmitResponseSchema,
  });

  return submit;
}

export function useVault() {
  const { walletAddress, signTransaction } = useWalletContext();
  const { network } = useNetwork();

  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState<ApiConfig | null>(null);

  const ownerDid = useMemo(() => {
    return walletAddress
      ? `did:pkh:stellar:${network === 'mainnet' ? 'mainnet' : 'testnet'}:${walletAddress}`
      : null;
  }, [walletAddress, network]);

  const ensureConfig = useCallback(async () => {
    if (config) return config;
    const cfg = await fetchApiConfig({ network });
    setConfig(cfg);
    return cfg;
  }, [config, network]);

  useEffect(() => {
    setConfig(null);
  }, [network]);

  const checkSelfAuthorized = useCallback(async (): Promise<boolean> => {
    if (!walletAddress) return false;

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
  }, [walletAddress, ensureConfig]);

  const createVault = useCallback(async () => {
    if (!walletAddress) throw new Error('Connect your wallet first');
    if (!ownerDid) throw new Error('Could not compute owner DID');
    if (!signTransaction) throw new Error('Signer unavailable');

    setLoading(true);
    try {
      const submit = await submitPreparedTx({
        network,
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
  }, [walletAddress, ownerDid, signTransaction, network, queryClient]);

  const createSponsoredVault = useCallback(
    async (params: { owner: string; didUri: string }) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!signTransaction) throw new Error('Signer unavailable');

      const owner = params.owner?.trim();
      const didUri = params.didUri?.trim();

      if (!owner) throw new Error('Owner address required');
      if (!didUri) throw new Error('Owner DID required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
          preparePath: '/contracts/sponsored-vault/create',
          prepareBody: {
            sponsor: walletAddress,
            owner,
            didUri,
            sourcePublicKey: walletAddress,
          },
          sign: signTransaction,
        });

        return { txId: submit.tx_id };
      } catch (e: unknown) {
        throw new Error(mapContractErrorToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, signTransaction, network]
  );

  const authorizeSelf = useCallback(async () => {
    if (!walletAddress) throw new Error('Connect your wallet first');
    if (!signTransaction) throw new Error('Signer unavailable');

    setLoading(true);
    try {
      const submit = await submitPreparedTx({
        network,
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
  }, [walletAddress, signTransaction, network, queryClient]);

  const authorizeAddress = useCallback(
    async (address: string) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!signTransaction) throw new Error('Signer unavailable');
      if (!address) throw new Error('Address required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
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
    [walletAddress, signTransaction, network, queryClient]
  );

  const revokeAddress = useCallback(
    async (address: string) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!signTransaction) throw new Error('Signer unavailable');
      if (!address) throw new Error('Address required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
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
    [walletAddress, signTransaction, network, queryClient]
  );

  const revokeCredential = useCallback(
    async (vcId: string) => {
      if (!walletAddress) throw new Error('Connect your wallet first');
      if (!signTransaction) throw new Error('Signer unavailable');
      if (!vcId) throw new Error('Credential ID required');

      setLoading(true);
      try {
        const submit = await submitPreparedTx({
          network,
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
    [walletAddress, signTransaction, network, queryClient]
  );

  const verifyVaultViaRpc = useCallback(
    async (cfg: ApiConfig): Promise<boolean> => {
      if (!walletAddress) return false;
      try {
        const server = new StellarSdk.rpc.Server(cfg.rpcUrl);

        let sourceAccount: { sequenceNumber(): string };
        try {
          sourceAccount = await server.getAccount(walletAddress);
        } catch {
          return false;
        }

        const account = new StellarSdk.Account(walletAddress, sourceAccount.sequenceNumber());
        const contract = new StellarSdk.Contract(cfg.actaContractId);

        // list_vc_ids returns empty for both existing-empty vaults and
        // non-existent vaults, so we simulate authorize_issuer instead:
        // it throws Error(Contract, #8) when the vault hasn't been created.
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
        if (sim.error) {
          const errStr = String(sim.error);
          if (/Error\(Contract,\s*#8\)/.test(errStr) || /VaultNotInitialized/i.test(errStr)) {
            return false;
          }
        }

        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/VaultNotInitialized/i.test(msg) || /Error\(Contract,\s*#8\)/.test(msg)) {
          return false;
        }
        return false;
      }
    },
    [walletAddress]
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

    try {
      const idsResp = await actaFetchJson({
        network,
        path: '/contracts/vault/list-vc-ids',
        body: { owner: walletAddress },
        schema: listVcIdsResponseSchema,
      });
      const ids = idsResp.result;

      // The API may return { result: [] } even when the vault doesn't exist.
      // When the list is empty, verify vault existence directly against the
      // smart contract via RPC simulation to avoid false positives.
      if (ids.length === 0) {
        const cfg = await ensureConfig();
        const exists = await verifyVaultViaRpc(cfg);
        if (!exists) {
          return {
            vaultExists: false,
            vcIds: [] as string[],
            vcs: [] as unknown[],
            vcReadError: false,
          };
        }
      }

      const items: unknown[] = [];
      for (const id of ids) {
        try {
          const [vcResp, statusResp] = await Promise.all([
            actaFetchJson({
              network,
              path: '/contracts/vault/get-vc',
              body: { owner: walletAddress, vcId: id },
              schema: getVcResponseSchema,
            }),
            actaFetchJson({
              network,
              path: '/contracts/vault/verify-vc',
              body: { owner: walletAddress, vcId: id },
              schema: verifyVcResponseSchema,
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
        vaultExists: true,
        vcIds: ids,
        vcs: items,
        vcReadError: false,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/VaultNotInitialized/i.test(msg) || /Error\(Contract,\s*#8\)/.test(msg)) {
        return {
          vaultExists: false,
          vcIds: [] as string[],
          vcs: [] as unknown[],
          vcReadError: false,
        };
      }
      return {
        vaultExists: null,
        vcIds: [] as string[],
        vcs: [] as unknown[],
        vcReadError: true,
      };
    }
  }, [walletAddress, network, ensureConfig, verifyVaultViaRpc]);

  const dashboardQuery = useQuery<{
    vaultExists: boolean | null;
    vcIds: string[] | null;
    vcs: unknown[] | null;
    vcReadError: boolean;
  }>({
    queryKey: ['vault', 'dashboard', walletAddress, network],
    queryFn: readDashboard,
    enabled: !!walletAddress,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnMount: typeof window !== 'undefined', // Only refetch on mount in client
    refetchOnWindowFocus: typeof window !== 'undefined', // Only refetch on focus in client
    refetchInterval: typeof window !== 'undefined' ? 30_000 : false, // Poll every 30 seconds only on client
  });

  const vaultExists = dashboardQuery.data?.vaultExists ?? null;
  const vcIds = dashboardQuery.data?.vcIds ?? null;
  const vcs = dashboardQuery.data?.vcs ?? null;
  const vcReadError = !!dashboardQuery.data?.vcReadError;

  // Force refetch when wallet address changes (only on client, after mount)
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;

    if (walletAddress) {
      // Use requestAnimationFrame to ensure this runs after React hydration
      const rafId = requestAnimationFrame(() => {
        // Small delay to ensure DOM is fully hydrated
        setTimeout(() => {
          void dashboardQuery.refetch();
        }, 100);
      });
      return () => cancelAnimationFrame(rafId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]); // Only refetch when walletAddress changes

  // Listen for API key creation events to invalidate cache and refetch vault status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleApiKeyCreated = (event: CustomEvent) => {
      const eventNetwork = event.detail?.network;
      // Only refetch if the event is for the current network
      if (!eventNetwork || eventNetwork === network) {
        // Invalidate all vault queries to force fresh check
        queryClient.invalidateQueries({
          queryKey: ['vault', 'dashboard'],
        });
        // Small delay to ensure API key is stored in localStorage
        setTimeout(() => {
          void dashboardQuery.refetch();
        }, 200);
      }
    };

    window.addEventListener('acta-api-key-created', handleApiKeyCreated as EventListener);
    return () => {
      window.removeEventListener('acta-api-key-created', handleApiKeyCreated as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, queryClient]);

  return {
    dashboardStatus: dashboardQuery.status,
    loading,

    // writes
    createVault,
    createSponsoredVault,
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

    // refetch
    refetchDashboard: dashboardQuery.refetch,
  };
}
