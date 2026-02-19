import type { CredentialTemplate } from './templates';

export type IssueState = {
  template: CredentialTemplate | null;
  vcId: string;
  /** Recipient wallet address (G...). Empty = issue to self (connected wallet). */
  owner: string;
  values: Record<string, string>;
  issuing: boolean;
  preview: unknown | null;
  error: string | null;
  txId: string | null;
};
