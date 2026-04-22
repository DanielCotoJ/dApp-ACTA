import type { ActaNetwork } from '@/lib/actaApi';
import type { PublicApiKeyRecord } from '@/lib/schemas/api-keys';

const STORAGE_PREFIX = 'acta_api_key_registry:';

export type ApiKeyRegistryEntry = {
  wallet_address: string;
  record: PublicApiKeyRecord;
  keyPreview: { prefix: string; suffix: string };
};

function storageKey(network: ActaNetwork) {
  return `${STORAGE_PREFIX}${network}`;
}

export function getApiKeyRegistry(network: ActaNetwork): ApiKeyRegistryEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(network));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRegistryEntry);
  } catch {
    return [];
  }
}

function isRegistryEntry(x: unknown): x is ApiKeyRegistryEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  const rec = o.record;
  if (!rec || typeof rec !== 'object') return false;
  const r = rec as Record<string, unknown>;
  const preview = o.keyPreview;
  if (!preview || typeof preview !== 'object') return false;
  const p = preview as Record<string, unknown>;
  return (
    typeof o.wallet_address === 'string' &&
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.role === 'string' &&
    typeof r.is_active === 'boolean' &&
    (r.expires_at === null || typeof r.expires_at === 'string') &&
    typeof r.created_at === 'string' &&
    typeof p.prefix === 'string' &&
    typeof p.suffix === 'string'
  );
}

export function upsertApiKeyRegistryEntry(
  network: ActaNetwork,
  walletAddress: string,
  record: PublicApiKeyRecord,
  fullKey: string,
): void {
  const prefix = fullKey.slice(0, 6);
  const suffix = fullKey.slice(-4);
  const prev = getApiKeyRegistry(network).filter((e) => e.record.id !== record.id);
  const next: ApiKeyRegistryEntry[] = [
    {
      wallet_address: walletAddress,
      record,
      keyPreview: { prefix, suffix },
    },
    ...prev,
  ];
  try {
    localStorage.setItem(storageKey(network), JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}

export function keyMatchesPreview(
  fullKey: string,
  preview: { prefix: string; suffix: string },
): boolean {
  if (!fullKey || fullKey.length < preview.prefix.length + preview.suffix.length) return false;
  return fullKey.startsWith(preview.prefix) && fullKey.endsWith(preview.suffix);
}
