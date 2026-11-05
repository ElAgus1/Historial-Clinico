// src/app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { pacienteSchema, sesionSchema, type PacienteFormData, type SesionFormData } from '@/lib/schemas';

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

export async function obtenerPacientes(): Promise<ActionResult<Array<{
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date;
  telefono: string | null;
  motivoConsulta: string | null;
  createdAt: Date;
  _count: { sesiones: number };
}>>> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

  try {
    const pacientes = await prisma.paciente.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombreCompleto: true,
        fechaNacimiento: true,
        telefono: true,
        motivoConsulta: true,
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

export async function obtenerPacientePorId(id: string): Promise<ActionResult<{
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date;
  telefono: string | null;
  motivoConsulta: string | null;
  createdAt: Date;
  sesiones: Array<{
    id: string;
    fechaSesion: Date;
    notasClinicas: string;
    proximaCita: Date | null;
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
        createdAt: true,
        sesiones: {
          orderBy: { fechaSesion: 'desc' },
          select: {
            id: true,
            fechaSesion: true,
            notasClinicas: true,
            proximaCita: true,
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
        proximaCita: validated.data.proximaCita ? new Date(validated.data.proximaCita) : null,
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