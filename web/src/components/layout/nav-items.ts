import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  FileCheck,
  ReceiptText,
  Repeat,
  CheckCircle,
  BarChart3,
  Settings,
  Shield,
  Receipt,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { GlobalRole, MembershipRole, type AppRole } from '@/lib/types/roles';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  requiredRoles?: AppRole[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  requiredRoles?: AppRole[];
}

const ALL_ROLES: AppRole[] = [GlobalRole.SUPER_ADMIN, GlobalRole.USER, MembershipRole.ADMIN, MembershipRole.STAFF];
const COMPANY_ROLES: AppRole[] = [GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN, MembershipRole.STAFF];
const ADMIN_ROLES: AppRole[] = [GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN];

export const navGroups: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard, requiredRoles: ALL_ROLES },
      { title: 'Invoices', href: '/invoices', icon: FileText, requiredRoles: COMPANY_ROLES },
      { title: 'Quotations', href: '/quotations', icon: ReceiptText, requiredRoles: COMPANY_ROLES },
      { title: 'Customers', href: '/customers', icon: Users, requiredRoles: COMPANY_ROLES },
      { title: 'Products', href: '/products', icon: Package, requiredRoles: COMPANY_ROLES },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Payments', href: '/payments', icon: CreditCard, requiredRoles: COMPANY_ROLES },
      { title: 'Recurring', href: '/recurring', icon: Repeat, requiredRoles: COMPANY_ROLES },
      { title: 'Approvals', href: '/approvals', icon: CheckCircle, requiredRoles: COMPANY_ROLES },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { title: 'E-Invoices', href: '/e-invoices', icon: FileCheck, requiredRoles: COMPANY_ROLES },
      { title: 'Reports', href: '/reports', icon: BarChart3, requiredRoles: ADMIN_ROLES },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Company', href: '/company', icon: Building2, requiredRoles: ADMIN_ROLES },
      { title: 'Settings', href: '/settings', icon: Settings, requiredRoles: ADMIN_ROLES },
    ],
  },
];

export const superadminNavGroup: NavGroup = {
  title: 'Admin',
  requiredRoles: [GlobalRole.SUPER_ADMIN],
  items: [
    { title: 'Tenants', href: '/superadmin', icon: Shield, requiredRoles: [GlobalRole.SUPER_ADMIN] },
    { title: 'Users', href: '/superadmin/users', icon: Users, requiredRoles: [GlobalRole.SUPER_ADMIN] },
    { title: 'Audit Logs', href: '/superadmin/audit', icon: FileText, requiredRoles: [GlobalRole.SUPER_ADMIN] },
    { title: 'Tax Management', href: '/superadmin/tax', icon: Receipt, requiredRoles: [GlobalRole.SUPER_ADMIN] },
    { title: 'Products', href: '/superadmin/products', icon: Package, requiredRoles: [GlobalRole.SUPER_ADMIN] },
    { title: 'Subscriptions', href: '/superadmin/subscriptions', icon: CreditCard, requiredRoles: [GlobalRole.SUPER_ADMIN] },
  ],
};
