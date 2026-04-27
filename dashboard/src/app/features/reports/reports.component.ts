import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import {
  PageHeaderComponent,
  StatCardComponent,
  CurrencyMyrPipe,
} from '../../shared';
import '@phosphor-icons/web/index.js';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexFill,
  ApexStroke,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexResponsive,
  ChartComponent,
} from 'ng-apexcharts';

import {
  analyticsControllerGetDashboard,
  analyticsControllerGetMonthlyRevenue,
  analyticsControllerGetAgingReport,
  analyticsControllerGetLhdnReport,
  invoicesControllerExportInvoices,
} from '../../core/api';
import { NotificationService } from '../../core/services/notification.service';

interface TopCustomer {
  rank: number;
  customer: string;
  invoices: number;
  revenue: number;
  outstanding: number;
  lastInvoice: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    TableModule,
    ButtonModule,
    DatePickerModule,
    PageHeaderComponent,
    StatCardComponent,
    CurrencyMyrPipe,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Reports">
        <p-datepicker
          actions
          [(ngModel)]="dateRange"
          selectionMode="range"
          [readonlyInput]="true"
          placeholder="Select date range"
          dateFormat="dd M yy"
          [showIcon]="true"
        />
      </app-page-header>

      <!-- KPI Cards -->
      <div class="kpi-row">
        <app-stat-card
          label="Revenue"
          value="RM 145,230"
          delta="+12.5%"
          deltaType="positive"
          icon="currency-circle-dollar"
          accent="blue"
        />
        <app-stat-card
          label="Invoices"
          value="89"
          delta="+8"
          deltaType="positive"
          icon="file-text"
          accent="green"
        />
        <app-stat-card
          label="Collection Rate"
          value="87%"
          delta="-2.1%"
          deltaType="negative"
          icon="chart-pie"
          accent="amber"
        />
      </div>

      <!-- Revenue Trend -->
      <div class="invoiz-card chart-card">
        <h3 class="chart-title">Revenue Trend</h3>
        <apx-chart
          [series]="revenueSeries"
          [chart]="revenueChart"
          [xaxis]="revenueXAxis"
          [yaxis]="revenueYAxis"
          [dataLabels]="dataLabelsOff"
          [fill]="revenueFill"
          [stroke]="revenueStroke"
        />
      </div>

      <!-- Row 2: Side by side charts -->
      <div class="chart-row">
        <!-- Invoice Aging -->
        <div class="invoiz-card chart-card chart-half">
          <h3 class="chart-title">Invoice Aging</h3>
          <apx-chart
            [series]="agingSeries"
            [chart]="agingChart"
            [xaxis]="agingXAxis"
            [plotOptions]="agingPlotOptions"
            [dataLabels]="dataLabelsOff"
            [fill]="agingFill"
          />
        </div>

        <!-- LHDN Submission Success -->
        <div class="invoiz-card chart-card chart-half">
          <h3 class="chart-title">LHDN Submission Status</h3>
          <apx-chart
            [series]="lhdnSeries"
            [chart]="lhdnChart"
            [labels]="lhdnLabels"
            [dataLabels]="lhdnDataLabels"
            [legend]="lhdnLegend"
            [fill]="lhdnFill"
            [responsive]="lhdnResponsive"
          />
        </div>
      </div>

      <!-- Top Customers -->
      <div class="invoiz-card table-card">
        <h3 class="chart-title">Top Customers</h3>
        <p-table [value]="topCustomers" [rowHover]="true">
          <ng-template #header>
            <tr>
              <th style="width: 60px">Rank</th>
              <th>Customer</th>
              <th style="text-align: right">Invoices</th>
              <th style="text-align: right">Revenue</th>
              <th style="text-align: right">Outstanding</th>
              <th>Last Invoice</th>
            </tr>
          </ng-template>
          <ng-template #body let-c>
            <tr>
              <td>
                <span class="rank-badge">#{{ c.rank }}</span>
              </td>
              <td class="customer-name">{{ c.customer }}</td>
              <td style="text-align: right">{{ c.invoices }}</td>
              <td style="text-align: right">{{ c.revenue | currencyMyr }}</td>
              <td style="text-align: right">{{ c.outstanding | currencyMyr }}</td>
              <td class="text-muted">{{ c.lastInvoice }}</td>
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

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .chart-card {
      padding: 20px;
      margin-bottom: 20px;
    }

    .chart-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .chart-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .chart-half {
      min-width: 0;
    }

    .table-card {
      padding: 20px;
      margin-top: 0;
    }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-light, #eff6ff);
      color: var(--primary, #3b82f6);
      font-size: 12px;
      font-weight: 600;
    }

    .customer-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .text-muted {
      color: var(--text-secondary);
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .kpi-row {
        grid-template-columns: 1fr;
      }
      .chart-row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class ReportsComponent implements OnInit {
  private readonly notify = inject(NotificationService);

  dateRange: Date[] | null = null;

  // --- Revenue Trend (Area chart) ---
  revenueSeries: ApexAxisChartSeries = [
    {
      name: 'Revenue',
      data: [42000, 48000, 45000, 52000, 58000, 62000, 55000, 68000, 72000, 78000, 85000, 95000],
    },
  ];

  revenueChart: ApexChart = {
    type: 'area',
    height: 320,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  revenueXAxis: ApexXAxis = {
    categories: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    axisBorder: { show: false },
    axisTicks: { show: false },
  };

  revenueYAxis: ApexYAxis = {
    labels: {
      formatter: (val: number) => `RM ${(val / 1000).toFixed(0)}k`,
    },
  };

  revenueStroke: ApexStroke = {
    curve: 'smooth',
    width: 2,
  };

  revenueFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  };

  dataLabelsOff: ApexDataLabels = { enabled: false };

  // --- Invoice Aging (Horizontal bar) ---
  agingSeries: ApexAxisChartSeries = [
    {
      name: 'Invoices',
      data: [45, 28, 12, 5, 3],
    },
  ];

  agingChart: ApexChart = {
    type: 'bar',
    height: 280,
    toolbar: { show: false },
    fontFamily: 'inherit',
  };

  agingXAxis: ApexXAxis = {
    categories: ['Current', '1-30 days', '31-60 days', '61-90 days', '90+ days'],
  };

  agingPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      barHeight: '50%',
      borderRadius: 4,
      distributed: true,
    },
  };

  agingFill: ApexFill = {
    colors: ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
  };

  // --- LHDN Donut ---
  lhdnSeries: ApexNonAxisChartSeries = [338, 2, 2, 8];

  lhdnChart: ApexChart = {
    type: 'donut',
    height: 280,
    fontFamily: 'inherit',
  };

  lhdnLabels = ['Valid', 'Invalid', 'Cancelled', 'Pending'];

  lhdnFill: ApexFill = {
    colors: ['#22c55e', '#ef4444', '#94a3b8', '#f59e0b'],
  };

  lhdnDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
  };

  lhdnLegend: ApexLegend = {
    position: 'bottom',
  };

  lhdnResponsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: { width: '100%' },
        legend: { position: 'bottom' },
      },
    },
  ];

  // --- Top Customers ---
  topCustomers: TopCustomer[] = [];

  async ngOnInit(): Promise<void> {
    try {
      const [dashboardRes, revenueRes, agingRes, lhdnRes] = await Promise.all([
        analyticsControllerGetDashboard(),
        analyticsControllerGetMonthlyRevenue(),
        analyticsControllerGetAgingReport(),
        analyticsControllerGetLhdnReport(),
      ]);

      const dashboard = dashboardRes.data as any;
      if (dashboard) {
        this.topCustomers = dashboard.topCustomers ?? [];
      }

      const revenue = revenueRes.data as any;
      if (revenue?.months?.length) {
        this.revenueXAxis = { ...this.revenueXAxis, categories: revenue.months };
        this.revenueSeries = [{ name: 'Revenue', data: revenue.values ?? revenue.data ?? [] }];
      }

      const aging = agingRes.data as any;
      if (aging?.data?.length) {
        this.agingSeries = [{ name: 'Invoices', data: aging.data }];
        if (aging.categories?.length) {
          this.agingXAxis = { ...this.agingXAxis, categories: aging.categories };
        }
      }

      const lhdn = lhdnRes.data as any;
      if (lhdn?.data?.length) {
        this.lhdnSeries = lhdn.data;
        if (lhdn.labels?.length) {
          this.lhdnLabels = lhdn.labels;
        }
      }
    } catch {
      this.notify.error('Load Failed', 'Could not load report data');
    }
  }

  async exportReport(format: 'csv' | 'xlsx' = 'csv'): Promise<void> {
    try {
      const { data } = await invoicesControllerExportInvoices({
        query: { format } as any,
      });
      this.notify.success('Export Started', `Exporting invoices as ${format.toUpperCase()}`);
    } catch {
      this.notify.error('Export Failed', 'Could not export invoices');
    }
  }
}
