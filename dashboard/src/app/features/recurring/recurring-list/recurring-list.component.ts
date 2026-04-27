import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CurrencyMyrPipe } from '../../../shared/pipes/currency-myr.pipe';
import { RecurringStore } from '../recurring.store';
import { NotificationService } from '../../../core/services/notification.service';
import { RecurringFormComponent } from '../recurring-form/recurring-form.component';

@Component({
  selector: 'app-recurring-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    MenuModule,
    InputTextModule,
    PageHeaderComponent,
    CurrencyMyrPipe,
    RecurringFormComponent,
  ],
  providers: [RecurringStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <!-- Header -->
      <app-page-header title="Recurring Invoices" subtitle="Manage automated invoice schedules">
        <div actions>
          <button pButton class="p-button-primary p-button-sm" (click)="showCreateDialog = true">
            <ph-icon name="plus" size="16" weight="bold"></ph-icon>
            Create Plan
          </button>
        </div>
      </app-page-header>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Total Plans</span>
          <span class="stat-pill__value">{{ totalPlans() }}</span>
        </div>
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Active</span>
          <span class="stat-pill__value stat-pill__value--green">{{ activePlans() }}</span>
        </div>
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Paused</span>
          <span class="stat-pill__value stat-pill__value--amber">{{ pausedPlans() }}</span>
        </div>
        <div class="invoiz-card stat-pill">
          <span class="stat-pill__label">Cancelled</span>
          <span class="stat-pill__value stat-pill__value--red">{{ cancelledPlans() }}</span>
        </div>
      </div>

      <!-- Table -->
      <div class="invoiz-card table-card">
        <p-table
          [value]="plans()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          dataKey="uuid"
          [loading]="isLoading()"
          [sortMode]="'single'"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">Plan Name <p-sortIcon field="name"></p-sortIcon></th>
              <th pSortableColumn="customer">Customer <p-sortIcon field="customer"></p-sortIcon></th>
              <th pSortableColumn="frequency">Frequency <p-sortIcon field="frequency"></p-sortIcon></th>
              <th pSortableColumn="amount" style="text-align: right">Amount <p-sortIcon field="amount"></p-sortIcon></th>
              <th pSortableColumn="nextInvoiceDate" class="hide-mobile">Next Invoice <p-sortIcon field="nextInvoiceDate"></p-sortIcon></th>
              <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
              <th style="width: 56px">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-plan>
            <tr>
              <td class="font-medium">{{ plan.name }}</td>
              <td>{{ plan.customer?.name || plan.customerName || '-' }}</td>
              <td>{{ plan.frequency }}</td>
              <td style="text-align: right">{{ plan.amount | currencyMyr }}</td>
              <td class="hide-mobile">{{ plan.nextInvoiceDate | date:'dd/MM/yyyy' }}</td>
              <td>
                <p-tag
                  [value]="plan.status"
                  [severity]="getStatusSeverity(plan.status)"
                ></p-tag>
              </td>
              <td>
                <button
                  pButton
                  class="p-button-text p-button-sm p-button-rounded action-menu-btn"
                  (click)="actionMenu.toggle($event); activePlan = plan"
                >
                  <ph-icon name="dots-three" size="18" weight="bold"></ph-icon>
                </button>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-6" style="color: var(--text-muted)">
                No recurring plans found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Action Menu -->
      <p-menu #actionMenu [model]="actionMenuItems" [popup]="true"></p-menu>

      <!-- Create Dialog -->
      <app-recurring-form
        [visible]="showCreateDialog"
        (visibleChange)="showCreateDialog = $event"
        (saved)="onPlanCreated()"
      ></app-recurring-form>
    </div>
  `,
  styles: [`
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

    .table-card {
      margin-bottom: 20px;
      overflow: hidden;
    }

    .action-menu-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .hide-mobile {
        display: none;
      }
    }
  `],
})
export class RecurringListComponent implements OnInit {
  readonly store = inject(RecurringStore);
  private notification = inject(NotificationService);
  private router = inject(Router);

  plans = computed(() => this.store.plans());
  isLoading = computed(() => this.store.isLoading());

  totalPlans = computed(() => this.plans().length);
  activePlans = computed(() => this.plans().filter((p: any) => p.status === 'ACTIVE').length);
  pausedPlans = computed(() => this.plans().filter((p: any) => p.status === 'PAUSED').length);
  cancelledPlans = computed(() => this.plans().filter((p: any) => p.status === 'CANCELLED').length);

  showCreateDialog = false;
  activePlan: any = null;

  actionMenuItems = [
    { label: 'Pause', icon: 'pi pi-pause', command: () => this.onPause(this.activePlan?.uuid) },
    { label: 'Resume', icon: 'pi pi-play', command: () => this.onResume(this.activePlan?.uuid) },
    { separator: true },
    { label: 'Cancel', icon: 'pi pi-times', command: () => this.onCancel(this.activePlan?.uuid) },
    { label: 'Delete', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.onDelete(this.activePlan?.uuid) },
  ];

  async ngOnInit(): Promise<void> {
    await this.store.loadPlans();
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PAUSED': return 'warn';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  async onPause(uuid: string): Promise<void> {
    if (!uuid) return;
    try {
      await this.store.pausePlan(uuid);
      this.notification.success('Plan paused');
      await this.store.loadPlans();
    } catch {
      this.notification.error('Failed to pause plan');
    }
  }

  async onResume(uuid: string): Promise<void> {
    if (!uuid) return;
    try {
      await this.store.resumePlan(uuid);
      this.notification.success('Plan resumed');
      await this.store.loadPlans();
    } catch {
      this.notification.error('Failed to resume plan');
    }
  }

  async onCancel(uuid: string): Promise<void> {
    if (!uuid) return;
    try {
      await this.store.cancelPlan(uuid);
      this.notification.success('Plan cancelled');
      await this.store.loadPlans();
    } catch {
      this.notification.error('Failed to cancel plan');
    }
  }

  async onDelete(uuid: string): Promise<void> {
    if (!uuid) return;
    try {
      await this.store.deletePlan(uuid);
      this.notification.success('Plan deleted');
      await this.store.loadPlans();
    } catch {
      this.notification.error('Failed to delete plan');
    }
  }

  async onPlanCreated(): Promise<void> {
    this.showCreateDialog = false;
    this.notification.success('Plan created');
    await this.store.loadPlans();
  }
}
