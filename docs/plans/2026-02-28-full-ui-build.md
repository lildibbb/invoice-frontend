# Invoiz Frontend — Full UI Build Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all 24 pages (18 dashboard + 6 landing page) as premium enterprise-grade UI with Phosphor duotone icons, restyled PrimeNG, dark sidebar + light content dashboard, and GSAP-animated landing page — hand-crafted, no Stitch, no emoji.

**Architecture:** Angular 19 standalone components with PrimeNG restyled via custom CSS theme. Astro 5 static pages with GSAP ScrollTrigger animations. Phosphor Icons (duotone) for all iconography across both apps. Real Malaysian sample data (RM currency, LHDN statuses, Malaysian company names).

**Tech Stack:**
- Dashboard: Angular 19 + PrimeNG 21 + NgRx Signals + Tailwind CSS + ApexCharts + Phosphor Icons
- Landing Page: Astro 5 + Tailwind CSS + GSAP ScrollTrigger + Phosphor Icons + Bricolage Grotesque font

---

## Phase 1: Foundation — Design System & Shared Components

### Task 1: Install Phosphor Icons in both apps

**Dashboard:**
- Install: `cd dashboard && pnpm add phosphor-icons` (or `@phosphor-icons/web`)
- Note: For Angular, we use the web components or SVG approach via `@phosphor-icons/core`

**Landing Page:**
- Install: `cd landing-page && pnpm add @iconify-json/ph`
- Update `astro.config.mjs` icon integration to include `ph: ['*']`

**Nav items file:** Update `dashboard/src/app/layout/app-shell/nav-items.ts` — replace all `pi pi-*` icon classes with Phosphor icon identifiers.

### Task 2: Dashboard Design System — Custom PrimeNG Theme + Global Styles

**File:** `dashboard/src/styles.scss`

Create a comprehensive custom theme that overrides PrimeNG defaults:
- Sidebar: `#0F172A` (slate-900), 240px width
- Active nav item: 3px left `#3B82F6` border + `rgba(59,130,246,0.12)` bg
- Content area: `#F8FAFC` background
- Cards: white `#FFFFFF`, border `#E2E8F0`, border-radius 12px
- Tables: 52px row height, stripe `#FAFAFA`, hover `#F8FAFC`
- Buttons primary: `#3B82F6`, radius 8px
- Inputs: 40px height, 8px radius, `#E2E8F0` border, `#3B82F6` focus ring
- Status badges: emerald/red/blue/gray/violet/amber pill badges
- Font: Inter throughout, 14px base
- Modal backdrop: `rgba(0,0,0,0.5)` blur(4px)

### Task 3: Dashboard Shared Components

Create reusable components in `dashboard/src/app/shared/`:

**`shared/components/stat-card/`** — KPI card with colored top accent bar, icon, metric, label, delta %
**`shared/components/status-badge/`** — Invoice status pill badge (input: status enum → color mapping)
**`shared/components/page-header/`** — Page title + breadcrumb + action buttons slot
**`shared/components/empty-state/`** — Illustration + message + CTA for empty tables
**`shared/components/phosphor-icon/`** — Wrapper component for Phosphor icon rendering
**`shared/pipes/currency.pipe.ts`** — `RM X,XXX.XX` Malaysian Ringgit formatter

### Task 4: Restyle App Shell — Dark Sidebar + Light Content

**File:** `dashboard/src/app/layout/app-shell/app-shell.component.ts`

Complete rebuild:
- Dark sidebar (`#0F172A`), 240px fixed width
- Logo + company switcher dropdown at top
- Grouped nav sections: MAIN, CUSTOMERS, FINANCE, SETTINGS
- Phosphor duotone icons for every nav item
- Active state: blue left border + tinted bg + white text
- Collapsible to 64px icon-only on tablet
- Hidden + hamburger drawer on mobile
- White top header bar (64px) with: page title, search, notifications bell with badge, user avatar dropdown
- Content area: `#F8FAFC` bg, 24px padding

### Task 5: Landing Page Design System — Update Tailwind Config + Global CSS

**Files:**
- `landing-page/tailwind.config.mjs` — Add full brand color palette (abyss, charcoal, starlight, moonbeam, etc.)
- `landing-page/src/styles/global.css` — Add Bricolage Grotesque font import, gradient text utility, dark section base styles
- `landing-page/astro.config.mjs` — Add Phosphor icons (`ph: ['*']`) to icon integration

---

## Phase 2: Auth Pages

### Task 6: Login Page (Dashboard)

**File:** `dashboard/src/app/features/auth/login/login.component.ts`

Split-screen layout:
- Left 45%: Dark slate-900 panel with blue/violet gradient bloom, Invoiz logo, testimonial quote, trust badges (Phosphor icons: ShieldCheck, Lock, Certificate)
- Right 55%: White form — "Welcome back" heading, email input, password input (show/hide toggle), remember me checkbox, forgot password link, Sign In button (full-width blue), divider "or continue with", Google SSO button
- Footer: "Don't have an account? Start free trial" link
- Mobile: left panel collapses to thin header

### Task 7: Forgot Password Page (Dashboard)

**File:** `dashboard/src/app/features/auth/forgot-password/forgot-password.component.ts`

Simple centered form on auth layout:
- Heading: "Reset your password"
- Email input + "Send Reset Link" button
- "Back to login" link

### Task 8: Accept Invite Page (Dashboard)

**File:** `dashboard/src/app/features/auth/accept-invite/accept-invite.component.ts`

Auth layout form:
- Shows company name that invited, inviter name
- Set password form
- Accept & Join button

---

## Phase 3: Core Dashboard Pages

### Task 9: Dashboard Overview

**File:** `dashboard/src/app/features/dashboard/dashboard.component.ts`

- 4 KPI stat cards (using shared stat-card): Revenue RM 145,230 / Outstanding RM 28,400 / Overdue 3 / LHDN 342
- Revenue trend chart (ApexCharts area line, 12-month) + Invoice status donut (side by side 2/3 + 1/3)
- Recent Invoices table (PrimeNG p-table, 5 rows, status badges)
- Pending Actions card (list with colored left borders)
- Quick action buttons row: Create Invoice / Record Payment / Submit to LHDN

### Task 10: Invoices List

**File:** `dashboard/src/app/features/invoices/invoice-list/invoice-list.component.ts`

- Stats row: Total / Paid / Outstanding / Overdue chips
- Filter bar: Search input + Status multi-select + Date range + Customer filter + Export + column settings
- PrimeNG p-table: Checkbox, Invoice #, Customer, Issue Date, Due Date, Amount (RM), Status badge, LHDN badge, Actions (view/edit/more dropdown)
- Batch action bar when checkboxes selected
- Pagination
- 8 sample rows with varied statuses

### Task 11: Invoice Detail

**File:** `dashboard/src/app/features/invoices/invoice-detail/invoice-detail.component.ts`

Two-column layout (65% + 35%):
- Left: Invoice PDF preview card (rendered HTML, not iframe) — company header, customer details, line items table, subtotal/SST/total, QR code area, payment terms
- Right sticky sidebar: Status timeline stepper, Action buttons, Customer info card, Financial summary card, LHDN status card (violet), Payment history, Activity log

### Task 12: Invoice Create/Edit Wizard

**File:** `dashboard/src/app/features/invoices/invoice-form/invoice-form.component.ts`

4-step PrimeNG p-steps wizard:
- Step 1 (Customer): Autocomplete search + quick-create
- Step 2 (Items): Line item table — product autocomplete, description, qty, unit price, tax %, line total, add/remove. Running totals sidebar.
- Step 3 (Details): Date pickers, payment terms dropdown, reference, notes textarea
- Step 4 (Review): Rendered preview + submit/save draft
- Sticky bottom bar: Back + Save Draft + Continue/Submit

---

## Phase 4: Supporting Feature Pages

### Task 13: Customers List

**File:** `dashboard/src/app/features/customers/customer-list/customer-list.component.ts`

- Stats row: Total 142 / Active 138 / Total Invoiced RM 847K / Outstanding RM 28.4K
- Search + Status filter
- PrimeNG table: Avatar+Name, Company, Email, Phone, Total Invoiced, Outstanding, Status, Actions
- 6 Malaysian sample rows

### Task 14: Customer Detail

**File:** `dashboard/src/app/features/customers/customer-detail/customer-detail.component.ts`

- Profile header card: Avatar initials, name, company, status badge, stats chips, contact info
- PrimeNG TabView: Invoices (filtered table) / Payments / Notes / Activity
- Quick note input

### Task 15: Quotations List

**File:** `dashboard/src/app/features/quotations/quotation-list/quotation-list.component.ts`

Similar to invoices list but:
- Status badges: Draft/Sent/Accepted/Expired/Rejected
- "Convert to Invoice" action button (green) on accepted quotations
- Sample rows with quotation numbers QUO-2025-XXX

### Task 16: Products Catalog

**File:** `dashboard/src/app/features/products/product-list/product-list.component.ts`

- Type badges: Product (blue) / Service (violet)
- Table: Code, Name, Type, Unit Price, Tax %, Category, Status, Actions
- Table/Grid view toggle
- 5 sample products/services

### Task 17: Payments List

**File:** `dashboard/src/app/features/payments/payment-list/payment-list.component.ts`

- Stats: Total Collected / This Month / Pending / Overdue
- Table: Date, Invoice #, Customer, Amount, Method badge, Reference, Recorded By, Actions
- Method badges: Bank Transfer/Cash/FPX/Credit Card/Cheque
- "Record Payment" modal (p-dialog): invoice search, amount, date, method dropdown, reference, notes

---

## Phase 5: LHDN Module Pages

### Task 18: LHDN e-Invoices List

**File:** `dashboard/src/app/features/e-invoices/e-invoice-list/e-invoice-list.component.ts`

- Stats: Submitted 342 / Valid 338 / Invalid 2 / Cancelled 2 / Success Rate 98.8%
- Filter tabs (pill-style): All/Submitted/Valid/Invalid/Cancelled/Pending
- Table: Invoice #, Customer, Submitted At, LHDN UUID (monospace), Status (violet/emerald/red), Actions
- Row click opens p-sidebar drawer: Full UUID, timestamp, validation JSON, QR code, MyInvois link, retry

---

## Phase 6: Settings Module Pages

### Task 19: Settings Layout + Company Profile

**Files:**
- `dashboard/src/app/features/settings/settings.component.ts` — Settings layout with left vertical tab nav
- `dashboard/src/app/features/settings/company/settings-company.component.ts`

Settings layout: Left tab nav (Company Profile / LHDN / Templates / Team / Billing) + Right content
Company Profile form: Logo upload, company name, BRN, TIN, SST no, address, city/state/postcode, phone/email, default payment terms, invoice prefix/format. Save button.

### Task 20: Settings — LHDN Configuration

**File:** `dashboard/src/app/features/settings/lhdn/settings-lhdn.component.ts`

- Environment toggle: Sandbox (amber) / Production (green)
- Warning banner in sandbox mode
- TIN, BRN, Client ID (masked), Client Secret (masked) inputs
- "Test Connection" button with success/error result display
- Save Settings button
- Danger zone: Disconnect LHDN with confirmation

### Task 21: Settings — Team Members

**File:** `dashboard/src/app/features/settings/team/settings-team.component.ts`

- Team count + "Invite Member" button
- Table: Avatar+Name+Email, Role badge (Owner/Admin/Finance/Viewer), Status, Last Active, Actions
- Invite modal: Email + Role dropdown + Send Invite
- Role descriptions card

### Task 22: Settings — Billing

**File:** `dashboard/src/app/features/settings/billing/settings-billing.component.ts`

- Current plan card (violet-tinted): Pro RM 149/month, renewal date, upgrade/cancel buttons
- Usage meters: Companies 3/5, Invoices unlimited, Storage 45MB/1GB, LHDN submissions
- Billing history table: Date, Invoice #, Plan, Amount, Status, Download PDF
- Payment method card: Visa ending 4242, update button

---

## Phase 7: SuperAdmin Pages

### Task 23: SuperAdmin Tenants List

**File:** `dashboard/src/app/features/superadmin/tenant-list/tenant-list.component.ts`

- Different sidebar feel (or badge indicator "SuperAdmin")
- Stats: Total 1,247 / Active 1,198 / Suspended 12 / Trial 37
- Table: Company, Owner Email, Plan badge, Status badge, Invoices MTD, Storage, Created, Last Active, Actions
- Actions dropdown: View / Impersonate / Suspend / Audit Logs / Delete (danger)

### Task 24: SuperAdmin Audit Logs

**File:** `dashboard/src/app/features/superadmin/audit-logs/audit-logs.component.ts`

- Filters: Search, Tenant, Action type, Date range, Export CSV
- Table: Timestamp, Actor (email), Action, Entity, Tenant, IP Address, Details (expand)
- Expandable rows showing JSON diff

---

## Phase 8: Reports Page

### Task 25: Reports / Analytics

**File:** `dashboard/src/app/features/reports/reports.component.ts`

- Date range picker (top right)
- 3 KPI cards: Revenue RM 145,230 / Invoices 89 / Collection Rate 87%
- Revenue trend (ApexCharts area line, full-width, 12-month)
- Side-by-side: Invoice Aging bar chart + LHDN Success Rate donut
- Top Customers table (5 rows)
- Invoice by Status grouped bar chart

---

## Phase 9: Landing Page Pages

### Task 26: Upgrade Landing Page — Header, Hero, Features, Pricing

**Files:**
- `landing-page/src/components/layout/Header.astro` — Rebrand to "Invoiz", add dark hero-aware transparent navbar, use Phosphor icons, add mobile hamburger menu
- `landing-page/src/components/sections/Hero.astro` — Dark Abyss Black bg with gradient blooms, Bricolage Grotesque H1 with gradient word, Phosphor icons for trust badges (no emoji), floating dashboard mockup placeholder, GSAP entrance animation script
- `landing-page/src/components/sections/Features.astro` — Bento grid layout (asymmetric), Phosphor duotone icons replacing emoji, light bg cards
- `landing-page/src/components/sections/Pricing.astro` — Monthly/Annual toggle, highlighted Pro tier with blue ring, Phosphor CheckCircle for feature lists

### Task 27: Landing Page — New Sections for Homepage

**New component files:**
- `landing-page/src/components/sections/Ticker.astro` — Social proof marquee strip
- `landing-page/src/components/sections/HowItWorks.astro` — 3-step flow with SVG connectors
- `landing-page/src/components/sections/Stats.astro` — Dark band with 4 animated counters
- `landing-page/src/components/sections/LhdnCompliance.astro` — 2-col: text+checklist + flow diagram
- `landing-page/src/components/sections/Testimonials.astro` — 3 testimonial cards, Malaysian names
- `landing-page/src/components/sections/Faq.astro` — Accordion, 8 questions
- `landing-page/src/components/sections/CtaBand.astro` — Dark CTA with gradient glow
- `landing-page/src/components/layout/Footer.astro` — 5-column dark footer

Update `landing-page/src/pages/index.astro` to compose all 12 sections in order.

### Task 28: Landing Page — Pricing Dedicated Page

**File:** `landing-page/src/pages/pricing.astro`

- Full pricing page: header + pricing cards + comparison table + FAQ + enterprise CTA + footer
- Monthly/annual toggle with save badge

### Task 29: Landing Page — LHDN Compliance Page

**File:** `landing-page/src/pages/lhdn-compliance.astro`

- Timeline (3 phases)
- What is e-Invoice explanation
- How Invoiz handles it (4-step flow)
- Compliance checklist (8 items)
- FAQ + CTA

### Task 30: Landing Page — Blog Index + Post Template

**Files:**
- `landing-page/src/pages/blog/index.astro` — Featured post + article grid (6 cards) + newsletter strip
- `landing-page/src/layouts/BlogPostLayout.astro` — Article layout with sidebar TOC
- Sample MDX post for placeholder content

### Task 31: Landing Page — About Page

**File:** `landing-page/src/pages/about.astro`

- Dark hero: "Built in Malaysia" badge + mission headline
- Mission section + stat cards
- Team grid (4 members)
- Values cards (3)
- CTA band + footer

---

## Phase 10: Routing & Final Wiring

### Task 32: Wire All Dashboard Routes

**File:** `dashboard/src/app/app.routes.ts`

Add lazy-loaded routes for every new page:
- `/app/invoices` → InvoiceListComponent
- `/app/invoices/:id` → InvoiceDetailComponent
- `/app/invoices/create` → InvoiceFormComponent
- `/app/invoices/:id/edit` → InvoiceFormComponent
- `/app/customers` → CustomerListComponent
- `/app/customers/:id` → CustomerDetailComponent
- `/app/quotations` → QuotationListComponent
- `/app/products` → ProductListComponent
- `/app/payments` → PaymentListComponent
- `/app/e-invoices` → EInvoiceListComponent
- `/app/reports` → ReportsComponent
- `/app/settings` → SettingsComponent (with children: company, lhdn, team, billing)
- `/app/superadmin/tenants` → TenantListComponent
- `/app/superadmin/audit-logs` → AuditLogsComponent

### Task 33: Build Verification

Run `pnpm build` for both apps. Fix any compilation errors.
Run `pnpm lint` for both apps. Fix any lint issues.
