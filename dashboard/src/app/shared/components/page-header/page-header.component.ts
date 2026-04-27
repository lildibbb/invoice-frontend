import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title }}</h1>
        <p *ngIf="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .page-header__title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.4;
    }

    .page-header__subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin: 4px 0 0;
    }

    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `],
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
