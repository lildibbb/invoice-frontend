import { GlobalRole, MembershipRole, type AppRole } from '@/lib/types/roles';

export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/': [MembershipRole.ADMIN, MembershipRole.STAFF, GlobalRole.SUPER_ADMIN],
  '/invoices': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/invoices/new': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/quotations': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/quotations/new': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/customers': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/products': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/payments': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/recurring': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/approvals': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/e-invoices': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/reports': [MembershipRole.ADMIN],
  '/settings': [MembershipRole.ADMIN],
  '/settings/team': [MembershipRole.ADMIN],
  '/settings/tax': [MembershipRole.ADMIN],
  '/settings/lhdn': [MembershipRole.ADMIN],
  '/settings/billing': [MembershipRole.ADMIN],
  '/settings/templates': [MembershipRole.ADMIN, MembershipRole.STAFF],
  '/settings/sessions': [MembershipRole.ADMIN, MembershipRole.STAFF, GlobalRole.SUPER_ADMIN],
  '/superadmin': [GlobalRole.SUPER_ADMIN],
  '/superadmin/users': [GlobalRole.SUPER_ADMIN],
  '/superadmin/audit': [GlobalRole.SUPER_ADMIN],
  '/superadmin/tax': [GlobalRole.SUPER_ADMIN],
  '/superadmin/products': [GlobalRole.SUPER_ADMIN],
  '/superadmin/subscriptions': [GlobalRole.SUPER_ADMIN],
};

export function getRoutePermissions(pathname: string): AppRole[] | null {
  // exact match first
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  // check parent paths (e.g. /invoices/uuid matches /invoices)
  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    const parent = '/' + segments.join('/');
    if (ROUTE_PERMISSIONS[parent]) return ROUTE_PERMISSIONS[parent];
    segments.pop();
  }
  return null; // no restriction found
}
