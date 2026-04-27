# UI/UX Overhaul — Borderless Design, Role Guards, Full Endpoint Integration

**Date:** 2026-02-28
**Status:** Approved

## Problem Statement

Current frontend has 31 files using colored border styles, no role-based page guards (pages render regardless of user role), no 403 page, ~10 unused SDK functions, and basic animations. The app needs a complete visual and functional overhaul to be enterprise-grade with proper access control for all 4 backend roles (SUPER_ADMIN, USER, ADMIN, STAFF).

## Decisions

- **Visual style:** Elevated cards with shadow-only depth (no border-color anywhere)
- **Animations:** Subtle micro-interactions only — fade-in on mount, scale on hover, smooth skeleton
- **Role guards:** Strict enforcement — redirect to /403 + disable nav items
- **Approach:** Foundation layer first (design system, guards, error pages), then sweep all pages

---

## 1. Borderless Design System

### Elevation Scale (replaces all borders)
```
elevation-0  → bg only, no shadow (inset content)
elevation-1  → shadow-sm (subtle lift — inputs, badges)
elevation-2  → shadow-md shadow-black/5 (cards, sections)
elevation-3  → shadow-lg shadow-black/8 (modals, popovers, dropdowns)
elevation-hover → shadow-xl + scale(1.01) on hover
```

### shadcn Component Overrides
- **Card:** `shadow-md shadow-black/5 border-0 rounded-2xl`
- **Input/Select/Textarea:** `shadow-sm bg-muted/30 border-0 focus:shadow-md focus:ring-2 ring-primary/20`
- **Table rows:** no border, `hover:bg-muted/50`, alternating `bg-muted/20`
- **Dialog:** `shadow-2xl border-0 rounded-2xl`
- **Tabs:** underline active indicator instead of bordered tabs
- **Separator:** `bg-muted/60 h-px` (very subtle, no border)

### Update globals.css
- Replace `.glass-card` border rules: remove `border border-white/20`, keep `backdrop-blur-xl shadow-xl shadow-black/5`
- Remove `border-slate-200` from all line item containers
- Add elevation utility classes
- Add animation keyframes

### Micro-Animations (CSS only)
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-scale-in { animation: scale-in 0.2s ease-out; }
.hover-lift { @apply hover:shadow-xl hover:scale-[1.01] transition-all duration-200; }
```

Stagger children: `[&>*:nth-child(1)]:delay-[0ms] [&>*:nth-child(2)]:delay-[50ms]` etc.

---

## 2. Role Guards & Error Pages

### Role Types
```ts
enum GlobalRole { SUPER_ADMIN = 'SUPER_ADMIN', USER = 'USER' }
enum MembershipRole { ADMIN = 'ADMIN', STAFF = 'STAFF' }
type AppRole = GlobalRole | MembershipRole;
```

### Route Permission Map
Centralized config at `lib/constants/permissions.ts`:
```ts
const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/': ['ADMIN', 'STAFF', 'SUPER_ADMIN'],
  '/invoices': ['ADMIN', 'STAFF'],
  '/invoices/new': ['ADMIN', 'STAFF'],
  '/settings': ['ADMIN'],
  '/settings/team': ['ADMIN'],
  '/settings/lhdn': ['ADMIN'],
  '/settings/tax': ['ADMIN'],
  '/settings/billing': ['ADMIN'],
  '/reports': ['ADMIN'],
  '/superadmin': ['SUPER_ADMIN'],
  '/superadmin/*': ['SUPER_ADMIN'],
}
```

### Components
- **`<RoleGuard roles={AppRole[]}>`** — checks auth store role, redirects to /403 if unauthorized
- **`useRoleCheck(roles: AppRole[])`** — hook returning `{ hasAccess, userRole, isLoading }`
- **`withRoleGuard(Component, roles)`** — HOC alternative

### Navigation Filtering
Add `requiredRoles?: AppRole[]` to each nav item in `nav-items.ts`. Sidebar filters items based on current user role from auth store.

### Error Pages
- **`/403` (new):** "Access Denied" illustration, message, "Go to Dashboard" button
- **`/not-found` (enhance):** Better illustration, "Go Home" button
- **`error.tsx` (enhance):** Retry button, error details collapsible

---

## 3. Endpoint Integration Fixes

### Unused SDK Functions to Wire

| Function | Integration Point |
|---|---|
| `authControllerLogout` | User menu → call API before clearing store |
| `authControllerLogoutAll` | Settings/Sessions → "Logout All Devices" |
| `authControllerSwitchCompany` | Topbar company switcher |
| `customersControllerTrackProgress` | Bulk upload SSE progress bar |
| `eInvoiceSubmissionsControllerGetStatus` | E-invoice detail status polling |
| `companiesControllerUpdate` | Verify wired to settings save |

### Auth Flow Fixes
- Logout: call `authControllerLogout` → then clear store → redirect to /login
- Switch company: call `authControllerSwitchCompany` → update auth store with new token/context
- Logout all: call `authControllerLogoutAll` → clear store → redirect to /login

---

## 4. Page-by-Page Sweep

### Changes Applied to Every Page
1. Remove all `border-*` color classes → shadow elevation
2. Add `animate-fade-in` to main content container
3. Cards: `shadow-md shadow-black/5 border-0 rounded-2xl`
4. Inputs: `shadow-sm bg-muted/30 border-0 focus:shadow-md focus:ring-2 ring-primary/20`
5. Tables: no row borders, `hover:bg-muted/50`
6. Wrap with `<RoleGuard>` where needed

### Auth Pages (4)
- Login, Forgot Password, Reset Password, Accept Invite
- Borderless + fade-in animation
- No role guard needed

### Dashboard Pages (18+)
- All pages: borderless cards, fade-in, role guard
- Dashboard: staggered card animation
- Customers: add SSE bulk upload progress
- E-Invoices: add status polling
- Settings/Sessions: add "Logout All" button

### Superadmin Pages (6)
- All wrapped in SUPER_ADMIN role guard
- Borderless styling

### Error Pages (3)
- 403: new page with scale-in animation
- 404: enhanced with illustration
- error.tsx: enhanced with retry

---

## 5. Implementation Phases

### Phase 1: Foundation
- globals.css: elevation utilities, animations, borderless overrides
- shadcn overrides: Card, Input, Select, Table, Dialog patches
- Role types + permissions map + RoleGuard component + useRoleCheck hook
- Error pages: 403, enhanced 404, enhanced error.tsx
- Nav items: add requiredRoles, sidebar filter

### Phase 2: Auth + Layout
- Sidebar: filter nav by role
- Topbar: wire authControllerSwitchCompany
- Auth pages: borderless + fade-in
- Logout: wire authControllerLogout API call

### Phase 3: Page Sweep (parallelizable)
- Each page: borderless + animation + role guard
- Wire remaining endpoints (SSE progress, status polling, logout all)

---

## 6. Performance

- All animations are CSS-only (no JS animation library)
- RoleGuard checks are synchronous (reads from Zustand store, no API call)
- No new dependencies needed
