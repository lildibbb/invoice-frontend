'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  invitesControllerPreviewInvite,
  invitesControllerAcceptInvite,
} from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export const inviteKeys = {
  all: ['invites'] as const,
  preview: (token: string) => [...inviteKeys.all, 'preview', token] as const,
};

export function usePreviewInvite(token: string) {
  return useQuery({
    queryKey: inviteKeys.preview(token),
    queryFn: async () => {
      const response = await invitesControllerPreviewInvite({
        query: { token },
      });
      return unwrapResponse(response);
    },
    enabled: !!token,
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (body: any) => {
      const response = await invitesControllerAcceptInvite({ body });
      if ((response as any).error) throw (response as any).error;
      return unwrapResponse(response);
    },
  });
}
