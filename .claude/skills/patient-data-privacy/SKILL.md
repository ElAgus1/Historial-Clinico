---
name: patient-data-privacy
description: Garantiza la seguridad y privacidad en la manipulación de datos de pacientes e historias clínicas.
---

# Patient Data Privacy & Security

## Reglas Obligatorias:

1. **Autenticación en Server Actions:** Antes de consultar o modificar `pacientes`, verificar siempre la sesión de Supabase mediante `src/lib/supabase/server.ts`.
2. **Protección de Rutas:** Asegurar que los componentes dentro de `src/app/pacientes/` manejen estados de no autorizado si el usuario no tiene sesión válida.
3. **No Logging de PII:** Queda estrictamente prohibido imprimir en consola (`console.log`) nombres, DNI, diagnósticos o teléfonos de pacientes en entornos de servidor o cliente.
