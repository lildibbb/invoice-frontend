'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useResetPassword } from '@/lib/queries/auth';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormPasswordInput } from '@/components/forms/form-password-input';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .regex(
        PASSWORD_REGEX,
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const mutation = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      return;
    }

    try {
      await mutation.mutateAsync({ token, password: values.password });
      toast.success('Password reset successfully. Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      toast.error(mutation.error?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Set new password</h1>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your new password below. Make sure it meets all the requirements.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormPasswordInput
            name="password"
            label="New Password"
            placeholder="Enter new password"
            showStrength
          />

          <FormPasswordInput
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm new password"
          />

          {mutation.error && (
            <div className="rounded-xl bg-red-50 border-0 shadow-sm px-4 py-3 text-sm text-red-700">
              {mutation.error.message || 'Something went wrong. Please try again.'}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-all duration-150"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </span>
            ) : (
              'Reset password'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
