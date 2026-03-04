'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useWalletContext } from '@/providers/wallet.provider';
import { useNetwork } from '@/providers/network.provider';
import { mapContractErrorToMessage } from '@/lib/utils';
import { actaFetchJson } from '@/lib/actaApi';

import { useVault } from '@/components/modules/vault/hooks/use-vault';
import { useActaApiKey } from '@/components/modules/vault/hooks/use-acta-api-key';

import type { CredentialTemplate, TemplateField } from '@/@types/templates';
import type { IssueState } from '@/@types/issue';
import type { MockCredential } from '@/@types/credentials';

type TxPrepareResp = { xdr: string; network: string };

type TxSubmitResp = { tx_id: string };

export function useIssueCredential() {
  const { walletAddress, walletName, signTransaction, walletKit, setWalletInfo } =
    useWalletContext();
  const { network } = useNetwork();

  const queryClient = useQueryClient();

  const { apiKey, setApiKey } = useActaApiKey();
  const { vaultExists, createVault, createSponsoredVault, checkSelfAuthorized, authorizeSelf } =
    useVault();

  const [state, setState] = useState<IssueState>({
    template: null,
    vcId: '',
    owner: '',
    values: {},
    issuing: false,
    preview: null,
    error: null,
    txId: null,
  });

  const [issuanceCode, setIssuanceCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('impacta_issuance_code') ?? '';
    }
    return '';
  });
  const [issuanceCodeValid, setIssuanceCodeValid] = useState<boolean | null>(null);

  const handleSetIssuanceCode = useCallback(async (code: string) => {
    setIssuanceCode(code);
    if (typeof window !== 'undefined') {
      if (code.trim()) {
        sessionStorage.setItem('impacta_issuance_code', code);
      } else {
        sessionStorage.removeItem('impacta_issuance_code');
      }
    }
    setIssuanceCodeValid(null);
    if (!code.trim()) return;
    try {
      const res = await fetch('/api/verify-issuance-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await res.json()) as { valid?: boolean };
      setIssuanceCodeValid(data.valid === true);
    } catch {
      setIssuanceCodeValid(false);
    }
  }, []);

  const ownerDid = useMemo(() => {
    return walletAddress
      ? `did:pkh:stellar:${network === 'mainnet' ? 'public' : 'testnet'}:${walletAddress}`
      : undefined;
  }, [walletAddress, network]);

  const generateVcId = () => {
    try {
      return `vc-${crypto.randomUUID()}`;
    } catch {
      return `vc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }
  };

  const selectTemplate = useCallback((tpl: CredentialTemplate) => {
    const newId = generateVcId();
    setState((s) => ({
      ...s,
      template: tpl,
      vcId: newId,
      values: {},
      preview: null,
      error: null,
      txId: null,
    }));
  }, []);

  const setFieldValue = useCallback((key: string, value: string) => {
    setState((s) => ({
      ...s,
      values: { ...s.values, [key]: value },
      error: null,
    }));
  }, []);

  const setOwner = useCallback((owner: string) => {
    setState((s) => ({ ...s, owner: owner.trim(), error: null }));
  }, []);

  const buildPreview = useCallback(() => {
    const tpl = state.template;
    if (!tpl) return null;

    const nowIso = new Date().toISOString();
    const expiration = state.values['expirationDate'] || undefined;
    const hasSubjectField = tpl.fields.some((f) => f.key === 'subject');
    const rawSubject = hasSubjectField ? state.values['subject'] || '' : state.owner.trim();

    const toSubjectDid = (input: string) => {
      if (!input) return '';
      const trimmed = input.trim();
      if (trimmed.startsWith('did:')) return trimmed;
      const env = network === 'mainnet' ? 'public' : 'testnet';
      return `did:pkh:stellar:${env}:${trimmed}`;
    };

    const subjectId = toSubjectDid(rawSubject);

    const credentialSubject: Record<string, string> = { id: subjectId };
    for (const [k, v] of Object.entries(state.values)) {
      if (k === 'subject' || !v) continue;
      credentialSubject[k] = v;
    }

    const vc: Record<string, unknown> = {
      id: state.vcId,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', tpl.vcType],
      issuer: ownerDid || '',
      issuanceDate: state.values['issueDate'] || nowIso,
      expirationDate: expiration,
      credentialSubject,
    };
    if (tpl.id === 'impacta-certificate') {
      vc.issuerName = 'BAF';
      vc.title = 'Impacta Bootcamp Certificate';
    }

    setState((s) => ({ ...s, preview: vc }));
    return vc;
  }, [state.template, state.values, state.owner, ownerDid, network, state.vcId]);

  const validateRequired = useCallback(
    (fields: TemplateField[]) => {
      for (const f of fields) {
        if (f.required && !state.values[f.key]) {
          return `${f.label} is required`;
        }
      }
      return null;
    },
    [state.values]
  );

  const issue = useCallback(async () => {
    if (!walletAddress) throw new Error('Connect your wallet first');
    if (!signTransaction) throw new Error('Signer unavailable');

    const tpl = state.template;
    if (!tpl) throw new Error('Select a template first');

    const isImpactaTpl = tpl.id === 'impacta-certificate';

    if (isImpactaTpl) {
      if (!issuanceCode.trim()) {
        const msg = 'Issuance code is required to issue Impacta certificates.';
        setState((s) => ({ ...s, error: msg }));
        throw new Error(msg);
      }
      const codeRes = await fetch('/api/verify-issuance-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: issuanceCode.trim() }),
      });
      const codeData = (await codeRes.json()) as { valid?: boolean; error?: string };
      if (!codeData.valid) {
        const msg = codeData.error || 'Invalid issuance code.';
        setState((s) => ({ ...s, error: msg }));
        throw new Error(msg);
      }
    }

    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      const msg = 'API key is required to issue via API.';
      setState((s) => ({ ...s, error: msg }));
      throw new Error(msg);
    }

    const requiredErr = validateRequired(tpl.fields);
    if (requiredErr) {
      setState((s) => ({ ...s, error: requiredErr }));
      throw new Error(requiredErr);
    }

    // Sync with the active account from wallet provider.
    let activeAddress = walletAddress;
    try {
      const addr = await walletKit?.getAddress();
      if (addr?.address && addr.address !== walletAddress) {
        await setWalletInfo(addr.address, walletName || 'Wallet');
        activeAddress = addr.address;
      }
    } catch {
      // ignore
    }

    const recipientInput = state.owner.trim();
    const ownerG = recipientInput || activeAddress;

    if (recipientInput) {
      if (!/^G[0-9A-Za-z]{55}$/.test(recipientInput)) {
        const msg = 'Recipient (owner) must be a valid Stellar address (G..., 56 characters).';
        setState((s) => ({ ...s, error: msg }));
        throw new Error(msg);
      }
    }

    const vc = buildPreview() || {};

    setState((s) => ({ ...s, issuing: true, error: null }));

    const issuingToSelf = ownerG === activeAddress;

    try {
      if (issuingToSelf) {
        // Ensure vault exists before issuing to self.
        if (vaultExists === false) {
          try {
            await createVault();
          } catch {
            // ignore (might have been created in another tab)
          }
        }

        // Ensure issuer is authorized in their own vault when issuing to self.
        try {
          const isAuth = await checkSelfAuthorized();
          if (!isAuth) await authorizeSelf();
        } catch {
          // ignore
        }
      }

      // Impacta Bootcamp template: ensure recipient has a vault via sponsored vault (sponsor = issuer, owner = recipient, did = owner DID).
      const isImpactaTemplate = tpl.id === 'impacta-certificate';
      if (isImpactaTemplate && !issuingToSelf && ownerG) {
        const recipientDid = `did:pkh:stellar:${network === 'mainnet' ? 'public' : 'testnet'}:${ownerG}`;
        try {
          await createSponsoredVault({ owner: ownerG, didUri: recipientDid });
        } catch (sponsoredErr: unknown) {
          const msg =
            sponsoredErr && typeof (sponsoredErr as Error).message === 'string'
              ? (sponsoredErr as Error).message
              : String(sponsoredErr);
          // Vault already exists for this owner — continue to issue
          if (/Vault already initialized|AlreadyInitialized|Error\(Contract,\s*#1\)/i.test(msg)) {
            // continue
          } else {
            throw sponsoredErr;
          }
        }
      }

      // When issuing to another (ownerG !== activeAddress), no vault creation or self-auth;
      // the recipient must have a vault; the contract auto-authorizes the issuer on first issuance.

      const ensuredVcId = state.vcId || generateVcId();
      if (!state.vcId) {
        setState((s) => ({ ...s, vcId: ensuredVcId }));
      }

      // Read config from API (auth required).
      const cfg = await actaFetchJson<{ networkPassphrase: string; actaContractId: string }>({
        network,
        apiKey: trimmedApiKey,
        method: 'GET',
        path: '/config',
      });

      // Prepare issuance: owner = recipient (ownerG), issuer = signer (activeAddress).
      const issuerDidLocal = `did:pkh:stellar:${network === 'mainnet' ? 'public' : 'testnet'}:${activeAddress}`;
      const prep = await actaFetchJson<TxPrepareResp>({
        network,
        apiKey: trimmedApiKey,
        path: '/contracts/vc/issue',
        body: {
          owner: ownerG,
          vcId: ensuredVcId,
          vcData: JSON.stringify(vc),
          issuer: activeAddress,
          issuerDid: issuerDidLocal,
          sourcePublicKey: activeAddress,
          contractId: cfg.actaContractId,
        },
      });

      const signedXdr = await signTransaction(prep.xdr, {
        networkPassphrase: prep.network || cfg.networkPassphrase,
      });

      const submit = await actaFetchJson<TxSubmitResp>({
        network,
        apiKey: trimmedApiKey,
        path: '/contracts/vc/issue',
        body: { signedXdr },
      });

      setState((s) => ({ ...s, issuing: false, txId: submit.tx_id }));

      const net = network === 'mainnet' ? 'public' : 'testnet';
      const url = `https://stellar.expert/explorer/${net}/tx/${submit.tx_id}`;

      toast.success('Credential issued', {
        action: {
          label: 'View on Stellar Expert',
          onClick: () => {
            try {
              window.open(url, '_blank');
            } catch {
              // ignore
            }
          },
        },
      });

      // Wait a bit for the transaction to be confirmed on-chain
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Invalidate all vault dashboard queries to ensure fresh data
      // This handles cases where ownerG might differ from walletAddress
      await queryClient.invalidateQueries({
        queryKey: ['vault', 'dashboard'],
      });

      // Also specifically invalidate for both addresses to be safe
      if (ownerG !== walletAddress) {
        await queryClient.invalidateQueries({
          queryKey: ['vault', 'dashboard', walletAddress, network],
        });
      }

      await queryClient.invalidateQueries({
        queryKey: ['vault', 'dashboard', ownerG, network],
      });

      // Force refetch all dashboard queries
      await queryClient.refetchQueries({
        queryKey: ['vault', 'dashboard'],
      });

      return submit;
    } catch (e: unknown) {
      const raw =
        e && typeof e === 'object' && 'message' in (e as Record<string, unknown>)
          ? String((e as Record<string, unknown>).message)
          : String(e);

      let friendly = mapContractErrorToMessage(raw);

      if (/IssuerNotAuthorized|Error\(Contract,\s*#2\)/i.test(raw)) {
        friendly =
          'Issuer not authorized in this vault. Go to Authorize and authorize this wallet as issuer.';
      }

      setState((s) => ({ ...s, issuing: false, error: friendly }));
      toast.error(friendly);
      throw new Error(friendly);
    }
  }, [
    walletAddress,
    walletName,
    walletKit,
    setWalletInfo,
    signTransaction,
    network,
    apiKey,
    state.template,
    state.vcId,
    state.owner,
    validateRequired,
    buildPreview,
    vaultExists,
    createVault,
    createSponsoredVault,
    checkSelfAuthorized,
    authorizeSelf,
    queryClient,
    issuanceCode,
  ]);

  return {
    state,
    apiKey,
    setApiKey,
    ownerDid,
    selectTemplate,
    setFieldValue,
    setOwner,
    buildPreview,
    issue,
    issuanceCode,
    setIssuanceCode: handleSetIssuanceCode,
    issuanceCodeValid,
  };
}

export function buildMockCredential(params: {
  issuer: string;
  subject: string;
  type: string;
  attributesJson: string;
  expires: string;
}): MockCredential {
  let attrs: Record<string, unknown> = {};
  const raw = params.attributesJson || '{}';
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      attrs = parsed as Record<string, unknown>;
    }
  } catch {
    throw new Error('Attributes JSON is not valid');
  }

  return {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', params.type],
    issuer: params.issuer,
    issuanceDate: new Date().toISOString(),
    expirationDate: params.expires || undefined,
    credentialSubject: {
      id: params.subject,
      ...attrs,
    },
  };
}
