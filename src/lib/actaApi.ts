'use client';

import type { ZodType } from 'zod';
import { apiErrorSchema, apiConfigSchema } from './schemas/acta-api';
import { networkSchema } from './schemas/primitives';
import { apiKeyInputSchema } from './schemas/api-keys';

/**
 * ACTA API client helpers.
 *
 * The backend enforces API key authentication for all endpoints except:
 * - GET /health
 * - POST /public/api-keys
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
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${network}`);
    if (raw == null) return '';
    const parsed = apiKeyInputSchema.safeParse(raw);
    return parsed.success ? parsed.data : '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(network: ActaNetwork, apiKey: string): void {
  const parsedNetwork = networkSchema.safeParse(network);
  const parsedKey = apiKeyInputSchema.safeParse(apiKey);
  if (!parsedNetwork.success || !parsedKey.success) return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}:${parsedNetwork.data}`, parsedKey.data);
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
  /**
   * Optional zod schema. When provided, the JSON response is parsed through it
   * so callers get validated data instead of an untrusted `unknown` cast.
   */
  schema?: ZodType<T>;
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
    const parsed = apiErrorSchema.safeParse(json);
    const msg = parsed.success && parsed.data.message ? parsed.data.message : `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  if (params.schema) {
    const result = params.schema.safeParse(json);
    if (!result.success) {
      throw new Error(
        `Invalid response from ${params.path}: ${result.error.issues
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .join('; ')}`
      );
    }
    return result.data;
  }

  return json as T;
}

/**
 * Validates if an API key exists and is valid by calling the /config endpoint
 * This endpoint requires authentication, so if it succeeds, the API key is valid
 */
export async function validateApiKey(
  apiKey: string,
  network: ActaNetwork
): Promise<{ valid: boolean; error?: string }> {
  const parsedKey = apiKeyInputSchema.safeParse(apiKey);
  if (!parsedKey.success) {
    return { valid: false, error: parsedKey.error.issues[0]?.message ?? 'API key is required' };
  }

  try {
    await actaFetchJson({
      network,
      apiKey: parsedKey.data,
      method: 'GET',
      path: '/config',
      schema: apiConfigSchema,
    });
    return { valid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('unauthorized') || errorMessage.includes('Invalid')) {
      return { valid: false, error: 'Invalid or inactive API key' };
    }
    return { valid: false, error: errorMessage };
  }
}
