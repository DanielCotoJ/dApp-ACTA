import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapContractErrorToMessage(err: unknown): string {
  const raw = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);
  const s = raw || '';

  const codeMatch = s.match(/Error\(Contract,\s*#(\d+)\)/) || s.match(/#(\d+)/);
  const code = codeMatch ? codeMatch[1] : undefined;

  if (code === '1' || /AlreadyInitialized/i.test(s)) {
    return 'Vault already initialized';
  }
  if (code === '2' || /IssuerNotAuthorized/i.test(s)) {
    return 'Issuer not authorized in this vault';
  }
  if (code === '3' || /IssuerAlreadyAuthorized/i.test(s)) {
    return 'Issuer already authorized';
  }
  if (code === '4' || /VaultRevoked/i.test(s)) {
    return 'Vault revoked';
  }
  if (code === '5' || /VCSAlreadyMigrated/i.test(s)) {
    return 'Credentials already migrated';
  }
  if (code === '6' || /VCNotFound/i.test(s)) {
    return 'Credential not found';
  }
  if (code === '7' || /VCAlreadyRevoked/i.test(s)) {
    return 'Credential already revoked';
  }
  if (code === '8' || /VaultNotInitialized/i.test(s)) {
    return 'Vault not initialized';
  }
  if (code === '9' || /NotInitialized/i.test(s)) {
    return 'Contract not initialized';
  }
  if (code === '10' || /InvalidVaultContract/i.test(s)) {
    return 'Invalid vault contract';
  }

  if (/FAILED/i.test(s)) return 'Transaction failed';
  if (/ERROR/i.test(s)) return 'Transaction error';
  if (/Please set the wallet first/i.test(s)) return 'Connect your wallet first';

  if (/Connect your wallet first/i.test(s)) return 'Connect your wallet first';
  if (/Signer unavailable/i.test(s)) return 'Signer unavailable';

  if (s.trim()) return `Unexpected error: ${s.trim()}`;

  return 'Unexpected error';
}
