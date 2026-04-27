import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { StepperModule } from 'primeng/stepper';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import '@phosphor-icons/web/index.js';

import { CurrencyMyrPipe } from '../../../shared/pipes/currency-myr.pipe';
import { InvoiceStore } from '../invoice.store';
import { NotificationService } from '../../../core/services/notification.service';
import { customersControllerFindAll, productsControllerFindAll } from '../../../core/api';

interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  providers: [InvoiceStore],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    StepperModule,
    AutoCompleteModule,
    InputNumberModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ButtonModule,
    TextareaModule,
    CurrencyMyrPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="wizard-container">
      <!-- Step Bar -->
      <div class="invoiz-card wizard-steps-card">
        <p-stepper [value]="activeStep()" (valueChange)="onStepChange($event)" [linear]="false">
          <p-step-list>
            @for (step of steps; track step.label; let i = $index) {
              <p-step [value]="i"><ng-template #content>{{ step.label }}</ng-template></p-step>
            }
          </p-step-list>
        </p-stepper>
      </div>

      <!-- Step Content -->
      <div class="wizard-content">
        <!-- Step 1: Customer -->
        @if (activeStep() === 0) {
          <div class="invoiz-card wizard-panel">
            <h3 class="wizard-panel__title">Select Customer</h3>

            <p-autocomplete
              [(ngModel)]="selectedCustomer"
              [ngModelOptions]="{ standalone: true }"
              [suggestions]="filteredCustomers"
              (completeMethod)="searchCustomers($event)"
              field="name"
              placeholder="Search customers by name or company..."
              [style]="{ width: '100%' }"
              [inputStyle]="{ height: '48px', width: '100%' }"
              (onSelect)="onCustomerSelect($event)"
            ></p-autocomplete>

            <!-- Selected Customer Card -->
            @if (confirmedCustomer) {
              <div class="selected-customer-card">
                <div class="selected-customer-card__info">
                  <p class="selected-customer-card__name">{{ confirmedCustomer.name }}</p>
                  <p class="selected-customer-card__detail">{{ confirmedCustomer.company }}</p>
                  <p class="selected-customer-card__detail">{{ confirmedCustomer.email }}</p>
                  <p class="selected-customer-card__detail">{{ confirmedCustomer.phone }}</p>
                </div>
                <a class="selected-customer-card__change" (click)="clearCustomer()">Change</a>
              </div>
            }

            <!-- Create New -->
            @if (!confirmedCustomer && !showNewCustomerForm) {
              <p class="wizard-panel__or">
                Or <a (click)="showNewCustomerForm = true" class="wizard-panel__link">create new customer</a>
              </p>
            }

            @if (showNewCustomerForm) {
              <div class="new-customer-form">
                <h4 class="new-customer-form__title">New Customer</h4>
                <div class="form-grid form-grid--2col">
                  <div class="form-field">
                    <label class="form-label">Name *</label>
                    <input pInputText [formControl]="newCustomerForm.controls.name" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Company</label>
                    <input pInputText [formControl]="newCustomerForm.controls.company" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Email *</label>
                    <input pInputText [formControl]="newCustomerForm.controls.email" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label class="form-label">Phone</label>
                    <input pInputText [formControl]="newCustomerForm.controls.phone" class="form-input" />
                  </div>
                </div>
                <div class="form-field" style="margin-top: 12px">
                  <label class="form-label">Address</label>
                  <input pInputText [formControl]="newCustomerForm.controls.address" class="form-input" />
                </div>
                <div class="new-customer-form__actions">
                  <button pButton class="p-button-outlined p-button-sm" (click)="showNewCustomerForm = false">Cancel</button>
                  <button pButton class="p-button-primary p-button-sm" (click)="saveNewCustomer()">Add Customer</button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Step 2: Line Items -->
        @if (activeStep() === 1) {
          <div class="invoiz-card wizard-panel">
            <h3 class="wizard-panel__title">Line Items</h3>

            <div class="items-table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th class="items-table__col--product">Product / Service</th>
                    <th class="items-table__col--desc">Description</th>
                    <th class="items-table__col--qty">Qty</th>
                    <th class="items-table__col--price">Unit Price</th>
                    <th class="items-table__col--tax">Tax %</th>
                    <th class="items-table__col--amount">Amount</th>
                    <th class="items-table__col--action"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of itemsArray.controls; track $index) {
                    <tr [formGroup]="getItemGroup($index)">
                      <td class="items-table__col--product">
                        <p-autocomplete
                          formControlName="product"
                          [suggestions]="filteredProducts"
                          (completeMethod)="searchProducts($event)"
                          field="name"
                          placeholder="Search..."
                          [style]="{ width: '100%' }"
                          (onSelect)="onProductSelect($event, $index)"
                        ></p-autocomplete>
                      </td>
                      <td class="items-table__col--desc">
                        <input pInputText formControlName="description" class="form-input" placeholder="Description" />
                      </td>
                      <td class="items-table__col--qty">
                        <p-inputNumber formControlName="qty" [min]="1" [style]="{ width: '100%' }"
                          (onInput)="recalculate()"></p-inputNumber>
                      </td>
                      <td class="items-table__col--price">
                        <p-inputNumber formControlName="unitPrice" mode="currency" currency="MYR"
                          locale="en-MY" [min]="0" [style]="{ width: '100%' }"
                          (onInput)="recalculate()"></p-inputNumber>
                      </td>
                      <td class="items-table__col--tax">
                        <p-inputNumber formControlName="taxPercent" suffix="%" [min]="0" [max]="100"
                          [style]="{ width: '100%' }" (onInput)="recalculate()"></p-inputNumber>
                      </td>
                      <td class="items-table__col--amount">
                        <span class="items-table__amount">{{ getLineTotal($index) | currencyMyr }}</span>
                      </td>
                      <td class="items-table__col--action">
                        <button pButton class="p-button-text p-button-rounded p-button-danger remove-btn"
                                (click)="removeItem($index)" [disabled]="itemsArray.length <= 1">
                          <ph-icon name="trash" size="16" weight="bold"></ph-icon>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <button pButton class="p-button-outlined p-button-sm add-item-btn" (click)="addItem()">
              <ph-icon name="plus" size="16" weight="bold"></ph-icon>
              Add Line Item
            </button>

            <!-- Running Totals -->
            <div class="running-totals">
              <div class="running-totals__row">
                <span>Subtotal</span>
                <span>{{ calcSubtotal() | currencyMyr }}</span>
              </div>
              <div class="running-totals__row">
                <span>Tax</span>
                <span>{{ calcTax() | currencyMyr }}</span>
              </div>
              <div class="running-totals__row running-totals__row--total">
                <span>Total</span>
                <span>{{ calcGrandTotal() | currencyMyr }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Details -->
        @if (activeStep() === 2) {
          <div class="invoiz-card wizard-panel">
            <h3 class="wizard-panel__title">Invoice Details</h3>

            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Invoice Date *</label>
                <p-datepicker
                  [formControl]="detailsForm.controls.invoiceDate"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  [style]="{ width: '100%' }"
                ></p-datepicker>
              </div>
              <div class="form-field">
                <label class="form-label">Due Date *</label>
                <p-datepicker
                  [formControl]="detailsForm.controls.dueDate"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  [style]="{ width: '100%' }"
                ></p-datepicker>
              </div>
              <div class="form-field">
                <label class="form-label">Payment Terms</label>
                <p-select
                  [options]="paymentTermOptions"
                  [formControl]="detailsForm.controls.paymentTerms"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select terms"
                  [style]="{ width: '100%' }"
                  (onChange)="onPaymentTermChange($event)"
                ></p-select>
              </div>
              <div class="form-field">
                <label class="form-label">Reference # <span class="form-label--optional">(optional)</span></label>
                <input pInputText [formControl]="detailsForm.controls.reference" class="form-input" placeholder="PO-12345" />
              </div>
            </div>

            <div class="form-field" style="margin-top: 16px">
              <label class="form-label">Notes <span class="form-label--optional">(optional)</span></label>
              <textarea pTextarea [formControl]="detailsForm.controls.notes" [rows]="4"
                class="form-input" placeholder="Add any notes or payment instructions..."></textarea>
            </div>

            <!-- Additional Options -->
            <div class="additional-options">
              <button pButton class="p-button-text p-button-sm" (click)="showAdditionalOptions = !showAdditionalOptions">
                <ph-icon [name]="showAdditionalOptions ? 'caret-up' : 'caret-down'" size="16" weight="bold"></ph-icon>
                Additional Options
              </button>

              @if (showAdditionalOptions) {
                <div class="additional-options__content">
                  <div class="form-grid form-grid--2col">
                    <div class="form-field">
                      <label class="form-label">Discount</label>
                      <p-inputNumber [formControl]="detailsForm.controls.discountPercent"
                        suffix="%" [min]="0" [max]="100" [style]="{ width: '100%' }"></p-inputNumber>
                    </div>
                    <div class="form-field" style="display: flex; align-items: flex-end; padding-bottom: 4px">
                      <p-checkbox
                        [formControl]="detailsForm.controls.submitToLhdn"
                        [binary]="true"
                        label="Submit to LHDN after creation"
                      ></p-checkbox>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Step 4: Review -->
        @if (activeStep() === 3) {
          <div class="invoiz-card wizard-panel">
            <h3 class="wizard-panel__title">Review Invoice</h3>

            <!-- Validation Summary -->
            <div class="validation-summary" [class.validation-summary--valid]="isFormValid()"
                 [class.validation-summary--invalid]="!isFormValid()">
              <ph-icon [name]="isFormValid() ? 'check-circle' : 'warning'" size="20" weight="fill"></ph-icon>
              <span>{{ isFormValid() ? 'All details are complete. Ready to create invoice.' : 'Some required fields are missing. Please review previous steps.' }}</span>
            </div>

            <!-- Review: Customer -->
            <div class="review-section">
              <p class="review-section__label">Customer</p>
              @if (confirmedCustomer) {
                <p class="review-section__value-primary">{{ confirmedCustomer.name }}</p>
                <p class="review-section__value">{{ confirmedCustomer.company }}</p>
                <p class="review-section__value">{{ confirmedCustomer.email }}</p>
              } @else {
                <p class="review-section__value review-section__value--missing">No customer selected</p>
              }
            </div>

            <!-- Review: Items -->
            <div class="review-section">
              <p class="review-section__label">Line Items</p>
              <table class="review-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center">Qty</th>
                    <th style="text-align: right">Unit Price</th>
                    <th style="text-align: right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of itemsArray.controls; track $index) {
                    <tr>
                      <td>{{ getItemGroup($index).value.description || 'Untitled item' }}</td>
                      <td style="text-align: center">{{ getItemGroup($index).value.qty }}</td>
                      <td style="text-align: right">{{ getItemGroup($index).value.unitPrice | currencyMyr }}</td>
                      <td style="text-align: right">{{ getLineTotal($index) | currencyMyr }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <div class="running-totals" style="margin-top: 12px">
                <div class="running-totals__row">
                  <span>Subtotal</span>
                  <span>{{ calcSubtotal() | currencyMyr }}</span>
                </div>
                <div class="running-totals__row">
                  <span>Tax</span>
                  <span>{{ calcTax() | currencyMyr }}</span>
                </div>
                @if (detailsForm.value.discountPercent) {
                  <div class="running-totals__row">
                    <span>Discount ({{ detailsForm.value.discountPercent }}%)</span>
                    <span style="color: var(--status-overdue, #ef4444)">-{{ calcDiscount() | currencyMyr }}</span>
                  </div>
                }
                <div class="running-totals__row running-totals__row--total">
                  <span>Total</span>
                  <span>{{ calcFinalTotal() | currencyMyr }}</span>
                </div>
              </div>
            </div>

            <!-- Review: Details -->
            <div class="review-section">
              <p class="review-section__label">Details</p>
              <div class="review-details-grid">
                <div>
                  <span class="review-details__label">Invoice Date</span>
                  <span class="review-details__value">{{ detailsForm.value.invoiceDate | date:'dd MMM yyyy' }}</span>
                </div>
                <div>
                  <span class="review-details__label">Due Date</span>
                  <span class="review-details__value">{{ detailsForm.value.dueDate | date:'dd MMM yyyy' }}</span>
                </div>
                <div>
                  <span class="review-details__label">Payment Terms</span>
                  <span class="review-details__value">{{ getPaymentTermLabel() }}</span>
                </div>
                @if (detailsForm.value.reference) {
                  <div>
                    <span class="review-details__label">Reference</span>
                    <span class="review-details__value">{{ detailsForm.value.reference }}</span>
                  </div>
                }
              </div>
              @if (detailsForm.value.notes) {
                <div style="margin-top: 12px">
                  <span class="review-details__label">Notes</span>
                  <p class="review-details__value" style="white-space: pre-wrap">{{ detailsForm.value.notes }}</p>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Sticky Bottom Bar -->
      <div class="wizard-bottom-bar">
        <div class="wizard-bottom-bar__inner">
          <div class="wizard-bottom-bar__left">
            @if (activeStep() > 0) {
              <button pButton class="p-button-outlined" (click)="prevStep()">
                <ph-icon name="arrow-left" size="16" weight="bold"></ph-icon>
                Back
              </button>
            }
          </div>
          <div class="wizard-bottom-bar__right">
            <button pButton class="p-button-outlined" (click)="saveDraft()">
              Save Draft
            </button>
            @if (activeStep() < 3) {
              <button pButton class="p-button-primary" (click)="nextStep()">
                Continue
                <ph-icon name="arrow-right" size="16" weight="bold"></ph-icon>
              </button>
            } @else {
              <button pButton class="p-button-primary" (click)="createInvoice()">
                <ph-icon name="check" size="16" weight="bold"></ph-icon>
                Create Invoice
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      padding-bottom: 80px;
    }

    /* Steps Card */
    .wizard-steps-card {
      padding: 20px 32px;
      margin-bottom: 24px;
    }

    /* Panel */
    .wizard-panel {
      padding: 32px;
      margin-bottom: 24px;
    }

    .wizard-panel__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 20px;
    }

    .wizard-panel__or {
      font-size: 13px;
      color: var(--text-muted);
      margin: 16px 0 0;
    }

    .wizard-panel__link {
      color: var(--primary-color, #4f46e5);
      cursor: pointer;
      font-weight: 500;

      &:hover { text-decoration: underline; }
    }

    /* Selected Customer Card */
    .selected-customer-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      margin-top: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
      background: var(--surface-ground, #f8fafc);
    }

    .selected-customer-card__name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 2px;
    }

    .selected-customer-card__detail {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0;
      line-height: 1.5;
    }

    .selected-customer-card__change {
      font-size: 13px;
      color: var(--primary-color, #4f46e5);
      cursor: pointer;
      font-weight: 500;
      white-space: nowrap;

      &:hover { text-decoration: underline; }
    }

    /* New Customer Form */
    .new-customer-form {
      margin-top: 20px;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: none;
      background: var(--surface-ground, #f8fafc);
    }

    .new-customer-form__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px;
    }

    .new-customer-form__actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }

    /* Form Utilities */
    .form-grid {
      display: grid;
      gap: 16px;
    }

    .form-grid--2col {
      grid-template-columns: 1fr 1fr;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-label--optional {
      font-weight: 400;
      color: var(--text-muted);
    }

    .form-input {
      width: 100%;
    }

    /* Items Table */
    .items-table-wrapper {
      overflow-x: auto;
      margin-bottom: 16px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      min-width: 700px;
    }

    .items-table th {
      padding: 10px 8px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      border-bottom: 2px solid var(--card-border);
    }

    .items-table td {
      padding: 8px;
      vertical-align: middle;
      border-bottom: 1px solid var(--card-border);
    }

    .items-table__col--product { width: 240px; }
    .items-table__col--desc { }
    .items-table__col--qty { width: 80px; }
    .items-table__col--price { width: 140px; }
    .items-table__col--tax { width: 80px; }
    .items-table__col--amount { width: 120px; text-align: right; }
    .items-table__col--action { width: 48px; }

    .items-table th.items-table__col--amount { text-align: right; }

    .items-table__amount {
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
    }

    .remove-btn {
      width: 32px;
      height: 32px;
      padding: 0;
    }

    .add-item-btn {
      gap: 6px;
    }

    /* Running Totals */
    .running-totals {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-top: 20px;
    }

    .running-totals__row {
      display: flex;
      justify-content: space-between;
      width: 260px;
      padding: 6px 0;
      font-size: 13px;
      color: var(--text-secondary, #64748b);
    }

    .running-totals__row--total {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      border-top: 2px solid var(--card-border);
      margin-top: 4px;
      padding-top: 10px;
    }

    /* Additional Options */
    .additional-options {
      margin-top: 24px;
      border-top: 1px solid var(--card-border);
      padding-top: 16px;
    }

    .additional-options__content {
      margin-top: 16px;
    }

    /* Review */
    .validation-summary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .validation-summary--valid {
      background: #f0fdf4;
      color: #15803d;
    }

    .validation-summary--invalid {
      background: #fef2f2;
      color: #b91c1c;
    }

    .review-section {
      padding: 16px 0;
      border-bottom: 1px solid var(--card-border);

      &:last-child { border-bottom: none; }
    }

    .review-section__label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      margin: 0 0 8px;
    }

    .review-section__value-primary {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 2px;
    }

    .review-section__value {
      font-size: 13px;
      color: var(--text-secondary, #64748b);
      margin: 0;
      line-height: 1.5;
    }

    .review-section__value--missing {
      color: var(--status-overdue, #ef4444);
      font-style: italic;
    }

    .review-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .review-table th {
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      text-align: left;
      border-bottom: 1px solid var(--card-border);
    }

    .review-table td {
      padding: 8px 12px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--card-border);
    }

    .review-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .review-details__label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .review-details__value {
      font-size: 13px;
      color: var(--text-primary);
      margin: 0;
    }

    /* Bottom Bar */
    .wizard-bottom-bar {
      position: fixed;
      bottom: 0;
      left: var(--sidebar-width, 240px);
      right: 0;
      height: 64px;
      background: var(--card-bg, #ffffff);
      border-top: 1px solid var(--card-border);
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06);
      z-index: 100;
      display: flex;
      align-items: center;
    }

    .wizard-bottom-bar__inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 32px;
    }

    .wizard-bottom-bar__left,
    .wizard-bottom-bar__right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-grid--2col {
        grid-template-columns: 1fr;
      }

      .wizard-panel {
        padding: 20px;
      }

      .wizard-steps-card {
        padding: 16px;
      }

      .wizard-bottom-bar {
        left: 0;
      }

      .review-details-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class InvoiceFormComponent implements OnInit {
  private fb = new FormBuilder();
  private readonly invoiceStore = inject(InvoiceStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  activeStep = signal(0);
  showNewCustomerForm = false;
  showAdditionalOptions = false;

  isEdit = false;
  uuid = '';

  selectedCustomer: Customer | null = null;
  confirmedCustomer: Customer | null = null;
  filteredCustomers: Customer[] = [];
  filteredProducts: Product[] = [];

  steps = [
    { label: 'Customer' },
    { label: 'Items' },
    { label: 'Details' },
    { label: 'Review' },
  ];

  paymentTermOptions = [
    { label: 'Due on Receipt', value: 0 },
    { label: 'Net 14', value: 14 },
    { label: 'Net 30', value: 30 },
    { label: 'Net 60', value: 60 },
    { label: 'Net 90', value: 90 },
  ];

  customers: Customer[] = [];
  products: Product[] = [];

  // New customer form
  newCustomerForm = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    company: this.fb.nonNullable.control(''),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    phone: this.fb.nonNullable.control(''),
    address: this.fb.nonNullable.control(''),
  });

  // Line items form
  itemsForm = this.fb.group({
    items: this.fb.array([this.createItem(), this.createItem()]),
  });

  // Details form
  detailsForm = this.fb.group({
    invoiceDate: this.fb.control<Date | null>(new Date(), Validators.required),
    dueDate: this.fb.control<Date | null>(null, Validators.required),
    paymentTerms: this.fb.nonNullable.control(30),
    reference: this.fb.nonNullable.control(''),
    notes: this.fb.nonNullable.control(''),
    discountPercent: this.fb.nonNullable.control(0),
    submitToLhdn: this.fb.nonNullable.control(true),
  });

  constructor() {
    this.onPaymentTermChange({ value: 30 });
  }

  async ngOnInit(): Promise<void> {
    this.uuid = this.route.snapshot.paramMap.get('uuid') ?? '';
    this.isEdit = !!this.uuid;
    await this.loadFormData();
    if (this.isEdit) {
      await this.invoiceStore.loadInvoice(this.uuid);
      this.populateFormFromInvoice();
    }
  }

  async loadFormData(): Promise<void> {
    const [customersRes, productsRes] = await Promise.all([
      customersControllerFindAll({ query: { limit: 100 } }),
      productsControllerFindAll({ query: { limit: 100 } }),
    ]);
    this.customers = (customersRes.data as any)?.data ?? customersRes.data ?? [];
    this.products = (productsRes.data as any)?.data ?? productsRes.data ?? [];
  }

  private populateFormFromInvoice(): void {
    const inv = this.invoiceStore.selectedInvoice();
    if (!inv) return;

    // Customer
    if (inv.customer) {
      this.confirmedCustomer = {
        id: inv.customer.id ?? inv.customer.uuid,
        name: inv.customer.name ?? '',
        company: inv.customer.company ?? '',
        email: inv.customer.email ?? '',
        phone: inv.customer.phone ?? '',
      };
      this.selectedCustomer = this.confirmedCustomer;
    }

    // Line items
    const items = inv.items ?? inv.lineItems ?? [];
    this.itemsArray.clear();
    items.forEach((item: any) => {
      const group = this.createItem();
      group.patchValue({
        description: item.description ?? item.name ?? '',
        qty: item.quantity ?? item.qty ?? 1,
        unitPrice: item.unitPrice ?? item.price ?? 0,
        taxPercent: item.taxPercent ?? item.tax ?? 8,
      });
      this.itemsArray.push(group);
    });
    if (this.itemsArray.length === 0) this.itemsArray.push(this.createItem());

    // Details
    this.detailsForm.patchValue({
      invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate) : new Date(),
      dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
      paymentTerms: inv.paymentTerms ?? 30,
      reference: inv.reference ?? '',
      notes: inv.notes ?? '',
      discountPercent: inv.discountPercent ?? 0,
      submitToLhdn: inv.submitToLhdn ?? true,
    });
  }

  private formData(): any {
    const items = this.itemsArray.controls.map((ctrl) => {
      const v = (ctrl as FormGroup).value;
      return {
        description: v.description,
        quantity: v.qty,
        unitPrice: v.unitPrice,
        taxPercent: v.taxPercent,
      };
    });

    return {
      customerId: this.confirmedCustomer?.id,
      items,
      invoiceDate: this.detailsForm.value.invoiceDate?.toISOString(),
      dueDate: this.detailsForm.value.dueDate?.toISOString(),
      paymentTerms: this.detailsForm.value.paymentTerms,
      reference: this.detailsForm.value.reference,
      notes: this.detailsForm.value.notes,
      discountPercent: this.detailsForm.value.discountPercent,
      submitToLhdn: this.detailsForm.value.submitToLhdn,
    };
  }

  get itemsArray(): FormArray {
    return this.itemsForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      product: [null],
      description: [''],
      qty: [1],
      unitPrice: [0],
      taxPercent: [8],
    });
  }

  getItemGroup(index: number): FormGroup {
    return this.itemsArray.at(index) as FormGroup;
  }

  addItem(): void {
    this.itemsArray.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.recalculate();
    }
  }

  getLineTotal(index: number): number {
    const item = this.getItemGroup(index).value;
    const qty = item.qty || 0;
    const price = item.unitPrice || 0;
    const tax = item.taxPercent || 0;
    return qty * price * (1 + tax / 100);
  }

  calcSubtotal(): number {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const item = this.getItemGroup(i).value;
      total += (item.qty || 0) * (item.unitPrice || 0);
    }
    return total;
  }

  calcTax(): number {
    let tax = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const item = this.getItemGroup(i).value;
      tax += (item.qty || 0) * (item.unitPrice || 0) * ((item.taxPercent || 0) / 100);
    }
    return tax;
  }

  calcGrandTotal(): number {
    return this.calcSubtotal() + this.calcTax();
  }

  calcDiscount(): number {
    const pct = this.detailsForm.value.discountPercent || 0;
    return this.calcGrandTotal() * (pct / 100);
  }

  calcFinalTotal(): number {
    return this.calcGrandTotal() - this.calcDiscount();
  }

  recalculate(): void {
    // Triggers change detection for computed values
  }

  // Customer search
  searchCustomers(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredCustomers = this.customers.filter(
      c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q),
    );
  }

  onCustomerSelect(event: any): void {
    this.confirmedCustomer = event.value ?? event;
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.confirmedCustomer = null;
  }

  saveNewCustomer(): void {
    if (this.newCustomerForm.valid) {
      const val = this.newCustomerForm.getRawValue();
      this.confirmedCustomer = {
        id: Date.now(),
        name: val.name,
        company: val.company,
        email: val.email,
        phone: val.phone,
        address: val.address,
      };
      this.showNewCustomerForm = false;
    }
  }

  // Product search
  searchProducts(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(q));
  }

  onProductSelect(event: any, index: number): void {
    const product = event.value ?? event;
    const group = this.getItemGroup(index);
    group.patchValue({
      description: product.name,
      unitPrice: product.price,
    });
  }

  // Payment terms
  onPaymentTermChange(event: { value: number }): void {
    const days = event.value;
    const invoiceDate = this.detailsForm.value.invoiceDate || new Date();
    const due = new Date(invoiceDate);
    due.setDate(due.getDate() + days);
    this.detailsForm.patchValue({ dueDate: due });
  }

  getPaymentTermLabel(): string {
    const val = this.detailsForm.value.paymentTerms;
    return this.paymentTermOptions.find(o => o.value === val)?.label ?? '';
  }

  // Validation
  isFormValid(): boolean {
    return !!this.confirmedCustomer && this.itemsArray.length > 0 && !!this.detailsForm.value.invoiceDate && !!this.detailsForm.value.dueDate;
  }

  // Navigation
  onStepChange(index: number | undefined): void {
    if (index != null) this.activeStep.set(index);
  }

  prevStep(): void {
    if (this.activeStep() > 0) {
      this.activeStep.update(s => s - 1);
    }
  }

  nextStep(): void {
    if (this.activeStep() < 3) {
      this.activeStep.update(s => s + 1);
    }
  }

  async saveDraft(): Promise<void> {
    try {
      if (this.isEdit) {
        await this.invoiceStore.updateInvoice(this.uuid, this.formData());
        this.notification.success('Draft saved');
      } else {
        const result = await this.invoiceStore.createInvoice(this.formData());
        this.notification.success('Draft saved');
        const newUuid = (result as any)?.uuid ?? (result as any)?.id;
        if (newUuid) {
          this.uuid = newUuid;
          this.isEdit = true;
        }
      }
    } catch { this.notification.error('Failed to save draft'); }
  }

  async createInvoice(): Promise<void> {
    try {
      if (this.isEdit) {
        await this.invoiceStore.updateInvoice(this.uuid, this.formData());
        this.notification.success('Invoice updated');
      } else {
        await this.invoiceStore.createInvoice(this.formData());
        this.notification.success('Invoice created');
      }
      this.router.navigate(['/app/invoices']);
    } catch { this.notification.error('Failed to save invoice'); }
  }
}
