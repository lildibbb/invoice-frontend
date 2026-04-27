'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useHasHydrated } from '@/lib/stores/auth-store';
import type { AppRole } from '@/lib/types/roles';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  roles: AppRole[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const router = useRouter();
  const hasHydrated = useHasHydrated();
  const contextRole = useAuthStore((s) => s.context?.role);
  const globalRole = useAuthStore((s) => s.user?.role);

  const hasAccess = roles.some(
    (r) =>
      r.toUpperCase() === contextRole?.toUpperCase() ||
      r.toUpperCase() === globalRole?.toUpperCase()
  );

  useEffect(() => {
    if (hasHydrated && !hasAccess) {
      router.replace('/forbidden');
    }
  }, [hasHydrated, hasAccess, router]);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!hasAccess) return null;
  return <>{children}</>;
}
