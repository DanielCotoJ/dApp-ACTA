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
};

export type CredentialVerifyProps = {
  vcId: string;
  status?: string | null;
  since?: string | null;
  revealed?: Record<string, unknown> | null;
  zkValid?: boolean | null;
  zkStatement?: ZkStatement | null;
  hasVerified?: boolean;
};

export type ZkTypeEqStatement = {
  kind: 'typeEq';
  selectedKeys: string[];
  isValid: boolean;
  typeHash: string;
  expectedHash: string;
  valid: string;
};

export type ZkIsAdultStatement = {
  kind: 'isAdult';
  selectedKeys: string[];
  isAdult: boolean;
};

export type ZkNotExpiredStatement = {
  kind: 'notExpired';
  selectedKeys: string[];
  notExpired: boolean;
};

export type ZkIsValidStatement = {
  kind: 'isValid';
  selectedKeys: string[];
  isValid: boolean;
};

export type ZkStatement =
  | 'none'
  | ZkTypeEqStatement
  | ZkIsAdultStatement
  | ZkNotExpiredStatement
  | ZkIsValidStatement;

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
