# Invoice Frontend — Architecture Design

**Date:** 2026-02-28  
**Status:** Approved  
**Scope:** Full frontend for Malaysian e-Invoice SaaS — landing page + company/superadmin dashboard

---

## 1. Overview

Two standalone applications inside a **pnpm monorepo**:

| App | Framework | Purpose |
|-----|-----------|---------|
| `landing-page/` | Astro 5.x | Public marketing site — hero, features, pricing, blog |
| `dashboard/` | Angular 19 | Company + SuperAdmin web application |

Both share a root `pnpm-workspace.yaml`. A shared `shared/openapi.json` contains the auto-exported backend OpenAPI spec used for TypeScript API client generation.

---

## 2. Repository Structure

```
D:\Project\invoice-frontend\
├── landing-page/               ← Astro 5.x app
├── dashboard/                  ← Angular 19 app
├── shared/
│   └── openapi.json            ← auto-exported from backend /api/docs-json
├── scripts/
│   └── export-openapi.mjs      ← fetches openapi spec from NestJS dev server
├── docs/
│   └── plans/                  ← design & implementation plans
├── package.json                ← pnpm workspace root scripts
├── pnpm-workspace.yaml
└── .gitignore
```

---

## 3. Angular Dashboard

### 3.1 Tech Stack

| Category | Package | Version | Notes |
|----------|---------|---------|-------|
| **Framework** | `@angular/core` | 19.x | Standalone components, no NgModules |
| **UI Library** | `primeng` | 19.x | Richest enterprise component set |
| **Icons** | `primeicons` | latest | Included with PrimeNG |
| **Layout utils** | `primeflex` | 3.x | Utility CSS for PrimeNG spacing |
| **Styling** | `tailwindcss` | 4.x | Layout, custom styles, dark mode |
| **Theme** | PrimeNG Aura | built-in | Modern flat design, fully customizable |
| **State** | `@ngrx/signals` | 19.x | Signal Store — modern NgRx without boilerplate |
| **DevTools** | `@ngrx/store-devtools` | 19.x | Redux DevTools integration |
| **Charts** | `ng-apexcharts` | latest | ApexCharts wrapper — interactive analytics |
| **Date** | `dayjs` | latest | Lightweight, MYR locale, invoice dates |
| **Auth** | `jwt-decode` | 4.x | Parse JWT claims, no heavy library |
| **API codegen** | `@openapitools/openapi-generator-cli` | latest | Generates typed Angular services from OpenAPI |
| **HTTP** | Angular `HttpClient` | built-in | + JWT interceptor, refresh token interceptor |
| **Forms** | Angular Reactive Forms | built-in | Type-safe, PrimeNG form components |
| **Router** | Angular Router | built-in | Lazy-loaded feature routes, route guards |
| **Testing** | `jest` + `@angular/testing` | latest | Faster than Karma for CI |
| **Build** | Angular CLI 19 (esbuild) | built-in | Fast incremental builds |
| **Linting** | `@angular-eslint/eslint-plugin` | latest | Angular-specific ESLint rules |
| **Package mgr** | `pnpm` | — | Consistent with backend |

### 3.2 Angular Folder Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── core/                        ← singleton services
│   │   │   ├── api/                     ← GENERATED — openapi-generator output
│   │   │   │   ├── api/                 ← InvoicesApi, CustomersApi, ...
│   │   │   │   └── model/               ← DTO interfaces
│   │   │   ├── auth/                    ← JWT service, interceptors, guards
│   │   │   ├── store/                   ← NgRx Signal Store root
│   │   │   └── http/                    ← JWT + refresh interceptors
│   │   ├── shared/                      ← reusable components
│   │   │   ├── components/              ← data-table, page-header, breadcrumb
│   │   │   ├── pipes/                   ← currency-myr, date-format
│   │   │   └── directives/
│   │   ├── layout/
│   │   │   ├── app-shell/               ← sidebar, topbar, footer
│   │   │   └── auth-layout/             ← login/register wrapper
│   │   └── features/                    ← lazy-loaded feature modules
│   │       ├── dashboard/               ← overview stats
│   │       ├── invoices/                ← list, create, edit, submit
│   │       ├── customers/
│   │       ├── products/
│   │       ├── payments/
│   │       ├── credit-memos/
│   │       ├── quotations/
│   │       ├── invoice-templates/
│   │       ├── einvoice-submissions/    ← LHDN submission history, QR
│   │       ├── lhdn/                    ← credentials, notifications, doc types
│   │       ├── settings/                ← company, team, billing
│   │       └── superadmin/              ← role-gated
│   │           ├── companies/
│   │           ├── subscriptions/
│   │           ├── analytics/
│   │           └── audit/
│   ├── environments/
│   │   ├── environment.ts               ← dev (localhost:3002)
│   │   └── environment.prod.ts          ← production API URL
│   ├── styles.scss                      ← global styles, PrimeNG theme import
│   └── index.html
├── jest.config.js
├── tailwind.config.js
├── angular.json
└── package.json
```

### 3.3 Routing Architecture

```typescript
// Role-based lazy routing
const routes: Routes = [
  { path: '', loadComponent: () => AuthLayoutComponent,
    children: [
      { path: 'login', loadComponent: ... },
      { path: 'register', loadComponent: ... },
      { path: 'invite/:token', loadComponent: ... },
    ]
  },
  { path: '', loadComponent: () => AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/...')  },
      { path: 'invoices',  loadChildren: () => import('./features/invoices/...')   },
      // ... all company features
      { path: 'superadmin', loadChildren: () => import('./features/superadmin/...'),
        canActivate: [SuperAdminGuard]  },
    ]
  }
];
```

### 3.4 Auth Flow

1. POST `/auth/login` → receive `accessToken` + `refreshToken`
2. Store in `localStorage` (access) + `httpOnly cookie` (refresh, if backend supports) or both `localStorage`
3. `JwtInterceptor` — attaches `Authorization: Bearer {token}` to every request
4. `RefreshInterceptor` — on 401, calls `POST /auth/refresh`, retries original request
5. `AuthGuard` — checks token expiry before route activation
6. `SuperAdminGuard` — checks `GlobalRole.SUPER_ADMIN` in JWT claims

### 3.5 NgRx Signal Store Slices

```
AuthStore         — currentUser, tokens, isLoading
InvoiceStore      — invoices[], selectedInvoice, pagination, filters
CustomerStore     — customers[], pagination
SubmissionStore   — einvoiceSubmissions[], status polling state
NotificationStore — LHDN notifications, unread count
UIStore           — sidebarCollapsed, theme, activeCompany
```

---

## 4. Astro Landing Page

### 4.1 Tech Stack

| Category | Package | Version | Notes |
|----------|---------|---------|-------|
| **Framework** | `astro` | 5.x | Zero-JS default, static-first |
| **Styling** | `tailwindcss` | 4.x | via `@astrojs/tailwind` integration |
| **Components** | Custom Astro components + shadcn patterns | — | Accessible, copy-paste, no runtime |
| **Animations** | `gsap` | 3.x | Scroll animations, hero effects |
| **Icons** | `astro-icon` + `@iconify-json/heroicons` | latest | SVG, zero runtime |
| **Fonts** | `@fontsource/inter` | latest | Self-hosted, no Google DNS |
| **Dark mode** | Tailwind `dark:` class strategy | — | No JS flash, CSS-only |
| **Content/Blog** | Astro Content Collections (MDX) | built-in | Type-safe blog posts, changelog |
| **SEO** | `astro-seo` + `@astrojs/sitemap` | latest | Meta, OG image, sitemap |
| **Forms** | Astro Actions (server-side) | built-in | Waitlist/contact, no frontend framework |
| **Analytics** | Plausible CE (self-hosted) or cloud | — | GDPR-compliant, no cookie banner |
| **Deploy** | Cloudflare Pages (static adapter) | `@astrojs/cloudflare` | Edge CDN, best Malaysia latency |
| **Build** | Astro CLI | built-in | Vite-based, extremely fast |

### 4.2 Landing Page Folder Structure

```
landing-page/
├── src/
│   ├── pages/
│   │   ├── index.astro              ← main landing page
│   │   ├── pricing.astro            ← pricing page
│   │   ├── blog/
│   │   │   ├── index.astro          ← blog listing
│   │   │   └── [slug].astro         ← individual post
│   │   └── legal/
│   │       ├── privacy.astro
│   │       └── terms.astro
│   ├── content/
│   │   ├── config.ts                ← Content Collections schema
│   │   └── blog/                    ← MDX blog posts
│   ├── components/
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Features.astro
│   │   │   ├── Pricing.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── FAQ.astro
│   │   │   └── CTA.astro
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   └── ui/                      ← Button, Card, Badge, etc.
│   ├── layouts/
│   │   ├── BaseLayout.astro         ← HTML shell, SEO, fonts
│   │   └── BlogLayout.astro
│   └── styles/
│       └── global.css               ← Tailwind base, custom CSS
├── public/
│   ├── favicon.svg
│   └── og-image.png                 ← Open Graph image
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### 4.3 Performance Targets

- **Lighthouse score:** 100/100 performance (static + Cloudflare CDN)
- **LCP < 1.2s** — hero image lazy loaded, fonts preloaded
- **CLS = 0** — no layout shifts, reserved image dimensions
- **Zero JS by default** — animations load only when in viewport (GSAP ScrollTrigger + IntersectionObserver)

---

## 5. OpenAPI Code Generation Pipeline

### 5.1 Export Script

`scripts/export-openapi.mjs`:
1. Starts NestJS backend (`pnpm --filter invoice-api start:dev`)
2. Polls `http://localhost:3002/api` until healthy (max 60s)
3. GETs `http://localhost:3002/api/docs-json`
4. Writes to `shared/openapi.json`
5. Terminates the dev server process

### 5.2 Angular Code Generation

```bash
# dashboard/package.json script:
openapi-generator-cli generate \
  -i ../shared/openapi.json \
  -g typescript-angular \
  -o src/app/core/api \
  --additional-properties=ngVersion=19,withInterfaces=true,supportsES6=true,enumPropertyNaming=original
```

**Output (auto-generated, DO NOT EDIT):**
- `src/app/core/api/api/invoices.service.ts` — `InvoicesService`
- `src/app/core/api/api/customers.service.ts` — `CustomersService`
- `src/app/core/api/model/create-invoice-dto.ts` — DTO interfaces
- etc. — one service per Swagger tag, one model per DTO

### 5.3 Root Workspace Scripts

```json
{
  "scripts": {
    "generate:api": "node scripts/export-openapi.mjs && pnpm --filter dashboard run generate:api",
    "dev:all": "concurrently \"pnpm --filter landing-page dev\" \"pnpm --filter dashboard dev\"",
    "build:all": "pnpm --filter landing-page build && pnpm --filter dashboard build",
    "lint:all": "pnpm --filter landing-page lint && pnpm --filter dashboard lint"
  }
}
```

---

## 6. Development Environment

### Setup Commands
```bash
cd D:\Project\invoice-frontend
pnpm install                 # install all workspaces
pnpm generate:api            # export openapi + generate Angular services
pnpm dev:all                 # run both apps
```

### Ports
- Landing page: `http://localhost:4321` (Astro default)
- Dashboard: `http://localhost:4200` (Angular default)
- Backend API: `http://localhost:3002`

### .env Files
```
dashboard/.env               — ANGULAR_APP_API_URL=http://localhost:3002
landing-page/.env            — PUBLIC_API_URL=http://localhost:3002
```

---

## 7. Non-Functional Requirements

- **TypeScript strict mode** on both apps
- **WCAG 2.1 AA** accessibility (PrimeNG is accessible by default)
- **Mobile-responsive** — PrimeFlex grid + Tailwind responsive utilities
- **Dark mode** — both apps support light/dark theme
- **MYR locale** — `Intl.NumberFormat('ms-MY')` for currency, `Day.js` with Malaysia locale
- **LHDN compliance** — QR code display, submission status tracking in dashboard

---

## 8. Next Steps (Implementation Plan)

See `docs/plans/2026-02-28-frontend-setup-plan.md` for step-by-step scaffolding tasks.

**Phase 1 (Setup):** Monorepo init → Astro scaffold → Angular scaffold → OpenAPI pipeline  
**Phase 2 (Dashboard Core):** App shell, auth flow, routing, core stores  
**Phase 3 (Dashboard Features):** Invoices, customers, LHDN submission pages  
**Phase 4 (Landing Page):** All sections, blog, SEO, deploy to Cloudflare Pages
