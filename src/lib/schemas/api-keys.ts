import { z } from 'zod';

export const publicApiKeyRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  role: z.literal('standard'),
  is_active: z.boolean(),
  expires_at: z.string().nullable(),
  created_at: z.string(),
});
export type PublicApiKeyRecord = z.infer<typeof publicApiKeyRecordSchema>;

export const publicApiKeyResponseSchema = z.object({
  message: z.string(),
  api_key: z.string().min(1, 'API key is required'),
  api_key_record: publicApiKeyRecordSchema,
});
export type PublicApiKeyResponse = z.infer<typeof publicApiKeyResponseSchema>;

/**
 * Guard for manually-entered API keys: must be non-empty after trimming.
 * Backend issues its own format; we stay lenient on shape while still filtering blank input.
 */
export const apiKeyInputSchema = z.string().trim().min(1, 'API key is required');
