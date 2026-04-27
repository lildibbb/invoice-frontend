import { z } from 'zod';
import { isValidCode, classificationCodeMap } from '@/lib/constants/lhdn';

export const invoiceLineItemSchema = z.object({
  productId: z.number().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be positive'),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  classificationCode: z.string().max(3)
    .refine(val => !val || isValidCode(val, classificationCodeMap), 'Invalid LHDN classification code')
    .optional()
    .or(z.literal('')),
});

export const invoiceFormSchema = z.object({
  customerUuid: z.string().min(1, 'Customer is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required')
    .refine(val => {
      const date = new Date(val);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      return date <= maxDate;
    }, 'Invoice date cannot be more than 30 days in the future'),
  dueDate: z.string().min(1, 'Due date is required'),
  currency: z.string().min(1).max(3, 'Currency code must be 3 characters or less').default('MYR'),
  notes: z.string().optional().or(z.literal('')),
  terms: z.string().optional().or(z.literal('')),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one item required'),
});

export type InvoiceFormValues = z.input<typeof invoiceFormSchema>;
export type InvoiceFormOutput = z.infer<typeof invoiceFormSchema>;
export type InvoiceLineItemValues = z.infer<typeof invoiceLineItemSchema>;
