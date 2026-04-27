import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PageHeaderComponent, StatusBadgeComponent } from '../../../shared';
import '@phosphor-icons/web/index.js';
import {
  superadminUsersControllerFindAll,
  superadminUsersControllerDelete,
  superadminUsersControllerRestore,
  superadminUsersControllerInviteAdmin,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

interface PlatformUser {
  uuid: string;
  name: string;
  email: string;
  role: string;
  status: string;
  company: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="page-container">
      <app-page-header title="Users" subtitle="Platform User Management">
        <button actions pButton class="p-button-primary" (click)="showInviteDialog = true">
          <ph-icon name="user-plus" size="18" weight="duotone"></ph-icon>
          Invite Admin
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-chip">
          <span class="stat-chip__label">Total</span>
          <span class="stat-chip__value">{{ users().length }}</span>
        </div>
        <div class="stat-chip stat-chip--green">
          <span class="stat-chip__label">Active</span>
          <span class="stat-chip__value">{{ activeCount }}</span>
        </div>
        <div class="stat-chip stat-chip--amber">
          <span class="stat-chip__label">Suspended</span>
          <span class="stat-chip__value">{{ suspendedCount }}</span>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="filter-bar invoiz-card">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Search users..."
            [(ngModel)]="searchQuery"
            class="filter-input"
          />
        </p-iconfield>
      </div>

      <!-- Table -->
      <div class="invoiz-card table-card">
        <p-table
          [value]="filteredUsers()"
          [rows]="15"
          [paginator]="true"
          [rowHover]="true"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
          [loading]="loading"
        >
          <ng-template #header>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Company</th>
              <th>Joined</th>
              <th style="width: 160px">Actions</th>
            </tr>
          </ng-template>
          <ng-template #body let-user>
            <tr>
              <td>
                <div class="user-name-cell">
                  <span class="user-avatar" [style.background]="getAvatarColor(user.name)">
                    {{ getInitials(user.name) }}
                  </span>
                  <span class="font-medium">{{ user.name }}</span>
                </div>
              </td>
              <td class="text-muted">{{ user.email }}</td>
              <td>
                <p-tag
                  [value]="user.role | titlecase"
                  [severity]="getRoleSeverity(user.role)"
                />
              </td>
              <td>
                <app-status-badge [status]="user.status" size="sm" />
              </td>
              <td>{{ user.company }}</td>
              <td class="text-muted">{{ user.createdAt }}</td>
              <td>
                <div class="actions-cell">
                  @if (user.status === 'active') {
                    <button
                      pButton
                      class="p-button-text p-button-sm p-button-warning"
                      (click)="suspendUser(user)"
                      title="Suspend"
                    >
                      <ph-icon name="prohibit" size="16" weight="regular"></ph-icon>
                    </button>
                  }
                  @if (user.status === 'suspended' || user.status === 'deleted') {
                    <button
                      pButton
                      class="p-button-text p-button-sm p-button-success"
                      (click)="restoreUser(user)"
                      title="Restore"
                    >
                      <ph-icon name="arrow-counter-clockwise" size="16" weight="regular"></ph-icon>
                    </button>
                  }
                  @if (user.status !== 'deleted') {
                    <button
                      pButton
                      class="p-button-text p-button-sm p-button-danger"
                      (click)="deleteUser(user)"
                      title="Delete"
                    >
                      <ph-icon name="trash" size="16" weight="regular"></ph-icon>
                    </button>
                  }
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center text-muted" style="padding: 40px 0">
                No users found.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Invite Admin Dialog -->
      <p-dialog
        header="Invite Admin"
        [(visible)]="showInviteDialog"
        [modal]="true"
        [style]="{ width: '420px' }"
      >
        <div class="flex flex-col gap-4 py-2">
          <div class="field">
            <label style="font-size: 13px; font-weight: 500; color: var(--text-secondary)">Email</label>
            <input pInputText [(ngModel)]="inviteEmail" placeholder="admin@example.com" style="width: 100%" />
          </div>
          <div class="field">
            <label style="font-size: 13px; font-weight: 500; color: var(--text-secondary)">Name</label>
            <input pInputText [(ngModel)]="inviteName" placeholder="Full name" style="width: 100%" />
          </div>
        </div>
        <ng-template #footer>
          <div class="flex justify-end gap-2">
            <button pButton class="p-button-text" (click)="showInviteDialog = false">Cancel</button>
            <button pButton class="p-button-primary" (click)="inviteAdmin()" [loading]="inviting">Invite</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }

    .stats-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .stat-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      background: var(--surface-card);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }

    .stat-chip--green { border-left: 3px solid var(--status-paid, #22c55e); }
    .stat-chip--amber { border-left: 3px solid var(--status-pending, #f59e0b); }

    .stat-chip__label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .stat-chip__value {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .filter-input {
      min-width: 240px;
    }

    .table-card {
      overflow: hidden;
    }

    .user-name-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .text-muted {
      color: var(--text-secondary);
      font-size: 13px;
    }

    .text-center {
      text-align: center;
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
  `],
})
export class UserListComponent implements OnInit {
  private readonly notification = inject(NotificationService);

  loading = false;
  searchQuery = '';
  showInviteDialog = false;
  inviteEmail = '';
  inviteName = '';
  inviting = false;

  users = signal<PlatformUser[]>([]);

  filteredUsers = signal<PlatformUser[]>([]);

  get activeCount(): number {
    return this.users().filter(u => u.status === 'active').length;
  }

  get suspendedCount(): number {
    return this.users().filter(u => u.status === 'suspended' || u.status === 'deleted').length;
  }

  private readonly avatarColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading = true;
    try {
      const { data } = await superadminUsersControllerFindAll({
        query: { page: 1, limit: 100 },
      } as any);
      const list = (data as any)?.data ?? data ?? [];
      const mapped = list.map((u: any) => ({
        uuid: u.uuid ?? u.id ?? '',
        name: u.name ?? (`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email),
        email: u.email ?? '',
        role: u.role ?? u.roleName ?? 'user',
        status: u.deletedAt ? 'deleted' : (u.isActive === false ? 'suspended' : (u.status ?? 'active')),
        company: u.companyName ?? u.company ?? '',
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      }));
      this.users.set(mapped);
      this.filteredUsers.set(mapped);
    } catch {
      this.notification.error('Failed to load users');
    } finally {
      this.loading = false;
    }
  }

  async suspendUser(user: PlatformUser): Promise<void> {
    try {
      await superadminUsersControllerDelete({ path: { uuid: user.uuid } } as any);
      this.notification.success('User suspended');
      await this.loadUsers();
    } catch {
      this.notification.error('Failed to suspend user');
    }
  }

  async restoreUser(user: PlatformUser): Promise<void> {
    try {
      await superadminUsersControllerRestore({ path: { uuid: user.uuid } } as any);
      this.notification.success('User restored');
      await this.loadUsers();
    } catch {
      this.notification.error('Failed to restore user');
    }
  }

  async deleteUser(user: PlatformUser): Promise<void> {
    try {
      await superadminUsersControllerDelete({ path: { uuid: user.uuid } } as any);
      this.notification.success('User deleted');
      await this.loadUsers();
    } catch {
      this.notification.error('Failed to delete user');
    }
  }

  async inviteAdmin(): Promise<void> {
    if (!this.inviteEmail) return;
    this.inviting = true;
    try {
      await superadminUsersControllerInviteAdmin({
        body: { email: this.inviteEmail, name: this.inviteName },
      } as any);
      this.notification.success('Admin invited');
      this.showInviteDialog = false;
      this.inviteEmail = '';
      this.inviteName = '';
      await this.loadUsers();
    } catch {
      this.notification.error('Failed to invite admin');
    } finally {
      this.inviting = false;
    }
  }

  getRoleSeverity(role: string): 'info' | 'warn' | 'danger' | 'contrast' | 'secondary' | undefined {
    const map: Record<string, 'info' | 'warn' | 'danger' | 'contrast'> = {
      superadmin: 'danger',
      admin: 'warn',
      owner: 'contrast',
      user: 'info',
      staff: 'info',
    };
    return map[role?.toLowerCase()] ?? 'secondary';
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}
