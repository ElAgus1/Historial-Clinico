# Design System — Historial Clínico

**Product Type:** Healthcare SaaS — Patient Records Management
**Target Audience:** Medical professionals (doctors, therapists, clinics)
**Usage Context:** Clinical work environment, desktop-first with tablet support
**Tone:** Trustworthy, clinical, calm, efficient, accessible

---

## 🎨 Color System

### Brand Palette (Semantic Tokens)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-brand-50` | `#f0fdfa` | `#0f2e2a` | Subtle backgrounds |
| `--color-brand-100` | `#ccfbf1` | `#0d3d36` | Hover states |
| `--color-brand-500` | `#14b8a6` | `#2dd4bf` | Primary actions, links |
| `--color-brand-600` | `#0d9488` | `#14b8a6` | Primary buttons, active |
| `--color-brand-700` | `#0f766e` | `#0d9488` | Hover primary |
| `--color-brand-900` | `#134e4a` | `#ccfbf1` | Text on brand bg |

### Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg-primary` | `#ffffff` | `#0f172a` | Page background |
| `--color-bg-secondary` | `#f8fafc` | `#1e293b` | Card backgrounds |
| `--color-bg-tertiary` | `#f1f5f9` | `#334155` | Input backgrounds |
| `--color-border-subtle` | `#e2e8f0` | `#334155` | Dividers, borders |
| `--color-border-default` | `#cbd5e1` | `#475569` | Input borders |
| `--color-border-focus` | `#0d9488` | `#2dd4bf` | Focus rings |
| `--color-text-primary` | `#0f172a` | `#f8fafc` | Headings, primary text |
| `--color-text-secondary` | `#475569` | `#cbd5e1` | Body text |
| `--color-text-muted` | `#94a3b8` | `#64748b` | Placeholders, meta |
| `--color-text-inverse` | `#ffffff` | `#0f172a` | Text on brand bg |

### Status Colors (Accessible Pairs)

| Status | Background | Text | Border | Usage |
|--------|------------|------|--------|-------|
| Success | `#ecfdf5` | `#065f46` | `#a7f3d0` | Saved, confirmed |
| Warning | `#fffbeb` | `#92400e` | `#fde68a` | Pending, upcoming |
| Error | `#fef2f2` | `#991b1b` | `#fecaca` | Validation errors |
| Info | `#eff6ff` | `#1e40af` | `#bfdbfe` | Help text, neutral |

### Contrast Compliance
- All text on backgrounds: **≥ 4.5:1** (WCAG AA)
- Large text (≥18px): **≥ 3:1**
- Interactive elements: **≥ 3:1** against adjacent

---

## 📝 Typography

### Font Stack
```css
--font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
```

### Type Scale (Fluid with clamp)

| Element | Size | Line Height | Weight | Letter Spacing |
|---------|------|-------------|--------|----------------|
| Display | `clamp(2.5rem, 4vw, 3.5rem)` | 1.1 | 700 | -0.02em |
| H1 | `clamp(1.875rem, 3vw, 2.25rem)` | 1.2 | 700 | -0.01em |
| H2 | `clamp(1.5rem, 2.5vw, 1.875rem)` | 1.3 | 600 | -0.01em |
| H3 | `1.25rem` | 1.4 | 600 | 0 |
| Body Large | `1.125rem` | 1.6 | 400 | 0 |
| Body | `1rem` | 1.5 | 400 | 0 |
| Body Small | `0.875rem` | 1.5 | 400 | 0 |
| Caption | `0.75rem` | 1.4 | 500 | 0.01em |
| Mono | `0.875rem` | 1.6 | 400 | 0 |

---

## 📐 Spacing System

### Base Unit: 4px
Scale: `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64`

### CSS Variables
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Layout Max-Widths
- Content narrow: `640px` (forms, detail views)
- Content standard: `896px` (patient cards)
- Content wide: `1280px` (dashboard grids)
- Full: `100%`

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | Tables, full-bleed |
| `--radius-sm` | `0.375rem` (6px) | Badges, chips |
| `--radius-md` | `0.5rem` (8px) | Buttons, inputs |
| `--radius-lg` | `0.75rem` (12px) | Cards, modals |
| `--radius-xl` | `1rem` (16px) | Feature cards |
| `--radius-2xl` | `1.5rem` (24px) | Hero sections |
| `--radius-full` | `9999px` | Pills, avatars |

---

## 🌊 Shadows & Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle dividers |
| `--shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Elevated cards |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, drawers |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | Full-screen overlays |

---

## ⚡ Motion & Animation

### Timing Functions
```css
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);      /* Default: enter */
--ease-in: cubic-bezier(0.4, 0, 1, 1);          /* Exit faster */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
```

### Durations
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | `0ms` | Immediate feedback |
| `--duration-fast` | `150ms` | Hover, focus |
| `--duration-normal` | `200ms` | Transitions |
| `--duration-slow` | `300ms` | Modals, drawers |
| `--duration-slower` | `500ms` | Page transitions |

### Key Animations
- **Fade + slide down**: Enter for lists, dropdowns
- **Fade + scale**: Modals, popovers
- **Shimmer**: Skeleton loaders
- **Pulse**: Loading states (reduced-motion: opacity only)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧩 Component Patterns

### Buttons
| Variant | Background | Text | Border | Hover | Focus Ring |
|---------|------------|------|--------|-------|------------|
| Primary | `brand-600` | `inverse` | none | `brand-700` | `brand-500` |
| Secondary | `bg-secondary` | `text-primary` | `border-default` | `bg-tertiary` | `brand-500` |
| Ghost | transparent | `text-secondary` | none | `bg-tertiary` | `brand-500` |
| Destructive | `error-bg` | `error-text` | `error-border` | darker | `error-border` |

**Min touch target:** `44×44px` (use padding, not fixed size)

### Inputs
- Height: `44px` minimum
- Padding: `12px 16px`
- Border: `1px solid border-default`
- Focus: `2px solid border-focus` + `outline: none`
- Error: `border-error` + `focus:border-error`
- Label: Always visible, `body-small`, `text-secondary`

### Cards
- Background: `bg-secondary`
- Border: `1px solid border-subtle`
- Radius: `radius-xl`
- Shadow: `shadow-sm`
- Hover: `shadow-md` + `border-default` (interactive cards)

### Patient Card (Specific)
```
┌─────────────────────────────────────┐
│  Name                    [Avatar]   │
│  45 años                      👤   │
│  ───────────────────────────────   │
│  📞 +54 9 11 1234-5678             │
│  📝 Motivo de consulta...          │
│  ───────────────────────────────   │
│  3 sesiones        Ene 2024        │
└─────────────────────────────────────┘
```

---

## ♿ Accessibility Checklist

- [ ] All interactive elements: focus-visible ring
- [ ] Color not sole conveyor of meaning
- [ ] Form labels: explicit `<label for="">` or wrapping
- [ ] Error messages: `aria-describedby` + `role="alert"`
- [ ] Loading states: `aria-live="polite"`
- [ ] Keyboard navigation: logical tab order
- [ ] Skip to main content link
- [ ] Heading hierarchy: h1 → h2 → h3 (no skips)
- [ ] ARIA landmarks: main, nav, aside, footer
- [ ] Reduced motion respected
- [ ] Touch targets ≥ 44×44px
- [ ] Text resize up to 200% without horizontal scroll

---

## 🎯 Page-Specific Overrides

### Login Page
- Centered card, max-width 400px
- Subtle brand accent line at top
- Minimal distractions

### Patients List (Dashboard)
- Grid: 1 col mobile → 2 tablet → 3 desktop → 4 wide
- Sticky header with search/filter
- Empty state with illustration

### Patient Detail
- Two-column on desktop: header sticky, sessions scroll
- Session cards expandable
- Form fixed at top or in drawer

### New Patient Form
- Single column, max-width 640px
- Sectioned with clear headings
- Inline validation on blur
- Save → redirect to detail

---

## 📦 Implementation Notes

### Tailwind Config Extensions
```js
// tailwind.config.ts additions
theme: {
  extend: {
    colors: {
      brand: { /* semantic tokens */ },
      surface: { /* bg-primary, bg-secondary, etc */ },
      text: { /* text-primary, text-secondary, etc */ },
      border: { /* border-subtle, border-default, etc */ },
      status: { success, warning, error, info },
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
    spacing: { /* space-* scale */ },
    borderRadius: { /* radius-* scale */ },
    boxShadow: { /* shadow-* scale */ },
    transitionDuration: { /* duration-* scale */ },
    transitionTimingFunction: { /* ease-* */ },
  },
}
```

### CSS Variables (globals.css)
Define all tokens as CSS custom properties for runtime theming (light/dark).

---

*Generated following ui-ux-pro-max design-system workflow and software-design-principles for maintainable, accessible, type-safe code.*