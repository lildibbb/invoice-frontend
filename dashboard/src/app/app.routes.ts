import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  // Auth layout (login, register, etc.)
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'accept-invite',
        loadComponent: () =>
          import('./features/auth/accept-invite/accept-invite.component').then((m) => m.AcceptInviteComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  // App shell (authenticated pages)
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Invoices
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/invoices/invoice-list/invoice-list.component').then((m) => m.InvoiceListComponent),
      },
      {
        path: 'invoices/create',
        loadComponent: () =>
          import('./features/invoices/invoice-form/invoice-form.component').then((m) => m.InvoiceFormComponent),
      },
      {
        path: 'invoices/:id/edit',
        loadComponent: () =>
          import('./features/invoices/invoice-form/invoice-form.component').then((m) => m.InvoiceFormComponent),
      },
      {
        path: 'invoices/:id',
        loadComponent: () =>
          import('./features/invoices/invoice-detail/invoice-detail.component').then((m) => m.InvoiceDetailComponent),
      },
      // Customers
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list/customer-list.component').then((m) => m.CustomerListComponent),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent),
      },
      // Quotations
      {
        path: 'quotations',
        loadComponent: () =>
          import('./features/quotations/quotation-list/quotation-list.component').then((m) => m.QuotationListComponent),
      },
      // Products
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      // Approvals
      {
        path: 'approvals',
        loadComponent: () =>
          import('./features/approvals/approval-list/approval-list.component').then(
            (m) => m.ApprovalListComponent,
          ),
      },
      // Recurring Invoices
      {
        path: 'recurring',
        loadComponent: () =>
          import('./features/recurring/recurring-list/recurring-list.component').then((m) => m.RecurringListComponent),
      },
      // Payments
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payment-list/payment-list.component').then((m) => m.PaymentListComponent),
      },
      // LHDN e-Invoices
      {
        path: 'e-invoices',
        loadComponent: () =>
          import('./features/e-invoices/e-invoice-list/e-invoice-list.component').then((m) => m.EInvoiceListComponent),
      },
      // Reports
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },
      // Settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
        children: [
          {
            path: 'company',
            loadComponent: () =>
              import('./features/settings/company/settings-company.component').then(
                (m) => m.SettingsCompanyComponent,
              ),
          },
          {
            path: 'lhdn',
            loadComponent: () =>
              import('./features/settings/lhdn/settings-lhdn.component').then(
                (m) => m.SettingsLhdnComponent,
              ),
          },
          {
            path: 'team',
            loadComponent: () =>
              import('./features/settings/team/settings-team.component').then(
                (m) => m.SettingsTeamComponent,
              ),
          },
          {
            path: 'billing',
            loadComponent: () =>
              import('./features/settings/billing/settings-billing.component').then(
                (m) => m.SettingsBillingComponent,
              ),
          },
          {
            path: 'templates',
            loadComponent: () =>
              import('./features/settings/templates/settings-templates.component').then(
                (m) => m.SettingsTemplatesComponent,
              ),
          },
          {
            path: 'tax',
            loadComponent: () =>
              import('./features/settings/tax/settings-tax.component').then(
                (m) => m.SettingsTaxComponent,
              ),
          },
          {
            path: 'sessions',
            loadComponent: () =>
              import('./features/settings/sessions/settings-sessions.component').then(
                (m) => m.SettingsSessionsComponent,
              ),
          },
          { path: '', redirectTo: 'company', pathMatch: 'full' },
        ],
      },
      // SuperAdmin
      {
        path: 'superadmin/tenants',
        canActivate: [roleGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () =>
          import('./features/superadmin/tenant-list/tenant-list.component').then((m) => m.TenantListComponent),
      },
      {
        path: 'superadmin/audit-logs',
        canActivate: [roleGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () =>
          import('./features/superadmin/audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent),
      },
      {
        path: 'superadmin/users',
        canActivate: [roleGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () =>
          import('./features/superadmin/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
