# Next.js Migration Design

**Date:** 2026-02-28  
**Status:** Approved  
**Scope:** Replace Angular 19 dashboard with Next.js 15 + shadcn/ui + Zustand + TanStack Query

---

## Motivation

The current Angular 19 + PrimeNG 21 dashboard (~16,500 LOC, 36 components, 12 stores) works but the team wants to move to a modern React stack for better DX, ecosystem breadth, hiring, and UI customizability.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| UI | shadcn/ui + Tailwind CSS v4 + Radix primitives |
| Tables | TanStack Table v8 + shadcn DataTable |
| Charts | Recharts |
| Client State | Zustand (auth, UI preferences) |
| Server State | TanStack Query v5 (API cache, mutations) |
| API Client | @hey-api/openapi-ts (regenerated for fetch) |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Monorepo | pnpm workspaces (unchanged) |

## Project Structure

```
dashboard/
├── src/
│   ├── app/                        # App Router
│   │   ├── (auth)/                 # Unauthenticated layout group
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── accept-invite/page.tsx
│   │   ├── (dashboard)/            # Authenticated layout group
│   │   │   ├── layout.tsx          # Shell: sidebar + topbar + auth check
│   │   │   ├── page.tsx            # Dashboard home
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx        # Invoice list
│   │   │   │   ├── new/page.tsx    # Create invoice
│   │   │   │   └── [uuid]/
│   │   │   │       ├── page.tsx    # Invoice detail
│   │   │   │       └── edit/page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [uuid]/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   ├── quotations/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── recurring/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   ├── e-invoices/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx        # Company settings
│   │   │   │   ├── team/page.tsx
│   │   │   │   ├── lhdn/page.tsx
│   │   │   │   ├── billing/page.tsx
│   │   │   │   ├── templates/page.tsx
│   │   │   │   ├── tax/page.tsx
│   │   │   │   └── sessions/page.tsx
│   │   │   └── superadmin/
│   │   │       ├── page.tsx        # Tenant list
│   │   │       ├── users/page.tsx
│   │   │       └── audit/page.tsx
│   │   ├── layout.tsx              # Root: providers, fonts, theme
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn/ui generated components
│   │   ├── data-table/             # Reusable DataTable with pagination
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   └── columns/            # Per-feature column definitions
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   └── nav-items.ts
│   │   ├── stat-card.tsx
│   │   ├── page-header.tsx
│   │   ├── empty-state.tsx
│   │   ├── file-upload-zone.tsx
│   │   └── company-picker.tsx
│   ├── lib/
│   │   ├── api/                    # Generated SDK
│   │   │   ├── client.ts           # Client config, interceptors
│   │   │   ├── sdk.gen.ts          # Auto-generated
│   │   │   └── types.gen.ts        # Auto-generated
│   │   ├── stores/
│   │   │   ├── auth-store.ts       # Zustand: user, context, token
│   │   │   └── ui-store.ts         # Zustand: sidebar, theme, preferences
│   │   ├── queries/                # TanStack Query hooks per domain
│   │   │   ├── invoices.ts
│   │   │   ├── customers.ts
│   │   │   ├── payments.ts
│   │   │   ├── quotations.ts
│   │   │   ├── products.ts
│   │   │   ├── recurring.ts
│   │   │   ├── approvals.ts
│   │   │   ├── credit-memos.ts
│   │   │   ├── e-invoices.ts
│   │   │   ├── templates.ts
│   │   │   ├── tax.ts
│   │   │   ├── reports.ts
│   │   │   ├── settings.ts
│   │   │   └── superadmin.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-company.ts
│   │   │   ├── use-sse.ts
│   │   │   └── use-debounce.ts
│   │   ├── validators/             # Zod schemas per domain
│   │   │   ├── invoice.ts
│   │   │   ├── customer.ts
│   │   │   └── ...
│   │   └── utils.ts                # unwrapResponse, formatCurrency, etc.
│   ├── middleware.ts               # Auth guard, role checks
│   └── types/                      # Shared frontend-only types
│       └── index.ts
├── public/
├── next.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn/ui config
├── tsconfig.json
└── package.json
```

## Architecture Decisions

### 1. Server Components for Data-Heavy Pages

Invoice list, customer list, dashboard, reports — initial data fetched server-side. Interactive parts (filters, modals, forms) are Client Components. This cuts client JS and speeds first paint.

### 2. TanStack Query as Server State Layer

Every API domain gets a query hooks file:

```typescript
// lib/queries/invoices.ts
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (filters: InvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (uuid: string) => [...invoiceKeys.all, 'detail', uuid] as const,
};

export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoicesControllerFindAll({ query: filters as any }),
    select: (data) => unwrapResponse(data),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvoiceDto) => invoicesControllerCreate({ body }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.all }),
  });
}
```

### 3. Zustand for Client-Only State

Auth and UI state only — everything else lives in TanStack Query cache:

```typescript
// lib/stores/auth-store.ts
interface AuthState {
  user: AuthUser | null;
  context: CompanyContext | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, context: CompanyContext | null, token: string) => void;
  clearAuth: () => void;
  setContext: (context: CompanyContext) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      context: null,
      accessToken: null,
      setAuth: (user, context, token) => set({ user, context, accessToken: token }),
      clearAuth: () => set({ user: null, context: null, accessToken: null }),
      setContext: (context) => set({ context }),
    }),
    { name: 'auth-storage' }
  )
);
```

### 4. Next.js Middleware for Auth

Replaces Angular route guards:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/superadmin')) {
    // Role check via JWT decode
  }

  if (!token && pathname !== '/login' && pathname !== '/forgot-password') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next|api|login|forgot-password|accept-invite).*)'],
};
```

### 5. Reusable DataTable Component

Single `<DataTable>` component wrapping TanStack Table + shadcn:

```typescript
// components/data-table/data-table.tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  isLoading?: boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
}
```

Each feature defines its columns separately for type safety.

### 6. SSE via Custom Hook

```typescript
// lib/hooks/use-sse.ts
export function useSse(url: string | null) {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  useEffect(() => {
    if (!url) return;
    const source = new EventSource(url, { withCredentials: true });
    setStatus('connected');
    source.onmessage = (e) => setData(JSON.parse(e.data));
    source.onerror = () => setStatus('error');
    return () => source.close();
  }, [url]);

  return { data, status };
}
```

### 7. Response Unwrapping

Backend wraps all responses in `successResponse({ data, message })`. Central utility:

```typescript
// lib/utils.ts
export function unwrapResponse<T>(response: { data?: any }): T {
  const payload = (response?.data as any)?.data ?? response?.data;
  return payload as T;
}
```

Used in every TanStack Query `select` option.

## Feature Mapping

| Feature | Components | Query Hooks | Notes |
|---------|-----------|-------------|-------|
| Auth | LoginPage, ForgotPassword, AcceptInvite, CompanyPicker | useLogin mutation | Zustand for token/user |
| Dashboard | DashboardPage, StatCards, RevenueChart, AgingChart | useDashboardStats, useRecentInvoices | Server Component shell |
| Invoices | InvoiceList, InvoiceDetail, InvoiceForm | useInvoices, useInvoice, useCreateInvoice, etc. | 16 endpoints |
| Customers | CustomerList, CustomerDetail, BulkUpload | useCustomers, useCustomer | SSE for bulk upload |
| Payments | PaymentList, RecordPaymentDialog | usePayments, useRecordPayment, useBalance | 4 endpoints |
| Quotations | QuotationList | useQuotations + lifecycle mutations | 10 endpoints |
| Products | ProductList | useProducts CRUD | 6 endpoints |
| Recurring | RecurringList, RecurringForm | useRecurringPlans + lifecycle | 7 endpoints |
| Approvals | ApprovalList + inline in InvoiceDetail | usePendingApprovals, useInvoiceApprovals | 4 endpoints |
| Credit Memos | Inline in InvoiceDetail | useCreditMemos, useCreateMemo | 4 endpoints |
| E-Invoices | EInvoiceList, QrCodeDialog | useSubmissions, useQrCode | LHDN integration |
| Reports | ReportsPage, KpiCards, Charts | useAnalytics, useExport | Export CSV/XLSX |
| Settings | Company, Team, LHDN, Billing, Templates, Tax, Sessions | Per-page queries | 7 settings pages |
| Superadmin | TenantList, UserList, AuditLogs | usePlatformOverview, useAdminUsers | Role-protected |

## Migration Approach

**Fresh build.** Scaffold new Next.js app in `dashboard/`, port business logic from Angular.

### Phase Order

1. **Scaffold + Infrastructure** — Next.js project, shadcn/ui, API client, auth store, middleware
2. **Auth Flow** — Login, company picker, forgot password, accept invite
3. **Layout Shell** — Sidebar, topbar, company switcher, user menu
4. **Dashboard** — Stats, charts, recent activity
5. **Core Features** — Invoices, Customers, Payments, Products, Quotations
6. **Extended Features** — Recurring, Approvals, Credit Memos, E-Invoices
7. **Settings** — All 7 settings pages
8. **Superadmin** — Tenant management, user management, audit logs
9. **Reports** — Analytics, export
10. **Polish** — Loading states, error boundaries, empty states, responsive

### What to Keep

- `shared/openapi.json` — regenerate SDK for new project
- `landing-page/` — untouched
- Root monorepo config — add new dashboard workspace
- Business logic patterns from Angular stores — port to TanStack Query hooks

### What to Delete

- Entire `dashboard/` directory (Angular app) — after Next.js is feature-complete

## Design Principles

- **No border-color on cards** — use `shadow-sm` or plain backgrounds
- **Server Components by default** — only `"use client"` when needed (interactivity)
- **Colocation** — query hooks, validators, and column defs live near their features
- **Type safety everywhere** — Zod for forms, generated types for API, strict TypeScript
- **Minimal dependencies** — shadcn owns components, no heavy UI library lock-in
