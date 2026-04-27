'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Repeat,
  Play,
  Pause,
  XCircle,
  Trash2,
  Plus,
  CalendarDays,
  Hash,
} from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
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

import {
  FormInput,
  FormSelect,
  FormDatePicker,
  FormTextarea,
  FormCombobox,
  FormNumberInput,
} from '@/components/forms';
import {
  createRecurringSchema,
  type CreateRecurringInput,
  FREQUENCIES,
} from '@/lib/validators/recurring';
import {
  useRecurringPlans,
  useCreateRecurringPlan,
  useDeleteRecurringPlan,
  usePauseRecurringPlan,
  useResumeRecurringPlan,
  useCancelRecurringPlan,
} from '@/lib/queries/recurring';
import { useCustomers } from '@/lib/queries/customers';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function RecurringPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [cancelUuid, setCancelUuid] = useState<string | null>(null);
  const [autoFinalize, setAutoFinalize] = useState(false);
  const [autoSend, setAutoSend] = useState(false);

  const { data: rawData, isLoading } = useRecurringPlans();
  const { data: customerData } = useCustomers({ limit: 100 });
  const createMutation = useCreateRecurringPlan();
  const deleteMutation = useDeleteRecurringPlan();
  const pauseMutation = usePauseRecurringPlan();
  const resumeMutation = useResumeRecurringPlan();
  const cancelMutation = useCancelRecurringPlan();

  const customers = useMemo(() => {
    if (!customerData) return [];
    const list = Array.isArray(customerData) ? customerData : (customerData as any)?.data ?? [];
    return list.map((c: any) => ({ value: c.uuid, label: c.name }));
  }, [customerData]);

  const form = useForm({
    resolver: zodResolver(createRecurringSchema),
    mode: 'onChange',
    defaultValues: {
      customerUuid: '',
      frequency: 'MONTHLY' as const,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const plans = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];
  }, [rawData]);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((p: any) => p.status === 'ACTIVE').length;
    const paused = plans.filter((p: any) => p.status === 'PAUSED').length;
    const cancelled = plans.filter((p: any) => p.status === 'CANCELLED').length;
    return { total, active, paused, cancelled };
  }, [plans]);

  const handleCreate = useCallback(async (values: any) => {
    try {
      await createMutation.mutateAsync({
        ...values,
        autoFinalize,
        autoSend,
      });
      toast.success('Recurring plan created');
      setShowCreate(false);
      form.reset();
      setAutoFinalize(false);
      setAutoSend(false);
    } catch {
      toast.error('Failed to create recurring plan');
    }
  }, [createMutation, form, autoFinalize, autoSend]);

  const handlePauseResume = useCallback(
    async (uuid: string, status: string) => {
      try {
        if (status === 'ACTIVE') {
          await pauseMutation.mutateAsync(uuid);
          toast.success('Plan paused');
        } else {
          await resumeMutation.mutateAsync(uuid);
          toast.success('Plan resumed');
        }
      } catch {
        toast.error('Action failed');
      }
    },
    [pauseMutation, resumeMutation]
  );

  const handleCancel = useCallback(async () => {
    if (!cancelUuid) return;
    try {
      await cancelMutation.mutateAsync(cancelUuid);
      toast.success('Plan cancelled');
    } catch {
      toast.error('Failed to cancel plan');
    }
    setCancelUuid(null);
  }, [cancelUuid, cancelMutation]);

  const handleDelete = useCallback(async () => {
    if (!deleteUuid) return;
    try {
      await deleteMutation.mutateAsync(deleteUuid);
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    }
    setDeleteUuid(null);
  }, [deleteUuid, deleteMutation]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium">{(getValue() as string) || '-'}</span>
        ),
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) =>
          row.original.customer?.name ?? row.original.customerName ?? '-',
      },
      {
        accessorKey: 'frequency',
        header: 'Frequency',
        cell: ({ getValue }) => (
          <Badge variant="outline">{(getValue() as string) || '-'}</Badge>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) =>
          formatCurrency(
            row.original.amount ?? row.original.totalAmount ?? 0
          ),
      },
      {
        accessorKey: 'nextRunDate',
        header: 'Next Date',
        cell: ({ row }) =>
          formatDate(
            row.original.nextRunDate ?? row.original.nextDate ?? null
          ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = (getValue() as string) || 'ACTIVE';
          return <StatusBadge status={status} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const { uuid, status } = row.original;
          return (
            <div className="flex items-center gap-1">
              {(status === 'ACTIVE' || status === 'PAUSED') && (
                <Button
                  variant="ghost"
                  size="icon"
                  title={status === 'ACTIVE' ? 'Pause' : 'Resume'}
                  onClick={() => handlePauseResume(uuid, status)}
                >
                  {status === 'ACTIVE' ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              )}
              {status !== 'CANCELLED' && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Cancel"
                  onClick={() => setCancelUuid(uuid)}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                title="Delete"
                onClick={() => setDeleteUuid(uuid)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handlePauseResume]
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Recurring Invoices"
        description="Manage recurring invoice plans"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          title="Total Plans"
          value={String(stats.total)}
          icon={Hash}
        />
        <StatCard
          title="Active"
          value={String(stats.active)}
          icon={Repeat}
        />
        <StatCard
          title="Paused"
          value={String(stats.paused)}
          icon={Pause}
        />
        <StatCard
          title="Cancelled"
          value={String(stats.cancelled)}
          icon={XCircle}
        />
      </div>

      <DataTable
        columns={columns}
        data={plans}
        isLoading={isLoading}
        emptyTitle="No recurring plans"
        emptyDescription="Create your first recurring invoice plan to automate billing."
      />

      {/* Create Plan Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) { form.reset(); setAutoFinalize(false); setAutoSend(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Recurring Plan</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormCombobox
                name="customerUuid"
                label="Customer"
                items={customers}
                searchPlaceholder="Search customers..."
                placeholder="Select a customer"
              />
              <FormSelect
                name="frequency"
                label="Frequency"
                options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker name="startDate" label="Start Date" />
                <FormDatePicker name="endDate" label="End Date" />
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Line Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 })}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Item
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <FormInput name={`items.${index}.description`} label="Description" />
                    <div className="grid grid-cols-2 gap-3">
                      <FormNumberInput name={`items.${index}.quantity`} label="Quantity" min={1} />
                      <FormNumberInput name={`items.${index}.unitPrice`} label="Unit Price" min={0} step={0.01} prefix="RM" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormNumberInput name={`items.${index}.taxRate`} label="Tax Rate (%)" min={0} max={100} />
                      <FormNumberInput name={`items.${index}.discount`} label="Discount" min={0} step={0.01} />
                    </div>
                  </div>
                ))}
                {form.formState.errors.items?.message && (
                  <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Auto-finalize invoices</Label>
                <Switch checked={autoFinalize} onCheckedChange={setAutoFinalize} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Auto-send invoices</Label>
                <Switch checked={autoSend} onCheckedChange={setAutoSend} />
              </div>

              <FormTextarea name="notes" label="Notes" />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating…' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelUuid} onOpenChange={() => setCancelUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this recurring plan? No further
              invoices will be generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Plan</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Cancel Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUuid} onOpenChange={() => setDeleteUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring plan? This action
              cannot be undone.
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
