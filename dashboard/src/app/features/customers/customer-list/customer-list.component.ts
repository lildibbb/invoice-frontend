import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import '@phosphor-icons/web/index.js';
import { Subscription } from 'rxjs';

import {
  PageHeaderComponent,
  StatusBadgeComponent,
  FileUploadZoneComponent,
  CurrencyMyrPipe,
} from '../../../shared';
import { CustomerStore } from '../customer.store';
import { NotificationService } from '../../../core/services/notification.service';
import { SseService } from '../../../core/services/sse.service';
import {
  customersControllerGetUploadStatus,
  customersControllerDownloadErrors,
} from '../../../core/api';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    ProgressBarModule,
    DialogModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    FileUploadZoneComponent,
    CurrencyMyrPipe,
  ],
  providers: [CustomerStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <app-page-header title="Customers">
        <div actions class="flex items-center gap-2">
          <button pButton class="p-button-outlined" (click)="showUploadDialog = true">
            <ph-icon name="upload-simple" size="18" weight="duotone"></ph-icon>
            Bulk Upload
          </button>
          <button pButton class="p-button-primary add-btn" (click)="navigateToCreate()">
            <ph-icon name="user-plus" size="18" weight="duotone"></ph-icon>
            Add Customer
          </button>
        </div>
      </app-page-header>

      <!-- Upload Progress Bar -->
      @if (uploadStatus() === 'processing') {
        <div class="invoiz-card upload-progress-card mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium" style="color: var(--text-primary)">Uploading customers...</span>
            <span class="text-sm font-medium" style="color: var(--primary)">{{ uploadProgress() }}%</span>
          </div>
          <p-progressBar [value]="uploadProgress()" [showValue]="false" [style]="{ height: '8px' }"></p-progressBar>
        </div>
      }
      @if (uploadStatus() === 'completed') {
        <div class="invoiz-card upload-progress-card upload-progress-card--done mb-6">
          <div class="flex items-center gap-2">
            <ph-icon name="check-circle" size="20" weight="duotone" style="color: var(--status-paid, #10b981)"></ph-icon>
            <span class="text-sm font-medium" style="color: var(--status-paid, #10b981)">Bulk upload completed successfully</span>
          </div>
          @if (lastJobId) {
            <button pButton class="p-button-text p-button-sm" (click)="downloadErrors()">Download Error Report</button>
          }
        </div>
      }
      @if (uploadStatus() === 'failed') {
        <div class="invoiz-card upload-progress-card upload-progress-card--error mb-6">
          <div class="flex items-center gap-2">
            <ph-icon name="x-circle" size="20" weight="duotone" style="color: var(--status-overdue, #ef4444)"></ph-icon>
            <span class="text-sm font-medium" style="color: var(--status-overdue, #ef4444)">Bulk upload failed</span>
          </div>
          @if (lastJobId) {
            <button pButton class="p-button-text p-button-sm" (click)="downloadErrors()">Download Error Report</button>
          }
        </div>
      }

      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div class="invoiz-card stat-pill">
          <div class="stat-pill__label">Total Customers</div>
          <div class="stat-pill__value">{{ totalCustomers() }}</div>
        </div>
        <div class="invoiz-card stat-pill">
          <div class="stat-pill__label">Active</div>
          <div class="stat-pill__value stat-pill__value--green">{{ activeCustomers() }}</div>
        </div>
        <div class="invoiz-card stat-pill">
          <div class="stat-pill__label">Total Invoiced</div>
          <div class="stat-pill__value">{{ totalInvoiced() }}</div>
        </div>
        <div class="invoiz-card stat-pill">
          <div class="stat-pill__label">Outstanding</div>
          <div class="stat-pill__value stat-pill__value--amber">{{ totalOutstanding() }}</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="invoiz-card filter-bar mb-6">
        <div class="filter-bar__left">
          <span class="p-input-icon-left search-wrapper">
            <ph-icon name="magnifying-glass" size="16" weight="regular" class="search-icon"></ph-icon>
            <input
              pInputText
              type="text"
              placeholder="Search customers..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
              class="search-input"
            />
          </span>
          <p-select
            [options]="statusOptions"
            [(ngModel)]="selectedStatus"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            class="status-filter"
          ></p-select>
        </div>
        <button
          pButton
          class="p-button-text p-button-sm clear-btn"
          (click)="clearFilters()"
        >
          Clear filters
        </button>
      </div>

      <!-- Table -->
      <div class="invoiz-card">
        <p-table
          [value]="customers()"
          [rows]="10"
          [paginator]="true"
          [rowsPerPageOptions]="[5, 10, 25]"
          [loading]="isLoading()"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Invoiced</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th style="width: 100px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-customer>
            <tr>
              <td>
                <div class="customer-name-cell">
                  <span
                    class="avatar"
                    [ngStyle]="{ background: getAvatarColor(customer.name) }"
                  >
                    {{ getInitials(customer.name) }}
                  </span>
                  <span class="font-medium">{{ customer.name }}</span>
                </div>
              </td>
              <td>{{ customer.company }}</td>
              <td>
                <span class="text-muted">{{ customer.email }}</span>
              </td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.totalInvoiced | currencyMyr }}</td>
              <td>
                <span [class.text-outstanding]="customer.outstanding > 0">
                  {{ customer.outstanding | currencyMyr }}
                </span>
              </td>
              <td>
                <app-status-badge
                  [status]="customer.status"
                  size="sm"
                ></app-status-badge>
              </td>
              <td>
                <div class="actions-cell">
                  <a
                    pButton
                    class="p-button-text p-button-sm p-button-rounded action-icon-btn"
                    [routerLink]="['/app/customers', customer.uuid]"
                    title="View"
                  >
                    <ph-icon name="eye" size="16" weight="regular"></ph-icon>
                  </a>
                  <button
                    pButton
                    class="p-button-text p-button-sm p-button-rounded action-icon-btn"
                    title="Edit"
                    (click)="editCustomer(customer.uuid)"
                  >
                    <ph-icon name="pencil-simple" size="16" weight="regular"></ph-icon>
                  </button>
                  <button
                    pButton
                    class="p-button-text p-button-sm p-button-rounded action-icon-btn action-icon-btn--danger"
                    title="Delete"
                    (click)="onDelete(customer.uuid)"
                  >
                    <ph-icon name="trash" size="16" weight="regular"></ph-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center text-muted" style="padding: 40px 0">
                No customers found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Bulk Upload Dialog -->
      <p-dialog
        header="Bulk Upload Customers"
        [(visible)]="showUploadDialog"
        [modal]="true"
        [style]="{ width: '520px' }"
      >
        <app-file-upload-zone
          accept=".csv,.xlsx"
          hint="Upload a CSV or Excel file with customer data"
          (filesSelected)="onBulkUpload($event)"
        ></app-file-upload-zone>
        @if (uploadStatus() === 'processing') {
          <div class="mt-4">
            <p-progressBar [value]="uploadProgress()" [style]="{ height: '8px' }"></p-progressBar>
          </div>
        }
      </p-dialog>
    </div>
  `,
  styles: [`
    /* Stats Pills */
    .stat-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
    }

    .stat-pill__label {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-pill__value {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);

      &--green { color: var(--status-paid, #10b981); }
      &--amber { color: var(--status-pending, #f59e0b); }
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      gap: 12px;
    }

    .filter-bar__left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted, #94a3b8);
      pointer-events: none;
      z-index: 1;
    }

    .search-input {
      width: 280px;
      padding-left: 34px !important;
      font-size: 13px;
    }

    .status-filter {
      min-width: 140px;
    }

    .clear-btn {
      font-size: 13px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    /* Avatar */
    .customer-name-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    /* Table helpers */
    .text-muted {
      color: var(--text-muted, #94a3b8);
      font-size: 13px;
    }

    .text-outstanding {
      color: var(--status-pending, #f59e0b);
      font-weight: 600;
    }

    .text-center {
      text-align: center;
    }

    /* Actions */
    .actions-cell {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .action-icon-btn {
      width: 30px;
      height: 30px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;

      &:hover {
        background: var(--surface-ground, #f1f5f9);
        color: var(--text-primary);
      }

      &--danger:hover {
        background: var(--status-overdue-bg, #fef2f2);
        color: var(--status-overdue, #ef4444);
      }
    }

    /* Add Button */
    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-bar__left {
        flex-direction: column;
      }

      .search-input {
        width: 100%;
      }
    }

    /* Upload Progress */
    .upload-progress-card {
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
    }

    .upload-progress-card--done {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .upload-progress-card--error {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  `],
})
export class CustomerListComponent implements OnInit, OnDestroy {
  readonly customerStore = inject(CustomerStore);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private sseService = inject(SseService);

  customers = computed(() => this.customerStore.customers());
  isLoading = computed(() => this.customerStore.isLoading());

  uploadProgress = signal(0);
  uploadStatus = signal<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  showUploadDialog = false;
  lastJobId = '';
  private sseSub?: Subscription;

  totalCustomers = computed(() => String(this.customers().length));
  activeCustomers = computed(() =>
    String(this.customers().filter((c: any) => c.status === 'active' || c.isActive !== false).length),
  );
  totalInvoiced = computed(() => {
    const sum = this.customers().reduce((s: number, c: any) => s + (c.totalInvoiced ?? 0), 0);
    return 'RM ' + sum.toLocaleString('en-MY');
  });
  totalOutstanding = computed(() => {
    const sum = this.customers().reduce((s: number, c: any) => s + (c.outstanding ?? 0), 0);
    return 'RM ' + sum.toLocaleString('en-MY');
  });

  searchQuery = '';
  selectedStatus = '';

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  private readonly avatarColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  async ngOnInit(): Promise<void> {
    await this.customerStore.loadCustomers();
  }

  async onSearch(query: string): Promise<void> {
    this.customerStore.setSearch(query);
    await this.customerStore.loadCustomers();
  }

  async onDelete(uuid: string): Promise<void> {
    try {
      await this.customerStore.deleteCustomer(uuid);
      this.notification.success('Customer deleted');
      await this.customerStore.loadCustomers();
    } catch {
      this.notification.error('Failed to delete customer');
    }
  }

  viewCustomer(uuid: string): void {
    this.router.navigate(['/app/customers', uuid]);
  }

  editCustomer(uuid: string): void {
    this.router.navigate(['/app/customers', uuid, 'edit']);
  }

  navigateToCreate(): void {
    this.router.navigate(['/app/customers', 'new']);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  async clearFilters(): Promise<void> {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.customerStore.setSearch('');
    await this.customerStore.loadCustomers();
  }

  async onBulkUpload(files: File[]): Promise<void> {
    const file = files[0];
    if (!file) return;
    this.uploadProgress.set(0);
    this.uploadStatus.set('processing');
    try {
      const result = await this.customerStore.bulkUpload(file);
      const response = (result as any)?.data ?? result;
      const jobId = response?.jobId ?? response?.id ?? '';
      if (jobId) {
        this.lastJobId = jobId;
        this.trackUploadProgress(jobId);
      } else {
        this.uploadProgress.set(100);
        this.uploadStatus.set('completed');
        this.showUploadDialog = false;
        this.notification.success('Bulk upload completed');
        await this.customerStore.loadCustomers();
      }
    } catch {
      this.uploadStatus.set('failed');
      this.notification.error('Bulk upload failed');
    }
  }

  trackUploadProgress(jobId: string): void {
    this.sseSub?.unsubscribe();
    const url = `${environment.apiUrl}/api/v1/customers/bulk-upload/progress/${jobId}`;
    this.sseSub = this.sseService.connect(url).subscribe({
      next: (progress) => {
        this.uploadProgress.set(progress.percentage ?? 0);
        this.uploadStatus.set(progress.status ?? 'processing');
        if (progress.status === 'completed' || progress.percentage >= 100) {
          this.uploadStatus.set('completed');
          this.showUploadDialog = false;
          this.notification.success('Bulk upload completed');
          this.customerStore.loadCustomers();
        }
      },
      error: () => {
        this.uploadStatus.set('failed');
        this.notification.error('Upload progress connection lost');
      },
      complete: () => {
        if (this.uploadStatus() === 'processing') {
          this.uploadStatus.set('completed');
          this.showUploadDialog = false;
          this.notification.success('Bulk upload completed');
          this.customerStore.loadCustomers();
        }
      },
    });
  }

  async checkUploadStatus(jobId: string): Promise<void> {
    try {
      const { data } = await customersControllerGetUploadStatus({ path: { jobId } } as any);
      const status = (data as any)?.data ?? data;
      this.uploadProgress.set(status?.percentage ?? 0);
      this.uploadStatus.set(status?.status ?? 'idle');
    } catch {
      this.notification.error('Failed to check upload status');
    }
  }

  async downloadErrors(): Promise<void> {
    if (!this.lastJobId) return;
    try {
      const { data } = await customersControllerDownloadErrors({ path: { jobId: this.lastJobId } } as any);
      const blob = data instanceof Blob ? data : new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-upload-errors-${this.lastJobId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      this.notification.error('Failed to download error report');
    }
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
  }
}
