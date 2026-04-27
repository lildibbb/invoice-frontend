# Frontend Setup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold `D:\Project\invoice-frontend` as a pnpm monorepo with Astro 5.x landing page + Angular 19 dashboard, OpenAPI codegen pipeline from the NestJS backend, and all dev tooling wired up.

**Architecture:** pnpm workspaces root with `landing-page/` (Astro) and `dashboard/` (Angular 19 standalone) as workspace packages. A `scripts/export-openapi.mjs` script exports the backend OpenAPI spec to `shared/openapi.json`; Angular uses `openapi-generator-cli` to generate typed services from it.

**Tech Stack:** Node 20, pnpm 8, Astro 5.x + TailwindCSS v4 + GSAP, Angular 19 + PrimeNG 19 + NgRx Signal Store + TailwindCSS v4 + ng-apexcharts, @openapitools/openapi-generator-cli, concurrently

---

## Working Directory

All commands run from `D:\Project\invoice-frontend` unless otherwise stated.

---

## Task 1: Monorepo Root Setup

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.npmrc`

### Step 1: Create root `package.json`

```json
{
  "name": "invoice-frontend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev:all": "concurrently \"pnpm --filter landing-page dev\" \"pnpm --filter dashboard start\"",
    "build:all": "pnpm --filter landing-page build && pnpm --filter dashboard build",
    "lint:all": "pnpm --filter landing-page lint && pnpm --filter dashboard lint",
    "generate:api": "node scripts/export-openapi.mjs && pnpm --filter dashboard run generate:api"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

### Step 2: Create `pnpm-workspace.yaml`

```yaml
packages:
  - 'landing-page'
  - 'dashboard'
```

### Step 3: Create `.npmrc`

```ini
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true
```

### Step 4: Create `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.astro/

# Angular
dashboard/.angular/
dashboard/dist/

# Environment
.env
.env.local
*.env.local

# Editor
.vscode/
.idea/
*.suo
*.user

# OS
.DS_Store
Thumbs.db

# Generated (DO NOT EDIT)
dashboard/src/app/core/api/

# Shared
shared/openapi.json
```

### Step 5: Install root dependencies

```bash
cd D:\Project\invoice-frontend
pnpm install
```

Expected: `concurrently` installed at root.

### Step 6: Commit

```bash
git add package.json pnpm-workspace.yaml .gitignore .npmrc
git commit -m "chore: init pnpm monorepo root

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: OpenAPI Export Script

**Files:**
- Create: `scripts/export-openapi.mjs`
- Create: `shared/.gitkeep`

### Step 1: Create `shared/` directory marker

```bash
mkdir shared
echo "" > shared/.gitkeep
```

### Step 2: Create `scripts/export-openapi.mjs`

```javascript
#!/usr/bin/env node
/**
 * export-openapi.mjs
 * Starts the NestJS backend, fetches /api/docs-json, saves to shared/openapi.json
 * 
 * Requirements: NestJS backend must be at D:\Project\invoice-api
 * Run: node scripts/export-openapi.mjs
 */

import { spawn, execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BACKEND_DIR = join(ROOT, '..', 'invoice-api');
const OUTPUT_PATH = join(ROOT, 'shared', 'openapi.json');
const API_URL = 'http://localhost:3002/api/docs-json';
const HEALTH_URL = 'http://localhost:3002/api';
const MAX_WAIT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

console.log('🚀 Starting NestJS backend to export OpenAPI spec...');
console.log(`   Backend dir: ${BACKEND_DIR}`);

// Start backend process
const backend = spawn('pnpm', ['run', 'start:dev'], {
  cwd: BACKEND_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

backend.stdout.on('data', (d) => {
  const line = d.toString().trim();
  if (line.includes('Nest application successfully started') ||
      line.includes('Application is running')) {
    console.log('   ✓ NestJS started');
  }
});

backend.stderr.on('data', (d) => {
  const line = d.toString().trim();
  if (line.includes('ERROR')) process.stderr.write(`   [backend] ${line}\n`);
});

// Poll health endpoint
async function waitForBackend() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
      if (res.ok || res.status === 401) return true; // 401 = running but needs auth
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    process.stdout.write('.');
  }
  return false;
}

try {
  const ready = await waitForBackend();
  if (!ready) {
    throw new Error(`Backend did not start within ${MAX_WAIT_MS / 1000}s`);
  }

  console.log('\n📥 Fetching OpenAPI spec...');
  const res = await fetch(API_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${API_URL}`);

  const spec = await res.json();
  mkdirSync(join(ROOT, 'shared'), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2), 'utf-8');

  const endpoints = Object.keys(spec.paths ?? {}).length;
  const schemas = Object.keys(spec.components?.schemas ?? {}).length;
  console.log(`✅ OpenAPI spec saved to shared/openapi.json`);
  console.log(`   ${endpoints} endpoints, ${schemas} schemas`);
} finally {
  console.log('🛑 Stopping backend...');
  backend.kill('SIGTERM');
  // Give it 2s to clean up
  await new Promise((r) => setTimeout(r, 2000));
  try { backend.kill('SIGKILL'); } catch { /* already stopped */ }
}
```

### Step 3: Test the script (requires backend .env to be valid)

```bash
node scripts/export-openapi.mjs
```

Expected output:
```
🚀 Starting NestJS backend to export OpenAPI spec...
   ✓ NestJS started
📥 Fetching OpenAPI spec...
✅ OpenAPI spec saved to shared/openapi.json
   XX endpoints, XX schemas
🛑 Stopping backend...
```

Expected file: `shared/openapi.json` created with content.

### Step 4: Commit

```bash
git add scripts/ shared/.gitkeep
git commit -m "feat: add OpenAPI export script

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Astro Landing Page Scaffold

**Files:**
- Create: `landing-page/` (full Astro project)

### Step 1: Scaffold Astro project

```bash
cd D:\Project\invoice-frontend
pnpm create astro@latest landing-page -- --template minimal --typescript strict --no-git --install
```

When prompted:
- Template: `Empty` (minimal)
- TypeScript: `Strict`
- Install dependencies: `Yes`

### Step 2: Add Astro integrations

```bash
cd landing-page
pnpm astro add tailwind --yes
pnpm astro add sitemap --yes
pnpm astro add mdx --yes
```

### Step 3: Install additional dependencies

```bash
pnpm add gsap @iconify-json/heroicons @iconify-json/lucide astro-icon astro-seo @fontsource/inter
pnpm add -D @astrojs/check
```

### Step 4: Update `landing-page/astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://invoiceapp.my', // update with real domain
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
    mdx(),
    icon({
      include: {
        heroicons: ['*'],
        lucide: ['*'],
      },
    }),
  ],
  output: 'static',
});
```

### Step 5: Create `landing-page/tailwind.config.mjs`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
```

### Step 6: Create `landing-page/src/styles/global.css`

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

:root {
  --color-brand: #2563eb;
}
```

### Step 7: Create base layout `landing-page/src/layouts/BaseLayout.astro`

```astro
---
import { SEO } from 'astro-seo';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const {
  title,
  description = 'Enterprise e-invoicing for Malaysian businesses. LHDN MyInvois compliant.',
  ogImage = '/og-image.png',
} = Astro.props;
---
<!doctype html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <SEO
      title={title}
      description={description}
      openGraph={{
        basic: {
          title,
          type: 'website',
          image: ogImage,
        },
      }}
      twitter={{ card: 'summary_large_image' }}
    />
  </head>
  <body class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
    <slot />
  </body>
</html>
```

### Step 8: Create landing page skeleton `landing-page/src/pages/index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Invoice App — LHDN e-Invoice for Malaysian Businesses">
  <main>
    <!-- Sections will be added in landing-page feature tasks -->
    <section class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-brand-700">Invoice App</h1>
        <p class="mt-4 text-xl text-gray-600">LHDN MyInvois compliant e-invoicing</p>
        <a href="#" class="mt-8 inline-block bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition">
          Get Started Free
        </a>
      </div>
    </section>
  </main>
</BaseLayout>
```

### Step 9: Create `landing-page/package.json` name field (ensure workspace name)

Open `landing-page/package.json` and make sure `"name": "landing-page"` is set.

### Step 10: Run dev server to verify

```bash
cd D:\Project\invoice-frontend\landing-page
pnpm dev
```

Expected: `http://localhost:4321` loads, shows "Invoice App" heading.

### Step 11: Commit

```bash
cd D:\Project\invoice-frontend
git add landing-page/
git commit -m "feat(landing): scaffold Astro 5 landing page with Tailwind, GSAP, MDX, sitemap

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Angular Dashboard Scaffold

**Files:**
- Create: `dashboard/` (full Angular 19 project)

### Step 1: Scaffold Angular project

```bash
cd D:\Project\invoice-frontend
pnpm dlx @angular/cli@19 new dashboard \
  --standalone \
  --routing \
  --style=scss \
  --skip-git \
  --package-manager=pnpm \
  --ssr=false
```

When prompted about analytics: `No`

### Step 2: Ensure workspace name in `dashboard/package.json`

The `"name"` field must be `"dashboard"`. Check and update if needed.

### Step 3: Install PrimeNG + PrimeFlex

```bash
cd dashboard
pnpm add primeng primeicons primeflex
pnpm add @primeng/themes
```

### Step 4: Install NgRx Signal Store

```bash
pnpm add @ngrx/signals @ngrx/store-devtools
```

### Step 5: Install TailwindCSS for Angular

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init
```

Create `dashboard/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Avoid conflicts with PrimeNG
  corePlugins: {
    preflight: false,
  },
};
```

### Step 6: Install charts and utilities

```bash
pnpm add ng-apexcharts apexcharts
pnpm add dayjs jwt-decode
pnpm add -D @types/apexcharts
```

### Step 7: Install OpenAPI generator

```bash
pnpm add -D @openapitools/openapi-generator-cli
```

Add script to `dashboard/package.json`:
```json
{
  "scripts": {
    "generate:api": "openapi-generator-cli generate -i ../shared/openapi.json -g typescript-angular -o src/app/core/api --additional-properties=ngVersion=19,withInterfaces=true,supportsES6=true,enumPropertyNaming=original,useSingleRequestParameter=false"
  }
}
```

### Step 8: Configure Angular `dashboard/src/styles.scss`

```scss
// PrimeNG Aura theme
@import 'primeflex/primeflex.scss';
@import 'primeicons/primeicons.css';

// Tailwind (no preflight — avoid PrimeNG conflicts)
@tailwind components;
@tailwind utilities;

// Inter font
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
}
```

### Step 9: Configure `dashboard/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        // jwt interceptor added in Task 6
      ]),
    ),
    provideAnimationsAsync(),
  ],
};
```

### Step 10: Create environments

Create `dashboard/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3002',
};
```

Create `dashboard/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.invoiceapp.my', // update with real URL
};
```

### Step 11: Create app directory structure

```bash
cd dashboard/src/app
mkdir -p core/auth core/store core/http shared/components shared/pipes
mkdir -p layout/app-shell layout/auth-layout
mkdir -p features/dashboard features/invoices features/customers
mkdir -p features/einvoice-submissions features/lhdn features/settings
mkdir -p features/superadmin
```

### Step 12: Create stub `app.routes.ts`

Open `dashboard/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    // AppShellComponent added in Task 7
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
```

### Step 13: Create minimal `app.component.ts` (standalone, just router-outlet)

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

### Step 14: Create stub login component (so build passes)

Create `dashboard/src/app/features/auth/login/login.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="bg-white p-8 rounded-xl shadow text-center">
        <h1 class="text-2xl font-bold">Invoice App</h1>
        <p class="text-gray-500 mt-2">Login page — coming soon</p>
      </div>
    </div>
  `,
})
export class LoginComponent {}
```

Create `dashboard/src/app/features/dashboard/dashboard.component.ts`:
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<h1 class="p-8 text-2xl font-bold">Dashboard</h1>`,
})
export class DashboardComponent {}
```

### Step 15: Build Angular to verify no errors

```bash
cd D:\Project\invoice-frontend\dashboard
pnpm build
```

Expected: `✔ Build complete.` — no TypeScript errors.

### Step 16: Commit

```bash
cd D:\Project\invoice-frontend
git add dashboard/
git commit -m "feat(dashboard): scaffold Angular 19 with PrimeNG, NgRx Signals, Tailwind, ApexCharts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Run OpenAPI Export + Generate API Client

**Prerequisite:** Backend `.env` must be valid (already fixed in Phase 10).

### Step 1: Run export script

```bash
cd D:\Project\invoice-frontend
node scripts/export-openapi.mjs
```

Expected: `shared/openapi.json` created, ~100+ endpoints listed.

### Step 2: Run Angular code generation

```bash
pnpm --filter dashboard run generate:api
```

Expected output:
```
[main] Successfully generated code to dashboard/src/app/core/api
```

Expected files created:
- `dashboard/src/app/core/api/api/invoices.service.ts`
- `dashboard/src/app/core/api/api/customers.service.ts`
- `dashboard/src/app/core/api/api/e-invoice-submissions.service.ts`
- `dashboard/src/app/core/api/model/` — DTO interfaces

### Step 3: Add generated services to `.gitignore` (already done in Task 1)

Confirm `dashboard/src/app/core/api/` is in root `.gitignore`.

### Step 4: Build Angular with generated API to verify no type errors

```bash
cd dashboard
pnpm build
```

If TypeScript errors from generated code, add to `dashboard/tsconfig.json`:
```json
{
  "exclude": ["src/app/core/api/**"]
}
```

### Step 5: Commit script run evidence

```bash
cd D:\Project\invoice-frontend
# openapi.json is gitignored — just confirm it was generated
echo "✅ shared/openapi.json generated ($(wc -c < shared/openapi.json) bytes)"
git add scripts/
git commit -m "chore: verify OpenAPI export + Angular codegen pipeline works

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Angular Auth Service + JWT Interceptors

**Files:**
- Create: `dashboard/src/app/core/auth/auth.service.ts`
- Create: `dashboard/src/app/core/http/jwt.interceptor.ts`
- Create: `dashboard/src/app/core/http/refresh.interceptor.ts`
- Create: `dashboard/src/app/core/auth/auth.store.ts`
- Modify: `dashboard/src/app/app.config.ts`

### Step 1: Create `auth.store.ts` (NgRx Signal Store)

```typescript
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: number; email: string; role: string; companyId: number | null } | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  user: null,
  isLoading: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setTokens(accessToken: string, refreshToken: string) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      patchState(store, { accessToken, refreshToken });
    },
    clearTokens() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      patchState(store, { accessToken: null, refreshToken: null, user: null });
    },
  })),
);
```

### Step 2: Create `jwt.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.accessToken();

  if (token && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
```

### Step 3: Create `refresh.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../auth/auth.store';
import { environment } from '../../../environments/environment';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || req.url.includes('/auth/')) {
        return throwError(() => err);
      }

      const refreshToken = authStore.refreshToken();
      if (!refreshToken) {
        authStore.clearTokens();
        return throwError(() => err);
      }

      return http
        .post<{ accessToken: string; refreshToken: string }>(
          `${environment.apiUrl}/auth/refresh`,
          { refreshToken },
        )
        .pipe(
          switchMap((tokens) => {
            authStore.setTokens(tokens.accessToken, tokens.refreshToken);
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            return next(retried);
          }),
          catchError((refreshErr) => {
            authStore.clearTokens();
            return throwError(() => refreshErr);
          }),
        );
    }),
  );
};
```

### Step 4: Wire interceptors in `app.config.ts`

```typescript
import { jwtInterceptor } from './core/http/jwt.interceptor';
import { refreshInterceptor } from './core/http/refresh.interceptor';

// In providers:
provideHttpClient(
  withInterceptors([jwtInterceptor, refreshInterceptor]),
),
```

### Step 5: Build to verify no errors

```bash
cd D:\Project\invoice-frontend\dashboard
pnpm build
```

Expected: Clean build.

### Step 6: Commit

```bash
cd D:\Project\invoice-frontend
git add dashboard/src/app/core/
git commit -m "feat(dashboard): add JWT auth store and HTTP interceptors for token injection/refresh

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7: Angular App Shell Layout

**Files:**
- Create: `dashboard/src/app/layout/app-shell/app-shell.component.ts`
- Create: `dashboard/src/app/layout/auth-layout/auth-layout.component.ts`
- Modify: `dashboard/src/app/app.routes.ts`

### Step 1: Create sidebar nav config

Create `dashboard/src/app/layout/app-shell/nav-items.ts`:

```typescript
export interface NavItem {
  label: string;
  icon: string;        // PrimeIcons class e.g. 'pi pi-home'
  route: string;
  roles?: string[];    // restrict to role if set
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    icon: 'pi pi-home',         route: '/dashboard' },
  { label: 'Invoices',     icon: 'pi pi-file',         route: '/invoices' },
  { label: 'Customers',    icon: 'pi pi-users',         route: '/customers' },
  { label: 'Products',     icon: 'pi pi-box',           route: '/products' },
  { label: 'Payments',     icon: 'pi pi-credit-card',   route: '/payments' },
  { label: 'Quotations',   icon: 'pi pi-file-edit',     route: '/quotations' },
  { label: 'E-Invoice',    icon: 'pi pi-send',          route: '/einvoice-submissions' },
  { label: 'LHDN',         icon: 'pi pi-globe',         route: '/lhdn/notifications' },
  { label: 'Settings',     icon: 'pi pi-cog',           route: '/settings' },
];

export const SUPERADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Companies',    icon: 'pi pi-building',      route: '/superadmin/companies' },
  { label: 'Subscriptions',icon: 'pi pi-credit-card',   route: '/superadmin/subscriptions' },
  { label: 'Analytics',    icon: 'pi pi-chart-bar',     route: '/superadmin/analytics' },
  { label: 'Audit Logs',   icon: 'pi pi-shield',        route: '/superadmin/audit' },
];
```

### Step 2: Create `app-shell.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { AuthStore } from '../../core/auth/auth.store';
import { NAV_ITEMS, SUPERADMIN_NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgClass, NgIf],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <aside class="w-64 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
        <div class="p-6 border-b dark:border-gray-700">
          <h1 class="text-xl font-bold text-blue-600">Invoice App</h1>
        </div>
        <nav class="flex-1 p-4 overflow-y-auto">
          <ul class="space-y-1">
            <li *ngFor="let item of navItems">
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium"
              >
                <i [class]="item.icon + ' text-base'"></i>
                {{ item.label }}
              </a>
            </li>
          </ul>
          <!-- SuperAdmin section -->
          <div *ngIf="isSuperAdmin" class="mt-6">
            <p class="text-xs text-gray-400 uppercase tracking-wider px-3 mb-2">Platform Admin</p>
            <ul class="space-y-1">
              <li *ngFor="let item of superAdminItems">
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-purple-50 text-purple-600"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
                >
                  <i [class]="item.icon + ' text-base'"></i>
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <!-- User section -->
        <div class="p-4 border-t dark:border-gray-700">
          <button
            (click)="logout()"
            class="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition w-full"
          >
            <i class="pi pi-sign-out"></i>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppShellComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  navItems = NAV_ITEMS;
  superAdminItems = SUPERADMIN_NAV_ITEMS;

  get isSuperAdmin(): boolean {
    return this.authStore.user()?.role === 'super_admin';
  }

  logout() {
    this.authStore.clearTokens();
    this.router.navigate(['/login']);
  }
}
```

### Step 3: Create `auth-layout.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <router-outlet />
    </div>
  `,
})
export class AuthLayoutComponent {}
```

### Step 4: Update `app.routes.ts` to use shell

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
```

### Step 5: Build to verify

```bash
cd D:\Project\invoice-frontend\dashboard
pnpm build
```

Expected: Clean build.

### Step 6: Run dev server and check layout renders

```bash
pnpm start
```

Navigate to `http://localhost:4200/dashboard` — sidebar + main area should render.

### Step 7: Commit

```bash
cd D:\Project\invoice-frontend
git add dashboard/src/app/layout/ dashboard/src/app/app.routes.ts
git commit -m "feat(dashboard): add app shell layout with sidebar navigation and auth layout

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 8: Configure API Base URL in Generated Services

**Files:**
- Create: `dashboard/src/app/core/api/api.module.config.ts`
- Modify: `dashboard/src/app/app.config.ts`

### Step 1: Create API configuration provider

Create `dashboard/src/app/core/api/api-config.ts`:

```typescript
import { Provider } from '@angular/core';
import { Configuration, ConfigurationParameters } from './configuration';
import { environment } from '../../environments/environment';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.apiUrl,
  };
  return new Configuration(params);
}

export const API_PROVIDERS: Provider[] = [
  {
    provide: Configuration,
    useFactory: apiConfigFactory,
  },
];
```

### Step 2: Add to `app.config.ts` providers

```typescript
import { API_PROVIDERS } from './core/api/api-config';

// In providers array:
...API_PROVIDERS,
```

### Step 3: Build to verify

```bash
pnpm build
```

### Step 4: Commit

```bash
cd D:\Project\invoice-frontend
git add dashboard/src/app/core/ dashboard/src/app/app.config.ts
git commit -m "feat(dashboard): wire OpenAPI generated services with backend URL config

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 9: Landing Page Content Sections

**Files:**
- Create: `landing-page/src/components/sections/Hero.astro`
- Create: `landing-page/src/components/sections/Features.astro`
- Create: `landing-page/src/components/sections/Pricing.astro`
- Create: `landing-page/src/components/sections/FAQ.astro`
- Create: `landing-page/src/components/sections/CTA.astro`
- Create: `landing-page/src/components/layout/Header.astro`
- Create: `landing-page/src/components/layout/Footer.astro`
- Modify: `landing-page/src/pages/index.astro`

### Step 1: Create Header

```astro
---
// src/components/layout/Header.astro
const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing',  label: 'Pricing' },
  { href: '/blog',     label: 'Blog' },
];
---
<header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <a href="/" class="text-xl font-bold text-blue-600">Invoice App</a>
      <nav class="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a href={link.href} class="text-sm text-gray-600 hover:text-blue-600 transition">{link.label}</a>
        ))}
      </nav>
      <div class="flex items-center gap-3">
        <a href="http://localhost:4200/login" class="text-sm text-gray-600 hover:text-blue-600">Login</a>
        <a href="http://localhost:4200/login" class="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Get Started
        </a>
      </div>
    </div>
  </div>
</header>
```

### Step 2: Create Hero section

```astro
---
// src/components/sections/Hero.astro
---
<section class="pt-20 pb-16 px-4">
  <div class="max-w-4xl mx-auto text-center">
    <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
      <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
      LHDN MyInvois Certified
    </div>
    <h1 class="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
      E-Invoicing for<br />
      <span class="text-blue-600">Malaysian Businesses</span>
    </h1>
    <p class="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
      Generate, send, and submit invoices to LHDN MyInvois — all in one platform.
      100% compliant with Malaysia e-invoice mandate.
    </p>
    <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="http://localhost:4200/login" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
        Start Free Trial
      </a>
      <a href="#features" class="w-full sm:w-auto border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-50 transition">
        See Features →
      </a>
    </div>
  </div>
</section>
```

### Step 3: Create Features section

```astro
---
// src/components/sections/Features.astro
const features = [
  {
    icon: '🇲🇾',
    title: 'LHDN MyInvois Compliant',
    description: 'Submit e-invoices directly to LHDN. Real-time status tracking with webhook and polling.',
  },
  {
    icon: '📊',
    title: 'Multi-Tenant Ready',
    description: 'Manage multiple companies. Invite team members with role-based access control.',
  },
  {
    icon: '⚡',
    title: 'Automated Recurring',
    description: 'Set up recurring invoices that auto-generate and send on schedule.',
  },
  {
    icon: '📄',
    title: 'PDF & QR Code',
    description: 'Professional PDF invoices with LHDN QR codes embedded automatically after acceptance.',
  },
  {
    icon: '💰',
    title: 'Payment Tracking',
    description: 'Track payments, issue credit memos, and maintain full financial audit trail.',
  },
  {
    icon: '🔒',
    title: 'Secure & Auditable',
    description: '7-year immutable audit log. SHA-256 tamper-proof records for Malaysian law compliance.',
  },
];
---
<section id="features" class="py-20 px-4 bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 dark:text-white">Everything you need</h2>
      <p class="mt-4 text-xl text-gray-500">Built for Malaysian businesses, compliant by default.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((f) => (
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
          <div class="text-4xl mb-4">{f.icon}</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{f.title}</h3>
          <p class="mt-2 text-gray-500 text-sm leading-relaxed">{f.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Step 4: Create Pricing section

```astro
---
// src/components/sections/Pricing.astro
const plans = [
  {
    name: 'Starter',
    price: 'RM 49',
    period: '/month',
    description: 'For small businesses just getting started.',
    features: ['50 invoices/month', 'LHDN e-invoice submission', '2 users', 'Email support'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Business',
    price: 'RM 149',
    period: '/month',
    description: 'For growing businesses with more volume.',
    features: ['Unlimited invoices', 'LHDN e-invoice submission', '10 users', 'Recurring invoices', 'Priority support', 'CSV bulk upload'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs.',
    features: ['Unlimited everything', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
    cta: 'Contact Sales',
    highlight: false,
  },
];
---
<section id="pricing" class="py-20 px-4">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h2>
      <p class="mt-4 text-xl text-gray-500">No hidden fees. Cancel anytime.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div class={`p-8 rounded-2xl border ${plan.highlight ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
          <h3 class="text-lg font-semibold">{plan.name}</h3>
          <div class="mt-4 flex items-baseline gap-1">
            <span class="text-4xl font-bold">{plan.price}</span>
            <span class={plan.highlight ? 'text-blue-200' : 'text-gray-400'}>{plan.period}</span>
          </div>
          <p class={`mt-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{plan.description}</p>
          <ul class="mt-6 space-y-3">
            {plan.features.map((f) => (
              <li class="flex items-center gap-2 text-sm">
                <span class={plan.highlight ? 'text-blue-200' : 'text-blue-500'}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <a href="http://localhost:4200/login" class={`mt-8 block text-center py-3 rounded-xl font-semibold transition ${plan.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {plan.cta}
          </a>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Step 5: Update `index.astro` to use all sections

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import Hero from '../components/sections/Hero.astro';
import Features from '../components/sections/Features.astro';
import Pricing from '../components/sections/Pricing.astro';
---
<BaseLayout title="Invoice App — LHDN e-Invoice for Malaysian Businesses">
  <Header />
  <main>
    <Hero />
    <Features />
    <Pricing />
  </main>
  <footer class="py-12 border-t text-center text-gray-400 text-sm">
    © 2026 Invoice App. All rights reserved.
  </footer>
</BaseLayout>
```

### Step 6: Run dev server

```bash
cd D:\Project\invoice-frontend\landing-page
pnpm dev
```

Visit `http://localhost:4321` — hero, features, and pricing should render.

### Step 7: Commit

```bash
cd D:\Project\invoice-frontend
git add landing-page/src/
git commit -m "feat(landing): add hero, features, pricing sections

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 10: Final Verification + README

**Files:**
- Create: `README.md`

### Step 1: Create root `README.md`

```markdown
# Invoice Frontend

Monorepo containing the Invoice App frontend applications.

## Structure

| Directory | Framework | Purpose |
|-----------|-----------|---------|
| `landing-page/` | Astro 5.x | Public marketing site |
| `dashboard/` | Angular 19 | Company + SuperAdmin app |
| `shared/` | — | Shared assets (OpenAPI spec) |
| `scripts/` | Node.js ESM | Build tooling |

## Prerequisites

- Node 20+
- pnpm 8+
- Backend running at `http://localhost:3002` (see `D:\Project\invoice-api`)

## Setup

```bash
pnpm install
```

## Development

```bash
# Both apps
pnpm dev:all

# Individual
pnpm --filter landing-page dev     # http://localhost:4321
pnpm --filter dashboard start      # http://localhost:4200
```

## Generate API Client

Requires NestJS backend to be startable:
```bash
pnpm generate:api
```

This exports `shared/openapi.json` from the backend and regenerates
`dashboard/src/app/core/api/` — all TypeScript Angular services and models.

## Build

```bash
pnpm build:all
```

## Tech Stack

### Landing Page
- Astro 5.x, TailwindCSS v4, GSAP, Astro Content Collections (MDX blog)

### Dashboard  
- Angular 19 (standalone), PrimeNG 19, NgRx Signal Store, TailwindCSS v4
- Charts: ApexCharts (ng-apexcharts)
- API: Auto-generated from OpenAPI spec via openapi-generator-cli
```

### Step 2: Final build check

```bash
cd D:\Project\invoice-frontend
pnpm --filter landing-page build
pnpm --filter dashboard build
```

Both should complete without errors.

### Step 3: Final commit

```bash
git add README.md
git commit -m "docs: add README with setup and dev instructions

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Summary: New Endpoints Available After Setup

| URL | App | Description |
|-----|-----|-------------|
| `http://localhost:4321` | Landing Page | Marketing site |
| `http://localhost:4200` | Dashboard | Company/SuperAdmin app |
| `http://localhost:3002` | Backend API | NestJS (existing) |

## File Counts After Full Setup

```
invoice-frontend/
├── landing-page/    ~30 files
├── dashboard/       ~50 files (+ ~200 generated API files)
├── scripts/         1 file
├── shared/          1 generated file
└── docs/plans/      2 files
```
