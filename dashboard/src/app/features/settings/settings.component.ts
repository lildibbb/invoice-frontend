import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import '@phosphor-icons/web/index.js';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <!-- Mobile: horizontal tab bar -->
      <nav class="settings-tabs-mobile">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.route"
          routerLinkActive="tab-active"
          class="tab-item"
        >
          <ph-icon [attr.name]="item.icon" size="18" weight="duotone"></ph-icon>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <div class="settings-layout">
        <!-- Left nav panel -->
        <nav class="settings-nav invoiz-card">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="nav-active"
            class="nav-item"
          >
            <ph-icon [attr.name]="item.icon" size="20" weight="duotone"></ph-icon>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <!-- Right content -->
        <div class="settings-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-layout {
      display: flex;
      gap: 24px;
    }

    .settings-nav {
      width: 220px;
      flex-shrink: 0;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      height: fit-content;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #475569;
      text-decoration: none;
      border-left: 3px solid transparent;
      transition: all 0.15s ease;

      &:hover {
        background: #f1f5f9;
      }
    }

    .nav-active {
      color: #3b82f6;
      background: #eff6ff;
      border-left-color: #3b82f6;
    }

    .settings-content {
      flex: 1;
      min-width: 0;
    }

    .settings-tabs-mobile {
      display: none;
    }

    @media (max-width: 768px) {
      .settings-nav {
        display: none;
      }

      .settings-tabs-mobile {
        display: flex;
        overflow-x: auto;
        gap: 4px;
        margin-bottom: 16px;
        padding-bottom: 4px;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .tab-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #475569;
        text-decoration: none;
        white-space: nowrap;
        background: var(--card-bg);
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        border: none;
        transition: all 0.15s ease;
      }

      .tab-active {
        color: #3b82f6;
        background: #eff6ff;
        box-shadow: 0 0 0 2px rgba(59,130,246,0.3);
      }

      .settings-layout {
        flex-direction: column;
      }
    }
  `],
})
export class SettingsComponent {
  navItems = [
    { label: 'Company Profile', icon: 'buildings', route: '/app/settings/company' },
    { label: 'LHDN Configuration', icon: 'plugs-connected', route: '/app/settings/lhdn' },
    { label: 'Team Members', icon: 'users-three', route: '/app/settings/team' },
    { label: 'Billing', icon: 'credit-card', route: '/app/settings/billing' },
    { label: 'Invoice Templates', icon: 'file-text', route: '/app/settings/templates' },
    { label: 'Tax Management', icon: 'receipt', route: '/app/settings/tax' },
    { label: 'Sessions', icon: 'devices', route: '/app/settings/sessions' },
  ];
}
