import { z } from 'zod';

export const vaultItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  username: z.string(),
  password: z.string(),
  url: z.string().optional(),
  category: z.string().min(1),
  createdAt: z.date(),
  status: z.string().optional(),
});
export type VaultItem = z.infer<typeof vaultItemSchema>;
