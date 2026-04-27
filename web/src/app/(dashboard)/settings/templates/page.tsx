'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Plus, Star, Trash2, Pencil } from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FormInput, FormTextarea } from '@/components/forms';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useInvoiceTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useSetDefaultTemplate,
} from '@/lib/queries/settings';
import { invoiceTemplateSchema, type InvoiceTemplateInput } from '@/lib/validators/template';

export default function TemplatesPage() {
  const { data: templates, isLoading } = useInvoiceTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const setDefault = useSetDefaultTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<InvoiceTemplateInput>({
    resolver: zodResolver(invoiceTemplateSchema),
    defaultValues: { name: '', description: '', content: '' },
  });

  const openCreate = () => {
    setEditingTemplate(null);
    form.reset({ name: '', description: '', content: '' });
    setDialogOpen(true);
  };

  const openEdit = (tpl: any) => {
    setEditingTemplate(tpl);
    form.reset({
      name: tpl.name ?? '',
      description: tpl.description ?? '',
      content: tpl.content ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: InvoiceTemplateInput) => {
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ uuid: editingTemplate.uuid, body: values });
        toast.success('Template updated');
      } else {
        await createTemplate.mutateAsync(values);
        toast.success('Template created');
      }
      setDialogOpen(false);
    } catch {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTemplate.mutateAsync(deleteId);
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
    setDeleteId(null);
  };

  const handleSetDefault = async (uuid: string) => {
    try {
      await setDefault.mutateAsync(uuid);
      toast.success('Default template set');
    } catch {
      toast.error('Failed to set default');
    }
  };

  const templateList: any[] = Array.isArray(templates) ? templates : (templates as any)?.data ?? [];

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Invoice Templates"
        description="Create and manage invoice templates"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : templateList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No templates yet. Create your first template.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templateList.map((tpl: any) => (
            <Card key={tpl.uuid} className="relative">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate">{tpl.name}</span>
                  {tpl.isDefault && (
                    <Badge variant="default" className="ml-2 shrink-0">
                      <Star className="mr-1 h-3 w-3" /> Default
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {tpl.description || 'No description'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(tpl)}>
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  {!tpl.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(tpl.uuid)}>
                      <Star className="mr-1 h-3 w-3" /> Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive ml-auto"
                    onClick={() => setDeleteId(tpl.uuid)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="name" label="Template Name" maxLength={255} />
              <FormTextarea name="description" label="Description" rows={2} />
              <FormTextarea name="content" label="Content" rows={6} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTemplate.isPending || updateTemplate.isPending}
                >
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this template?
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
