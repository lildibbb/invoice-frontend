# Enterprise Overhaul: API Prefix Fix + DESIGN.md Compliance + Full Endpoint Coverage

**Date:** 2026-02-28

## Problem

1. **Double API prefix** — `baseUrl` includes `/api/v1` but SDK paths already include it, causing `api/v1/api/v1` in requests
2. **Design mismatch** — Sidebar is white instead of dark slate-900, stat cards lack accent bars, zinc palette instead of slate, no Inter font
3. **59 unused SDK endpoints** — LHDN credentials, bulk operations, membership management, superadmin products/tax, audit trails missing from frontend

## Approach

### 1. API Client Fix
- Remove `/api/v1` from `baseUrl` — SDK already has correct full paths
- Keep manual refresh call at `/api/v1/auth/refresh` (called outside SDK)

### 2. Design System (from dashboard/DESIGN.md)
- **Sidebar**: Always dark `#0F172A`, blue active border, `rgba(255,255,255,0.05)` hover
- **Topbar**: 64px height, white bg, border-bottom `#E2E8F0`
- **Stat Card**: 4px colored top accent bar, 32px metric, 13px label, hover shadow
- **Status Badges**: Pill badges with semantic colors per DESIGN.md table
- **Data Table**: 52px rows, uppercase headers, striped, hover states
- **Typography**: Inter font, 24px/700 H1, 18px/600 H2, 14px body
- **Colors**: Slate palette (not zinc), blue-500 primary
- **Content BG**: `#F8FAFC` (slate-50)

### 3. Missing Endpoint Coverage
Wire all remaining SDK functions into query hooks and pages:
- Invoice: bulk finalize/send, audit trail, allowed transitions
- Customer: restore, bulk upload error download, progress tracking (SSE)
- Product: detail view, classification codes, restore
- Quotation: revise
- LHDN: credentials CRUD, validation, audit log (settings page)
- Company/Membership: company list, member management
- Superadmin: products, tax rules/categories, company management, audit detail
- Reports: LHDN compliance report
- Invites: preview, accept

## Decision Log
| Decision | Choice | Reason |
|----------|--------|--------|
| API prefix | Remove from baseUrl | SDK has correct full paths |
| Font | Inter via next/font | DESIGN.md specifies Inter |
| Color system | CSS variables mapping to DESIGN.md hex | Consistent with shadcn theme approach |
| Status badges | Reusable component | Used across 10+ pages |
| Skip endpoints | Webhooks, health check | Backend-only, no UI needed |
