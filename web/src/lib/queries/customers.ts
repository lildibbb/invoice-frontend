'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  customersControllerFindAll,
  customersControllerFindOne,
  customersControllerCreate,
  customersControllerUpdate,
  customersControllerDelete,
  customersControllerBulkUpload,
  customersControllerGetUploadStatus,
  customersControllerRestore,
  customersControllerDownloadErrors,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const response = await customersControllerFindAll({
        query: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
        },
      });
      return unwrapResponse(response);
    },
  });
}

export function useCustomer(uuid: string | null) {
  return useQuery({
    queryKey: ['customer', uuid],
    queryFn: async () => {
      const response = await customersControllerFindOne({
        path: { uuid: uuid! },
      });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await customersControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await customersControllerUpdate({
        path: { uuid },
        body,
      });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer'] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await customersControllerDelete({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useBulkUploadCustomers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await customersControllerBulkUpload({
        body: { file },
      });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUploadStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['customer-upload-status', jobId],
    queryFn: async () => {
      const response = await customersControllerGetUploadStatus({
        path: { jobId: jobId! },
      } as any);
      return unwrapResponse(response);
    },
    enabled: !!jobId,
    refetchInterval: 2000,
  });
}

export function useRestoreCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await customersControllerRestore({ path: { uuid } });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer'] });
    },
  });
}

export function useDownloadBulkErrors() {
  return useMutation({
    mutationFn: async (errorToken: string) => {
      const response = await customersControllerDownloadErrors({
        path: { errorToken },
      });
      if (response.error) throw response.error;
      return response.data;
    },
  });
}
