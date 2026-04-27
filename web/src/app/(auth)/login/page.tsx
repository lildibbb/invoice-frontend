'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Loader2, ChevronRight, AlertCircle, Mail } from 'lucide-react';
import { useLogin } from '@/lib/queries/auth';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput, FormPasswordInput } from '@/components/forms';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import { cn } from '@/lib/utils';

type LoginFormValues = LoginInput;

interface CompanyOption {
  id: number;
  name: string;
  role: string;
  status: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700',
  staff: 'bg-slate-100 text-slate-600',
  owner: 'bg-violet-100 text-violet-700',
  super_admin: 'bg-amber-100 text-amber-700',
};

function CompanyAvatar({ name, suspended }: { name: string; suspended: boolean }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div className={cn(
      'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0',
      suspended ? 'bg-slate-300' : colors[colorIndex]
    )}>
      {initial}
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'company'>('credentials');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [pendingCreds, setPendingCreds] = useState<LoginFormValues | null>(null);
  const [selectingCompanyId, setSelectingCompanyId] = useState<number | null>(null);
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await loginMutation.mutateAsync(values);
      if (!result.success && result.companies) {
        setPendingCreds(values);
        setCompanies(result.companies);
        setStep('company');
      }
    } catch {
      // error handled by loginMutation.error
    }
  };

  const selectCompany = async (company: CompanyOption) => {
    if (company.status === 'SUSPENDED' || !pendingCreds) return;
    setSelectingCompanyId(company.id);
    try {
      await loginMutation.mutateAsync({
        ...pendingCreds,
        companyId: company.id,
      });
    } catch {
      setSelectingCompanyId(null);
    }
  };

  const backToCredentials = () => {
    setStep('credentials');
    setCompanies([]);
    setPendingCreds(null);
    setSelectingCompanyId(null);
    loginMutation.reset();
  };

  if (step === 'company') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <button
            type="button"
            onClick={backToCredentials}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Use a different account
          </button>
          <h1 className="text-2xl font-bold text-[#0F172A]">Select workspace</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            You have access to {companies.length} workspace{companies.length !== 1 ? 's' : ''}. Choose one to continue.
          </p>
        </div>

        <div className="space-y-3 animate-stagger">
          {companies.map((company) => {
            const suspended = company.status === 'SUSPENDED';
            const isLoading = selectingCompanyId === company.id;
            const roleStyle = ROLE_COLORS[company.role?.toLowerCase()] ?? 'bg-slate-100 text-slate-600';

            return (
              <button
                key={company.id}
                type="button"
                disabled={suspended || loginMutation.isPending}
                onClick={() => selectCompany(company)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border-0 text-left transition-all duration-200',
                  suspended
                    ? 'shadow-sm opacity-50 cursor-not-allowed'
                    : 'shadow-sm hover:shadow-xl hover:bg-blue-50/50 hover:scale-[1.02] group',
                  isLoading && 'shadow-lg bg-blue-50 scale-[1.01]'
                )}
              >
                <CompanyAvatar name={company.name} suspended={suspended} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0F172A] truncate">{company.name}</p>
                    {suspended && (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', roleStyle)}>
                      {company.role}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {loginMutation.error && (
          <Alert variant="destructive" className="border-0 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(loginMutation.error as any)?.message || 'Something went wrong. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to your InvoiZ account</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="animate-stagger">
            <div className="relative">
              <div className="absolute left-3 top-[38px] z-10 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <FormInput name="email" label="Email" type="email" placeholder="Enter your email" className="pl-9" />
            </div>

            <div className="space-y-1.5 mt-4">
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <FormPasswordInput name="password" label="Password" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox id="remember" className="border-0 shadow-sm data-[state=checked]:bg-blue-500" />
              <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer select-none">
                Remember me
              </label>
            </div>
          </div>

          {loginMutation.error && (
            <Alert variant="destructive" className="border-0 shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(loginMutation.error as any)?.message || 'Invalid email or password.'}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors duration-200"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>

      {/* Branded divider */}
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-slate-400 font-medium">or</span>
        <Separator className="flex-1" />
      </div>

      <p className="text-center text-xs text-slate-400">
        By signing in, you agree to our{' '}
        <a href="#" className="underline hover:text-slate-600">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>
      </p>
    </div>
  );
}
