import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [header]="header()"
      [visible]="visible()"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '420px' }"
      (onHide)="cancel.emit()">
      <div class="py-4">
        <p class="text-sm text-[var(--text-secondary)]">{{ message() }}</p>
      </div>
      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="cancel.emit()" />
          <p-button
            [label]="confirmLabel()"
            [severity]="severity()"
            [loading]="loading()"
            (onClick)="confirm.emit()" />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class ConfirmDialogComponent {
  visible = input<boolean>(false);
  header = input<string>('Confirm Action');
  message = input<string>('Are you sure you want to proceed?');
  confirmLabel = input<string>('Confirm');
  severity = input<'danger' | 'warn' | 'success' | 'info' | 'secondary'>('danger');
  loading = input<boolean>(false);

  confirm = output<void>();
  cancel = output<void>();
}
