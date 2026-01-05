'use client';

/**
 * ACTA API client helpers.
 *
 * The backend enforces API key authentication for all endpoints except:
 * - GET /health
 * - POST /testnet/public/api-keys
 * - POST /mainnet/public/api-keys
 */

export type ActaNetwork = 'testnet' | 'mainnet';

const STORAGE_KEY_PREFIX = 'acta_api_key';

export function getActaApiBaseUrl(network: ActaNetwork): string {
  // Allow overriding the API base URL in env for local dev.
  const envKey =
    network === 'mainnet'
      ? process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_MAINNET
      : process.env.NEXT_PUBLIC_ACTA_API_BASE_URL_TESTNET;

  if (envKey && typeof envKey === 'string' && envKey.trim())
    return envKey.trim().replace(/\/$/, '');

  return network === 'mainnet'
    ? 'https://acta.build/api/mainnet'
    : 'https://acta.build/api/testnet';
}

export function getStoredApiKey(network: ActaNetwork): string {
  try {
    const v = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${network}`);
    return v ? String(v) : '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(network: ActaNetwork, apiKey: string): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:${network}`, apiKey);
  } catch {
    // ignore
  }
}

export async function actaFetchJson<T>(params: {
  network: ActaNetwork;
  path: string;
  method?: 'GET' | 'POST';
  apiKey?: string;
  body?: unknown;
}): Promise<T> {
  const baseUrl = getActaApiBaseUrl(params.network);
  const url = `${baseUrl}${params.path.startsWith('/') ? '' : '/'}${params.path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (params.apiKey) {
    headers['X-ACTA-Key'] = params.apiKey;
  }

  const resp = await fetch(url, {
    method: params.method || 'POST',
    headers,
    body: params.body !== undefined ? JSON.stringify(params.body) : undefined,
  });

  const json: unknown = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg =
      typeof json === 'object' &&
      json !== null &&
      'message' in json &&
      typeof (json as { message?: unknown }).message === 'string'
        ? String((json as { message?: unknown }).message)
        : `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return json as T;
}
