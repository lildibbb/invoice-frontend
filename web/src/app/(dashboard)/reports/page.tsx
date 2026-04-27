'use client';

import { useMemo } from 'react';
import {
  DollarSign,
  FileText,
  Users,
  AlertCircle,
  Download,
  Shield,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { formatCurrency } from '@/lib/utils';
import { useAnalytics, useRevenueReport, useLhdnReport } from '@/lib/queries/reports';

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { data: analytics, isLoading: loadingAnalytics } = useAnalytics();
  const { data: revenue, isLoading: loadingRevenue } = useRevenueReport();
  const { data: lhdnReport, isLoading: loadingLhdn } = useLhdnReport();
  const lhdnData = lhdnReport as any;

  const revenueData = useMemo(() => {
    if (!revenue) return [];
    if (Array.isArray(revenue)) return revenue;
    if ((revenue as any)?.data && Array.isArray((revenue as any).data)) return (revenue as any).data;
    return [];
  }, [revenue]);

  const statusData = useMemo(() => {
    if (!analytics) return [];
    const s = analytics as any;
    const map: Record<string, number> = {};
    if (s.statusBreakdown) {
      Object.entries(s.statusBreakdown).forEach(([key, val]) => {
        map[key] = Number(val) || 0;
      });
    } else {
      if (s.paidInvoices != null) map['Paid'] = Number(s.paidInvoices);
      if (s.pendingInvoices != null) map['Pending'] = Number(s.pendingInvoices);
      if (s.overdueInvoices != null) map['Overdue'] = Number(s.overdueInvoices);
      if (s.draftInvoices != null) map['Draft'] = Number(s.draftInvoices);
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [analytics]);

  const stats = analytics as any;

  const handleExport = (format: string) => {
    const url = `/api/v1/analytics/export?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        description="Overview of business analytics and performance"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('xlsx')}>
              <Download className="mr-2 h-4 w-4" /> XLSX
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      {loadingAnalytics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenue"
            value={formatCurrency(stats?.totalRevenue ?? stats?.revenue ?? 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Invoices"
            value={String(stats?.totalInvoices ?? stats?.invoiceCount ?? 0)}
            icon={FileText}
          />
          <StatCard
            title="Customers"
            value={String(stats?.totalCustomers ?? stats?.customerCount ?? 0)}
            icon={Users}
          />
          <StatCard
            title="Outstanding"
            value={formatCurrency(stats?.totalOutstanding ?? stats?.outstanding ?? 0)}
            icon={AlertCircle}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRevenue ? (
              <Skeleton className="h-72 w-full" />
            ) : revenueData.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnalytics ? (
              <Skeleton className="h-72 w-full" />
            ) : statusData.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-muted-foreground">
                No status data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LHDN Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            LHDN Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLhdn ? (
            <Skeleton className="h-20 w-full" />
          ) : lhdnData ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{lhdnData.submitted ?? 0}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{lhdnData.valid ?? 0}</p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{lhdnData.invalid ?? 0}</p>
                <p className="text-sm text-muted-foreground">Invalid</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{lhdnData.pending ?? 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No LHDN data available</p>
          )}
        </CardContent>
      </Card>
    </div>
    </RoleGuard>
  );
}
