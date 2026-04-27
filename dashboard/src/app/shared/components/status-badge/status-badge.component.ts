import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatusConfig {
  cssClass: string;
  displayText: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  paid:       { cssClass: 'status-badge--paid',       displayText: 'Paid' },
  overdue:    { cssClass: 'status-badge--overdue',    displayText: 'Overdue' },
  sent:       { cssClass: 'status-badge--sent',       displayText: 'Sent' },
  draft:      { cssClass: 'status-badge--draft',      displayText: 'Draft' },
  pending:    { cssClass: 'status-badge--pending',    displayText: 'Pending' },
  submitted:  { cssClass: 'status-badge--submitted',  displayText: 'Submitted' },
  valid:      { cssClass: 'status-badge--valid',      displayText: 'Valid' },
  invalid:    { cssClass: 'status-badge--invalid',    displayText: 'Invalid' },
  cancelled:  { cssClass: 'status-badge--cancelled',  displayText: 'Cancelled' },
  voided:     { cssClass: 'status-badge--voided',     displayText: 'Voided' },
  active:     { cssClass: 'status-badge--paid',       displayText: 'Active' },
  inactive:   { cssClass: 'status-badge--draft',      displayText: 'Inactive' },
  suspended:  { cssClass: 'status-badge--cancelled',  displayText: 'Suspended' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="status-badge"
      [ngClass]="[config.cssClass, size === 'sm' ? 'status-badge--sm' : '']"
    >
      <span class="status-badge__dot"></span>
      {{ config.displayText }}
    </span>
  `,
  styles: [`
    .status-badge__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    .status-badge--sm {
      font-size: 11px;
      padding: 2px 8px;
    }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() size: 'sm' | 'md' = 'md';

  get config(): StatusConfig {
    return STATUS_MAP[this.status?.toLowerCase()] ?? {
      cssClass: 'status-badge--draft',
      displayText: this.status ?? 'Unknown',
    };
  }
}
