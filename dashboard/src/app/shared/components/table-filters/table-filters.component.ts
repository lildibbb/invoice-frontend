import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

export interface FilterChangeEvent {
  search: string;
  status: string | null;
  dateRange: Date[] | null;
}

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [FormsModule, InputTextModule, SelectModule, DatePickerModule, ButtonModule],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <!-- Search -->
      <div class="flex-1 min-w-[200px]">
        <input
          pInputText
          type="text"
          [placeholder]="searchPlaceholder()"
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange($event)"
          class="w-full" />
      </div>

      <!-- Status Filter -->
      @if (statusOptions().length > 0) {
        <p-select
          [options]="statusOptions()"
          [(ngModel)]="selectedStatus"
          (ngModelChange)="emitChange()"
          [placeholder]="'All Statuses'"
          [showClear]="true"
          [style]="{ minWidth: '180px' }" />
      }

      <!-- Date Range -->
      @if (showDateRange()) {
        <p-datepicker
          [(ngModel)]="dateRange"
          (ngModelChange)="emitChange()"
          selectionMode="range"
          [placeholder]="'Date range'"
          [showIcon]="true"
          dateFormat="dd/mm/yy"
          [style]="{ minWidth: '220px' }" />
      }

      <!-- Clear button -->
      <p-button
        icon="pi pi-filter-slash"
        severity="secondary"
        [outlined]="true"
        [rounded]="true"
        pTooltip="Clear filters"
        (onClick)="clearFilters()" />
    </div>
  `,
})
export class TableFiltersComponent {
  searchPlaceholder = input<string>('Search...');
  statusOptions = input<{ label: string; value: string }[]>([]);
  showDateRange = input<boolean>(true);

  filterChange = output<FilterChangeEvent>();

  search = '';
  selectedStatus: string | null = null;
  dateRange: Date[] | null = null;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onSearchChange(value: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.emitChange(), 300);
  }

  emitChange(): void {
    this.filterChange.emit({
      search: this.search,
      status: this.selectedStatus,
      dateRange: this.dateRange,
    });
  }

  clearFilters(): void {
    this.search = '';
    this.selectedStatus = null;
    this.dateRange = null;
    this.emitChange();
  }
}
