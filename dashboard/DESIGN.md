# Design System: Invoiz Dashboard

**Project ID:** invoiz-dashboard-2025

## 1. Visual Theme & Atmosphere

The Invoiz Dashboard embodies a **precision-engineered enterprise workspace** that balances data density with clarity. Every element serves a functional purpose while maintaining the premium aesthetic established by the landing page. The dashboard feels like a professional tool that users can trust with their business finances.

**Default theme is light** — a clean, spacious white-and-slate interface that maximizes readability for invoice data, financial figures, and LHDN compliance status. A **dark mode toggle** inverts to a deep navy workspace for users who prefer it or work in low-light environments.

The sidebar provides **dark, anchor contrast** — always present as a deep slate-900 vertical column — creating visual stability regardless of the content area theme. This sidebar-as-anchor pattern is used by Linear, Vercel Dashboard, and Notion.

**Key Characteristics:**
- Light content area on dark sidebar — maximum contrast and clear hierarchy
- Data density without clutter — tables, charts, and cards breathe but don't waste space
- Status-first design — invoice states (Paid, Overdue, LHDN Valid) are immediately legible via color-coded badges
- Micro-interactions that confirm every user action (save, submit, delete, approve)
- Mobile-first responsive sidebar (drawer on mobile, collapsible icon-only on tablet, full on desktop)

## 2. Color Palette & Roles

### Sidebar (always dark — both light and dark mode)
- **Sidebar BG:** `#0F172A` (slate-900) — Deep, anchoring dark background
- **Sidebar Text:** `#94A3B8` (slate-400) — Muted inactive nav items
- **Sidebar Active Text:** `#F1F5F9` (slate-100) — Selected nav item
- **Sidebar Active BG:** `rgba(59,130,246,0.12)` — Subtle blue tint on active item
- **Sidebar Active Border:** `#3B82F6` — 3px left border on active nav item
- **Sidebar Hover BG:** `rgba(255,255,255,0.05)` — Barely-there hover state
- **Sidebar Section Label:** `#475569` (slate-600) — Uppercase section dividers

### Content Area — Light Mode (default)
- **Page BG:** `#F8FAFC` (slate-50) — Warm off-white that makes white cards pop
- **Card BG:** `#FFFFFF` — Pure white cards for maximum readability
- **Card Border:** `#E2E8F0` (slate-200) — Subtle but crisp border
- **Header BG:** `#FFFFFF` — White top header, border-bottom separator
- **Header Border:** `#E2E8F0`

### Content Area — Dark Mode
- **Page BG:** `#0F172A` (slate-900) — Same as sidebar bg
- **Card BG:** `#1E293B` (slate-800) — Elevated dark card surface
- **Card Border:** `#334155` (slate-700) — Dark mode border
- **Header BG:** `#1E293B` — Dark header

### Brand Primary
- **Blue-500:** `#3B82F6` — Primary actions, active states, links, focus rings
- **Blue-600:** `#2563EB` — Hover state of primary
- **Blue-50:** `#EFF6FF` — Light bg tint for selected rows, info banners

### Semantic Status Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#10B981` (emerald-500) | Paid, Valid, Active, Success |
| Warning | `#F59E0B` (amber-500) | Pending, Awaiting, Draft |
| Danger | `#EF4444` (red-500) | Overdue, Invalid, Error, Failed |
| Info | `#3B82F6` (blue-500) | Sent, Submitted, Info |
| Neutral | `#64748B` (slate-500) | Voided, Cancelled, Inactive |
| Violet | `#8B5CF6` | LHDN-specific statuses, premium badges |

### Invoice Status Badge Colors
| Status | BG | Text |
|--------|-----|------|
| Draft | `#F1F5F9` | `#475569` |
| Sent | `#EFF6FF` | `#1D4ED8` |
| Paid | `#ECFDF5` | `#065F46` |
| Overdue | `#FEF2F2` | `#991B1B` |
| Voided | `#F1F5F9` | `#64748B` |
| Cancelled | `#F1F5F9` | `#64748B` |
| Pending Approval | `#FFFBEB` | `#92400E` |
| LHDN Submitted | `#EDE9FE` | `#5B21B6` |
| LHDN Valid | `#ECFDF5` | `#065F46` |
| LHDN Invalid | `#FEF2F2` | `#991B1B` |
| LHDN Cancelled | `#F1F5F9` | `#374151` |

### Typography Colors — Light Mode
- **Text Primary:** `#0F172A` (slate-900) — Page titles, table content
- **Text Secondary:** `#475569` (slate-600) — Labels, descriptions
- **Text Muted:** `#94A3B8` (slate-400) — Placeholders, disabled

## 3. Typography Rules

**Single font:** `Inter` — All sizes. Already loaded via `@fontsource/inter`. The definitive dashboard font.

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Page Title (H1) | 24px | 700 | Text Primary |
| Section Heading (H2) | 18px | 600 | Text Primary |
| Card Title (H3) | 16px | 500 | Text Primary |
| Table Header | 12px uppercase tracking-[0.04em] | 600 | Text Muted |
| Table Body | 14px | 400 | Text Primary |
| Label | 14px | 500 | Text Secondary |
| Caption / Meta | 12px | 400 | Text Muted |
| Stat Value (KPI) | 32px | 700 | Text Primary |
| Stat Label | 13px | 500 | Text Muted |
| Badge | 12px | 600 | (per badge color) |
| Nav Item | 14px | 500 | (sidebar colors) |
| Nav Section Label | 11px uppercase tracking-[0.06em] | 600 | Sidebar Section Label |
| Currency / Monospace | JetBrains Mono 14px | 400 | Text Primary |

## 4. Component Stylings

### Sidebar Navigation Item
- Height: `40px`
- Padding: `0 12px`
- Border-radius: `8px`
- Icon: `20px`, margin-right `10px`
- Default: text-slate-400
- Hover: `background: rgba(255,255,255,0.05)`, text-slate-200
- Active: `background: rgba(59,130,246,0.12)`, text-white, `border-left: 3px solid #3B82F6`
- Transition: `all 150ms ease`

### Top Header Bar
- Height: `64px`
- White bg + `border-bottom: 1px solid #E2E8F0`
- Left: Page title (24px Inter 700)
- Right: Search icon · Bell icon (with badge) · Dark mode toggle · Avatar dropdown
- Avatar: 32px circle, initials or photo, `border: 2px solid #E2E8F0`

### Stat / KPI Card
- White bg, ash border, `border-radius: 12px`, `padding: 20px 24px`
- Top: Colored accent bar (`height: 4px`, `border-radius: 12px 12px 0 0`) in status color
- Layout: Icon left (40px container) + metric text right
- Metric: 32px Inter 700
- Label: 13px Inter 500 slate-500
- Delta: `+X%` vs last period — green if positive, red if negative, 12px
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`

### Data Table
- Row height: `52px`
- Header: `height: 44px`, `border-bottom: 2px solid #E2E8F0`
- Column headers: 12px Inter 600 uppercase tracking-wide, slate-500
- Row: white bg, `border-bottom: 1px solid #F1F5F9`
- Striped (even rows): `#FAFAFA`
- Row hover: `background: #F8FAFC`
- Checkbox column: `44px` fixed width
- Action column: right-aligned, icon buttons (16px icons in 32px containers)
- Frozen first column: `position: sticky; left: 0; z-index: 1; background: inherit`
- Selected row: `background: #EFF6FF`, `border-color: #BFDBFE`

### Primary Button (content area)
- Background: `#3B82F6`
- Text: White, 14px Inter 600
- Padding: `8px 16px`
- Border-radius: `8px`
- Hover: `background: #2563EB`
- Active: `transform: scale(0.98)`
- Transition: `all 150ms ease`
- Disabled: `opacity: 0.5`, `cursor: not-allowed`

### Secondary Button (content area)
- Background: White
- Border: `1px solid #E2E8F0`
- Text: Carbon (#0F172A), 14px Inter 500
- Hover: `background: #F8FAFC`, `border-color: #CBD5E1`

### Danger Button
- Background: `#EF4444`, text white
- Hover: `background: #DC2626`

### Form Input
- Height: `40px`
- Border: `1px solid #E2E8F0`
- Border-radius: `8px`
- Padding: `0 12px`
- Font: 14px Inter 400, Carbon
- Focus: `border-color: #3B82F6`, `box-shadow: 0 0 0 3px rgba(59,130,246,0.12)`
- Error: `border-color: #EF4444`, `box-shadow: 0 0 0 3px rgba(239,68,68,0.12)`
- Placeholder: slate-400
- Disabled: `background: #F8FAFC`, `cursor: not-allowed`

### Dropdown / Select
- Same styling as Form Input
- Caret: Chevron icon right-aligned in the input
- Options panel: White bg, `border: 1px solid #E2E8F0`, `border-radius: 8px`, `box-shadow: 0 8px 24px rgba(0,0,0,0.08)`
- Option hover: `background: #F8FAFC`
- Option selected: `background: #EFF6FF`, `color: #1D4ED8`

### Status Badge
- `border-radius: 9999px` (pill)
- `padding: 3px 10px`
- Font: 12px Inter 600
- Colors: as defined in Color Palette — Status Badge Colors table above

### Modal / Dialog
- Backdrop: `rgba(0,0,0,0.5)` blur(4px)
- Panel: White bg, `border-radius: 16px`, `padding: 24px`
- `box-shadow: 0 24px 64px rgba(0,0,0,0.12)`
- Header: title (18px 600) + close X button
- Footer: right-aligned action buttons
- Entrance: scale(0.95) + opacity(0) → scale(1) + opacity(1), 200ms

### Slide-out Drawer
- Width: `480px` desktop, `100vw` mobile
- Background: White
- `box-shadow: -8px 0 32px rgba(0,0,0,0.08)`
- Slide from right: 300ms `ease` transition
- Header: sticky top with title + close button
- Footer: sticky bottom with action buttons

### Toast / Notification
- Bottom-right positioning
- Width: `360px`
- Border-radius: `10px`
- Colors: success green-50 bg + emerald left border (4px) | error red-50 + red | warning amber-50 + amber
- Auto-dismiss: 4 seconds
- Entrance: slide up from bottom + fade in, 250ms

## 5. Layout Principles

### Main Layout (3-zone)
```
┌─────────────────────────────────────────────┐
│  Sidebar (240px)  │      Top Header          │
│  slate-900        │      (64px)              │
│  always dark      ├─────────────────────────┤
│                   │                          │
│  Logo (64px)      │   Content Area           │
│  Nav Items        │   (bg: #F8FAFC)          │
│                   │   padding: 24px          │
│  [collapsed:64px] │   max-width: 1440px      │
│  [mobile: drawer] │                          │
└─────────────────────────────────────────────┘
```

### Responsive Breakpoints
- `< 768px (mobile)`: sidebar hidden, accessible via hamburger → drawer overlay
- `768px–1024px (tablet)`: sidebar collapsed to icon-only (64px wide), labels hidden
- `> 1024px (desktop)`: sidebar full width (240px) with labels

### Content Grid Patterns
- KPI cards row: 4-column grid (2 on mobile, 2 on tablet, 4 on desktop)
- Charts row: 2/3 + 1/3 split
- Split detail page: 65% content + 35% sidebar
- Table: full-width with horizontal scroll on mobile

### Page Content Structure
```
┌─────────────────────────────────────┐
│  Page Header (title + breadcrumb)   │  mb-6
├─────────────────────────────────────┤
│  Filter/Action Bar                  │  mb-4
├─────────────────────────────────────┤
│  Content Cards / Tables             │
│  (white cards, ash border, 12px r.) │
└─────────────────────────────────────┘
```

## 6. Angular/PrimeNG Specific Patterns

### Component Mapping
| Design Component | PrimeNG Component | Notes |
|-----------------|------------------|-------|
| Data Table | `<p-table>` | Use `rowHover`, `scrollable`, `frozenColumns` |
| Dropdown | `<p-dropdown>` | Override with custom styles |
| Date Picker | `<p-calendar>` | Range mode for filters |
| Chart | `<p-chart>` (ng-apexcharts) | ApexCharts preferred |
| Toast | `<p-toast>` | Position: bottom-right |
| Modal | `<p-dialog>` | Modal with mask |
| Drawer | `<p-sidebar>` | position="right", full-height |
| Badge | Custom component | Don't use p-badge — use custom styled spans |
| Tabs | `<p-tabView>` | Custom styling override |
| Autocomplete | `<p-autoComplete>` | Customer/product search |
| File Upload | `<p-fileUpload>` | Logo, PDF attachments |
| Accordion | `<p-accordion>` | Settings sections |
| Steps | `<p-steps>` | Invoice creation wizard |

### Angular Animation Patterns
```typescript
// Route transition
trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [style({ opacity: 0, transform: 'translateY(8px)' })], { optional: true }),
    query(':enter', animateChild(), { optional: true }),
    group([
      query(':enter', [animate('200ms ease', style({ opacity: 1, transform: 'translateY(0)' }))], { optional: true }),
    ]),
  ])
])
```

### NgRx Signal Store Patterns
- `AuthStore` — tokens, user, isLoading
- `CompanyStore` — currentCompany, companies list
- `InvoiceStore` — list, filters, pagination, selected invoice
- `NotificationStore` — unread count, list

## 7. Design System Notes for Stitch Generation

### Language to Use
- **Layout:** "Dark slate-900 sidebar on the left, white content area on the right, clean header bar at the top"
- **Sidebar active state:** "Active nav item with a 3-pixel electric blue left border, subtle blue-tinted background, and white text"
- **KPI cards:** "White cards with a 4-pixel colored top accent bar, large 32px metric value, percentage delta in green or red"
- **Data table:** "Clean white table with very subtle gray row hover, status pill badges in appropriate colors, icon action buttons in rightmost column"
- **Buttons:** "Blue primary buttons with 8px rounded corners, white secondary buttons with ash border"

### Color References (always include hex)
| Semantic Name | Hex | Usage |
|---|---|---|
| Sidebar BG | `#0F172A` | Always-dark left panel |
| Sidebar Active | `rgba(59,130,246,0.12)` | Active nav item bg |
| Active Border | `#3B82F6` | 3px left border on active item |
| Page BG (light) | `#F8FAFC` | Content area background |
| Card BG | `#FFFFFF` | All cards in light mode |
| Card Border | `#E2E8F0` | Card and table borders |
| Primary Blue | `#3B82F6` | Buttons, links, focus |
| Paid/Valid | `#10B981` | Green success states |
| Overdue/Error | `#EF4444` | Red danger states |
| Pending | `#F59E0B` | Amber warning states |
| LHDN Violet | `#8B5CF6` | LHDN-specific status |

### Ready-to-Use Stitch Component Prompts
- "Create a sidebar navigation panel on slate-900 (#0F172A) background with the Invoiz logo at top, grouped nav items with 40px height and 8px border-radius, the active item showing a 3px electric blue (#3B82F6) left border with subtle blue-tinted background and white text"
- "Design a KPI stat card on pure white with 1px ash border (#E2E8F0), 4px colored top accent bar, a 40px icon container with light-tinted background, large 32px Inter bold metric, 13px muted label below, and a delta percentage in emerald green"
- "Create a data table with white background, 52px row height, subtle gray row striping, status pill badges in appropriate colors (Paid=emerald, Overdue=red, Sent=blue, Draft=gray), and right-aligned icon action buttons (eye, edit, ellipsis)"
- "Design an invoice creation form wizard with 4 steps (Customer, Items, Details, Review) shown as a progress bar at top, clean white card content area with labeled inputs, and a sticky bottom action bar with Save Draft and Continue buttons"
