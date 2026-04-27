# Full Endpoint Coverage + Glassmorphism UI Revamp

**Date:** 2026-02-28
**Status:** Approved

## Problem Statement

Deep audit revealed: 4 missing pages (Credit Memos, LHDN Notifications, Reset Password, Dashboard Charts), 12 unused SDK endpoints, 10 broken/wrong implementations (currency text input, raw select in line items, customer search not wired, LHDN credentials not listing, company settings type-unsafe, e-invoice retry/QR unused, PDF download unwired, template set-default unused). Dashboard has zero charts despite 3 analytics endpoints available. UI lacks visual distinctiveness.

## Decisions

- **Scope:** Full coverage — fix all broken items + add all missing pages + charts + glassmorphism UI
- **Charts:** Recharts (lightweight, React-native, good shadcn integration)
- **Style:** Modern glassmorphism — frosted glass cards, gradient accents, backdrop-blur, layered shadows
- **Credit Memos:** Include as new page accessible from invoice detail
- **LHDN Notifications:** Tab or sub-page under LHDN settings
- **Reset Password:** Complete the forgot → reset auth flow

---

## 1. Glassmorphism Design System

### CSS Utility Classes (globals.css)
```css
.glass-card {
  @apply backdrop-blur-xl bg-white/70 border border-white/20 shadow-xl shadow-black/5 rounded-xl;
}
.glass-input {
  @apply bg-white/80 backdrop-blur-sm border-white/30;
}
```

### Design Tokens
- **Glass card:** `backdrop-blur-xl bg-white/70 border border-white/20 shadow-xl shadow-black/5`
- **Stat card accents:** gradient bars — blue→indigo, emerald→teal, amber→orange, rose→pink
- **Page background:** subtle mesh gradient (radial gradients at corners, very light)
- **Primary button:** gradient `from-blue-500 to-blue-600`, hover `from-blue-600 to-blue-700`
- **Dialog overlay:** `backdrop-blur-sm bg-black/40`
- **Hover:** `hover:shadow-2xl hover:bg-white/80 transition-all duration-200`
- **Chart cards:** glass container with colored glow accent
- **Sidebar:** keep `#0F172A`, no change

### Components to Restyle
- StatCard, PageHeader, DataTable wrapper, Dialog, all Card usages
- Input/Select backgrounds → glass-input
- Page containers → mesh gradient background

---

## 2. Critical Fixes

### 2.1 Currency Dropdown
- Replace `<FormInput name="currency">` with `<FormCombobox>` in:
  - `/invoices/new/page.tsx`
  - `/quotations/new/page.tsx`
- Currency list: MYR, USD, SGD, EUR, GBP, AUD, JPY, CNY, THB, IDR, PHP, INR, HKD, TWD, KRW
- Default: MYR

### 2.2 Line Item Product Selector
- Replace raw `<select>` with `<FormCombobox>` in invoice/quotation create/edit pages
- Items: `[SKU] Product Name — RM price`
- On select: auto-fill description, unitPrice, taxRate, classificationCode from product data

### 2.3 Customer Search
- Fix `useCustomers` hook: pass `search` param to SDK call
- Enable real-time search in customer combobox

### 2.4 LHDN Credentials Display
- Add credential details display on LHDN settings page
- Show: clientId (masked), environment, status, last validated date
- Wire to existing status endpoint properly

### 2.5 Type Safety
- Create `CompanyStats` interface for company settings page
- Remove all `(any)` casts in settings/page.tsx

### 2.6 E-Invoice Enhancements
- Wire retry button to `eInvoiceSubmissionsControllerRetry`
- Add QR code display via `eInvoiceSubmissionsControllerGetQrCode`

### 2.7 PDF Download
- Wire download button on invoice detail to `invoicesControllerDownloadDemoPdf`
- Open PDF in new tab or trigger download

### 2.8 Template Set Default
- Add "Set Default" action in templates page dropdown
- Wire to `invoiceTemplatesControllerSetDefault`

### 2.9 Products Field Normalization
- Audit field name usage, ensure consistent with API response

---

## 3. New Pages

### 3.1 Credit Memos (`/invoices/[uuid]/credit-memos` or dialog)
- Accessible from invoice detail page
- List credit memos for invoice with StatusBadge (DRAFT/ISSUED/VOIDED)
- Create dialog: amount, reason
- Issue action (draft→issued)
- Void action with reason dialog
- Query hooks: useInvoiceCreditMemos, useCreateCreditMemo, useIssueCreditMemo, useVoidCreditMemo

### 3.2 LHDN Notifications (tab under `/settings/lhdn`)
- "Sync Now" button → POST `/lhdn/notifications/sync`
- Notifications table: date, type, document, message, status
- Auto-refresh after sync
- Query hooks: useLhdnNotifications, useSyncLhdnNotifications

### 3.3 Reset Password (`/reset-password`)
- Auth layout (split panel)
- Token from URL search params
- FormPasswordInput with strength meter + confirm
- Calls `authControllerResetPassword`
- Success → redirect to login

### 3.4 Dashboard Charts (Recharts)
- **Monthly Revenue:** AreaChart from `/analytics/revenue/monthly` — 12-month view, gradient fill
- **AR Aging:** BarChart from `/analytics/aging` — stacked bars (Current, 30d, 60d, 90d+)
- **Invoice Distribution:** PieChart/DonutChart from dashboard stats — by status
- All wrapped in glassmorphism cards with gradient accent borders

---

## 4. Missing Endpoint Wiring

### Query Hooks to Add
- `useAgingReport()` — `/analytics/aging`
- `useLhdnNotifications()` — `/lhdn/notifications`
- `useSyncLhdnNotifications()` — POST `/lhdn/notifications/sync`
- `useLhdnDocumentTypes()` — `/lhdn/document-types`
- `useCreateCreditMemo()` — POST `/credit-memos/invoices/:uuid`
- `useIssueCreditMemo()` — POST `/credit-memos/:memoUuid/issue`
- `useVoidCreditMemo()` — PATCH `/credit-memos/:memoUuid/void`
- `useInvoiceCreditMemos()` — GET `/credit-memos/invoices/:uuid`
- `useRetryEInvoice()` — POST `/e-invoice-submissions/:uuid/retry`
- `useEInvoiceQrCode()` — GET `/e-invoice-submissions/:uuid/qr-code`
- `useSetDefaultTemplate()` — PATCH `/invoice-templates/:uuid/set-default`
- `useDownloadInvoicePdf()` — GET `/invoices/:uuid/pdf/demo`
- `useResetPassword()` — POST `/auth/reset-password`

### Superadmin Missing Actions
- Company: restore, toggle status (activate/deactivate)
- Users: restore, delete
- Audit: company timeline tab

---

## 5. Dashboard Redesign

### Layout
```
┌─────────────────────────────────────────────────────┐
│  Good morning, John          [Quick Actions...]     │
├──────────┬──────────┬──────────┬───────────────────┤
│  Revenue │ Invoices │ Overdue  │  Pending Approval  │
│  RM 125K │   47     │   8      │      3             │
│  ↑12.5%  │  ↑5      │  ↓2     │                    │
├──────────┴──────────┴──────────┴───────────────────┤
│  Monthly Revenue (AreaChart)         │  AR Aging    │
│  ████████████████████████████        │  ████████    │
│  ██████████████████████████████      │  ██████      │
│                                       │  ████        │
├───────────────────────────────┬───────┴────────────┤
│  Invoice Distribution (Donut) │  Recent Invoices   │
│       ████████                 │  INV-001 RM 1,200  │
│     ██        ██               │  INV-002 RM 450    │
│       ████████                 │  INV-003 RM 2,100  │
└───────────────────────────────┴────────────────────┘
```

All cards use glassmorphism styling. Stat cards have gradient accent bars.

---

## 6. Performance

- Recharts: lazy-loaded via `dynamic(() => import(...), { ssr: false })`
- Large combobox lists still use virtualization
- Currency list is static (15 items, no virtualization needed)
- Dashboard charts debounce refetch on company switch
