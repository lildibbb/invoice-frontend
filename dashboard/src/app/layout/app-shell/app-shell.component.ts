import { Component, computed, inject, signal, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthStore } from '../../core/auth/auth.store';
import { NAV_GROUPS, SUPERADMIN_NAV_ITEMS, NavGroup, NavItem } from './nav-items';
import { NotificationService } from '../../core/services/notification.service';
import { authControllerLogout, companiesControllerGetMyCompanies, authControllerSwitchCompany, membershipsControllerGetMyMembership } from '../../core/api';
import '@phosphor-icons/web/index.js';

@Component({
  selector: 'app-shell',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile backdrop -->
    @if (mobileOpen()) {
      <div class="backdrop" (click)="mobileOpen.set(false)"></div>
    }

    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar"
             [class.collapsed]="collapsed()"
             [class.mobile-open]="mobileOpen()">

        <!-- Logo -->
        <div class="sidebar-header">
          <span class="logo-full">Invoiz</span>
          <span class="logo-collapsed">I</span>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (group of navGroups; track group.label) {
            <div class="nav-group">
              <span class="group-label">{{ group.label }}</span>
              @for (item of group.items; track item.route) {
                <a class="nav-link"
                   [routerLink]="item.route"
                   routerLinkActive="active-link"
                   (click)="mobileOpen.set(false)">
                  <span class="nav-icon" [innerHTML]="getIconHtml(item.icon)"></span>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              }
            </div>
          }

          <!-- SuperAdmin section -->
          @if (isSuperAdmin()) {
            <div class="nav-group superadmin-group">
              <span class="group-label">Platform Admin</span>
              @for (item of superAdminItems; track item.route) {
                <a class="nav-link"
                   [routerLink]="item.route"
                   routerLinkActive="active-link"
                   (click)="mobileOpen.set(false)">
                  <span class="nav-icon" [innerHTML]="getIconHtml(item.icon)"></span>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              }
            </div>
          }
        </nav>

        <!-- Footer: user + collapse toggle -->
        <div class="sidebar-footer">
          <div class="user-section">
            <div class="avatar">{{ userInitials() }}</div>
            <div class="user-info">
              <div class="user-name">{{ userDisplayName() }}</div>
              <button class="logout-btn" (click)="logout()">
                <span [innerHTML]="getIconHtml('sign-out', 16)"></span>
                Logout
              </button>
            </div>
          </div>
          <button class="collapse-toggle" (click)="toggleCollapse()">
            <span [innerHTML]="collapseIcon()"></span>
          </button>
        </div>
      </aside>

      <!-- Main wrapper -->
      <div class="main-wrapper">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <button class="hamburger topbar-btn" (click)="mobileOpen.set(true)">
              <span [innerHTML]="getIconHtml('list', 24)"></span>
            </button>
            <span class="page-title"><!-- breadcrumb / page title area --></span>
          </div>
          <div class="topbar-right">
            <button class="topbar-btn">
              <span [innerHTML]="getIconHtml('bell', 22)"></span>
            </button>
            <div class="avatar avatar-sm topbar-avatar">{{ userInitials() }}</div>
          </div>
        </header>

        <!-- Content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .shell {
      display: flex;
      height: 100%;
      overflow: hidden;
    }

    /* ---- Sidebar ---- */
    .sidebar {
      width: 240px;
      background: #0F172A;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100vh;
      overflow: hidden;
      transition: width 0.2s ease;
      z-index: 50;
    }
    .sidebar.collapsed { width: 64px; }

    .sidebar-header {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(148,163,184,0.1);
    }
    .logo-full {
      font-size: 22px;
      font-weight: 700;
      color: #3B82F6;
      white-space: nowrap;
    }
    .logo-collapsed {
      display: none;
      font-size: 22px;
      font-weight: 700;
      color: #3B82F6;
    }
    .sidebar.collapsed .logo-full { display: none; }
    .sidebar.collapsed .logo-collapsed { display: block; }
    .sidebar.collapsed .sidebar-header { justify-content: center; padding: 0; }

    /* ---- Navigation ---- */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 12px 8px;
    }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(148,163,184,0.2);
      border-radius: 2px;
    }

    .nav-group { margin-bottom: 20px; }

    .group-label {
      display: block;
      font-size: 11px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0 12px;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
    }
    .sidebar.collapsed .group-label { display: none; }
    .sidebar.collapsed .nav-group { margin-bottom: 8px; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      text-decoration: none;
      color: #94A3B8;
      font-size: 14px;
      font-weight: 500;
      border-left: 3px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
    }
    .nav-link:hover { background: rgba(148,163,184,0.08); }
    .nav-link.active-link {
      border-left-color: #3B82F6;
      background: rgba(59,130,246,0.12);
      color: #FFFFFF;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .nav-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 10px 0;
      border-left: none;
      border-radius: 8px;
      gap: 0;
    }
    .sidebar.collapsed .nav-link.active-link {
      border-left: none;
      background: rgba(59,130,246,0.12);
    }
    .sidebar.collapsed .nav-label { display: none; }

    .superadmin-group {
      border-top: 1px solid rgba(148,163,184,0.1);
      padding-top: 12px;
      margin-top: 8px;
    }

    /* ---- Sidebar footer ---- */
    .sidebar-footer {
      border-top: 1px solid rgba(148,163,184,0.1);
      padding: 12px;
      flex-shrink: 0;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #3B82F6;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .avatar-sm { width: 30px; height: 30px; font-size: 12px; }

    .user-info { overflow: hidden; min-width: 0; }
    .user-name {
      font-size: 13px;
      color: #CBD5E1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #94A3B8;
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 0 0;
      transition: color 0.15s ease;
    }
    .logout-btn:hover { color: #EF4444; }

    .sidebar.collapsed .user-info { display: none; }
    .sidebar.collapsed .user-section { justify-content: center; }
    .sidebar.collapsed .sidebar-footer { padding: 8px; }

    .collapse-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 6px;
      border: none;
      border-radius: 6px;
      background: none;
      color: #64748B;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .collapse-toggle:hover { background: rgba(148,163,184,0.08); color: #94A3B8; }

    /* ---- Main area ---- */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .topbar {
      height: 64px;
      background: #FFFFFF;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
    }
    .topbar-left, .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: #0F172A;
    }

    .topbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      background: none;
      color: #64748B;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .topbar-btn:hover { background: #F1F5F9; color: #0F172A; }

    .topbar-avatar { background: #3B82F6; cursor: pointer; }

    .content {
      flex: 1;
      overflow-y: auto;
      background: #F8FAFC;
    }

    /* ---- Mobile ---- */
    .backdrop { display: none; }
    .hamburger { display: none; }

    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 240px !important;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }
      .sidebar.mobile-open { transform: translateX(0); }
      .sidebar.collapsed { width: 240px !important; }

      .backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 40;
      }
      .hamburger { display: flex; }
      .collapse-toggle { display: none; }

      /* Reset collapsed overrides on mobile */
      .sidebar.collapsed .logo-full { display: block; }
      .sidebar.collapsed .logo-collapsed { display: none; }
      .sidebar.collapsed .group-label { display: block; }
      .sidebar.collapsed .nav-label { display: block; }
      .sidebar.collapsed .nav-link {
        justify-content: flex-start;
        padding: 8px 12px;
        border-left: 3px solid transparent;
        border-radius: 6px;
        gap: 10px;
      }
      .sidebar.collapsed .nav-link.active-link {
        border-left-color: #3B82F6;
      }
      .sidebar.collapsed .user-info { display: block; }
      .sidebar.collapsed .user-section { justify-content: flex-start; }
      .sidebar.collapsed .sidebar-footer { padding: 12px; }
    }
  `],
})
export class AppShellComponent implements OnInit {
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private notification = inject(NotificationService);
  companies = signal<any[]>([]);
  currentCompany = signal<any>(null);

  navGroups: NavGroup[] = NAV_GROUPS;
  superAdminItems: NavItem[] = SUPERADMIN_NAV_ITEMS;

  collapsed = signal(false);
  mobileOpen = signal(false);

  isSuperAdmin = computed(() => this.authStore.user()?.role === 'super_admin');

  userInitials = computed(() => {
    const email = this.authStore.user()?.email ?? '';
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return local.substring(0, 2).toUpperCase();
  });

  userDisplayName = computed(() => {
    const user = this.authStore.user();
    return user?.name ?? user?.email?.split('@')[0] ?? '';
  });

  collapseIcon = computed(() =>
    this.getIconHtml(this.collapsed() ? 'caret-double-right' : 'caret-double-left', 18),
  );

  getIconHtml(icon: string, size = 20): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      `<ph-${icon} weight="duotone" size="${size}"></ph-${icon}>`,
    );
  }

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }

  async ngOnInit(): Promise<void> {
    // Set current company from auth context (already stored from login)
    const context = this.authStore.context();
    if (context?.company) {
      this.currentCompany.set(context.company as any);
    }

    try {
      const { data } = await companiesControllerGetMyCompanies();
      const response = data as any;
      const companiesList = response?.data ?? response ?? [];
      if (Array.isArray(companiesList)) {
        this.companies.set(companiesList);
        // Update current company from full list if we have context
        if (context?.company?.uuid) {
          const current = companiesList.find((c: any) => c.uuid === context.company.uuid);
          if (current) this.currentCompany.set(current);
        }
      }
    } catch {
      // Silently fail — company context from login is sufficient
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authStore.isLoggedIn()) {
        await authControllerLogout();
      }
    } catch {
      // Continue with local logout even if API call fails
    }
    this.authStore.clearAuth();
    this.router.navigate(['/login']);
  }

  async switchCompany(companyId: number): Promise<void> {
    try {
      const { data } = await authControllerSwitchCompany({ body: { companyId } });
      const response = data as any;
      const payload = response?.data ?? response;

      if (payload?.access_token) {
        this.authStore.setAccessToken(payload.access_token);
        if (payload.context) {
          this.authStore.setContext(payload.context);
        }
        const company = this.companies().find((c: any) => c.id === companyId);
        if (company) this.currentCompany.set(company);
        this.notification.success('Company switched', `Now viewing ${company?.name || 'company'}`);
        window.location.reload();
      }
    } catch {
      this.notification.error('Switch failed', 'Could not switch company');
    }
  }
}
