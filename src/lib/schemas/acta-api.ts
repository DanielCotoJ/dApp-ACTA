import { z } from 'zod';
import { networkSchema, stellarAddressSchema } from './primitives';

/**
 * Response schemas stay permissive on purpose: the backend is the source of
 * truth for these shapes and we do not want a stricter-than-needed validation
 * to break wallet/signing flows when a field comes back empty. We still lock
 * down the shape — strings must be strings — but we don't enforce `min(1)`.
 */
export const apiConfigSchema = z
  .object({
    rpcUrl: z.string(),
    networkPassphrase: z.string(),
    actaContractId: z.string(),
  })
  .passthrough();
export type ApiConfig = z.infer<typeof apiConfigSchema>;

export const txPrepareResponseSchema = z
  .object({
    xdr: z.string(),
    network: z.string().optional().default(''),
  })
  .passthrough();
export type TxPrepareResponse = z.infer<typeof txPrepareResponseSchema>;

export const txSubmitResponseSchema = z
  .object({
    tx_id: z.string(),
  })
  .passthrough();
export type TxSubmitResponse = z.infer<typeof txSubmitResponseSchema>;

export const listVcIdsResponseSchema = z
  .object({
    result: z.array(z.string()).optional().default([]),
  })
  .passthrough();

export const getVcResponseSchema = z
  .object({
    result: z.unknown(),
  })
  .passthrough();

export const verifyVcResponseSchema = z
  .object({
    status: z.string(),
    since: z.string().optional(),
  })
  .passthrough();

export const apiErrorSchema = z
  .object({
    message: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

export const verifyIssuanceCodeRequestSchema = z.object({
  code: z.string().trim().min(1, 'Issuance code is required.'),
  adminApiKey: z.string().trim().min(1, 'Admin API key is required.'),
  network: networkSchema.optional(),
});
export type VerifyIssuanceCodeRequest = z.infer<typeof verifyIssuanceCodeRequestSchema>;

export const verifyIssuanceCodeResponseSchema = z.object({
  valid: z.boolean().optional(),
  error: z.string().optional(),
});

export const createApiKeyPayloadSchema = z.object({
  name: z.string().trim().min(1).optional(),
  wallet_address: stellarAddressSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateApiKeyPayload = z.infer<typeof createApiKeyPayloadSchema>;
