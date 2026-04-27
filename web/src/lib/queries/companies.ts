'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  companiesControllerGetMyCompanies,
  companiesControllerFindOne,
  companiesControllerCreate,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const companyKeys = {
  all: ['companies'] as const,
  mine: () => [...companyKeys.all, 'mine'] as const,
  detail: (uuid: string) => [...companyKeys.all, 'detail', uuid] as const,
};

export function useMyCompanies() {
  return useQuery({
    queryKey: companyKeys.mine(),
    queryFn: async () => {
      const response = await companiesControllerGetMyCompanies();
      return unwrapResponse(response);
    },
  });
}

export function useCompany(uuid: string) {
  return useQuery({
    queryKey: companyKeys.detail(uuid),
    queryFn: async () => {
      const response = await companiesControllerFindOne({ path: { uuid } });
      return unwrapResponse(response);
    },
    enabled: !!uuid,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await companiesControllerCreate({ body });
      if (response.error) throw response.error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: companyKeys.all }),
  });
}
