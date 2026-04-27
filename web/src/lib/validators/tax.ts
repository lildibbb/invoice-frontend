import { z } from 'zod';

export const taxCategorySchema = z.object({
  code: z.string().min(1, 'Code is required').max(10),
  description: z.string().min(1, 'Description is required').max(255),
});

export const taxRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  rate: z.coerce.number().min(0, 'Rate must be 0 or greater').max(100, 'Rate must be 100 or less'),
  description: z.string().optional().or(z.literal('')),
  code: z.string().optional().or(z.literal('')),
});

export type TaxCategoryInput = z.infer<typeof taxCategorySchema>;
export type TaxRuleInput = z.infer<typeof taxRuleSchema>;
