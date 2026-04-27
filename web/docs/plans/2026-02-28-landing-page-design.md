# InvoiZ Landing Page — Design Document

**Date**: 2026-02-28
**Status**: Approved

## Problem

InvoiZ has no public landing page. The root `/` goes directly to the dashboard (redirects to `/login`). There's no marketing presence to attract visitors, capture leads, or communicate the product's value. The app is invite-only, so the landing page must drive waitlist signups.

## Approach

**"Dashboard Reveal + Storytelling"** — A single long-scroll landing page that combines a dramatic 3D dashboard mockup hero with narrative storytelling sections. Light & professional visual tone (Stripe/Notion-inspired). Bilingual (EN/BM).

**3D Tech**: Framer Motion + CSS 3D perspective transforms (no Three.js).

## Target Audience

All sizes of Malaysian businesses that invoice — from SMEs to enterprise.

## Page Sections

### 1. Sticky Navigation
- Transparent over hero → white + backdrop blur on scroll
- Logo | Features · How It Works · Pricing · FAQ
- Language toggle (EN/BM) + "Request Access" CTA button
- Smooth scroll to section anchors

### 2. Hero — "Dashboard Reveal"
- Headline: "Invoicing built for Malaysian businesses"
- Subheadline: LHDN e-Invoice compliance + automation messaging
- Primary CTA: "Request Early Access" (waitlist form)
- Secondary CTA: "Watch Demo" (placeholder for Veo video)
- 3D Dashboard Mockup:
  - Perspective-transformed view of dashboard, floating at angle
  - Mouse-follow parallax (subtle tilt on cursor movement)
  - Floating UI fragments orbiting mockup (invoice cards, payment badges)
  - Soft gradient glow behind mockup
  - Entrance animation: slide up + rotate into view on load
- Trust strip: "LHDN Compliant" · "Bank-grade Security" · "500+ Businesses"

### 3. Pain Point Storytelling — "Old Way vs InvoiZ"
- Split layout: Left = pain, Right = solution
- Scroll-triggered crossfade animations
- Pain points:
  - Manual data entry → Smart auto-fill
  - LHDN compliance headaches → Built-in e-Invoice
  - Chasing payments → Automated reminders
- Each row animates with subtle 3D depth on scroll

### 4. Features Grid
- 6 features in 3×2 grid (2×3 on mobile):
  - e-Invoice Compliance · Smart Automation · Multi-currency
  - Payment Tracking · Professional PDFs · Team Collaboration
- Each card: icon + title + one-line description
- Hover: subtle 3D tilt effect
- Scroll-triggered stagger entrance

### 5. How It Works (3-Step Story)
- Three cinematic scroll steps:
  1. Create — 3D mockup of invoice form from left
  2. Send — Sent invoice with e-Invoice badge from right
  3. Get Paid — Payment dashboard floats up from below
- Scroll-linked animations (useScroll + useTransform)
- CSS perspective + rotateY/rotateX transforms

### 6. LHDN Compliance
- Dark-themed section for contrast/authority
- "Built for Malaysian Tax Regulations"
- Animated compliance checklist
- LHDN badge placeholder
- Brief e-Invoice explanation

### 7. Pricing Teaser
- "Simple, transparent pricing"
- "Starting from RM 49/mo" (placeholder)
- Brief included-features list
- "Request Access for Full Pricing" CTA
- No full tier comparison (invite-only exclusivity)

### 8. Testimonials
- Horizontal scrolling testimonial cards
- Each: quote + name + company + role + avatar placeholder
- Subtle 3D tilt on hover
- Placeholder content

### 9. FAQ
- Accordion-style, 6-8 questions
- Topics: LHDN compliance, pricing, data security, onboarding
- Bilingual content

### 10. Final CTA — "Join the Waitlist"
- Full-width gradient section
- Bold heading + inline email capture form
- Social proof: "Join 500+ businesses"

### 11. Footer
- 4-column grid: Product · Company · Legal · Connect
- Social links, language selector
- "Made with ❤️ in Malaysia 🇲🇾"

## Technical Architecture

### File Structure
```
src/app/(marketing)/
├── layout.tsx              # Marketing layout (navbar + footer)
├── page.tsx                # Landing page (all sections)
├── components/
│   ├── navbar.tsx
│   ├── hero-section.tsx
│   ├── pain-points-section.tsx
│   ├── features-section.tsx
│   ├── how-it-works-section.tsx
│   ├── compliance-section.tsx
│   ├── pricing-teaser-section.tsx
│   ├── testimonials-section.tsx
│   ├── faq-section.tsx
│   ├── cta-section.tsx
│   ├── footer.tsx
│   ├── dashboard-mockup-3d.tsx
│   ├── tilt-card.tsx
│   ├── scroll-reveal.tsx
│   ├── language-toggle.tsx
│   └── waitlist-form.tsx
├── lib/
│   └── i18n.ts
```

### SEO Strategy
- `generateMetadata()` with targeted title/description
- Keywords: "e-Invoice Malaysia", "LHDN compliant invoicing", "invoice management"
- JSON-LD: SoftwareApplication + Organization schema
- Semantic HTML: proper heading hierarchy, sections, nav, footer
- OpenGraph + Twitter cards
- Next.js `<Image>` with blur placeholders
- `sitemap.ts` for search engine indexing
- Core Web Vitals optimized (no heavy JS on initial load)

### i18n Approach
- Dictionary-based (no heavy library)
- `i18n.ts` with `content.en` and `content.ms` objects
- Language toggle via URL param `?lang=ms` or cookie
- `<html lang>` attribute switches accordingly

### 3D & Animation
- **Dependency**: `framer-motion` (~30KB gzipped)
- Hero mockup: CSS `perspective(1000px)` + `rotateX/Y` + mouse tracking via `useMotionValue`
- Scroll animations: `useScroll()` + `useTransform()` for parallax
- Tilt cards: `onMouseMove` + CSS perspective transforms
- All animations respect `prefers-reduced-motion`

### Infrastructure Changes
- Add `/` to public paths in `middleware.ts`
- Dashboard mockup is a static styled div (no data fetching)
- Video/image placeholders with gradient backgrounds + icons (swap later with Veo assets)

### New Dependencies
- `framer-motion` — animations and 3D transforms
