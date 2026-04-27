'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Hash, CheckCircle2 } from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

import { usePendingApprovals, useReviewApproval } from '@/lib/queries/approvals';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ApprovalsPage() {
  const [reviewTarget, setReviewTarget] = useState<{
    uuid: string;
    action: 'APPROVED' | 'REJECTED';
  } | null>(null);
  const [comments, setComments] = useState('');

  const { data: rawData, isLoading } = usePendingApprovals();
  const reviewMutation = useReviewApproval();

  const approvals = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];
  }, [rawData]);

  const count = approvals.length;

  const handleReview = useCallback(async () => {
    if (!reviewTarget) return;
    try {
      await reviewMutation.mutateAsync({
        approvalUuid: reviewTarget.uuid,
        body: {
          status: reviewTarget.action,
          comments: comments || undefined,
        },
      });
      toast.success(
        reviewTarget.action === 'APPROVED'
          ? 'Invoice approved'
          : 'Invoice rejected'
      );
    } catch {
      toast.error('Failed to review approval');
    }
    setReviewTarget(null);
    setComments('');
  }, [reviewTarget, comments, reviewMutation]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice #',
        cell: ({ row }) =>
          row.original.invoice?.invoiceNo ??
          row.original.invoiceNo ??
          '-',
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) =>
          row.original.invoice?.customer?.name ??
          row.original.customerName ??
          '-',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(
              row.original.invoice?.totalAmount ??
                row.original.amount ??
                0
            )}
          </span>
        ),
      },
      {
        accessorKey: 'requestedBy',
        header: 'Requested By',
        cell: ({ row }) => {
          const name =
            row.original.requestedBy?.name ??
            row.original.requestedByName ??
            row.original.requestedBy ??
            '-';
          const date = formatDate(row.original.createdAt ?? row.original.requestedAt);
          return (
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">{date}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = (row.original.status ?? 'PENDING').toUpperCase();
          return <StatusBadge status={status} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const uuid = row.original.uuid ?? row.original.id;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() =>
                  setReviewTarget({ uuid, action: 'APPROVED' })
                }
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  setReviewTarget({ uuid, action: 'REJECTED' })
                }
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </div>
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
        title="Pending Approvals"
        description={`${count} approval${count !== 1 ? 's' : ''} waiting for review`}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          title="Pending Approvals"
          value={String(count)}
          icon={Clock}
        />
        <StatCard
          title="Total Items"
          value={String(count)}
          icon={Hash}
        />
      </div>

      <DataTable
        columns={columns}
        data={approvals}
        isLoading={isLoading}
        emptyTitle="No pending approvals"
        emptyDescription="All invoices have been reviewed. Check back later."
        emptyAction={
          <div className="flex items-center justify-center rounded-full bg-green-50 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        }
      />

      {/* Review Confirmation */}
      <AlertDialog
        open={!!reviewTarget}
        onOpenChange={() => {
          setReviewTarget(null);
          setComments('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewTarget?.action === 'APPROVED'
                ? 'Approve Invoice'
                : 'Reject Invoice'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewTarget?.action === 'APPROVED'
                ? 'Are you sure you want to approve this invoice?'
                : 'Are you sure you want to reject this invoice?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Label>Notes (optional)</Label>
            <Textarea
              className="mt-2"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes or reason..."
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReview}
              className={
                reviewTarget?.action === 'REJECTED'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {reviewTarget?.action === 'APPROVED' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RoleGuard>
  );
}
