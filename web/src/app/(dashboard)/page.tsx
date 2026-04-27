'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { RoleGuard } from '@/components/role-guard';
import { MembershipRole, GlobalRole } from '@/lib/types/roles';
import {
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  useDashboardStats,
  useMonthlyRevenue,
  useAgingReport,
  useRecentInvoices,
} from '@/lib/queries/dashboard';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: monthlyRevenue, isLoading: revenueLoading } = useMonthlyRevenue();
  const { data: agingData, isLoading: agingLoading } = useAgingReport();
  const { data: recentData, isLoading: recentLoading } = useRecentInvoices();

  const revenueChartData = useMemo(() => {
    const items = Array.isArray(monthlyRevenue) ? monthlyRevenue : [];
    return items.map((m: any) => ({
      month: m.month ?? m.label ?? '',
      revenue: m.revenue ?? m.amount ?? 0,
    }));
  }, [monthlyRevenue]);

  const agingChartData = useMemo(() => {
    if (!agingData) return [];
    if (Array.isArray(agingData)) return agingData;
    const buckets = agingData.buckets ?? agingData.data ?? [];
    if (Array.isArray(buckets)) return buckets;
    return Object.entries(agingData)
      .filter(([k]) => k !== 'total')
      .map(([label, value]) => ({
        label,
        amount: typeof value === 'number' ? value : (value as any)?.amount ?? 0,
      }));
  }, [agingData]);

  const recentInvoices = useMemo(() => {
    const list = Array.isArray(recentData)
      ? recentData
      : recentData?.data ?? [];
    return list.slice(0, 5).map((inv: any) => ({
      uuid: inv.uuid ?? '',
      number: inv.invoiceNo ?? inv.number ?? '',
      customer: inv.customer?.name ?? inv.customerName ?? '',
      amount: inv.totalAmount ?? inv.amount ?? 0,
      dueDate: inv.dueDate ?? '',
      status: (inv.status ?? 'DRAFT').toUpperCase(),
    }));
  }, [recentData]);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <RoleGuard roles={[MembershipRole.ADMIN, MembershipRole.STAFF, GlobalRole.SUPER_ADMIN]}>
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your invoices today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button size="sm" asChild className="gap-1.5">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild className="gap-1.5">
          <Link href="/customers">
            <Users className="h-4 w-4" />
            Add Customer
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild className="gap-1.5">
          <Link href="/quotations">
            <FileText className="h-4 w-4" />
            New Quote
          </Link>
        </Button>
      </div>

      {/* KPI Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 animate-stagger">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Revenue"
              value={formatCurrency(stats?.totalRevenue ?? 0)}
              icon={DollarSign}
              accentColor="gradient-blue"
              trend={
                stats?.revenueGrowth
                  ? {
                      value: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%`,
                      positive: stats.revenueGrowth > 0,
                    }
                  : undefined
              }
            />
            <StatCard
              title="Outstanding"
              value={formatCurrency(stats?.pendingAmount ?? 0)}
              icon={Clock}
              accentColor="gradient-amber"
            />
            <StatCard
              title="Overdue"
              value={`${stats?.overdueInvoices ?? 0}`}
              subtitle={formatCurrency(stats?.overdueAmount ?? 0)}
              icon={AlertTriangle}
              accentColor="gradient-rose"
            />
            <StatCard
              title="Total Invoices"
              value={`${stats?.totalInvoices ?? 0}`}
              icon={FileText}
              accentColor="gradient-emerald"
              trend={
                stats?.invoiceGrowth
                  ? {
                      value: `${stats.invoiceGrowth > 0 ? '+' : ''}${stats.invoiceGrowth}%`,
                      positive: stats.invoiceGrowth > 0,
                    }
                  : undefined
              }
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Revenue Area Chart */}
        <Card className="glass-card border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[15px]">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenueChartData.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="No revenue data"
                description="Revenue trend will appear once invoices are paid."
                className="h-[300px]"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `RM ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Revenue',
                    ]}
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Aging Bar Chart */}
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-[15px]">Invoice Aging</CardTitle>
          </CardHeader>
          <CardContent>
            {agingLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : agingChartData.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No aging data"
                description="Invoice aging will appear once you have outstanding invoices."
                className="h-[300px]"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agingChartData}>
                  <defs>
                    <linearGradient id="agingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `RM ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Amount',
                    ]}
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="url(#agingGradient)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="glass-card border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[15px]">Recent Invoices</CardTitle>
          <Link
            href="/invoices"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <EmptyState
                        icon={FileText}
                        title="No recent invoices"
                        description="Your most recent invoices will appear here."
                        className="py-8"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  recentInvoices.map((inv: any) => (
                    <TableRow key={inv.uuid || inv.number}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${inv.uuid}`}
                          className="text-primary hover:underline"
                        >
                          {inv.number}
                        </Link>
                      </TableCell>
                      <TableCell>{inv.customer}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inv.amount)}
                      </TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </RoleGuard>
  );
}
