'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  eInvoiceSubmissionsControllerListSubmissions,
  eInvoiceSubmissionsControllerRetry,
  eInvoiceSubmissionsControllerGetQrCode,
  eInvoiceSubmissionsControllerGetStatus,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const eInvoiceKeys = {
  all: ['e-invoices'] as const,
  list: () => [...eInvoiceKeys.all, 'list'] as const,
  qrCode: (uuid: string) => [...eInvoiceKeys.all, 'qr', uuid] as const,
  status: (uuid: string) => [...eInvoiceKeys.all, 'status', uuid] as const,
};

export function useEInvoiceSubmissions() {
  return useQuery({
    queryKey: eInvoiceKeys.list(),
    queryFn: async () => {
      const { data } = await eInvoiceSubmissionsControllerListSubmissions();
      return unwrapResponse(data);
    },
  });
}

export function useSubmitEInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await eInvoiceSubmissionsControllerRetry({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eInvoiceKeys.all });
    },
  });
}

export function useEInvoiceQrCode(uuid: string) {
  return useQuery({
    queryKey: eInvoiceKeys.qrCode(uuid),
    queryFn: async () => {
      const { data } = await eInvoiceSubmissionsControllerGetQrCode({
        path: { uuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!uuid,
  });
}

export function useEInvoiceStatus(uuid: string) {
  return useQuery({
    queryKey: eInvoiceKeys.status(uuid),
    queryFn: async () => {
      const { data } = await eInvoiceSubmissionsControllerGetStatus({
        path: { uuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!uuid,
  });
}
