'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  QrCode,
  RotateCw,
  Eye,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import {
  useEInvoiceSubmissions,
  useSubmitEInvoice,
  useEInvoiceQrCode,
  useEInvoiceStatus,
} from '@/lib/queries/e-invoices';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: 'bg-green-100 text-green-800 shadow-sm shadow-green-200/50',
  VALID: 'bg-green-100 text-green-800 shadow-sm shadow-green-200/50',
  REJECTED: 'bg-red-100 text-red-800 shadow-sm shadow-red-200/50',
  INVALID: 'bg-red-100 text-red-800 shadow-sm shadow-red-200/50',
  PENDING: 'bg-amber-100 text-amber-800 shadow-sm shadow-amber-200/50',
  SUBMITTED: 'bg-blue-100 text-blue-800 shadow-sm shadow-blue-200/50',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 shadow-sm shadow-blue-200/50',
};

function QrCodeDialog({
  uuid,
  open,
  onClose,
}: {
  uuid: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: qrData, isLoading } = useEInvoiceQrCode(open ? uuid : '');

  const qrUrl = useMemo(() => {
    if (!qrData) return null;
    if (typeof qrData === 'string') return qrData;
    return (qrData as any)?.qrCodeUrl ?? (qrData as any)?.url ?? null;
  }, [qrData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>E-Invoice QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-6">
          {isLoading ? (
            <div className="h-48 w-48 animate-pulse rounded bg-muted" />
          ) : qrUrl ? (
            <img
              src={qrUrl}
              alt="E-Invoice QR Code"
              className="h-48 w-48 rounded shadow-md border-0"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              QR code not available
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EInvoiceDetailDialog({ uuid, open, onClose }: { uuid: string; open: boolean; onClose: () => void }) {
  const { data: status, isLoading } = useEInvoiceStatus(open ? uuid : '');
  const statusData = status as any;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : statusData ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={statusData.status ?? 'PENDING'} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submission UID</span>
                <span className="font-mono text-xs">{statusData.submissionUid ?? statusData.uuid ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Long ID</span>
                <span className="font-mono text-xs">{statusData.longId ?? statusData.lhdnLongId ?? '-'}</span>
              </div>
              {statusData.rejectionReason && (
                <div>
                  <span className="text-sm text-muted-foreground">Rejection Reason</span>
                  <p className="mt-1 text-sm">{statusData.rejectionReason}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center">No details available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EInvoicesPage() {
  const [qrUuid, setQrUuid] = useState<string | null>(null);
  const [detailUuid, setDetailUuid] = useState<string | null>(null);

  const { data: rawData, isLoading } = useEInvoiceSubmissions();
  const retryMutation = useSubmitEInvoice();

  const submissions = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];
  }, [rawData]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const accepted = submissions.filter(
      (s: any) => s.status === 'ACCEPTED' || s.status === 'VALID'
    ).length;
    const rejected = submissions.filter(
      (s: any) => s.status === 'REJECTED' || s.status === 'INVALID'
    ).length;
    const pending = submissions.filter(
      (s: any) =>
        s.status === 'PENDING' ||
        s.status === 'SUBMITTED' ||
        s.status === 'IN_PROGRESS'
    ).length;
    return { total, accepted, rejected, pending };
  }, [submissions]);

  const handleRetry = useCallback(
    async (uuid: string) => {
      try {
        await retryMutation.mutateAsync(uuid);
        toast.success('E-Invoice resubmitted');
      } catch {
        toast.error('Failed to resubmit');
      }
    },
    [retryMutation]
  );

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'submissionUid',
        header: 'Submission ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.submissionUid ??
              row.original.uuid ??
              row.original.id ??
              '-'}
          </span>
        ),
      },
      {
        accessorKey: 'invoiceNo',
        header: 'Invoice #',
        cell: ({ row }) =>
          row.original.invoice?.invoiceNo ??
          row.original.invoiceNo ??
          '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = (getValue() as string) || 'PENDING';
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted Date',
        cell: ({ row }) =>
          formatDate(
            row.original.submittedAt ??
              row.original.createdAt ??
              null
          ),
      },
      {
        accessorKey: 'lhdnStatus',
        header: 'LHDN Status',
        cell: ({ row }) => {
          const lhdn =
            row.original.lhdnStatus ??
            row.original.lhdnLongId ??
            row.original.longId;
          return lhdn ? (
            <span className="font-mono text-xs">{lhdn}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const uuid = row.original.uuid ?? row.original.id;
          const status = row.original.status;
          const isAccepted =
            status === 'ACCEPTED' || status === 'VALID';
          const isRejected =
            status === 'REJECTED' || status === 'INVALID';
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                title="View Details"
                onClick={() => setDetailUuid(uuid)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {isAccepted && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="View QR Code"
                  onClick={() => setQrUuid(uuid)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              )}
              {isRejected && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Retry Submission"
                  onClick={() => handleRetry(uuid)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [handleRetry]
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="E-Invoices"
        description="LHDN e-invoice submissions and status"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Submitted"
          value={String(stats.total)}
          icon={Hash}
        />
        <StatCard
          title="Accepted"
          value={String(stats.accepted)}
          icon={CheckCircle}
        />
        <StatCard
          title="Rejected"
          value={String(stats.rejected)}
          icon={XCircle}
        />
        <StatCard
          title="Pending"
          value={String(stats.pending)}
          icon={Clock}
        />
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        isLoading={isLoading}
        emptyTitle="No e-invoice submissions"
        emptyDescription="E-invoice submissions will appear here once invoices are submitted to LHDN."
      />

      {/* QR Code Dialog */}
      {qrUuid && (
        <QrCodeDialog
          uuid={qrUuid}
          open={!!qrUuid}
          onClose={() => setQrUuid(null)}
        />
      )}

      {/* Detail Dialog */}
      {detailUuid && (
        <EInvoiceDetailDialog
          uuid={detailUuid}
          open={!!detailUuid}
          onClose={() => setDetailUuid(null)}
        />
      )}
    </div>
    </RoleGuard>
  );
}
