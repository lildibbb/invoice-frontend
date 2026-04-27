---
stitch-project-id: 12314638438456233276
---

# Project Vision & Constitution: Invoiz Landing Page

> **AGENT INSTRUCTION:** Read this file before every Stitch iteration. It serves as the project's "Long-Term Memory." If `next-prompt.md` is marked complete or empty, pick the highest priority page from Section 5 (Roadmap) and populate `next-prompt.md` with that page's prompt before generating.

## 1. Core Identity

- **Project Name:** Invoiz
- **Tagline:** "Malaysia's smartest invoice platform"
- **Stitch Project ID:** `12314638438456233276`
- **Product:** Enterprise-grade multi-tenant e-invoicing SaaS for Malaysian businesses. Full LHDN MyInvois compliance.
- **Mission:** Convert Malaysian SME owners, finance managers, and accountants into trial signups. Educate them about the LHDN e-Invoice mandate.
- **Target Audience:** Malaysian SME owners, finance managers, accountants, group CFOs managing multiple companies.
- **Voice:** Premium, confident, technically credible, Malaysian-aware (EN primary, BM references for trust).
- **Framework:** Astro 5.x (static + islands) + Tailwind CSS + GSAP ScrollTrigger + Inter + Bricolage Grotesque

## 2. Visual Language (Stitch Prompt Strategy)

_Strictly adhere to these descriptive rules when prompting Stitch. Do NOT use CSS class names or Tailwind utilities._

### The "Vibe" (Adjectives)

- **Primary:** Cinematic (dark hero, dramatic lighting effects, floating product screenshot)
- **Secondary:** Premium (Linear/Vercel aesthetic, gradient text, precise generous spacing)
- **Tertiary:** Trustworthy (LHDN government badge, Malaysian identity, clear pricing, checkmarks)

### Color Philosophy (Semantic — always include hex)

- **Hero + Footer:** Abyss Black (#0A0A0F) with electric blue (#3B82F6) and violet (#8B5CF6) radial glow blooms
- **Primary action:** Electric Blue → Deep Violet gradient (135deg, #3B82F6 → #8B5CF6)
- **Compliance / Success:** Compliance Emerald (#10B981) — use for LHDN badges and checkmarks
- **Light section bg:** Ghost Gray (#F9FAFB) or Snow White (#FFFFFF)
- **Text on dark:** Starlight (#F8FAFC) primary, Moonbeam (#94A3B8) secondary
- **Text on light:** Carbon (#0F172A) primary, Graphite (#475569) secondary
- **Dark cards:** Deep Charcoal (#111116) with near-invisible white border
- **Light cards:** White (#FFFFFF) with Ash Border (#E2E8F0)

## 3. Architecture & File Structure

```
landing-page/
├── src/
│   ├── pages/
│   │   ├── index.astro          ← homepage (all 12 sections)
│   │   ├── pricing.astro        ← dedicated pricing page
│   │   ├── lhdn-compliance.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── privacy.astro
│   │   └── terms.astro
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro     ← glassmorphic sticky navbar
│   │   │   └── Footer.astro     ← 5-column dark footer
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── Ticker.astro
│   │   │   ├── Features.astro   ← bento grid
│   │   │   ├── HowItWorks.astro
│   │   │   ├── Stats.astro
│   │   │   ├── LhdnCompliance.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── Pricing.astro
│   │   │   ├── Faq.astro
│   │   │   └── CtaBand.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── Badge.astro
│   │       └── Card.astro
│   ├── layouts/
│   │   └── BaseLayout.astro     ← SEO + font loading
│   └── styles/
│       └── global.css
└── public/
    ├── images/                  ← Flow-generated images go here
    └── videos/                  ← Veo-generated videos go here
```

### Navigation Strategy

- **Global Header:** Invoiz wordmark (left) · Features · Pricing · LHDN · Blog (center) · Log In + Start Free (right)
- **Global Footer:** Brand column · Product · LHDN · Company · Legal · © 2025 Invoiz Technologies Sdn Bhd
- **Mobile:** Hamburger icon → full-screen dark overlay drawer with stacked links

## 4. Live Sitemap (Current State)

_The Agent MUST check this box and update when a page is successfully generated and merged._

- [x] `index` — Homepage (all 12 sections: navbar through footer)
- [ ] `pricing` — Dedicated pricing page with comparison table
- [ ] `lhdn-compliance` — LHDN e-Invoice mandate education + Invoiz integration guide
- [ ] `blog/index` — Blog article listing
- [ ] `blog/[slug]` — Blog post template (MDX)
- [ ] `privacy` — Privacy policy
- [ ] `terms` — Terms of service

## 5. The Roadmap — Full Stitch Prompts Per Page

> **AGENT INSTRUCTION:** Each page below has a complete Stitch prompt. When `next-prompt.md` is done, copy the next unchecked page's full prompt block into `next-prompt.md`, then generate. Check the box when merged.

---

### ✅ Page 1: Homepage (`index`) — DONE

---

### Page 2: Pricing (`pricing`)
- [ ] **Generate this page**

```
---
page: pricing
---
Dedicated pricing page for Invoiz — Malaysia's enterprise e-invoice SaaS.

DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first responsive
- Hero bg: Abyss Black (#0A0A0F) with electric blue + violet radial glow blooms
- Light section bg: Ghost Gray (#F9FAFB) and Snow White (#FFFFFF)
- Display font: Bricolage Grotesque (bold/heavy headlines)
- Body font: Inter
- Primary gradient CTA: Electric Blue (#3B82F6) → Deep Violet (#8B5CF6), 135deg, 12px radius, glow on hover
- Dark cards: Deep Charcoal (#111116), near-invisible white border (8% opacity), 16px radius
- Light cards: White (#FFFFFF), ash border (#E2E8F0), gentle hover lift
- Navbar: transparent → glassmorphic dark blur on scroll (as per homepage)

PAGE STRUCTURE:
1. Navbar — same as homepage (Invoiz wordmark, links, Log In + Start Free buttons)
2. Hero Section (Ghost Gray bg):
   - Eyebrow: "PRICING" in electric blue uppercase
   - H1: "Simple pricing. No surprises." (48px Bricolage Grotesque 700, Carbon)
   - Subtext: "Start free, scale as you grow. Cancel anytime." (18px Inter, Graphite)
   - Monthly / Annual toggle pill (Annual shows "Save 20%" emerald badge)
3. 3-Tier Pricing Cards (Ghost Gray bg, centered row, max-width 1100px):
   - STARTER — RM 49/mo (RM 39 annual): "For small businesses starting out". Features: 1 company, 100 invoices/month, LHDN e-Invoice submission, PDF generation, email support, customer management, product catalog, payment tracking. CTA: "Get Started" outlined button.
   - PRO (highlighted) — RM 149/mo (RM 119 annual): "Most Popular" gradient badge. Electric blue ring (ring-2). Slightly scale(1.04). "For growing businesses". Features: everything in Starter PLUS 5 companies, unlimited invoices, API access, analytics dashboard, approval workflows, credit memos, priority support. CTA: "Start Free Trial →" gradient primary button.
   - ENTERPRISE — Custom pricing: "For large groups". Features: everything in Pro PLUS unlimited companies, dedicated CSM, SLA guarantee, custom branding, on-premise option, SSO. CTA: "Contact Sales" outlined button.
4. Feature Comparison Table (Snow White bg):
   - 4-column table: Feature name | Starter | Pro | Enterprise
   - Rows grouped by category: Invoicing, LHDN Compliance, Companies, Support, Security
   - Checkmark (emerald ✓) for included, dash (–) for not included
   - Feature names in Carbon 14px, column headers show plan names + price
5. FAQ Section (Ghost Gray bg):
   - H2: "Pricing questions answered" (36px Bricolage 700, Carbon)
   - 6-question accordion, max-width 720px centered:
     1. Is the free trial really free? No credit card?
     2. What happens after my trial ends?
     3. Can I switch plans later?
     4. Do you charge per company or per user?
     5. Is LHDN submission included in all plans?
     6. Do you offer discounts for NGOs or startups?
6. Enterprise CTA Band (Abyss Black bg):
   - H2: "Need something custom?" (Starlight, 40px Bricolage 700)
   - Subtext: "Talk to our team about enterprise pricing, on-premise hosting, and volume discounts." (Moonbeam, 17px Inter)
   - Two CTAs: "Book a Demo" gradient button + "Contact Sales" ghost button
7. Footer — same as homepage (5-column Abyss Black footer)
```

---

### Page 3: LHDN Compliance (`lhdn-compliance`)
- [ ] **Generate this page**

```
---
page: lhdn-compliance
---
LHDN e-Invoice compliance education page for Invoiz.

DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first responsive
- Hero bg: Abyss Black (#0A0A0F) with electric blue + emerald (#10B981) radial glow blooms (no violet — government trust)
- Light section bg: Ghost Gray (#F9FAFB) and Snow White (#FFFFFF)
- Display font: Bricolage Grotesque
- Body font: Inter
- Compliance Emerald (#10B981) — PRIMARY accent on this page (government trust signal)
- Electric Blue (#3B82F6) — secondary accent
- Same navbar and footer as homepage

PAGE STRUCTURE:
1. Navbar (same as homepage)
2. Hero (Abyss Black bg, centered content, no mockup):
   - Top: "🇲🇾 Official LHDN MyInvois Integration" emerald badge
   - H1: "Stay ahead of Malaysia's e-Invoice mandate" (64px Bricolage 800, Starlight, centered)
   - Subtext: "The Malaysian government requires all businesses to issue e-Invoices via the MyInvois portal. Invoiz is fully certified and handles the entire compliance lifecycle." (17px Inter, Moonbeam, centered, max-width 680px)
   - 2 CTAs centered: "Start Free Trial →" gradient button + "Read the Mandate →" ghost button
3. Timeline Section (Ghost Gray bg):
   - H2: "The LHDN e-Invoice Mandate Timeline" (Carbon, centered)
   - Horizontal timeline with 3 phase markers:
     * Phase 1 — 1 Aug 2024: Large taxpayers (revenue > RM100M). Emerald marker.
     * Phase 2 — 1 Jan 2025: Medium businesses (revenue RM25M–RM100M). Emerald marker (done).
     * Phase 3 — 1 Jul 2025: ALL businesses. Amber/electric blue marker (upcoming, pulsing dot).
   - Below each phase: short description of who is affected
4. What is e-Invoice Section (Snow White bg, 2-col):
   - Left: H2 "What exactly is an LHDN e-Invoice?" + 4 paragraphs explaining UBL XML, digital signing, QR codes, MyInvois portal validation
   - Right: Illustrated card showing a sample invoice with QR code + "LHDN Valid ✓" emerald badge overlay
5. How Invoiz Handles It (Ghost Gray bg):
   - H2: "How Invoiz makes LHDN compliance effortless"
   - 4-step flow (horizontal on desktop, vertical on mobile):
     1. You create invoice in Invoiz → 2. Invoiz signs it digitally → 3. Invoiz submits to MyInvois → 4. Real-time validation + QR generated
   - Each step: numbered emerald badge + icon + title + 2-line description
6. Compliance Checklist (Snow White bg, 2-col):
   - Left: H2 + 8-item checklist with emerald checkmarks:
     ✓ UBL 2.1 XML format compliant
     ✓ IRBM-approved digital signature
     ✓ Real-time MyInvois API submission
     ✓ QR code on every e-Invoice
     ✓ Cancellation within 72-hour window
     ✓ Buyer TIN validation before submission
     ✓ Status tracking (Submitted / Valid / Invalid / Cancelled)
     ✓ Audit trail for every submission
   - Right: "LHDN Certified" badge card + "Get compliant in minutes" CTA
7. FAQ (Ghost Gray bg, accordion, 6 LHDN-specific questions)
8. CTA Band (Abyss Black bg): "Start your LHDN compliance journey today" + trial CTA
9. Footer (same as homepage)
```

---

### Page 4: Blog Index (`blog/index`)
- [ ] **Generate this page**

```
---
page: blog
---
Blog listing page for Invoiz — articles on Malaysian invoicing, LHDN compliance, and business finance.

DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first responsive
- Navbar: same glassmorphic dark blur navbar as homepage
- Content bg: Ghost Gray (#F9FAFB) page background, Snow White (#FFFFFF) article cards
- Display font: Bricolage Grotesque (headlines)
- Body font: Inter
- Electric Blue (#3B82F6) — category tags, links, hover states
- Compliance Emerald (#10B981) — LHDN-category articles tag color
- Cards: White (#FFFFFF), ash border (#E2E8F0), 16px radius, gentle hover lift + blue tint on border

PAGE STRUCTURE:
1. Navbar (same as homepage)
2. Page Header (Ghost Gray bg, centered):
   - Eyebrow: "BLOG" in electric blue uppercase
   - H1: "Insights for Malaysian businesses" (40px Bricolage 700, Carbon)
   - Subtext: "Guides, tips, and updates on e-invoicing, LHDN compliance, and business finance." (Inter, Graphite)
3. Featured Post (Snow White bg, full-width card, 2-col):
   - Left: 16:9 blog post hero image (placeholder: abstract blue gradient)
   - Right: "FEATURED" badge + category tag pill + H2 article title + excerpt text (3 lines) + "Author avatar + name + date" meta row + "Read Article →" blue link
   - Featured article: "Complete Guide to LHDN e-Invoice for Malaysian SMEs in 2025"
4. Article Grid (Ghost Gray bg, 3-column grid):
   - 6 article cards, each: hero image (16:9) + category pill + title (16px Bricolage 600) + excerpt (2 lines, 14px Inter) + author row + read time
   - Article titles:
     1. "LHDN Phase 3: What Every Malaysian Business Must Know by July 2025"
     2. "How to Choose the Right Invoice Platform for Your SME"
     3. "SST vs GST: Understanding Malaysian Business Taxes in 2025"
     4. "Top 5 Mistakes When Submitting e-Invoices to MyInvois"
     5. "Multi-Company Invoicing: A Guide for Malaysian Business Groups"
     6. "Getting Started with Invoiz: From Setup to First LHDN Submission"
   - Category pill colors: "LHDN" = emerald, "Business" = blue, "Tax" = amber, "Tutorial" = violet
5. Load More button (centered, secondary outlined button)
6. Newsletter signup strip (Abyss Black bg): "Get LHDN compliance updates" + email input + Subscribe button
7. Footer (same as homepage)
```

---

### Page 5: Blog Post Template (`blog/post`)
- [ ] **Generate this page**

```
---
page: blog-post
---
Individual blog article page for Invoiz. Show a complete article layout.

DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first responsive
- Navbar: same as homepage
- Content bg: Snow White (#FFFFFF) body, Ghost Gray (#F9FAFB) sidebar
- Display font: Bricolage Grotesque (article title only)
- Body font: Inter (all article body text, 17px, line-height 1.8 — optimized for reading)
- Electric Blue (#3B82F6) — links, inline highlights
- Article max-width: 720px centered for optimal reading

PAGE STRUCTURE:
1. Navbar (same as homepage)
2. Article Hero (full-width, max 900px centered):
   - Breadcrumb: Blog → LHDN Compliance
   - Category pill: "LHDN" emerald badge
   - H1: "Complete Guide to LHDN e-Invoice for Malaysian SMEs in 2025" (48px Bricolage 700, Carbon)
   - Meta row: Author avatar (32px circle) + "Ahmad Rizal" + "·" + "28 Feb 2025" + "·" + "8 min read"
   - Hero image (full-width, 16:9, abstract blue+emerald gradient illustration)
3. Article Body + Sidebar (2-col layout, 720px content + 280px sidebar):
   - LEFT — Article Content:
     * Introduction paragraph
     * H2 section headers with Bricolage Grotesque 700
     * Body text 17px Inter, line-height 1.8
     * Callout block (emerald left-border, emerald-tinted bg): key tips or warnings
     * Ordered/unordered lists with custom blue bullets
     * In-article CTA card: "Try Invoiz free for 14 days" card with gradient button
     * Code/data block: monospace for invoice numbers or API examples
     * Closing section + author bio card
   - RIGHT — Sticky Sidebar:
     * "Table of Contents" card (white, ash border, sticky) with anchor links to H2 sections
     * "Related Articles" card (3 small article links)
     * "Try Invoiz" CTA card (gradient bg, "Start Free Trial →" button, small)
4. Footer (same as homepage)
```

---

### Page 6: About (`about`)
- [ ] **Generate this page**

```
---
page: about
---
About page for Invoiz — the team, mission, and "Built in Malaysia" identity.

DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first responsive
- Hero bg: Abyss Black (#0A0A0F) with electric blue + violet glow blooms
- Light sections: Ghost Gray (#F9FAFB) and Snow White (#FFFFFF)
- Display font: Bricolage Grotesque
- Body font: Inter
- Same navbar and footer as homepage

PAGE STRUCTURE:
1. Navbar (same as homepage)
2. Hero (Abyss Black bg, centered):
   - "🇲🇾 Built in Malaysia" emerald badge
   - H1: "We're building the financial backbone of Malaysian businesses" (60px Bricolage 800, Starlight, gradient word "financial")
   - Subtext: "Invoiz was founded in 2024 to solve the chaos of Malaysian business invoicing — one compliant, beautiful invoice at a time."
3. Mission Section (Ghost Gray bg, 2-col):
   - Left: H2 "Our Mission" + 2 paragraphs about simplifying LHDN compliance and empowering Malaysian SMEs
   - Right: stat cards — Founded 2024 / 1,200+ Companies / 50,000+ Invoices / 99.9% LHDN Success Rate
4. Team Section (Snow White bg):
   - H2: "The team behind Invoiz"
   - 4-person grid: Photo (80px circle) + Name (16px 600) + Title (14px Graphite) + LinkedIn icon
   - Team members: CEO · CTO · Head of Compliance · Head of Product
5. Values Section (Ghost Gray bg, 3-col cards):
   - "LHDN First" — emerald icon, compliance-first approach
   - "Built for Malaysia" — 🇲🇾 icon, Malaysian context and currency
   - "Enterprise Quality" — blue icon, security and reliability
6. CTA Band (Abyss Black bg): "Join 1,200+ businesses on Invoiz" + trial CTA
7. Footer (same as homepage)
```

## 6. Homepage Section Breakdown (12 Sections for index)

When generating the homepage, these sections MUST appear in this order:

| #   | Section         | Background                    | Key Components                                  |
| --- | --------------- | ----------------------------- | ----------------------------------------------- |
| 1   | Navbar          | Transparent (dark on scroll)  | Logo, nav links, ghost+gradient CTAs            |
| 2   | Hero            | Abyss Black + gradient blooms | H1 with gradient word, badge, mockup, trust row |
| 3   | Ticker          | Dark semi-transparent         | Infinite scroll marquee, stats text             |
| 4   | Features Bento  | Ghost Gray                    | Asymmetric bento grid, 9 feature cards          |
| 5   | How It Works    | Snow White                    | 3-step flow, SVG connectors, numbered badges    |
| 6   | Stats Band      | Abyss Black                   | 4 animated counters with gradient numbers       |
| 7   | LHDN Compliance | Ghost Gray                    | 2-col: text+checklist left, flow diagram right  |
| 8   | Testimonials    | Snow White                    | 3 testimonial cards, Malaysian names, stars     |
| 9   | Pricing         | Ghost Gray                    | 3-tier cards, monthly/annual toggle             |
| 10  | FAQ             | Snow White                    | Accordion, 8 questions                          |
| 11  | CTA Band        | Abyss Black                   | Large H2, gradient glow, dual CTAs              |
| 12  | Footer          | Abyss Black                   | 5-col grid, © legal line, social icons          |

## 7. Creative Freedom Guidelines

When the roadmap is complete, follow these innovation principles:

1. **Stay On-Brand:** All new designs must maintain the cinematic dark-hero + gradient identity.
2. **Malaysian Context:** Always reference MYR pricing, LHDN, Malaysian company registration (SSM), Malaysian city/business names.
3. **Performance First:** All sections must be static-renderable by Astro. GSAP and animations are progressive enhancements only — pages must work without JavaScript.
4. **Accessibility:** All interactive elements meet WCAG AA contrast requirements. Dark sections must maintain 4.5:1 text contrast.

### Innovation Ideas (pick from here when backlog is clear)

- [ ] `case-studies.html` — In-depth stories from Malaysian businesses using Invoiz
- [ ] `api-docs` — Beautiful API documentation landing page
- [ ] `changelog` — Product changelog with visual release notes
- [ ] `status` — Real-time system status page (embed Better Uptime or Instatus widget)
- [ ] `integrations` — List of accounting software + ERP integrations (QuickBooks, Xero, SAP)

## 8. Rules of Engagement

1. Do not recreate pages already checked in Section 4.
2. Always update `next-prompt.md` with the next page/section after completing one.
3. Reference `DESIGN.md` for all color, typography, component, and animation decisions.
4. Use descriptive design language in Stitch prompts — never CSS utilities or class names.
5. Keep LHDN compliance messaging accurate: Phase 1 (Aug 2024 — large companies), Phase 2 (Jan 2025 — medium), Phase 3 (Jul 2025 — all businesses).
6. Malaysian currency: always use `RM` prefix, not `MYR` (e.g., `RM 149/mo`).
