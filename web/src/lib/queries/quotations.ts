'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  quotationsControllerFindAll,
  quotationsControllerFindOne,
  quotationsControllerCreate,
  quotationsControllerUpdate,
  quotationsControllerRemove,
  quotationsControllerSend,
  quotationsControllerAccept,
  quotationsControllerReject,
  quotationsControllerConvertToInvoice,
  quotationsControllerRevise,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export interface QuotationFilters {
  status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED' | null;
}

export function useQuotations(filters: QuotationFilters = {}) {
  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      const response = await quotationsControllerFindAll({
        query: {
          ...(filters.status && { status: filters.status }),
        },
      });
      return unwrapResponse(response);
    },
  });
}

export function useQuotation(uuid: string | null) {
  return useQuery({
    queryKey: ['quotation', uuid],
    queryFn: async () => {
      const response = await quotationsControllerFindOne({
        path: { uuid: uuid! },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await quotationsControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await quotationsControllerUpdate({
        path: { uuid },
        body,
      });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await quotationsControllerRemove({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useConvertToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await quotationsControllerConvertToInvoice({
        path: { uuid },
      });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useSendQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await quotationsControllerSend({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useAcceptQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await quotationsControllerAccept({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useRejectQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await quotationsControllerReject({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useReviseQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await quotationsControllerRevise({ path: { uuid } });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}
