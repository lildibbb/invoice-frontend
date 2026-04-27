import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import '@phosphor-icons/web/index.js';

import {
  invoiceTemplatesControllerFindAll,
  invoiceTemplatesControllerCreate,
  invoiceTemplatesControllerUpdate,
  invoiceTemplatesControllerRemove,
  invoiceTemplatesControllerSetDefault,
} from '../../../core/api';
import { NotificationService } from '../../../core/services/notification.service';

interface InvoiceTemplate {
  uuid: string;
  name: string;
  headerText?: string;
  footerText?: string;
  primaryColor?: string;
  isDefault?: boolean;
  showLogo?: boolean;
  showQrCode?: boolean;
  showPaymentTerms?: boolean;
  showBankDetails?: boolean;
  showTaxBreakdown?: boolean;
  showNotes?: boolean;
  showSignatureLine?: boolean;
  termsAndConditions?: string;
  bankDetails?: string;
}

@Component({
  selector: 'app-settings-templates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TagModule,
    TextareaModule,
    CheckboxModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="templates-settings">
      <!-- Header -->
      <div class="templates-header">
        <h2 class="templates-title">Invoice Templates</h2>
        <button pButton class="p-button-primary p-button-sm" (click)="openCreateDialog()">
          <ph-icon name="plus" size="16" weight="bold"></ph-icon>
          Create Template
        </button>
      </div>

      <!-- Template Grid -->
      <div class="template-grid" *ngIf="templates.length > 0">
        <div class="template-card invoiz-card" *ngFor="let tpl of templates">
          <div class="template-preview" [style.border-top-color]="tpl.primaryColor || '#3b82f6'">
            <div class="preview-color-bar" [style.background]="tpl.primaryColor || '#3b82f6'"></div>
            <div class="preview-body">
              <div class="preview-line wide"></div>
              <div class="preview-line medium"></div>
              <div class="preview-line short"></div>
              <div class="preview-block"></div>
              <div class="preview-line medium"></div>
            </div>
          </div>
          <div class="template-info">
            <div class="template-name-row">
              <span class="template-name">{{ tpl.name }}</span>
              <p-tag *ngIf="tpl.isDefault" value="Default" severity="success" [rounded]="true"></p-tag>
            </div>
            <p class="template-desc" *ngIf="tpl.headerText">{{ tpl.headerText }}</p>
            <div class="template-features">
              <span class="feature-badge" *ngIf="tpl.showLogo">Logo</span>
              <span class="feature-badge" *ngIf="tpl.showQrCode">QR Code</span>
              <span class="feature-badge" *ngIf="tpl.showTaxBreakdown">Tax</span>
              <span class="feature-badge" *ngIf="tpl.showBankDetails">Bank</span>
              <span class="feature-badge" *ngIf="tpl.showSignatureLine">Signature</span>
            </div>
          </div>
          <div class="template-actions">
            <button pButton class="p-button-text p-button-sm" (click)="openEditDialog(tpl)">
              <ph-icon name="pencil-simple" size="16" weight="duotone"></ph-icon>
              Edit
            </button>
            <button pButton class="p-button-text p-button-sm" (click)="onSetDefault(tpl)" *ngIf="!tpl.isDefault">
              <ph-icon name="star" size="16" weight="duotone"></ph-icon>
              Set Default
            </button>
            <button pButton class="p-button-danger p-button-text p-button-sm" (click)="onDelete(tpl)" *ngIf="!tpl.isDefault">
              <ph-icon name="trash" size="16" weight="duotone"></ph-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state invoiz-card" *ngIf="templates.length === 0 && !loading">
        <ph-icon name="file-text" size="48" weight="duotone"></ph-icon>
        <p>No templates yet. Create your first invoice template.</p>
      </div>

      <!-- Create / Edit Dialog -->
      <p-dialog
        [header]="editing ? 'Edit Template' : 'Create Template'"
        [(visible)]="showDialog"
        [modal]="true"
        [style]="{ width: '520px' }"
      >
        <form [formGroup]="templateForm">
          <div class="dialog-field">
            <label>Name <span class="required">*</span></label>
            <input pInputText formControlName="name" placeholder="e.g. Professional Blue" />
          </div>
          <div class="dialog-field">
            <label>Header Text</label>
            <textarea pTextarea formControlName="headerText" rows="2" placeholder="Text displayed at the top of the invoice"></textarea>
          </div>
          <div class="dialog-field">
            <label>Footer Text</label>
            <textarea pTextarea formControlName="footerText" rows="2" placeholder="Text displayed at the bottom"></textarea>
          </div>
          <div class="dialog-field">
            <label>Terms & Conditions</label>
            <textarea pTextarea formControlName="termsAndConditions" rows="2" placeholder="Payment terms, warranty, etc."></textarea>
          </div>
          <div class="dialog-field">
            <label>Bank Details</label>
            <textarea pTextarea formControlName="bankDetails" rows="2" placeholder="Bank name, account number, etc."></textarea>
          </div>
          <div class="dialog-field">
            <label>Primary Color</label>
            <input pInputText formControlName="primaryColor" placeholder="#3b82f6" />
          </div>
          <div class="dialog-toggles">
            <label class="toggle-item">
              <p-checkbox formControlName="showLogo" [binary]="true"></p-checkbox>
              <span>Show Logo</span>
            </label>
            <label class="toggle-item">
              <p-checkbox formControlName="showQrCode" [binary]="true"></p-checkbox>
              <span>Show QR Code</span>
            </label>
            <label class="toggle-item">
              <p-checkbox formControlName="showPaymentTerms" [binary]="true"></p-checkbox>
              <span>Payment Terms</span>
            </label>
            <label class="toggle-item">
              <p-checkbox formControlName="showBankDetails" [binary]="true"></p-checkbox>
              <span>Bank Details</span>
            </label>
            <label class="toggle-item">
              <p-checkbox formControlName="showTaxBreakdown" [binary]="true"></p-checkbox>
              <span>Tax Breakdown</span>
            </label>
            <label class="toggle-item">
              <p-checkbox formControlName="showSignatureLine" [binary]="true"></p-checkbox>
              <span>Signature Line</span>
            </label>
          </div>
        </form>
        <ng-template #footer>
          <div class="dialog-footer">
            <button pButton class="p-button-text" (click)="showDialog = false">Cancel</button>
            <button pButton class="p-button-primary" (click)="onSave()">
              {{ editing ? 'Update' : 'Create' }}
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Delete Confirmation Dialog -->
      <p-dialog
        header="Delete Template"
        [(visible)]="showDeleteDialog"
        [modal]="true"
        [style]="{ width: '400px' }"
      >
        <p>Are you sure you want to delete <strong>{{ templateToDelete?.name }}</strong>?</p>
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
    .templates-settings {
      max-width: 960px;
    }

    .templates-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .templates-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .templates-header button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .template-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .template-preview {
      background: #f8fafc;
      padding: 16px;
      border-top: 3px solid #3b82f6;
    }

    .preview-color-bar {
      height: 4px;
      border-radius: 2px;
      margin-bottom: 12px;
    }

    .preview-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .preview-line {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
    }

    .preview-line.wide { width: 100%; }
    .preview-line.medium { width: 65%; }
    .preview-line.short { width: 40%; }

    .preview-block {
      height: 24px;
      background: #e2e8f0;
      border-radius: 4px;
      margin: 4px 0;
    }

    .template-info {
      padding: 16px;
      flex: 1;
    }

    .template-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .template-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .template-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 8px;
      line-height: 1.4;
    }

    .template-features {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .feature-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      background: #f1f5f9;
      color: #475569;
    }

    .template-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-top: 1px solid var(--card-border, #e2e8f0);
    }

    .template-actions button {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 24px;
      text-align: center;
      color: var(--text-muted);
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

      input, textarea {
        width: 100%;
      }
    }

    .required {
      color: var(--status-overdue);
    }

    .dialog-toggles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 8px;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-primary);
      cursor: pointer;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `],
})
export class SettingsTemplatesComponent implements OnInit {
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  loading = false;
  templates: InvoiceTemplate[] = [];

  showDialog = false;
  showDeleteDialog = false;
  editing = false;
  editingUuid: string | null = null;
  templateToDelete: InvoiceTemplate | null = null;

  templateForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    headerText: [''],
    footerText: [''],
    termsAndConditions: [''],
    bankDetails: [''],
    primaryColor: ['#3b82f6'],
    showLogo: [true],
    showQrCode: [false],
    showPaymentTerms: [true],
    showBankDetails: [true],
    showTaxBreakdown: [true],
    showSignatureLine: [false],
  });

  async ngOnInit(): Promise<void> {
    await this.loadTemplates();
  }

  private async loadTemplates(): Promise<void> {
    this.loading = true;
    try {
      const { data } = await invoiceTemplatesControllerFindAll();
      const list = (data as any)?.data ?? data ?? [];
      this.templates = (Array.isArray(list) ? list : []).map((t: any) => ({
        uuid: t.uuid ?? t.id,
        name: t.name,
        headerText: t.headerText,
        footerText: t.footerText,
        primaryColor: t.primaryColor,
        isDefault: t.isDefault ?? false,
        showLogo: t.showLogo,
        showQrCode: t.showQrCode,
        showPaymentTerms: t.showPaymentTerms,
        showBankDetails: t.showBankDetails,
        showTaxBreakdown: t.showTaxBreakdown,
        showNotes: t.showNotes,
        showSignatureLine: t.showSignatureLine,
        termsAndConditions: t.termsAndConditions,
        bankDetails: t.bankDetails,
      }));
    } catch {
      this.notification.error('Failed to load templates');
    } finally {
      this.loading = false;
    }
  }

  openCreateDialog(): void {
    this.editing = false;
    this.editingUuid = null;
    this.templateForm.reset({
      primaryColor: '#3b82f6',
      showLogo: true,
      showPaymentTerms: true,
      showBankDetails: true,
      showTaxBreakdown: true,
    });
    this.showDialog = true;
  }

  openEditDialog(tpl: InvoiceTemplate): void {
    this.editing = true;
    this.editingUuid = tpl.uuid;
    this.templateForm.patchValue({
      name: tpl.name,
      headerText: tpl.headerText ?? '',
      footerText: tpl.footerText ?? '',
      termsAndConditions: tpl.termsAndConditions ?? '',
      bankDetails: tpl.bankDetails ?? '',
      primaryColor: tpl.primaryColor ?? '#3b82f6',
      showLogo: tpl.showLogo ?? true,
      showQrCode: tpl.showQrCode ?? false,
      showPaymentTerms: tpl.showPaymentTerms ?? true,
      showBankDetails: tpl.showBankDetails ?? true,
      showTaxBreakdown: tpl.showTaxBreakdown ?? true,
      showSignatureLine: tpl.showSignatureLine ?? false,
    });
    this.showDialog = true;
  }

  async onSave(): Promise<void> {
    if (!this.templateForm.valid) return;
    const val = this.templateForm.value;
    try {
      if (this.editing && this.editingUuid) {
        await invoiceTemplatesControllerUpdate({
          path: { uuid: this.editingUuid },
          body: val,
        } as any);
        this.notification.success('Template updated');
      } else {
        await invoiceTemplatesControllerCreate({ body: val } as any);
        this.notification.success('Template created');
      }
      this.showDialog = false;
      await this.loadTemplates();
    } catch {
      this.notification.error('Failed to save template');
    }
  }

  async onSetDefault(tpl: InvoiceTemplate): Promise<void> {
    try {
      await invoiceTemplatesControllerSetDefault({
        path: { uuid: tpl.uuid },
      } as any);
      this.notification.success('Default template updated');
      await this.loadTemplates();
    } catch {
      this.notification.error('Failed to set default template');
    }
  }

  onDelete(tpl: InvoiceTemplate): void {
    this.templateToDelete = tpl;
    this.showDeleteDialog = true;
  }

  async confirmDelete(): Promise<void> {
    if (!this.templateToDelete) return;
    try {
      await invoiceTemplatesControllerRemove({
        path: { uuid: this.templateToDelete.uuid },
      } as any);
      this.notification.success('Template deleted');
      this.showDeleteDialog = false;
      this.templateToDelete = null;
      await this.loadTemplates();
    } catch {
      this.notification.error('Failed to delete template');
    }
  }
}
