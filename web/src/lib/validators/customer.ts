import { z } from 'zod';
import { isValidCode, stateCodeMap, countryCodeMap } from '@/lib/constants/lhdn';

const TIN_REGEX = /^[A-Z0-9-]+$/;

export const ID_TYPES = ['NRIC', 'PASSPORT', 'BRN', 'ARMY'] as const;

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  email: z.string().min(1, 'Email is required').email('Invalid email').max(255),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be 20 characters or less'),
  tin: z.string().max(50).regex(TIN_REGEX, 'TIN must contain only uppercase letters, numbers, and hyphens').optional().or(z.literal('')),
  idType: z.enum(ID_TYPES).optional(),
  idNumber: z.string().max(50).optional().or(z.literal('')),
  addressLine1: z.string().min(1, 'Address is required').max(255),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  postalCode: z.string().max(5, 'Postal code must be 5 characters or less').optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().length(3, 'Country code must be exactly 3 characters')
    .refine(val => !val || isValidCode(val, countryCodeMap), 'Invalid country code')
    .optional()
    .default('MYS'),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
