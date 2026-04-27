'use client';

import { useMutation } from '@tanstack/react-query';
import { authControllerLogin, authControllerForgotPassword, authControllerResetPassword } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { unwrapResponse } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CompanyOption {
  id: number;
  name: string;
  role: string;
  status: string;
}

interface LoginResult {
  success: boolean;
  companies?: CompanyOption[];
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation<LoginResult, Error, { email: string; password: string; companyId?: number }>({
    mutationFn: async ({ email, password, companyId }) => {
      const { data, error } = await authControllerLogin({
        body: { email, password, companyId },
      });

      if (error) {
        const err = error as any;
        // 409 — multi-company login
        if (err?.statusCode === 409 || err?.error === 'AmbiguousLogin' || err?.companies) {
          return { success: false, companies: err.companies ?? [] };
        }
        throw new Error(err?.message || 'Invalid email or password');
      }

      const payload = unwrapResponse(data);

      if (!payload?.access_token || !payload?.user) {
        throw new Error('Invalid response from server');
      }

      setAuth(
        {
          uuid: payload.user.uuid,
          email: payload.user.email,
          name: payload.user.name ?? payload.user.email,
          role: payload.user.role,
          isEmailVerified: payload.user.isEmailVerified ?? false,
        },
        payload.context
          ? {
              membershipId: payload.context.membershipId,
              role: payload.context.role,
              company: {
                uuid: payload.context.company?.uuid ?? '',
                name: payload.context.company?.name ?? '',
                code: payload.context.company?.code ?? '',
                isActive: payload.context.company?.isActive ?? true,
              },
            }
          : null,
        payload.access_token,
      );

      // Handle pending invitation redirect
      if (payload.pendingInvitation?.redirectTo) {
        router.push(
          `${payload.pendingInvitation.redirectTo}?token=${payload.pendingInvitation.token}`,
        );
        return { success: true };
      }

      router.push('/');
      return { success: true };
    },
  });
}

export function useForgotPassword() {
  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      const { error } = await authControllerForgotPassword({
        body: { email },
      });
      if (error) {
        throw new Error((error as any)?.message || 'Failed to send reset email');
      }
    },
  });
}

export function useResetPassword() {
  return useMutation<void, Error, { token: string; password: string }>({
    mutationFn: async ({ token, password }) => {
      const { error } = await authControllerResetPassword({
        body: { token, newPassword: password },
      });
      if (error) {
        throw new Error((error as any)?.message || 'Failed to reset password');
      }
    },
  });
}
