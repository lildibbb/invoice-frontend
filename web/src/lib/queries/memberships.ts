'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  membershipsControllerGetMyMembership,
  membershipsControllerGetMembers,
  membershipsControllerRemoveMember,
  membershipsControllerUpdateMembership,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const membershipKeys = {
  all: ['memberships'] as const,
  mine: () => [...membershipKeys.all, 'mine'] as const,
  members: (companyUuid: string) => [...membershipKeys.all, 'members', companyUuid] as const,
};

export function useMyMembership() {
  return useQuery({
    queryKey: membershipKeys.mine(),
    queryFn: async () => {
      const response = await membershipsControllerGetMyMembership();
      return unwrapResponse(response);
    },
  });
}

export function useMembers(companyUuid: string) {
  return useQuery({
    queryKey: membershipKeys.members(companyUuid),
    queryFn: async () => {
      const response = await membershipsControllerGetMembers({
        path: { companyUuid },
      });
      return unwrapResponse(response);
    },
    enabled: !!companyUuid,
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (membershipUuid: string) => {
      const response = await membershipsControllerRemoveMember({
        path: { membershipUuid },
      });
      if ((response as any).error) throw (response as any).error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: membershipKeys.all }),
  });
}

export function useUpdateMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (membershipUuid: string) => {
      const response = await membershipsControllerUpdateMembership({
        path: { membershipUuid },
      });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: membershipKeys.all }),
  });
}
