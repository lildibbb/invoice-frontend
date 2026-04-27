import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import '@phosphor-icons/web/index.js';
import {
  lhdnCredentialsControllerGetCredentialStatus,
  lhdnCredentialsControllerCreateCredentials,
  lhdnCredentialsControllerUpdateCredentials,
  lhdnCredentialsControllerValidateCredentials,
  lhdnCredentialsControllerDeactivateCredentials,
  lhdnCredentialsControllerGetAuditLog,
  lhdnManagementControllerListNotifications,
  lhdnManagementControllerSyncNotifications,
  lhdnManagementControllerGetDocumentTypes,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-settings-lhdn',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, DialogModule, TableModule, TagModule, TimelineModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="lhdn-settings">
      <!-- Environment Toggle -->
      <div class="env-toggle">
        <button
          class="env-btn"
          [class.env-btn--sandbox]="environment === 'sandbox'"
          (click)="environment = 'sandbox'"
        >
          Sandbox
        </button>
        <button
          class="env-btn"
          [class.env-btn--production]="environment === 'production'"
          (click)="environment = 'production'"
        >
          Production
        </button>
      </div>

      <!-- Sandbox Warning -->
      <div *ngIf="environment === 'sandbox'" class="warning-banner">
        <ph-icon name="warning" size="18" weight="duotone"></ph-icon>
        <span>You are in sandbox mode. Submissions will not be sent to LHDN production.</span>
      </div>

      <!-- Credentials Form -->
      <form [formGroup]="form">
        <section class="form-section invoiz-card">
          <h3 class="section-title">LHDN Credentials</h3>
          <div class="form-grid">
            <div class="field">
              <label>Tax Identification No. (TIN)</label>
              <input pInputText formControlName="tin" />
            </div>
            <div class="field">
              <label>Business Registration No. (BRN)</label>
              <input pInputText formControlName="brn" />
            </div>
            <div class="field">
              <label>Client ID</label>
              <div class="input-toggle">
                <input
                  pInputText
                  formControlName="clientId"
                  [type]="showClientId ? 'text' : 'password'"
                />
                <button class="toggle-btn" type="button" (click)="showClientId = !showClientId">
                  <ph-icon [attr.name]="showClientId ? 'eye-slash' : 'eye'" size="18" weight="duotone"></ph-icon>
                </button>
              </div>
            </div>
            <div class="field">
              <label>Client Secret</label>
              <div class="input-toggle">
                <input
                  pInputText
                  formControlName="clientSecret"
                  [type]="showClientSecret ? 'text' : 'password'"
                />
                <button class="toggle-btn" type="button" (click)="showClientSecret = !showClientSecret">
                  <ph-icon [attr.name]="showClientSecret ? 'eye-slash' : 'eye'" size="18" weight="duotone"></ph-icon>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Test Connection -->
        <div class="action-row">
          <button pButton class="p-button-outlined test-btn" (click)="testConnection()">
            <ph-icon name="plugs-connected" size="18" weight="duotone"></ph-icon>
            Test Connection
          </button>
        </div>

        <!-- Connection Result -->
        <div *ngIf="connectionStatus === 'success'" class="result-card result-card--success">
          <ph-icon name="check-circle" size="20" weight="duotone"></ph-icon>
          <span>Connected successfully to LHDN {{ environment }} environment.</span>
        </div>
        <div *ngIf="connectionStatus === 'error'" class="result-card result-card--error">
          <ph-icon name="x-circle" size="20" weight="duotone"></ph-icon>
          <span>Connection failed. Please verify your credentials and try again.</span>
        </div>

        <!-- Save -->
        <div class="action-row">
          <button pButton class="p-button-primary" (click)="onSave()">Save Configuration</button>
        </div>
      </form>

      <!-- Danger Zone -->
      <section class="danger-zone">
        <h4 class="danger-title">Disconnect LHDN Integration</h4>
        <p class="danger-desc">This will remove all LHDN credentials. Active submissions will fail.</p>
        <button pButton class="p-button-danger p-button-sm" (click)="showDisconnectDialog = true">
          Disconnect
        </button>
      </section>

      <!-- LHDN Notifications -->
      <section class="invoiz-card form-section" style="margin-top: 24px">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title" style="margin: 0">LHDN Notifications</h3>
          <button pButton class="p-button-outlined p-button-sm" (click)="syncNotifications()" [loading]="syncingNotifications">
            <ph-icon name="arrows-clockwise" size="16" weight="bold"></ph-icon>
            Sync Notifications
          </button>
        </div>
        <p-table [value]="notifications()" [rows]="5" [paginator]="notifications().length > 5" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-n>
            <tr>
              <td class="text-muted">{{ n.date }}</td>
              <td>{{ n.type }}</td>
              <td>{{ n.message }}</td>
              <td><p-tag [value]="n.status" [severity]="n.status === 'read' ? 'secondary' : 'info'" /></td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="4" class="text-center text-muted" style="padding: 24px">No notifications</td></tr>
          </ng-template>
        </p-table>
      </section>

      <!-- Supported Document Types -->
      <section class="invoiz-card form-section" style="margin-top: 16px">
        <h3 class="section-title">Supported Document Types</h3>
        <div class="doc-types-grid">
          @for (dt of documentTypes(); track dt.code) {
            <div class="doc-type-chip">
              <span class="doc-type-code">{{ dt.code }}</span>
              <span class="doc-type-name">{{ dt.name }}</span>
            </div>
          }
          @if (!documentTypes().length) {
            <span class="text-muted" style="font-size: 13px">No document types loaded</span>
          }
        </div>
      </section>

      <!-- Credential Audit Log -->
      <section class="invoiz-card form-section" style="margin-top: 16px">
        <h3 class="section-title">Credential Change History</h3>
        @if (auditLog().length) {
          <p-timeline [value]="auditLog()" align="left">
            <ng-template pTemplate="content" let-event>
              <div class="audit-event">
                <div class="audit-event__action">{{ event.action }}</div>
                <div class="audit-event__detail text-muted">{{ event.actor }} · {{ event.date }}</div>
              </div>
            </ng-template>
          </p-timeline>
        } @else {
          <p class="text-muted" style="font-size: 13px; margin: 0">No credential changes recorded</p>
        }
      </section>

      <!-- Confirmation Dialog -->
      <p-dialog
        header="Confirm Disconnect"
        [(visible)]="showDisconnectDialog"
        [modal]="true"
        [style]="{ width: '420px' }"
      >
        <p>Are you sure you want to disconnect the LHDN integration? This action cannot be undone and active submissions will fail.</p>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showDisconnectDialog = false">Cancel</button>
            <button pButton class="p-button-danger" (click)="onDisconnect()">Disconnect</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .lhdn-settings {
      max-width: 720px;
    }

    .env-toggle {
      display: flex;
      gap: 0;
      margin-bottom: 16px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
      width: fit-content;
    }

    .env-btn {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      background: var(--card-bg);
      color: var(--text-secondary);
      transition: all 0.15s ease;
    }

    .env-btn--sandbox {
      background: #fef3c7;
      color: #92400e;
    }

    .env-btn--production {
      background: #d1fae5;
      color: #065f46;
    }

    .warning-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      color: #92400e;
      font-size: 13px;
      margin-bottom: 20px;
    }

    .form-section {
      padding: 20px;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      input {
        width: 100%;
      }
    }

    .input-toggle {
      position: relative;

      input {
        padding-right: 40px;
      }
    }

    .toggle-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      padding: 4px;

      &:hover {
        color: var(--text-secondary);
      }
    }

    .action-row {
      margin-bottom: 16px;
    }

    .test-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .result-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .result-card--success {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .result-card--error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .danger-zone {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--card-radius);
      padding: 20px;
      margin-top: 32px;
    }

    .danger-title {
      font-size: 15px;
      font-weight: 600;
      color: #991b1b;
      margin: 0 0 4px;
    }

    .danger-desc {
      font-size: 13px;
      color: #7f1d1d;
      margin: 0 0 12px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .text-muted {
      color: var(--text-muted, #94a3b8);
      font-size: 13px;
    }

    .text-center {
      text-align: center;
    }

    .doc-types-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .doc-type-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      background: var(--surface-ground, #f8fafc);
      font-size: 13px;
    }

    .doc-type-code {
      font-weight: 600;
      color: var(--primary, #3b82f6);
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 12px;
    }

    .doc-type-name {
      color: var(--text-primary);
    }

    .audit-event {
      padding-bottom: 4px;
    }

    .audit-event__action {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .audit-event__detail {
      font-size: 12px;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class SettingsLhdnComponent implements OnInit {
  environment: 'sandbox' | 'production' = 'sandbox';
  showClientId = false;
  showClientSecret = false;
  connectionStatus: 'idle' | 'success' | 'error' = 'idle';
  showDisconnectDialog = false;
  private notification = inject(NotificationService);
  hasExistingCredentials = false;
  loading = false;
  syncingNotifications = false;

  notifications = signal<any[]>([]);
  documentTypes = signal<any[]>([]);
  auditLog = signal<any[]>([]);

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tin: [''],
      brn: [''],
      clientId: [''],
      clientSecret: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadCredentialStatus(),
      this.loadNotifications(),
      this.loadDocumentTypes(),
      this.loadAuditLog(),
    ]);
  }

  private async loadCredentialStatus(): Promise<void> {
    try {
      const { data } = await lhdnCredentialsControllerGetCredentialStatus();
      const status = data as any;
      if (status && status.hasCredentials) {
        this.hasExistingCredentials = true;
        this.environment = (status.environment || 'sandbox').toLowerCase() as any;
        this.form.patchValue({
          tin: status.tin ?? '',
          brn: status.brn ?? '',
          clientId: status.clientId ?? '',
          clientSecret: '',
        });
      }
    } catch {
      // No credentials configured yet
    }
  }

  async testConnection(): Promise<void> {
    this.connectionStatus = 'idle';
    try {
      await lhdnCredentialsControllerValidateCredentials();
      this.connectionStatus = 'success';
      this.notification.success('Connection successful');
    } catch {
      this.connectionStatus = 'error';
      this.notification.error('Connection failed');
    }
  }

  async onSave(): Promise<void> {
    this.loading = true;
    try {
      const v = this.form.value;
      const body = {
        clientId: v.clientId,
        clientSecret: v.clientSecret,
        environment: this.environment.toUpperCase(),
      } as any;
      if (this.hasExistingCredentials) {
        await lhdnCredentialsControllerUpdateCredentials({ body });
      } else {
        await lhdnCredentialsControllerCreateCredentials({ body });
        this.hasExistingCredentials = true;
      }
      this.notification.success('LHDN configuration saved');
    } catch {
      this.notification.error('Failed to save configuration');
    } finally {
      this.loading = false;
    }
  }

  async onDisconnect(): Promise<void> {
    try {
      await lhdnCredentialsControllerDeactivateCredentials();
      this.showDisconnectDialog = false;
      this.form.reset();
      this.connectionStatus = 'idle';
      this.hasExistingCredentials = false;
      this.notification.success('LHDN integration disconnected');
    } catch {
      this.notification.error('Failed to disconnect');
      this.showDisconnectDialog = false;
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      const { data } = await lhdnManagementControllerListNotifications();
      const list = (data as any)?.data ?? data ?? [];
      this.notifications.set(
        list.map((n: any) => ({
          date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : (n.date ?? ''),
          type: n.type ?? n.notificationType ?? '',
          message: n.message ?? n.content ?? n.title ?? '',
          status: n.status ?? (n.read ? 'read' : 'unread'),
        })),
      );
    } catch {
      // Notifications not available
    }
  }

  async syncNotifications(): Promise<void> {
    this.syncingNotifications = true;
    try {
      await lhdnManagementControllerSyncNotifications();
      this.notification.success('Notifications synced');
      await this.loadNotifications();
    } catch {
      this.notification.error('Failed to sync notifications');
    } finally {
      this.syncingNotifications = false;
    }
  }

  private async loadDocumentTypes(): Promise<void> {
    try {
      const { data } = await lhdnManagementControllerGetDocumentTypes();
      const list = (data as any)?.data ?? data ?? [];
      this.documentTypes.set(
        list.map((dt: any) => ({
          code: dt.code ?? dt.id ?? '',
          name: dt.name ?? dt.description ?? '',
        })),
      );
    } catch {
      // Document types not available
    }
  }

  private async loadAuditLog(): Promise<void> {
    try {
      const { data } = await lhdnCredentialsControllerGetAuditLog();
      const list = (data as any)?.data ?? data ?? [];
      this.auditLog.set(
        list.map((e: any) => ({
          action: e.action ?? e.eventType ?? e.type ?? '',
          actor: e.actor ?? e.performedBy ?? e.email ?? '',
          date: e.createdAt ? new Date(e.createdAt).toLocaleString() : (e.date ?? ''),
        })),
      );
    } catch {
      // Audit log not available
    }
  }
}
