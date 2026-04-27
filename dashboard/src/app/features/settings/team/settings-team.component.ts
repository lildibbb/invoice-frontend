import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import '@phosphor-icons/web/index.js';

import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import {
  membershipsControllerGetMembers,
  membershipsControllerRemoveMember,
  membershipsControllerUpdateMembership,
  usersControllerInviteStaff,
} from '../../../core/api';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

interface TeamMember {
  membershipUuid?: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'finance' | 'viewer';
  status: 'active' | 'pending';
  lastActive: string;
  initials: string;
}

@Component({
  selector: 'app-settings-team',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    StatusBadgeComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="team-settings">
      <!-- Header -->
      <div class="team-header">
        <h2 class="team-title">Team Members ({{ members.length }})</h2>
        <button pButton class="p-button-primary p-button-sm" (click)="showInviteDialog = true">
          <ph-icon name="user-plus" size="16" weight="duotone"></ph-icon>
          Invite Member
        </button>
      </div>

      <!-- Table -->
      <div class="invoiz-card">
        <p-table [value]="members" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-member>
            <tr>
              <td>
                <div class="member-cell">
                  <div class="avatar" [style.background]="getAvatarColor(member.role)">
                    {{ member.initials }}
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ member.name }}</span>
                    <span class="member-email">{{ member.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <p-tag
                  [value]="member.role | titlecase"
                  [severity]="getRoleSeverity(member.role)"
                ></p-tag>
              </td>
              <td>
                <app-status-badge [status]="member.status" size="sm"></app-status-badge>
              </td>
              <td class="text-muted">{{ member.lastActive }}</td>
              <td>
                <div class="action-cell" *ngIf="member.role !== 'owner'">
                  <p-select
                    [options]="roleOptions"
                    [ngModel]="member.role"
                    (ngModelChange)="onRoleChange(member, $any($event))"
                    [style]="{ width: '120px' }"
                    size="small"
                  ></p-select>
                  <button
                    pButton
                    class="p-button-danger p-button-text p-button-sm"
                    (click)="onRemove(member)"
                  >
                    Remove
                  </button>
                </div>
                <span *ngIf="member.role === 'owner'" class="text-muted">—</span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Role Descriptions -->
      <div class="role-descriptions invoiz-card">
        <h3 class="role-desc-title">Role Permissions</h3>
        <div class="role-grid">
          <div class="role-item" *ngFor="let role of roleDescriptions">
            <p-tag [value]="role.name" [severity]="role.severity"></p-tag>
            <p class="role-text">{{ role.description }}</p>
          </div>
        </div>
      </div>

      <!-- Invite Dialog -->
      <p-dialog
        header="Invite Team Member"
        [(visible)]="showInviteDialog"
        [modal]="true"
        [style]="{ width: '420px' }"
      >
        <form [formGroup]="inviteForm">
          <div class="dialog-field">
            <label>Email <span class="required">*</span></label>
            <input pInputText formControlName="email" placeholder="colleague@company.com" />
          </div>
          <div class="dialog-field">
            <label>Role</label>
            <p-select
              formControlName="role"
              [options]="inviteRoleOptions"
              [style]="{ width: '100%' }"
            ></p-select>
          </div>
        </form>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showInviteDialog = false">Cancel</button>
            <button pButton class="p-button-primary" (click)="onInvite()">Send Invitation</button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Remove Confirmation Dialog -->
      <p-dialog
        header="Remove Member"
        [(visible)]="showRemoveDialog"
        [modal]="true"
        [style]="{ width: '400px' }"
      >
        <p>Are you sure you want to remove <strong>{{ memberToRemove?.name || memberToRemove?.email }}</strong> from the team?</p>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showRemoveDialog = false">Cancel</button>
            <button pButton class="p-button-danger" (click)="confirmRemove()">Remove</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .team-settings {
      max-width: 960px;
    }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .team-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .team-header button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .member-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }

    .member-info {
      display: flex;
      flex-direction: column;
    }

    .member-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .member-email {
      font-size: 12px;
      color: var(--text-muted);
    }

    .text-muted {
      font-size: 13px;
      color: var(--text-muted);
    }

    .action-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .role-descriptions {
      margin-top: 24px;
      padding: 20px;
    }

    .role-desc-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .role-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .role-text {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .dialog-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;

      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      input, :host ::ng-deep .p-select {
        width: 100%;
      }
    }

    .required {
      color: var(--status-overdue);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    @media (max-width: 640px) {
      .role-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class SettingsTeamComponent implements OnInit {
  private authStore = inject(AuthStore);
  private notification = inject(NotificationService);
  private companyUuid: string | null = null;
  loading = false;

  showInviteDialog = false;
  showRemoveDialog = false;
  memberToRemove: TeamMember | null = null;

  inviteForm: FormGroup;

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Finance', value: 'finance' },
    { label: 'Viewer', value: 'viewer' },
  ];

  inviteRoleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Finance', value: 'finance' },
    { label: 'Viewer', value: 'viewer' },
  ];

  roleDescriptions = [
    { name: 'Owner', severity: 'contrast' as const, description: 'Full access, billing management, cannot be removed.' },
    { name: 'Admin', severity: 'info' as const, description: 'Manage invoices, customers, team. No billing access.' },
    { name: 'Finance', severity: 'success' as const, description: 'Create/edit invoices, record payments, view reports.' },
    { name: 'Viewer', severity: 'secondary' as const, description: 'Read-only access to invoices and reports.' },
  ];

  members: TeamMember[] = [];

  constructor(private fb: FormBuilder) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['viewer'],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadMembers();
  }

  private async loadMembers(): Promise<void> {
    try {
      const context = this.authStore.context();
      if (!context?.company?.uuid) return;
      this.companyUuid = context.company.uuid;
      const { data: membersData } = await membershipsControllerGetMembers({
        path: { companyUuid: this.companyUuid },
      });
      const list = (membersData as any)?.data ?? membersData ?? [];
      this.members = (Array.isArray(list) ? list : []).map((m: any) => {
        const name = m.user?.name || m.user?.email || m.email || '';
        const email = m.user?.email || m.email || '';
        return {
          membershipUuid: m.uuid ?? m.id,
          name,
          email,
          role: (m.role || 'viewer').toLowerCase() as TeamMember['role'],
          status: m.status === 'PENDING' || m.status === 'pending' ? 'pending' : 'active',
          lastActive: m.lastActiveAt ?? '—',
          initials: (name || email).substring(0, 2).toUpperCase(),
        } as TeamMember;
      });
    } catch {
      this.notification.error('Failed to load team members');
    }
  }

  getRoleSeverity(role: string): 'contrast' | 'info' | 'success' | 'secondary' {
    const map: Record<string, 'contrast' | 'info' | 'success' | 'secondary'> = {
      owner: 'contrast',
      admin: 'info',
      finance: 'success',
      viewer: 'secondary',
    };
    return map[role] ?? 'secondary';
  }

  getAvatarColor(role: string): string {
    const map: Record<string, string> = {
      owner: '#8b5cf6',
      admin: '#3b82f6',
      finance: '#10b981',
      viewer: '#64748b',
    };
    return map[role] ?? '#64748b';
  }

  async onRoleChange(member: TeamMember, newRole: string): Promise<void> {
    if (!member.membershipUuid) return;
    try {
      await membershipsControllerUpdateMembership({
        path: { membershipUuid: member.membershipUuid },
        body: { role: newRole.toUpperCase() },
        headers: { 'Content-Type': 'application/json' },
      } as any);
      member.role = newRole as TeamMember['role'];
      this.notification.success('Role updated');
    } catch {
      this.notification.error('Failed to update role');
    }
  }

  onRemove(member: TeamMember): void {
    this.memberToRemove = member;
    this.showRemoveDialog = true;
  }

  async confirmRemove(): Promise<void> {
    if (!this.memberToRemove?.membershipUuid) return;
    try {
      await membershipsControllerRemoveMember({
        path: { membershipUuid: this.memberToRemove.membershipUuid },
      });
      this.members = this.members.filter(m => m.email !== this.memberToRemove!.email);
      this.notification.success('Member removed');
    } catch {
      this.notification.error('Failed to remove member');
    } finally {
      this.showRemoveDialog = false;
      this.memberToRemove = null;
    }
  }

  async onInvite(): Promise<void> {
    if (!this.inviteForm.valid) return;
    const { email, role } = this.inviteForm.value;
    try {
      await usersControllerInviteStaff({
        body: { email } as any,
      });
      this.members.push({
        name: email,
        email,
        role,
        status: 'pending',
        lastActive: '—',
        initials: email.substring(0, 2).toUpperCase(),
      });
      this.showInviteDialog = false;
      this.inviteForm.reset({ role: 'viewer' });
      this.notification.success('Invitation sent', email);
    } catch {
      this.notification.error('Failed to send invitation');
    }
  }
}
