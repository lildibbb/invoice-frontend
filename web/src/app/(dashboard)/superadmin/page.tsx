'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  MoreHorizontal,
  Clock,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  usePlatformOverview,
  useTopCompanies,
  useTenants,
  useDeleteTenant,
  useRestoreTenant,
  useToggleTenantStatus,
  useCompanyTimeline,
} from '@/lib/queries/superadmin';
import { RoleGuard } from '@/components/role-guard';
import { GlobalRole } from '@/lib/types/roles';
import { formatCurrency } from '@/lib/utils';

export default function SuperadminPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [restoreUuid, setRestoreUuid] = useState<string | null>(null);
  const [toggleTarget, setToggleTarget] = useState<{ uuid: string; currentStatus: string } | null>(null);
  const [timelineCompanyId, setTimelineCompanyId] = useState<number | null>(null);

  const { data: overview, isLoading: overviewLoading } = usePlatformOverview();
  const { data: topCompanies } = useTopCompanies(5);
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const deleteTenant = useDeleteTenant();
  const restoreTenant = useRestoreTenant();
  const toggleStatus = useToggleTenantStatus();
  const { data: timelineData, isLoading: timelineLoading } = useCompanyTimeline(timelineCompanyId);

  const handleDelete = useCallback(async () => {
    if (!deleteUuid) return;
    try {
      await deleteTenant.mutateAsync(deleteUuid);
      toast.success('Company deleted');
    } catch {
      toast.error('Failed to delete company');
    }
    setDeleteUuid(null);
  }, [deleteUuid, deleteTenant]);

  const handleRestore = useCallback(async () => {
    if (!restoreUuid) return;
    try {
      await restoreTenant.mutateAsync(restoreUuid);
      toast.success('Company restored');
    } catch {
      toast.error('Failed to restore company');
    }
    setRestoreUuid(null);
  }, [restoreUuid, restoreTenant]);

  const handleToggleStatus = useCallback(async () => {
    if (!toggleTarget) return;
    const newStatus = toggleTarget.currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await toggleStatus.mutateAsync({ uuid: toggleTarget.uuid, body: { status: newStatus } });
      toast.success(`Company ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`);
    } catch {
      toast.error('Failed to update company status');
    }
    setToggleTarget(null);
  }, [toggleTarget, toggleStatus]);

  const tenants = useMemo(() => {
    if (Array.isArray(tenantsData)) return tenantsData;
    return tenantsData?.data ?? [];
  }, [tenantsData]);

  const totalTenants =
    tenantsData?.meta?.total ?? tenantsData?.total ?? tenants.length;
  const pageCount = Math.ceil(totalTenants / pagination.pageSize) || 1;

  const topCompanyList: any[] = Array.isArray(topCompanies)
    ? topCompanies
    : topCompanies?.data ?? [];

  const topCompanyColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Company',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name ?? row.original.companyName}</span>
        ),
      },
      {
        accessorKey: 'revenue',
        header: 'Revenue',
        cell: ({ row }) =>
          formatCurrency(row.original.revenue ?? row.original.totalRevenue),
      },
      {
        accessorKey: 'invoiceCount',
        header: 'Invoices',
        cell: ({ row }) => row.original.invoiceCount ?? row.original.totalInvoices ?? 0,
      },
      {
        accessorKey: 'userCount',
        header: 'Users',
        cell: ({ row }) => row.original.userCount ?? row.original.totalUsers ?? 0,
      },
    ],
    []
  );

  const tenantColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Company Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              {(row.original.name ?? '?')[0]?.toUpperCase()}
            </div>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email ?? row.original.contactEmail ?? '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status ?? (row.original.isActive ? 'ACTIVE' : 'INACTIVE');
          return <StatusBadge status={status.toUpperCase()} />;
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const d = row.original.createdAt;
          if (!d) return '-';
          return new Date(d).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const tenant = row.original;
          const status = (tenant.status ?? (tenant.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase();
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setToggleTarget({ uuid: tenant.uuid, currentStatus: status })}>
                  {status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                </DropdownMenuItem>
                {tenant.deletedAt ? (
                  <DropdownMenuItem onClick={() => setRestoreUuid(tenant.uuid)}>
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteUuid(tenant.uuid)}>
                    Delete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setTimelineCompanyId(tenant.id)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Timeline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const timelineEvents: any[] = Array.isArray(timelineData)
    ? timelineData
    : timelineData?.data ?? [];

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Platform Overview"
        description="Superadmin dashboard — manage tenants and monitor platform health"
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
        <StatCard
          title="Total Companies"
          value={String(overview?.totalCompanies ?? overview?.companies ?? 0)}
          icon={Building2}
          accentColor="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={String(overview?.activeUsers ?? overview?.users ?? 0)}
          icon={Users}
          accentColor="bg-emerald-500"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue ?? overview?.revenue ?? 0)}
          icon={DollarSign}
          accentColor="bg-violet-500"
        />
        <StatCard
          title="Total Invoices"
          value={String(overview?.totalInvoices ?? overview?.invoices ?? 0)}
          icon={FileText}
          accentColor="bg-amber-500"
        />
      </div>

      {/* Top Companies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Top Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={topCompanyColumns}
            data={topCompanyList}
            isLoading={overviewLoading}
            emptyTitle="No data yet"
            emptyDescription="Company data will appear once tenants start using the platform."
          />
        </CardContent>
      </Card>

      {/* Tenant List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tenantColumns}
            data={tenants}
            isLoading={tenantsLoading}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalRecords={totalTenants}
            emptyTitle="No tenants"
            emptyDescription="No companies have been registered yet."
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUuid} onOpenChange={() => setDeleteUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company? This will soft-delete the company and can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog open={!!restoreUuid} onOpenChange={() => setRestoreUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this company? It will become active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation */}
      <AlertDialog open={!!toggleTarget} onOpenChange={() => setToggleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.currentStatus === 'ACTIVE' ? 'Suspend' : 'Activate'} Company
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.currentStatus === 'ACTIVE'
                ? 'Are you sure you want to suspend this company? Users will lose access until the company is reactivated.'
                : 'Are you sure you want to activate this company? Users will regain access to the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {toggleTarget?.currentStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Company Timeline Dialog */}
      <Dialog open={timelineCompanyId != null} onOpenChange={() => setTimelineCompanyId(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Company Timeline</DialogTitle>
          </DialogHeader>
          {timelineLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading timeline...</p>
          ) : timelineEvents.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No timeline events found.</p>
          ) : (
            <div className="space-y-3 py-2">
              {timelineEvents.map((event: any, idx: number) => (
                <div key={event.id ?? idx} className="flex gap-3 rounded-md border p-3 text-sm">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium">{event.action ?? event.eventType ?? 'Event'}</p>
                    {event.description && (
                      <p className="text-muted-foreground">{event.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.createdAt
                        ? new Date(event.createdAt).toLocaleString()
                        : event.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : ''}
                      {event.actor?.name || event.actorName
                        ? ` · ${event.actor?.name ?? event.actorName}`
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
