# Invoice Frontend

Monorepo containing the Invoice App frontend applications.

## Structure

| Directory | Framework | Purpose |
|-----------|-----------|---------|
| `landing-page/` | Astro 5.x | Public marketing site |
| `dashboard/` | Angular 19 | Company + SuperAdmin app |
| `shared/` | — | Shared assets (OpenAPI spec — gitignored) |
| `scripts/` | Node.js ESM | Build tooling |

## Prerequisites

- Node 20+
- pnpm 8+
- Backend at `D:\Project\invoice-api` with valid `.env`

## Setup

```bash
pnpm install
```

## Development

```bash
# Both apps concurrently
pnpm dev:all

# Individual
pnpm --filter landing-page dev     # http://localhost:4321
pnpm --filter dashboard start      # http://localhost:4200
```

## Build

```bash
pnpm build:all
```

## Generate API Client

Requires backend `.env` to be valid:

```bash
pnpm generate:api
```

This exports `shared/openapi.json` from the running NestJS backend, then regenerates
`dashboard/src/app/core/api/` — typed TypeScript types, SDK functions, and HTTP client.

> **Note:** `dashboard/src/app/core/api/` and `shared/openapi.json` are gitignored.
> Run `pnpm generate:api` after pulling to regenerate them.

## Tech Stack

### Landing Page (`landing-page/`)
| Package | Purpose |
|---------|---------|
| Astro 5.x | SSG framework |
| TailwindCSS 3.x | Utility CSS |
| GSAP | Animations |
| astro-icon + heroicons | Icons |
| astro-seo | SEO meta tags |
| @astrojs/mdx | Blog/content |
| @astrojs/sitemap | Sitemap generation |

### Dashboard (`dashboard/`)
| Package | Purpose |
|---------|---------|
| Angular 19 (standalone) | App framework |
| PrimeNG 21 | Enterprise UI components |
| PrimeFlex | Flexbox utilities |
| NgRx Signals | State management |
| TailwindCSS 3.x | Utility CSS |
| ng-apexcharts | Charts |
| @hey-api/openapi-ts | OpenAPI codegen |
| @hey-api/client-fetch | Generated HTTP client |
| dayjs | Date formatting |
| jwt-decode | JWT token parsing |

## Notes

- **pnpm workspace** with `shamefully-hoist=true` — required for Angular CLI builder resolution
- **Bundle size warning** — Angular initial bundle ~650 kB is expected with PrimeNG; add `budgets` config to suppress or use lazy loading
- **Sass deprecation** — PrimeFlex uses `@import` syntax; non-blocking, will be resolved when PrimeFlex updates
