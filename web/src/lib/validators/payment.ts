import { z } from 'zod';
import { isValidCode, paymentCodeMap } from '@/lib/constants/lhdn';

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.string()
    .refine(val => !val || isValidCode(val, paymentCodeMap), 'Invalid payment method')
    .optional()
    .or(z.literal('')),
  referenceNumber: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
