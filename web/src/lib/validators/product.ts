import { z } from 'zod';
import { isValidCode, classificationCodeMap, unitMeasureCodeMap, countryCodeMap } from '@/lib/constants/lhdn';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  classificationCode: z.string().length(3, 'Classification code must be 3 characters')
    .refine(val => !val || isValidCode(val, classificationCodeMap), 'Invalid LHDN classification code')
    .optional()
    .or(z.literal('')),
  productTariffCode: z.string().max(20).optional().or(z.literal('')),
  countryOfOrigin: z.string().length(3, 'Country code must be 3 characters')
    .refine(val => !val || isValidCode(val, countryCodeMap), 'Invalid country code')
    .optional()
    .default('MYS'),
  unitOfMeasureCode: z.string().max(3)
    .refine(val => !val || isValidCode(val, unitMeasureCodeMap), 'Invalid unit of measure code')
    .optional()
    .or(z.literal('')),
  inStock: z.coerce.number().int().min(0).optional(),
  taxCategoryUuid: z.string().optional().or(z.literal('')),
  isTaxExempt: z.boolean().optional().default(false),
  taxExemptionReason: z.string().max(255).optional().or(z.literal('')),
});

// Separate base object for .partial() and zodResolver — refine wraps into ZodEffects which doesn't support .partial()
export const productBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  classificationCode: z.string().max(3).optional().or(z.literal('')),
  productTariffCode: z.string().max(20).optional().or(z.literal('')),
  countryOfOrigin: z.string().max(3).optional().or(z.literal('')),
  unitOfMeasureCode: z.string().max(3).optional().or(z.literal('')),
  inStock: z.coerce.number().int().min(0).optional(),
  taxCategoryUuid: z.string().optional().or(z.literal('')),
  isTaxExempt: z.boolean().optional().default(false),
  taxExemptionReason: z.string().max(255).optional().or(z.literal('')),
});

export const createProductSchemaWithRefine = createProductSchema.refine(data => {
  if (data.isTaxExempt && !data.taxExemptionReason) return false;
  return true;
}, {
  message: 'Tax exemption reason is required when product is tax exempt',
  path: ['taxExemptionReason'],
});

export const updateProductSchema = productBaseSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductBaseInput = z.input<typeof productBaseSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
