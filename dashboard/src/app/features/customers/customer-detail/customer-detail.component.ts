import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import '@phosphor-icons/web/index.js';

import {
  PageHeaderComponent,
  StatusBadgeComponent,
  CurrencyMyrPipe,
} from '../../../shared';
import { CustomerStore } from '../customer.store';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TabsModule,
    TextareaModule,
    TagModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CurrencyMyrPipe,
  ],
  providers: [CustomerStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <app-page-header [title]="customer()?.name ?? 'Customer'" [showBack]="true" backRoute="/app/customers">
      </app-page-header>

      <!-- Profile Header Card -->
      <div class="invoiz-card profile-card mb-6">
        <div class="profile-header">
          <div class="profile-left">
            <div class="avatar-lg">{{ getInitials(customer()?.name ?? '') }}</div>
            <div class="profile-info">
              <div class="profile-name-row">
                <h2 class="profile-name">{{ customer()?.name }}</h2>
                <app-status-badge [status]="customer()?.status ?? 'active'" size="sm"></app-status-badge>
              </div>
              <p class="profile-company">{{ customer()?.company }}</p>
              <div class="stats-chips">
                <span class="chip">
                  <ph-icon name="invoice" size="14" weight="regular"></ph-icon>
                  24 Invoices
                </span>
                <span class="chip">
                  <ph-icon name="currency-circle-dollar" size="14" weight="regular"></ph-icon>
                  RM 245,000 Total
                </span>
                <span class="chip chip--amber">
                  <ph-icon name="warning-circle" size="14" weight="regular"></ph-icon>
                  RM 15,400 Outstanding
                </span>
                <span class="chip">
                  <ph-icon name="calendar" size="14" weight="regular"></ph-icon>
                  Member since Jun 2024
                </span>
              </div>
            </div>
          </div>
          <div class="profile-actions">
            <button pButton class="p-button-outlined p-button-sm">
              <ph-icon name="pencil-simple" size="16" weight="regular"></ph-icon>
              Edit
            </button>
            <button pButton class="p-button-primary p-button-sm">
              <ph-icon name="plus" size="16" weight="regular"></ph-icon>
              Create Invoice
            </button>
          </div>
        </div>
        <div class="contact-row">
          <span class="contact-item">
            <ph-icon name="envelope" size="14" weight="regular"></ph-icon>
            {{ customer()?.email ?? '' }}
          </span>
          <span class="contact-item">
            <ph-icon name="phone" size="14" weight="regular"></ph-icon>
            {{ customer()?.phone ?? '' }}
          </span>
          <span class="contact-item">
            <ph-icon name="map-pin" size="14" weight="regular"></ph-icon>
            {{ customer()?.address ?? '' }}
          </span>
        </div>
      </div>

      <!-- Tabbed Content -->
      <div class="invoiz-card">
        <p-tabs value="0">
          <p-tablist>
            <p-tab value="0">Invoices</p-tab>
            <p-tab value="1">Payments</p-tab>
            <p-tab value="2">Notes</p-tab>
            <p-tab value="3">Activity</p-tab>
          </p-tablist>
          <p-tabpanels>
            <!-- Invoices Tab -->
            <p-tabpanel value="0">
              <p-table [value]="invoices" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>LHDN</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-inv>
                  <tr>
                    <td class="font-medium">{{ inv.number }}</td>
                    <td class="text-muted">{{ inv.date }}</td>
                    <td>{{ inv.amount | currencyMyr }}</td>
                    <td><app-status-badge [status]="inv.status" size="sm"></app-status-badge></td>
                    <td><app-status-badge [status]="inv.lhdn" size="sm"></app-status-badge></td>
                  </tr>
                </ng-template>
              </p-table>
            </p-tabpanel>

            <!-- Payments Tab -->
            <p-tabpanel value="1">
              <p-table [value]="payments" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Date</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-pay>
                  <tr>
                    <td class="text-muted">{{ pay.date }}</td>
                    <td class="font-medium">{{ pay.invoice }}</td>
                    <td>{{ pay.amount | currencyMyr }}</td>
                    <td>{{ pay.method }}</td>
                    <td class="text-muted">{{ pay.reference }}</td>
                  </tr>
                </ng-template>
              </p-table>
            </p-tabpanel>

            <!-- Notes Tab -->
            <p-tabpanel value="2">
              <div class="notes-section">
                <div class="notes-list">
                  @for (note of notes; track note.id) {
                    <div class="note-item">
                      <div class="note-header">
                        <span class="note-author">{{ note.author }}</span>
                        <span class="note-time">{{ note.time }}</span>
                      </div>
                      <p class="note-text">{{ note.text }}</p>
                    </div>
                  }
                </div>
                <div class="add-note">
                  <textarea
                    pInputTextarea
                    [(ngModel)]="newNote"
                    rows="3"
                    placeholder="Add a note..."
                    class="note-input"
                  ></textarea>
                  <button pButton class="p-button-primary p-button-sm" (click)="addNote()">
                    Add Note
                  </button>
                </div>
              </div>
            </p-tabpanel>

            <!-- Activity Tab -->
            <p-tabpanel value="3">
              <div class="activity-list">
                @for (item of activities; track item.id) {
                  <div class="activity-item">
                    <div class="activity-icon" [ngClass]="'activity-icon--' + item.type">
                      <ph-icon [attr.name]="item.icon" size="16" weight="regular"></ph-icon>
                    </div>
                    <div class="activity-content">
                      <p class="activity-desc">{{ item.description }}</p>
                      <span class="activity-time">{{ item.time }}</span>
                    </div>
                  </div>
                }
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>
    </div>
  `,
  styles: [`
    /* Profile Card */
    .profile-card {
      padding: 24px;
    }

    .profile-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
    }

    .profile-left {
      display: flex;
      gap: 16px;
    }

    .avatar-lg {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #3b82f6;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .profile-name-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .profile-name {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    .profile-company {
      font-size: 14px;
      color: var(--text-muted, #94a3b8);
      margin: 2px 0 10px 0;
    }

    .stats-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 13px;
      color: var(--text-secondary, #475569);
      background: var(--surface-ground, #f1f5f9);
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;

      &--amber {
        color: var(--status-pending, #f59e0b);
        background: #fffbeb;
      }
    }

    .profile-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .profile-actions button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--surface-border, #e2e8f0);
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary, #475569);
    }

    /* Table helpers */
    .text-muted {
      color: var(--text-muted, #94a3b8);
      font-size: 13px;
    }

    .font-medium {
      font-weight: 500;
    }

    /* Notes */
    .notes-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .note-item {
      padding: 12px 16px;
      background: var(--surface-ground, #f8fafc);
      border-radius: 8px;
    }

    .note-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .note-author {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    .note-time {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
    }

    .note-text {
      font-size: 14px;
      color: var(--text-secondary, #475569);
      margin: 0;
      line-height: 1.5;
    }

    .add-note {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
    }

    .note-input {
      width: 100%;
      box-sizing: border-box;
    }

    /* Activity */
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .activity-item {
      display: flex;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid var(--surface-border, #f1f5f9);

      &:last-child {
        border-bottom: none;
      }
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--surface-ground, #f1f5f9);
      color: var(--text-secondary, #475569);

      &--invoice {
        background: #eff6ff;
        color: #3b82f6;
      }
      &--payment {
        background: #ecfdf5;
        color: #10b981;
      }
      &--email {
        background: #faf5ff;
        color: #8b5cf6;
      }
      &--status {
        background: #fffbeb;
        color: #f59e0b;
      }
    }

    .activity-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .activity-desc {
      font-size: 14px;
      color: var(--text-primary, #0f172a);
      margin: 0;
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-muted, #94a3b8);
      margin-top: 2px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
      }

      .profile-actions {
        width: 100%;
      }

      .profile-actions button {
        flex: 1;
      }

      .contact-row {
        flex-direction: column;
        gap: 10px;
      }

      .stats-chips {
        flex-direction: column;
        gap: 6px;
      }
    }
  `],
})
export class CustomerDetailComponent implements OnInit {
  readonly customerStore = inject(CustomerStore);
  private route = inject(ActivatedRoute);

  customer = computed(() => this.customerStore.selectedCustomer());
  isLoading = computed(() => this.customerStore.isLoading());

  newNote = '';

  invoices = [
    { number: 'INV-2024-0089', date: '15 Jan 2025', amount: 12500, status: 'paid', lhdn: 'valid' },
    { number: 'INV-2024-0076', date: '02 Jan 2025', amount: 8400, status: 'paid', lhdn: 'valid' },
    { number: 'INV-2024-0094', date: '28 Jan 2025', amount: 15400, status: 'pending', lhdn: 'submitted' },
    { number: 'INV-2024-0101', date: '05 Feb 2025', amount: 6200, status: 'overdue', lhdn: 'rejected' },
  ];

  payments = [
    { date: '18 Jan 2025', invoice: 'INV-2024-0089', amount: 12500, method: 'Bank Transfer', reference: 'FPX-20250118-7821' },
    { date: '05 Jan 2025', invoice: 'INV-2024-0076', amount: 8400, method: 'Bank Transfer', reference: 'FPX-20250105-3344' },
    { date: '20 Dec 2024', invoice: 'INV-2024-0062', amount: 18700, method: 'Cheque', reference: 'CHQ-889412' },
  ];

  notes = [
    { id: 1, author: 'Ahmad', text: 'Preferred payment via bank transfer', time: '2 days ago' },
    { id: 2, author: 'Siti', text: 'Annual contract renewal in June', time: '1 week ago' },
  ];

  activities = [
    { id: 1, icon: 'invoice', type: 'invoice', description: 'Invoice INV-2024-0101 created for RM 6,200', time: '2 hours ago' },
    { id: 2, icon: 'check-circle', type: 'payment', description: 'Payment of RM 12,500 received for INV-2024-0089', time: '3 days ago' },
    { id: 3, icon: 'envelope', type: 'email', description: 'Payment reminder sent for INV-2024-0094', time: '5 days ago' },
    { id: 4, icon: 'arrow-clockwise', type: 'status', description: 'Invoice INV-2024-0094 status changed to Pending', time: '1 week ago' },
  ];

  async ngOnInit(): Promise<void> {
    const uuid = this.route.snapshot.paramMap.get('id');
    if (uuid) {
      await this.customerStore.loadCustomer(uuid);
    }
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  addNote(): void {
    if (this.newNote.trim()) {
      this.notes.unshift({
        id: Date.now(),
        author: 'You',
        text: this.newNote.trim(),
        time: 'Just now',
      });
      this.newNote = '';
    }
  }
}
