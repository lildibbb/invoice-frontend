import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyMyrPipe } from '../../../shared/pipes/currency-myr.pipe';
import { InvoiceStore } from '../invoice.store';
import { ApprovalStore } from '../../approvals/approval.store';
import { CreditMemoStore } from '../../credit-memos/credit-memo.store';
import { NotificationService } from '../../../core/services/notification.service';
import { paymentsControllerGetPayments } from '../../../core/api';

interface LineItem {
  no: number;
  description: string;
  qty: number;
  unitPrice: number;
  taxPercent: number;
  amount: number;
}

interface TimelineStep {
  label: string;
  date: string;
  color: string;
  active: boolean;
}

interface Payment {
  date: string;
  amount: number;
  method: string;
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    MenuModule,
    TooltipModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyMyrPipe,
  ],
  providers: [InvoiceStore, ApprovalStore, CreditMemoStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <app-page-header title="Invoice INV-2025-0342">
        <div actions>
          <button pButton class="p-button-text p-button-sm" [routerLink]="['/app/invoices']">
            <ph-icon name="arrow-left" size="16" weight="bold"></ph-icon>
            Back
          </button>
        </div>
      </app-page-header>

      <div class="detail-layout">
        <!-- Left Column: Invoice Preview -->
        <div class="detail-layout__main">
          <div class="invoiz-card invoice-preview">
            <!-- Company Header -->
            <div class="invoice-preview__header">
              <div class="invoice-preview__company">
                <div class="invoice-preview__logo">
                  <ph-icon name="invoice" size="32" weight="duotone"></ph-icon>
                </div>
                <div>
                  <h2 class="invoice-preview__company-name">Invoiz Solutions Sdn Bhd</h2>
                  <p class="invoice-preview__company-detail">
                    12-3, Jalan Teknologi 5, Taman Sains Selangor<br>
                    47810 Petaling Jaya, Selangor, Malaysia
                  </p>
                  <p class="invoice-preview__company-detail">
                    BRN: 202301012345 &nbsp;|&nbsp; TIN: C25845671020
                  </p>
                </div>
              </div>
              <div class="invoice-preview__title-block">
                <h1 class="invoice-preview__title">INVOICE</h1>
                <p class="invoice-preview__invoice-no">INV-2025-0342</p>
              </div>
            </div>

            <!-- Bill To -->
            <div class="invoice-preview__bill-to">
              <p class="invoice-preview__label">Bill To</p>
              <p class="invoice-preview__customer-name">Ahmad Razif bin Mohd Yusof</p>
              <p class="invoice-preview__customer-detail">TechVentures Sdn Bhd</p>
              <p class="invoice-preview__customer-detail">
                45, Jalan Bukit Bintang, 55100 Kuala Lumpur, Malaysia
              </p>
              <p class="invoice-preview__customer-detail">razif&#64;techventures.com.my</p>
            </div>

            <!-- Line Items Table -->
            <table class="invoice-table">
              <thead>
                <tr>
                  <th class="invoice-table__col--num">#</th>
                  <th class="invoice-table__col--desc">Description</th>
                  <th class="invoice-table__col--qty">Qty</th>
                  <th class="invoice-table__col--price">Unit Price</th>
                  <th class="invoice-table__col--tax">Tax</th>
                  <th class="invoice-table__col--amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                @for (item of lineItems; track item.no) {
                  <tr>
                    <td class="invoice-table__col--num">{{ item.no }}</td>
                    <td>{{ item.description }}</td>
                    <td class="invoice-table__col--qty">{{ item.qty }}</td>
                    <td class="invoice-table__col--price">{{ item.unitPrice | currencyMyr }}</td>
                    <td class="invoice-table__col--tax">{{ item.taxPercent }}%</td>
                    <td class="invoice-table__col--amount">{{ item.amount | currencyMyr }}</td>
                  </tr>
                }
              </tbody>
            </table>

            <!-- Totals -->
            <div class="invoice-totals">
              <div class="invoice-totals__row">
                <span>Subtotal</span>
                <span>{{ subtotal | currencyMyr }}</span>
              </div>
              <div class="invoice-totals__row">
                <span>SST (8%)</span>
                <span>{{ tax | currencyMyr }}</span>
              </div>
              <div class="invoice-totals__row invoice-totals__row--discount">
                <span>Discount</span>
                <span>-{{ discount | currencyMyr }}</span>
              </div>
              <div class="invoice-totals__row invoice-totals__row--total">
                <span>Total</span>
                <span>{{ total | currencyMyr }}</span>
              </div>
              <div class="invoice-totals__row">
                <span>Amount Paid</span>
                <span>{{ amountPaid | currencyMyr }}</span>
              </div>
              <div class="invoice-totals__row invoice-totals__row--balance"
                   [class.invoice-totals__row--balance-zero]="balanceDue === 0"
                   [class.invoice-totals__row--balance-outstanding]="balanceDue > 0">
                <span>Balance Due</span>
                <span>{{ balanceDue | currencyMyr }}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="invoice-preview__footer">
              <div class="invoice-preview__footer-left">
                <p class="invoice-preview__label">Payment Terms</p>
                <p class="invoice-preview__footer-text">Net 30 — Payment due within 30 days of invoice date.</p>
                <p class="invoice-preview__label" style="margin-top: 12px">Bank Details</p>
                <p class="invoice-preview__footer-text">
                  Maybank &nbsp;|&nbsp; 5621 7890 4523 &nbsp;|&nbsp; Invoiz Solutions Sdn Bhd
                </p>
              </div>
              <div class="invoice-preview__qr">
                <div class="invoice-preview__qr-placeholder"></div>
                <span class="invoice-preview__qr-label">Scan to pay</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="detail-layout__sidebar">
          <!-- Status -->
          <div class="invoiz-card sidebar-section">
            <div class="sidebar-status">
              <app-status-badge [status]="'paid'" size="md"></app-status-badge>
              <span class="sidebar-status__date">Paid on 28 Feb 2025</span>
            </div>

            <!-- Timeline -->
            <div class="status-timeline">
              @for (step of timeline; track step.label) {
                <div class="timeline-step" [class.timeline-step--last]="$last">
                  <div class="timeline-step__dot"
                       [style.background]="step.color"
                       [class.timeline-step__dot--large]="$last && step.active">
                  </div>
                  <div class="timeline-step__line" *ngIf="!$last"
                       [style.background]="step.active ? step.color : '#d1d5db'">
                  </div>
                  <div class="timeline-step__content">
                    <span class="timeline-step__label">{{ step.label }}</span>
                    <span class="timeline-step__date">{{ step.date }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="invoiz-card sidebar-section sidebar-actions">
            <button pButton class="p-button-primary action-btn" (click)="downloadPdf()">
              <ph-icon name="file-pdf" size="18" weight="bold"></ph-icon>
              Download PDF
            </button>
            <button pButton class="p-button-outlined action-btn" (click)="sendEmail()">
              <ph-icon name="envelope-simple" size="18" weight="bold"></ph-icon>
              Send Email
            </button>
            <button pButton class="p-button-outlined action-btn"
                    *ngIf="balanceDue > 0" (click)="recordPayment()">
              <ph-icon name="money" size="18" weight="bold"></ph-icon>
              Record Payment
            </button>
            <button pButton class="p-button-text action-btn"
                    (click)="moreMenu.toggle($event)">
              <ph-icon name="dots-three-outline" size="18" weight="fill"></ph-icon>
              More Actions
            </button>
            <p-menu #moreMenu [model]="moreMenuItems" [popup]="true"></p-menu>
          </div>

          <!-- Customer Info -->
          <div class="invoiz-card sidebar-section">
            <p class="sidebar-section__title">Customer</p>
            <p class="sidebar-info__name">Ahmad Razif bin Mohd Yusof</p>
            <p class="sidebar-info__detail">TechVentures Sdn Bhd</p>
            <p class="sidebar-info__detail">razif&#64;techventures.com.my</p>
            <p class="sidebar-info__detail">+60 12-345 6789</p>
            <a class="sidebar-info__link" [routerLink]="['/app/customers', 1]">View Customer →</a>
          </div>

          <!-- LHDN Status -->
          <div class="invoiz-card sidebar-section sidebar-section--lhdn">
            <p class="sidebar-section__title">LHDN e-Invoice</p>
            <div class="sidebar-lhdn__row">
              <span class="sidebar-lhdn__label">Status</span>
              <app-status-badge [status]="'valid'" size="sm"></app-status-badge>
            </div>
            <div class="sidebar-lhdn__row">
              <span class="sidebar-lhdn__label">UUID</span>
              <span class="sidebar-lhdn__uuid" pTooltip="F9D425P6DS7D8IU">F9D425P6DS7D...8IU</span>
            </div>
            <div class="sidebar-lhdn__row">
              <span class="sidebar-lhdn__label">Submitted</span>
              <span class="sidebar-lhdn__value">25 Feb 2025, 11:05 AM</span>
            </div>
            <a class="sidebar-info__link" href="https://myinvois.hasil.gov.my" target="_blank" rel="noopener">
              View on MyInvois →
            </a>
          </div>

          <!-- Payment History -->
          <div class="invoiz-card sidebar-section">
            <p class="sidebar-section__title">Payment History</p>
            @for (payment of payments; track payment.date) {
              <div class="payment-item">
                <div class="payment-item__left">
                  <span class="payment-item__date">{{ payment.date }}</span>
                  <span class="payment-item__method">{{ payment.method }}</span>
                </div>
                <span class="payment-item__amount">{{ payment.amount | currencyMyr }}</span>
              </div>
            }
          </div>

          <!-- Approvals -->
          <div class="invoiz-card sidebar-section">
            <p class="sidebar-section__title">Approvals</p>
            @if (approvalStore.isLoading()) {
              <p class="text-sm text-slate-400">Loading...</p>
            } @else {
              @if (approvalStore.invoiceApprovals().length === 0) {
                <p class="text-sm text-slate-400">No approval requests yet.</p>
              } @else {
                @for (a of approvalStore.invoiceApprovals(); track a.uuid ?? a.id) {
                  <div class="approval-item">
                    <div class="approval-item__left">
                      <span class="approval-item__name">{{ a.approver?.name ?? a.approverName ?? 'Approver' }}</span>
                      <span class="approval-item__date">{{ a.createdAt | date:'dd MMM yyyy' }}</span>
                    </div>
                    <p-tag
                      [value]="a.status"
                      [severity]="getApprovalSeverity(a.status)"
                    ></p-tag>
                  </div>
                }
              }
              @if (invoiceStatus === 'FINALIZED') {
                <button pButton [text]="true" class="mt-2 w-full justify-center gap-2" (click)="showRequestApprovalDialog.set(true)">
                  <ph-icon name="stamp" size="16" weight="bold"></ph-icon>
                  Request Approval
                </button>
              }
            }
          </div>

          <!-- Credit Memos -->
          <div class="invoiz-card sidebar-section">
            <p class="sidebar-section__title">Credit Memos</p>
            @if (creditMemoStore.isLoading()) {
              <p class="text-sm text-slate-400">Loading...</p>
            } @else {
              @if (creditMemoStore.memos().length === 0) {
                <p class="text-sm text-slate-400">No credit memos.</p>
              } @else {
                @for (memo of creditMemoStore.memos(); track memo.uuid ?? memo.id) {
                  <div class="credit-memo-item">
                    <div class="credit-memo-item__left">
                      <span class="credit-memo-item__id">{{ memo.creditMemoNo ?? memo.id }}</span>
                      <span class="credit-memo-item__reason">{{ memo.reason }}</span>
                    </div>
                    <div class="credit-memo-item__right">
                      <span class="credit-memo-item__amount">{{ memo.amount | currencyMyr }}</span>
                      <p-tag
                        [value]="memo.status"
                        [severity]="getCreditMemoSeverity(memo.status)"
                      ></p-tag>
                    </div>
                    <div class="credit-memo-item__actions">
                      @if (memo.status === 'DRAFT') {
                        <button pButton [text]="true" size="small" severity="success" pTooltip="Issue" (click)="onIssueCreditMemo(memo.uuid ?? memo.id)">
                          <ph-icon name="check" size="16"></ph-icon>
                        </button>
                      }
                      @if (memo.status === 'ISSUED') {
                        <button pButton [text]="true" size="small" severity="danger" pTooltip="Void" (click)="onVoidCreditMemo(memo.uuid ?? memo.id)">
                          <ph-icon name="x" size="16"></ph-icon>
                        </button>
                      }
                    </div>
                  </div>
                }
              }
              <button pButton [text]="true" class="mt-2 w-full justify-center gap-2" (click)="showCreditMemoDialog.set(true)">
                <ph-icon name="note" size="16" weight="bold"></ph-icon>
                Issue Credit Memo
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Request Approval Dialog -->
      <p-dialog
        header="Request Approval"
        [visible]="showRequestApprovalDialog()"
        (visibleChange)="showRequestApprovalDialog.set($event)"
        [style]="{ width: '420px' }"
        [modal]="true"
      >
        <div class="flex flex-col gap-4 pt-2">
          <div class="flex flex-col gap-1">
            <label class="form-label">Approver Membership ID</label>
            <input pInputText [(ngModel)]="approvalMembershipId" placeholder="Enter membership ID" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="form-label">Notes (optional)</label>
            <input pInputText [(ngModel)]="approvalNotes" placeholder="Add notes..." class="w-full" />
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button pButton [outlined]="true" (click)="showRequestApprovalDialog.set(false)">Cancel</button>
            <button pButton class="p-button-primary" (click)="onRequestApproval()">Submit Request</button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Credit Memo Dialog -->
      <p-dialog
        header="Issue Credit Memo"
        [visible]="showCreditMemoDialog()"
        (visibleChange)="showCreditMemoDialog.set($event)"
        [style]="{ width: '420px' }"
        [modal]="true"
      >
        <div class="flex flex-col gap-4 pt-2">
          <div class="flex flex-col gap-1">
            <label class="form-label">Amount</label>
            <p-inputNumber
              [(ngModel)]="creditMemoAmount"
              mode="currency"
              currency="MYR"
              locale="en-MY"
              placeholder="0.00"
              class="w-full"
            ></p-inputNumber>
          </div>
          <div class="flex flex-col gap-1">
            <label class="form-label">Reason</label>
            <input pInputText [(ngModel)]="creditMemoReason" placeholder="Enter reason" class="w-full" />
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button pButton [outlined]="true" (click)="showCreditMemoDialog.set(false)">Cancel</button>
            <button pButton class="p-button-primary" (click)="onCreateCreditMemo()">Create Credit Memo</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    /* Layout */
    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      align-items: start;
    }

    .detail-layout__sidebar {
      position: sticky;
      top: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Invoice Preview */
    .invoice-preview {
      padding: 40px;
      font-family: 'Inter', sans-serif;
    }

    .invoice-preview__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
    }

    .invoice-preview__company {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .invoice-preview__logo {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: var(--primary-50, #eff6ff);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color, #4f46e5);
      flex-shrink: 0;
    }

    .invoice-preview__company-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }

    .invoice-preview__company-detail {
      font-size: 12px;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }

    .invoice-preview__title-block {
      text-align: right;
    }

    .invoice-preview__title {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: 2px;
    }

    .invoice-preview__invoice-no {
      font-size: 14px;
      color: var(--text-muted);
      margin: 4px 0 0;
    }

    /* Bill To */
    .invoice-preview__bill-to {
      margin-bottom: 28px;
    }

    .invoice-preview__label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin: 0 0 6px;
    }

    .invoice-preview__customer-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 2px;
    }

    .invoice-preview__customer-detail {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0;
      line-height: 1.6;
    }

    /* Line Items Table */
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }

    .invoice-table thead tr {
      border-bottom: 2px solid var(--card-border);
    }

    .invoice-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .invoice-table td {
      padding: 12px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--card-border);
    }

    .invoice-table__col--num { width: 40px; text-align: center; }
    .invoice-table__col--qty { width: 60px; text-align: center; }
    .invoice-table__col--price { width: 120px; text-align: right; }
    .invoice-table__col--tax { width: 60px; text-align: center; }
    .invoice-table__col--amount { width: 120px; text-align: right; }
    .invoice-table__col--desc { }

    .invoice-table th.invoice-table__col--price,
    .invoice-table th.invoice-table__col--amount {
      text-align: right;
    }

    .invoice-table th.invoice-table__col--qty,
    .invoice-table th.invoice-table__col--tax,
    .invoice-table th.invoice-table__col--num {
      text-align: center;
    }

    /* Totals */
    .invoice-totals {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-bottom: 32px;
    }

    .invoice-totals__row {
      display: flex;
      justify-content: space-between;
      width: 280px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--text-secondary, #64748b);
    }

    .invoice-totals__row--discount span:last-child {
      color: var(--status-overdue, #ef4444);
    }

    .invoice-totals__row--total {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      border-top: 2px solid var(--card-border);
      margin-top: 4px;
      padding-top: 10px;
    }

    .invoice-totals__row--balance {
      font-weight: 600;
      border-top: 1px solid var(--card-border);
      margin-top: 4px;
      padding-top: 8px;
    }

    .invoice-totals__row--balance-zero span:last-child {
      color: var(--status-paid, #22c55e);
    }

    .invoice-totals__row--balance-outstanding span:last-child {
      color: var(--status-overdue, #ef4444);
    }

    /* Footer */
    .invoice-preview__footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 24px;
      border-top: 1px solid var(--card-border);
    }

    .invoice-preview__footer-text {
      font-size: 12px;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.6;
    }

    .invoice-preview__qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .invoice-preview__qr-placeholder {
      width: 96px;
      height: 96px;
      border-radius: 8px;
      background: #e5e7eb;
    }

    .invoice-preview__qr-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Sidebar */
    .sidebar-section {
      padding: 20px;
    }

    .sidebar-section__title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin: 0 0 12px;
    }

    .sidebar-status {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .sidebar-status__date {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
    }

    /* Timeline */
    .status-timeline {
      display: flex;
      flex-direction: column;
    }

    .timeline-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      padding-bottom: 20px;
    }

    .timeline-step--last {
      padding-bottom: 0;
    }

    .timeline-step__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 3px;
      z-index: 1;
    }

    .timeline-step__dot--large {
      width: 14px;
      height: 14px;
      margin-top: 1px;
      margin-left: -2px;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
    }

    .timeline-step__line {
      position: absolute;
      left: 4px;
      top: 16px;
      bottom: 0;
      width: 2px;
    }

    .timeline-step__content {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .timeline-step__label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .timeline-step__date {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Actions */
    .sidebar-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .action-btn {
      width: 100%;
      justify-content: center;
      gap: 8px;
    }

    /* Customer Info */
    .sidebar-info__name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }

    .sidebar-info__detail {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0;
      line-height: 1.6;
    }

    .sidebar-info__link {
      display: inline-block;
      font-size: 13px;
      color: var(--primary-color, #4f46e5);
      text-decoration: none;
      margin-top: 8px;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    /* LHDN */
    .sidebar-section--lhdn {
      background: var(--violet-50, #f5f3ff);
    }

    .sidebar-lhdn__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .sidebar-lhdn__label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .sidebar-lhdn__uuid {
      font-size: 12px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      color: var(--text-secondary, #64748b);
      cursor: help;
    }

    .sidebar-lhdn__value {
      font-size: 12px;
      color: var(--text-secondary, #64748b);
    }

    /* Payment History */
    .payment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--card-border);

      &:last-child {
        border-bottom: none;
      }
    }

    .payment-item__left {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .payment-item__date {
      font-size: 13px;
      color: var(--text-primary);
      font-weight: 500;
    }

    .payment-item__method {
      font-size: 12px;
      color: var(--text-muted);
    }

    .payment-item__amount {
      font-size: 13px;
      font-weight: 600;
      color: var(--status-paid, #22c55e);
    }

    /* Approval Items */
    .approval-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--card-border);

      &:last-child {
        border-bottom: none;
      }
    }

    .approval-item__left {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .approval-item__name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .approval-item__date {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Credit Memo Items */
    .credit-memo-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid var(--card-border);

      &:last-child {
        border-bottom: none;
      }
    }

    .credit-memo-item__left {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .credit-memo-item__id {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .credit-memo-item__reason {
      font-size: 12px;
      color: var(--text-muted);
    }

    .credit-memo-item__right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .credit-memo-item__amount {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .credit-memo-item__actions {
      display: flex;
      gap: 2px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .detail-layout {
        grid-template-columns: 1fr;
      }

      .detail-layout__sidebar {
        position: static;
      }

      .invoice-preview {
        padding: 24px;
      }
    }

    @media (max-width: 640px) {
      .invoice-preview__header {
        flex-direction: column;
        gap: 16px;
      }

      .invoice-preview__title-block {
        text-align: left;
      }

      .invoice-preview__footer {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .invoice-table__col--tax,
      .invoice-table th.invoice-table__col--tax {
        display: none;
      }
    }
  `],
})
export class InvoiceDetailComponent implements OnInit {
  private readonly invoiceStore = inject(InvoiceStore);
  readonly approvalStore = inject(ApprovalStore);
  readonly creditMemoStore = inject(CreditMemoStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  invoice = computed(() => this.invoiceStore.selectedInvoice());
  allowedTransitions = computed(() => this.invoiceStore.allowedTransitions());
  auditTrail = computed(() => this.invoiceStore.auditTrail());
  isLoading = computed(() => this.invoiceStore.isLoading());

  lineItems: LineItem[] = [];
  subtotal = 0;
  tax = 0;
  discount = 0;
  total = 0;
  amountPaid = 0;
  balanceDue = 0;
  invoiceStatus = '';

  timeline: TimelineStep[] = [];
  payments: Payment[] = [];

  // Approval dialog
  showRequestApprovalDialog = signal(false);
  approvalMembershipId = '';
  approvalNotes = '';

  // Credit memo dialog
  showCreditMemoDialog = signal(false);
  creditMemoAmount: number | null = null;
  creditMemoReason = '';

  moreMenuItems = [
    { label: 'Edit', icon: 'pi pi-pencil', command: () => this.router.navigate(['/app/invoices', this.getUuid(), 'edit']) },
    { label: 'Duplicate', icon: 'pi pi-copy', command: () => this.onClone() },
    { separator: true },
    { label: 'Void', icon: 'pi pi-ban', command: () => this.onVoid() },
    { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.onDelete() },
  ];

  async ngOnInit(): Promise<void> {
    const uuid = this.getUuid();
    await this.invoiceStore.loadInvoice(uuid);
    this.populateFromStore();
    await Promise.all([
      this.loadPayments(uuid),
      this.approvalStore.loadByInvoice(uuid),
      this.creditMemoStore.loadByInvoice(uuid),
    ]);
  }

  private getUuid(): string {
    return this.route.snapshot.paramMap.get('uuid') ?? '';
  }

  private populateFromStore(): void {
    const inv = this.invoice();
    if (!inv) return;

    const items = inv.items ?? inv.lineItems ?? [];
    this.lineItems = items.map((item: any, i: number) => ({
      no: i + 1,
      description: item.description ?? item.name ?? '',
      qty: item.quantity ?? item.qty ?? 0,
      unitPrice: item.unitPrice ?? item.price ?? 0,
      taxPercent: item.taxPercent ?? item.tax ?? 0,
      amount: item.amount ?? item.total ?? (item.quantity ?? item.qty ?? 0) * (item.unitPrice ?? item.price ?? 0),
    }));

    this.subtotal = inv.subtotal ?? 0;
    this.tax = inv.taxAmount ?? inv.tax ?? 0;
    this.discount = inv.discountAmount ?? inv.discount ?? 0;
    this.total = inv.total ?? inv.grandTotal ?? 0;
    this.amountPaid = inv.amountPaid ?? inv.paidAmount ?? 0;
    this.balanceDue = inv.balanceDue ?? (this.total - this.amountPaid);
    this.invoiceStatus = inv.status ?? '';

    const trail = this.auditTrail() ?? [];
    this.timeline = trail.map((entry: any, i: number) => ({
      label: entry.action ?? entry.status ?? '',
      date: entry.createdAt ?? entry.date ?? '',
      color: i === trail.length - 1 ? '#22c55e' : '#3b82f6',
      active: true,
    }));
  }

  private async loadPayments(uuid: string): Promise<void> {
    try {
      const { data } = await paymentsControllerGetPayments({ path: { uuid } });
      const list = (data as any)?.data ?? data ?? [];
      this.payments = list.map((p: any) => ({
        date: p.paymentDate ?? p.date ?? '',
        amount: p.amount ?? 0,
        method: p.method ?? p.paymentMethod ?? '',
      }));
    } catch {
      // payments may not exist yet
    }
  }

  async onFinalize(): Promise<void> {
    try {
      await this.invoiceStore.finalizeInvoice(this.getUuid());
      this.notification.success('Invoice finalized');
      await this.invoiceStore.loadInvoice(this.getUuid());
      this.populateFromStore();
    } catch { this.notification.error('Failed to finalize'); }
  }

  async onSend(): Promise<void> {
    try {
      await this.invoiceStore.sendInvoice(this.getUuid());
      this.notification.success('Invoice sent');
      await this.invoiceStore.loadInvoice(this.getUuid());
      this.populateFromStore();
    } catch { this.notification.error('Failed to send'); }
  }

  async onVoid(): Promise<void> {
    try {
      await this.invoiceStore.voidInvoice(this.getUuid(), 'Voided by user');
      this.notification.success('Invoice voided');
      await this.invoiceStore.loadInvoice(this.getUuid());
      this.populateFromStore();
    } catch { this.notification.error('Failed to void'); }
  }

  async onClone(): Promise<void> {
    try {
      const cloned = await this.invoiceStore.cloneInvoice(this.getUuid());
      this.notification.success('Invoice duplicated');
      const newUuid = (cloned as any)?.uuid ?? (cloned as any)?.id;
      if (newUuid) {
        this.router.navigate(['/app/invoices', newUuid]);
      }
    } catch { this.notification.error('Failed to duplicate'); }
  }

  async onSubmitEinvoice(): Promise<void> {
    try {
      await this.invoiceStore.submitEinvoice(this.getUuid());
      this.notification.success('e-Invoice submitted');
      await this.invoiceStore.loadInvoice(this.getUuid());
      this.populateFromStore();
    } catch { this.notification.error('Failed to submit e-Invoice'); }
  }

  async onDelete(): Promise<void> {
    try {
      await this.invoiceStore.deleteInvoice(this.getUuid());
      this.notification.success('Invoice deleted');
      this.router.navigate(['/app/invoices']);
    } catch { this.notification.error('Failed to delete'); }
  }

  downloadPdf(): void {}
  sendEmail(): void { this.onSend(); }
  recordPayment(): void {}

  // Approval helpers
  getApprovalSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      PENDING: 'warn',
      APPROVED: 'success',
      REJECTED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  async onRequestApproval(): Promise<void> {
    if (!this.approvalMembershipId) return;
    try {
      await this.approvalStore.requestApproval({
        invoiceUuid: this.getUuid(),
        approverMembershipId: this.approvalMembershipId,
        notes: this.approvalNotes || undefined,
      });
      this.notification.success('Approval requested');
      this.showRequestApprovalDialog.set(false);
      this.approvalMembershipId = '';
      this.approvalNotes = '';
      await this.approvalStore.loadByInvoice(this.getUuid());
    } catch {
      this.notification.error('Failed to request approval');
    }
  }

  // Credit memo helpers
  getCreditMemoSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      DRAFT: 'warn',
      ISSUED: 'success',
      VOIDED: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  async onCreateCreditMemo(): Promise<void> {
    if (!this.creditMemoAmount || !this.creditMemoReason) return;
    try {
      await this.creditMemoStore.create({
        invoiceUuid: this.getUuid(),
        amount: this.creditMemoAmount,
        reason: this.creditMemoReason,
      });
      this.notification.success('Credit memo created');
      this.showCreditMemoDialog.set(false);
      this.creditMemoAmount = null;
      this.creditMemoReason = '';
      await this.creditMemoStore.loadByInvoice(this.getUuid());
    } catch {
      this.notification.error('Failed to create credit memo');
    }
  }

  async onIssueCreditMemo(id: string): Promise<void> {
    try {
      await this.creditMemoStore.issue(id);
      this.notification.success('Credit memo issued');
      await this.creditMemoStore.loadByInvoice(this.getUuid());
    } catch {
      this.notification.error('Failed to issue credit memo');
    }
  }

  async onVoidCreditMemo(id: string): Promise<void> {
    try {
      await this.creditMemoStore.voidMemo(id);
      this.notification.success('Credit memo voided');
      await this.creditMemoStore.loadByInvoice(this.getUuid());
    } catch {
      this.notification.error('Failed to void credit memo');
    }
  }
}
