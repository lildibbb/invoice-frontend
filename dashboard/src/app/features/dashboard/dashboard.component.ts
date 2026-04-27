import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyMyrPipe } from '../../shared/pipes/currency-myr.pipe';
import { DashboardStore } from './dashboard.store';
import { invoicesControllerFindAll } from '../../core/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    TableModule,
    ButtonModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    CurrencyMyrPipe,
  ],
  providers: [DashboardStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <app-page-header
        title="Dashboard"
        subtitle="Welcome back, Ahmad"
      ></app-page-header>

      <!-- Row 1: KPI Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        @for (card of statCards(); track card.label) {
          <app-stat-card
            [label]="card.label"
            [value]="card.value"
            [delta]="card.delta"
            [deltaType]="card.deltaType"
            [icon]="card.icon"
            [accent]="card.accent"
          ></app-stat-card>
        }
      </div>

      <!-- Row 2: Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div class="lg:col-span-2 invoiz-card p-5">
          <h3 class="card-title">Revenue Trend</h3>
          <apx-chart
            [series]="revenueSeries()"
            [chart]="revenueChart.chart"
            [xaxis]="{ categories: revenueCategories() }"
            [stroke]="revenueChart.stroke"
            [fill]="revenueChart.fill"
            [colors]="revenueChart.colors"
            [dataLabels]="revenueChart.dataLabels"
            [grid]="revenueChart.grid"
            [yaxis]="revenueChart.yaxis"
            [tooltip]="revenueChart.tooltip"
          ></apx-chart>
        </div>
        <div class="invoiz-card p-5">
          <h3 class="card-title">Invoice Status</h3>
          <apx-chart
            [series]="donutSeries()"
            [chart]="donutChart.chart"
            [labels]="donutChart.labels"
            [colors]="donutChart.colors"
            [legend]="donutChart.legend"
            [dataLabels]="donutChart.dataLabels"
            [plotOptions]="donutChart.plotOptions"
          ></apx-chart>
        </div>
      </div>

      <!-- Row 3: Recent Invoices + Pending Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div class="lg:col-span-2 invoiz-card">
          <div class="card-header">
            <h3 class="card-title">Recent Invoices</h3>
            <a class="view-all-link" href="javascript:void(0)">View All</a>
          </div>
          <p-table [value]="recentInvoices" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-inv>
              <tr>
                <td class="font-medium">{{ inv.number }}</td>
                <td>{{ inv.customer }}</td>
                <td>{{ inv.amount | currencyMyr }}</td>
                <td>{{ inv.dueDate }}</td>
                <td><app-status-badge [status]="inv.status" size="sm"></app-status-badge></td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <div class="invoiz-card p-5">
          <h3 class="card-title mb-4">Pending Actions</h3>
          <div class="actions-list">
            <div class="action-item action-item--red">
              <div class="action-content">
                <ph-icon name="warning-circle" size="18" weight="duotone"></ph-icon>
                <div>
                  <div class="action-text">3 invoices overdue</div>
                  <a class="action-link" href="javascript:void(0)">Send reminders</a>
                </div>
              </div>
            </div>
            <div class="action-item action-item--amber">
              <div class="action-content">
                <ph-icon name="clock" size="18" weight="duotone"></ph-icon>
                <div>
                  <div class="action-text">5 invoices pending approval</div>
                  <a class="action-link" href="javascript:void(0)">Review</a>
                </div>
              </div>
            </div>
            <div class="action-item action-item--violet">
              <div class="action-content">
                <ph-icon name="cloud-arrow-up" size="18" weight="duotone"></ph-icon>
                <div>
                  <div class="action-text">2 LHDN submissions failed</div>
                  <a class="action-link" href="javascript:void(0)">Retry</a>
                </div>
              </div>
            </div>
            <div class="action-item action-item--blue">
              <div class="action-content">
                <ph-icon name="envelope-open" size="18" weight="duotone"></ph-icon>
                <div>
                  <div class="action-text">8 quotations awaiting response</div>
                  <a class="action-link" href="javascript:void(0)">Follow up</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 4: Quick Actions -->
      <div class="flex justify-center gap-3">
        <button pButton class="p-button-primary quick-btn quick-btn--primary">
          <ph-icon name="file-plus" size="18" weight="duotone"></ph-icon>
          Create Invoice
        </button>
        <button pButton class="p-button-outlined quick-btn">
          <ph-icon name="currency-dollar" size="18" weight="duotone"></ph-icon>
          Record Payment
        </button>
        <button pButton class="p-button-outlined quick-btn">
          <ph-icon name="cloud-arrow-up" size="18" weight="duotone"></ph-icon>
          Submit to LHDN
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 12px;
    }

    .card-header .card-title {
      margin: 0;
    }

    .view-all-link {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    /* Pending Actions */
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-item {
      border-left: 4px solid transparent;
      border-radius: 6px;
      padding: 12px;
      background: var(--surface-ground, #f9fafb);

      &--red    { border-left-color: var(--status-overdue, #ef4444); }
      &--amber  { border-left-color: var(--status-pending, #f59e0b); }
      &--violet { border-left-color: var(--status-lhdn, #8b5cf6); }
      &--blue   { border-left-color: var(--primary, #3b82f6); }
    }

    .action-content {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: var(--text-secondary);
    }

    .action-text {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 2px;
    }

    .action-link {
      font-size: 12px;
      color: var(--primary);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    /* Quick Action Buttons */
    .quick-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid var(--primary);
      background: transparent;
      color: var(--primary);
      transition: background 0.15s;

      &:hover { background: var(--primary-light, #eff6ff); }

      &--primary {
        background: var(--primary);
        color: #fff;
        &:hover { opacity: 0.9; background: var(--primary); }
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private dashboardStore = inject(DashboardStore);

  private defaultStatCards: { label: string; value: string; delta: string; deltaType: 'positive' | 'negative' | 'neutral'; icon: string; accent: 'blue' | 'green' | 'red' | 'violet' | 'amber' }[] = [
    { label: 'Revenue', value: 'RM 0', delta: '', deltaType: 'positive', icon: 'currency-dollar', accent: 'blue' },
    { label: 'Total Invoices', value: '0', delta: '', deltaType: 'positive', icon: 'file-text', accent: 'green' },
    { label: 'Overdue', value: '0', delta: 'RM 0', deltaType: 'negative', icon: 'warning-circle', accent: 'red' },
    { label: 'Pending', value: 'RM 0', delta: '', deltaType: 'neutral', icon: 'clock', accent: 'amber' },
  ];

  statCards = computed<typeof this.defaultStatCards>(() => {
    const stats = this.dashboardStore.stats();
    if (!stats) return this.defaultStatCards;
    return [
      { label: 'Revenue', value: `RM ${stats.totalRevenue?.toLocaleString() ?? '0'}`, delta: stats.revenueGrowth ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%` : '', deltaType: 'positive' as const, icon: 'currency-dollar', accent: 'blue' as const },
      { label: 'Total Invoices', value: `${stats.totalInvoices ?? 0}`, delta: stats.invoiceGrowth ? `${stats.invoiceGrowth > 0 ? '+' : ''}${stats.invoiceGrowth}%` : '', deltaType: 'positive' as const, icon: 'file-text', accent: 'green' as const },
      { label: 'Overdue', value: `${stats.overdueInvoices ?? 0}`, delta: `RM ${stats.overdueAmount?.toLocaleString() ?? '0'}`, deltaType: 'negative' as const, icon: 'warning-circle', accent: 'red' as const },
      { label: 'Pending', value: `RM ${stats.pendingAmount?.toLocaleString() ?? '0'}`, delta: '', deltaType: 'neutral' as const, icon: 'clock', accent: 'amber' as const },
    ];
  });

  recentInvoices: any[] = [];

  private defaultRevenueSeries = [{ name: 'Revenue', data: [] as number[] }];
  private defaultRevenueCategories: string[] = [];

  revenueSeries = computed(() => {
    const monthly = this.dashboardStore.monthlyRevenue();
    if (!monthly || monthly.length === 0) return this.defaultRevenueSeries;
    return [{ name: 'Revenue', data: monthly.map((m: any) => m.revenue ?? m.amount ?? 0) }];
  });

  revenueCategories = computed(() => {
    const monthly = this.dashboardStore.monthlyRevenue();
    if (!monthly || monthly.length === 0) return this.defaultRevenueCategories;
    return monthly.map((m: any) => m.month ?? m.label ?? '');
  });

  revenueChart = {
    series: this.defaultRevenueSeries,
    chart: { type: 'area' as const, height: 300, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    xaxis: { categories: this.defaultRevenueCategories },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.05, stops: [0, 100] } },
    colors: ['#3b82f6'],
    dataLabels: { enabled: false },
    grid: { borderColor: '#e5e7eb', strokeDashArray: 4 },
    yaxis: { labels: { formatter: (v: number) => 'RM ' + (v / 1000).toFixed(0) + 'k' } },
    tooltip: { y: { formatter: (v: number) => 'RM ' + v.toLocaleString('en-MY', { minimumFractionDigits: 2 }) } },
  };

  donutSeries = computed(() => {
    const stats = this.dashboardStore.stats();
    if (!stats) return [0, 0, 0, 0];
    const paid = stats.paidInvoices ?? 0;
    const overdue = stats.overdueInvoices ?? 0;
    const total = stats.totalInvoices ?? 0;
    const pending = total - paid - overdue;
    return [paid, Math.max(pending, 0), overdue, 0];
  });

  donutChart = {
    series: [0, 0, 0, 0],
    chart: { type: 'donut' as const, height: 280, fontFamily: 'Inter, sans-serif' },
    labels: ['Paid', 'Pending', 'Overdue', 'Draft'],
    colors: ['#10b981', '#f59e0b', '#ef4444', '#64748b'],
    legend: { position: 'bottom' as const, fontSize: '12px' },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%' } } },
  };

  ngOnInit(): void {
    this.dashboardStore.loadDashboard();
    this.loadRecentInvoices();
  }

  private async loadRecentInvoices(): Promise<void> {
    try {
      const { data } = await invoicesControllerFindAll({
        query: { limit: 5 },
      } as any);
      const payload = (data as any)?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      this.recentInvoices = list.map((inv: any) => ({
        number: inv.invoiceNo ?? inv.number ?? '',
        customer: inv.customer?.name ?? inv.customerName ?? '',
        amount: inv.totalAmount ?? inv.amount ?? 0,
        dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
        status: inv.status?.toLowerCase() ?? 'draft',
      }));
    } catch {
      this.recentInvoices = [];
    }
  }
}
