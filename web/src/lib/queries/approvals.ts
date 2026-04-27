'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  approvalsControllerGetPending,
  approvalsControllerGetByInvoice,
  approvalsControllerRequestApproval,
  approvalsControllerReviewApproval,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const approvalKeys = {
  all: ['approvals'] as const,
  pending: () => [...approvalKeys.all, 'pending'] as const,
  byInvoice: (uuid: string) =>
    [...approvalKeys.all, 'invoice', uuid] as const,
};

export function usePendingApprovals() {
  return useQuery({
    queryKey: approvalKeys.pending(),
    queryFn: async () => {
      const { data } = await approvalsControllerGetPending();
      return unwrapResponse(data);
    },
  });
}

export function useInvoiceApprovals(invoiceUuid: string) {
  return useQuery({
    queryKey: approvalKeys.byInvoice(invoiceUuid),
    queryFn: async () => {
      const { data } = await approvalsControllerGetByInvoice({
        path: { uuid: invoiceUuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!invoiceUuid,
  });
}

export function useRequestApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceUuid: string) => {
      const { data, error } = await approvalsControllerRequestApproval({
        path: { uuid: invoiceUuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}

export function useReviewApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      approvalUuid,
      body,
    }: {
      approvalUuid: string;
      body: { status: 'APPROVED' | 'REJECTED'; comments?: string };
    }) => {
      const { data, error } = await approvalsControllerReviewApproval({
        path: { approvalUuid },
        body,
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
    },
  });
}
