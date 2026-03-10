/**
 * Notification types supported by the ACTA Notifications API.
 */
export type NotificationType =
  | 'credential_received'
  | 'credential_verified'
  | 'credential_expiring_soon'
  | 'credential_revoked'
  | 'issuer_authorized'
  | 'issuer_revoked';

/** Canonical English label for each notification type. */
export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  credential_received: 'New Credential Received',
  credential_verified: 'Credential Verified',
  credential_expiring_soon: 'Credential Expiring Soon',
  credential_revoked: 'Credential Revoked',
  issuer_authorized: 'Issuer Authorized',
  issuer_revoked: 'Issuer Authorization Revoked',
};

export interface NotificationMetadata {
  vc_id?: string;
  issuer?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  wallet_address: string;
  network: 'mainnet' | 'testnet';
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  read_at: string | null;
  created_at: string;
}
