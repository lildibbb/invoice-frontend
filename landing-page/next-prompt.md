---
page: pricing
priority: 2
status: pending
---

# Stitch Wireframe Prompt — Invoiz Pricing Page

Generate the **dedicated Pricing page** for **Invoiz**, Malaysia's premier enterprise-grade e-invoice SaaS platform. This is a standalone page (not the homepage pricing section) with a full comparison table, detailed feature breakdown, and enterprise CTA.

---

## DESIGN SYSTEM (REQUIRED — Read DESIGN.md for full spec)

- **Platform:** Web, desktop-first with mobile responsive
- **Page theme:** Light (Ghost Gray #F9FAFB base, Snow White #FFFFFF cards) with dark CTA band at bottom
- **Display Font:** Bricolage Grotesque (bold, heavy weight for headlines)
- **Body Font:** Inter (all body text, labels, CTAs)
- **Primary Gradient:** Electric Blue (#3B82F6) → Deep Violet (#8B5CF6), 135deg
- **Compliance Accent:** Compliance Emerald (#10B981)
- **CTA Buttons:** 12px rounded corners, gradient fill, glow shadow on hover
- **Light Cards:** White (#FFFFFF) with ash border (#E2E8F0), gentle hover lift
- **Section spacing:** 120px top/bottom between sections (desktop)
- **No harsh shadows — glows and blooms in dark sections, gentle elevation in light**

---

## Page Structure

### Section 1: Navbar

- Same glassmorphic sticky navbar as homepage
- "Invoiz" wordmark (Bricolage Grotesque bold, white), nav links (Features · Pricing · LHDN · Blog), ghost Log in + gradient Start Free CTA
- Since this is a light page, the navbar should activate its glassmorphic dark-blur state immediately (or use a light variant)

---

### Section 2: Pricing Hero (Ghost Gray bg)

- **Background:** Ghost Gray (#F9FAFB)
- **Content (centered, max-width 720px):**
  - Eyebrow: "PRICING" — 12px Inter 600 uppercase tracking-widest, Electric Blue (#3B82F6)
  - H1: "Simple, transparent pricing" — 56px Bricolage Grotesque 800, Carbon (#0F172A)
  - Subtext: "Start free for 14 days. No credit card required. Cancel anytime." — 18px Inter 400, Graphite (#475569)
  - **Monthly / Annual toggle pill:**
    - Pill shape, Ghost Gray bg, ash border
    - "Monthly" | "Annual" — active tab: white bg, shadow, Carbon text; inactive: Graphite
    - Annual option shows "Save 20%" emerald badge (pill, emerald bg tint, emerald text)

---

### Section 3: 3 Pricing Cards (Snow White bg)

- **Background:** Snow White (#FFFFFF)
- **3-Column card grid, vertically aligned top:**

  **Starter** (white card, ash border, ash ring):
  - Plan badge: "STARTER" — 11px Inter 700 uppercase, Graphite
  - Price: "RM 49" (48px Bricolage 800, Carbon) + "/mo" (18px Inter 400, Graphite) · Annual: "RM 39/mo"
  - Savings note: "Billed RM 468/year (save RM 120)" — 13px Inter 400, emerald (annual only)
  - Subtitle: "For freelancers and small businesses just getting started." — 15px Inter 400, Graphite
  - Divider
  - **Feature list (8 items, checkmark icons in Emerald):**
    1. ✓ 1 company
    2. ✓ 100 invoices/month
    3. ✓ LHDN e-Invoice submission (MyInvois)
    4. ✓ Real-time PDF generation
    5. ✓ Customer management
    6. ✓ Product/service catalog
    7. ✓ Payment tracking
    8. ✓ Email support
  - CTA: "Get Started" — outlined button (ash border, Carbon text), full width

  **Pro** — HIGHLIGHTED tier (electric blue ring `ring-2 ring-blue-500`, scale(1.02), shadow, "Most Popular" gradient pill badge floating above card center):
  - Plan badge: "PRO" — 11px Inter 700 uppercase, Electric Blue
  - "Most Popular" floating pill badge (gradient blue→violet bg, white text 12px Inter 700)
  - Price: "RM 149" (48px Bricolage 800, Carbon) + "/mo" · Annual: "RM 119/mo"
  - Savings note: Annual savings in emerald
  - Subtitle: "For growing businesses that need power and flexibility." — 15px Inter 400, Graphite
  - Divider
  - **Feature list (everything in Starter + 7 more):**
    - Everything in Starter, plus:
    1. ✓ Up to 5 companies
    2. ✓ Unlimited invoices
    3. ✓ API access (REST)
    4. ✓ Analytics dashboard
    5. ✓ Multi-level approval workflows
    6. ✓ Credit memos & refunds
    7. ✓ Priority support (SLA 4h)
  - CTA: "Start Free Trial →" — gradient primary button (blue→violet), full width, glowing

  **Enterprise** (white card, ash border):
  - Plan badge: "ENTERPRISE" — 11px Inter 700 uppercase, Deep Violet (#8B5CF6)
  - Price: "Custom" (48px Bricolage 800, Carbon)
  - Subtitle: "For conglomerates, group companies, and government-linked entities." — 15px Inter 400, Graphite
  - Divider
  - **Feature list (everything in Pro + 6 more):**
    - Everything in Pro, plus:
    1. ✓ Unlimited companies
    2. ✓ Dedicated account manager
    3. ✓ 99.9% SLA guarantee
    4. ✓ Custom invoice branding
    5. ✓ SSO (SAML 2.0 / OIDC)
    6. ✓ On-premise deployment option
  - CTA: "Contact Sales →" — outlined button (Carbon border + text), full width

---

### Section 4: Full Feature Comparison Table (Ghost Gray bg)

- **Background:** Ghost Gray (#F9FAFB)
- **Section Header (centered):**
  - H2: "Compare all features" — 40px Bricolage 700, Carbon
- **Table (max-width 960px, centered, white bg, rounded 16px, ash border):**
  - Header row: Feature name (left) · Starter · Pro · Enterprise (3 plan columns, 120px wide each)
  - Feature categories as section dividers (e.g., "Invoicing", "LHDN Compliance", "Team & Access", "Support")
  - Cells: ✓ (emerald check icon) / ✗ (ash X icon) / text value
  - Pro column header: highlighted with blue tint bg
  - Categories to include:
    **Invoicing:**
    - Companies: 1 · 5 · Unlimited
    - Invoices/month: 100 · Unlimited · Unlimited
    - PDF generation: ✓ · ✓ · ✓
    - Credit memos: ✗ · ✓ · ✓
    - Recurring invoices: ✗ · ✓ · ✓
    - Multi-currency: ✗ · ✓ · ✓
      **LHDN Compliance:**
    - MyInvois submission: ✓ · ✓ · ✓
    - UBL XML generation: ✓ · ✓ · ✓
    - QR code on invoice: ✓ · ✓ · ✓
    - Digital signature: ✓ · ✓ · ✓
    - Submission status tracking: ✓ · ✓ · ✓
      **Team & Access:**
    - User accounts: 1 · 5 · Unlimited
    - Approval workflows: ✗ · ✓ · ✓
    - Role-based access: ✗ · ✓ · ✓
    - SSO (SAML/OIDC): ✗ · ✗ · ✓
    - API access: ✗ · ✓ · ✓
      **Support:**
    - Support channel: Email · Priority (4h SLA) · Dedicated manager
    - Response time: 48h · 4h · 1h
    - SLA guarantee: ✗ · ✗ · ✓
    - Custom onboarding: ✗ · ✗ · ✓

---

### Section 5: FAQ (Snow White bg)

- **Background:** Snow White (#FFFFFF)
- H2: "Pricing FAQs" — 40px Bricolage 700, Carbon
- **Accordion (max-width 720px, centered), 6 pricing-specific questions:**
  1. Can I switch plans after signing up?
  2. What happens when I exceed 100 invoices on Starter?
  3. Is there a free trial on all plans?
  4. Do you offer discounts for NGOs or educational institutions?
  5. How does the Annual billing work? Can I get a refund?
  6. Does pricing include LHDN MyInvois submission fees?

---

### Section 6: Enterprise CTA Band (Abyss Black bg)

- **Background:** Abyss Black (#0A0A0F) with electric blue + violet radial glow blobs
- **Content (centered):**
  - Eyebrow: "ENTERPRISE" — 12px Inter 600 uppercase, Electric Blue
  - H2 (48px Bricolage 800, Starlight): "Need a custom solution for your group?"
  - Subtext (18px Inter 400, Moonbeam): "Talk to our enterprise team. We'll tailor a plan that fits your structure, compliance needs, and budget."
  - CTA Row:
    - Primary: "Talk to Sales →" — gradient button (blue→violet), large, glowing
    - Secondary: "Schedule a Demo" — ghost button (white border, white text)
  - Trust row: ✓ No lock-in contracts · ✓ SSO integration · ✓ On-premise option

---

### Section 7: Footer (Abyss Black bg)

- Same 5-column dark footer as homepage
- Brand · Product · LHDN · Company · Legal columns
- "© 2025 Invoiz Technologies Sdn Bhd" + "Built with ❤️ in Malaysia 🇲🇾"

---

## After Generating Pricing Page

After the pricing page is approved and merged:

1. Update Section 4 in `SITE.md` — check the `pricing` box
2. Move to next page in the roadmap: **LHDN Compliance Page**
3. Update `next-prompt.md` with the LHDN Compliance Page prompt
