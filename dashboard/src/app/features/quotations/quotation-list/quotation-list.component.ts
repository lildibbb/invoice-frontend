import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyMyrPipe } from '../../../shared/pipes/currency-myr.pipe';
import { QuotationStore } from '../quotation.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
    TagModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    CurrencyMyrPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [QuotationStore],
  template: `
    <div class="page-container">
      <app-page-header title="Quotations">
        <button actions pButton class="p-button-primary action-btn" (click)="onCreate()">
          <ph-icon name="plus" size="18" weight="bold"></ph-icon>
          Create Quotation
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        <app-stat-card label="Total" [value]="totalQuotations()" icon="files" accent="blue"></app-stat-card>
        <app-stat-card label="Accepted" [value]="acceptedCount()" icon="check-circle" accent="green"></app-stat-card>
        <app-stat-card label="Pending" [value]="pendingCount()" icon="clock" accent="amber"></app-stat-card>
        <app-stat-card label="Expired" [value]="expiredCount()" icon="timer" accent="red"></app-stat-card>
        <app-stat-card label="Rejected" [value]="rejectedCount()" icon="x-circle" accent="violet"></app-stat-card>
      </div>

      <!-- Filter Bar -->
      <div class="invoiz-card p-4 mb-5">
        <div class="filter-bar">
          <span class="filter-search">
            <ph-icon name="magnifying-glass" size="18" weight="regular"></ph-icon>
            <input
              pInputText
              type="text"
              placeholder="Search quotations..."
              [(ngModel)]="searchQuery"
              class="filter-input"
            />
          </span>
          <p-select
            [options]="statusOptions"
            [(ngModel)]="selectedStatus"
            placeholder="Status"
            styleClass="filter-select"
          ></p-select>
          <p-calendar
            [(ngModel)]="dateFrom"
            placeholder="From"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
            styleClass="filter-calendar"
          ></p-calendar>
          <p-calendar
            [(ngModel)]="dateTo"
            placeholder="To"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
            styleClass="filter-calendar"
          ></p-calendar>
        </div>
      </div>

      <!-- Quotations Table -->
      <div class="invoiz-card">
        <p-table
          [value]="quotations()"
          [rows]="10"
          [paginator]="true"
          [rowsPerPageOptions]="[10, 25, 50]"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Quotation #</th>
              <th>Customer</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-q>
            <tr>
              <td class="font-medium">{{ q.quotationNo || q.number }}</td>
              <td>{{ q.customer?.name || q.customer }}</td>
              <td>{{ q.issueDate }}</td>
              <td>{{ q.expiryDate }}</td>
              <td>{{ q.amount | currencyMyr }}</td>
              <td>
                <p-tag
                  [value]="q.status | titlecase"
                  [severity]="getStatusSeverity(q.status)"
                ></p-tag>
              </td>
              <td>
                <div class="action-group">
                  <button pButton class="p-button-text p-button-sm action-icon" title="View" (click)="onView(q)">
                    <ph-icon name="eye" size="18" weight="regular"></ph-icon>
                  </button>
                  <button pButton class="p-button-text p-button-sm action-icon" title="Edit" (click)="onEdit(q)">
                    <ph-icon name="pencil-simple" size="18" weight="regular"></ph-icon>
                  </button>
                  <button pButton class="p-button-text p-button-sm action-icon" title="Delete" (click)="onDelete(q)">
                    <ph-icon name="trash" size="18" weight="regular"></ph-icon>
                  </button>
                  <button
                    *ngIf="q.status === 'draft'"
                    pButton
                    class="p-button-info p-button-sm convert-btn"
                    title="Send"
                    (click)="onSend(q)"
                  >
                    <ph-icon name="paper-plane-tilt" size="16" weight="bold"></ph-icon>
                    Send
                  </button>
                  <button
                    *ngIf="q.status === 'sent'"
                    pButton
                    class="p-button-success p-button-sm convert-btn"
                    title="Accept"
                    (click)="onAccept(q)"
                  >
                    <ph-icon name="check" size="16" weight="bold"></ph-icon>
                    Accept
                  </button>
                  <button
                    *ngIf="q.status === 'sent'"
                    pButton
                    class="p-button-danger p-button-sm convert-btn"
                    title="Reject"
                    (click)="onReject(q)"
                  >
                    <ph-icon name="x" size="16" weight="bold"></ph-icon>
                    Reject
                  </button>
                  <button
                    *ngIf="q.status === 'accepted'"
                    pButton
                    class="p-button-success p-button-sm convert-btn"
                    title="Convert to Invoice"
                    (click)="onConvert(q)"
                  >
                    <ph-icon name="swap" size="16" weight="bold"></ph-icon>
                    Convert to Invoice
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center p-6 text-muted">No quotations found.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-search {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 200px;
      color: var(--text-secondary);
    }

    .filter-input {
      width: 100%;
      font-size: 13px;
    }

    :host ::ng-deep .filter-select {
      min-width: 150px;
    }

    :host ::ng-deep .filter-calendar {
      min-width: 140px;
    }

    .action-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-icon {
      padding: 6px;
      color: var(--text-secondary);
      &:hover { color: var(--primary); }
    }

    .convert-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .text-center { text-align: center; }
    .text-muted { color: var(--text-secondary); }
  `],
})
export class QuotationListComponent implements OnInit {
  private readonly store = inject(QuotationStore);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  searchQuery = '';
  selectedStatus: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  quotations = computed(() => this.store.quotations());
  isLoading = computed(() => this.store.isLoading());
  pagination = computed(() => this.store.pagination());

  totalQuotations = computed(() => String(this.quotations().length));
  acceptedCount = computed(() =>
    String(this.quotations().filter((q: any) => q.status?.toLowerCase() === 'accepted').length),
  );
  pendingCount = computed(() =>
    String(this.quotations().filter((q: any) => {
      const s = q.status?.toLowerCase();
      return s === 'pending' || s === 'sent' || s === 'draft';
    }).length),
  );
  expiredCount = computed(() =>
    String(this.quotations().filter((q: any) => q.status?.toLowerCase() === 'expired').length),
  );
  rejectedCount = computed(() =>
    String(this.quotations().filter((q: any) => q.status?.toLowerCase() === 'rejected').length),
  );

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Expired', value: 'expired' },
    { label: 'Rejected', value: 'rejected' },
  ];

  ngOnInit(): void {
    this.store.loadQuotations();
  }

  onSearch(): void {
    this.store.setFilters({ search: this.searchQuery, status: this.selectedStatus });
    this.store.loadQuotations();
  }

  onCreate(): void {
    this.router.navigate(['/app/quotations/create']);
  }

  onView(q: any): void {
    this.router.navigate(['/app/quotations', q.uuid]);
  }

  onEdit(q: any): void {
    this.router.navigate(['/app/quotations', q.uuid, 'edit']);
  }

  async onDelete(q: any): Promise<void> {
    try {
      await this.store.deleteQuotation(q.uuid);
      this.notify.success('Quotation deleted');
      this.store.loadQuotations();
    } catch {
      this.notify.error('Failed to delete quotation');
    }
  }

  async onSend(q: any): Promise<void> {
    try {
      await this.store.sendQuotation(q.uuid);
      this.notify.success('Quotation sent');
      this.store.loadQuotations();
    } catch {
      this.notify.error('Failed to send quotation');
    }
  }

  async onAccept(q: any): Promise<void> {
    try {
      await this.store.acceptQuotation(q.uuid);
      this.notify.success('Quotation accepted');
      this.store.loadQuotations();
    } catch {
      this.notify.error('Failed to accept quotation');
    }
  }

  async onReject(q: any): Promise<void> {
    try {
      await this.store.rejectQuotation(q.uuid);
      this.notify.success('Quotation rejected');
      this.store.loadQuotations();
    } catch {
      this.notify.error('Failed to reject quotation');
    }
  }

  async onConvert(q: any): Promise<void> {
    try {
      await this.store.convertToInvoice(q.uuid);
      this.notify.success('Converted to invoice');
      this.store.loadQuotations();
    } catch {
      this.notify.error('Failed to convert quotation');
    }
  }

  getStatusSeverity(status: string): 'secondary' | 'info' | 'success' | 'warn' | 'danger' {
    const map: Record<string, 'secondary' | 'info' | 'success' | 'warn' | 'danger'> = {
      draft: 'secondary',
      sent: 'info',
      accepted: 'success',
      expired: 'warn',
      rejected: 'danger',
    };
    return map[status] ?? 'secondary';
  }
}
