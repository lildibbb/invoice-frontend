'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Form } from '@/components/ui/form';
import { FormInput, FormTextarea, FormCombobox, FormSwitch, FormNumberInput } from '@/components/forms';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { handleFormError } from '@/lib/utils/form-errors';
import { useDebounce } from '@/lib/hooks/use-debounce';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useClassificationCodes,
  useRestoreProduct,
} from '@/lib/queries/products';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency } from '@/lib/utils';
import { productBaseSchema, type ProductBaseInput } from '@/lib/validators/product';
import { classificationCodes, unitMeasureCodes, countryCodes } from '@/lib/constants/lhdn';

interface Product {
  uuid: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  code?: string;
  classificationCode?: string;
  productTariffCode?: string;
  countryOfOrigin?: string;
  unitOfMeasureCode?: string;
  inStock?: number;
  isTaxExempt?: boolean;
  taxExemptionReason?: string;
  taxCategoryUuid?: string;
  taxCategory?: { rate?: number };
  status?: string;
  deletedAt?: string | null;
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const form = useForm<ProductBaseInput>({
    resolver: zodResolver(productBaseSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      classificationCode: '',
      productTariffCode: '',
      countryOfOrigin: 'MYS',
      unitOfMeasureCode: '',
      inStock: 0,
      isTaxExempt: false,
      taxExemptionReason: '',
    },
  });

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
  });

  const products = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list;
  }, [data]);

  const total = data?.meta?.total ?? data?.total ?? products.length;
  const activeCount = useMemo(
    () => products.filter((p: Product) => p.status === 'active' || !p.deletedAt).length,
    [products]
  );

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();
  useClassificationCodes();

  const resetForm = () => {
    setEditingProduct(null);
    form.reset();
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? 0,
      isTaxExempt: product.isTaxExempt ?? false,
      taxExemptionReason: product.taxExemptionReason ?? '',
      classificationCode: product.classificationCode ?? '',
      productTariffCode: product.productTariffCode ?? '',
      countryOfOrigin: product.countryOfOrigin ?? 'MYS',
      unitOfMeasureCode: product.unitOfMeasureCode ?? '',
      inStock: product.inStock ?? 0,
    });
    setShowFormDialog(true);
  };

  const isTaxExempt = form.watch('isTaxExempt');

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ uuid: editingProduct.uuid, body: data });
        toast.success('Product updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Product created');
      }
      setShowFormDialog(false);
      resetForm();
    } catch (error) {
      handleFormError(error, form.setError, editingProduct ? 'Failed to update' : 'Failed to create');
    }
  });

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

  const handleRestore = useCallback(async (uuid: string) => {
    try {
      await restoreMutation.mutateAsync(uuid);
      toast.success('Product restored');
    } catch {
      toast.error('Failed to restore product');
    }
  }, [restoreMutation]);

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.sku ?? row.original.code ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) =>
          formatCurrency(row.original.price),
      },
      {
        accessorKey: 'taxRate',
        header: 'Tax Rate',
        cell: ({ row }) => {
          if (row.original.isTaxExempt) return <Badge variant="outline">Exempt</Badge>;
          const rate = row.original.taxCategory?.rate;
          return rate != null ? `${rate}%` : '-';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status ?? (row.original.deletedAt ? 'INACTIVE' : 'ACTIVE');
          return <StatusBadge status={status.toUpperCase()} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
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
    []
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Products"
        actions={
          <Button onClick={() => { resetForm(); setShowFormDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard title="Total Products" value={String(total)} icon={Package} />
        <StatCard title="Active" value={String(activeCount)} icon={Package} />
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        toolbar={
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        }
        emptyTitle="No products found"
        emptyDescription="Get started by adding your first product."
      />

      {/* Create/Edit Dialog */}
      <Dialog open={showFormDialog} onOpenChange={(open) => { setShowFormDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <FormInput name="name" label="Product Name" />
                <FormNumberInput name="price" label="Price" prefix="RM" min={0} />
                <FormTextarea name="description" label="Description" className="col-span-2" />
                <FormCombobox name="classificationCode" label="Classification Code" items={classificationCodes.map(c => ({ value: c.Code, label: c.Description, description: c.Code }))} searchPlaceholder="Search classification..." />
                <FormInput name="productTariffCode" label="Tariff Code" maxLength={20} />
                <FormCombobox name="countryOfOrigin" label="Country of Origin" items={countryCodes.map(c => ({ value: c.Code, label: `${c.Code} — ${c.Country}` }))} searchPlaceholder="Search country..." />
                <FormCombobox name="unitOfMeasureCode" label="Unit of Measure" items={unitMeasureCodes.map(c => ({ value: c.Code, label: c.Name, description: c.Code }))} searchPlaceholder="Search unit..." />
                <FormNumberInput name="inStock" label="Initial Stock" min={0} step={1} />
                <FormSwitch name="isTaxExempt" label="Tax Exempt" className="col-span-2" />
                {isTaxExempt && (
                  <FormInput name="taxExemptionReason" label="Exemption Reason" maxLength={255} className="col-span-2" />
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProduct ? 'Update' : 'Create'}
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
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product?
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
