---
name: prisma-safe-operations
description: Reglas de uso correcto de Prisma ORM para evitar memory leaks y modificaciones destructivas en la base de datos.
---

# Prisma Safe Operations

## Reglas Obligatorias:

1. **Singleton Import:** NUNCA instanciar `new PrismaClient()`. Importar siempre el cliente singleton desde `@/lib/prisma`.
2. **Migraciones:** Nunca ejecutar `prisma migrate dev` sin antes verificar que el archivo `prisma/schema.prisma` no contenga pérdidas de relaciones existentes.
3. **Manejo de Errores:** Envolver toda consulta de lectura/escritura a la base de datos en bloques `try/catch` devolviendo un objeto estructurado `{ success: boolean, error?: string }`.
