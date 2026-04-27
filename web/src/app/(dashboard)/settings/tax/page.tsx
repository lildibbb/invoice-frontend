'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { MembershipRole, GlobalRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { FormInput, FormNumberInput, FormTextarea } from '@/components/forms';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTaxCategories,
  useCreateTaxCategory,
  useUpdateTaxCategory,
  useDeleteTaxCategory,
  useTaxRules,
  useCreateTaxRule,
  useUpdateTaxRule,
  useDeleteTaxRule,
} from '@/lib/queries/settings';
import {
  taxCategorySchema,
  type TaxCategoryInput,
  taxRuleSchema,
  type TaxRuleInput,
} from '@/lib/validators/tax';

// ── Tax Categories Tab ──

function TaxCategoriesTab() {
  const { data, isLoading, error } = useTaxCategories();
  const createCat = useCreateTaxCategory();
  const updateCat = useUpdateTaxCategory();
  const deleteCat = useDeleteTaxCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<TaxCategoryInput>({
    resolver: zodResolver(taxCategorySchema),
    defaultValues: { code: '', description: '' },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ code: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    form.reset({ code: item.code ?? '', description: item.description ?? '' });
    setDialogOpen(true);
  };

  const onSubmit = async (values: TaxCategoryInput) => {
    try {
      if (editing) {
        await updateCat.mutateAsync({ uuid: editing.uuid, body: values });
        toast.success('Category updated');
      } else {
        await createCat.mutateAsync(values);
        toast.success('Category created');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCat.mutateAsync(deleteId);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
    setDeleteId(null);
  };

  const items: any[] = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const d = data as any;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.items)) return d.items;
    return [];
  })();

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-destructive">
        Failed to load tax categories. {(error as any)?.message ?? ''}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No tax categories
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => (
                <TableRow key={item.uuid}>
                  <TableCell className="font-mono">{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant={item.isSystem ? 'secondary' : 'outline'}>
                      {item.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!item.isSystem && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(item.uuid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'New Tax Category'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="code" label="Code" transform="uppercase" />
              <FormInput name="description" label="Description" />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createCat.isPending || updateCat.isPending}>
                  {editing ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Tax Rules Tab ──

function TaxRulesTab() {
  const { data, isLoading, error } = useTaxRules();
  const createRule = useCreateTaxRule();
  const updateRule = useUpdateTaxRule();
  const deleteRule = useDeleteTaxRule();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<TaxRuleInput>({
    resolver: zodResolver(taxRuleSchema),
    defaultValues: { name: '', rate: 0, description: '' },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: '', rate: 0, description: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    form.reset({ name: item.name ?? '', rate: item.rate ?? 0, description: item.description ?? '' });
    setDialogOpen(true);
  };

  const onSubmit = async (values: TaxRuleInput) => {
    try {
      if (editing) {
        await updateRule.mutateAsync({ uuid: editing.uuid, body: values });
        toast.success('Rule updated');
      } else {
        await createRule.mutateAsync(values);
        toast.success('Rule created');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save rule');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRule.mutateAsync(deleteId);
      toast.success('Rule deleted');
    } catch {
      toast.error('Failed to delete rule');
    }
    setDeleteId(null);
  };

  const items: any[] = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const d = data as any;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.items)) return d.items;
    return [];
  })();

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-destructive">
        Failed to load tax rules. {(error as any)?.message ?? ''}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rate (%)</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No tax rules
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => (
                <TableRow key={item.uuid}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.rate}%</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.isSystem ? 'secondary' : 'outline'}>
                      {item.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!item.isSystem && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(item.uuid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Rule' : 'New Tax Rule'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="name" label="Name" />
              <FormNumberInput name="rate" label="Rate (%)" min={0} max={100} />
              <FormTextarea name="description" label="Description" />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createRule.isPending || updateRule.isPending}>
                  {editing ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Main Page ──

export default function TaxPage() {
  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tax Management" description="Manage tax categories and rules" />

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="categories">
            <TabsList>
              <TabsTrigger value="categories">Tax Categories</TabsTrigger>
              <TabsTrigger value="rules">Tax Rules</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="mt-4">
              <TaxCategoriesTab />
            </TabsContent>
            <TabsContent value="rules" className="mt-4">
              <TaxRulesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </RoleGuard>
  );
}
