'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { authControllerLogout, authControllerSwitchCompany } from '@/lib/api';
import { unwrapResponse } from '@/lib/utils';

export function useAuth() {
  const { user, context, isLoggedIn, setAuth, setContext, setAccessToken, clearAuth } =
    useAuthStore();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await authControllerLogout();
    } catch {
      // Ignore logout API errors — clear local state regardless
    }
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  const switchCompany = useCallback(
    async (companyId: number) => {
      const { data, error } = await authControllerSwitchCompany({
        body: { companyId },
      });
      if (error) throw error;
      const payload = unwrapResponse(data);
      if (payload?.access_token) setAccessToken(payload.access_token);
      if (payload?.context) setContext(payload.context);
    },
    [setAccessToken, setContext],
  );

  const userInitials = (() => {
    const name = user?.name;
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    const local = (user?.email ?? '').split('@')[0];
    const parts = local.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return local.substring(0, 2).toUpperCase();
  })();

  const displayName = user?.name ?? user?.email?.split('@')[0] ?? '';

  return { user, context, isLoggedIn, userInitials, displayName, logout, switchCompany };
}
