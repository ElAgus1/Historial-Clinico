-- Ejecutar en Supabase SQL Editor después de `npx prisma db push`.
-- Prisma usa el servidor y además filtra por userId en las server actions.
-- Estas políticas protegen también los accesos directos con Supabase JS.

ALTER TABLE "Paciente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sesion" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pacientes_select_own" ON "Paciente";
DROP POLICY IF EXISTS "pacientes_insert_own" ON "Paciente";
DROP POLICY IF EXISTS "pacientes_update_own" ON "Paciente";
DROP POLICY IF EXISTS "pacientes_delete_own" ON "Paciente";
DROP POLICY IF EXISTS "sesiones_select_own" ON "Sesion";
DROP POLICY IF EXISTS "sesiones_insert_own" ON "Sesion";
DROP POLICY IF EXISTS "sesiones_update_own" ON "Sesion";
DROP POLICY IF EXISTS "sesiones_delete_own" ON "Sesion";

CREATE POLICY "pacientes_select_own" ON "Paciente"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "pacientes_insert_own" ON "Paciente"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "pacientes_update_own" ON "Paciente"
  FOR UPDATE USING ("userId" = auth.uid()::text)
  WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "pacientes_delete_own" ON "Paciente"
  FOR DELETE USING ("userId" = auth.uid()::text);

CREATE POLICY "sesiones_select_own" ON "Sesion"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Paciente"
      WHERE "Paciente"."id" = "Sesion"."pacienteId"
        AND "Paciente"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "sesiones_insert_own" ON "Sesion"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Paciente"
      WHERE "Paciente"."id" = "Sesion"."pacienteId"
        AND "Paciente"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "sesiones_update_own" ON "Sesion"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Paciente"
      WHERE "Paciente"."id" = "Sesion"."pacienteId"
        AND "Paciente"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "sesiones_delete_own" ON "Sesion"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Paciente"
      WHERE "Paciente"."id" = "Sesion"."pacienteId"
        AND "Paciente"."userId" = auth.uid()::text
    )
  );
