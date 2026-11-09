# Page Override — Login

**Route:** `/login`
**Layout:** Centered card, minimal

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│        ┌─────────────────────────────────┐                 │
│        │  🏥  Historial Clínico          │                 │
│        │  Accedé a tus pacientes         │                 │
│        ├─────────────────────────────────┤                 │
│        │  ┌─────────────────────────┐   │                 │
│        │  │ Email           ▼       │   │  ← Label + Input│
│        │  ├─────────────────────────┤   │                 │
│        │  │ Contraseña      ▼       │   │  ← Label + Input│
│        │  │ [Mostrar]               │   │  ← Toggle       │
│        │  ├─────────────────────────┤   │                 │
│        │  │ [  Ingresar  ]          │   │  ← Primary btn  │
│        │  └─────────────────────────┘   │                 │
│        │                                 │                 │
│        │  ¿Olvidaste tu contraseña?     │                 │
│        └─────────────────────────────────┘                 │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Card Spec

| Property | Value |
|----------|-------|
| Max width | `400px` |
| Padding | `32px` (desktop), `24px` (mobile) |
| Background | `bg-primary` |
| Border | `1px solid border-subtle` |
| Radius | `radius-2xl` (24px) |
| Shadow | `shadow-lg` |
| Brand accent | `4px` top border `brand-600` |

---

## Form Fields

### Email
- **Type:** `email`
- **Autocomplete:** `email`
- **Label:** "Email" (visible, not placeholder)
- **Placeholder:** `tu@clinica.com`
- **Validation:** Required, email format
- **Error:** Inline, `aria-live="polite"`

### Password
- **Type:** `password` / `text` (toggle)
- **Autocomplete:** `current-password`
- **Label:** "Contraseña"
- **Placeholder:** `••••••••`
- **Toggle:** Button with `Eye`/`EyeOff` icon, `aria-label="Mostrar/ocultar contraseña"`
- **Validation:** Required, min 8 chars (server-side)

### Submit Button
- **Width:** 100%
- **Height:** `48px` minimum
- **Loading state:** Spinner + "Ingresando..."
- **Disabled:** While loading, `opacity-50 cursor-not-allowed`

---

## Error Handling

| Error Type | Display |
|------------|---------|
| Invalid credentials | Banner at top: `role="alert"`, `bg-error-bg`, `text-error-text`, `border-error-border` |
| Network error | Same banner: "Error de conexión. Intente nuevamente." |
| Validation | Inline per field + focus first invalid |

---

## Forgot Password Link
- **Position:** Below button, centered
- **Style:** `text-sm text-brand-600 hover:text-brand-700 underline-offset-2`
- **Href:** `/auth/reset-password` (future)

---

## Accessibility

- **Heading:** h1 "Historial Clínico" (logo), h2 "Accedé a tus pacientes"
- **Form:** `<form noValidate>`, explicit labels
- **Focus order:** Email → Password → Toggle → Submit → Forgot link
- **Focus visible:** `ring-2 ring-brand-500 ring-offset-2`
- **Autofocus:** Email field on mount
- **ARIA:** `aria-describedby` for errors, `aria-invalid` on fields
- **Language:** `lang="es"` on html

---

## Responsive

| Breakpoint | Card Width | Padding |
|------------|------------|---------|
| `< 480px` | `calc(100% - 32px)` | 24px |
| `≥ 480px` | `400px` | 32px |

- Centered with `min-h-screen flex items-center justify-center px-4`

---

## Performance

- No heavy dependencies
- `lucide-react` icons only (tree-shaken)
- No animations on load (instant)
- Preconnect to Supabase auth domain

---

## Dark Mode

- Card: `bg-secondary` (slate-800)
- Borders: `border-border-subtle`
- Inputs: `bg-tertiary`, `border-border-default`
- Text: `text-primary`, `text-secondary`
- Brand accent unchanged

---

*Overrides MASTER.md for /login route only.*