import { z } from 'zod';
import { networkSchema, stellarAddressSchema } from './primitives';

export const apiConfigSchema = z.object({
  rpcUrl: z.string().min(1),
  networkPassphrase: z.string().min(1),
  actaContractId: z.string().min(1),
});
export type ApiConfig = z.infer<typeof apiConfigSchema>;

export const txPrepareResponseSchema = z.object({
  xdr: z.string().min(1),
  network: z.string().min(1),
});
export type TxPrepareResponse = z.infer<typeof txPrepareResponseSchema>;

export const txSubmitResponseSchema = z.object({
  tx_id: z.string().min(1),
});
export type TxSubmitResponse = z.infer<typeof txSubmitResponseSchema>;

export const listVcIdsResponseSchema = z.object({
  result: z.array(z.string()),
});

export const getVcResponseSchema = z.object({
  result: z.unknown(),
});

export const verifyVcResponseSchema = z.object({
  status: z.string(),
  since: z.string().optional(),
});

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
