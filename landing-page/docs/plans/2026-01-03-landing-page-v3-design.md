# InvoiZ Landing Page v3 — Design Document

## Problem

Current landing page (v2) has several issues:
- Dark hero contradicts the Stripe/Notion white aesthetic the product needs
- Repetitive AI patterns: uppercase section labels, identical card grids, centered everything
- Green/emerald decorative elements (pastel backgrounds, checkmark icons) look generic
- No media — zero images, zero video, all text and divs
- Identical scroll animations (opacity + y translate) across every section
- Icons are either library imports or basic inline SVGs — not premium
- Features are 9 monotonous identical cards with no visual hierarchy

## Design Direction

**Stripe Blueprint** — white-first, typography-driven, enterprise-grade.

### Core Principles
1. **White dominates** — only CTA band and footer use dark backgrounds
2. **Typography carries the design** — no decorative icons, large text, strong hierarchy
3. **Real estate for media** — video player, mockup screenshots, image placeholders
4. **Varied scroll animations** — clip reveals, parallax, scale, not just fade-up
5. **Generous whitespace** — sections breathe with 128-160px padding
6. **No AI tells** — no uppercase labels, no gradients, no pastel icon backgrounds

---

## Foundation

### Color System

| Token | Value | Usage |
|-------|-------|-------|
| `ink` | `#0A0A0A` | Primary text, headings |
| `ink-light` | `#6B7280` | Secondary text, descriptions |
| `ink-muted` | `#9CA3AF` | Tertiary text, small labels |
| `accent` | `#0066FF` | Brand blue, CTAs, links |
| `accent-hover` | `#0052CC` | Hover state for accent |
| `white` | `#FFFFFF` | Primary background |
| `surface` | `#FAFAFA` | Alternate section background |
| `border` | `#E8E8E8` | Borders, dividers, decorative numbers |
| `dark` | `#0A0A0A` | Dark sections (CTA, footer) |

**Removed:** All green/emerald, pastel backgrounds, navy tones.

### Typography

- **Display:** Bricolage Grotesque 800 — headings
- **Body:** Inter 400/500/600 — everything else
- Hero headline: 72-96px, letter-spacing -0.04em
- Section headlines: 48-56px, letter-spacing -0.03em
- Body: 18px, line-height 1.7
- **No uppercase tracking labels** above section headings

### Spacing

- Section padding: py-32 to py-40 (128-160px)
- Max content: 1200px (max-w-6xl)
- Sections touch — background color alternation creates separation

### Scroll Animations (varied per section)

- Hero mockup: GSAP `rotateX` reduces 12° → 0° on scroll (flattens)
- Text reveals: clip-path `inset(0 0 100% 0)` → `inset(0)` (wipe up)
- Cards: staggered scale 0.95→1 + opacity (not y-translate)
- Video section: scale 0.95→1 on scroll into view
- Stats counters: GSAP countUp animation
- Mouse parallax: hero mockup only, ±3° rotateX/Y

---

## Page Structure (14 sections)

### 1. Header
- **Position:** Fixed top, solid white background, 1px bottom border (#E8E8E8)
- **Left:** Blue square logo mark ("iz") + "Invoiz" wordmark in #0A0A0A
- **Center:** Nav links (Features, How It Works, LHDN, Pricing) — ink-light color, no bg on hover
- **Right:** "Join Waitlist →" — solid accent blue button, white text
- **Scroll:** Adds subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` after 40px
- **Mobile:** Hamburger → full-screen white overlay (not dark)

### 2. Hero
- **Background:** Pure white, no patterns
- **Layout:** Centered, single column
- **Headline (96px/48px mobile):** "Invoicing yang finally make sense."
  - All #0A0A0A, no colored words
  - max-w-3xl centered
- **Subtitle (18px):** "Buat invoice, submit LHDN, collect payment — semua dalam satu platform. Built for Malaysian businesses yang nak kerja smart."
  - ink-light, max-w-xl
- **CTAs:** Two buttons side by side, centered
  - Primary: "Join Waitlist →" — solid accent, white text, py-4 px-8, rounded-xl
  - Secondary: "Watch Demo" — border #E8E8E8, ink text, py-4 px-8, rounded-xl
- **Trust line:** "No credit card · Invite-only · Personal onboarding" — ink-muted, 14px, no icons
- **3D Mockup (below, ~80px gap):**
  - 16:10 container, max-w-5xl, centered
  - `perspective(2000px) rotateX(12deg)` — looking down at a dashboard
  - Content: white dashboard UI with sidebar, invoice table, top nav bar (all HTML/CSS)
  - Shadow: `0 60px 120px -25px rgba(0,0,0,0.12)`
  - Border: 1px #E8E8E8, rounded-2xl
  - GSAP: entrance slide-up, scroll rotateX flatten, mouse parallax
  - 2-3 floating micro-cards: "Invoice Sent ✓", "RM 12,450 received" — white, bordered, small shadow

### 3. Logos Strip
- **Background:** White (continuous from hero)
- **Content:** "Trusted by businesses across Malaysia" in ink-muted, 14px
- **Logos:** 6 grayscale placeholder rectangles (company name text in ink-muted)
- **Style:** Horizontal flex, centered, no animation
- **Spacing:** py-16 (smaller than full sections)

### 4. Video Showcase
- **Background:** surface (#FAFAFA)
- **Headline:** "See Invoiz in action" — 48px, centered
- **Video:** `<video>` element, 16:9 ratio, max-w-4xl
  - Poster: solid #F3F4F6 background with centered play button icon
  - Rounded-2xl, border 1px #E8E8E8
  - Shadow: `0 25px 50px -12px rgba(0,0,0,0.08)`
  - Placeholder poster until Veo Flow asset is ready
- **Subtitle:** "Product walkthrough · 2 min" — ink-muted, 14px
- **GSAP:** Scale 0.95→1 + opacity on scroll

### 5. The Problem
- **Background:** White
- **Headline:** "You're still doing invoices the hard way." — 56px, max-w-3xl, centered
- **Subtitle:** "Manual work, missed deadlines, LHDN headaches." — ink-light, centered
- **Layout:** 3 rows, each row is a horizontal problem→solution pair
  - Left (40%): Problem text — bold 20px ink, with "—" prefix dash
  - Right (60%): InvoiZ solution — 16px ink-light, accent blue for key phrases
  - Separator: thin 1px #E8E8E8 line between each row
- **Problems:**
  1. "Manual data entry for every single invoice" → "Auto-fill customer data, products, tax — seconds, not hours"
  2. "Submitting to LHDN is confusing and slow" → "One-click MyInvois submission, validated before it goes"
  3. "Chasing payments with awkward WhatsApp messages" → "Automated reminders, real-time payment tracking"
- **No icons, no numbers, no cards** — pure typography

### 6. Features Bento Grid
- **Background:** Surface (#FAFAFA)
- **Headline:** "Everything you need. Nothing you don't." — 56px, centered
- **Layout:** Asymmetric bento grid, 6 items:
  - **Row 1:**
    - Large cell (col-span-2): "Smart Invoice Editor" — title + 2-line description + image placeholder (16:10 bordered frame, #F3F4F6 bg, "Screenshot coming soon" text)
    - Small cell (col-span-1): "LHDN Submission" — large metric "1.2s" in border color, description below
  - **Row 2:**
    - Small cell: "Payment Tracking" — metric "98%" collection rate, description
    - Large cell (col-span-2): "Multi-Company" — title + description + image placeholder
  - **Row 3:**
    - Medium cell: "Recurring Invoices" — title + description, "Set once, auto-generate monthly"
    - Medium cell: "7-Year Audit Trail" — title + description, "Complete compliance history"
- **Card style:** White bg, 1px border #E8E8E8, rounded-2xl, p-8
- **No icons** — typography + metrics + image placeholders carry the design
- **GSAP:** Staggered scale 0.96→1 + opacity

### 7. How It Works
- **Background:** White
- **Headline:** "Tiga langkah je." — 56px, centered
- **Layout:** 3 columns, connected by thin 1px horizontal line
- **Each step:**
  - Step number: "01" / "02" / "03" in 64px, #E8E8E8 color (decorative)
  - Title: 24px bold ink — "Buat Invoice" / "Submit LHDN" / "Collect Payment"
  - Description: 16px ink-light, 2 lines
  - Mini mockup card below: small 3D perspective card showing relevant UI
    - Step 1: Invoice editor mini
    - Step 2: LHDN submission status (no green bg — use accent blue for status)
    - Step 3: Payment received confirmation
- **Connecting line:** horizontal rule between step columns at the number level

### 8. Stats Bar
- **Background:** #0A0A0A (dark)
- **Layout:** 4 stats in horizontal row, centered
- **Stats:**
  - "2,300+" — "invoices generated"
  - "RM 4.2M" — "processed"
  - "1.2s" — "avg LHDN response"
  - "99.9%" — "uptime"
- **Style:** Large display numbers (48px, white, Bricolage Grotesque), small labels (14px, ink-muted inverted = rgba(255,255,255,0.5))
- **Dividers:** Thin vertical 1px rgba(255,255,255,0.1) between each stat
- **GSAP:** CountUp animation on scroll trigger
- **Spacing:** py-20 (compact)

### 9. LHDN Compliance
- **Background:** White
- **Layout:** 2 columns
  - Left (55%): headline + checklist
    - Headline: "100% LHDN MyInvois compliant." — 48px
    - Subtitle: "Every invoice validated, submitted, and stored according to Malaysian tax regulations." — ink-light
    - Checklist (6 items): em-dash "—" prefix (no green checkmarks), ink text, 16px
      - MyInvois API direct integration
      - Real-time validation before submission
      - Auto-generated QR codes on every invoice
      - 7-year digital audit trail
      - Credit note and debit note support
      - Bulk submission for high-volume businesses
  - Right (45%): Image placeholder — bordered frame for compliance badge/screenshot
    - 4:3 ratio, #F3F4F6 bg, rounded-2xl, border 1px #E8E8E8
    - Text: "Compliance dashboard · Asset coming soon"
- **GSAP:** Clip-path reveal (wipe up) for text column

### 10. Testimonials
- **Background:** Surface (#FAFAFA)
- **Layout:** Single large testimonial (not 3 small cards — more impactful)
- **Decoration:** Giant `"` quotation mark, 200px, #E8E8E8 color, positioned top-left
- **Quote text:** 24px, ink, max-w-3xl, centered, italic
  - "Dulu nak submit invoice to LHDN, pening kepala. Now dengan Invoiz, satu click je settle. Best part — client pun dapat QR code terus."
- **Attribution:** Name, role, company — ink-light, 16px
  - "— Ahmad Razif, Finance Manager, TechVentures Sdn Bhd"
- **Navigation dots** below for future carousel (3 dots, current active = accent blue)

### 11. Pricing
- **Background:** White
- **Headline:** "Simple pricing." — 48px, centered
- **Subtitle:** "No hidden fees. Semua yang you perlukan, one price." — ink-light
- **Card:** Centered, max-w-md, white bg, 1px border, rounded-2xl, p-10
  - "Starting from" — 14px ink-muted
  - "RM 49" — 72px Bricolage Grotesque, ink / "/mo" — 18px ink-light
  - "per company · billed monthly" — 14px ink-muted
  - Inclusion list: 8 items with em-dash prefix (no green checks)
  - CTA: "Join Waitlist →" — full-width, accent blue, white text, rounded-xl
  - "Currently invite-only · No credit card required" — 12px ink-muted
- **Enterprise line:** "Enterprise or custom integrations? Talk to our team →" — accent link

### 12. FAQ
- **Background:** Surface (#FAFAFA)
- **Headline:** "Soalan lazim." — 48px, centered
- **Layout:** Max-w-2xl, centered accordion
- **Style:** Clean border-bottom dividers, +/− text toggle (keep current approach)
- **Questions:** 6-8 Manglish Q&A covering common objections
- **GSAP:** Staggered fade-in

### 13. CTA Band
- **Background:** #0A0A0A (dark)
- **Layout:** Centered, max-w-xl
- **Headline:** "Ready nak start?" — 48px, white
- **Subtitle:** "Join waitlist sekarang. Be among the first Malaysian businesses to try Invoiz." — rgba(255,255,255,0.6)
- **Form:** Inline — email input + submit button on one line
  - Input: dark border (rgba(255,255,255,0.1)), white text, rounded-l-xl
  - Button: white bg, ink text, "Join Waitlist", rounded-r-xl
- **Trust line:** 3 items in ink-muted inverted, no icons

### 14. Footer
- **Background:** #0A0A0A (continuous from CTA — no divider)
- **Layout:** max-w-6xl, 4 columns
  - Col 1: Logo + tagline + social icons (simple text links: X, LinkedIn)
  - Col 2: Product links
  - Col 3: Company links
  - Col 4: Legal links
- **Bottom bar:** "© 2026 Invoiz · Made in Malaysia 🇲🇾" — centered, ink-muted inverted
- **Style:** Clean, minimal, no decorative elements

---

## Asset Placeholders

For media that will come from Veo Flow later:

1. **Video (Section 4):** `<video>` element with poster attribute. Poster is a solid `#F3F4F6` rectangle with centered play triangle (accent blue, 48px). `controls` attribute present. Placeholder src or no src until asset arrives.

2. **Feature screenshots (Section 6):** 16:10 bordered containers with `#F3F4F6` background. Centered text "Screenshot coming soon" in ink-muted. These become `<img>` tags when assets arrive.

3. **Compliance image (Section 9):** 4:3 bordered container. Same treatment as feature screenshots.

4. **All placeholder containers** have consistent styling: rounded-2xl, 1px border #E8E8E8, subtle inner shadow.

---

## SEO Strategy

- **Title:** "Invoiz — The Smartest Way to Invoice in Malaysia | LHDN e-Invoice"
- **Meta description:** Targets "LHDN e-invoice", "Malaysian invoice software", "MyInvois"
- **JSON-LD:** SoftwareApplication + Organization schemas (keep existing)
- **OpenGraph + Twitter Cards:** Keep existing
- **Semantic HTML:** `<main>`, `<section>` with `aria-label`, `<nav>`, `<header>`, `<footer>`
- **Theme color:** `#FFFFFF` (was #0A0A0F)
- **Heading hierarchy:** Single h1 in hero, h2 per section, h3 for sub-items
- **Image alt text:** Descriptive alts on all placeholder images
- **Performance:** No Three.js, no heavy libraries — CSS 3D + GSAP only

---

## Files to Modify

All in `landing-page/src/`:

1. `styles/global.css` — white theme utilities, clip-path animations, grid
2. `tailwind.config.mjs` — new color tokens, remove old ones
3. `layouts/BaseLayout.astro` — white body class, updated theme-color
4. `components/layout/Header.astro` — white solid header
5. `components/layout/Footer.astro` — dark footer redesign
6. `components/sections/Hero.astro` — white centered hero + 3D mockup
7. `components/sections/Ticker.astro` → renamed to `LogosStrip.astro` — grayscale logos
8. `components/sections/PainPoints.astro` → renamed to `Problem.astro` — typography-driven
9. `components/sections/Features.astro` — bento grid with media placeholders
10. `components/sections/HowItWorks.astro` — 3-step with connecting line
11. `components/sections/Stats.astro` — dark stats bar
12. `components/sections/LhdnCompliance.astro` — 2-col with image placeholder
13. `components/sections/Testimonials.astro` — single large quote
14. `components/sections/Pricing.astro` — clean card
15. `components/sections/Faq.astro` — accordion restyle
16. `components/sections/CtaBand.astro` — dark CTA with inline form
17. NEW: `components/sections/VideoShowcase.astro` — video player section
18. `pages/index.astro` — updated imports and section order
