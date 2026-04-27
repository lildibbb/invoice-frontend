import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';

import { RecurringStore } from '../recurring.store';

@Component({
  selector: 'app-recurring-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <p-dialog
      header="Create Recurring Plan"
      [(visible)]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '520px' }"
      [closable]="true"
    >
      <div class="flex flex-col gap-4 pt-2">
        <!-- Plan Name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Plan Name *</label>
          <input pInputText [(ngModel)]="form.name" placeholder="e.g. Monthly Retainer" />
        </div>

        <!-- Customer ID -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Customer ID</label>
          <p-inputnumber [(ngModel)]="form.customerId" placeholder="Customer ID" [useGrouping]="false"></p-inputnumber>
        </div>

        <!-- Frequency -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Frequency *</label>
          <p-select
            [options]="frequencyOptions"
            [(ngModel)]="form.frequency"
            optionLabel="label"
            optionValue="value"
            placeholder="Select frequency"
          ></p-select>
        </div>

        <!-- Start Date -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Start Date *</label>
          <p-datepicker [(ngModel)]="startDate" dateFormat="dd/mm/yy" [showIcon]="true"></p-datepicker>
        </div>

        <!-- End Date -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">End Date</label>
          <p-datepicker [(ngModel)]="endDate" dateFormat="dd/mm/yy" [showIcon]="true"></p-datepicker>
        </div>

        <!-- Max Occurrences -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Max Occurrences</label>
          <p-inputnumber [(ngModel)]="form.maxOccurrences" placeholder="Unlimited if empty" [useGrouping]="false"></p-inputnumber>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Notes</label>
          <input pInputText [(ngModel)]="form.notes" placeholder="Optional notes" />
        </div>

        <!-- Auto Options -->
        <div class="flex gap-4">
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="form.autoFinalize" [binary]="true" inputId="autoFinalize"></p-checkbox>
            <label for="autoFinalize" class="text-sm text-slate-700">Auto-finalize</label>
          </div>
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="form.autoSend" [binary]="true" inputId="autoSend"></p-checkbox>
            <label for="autoSend" class="text-sm text-slate-700">Auto-send</label>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <button pButton class="p-button-text" label="Cancel" (click)="onClose()"></button>
          <button
            pButton
            class="p-button-primary"
            label="Create Plan"
            [loading]="submitting"
            [disabled]="!isValid()"
            (click)="onSubmit()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class RecurringFormComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  private store = inject(RecurringStore);

  submitting = false;
  startDate: Date | null = null;
  endDate: Date | null = null;

  form: any = {
    name: '',
    customerId: null,
    frequency: null,
    maxOccurrences: null,
    notes: '',
    autoFinalize: false,
    autoSend: false,
  };

  frequencyOptions = [
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Yearly', value: 'YEARLY' },
    { label: 'Custom', value: 'CUSTOM' },
  ];

  isValid(): boolean {
    return !!this.form.name && !!this.form.frequency && !!this.startDate;
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;
    this.submitting = true;
    try {
      const body: any = {
        name: this.form.name,
        frequency: this.form.frequency,
        startDate: this.formatDate(this.startDate!),
        ...(this.form.customerId ? { customerId: this.form.customerId } : {}),
        ...(this.endDate ? { endDate: this.formatDate(this.endDate) } : {}),
        ...(this.form.maxOccurrences ? { maxOccurrences: this.form.maxOccurrences } : {}),
        ...(this.form.notes ? { notes: this.form.notes } : {}),
        autoFinalize: this.form.autoFinalize,
        autoSend: this.form.autoSend,
      };
      await this.store.createPlan(body);
      this.resetForm();
      this.saved.emit();
    } catch {
      // Error handled by caller
    } finally {
      this.submitting = false;
    }
  }

  onClose(): void {
    this.visibleChange.emit(false);
  }

  private resetForm(): void {
    this.form = {
      name: '',
      customerId: null,
      frequency: null,
      maxOccurrences: null,
      notes: '',
      autoFinalize: false,
      autoSend: false,
    };
    this.startDate = null;
    this.endDate = null;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
