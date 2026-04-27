import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyMyrPipe } from '../../../shared/pipes/currency-myr.pipe';
import { InvoiceStore, type InvoiceStatus } from '../invoice.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    MultiSelectModule,
    DatePickerModule,
    SelectModule,
    MenuModule,
    CheckboxModule,
    InputTextModule,
    PaginatorModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyMyrPipe,
  ],
  providers: [InvoiceStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <!-- Header -->
      <app-page-header title="Invoices" subtitle="Manage and track your invoices">
        <div actions>
          <button pButton class="p-button-outlined p-button-sm" (click)="onExport()">
            <ph-icon name="export" size="16" weight="bold"></ph-icon>
            Export
          </button>
          <button pButton class="p-button-primary p-button-sm" (click)="createInvoice()">
            <ph-icon name="plus" size="16" weight="bold"></ph-icon>
            Create Invoice
          </button>
        </div>
      </app-page-header>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Total Invoices</span>
          <span class="stat-pill__value">342</span>
        </div>
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Paid</span>
          <span class="stat-pill__value stat-pill__value--green">RM 847,200</span>
        </div>
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Outstanding</span>
          <span class="stat-pill__value stat-pill__value--amber">RM 28,400</span>
        </div>
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Overdue</span>
          <span class="stat-pill__value stat-pill__value--red">3 invoices</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="invoiz-card filter-bar">
        <span class="p-input-icon-left filter-bar__search">
          <ph-icon name="magnifying-glass" size="16" weight="regular"></ph-icon>
          <input
            pInputText
            type="text"
            placeholder="Search invoices..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            class="filter-bar__search-input"
          />
        </span>

        <p-multiselect
          [options]="statusOptions"
          [(ngModel)]="selectedStatuses"
          (ngModelChange)="onFilterChange()"
          placeholder="Status"
          optionLabel="label"
          optionValue="value"
          [maxSelectedLabels]="2"
          [style]="{ minWidth: '160px' }"
        ></p-multiselect>

        <p-datepicker
          [(ngModel)]="dateRange"
          (ngModelChange)="onFilterChange()"
          selectionMode="range"
          placeholder="Date range"
          [showIcon]="true"
          dateFormat="dd/mm/yy"
          [style]="{ minWidth: '220px' }"
        ></p-datepicker>

        <p-select
          [options]="customerOptions"
          [(ngModel)]="selectedCustomer"
          placeholder="Customer"
          [showClear]="true"
          optionLabel="label"
          optionValue="value"
          [style]="{ minWidth: '200px' }"
        ></p-select>

        <span class="filter-bar__spacer"></span>

        <button pButton class="p-button-text p-button-sm" (click)="clearFilters()">
          <ph-icon name="funnel-simple" size="16" weight="bold"></ph-icon>
          Clear
        </button>
      </div>

      <!-- Table -->
      <div class="invoiz-card table-card">
        <p-table
          [value]="invoices()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [(selection)]="selectedInvoices"
          dataKey="uuid"
          [loading]="isLoading()"
          [sortMode]="'single'"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 48px">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th pSortableColumn="invoiceNo">
                Invoice # <p-sortIcon field="invoiceNo"></p-sortIcon>
              </th>
              <th pSortableColumn="customer">
                Customer <p-sortIcon field="customer"></p-sortIcon>
              </th>
              <th pSortableColumn="issueDate" class="hide-mobile">
                Issue Date <p-sortIcon field="issueDate"></p-sortIcon>
              </th>
              <th pSortableColumn="dueDate">
                Due Date <p-sortIcon field="dueDate"></p-sortIcon>
              </th>
              <th pSortableColumn="amount" style="text-align: right">
                Amount <p-sortIcon field="amount"></p-sortIcon>
              </th>
              <th pSortableColumn="status">
                Status <p-sortIcon field="status"></p-sortIcon>
              </th>
              <th class="hide-mobile">LHDN</th>
              <th style="width: 56px">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-inv>
            <tr>
              <td>
                <p-tableCheckbox [value]="inv"></p-tableCheckbox>
              </td>
              <td class="font-medium">{{ inv.invoiceNo }}</td>
              <td>{{ inv.customer }}</td>
              <td class="hide-mobile">{{ inv.issueDate }}</td>
              <td>{{ inv.dueDate }}</td>
              <td style="text-align: right">{{ inv.amount | currencyMyr }}</td>
              <td>
                <app-status-badge [status]="inv.status" size="sm"></app-status-badge>
              </td>
              <td class="hide-mobile">
                <app-status-badge
                  *ngIf="inv.lhdn"
                  [status]="inv.lhdn"
                  size="sm"
                ></app-status-badge>
                <span *ngIf="!inv.lhdn" class="text-muted">-</span>
              </td>
              <td>
                <button
                  pButton
                  class="p-button-text p-button-sm p-button-rounded action-menu-btn"
                  (click)="actionMenu.toggle($event); activeInvoice = inv"
                >
                  <ph-icon name="dots-three" size="18" weight="bold"></ph-icon>
                </button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center py-6" style="color: var(--text-muted)">
                No invoices found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Action Menu -->
      <p-menu #actionMenu [model]="actionMenuItems" [popup]="true"></p-menu>

      <!-- Batch Action Bar -->
      <div class="batch-bar" *ngIf="selectedInvoices.length > 0">
        <span class="batch-bar__count">{{ selectedInvoices.length }} selected</span>
        <div class="batch-bar__actions">
          <button pButton class="p-button-outlined p-button-sm" (click)="onBulkSend()">
            <ph-icon name="envelope-simple" size="16" weight="bold"></ph-icon>
            Send Email
          </button>
          <button pButton class="p-button-outlined p-button-sm">
            <ph-icon name="cloud-arrow-up" size="16" weight="bold"></ph-icon>
            Submit to LHDN
          </button>
          <button pButton class="p-button-outlined p-button-sm">
            <ph-icon name="export" size="16" weight="bold"></ph-icon>
            Export
          </button>
          <button pButton class="p-button-danger p-button-sm">
            <ph-icon name="trash" size="16" weight="bold"></ph-icon>
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Stats Row */
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .stat-pill {
      display: flex;
      flex-direction: column;
      padding: 8px 16px;
      min-width: max-content;
    }

    .stat-pill__label {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .stat-pill__value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;

      &--green { color: var(--status-paid); }
      &--amber { color: var(--status-pending); }
      &--red   { color: var(--status-overdue); }
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-bar__search {
      position: relative;

      ph-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        z-index: 1;
      }
    }

    .filter-bar__search-input {
      width: 280px;
      padding-left: 36px !important;
    }

    .filter-bar__spacer {
      flex: 1;
    }

    /* Table */
    .table-card {
      margin-bottom: 20px;
      overflow: hidden;
    }

    .text-muted {
      color: var(--text-muted);
      font-size: 13px;
    }

    .action-menu-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Batch Action Bar */
    .batch-bar {
      position: fixed;
      bottom: 0;
      left: var(--sidebar-width, 240px);
      right: 0;
      background: var(--card-bg);
      border-top: 1px solid var(--card-border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 100;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    }

    .batch-bar__count {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .batch-bar__actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hide-mobile {
        display: none;
      }

      .filter-bar__search-input {
        width: 100%;
      }

      .batch-bar {
        left: 0;
      }
    }
  `],
})
export class InvoiceListComponent implements OnInit {
  readonly invoiceStore = inject(InvoiceStore);
  private notification = inject(NotificationService);
  private router = inject(Router);

  invoices = computed(() => this.invoiceStore.invoices());
  isLoading = computed(() => this.invoiceStore.isLoading());
  pagination = computed(() => this.invoiceStore.pagination());

  searchQuery = '';
  selectedStatuses: string[] = [];
  dateRange: Date[] | null = null;
  selectedCustomer: string | null = null;
  selectedInvoices: any[] = [];
  activeInvoice: any | null = null;

  statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Pending', value: 'pending' },
    { label: 'Voided', value: 'voided' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  customerOptions = [
    { label: 'TechVentures Sdn Bhd', value: 'TechVentures Sdn Bhd' },
    { label: 'Nusantara Holdings Bhd', value: 'Nusantara Holdings Bhd' },
    { label: 'Warisan Digital Sdn Bhd', value: 'Warisan Digital Sdn Bhd' },
    { label: 'Petronas Carigali Sdn Bhd', value: 'Petronas Carigali Sdn Bhd' },
    { label: 'Axiata Digital Sdn Bhd', value: 'Axiata Digital Sdn Bhd' },
    { label: 'Sapura Energy Bhd', value: 'Sapura Energy Bhd' },
    { label: 'CIMB Bank Bhd', value: 'CIMB Bank Bhd' },
    { label: 'Gamuda Bhd', value: 'Gamuda Bhd' },
  ];

  actionMenuItems = [
    { label: 'View', icon: 'pi pi-eye', command: () => this.viewInvoice(this.activeInvoice?.uuid) },
    { label: 'Edit', icon: 'pi pi-pencil', command: () => this.editInvoice(this.activeInvoice?.uuid) },
    { label: 'Duplicate', icon: 'pi pi-copy', command: () => this.onClone(this.activeInvoice?.uuid) },
    { separator: true },
    { label: 'Send Email', icon: 'pi pi-envelope', command: () => this.onSend(this.activeInvoice?.uuid) },
    { label: 'Submit to LHDN', icon: 'pi pi-cloud-upload', command: () => this.onSubmitEinvoice(this.activeInvoice?.uuid) },
    { separator: true },
    { label: 'Void', icon: 'pi pi-ban', styleClass: 'text-red-500', command: () => this.onVoid(this.activeInvoice?.uuid) },
  ];

  async ngOnInit(): Promise<void> {
    await this.invoiceStore.loadInvoices();
  }

  onPageChange(event: any): void {
    this.invoiceStore.setPage(Math.floor(event.first / event.rows) + 1);
    this.invoiceStore.loadInvoices();
  }

  onFilterChange(): void {
    this.invoiceStore.setFilters({
      invoiceNo: this.searchQuery,
      status: (this.selectedStatuses?.length === 1 ? this.selectedStatuses[0] : null) as InvoiceStatus | null,
      fromDate: this.dateRange?.[0]?.toISOString() ?? null,
      toDate: this.dateRange?.[1]?.toISOString() ?? null,
    });
    this.invoiceStore.loadInvoices();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatuses = [];
    this.dateRange = null;
    this.selectedCustomer = null;
    this.invoiceStore.setFilters({ invoiceNo: '', status: null, fromDate: null, toDate: null });
    this.invoiceStore.loadInvoices();
  }

  async onDelete(uuid: string): Promise<void> {
    try {
      await this.invoiceStore.deleteInvoice(uuid);
      this.notification.success('Invoice deleted');
      await this.invoiceStore.loadInvoices();
    } catch {
      this.notification.error('Failed to delete invoice');
    }
  }

  async onFinalize(uuid: string): Promise<void> {
    try {
      await this.invoiceStore.finalizeInvoice(uuid);
      this.notification.success('Invoice finalized');
      await this.invoiceStore.loadInvoices();
    } catch {
      this.notification.error('Failed to finalize invoice');
    }
  }

  async onSend(uuid: string): Promise<void> {
    try {
      await this.invoiceStore.sendInvoice(uuid);
      this.notification.success('Invoice sent');
      await this.invoiceStore.loadInvoices();
    } catch {
      this.notification.error('Failed to send invoice');
    }
  }

  async onVoid(uuid: string): Promise<void> {
    try {
      await this.invoiceStore.voidInvoice(uuid, 'Voided by user');
      this.notification.success('Invoice voided');
      await this.invoiceStore.loadInvoices();
    } catch {
      this.notification.error('Failed to void invoice');
    }
  }

  async onClone(uuid: string): Promise<void> {
    try {
      const cloned = await this.invoiceStore.cloneInvoice(uuid);
      this.notification.success('Invoice duplicated');
      if (cloned?.uuid) {
        this.router.navigate(['/app/invoices', cloned.uuid, 'edit']);
      } else {
        await this.invoiceStore.loadInvoices();
      }
    } catch {
      this.notification.error('Failed to duplicate invoice');
    }
  }

  async onSubmitEinvoice(uuid: string): Promise<void> {
    try {
      await this.invoiceStore.submitEinvoice(uuid);
      this.notification.success('Submitted to LHDN');
      await this.invoiceStore.loadInvoices();
    } catch {
      this.notification.error('Failed to submit to LHDN');
    }
  }

  async onBulkSend(): Promise<void> {
    const uuids = this.selectedInvoices.map((inv: any) => inv.uuid);
    try {
      await this.invoiceStore.bulkSend(uuids);
      this.notification.success('Invoices sent');
      this.selectedInvoices = [];
      await this.invoiceStore.loadInvoices();
    } catch {
      this.notification.error('Failed to send invoices');
    }
  }

  async onExport(): Promise<void> {
    try {
      await this.invoiceStore.exportInvoices();
      this.notification.success('Export started');
    } catch {
      this.notification.error('Failed to export invoices');
    }
  }

  viewInvoice(uuid: string): void {
    this.router.navigate(['/app/invoices', uuid]);
  }

  editInvoice(uuid: string): void {
    this.router.navigate(['/app/invoices', uuid, 'edit']);
  }

  createInvoice(): void {
    this.router.navigate(['/app/invoices/create']);
  }
}
