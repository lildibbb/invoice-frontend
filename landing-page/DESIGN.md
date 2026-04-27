# Design System: Invoiz Landing Page

**Project ID:** invoiz-landing-2025

## 1. Visual Theme & Atmosphere

The Invoiz landing page embodies a **cinematic, high-contrast dark aesthetic** that commands authority and radiates technological sophistication. Inspired by the visual language of Linear, Vercel, and Stripe, the design creates a premium "product company" atmosphere that instantly signals enterprise-grade quality.

The hero section is **dramatically dark** — deep midnight background with electric blue and violet gradient blooms that feel like light emanating through deep space. As the user scrolls, the interface transitions gracefully into **clean light sections** that provide clarity and contrast, making the dark hero feel even more impactful by comparison.

**Key Characteristics:**
- Dramatic dark hero that immediately establishes premium brand identity
- Fluid section transitions from dark to light as user scrolls
- GSAP-powered entrance animations that feel cinematic, not decorative
- Floating dashboard mockup as the hero's centerpiece — the product sells itself
- LHDN compliance messaging positioned prominently for Malaysian market trust
- Typography-first sections where bold gradient headlines carry the emotional weight

## 2. Color Palette & Roles

### Foundation — Dark Sections
- **Abyss Black** (`#0A0A0F`) — Hero and footer background. Near-black with blue undertone that makes neon accents vibrate.
- **Deep Charcoal** (`#111116`) — Dark section card backgrounds. Slightly lifted from base to create layering.
- **Midnight Border** (`rgba(255,255,255,0.08)`) — Borders in dark sections. Near-invisible hairlines that define space without heaviness.
- **Ghost Hover** (`rgba(255,255,255,0.05)`) — Hover states in dark sections.

### Foundation — Light Sections
- **Snow White** (`#FFFFFF`) — Card backgrounds in light sections.
- **Ghost Gray** (`#F9FAFB`) — Page background in light sections. Warm near-white for comfortable reading.
- **Ash Border** (`#E2E8F0`) — Borders in light sections. Crisp but soft.

### Brand Gradient
- **Electric Blue** (`#3B82F6`) → **Deep Violet** (`#8B5CF6`) — The Invoiz signature gradient. Used on primary CTAs, gradient text words in headlines, hover glows, and icon containers. Angle: `135deg`.
- **Gradient Text** — Applied to the key word(s) in the hero H1 via CSS `background-clip: text`.

### Semantic Accents
- **Compliance Emerald** (`#10B981`) — LHDN certification badges, success states, verified checkmarks. Communicates official trust.
- **Caution Amber** (`#F59E0B`) — Warning indicators only.
- **Alert Red** (`#EF4444`) — Error states only.

### Typography Colors
| Name | Value | Usage |
|------|-------|-------|
| Starlight | `#F8FAFC` | Primary text on dark. Near-white, easier on eyes. |
| Moonbeam | `#94A3B8` | Secondary text on dark. Muted slate. |
| Eclipse | `#475569` | Tertiary text on dark. Captions and labels. |
| Carbon | `#0F172A` | Primary text on light sections. |
| Graphite | `#475569` | Secondary text on light sections. |

## 3. Typography Rules

**Display Font:** `Bricolage Grotesque` — Load from Google Fonts. Variable-weight geometric display font with a confident, premium character. Use `font-display: swap`.

**UI / Body Font:** `Inter` — Already loaded via `@fontsource/inter`. System-optimized maximum-readability font. Industry-standard SaaS body font.

**Monospace Font:** `JetBrains Mono` — For invoice numbers, IDs, and code references.

### Type Scale

| Role | Font | Size Desktop | Size Mobile | Weight | Color |
|------|------|-------------|------------|--------|-------|
| Hero H1 | Bricolage Grotesque | 72px / 80px lh | 44px / 52px lh | 800 | Starlight + gradient word |
| Section H2 | Bricolage Grotesque | 48px / 56px lh | 32px / 40px lh | 700 | Carbon (light) / Starlight (dark) |
| Card H3 | Bricolage Grotesque | 24px / 32px lh | 20px / 28px lh | 600 | Carbon / Starlight |
| Body Large | Inter | 18px / 28px lh | 16px / 24px lh | 400 | Graphite / Moonbeam |
| Body | Inter | 16px / 24px lh | 14px / 22px lh | 400 | Graphite / Moonbeam |
| Label / Caption | Inter | 14px / 20px lh | 12px / 18px lh | 500 | Eclipse |
| Eyebrow | Inter | 12px uppercase tracking-[0.12em] | — | 600 | Electric Blue (#3B82F6) |
| Monospace | JetBrains Mono | 14px | 13px | 400 | Moonbeam |

### Gradient Text Technique
```css
.gradient-text {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 4. Component Stylings

### Primary CTA Button
- Shape: `border-radius: 12px`
- Background: `linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)`
- Text: White, 15px Inter 600, letter-spacing 0.01em
- Padding: `12px 24px` (md), `16px 32px` (lg)
- Hover: `transform: scale(1.02)` + `box-shadow: 0 0 32px rgba(59,130,246,0.35)`
- Active: `transform: scale(0.98)`
- Transition: `all 200ms ease`

### Ghost CTA Button (dark sections only)
- Background: `rgba(255,255,255,0.05)`
- Border: `1px solid rgba(255,255,255,0.15)`
- Text: Starlight, 15px Inter 500
- Hover: `background: rgba(255,255,255,0.10)`, `border-color: rgba(255,255,255,0.25)`
- Padding: matches primary

### Badge / Pill
- LHDN Certified: `background: rgba(16,185,129,0.12)` · `border: 1px solid rgba(16,185,129,0.25)` · `color: #10B981`
- New / Beta: `background: rgba(139,92,246,0.12)` · `border: 1px solid rgba(139,92,246,0.25)` · `color: #A78BFA`
- Shape: `border-radius: 9999px` · `padding: 4px 12px` · `font: Inter 12px 600 uppercase tracking-[0.08em]`

### Dark Section Card
- Background: `#111116`
- Border: `1px solid rgba(255,255,255,0.08)`
- Border-radius: `16px`
- Padding: `24px` desktop, `16px` mobile
- Hover: `border-color: rgba(59,130,246,0.35)` + `box-shadow: 0 0 24px rgba(59,130,246,0.08)`
- Transition: `all 200ms ease`

### Light Section Card
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Border-radius: `16px`
- Shadow: `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)`
- Hover: `box-shadow: 0 8px 24px rgba(0,0,0,0.08)` + `transform: translateY(-2px)`
- Transition: `all 200ms ease`

### Glassmorphic Navbar
- Default: fully transparent
- On scroll (>80px): `background: rgba(10,10,15,0.75)` + `backdrop-filter: blur(16px) saturate(180%)` + `border-bottom: 1px solid rgba(255,255,255,0.08)`
- Transition: `background 300ms ease, backdrop-filter 300ms ease`

### Feature Icon Container
- Size: `48px × 48px`, `border-radius: 12px`
- Background: `linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)`
- Icon: 24px Heroicons or Phosphor Icons, color `#3B82F6` or `#A78BFA`

### Section Divider Line (Dark)
```css
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
}
```

### Social Proof Ticker
- Full width, 64px height
- Background: `rgba(255,255,255,0.03)` on dark
- Top + bottom border: `1px solid rgba(255,255,255,0.06)`
- Text: Eclipse (`#475569`), 14px Inter 400
- Separator: `·` in Electric Blue

## 5. Layout Principles

### Grid & Containers
- Max container width: `1280px` with `margin: auto`
- Content max width: `960px` (for prose/copy sections)
- Horizontal padding: `24px` mobile → `48px` tablet → `80px` desktop
- Breakpoints: `sm 640px` · `md 768px` · `lg 1024px` · `xl 1280px`

### Section Spacing
- Hero: `min-height: 100dvh`, vertically centered content
- Between sections: `120px` desktop, `80px` mobile
- Section header to content gap: `48px` desktop, `32px` mobile

### Hero Background System
```css
.hero-bg {
  background-color: #0A0A0F;
  background-image:
    radial-gradient(ellipse 80% 60% at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 100%),
    radial-gradient(ellipse 60% 50% at 80% 60%, rgba(139,92,246,0.12) 0%, transparent 100%),
    radial-gradient(ellipse 40% 30% at 50% 95%, rgba(16,185,129,0.07) 0%, transparent 100%);
}
```

### Dashboard Mockup Tilt (Hero)
```css
.mockup-wrapper {
  transform: perspective(1200px) rotateX(8deg) rotateY(-4deg);
  transform-style: preserve-3d;
}
.mockup-image {
  border-radius: 12px;
  box-shadow: 0 80px 160px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
}
.mockup-glow {
  position: absolute;
  bottom: -60px;
  left: 10%;
  width: 80%;
  height: 100px;
  background: radial-gradient(ellipse, rgba(59,130,246,0.3), transparent 70%);
  filter: blur(40px);
}
```

## 6. GSAP Animation Specifications

### Hero Entrance Timeline (page load)
```javascript
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
tl.from('.hero-badge',     { opacity: 0, y: 16, duration: 0.5 }, 0.2)
  .from('.hero-h1 .word',  { opacity: 0, y: 32, stagger: 0.04, duration: 0.7 }, '-=0.3')
  .from('.hero-subtext',   { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
  .from('.hero-cta > *',   { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.4')
  .from('.hero-trust > *', { opacity: 0, y: 16, stagger: 0.06, duration: 0.4 }, '-=0.3')
  .from('.hero-mockup',    { opacity: 0, y: 40, scale: 0.95, duration: 1.0 }, '-=0.6');
```

### ScrollTrigger — Section Reveal (universal)
```javascript
gsap.utils.toArray('.animate-section').forEach(section => {
  gsap.from(section.querySelectorAll('.animate-child'), {
    opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: section, start: 'top 80%' }
  });
});
```

### Stats Counter Animation
```javascript
ScrollTrigger.create({
  trigger: '.stats-section', start: 'top 75%', once: true,
  onEnter: () => {
    gsap.utils.toArray('[data-count]').forEach(el => {
      const target = +el.dataset.count;
      gsap.to({ val: 0 }, {
        val: target, duration: 1.8, ease: 'power2.out',
        onUpdate: function() { el.textContent = Math.round(this.targets()[0].val).toLocaleString('en-MY'); }
      });
    });
  }
});
```

### How It Works — SVG Path Draw
```javascript
gsap.from('.connector-path', {
  drawSVG: '0%', duration: 1.2, ease: 'power2.inOut',
  scrollTrigger: { trigger: '.how-section', start: 'top 70%' }
});
```

### Bento Grid Stagger Reveal
```javascript
gsap.from('.bento-card', {
  opacity: 0, y: 30, scale: 0.97, stagger: 0.12, duration: 0.65, ease: 'power3.out',
  scrollTrigger: { trigger: '.features-section', start: 'top 75%' }
});
```

### Mockup Parallax on Scroll
```javascript
gsap.to('.hero-mockup', {
  y: 80,
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
});
```

## 7. Design System Notes for Stitch Generation

### Language to Use
- **Atmosphere:** "Cinematic dark hero radiating technological authority, transitioning to clean light sections on scroll"
- **Primary Button:** "Electric blue to deep violet gradient with 12px rounded corners, subtle glow on hover"
- **Dark Cards:** "Deep charcoal (#111116) with near-invisible white border (8% opacity), 16px rounded corners"
- **Light Cards:** "Pure white with ash border (#E2E8F0), gentle hover lift with soft shadow"
- **Section spacing:** "Dramatic generous breathing room between sections — 120px on desktop"
- **Navbar:** "Fully transparent on load, activates glassmorphic dark blur effect on scroll"

### Color References (always include hex)
| Semantic Name | Hex | Usage |
|---------------|-----|-------|
| Abyss Black | `#0A0A0F` | Hero + footer bg |
| Electric Blue | `#3B82F6` | CTAs, links, accents |
| Deep Violet | `#8B5CF6` | Gradient endpoint, premium features |
| Compliance Emerald | `#10B981` | LHDN badges, success states |
| Deep Charcoal | `#111116` | Dark section cards |
| Ghost Gray | `#F9FAFB` | Light section bg |
| Carbon | `#0F172A` | Primary text on light |
| Starlight | `#F8FAFC` | Primary text on dark |

### Ready-to-Use Stitch Component Prompts
- "Create a hero section on Abyss Black (#0A0A0F) background with electric blue and violet radial gradient blooms, a 72px Bricolage Grotesque headline with the word 'Smartest' in electric-blue-to-violet gradient text, and a floating dashboard screenshot card with 3D tilt perspective and blue glow beneath it"
- "Design a bento grid features card in Deep Charcoal (#111116) with near-invisible border, 16px rounded corners, a gradient icon container (blue-to-violet), feature title in Starlight white, and description text in Moonbeam slate"
- "Add a glassmorphic sticky navbar that is transparent initially and activates dark blur background on scroll, with an Invoiz wordmark left, centered nav links, and a gradient primary CTA button right"
- "Design a 3-tier pricing section on Ghost Gray (#F9FAFB) with the Pro tier card highlighted with an electric blue ring, 'Most Popular' gradient badge, and slightly elevated scale"
