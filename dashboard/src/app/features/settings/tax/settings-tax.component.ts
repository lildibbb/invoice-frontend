import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import '@phosphor-icons/web/index.js';

import {
  taxCategoriesControllerFindAll,
  taxCategoriesControllerCreate,
  taxCategoriesControllerUpdate,
  taxCategoriesControllerRemove,
  taxRulesControllerFindAll,
  taxRulesControllerCreate,
  taxRulesControllerUpdate,
  taxRulesControllerRemove,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

interface TaxCategory {
  uuid: string;
  name: string;
  description?: string;
  taxTypeCode: string;
  isActive: boolean;
  isSystem?: boolean;
}

interface TaxRule {
  uuid: string;
  taxCategoryUuid: string;
  categoryName?: string;
  taxRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  notes?: string;
  isSystem?: boolean;
}

@Component({
  selector: 'app-settings-tax',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    TabsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="tax-settings">
      <div class="tax-header">
        <h2 class="tax-title">Tax Management</h2>
      </div>

      <p-tabs [value]="0">
        <p-tablist>
          <p-tab [value]="0">Tax Categories</p-tab>
          <p-tab [value]="1">Tax Rules</p-tab>
        </p-tablist>
        <p-tabpanels>
          <!-- Tab 1: Tax Categories -->
          <p-tabpanel [value]="0">
            <div class="tab-header">
              <span class="tab-subtitle">Manage tax categories for your invoices</span>
              <button pButton class="p-button-primary p-button-sm" (click)="openCategoryDialog()">
                <ph-icon name="plus" size="16" weight="bold"></ph-icon>
                Add Category
              </button>
            </div>
            <div class="invoiz-card">
              <p-table [value]="categories" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Name</th>
                    <th>Tax Type Code</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-cat>
                  <tr>
                    <td class="font-medium">{{ cat.name }}</td>
                    <td><p-tag [value]="cat.taxTypeCode" severity="info"></p-tag></td>
                    <td class="text-muted">{{ cat.description || '—' }}</td>
                    <td>
                      <p-tag
                        [value]="cat.isActive ? 'Active' : 'Inactive'"
                        [severity]="cat.isActive ? 'success' : 'secondary'"
                      ></p-tag>
                    </td>
                    <td>
                      <div class="action-cell" *ngIf="!cat.isSystem">
                        <button pButton class="p-button-text p-button-sm" (click)="openCategoryDialog(cat)">Edit</button>
                        <button pButton class="p-button-danger p-button-text p-button-sm" (click)="onDeleteCategory(cat)">Delete</button>
                      </div>
                      <span *ngIf="cat.isSystem" class="text-muted system-badge">System</span>
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr><td colspan="5" class="text-center text-muted">No tax categories found</td></tr>
                </ng-template>
              </p-table>
            </div>
          </p-tabpanel>

          <!-- Tab 2: Tax Rules -->
          <p-tabpanel [value]="1">
            <div class="tab-header">
              <span class="tab-subtitle">Configure tax rates and their effective dates</span>
              <button pButton class="p-button-primary p-button-sm" (click)="openRuleDialog()">
                <ph-icon name="plus" size="16" weight="bold"></ph-icon>
                Add Rule
              </button>
            </div>
            <div class="invoiz-card">
              <p-table [value]="rules" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Category</th>
                    <th>Rate (%)</th>
                    <th>Effective From</th>
                    <th>Effective To</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-rule>
                  <tr>
                    <td class="font-medium">{{ rule.categoryName || rule.taxCategoryUuid }}</td>
                    <td>{{ rule.taxRate }}%</td>
                    <td>{{ rule.effectiveFrom | date:'mediumDate' }}</td>
                    <td>{{ rule.effectiveTo ? (rule.effectiveTo | date:'mediumDate') : 'No expiry' }}</td>
                    <td>
                      <p-tag
                        [value]="rule.isActive ? 'Active' : 'Inactive'"
                        [severity]="rule.isActive ? 'success' : 'secondary'"
                      ></p-tag>
                    </td>
                    <td>
                      <div class="action-cell" *ngIf="!rule.isSystem">
                        <button pButton class="p-button-text p-button-sm" (click)="openRuleDialog(rule)">Edit</button>
                        <button pButton class="p-button-danger p-button-text p-button-sm" (click)="onDeleteRule(rule)">Delete</button>
                      </div>
                      <span *ngIf="rule.isSystem" class="text-muted system-badge">System</span>
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr><td colspan="6" class="text-center text-muted">No tax rules found</td></tr>
                </ng-template>
              </p-table>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>

      <!-- Category Dialog -->
      <p-dialog
        [header]="editingCategory ? 'Edit Tax Category' : 'Add Tax Category'"
        [(visible)]="showCategoryDialog"
        [modal]="true"
        [style]="{ width: '450px' }"
      >
        <form [formGroup]="categoryForm">
          <div class="dialog-field">
            <label>Name <span class="required">*</span></label>
            <input pInputText formControlName="name" placeholder="e.g. Sales Tax" />
          </div>
          <div class="dialog-field">
            <label>Tax Type Code <span class="required">*</span></label>
            <p-select
              formControlName="taxTypeCode"
              [options]="taxTypeCodeOptions"
              placeholder="Select code"
              [style]="{ width: '100%' }"
            ></p-select>
          </div>
          <div class="dialog-field">
            <label>Description</label>
            <input pInputText formControlName="description" placeholder="Optional description" />
          </div>
        </form>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showCategoryDialog = false">Cancel</button>
            <button pButton class="p-button-primary" (click)="onSaveCategory()">
              {{ editingCategory ? 'Update' : 'Create' }}
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Rule Dialog -->
      <p-dialog
        [header]="editingRule ? 'Edit Tax Rule' : 'Add Tax Rule'"
        [(visible)]="showRuleDialog"
        [modal]="true"
        [style]="{ width: '450px' }"
      >
        <form [formGroup]="ruleForm">
          <div class="dialog-field">
            <label>Tax Category <span class="required">*</span></label>
            <p-select
              formControlName="taxCategoryUuid"
              [options]="categoryOptions"
              placeholder="Select category"
              [style]="{ width: '100%' }"
            ></p-select>
          </div>
          <div class="dialog-field">
            <label>Tax Rate (%) <span class="required">*</span></label>
            <p-inputNumber formControlName="taxRate" [minFractionDigits]="0" [maxFractionDigits]="2" suffix="%" [style]="{ width: '100%' }"></p-inputNumber>
          </div>
          <div class="dialog-field">
            <label>Effective From <span class="required">*</span></label>
            <input pInputText formControlName="effectiveFrom" type="date" />
          </div>
          <div class="dialog-field">
            <label>Effective To</label>
            <input pInputText formControlName="effectiveTo" type="date" />
          </div>
          <div class="dialog-field">
            <label>Notes</label>
            <input pInputText formControlName="notes" placeholder="Optional notes" />
          </div>
        </form>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showRuleDialog = false">Cancel</button>
            <button pButton class="p-button-primary" (click)="onSaveRule()">
              {{ editingRule ? 'Update' : 'Create' }}
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Delete Confirmation -->
      <p-dialog
        header="Confirm Delete"
        [(visible)]="showDeleteDialog"
        [modal]="true"
        [style]="{ width: '400px' }"
      >
        <p>Are you sure you want to delete <strong>{{ deleteItemName }}</strong>?</p>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showDeleteDialog = false">Cancel</button>
            <button pButton class="p-button-danger" (click)="confirmDelete()">Delete</button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .tax-settings {
      max-width: 960px;
    }

    .tax-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .tax-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      margin-top: 8px;
    }

    .tab-header button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .tab-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .font-medium {
      font-weight: 500;
    }

    .text-muted {
      font-size: 13px;
      color: var(--text-muted);
    }

    .text-center {
      text-align: center;
    }

    .action-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .system-badge {
      font-size: 12px;
      font-style: italic;
    }

    .dialog-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;

      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      input, :host ::ng-deep .p-select {
        width: 100%;
      }
    }

    .required {
      color: var(--status-overdue);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `],
})
export class SettingsTaxComponent implements OnInit {
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  categories: TaxCategory[] = [];
  rules: TaxRule[] = [];

  showCategoryDialog = false;
  showRuleDialog = false;
  showDeleteDialog = false;
  editingCategory = false;
  editingRule = false;
  editingCategoryUuid: string | null = null;
  editingRuleUuid: string | null = null;
  deleteItemName = '';
  private deleteType: 'category' | 'rule' = 'category';
  private deleteUuid = '';

  taxTypeCodeOptions = [
    { label: '01 - Sales Tax', value: '01' },
    { label: '02 - Service Tax', value: '02' },
    { label: '03 - Tourism Tax', value: '03' },
    { label: '04 - High-Value Goods Tax', value: '04' },
    { label: '05 - Sales Tax on Low Value Goods', value: '05' },
    { label: '06 - Not Applicable', value: '06' },
    { label: 'E - Tax Exemption', value: 'E' },
  ];

  categoryOptions: { label: string; value: string }[] = [];

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    taxTypeCode: ['', Validators.required],
    description: [''],
  });

  ruleForm: FormGroup = this.fb.group({
    taxCategoryUuid: ['', Validators.required],
    taxRate: [0, [Validators.required, Validators.min(0)]],
    effectiveFrom: ['', Validators.required],
    effectiveTo: [''],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  private async loadAll(): Promise<void> {
    await Promise.all([this.loadCategories(), this.loadRules()]);
  }

  private async loadCategories(): Promise<void> {
    try {
      const { data } = await taxCategoriesControllerFindAll();
      const list = (data as any)?.data ?? data ?? [];
      this.categories = (Array.isArray(list) ? list : []).map((c: any) => ({
        uuid: c.uuid ?? c.id,
        name: c.name,
        description: c.description,
        taxTypeCode: c.taxTypeCode,
        isActive: c.isActive ?? true,
        isSystem: c.isSystem ?? c.companyUuid == null,
      }));
      this.categoryOptions = this.categories.map(c => ({ label: c.name, value: c.uuid }));
    } catch {
      this.notification.error('Failed to load tax categories');
    }
  }

  private async loadRules(): Promise<void> {
    try {
      const { data } = await taxRulesControllerFindAll();
      const list = (data as any)?.data ?? data ?? [];
      this.rules = (Array.isArray(list) ? list : []).map((r: any) => ({
        uuid: r.uuid ?? r.id,
        taxCategoryUuid: r.taxCategoryUuid ?? r.taxCategory?.uuid,
        categoryName: r.taxCategory?.name ?? r.categoryName,
        taxRate: r.taxRate,
        effectiveFrom: r.effectiveFrom,
        effectiveTo: r.effectiveTo,
        isActive: r.isActive ?? true,
        notes: r.notes,
        isSystem: r.isSystem ?? r.companyUuid == null,
      }));
    } catch {
      this.notification.error('Failed to load tax rules');
    }
  }

  openCategoryDialog(cat?: TaxCategory): void {
    this.editingCategory = !!cat;
    this.editingCategoryUuid = cat?.uuid ?? null;
    if (cat) {
      this.categoryForm.patchValue({
        name: cat.name,
        taxTypeCode: cat.taxTypeCode,
        description: cat.description ?? '',
      });
    } else {
      this.categoryForm.reset();
    }
    this.showCategoryDialog = true;
  }

  openRuleDialog(rule?: TaxRule): void {
    this.editingRule = !!rule;
    this.editingRuleUuid = rule?.uuid ?? null;
    if (rule) {
      this.ruleForm.patchValue({
        taxCategoryUuid: rule.taxCategoryUuid,
        taxRate: rule.taxRate,
        effectiveFrom: rule.effectiveFrom?.substring(0, 10) ?? '',
        effectiveTo: rule.effectiveTo?.substring(0, 10) ?? '',
        notes: rule.notes ?? '',
      });
    } else {
      this.ruleForm.reset({ taxRate: 0 });
    }
    this.showRuleDialog = true;
  }

  async onSaveCategory(): Promise<void> {
    if (!this.categoryForm.valid) return;
    const val = { ...this.categoryForm.value, isActive: true };
    try {
      if (this.editingCategory && this.editingCategoryUuid) {
        await taxCategoriesControllerUpdate({
          path: { uuid: this.editingCategoryUuid },
          body: val,
        } as any);
        this.notification.success('Category updated');
      } else {
        await taxCategoriesControllerCreate({ body: val } as any);
        this.notification.success('Category created');
      }
      this.showCategoryDialog = false;
      await this.loadCategories();
    } catch {
      this.notification.error('Failed to save category');
    }
  }

  async onSaveRule(): Promise<void> {
    if (!this.ruleForm.valid) return;
    const val = {
      ...this.ruleForm.value,
      isActive: true,
      effectiveTo: this.ruleForm.value.effectiveTo || undefined,
    };
    try {
      if (this.editingRule && this.editingRuleUuid) {
        await taxRulesControllerUpdate({
          path: { uuid: this.editingRuleUuid },
          body: val,
        } as any);
        this.notification.success('Rule updated');
      } else {
        await taxRulesControllerCreate({ body: val } as any);
        this.notification.success('Rule created');
      }
      this.showRuleDialog = false;
      await this.loadRules();
    } catch {
      this.notification.error('Failed to save rule');
    }
  }

  onDeleteCategory(cat: TaxCategory): void {
    this.deleteType = 'category';
    this.deleteUuid = cat.uuid;
    this.deleteItemName = cat.name;
    this.showDeleteDialog = true;
  }

  onDeleteRule(rule: TaxRule): void {
    this.deleteType = 'rule';
    this.deleteUuid = rule.uuid;
    this.deleteItemName = rule.categoryName || 'this rule';
    this.showDeleteDialog = true;
  }

  async confirmDelete(): Promise<void> {
    try {
      if (this.deleteType === 'category') {
        await taxCategoriesControllerRemove({ path: { uuid: this.deleteUuid } } as any);
        this.notification.success('Category deleted');
        await this.loadCategories();
      } else {
        await taxRulesControllerRemove({ path: { uuid: this.deleteUuid } } as any);
        this.notification.success('Rule deleted');
        await this.loadRules();
      }
    } catch {
      this.notification.error('Failed to delete');
    } finally {
      this.showDeleteDialog = false;
    }
  }
}
