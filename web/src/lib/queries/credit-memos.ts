'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  creditMemosControllerFindByInvoice,
  creditMemosControllerCreate,
  creditMemosControllerIssue,
  creditMemosControllerVoid,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const creditMemoKeys = {
  all: ['credit-memos'] as const,
  byInvoice: (uuid: string) =>
    [...creditMemoKeys.all, 'invoice', uuid] as const,
};

export function useCreditMemos(invoiceUuid: string) {
  return useQuery({
    queryKey: creditMemoKeys.byInvoice(invoiceUuid),
    queryFn: async () => {
      const { data } = await creditMemosControllerFindByInvoice({
        path: { uuid: invoiceUuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!invoiceUuid,
  });
}

export function useCreateCreditMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invoiceUuid,
      body,
    }: {
      invoiceUuid: string;
      body: { amount: number; reason: string; lhdnOriginalUuid?: string };
    }) => {
      const { data, error } = await creditMemosControllerCreate({
        path: { uuid: invoiceUuid },
        body,
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditMemoKeys.all });
    },
  });
}

export function useIssueCreditMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memoUuid: string) => {
      const { data, error } = await creditMemosControllerIssue({
        path: { memoUuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditMemoKeys.all });
    },
  });
}

export function useVoidCreditMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memoUuid: string) => {
      const { data, error } = await creditMemosControllerVoid({
        path: { memoUuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditMemoKeys.all });
    },
  });
}
