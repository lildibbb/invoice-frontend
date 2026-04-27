'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  lhdnCredentialsControllerGetCredentialStatus,
  lhdnCredentialsControllerCreateCredentials,
  lhdnCredentialsControllerUpdateCredentials,
  lhdnCredentialsControllerDeactivateCredentials,
  lhdnCredentialsControllerValidateCredentials,
  lhdnCredentialsControllerGetAuditLog,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const lhdnKeys = {
  all: ['lhdn'] as const,
  credentials: () => [...lhdnKeys.all, 'credentials'] as const,
  status: () => [...lhdnKeys.all, 'status'] as const,
  audit: () => [...lhdnKeys.all, 'audit'] as const,
};

export function useLhdnCredentialStatus() {
  return useQuery({
    queryKey: lhdnKeys.status(),
    queryFn: async () => {
      const response = await lhdnCredentialsControllerGetCredentialStatus();
      return unwrapResponse(response);
    },
  });
}

export function useCreateLhdnCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await lhdnCredentialsControllerCreateCredentials({ body });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lhdnKeys.all }),
  });
}

export function useUpdateLhdnCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await lhdnCredentialsControllerUpdateCredentials({ body });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lhdnKeys.all }),
  });
}

export function useDeactivateLhdnCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await lhdnCredentialsControllerDeactivateCredentials();
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lhdnKeys.all }),
  });
}

export function useValidateLhdnCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await lhdnCredentialsControllerValidateCredentials();
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: lhdnKeys.all }),
  });
}

export function useLhdnAuditLog() {
  return useQuery({
    queryKey: lhdnKeys.audit(),
    queryFn: async () => {
      const response = await lhdnCredentialsControllerGetAuditLog();
      return unwrapResponse(response);
    },
  });
}
