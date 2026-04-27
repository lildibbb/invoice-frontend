'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  companiesControllerGetCurrentCompanyStats,
  companiesControllerUpdate,
  usersControllerFindCompanyStaff,
  usersControllerInviteStaff,
  usersControllerUpdate,
  usersControllerCreateStaff,
  usersControllerCreateAdmin,
  usersControllerFindOneByCompany,
  authControllerGetSessions,
  authControllerRevokeSession,
  authControllerLogoutAll,
  lhdnManagementControllerListNotifications,
  lhdnManagementControllerSyncNotifications,
  lhdnManagementControllerGetDocumentTypes,
  invoiceTemplatesControllerFindAll,
  invoiceTemplatesControllerCreate,
  invoiceTemplatesControllerUpdate,
  invoiceTemplatesControllerRemove,
  invoiceTemplatesControllerSetDefault,
  taxCategoriesControllerFindAll,
  taxCategoriesControllerCreate,
  taxCategoriesControllerUpdate,
  taxCategoriesControllerRemove,
  taxRulesControllerFindAll,
  taxRulesControllerCreate,
  taxRulesControllerUpdate,
  taxRulesControllerRemove,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

// ── Company ──

export function useCompanyStats() {
  return useQuery({
    queryKey: ['company', 'stats'],
    queryFn: async () => {
      const response = await companiesControllerGetCurrentCompanyStats();
      return unwrapResponse(response);
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await companiesControllerUpdate({ path: { uuid }, body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company'] }),
  });
}

// ── Team ──

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: async () => {
      const response = await usersControllerFindCompanyStaff();
      return unwrapResponse(response);
    },
  });
}

export function useInviteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await usersControllerInviteStaff({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await usersControllerUpdate({ path: { uuid }, body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['team'] }),
  });
}

// ── Sessions ──

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await authControllerGetSessions();
      return unwrapResponse(response);
    },
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jti: string) => {
      const response = await authControllerRevokeSession({ path: { jti } });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await authControllerLogoutAll();
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
}

// ── LHDN ──

export function useLhdnNotifications() {
  return useQuery({
    queryKey: ['lhdn', 'notifications'],
    queryFn: async () => {
      const response = await lhdnManagementControllerListNotifications();
      return unwrapResponse(response);
    },
  });
}

export function useSyncLhdnNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await lhdnManagementControllerSyncNotifications();
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lhdn'] }),
  });
}

export function useLhdnDocumentTypes() {
  return useQuery({
    queryKey: ['lhdn', 'documentTypes'],
    queryFn: async () => {
      const response = await lhdnManagementControllerGetDocumentTypes();
      return unwrapResponse(response);
    },
  });
}

// ── Invoice Templates ──

export function useInvoiceTemplates() {
  return useQuery({
    queryKey: ['invoiceTemplates'],
    queryFn: async () => {
      const response = await invoiceTemplatesControllerFindAll();
      return unwrapResponse(response);
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await invoiceTemplatesControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoiceTemplates'] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await invoiceTemplatesControllerUpdate({ path: { uuid }, body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoiceTemplates'] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await invoiceTemplatesControllerRemove({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoiceTemplates'] }),
  });
}

export function useSetDefaultTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await invoiceTemplatesControllerSetDefault({ path: { uuid } });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoiceTemplates'] }),
  });
}

// ── Tax Categories ──

export function useTaxCategories() {
  return useQuery({
    queryKey: ['taxCategories'],
    queryFn: async () => {
      const response = await taxCategoriesControllerFindAll();
      return unwrapResponse(response);
    },
  });
}

export function useCreateTaxCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await taxCategoriesControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxCategories'] }),
  });
}

export function useUpdateTaxCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await taxCategoriesControllerUpdate({ path: { uuid }, body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxCategories'] }),
  });
}

export function useDeleteTaxCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await taxCategoriesControllerRemove({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxCategories'] }),
  });
}

// ── Tax Rules ──

export function useTaxRules() {
  return useQuery({
    queryKey: ['taxRules'],
    queryFn: async () => {
      const response = await taxRulesControllerFindAll();
      return unwrapResponse(response);
    },
  });
}

export function useCreateTaxRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await taxRulesControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxRules'] }),
  });
}

export function useUpdateTaxRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await taxRulesControllerUpdate({ path: { uuid }, body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxRules'] }),
  });
}

export function useDeleteTaxRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await taxRulesControllerRemove({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['taxRules'] }),
  });
}

// ── Registration ──

export function useRegisterStaff() {
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await usersControllerCreateStaff({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
  });
}

export function useRegisterAdmin() {
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await usersControllerCreateAdmin({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
  });
}

export function useUserByCompany(uuid: string) {
  return useQuery({
    queryKey: ['team', 'user', uuid],
    queryFn: async () => {
      const response = await usersControllerFindOneByCompany({
        path: { uuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}
