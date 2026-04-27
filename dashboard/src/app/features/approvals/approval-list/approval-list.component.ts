import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent, CurrencyMyrPipe } from '../../../shared';
import { ApprovalStore } from '../approval.store';
import { NotificationService } from '../../../core/services/notification.service';

const STATUS_CONFIG: Record<string, { severity: string }> = {
  PENDING: { severity: 'warn' },
  APPROVED: { severity: 'success' },
  REJECTED: { severity: 'danger' },
};

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    TextareaModule,
    TooltipModule,
    PageHeaderComponent,
    CurrencyMyrPipe,
  ],
  providers: [ApprovalStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <app-page-header title="Pending Approvals">
        <div actions class="flex items-center gap-3">
          <span class="approval-count-badge">{{ approvalStore.pendingApprovals().length }}</span>
          <button pButton [text]="true" (click)="reload()">
            <ph-icon name="arrow-clockwise" size="18" weight="bold"></ph-icon>
            Refresh
          </button>
        </div>
      </app-page-header>

      @if (approvalStore.isLoading()) {
        <div class="invoiz-card p-8 text-center">
          <p class="text-slate-500">Loading approvals...</p>
        </div>
      } @else if (approvalStore.pendingApprovals().length === 0) {
        <div class="invoiz-card p-8 text-center">
          <ph-icon name="check-circle" size="48" weight="duotone" class="text-green-400 mb-3"></ph-icon>
          <p class="text-slate-500">No pending approvals</p>
        </div>
      } @else {
        <div class="invoiz-card">
          <p-table
            [value]="approvalStore.pendingApprovals()"
            [rows]="10"
            [paginator]="true"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Requested By</th>
                <th>Date</th>
                <th>Status</th>
                <th style="width: 160px">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-approval>
              <tr>
                <td class="font-medium">
                  <a [routerLink]="['/app/invoices', approval.invoice?.uuid ?? approval.invoiceUuid]"
                     class="text-primary hover:underline">
                    {{ approval.invoice?.invoiceNo ?? approval.invoiceNo ?? '—' }}
                  </a>
                </td>
                <td>{{ approval.invoice?.customer?.name ?? approval.customerName ?? '—' }}</td>
                <td>{{ (approval.invoice?.total ?? approval.amount ?? 0) | currencyMyr }}</td>
                <td>{{ approval.requestedBy?.name ?? approval.requestedByName ?? '—' }}</td>
                <td>{{ approval.createdAt | date:'dd MMM yyyy' }}</td>
                <td>
                  <p-tag
                    [value]="approval.status"
                    [severity]="getStatusSeverity(approval.status)"
                  ></p-tag>
                </td>
                <td>
                  <div class="flex items-center gap-1">
                    @if (approval.status === 'PENDING') {
                      <button
                        pButton
                        size="small"
                        severity="success"
                        [text]="true"
                        pTooltip="Approve"
                        (click)="openReviewDialog(approval, 'APPROVED')"
                      >
                        <ph-icon name="check-circle" size="18" weight="bold"></ph-icon>
                      </button>
                      <button
                        pButton
                        size="small"
                        severity="danger"
                        [text]="true"
                        pTooltip="Reject"
                        (click)="openReviewDialog(approval, 'REJECTED')"
                      >
                        <ph-icon name="x-circle" size="18" weight="bold"></ph-icon>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <!-- Review Dialog -->
      <p-dialog
        [header]="reviewAction() === 'APPROVED' ? 'Approve Request' : 'Reject Request'"
        [visible]="showReviewDialog()"
        (visibleChange)="showReviewDialog.set($event)"
        [style]="{ width: '420px' }"
        [modal]="true"
      >
        <div class="flex flex-col gap-4 pt-2">
          <p class="text-sm text-slate-600">
            {{ reviewAction() === 'APPROVED'
              ? 'Are you sure you want to approve this request?'
              : 'Are you sure you want to reject this request?' }}
          </p>
          <div class="flex flex-col gap-1">
            <label class="form-label">Notes (optional)</label>
            <textarea
              pTextarea
              [(ngModel)]="reviewNotes"
              rows="3"
              placeholder="Add notes..."
              class="w-full"
            ></textarea>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <button pButton [outlined]="true" (click)="showReviewDialog.set(false)">Cancel</button>
            <button
              pButton
              [severity]="reviewAction() === 'APPROVED' ? 'success' : 'danger'"
              (click)="submitReview()"
            >
              {{ reviewAction() === 'APPROVED' ? 'Approve' : 'Reject' }}
            </button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .approval-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      background: var(--amber-100, #fef3c7);
      color: var(--amber-700, #b45309);
    }

    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary, #64748b);
    }
  `],
})
export class ApprovalListComponent implements OnInit {
  readonly approvalStore = inject(ApprovalStore);
  private readonly notification = inject(NotificationService);

  showReviewDialog = signal(false);
  reviewAction = signal<'APPROVED' | 'REJECTED'>('APPROVED');
  reviewNotes = '';
  private selectedApproval: any = null;

  async ngOnInit(): Promise<void> {
    await this.approvalStore.loadPending();
  }

  async reload(): Promise<void> {
    await this.approvalStore.loadPending();
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return (STATUS_CONFIG[status]?.severity ?? 'secondary') as any;
  }

  openReviewDialog(approval: any, action: 'APPROVED' | 'REJECTED'): void {
    this.selectedApproval = approval;
    this.reviewAction.set(action);
    this.reviewNotes = '';
    this.showReviewDialog.set(true);
  }

  async submitReview(): Promise<void> {
    if (!this.selectedApproval) return;
    try {
      const id = this.selectedApproval.uuid ?? this.selectedApproval.id;
      await this.approvalStore.reviewApproval(id, this.reviewAction(), this.reviewNotes || undefined);
      this.notification.success(`Request ${this.reviewAction().toLowerCase()}`);
      this.showReviewDialog.set(false);
      await this.approvalStore.loadPending();
    } catch {
      this.notification.error('Failed to submit review');
    }
  }
}
