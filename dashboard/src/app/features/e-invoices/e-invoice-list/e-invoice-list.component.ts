import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import '@phosphor-icons/web/index.js';

import {
  PageHeaderComponent,
  StatCardComponent,
  StatusBadgeComponent,
} from '../../../shared';
import { EInvoiceStore } from '../e-invoice.store';
import { NotificationService } from '../../../core/services/notification.service';
import { eInvoiceSubmissionsControllerGetQrCode } from '../../../core/api';

interface EInvoice {
  invoiceNumber: string;
  customer: string;
  submittedAt: string;
  lhdnUuid: string;
  status: string;
  validationErrors?: string[];
}

@Component({
  selector: 'app-e-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DrawerModule,
    TooltipModule,
    DialogModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [EInvoiceStore],
  template: `
    <div class="page-container">
      <app-page-header title="LHDN e-Invoices">
        <button actions pButton [outlined]="true" (click)="bulkSubmit()">
          <ph-icon name="cloud-arrow-up" size="18" weight="duotone"></ph-icon>
          Bulk Submit
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        <app-stat-card
          label="Submitted"
          [value]="submittedCount()"
          icon="cloud-arrow-up"
          accent="blue"
        ></app-stat-card>
        <app-stat-card
          label="Valid"
          [value]="validCount()"
          icon="check-circle"
          accent="green"
        ></app-stat-card>
        <app-stat-card
          label="Invalid"
          [value]="invalidCount()"
          icon="x-circle"
          accent="red"
        ></app-stat-card>
        <app-stat-card
          label="Cancelled"
          [value]="cancelledCount()"
          icon="prohibit"
          accent="amber"
        ></app-stat-card>
        <app-stat-card
          label="Success Rate"
          [value]="successRate()"
          icon="chart-line-up"
          accent="violet"
        ></app-stat-card>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap gap-2 mb-5">
        @for (tab of filterTabs; track tab.value) {
          <button
            class="filter-tab"
            [class.filter-tab--active]="activeTab() === tab.value"
            (click)="activeTab.set(tab.value)"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Table -->
      <div class="invoiz-card">
        <p-table
          [value]="filteredInvoices()"
          [rows]="10"
          [paginator]="true"
          styleClass="p-datatable-sm"
          selectionMode="single"
          (onRowSelect)="onRowSelect($event)"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Submitted At</th>
              <th>LHDN UUID</th>
              <th>Status</th>
              <th style="width: 160px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-inv>
            <tr (click)="openSidebar(inv)" class="cursor-pointer">
              <td class="font-medium">{{ inv.invoiceNumber }}</td>
              <td>{{ inv.customer }}</td>
              <td>{{ inv.submittedAt }}</td>
              <td>
                <span
                  class="uuid-cell"
                  [pTooltip]="inv.lhdnUuid"
                  tooltipPosition="top"
                >
                  {{ inv.lhdnUuid | slice:0:13 }}…
                </span>
              </td>
              <td>
                <app-status-badge [status]="inv.status" size="sm"></app-status-badge>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button pButton [text]="true" size="small" (click)="openSidebar(inv); $event.stopPropagation()">
                    View Details
                  </button>
                  @if (inv.status === 'valid' || inv.status === 'submitted') {
                    <button
                      pButton
                      [text]="true"
                      size="small"
                      (click)="viewQrCode(inv); $event.stopPropagation()"
                    >
                      View QR
                    </button>
                  }
                  @if (inv.status === 'invalid') {
                    <button
                      pButton
                      [text]="true"
                      severity="warn"
                      size="small"
                      (click)="retrySubmission(inv); $event.stopPropagation()"
                    >
                      Retry
                    </button>
                  }
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Detail Sidebar -->
      <p-drawer
        [visible]="sidebarVisible()"
        (visibleChange)="sidebarVisible.set($event)"
        position="right"
        [style]="{ width: '480px' }"
        header="Submission Details"
      >
        @if (selectedInvoice(); as inv) {
          <div class="flex flex-col gap-5">
            <!-- Invoice & Customer -->
            <div>
              <div class="detail-label">Invoice #</div>
              <div class="detail-value font-medium">{{ inv.invoiceNumber }}</div>
            </div>
            <div>
              <div class="detail-label">Customer</div>
              <div class="detail-value">{{ inv.customer }}</div>
            </div>

            <!-- LHDN UUID -->
            <div>
              <div class="detail-label">LHDN UUID</div>
              <div
                class="uuid-copyable"
                (click)="copyUuid(inv.lhdnUuid)"
                pTooltip="Click to copy"
                tooltipPosition="top"
              >
                {{ inv.lhdnUuid }}
                <ph-icon name="copy" size="14" weight="regular"></ph-icon>
              </div>
            </div>

            <!-- Submitted At -->
            <div>
              <div class="detail-label">Submitted At</div>
              <div class="detail-value">{{ inv.submittedAt }}</div>
            </div>

            <!-- Status -->
            <div>
              <div class="detail-label">Status</div>
              <div class="mt-1">
                <app-status-badge [status]="inv.status"></app-status-badge>
              </div>
            </div>

            <!-- Validation Errors -->
            @if (inv.status === 'invalid' && inv.validationErrors?.length) {
              <div>
                <div class="detail-label">Validation Messages</div>
                <div class="validation-errors">
                  @for (err of inv.validationErrors; track err) {
                    <div class="validation-error">
                      <ph-icon name="x-circle" size="14" weight="fill"></ph-icon>
                      {{ err }}
                    </div>
                  }
                </div>
              </div>
            }

            <!-- QR Code -->
            <div>
              <div class="detail-label">QR Code</div>
              @if (qrCodeUrl()) {
                <img [src]="qrCodeUrl()" alt="QR Code" class="qr-image" />
              } @else {
                <div class="qr-placeholder" (click)="viewQrCode(inv)" style="cursor: pointer">
                  <ph-icon name="qr-code" size="24" weight="duotone"></ph-icon>
                  Click to load QR
                </div>
              }
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2 mt-2">
              <a
                pButton
                [outlined]="true"
                class="w-full justify-center"
                href="https://myinvois.hasil.gov.my"
                target="_blank"
              >
                <ph-icon name="arrow-square-out" size="16" weight="regular"></ph-icon>
                View on MyInvois
              </a>
              @if (inv.status === 'invalid') {
                <button
                  pButton
                  severity="warn"
                  class="w-full justify-center"
                  (click)="retrySubmission(inv)"
                >
                  <ph-icon name="arrow-clockwise" size="16" weight="bold"></ph-icon>
                  Retry Submission
                </button>
              }
              <button pButton [outlined]="true" class="w-full justify-center">
                <ph-icon name="file-pdf" size="16" weight="duotone"></ph-icon>
                Download PDF
              </button>
            </div>
          </div>
        }
      </p-drawer>

      <!-- QR Code Dialog -->
      <p-dialog
        header="e-Invoice QR Code"
        [(visible)]="qrDialogVisible"
        [modal]="true"
        [style]="{ width: '360px' }"
      >
        <div class="flex flex-col items-center gap-4 py-4">
          @if (qrLoading()) {
            <div class="qr-placeholder">Loading...</div>
          } @else if (qrCodeUrl()) {
            <img [src]="qrCodeUrl()" alt="QR Code" style="width: 200px; height: 200px" />
          } @else {
            <div class="qr-placeholder">No QR code available</div>
          }
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    /* Filter Tabs */
    .filter-tab {
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      background: #f1f5f9;
      color: #475569;
      transition: all 0.15s ease;

      &:hover {
        background: #e2e8f0;
      }

      &--active {
        background: #3b82f6;
        color: #fff;

        &:hover {
          background: #2563eb;
        }
      }
    }

    /* UUID styles */
    .uuid-cell {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 12px;
      color: #64748b;
    }

    .uuid-copyable {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 13px;
      color: var(--text-primary, #1e293b);
      background: #f8fafc;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      cursor: pointer;
      word-break: break-all;
      transition: box-shadow 0.15s;

      &:hover {
        box-shadow: 0 1px 4px rgba(0,0,0,0.14);
      }
    }

    /* Detail sidebar */
    .detail-label {
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 14px;
      color: var(--text-primary, #1e293b);
    }

    /* Validation errors */
    .validation-errors {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .validation-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #dc2626;
      background: #fef2f2;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #fecaca;
    }

    /* QR placeholder */
    .qr-placeholder {
      width: 128px;
      height: 128px;
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .qr-image {
      width: 128px;
      height: 128px;
      border-radius: 8px;
      margin-top: 4px;
    }
  `],
})
export class EInvoiceListComponent implements OnInit {
  private readonly store = inject(EInvoiceStore);
  private readonly notify = inject(NotificationService);

  activeTab = signal<string>('all');
  sidebarVisible = signal(false);
  selectedInvoice = signal<EInvoice | null>(null);
  qrCodeUrl = signal<string>('');
  qrDialogVisible = false;
  qrLoading = signal(false);

  filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Pending', value: 'pending' },
  ];

  submissions = this.store.submissions;
  isLoading = this.store.isLoading;

  submittedCount = computed(() => String(this.submissions().length));
  validCount = computed(() =>
    String(this.submissions().filter((s: any) => s.status?.toLowerCase() === 'valid').length),
  );
  invalidCount = computed(() =>
    String(this.submissions().filter((s: any) => s.status?.toLowerCase() === 'invalid').length),
  );
  cancelledCount = computed(() =>
    String(this.submissions().filter((s: any) => s.status?.toLowerCase() === 'cancelled').length),
  );
  successRate = computed(() => {
    const total = this.submissions().length;
    if (total === 0) return '0%';
    const valid = this.submissions().filter((s: any) => s.status?.toLowerCase() === 'valid').length;
    return ((valid / total) * 100).toFixed(1) + '%';
  });

  filteredInvoices = computed(() => {
    const tab = this.activeTab();
    const items = this.submissions();
    if (tab === 'all') return items;
    return items.filter((inv: any) => inv.status?.toLowerCase() === tab);
  });

  ngOnInit(): void {
    this.store.loadSubmissions();
  }

  openSidebar(inv: EInvoice): void {
    this.selectedInvoice.set(inv);
    this.sidebarVisible.set(true);
  }

  onRowSelect(event: any): void {
    if (event.data) this.openSidebar(event.data);
  }

  copyUuid(uuid: string): void {
    navigator.clipboard.writeText(uuid);
    this.notify.success('Copied', 'UUID copied to clipboard');
  }

  async retrySubmission(inv: EInvoice): Promise<void> {
    try {
      await this.store.retrySubmission(inv.lhdnUuid);
      this.notify.success('Retried', `Submission for ${inv.invoiceNumber} retried`);
      await this.store.loadSubmissions();
    } catch {
      this.notify.error('Retry Failed', `Could not retry ${inv.invoiceNumber}`);
    }
  }

  async viewQrCode(inv: EInvoice): Promise<void> {
    this.qrLoading.set(true);
    this.qrCodeUrl.set('');
    this.qrDialogVisible = true;
    try {
      const { data } = await eInvoiceSubmissionsControllerGetQrCode({
        path: { uuid: inv.lhdnUuid },
      } as any);
      const response = (data as any)?.data ?? data;
      const qr = response?.qrCodeUrl ?? response?.qrCode ?? response?.url ?? response;
      if (typeof qr === 'string' && (qr.startsWith('data:') || qr.startsWith('http'))) {
        this.qrCodeUrl.set(qr);
      } else if (typeof qr === 'string') {
        this.qrCodeUrl.set(`data:image/png;base64,${qr}`);
      }
    } catch {
      this.notify.error('QR Code Error', 'Failed to load QR code');
    } finally {
      this.qrLoading.set(false);
    }
  }

  bulkSubmit(): void {
    // Bulk submit logic placeholder
  }
}
