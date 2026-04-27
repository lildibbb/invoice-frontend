# Forms, Validation & UI/UX Overhaul Design

**Date:** 2026-02-28
**Status:** Approved

## Problem Statement

The frontend has functional pages but most forms lack proper validation, don't use shadcn Form components consistently, and ignore backend DTO constraints. Customers and Products pages have zero validation. LHDN codes (8 JSON files, ~3,600 entries) are not validated on the frontend at all. Invoice create/edit lacks a live preview matching the PDF template. File structure has no centralized schema layer.

## Decisions

- **Architecture:** Centralized schema layer with shared form components (Approach B)
- **LHDN codes:** Copy all 8 JSON files as static data into the frontend for instant search/autocomplete and offline validation
- **Form pattern:** Modal dialogs for simple entities (customers, products, payments, team, tax); dedicated side-by-side pages for complex entities (invoices, quotations)
- **Invoice/Quotation UX:** Side-by-side layout — form (55%) on left, live PDF preview (45%) on right, debounced 300ms
- **Validation timing:** Real-time (mode: 'onChange') with field-level error messages
- **Combobox for LHDN:** Searchable autocomplete with code + description, virtualized for large lists

---

## 1. File Structure

```
lib/
├── constants/
│   └── lhdn/
│       ├── classification-codes.json   # 45 entries
│       ├── tax-types.json              # 7 entries
│       ├── payment-codes.json          # 8 entries
│       ├── msic-codes.json             # 1,175 entries
│       ├── state-codes.json            # 17 entries
│       ├── country-codes.json          # 253 entries
│       ├── unit-measure-codes.json     # 2,161 entries
│       ├── einvoice-types.json         # 8 entries
│       └── index.ts                    # Typed exports, lookup Maps, search helpers
│
├── validators/
│   ├── auth.ts          # loginSchema, forgotPasswordSchema, acceptInviteSchema, registerUserSchema
│   ├── customer.ts      # createCustomerSchema, updateCustomerSchema
│   ├── product.ts       # createProductSchema, updateProductSchema
│   ├── invoice.ts       # (enhance existing) invoiceFormSchema with LHDN fields
│   ├── quotation.ts     # createQuotationSchema
│   ├── company.ts       # updateCompanySchema
│   ├── recurring.ts     # createRecurringSchema
│   ├── payment.ts       # recordPaymentSchema
│   ├── team.ts          # inviteMemberSchema
│   ├── tax.ts           # taxRuleSchema, taxCategorySchema
│   └── template.ts      # invoiceTemplateSchema
│
├── types/
│   └── lhdn.ts          # LhdnIdType enum, code types (inferred from zod)

components/forms/
├── form-input.tsx         # Text input with label, error, helper text, maxLength counter
├── form-textarea.tsx      # Multiline with char counter
├── form-select.tsx        # Standard dropdown (small lists)
├── form-combobox.tsx      # Searchable autocomplete (LHDN codes, customers, products)
├── form-date-picker.tsx   # Calendar picker with date validation
├── form-switch.tsx        # Boolean toggle
├── form-number-input.tsx  # Numeric with min/max, step, currency formatting
├── form-phone-input.tsx   # Phone with formatting
└── form-password-input.tsx # Password with show/hide toggle + strength indicator
```

## 2. Schema Layer

Every schema mirrors its backend DTO exactly: same field names, same constraints (maxLength, regex, enums, min/max). Types inferred via `z.infer<typeof schema>`.

### Key Validation Rules (from backend DTOs)

**Auth:**
- Password: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/` (8+ chars, upper, lower, digit, special)
- Email: valid email format

**Customer:**
- TIN: `/^[A-Z0-9-]+$/` (uppercase letters, digits, hyphens)
- ID Type: enum `NRIC | PASSPORT | BRN | ARMY`
- Country: exactly 3 chars, validated against country-codes.json
- State: validated against state-codes.json
- Required: name, email, phone, addressLine1, city, state

**Product:**
- Classification code: exactly 3 digits, validated against classification-codes.json
- Unit of measure: validated against unit-measure-codes.json
- Country of origin: exactly 3 chars, validated against country-codes.json
- Price: ≥ 0
- taxExemptionReason: required when isTaxExempt = true (conditional validation via `.refine()`)

**Company:**
- MSIC code: max 5 chars, validated against msic-codes.json
- Country: exactly 3 chars, validated against country-codes.json
- BRN, TIN: max 50 chars
- Required: name, tin, brn, phone, email, addressLine1, postalCode, city, state, country

**Invoice:**
- Invoice date: ISO date string, max 30 days in future
- Currency: max 3 chars (ISO 4217)
- Items: min 1 item, each with quantity ≥ 1, unitPrice ≥ 0, taxRate 0-100

**Payment:**
- Payment method: validated against payment-codes.json
- Amount: ≥ 0

## 3. Shared Form Components

Each component wraps shadcn's `<FormField>` + `<FormItem>` + `<FormLabel>` + `<FormControl>` + `<FormMessage>`. Accepts `control` and `name` from react-hook-form context.

### FormCombobox (critical for LHDN codes)
- Virtualized rendering via `@tanstack/react-virtual` for 2000+ items
- Searches both code AND description simultaneously
- Recently used items appear at the top (localStorage)
- Selected item shows as formatted text: `[CODE] Description`
- Debounced search input (150ms)
- Keyboard navigation (arrow keys + enter)

### FormInput
- Optional `maxLength` prop shows character counter ("12/255")
- Optional `transform` prop for auto-uppercase (TIN fields)
- Error message with fade-in animation

### FormPasswordInput
- Show/hide toggle (Eye/EyeOff icon)
- Password strength indicator bar (weak/fair/good/strong)
- Rules checklist: ✓ 8+ characters, ✓ uppercase, ✓ lowercase, ✓ number, ✓ special char

### FormDatePicker
- shadcn Calendar in a Popover
- Optional `maxFutureDays` prop (invoice date: 30 days)
- Formatted display: "28 Feb 2026"

### FormNumberInput
- Optional currency prefix ("RM")
- Optional step value
- Min/max constraints enforced

## 4. Invoice & Quotation — Side-by-Side Preview

**Routes:** `/invoices/new`, `/invoices/[uuid]/edit`, `/quotations/new`, `/quotations/[uuid]/edit`

**Layout:** 55% form (left, scrollable) | 45% preview (right, sticky)

**Preview sections (matching invoice-pdf.service.ts):**
1. Header: company logo + name + address + TIN/BRN + invoice number
2. Bill To: customer info (left) + metadata box (right) with date, currency, payment method
3. Line Items: 6-column table (description, qty, unit price, tax, tax amount, amount)
4. Tax Summary: subtotal → discount → tax buckets (grouped by rate) → rounding → total
5. Payment Instructions: bank name, account number (if not PAID)
6. Terms & Conditions: configurable per template

**Live update:** `useWatch()` on form values, debounced 300ms, re-renders preview component.

**Mobile:** Form full-width; preview accessible via "Preview" tab button at bottom.

**Quotation variant:** Header says "QUOTATION", adds "Valid Until" field, no payment section.

## 5. Page-by-Page Form Design

### Modal Forms (create/edit in dialogs):

| Entity | Required Fields | LHDN Validation |
|--------|----------------|-----------------|
| Customer | name, email, phone, addressLine1, city, state | TIN regex, state/country code lookup, ID type enum |
| Product | name, price | Classification code lookup, UoM lookup, country lookup |
| Payment | amount, paymentDate | Payment code lookup |
| Recurring | frequency, startDate, items[] | Same as invoice items |
| Team Invite | name, email, role | — |
| Tax Rule | name, rate | — |
| Tax Category | code, description | — |
| Template | name | — |

### Settings Forms (inline):
- Company Settings: enhance with MSIC combobox, state/country comboboxes, BRN/TIN validation
- Auth pages: migrate to shadcn Form, add password strength indicator

## 6. Error Handling & UX

### Form Validation
- Mode: `'onChange'` — real-time validation as user types
- Field-level error messages with `<FormMessage>` beneath each input
- MaxLength counters on text fields
- Conditional fields animate in/out (e.g., taxExemptionReason)
- Dirty state tracking with "Unsaved changes" warning on navigation

### Server Errors
- 422 validation errors mapped to specific fields via `setError()`
- Network errors: toast with retry action
- 409 conflicts: dialog with explanation

### Loading
- Submit buttons: spinner + "Saving..." text
- Optimistic updates for delete actions
- Combobox: 300ms debounce, loading skeleton during fetch

### LHDN Combobox UX
- Virtualized list (only renders visible rows)
- Search matches code AND description
- Recently used codes at top (localStorage key per code type)
- Clear button to reset selection

## 7. Performance Considerations

- LHDN JSON files: imported as static modules, tree-shaken per page (only import what's needed)
- Large lists (MSIC 1175, UoM 2161): virtualized rendering, never render full DOM
- Invoice preview: debounced 300ms, memoized calculation functions
- Form components: memo'd to prevent unnecessary re-renders
- Combobox search: runs in-memory on static data, no API calls
