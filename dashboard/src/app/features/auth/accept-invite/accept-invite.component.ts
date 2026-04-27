import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import '@phosphor-icons/web/index.js';
import { NotificationService } from '../../../core/services/notification.service';
import { invitesControllerPreviewInvite, usersControllerCreateStaff } from '../../../core/api';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputText],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="invite-container">
      <div class="invite-card">
        <!-- Logo -->
        <span class="logo">Invoiz</span>

        <h1 class="heading">You've been invited</h1>

        <!-- Invite Info -->
        <div class="info-card">
          <ph-icon name="user-circle-plus" size="20" weight="duotone"></ph-icon>
          <span>
            <strong>Ahmad Razif</strong> invited you to join
            <strong>TechVentures Sdn Bhd</strong> as <strong>Finance</strong>
          </span>
        </div>

        <!-- Form -->
        <form [formGroup]="inviteForm" (ngSubmit)="onAccept()" class="invite-form">
          <div class="field">
            <label for="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              pInputText
              formControlName="fullName"
              class="full-width"
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
                class="full-width"
              />
              <button
                type="button"
                class="password-toggle"
                (click)="showPassword.set(!showPassword())"
              >
                @if (showPassword()) {
                  <ph-icon name="eye-slash" size="20" weight="regular"></ph-icon>
                } @else {
                  <ph-icon name="eye" size="20" weight="regular"></ph-icon>
                }
              </button>
            </div>
            <!-- Strength Indicator -->
            <div class="strength-bar">
              @for (i of [1,2,3,4]; track i) {
                <div
                  class="strength-segment"
                  [class.active]="passwordStrength() >= i"
                  [ngClass]="{
                    'strength-weak': passwordStrength() >= i && passwordStrength() <= 1,
                    'strength-fair': passwordStrength() >= i && passwordStrength() === 2,
                    'strength-good': passwordStrength() >= i && passwordStrength() === 3,
                    'strength-strong': passwordStrength() >= i && passwordStrength() === 4
                  }"
                ></div>
              }
            </div>
          </div>

          <div class="field">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              [type]="showConfirm() ? 'text' : 'password'"
              pInputText
              formControlName="confirmPassword"
              class="full-width"
            />
          </div>

          <!-- Password Requirements -->
          <ul class="requirements">
            @for (req of requirements; track req.label) {
              <li class="req-item" [class.req-met]="req.met()">
                @if (req.met()) {
                  <ph-icon name="check-circle" size="16" weight="fill" class="req-icon req-icon--green"></ph-icon>
                } @else {
                  <ph-icon name="circle" size="16" weight="regular" class="req-icon req-icon--gray"></ph-icon>
                }
                {{ req.label }}
              </li>
            }
          </ul>

          <button
            type="submit"
            class="submit-btn"
            [disabled]="inviteForm.invalid || isLoading()"
          >
            {{ isLoading() ? 'Creating Account...' : 'Accept &amp; Join' }}
          </button>
        </form>

        <a href="javascript:void(0)" class="decline-link">
          Decline invitation
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .invite-container {
      min-height: 100vh;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .invite-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin-bottom: 24px;
    }

    .heading {
      font-size: 24px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 16px 0;
    }

    .info-card {
      width: 100%;
      background: #eff6ff;
      border-radius: 8px;
      padding: 14px 16px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 14px;
      color: #1e40af;
      text-align: left;
      margin-bottom: 28px;
      box-sizing: border-box;
      line-height: 1.5;
    }

    .info-card ph-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .invite-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: left;
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

    .full-width {
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

    /* Strength Indicator */
    .strength-bar {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }

    .strength-segment {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: #e2e8f0;
      transition: background 0.2s ease;
    }

    .strength-weak { background: #ef4444; }
    .strength-fair { background: #f59e0b; }
    .strength-good { background: #3b82f6; }
    .strength-strong { background: #10b981; }

    /* Requirements */
    .requirements {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .req-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #94a3b8;
      transition: color 0.15s ease;
    }

    .req-item.req-met {
      color: #10b981;
    }

    .req-icon--green {
      color: #10b981;
    }

    .req-icon--gray {
      color: #cbd5e1;
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

    .decline-link {
      margin-top: 20px;
      font-size: 14px;
      color: #ef4444;
      text-decoration: none;
      font-weight: 500;
    }

    .decline-link:hover {
      color: #dc2626;
    }

    @media (max-width: 480px) {
      .invite-card {
        padding: 28px 20px;
      }
    }
  `],
})
export class AcceptInviteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private authStore = inject(AuthStore);
  isLoading = signal(false);
  inviteToken = signal<string>('');
  showPassword = signal(false);
  showConfirm = signal(false);

  inviteForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  private get passwordValue(): string {
    return this.inviteForm?.get('password')?.value ?? '';
  }

  passwordStrength = computed(() => {
    const pw = this.inviteForm.get('password')?.value ?? '';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  });

  requirements = [
    { label: 'At least 8 characters', met: computed(() => this.passwordValue.length >= 8) },
    { label: 'One uppercase letter', met: computed(() => /[A-Z]/.test(this.passwordValue)) },
    { label: 'One lowercase letter', met: computed(() => /[a-z]/.test(this.passwordValue)) },
    { label: 'One number', met: computed(() => /\d/.test(this.passwordValue)) },
    { label: 'One special character', met: computed(() => /[^A-Za-z0-9]/.test(this.passwordValue)) },
  ];

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.notification.error('Invalid Link', 'No invitation token found');
      this.router.navigate(['/login']);
      return;
    }
    this.inviteToken.set(token);
    try {
      const { data } = await invitesControllerPreviewInvite({ query: { token } });
      if (data) {
        const preview = data as any;
        if (preview.email) {
          this.inviteForm.patchValue({ fullName: preview.name ?? '' });
        }
      }
    } catch {
      this.notification.error('Invalid Invite', 'This invitation link is invalid or expired');
    }
  }

  async onAccept(): Promise<void> {
    if (this.inviteForm.invalid) return;
    this.isLoading.set(true);
    try {
      await usersControllerCreateStaff({
        body: {
          password: this.inviteForm.get('password')?.value ?? '',
          name: this.inviteForm.get('fullName')?.value ?? '',
          token: this.inviteToken(),
        },
      });
      this.notification.success('Account Created', 'You can now sign in');
      this.router.navigate(['/login']);
    } catch {
      this.notification.error('Failed', 'Could not create account. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
