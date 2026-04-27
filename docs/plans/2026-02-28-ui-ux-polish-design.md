# UI/UX Polish + Missing Endpoints: Comprehensive Redesign

**Date:** 2026-02-28

## Problem Statement

The Next.js dashboard has functional correctness but subpar visual design:
1. Login page is a bare Card with no brand identity
2. Company picker is inline — no visual separation or animation
3. Auth layout: minimal `bg-zinc-50` centering
4. Billing page: fully hardcoded, not wired to real subscription API
5. Subscriptions API (7 endpoints) entirely missing from SDK/frontend
6. Topbar: no breadcrumbs, non-functional Profile/Settings links, no notifications bell
7. Empty states: text-only, no icon illustrations
8. Pages lack polish: missing hover states, transition animations, visual hierarchy

## Design Decisions

### Auth Pages — Split Layout
- Desktop: `lg:grid-cols-2` — left brand panel (dark slate-900) + right form panel
- Left panel: InvoiZ logo, product tagline "Professional invoicing for Malaysian businesses", 3 trust bullets (LHDN Compliant, SOC2, Bank-level security), subtle grid pattern background
- Right panel: white bg, centered form, Inter typography
- Mobile: Single column, compact logo header + form
- Company picker: Animated step transition (CSS transitions, no framer-motion dependency) — same page, step 2 slides in

### Company Picker Design
- Grid of company cards (max 2 columns)
- Each card: Company initial avatar (colored), name, role badge, status
- Suspended: greyed out, "Suspended" badge, not clickable
- Selected/loading: spinner overlay on the card
- "Use a different account" link back to step 1

### Topbar Improvements
- Breadcrumbs derived from `usePathname()` — e.g. "Dashboard / Invoices / INV-001"
- Notifications bell icon (badge with count from query) — opens dropdown
- Profile link → navigates to `/settings`
- Settings link → navigates to `/settings`
- Company switcher: Click company badge → opens popover with company list (from useMyCompanies hook)

### Billing Page
- Wire to `companiesControllerGetCurrentCompanyStats` for usage data
- Add subscription plan API hooks for subscription plans
- Show current plan, usage bars (invoices, users, storage), upgrade CTA

### Subscriptions (Superadmin)
- New page `/superadmin/subscriptions` — plan management CRUD
- Plan cards: name, price, features list, active status
- Create/edit plan dialog

### Empty States
- Centralized `EmptyState` component with icon + title + description + optional action button
- Used across all list pages when data is empty

## Missing SDK Endpoints to Add
- `GET /api/v1/superadmin/subscriptions/plans`
- `POST /api/v1/superadmin/subscriptions/plans`
- `PUT /api/v1/superadmin/subscriptions/plans/:uuid`
- `GET /api/v1/superadmin/subscriptions/companies/:companyId`
- `POST /api/v1/superadmin/subscriptions/companies/:companyId/assign`
- `POST /api/v1/superadmin/subscriptions/companies/:companyId/suspend`
- `POST /api/v1/superadmin/subscriptions/companies/:companyId/reactivate`
