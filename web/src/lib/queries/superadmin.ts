'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  superAdminAnalyticsControllerGetPlatformOverview,
  superAdminAnalyticsControllerGetPlatformRevenue,
  superAdminAnalyticsControllerGetTopCompanies,
  superAdminCompaniesControllerFindAll,
  superAdminCompaniesControllerDelete,
  superAdminCompaniesControllerRestore,
  superAdminCompaniesControllerToggleStatus,
  superadminUsersControllerFindAll,
  superadminUsersControllerFindOne,
  superadminUsersControllerInviteAdmin,
  superadminUsersControllerDelete,
  superadminUsersControllerRestore,
  superadminProductsControllerFindAll,
  superadminProductsControllerFindOne,
  superadminProductsControllerDelete,
  superadminProductsControllerRestore,
  platformAuditControllerFindAll,
  superadminAuditControllerFindAllInvoiceAudits,
  superadminAuditControllerFindInvoiceAuditByUuid,
  superadminAuditControllerGetCompanyTimeline,
  superadminAuditControllerFindAllPlatformLogs,
  superadminAuditControllerFindPlatformLogById,
  taxRulesSuperAdminControllerFindAll,
  taxRulesSuperAdminControllerCreate,
  taxRulesSuperAdminControllerFindOne,
  taxRulesSuperAdminControllerUpdate,
  taxRulesSuperAdminControllerRemove,
  taxCategoriesSuperAdminControllerFindAll,
  taxCategoriesSuperAdminControllerCreate,
  taxCategoriesSuperAdminControllerFindOne,
  taxCategoriesSuperAdminControllerUpdate,
  taxCategoriesSuperAdminControllerRemove,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

// --- Analytics ---

export function usePlatformOverview() {
  return useQuery({
    queryKey: ['superadmin', 'overview'],
    queryFn: async () => {
      const response = await superAdminAnalyticsControllerGetPlatformOverview();
      return unwrapResponse(response);
    },
  });
}

export function usePlatformRevenue(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['superadmin', 'revenue', params],
    queryFn: async () => {
      const response = await superAdminAnalyticsControllerGetPlatformRevenue({
        query: params,
      });
      return unwrapResponse(response);
    },
  });
}

export function useTopCompanies(limit?: number) {
  return useQuery({
    queryKey: ['superadmin', 'topCompanies', limit],
    queryFn: async () => {
      const response = await superAdminAnalyticsControllerGetTopCompanies({
        query: { limit },
      });
      return unwrapResponse(response);
    },
  });
}

// --- Tenants / Companies ---

export interface TenantFilters {
  page?: number;
  limit?: number;
}

export function useTenants(filters: TenantFilters = {}) {
  return useQuery({
    queryKey: ['superadmin', 'tenants', filters],
    queryFn: async () => {
      const response = await superAdminCompaniesControllerFindAll({
        query: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
        },
      });
      return unwrapResponse(response);
    },
  });
}

// --- Users ---

export interface AdminUserFilters {
  page?: number;
  limit?: number;
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: ['superadmin', 'users', filters],
    queryFn: async () => {
      const response = await superadminUsersControllerFindAll({
        query: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
        },
      });
      return unwrapResponse(response);
    },
  });
}

export function useInviteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string }) => {
      const response = await superadminUsersControllerInviteAdmin({ body });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'users'] }),
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await superadminUsersControllerDelete({ path: { uuid } });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'users'] }),
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await superadminUsersControllerRestore({ path: { uuid } });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'users'] }),
  });
}

// --- Audit ---

export function useAuditLogs(params?: {
  action?: string;
  actorId?: string;
  targetType?: string;
  page?: string;
  limit?: string;
}) {
  return useQuery({
    queryKey: ['superadmin', 'auditLogs', params],
    queryFn: async () => {
      const response = await superadminAuditControllerFindAllPlatformLogs();
      return unwrapResponse(response);
    },
  });
}

export function useInvoiceAudits() {
  return useQuery({
    queryKey: ['superadmin', 'invoiceAudits'],
    queryFn: async () => {
      const response = await superadminAuditControllerFindAllInvoiceAudits();
      return unwrapResponse(response);
    },
  });
}

export function useCompanyTimeline(companyId: number | null) {
  return useQuery({
    queryKey: ['superadmin', 'companyTimeline', companyId],
    queryFn: async () => {
      const response = await superadminAuditControllerGetCompanyTimeline({
        path: { companyId: companyId! },
      });
      return unwrapResponse(response);
    },
    enabled: companyId != null,
  });
}

// --- Superadmin Products ---

export function useSuperadminProducts(filters: { page?: number; limit?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['superadmin', 'products', filters],
    queryFn: async () => {
      const response = await superadminProductsControllerFindAll({
        query: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          ...(filters.search && { search: filters.search }),
        },
      });
      return unwrapResponse(response);
    },
  });
}

export function useSuperadminProduct(uuid: string) {
  return useQuery({
    queryKey: ['superadmin', 'products', 'detail', uuid],
    queryFn: async () => {
      const response = await superadminProductsControllerFindOne({
        path: { uuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useDeleteSuperadminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await superadminProductsControllerDelete({
        path: { uuid },
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'products'] }),
  });
}

export function useRestoreSuperadminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await superadminProductsControllerRestore({
        path: { uuid },
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'products'] }),
  });
}

// --- Superadmin Companies ---

export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await superAdminCompaniesControllerDelete({
        path: { uuid },
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'tenants'] }),
  });
}

export function useRestoreTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await superAdminCompaniesControllerRestore({
        path: { uuid },
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'tenants'] }),
  });
}

export function useToggleTenantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await superAdminCompaniesControllerToggleStatus({
        path: { uuid },
        body,
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'tenants'] }),
  });
}

// --- Superadmin Users Detail ---

export function useSuperadminUser(uuid: string) {
  return useQuery({
    queryKey: ['superadmin', 'users', 'detail', uuid],
    queryFn: async () => {
      const response = await superadminUsersControllerFindOne({
        path: { uuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

// --- Superadmin Tax Rules ---

export function useSuperadminTaxRules(filters?: { companyUuid?: string; taxCategoryUuid?: string }) {
  return useQuery({
    queryKey: ['superadmin', 'taxRules', filters],
    queryFn: async () => {
      const response = await taxRulesSuperAdminControllerFindAll({
        query: filters,
      });
      return unwrapResponse(response);
    },
  });
}

export function useSuperadminTaxRule(uuid: string) {
  return useQuery({
    queryKey: ['superadmin', 'taxRules', 'detail', uuid],
    queryFn: async () => {
      const response = await taxRulesSuperAdminControllerFindOne({
        path: { uuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useCreateSuperadminTaxRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await taxRulesSuperAdminControllerCreate({ body });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'taxRules'] }),
  });
}

export function useUpdateSuperadminTaxRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await taxRulesSuperAdminControllerUpdate({
        path: { uuid },
        body,
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'taxRules'] }),
  });
}

export function useDeleteSuperadminTaxRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await taxRulesSuperAdminControllerRemove({
        path: { uuid },
      });
      if ((response as any).error) throw (response as any).error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'taxRules'] }),
  });
}

// --- Superadmin Tax Categories ---

export function useSuperadminTaxCategories(filters?: { companyUuid?: string }) {
  return useQuery({
    queryKey: ['superadmin', 'taxCategories', filters],
    queryFn: async () => {
      const response = await taxCategoriesSuperAdminControllerFindAll({
        query: filters,
      });
      return unwrapResponse(response);
    },
  });
}

export function useSuperadminTaxCategory(uuid: string) {
  return useQuery({
    queryKey: ['superadmin', 'taxCategories', 'detail', uuid],
    queryFn: async () => {
      const response = await taxCategoriesSuperAdminControllerFindOne({
        path: { uuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useCreateSuperadminTaxCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await taxCategoriesSuperAdminControllerCreate({ body });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'taxCategories'] }),
  });
}

export function useUpdateSuperadminTaxCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await taxCategoriesSuperAdminControllerUpdate({
        path: { uuid },
        body,
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'taxCategories'] }),
  });
}

export function useDeleteSuperadminTaxCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await taxCategoriesSuperAdminControllerRemove({
        path: { uuid },
      });
      if ((response as any).error) throw (response as any).error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin', 'taxCategories'] }),
  });
}

// --- Superadmin Audit Detail ---

export function useInvoiceAuditByUuid(uuid: string) {
  return useQuery({
    queryKey: ['superadmin', 'invoiceAudits', 'detail', uuid],
    queryFn: async () => {
      const response = await superadminAuditControllerFindInvoiceAuditByUuid({
        path: { uuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function usePlatformLogById(id: number | null) {
  return useQuery({
    queryKey: ['superadmin', 'platformLogs', 'detail', id],
    queryFn: async () => {
      const response = await superadminAuditControllerFindPlatformLogById({
        path: { id: id! },
      });
      return unwrapResponse(response);
    },
    enabled: id != null,
  });
}
