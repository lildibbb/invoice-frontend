import { z } from 'zod';

export const invoiceTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255),
  description: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
});

export type InvoiceTemplateInput = z.infer<typeof invoiceTemplateSchema>;
