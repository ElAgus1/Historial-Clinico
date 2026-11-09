---
name: server-action-validator
description: Estandariza la creación de Server Actions con validación estricta usando Zod.
---

# Server Action Validator

## Reglas Obligatorias:

1. **Directiva:** Todo archivo de acciones debe llevar `'use server'` en la cabecera.
2. **Validación Zod:** Antes de procesar cualquier dato recibido del formulario o cliente, validarlo obligatoriamente contra el esquema en `src/lib/schemas.ts` usando `.safeParse()`.
3. **Formato de Respuesta:** Si la validación falla, retornar inmediatamente `{ success: false, errors: result.error.flatten().fieldErrors }`.
