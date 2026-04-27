import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  StatCardComponent,
} from '../../../shared';
import '@phosphor-icons/web/index.js';
import {
  superAdminCompaniesControllerFindAll,
  superAdminCompaniesControllerDelete,
  superAdminCompaniesControllerRestore,
  superAdminCompaniesControllerToggleStatus,
  superAdminAnalyticsControllerGetPlatformOverview,
  superAdminAnalyticsControllerGetPlatformRevenue,
  superAdminAnalyticsControllerGetTopCompanies,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

interface Tenant {
  uuid: string;
  company: string;
  owner: string;
  plan: 'starter' | 'business' | 'enterprise' | 'trial';
  status: string;
  invoicesMtd: number;
  storage: string;
  created: string;
  lastActive: string;
}

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SelectModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    StatCardComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Tenants" subtitle="Platform Administration" />

      <!-- Platform Analytics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <app-stat-card
          label="Total Companies"
          [value]="platformOverview().totalCompanies"
          icon="buildings"
          accent="blue"
        ></app-stat-card>
        <app-stat-card
          label="Total Users"
          [value]="platformOverview().totalUsers"
          icon="users"
          accent="violet"
        ></app-stat-card>
        <app-stat-card
          label="Total Invoices"
          [value]="platformOverview().totalInvoices"
          icon="file-text"
          accent="green"
        ></app-stat-card>
        <app-stat-card
          label="Platform Revenue"
          [value]="platformOverview().revenue"
          icon="currency-circle-dollar"
          accent="amber"
        ></app-stat-card>
      </div>

      <!-- Top Companies -->
      @if (topCompanies().length) {
        <div class="invoiz-card" style="padding: 20px; margin-bottom: 16px">
          <h3 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px">Top Companies</h3>
          <p-table [value]="topCompanies()" styleClass="p-datatable-sm">
            <ng-template #header>
              <tr>
                <th>Company</th>
                <th style="text-align: right">Invoices</th>
                <th style="text-align: right">Revenue</th>
                <th>Plan</th>
              </tr>
            </ng-template>
            <ng-template #body let-c>
              <tr>
                <td><span class="company-name">{{ c.name }}</span></td>
                <td style="text-align: right">{{ c.invoiceCount }}</td>
                <td style="text-align: right">{{ c.revenue }}</td>
                <td><p-tag [value]="c.plan | titlecase" [severity]="getPlanSeverity(c.plan)" /></td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-chip">
          <span class="stat-chip__label">Total</span>
          <span class="stat-chip__value">{{ totalTenants() }}</span>
        </div>
        <div class="stat-chip stat-chip--green">
          <span class="stat-chip__label">Active</span>
          <span class="stat-chip__value">{{ activeTenants() }}</span>
        </div>
        <div class="stat-chip stat-chip--amber">
          <span class="stat-chip__label">Suspended</span>
          <span class="stat-chip__value">{{ suspendedTenants() }}</span>
        </div>
        <div class="stat-chip stat-chip--blue">
          <span class="stat-chip__label">Trial</span>
          <span class="stat-chip__value">{{ trialTenants() }}</span>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar invoiz-card">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Search tenants..."
            [(ngModel)]="searchQuery"
            class="filter-input"
          />
        </p-iconfield>

        <p-select
          [options]="planOptions"
          [(ngModel)]="selectedPlan"
          placeholder="Plan"
          [style]="{ minWidth: '150px' }"
        />

        <p-select
          [options]="statusOptions"
          [(ngModel)]="selectedStatus"
          placeholder="Status"
          [style]="{ minWidth: '150px' }"
        />
      </div>

      <!-- Table -->
      <div class="invoiz-card table-card">
        <p-table
          [value]="tenants()"
          [rows]="10"
          [paginator]="true"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tenants"
        >
          <ng-template #header>
            <tr>
              <th>Company</th>
              <th>Owner</th>
              <th>Plan</th>
              <th>Status</th>
              <th style="text-align: right">Invoices MTD</th>
              <th>Storage</th>
              <th>Created</th>
              <th>Last Active</th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template #body let-tenant>
            <tr>
              <td><span class="company-name">{{ tenant.company }}</span></td>
              <td class="text-muted">{{ tenant.owner }}</td>
              <td>
                <p-tag
                  [value]="tenant.plan | titlecase"
                  [severity]="getPlanSeverity(tenant.plan)"
                />
              </td>
              <td>
                <app-status-badge [status]="tenant.status" size="sm" />
              </td>
              <td style="text-align: right">{{ tenant.invoicesMtd }}</td>
              <td>{{ tenant.storage }}</td>
              <td class="text-muted">{{ tenant.created }}</td>
              <td class="text-muted">{{ tenant.lastActive }}</td>
              <td>
                <button
                  pButton
                  type="button"
                  icon="pi pi-ellipsis-v"
                  class="p-button-text p-button-sm p-button-plain"
                  (click)="actionMenu.toggle($event)"
                ></button>
                <p-menu
                  #actionMenu
                  [model]="getMenuItems(tenant)"
                  [popup]="true"
                  appendTo="body"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }

    .stats-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .stat-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      background: var(--surface-card);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
    }

    .stat-chip--green { border-left: 3px solid var(--status-paid, #22c55e); }
    .stat-chip--amber { border-left: 3px solid var(--status-pending, #f59e0b); }
    .stat-chip--blue { border-left: 3px solid var(--primary, #3b82f6); }

    .stat-chip__label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .stat-chip__value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-input {
      min-width: 240px;
    }

    .table-card {
      overflow: hidden;
    }

    .company-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .text-muted {
      color: var(--text-secondary);
      font-size: 13px;
    }
  `],
})
export class TenantListComponent implements OnInit {
  private readonly notification = inject(NotificationService);

  loading = false;
  searchQuery = '';
  selectedPlan = '';
  selectedStatus = '';

  platformOverview = signal<{ totalCompanies: string; totalUsers: string; totalInvoices: string; revenue: string }>({
    totalCompanies: '—',
    totalUsers: '—',
    totalInvoices: '—',
    revenue: '—',
  });
  topCompanies = signal<any[]>([]);
  revenueData = signal<any[]>([]);

  planOptions = [
    { label: 'All Plans', value: '' },
    { label: 'Starter', value: 'starter' },
    { label: 'Business', value: 'business' },
    { label: 'Enterprise', value: 'enterprise' },
    { label: 'Trial', value: 'trial' },
  ];

  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Trial', value: 'trial' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  tenants = signal<Tenant[]>([]);

  totalTenants = computed(() => String(this.tenants().length));
  activeTenants = computed(() =>
    String(this.tenants().filter(t => t.status === 'active').length),
  );
  suspendedTenants = computed(() =>
    String(this.tenants().filter(t => t.status === 'suspended').length),
  );
  trialTenants = computed(() =>
    String(this.tenants().filter(t => t.plan === 'trial' || t.status === 'trial').length),
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadTenants(),
      this.loadPlatformOverview(),
      this.loadTopCompanies(),
      this.loadPlatformRevenue(),
    ]);
  }

  async loadTenants(): Promise<void> {
    this.loading = true;
    try {
      const { data } = await superAdminCompaniesControllerFindAll({
        query: { page: 1, limit: 100 },
      } as any);
      const list = (data as any)?.data ?? data ?? [];
      this.tenants.set(list.map((c: any) => ({
        uuid: c.uuid ?? c.id,
        company: c.name ?? c.companyName ?? '',
        owner: c.ownerEmail ?? c.owner ?? '',
        plan: c.plan ?? 'starter',
        status: c.isActive === false ? 'suspended' : (c.status ?? 'active'),
        invoicesMtd: c.invoicesMtd ?? c.invoicesCount ?? 0,
        storage: c.storage ?? '0 MB',
        created: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
        lastActive: c.lastActiveAt ?? c.updatedAt ?? '',
      })) as Tenant[]);
    } catch {
      this.notification.error('Failed to load tenants');
    } finally {
      this.loading = false;
    }
  }

  getPlanSeverity(plan: string): 'secondary' | 'info' | 'warn' | 'contrast' | undefined {
    const map: Record<string, 'secondary' | 'info' | 'warn' | 'contrast'> = {
      starter: 'secondary',
      business: 'info',
      enterprise: 'contrast',
      trial: 'warn',
    };
    return map[plan];
  }

  getMenuItems(tenant: Tenant) {
    const isActive = tenant.status === 'active';
    return [
      { label: 'View Details', icon: 'pi pi-eye' },
      { label: 'Impersonate', icon: 'pi pi-user' },
      {
        label: isActive ? 'Suspend' : 'Enable',
        icon: isActive ? 'pi pi-ban' : 'pi pi-check-circle',
        styleClass: isActive ? 'menu-item--amber' : '',
        command: () => this.toggleStatus(tenant, !isActive),
      },
      { label: 'Audit Logs', icon: 'pi pi-list' },
      { separator: true },
      tenant.status === 'cancelled'
        ? {
            label: 'Restore',
            icon: 'pi pi-replay',
            command: () => this.restoreTenant(tenant),
          }
        : {
            label: 'Delete',
            icon: 'pi pi-trash',
            styleClass: 'menu-item--danger',
            command: () => this.deleteTenant(tenant),
          },
    ];
  }

  async toggleStatus(tenant: Tenant, activate: boolean): Promise<void> {
    try {
      await superAdminCompaniesControllerToggleStatus({
        path: { uuid: (tenant as any).uuid },
        body: { isActive: activate, reason: activate ? 'Enabled by admin' : 'Suspended by admin' },
      } as any);
      this.notification.success(activate ? 'Company enabled' : 'Company suspended');
      await this.loadTenants();
    } catch {
      this.notification.error('Failed to update company status');
    }
  }

  async deleteTenant(tenant: Tenant): Promise<void> {
    try {
      await superAdminCompaniesControllerDelete({
        path: { uuid: (tenant as any).uuid },
      } as any);
      this.notification.success('Company deleted');
      await this.loadTenants();
    } catch {
      this.notification.error('Failed to delete company');
    }
  }

  async restoreTenant(tenant: Tenant): Promise<void> {
    try {
      await superAdminCompaniesControllerRestore({
        path: { uuid: (tenant as any).uuid },
      } as any);
      this.notification.success('Company restored');
      await this.loadTenants();
    } catch {
      this.notification.error('Failed to restore company');
    }
  }

  private async loadPlatformOverview(): Promise<void> {
    try {
      const { data } = await superAdminAnalyticsControllerGetPlatformOverview();
      const overview = (data as any)?.data ?? data;
      this.platformOverview.set({
        totalCompanies: String(overview?.totalCompanies ?? overview?.companiesCount ?? '—'),
        totalUsers: String(overview?.totalUsers ?? overview?.usersCount ?? '—'),
        totalInvoices: String(overview?.totalInvoices ?? overview?.invoicesCount ?? '—'),
        revenue: overview?.revenue != null ? `RM ${Number(overview.revenue).toLocaleString('en-MY')}` : '—',
      });
    } catch {
      // Analytics not available
    }
  }

  private async loadTopCompanies(): Promise<void> {
    try {
      const { data } = await superAdminAnalyticsControllerGetTopCompanies();
      const list = (data as any)?.data ?? data ?? [];
      this.topCompanies.set(
        list.map((c: any) => ({
          name: c.name ?? c.companyName ?? '',
          invoiceCount: c.invoiceCount ?? c.invoicesCount ?? 0,
          revenue: c.revenue != null ? `RM ${Number(c.revenue).toLocaleString('en-MY')}` : 'RM 0',
          plan: c.plan ?? 'starter',
        })),
      );
    } catch {
      // Top companies not available
    }
  }

  private async loadPlatformRevenue(): Promise<void> {
    try {
      const { data } = await superAdminAnalyticsControllerGetPlatformRevenue();
      const list = (data as any)?.data ?? data ?? [];
      this.revenueData.set(list);
    } catch {
      // Revenue data not available
    }
  }
}
