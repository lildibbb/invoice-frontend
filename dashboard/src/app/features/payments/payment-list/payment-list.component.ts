import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import '@phosphor-icons/web/index.js';

import {
  PageHeaderComponent,
  StatCardComponent,
  CurrencyMyrPipe,
} from '../../../shared';
import { PaymentStore } from '../payment.store';
import { NotificationService } from '../../../core/services/notification.service';
import { invoicesControllerFindAll } from '../../../core/api';

const METHOD_CONFIG: Record<string, { label: string; severity: string }> = {
  bank_transfer: { label: 'Bank Transfer', severity: 'info' },
  fpx: { label: 'FPX', severity: 'info' },
  cash: { label: 'Cash', severity: 'success' },
  credit_card: { label: 'Credit Card', severity: 'warn' },
  cheque: { label: 'Cheque', severity: 'secondary' },
};

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    AutoCompleteModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    StatCardComponent,
    CurrencyMyrPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PaymentStore],
  template: `
    <div class="page-container">
      <app-page-header title="Payments">
        <button actions pButton class="p-button-primary" (click)="showDialog.set(true)">
          <ph-icon name="plus" size="18" weight="bold"></ph-icon>
          Record Payment
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <app-stat-card
          label="Total Collected"
          [value]="totalCollected()"
          icon="currency-dollar"
          accent="blue"
        ></app-stat-card>
        <app-stat-card
          label="This Month"
          [value]="thisMonth()"
          icon="calendar-blank"
          accent="green"
        ></app-stat-card>
        <app-stat-card
          label="Payments"
          [value]="paymentCount()"
          icon="clock"
          accent="amber"
        ></app-stat-card>
        <app-stat-card
          label="Records"
          [value]="totalRecords()"
          icon="warning-circle"
          accent="red"
        ></app-stat-card>
      </div>

      <!-- Filter Bar -->
      <div class="invoiz-card p-4 mb-5">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex-1 min-w-[200px]">
            <input
              pInputText
              placeholder="Search payments..."
              class="w-full"
              [(ngModel)]="searchQuery"
            />
          </div>
          <p-select
            [options]="methodOptions"
            [(ngModel)]="selectedMethod"
            placeholder="All Methods"
            [style]="{ minWidth: '180px' }"
          ></p-select>
          <p-datepicker
            [(ngModel)]="dateRange"
            selectionMode="range"
            placeholder="Date range"
            [showIcon]="true"
            [style]="{ minWidth: '220px' }"
          ></p-datepicker>
        </div>
      </div>

      <!-- Table -->
      <div class="invoiz-card">
        <p-table [value]="paymentStore.payments()" [rows]="10" [paginator]="true" [loading]="paymentStore.isLoading()" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Recorded By</th>
              <th style="width: 120px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-payment>
            <tr>
              <td>{{ payment.date }}</td>
              <td class="font-medium">{{ payment.invoiceNumber }}</td>
              <td>{{ payment.customer }}</td>
              <td>{{ payment.amount | currencyMyr }}</td>
              <td>
                <p-tag
                  [value]="getMethodLabel(payment.method)"
                  [severity]="getMethodSeverity(payment.method)"
                  [styleClass]="payment.method === 'fpx' ? 'method-fpx' : ''"
                ></p-tag>
              </td>
              <td class="font-mono text-sm text-slate-500">{{ payment.reference }}</td>
              <td>{{ payment.recordedBy }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button pButton [text]="true" size="small" pTooltip="View Invoice">
                    <ph-icon name="eye" size="16"></ph-icon>
                  </button>
                  <button pButton [text]="true" size="small" pTooltip="Edit">
                    <ph-icon name="pencil-simple" size="16"></ph-icon>
                  </button>
                  <button pButton [text]="true" severity="danger" size="small" pTooltip="Delete" (click)="onDelete(payment)">
                    <ph-icon name="trash" size="16"></ph-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Record Payment Dialog -->
      <p-dialog
        header="Record Payment"
        [visible]="showDialog()"
        (visibleChange)="showDialog.set($event)"
        [style]="{ width: '500px' }"
        [modal]="true"
      >
        <div class="flex flex-col gap-4 pt-2">
          <div class="flex flex-col gap-1">
            <label class="form-label">Invoice</label>
            <p-autocomplete
              [(ngModel)]="dialogInvoice"
              [suggestions]="invoiceSuggestions"
              (completeMethod)="searchInvoices($event)"
              placeholder="Search invoice number..."
              class="w-full"
            ></p-autocomplete>
          </div>

          <div class="flex flex-col gap-1">
            <label class="form-label">Amount</label>
            <p-inputNumber
              [(ngModel)]="dialogAmount"
              mode="currency"
              currency="MYR"
              locale="en-MY"
              placeholder="0.00"
              class="w-full"
            ></p-inputNumber>
          </div>

          <div class="flex flex-col gap-1">
            <label class="form-label">Date</label>
            <p-datepicker
              [(ngModel)]="dialogDate"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              placeholder="Select date"
              class="w-full"
            ></p-datepicker>
          </div>

          <div class="flex flex-col gap-1">
            <label class="form-label">Method</label>
            <p-select
              [options]="paymentMethodOptions"
              [(ngModel)]="dialogMethod"
              placeholder="Select method"
              class="w-full"
            ></p-select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="form-label">Reference #</label>
            <input
              pInputText
              [(ngModel)]="dialogReference"
              placeholder="Enter reference number"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="form-label">Notes</label>
            <textarea
              pTextarea
              [(ngModel)]="dialogNotes"
              rows="3"
              placeholder="Optional notes..."
              class="w-full"
            ></textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button pButton [outlined]="true" (click)="showDialog.set(false)">Cancel</button>
            <button pButton class="p-button-primary" (click)="recordPayment()">
              Record Payment
            </button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
    }

    :host ::ng-deep .method-fpx {
      background-color: #8b5cf6 !important;
      color: #fff !important;
    }
  `],
})
export class PaymentListComponent implements OnInit {
  readonly paymentStore = inject(PaymentStore);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  showDialog = signal(false);

  searchQuery = '';
  selectedMethod: string | null = null;
  dateRange: Date[] | null = null;

  // Dialog form fields
  dialogInvoice: any = null;
  dialogAmount: number | null = null;
  dialogDate: Date | null = null;
  dialogMethod: string | null = null;
  dialogReference = '';
  dialogNotes = '';
  invoiceSuggestions: any[] = [];

  totalCollected = computed(() => {
    const payments = this.paymentStore.payments();
    const sum = payments.reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    return 'RM ' + sum.toLocaleString('en-MY', { minimumFractionDigits: 0 });
  });

  thisMonth = computed(() => {
    const payments = this.paymentStore.payments();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const sum = payments
      .filter((p: any) => {
        const d = new Date(p.paidAt ?? p.date ?? p.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    return 'RM ' + sum.toLocaleString('en-MY', { minimumFractionDigits: 0 });
  });

  paymentCount = computed(() => String(this.paymentStore.payments().length));

  totalRecords = computed(() => String(this.paymentStore.pagination().total || this.paymentStore.payments().length));

  methodOptions = [
    { label: 'All Methods', value: null },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'FPX', value: 'fpx' },
    { label: 'Cash', value: 'cash' },
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'Cheque', value: 'cheque' },
  ];

  paymentMethodOptions = [
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'Cash', value: 'CASH' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Online', value: 'ONLINE' },
    { label: 'Other', value: 'OTHER' },
  ];

  async ngOnInit(): Promise<void> {
    // Payments are per-invoice; load when invoiceUuid is available
  }

  getMethodLabel(method: string): string {
    return METHOD_CONFIG[method]?.label ?? METHOD_CONFIG[method?.toLowerCase()]?.label ?? method;
  }

  getMethodSeverity(method: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const key = method?.toLowerCase();
    return (METHOD_CONFIG[key]?.severity ?? 'secondary') as 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  }

  async searchInvoices(event: { query: string }): Promise<void> {
    try {
      const { data } = await invoicesControllerFindAll({
        query: { limit: 10, search: event.query },
      } as any);
      const payload = (data as any)?.data ?? data;
      const list = Array.isArray(payload) ? payload : payload?.data ?? [];
      this.invoiceSuggestions = list.map((inv: any) => ({
        label: inv.invoiceNo ?? inv.number ?? inv.uuid,
        uuid: inv.uuid,
      }));
    } catch {
      this.invoiceSuggestions = [];
    }
  }

  async recordPayment(): Promise<void> {
    const invoiceUuid = this.dialogInvoice?.uuid ?? this.dialogInvoice;
    if (!invoiceUuid || !this.dialogAmount) return;

    try {
      await this.paymentStore.recordPayment(invoiceUuid, {
        amount: this.dialogAmount,
        method: this.dialogMethod ?? 'OTHER',
        paidAt: this.dialogDate ? this.dialogDate.toISOString() : new Date().toISOString(),
        referenceNo: this.dialogReference || undefined,
        notes: this.dialogNotes || undefined,
      });
      this.notification.success('Payment recorded');
      this.showDialog.set(false);
      this.resetDialog();
      await this.paymentStore.loadPayments(invoiceUuid);
    } catch {
      this.notification.error('Failed to record payment');
    }
  }

  async onDelete(payment: any): Promise<void> {
    const invoiceUuid = payment.invoiceUuid ?? payment.invoice?.uuid ?? '';
    const paymentUuid = payment.uuid ?? payment.id ?? '';
    if (!invoiceUuid || !paymentUuid) return;
    try {
      await this.paymentStore.deletePayment(invoiceUuid, paymentUuid);
      this.notification.success('Payment deleted');
      await this.paymentStore.loadPayments(invoiceUuid);
    } catch {
      this.notification.error('Failed to delete payment');
    }
  }

  private resetDialog(): void {
    this.dialogInvoice = null;
    this.dialogAmount = null;
    this.dialogDate = null;
    this.dialogMethod = null;
    this.dialogReference = '';
    this.dialogNotes = '';
  }
}
