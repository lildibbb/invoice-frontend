import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import '@phosphor-icons/web/index.js';
import { NotificationService } from '../../../core/services/notification.service';
import { authControllerForgotPassword } from '../../../core/api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, InputText],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="forgot-container">
      <div class="forgot-card">
        @if (!submitted()) {
          <!-- Form State -->
          <div class="icon-circle">
            <ph-key weight="duotone" size="48"></ph-key>
          </div>
          <h1 class="heading">Reset your password</h1>
          <p class="subtitle">Enter your email and we'll send you a reset link</p>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
            <div class="field">
              <input
                type="email"
                pInputText
                formControlName="email"
                placeholder="name&#64;company.com"
                class="email-input"
              />
            </div>
            <button type="submit" class="submit-btn" [disabled]="forgotForm.invalid || isLoading()">
              {{ isLoading() ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </form>

          <a routerLink="/login" class="back-link">
            <ph-icon name="arrow-left" size="14" weight="regular"></ph-icon>
            Back to login
          </a>
        } @else {
          <!-- Success State -->
          <div class="icon-circle icon-circle--success">
            <ph-icon name="check" size="48" weight="duotone"></ph-icon>
          </div>
          <h1 class="heading">Check your email</h1>
          <p class="subtitle">
            We've sent a password reset link to
            <strong>{{ forgotForm.value.email }}</strong>
          </p>
          <p class="resend-text">
            Didn't receive the email?
            <a href="javascript:void(0)" class="resend-link" (click)="onResend()">Resend</a>
          </p>
          <a routerLink="/login" class="back-link">
            <ph-icon name="arrow-left" size="14" weight="regular"></ph-icon>
            Back to login
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .forgot-container {
      min-height: 100vh;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .forgot-card {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .icon-circle {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: #eff6ff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      margin-bottom: 24px;

      &--success {
        background: #ecfdf5;
        color: #10b981;
      }
    }

    .heading {
      font-size: 24px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }

    .forgot-form {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field {
      width: 100%;
    }

    .email-input {
      width: 100%;
      box-sizing: border-box;
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

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 24px;
      font-size: 14px;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .back-link:hover {
      color: #2563eb;
    }

    .resend-text {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .resend-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
    }

    .resend-link:hover {
      color: #2563eb;
    }
  `],
})
export class ForgotPasswordComponent {
  private notification = inject(NotificationService);
  submitted = signal(false);
  isLoading = signal(false);

  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async onSubmit(): Promise<void> {
    if (!this.forgotForm.value.email) return;
    this.isLoading.set(true);
    try {
      await authControllerForgotPassword({ body: { email: this.forgotForm.value.email } });
      this.submitted.set(true);
      this.notification.success('Email sent', 'Check your inbox for reset instructions');
    } catch {
      this.notification.error('Failed', 'Could not send reset email. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onResend(): void {
    this.submitted.set(false);
  }
}
