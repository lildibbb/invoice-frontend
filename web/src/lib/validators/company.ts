import { z } from 'zod';
import { isValidCode, msicCodeMap, countryCodeMap } from '@/lib/constants/lhdn';

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255),
  tin: z.string().min(1, 'TIN is required').max(50),
  brn: z.string().min(1, 'BRN is required').max(50),
  msicCode: z.string().max(5)
    .refine(val => !val || isValidCode(val, msicCodeMap), 'Invalid MSIC code')
    .optional()
    .or(z.literal('')),
  businessActivityDesc: z.string().max(255).optional().or(z.literal('')),
  sstRegistrationNumber: z.string().max(20).optional().or(z.literal('')),
  tourismTaxRegistration: z.string().max(20).optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z.string().min(1, 'Email is required').email('Invalid email').max(255),
  bankAccountNumber: z.string().max(150).optional().or(z.literal('')),
  bankName: z.string().max(100).optional().or(z.literal('')),
  addressLine1: z.string().min(1, 'Address is required').max(255),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  postalCode: z.string().min(1, 'Postal code is required').max(10),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  country: z.string().min(1, 'Country is required').length(3, 'Country code must be 3 characters')
    .refine(val => isValidCode(val, countryCodeMap), 'Invalid country code'),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
