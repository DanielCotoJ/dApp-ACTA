import { z } from 'zod';

export const networkSchema = z.enum(['testnet', 'mainnet']);
export type NetworkInput = z.infer<typeof networkSchema>;

export const stellarAddressSchema = z
  .string()
  .regex(/^G[0-9A-Za-z]{55}$/u, 'Must be a valid Stellar address (G..., 56 characters)');

export const didSchema = z.string().regex(/^did:[a-z0-9]+:[^\s]+$/iu, 'Must be a valid DID URI');

export const stellarOrDidSchema = z.union([stellarAddressSchema, didSchema]);

export const nonEmptyTrimmedString = z.string().trim().min(1, 'Value cannot be empty');

export const isoDateStringSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Must be a valid ISO date string');

export const httpUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine((v) => /^https?:\/\//iu.test(v), 'URL must use http or https');
