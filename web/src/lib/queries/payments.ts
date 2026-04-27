'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  paymentsControllerGetPayments,
  paymentsControllerRecordPayment,
  paymentsControllerGetBalance,
  paymentsControllerDeletePayment,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export function usePayments(invoiceUuid: string | null) {
  return useQuery({
    queryKey: ['payments', invoiceUuid],
    queryFn: async () => {
      const response = await paymentsControllerGetPayments({
        path: { uuid: invoiceUuid! },
      });
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data : data?.data ?? [];
    },
    enabled: !!invoiceUuid,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invoiceUuid,
      body,
    }: {
      invoiceUuid: string;
      body: {
        amount: number;
        method: string;
        paidAt: string;
        referenceNo?: string;
        notes?: string;
      };
    }) => {
      const response = await paymentsControllerRecordPayment({
        path: { uuid: invoiceUuid },
        body: body as any,
      });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-balance'] });
    },
  });
}

export function usePaymentBalance(invoiceUuid: string | null) {
  return useQuery({
    queryKey: ['payment-balance', invoiceUuid],
    queryFn: async () => {
      const response = await paymentsControllerGetBalance({
        path: { uuid: invoiceUuid! },
      });
      return unwrapResponse(response);
    },
    enabled: !!invoiceUuid,
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      invoiceUuid,
      paymentUuid,
    }: {
      invoiceUuid: string;
      paymentUuid: string;
    }) => {
      const response = await paymentsControllerDeletePayment({
        path: { invoiceUuid, paymentUuid },
      });
      if (response.error) throw response.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-balance'] });
    },
  });
}
