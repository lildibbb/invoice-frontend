import { z } from 'zod';

const quotationItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be 0 or greater'),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discount: z.coerce.number().min(0).optional().default(0),
});

export const createQuotationSchema = z.object({
  customerUuid: z.string().uuid('Invalid customer').optional().or(z.literal('')),
  validUntil: z.string().optional().or(z.literal('')),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional().or(z.literal('')),
  termsAndConditions: z.string().optional().or(z.literal('')),
});

export const updateQuotationSchema = createQuotationSchema.partial();

export type CreateQuotationInput = z.input<typeof createQuotationSchema>;
export type CreateQuotationOutput = z.infer<typeof createQuotationSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
