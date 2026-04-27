'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Send,
  ArrowRightLeft,
  Search,
  RotateCcw,
} from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  useQuotations,
  useDeleteQuotation,
  useSendQuotation,
  useAcceptQuotation,
  useRejectQuotation,
  useConvertToInvoice,
  useReviseQuotation,
} from '@/lib/queries/quotations';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  draft: 'secondary',
  SENT: 'outline',
  sent: 'outline',
  ACCEPTED: 'default',
  accepted: 'default',
  REJECTED: 'destructive',
  rejected: 'destructive',
  EXPIRED: 'secondary',
  expired: 'secondary',
  CONVERTED: 'default',
  converted: 'default',
};

export default function QuotationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    uuid: string;
    type: 'send' | 'accept' | 'reject' | 'convert' | 'revise';
  } | null>(null);

  const { data, isLoading } = useQuotations(
    statusFilter !== 'all'
      ? { status: statusFilter.toUpperCase() as any }
      : {}
  );

  const quotations = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (item: any) =>
        (item.quotationNo ?? item.number ?? '').toLowerCase().includes(q) ||
        (item.customer?.name ?? '').toLowerCase().includes(q)
    );
  }, [data, search]);

  // Stats
  const total = quotations.length;
  const pending = useMemo(
    () =>
      quotations.filter((q: any) => {
        const s = (q.status ?? '').toLowerCase();
        return s === 'draft' || s === 'sent';
      }).length,
    [quotations]
  );
  const accepted = useMemo(
    () =>
      quotations.filter(
        (q: any) => (q.status ?? '').toLowerCase() === 'accepted'
      ).length,
    [quotations]
  );
  const rejected = useMemo(
    () =>
      quotations.filter(
        (q: any) => (q.status ?? '').toLowerCase() === 'rejected'
      ).length,
    [quotations]
  );

  const deleteMutation = useDeleteQuotation();
  const sendMutation = useSendQuotation();
  const acceptMutation = useAcceptQuotation();
  const rejectMutation = useRejectQuotation();
  const convertMutation = useConvertToInvoice();
  const reviseMutation = useReviseQuotation();

  const handleDelete = useCallback(async () => {
    if (!deleteUuid) return;
    try {
      await deleteMutation.mutateAsync(deleteUuid);
      toast.success('Quotation deleted');
    } catch {
      toast.error('Failed to delete quotation');
    }
    setDeleteUuid(null);
  }, [deleteUuid, deleteMutation]);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    const { uuid, type } = confirmAction;
    try {
      switch (type) {
        case 'send':
          await sendMutation.mutateAsync(uuid);
          toast.success('Quotation sent');
          break;
        case 'accept':
          await acceptMutation.mutateAsync(uuid);
          toast.success('Quotation accepted');
          break;
        case 'reject':
          await rejectMutation.mutateAsync(uuid);
          toast.success('Quotation rejected');
          break;
        case 'convert':
          await convertMutation.mutateAsync(uuid);
          toast.success('Converted to invoice');
          break;
        case 'revise':
          await reviseMutation.mutateAsync(uuid);
          toast.success('Quotation revised');
          break;
      }
    } catch {
      toast.error(`Failed to ${type} quotation`);
    }
    setConfirmAction(null);
  }, [confirmAction, sendMutation, acceptMutation, rejectMutation, convertMutation]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'quotationNo',
        header: 'Quotation #',
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.quotationNo ?? row.original.number ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) =>
          row.original.customer?.name ?? row.original.customer ?? '-',
      },
      {
        accessorKey: 'issueDate',
        header: 'Date',
        cell: ({ row }) => formatDate(row.original.issueDate ?? row.original.createdAt),
      },
      {
        accessorKey: 'validUntil',
        header: 'Expiry',
        cell: ({ row }) => formatDate(row.original.validUntil ?? row.original.expiryDate),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) =>
          formatCurrency(row.original.totalAmount ?? row.original.amount),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = (getValue() as string) ?? 'DRAFT';
          return <StatusBadge status={status.toUpperCase()} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const q = row.original;
          const status = (q.status ?? '').toLowerCase();
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => window.open(`/quotations/${q.uuid}`, '_self')}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                {status === 'draft' && (
                  <DropdownMenuItem
                    onClick={() => window.open(`/quotations/${q.uuid}/edit`, '_self')}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {status === 'draft' && (
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmAction({ uuid: q.uuid, type: 'send' })
                    }
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </DropdownMenuItem>
                )}
                {status === 'sent' && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({ uuid: q.uuid, type: 'accept' })
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({ uuid: q.uuid, type: 'reject' })
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({ uuid: q.uuid, type: 'revise' })
                      }
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Revise
                    </DropdownMenuItem>
                  </>
                )}
                {(status === 'accepted' || status === 'sent') && (
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmAction({ uuid: q.uuid, type: 'convert' })
                    }
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Convert to Invoice
                  </DropdownMenuItem>
                )}
                {status === 'draft' && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteUuid(q.uuid)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Quotations"
        actions={
          <Button onClick={() => window.open('/quotations/new', '_self')}>
            <Plus className="mr-2 h-4 w-4" />
            New Quotation
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Total" value={String(total)} icon={FileText} />
        <StatCard title="Pending" value={String(pending)} icon={Clock} />
        <StatCard title="Accepted" value={String(accepted)} icon={CheckCircle} />
        <StatCard title="Rejected" value={String(rejected)} icon={XCircle} />
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={isLoading}
        toolbar={
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle="No quotations found"
        emptyDescription="Create your first quotation to get started."
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteUuid} onOpenChange={() => setDeleteUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? Only draft quotations can
              be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Action confirmation */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'send' && 'Send Quotation'}
              {confirmAction?.type === 'accept' && 'Accept Quotation'}
              {confirmAction?.type === 'reject' && 'Reject Quotation'}
              {confirmAction?.type === 'convert' && 'Convert to Invoice'}
              {confirmAction?.type === 'revise' && 'Revise Quotation'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'send' &&
                'This will send the quotation to the customer.'}
              {confirmAction?.type === 'accept' &&
                'This will mark the quotation as accepted.'}
              {confirmAction?.type === 'reject' &&
                'This will mark the quotation as rejected.'}
              {confirmAction?.type === 'convert' &&
                'This will convert the quotation into a draft invoice.'}
              {confirmAction?.type === 'revise' &&
                'This will create a revised version of the quotation.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RoleGuard>
  );
}
