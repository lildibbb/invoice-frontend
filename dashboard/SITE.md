---
stitch-project-id: 8528383762991219942
---

# Project Vision & Constitution: Invoiz Dashboard

> **AGENT INSTRUCTION:** Read this file before every Stitch iteration. It serves as the project's "Long-Term Memory." If `next-prompt.md` is marked complete or empty, pick the highest priority page from Section 5 (Roadmap) and populate `next-prompt.md` with that page's full prompt before generating.

## 1. Core Identity

- **Project Name:** Invoiz Dashboard
- **Stitch Project ID:** `8528383762991219942`
- **Product:** Enterprise Angular 19 + PrimeNG 21 dashboard for the Invoiz e-invoicing SaaS platform
- **Mission:** Give Malaysian business owners, finance teams, and accountants a powerful, intuitive workspace to manage invoices, customers, products, payments, and LHDN e-Invoice compliance — all in one app
- **Target Users:** Company owners, finance managers, accountants, multi-company group CFOs, Invoiz superadmins
- **Voice:** Professional, efficient, data-dense but not overwhelming. Tool-like clarity. Premium quality.
- **Framework:** Angular 19 + PrimeNG 21 + NgRx Signals + Tailwind CSS + ApexCharts

## 2. Visual Language (Stitch Prompt Strategy)

_Strictly adhere to these descriptive rules. Do NOT use CSS class names, Tailwind utilities, or Angular component names._

### The "Vibe" (Adjectives)

- **Primary:** Precise (data tables, clear status colors, exact spacing — this is a financial tool)
- **Secondary:** Professional (slate-900 sidebar, white cards, Inter font — trustworthy and corporate)
- **Tertiary:** Efficient (no wasted space, clear visual hierarchy, one-click actions accessible)

### Color Philosophy (Semantic — always include hex)

- **Sidebar:** Always deep slate-900 (#0F172A) — the stable dark anchor of the layout
- **Active nav:** Electric blue left border (#3B82F6) with subtle blue-tinted background
- **Content bg:** Near-white slate-50 (#F8FAFC) — white cards on this background create clear elevation
- **Card bg:** Pure white (#FFFFFF) with ash border (#E2E8F0)
- **Primary action:** Electric blue (#3B82F6) buttons
- **Success / Paid:** Emerald (#10B981)
- **Warning / Pending:** Amber (#F59E0B)
- **Danger / Overdue:** Red (#EF4444)
- **LHDN status:** Violet (#8B5CF6)

## 3. Architecture & File Structure

```
dashboard/
└── src/
    └── app/
        ├── core/
        │   ├── api/              ← generated OpenAPI SDK types + client
        │   ├── auth/             ← AuthStore (NgRx Signals), interceptors
        │   └── http/             ← JWT + refresh interceptors
        ├── layout/
        │   ├── app-shell/        ← sidebar + top header wrapper
        │   └── auth-layout/      ← login/auth page wrapper
        └── features/
            ├── auth/             ← login, forgot-password, reset-password
            ├── dashboard/        ← overview / home page
            ├── invoices/         ← list, detail, create, edit
            ├── quotations/       ← list, detail, create
            ├── customers/        ← list, detail, create/edit
            ├── products/         ← catalog list, create/edit
            ├── payments/         ← payments list, record payment
            ├── e-invoices/       ← LHDN submission list, detail
            ├── reports/          ← analytics, revenue, aging
            ├── settings/         ← company, LHDN, team, billing
            └── superadmin/       ← tenant management, audit logs, health
```

### Navigation Strategy

- **App Shell:** Persistent left sidebar + top header for all `/app/...` routes
- **Auth Layout:** Centered split-screen for `/login`, `/forgot-password`, `/reset-password`, `/accept-invite`
- **SuperAdmin Shell:** Separate sidebar (lighter nav) for `/superadmin/...` routes
- **Mobile:** Sidebar becomes a hamburger-triggered overlay drawer

## 4. Live Sitemap (Current State)

_Check boxes as pages are generated and merged._

### Auth

- [x] `login` — Login page (split-screen)
- [ ] `forgot-password` — Email input, send reset link
- [ ] `reset-password` — New password form
- [ ] `accept-invite` — Accept team invite, set password

### App Shell (main experience)

- [ ] `dashboard-overview` — KPI cards + revenue chart + recent activity
- [ ] `invoices-list` — Invoice table with filters, search, export
- [ ] `invoice-detail` — PDF view + action sidebar + LHDN status
- [ ] `invoice-create` — 4-step wizard (Customer → Items → Details → Review)
- [ ] `invoice-edit` — Edit draft invoice (same as create wizard)
- [ ] `quotations-list` — Quotation table
- [ ] `quotation-detail` — Quotation view + convert-to-invoice action
- [ ] `quotation-create` — Quotation creation form
- [ ] `customers-list` — Customer table + quick stats
- [ ] `customer-detail` — Customer profile + invoice history + notes tabs
- [ ] `products-list` — Product/service catalog
- [ ] `payments-list` — Payment records + record new payment modal
- [ ] `e-invoices-list` — LHDN submission table + status filtering
- [ ] `e-invoice-detail` — LHDN detail: QR code, validation URL, timeline
- [ ] `reports` — Analytics: revenue chart, invoice aging, LHDN report
- [ ] `settings-company` — Company profile, logo, SSM, tax ID
- [ ] `settings-lhdn` — LHDN TIN, IRBM credentials, test connection
- [ ] `settings-team` — Member list + invite modal + role management
- [ ] `settings-billing` — Current plan, usage, upgrade

### SuperAdmin (separate nav)

- [ ] `superadmin-tenants` — All companies table
- [ ] `superadmin-tenant-detail` — Company detail + suspend/reactivate controls
- [ ] `superadmin-audit-logs` — Cross-tenant audit trail
- [ ] `superadmin-health` — System health monitoring

## 5. The Roadmap — Full Stitch Prompts Per Page

> **AGENT INSTRUCTION:** Each page below has a complete Stitch prompt. After generating a page, check its box, then copy the NEXT unchecked page's full prompt block (the ```...``` code block) into `next-prompt.md` and generate it. Work through them IN ORDER.

**GLOBAL DESIGN SYSTEM (include in EVERY prompt):**
- Sidebar: always dark slate-900 (#0F172A) · Active item: 3px electric blue left border + rgba(59,130,246,0.12) bg · Active text: white · Inactive text: slate-400 (#94A3B8)
- Content area bg: #F8FAFC · Card bg: white (#FFFFFF) with ash border (#E2E8F0), 12px radius
- Primary button: Electric blue (#3B82F6), 8px radius, white text, Inter 600 14px
- Status badges — Paid: emerald bg/text · Overdue: red · Sent: blue · Draft: gray · LHDN: violet
- Font: Inter throughout · Currency: RM prefix · Dates: DD/MM/YYYY

---

### ✅ Page 1: Login — DONE

---

### Page 2: Dashboard Overview (`dashboard-overview`)
- [ ] **Generate this page**

```
---
page: dashboard-overview
---
Dashboard overview page for Invoiz — the main home screen after login.

DESIGN SYSTEM (REQUIRED):
- Layout: Dark slate-900 (#0F172A) sidebar left (240px) + white top header (64px) + near-white content area (#F8FAFC)
- Sidebar: "Dashboard" nav item is ACTIVE (3px electric blue left border, blue-tinted bg, white text)
- Other nav items visible (inactive, slate-400): Invoices, Quotations, Customers, Products, Payments, LHDN, Reports, Settings
- Content cards: white (#FFFFFF), ash border (#E2E8F0), 12px radius
- Font: Inter. Currency: RM. Status colors: Paid=emerald, Overdue=red, Sent=blue, Pending=amber
- Primary button: Electric blue (#3B82F6), 8px radius

PAGE STRUCTURE:
1. Sidebar (left, 240px, slate-900):
   - Top: Invoiz logo (white wordmark) + company switcher dropdown ("Tech Solutions Sdn Bhd" + chevron)
   - Nav sections: MAIN (Dashboard, Invoices, Quotations), CUSTOMERS (Customers, Products), FINANCE (Payments, LHDN e-Invoices, Reports), SETTINGS (Settings), bottom: avatar + name + logout
2. Top Header (64px, white, border-bottom):
   - Left: "Dashboard" page title (24px Inter 700, Carbon)
   - Right: Search icon · Bell icon (red badge "3") · Dark mode toggle · User avatar dropdown
3. Content Area (padding 24px):
   - Page subtitle: "Good morning, Ahmad 👋 Here's your business overview for February 2025"
   - 4 KPI Stat Cards (4-column grid):
     * Revenue (Feb): RM 145,230 · ↑ 12% vs last month · blue top accent bar
     * Outstanding: RM 28,400 · 14 invoices · amber top accent bar
     * Overdue: RM 6,800 · 3 invoices · red top accent bar
     * LHDN Submitted: 342 this month · 100% success rate · emerald top accent bar
   - Charts row (2/3 + 1/3 split):
     * Left (2/3): "Revenue Trend" white card · 12-month area line chart · electric blue line · date filter tabs (7D / 30D / 90D / 1Y)
     * Right (1/3): "Invoice Status" white card · donut chart · legend: Paid 68% (emerald) / Sent 18% (blue) / Overdue 8% (red) / Draft 6% (gray)
   - Bottom row (2/3 + 1/3 split):
     * Left (2/3): "Recent Invoices" white card · table with columns: Invoice # · Customer · Amount · Due Date · Status badge · Action icon
       - INV-2025-089 · Ahmad Enterprise · RM 3,200 · 15/03/2025 · [Sent blue badge]
       - INV-2025-088 · DataCore MY · RM 8,450 · 10/03/2025 · [Overdue red badge]
       - INV-2025-087 · LWH Holdings · RM 12,000 · 28/03/2025 · [Paid emerald badge]
       - "View all invoices →" link at bottom
     * Right (1/3): "Pending Actions" white card · list of action items with colored left borders:
       - 🔴 3 invoices overdue — "Follow up"
       - 🟡 5 invoices pending approval — "Review"
       - 🟣 2 LHDN submissions failed — "Retry"
       - 🔵 Invoice #INV-2025-091 draft — "Complete"
   - Quick Actions row: 3 buttons — "+ Create Invoice" (primary blue) · "Record Payment" (secondary) · "Submit to LHDN" (secondary)
```

---

### Page 3: Invoices List (`invoices-list`)
- [ ] **Generate this page**

```
---
page: invoices-list
---
Invoice list page for Invoiz — the main invoice management table.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "Invoices" nav item ACTIVE
- Font: Inter. Currency: RM. Status badges: Paid=emerald, Overdue=red, Sent=blue, Draft=gray, Cancelled=gray, LHDN Valid=violet

PAGE STRUCTURE:
1. Sidebar (same structure as overview, "Invoices" active)
2. Top Header: "Invoices" title + "+ Create Invoice" primary blue button (top right)
3. Content Area:
   - Stats row (4 small stat chips): Total: 342 · Paid: RM 235,400 · Outstanding: RM 28,400 · Overdue: RM 6,800
   - Filter Bar (white card, border-bottom):
     * Left: Search input "Search by invoice # or customer..." (280px)
     * Middle: Status filter dropdown (All / Draft / Sent / Paid / Overdue / Cancelled) · Date range picker · Customer filter dropdown
     * Right: Export button (CSV/PDF icon) · Column settings icon
   - Invoice Table (white card, full-width):
     * Header row: [ ] Checkbox · Invoice # · Customer · Issue Date · Due Date · Amount · Status · LHDN · Actions
     * 8 sample rows with varied statuses:
       - INV-2025-089 · Ahmad Enterprise Sdn Bhd · 01/02/2025 · 01/03/2025 · RM 3,200.00 · [Sent] · [LHDN Valid violet] · action icons
       - INV-2025-088 · DataCore MY · 25/01/2025 · 10/02/2025 · RM 8,450.00 · [Overdue] · [LHDN Valid] · action icons
       - INV-2025-087 · LWH Holdings Group · 20/01/2025 · 20/02/2025 · RM 12,000.00 · [Paid] · [LHDN Valid] · action icons
       - INV-2025-086 · Priya Consulting · 15/01/2025 · — · RM 1,500.00 · [Draft] · [—] · action icons
       - etc.
     * Action icons per row: 👁 View · ✏️ Edit · ⋯ More (dropdown: Send, Duplicate, Void, Download PDF)
     * Batch action bar (appears when checkboxes selected): "3 selected" + Send · Export · Void buttons
   - Pagination bar: "Showing 1-10 of 342" · Previous / page numbers / Next
```

---

### Page 4: Invoice Detail (`invoice-detail`)
- [ ] **Generate this page**

```
---
page: invoice-detail
---
Invoice detail page for Invoiz — shows PDF preview with action sidebar.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "Invoices" nav item ACTIVE
- 2-column content: 65% PDF preview left + 35% action sidebar right
- Font: Inter. Currency: RM.

PAGE STRUCTURE:
1. Sidebar + Header (same as invoices list)
2. Page Header area:
   - Breadcrumb: Invoices > INV-2025-089
   - Title row: "INV-2025-089" (24px Inter 700) + [Sent blue badge] + [LHDN Valid violet badge]
   - Action row: "Send Email" secondary button · "Record Payment" secondary button · "Submit to LHDN" secondary button · "⋯" more button (Duplicate / Void / Download PDF / Delete)
3. 2-Column Layout:
   LEFT COLUMN (65%): Invoice PDF Preview (white card, shadow):
     - White paper-style card with shadow
     - PDF header: Company logo placeholder (top-left) + "INVOICE" large text (top-right)
     - Invoice details: Invoice # INV-2025-089 · Date: 01/02/2025 · Due: 01/03/2025
     - From: Invoiz Demo Sdn Bhd, address block
     - To: Ahmad Enterprise Sdn Bhd, address block
     - Line items table: Description · Qty · Unit Price · Tax · Total
       * Web Development Services · 1 · RM 3,000.00 · 6% · RM 3,180.00
       * Domain Registration · 1 · RM 150.00 · 0% · RM 150.00
     - Subtotal / SST 6% / Total rows (right-aligned, bold total)
     - QR code (bottom right, small, "Scan to verify on MyInvois")
     - Payment terms and notes at bottom
   RIGHT COLUMN (35%, sticky sidebar):
     - "Status Timeline" card: vertical stepper (Created ✓ → Sent ✓ → [Payment Pending] → Paid)
     - "Actions" card: context buttons based on status
     - "Customer" card: avatar + Ahmad Enterprise Sdn Bhd + email + phone + "View Customer →" link
     - "Financial Summary" card: Subtotal RM 3,150 · SST RM 50 · Total RM 3,200 · Paid RM 0 · Balance Due RM 3,200 (red)
     - "LHDN Status" card (violet-tinted bg): UUID (monospace, truncated) · "Valid ✓" emerald badge · QR thumbnail · "View on MyInvois →" link
     - "Activity Log" card: chronological list — "Invoice created" · "Sent to customer" · "LHDN submitted" with timestamps
```

---

### Page 5: Invoice Create Wizard (`invoice-create`)
- [ ] **Generate this page**

```
---
page: invoice-create
---
Invoice creation wizard for Invoiz — 4-step form. Show Step 2 (Items) as the active step.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + white content area (form wizard uses full white)
- Sidebar: "Invoices" nav item ACTIVE
- Step indicator: 4 steps, step 2 active (electric blue), steps 1 done (emerald checkmark), steps 3-4 gray
- Font: Inter. Currency: RM. Inputs: 40px height, 8px radius, ash border, blue focus ring.

PAGE STRUCTURE:
1. Sidebar + Header ("Create Invoice" title, "Save as Draft" secondary button top-right)
2. Wizard Progress Bar (white card, full-width, below header):
   - 4 step indicators connected by line:
     * Step 1: ✓ (emerald circle) "Customer" — COMPLETE
     * Step 2: 2 (electric blue circle) "Line Items" — ACTIVE (current step)
     * Step 3: 3 (gray circle) "Details"
     * Step 4: 4 (gray circle) "Review & Submit"
3. Step 2 Content (white card, full-width):
   - Section title: "Add Invoice Items" (18px Inter 600)
   - Customer chip at top: "Ahmad Enterprise Sdn Bhd ✕" (shows selected customer from step 1)
   - Line Items Table:
     * Column headers: Product/Service · Description · Qty · Unit Price (RM) · Tax % · Line Total · [delete]
     * Row 1: "Web Development" autocomplete filled · "Custom website development" · 1 · 3,000.00 · 6% · RM 3,180.00 · 🗑
     * Row 2: "Domain Registration" autocomplete filled · ".com.my domain 1 year" · 1 · 150.00 · 0% · RM 150.00 · 🗑
     * Row 3: Empty row with blue "+ Add Item" button below
   - Right side summary card (sticky): Subtotal: RM 3,150.00 · SST (6%): RM 180.00 · Total: RM 3,330.00 — updates live
4. Sticky Bottom Action Bar (white, border-top):
   - Left: "← Back to Customer" gray link
   - Right: "Save as Draft" secondary button + "Continue to Details →" primary blue button
```

---

### Page 6: Customers List (`customers-list`)
- [ ] **Generate this page**

```
---
page: customers-list
---
Customer management list page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "Customers" nav item ACTIVE
- Font: Inter. Tables: white cards, ash border.

PAGE STRUCTURE:
1. Sidebar + Header: "Customers" title + "+ Add Customer" primary blue button
2. Stats row: Total Customers: 142 · Active: 138 · Total Invoiced: RM 847,000 · Outstanding: RM 28,400
3. Search + Filter bar: Search input (name/email/company) · Status filter (Active/Inactive) · Sort by dropdown
4. Customer Table (white card):
   - Columns: [ ] · Customer Name · Company · Email · Phone · Total Invoiced · Outstanding · Status · Actions
   - 6 sample rows:
     * Ahmad Rizal · Ahmad Enterprise Sdn Bhd · ahmad@enterprise.com · +60 12-345 6789 · RM 45,200 · RM 3,200 · [Active emerald] · 👁 ✏️ ⋯
     * Priya Krishnan · DataCore MY · priya@datacore.my · +60 11-234 5678 · RM 23,400 · RM 0 · [Active emerald] · icons
     * Lim Wei Hao · LWH Holdings · limwh@lwhgroup.com · +60 16-789 0123 · RM 89,000 · RM 12,000 · [Active emerald] · icons
     * Tan Mei Ling · Tan & Associates · tan@associates.com · +60 3-1234 5678 · RM 12,600 · RM 0 · [Active emerald] · icons
   - Pagination: Showing 1–10 of 142
```

---

### Page 7: Customer Detail (`customer-detail`)
- [ ] **Generate this page**

```
---
page: customer-detail
---
Customer detail page for Invoiz — profile + invoice history.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "Customers" nav item ACTIVE
- Tabs: white underline-style tabs

PAGE STRUCTURE:
1. Sidebar + Header: breadcrumb "Customers > Ahmad Enterprise" + Edit button
2. Customer Profile Header (white card):
   - Left: Avatar circle (64px, "AE" initials, blue bg) + Name "Ahmad Enterprise Sdn Bhd" (20px 700) + "Ahmad Rizal" (owner, 14px Graphite) + [Active emerald badge]
   - Right stats: 4 chips — Total Invoiced RM 45,200 · Outstanding RM 3,200 · Overdue RM 0 · Last Invoice 01/02/2025
   - Contact info row: 📧 ahmad@enterprise.com · 📞 +60 12-345 6789 · 📍 Kuala Lumpur · SSM No: 123456-X
3. Tabs row: Invoices (active, underline blue) · Payments · Notes · Activity
4. Tab: Invoices content — same invoice table as invoices-list but filtered to this customer only
5. Quick Note input at bottom of Notes tab (textarea + Save Note button)
```

---

### Page 8: LHDN e-Invoices List (`e-invoices-list`)
- [ ] **Generate this page**

```
---
page: e-invoices-list
---
LHDN e-Invoice submission tracking page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "LHDN e-Invoices" nav item ACTIVE
- LHDN status badges: Submitted=violet, Valid=emerald, Invalid=red, Cancelled=gray, Pending=amber
- Font: Inter. Monospace: JetBrains Mono for UUIDs.

PAGE STRUCTURE:
1. Sidebar + Header: "LHDN e-Invoices" title + "Retry Failed" amber button (if any failed)
2. Stats chips: Total Submitted: 342 · Valid: 338 · Invalid: 2 · Cancelled: 2 · Success Rate: 98.8%
3. Filter tabs (pill-style): All · Submitted · Valid · Invalid · Cancelled · Pending
4. LHDN Table (white card):
   - Columns: Invoice # · Customer · Submitted At · LHDN UUID · Status · Actions
   - 5 sample rows:
     * INV-2025-089 · Ahmad Enterprise · 01/02/2025 10:23 AM · abc1-2345-def6 (monospace, truncated) · [Valid emerald] · 🔍 QR Code · 🔗 MyInvois
     * INV-2025-088 · DataCore MY · 25/01/2025 · xyz9-8765 · [Valid emerald] · icons
     * INV-2025-085 · LWH Holdings · 20/01/2025 · — · [Invalid red] · ↺ Retry button
     * INV-2025-084 · Priya Consulting · 15/01/2025 · pqr3-4567 · [Cancelled gray] · icons
   - Click on any row → slide-out right drawer showing: Full LHDN UUID · Submission timestamp · Validation response JSON · QR code (large) · "View on MyInvois" link · Retry button
```

---

### Page 9: Reports / Analytics (`reports`)
- [ ] **Generate this page**

```
---
page: reports
---
Reports and analytics page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "Reports" nav item ACTIVE
- Charts: ApexCharts style, electric blue primary, emerald secondary, amber tertiary
- Font: Inter. Currency: RM.

PAGE STRUCTURE:
1. Sidebar + Header: "Reports" title + Date range picker (dropdown: "Last 30 days" selected) + Export PDF button
2. KPI row (3 cards): Total Revenue RM 145,230 · Invoices Issued 89 · Collection Rate 87%
3. Revenue Trend (full-width white card): 12-month area line chart, electric blue line, gradient fill below, RM Y-axis, months X-axis, tooltip showing month + RM amount on hover
4. 2-col charts row:
   - Left: "Invoice Aging Analysis" bar chart — 4 bars: 0-30 days (emerald) · 31-60 days (amber) · 61-90 days (orange) · 90+ days (red). Shows RM amounts per bucket.
   - Right: "LHDN Submission Status" donut chart — Valid 98.8% (emerald) · Invalid 0.6% (red) · Pending 0.6% (amber)
5. Top Customers Table (white card): Rank · Customer name · Total Invoiced · Paid · Outstanding · Last Invoice — 5 rows, sortable headers
6. "Invoice by Status" bar chart (full-width, white card): Monthly grouped bars — Paid/Sent/Overdue/Draft for each month (3 months visible)
```

---

### Page 10: Settings — Company Profile (`settings-company`)
- [ ] **Generate this page**

```
---
page: settings-company
---
Company profile settings page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Layout: slate-900 sidebar + white header + #F8FAFC content
- Sidebar: "Settings" nav item ACTIVE
- Left settings sub-nav: vertical tab list (Company Profile active)
- Font: Inter. Forms: 40px inputs, 8px radius, ash border, blue focus ring.

PAGE STRUCTURE:
1. Sidebar + Header: "Settings" title
2. Settings Layout: Left sub-nav (200px) + Right content area
   LEFT SUB-NAV (white card, vertical tabs):
     - Company Profile (active, blue left border)
     - LHDN Configuration
     - Invoice Templates
     - Team Members
     - Billing & Plan
   RIGHT CONTENT (white card, "Company Profile" section title):
     - Company Logo: current logo preview (80px square, rounded) + "Upload Logo" button + guidelines text
     - Form fields (2-column grid):
       * Company Name* (required)
       * Business Registration No (SSM)*
       * Tax Identification Number (TIN)*
       * SST Registration No (optional)
       * Business Address* (full-width textarea)
       * City* + State* + Postcode*
       * Country* (Malaysia default)
       * Phone* + Email*
       * Website (optional)
     - Invoice Settings section:
       * Default Payment Terms (dropdown: Net 30 selected)
       * Default Invoice Notes (textarea)
       * Invoice Number Prefix (e.g., INV-)
       * Invoice Number Format (INV-YYYY-NNNN)
     - Save Changes button (primary blue, bottom right)
```

---

### Page 11: Settings — LHDN Configuration (`settings-lhdn`)
- [ ] **Generate this page**

```
---
page: settings-lhdn
---
LHDN configuration settings page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Same as settings-company but "LHDN Configuration" tab is active in sub-nav
- Warning banners: amber bg, amber border left (4px)
- Success state: emerald bg tint, emerald border

PAGE STRUCTURE:
1. Settings layout (same left sub-nav, "LHDN Configuration" active)
2. RIGHT CONTENT: "LHDN MyInvois Configuration"
   - Environment toggle (large pill toggle): SANDBOX (currently selected, amber) ↔ PRODUCTION (green)
   - Warning banner (amber): "⚠️ You are in Sandbox mode. Switch to Production before going live."
   - Form fields:
     * Tax Identification Number (TIN)* — "Taxpayer's TIN from LHDN"
     * Business Registration Number (BRN)* — "MyInvois will verify this against your TIN"
     * IRBM Client ID* — sensitive, masked input with "show" toggle
     * IRBM Client Secret* — sensitive, masked input with "show" toggle
   - "Test Connection" button (secondary) → shows result:
     * Success: emerald banner "✓ Connected to MyInvois Sandbox successfully"
     * Error: red banner "✗ Authentication failed. Check your Client ID and Secret."
   - Webhook Settings section:
     * Webhook URL (optional) — "Receive real-time LHDN status updates"
     * Webhook Secret (optional)
   - Save Settings button (primary blue)
   - Danger Zone section (red-bordered card): "Disconnect LHDN" button with confirmation modal
```

---

### Page 12: Settings — Team Members (`settings-team`)
- [ ] **Generate this page**

```
---
page: settings-team
---
Team members settings page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Same settings layout, "Team Members" tab active
- Role badges: Owner=violet, Admin=blue, Finance=emerald, Viewer=gray

PAGE STRUCTURE:
1. Settings layout ("Team Members" active sub-nav)
2. RIGHT CONTENT: "Team Members"
   - Header: "4 members" + "+ Invite Member" primary blue button (top right)
   - Team table (no outer border, just rows):
     * Avatar + Name + Email | Role badge | Status | Last active | Actions (Edit role / Remove)
     * Ahmad Rizal · ahmad@enterprise.com | [Owner violet] | Active | Today | (no edit — owner)
     * Siti Norfazillah · siti@enterprise.com | [Admin blue] | Active | Yesterday | ✏️ 🗑
     * Raj Kumar · raj@enterprise.com | [Finance emerald] | Active | 3 days ago | ✏️ 🗑
     * Lee Jia Yi · lee@enterprise.com | [Viewer gray] | Pending invite | — | Resend invite 🗑
   - Invite Modal (if open): Email input + Role dropdown (Admin/Finance/Viewer) + "Send Invite" button
   - Roles section below table: Role descriptions card explaining what each role can access
```

---

### Page 13: SuperAdmin — Tenant List (`superadmin-tenants`)
- [ ] **Generate this page**

```
---
page: superadmin-tenants
---
SuperAdmin tenant management page for Invoiz — separate admin interface.

DESIGN SYSTEM (REQUIRED):
- Layout: DIFFERENT sidebar (slightly lighter than main app — slate-800 #1E293B) + white header + #F8FAFC content
- Sidebar top: "⚡ SuperAdmin" red badge label to distinguish from regular dashboard
- Nav items: Tenants (active) · Audit Logs · System Health · Settings
- Plan badges: Starter=blue, Pro=violet, Enterprise=amber
- Status badges: Active=emerald, Suspended=red, Trial=amber

PAGE STRUCTURE:
1. Different Sidebar (slate-800, NOT slate-900): SuperAdmin label + nav items
2. Header: "Tenant Management" title + "Export" button
3. Stats row (4 cards): Total Companies: 1,247 · Active: 1,198 · Suspended: 12 · Trial: 37
4. Search + Filter bar: Search by company/email · Plan filter · Status filter · Created date range
5. Tenant Table (white card, dense):
   - Columns: Company Name · Owner Email · Plan · Status · Invoices (MTD) · Storage · Created · Last Active · Actions
   - 5 rows:
     * Tech Solutions Sdn Bhd · ahmad@tech.com.my · [Pro violet] · [Active emerald] · 89 · 45MB · 01/01/2024 · Today · 👁 ⚙️ ⋯
     * DataCore MY · admin@datacore.my · [Enterprise amber] · [Active emerald] · 342 · 120MB · 15/11/2023 · Yesterday · icons
     * Priya Design Studio · priya@studio.my · [Starter blue] · [Trial amber] · 5 · 2MB · 25/02/2025 · Today · icons
     * XYZ Trading · xyz@trading.com · [Starter blue] · [Suspended red] · 0 · 8MB · 01/06/2024 · 45 days ago · icons
   - Row action ⋯ dropdown: View Details · Impersonate User · Suspend · Audit Logs · Delete
```

---

### Page 14: SuperAdmin — Audit Logs (`superadmin-audit-logs`)
- [ ] **Generate this page**

```
---
page: superadmin-audit-logs
---
SuperAdmin audit logs page for Invoiz — cross-tenant activity trail.

DESIGN SYSTEM (REQUIRED):
- Same SuperAdmin layout (slate-800 sidebar, "Audit Logs" nav ACTIVE)
- Font: Inter. Monospace for IDs and JSON. Status colors match action type.

PAGE STRUCTURE:
1. SuperAdmin Sidebar + Header: "Audit Logs" title + filter controls
2. Filter bar: Search by actor/action · Tenant filter dropdown · Action type filter · Date range picker · Export CSV button
3. Audit Log Table (white card, dense rows):
   - Columns: Timestamp · Actor (email) · Action · Entity · Tenant · IP Address · Details
   - 6 rows (chronological, newest first):
     * 28/02/2025 10:23:45 · ahmad@tech.com · INVOICE_CREATED · INV-2025-089 · Tech Solutions · 192.168.1.1 · [expand icon]
     * 28/02/2025 10:20:12 · superadmin@invoiz.my · TENANT_SUSPENDED · DataCore-Old · SuperAdmin · 10.0.0.1 · [expand icon]
     * 28/02/2025 09:55:30 · siti@enterprise.com · LHDN_SUBMITTED · INV-2025-088 · Tech Solutions · 203.x.x.x · [expand icon]
     * 28/02/2025 09:30:00 · priya@studio.my · USER_LOGIN · — · DataCore MY · 115.x.x.x · [expand icon]
   - Expandable row: shows JSON diff card with before/after values, full metadata
4. Pagination with rows-per-page selector (25/50/100)
```

---

### Page 15: Quotations List (`quotations-list`)
- [ ] **Generate this page**

```
---
page: quotations-list
---
Quotation list page for Invoiz — similar to invoices but with convert action.

DESIGN SYSTEM (REQUIRED):
- Same layout as invoices-list, "Quotations" nav item ACTIVE
- Status badges: Draft=gray, Sent=blue, Accepted=emerald, Expired=amber, Rejected=red

PAGE STRUCTURE:
1. Sidebar + Header: "Quotations" title + "+ Create Quotation" primary button
2. Stats: Total: 45 · Sent: 23 · Accepted: 18 (RM 89,200) · Expired: 4
3. Filter bar: Search · Status filter · Date range
4. Quotations Table (white card):
   - Columns: [ ] · Quote # · Customer · Issue Date · Expiry Date · Amount · Status · Actions
   - Sample rows:
     * QUO-2025-012 · Ahmad Enterprise · 01/02/2025 · 28/02/2025 · RM 15,000 · [Accepted emerald] · 👁 ✏️ "Convert to Invoice" green button
     * QUO-2025-011 · LWH Holdings · 25/01/2025 · 24/02/2025 · RM 45,000 · [Sent blue] · 👁 ✏️ ⋯
     * QUO-2025-010 · Priya Consulting · 10/01/2025 · 09/02/2025 · RM 3,200 · [Expired amber] · 👁 ✏️ ⋯
   - "Convert to Invoice" shown as a prominent teal/green button on Accepted quotes
```

---

### Page 16: Products Catalog (`products-list`)
- [ ] **Generate this page**

```
---
page: products-list
---
Product/service catalog page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Same layout, "Products" nav item ACTIVE
- Product type badges: Product=blue, Service=violet

PAGE STRUCTURE:
1. Sidebar + Header: "Products & Services" title + "+ Add Product" primary button
2. View toggle: Table view (active) | Grid view
3. Search + filter: Search by name/code · Type filter (Product/Service) · Category filter
4. Products Table (white card):
   - Columns: [ ] · Code · Name · Type · Unit Price · Tax % · Category · Status · Actions
   - Rows:
     * SVC-001 · Web Development Services · [Service violet] · RM 3,000.00 · 6% · Development · [Active] · ✏️ 🗑
     * SVC-002 · Domain Registration (.com.my) · [Service violet] · RM 150.00 · 0% · Hosting · [Active] · ✏️ 🗑
     * PRD-001 · Office Chair · [Product blue] · RM 450.00 · 6% · Furniture · [Active] · ✏️ 🗑
   - Empty state (if no products): Illustration + "Add your first product" + button
```

---

### Page 17: Payments List (`payments-list`)
- [ ] **Generate this page**

```
---
page: payments-list
---
Payments management page for Invoiz — record and track payments.

DESIGN SYSTEM (REQUIRED):
- Same layout, "Payments" nav item ACTIVE
- Payment method badges: Bank Transfer=blue, Cash=emerald, Cheque=gray, FPX=violet, Credit Card=amber

PAGE STRUCTURE:
1. Sidebar + Header: "Payments" title + "+ Record Payment" primary button
2. Stats: Total Collected RM 235,400 · This Month RM 45,200 · Pending RM 28,400 · Overdue RM 6,800
3. Filter bar: Search by invoice/customer · Date range · Payment method filter
4. Payments Table (white card):
   - Columns: [ ] · Date · Invoice # · Customer · Amount Paid · Payment Method · Reference · Recorded By · Actions
   - Rows:
     * 28/02/2025 · INV-2025-087 · LWH Holdings · RM 12,000.00 · [Bank Transfer blue] · IBG/28022025 · Ahmad Rizal · 👁 🗑
     * 25/02/2025 · INV-2025-082 · DataCore MY · RM 8,450.00 · [FPX violet] · FPX2025022501 · System · 👁
   - "Record Payment" modal (if open): Invoice search · Amount · Date · Method dropdown · Reference no · Notes · Save
```

---

### Page 18: Settings — Billing (`settings-billing`)
- [ ] **Generate this page**

```
---
page: settings-billing
---
Billing and subscription settings page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Same settings layout, "Billing & Plan" tab ACTIVE
- Current plan highlighted: violet-tinted card with violet border (Pro plan)

PAGE STRUCTURE:
1. Settings layout ("Billing & Plan" sub-nav active)
2. RIGHT CONTENT:
   - Current Plan card (violet-tinted bg, violet border): "Pro Plan · RM 149/month" · Renewal: 01/04/2025 · "Upgrade to Enterprise" button + "Cancel Plan" link
   - Usage meters section:
     * Companies: 3 / 5 (blue progress bar, 60%)
     * Invoices this month: 89 / Unlimited ∞
     * Storage: 45MB / 1GB (green progress bar, 5%)
     * LHDN Submissions: 342 this month
   - Billing History table: Date · Invoice # · Plan · Amount · Status · Download
     * 01/02/2025 · BILL-2025-002 · Pro Monthly · RM 149.00 · [Paid emerald] · ↓ PDF
     * 01/01/2025 · BILL-2025-001 · Pro Monthly · RM 149.00 · [Paid emerald] · ↓ PDF
   - Payment Method section: "Visa ending in 4242" card icon + "Update Payment Method" button
```

### Login

- 2-column split: Left (dark brand panel 45%) + Right (white form 55%)
- Left: Invoiz logo, "Trusted by 1,200+ businesses", a testimonial quote, animated gradient bg
- Right: "Welcome back" H1, email input, password input, forgot-password link, Sign In button, SSO divider

### Dashboard Overview

- 4 KPI stat cards: Total Revenue MTD / Outstanding / Overdue / LHDN Submissions
- Revenue line chart (12-month, filterable) + Invoice status donut chart (side by side)
- Recent Invoices table (last 10, truncated) + Pending Actions list
- Quick action buttons: Create Invoice · Record Payment · Submit LHDN

### Invoice Detail

- 65% left: PDF preview (full-height iframe or rendered HTML invoice)
- 35% right sidebar: Status timeline stepper → Action buttons (context-sensitive) → Customer card → Financial summary → LHDN status card → Payment history list → Activity log

### Invoice Create Wizard

- 4 steps (p-steps progress bar): 1 Customer → 2 Items → 3 Details → 4 Review
- Step 1: Customer autocomplete search + quick-create new customer option
- Step 2: Line item builder table (product search, qty, unit price, tax %, line total, add/remove rows)
- Step 3: Invoice date, due date, reference number, payment terms, notes
- Step 4: Rendered PDF preview + summary + submit or save as draft

### SuperAdmin Tenant List

- Stats bar: Total companies / Active / Suspended / Trial
- Table: Company name · Plan · Owner · Status badge · Invoice count · Created date · Actions
- Row actions: View · Suspend/Reactivate · Impersonate · Audit Logs

## 7. Rules of Engagement

1. Do not recreate pages already checked in Section 4.
2. Always update `next-prompt.md` with the next page after completing the current one.
3. Reference `DESIGN.md` for all color, typography, and component decisions.
4. Always maintain the dark sidebar + light content layout. Never change the sidebar to light.
5. Malaysian context: Currency is `RM` (not MYR), dates are `DD/MM/YYYY`, numbers use `.` decimal and `,` thousands separator.
6. LHDN status badges use violet/emerald/red color system — always distinguish from regular invoice statuses.
7. All tables must have column headers with sort indicators and a row action column (rightmost).
8. Forms must have proper labels, required field indicators (asterisk), and visible validation error messages.
