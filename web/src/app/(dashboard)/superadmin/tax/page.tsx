'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
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
  useSuperadminTaxRules, useCreateSuperadminTaxRule, useUpdateSuperadminTaxRule, useDeleteSuperadminTaxRule,
  useSuperadminTaxCategories, useCreateSuperadminTaxCategory, useUpdateSuperadminTaxCategory, useDeleteSuperadminTaxCategory,
} from '@/lib/queries/superadmin';

interface TaxRuleForm {
  name: string;
  rate: string;
  description: string;
}

interface TaxCategoryForm {
  name: string;
  code: string;
  description: string;
}

const INITIAL_RULE_FORM: TaxRuleForm = { name: '', rate: '', description: '' };
const INITIAL_CATEGORY_FORM: TaxCategoryForm = { name: '', code: '', description: '' };

export default function SuperadminTaxPage() {
  // Tax Rules state
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRuleUuid, setEditingRuleUuid] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<TaxRuleForm>(INITIAL_RULE_FORM);
  const [deleteRuleUuid, setDeleteRuleUuid] = useState<string | null>(null);

  // Tax Categories state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategoryUuid, setEditingCategoryUuid] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<TaxCategoryForm>(INITIAL_CATEGORY_FORM);
  const [deleteCategoryUuid, setDeleteCategoryUuid] = useState<string | null>(null);

  // Queries
  const { data: rulesData, isLoading: rulesLoading } = useSuperadminTaxRules();
  const { data: categoriesData, isLoading: categoriesLoading } = useSuperadminTaxCategories();

  // Mutations
  const createRule = useCreateSuperadminTaxRule();
  const updateRule = useUpdateSuperadminTaxRule();
  const deleteRule = useDeleteSuperadminTaxRule();
  const createCategory = useCreateSuperadminTaxCategory();
  const updateCategory = useUpdateSuperadminTaxCategory();
  const deleteCategory = useDeleteSuperadminTaxCategory();

  const rules: any[] = useMemo(() => {
    if (Array.isArray(rulesData)) return rulesData;
    return (rulesData as any)?.data ?? [];
  }, [rulesData]);

  const categories: any[] = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData;
    return (categoriesData as any)?.data ?? [];
  }, [categoriesData]);

  // Rule handlers
  const openCreateRule = useCallback(() => {
    setEditingRuleUuid(null);
    setRuleForm(INITIAL_RULE_FORM);
    setShowRuleDialog(true);
  }, []);

  const openEditRule = useCallback((rule: any) => {
    setEditingRuleUuid(rule.uuid);
    setRuleForm({ name: rule.name ?? '', rate: String(rule.rate ?? ''), description: rule.description ?? '' });
    setShowRuleDialog(true);
  }, []);

  const handleSaveRule = useCallback(async () => {
    if (!ruleForm.name) return;
    try {
      const body = { name: ruleForm.name, rate: parseFloat(ruleForm.rate) || 0, description: ruleForm.description || undefined };
      if (editingRuleUuid) {
        await updateRule.mutateAsync({ uuid: editingRuleUuid, body });
        toast.success('Tax rule updated');
      } else {
        await createRule.mutateAsync(body);
        toast.success('Tax rule created');
      }
      setShowRuleDialog(false);
      setRuleForm(INITIAL_RULE_FORM);
    } catch {
      toast.error('Failed to save tax rule');
    }
  }, [ruleForm, editingRuleUuid, createRule, updateRule]);

  const handleDeleteRule = useCallback(async () => {
    if (!deleteRuleUuid) return;
    try {
      await deleteRule.mutateAsync(deleteRuleUuid);
      toast.success('Tax rule deleted');
    } catch {
      toast.error('Failed to delete tax rule');
    }
    setDeleteRuleUuid(null);
  }, [deleteRuleUuid, deleteRule]);

  // Category handlers
  const openCreateCategory = useCallback(() => {
    setEditingCategoryUuid(null);
    setCategoryForm(INITIAL_CATEGORY_FORM);
    setShowCategoryDialog(true);
  }, []);

  const openEditCategory = useCallback((cat: any) => {
    setEditingCategoryUuid(cat.uuid);
    setCategoryForm({ name: cat.name ?? '', code: cat.code ?? '', description: cat.description ?? '' });
    setShowCategoryDialog(true);
  }, []);

  const handleSaveCategory = useCallback(async () => {
    if (!categoryForm.name) return;
    try {
      const body = { name: categoryForm.name, code: categoryForm.code || undefined, description: categoryForm.description || undefined };
      if (editingCategoryUuid) {
        await updateCategory.mutateAsync({ uuid: editingCategoryUuid, body });
        toast.success('Tax category updated');
      } else {
        await createCategory.mutateAsync(body);
        toast.success('Tax category created');
      }
      setShowCategoryDialog(false);
      setCategoryForm(INITIAL_CATEGORY_FORM);
    } catch {
      toast.error('Failed to save tax category');
    }
  }, [categoryForm, editingCategoryUuid, createCategory, updateCategory]);

  const handleDeleteCategory = useCallback(async () => {
    if (!deleteCategoryUuid) return;
    try {
      await deleteCategory.mutateAsync(deleteCategoryUuid);
      toast.success('Tax category deleted');
    } catch {
      toast.error('Failed to delete tax category');
    }
    setDeleteCategoryUuid(null);
  }, [deleteCategoryUuid, deleteCategory]);

  // Columns
  const ruleColumns: ColumnDef<any>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium">{(getValue() as string) || '-'}</span> },
      { accessorKey: 'rate', header: 'Rate (%)', cell: ({ getValue }) => `${getValue() ?? 0}%` },
      { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="max-w-xs truncate text-sm text-muted-foreground">{(getValue() as string) || '-'}</span> },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEditRule(row.original)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteRuleUuid(row.original.uuid)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ),
      },
    ],
    [openEditRule]
  );

  const categoryColumns: ColumnDef<any>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium">{(getValue() as string) || '-'}</span> },
      { accessorKey: 'code', header: 'Code', cell: ({ getValue }) => <span className="font-mono text-sm">{(getValue() as string) || '-'}</span> },
      { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => <span className="max-w-xs truncate text-sm text-muted-foreground">{(getValue() as string) || '-'}</span> },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEditCategory(row.original)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteCategoryUuid(row.original.uuid)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ),
      },
    ],
    [openEditCategory]
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Tax Management"
        description="Manage platform-wide tax rules and categories"
      />

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Tax Rules</TabsTrigger>
          <TabsTrigger value="categories">Tax Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tax Rules</CardTitle>
              <Button size="sm" onClick={openCreateRule}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={ruleColumns}
                data={rules}
                isLoading={rulesLoading}
                emptyTitle="No tax rules"
                emptyDescription="Create your first tax rule to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tax Categories</CardTitle>
              <Button size="sm" onClick={openCreateCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={categoryColumns}
                data={categories}
                isLoading={categoriesLoading}
                emptyTitle="No tax categories"
                emptyDescription="Create your first tax category to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tax Rule Create/Edit Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRuleUuid ? 'Edit Tax Rule' : 'Create Tax Rule'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="e.g. SST" />
            </div>
            <div className="grid gap-2">
              <Label>Rate (%) *</Label>
              <Input type="number" step="0.01" value={ruleForm.rate} onChange={(e) => setRuleForm({ ...ruleForm, rate: e.target.value })} placeholder="6" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={ruleForm.description} onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRule} disabled={!ruleForm.name || createRule.isPending || updateRule.isPending}>
              {editingRuleUuid ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tax Category Create/Edit Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategoryUuid ? 'Edit Tax Category' : 'Create Tax Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Standard Rate" />
            </div>
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input value={categoryForm.code} onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })} placeholder="e.g. STD" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name || createCategory.isPending || updateCategory.isPending}>
              {editingCategoryUuid ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Rule Confirmation */}
      <AlertDialog open={!!deleteRuleUuid} onOpenChange={() => setDeleteRuleUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rule</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this tax rule? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryUuid} onOpenChange={() => setDeleteCategoryUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Category</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this tax category? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RoleGuard>
  );
}
