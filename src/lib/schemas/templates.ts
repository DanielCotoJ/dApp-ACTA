import { z } from 'zod';

export const templateFieldTypeSchema = z.enum(['text', 'date', 'number', 'email', 'did']);

export const templateFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: templateFieldTypeSchema,
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});
export type TemplateField = z.infer<typeof templateFieldSchema>;

export const credentialTemplateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  vcType: z.string().min(1),
  fields: z.array(templateFieldSchema),
  iconSrc: z.string().optional(),
});
export type CredentialTemplate = z.infer<typeof credentialTemplateSchema>;
