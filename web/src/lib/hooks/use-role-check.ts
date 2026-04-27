import { useAuthStore, useHasHydrated } from '@/lib/stores/auth-store';
import type { AppRole } from '@/lib/types/roles';

export function useRoleCheck(roles: AppRole[]) {
  const hasHydrated = useHasHydrated();
  const contextRole = useAuthStore((s) => s.context?.role);
  const globalRole = useAuthStore((s) => s.user?.role);

  const hasAccess = roles.some(
    (r) =>
      r.toUpperCase() === contextRole?.toUpperCase() ||
      r.toUpperCase() === globalRole?.toUpperCase()
  );

  return { hasAccess, userRole: contextRole ?? globalRole, isLoading: !hasHydrated };
}
