'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, CheckCircle2, CreditCard, Users, HardDrive, FileText } from 'lucide-react';
import { RoleGuard } from '@/components/role-guard';
import { GlobalRole } from '@/lib/types/roles';
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  type SubscriptionPlan,
} from '@/lib/queries/subscriptions';

interface PlanForm {
  name: string;
  price: string;
  maxInvoicesPerMonth: string;
  maxUsers: string;
  maxStorageGb: string;
  lhdnEnabled: boolean;
  analyticsEnabled: boolean;
  recurringInvoicesEnabled: boolean;
  templatesEnabled: boolean;
  quotationsEnabled: boolean;
  isActive: boolean;
}

const INITIAL_FORM: PlanForm = {
  name: '',
  price: '',
  maxInvoicesPerMonth: '',
  maxUsers: '',
  maxStorageGb: '',
  lhdnEnabled: false,
  analyticsEnabled: false,
  recurringInvoicesEnabled: false,
  templatesEnabled: false,
  quotationsEnabled: false,
  isActive: true,
};

function planToForm(plan: SubscriptionPlan): PlanForm {
  return {
    name: plan.name,
    price: String(plan.price),
    maxInvoicesPerMonth: String(plan.maxInvoicesPerMonth),
    maxUsers: String(plan.maxUsers),
    maxStorageGb: String(plan.maxStorageGb),
    lhdnEnabled: plan.lhdnEnabled,
    analyticsEnabled: plan.analyticsEnabled,
    recurringInvoicesEnabled: plan.recurringInvoicesEnabled,
    templatesEnabled: plan.templatesEnabled,
    quotationsEnabled: plan.quotationsEnabled,
    isActive: plan.isActive,
  };
}

function formToData(form: PlanForm): Partial<SubscriptionPlan> {
  return {
    name: form.name,
    price: parseFloat(form.price) || 0,
    maxInvoicesPerMonth: parseInt(form.maxInvoicesPerMonth) || 0,
    maxUsers: parseInt(form.maxUsers) || 0,
    maxStorageGb: parseFloat(form.maxStorageGb) || 0,
    lhdnEnabled: form.lhdnEnabled,
    analyticsEnabled: form.analyticsEnabled,
    recurringInvoicesEnabled: form.recurringInvoicesEnabled,
    templatesEnabled: form.templatesEnabled,
    quotationsEnabled: form.quotationsEnabled,
    isActive: form.isActive,
  };
}

const FEATURE_FIELDS: { key: keyof Pick<PlanForm, 'lhdnEnabled' | 'analyticsEnabled' | 'recurringInvoicesEnabled' | 'templatesEnabled' | 'quotationsEnabled'>; label: string }[] = [
  { key: 'lhdnEnabled', label: 'LHDN e-Invoice' },
  { key: 'analyticsEnabled', label: 'Advanced Analytics' },
  { key: 'recurringInvoicesEnabled', label: 'Recurring Invoices' },
  { key: 'templatesEnabled', label: 'Invoice Templates' },
  { key: 'quotationsEnabled', label: 'Quotations' },
];

export default function SuperadminSubscriptionsPage() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();

  const [showDialog, setShowDialog] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(INITIAL_FORM);

  const planList = (plans as SubscriptionPlan[] | null) ?? [];

  function openCreate() {
    setEditingUuid(null);
    setForm(INITIAL_FORM);
    setShowDialog(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditingUuid(plan.uuid);
    setForm(planToForm(plan));
    setShowDialog(true);
  }

  function setField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingUuid) {
        await updatePlan.mutateAsync({ uuid: editingUuid, ...formToData(form) });
        toast.success('Plan updated');
      } else {
        await createPlan.mutateAsync(formToData(form));
        toast.success('Plan created');
      }
      setShowDialog(false);
    } catch {
      toast.error('Failed to save plan');
    }
  }

  const isSaving = createPlan.isPending || updatePlan.isPending;

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Subscription Plans"
          description="Manage platform subscription plans"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16 mt-1" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : planList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No plans yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first subscription plan</p>
            <Button onClick={openCreate} className="mt-4 gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planList.map((plan) => (
            <Card key={plan.uuid} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="mt-0.5">
                      {plan.price > 0 ? `RM ${plan.price}/mo` : 'Free'}
                    </CardDescription>
                  </div>
                  <StatusBadge status={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Limits */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <FileText className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#0F172A]">{plan.maxInvoicesPerMonth}</p>
                    <p className="text-[10px] text-slate-400">Invoices</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <Users className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#0F172A]">{plan.maxUsers}</p>
                    <p className="text-[10px] text-slate-400">Users</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <HardDrive className="h-4 w-4 text-violet-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#0F172A]">{plan.maxStorageGb}GB</p>
                    <p className="text-[10px] text-slate-400">Storage</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5">
                  {FEATURE_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 flex-shrink-0 ${
                          plan[key] ? 'text-emerald-500' : 'text-slate-200'
                        }`}
                      />
                      <span className={`text-xs ${plan[key] ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => openEdit(plan)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUuid ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Starter, Professional"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (RM/mo)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxInvoices">Max Invoices/Month</Label>
                <Input
                  id="maxInvoices"
                  type="number"
                  min="0"
                  value={form.maxInvoicesPerMonth}
                  onChange={(e) => setField('maxInvoicesPerMonth', e.target.value)}
                  placeholder="50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  value={form.maxUsers}
                  onChange={(e) => setField('maxUsers', e.target.value)}
                  placeholder="3"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxStorage">Max Storage (GB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.maxStorageGb}
                  onChange={(e) => setField('maxStorageGb', e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Features</p>
              {FEATURE_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="cursor-pointer font-normal">
                    {label}
                  </Label>
                  <Switch
                    id={key}
                    checked={form[key] as boolean}
                    onCheckedChange={(val) => setField(key, val)}
                  />
                </div>
              ))}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-slate-400">Make this plan available to companies</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(val) => setField('isActive', val)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : editingUuid ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
