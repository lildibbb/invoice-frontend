'use client';

import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ClipboardList,
  FileSearch,
  Building2,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole } from '@/lib/types/roles';
import {
  useAuditLogs,
  useInvoiceAudits,
  useCompanyTimeline,
  useInvoiceAuditByUuid,
  usePlatformLogById,
} from '@/lib/queries/superadmin';
import { formatDateTime } from '@/lib/utils';

export default function SuperadminAuditPage() {
  const [timelineCompanyId, setTimelineCompanyId] = useState<number | null>(null);
  const [companyIdInput, setCompanyIdInput] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [selectedAuditUuid, setSelectedAuditUuid] = useState<string | null>(null);

  const { data: auditData, isLoading: auditLoading } = useAuditLogs();
  const { data: invoiceAuditData, isLoading: invoiceAuditLoading } =
    useInvoiceAudits();
  const { data: timelineData, isLoading: timelineLoading } =
    useCompanyTimeline(timelineCompanyId);
  const { data: logDetail, isLoading: logDetailLoading } = usePlatformLogById(selectedLogId);
  const { data: auditDetail, isLoading: auditDetailLoading } = useInvoiceAuditByUuid(selectedAuditUuid ?? '');

  const auditLogs: any[] = useMemo(() => {
    if (Array.isArray(auditData)) return auditData;
    return auditData?.data ?? [];
  }, [auditData]);

  const invoiceAudits: any[] = useMemo(() => {
    if (Array.isArray(invoiceAuditData)) return invoiceAuditData;
    return invoiceAuditData?.data ?? [];
  }, [invoiceAuditData]);

  const timelineEntries: any[] = useMemo(() => {
    if (Array.isArray(timelineData)) return timelineData;
    return timelineData?.data ?? [];
  }, [timelineData]);

  const platformLogColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="cursor-pointer"
            onClick={() => setSelectedLogId(row.original.id ?? null)}
          >
            {row.original.action ?? '-'}
          </Badge>
        ),
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        cell: ({ row }) =>
          row.original.actor?.email ??
          row.original.actorEmail ??
          row.original.actorId ??
          '-',
      },
      {
        accessorKey: 'targetType',
        header: 'Target',
        cell: ({ row }) => row.original.targetType ?? '-',
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: ({ row }) => {
          const details = row.original.details ?? row.original.description;
          if (!details) return '-';
          const text =
            typeof details === 'string' ? details : JSON.stringify(details);
          return (
            <span className="max-w-xs truncate text-sm text-muted-foreground" title={text}>
              {text.length > 80 ? `${text.slice(0, 80)}...` : text}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) =>
          formatDateTime(row.original.createdAt ?? row.original.timestamp),
      },
    ],
    []
  );

  const invoiceAuditColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ row }) => (
          <span
            className="cursor-pointer font-medium hover:underline"
            onClick={() => setSelectedAuditUuid(row.original.uuid ?? null)}
          >
            {row.original.invoiceNumber ?? row.original.invoice?.invoiceNumber ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.action ?? '-'}</Badge>
        ),
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) =>
          row.original.company?.name ?? row.original.companyName ?? '-',
      },
      {
        accessorKey: 'performedBy',
        header: 'Performed By',
        cell: ({ row }) =>
          row.original.performedBy?.email ??
          row.original.actorEmail ??
          row.original.userEmail ??
          '-',
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) =>
          formatDateTime(row.original.createdAt ?? row.original.timestamp),
      },
    ],
    []
  );

  const timelineColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Event',
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.action ?? row.original.event ?? '-'}</Badge>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) =>
          row.original.description ?? row.original.details ?? '-',
      },
      {
        accessorKey: 'actor',
        header: 'Actor',
        cell: ({ row }) =>
          row.original.actor?.email ?? row.original.actorEmail ?? '-',
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) =>
          formatDateTime(row.original.createdAt ?? row.original.timestamp),
      },
    ],
    []
  );

  const handleOpenTimeline = () => {
    const id = parseInt(companyIdInput, 10);
    if (!isNaN(id)) {
      setTimelineCompanyId(id);
      setShowTimeline(true);
    }
  };

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Audit Logs"
        description="Platform-wide audit trail and invoice audits"
        actions={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Company ID"
              value={companyIdInput}
              onChange={(e) => setCompanyIdInput(e.target.value)}
              className="w-32"
            />
            <Button variant="outline" onClick={handleOpenTimeline}>
              <Building2 className="mr-2 h-4 w-4" />
              Timeline
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Platform Logs
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileSearch className="h-4 w-4" />
            Invoice Audits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <DataTable
            columns={platformLogColumns}
            data={auditLogs}
            isLoading={auditLoading}
            emptyTitle="No audit logs"
            emptyDescription="Platform audit logs will appear here as actions are performed."
          />
        </TabsContent>

        <TabsContent value="invoices">
          <DataTable
            columns={invoiceAuditColumns}
            data={invoiceAudits}
            isLoading={invoiceAuditLoading}
            emptyTitle="No invoice audits"
            emptyDescription="Invoice audit records will appear here when invoices are created or modified."
          />
        </TabsContent>
      </Tabs>

      {/* Company Timeline Dialog */}
      <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Company Timeline — ID: {timelineCompanyId}
            </DialogTitle>
          </DialogHeader>
          <DataTable
            columns={timelineColumns}
            data={timelineEntries}
            isLoading={timelineLoading}
            emptyTitle="No timeline events"
            emptyDescription="No events found for this company."
          />
        </DialogContent>
      </Dialog>

      {/* Platform Log Detail Dialog */}
      <Dialog open={selectedLogId != null} onOpenChange={() => setSelectedLogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Platform Log Detail</DialogTitle>
          </DialogHeader>
          {logDetailLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>
          ) : logDetail ? (
            <div className="grid gap-3 py-4">
              {[
                ['Action', logDetail.action],
                ['Actor', logDetail.actor?.email ?? logDetail.actorEmail ?? logDetail.actorId],
                ['Target Type', logDetail.targetType],
                ['Target ID', logDetail.targetId],
                ['IP Address', logDetail.ipAddress ?? logDetail.ip],
                ['Timestamp', logDetail.createdAt ? new Date(logDetail.createdAt).toLocaleString() : null],
              ].map(([label, value]) => (
                <div key={label as string} className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  <span className="col-span-2 text-sm">{(value as string) ?? '-'}</span>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Details</span>
                <pre className="col-span-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                  {typeof logDetail.details === 'string' ? logDetail.details : JSON.stringify(logDetail.details ?? logDetail.description, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No data found.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Audit Detail Dialog */}
      <Dialog open={!!selectedAuditUuid} onOpenChange={() => setSelectedAuditUuid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Audit Detail</DialogTitle>
          </DialogHeader>
          {auditDetailLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>
          ) : auditDetail ? (
            <div className="grid gap-3 py-4">
              {[
                ['Invoice #', auditDetail.invoiceNumber ?? auditDetail.invoice?.invoiceNumber],
                ['Action', auditDetail.action],
                ['Company', auditDetail.company?.name ?? auditDetail.companyName],
                ['Performed By', auditDetail.performedBy?.email ?? auditDetail.actorEmail ?? auditDetail.userEmail],
                ['Timestamp', auditDetail.createdAt ? new Date(auditDetail.createdAt).toLocaleString() : null],
              ].map(([label, value]) => (
                <div key={label as string} className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  <span className="col-span-2 text-sm">{(value as string) ?? '-'}</span>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Changes</span>
                <pre className="col-span-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                  {JSON.stringify(auditDetail.changes ?? auditDetail.details ?? auditDetail.metadata, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No data found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
