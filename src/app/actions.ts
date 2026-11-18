// src/app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { citaSchema, pacienteSchema, sesionSchema, type CitaFormData, type PacienteFormData, type SesionFormData } from '@/lib/schemas';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function handleZodError(error: z.ZodError): { error: string; fieldErrors: Record<string, string[]> } {
  const fieldErrors: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(err.message);
  });
  return {
    error: 'Error de validación',
    fieldErrors,
  };
}

export async function crearPaciente(formData: PacienteFormData): Promise<ActionResult<{ id: string }>> {
  const validated = pacienteSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, ...handleZodError(validated.error) };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const paciente = await prisma.paciente.create({
      data: {
        userId: user.id,
        nombreCompleto: validated.data.nombreCompleto.trim(),
        fechaNacimiento: new Date(validated.data.fechaNacimiento),
        telefono: validated.data.telefono?.trim() || null,
        motivoConsulta: validated.data.motivoConsulta?.trim() || null,
        instagram: validated.data.instagram?.trim() || null,
        nombrePadre: validated.data.nombrePadre?.trim() || null,
        nombreMadre: validated.data.nombreMadre?.trim() || null,
        pareja: validated.data.pareja?.trim() || null,
        sexo: validated.data.sexo?.trim() || null,
      },
      select: { id: true },
    });

    revalidatePath('/pacientes');
    return { success: true, data: { id: paciente.id } };
  } catch (err) {
    console.error('Error al crear paciente:', err);
    return { success: false, error: 'No se pudo crear el paciente. Intente nuevamente.' };
  }
}

export async function actualizarPaciente(formData: PacienteFormData & { id: string }): Promise<ActionResult<null>> {
  const validated = pacienteSchema.extend({ id: z.string().uuid('ID de paciente inválido') }).safeParse(formData);
  if (!validated.success) return { success: false, ...handleZodError(validated.error) };

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const paciente = await prisma.paciente.findFirst({
      where: { id: validated.data.id, userId: user.id },
      select: { id: true },
    });
    if (!paciente) return { success: false, error: 'Paciente no encontrado.' };

    await prisma.paciente.update({
      where: { id: paciente.id },
      data: {
        nombreCompleto: validated.data.nombreCompleto.trim(),
        fechaNacimiento: new Date(validated.data.fechaNacimiento),
        telefono: validated.data.telefono?.trim() || null,
        motivoConsulta: validated.data.motivoConsulta?.trim() || null,
        instagram: validated.data.instagram?.trim() || null,
        nombrePadre: validated.data.nombrePadre?.trim() || null,
        nombreMadre: validated.data.nombreMadre?.trim() || null,
        pareja: validated.data.pareja?.trim() || null,
        sexo: validated.data.sexo?.trim() || null,
      },
    });
    revalidatePath('/pacientes');
    revalidatePath(`/pacientes/${paciente.id}`);
    return { success: true, data: null };
  } catch (err) {
    console.error('Error al actualizar paciente:', err);
    return { success: false, error: 'No se pudo actualizar el paciente. Intente nuevamente.' };
  }
}

export async function obtenerPacientes(status: 'active' | 'archived' | 'all' = 'active'): Promise<ActionResult<Array<{
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date;
  telefono: string | null;
  motivoConsulta: string | null;
  archivado: boolean;
  createdAt: Date;
  _count: { sesiones: number };
}>>> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const pacientes = await prisma.paciente.findMany({
      where: {
        userId: user.id,
        ...(status === 'active' ? { archivado: false } : {}),
        ...(status === 'archived' ? { archivado: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombreCompleto: true,
        fechaNacimiento: true,
        telefono: true,
        motivoConsulta: true,
        archivado: true,
        createdAt: true,
        _count: { select: { sesiones: true } },
      },
    });
    return { success: true, data: pacientes };
  } catch (err) {
    console.error('Error al obtener pacientes:', err);
    return { success: false, error: 'No se pudieron cargar los pacientes.' };
  }

}

export async function archivarPaciente(id: string): Promise<ActionResult<null>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'ID de paciente inválido.' };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const paciente = await prisma.paciente.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!paciente) return { success: false, error: 'Paciente no encontrado.' };

    await prisma.paciente.update({
      where: { id: paciente.id },
      data: { archivado: true },
    });

    revalidatePath('/pacientes');
    revalidatePath(`/pacientes/${id}`);
    return { success: true, data: null };
  } catch (err) {
    console.error('Error al archivar paciente:', err);
    return { success: false, error: 'No se pudo archivar el paciente. Intente nuevamente.' };
  }
}

export async function obtenerPacientePorId(id: string): Promise<ActionResult<{
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date;
  telefono: string | null;
  motivoConsulta: string | null;
  instagram: string | null;
  nombrePadre: string | null;
  nombreMadre: string | null;
  pareja: string | null;
  sexo: string | null;
  createdAt: Date;
  sesiones: Array<{
    id: string;
    fechaSesion: Date;
    notasClinicas: string;
    createdAt: Date;
  }>;
  citas: Array<{
    id: string;
    fechaCita: Date;
    createdAt: Date;
  }>;
}>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'ID de paciente inválido.' };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id, userId: user.id },
      select: {
        id: true,
        nombreCompleto: true,
        fechaNacimiento: true,
        telefono: true,
        motivoConsulta: true,
        instagram: true,
        nombrePadre: true,
        nombreMadre: true,
        pareja: true,
        sexo: true,
        createdAt: true,
        sesiones: {
          orderBy: { fechaSesion: 'desc' },
          select: {
            id: true,
            fechaSesion: true,
            notasClinicas: true,
            createdAt: true,
          },
        },
        citas: {
          orderBy: { fechaCita: 'asc' },
          select: {
            id: true,
            fechaCita: true,
            createdAt: true,
          },
        },
      },
    });

    if (!paciente) {
      return { success: false, error: 'Paciente no encontrado.' };
    }

    return { success: true, data: paciente };
  } catch (err) {
    console.error('Error al obtener paciente:', err);
    return { success: false, error: 'No se pudo cargar el paciente.' };
  }
}

export async function agregarSesion(formData: SesionFormData): Promise<ActionResult<{ id: string }>> {
  const validated = sesionSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, ...handleZodError(validated.error) };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: validated.data.pacienteId, userId: user.id },
      select: { id: true },
    });

    if (!paciente) {
      return { success: false, error: 'Paciente no encontrado.' };
    }

    const sesion = await prisma.sesion.create({
      data: {
        pacienteId: validated.data.pacienteId,
        fechaSesion: new Date(validated.data.fechaSesion),
        notasClinicas: validated.data.notasClinicas.trim(),
      },
      select: { id: true },
    });

    revalidatePath(`/pacientes/${validated.data.pacienteId}`);
    revalidatePath('/pacientes');
    return { success: true, data: { id: sesion.id } };
  } catch (err) {
    console.error('Error al agregar sesión:', err);
    return { success: false, error: 'No se pudo guardar la sesión. Intente nuevamente.' };
  }
}

export async function actualizarSesion(formData: SesionFormData & { id: string }): Promise<ActionResult<null>> {
  const validated = sesionSchema.extend({ id: z.string().uuid('ID de sesión inválido') }).safeParse(formData);
  if (!validated.success) return { success: false, ...handleZodError(validated.error) };

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const sesion = await prisma.sesion.findFirst({
      where: { id: validated.data.id, paciente: { userId: user.id } },
      select: { id: true, pacienteId: true },
    });
    if (!sesion) return { success: false, error: 'Sesión no encontrada.' };

    await prisma.sesion.update({
      where: { id: sesion.id },
      data: {
        fechaSesion: new Date(validated.data.fechaSesion),
        notasClinicas: validated.data.notasClinicas.trim(),
      },
    });

    revalidatePath(`/pacientes/${sesion.pacienteId}`);
    revalidatePath('/pacientes');
    return { success: true, data: null };
  } catch (err) {
    console.error('Error al actualizar sesión:', err);
    return { success: false, error: 'No se pudo actualizar la sesión. Intente nuevamente.' };
  }
}

export async function agregarCita(formData: CitaFormData): Promise<ActionResult<{ id: string }>> {
  const validated = citaSchema.safeParse(formData);
  if (!validated.success) return { success: false, ...handleZodError(validated.error) };

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: validated.data.pacienteId, userId: user.id },
      select: { id: true },
    });
    if (!paciente) return { success: false, error: 'Paciente no encontrado.' };

    const cita = await prisma.cita.create({
      data: {
        pacienteId: paciente.id,
        fechaCita: new Date(validated.data.fechaCita),
      },
      select: { id: true },
    });
    revalidatePath(`/pacientes/${paciente.id}`);
    return { success: true, data: { id: cita.id } };
  } catch (err) {
    console.error('Error al agregar cita:', err);
    return { success: false, error: 'No se pudo agregar la cita. Intente nuevamente.' };
  }
}

export async function actualizarCita(formData: CitaFormData & { id: string }): Promise<ActionResult<null>> {
  const validated = citaSchema.extend({ id: z.string().uuid('ID de cita inválido') }).safeParse(formData);
  if (!validated.success) return { success: false, ...handleZodError(validated.error) };

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const cita = await prisma.cita.findFirst({
      where: { id: validated.data.id, paciente: { userId: user.id } },
      select: { id: true, pacienteId: true },
    });
    if (!cita) return { success: false, error: 'Cita no encontrada.' };

    await prisma.cita.update({
      where: { id: cita.id },
      data: { fechaCita: new Date(validated.data.fechaCita) },
    });
    revalidatePath(`/pacientes/${cita.pacienteId}`);
    return { success: true, data: null };
  } catch (err) {
    console.error('Error al actualizar cita:', err);
    return { success: false, error: 'No se pudo actualizar la cita. Intente nuevamente.' };
  }
}

export async function eliminarCita(id: string): Promise<ActionResult<null>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'ID de cita inválido.' };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const cita = await prisma.cita.findFirst({
      where: { id, paciente: { userId: user.id } },
      select: { id: true, pacienteId: true },
    });
    if (!cita) return { success: false, error: 'Cita no encontrada.' };

    await prisma.cita.delete({ where: { id: cita.id } });
    revalidatePath(`/pacientes/${cita.pacienteId}`);
    return { success: true, data: null };
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    return { success: false, error: 'No se pudo eliminar la cita. Intente nuevamente.' };
  }
}

export async function eliminarSesion(id: string): Promise<ActionResult<null>> {
  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: 'ID de sesión inválido.' };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const sesion = await prisma.sesion.findFirst({
      where: { id, paciente: { userId: user.id } },
      select: { id: true, pacienteId: true },
    });
    if (!sesion) return { success: false, error: 'Sesión no encontrada.' };

    await prisma.sesion.delete({ where: { id: sesion.id } });
    revalidatePath(`/pacientes/${sesion.pacienteId}`);
    revalidatePath('/pacientes');
    return { success: true, data: null };
  } catch (err) {
    console.error('Error al eliminar sesión:', err);
    return { success: false, error: 'No se pudo eliminar la sesión. Intente nuevamente.' };
  }
}