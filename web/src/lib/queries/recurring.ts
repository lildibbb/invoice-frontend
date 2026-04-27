'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  recurringInvoicesControllerFindAll,
  recurringInvoicesControllerCreate,
  recurringInvoicesControllerFindOne,
  recurringInvoicesControllerRemove,
  recurringInvoicesControllerPause,
  recurringInvoicesControllerResume,
  recurringInvoicesControllerCancel,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const recurringKeys = {
  all: ['recurring'] as const,
  list: () => [...recurringKeys.all, 'list'] as const,
  detail: (uuid: string) => [...recurringKeys.all, 'detail', uuid] as const,
};

export function useRecurringPlans() {
  return useQuery({
    queryKey: recurringKeys.list(),
    queryFn: async () => {
      const { data } = await recurringInvoicesControllerFindAll();
      return unwrapResponse(data);
    },
  });
}

export function useRecurringPlan(uuid: string) {
  return useQuery({
    queryKey: recurringKeys.detail(uuid),
    queryFn: async () => {
      const { data } = await recurringInvoicesControllerFindOne({
        path: { uuid },
      });
      return unwrapResponse(data);
    },
    enabled: !!uuid,
  });
}

export function useCreateRecurringPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await recurringInvoicesControllerCreate({ body });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useDeleteRecurringPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { error } = await recurringInvoicesControllerRemove({
        path: { uuid },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function usePauseRecurringPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await recurringInvoicesControllerPause({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useResumeRecurringPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await recurringInvoicesControllerResume({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

export function useCancelRecurringPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data, error } = await recurringInvoicesControllerCancel({
        path: { uuid },
      });
      if (error) throw error;
      return unwrapResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}
