import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import '@phosphor-icons/web/index.js';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <ph-icon [attr.name]="icon" size="32" weight="duotone"></ph-icon>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__message">{{ message }}</p>
      <div class="empty-state__action">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-state__icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--status-draft-bg);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .empty-state__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px;
    }

    .empty-state__message {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0 0 20px;
      max-width: 360px;
    }

    .empty-state__action:empty {
      display: none;
    }
  `],
})
export class EmptyStateComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
}
