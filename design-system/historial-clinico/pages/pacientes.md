# Page Override — Pacientes (List)

**Route:** `/pacientes`
**Layout:** Dashboard with header + grid

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header (sticky)                                        │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │  Pacientes          │  │  [Search] [Filters] [+] │  │
│  │  Gestiona el hist.. │  │                         │  │
│  └─────────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Grid (responsive)                                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │ │ Card 4  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐                               │
│  │ Card 5  │ │ Card 6  │                               │
│  └─────────┘ └─────────┘                               │
└─────────────────────────────────────────────────────────┘
```

---

## Grid Breakpoints

| Breakpoint | Columns | Gap | Max Width |
|------------|---------|-----|-----------|
| `< 640px` | 1 | 16px | 100% |
| `640–1023px` | 2 | 20px | 100% |
| `1024–1279px` | 3 | 24px | 100% |
| `≥ 1280px` | 4 | 24px | 1280px |

---

## Patient Card — Enhanced

### Structure
```
┌──────────────────────────────────────────────┐
│  👤  María González López          [⋮]      │
│  38 años  •  Paciente desde Ene 2024        │
├──────────────────────────────────────────────┤
│  📞  +54 9 11 4567-8901                      │
│  📝  Ansiedad generalizada, dificultad       │
│      para dormir, estrés laboral             │
├──────────────────────────────────────────────┤
│  5 sesiones          Próxima: 15 Ene 2024   │
└──────────────────────────────────────────────┘
```

### States
| State | Visual |
|-------|--------|
| Default | `border-subtle`, `shadow-sm` |
| Hover | `border-default`, `shadow-md`, `translate-y-[-2px]` |
| Focus | `border-focus`, `ring-2 ring-brand-500/20` |
| Loading | Skeleton (shimmer) |
| Empty | Centered illustration + CTA |

### Interactions
- **Click anywhere** → navigate to detail
- **Keypad (⋮)** → dropdown: Edit, Duplicate, Archive, Delete
- **Keyboard:** `Enter`/`Space` on card = navigate

---

## Header — Component Spec

### Elements
1. **Title block** (left)
   - H1: "Pacientes" — `text-3xl font-bold text-primary`
   - Subtitle: "Gestiona el historial clínico de tus pacientes" — `text-base text-secondary`

2. **Action bar** (right, wraps on mobile)
   - Search input: `w-64 sm:w-80`, placeholder "Buscar paciente..."
   - Filter dropdown: "Todos", "Con próximas citas", "Sin sesiones"
   - Primary button: "Nuevo Paciente" + Plus icon

### Responsive
- Mobile: Stack vertically, search full-width, button full-width
- Tablet+: Horizontal, items aligned center

---

## Empty State

```
┌────────────────────────────────────┐
│                                    │
│        [Illustration: clipboard]   │
│                                    │
│   No hay pacientes registrados     │
│                                    │
│   Comienza creando tu primer       │
│   historial clínico                │
│                                    │
│   [Nuevo Paciente]  ← Primary btn  │
│                                    │
└────────────────────────────────────┘
```

- Illustration: SVG, 120×120px, `text-muted`
- Centered, `py-16`

---

## Loading State (Skeleton)

Per card skeleton:
```
┌────────────────────────────────────┐
│  ████████████          ████████    │
│  ████████                    ████  │
├────────────────────────────────────┤
│  ████████████████████████████████  │
│  ████████████████████████████████  │
├────────────────────────────────────┤
│  ████████████████  ██████████████  │
└────────────────────────────────────┘
```

- Shimmer animation (respects `prefers-reduced-motion`)
- 4–6 cards shown

---

## Accessibility Notes

- Grid: `role="list"`, cards: `role="listitem"`
- Each card: `<article>` with `aria-labelledby="patient-name-{id}"`
- Search: `<label for="patient-search">Buscar</label>` + `aria-describedby`
- Filter: native `<select>` with proper label
- Empty state: `role="status"` for screen readers
- Skip link in header for keyboard users

---

## Performance

- Patient cards: `React.memo` with `key={paciente.id}`
- Images: none (icons only, from lucide-react)
- Virtualization: not needed (< 100 patients typical)
- Suspense boundary around grid for streaming

---

*Overrides MASTER.md for /pacientes route only.*