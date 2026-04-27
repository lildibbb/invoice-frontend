import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import '@phosphor-icons/web/index.js';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="invoiz-card stat-card" [ngClass]="'stat-accent--' + accent">
      <div class="stat-card__header">
        <div class="stat-card__icon" [ngClass]="'stat-card__icon--' + accent">
          <ph-icon [attr.name]="icon" size="20" weight="duotone"></ph-icon>
        </div>
      </div>
      <div class="stat-card__value">{{ value }}</div>
      <div class="stat-card__label">{{ label }}</div>
      <div
        *ngIf="delta"
        class="stat-card__delta"
        [ngClass]="{
          'stat-card__delta--positive': deltaType === 'positive',
          'stat-card__delta--negative': deltaType === 'negative',
          'stat-card__delta--neutral': deltaType === 'neutral'
        }"
      >
        {{ delta }}
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      position: relative;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-card__header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
    }

    .stat-card__icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &--blue   { background: var(--primary-light);      color: var(--primary); }
      &--green  { background: var(--status-paid-bg);      color: var(--status-paid); }
      &--red    { background: var(--status-overdue-bg);   color: var(--status-overdue); }
      &--violet { background: var(--status-lhdn-bg);     color: var(--status-lhdn); }
      &--amber  { background: var(--status-pending-bg);   color: var(--status-pending); }
    }

    .stat-card__value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .stat-card__label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .stat-card__delta {
      position: absolute;
      bottom: 16px;
      right: 16px;
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 9999px;

      &--positive {
        background: var(--status-paid-bg);
        color: var(--status-paid);
      }
      &--negative {
        background: var(--status-overdue-bg);
        color: var(--status-overdue);
      }
      &--neutral {
        background: var(--status-draft-bg);
        color: var(--status-draft);
      }
    }
  `],
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input() delta?: string;
  @Input() deltaType?: 'positive' | 'negative' | 'neutral';
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) accent!: 'blue' | 'green' | 'red' | 'violet' | 'amber';
}
