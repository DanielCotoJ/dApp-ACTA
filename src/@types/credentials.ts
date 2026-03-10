export type MockCredential = {
  '@context': string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: { id: string } & Record<string, unknown>;
};

export type Credential = {
  id: string;
  title: string;
  issuer: string;
  issuerName?: string;
  issuerDid?: string;
  subject: string;
  type: string;
  issuedAt: string;
  expirationDate: string | null;
  status: 'valid' | 'expired' | 'revoked';
  birthDate?: string;
  /**
   * Full VC payload (decoded from the vault record `data` field when possible).
   * This is what you want when "viewing credential content".
   */
  raw?: unknown;
  /**
   * Raw vault record returned by the API (`/contracts/vault/get-vc` + status merge).
   */
  vaultRecord?: unknown;
  [key: string]: unknown;
};

export type CredentialVerifyProps = {
  vcId: string;
  status?: string | null;
  since?: string | null;
  revealed?: Record<string, unknown> | null;
};

export type CredentialCardProps = {
  name: string;
  category: string;
  wallet: string;
  url?: string;
  status?: string;
  onCopy?: (text: string, label: string) => void;
  onShare?: () => void;
  onRevoke?: () => void;
  onView?: () => void;
};
