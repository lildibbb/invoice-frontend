'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DollarSign,
  CalendarDays,
  Hash,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@/components/ui/form';
import {
  FormInput,
  FormNumberInput,
  FormDatePicker,
  FormCombobox,
  FormTextarea,
} from '@/components/forms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

import { usePayments, useRecordPayment, useDeletePayment, usePaymentBalance } from '@/lib/queries/payments';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { recordPaymentSchema, type RecordPaymentInput } from '@/lib/validators/payment';
import { paymentCodes } from '@/lib/constants/lhdn';

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  bank_transfer: 'Bank Transfer',
  CASH: 'Cash',
  cash: 'Cash',
  CHEQUE: 'Cheque',
  cheque: 'Cheque',
  ONLINE: 'Online',
  online: 'Online',
  FPX: 'FPX',
  fpx: 'FPX',
  CREDIT_CARD: 'Credit Card',
  credit_card: 'Credit Card',
  OTHER: 'Other',
  other: 'Other',
};

const paymentMethodItems = paymentCodes.map((c) => ({
  value: c.Code,
  label: c['Payment Method'],
}));

export default function PaymentsPage() {
  const [invoiceUuid, setInvoiceUuid] = useState<string>('');
  const [searchInvoice, setSearchInvoice] = useState('');
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [recordInvoiceUuid, setRecordInvoiceUuid] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    invoiceUuid: string;
    paymentUuid: string;
  } | null>(null);

  const form = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    mode: 'onChange',
    defaultValues: {
      amount: 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: '',
      referenceNumber: '',
      notes: '',
    },
  });

  const { data: payments = [], isLoading } = usePayments(invoiceUuid || null);
  const recordMutation = useRecordPayment();
  const deleteMutation = useDeletePayment();
  const { data: balanceData } = usePaymentBalance(recordInvoiceUuid || null);

  // Stats
  const totalCollected = useMemo(
    () => payments.reduce((s: number, p: any) => s + (p.amount ?? 0), 0),
    [payments]
  );
  const thisMonth = useMemo(() => {
    const now = new Date();
    return payments
      .filter((p: any) => {
        const d = new Date(p.paidAt ?? p.date ?? p.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  }, [payments]);

  const handleRecord = useCallback(async (values: RecordPaymentInput) => {
    if (!recordInvoiceUuid) return;
    try {
      await recordMutation.mutateAsync({
        invoiceUuid: recordInvoiceUuid,
        body: {
          amount: values.amount,
          method: values.paymentMethod ?? '',
          paidAt: new Date(values.paymentDate).toISOString(),
          referenceNo: values.referenceNumber || undefined,
          notes: values.notes || undefined,
        },
      });
      toast.success('Payment recorded');
      setShowRecordDialog(false);
      setRecordInvoiceUuid('');
      form.reset();
      // Refresh list if viewing same invoice
      if (recordInvoiceUuid === invoiceUuid) {
        setInvoiceUuid('');
        setTimeout(() => setInvoiceUuid(recordInvoiceUuid), 0);
      }
    } catch {
      toast.error('Failed to record payment');
    }
  }, [recordInvoiceUuid, recordMutation, invoiceUuid, form]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success('Payment deleted');
    } catch {
      toast.error('Failed to delete payment');
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteMutation]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ row }) =>
          row.original.invoiceNo ??
          row.original.invoiceNumber ??
          row.original.invoice?.invoiceNo ??
          '-',
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) =>
          row.original.customer?.name ??
          row.original.customerName ??
          row.original.customer ??
          '-',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        accessorKey: 'paidAt',
        header: 'Date',
        cell: ({ row }) =>
          formatDate(row.original.paidAt ?? row.original.date ?? row.original.createdAt),
      },
      {
        accessorKey: 'method',
        header: 'Method',
        cell: ({ getValue }) => {
          const method = getValue() as string;
          return (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
              {METHOD_LABELS[method] ?? method}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = (row.original.status ?? 'COMPLETED').toUpperCase();
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: 'referenceNo',
        header: 'Reference',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {(getValue() as string) || '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setDeleteTarget({
                invoiceUuid:
                  row.original.invoiceUuid ??
                  row.original.invoice?.uuid ??
                  invoiceUuid,
                paymentUuid: row.original.uuid ?? row.original.id,
              })
            }
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ),
      },
    ],
    [invoiceUuid]
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Payments"
        actions={
          <Button onClick={() => setShowRecordDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          icon={DollarSign}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(thisMonth)}
          icon={CalendarDays}
        />
        <StatCard
          title="Payment Count"
          value={String(payments.length)}
          icon={Hash}
        />
      </div>

      {/* Invoice UUID input */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Enter Invoice UUID to view payments..."
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setInvoiceUuid(searchInvoice.trim());
            }}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setInvoiceUuid(searchInvoice.trim())}
        >
          Load
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading && !!invoiceUuid}
        emptyTitle={invoiceUuid ? 'No payments recorded' : 'Search for an invoice'}
        emptyDescription={
          invoiceUuid
            ? 'No payments have been recorded for this invoice.'
            : 'Enter an invoice UUID above to view its payments.'
        }
        emptyAction={
          !invoiceUuid ? undefined : (
            <Button size="sm" onClick={() => setShowRecordDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )
        }
      />

      {/* Record Payment Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={(open) => {
        setShowRecordDialog(open);
        if (!open) {
          setRecordInvoiceUuid('');
          form.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {balanceData && (
            <div className="rounded-md bg-muted px-4 py-2 text-sm">
              <span className="text-muted-foreground">Available balance: </span>
              <span className="font-semibold text-foreground">
                {formatCurrency((balanceData as any)?.balance ?? (balanceData as any)?.remaining ?? 0)}
              </span>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRecord)} className="space-y-4">
              <div className="grid gap-2">
                <Label>Invoice UUID *</Label>
                <Input
                  value={recordInvoiceUuid}
                  onChange={(e) => setRecordInvoiceUuid(e.target.value)}
                  placeholder="Enter invoice UUID"
                />
              </div>
              <FormNumberInput name="amount" label="Amount" prefix="RM" min={0.01} />
              <FormDatePicker name="paymentDate" label="Payment Date" />
              <FormCombobox
                name="paymentMethod"
                label="Payment Method"
                items={paymentMethodItems}
                placeholder="Select method"
              />
              <FormInput name="referenceNumber" label="Reference Number" maxLength={255} />
              <FormTextarea name="notes" label="Notes" />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowRecordDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!recordInvoiceUuid || recordMutation.isPending}
                >
                  Record Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RoleGuard>
  );
}
