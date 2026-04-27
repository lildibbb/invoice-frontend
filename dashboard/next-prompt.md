---
page: dashboard-overview
---

# Stitch Wireframe Prompt — Invoiz Dashboard: Overview Page

Generate the **Dashboard Overview** page for **Invoiz**, the main landing screen after login. This is the most-viewed screen in the app — it must deliver instant business intelligence at a glance within the standard app shell layout (dark sidebar + white content area).

---

## DESIGN SYSTEM (REQUIRED — Read DESIGN.md for full spec)

- **Platform:** Web app, desktop-first (1440px responsive)
- **Layout:** Dark slate-900 (#0F172A) sidebar on the left (240px), white content area on the right, clean header bar at the top (64px)
- **UI Font:** Inter across all elements
- **Primary Color:** Electric Blue (#3B82F6) — buttons, active states, links, focus rings
- **Card BG:** White (#FFFFFF) with ash border (#E2E8F0), 12px border-radius
- **Page BG:** Slate-50 (#F8FAFC)
- **Text Primary:** Carbon (#0F172A)
- **Text Secondary:** Graphite (#475569)
- **Text Muted:** Slate-400 (#94A3B8)
- **KPI cards:** White cards with a 4-pixel colored top accent bar, large 32px metric value, percentage delta in green or red
- **Data table:** Clean white table with very subtle gray row hover, status pill badges in appropriate colors, icon action buttons in rightmost column
- **Buttons:** Blue primary buttons with 8px rounded corners, white secondary buttons with ash border

---

## Page Structure

### Sidebar (240px, always visible on desktop)

- **Background:** Deep slate-900 (#0F172A)
- **Top:** Invoiz logo mark (white, 28px) + wordmark "Invoiz" in white Inter bold
- **Nav groups with section labels:** (11px uppercase Inter 600, slate-600 #475569)
  - **MAIN:**
    - 📊 Dashboard (ACTIVE — blue left border 3px, blue-tinted bg rgba(59,130,246,0.12), white text)
    - 📄 Invoices
    - 📋 Quotations
    - 👥 Customers
    - 📦 Products
    - 💰 Payments
  - **LHDN:**
    - 🏛️ e-Invoices
  - **INSIGHTS:**
    - 📈 Reports
  - **SETTINGS:**
    - ⚙️ Settings
- **Bottom:** User avatar (32px circle, initials "AR"), "Ahmad Rizal" (13px white), "Tech Solutions" (11px slate-400), logout icon
- Nav items: 40px height, 8px radius, 20px icons, 14px Inter 500 text, slate-400 default → white on active

### Top Header Bar (64px height)

- **Background:** White (#FFFFFF), bottom border 1px #E2E8F0
- **Left:** Page title "Dashboard" (24px Inter 700, Carbon)
- **Right:** Search icon (20px) · 🔔 Bell icon with red notification dot (3 unread) · Dark/Light mode toggle icon · Avatar dropdown (32px circle, border 2px #E2E8F0)

### Content Area (padding 24px, bg #F8FAFC)

#### Row 1: 4 KPI Stat Cards (equal-width grid)

Each card: white bg, 1px ash border, 12px radius, 20px 24px padding, 4px colored top accent bar

- **Card 1 — Total Revenue MTD:**
  - Accent bar: Electric Blue (#3B82F6)
  - Icon: 40px container, blue-50 bg (#EFF6FF), blue chart-up icon
  - Value: "RM 145,230" (32px Inter 700, Carbon)
  - Label: "Revenue this month" (13px Inter 500, Slate-500)
  - Delta: "+12.3% vs last month" (12px, emerald #10B981, green up-arrow icon)

- **Card 2 — Outstanding:**
  - Accent bar: Amber (#F59E0B)
  - Icon: 40px container, amber-50 bg, amber clock icon
  - Value: "RM 28,400" (32px Inter 700)
  - Label: "Outstanding invoices"
  - Delta: "+3 new this week" (12px, amber)

- **Card 3 — Overdue:**
  - Accent bar: Red (#EF4444)
  - Icon: 40px container, red-50 bg, red alert icon
  - Value: "7" (32px Inter 700)
  - Label: "Overdue invoices"
  - Delta: "-2 from last week" (12px, emerald, down-arrow — this is positive since overdue decreased)

- **Card 4 — LHDN Submissions:**
  - Accent bar: Violet (#8B5CF6)
  - Icon: 40px container, violet-50 bg (#EDE9FE), violet shield/check icon
  - Value: "342" (32px Inter 700)
  - Label: "LHDN submissions this month"
  - Delta: "99.4% success rate" (12px, emerald)

#### Row 2: Charts (2/3 + 1/3 split)

**Left Chart Card (2/3 width):**

- White card, ash border, 12px radius, 24px padding
- Header: "Revenue Trend" (16px Inter 500, Carbon) + Period selector dropdown (Last 12 Months / 6 Months / This Year)
- Area line chart: 12 months on x-axis (Mar 2025 → Feb 2026), RM revenue on y-axis
- Line color: Electric Blue (#3B82F6), area fill: blue-500 at 15% opacity
- Tooltip on hover showing "Feb 2026: RM 145,230"
- Grid lines: very subtle #F1F5F9

**Right Chart Card (1/3 width):**

- White card, ash border, 12px radius, 24px padding
- Header: "Invoice Status" (16px Inter 500)
- Donut chart: Paid (emerald #10B981, 62%) · Sent (blue #3B82F6, 18%) · Overdue (red #EF4444, 8%) · Draft (slate #94A3B8, 12%)
- Legend below the donut: color dot + label + percentage

#### Row 3: Quick Actions Bar (horizontal)

- 3 buttons side-by-side in a white card, or just inline:
  - "＋ Create Invoice" — primary blue button
  - "💰 Record Payment" — secondary outlined button
  - "🏛️ Submit to LHDN" — secondary outlined button with violet icon

#### Row 4: Recent Invoices Table

- White card, ash border, 12px radius, 24px padding
- Header: "Recent Invoices" (16px Inter 500) + "View All →" link (14px Inter 500, Electric Blue, right-aligned)
- Table: 10 rows, columns:
  - Invoice # (monospace JetBrains Mono 14px, e.g. "INV-2026-0342")
  - Customer (14px Inter 400, Carbon)
  - Date (14px, Graphite, DD/MM/YYYY format)
  - Amount (14px JetBrains Mono, right-aligned, e.g. "RM 4,500.00")
  - Status badge (pill: "Paid" green bg #ECFDF5 green text #065F46 / "Sent" blue / "Overdue" red / "Draft" gray)
  - LHDN badge (pill: "Valid ✓" emerald / "Submitted" violet / "—" gray for not submitted)
  - Actions: eye icon (view) + ellipsis icon (more)
- Row hover: bg #F8FAFC
- Header row: 12px Inter 600 uppercase, slate-500, border-bottom 2px #E2E8F0

#### Row 5: Pending Actions (optional sidebar card)

- White card, ash border
- Header: "Pending Actions" (16px Inter 500) + count badge "5"
- List items (each 48px with left icon + text + action link):
  - ⏳ 3 invoices awaiting approval → "Review"
  - ⚠️ 2 LHDN submissions need retry → "Retry All"
  - 📧 1 invoice unsent for 7 days → "Send Now"

---

## After Generating Dashboard Overview

After the dashboard overview is approved and merged:

1. Update Section 4 in `SITE.md` — check the `dashboard-overview` box
2. Move to next page in the roadmap: **Invoices List**
3. Update `next-prompt.md` with the Invoices List prompt
