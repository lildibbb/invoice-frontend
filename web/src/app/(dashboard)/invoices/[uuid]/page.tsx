'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileDown,
  Send,
  CheckCircle,
  XCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  useInvoice,
  useFinalizeInvoice,
  useSendInvoiceEmail,
  useVoidInvoice,
  useDownloadInvoicePdf,
  useInvoiceAuditTrail,
  useAllowedTransitions,
  useSubmitEInvoice,
} from '@/lib/queries/invoices';
import {
  useCreditMemos,
  useCreateCreditMemo,
  useIssueCreditMemo,
  useVoidCreditMemo,
} from '@/lib/queries/credit-memos';

export default function InvoiceDetailPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const uuid = params.uuid;

  const { data: invoice, isLoading } = useInvoice(uuid);
  const finalizeMutation = useFinalizeInvoice();
  const sendMutation = useSendInvoiceEmail();
  const voidMutation = useVoidInvoice();
  const downloadMutation = useDownloadInvoicePdf();
  const submitEInvoice = useSubmitEInvoice();
  const { data: auditTrail, isLoading: auditLoading } = useInvoiceAuditTrail(uuid);
  const { data: transitions } = useAllowedTransitions(uuid);

  const { data: creditMemos, isLoading: creditMemosLoading } = useCreditMemos(uuid);
  const createCreditMemo = useCreateCreditMemo();
  const issueCreditMemo = useIssueCreditMemo();
  const voidCreditMemo = useVoidCreditMemo();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createAmount, setCreateAmount] = useState('');
  const [createReason, setCreateReason] = useState('');
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [voidMemoUuid, setVoidMemoUuid] = useState('');
  const [voidReason, setVoidReason] = useState('');

  const status = ((invoice?.status as string) ?? 'DRAFT').toUpperCase();
  const lineItems = useMemo(
    () => invoice?.items ?? invoice?.lineItems ?? [],
    [invoice]
  );

  const subtotal = useMemo(
    () =>
      lineItems.reduce(
        (sum: number, item: any) =>
          sum + (item.quantity ?? item.qty ?? 0) * (item.unitPrice ?? 0),
        0
      ),
    [lineItems]
  );

  const taxTotal = useMemo(
    () =>
      lineItems.reduce((sum: number, item: any) => {
        const lineAmount =
          (item.quantity ?? item.qty ?? 0) * (item.unitPrice ?? 0);
        const taxRate = item.taxRate ?? item.taxPercent ?? 0;
        return sum + lineAmount * (taxRate / 100);
      }, 0),
    [lineItems]
  );

  const discountTotal = useMemo(
    () =>
      lineItems.reduce(
        (sum: number, item: any) => sum + (item.discount ?? 0),
        0
      ),
    [lineItems]
  );

  const total = invoice?.totalAmount ?? subtotal + taxTotal - discountTotal;

  const handleFinalize = () => {
    finalizeMutation.mutate(uuid, {
      onSuccess: () => toast.success('Invoice finalized'),
      onError: () => toast.error('Failed to finalize'),
    });
  };

  const handleSend = () => {
    sendMutation.mutate(uuid, {
      onSuccess: () => toast.success('Invoice sent'),
      onError: () => toast.error('Failed to send'),
    });
  };

  const handleVoid = () => {
    voidMutation.mutate(
      { uuid, reason: 'Voided by user' },
      {
        onSuccess: () => {
          toast.success('Invoice voided');
          router.push('/invoices');
        },
        onError: () => toast.error('Failed to void'),
      }
    );
  };

  const handleDownloadPdf = () => {
    downloadMutation.mutate(uuid, {
      onSuccess: () => toast.success('PDF download started'),
      onError: () => toast.error('Failed to download PDF'),
    });
  };

  const handleCreateCreditMemo = () => {
    const amount = parseFloat(createAmount);
    if (!amount || amount <= 0 || !createReason.trim()) return;
    createCreditMemo.mutate(
      { invoiceUuid: uuid, body: { amount, reason: createReason.trim() } },
      {
        onSuccess: () => {
          toast.success('Credit memo created');
          setCreateDialogOpen(false);
          setCreateAmount('');
          setCreateReason('');
        },
        onError: () => toast.error('Failed to create credit memo'),
      }
    );
  };

  const handleIssueCreditMemo = (memoUuid: string) => {
    issueCreditMemo.mutate(memoUuid, {
      onSuccess: () => toast.success('Credit memo issued'),
      onError: () => toast.error('Failed to issue credit memo'),
    });
  };

  const handleVoidCreditMemo = () => {
    if (!voidMemoUuid) return;
    voidCreditMemo.mutate(voidMemoUuid, {
      onSuccess: () => {
        toast.success('Credit memo voided');
        setVoidDialogOpen(false);
        setVoidMemoUuid('');
        setVoidReason('');
      },
      onError: () => toast.error('Failed to void credit memo'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Invoice not found.{' '}
        <Link href="/invoices" className="text-primary hover:underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  const customer = invoice.customer ?? {};

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNo ?? 'Draft Invoice'}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {invoice.invoiceNo ?? 'Draft'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Issued: {formatDate(invoice.invoiceDate)} • Due:{' '}
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>

              <Separator className="my-4" />

              {/* Customer Info */}
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Bill To
                </p>
                <p className="mt-1 font-medium">
                  {customer.name ?? invoice.customerName ?? '-'}
                </p>
                {customer.email && (
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                )}
                {customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {customer.phone}
                  </p>
                )}
                {customer.address && (
                  <p className="text-sm text-muted-foreground">
                    {customer.address}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[15px]">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-16 text-center text-muted-foreground"
                      >
                        No line items
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((item: any, idx: number) => {
                      const qty = item.quantity ?? item.qty ?? 0;
                      const price = item.unitPrice ?? 0;
                      const taxRate = item.taxRate ?? item.taxPercent ?? 0;
                      const lineTotal = qty * price;
                      const lineTax = lineTotal * (taxRate / 100);
                      return (
                        <TableRow key={item.id ?? idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            {item.description ?? item.name ?? '-'}
                          </TableCell>
                          <TableCell className="text-right">{qty}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {taxRate}%
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(lineTotal + lineTax)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(taxTotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{formatCurrency(discountTotal)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {invoice.amountPaid != null && invoice.amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span>{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary">
                      <span>Balance Due</span>
                      <span>
                        {formatCurrency(total - (invoice.amountPaid ?? 0))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                {invoice.notes && (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-sm">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      Terms
                    </p>
                    <p className="mt-1 text-sm">{invoice.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : auditTrail?.length > 0 ? (
                <div className="space-y-3">
                  {auditTrail.map((entry: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 pl-4 pb-3 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-muted before:rounded-full">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{entry.action ?? entry.event}</p>
                        <p className="text-xs text-muted-foreground">{entry.performedBy ?? entry.user ?? 'System'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(entry.createdAt ?? entry.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audit trail available</p>
              )}
            </CardContent>
          </Card>

          {/* Credit Memos */}
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Credit Memos</CardTitle>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Credit Memo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Credit Memo</DialogTitle>
                    <DialogDescription>
                      Create a new credit memo for this invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="cm-amount">Amount</Label>
                      <Input
                        id="cm-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={createAmount}
                        onChange={(e) => setCreateAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cm-reason">Reason</Label>
                      <Textarea
                        id="cm-reason"
                        placeholder="Reason for credit memo..."
                        value={createReason}
                        onChange={(e) => setCreateReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateCreditMemo}
                      disabled={createCreditMemo.isPending || !createAmount || !createReason.trim()}
                    >
                      {createCreditMemo.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {creditMemosLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : !creditMemos?.length ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No credit memos for this invoice.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditMemos.map((memo: any) => {
                      const memoStatus = (memo.status ?? 'DRAFT').toUpperCase();
                      return (
                        <TableRow key={memo.uuid}>
                          <TableCell className="font-medium">
                            {formatCurrency(memo.amount)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {memo.reason}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={memoStatus} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(memo.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {memoStatus === 'DRAFT' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleIssueCreditMemo(memo.uuid)}
                                disabled={issueCreditMemo.isPending}
                              >
                                Issue
                              </Button>
                            )}
                            {memoStatus === 'ISSUED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setVoidMemoUuid(memo.uuid);
                                  setVoidDialogOpen(true);
                                }}
                              >
                                Void
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Void Credit Memo Dialog */}
          <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Void Credit Memo</DialogTitle>
                <DialogDescription>
                  Provide a reason for voiding this credit memo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="void-reason">Reason</Label>
                <Textarea
                  id="void-reason"
                  placeholder="Reason for voiding..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleVoidCreditMemo}
                  disabled={voidCreditMemo.isPending || !voidReason.trim()}
                >
                  {voidCreditMemo.isPending ? 'Voiding...' : 'Void'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Buttons */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <Button
                className="w-full"
                onClick={handleDownloadPdf}
                disabled={downloadMutation.isPending}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              {transitions?.includes('FINALIZE') && status === 'DRAFT' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleFinalize}
                  disabled={finalizeMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalize
                </Button>
              )}
              {transitions?.includes('SEND') && ['FINALIZED', 'SENT'].includes(status) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              )}
              {invoice?.status === 'FINALIZED' && (
                <Button
                  variant="outline"
                  className="w-full text-violet-600 hover:bg-violet-50 shadow-sm"
                  onClick={() => submitEInvoice.mutate(uuid)}
                  disabled={submitEInvoice.isPending}
                >
                  {submitEInvoice.isPending ? 'Submitting...' : 'Submit to LHDN'}
                </Button>
              )}
              {transitions?.includes('VOID') && !['VOIDED', 'CANCELLED'].includes(status) && (
                <Button
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={handleVoid}
                  disabled={voidMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Invoice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-medium">
                {customer.name ?? invoice.customerName ?? '-'}
              </p>
              {customer.company && (
                <p className="text-sm text-muted-foreground">
                  {customer.company}
                </p>
              )}
              {customer.email && (
                <p className="text-sm text-muted-foreground">
                  {customer.email}
                </p>
              )}
              {customer.phone && (
                <p className="text-sm text-muted-foreground">
                  {customer.phone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Invoice Dates */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date</span>
                <span>{formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span>{invoice.currency ?? 'MYR'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
