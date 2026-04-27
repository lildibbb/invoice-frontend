'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { useCustomer } from '@/lib/queries/customers';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const router = useRouter();
  const { data: customer, isLoading } = useCustomer(uuid);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium">Customer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const invoices = customer.invoices ?? [];
  const payments = customer.payments ?? [];
  const totalInvoiced = invoices.reduce(
    (s: number, i: any) => s + (i.totalAmount ?? i.amount ?? 0),
    0
  );
  const totalPaid = payments.reduce(
    (s: number, p: any) => s + (p.amount ?? 0),
    0
  );
  const outstanding = totalInvoiced - totalPaid;

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title={customer.name ?? 'Customer'}
        actions={
          <Button variant="outline" onClick={() => router.push('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {getInitials(customer.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{customer.name}</h2>
                  <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                    {customer.status ?? 'active'}
                  </Badge>
                </div>
                {customer.company && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {customer.company}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-wrap gap-6">
            {customer.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </div>
            )}
            {(customer.addressLine1 || customer.address) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {customer.addressLine1 ?? customer.address}
              </div>
            )}
            {customer.createdAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member since {formatDate(customer.createdAt)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(totalInvoiced)}
          icon={Building}
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={Building}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Building}
        />
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No invoices yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Invoice #</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.uuid ?? inv.id} className="last:border-0">
                      <td className="py-3 font-medium">
                        {inv.invoiceNo ?? inv.number}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(inv.issueDate ?? inv.date)}
                      </td>
                      <td className="py-3">
                        {formatCurrency(inv.totalAmount ?? inv.amount)}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline">{inv.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </RoleGuard>
  );
}

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
