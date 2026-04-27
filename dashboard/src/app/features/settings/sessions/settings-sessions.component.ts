import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import '@phosphor-icons/web/index.js';

import {
  authControllerGetSessions,
  authControllerRevokeSession,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

interface Session {
  jti: string;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  location?: string;
  isCurrent?: boolean;
  device?: string;
  browser?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-settings-sessions',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="sessions-settings">
      <!-- Header -->
      <div class="sessions-header">
        <div>
          <h2 class="sessions-title">Active Sessions</h2>
          <p class="sessions-subtitle">Manage your active sessions across devices</p>
        </div>
        <button
          pButton
          class="p-button-outlined p-button-danger p-button-sm"
          (click)="onRevokeAllOthers()"
          *ngIf="sessions.length > 1"
        >
          <ph-icon name="sign-out" size="16" weight="duotone"></ph-icon>
          Revoke All Other Sessions
        </button>
      </div>

      <!-- Sessions Table -->
      <div class="invoiz-card">
        <p-table [value]="sessions" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Device / Browser</th>
              <th>IP Address</th>
              <th>Last Active</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-session>
            <tr>
              <td>
                <div class="device-cell">
                  <ph-icon [attr.name]="getDeviceIcon(session)" size="20" weight="duotone"></ph-icon>
                  <div class="device-info">
                    <span class="device-name">{{ session.device || parseDevice(session.userAgent) }}</span>
                    <span class="device-browser">{{ session.browser || parseBrowser(session.userAgent) }}</span>
                  </div>
                </div>
              </td>
              <td class="text-muted">{{ session.ipAddress || '—' }}</td>
              <td class="text-muted">{{ session.lastActiveAt ? (session.lastActiveAt | date:'medium') : (session.createdAt | date:'medium') }}</td>
              <td class="text-muted">{{ session.location || '—' }}</td>
              <td>
                <p-tag
                  *ngIf="session.isCurrent"
                  value="Current Session"
                  severity="success"
                  [rounded]="true"
                ></p-tag>
              </td>
              <td>
                <button
                  pButton
                  class="p-button-danger p-button-text p-button-sm"
                  (click)="onRevoke(session)"
                  *ngIf="!session.isCurrent"
                >
                  Revoke
                </button>
                <span *ngIf="session.isCurrent" class="text-muted">—</span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center text-muted">No active sessions found</td></tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Revoke Confirmation Dialog -->
      <p-dialog
        header="Revoke Session"
        [(visible)]="showRevokeDialog"
        [modal]="true"
        [style]="{ width: '420px' }"
      >
        <p>Are you sure you want to revoke this session? The device will be logged out immediately.</p>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showRevokeDialog = false">Cancel</button>
            <button pButton class="p-button-danger" (click)="confirmRevoke()">Revoke</button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Revoke All Confirmation Dialog -->
      <p-dialog
        header="Revoke All Other Sessions"
        [(visible)]="showRevokeAllDialog"
        [modal]="true"
        [style]="{ width: '420px' }"
      >
        <p>This will log out all other devices. Only your current session will remain active.</p>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showRevokeAllDialog = false">Cancel</button>
            <button pButton class="p-button-danger" (click)="confirmRevokeAll()">Revoke All</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .sessions-settings {
      max-width: 960px;
    }

    .sessions-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .sessions-header button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .sessions-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px;
    }

    .sessions-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
    }

    .device-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .device-info {
      display: flex;
      flex-direction: column;
    }

    .device-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .device-browser {
      font-size: 12px;
      color: var(--text-muted);
    }

    .text-muted {
      font-size: 13px;
      color: var(--text-muted);
    }

    .text-center {
      text-align: center;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    @media (max-width: 640px) {
      .sessions-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  `],
})
export class SettingsSessionsComponent implements OnInit {
  private notification = inject(NotificationService);

  sessions: Session[] = [];
  showRevokeDialog = false;
  showRevokeAllDialog = false;
  sessionToRevoke: Session | null = null;

  async ngOnInit(): Promise<void> {
    await this.loadSessions();
  }

  private async loadSessions(): Promise<void> {
    try {
      const { data } = await authControllerGetSessions();
      const list = (data as any)?.data ?? data ?? [];
      this.sessions = (Array.isArray(list) ? list : []).map((s: any) => ({
        jti: s.jti ?? s.id ?? s.sessionId,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress ?? s.ip,
        lastActiveAt: s.lastActiveAt ?? s.lastUsedAt,
        location: s.location,
        isCurrent: s.isCurrent ?? s.isCurrentSession ?? false,
        device: s.device,
        browser: s.browser,
        createdAt: s.createdAt,
      }));
    } catch {
      this.notification.error('Failed to load sessions');
    }
  }

  parseDevice(userAgent?: string): string {
    if (!userAgent) return 'Unknown device';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';
    return 'Unknown device';
  }

  parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'Unknown browser';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    return 'Unknown browser';
  }

  getDeviceIcon(session: Session): string {
    const ua = session.userAgent ?? '';
    if (ua.includes('iPhone') || ua.includes('Android')) return 'device-mobile';
    return 'desktop';
  }

  onRevoke(session: Session): void {
    this.sessionToRevoke = session;
    this.showRevokeDialog = true;
  }

  async confirmRevoke(): Promise<void> {
    if (!this.sessionToRevoke) return;
    try {
      await authControllerRevokeSession({
        path: { jti: this.sessionToRevoke.jti },
      } as any);
      this.sessions = this.sessions.filter(s => s.jti !== this.sessionToRevoke!.jti);
      this.notification.success('Session revoked');
    } catch {
      this.notification.error('Failed to revoke session');
    } finally {
      this.showRevokeDialog = false;
      this.sessionToRevoke = null;
    }
  }

  onRevokeAllOthers(): void {
    this.showRevokeAllDialog = true;
  }

  async confirmRevokeAll(): Promise<void> {
    try {
      const others = this.sessions.filter(s => !s.isCurrent);
      await Promise.all(
        others.map(s =>
          authControllerRevokeSession({ path: { jti: s.jti } } as any)
        )
      );
      this.sessions = this.sessions.filter(s => s.isCurrent);
      this.notification.success('All other sessions revoked');
    } catch {
      this.notification.error('Failed to revoke sessions');
    } finally {
      this.showRevokeAllDialog = false;
    }
  }
}
