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

/** Canonical English copy for each notification type. */
export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, { title: string; message: string }> =
  {
    credential_received: {
      title: 'New Credential Received',
      message: 'You have received a new verifiable credential in your vault.',
    },
    credential_verified: {
      title: 'Credential Verified',
      message: 'Your credential has been successfully verified.',
    },
    credential_expiring_soon: {
      title: 'Credential Expiring Soon',
      message: 'One of your credentials is expiring soon. Review it in your vault.',
    },
    credential_revoked: {
      title: 'Credential Revoked',
      message: 'One of your credentials has been revoked.',
    },
    issuer_authorized: {
      title: 'Issuer Authorized',
      message: 'A new issuer has been authorized for your vault.',
    },
    issuer_revoked: {
      title: 'Issuer Authorization Revoked',
      message: 'An issuer authorization has been removed from your vault.',
    },
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
