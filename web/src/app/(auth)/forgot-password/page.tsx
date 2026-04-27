'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { useForgotPassword } from '@/lib/queries/auth';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/forms';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators/auth';

type ForgotFormValues = ForgotPasswordInput;

export default function ForgotPasswordPage() {
  const mutation = useForgotPassword();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch {
      // error is available via mutation.error
    }
  };

  if (mutation.isSuccess) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <MailCheck className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Check your inbox</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              If an account exists for that email, a password reset link has been sent.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-[#0F172A]">Reset your password</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput name="email" label="Email" type="email" placeholder="Enter your email" />

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
                Sending...
              </span>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
