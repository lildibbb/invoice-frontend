'use client';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole } from '@/lib/types/roles';
import { useCompanyStats } from '@/lib/queries/settings';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import {
  CreditCard, Zap, Users, HardDrive, FileText,
  Calendar, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function BillingPage() {
  const { data: stats, isLoading } = useCompanyStats();

  // Extract data — handle different response shapes
  const subscription = (stats as any)?.subscription;
  const plan = subscription?.plan;
  const usage = {
    invoices: (stats as any)?.invoiceCount ?? subscription?.invoiceCountThisMonth ?? 0,
    maxInvoices: plan?.maxInvoicesPerMonth ?? 50,
    users: (stats as any)?.memberCount ?? 1,
    maxUsers: plan?.maxUsers ?? 3,
    storage: parseFloat(subscription?.storageUsedGb ?? 0),
    maxStorage: plan?.maxStorageGb ?? 1,
  };

  const planName = plan?.name ?? 'Free Plan';
  const planPrice = plan?.price ?? 0;
  const subStatus = subscription?.status ?? 'ACTIVE';
  const periodEnd = subscription?.currentPeriodEnd;

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <PageHeader title="Billing & Subscription" description="Manage your plan and usage" />

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-400" />
                Current Plan
              </CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </div>
            {!isLoading && <StatusBadge status={subStatus} />}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-[#0F172A]">{planName}</h3>
                  {planPrice > 0 && (
                    <span className="text-sm text-slate-500">RM {planPrice}/mo</span>
                  )}
                </div>
                {periodEnd && (
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Renews on {formatDate(periodEnd)}
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" className="gap-1.5">
                Upgrade Plan
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FileText,
            label: 'Invoices This Month',
            used: usage.invoices,
            max: usage.maxInvoices,
            color: 'text-blue-600',
          },
          {
            icon: Users,
            label: 'Team Members',
            used: usage.users,
            max: usage.maxUsers,
            color: 'text-emerald-600',
          },
          {
            icon: HardDrive,
            label: 'Storage Used',
            used: usage.storage,
            max: usage.maxStorage,
            unit: 'GB',
            color: 'text-violet-600',
          },
        ].map(({ icon: Icon, label, used, max, unit = '', color }) => {
          const pct = max > 0 ? Math.min(Math.round((used / max) * 100), 100) : 0;
          const isNearLimit = pct >= 80;
          return (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${color}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-[#0F172A]">
                      {used}{unit} <span className="text-base font-normal text-slate-400">/ {max}{unit}</span>
                    </p>
                    <Progress
                      value={pct}
                      className={`mt-2 h-1.5 ${isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
                    />
                    <p className={`text-xs mt-1.5 ${isNearLimit ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                      {pct}% used
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan features */}
      {!isLoading && plan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Plan Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: 'LHDN e-Invoice', enabled: plan.lhdnEnabled },
                { label: 'Advanced Analytics', enabled: plan.analyticsEnabled },
                { label: 'Recurring Invoices', enabled: plan.recurringInvoicesEnabled },
                { label: 'Invoice Templates', enabled: plan.templatesEnabled },
                { label: 'Quotations', enabled: plan.quotationsEnabled },
              ].map(({ label, enabled }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <CheckCircle2 className={`h-4 w-4 ${enabled ? 'text-emerald-500' : 'text-slate-200'}`} />
                  <span className={`text-sm ${enabled ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </RoleGuard>
  );
}
