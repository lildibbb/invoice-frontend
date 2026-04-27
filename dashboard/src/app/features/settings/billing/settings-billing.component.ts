import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import '@phosphor-icons/web/index.js';

import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface UsageItem {
  label: string;
  used: number;
  total: number | null;
  percent: number;
  color: string;
  display: string;
}

interface BillingRecord {
  date: string;
  invoiceNo: string;
  plan: string;
  amount: string;
  status: string;
}

@Component({
  selector: 'app-settings-billing',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, StatusBadgeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="billing-settings">
      <!-- Current Plan -->
      <div class="plan-card">
        <div class="plan-header">
          <div class="plan-info">
            <div class="plan-name-row">
              <h3 class="plan-name">Business</h3>
              <p-tag value="Current Plan" severity="info"></p-tag>
            </div>
            <div class="plan-price">
              <span class="price">RM 149</span>
              <span class="period">/month</span>
            </div>
            <p class="plan-billing">Next billing: March 28, 2025</p>
          </div>
          <div class="plan-actions">
            <button pButton class="p-button-primary p-button-sm">Upgrade Plan</button>
            <button pButton class="p-button-text p-button-sm plan-cancel">Cancel Subscription</button>
          </div>
        </div>
      </div>

      <!-- Usage -->
      <div class="invoiz-card usage-card">
        <h3 class="card-title">Usage</h3>
        <div class="usage-list">
          <div class="usage-item" *ngFor="let item of usage">
            <div class="usage-label-row">
              <span class="usage-label">{{ item.label }}</span>
              <span class="usage-value">{{ item.display }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="item.percent"
                [style.background]="item.color"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="invoiz-card">
        <h3 class="card-title" style="padding: 16px 20px 0;">Billing History</h3>
        <p-table [value]="billingHistory" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th>Invoice #</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-record>
            <tr>
              <td>{{ record.date }}</td>
              <td class="font-medium">{{ record.invoiceNo }}</td>
              <td>{{ record.plan }}</td>
              <td>{{ record.amount }}</td>
              <td><app-status-badge [status]="record.status" size="sm"></app-status-badge></td>
              <td>
                <a class="download-link" href="javascript:void(0)">
                  <ph-icon name="file-pdf" size="16" weight="duotone"></ph-icon>
                  Download PDF
                </a>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Payment Method -->
      <div class="invoiz-card payment-card">
        <h3 class="card-title">Payment Method</h3>
        <div class="payment-info">
          <div class="payment-details">
            <div class="card-icon">
              <ph-icon name="credit-card" size="28" weight="duotone"></ph-icon>
            </div>
            <div>
              <span class="card-number">Visa ending in 4242</span>
              <span class="card-expiry">Expires 12/2027</span>
            </div>
          </div>
          <button pButton class="p-button-outlined p-button-sm">Update Payment Method</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .billing-settings {
      max-width: 800px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .plan-card {
      background: #eff6ff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
      border-radius: var(--card-radius);
      padding: 24px;
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .plan-name-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .plan-name {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .plan-price {
      margin-bottom: 4px;
    }

    .price {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .period {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .plan-billing {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }

    .plan-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .plan-cancel {
      color: var(--status-overdue) !important;
      font-size: 13px !important;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .usage-card {
      padding: 20px;
    }

    .usage-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .usage-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .usage-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .usage-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .usage-value {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .progress-bar {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .download-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .payment-card {
      padding: 20px;
    }

    .payment-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-details {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .card-number {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .card-expiry {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
    }

    @media (max-width: 640px) {
      .plan-header {
        flex-direction: column;
        gap: 16px;
      }

      .plan-actions {
        flex-direction: row;
        align-items: center;
      }

      .payment-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `],
})
export class SettingsBillingComponent {
  usage: UsageItem[] = [
    { label: 'Companies', used: 3, total: 5, percent: 60, color: '#3b82f6', display: '3 of 5' },
    { label: 'Invoices', used: 0, total: null, percent: 100, color: '#10b981', display: 'Unlimited' },
    { label: 'Storage', used: 45, total: 1024, percent: 4.5, color: '#3b82f6', display: '45 MB of 1 GB' },
    { label: 'LHDN Submissions', used: 342, total: null, percent: 0, color: '#8b5cf6', display: '342 this month' },
  ];

  billingHistory: BillingRecord[] = [
    { date: 'Feb 28, 2025', invoiceNo: 'INV-B-0012', plan: 'Business', amount: 'RM 149.00', status: 'paid' },
    { date: 'Jan 28, 2025', invoiceNo: 'INV-B-0011', plan: 'Business', amount: 'RM 149.00', status: 'paid' },
    { date: 'Dec 28, 2024', invoiceNo: 'INV-B-0010', plan: 'Business', amount: 'RM 149.00', status: 'paid' },
  ];
}
