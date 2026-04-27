export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',  icon: 'house',          route: '/app/dashboard' },
      { label: 'Invoices',   icon: 'file-text',      route: '/app/invoices' },
      { label: 'Quotations', icon: 'note-pencil',    route: '/app/quotations' },
      { label: 'Recurring', icon: 'arrows-clockwise', route: '/app/recurring' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Customers',  icon: 'users-three',    route: '/app/customers' },
      { label: 'Products',   icon: 'package',        route: '/app/products' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Approvals',  icon: 'stamp',           route: '/app/approvals' },
      { label: 'Payments',   icon: 'credit-card',    route: '/app/payments' },
      { label: 'E-Invoices', icon: 'cloud-arrow-up', route: '/app/e-invoices' },
      { label: 'Reports',    icon: 'chart-line-up',  route: '/app/reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings',   icon: 'gear-six',       route: '/app/settings' },
    ],
  },
];

export const SUPERADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Tenants',        icon: 'buildings',      route: '/app/superadmin/tenants' },
  { label: 'Audit Logs',     icon: 'shield-check',   route: '/app/superadmin/audit-logs' },
];

/** Flat list for backward compatibility */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
