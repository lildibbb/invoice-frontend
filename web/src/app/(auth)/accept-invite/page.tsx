'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useAcceptInvite } from '@/lib/queries/invites';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormPasswordInput } from '@/components/forms';
import { acceptInviteSchema, type AcceptInviteInput } from '@/lib/validators/auth';

type AcceptInviteFormValues = AcceptInviteInput;

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const mutation = useAcceptInvite();

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: AcceptInviteFormValues) => {
    if (!token) return;
    try {
      await mutation.mutateAsync({ token, password: values.password });
    } catch {
      // error is available via mutation.error
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Invalid invitation</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            This invitation link is missing or invalid.
          </p>
        </div>
        <div className="rounded-xl bg-red-50 border-0 shadow-sm px-4 py-3 text-sm text-red-700">
          Invalid or missing invitation token.
        </div>
        <Link
          href="/login"
          className="block w-full h-11 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">You&apos;re all set!</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Your password has been set. You can now sign in to your account.
            </p>
          </div>
        </div>
        <Button
          className="w-full h-11 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm"
          asChild
        >
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Set your password</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Create a password to complete your account setup.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormPasswordInput name="password" label="Password" showStrength />
          <FormPasswordInput name="confirmPassword" label="Confirm Password" />

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
                Setting password...
              </span>
            ) : (
              'Set password & sign in'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400 text-sm">Loading...</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
