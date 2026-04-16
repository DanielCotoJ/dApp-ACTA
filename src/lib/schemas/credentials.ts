import { z } from 'zod';
import { isoDateStringSchema } from './primitives';

export const mockCredentialSchema = z.object({
  '@context': z.array(z.string()),
  type: z.array(z.string()),
  issuer: z.string().min(1),
  issuanceDate: isoDateStringSchema,
  expirationDate: isoDateStringSchema.optional(),
  credentialSubject: z.object({ id: z.string().min(1) }).catchall(z.unknown()),
});
export type MockCredential = z.infer<typeof mockCredentialSchema>;

export const credentialStatusSchema = z.enum(['valid', 'expired', 'revoked']);

/**
 * VC payloads coming back from the vault are produced by many issuers and
 * carry dynamic fields — we keep the schema loose but still guard the core
 * fields the UI needs to render safely.
 */
export const credentialSchema = z
  .object({
    id: z.string().min(1),
    title: z.string(),
    issuer: z.string(),
    issuerName: z.string().optional(),
    issuerDid: z.string().optional(),
    subject: z.string(),
    type: z.string(),
    issuedAt: z.string(),
    expirationDate: z.string().nullable(),
    status: credentialStatusSchema,
    birthDate: z.string().optional(),
    raw: z.unknown().optional(),
    vaultRecord: z.unknown().optional(),
  })
  .catchall(z.unknown());
export type Credential = z.infer<typeof credentialSchema>;

export const credentialVerifyPropsSchema = z.object({
  vcId: z.string().min(1),
  status: z.string().nullable().optional(),
  since: z.string().nullable().optional(),
  revealed: z.record(z.string(), z.unknown()).nullable().optional(),
});

/**
 * Parses a free-form attributes JSON string into a record. Used by the mock
 * credential builder and any form that asks the user for JSON input.
 */
export const attributesJsonSchema = z.string().transform((raw, ctx) => {
  const trimmed = (raw || '').trim() || '{}';
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Attributes must be a JSON object',
      });
      return z.NEVER;
    }
    return parsed as Record<string, unknown>;
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'Attributes JSON is not valid',
    });
    return z.NEVER;
  }
});
