'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  invoicesControllerFindAll,
  invoicesControllerFindOne,
  invoicesControllerCreate,
  invoicesControllerUpdate,
  invoicesControllerRemove,
  invoicesControllerFinalize,
  invoicesControllerVoid,
  invoicesControllerCloneInvoice,
  invoicesControllerSend,
  invoicesControllerResendEmail,
  invoicesControllerExportInvoices,
  invoicesControllerDownloadDemoPdf,
  invoicesControllerCancelLhdn,
  invoicesControllerBulkFinalize,
  invoicesControllerBulkSend,
  invoicesControllerGetAuditTrail,
  invoicesControllerGetAllowedTransitions,
  invoicesControllerSubmitEinvoice,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (filters: any) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (uuid: string) => [...invoiceKeys.all, 'detail', uuid] as const,
  summary: () => [...invoiceKeys.all, 'summary'] as const,
};

export function useInvoices(filters: {
  page?: number;
  limit?: number;
  invoiceNo?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: async () => {
      const query: Record<string, any> = {};
      if (filters.page) query.page = filters.page;
      if (filters.limit) query.limit = filters.limit;
      if (filters.invoiceNo) query.invoiceNo = filters.invoiceNo;
      if (filters.status) query.status = filters.status;
      if (filters.fromDate) query.fromDate = filters.fromDate;
      if (filters.toDate) query.toDate = filters.toDate;

      const { data } = await invoicesControllerFindAll({ query } as any);
      return unwrapResponse(data);
    },
  });
}

export function useInvoice(uuid: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(uuid),
    queryFn: async () => {
      const { data } = await invoicesControllerFindOne({ path: { uuid } });
      return unwrapResponse(data);
    },
    enabled: !!uuid,
  });
}

export function useInvoiceSummary() {
  return useQuery({
    queryKey: invoiceKeys.summary(),
    queryFn: async () => {
      const { data } = await invoicesControllerFindAll({
        query: { limit: 1 } as any,
      });
      return unwrapResponse(data);
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await invoicesControllerCreate({ body });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const { data, error } = await invoicesControllerUpdate({
        path: { uuid },
        body,
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { error } = await invoicesControllerRemove({ path: { uuid } });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useFinalizeInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await invoicesControllerFinalize({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      uuid,
      reason,
    }: {
      uuid: string;
      reason: string;
    }) => {
      const { data, error } = await invoicesControllerVoid({
        path: { uuid },
        body: { reason },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useDuplicateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await invoicesControllerCloneInvoice({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useSendInvoiceEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await invoicesControllerSend({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useResendInvoiceEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await invoicesControllerResendEmail({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useExportInvoices() {
  return useMutation({
    mutationFn: async (params: {
      format?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
    }) => {
      const { data, error } = await invoicesControllerExportInvoices({
        query: params,
      } as any);
      if (error) throw error;
      return data;
    },
  });
}

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await invoicesControllerDownloadDemoPdf({
        path: { uuid },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useCancelLhdn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      uuid,
      reason,
    }: {
      uuid: string;
      reason: string;
    }) => {
      const { data, error } = await invoicesControllerCancelLhdn({
        path: { uuid },
        body: { reason, requestorRole: 'admin' },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useBulkFinalizeInvoices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { uuids: string[] }) => {
      const { data: res, error } = await invoicesControllerBulkFinalize({
        body: data,
      } as any);
      if (error) throw error;
      return unwrapResponse(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useBulkSendInvoices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { uuids: string[] }) => {
      const { data: res, error } = await invoicesControllerBulkSend({
        body: data,
      } as any);
      if (error) throw error;
      return unwrapResponse(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

export function useInvoiceAuditTrail(uuid: string) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(uuid), 'audit'],
    queryFn: async () => {
      const { data } = await invoicesControllerGetAuditTrail({
        path: { uuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!uuid,
  });
}

export function useAllowedTransitions(uuid: string) {
  return useQuery({
    queryKey: [...invoiceKeys.detail(uuid), 'transitions'],
    queryFn: async () => {
      const { data } = await invoicesControllerGetAllowedTransitions({
        path: { uuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!uuid,
  });
}

export function useSubmitEInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await invoicesControllerSubmitEinvoice({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}
