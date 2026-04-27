import { z } from 'zod';

export const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;

const recurringItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be 0 or greater'),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discount: z.coerce.number().min(0).optional().default(0),
});

export const createRecurringSchema = z.object({
  customerUuid: z.string().min(1, 'Customer is required'),
  frequency: z.enum(FREQUENCIES, { required_error: 'Frequency is required' }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  items: z.array(recurringItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional().or(z.literal('')),
  termsAndConditions: z.string().optional().or(z.literal('')),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
