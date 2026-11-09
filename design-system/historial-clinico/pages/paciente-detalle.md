# Page Override — Paciente Detalle

**Route:** `/pacientes/[id]`
**Layout:** Two-column desktop, stacked mobile

---

## Layout Structure (Desktop ≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (sticky top)                                            │
│  ← Volver    [Nombre Paciente]  42 años  [Editar] [Archivar]   │
├─────────────────────┬───────────────────────────────────────────┤
│                     │                                           │
│   SIDEBAR (320px)   │  MAIN (flex-1)                            │
│  ┌───────────────┐  │  ┌───────────────────────────────────┐   │
│  │ Info Paciente │  │  │ Nueva Sesión (sticky top)          │   │
│  │ ──────────── │  │  │  ┌─────────────────────────────┐   │   │
│  │ 📞 Teléfono   │  │  │  │ Form: Fecha, Notas, Próxima │   │   │
│  │ 📅 Nac.       │  │  │  └─────────────────────────────┘   │   │
│  │ 🏷️ Motivo    │  │  ├───────────────────────────────────┤   │
│  │ ──────────── │  │  │ Historial de Sesiones              │   │
│  │ Próxima cita  │  │  │ ┌─────────────────────────────┐   │   │
│  │ 📅 15 Ene     │  │  │ │ Sesión 15 Ene  ▼            │   │   │
│  │ ──────────── │  │  │ │   Notas clínicas...          │   │   │
│  │ Acciones     │  │  │ └─────────────────────────────┘   │   │
│  │ [Editar]      │  │  │ ┌─────────────────────────────┐   │   │
│  │ [Nva. Sesión] │  │  │ │ Sesión 8 Ene   ▼            │   │   │
│  └───────────────┘  │  └───────────────────────────────────┘   │
│                     │                                           │
└─────────────────────┴───────────────────────────────────────────┘
```

---

## Layout Structure (Mobile < 1024px)

```
┌─────────────────────────────────────┐
│  Header (sticky)                    │
│  ← Volver    Nombre Paciente        │
├─────────────────────────────────────┤
│  Patient Info Card (collapsible)    │
├─────────────────────────────────────┤
│  Nueva Sesión Form                  │
├─────────────────────────────────────┤
│  Historial de Sesiones              │
│  ┌─────────────────────────────┐   │
│  │ Sesión 15 Ene  ▼            │   │
│  │   Notas...                  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Components

### Header
- **Back button:** `ArrowLeft` icon + "Volver" (mobile) / icon only (desktop tooltip)
- **Patient name:** H1, `text-2xl font-bold text-primary`
- **Meta badges:** Age, status pill
- **Actions:** Dropdown menu (desktop) / bottom sheet (mobile)

### Sidebar (Desktop Only)
- **Width:** 320px fixed, `sticky top-24`
- **Background:** `bg-secondary`, `border-r border-subtle`
- **Sections:** Info, Próxima cita, Acciones rápidas
- **Collapsible on tablet:** drawer from left

### Nueva Sesión Form (Sticky Top in Main)
- **Position:** `sticky top-24 z-10` with `bg-primary/95 backdrop-blur`
- **Fields:** Fecha (date, required), Notas (textarea, required), Próxima cita (datetime-local, optional)
- **Validation:** Inline on blur, error summary on submit
- **Submit:** Primary button, full-width mobile, auto desktop

### Session List
- **Cards:** Expandable accordion
- **Default:** Collapsed (show date, session count badge, preview)
- **Expanded:** Full notes, edit/delete actions
- **Empty:** Illustration + "No hay sesiones" + CTA to form

---

## Session Card — States

| State | Visual |
|-------|--------|
| Collapsed | Single line: date, badge, chevron |
| Expanded | Full notes, meta, actions |
| Loading | Skeleton per card |
| Error | Inline error banner |

### Accordion Behavior
- **Multiple open:** Allowed
- **Keyboard:** `Enter`/`Space` on header toggles
- **Animation:** `slideDown` 200ms, respects reduced-motion
- **Focus:** Header gets focus ring when expanded

---

## Form Validation (Nueva Sesión)

### Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Fecha | date | Yes | ≤ today, ≥ patient birth |
| Notas | textarea | Yes | Min 10 chars, max 10000 |
| Próxima cita | datetime-local | No | > session date if set |

### Error Display
- **On blur:** Inline below field, `text-error`, `role="alert"`
- **On submit:** Error summary at top + scroll to first error
- **Success:** Toast + form reset + list refresh

---

## Accessibility

- **Headings:** h1 (name), h2 (Nueva Sesión), h2 (Historial), h3 (each session)
- **Landmarks:** `<main>`, `<aside>` (sidebar), `<section aria-labelledby>`
- **Form:** `<form noValidate>`, labels linked, `aria-describedby` errors
- **Accordion:** `aria-expanded`, `aria-controls`, `id` on panels
- **Focus management:** On session add → focus first field; on expand → focus panel
- **Live regions:** Toast announcements, form errors

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 640px` | Stacked, sidebar as collapsible card |
| `640–1023px` | Stacked, sidebar as drawer |
| `≥ 1024px` | Two-column fixed sidebar |

---

## Performance

- Sessions: `React.memo` per card
- Notes: Truncated preview (2 lines) in collapsed state
- Lazy load: Session notes only when expanded
- Suspense: Around patient data + sessions

---

*Overrides MASTER.md for /pacientes/[id] route only.*