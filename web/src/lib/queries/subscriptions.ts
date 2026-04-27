'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

// Types
export interface SubscriptionPlan {
  uuid: string;
  name: string;
  price: number;
  maxInvoicesPerMonth: number;
  maxUsers: number;
  maxStorageGb: number;
  lhdnEnabled: boolean;
  analyticsEnabled: boolean;
  recurringInvoicesEnabled: boolean;
  templatesEnabled: boolean;
  quotationsEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySubscription {
  uuid: string;
  status: string;
  invoiceCountThisMonth: number;
  storageUsedGb: number;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  company: (companyId: string) => [...subscriptionKeys.all, 'company', companyId] as const,
};

// Superadmin: List all plans
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async () => {
      const res = await client.get({
        url: 'api/v1/superadmin/subscriptions/plans',
      });
      return unwrapResponse<SubscriptionPlan[]>(res);
    },
  });
}

// Superadmin: Create plan
export function useCreateSubscriptionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SubscriptionPlan>) => {
      const res = await client.post({
        url: 'api/v1/superadmin/subscriptions/plans',
        body: data,
      });
      return unwrapResponse(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionKeys.plans() }),
  });
}

// Superadmin: Update plan
export function useUpdateSubscriptionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, ...data }: Partial<SubscriptionPlan> & { uuid: string }) => {
      const res = await client.put({
        url: `api/v1/superadmin/subscriptions/plans/${uuid}`,
        body: data,
      });
      return unwrapResponse(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: subscriptionKeys.plans() }),
  });
}

// Get company subscription
export function useCompanySubscription(companyId: string) {
  return useQuery({
    queryKey: subscriptionKeys.company(companyId),
    queryFn: async () => {
      const res = await client.get({
        url: `api/v1/superadmin/subscriptions/companies/${companyId}`,
      });
      return unwrapResponse<CompanySubscription>(res);
    },
    enabled: !!companyId,
  });
}

// Assign plan to company
export function useAssignSubscriptionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, planUuid }: { companyId: string; planUuid: string }) => {
      const res = await client.post({
        url: `api/v1/superadmin/subscriptions/companies/${companyId}/assign`,
        body: { planUuid },
      });
      return unwrapResponse(res);
    },
    onSuccess: (_, { companyId }) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.company(companyId) });
    },
  });
}

// Suspend company subscription
export function useSuspendSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const res = await client.post({
        url: `api/v1/superadmin/subscriptions/companies/${companyId}/suspend`,
        body: {},
      });
      return unwrapResponse(res);
    },
    onSuccess: (_, companyId) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.company(companyId) });
    },
  });
}

// Reactivate company subscription
export function useReactivateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const res = await client.post({
        url: `api/v1/superadmin/subscriptions/companies/${companyId}/reactivate`,
        body: {},
      });
      return unwrapResponse(res);
    },
    onSuccess: (_, companyId) => {
      qc.invalidateQueries({ queryKey: subscriptionKeys.company(companyId) });
    },
  });
}
