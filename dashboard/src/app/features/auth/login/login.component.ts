import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { AuthStore, type CompanyContext } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { authControllerLogin } from '../../../core/api';
import '@phosphor-icons/web/index.js';

interface CompanyOption {
  id: number;
  name: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputText, Checkbox, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="login-container">
      <!-- Left Panel -->
      <div class="left-panel">
        <div class="left-header">
          <span class="logo">Invoiz</span>
          <span class="tagline">Enterprise e-Invoicing</span>
        </div>

        <div class="left-content">
          <blockquote class="testimonial">
            <p class="quote">
              &ldquo;Invoiz transformed our invoicing workflow. LHDN submissions
              that used to take hours now happen in seconds.&rdquo;
            </p>
            <cite class="attribution">&mdash; Ahmad Razif, CFO at TechVentures Sdn Bhd</cite>
          </blockquote>
        </div>

        <div class="trust-badges">
          <div class="badge">
            <ph-icon name="shield-check" size="18" weight="regular"></ph-icon>
            <span>LHDN Certified</span>
          </div>
          <div class="badge">
            <ph-icon name="lock" size="18" weight="regular"></ph-icon>
            <span>256-bit Encryption</span>
          </div>
          <div class="badge">
            <ph-icon name="certificate" size="18" weight="regular"></ph-icon>
            <span>SOC 2 Compliant</span>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <div class="form-wrapper">
          @if (showCompanyPicker()) {
            <!-- Company Selection Step -->
            <div class="company-picker">
              <h1 class="form-title">Select Company</h1>
              <p class="form-subtitle">You belong to multiple organizations. Choose one to continue.</p>

              <div class="company-list">
                @for (company of companies(); track company.id) {
                  <button
                    type="button"
                    class="company-card"
                    [class.disabled]="company.status === 'SUSPENDED'"
                    [disabled]="company.status === 'SUSPENDED' || isLoading()"
                    (click)="selectCompany(company)"
                  >
                    <div class="company-avatar">
                      {{ company.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="company-info">
                      <span class="company-name">{{ company.name }}</span>
                      <span class="company-role">{{ company.role }}</span>
                    </div>
                    @if (company.status === 'SUSPENDED') {
                      <span class="company-badge suspended">Suspended</span>
                    } @else {
                      <ph-icon name="caret-right" size="20" weight="bold" class="company-arrow"></ph-icon>
                    }
                  </button>
                }
              </div>

              <button type="button" class="back-link" (click)="backToLogin()">
                <ph-icon name="arrow-left" size="16" weight="regular"></ph-icon>
                Back to sign in
              </button>
            </div>
          } @else {
            <!-- Login Form -->
            <h1 class="form-title">Welcome back</h1>
            <p class="form-subtitle">Sign in to your account</p>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <div class="field">
                <label for="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  pInputText
                  formControlName="email"
                  placeholder="name&#64;company.com"
                />
              </div>

              <div class="field">
                <label for="password">Password</label>
                <div class="password-wrapper">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    pInputText
                    formControlName="password"
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    (click)="togglePassword()"
                    aria-label="Toggle password visibility"
                  >
                    @if (showPassword()) {
                      <ph-icon name="eye-slash" size="20" weight="regular"></ph-icon>
                    } @else {
                      <ph-icon name="eye" size="20" weight="regular"></ph-icon>
                    }
                  </button>
                </div>
              </div>

              <div class="remember-row">
                <div class="remember-check">
                  <p-checkbox
                    formControlName="rememberMe"
                    [binary]="true"
                    inputId="rememberMe"
                  />
                  <label for="rememberMe">Remember me</label>
                </div>
                <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
              </div>

              @if (errorMessage()) {
                <div class="error-message">
                  {{ errorMessage() }}
                </div>
              }

              <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || isLoading()">
                {{ isLoading() ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>

            <div class="divider">
              <span>or</span>
            </div>

            <button type="button" class="google-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <p class="signup-text">
              Don&rsquo;t have an account?
              <a href="javascript:void(0)" class="trial-link">Start free trial</a>
            </p>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .login-container {
      display: flex;
      min-height: 100vh;
    }

    /* ── Left Panel ── */
    .left-panel {
      width: 45%;
      background: #0f172a;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px;
      overflow: hidden;
    }

    .left-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
      pointer-events: none;
    }

    .left-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
    }

    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.025em;
    }

    .tagline {
      font-size: 14px;
      color: #94a3b8;
    }

    .left-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .testimonial {
      margin: 0;
      max-width: 400px;
    }

    .quote {
      font-size: 18px;
      font-style: italic;
      color: #cbd5e1;
      line-height: 1.7;
      margin: 0 0 16px 0;
    }

    .attribution {
      font-size: 14px;
      font-style: normal;
      color: #64748b;
    }

    .trust-badges {
      display: flex;
      gap: 32px;
      position: relative;
    }

    .badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #64748b;
    }

    /* ── Right Panel ── */
    .right-panel {
      width: 55%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .form-title {
      font-size: 24px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .form-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 32px 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field label {
      font-size: 14px;
      font-weight: 500;
      color: #334155;
    }

    .field input {
      width: 100%;
      box-sizing: border-box;
    }

    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-wrapper input {
      padding-right: 44px;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .password-toggle:hover {
      color: #64748b;
    }

    .remember-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .remember-check {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .remember-check label {
      font-size: 14px;
      color: #334155;
      cursor: pointer;
    }

    .forgot-link {
      font-size: 14px;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-link:hover {
      color: #2563eb;
    }

    .error-message {
      color: #dc2626;
      font-size: 13px;
      padding: 10px 14px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
    }

    .submit-btn {
      width: 100%;
      height: 44px;
      background: #3b82f6;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .submit-btn:hover {
      background: #2563eb;
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 24px 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .divider span {
      font-size: 13px;
      color: #94a3b8;
    }

    .google-btn {
      width: 100%;
      height: 44px;
      background: #ffffff;
      color: #334155;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: background 0.15s ease;
    }

    .google-btn:hover {
      background: #f8fafc;
    }

    .signup-text {
      text-align: center;
      font-size: 14px;
      color: #64748b;
      margin: 24px 0 0 0;
    }

    .trial-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .trial-link:hover {
      color: #2563eb;
    }

    /* ── Company Picker ── */
    .company-picker {
      animation: fadeIn 0.2s ease;
    }

    .company-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .company-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
      width: 100%;
    }

    .company-card:hover:not(.disabled) {
      border-color: #3b82f6;
      background: #f8fafc;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .company-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .company-avatar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }

    .company-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .company-name {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }

    .company-role {
      font-size: 13px;
      color: #64748b;
      text-transform: capitalize;
    }

    .company-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .company-badge.suspended {
      background: #fef2f2;
      color: #dc2626;
    }

    .company-arrow {
      color: #94a3b8;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      padding: 0;
      font-size: 14px;
      color: #64748b;
      cursor: pointer;
    }

    .back-link:hover {
      color: #334155;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Mobile ── */
    @media (max-width: 767px) {
      .login-container {
        flex-direction: column;
      }

      .left-panel {
        width: 100%;
        height: 80px;
        padding: 0 24px;
        flex-direction: row;
        align-items: center;
      }

      .left-content,
      .trust-badges {
        display: none;
      }

      .left-header {
        flex-direction: row;
        align-items: center;
        gap: 12px;
      }

      .right-panel {
        width: 100%;
        flex: 1;
        padding: 32px 24px;
      }
    }
  `],
})
export class LoginComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private notification = inject(NotificationService);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showCompanyPicker = signal(false);
  companies = signal<CompanyOption[]>([]);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  backToLogin(): void {
    this.showCompanyPicker.set(false);
    this.companies.set([]);
    this.errorMessage.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await authControllerLogin({
        body: { email: email!, password: password! },
      });

      if (error) {
        const err = error as any;
        // Handle 409 — multi-company login
        if (err?.statusCode === 409 || err?.error === 'AmbiguousLogin' || err?.companies) {
          this.companies.set(err.companies ?? []);
          this.showCompanyPicker.set(true);
          this.isLoading.set(false);
          return;
        }
        this.errorMessage.set(err?.message || 'Invalid email or password');
        this.isLoading.set(false);
        return;
      }

      this.handleLoginSuccess(data as any);
    } catch (e: any) {
      // The SDK may throw on non-2xx. Check for multi-company 409 in thrown error.
      const body = e?.body ?? e?.data ?? e;
      if (body?.companies || body?.error === 'AmbiguousLogin') {
        this.companies.set(body.companies ?? []);
        this.showCompanyPicker.set(true);
        this.isLoading.set(false);
        return;
      }
      this.errorMessage.set(body?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async selectCompany(company: CompanyOption): Promise<void> {
    if (company.status === 'SUSPENDED') return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await authControllerLogin({
        body: { email: email!, password: password!, companyId: company.id },
      });

      if (error) {
        this.errorMessage.set((error as any)?.message || 'Failed to sign in to this company');
        this.isLoading.set(false);
        return;
      }

      this.handleLoginSuccess(data as any);
    } catch {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private handleLoginSuccess(response: any): void {
    // Backend wraps in successResponse({ data, message })
    const payload = response?.data ?? response;

    const accessToken = payload?.access_token;
    const user = payload?.user;
    const context = payload?.context;

    if (!accessToken || !user) {
      this.errorMessage.set('Invalid response from server');
      return;
    }

    this.authStore.setAuth(
      accessToken,
      {
        uuid: user.uuid,
        email: user.email,
        name: user.name ?? user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified ?? false,
      },
      context ? {
        membershipId: context.membershipId,
        role: context.role,
        company: {
          uuid: context.company?.uuid ?? '',
          name: context.company?.name ?? '',
          code: context.company?.code ?? '',
          isActive: context.company?.isActive ?? true,
        },
      } : null,
    );

    // Handle pending invitations
    if (payload?.pendingInvitation?.redirectTo) {
      this.router.navigate([payload.pendingInvitation.redirectTo], {
        queryParams: { token: payload.pendingInvitation.token },
      });
      return;
    }

    this.notification.success('Welcome back!', `Signed in as ${user.email}`);
    this.router.navigate(['/app/dashboard']);
  }
}
