# Historial Clínico

Aplicación Next.js para gestionar pacientes y sus sesiones clínicas.

## Configuración local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env.local` y completa los valores de tu proyecto
   de Supabase:

   - `DATABASE_URL`: cadena **Transaction pooler** de Supabase, con
     `pgbouncer=true`.
   - `DIRECT_URL`: cadena **Direct connection** de Supabase. Se usa para
     `prisma db push` y migraciones.
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: valores de
     `Settings > API`. Actualmente quedan preparados para Auth, Storage y
     Realtime.

3. Genera el cliente y sincroniza el esquema con la base PostgreSQL de
   Supabase:

   ```bash
   npx prisma generate
   npm run db:push
   ```

4. En Supabase, abrí **Authentication > Users > Add user** y crea el usuario
   profesional que vas a usar para ingresar. Luego ejecutá el contenido de
   [`supabase/rls.sql`](./supabase/rls.sql) desde **SQL Editor**.

   RLS debe ejecutarse después de `db push`, porque Prisma crea las tablas y la
   política agrega el aislamiento por usuario. La aplicación también valida la
   sesión y `userId` en cada acción del servidor.

   Si ya existían pacientes antes de activar autenticación, `userId` queda
   temporalmente vacío para no borrar datos. Asociá esos registros desde SQL
   reemplazando `USER_UUID` por el UUID del usuario creado:

   ```sql
   UPDATE "Paciente"
   SET "userId" = 'USER_UUID'
   WHERE "userId" IS NULL;
   ```

5. Inicia el proyecto:

   ```bash
   npm run dev
   ```

La aplicación se sirve en [http://localhost:3000](http://localhost:3000) y
redirige `/` a `/pacientes`.

El proyecto usa exclusivamente PostgreSQL mediante Prisma. El archivo local
`prisma/dev.db` no participa en el desarrollo ni en producción. Cada paciente
queda asociado al usuario que lo creó y cada sesión queda protegida por ese
paciente.

## Comandos útiles

```bash
npm run build       # Comprueba el build de producción
npm run db:studio   # Abre Prisma Studio contra Supabase
```
