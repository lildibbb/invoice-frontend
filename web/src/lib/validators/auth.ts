import { z } from 'zod';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const acceptInviteSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .regex(PASSWORD_REGEX, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const registerUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string()
    .min(1, 'Password is required')
    .regex(PASSWORD_REGEX, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  token: z.string().min(1, 'Token is required'),
  phoneNumber: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
