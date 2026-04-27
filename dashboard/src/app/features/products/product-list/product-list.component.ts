import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import '@phosphor-icons/web/index.js';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CurrencyMyrPipe } from '../../../shared/pipes/currency-myr.pipe';
import { ProductStore } from '../product.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
    TagModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    CurrencyMyrPipe,
  ],
  providers: [ProductStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="page-container">
      <app-page-header title="Products & Services">
        <button actions pButton class="p-button-primary action-btn" (click)="navigateToCreate()">
          <ph-icon name="plus" size="18" weight="bold"></ph-icon>
          Add Product
        </button>
      </app-page-header>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <app-stat-card label="Total" [value]="'' + store.pagination().total" icon="package" accent="blue"></app-stat-card>
        <app-stat-card label="Products" [value]="'' + productCount()" icon="cube" accent="violet"></app-stat-card>
        <app-stat-card label="Services" [value]="'' + serviceCount()" icon="wrench" accent="amber"></app-stat-card>
        <app-stat-card label="Active" [value]="'' + activeCount()" icon="check-circle" accent="green"></app-stat-card>
      </div>

      <!-- Filter Bar -->
      <div class="invoiz-card p-4 mb-5">
        <div class="filter-bar">
          <span class="filter-search">
            <ph-icon name="magnifying-glass" size="18" weight="regular"></ph-icon>
            <input
              pInputText
              type="text"
              placeholder="Search products & services..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              class="filter-input"
            />
          </span>
          <p-select
            [options]="typeOptions"
            [(ngModel)]="selectedType"
            placeholder="Type"
            styleClass="filter-select"
          ></p-select>
          <p-select
            [options]="statusOptions"
            [(ngModel)]="selectedStatus"
            placeholder="Status"
            styleClass="filter-select"
          ></p-select>
        </div>
      </div>

      <!-- Products Table -->
      <div class="invoiz-card">
        <p-table
          [value]="store.products()"
          [loading]="store.isLoading()"
          [rows]="10"
          [paginator]="true"
          [rowsPerPageOptions]="[10, 25, 50]"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Unit Price</th>
              <th>Tax Rate</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-p>
            <tr>
              <td class="font-medium">{{ p.code }}</td>
              <td>{{ p.name }}</td>
              <td>
                <p-tag
                  [value]="p.type | titlecase"
                  [severity]="p.type === 'product' ? 'info' : 'contrast'"
                  [style]="p.type === 'service' ? { background: '#8b5cf6', color: '#fff' } : {}"
                ></p-tag>
              </td>
              <td>{{ p.unitPrice | currencyMyr }}</td>
              <td>{{ p.taxRate }}%</td>
              <td>{{ p.category }}</td>
              <td>
                <app-status-badge [status]="p.status" size="sm"></app-status-badge>
              </td>
              <td>
                <div class="action-group">
                  <button pButton class="p-button-text p-button-sm action-icon" title="View">
                    <ph-icon name="eye" size="18" weight="regular"></ph-icon>
                  </button>
                  <button pButton class="p-button-text p-button-sm action-icon" title="Edit" (click)="navigateToEdit(p)">
                    <ph-icon name="pencil-simple" size="18" weight="regular"></ph-icon>
                  </button>
                  <button pButton class="p-button-text p-button-sm action-icon" title="Delete" (click)="onDelete(p)">
                    <ph-icon name="trash" size="18" weight="regular"></ph-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-6 text-muted">No products found.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-search {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 200px;
      color: var(--text-secondary);
    }

    .filter-input {
      width: 100%;
      font-size: 13px;
    }

    :host ::ng-deep .filter-select {
      min-width: 150px;
    }

    .action-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-icon {
      padding: 6px;
      color: var(--text-secondary);
      &:hover { color: var(--primary); }
    }

    .text-center { text-align: center; }
    .text-muted { color: var(--text-secondary); }
  `],
})
export class ProductListComponent implements OnInit {
  readonly store = inject(ProductStore);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  searchQuery = '';
  selectedType: string | null = null;
  selectedStatus: string | null = null;

  typeOptions = [
    { label: 'All', value: null },
    { label: 'Product', value: 'product' },
    { label: 'Service', value: 'service' },
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  productCount = computed(() => this.store.products().filter((p: any) => p.type === 'product').length);
  serviceCount = computed(() => this.store.products().filter((p: any) => p.type === 'service').length);
  activeCount = computed(() => this.store.products().filter((p: any) => p.status === 'active').length);

  ngOnInit(): void {
    this.store.loadProducts();
  }

  onSearch(): void {
    this.store.setSearch(this.searchQuery);
    this.store.loadProducts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/products', 'new']);
  }

  navigateToEdit(product: any): void {
    this.router.navigate(['/products', product.uuid, 'edit']);
  }

  async onDelete(product: any): Promise<void> {
    try {
      await this.store.deleteProduct(product.uuid);
      this.notification.success('Product deleted');
      this.store.loadProducts();
    } catch {
      this.notification.error('Failed to delete product');
    }
  }
}
