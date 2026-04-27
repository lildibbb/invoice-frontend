import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import '@phosphor-icons/web/index.js';
import { companiesControllerGetMyCompanies, companiesControllerUpdate } from '../../../core/api';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-settings-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="company-form">
      <form [formGroup]="form">
        <!-- Company Information -->
        <section class="form-section">
          <h3 class="section-title">Company Information</h3>
          <div class="logo-upload" (click)="fileInput.click()">
            <div class="logo-circle">
              <img *ngIf="logoPreview" [src]="logoPreview" alt="Logo" class="logo-img" />
              <ph-icon *ngIf="!logoPreview" name="camera" size="24" weight="duotone"></ph-icon>
            </div>
            <span class="logo-label">Upload Logo</span>
            <input #fileInput type="file" accept="image/*" hidden (change)="onLogoSelected($event)" />
          </div>
          <div class="form-grid">
            <div class="field full">
              <label>Company Name <span class="required">*</span></label>
              <input pInputText formControlName="companyName" placeholder="Company name" />
            </div>
            <div class="field">
              <label>Business Registration No. (BRN)</label>
              <input pInputText formControlName="brn" placeholder="e.g. 202401012345" />
            </div>
            <div class="field">
              <label>Tax Identification No. (TIN)</label>
              <input pInputText formControlName="tin" placeholder="e.g. C12345678000" />
            </div>
            <div class="field full">
              <label>SST Registration No.</label>
              <input pInputText formControlName="sst" placeholder="SST registration number" />
            </div>
          </div>
        </section>

        <!-- Address -->
        <section class="form-section">
          <h3 class="section-title">Address</h3>
          <div class="form-grid">
            <div class="field full">
              <label>Address Line 1</label>
              <input pInputText formControlName="address1" placeholder="Street address" />
            </div>
            <div class="field full">
              <label>Address Line 2</label>
              <input pInputText formControlName="address2" placeholder="Unit, floor, etc." />
            </div>
            <div class="field">
              <label>City</label>
              <input pInputText formControlName="city" placeholder="City" />
            </div>
            <div class="field">
              <label>State</label>
              <p-select
                formControlName="state"
                [options]="malaysianStates"
                placeholder="Select state"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>
            <div class="field">
              <label>Postcode</label>
              <input pInputText formControlName="postcode" placeholder="e.g. 50000" maxlength="5" />
            </div>
            <div class="field">
              <label>Country</label>
              <p-select
                formControlName="country"
                [options]="countries"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>
          </div>
        </section>

        <!-- Contact -->
        <section class="form-section">
          <h3 class="section-title">Contact</h3>
          <div class="form-grid">
            <div class="field">
              <label>Phone</label>
              <input pInputText formControlName="phone" placeholder="+60 XX-XXX XXXX" />
            </div>
            <div class="field">
              <label>Email</label>
              <input pInputText formControlName="email" placeholder="company@example.com" />
            </div>
            <div class="field full">
              <label>Website</label>
              <input pInputText formControlName="website" placeholder="https://www.example.com" />
            </div>
          </div>
        </section>

        <!-- Invoice Defaults -->
        <section class="form-section">
          <h3 class="section-title">Invoice Defaults</h3>
          <div class="form-grid">
            <div class="field">
              <label>Payment Terms</label>
              <p-select
                formControlName="paymentTerms"
                [options]="paymentTermsOptions"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>
            <div class="field">
              <label>Invoice Prefix</label>
              <input pInputText formControlName="invoicePrefix" placeholder="INV" />
            </div>
            <div class="field">
              <label>Invoice Number Format</label>
              <p-select
                formControlName="invoiceNumberFormat"
                [options]="numberFormatOptions"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>
            <div class="field">
              <label>Default Currency</label>
              <p-select
                formControlName="defaultCurrency"
                [options]="currencyOptions"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <div class="form-footer">
          <button pButton class="p-button-primary" (click)="onSave()">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .company-form {
      max-width: 720px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--card-border);
    }

    .logo-upload {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      cursor: pointer;
    }

    .logo-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 2px dashed var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      overflow: hidden;
      transition: border-color 0.15s;

      &:hover {
        border-color: var(--primary);
      }
    }

    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .logo-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      input, :host ::ng-deep .p-select {
        width: 100%;
      }
    }

    .field.full {
      grid-column: 1 / -1;
    }

    .required {
      color: var(--status-overdue);
    }

    .form-footer {
      padding-top: 16px;
      border-top: 1px solid var(--card-border);
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class SettingsCompanyComponent implements OnInit {
  private authStore = inject(AuthStore);
  private notification = inject(NotificationService);
  private companyUuid: string | null = null;
  loading = false;

  form: FormGroup;
  logoPreview: string | null = null;

  malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
    'W.P. Labuan', 'W.P. Putrajaya',
  ].map(s => ({ label: s, value: s }));

  countries = [
    { label: 'Malaysia', value: 'MY' },
    { label: 'Singapore', value: 'SG' },
    { label: 'Indonesia', value: 'ID' },
    { label: 'Thailand', value: 'TH' },
  ];

  paymentTermsOptions = [
    { label: 'Due on Receipt', value: 'receipt' },
    { label: 'Net 14', value: 'net14' },
    { label: 'Net 30', value: 'net30' },
    { label: 'Net 60', value: 'net60' },
    { label: 'Net 90', value: 'net90' },
  ];

  numberFormatOptions = [
    { label: 'Sequential', value: 'sequential' },
    { label: 'Year-Sequential', value: 'year-sequential' },
    { label: 'Custom', value: 'custom' },
  ];

  currencyOptions = [
    { label: 'MYR - Malaysian Ringgit', value: 'MYR' },
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'SGD - Singapore Dollar', value: 'SGD' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      brn: [''],
      tin: [''],
      sst: [''],
      address1: [''],
      address2: [''],
      city: [''],
      state: [''],
      postcode: [''],
      country: ['MY'],
      phone: [''],
      email: [''],
      website: [''],
      paymentTerms: ['net30'],
      invoicePrefix: ['INV'],
      invoiceNumberFormat: ['year-sequential'],
      defaultCurrency: ['MYR'],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCompany();
  }

  private async loadCompany(): Promise<void> {
    try {
      const { data } = await companiesControllerGetMyCompanies();
      const context = this.authStore.context();
      const companiesList = (data as any)?.data ?? data;
      const company = Array.isArray(companiesList)
        ? companiesList.find((c: any) => c.uuid === context?.company?.uuid)
        : null;
      if (company) {
        this.companyUuid = company.uuid ?? String(company.id);
        this.form.patchValue({
          companyName: company.name ?? '',
          brn: company.brn ?? '',
          tin: company.tin ?? '',
          sst: company.sstRegistrationNumber ?? '',
          address1: company.addressLine1 ?? '',
          address2: company.addressLine2 ?? '',
          city: company.city ?? '',
          state: company.state ?? '',
          postcode: company.postalCode ?? '',
          country: company.country ?? 'MY',
          phone: company.phone ?? '',
          email: company.email ?? '',
          website: company.website ?? '',
        });
      }
    } catch {
      this.notification.error('Failed to load company');
    }
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async onSave(): Promise<void> {
    if (!this.form.valid || !this.companyUuid) return;
    this.loading = true;
    try {
      const v = this.form.value;
      await companiesControllerUpdate({
        path: { uuid: this.companyUuid },
        body: {
          name: v.companyName,
          brn: v.brn,
          tin: v.tin,
          sstRegistrationNumber: v.sst,
          addressLine1: v.address1,
          addressLine2: v.address2,
          city: v.city,
          state: v.state,
          postalCode: v.postcode,
          country: v.country,
          phone: v.phone,
          email: v.email,
        } as any,
      });
      this.notification.success('Company updated');
    } catch {
      this.notification.error('Failed to update company');
    } finally {
      this.loading = false;
    }
  }
}
