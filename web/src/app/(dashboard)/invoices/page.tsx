'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { type PaginationState, type RowSelectionState } from '@tanstack/react-table';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable, DataTableToolbar } from '@/components/data-table';
import { getInvoiceColumns } from './columns';
import {
  useInvoices,
  useFinalizeInvoice,
  useSendInvoiceEmail,
  useDuplicateInvoice,
  useVoidInvoice,
  useDeleteInvoice,
  useExportInvoices,
  useBulkFinalizeInvoices,
  useBulkSendInvoices,
} from '@/lib/queries/invoices';
import { formatCurrency } from '@/lib/utils';

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Finalized', value: 'FINALIZED' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Voided', value: 'VOIDED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const filters = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      ...(search ? { invoiceNo: search } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    }),
    [pagination, search, statusFilter]
  );

  const { data, isLoading } = useInvoices(filters);
  const finalizeMutation = useFinalizeInvoice();
  const sendEmailMutation = useSendInvoiceEmail();
  const duplicateMutation = useDuplicateInvoice();
  const voidMutation = useVoidInvoice();
  const deleteMutation = useDeleteInvoice();
  const exportMutation = useExportInvoices();
  const bulkFinalizeMutation = useBulkFinalizeInvoices();
  const bulkSendMutation = useBulkSendInvoices();

  const invoices = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  }, [data]);

  const meta = useMemo(() => {
    if (Array.isArray(data)) return { total: data.length };
    return data?.meta ?? { total: 0 };
  }, [data]);

  const pageCount = Math.ceil((meta.total ?? 0) / pagination.pageSize) || 1;

  // Compute summary stats from meta or data
  const summary = useMemo(() => {
    const total = meta.total ?? invoices.length;
    let paid = 0;
    let overdue = 0;
    let draft = 0;
    for (const inv of invoices) {
      const s = (inv.status ?? '').toUpperCase();
      if (s === 'PAID' || s === 'COMPLETED') paid++;
      if (s === 'OVERDUE') overdue++;
      if (s === 'DRAFT') draft++;
    }
    return { total, paid, overdue, draft };
  }, [invoices, meta]);

  const handleFinalize = useCallback(
    (uuid: string) => {
      finalizeMutation.mutate(uuid, {
        onSuccess: () => toast.success('Invoice finalized'),
        onError: () => toast.error('Failed to finalize invoice'),
      });
    },
    [finalizeMutation]
  );

  const handleSendEmail = useCallback(
    (uuid: string) => {
      sendEmailMutation.mutate(uuid, {
        onSuccess: () => toast.success('Invoice sent'),
        onError: () => toast.error('Failed to send invoice'),
      });
    },
    [sendEmailMutation]
  );

  const handleDuplicate = useCallback(
    (uuid: string) => {
      duplicateMutation.mutate(uuid, {
        onSuccess: () => toast.success('Invoice duplicated'),
        onError: () => toast.error('Failed to duplicate invoice'),
      });
    },
    [duplicateMutation]
  );

  const handleVoid = useCallback(
    (uuid: string) => {
      voidMutation.mutate(
        { uuid, reason: 'Voided by user' },
        {
          onSuccess: () => toast.success('Invoice voided'),
          onError: () => toast.error('Failed to void invoice'),
        }
      );
    },
    [voidMutation]
  );

  const handleDelete = useCallback(
    (uuid: string) => {
      deleteMutation.mutate(uuid, {
        onSuccess: () => toast.success('Invoice deleted'),
        onError: () => toast.error('Failed to delete invoice'),
      });
    },
    [deleteMutation]
  );

  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => invoices[parseInt(key)])
      .filter(Boolean);
  }, [rowSelection, invoices]);

  const handleBulkFinalize = useCallback(
    (rows: any[]) => {
      const uuids = rows.map((r) => r.uuid).filter(Boolean);
      bulkFinalizeMutation.mutate({ uuids }, {
        onSuccess: () => {
          toast.success(`${uuids.length} invoices finalized`);
          setRowSelection({});
        },
        onError: () => toast.error('Failed to bulk finalize'),
      });
    },
    [bulkFinalizeMutation]
  );

  const handleBulkSend = useCallback(
    (rows: any[]) => {
      const uuids = rows.map((r) => r.uuid).filter(Boolean);
      bulkSendMutation.mutate({ uuids }, {
        onSuccess: () => {
          toast.success(`${uuids.length} invoices sent`);
          setRowSelection({});
        },
        onError: () => toast.error('Failed to bulk send'),
      });
    },
    [bulkSendMutation]
  );

  const handleExport = useCallback(() => {
    exportMutation.mutate(
      { format: 'csv' },
      {
        onSuccess: () => toast.success('Export started'),
        onError: () => toast.error('Failed to export'),
      }
    );
  }, [exportMutation]);

  const columns = useMemo(
    () =>
      getInvoiceColumns({
        onFinalize: handleFinalize,
        onSendEmail: handleSendEmail,
        onDuplicate: handleDuplicate,
        onVoid: handleVoid,
        onDelete: handleDelete,
      }),
    [handleFinalize, handleSendEmail, handleDuplicate, handleVoid, handleDelete]
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Invoices"
        description="Manage and track your invoices"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {exportMutation.isPending ? 'Exporting…' : 'Export'}
            </Button>
            <Button size="sm" asChild>
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total" value={`${summary.total}`} accentColor="bg-blue-500" />
        <StatCard
          title="Paid"
          value={`${summary.paid}`}
          accentColor="bg-emerald-500"
          className="[&_p:first-child]:text-green-600"
        />
        <StatCard
          title="Overdue"
          value={`${summary.overdue}`}
          accentColor="bg-red-500"
          className="[&_p:first-child]:text-red-600"
        />
        <StatCard
          title="Draft"
          value={`${summary.draft}`}
          accentColor="bg-amber-500"
          className="[&_p:first-child]:text-zinc-500"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRecords={meta.total}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyTitle={search ? `No invoices matching "${search}"` : 'No invoices yet'}
        emptyDescription={search ? 'Try a different search term or status filter.' : 'Create your first invoice to get started.'}
        emptyAction={
          !search && !isLoading ? (
            <Button size="sm" asChild>
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          ) : undefined
        }
        toolbar={
          <DataTableToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search invoices..."
            filters={
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            actions={
              selectedRows.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
                  <Button size="sm" variant="outline" onClick={() => handleBulkFinalize(selectedRows)}>
                    Bulk Finalize
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkSend(selectedRows)}>
                    Bulk Send
                  </Button>
                </div>
              ) : undefined
            }
          />
        }
      />
    </div>
    </RoleGuard>
  );
}
