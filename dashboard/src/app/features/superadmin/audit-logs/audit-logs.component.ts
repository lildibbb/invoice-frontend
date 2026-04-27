import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { TabsModule } from 'primeng/tabs';
import { PageHeaderComponent } from '../../../shared';
import '@phosphor-icons/web/index.js';
import {
  superadminAuditControllerFindAllPlatformLogs,
  superadminAuditControllerFindAllInvoiceAudits,
  superadminAuditControllerGetCompanyTimeline,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

interface AuditLog {
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  tenant: string;
  ipAddress: string;
  details: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    TimelineModule,
    TabsModule,
    PageHeaderComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Audit Logs" subtitle="Platform-wide activity log">
        <button actions pButton label="Export CSV" icon="pi pi-download" class="p-button-outlined"></button>
      </app-page-header>

      <!-- View Tabs -->
      <div class="flex flex-wrap gap-2 mb-5">
        <button
          class="filter-tab"
          [class.filter-tab--active]="activeView() === 'platform'"
          (click)="activeView.set('platform')"
        >Platform Logs</button>
        <button
          class="filter-tab"
          [class.filter-tab--active]="activeView() === 'invoices'"
          (click)="switchToInvoiceAudits()"
        >Invoice Audits</button>
      </div>

      <!-- Filter bar -->
      @if (activeView() === 'platform') {
      <div class="filter-bar invoiz-card">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Search logs..."
            [(ngModel)]="searchQuery"
            class="filter-input"
          />
        </p-iconfield>

        <p-select
          [options]="tenantOptions"
          [(ngModel)]="selectedTenant"
          placeholder="Tenant"
          [style]="{ minWidth: '180px' }"
        />

        <p-select
          [options]="actionOptions"
          [(ngModel)]="selectedAction"
          placeholder="Action Type"
          [style]="{ minWidth: '180px' }"
        />

        <p-select
          [options]="severityOptions"
          [(ngModel)]="selectedSeverity"
          placeholder="Severity"
          [style]="{ minWidth: '140px' }"
        />
      </div>

      <!-- Table -->
      <div class="invoiz-card table-card">
        <p-table
          [value]="logs"
          [rows]="25"
          [paginator]="true"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          dataKey="timestamp"
        >
          <ng-template #header>
            <tr>
              <th style="width: 40px"></th>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Tenant</th>
              <th>IP Address</th>
            </tr>
          </ng-template>
          <ng-template #body let-log let-ri="rowIndex">
            <tr>
              <td>
                <button
                  pButton
                  type="button"
                  [icon]="log.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                  class="p-button-text p-button-sm p-button-plain"
                  (click)="log.expanded = !log.expanded"
                ></button>
              </td>
              <td>
                <span class="timestamp">{{ log.timestamp }}</span>
              </td>
              <td>
                <div class="actor-cell">
                  <span class="actor-avatar">{{ getInitials(log.actor) }}</span>
                  <span class="actor-email">{{ log.actor }}</span>
                </div>
              </td>
              <td>
                <p-tag
                  [value]="getActionLabel(log.action)"
                  [severity]="getActionSeverity(log.action)"
                />
              </td>
              <td>{{ log.entity }}</td>
              <td>{{ log.tenant }}</td>
              <td class="text-muted">{{ log.ipAddress }}</td>
            </tr>
            @if (log.expanded) {
              <tr class="expanded-row">
                <td colspan="7">
                  <div class="detail-block">
                    <pre class="json-diff">{{ log.details | json }}</pre>
                  </div>
                </td>
              </tr>
            }
          </ng-template>
        </p-table>
      </div>
      }

      <!-- Invoice Audits View -->
      @if (activeView() === 'invoices') {
      <div class="invoiz-card table-card">
        <p-table
          [value]="invoiceAudits()"
          [rows]="25"
          [paginator]="true"
          [rowHover]="true"
          [loading]="loadingInvoiceAudits"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        >
          <ng-template #header>
            <tr>
              <th>Timestamp</th>
              <th>Invoice #</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Company</th>
              <th>Details</th>
              <th style="width: 100px">Timeline</th>
            </tr>
          </ng-template>
          <ng-template #body let-audit>
            <tr>
              <td><span class="timestamp">{{ audit.timestamp }}</span></td>
              <td class="font-medium">{{ audit.invoiceNumber }}</td>
              <td>
                <p-tag [value]="audit.action" [severity]="getActionSeverity(audit.action)" />
              </td>
              <td>
                <div class="actor-cell">
                  <span class="actor-avatar">{{ getInitials(audit.actor) }}</span>
                  <span class="actor-email">{{ audit.actor }}</span>
                </div>
              </td>
              <td>{{ audit.company }}</td>
              <td class="text-muted">{{ audit.details }}</td>
              <td>
                @if (audit.companyUuid) {
                  <button
                    pButton
                    class="p-button-text p-button-sm"
                    (click)="viewCompanyTimeline(audit.companyUuid, audit.company)"
                  >
                    <ph-icon name="timeline" size="16" weight="regular"></ph-icon>
                  </button>
                }
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center text-muted" style="padding: 40px 0">No invoice audits found.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      }

      <!-- Company Timeline Dialog -->
      <p-dialog
        [header]="'Company Timeline — ' + timelineCompanyName"
        [(visible)]="timelineDialogVisible"
        [modal]="true"
        [style]="{ width: '560px', maxHeight: '80vh' }"
      >
        @if (companyTimeline().length) {
          <p-timeline [value]="companyTimeline()" align="left">
            <ng-template pTemplate="content" let-event>
              <div class="timeline-event">
                <div class="timeline-event__action font-medium">{{ event.action }}</div>
                <div class="timeline-event__detail text-muted">{{ event.actor }} · {{ event.date }}</div>
                @if (event.details) {
                  <div class="timeline-event__detail text-muted" style="font-size: 12px">{{ event.details }}</div>
                }
              </div>
            </ng-template>
          </p-timeline>
        } @else {
          <p class="text-muted text-center" style="padding: 24px">No timeline events</p>
        }
      </p-dialog>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-input {
      min-width: 220px;
    }

    .table-card {
      overflow: hidden;
    }

    .timestamp {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 13px;
      color: var(--text-primary);
    }

    .actor-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actor-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary-light, #EFF6FF);
      color: var(--primary, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .actor-email {
      font-size: 13px;
      color: var(--text-primary);
    }

    .text-muted {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .expanded-row td {
      padding: 0 !important;
      border: none !important;
    }

    .detail-block {
      padding: 12px 16px 12px 56px;
      background: var(--surface-ground, #f8fafc);
    }

    .json-diff {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 12px;
      line-height: 1.6;
      margin: 0;
      padding: 12px 16px;
      background: var(--surface-card, #fff);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
      border-radius: 6px;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--text-primary);
    }

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

    .text-center {
      text-align: center;
    }

    .timeline-event {
      padding-bottom: 4px;
    }

    .timeline-event__action {
      font-size: 14px;
      color: var(--text-primary);
    }

    .timeline-event__detail {
      font-size: 12px;
      color: var(--text-secondary);
    }
  `],
})
export class AuditLogsComponent implements OnInit {
  private readonly notification = inject(NotificationService);

  loading = false;
  loadingInvoiceAudits = false;
  searchQuery = '';
  selectedTenant = '';
  selectedAction = '';
  selectedSeverity = '';

  activeView = signal<'platform' | 'invoices'>('platform');
  invoiceAudits = signal<any[]>([]);
  companyTimeline = signal<any[]>([]);
  timelineDialogVisible = false;
  timelineCompanyName = '';

  tenantOptions = [
    { label: 'All Tenants', value: '' },
    { label: 'TechVentures Sdn Bhd', value: 'techventures' },
    { label: 'Nusantara Holdings', value: 'nusantara' },
    { label: 'Warisan Digital', value: 'warisan' },
    { label: 'NewStartup Co', value: 'newstartup' },
    { label: 'Problem Corp', value: 'problem' },
  ];

  actionOptions = [
    { label: 'All Actions', value: '' },
    { label: 'Login', value: 'login' },
    { label: 'Invoice Created', value: 'invoice.created' },
    { label: 'Invoice Updated', value: 'invoice.updated' },
    { label: 'Payment Recorded', value: 'payment.recorded' },
    { label: 'LHDN Submitted', value: 'lhdn.submitted' },
    { label: 'User Invited', value: 'user.invited' },
    { label: 'Settings Changed', value: 'settings.changed' },
  ];

  severityOptions = [
    { label: 'All', value: '' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
  ];

  logs: AuditLog[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadLogs();
  }

  async loadLogs(): Promise<void> {
    this.loading = true;
    try {
      const { data } = await superadminAuditControllerFindAllPlatformLogs({} as any);
      const list = (data as any)?.data ?? data ?? [];
      this.logs = list.map((l: any) => ({
        timestamp: l.createdAt ?? l.timestamp ?? '',
        actor: l.actorEmail ?? l.actor ?? l.performedBy ?? '',
        action: l.action ?? l.eventType ?? '',
        entity: l.entity ?? l.resourceType ?? '',
        tenant: l.companyName ?? l.tenant ?? '',
        ipAddress: l.ipAddress ?? l.ip ?? '',
        details: l.details ?? l.metadata ?? l.payload ?? '',
      }));
    } catch {
      this.notification.error('Failed to load audit logs');
    } finally {
      this.loading = false;
    }
  }

  getInitials(email: string): string {
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return local.substring(0, 2).toUpperCase();
  }

  getActionLabel(action: string): string {
    const map: Record<string, string> = {
      'invoice.created': 'Create',
      'invoice.updated': 'Update',
      'lhdn.submitted': 'Submit',
      'lhdn.webhook': 'Submit',
      'tenant.suspended': 'Delete',
      'user.invited': 'Create',
      'payment.recorded': 'Update',
      login: 'Login',
    };
    return map[action] ?? action;
  }

  getActionSeverity(action: string): 'info' | 'success' | 'warn' | 'danger' | 'contrast' | 'secondary' | undefined {
    const map: Record<string, 'info' | 'success' | 'warn' | 'danger' | 'contrast'> = {
      login: 'info',
      'invoice.created': 'success',
      'user.invited': 'success',
      'invoice.updated': 'warn',
      'payment.recorded': 'warn',
      'tenant.suspended': 'danger',
      'lhdn.submitted': 'contrast',
      'lhdn.webhook': 'contrast',
    };
    return map[action];
  }

  parseDetails(details: string): object {
    try {
      return JSON.parse(details);
    } catch {
      return { raw: details };
    }
  }

  async switchToInvoiceAudits(): Promise<void> {
    this.activeView.set('invoices');
    if (!this.invoiceAudits().length) {
      await this.loadInvoiceAudits();
    }
  }

  async loadInvoiceAudits(): Promise<void> {
    this.loadingInvoiceAudits = true;
    try {
      const { data } = await superadminAuditControllerFindAllInvoiceAudits({} as any);
      const list = (data as any)?.data ?? data ?? [];
      this.invoiceAudits.set(
        list.map((a: any) => ({
          timestamp: a.createdAt ?? a.timestamp ?? '',
          invoiceNumber: a.invoiceNumber ?? a.invoiceNo ?? '',
          action: a.action ?? a.eventType ?? '',
          actor: a.actorEmail ?? a.actor ?? a.performedBy ?? '',
          company: a.companyName ?? a.tenant ?? '',
          companyUuid: a.companyUuid ?? a.companyId ?? '',
          details: a.details ?? a.description ?? '',
        })),
      );
    } catch {
      this.notification.error('Failed to load invoice audits');
    } finally {
      this.loadingInvoiceAudits = false;
    }
  }

  async viewCompanyTimeline(companyUuid: string, companyName: string): Promise<void> {
    this.timelineCompanyName = companyName;
    this.timelineDialogVisible = true;
    this.companyTimeline.set([]);
    try {
      const { data } = await superadminAuditControllerGetCompanyTimeline({
        path: { companyUuid },
      } as any);
      const list = (data as any)?.data ?? data ?? [];
      this.companyTimeline.set(
        list.map((e: any) => ({
          action: e.action ?? e.eventType ?? e.type ?? '',
          actor: e.actorEmail ?? e.actor ?? e.performedBy ?? '',
          date: e.createdAt ? new Date(e.createdAt).toLocaleString() : (e.date ?? ''),
          details: e.details ?? e.description ?? '',
        })),
      );
    } catch {
      this.notification.error('Failed to load company timeline');
    }
  }
}
