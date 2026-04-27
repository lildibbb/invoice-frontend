'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productsControllerFindAll,
  productsControllerFindOne,
  productsControllerCreate,
  productsControllerUpdate,
  productsControllerDelete,
  productsControllerGetClassificationCodes,
  productsControllerRestore,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'sku' | 'price';
  sortOrder?: 'ASC' | 'DESC';
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await productsControllerFindAll({
        query: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          ...(filters.search && { search: filters.search }),
          ...(filters.sortBy && { sortBy: filters.sortBy }),
          ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
        },
      });
      return unwrapResponse(response);
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await productsControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, body }: { uuid: string; body: any }) => {
      const response = await productsControllerUpdate({
        path: { uuid },
        body,
      });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await productsControllerDelete({ path: { uuid } });
      if (response.error) throw response.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useProduct(uuid: string) {
  return useQuery({
    queryKey: ['products', 'detail', uuid],
    queryFn: async () => {
      const response = await productsControllerFindOne({ path: { uuid } });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useClassificationCodes() {
  return useQuery({
    queryKey: ['products', 'classificationCodes'],
    queryFn: async () => {
      const response = await productsControllerGetClassificationCodes();
      return unwrapResponse(response);
    },
  });
}

export function useRestoreProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await productsControllerRestore({ path: { uuid } });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
