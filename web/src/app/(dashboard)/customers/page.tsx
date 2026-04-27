'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  DollarSign,
  Upload,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  CheckCircle,
  X,
  RotateCcw,
  Download,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';
import { FormInput, FormSelect, FormCombobox } from '@/components/forms';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { handleFormError } from '@/lib/utils/form-errors';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useSse } from '@/lib/hooks/use-sse';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useBulkUploadCustomers,
  useRestoreCustomer,
  useDownloadBulkErrors,
} from '@/lib/queries/customers';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency } from '@/lib/utils';
import { createCustomerSchema, type CreateCustomerInput, ID_TYPES } from '@/lib/validators/customer';
import { stateCodes, countryCodes } from '@/lib/constants/lhdn';

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const debouncedSearch = useDebounce(search, 300);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadJobId, setUploadJobId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customer form dialog
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      tin: '',
      idNumber: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      city: '',
      state: '',
      country: 'MYS',
    },
  });

  // Delete confirmation
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
  });

  const customers = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? [];
    if (statusFilter === 'all') return list;
    return list.filter(
      (c: any) =>
        (statusFilter === 'active' && (c.status === 'active' || c.isActive !== false)) ||
        (statusFilter === 'inactive' && (c.status === 'inactive' || c.isActive === false))
    );
  }, [data, statusFilter]);

  const totalRecords = data?.meta?.total ?? data?.total ?? customers.length;
  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  // Stats
  const totalCustomers = totalRecords;
  const activeCustomers = useMemo(
    () => customers.filter((c: any) => c.status === 'active' || c.isActive !== false).length,
    [customers]
  );
  const totalRevenue = useMemo(
    () => customers.reduce((s: number, c: any) => s + (c.totalInvoiced ?? 0), 0),
    [customers]
  );

  // SSE for upload progress
  const sseUrl = uploadJobId
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/customers/bulk-upload/progress/${uploadJobId}`
    : null;
  const { data: sseData, status: sseStatus } = useSse(sseUrl);
  const uploadProgress = (sseData as any)?.percentage ?? 0;
  const uploadDone =
    (sseData as any)?.status === 'completed' || uploadProgress >= 100;

  // Mutations
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const bulkUploadMutation = useBulkUploadCustomers();
  const restoreMutation = useRestoreCustomer();
  const downloadErrorsMutation = useDownloadBulkErrors();

  const handleBulkUpload = useCallback(async () => {
    if (!uploadFile) return;
    try {
      const result = await bulkUploadMutation.mutateAsync(uploadFile);
      const jobId = result?.jobId ?? result?.id ?? '';
      if (jobId) {
        setUploadJobId(jobId);
      } else {
        toast.success('Bulk upload completed');
        setShowUploadDialog(false);
        setUploadFile(null);
      }
    } catch {
      toast.error('Bulk upload failed');
    }
  }, [uploadFile, bulkUploadMutation]);

  const handleDelete = useCallback(async () => {
    if (!deleteUuid) return;
    try {
      await deleteMutation.mutateAsync(deleteUuid);
      toast.success('Customer deleted');
    } catch {
      toast.error('Failed to delete customer');
    }
    setDeleteUuid(null);
  }, [deleteUuid, deleteMutation]);

  const handleRestore = useCallback(async (uuid: string) => {
    try {
      await restoreMutation.mutateAsync(uuid);
      toast.success('Customer restored');
    } catch {
      toast.error('Failed to restore customer');
    }
  }, [restoreMutation]);

  const handleDownloadErrors = useCallback(async (errorToken: string) => {
    try {
      const data = await downloadErrorsMutation.mutateAsync(errorToken);
      if (data instanceof Blob) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-upload-errors.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success('Error file downloaded');
    } catch {
      toast.error('Failed to download errors');
    }
  }, [downloadErrorsMutation]);

  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          uuid: editingCustomer.uuid,
          body: data,
        });
        toast.success('Customer updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Customer created');
      }
      setShowFormDialog(false);
      setEditingCustomer(null);
      form.reset();
    } catch (error) {
      handleFormError(error, form.setError, editingCustomer ? 'Failed to update' : 'Failed to create');
    }
  });

  const openEdit = (customer: any) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      tin: customer.tin ?? '',
      idType: customer.idType ?? undefined,
      idNumber: customer.idNumber ?? '',
      addressLine1: customer.addressLine1 ?? customer.address ?? '',
      addressLine2: customer.addressLine2 ?? '',
      postalCode: customer.postalCode ?? '',
      city: customer.city ?? '',
      state: customer.state ?? '',
      country: customer.country ?? 'MYS',
    });
    setShowFormDialog(true);
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(row.original.name)}
            </div>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ getValue }) => getValue() || '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = (getValue() as string) ?? 'active';
          return <StatusBadge status={status.toUpperCase()} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/customers/${row.original.uuid}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteUuid(row.original.uuid)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            {row.original.deletedAt && (
              <Button variant="ghost" size="icon" onClick={() => handleRestore(row.original.uuid)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [router]
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => { setEditingCustomer(null); form.reset(); setShowFormDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </>
        }
      />

      {/* Upload progress */}
      {uploadJobId && !uploadDone && (
        <div className="mb-6 rounded-lg shadow-md shadow-black/5 border-0 bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Uploading customers...</span>
            <span className="text-primary font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      {uploadJobId && uploadDone && (
        <div className="mb-6 flex items-center gap-2 rounded-lg shadow-md shadow-black/5 border-0 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            Bulk upload completed successfully
          </span>
          {(sseData as any)?.errorToken && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadErrors((sseData as any).errorToken)}
              disabled={downloadErrorsMutation.isPending}
            >
              <Download className="mr-1 h-3 w-3" />
              Download Errors
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setUploadJobId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Customers" value={String(totalCustomers)} icon={Users} />
        <StatCard title="Active" value={String(activeCustomers)} icon={UserCheck} />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Filters + Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRecords={totalRecords}
        toolbar={
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle={debouncedSearch ? `No results for "${debouncedSearch}"` : 'No customers yet'}
        emptyDescription={debouncedSearch ? 'Try a different search term or clear the filter.' : 'Get started by adding your first customer.'}
      />

      {/* Bulk Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Customers</DialogTitle>
          </DialogHeader>
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg bg-muted/30 shadow-inner p-8 text-center transition-colors hover:bg-muted/50"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) setUploadFile(file);
            }}
          >
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              {uploadFile ? uploadFile.name : 'Click or drag a CSV file here'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Accepts .csv and .xlsx files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadFile(file);
              }}
            />
          </div>
          {bulkUploadMutation.isPending && (
            <Progress value={uploadProgress} className="mt-4 h-2" />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={!uploadFile || bulkUploadMutation.isPending}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={(open) => { setShowFormDialog(open); if (!open) { setEditingCustomer(null); form.reset(); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <FormInput name="name" label="Name" />
                <FormInput name="email" label="Email" type="email" />
                <FormInput name="phone" label="Phone" maxLength={20} />
                <FormInput name="tin" label="TIN" transform="uppercase" maxLength={50} description="Tax Identification Number — uppercase letters, numbers, hyphens only" />
                <FormSelect name="idType" label="ID Type" options={ID_TYPES.map(t => ({ value: t, label: t }))} placeholder="Select ID type" />
                <FormInput name="idNumber" label="ID Number" maxLength={50} />
                <FormInput name="addressLine1" label="Address Line 1" className="col-span-2" />
                <FormInput name="addressLine2" label="Address Line 2" className="col-span-2" />
                <FormInput name="postalCode" label="Postal Code" maxLength={5} />
                <FormInput name="city" label="City" />
                <FormCombobox name="state" label="State" items={stateCodes.map(s => ({ value: s.State, label: s.State }))} searchPlaceholder="Search state..." />
                <FormCombobox name="country" label="Country" items={countryCodes.map(c => ({ value: c.Code, label: `${c.Code} — ${c.Country}` }))} searchPlaceholder="Search country..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCustomer ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteUuid} onOpenChange={() => setDeleteUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be
              undone.
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

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
