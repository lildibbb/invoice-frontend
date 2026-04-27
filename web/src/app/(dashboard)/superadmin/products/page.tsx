'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Search, Trash2, RotateCcw } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole } from '@/lib/types/roles';
import {
  useSuperadminProducts,
  useDeleteSuperadminProduct,
  useRestoreSuperadminProduct,
} from '@/lib/queries/superadmin';
import { formatCurrency } from '@/lib/utils';

export default function SuperadminProductsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [restoreUuid, setRestoreUuid] = useState<string | null>(null);

  const { data: rawData, isLoading } = useSuperadminProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: appliedSearch || undefined,
  });

  const deleteMutation = useDeleteSuperadminProduct();
  const restoreMutation = useRestoreSuperadminProduct();

  const products = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    return (rawData as any)?.data ?? [];
  }, [rawData]);

  const totalRecords = (rawData as any)?.meta?.total ?? (rawData as any)?.total ?? products.length;
  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  const handleDelete = useCallback(async () => {
    if (!deleteUuid) return;
    try {
      await deleteMutation.mutateAsync(deleteUuid);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
    setDeleteUuid(null);
  }, [deleteUuid, deleteMutation]);

  const handleRestore = useCallback(async () => {
    if (!restoreUuid) return;
    try {
      await restoreMutation.mutateAsync(restoreUuid);
      toast.success('Product restored');
    } catch {
      toast.error('Failed to restore product');
    }
    setRestoreUuid(null);
  }, [restoreUuid, restoreMutation]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => <span className="font-medium">{(getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ getValue }) => <span className="font-mono text-sm">{(getValue() as string) || '-'}</span>,
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => row.original.company?.name ?? row.original.companyName ?? '-',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => formatCurrency(row.original.price ?? row.original.unitPrice ?? 0),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const deleted = row.original.deletedAt != null;
          const status = deleted ? 'INACTIVE' : (row.original.status ?? 'ACTIVE').toUpperCase();
          return <StatusBadge status={status} />;
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const deleted = row.original.deletedAt != null;
          return (
            <div className="flex items-center gap-1">
              {deleted ? (
                <Button variant="ghost" size="icon" title="Restore" onClick={() => setRestoreUuid(row.original.uuid)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteUuid(row.original.uuid)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Products"
        description="Manage products across all tenants"
      />

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setAppliedSearch(search.trim());
            }}
          />
        </div>
        <Button variant="outline" onClick={() => setAppliedSearch(search.trim())}>
          Search
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRecords={totalRecords}
        emptyTitle="No products found"
        emptyDescription="No products match your search criteria."
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUuid} onOpenChange={() => setDeleteUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this product?</AlertDialogDescription>
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
            <AlertDialogTitle>Restore Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to restore this product?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RoleGuard>
  );
}
