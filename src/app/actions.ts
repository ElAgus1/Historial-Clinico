// src/app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import { anamnesisSchema, citaSchema, pacienteSchema, sesionSchema, type AnamnesisFormData, type CitaFormData, type PacienteFormData, type SesionFormData } from '@/lib/schemas';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
        fechaNacimiento: validated.data.fechaNacimiento ? new Date(validated.data.fechaNacimiento) : null,
        lugarNacimiento: validated.data.lugarNacimiento?.trim() || null,
        lugarResidencia: validated.data.lugarResidencia?.trim() || null,
        profesion: validated.data.profesion?.trim() || null,
        religion: validated.data.religion?.trim() || null,
        telefono: validated.data.telefono?.trim() || null,
        motivoConsulta: validated.data.motivoConsulta?.trim() || null,
        nombrePadre: validated.data.nombrePadre?.trim() || null,
        nombreMadre: validated.data.nombreMadre?.trim() || null,
        estadoCivil: validated.data.estadoCivil?.trim() || null,
        sexo: validated.data.sexo?.trim() || null,
      },
      select: { id: true },
    });

    revalidatePath('/pacientes');
    return { success: true, data: { id: paciente.id } };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2022') {
        return { success: false, error: 'La base de datos no tiene una columna requerida. Recargá la aplicación e intentá nuevamente.' };
      }
      if (err.code === 'P2002') {
        return { success: false, error: 'Ya existe un paciente con esos datos.' };
      }
    }
    return { success: false, error: 'No se pudo crear el paciente. Verificá los datos e intentá nuevamente.' };
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
        fechaNacimiento: validated.data.fechaNacimiento ? new Date(validated.data.fechaNacimiento) : null,
        lugarNacimiento: validated.data.lugarNacimiento?.trim() || null,
        lugarResidencia: validated.data.lugarResidencia?.trim() || null,
        profesion: validated.data.profesion?.trim() || null,
        religion: validated.data.religion?.trim() || null,
        telefono: validated.data.telefono?.trim() || null,
        motivoConsulta: validated.data.motivoConsulta?.trim() || null,
        nombrePadre: validated.data.nombrePadre?.trim() || null,
        nombreMadre: validated.data.nombreMadre?.trim() || null,
        estadoCivil: validated.data.estadoCivil?.trim() || null,
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

export async function actualizarDatosPaciente(pacienteId: string, data: PacienteFormData): Promise<ActionResult<null>> {
    return actualizarPaciente({ ...data, id: pacienteId });
}

  export async function guardarAnamnesis(pacienteId: string, data: AnamnesisFormData): Promise<ActionResult<null>> {
    if (!z.string().uuid().safeParse(pacienteId).success) {
      return { success: false, error: 'ID de paciente inválido.' };
    }

    const validated = anamnesisSchema.safeParse(data);
    if (!validated.success) return { success: false, ...handleZodError(validated.error) };

    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

    try {
      const paciente = await prisma.paciente.findFirst({
        where: { id: pacienteId, userId: user.id },
        select: { id: true },
      });
      if (!paciente) return { success: false, error: 'Paciente no encontrado.' };

      await prisma.anamnesis.upsert({
        where: { pacienteId: paciente.id },
        create: {
          pacienteId: paciente.id,
          antecedentesPropios: validated.data.antecedentesPropios?.trim() || null,
          antecedentesFamiliares: validated.data.antecedentesFamiliares?.trim() || null,
          historiaVital: validated.data.historiaVital,
        },
        update: {
          antecedentesPropios: validated.data.antecedentesPropios?.trim() || null,
          antecedentesFamiliares: validated.data.antecedentesFamiliares?.trim() || null,
          historiaVital: validated.data.historiaVital,
        },
      });
      revalidatePath(`/pacientes/${paciente.id}`);
      revalidatePath('/pacientes');
      return { success: true, data: null };
    } catch {
      console.error('Error al guardar la historia clínica');
      return { success: false, error: 'No se pudo guardar la historia clínica. Intente nuevamente.' };
    }
  }

  export async function subirGenograma(pacienteId: string, formData: FormData): Promise<ActionResult<{ path: string }>> {
    if (!z.string().uuid().safeParse(pacienteId).success) {
      return { success: false, error: 'ID de paciente inválido.' };
    }

    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

    const file = formData.get('file');
    if (!(file instanceof File)) return { success: false, error: 'Seleccione una imagen válida.' };
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return { success: false, error: 'Solo se permiten imágenes JPG, PNG o WebP.' };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'La imagen no puede superar 10 MB.' };
    }

    try {
      const paciente = await prisma.paciente.findFirst({
        where: { id: pacienteId, userId: user.id },
        select: { id: true, anamnesis: { select: { genogramaPath: true } } },
      });
      if (!paciente) return { success: false, error: 'Paciente no encontrado.' };

      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${paciente.id}/genograma.${extension}`;
      const supabase = await createSupabaseServerClient();

      if (paciente.anamnesis?.genogramaPath && paciente.anamnesis.genogramaPath !== path) {
        await supabase.storage.from('genogramas').remove([paciente.anamnesis.genogramaPath]);
      }

      const { error: uploadError } = await supabase.storage.from('genogramas').upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600',
      });
      if (uploadError) return { success: false, error: 'No se pudo subir el genograma.' };

      await prisma.anamnesis.upsert({
        where: { pacienteId: paciente.id },
        create: { pacienteId: paciente.id, genogramaPath: path },
        update: { genogramaPath: path },
      });
      revalidatePath(`/pacientes/${paciente.id}`);
      return { success: true, data: { path } };
    } catch {
      console.error('Error al subir el genograma');
      return { success: false, error: 'No se pudo subir el genograma. Intente nuevamente.' };
    }
  }

  export async function obtenerUrlGenograma(pacienteId: string): Promise<ActionResult<{ url: string | null }>> {
    if (!z.string().uuid().safeParse(pacienteId).success) {
      return { success: false, error: 'ID de paciente inválido.' };
    }
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

    try {
      const anamnesis = await prisma.anamnesis.findFirst({
        where: { pacienteId, paciente: { userId: user.id } },
        select: { genogramaPath: true },
      });
      if (!anamnesis?.genogramaPath) return { success: true, data: { url: null } };

      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.storage
        .from('genogramas')
        .createSignedUrl(anamnesis.genogramaPath, 600);
      if (error || !data?.signedUrl) return { success: false, error: 'No se pudo generar la vista del genograma.' };
      return { success: true, data: { url: data.signedUrl } };
    } catch {
      console.error('Error al obtener el genograma');
      return { success: false, error: 'No se pudo cargar el genograma.' };
    }
  }

  export async function eliminarGenograma(pacienteId: string): Promise<ActionResult<null>> {
    if (!z.string().uuid().safeParse(pacienteId).success) {
      return { success: false, error: 'ID de paciente inválido.' };
    }
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, error: 'Sesión expirada. Inicie sesión nuevamente.' };

    try {
      const anamnesis = await prisma.anamnesis.findFirst({
        where: { pacienteId, paciente: { userId: user.id } },
        select: { genogramaPath: true },
      });
      if (!anamnesis?.genogramaPath) return { success: true, data: null };

      const supabase = await createSupabaseServerClient();
      await supabase.storage.from('genogramas').remove([anamnesis.genogramaPath]);
      await prisma.anamnesis.update({
        where: { pacienteId },
        data: { genogramaPath: null },
      });
      revalidatePath(`/pacientes/${pacienteId}`);
      return { success: true, data: null };
    } catch {
      console.error('Error al eliminar el genograma');
      return { success: false, error: 'No se pudo eliminar el genograma.' };
    }
  }

export async function obtenerPacientes(status: 'active' | 'archived' | 'all' = 'active'): Promise<ActionResult<Array<{
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date | null;
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
        lugarNacimiento: true,
        lugarResidencia: true,
        profesion: true,
        religion: true,
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
  fechaNacimiento: Date | null;
  lugarNacimiento: string | null;
  lugarResidencia: string | null;
  profesion: string | null;
  religion: string | null;
  telefono: string | null;
  motivoConsulta: string | null;
  nombrePadre: string | null;
  nombreMadre: string | null;
  estadoCivil: string | null;
  sexo: string | null;
  createdAt: Date;
  anamnesis: {
    antecedentesPropios: string | null;
    antecedentesFamiliares: string | null;
    genogramaPath: string | null;
    historiaVital: unknown;
  } | null;
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
        lugarNacimiento: true,
        lugarResidencia: true,
        profesion: true,
        religion: true,
        telefono: true,
        motivoConsulta: true,
        nombrePadre: true,
        nombreMadre: true,
        estadoCivil: true,
        sexo: true,
        createdAt: true,
        anamnesis: {
          select: {
            antecedentesPropios: true,
            antecedentesFamiliares: true,
            genogramaPath: true,
            historiaVital: true,
          },
        },
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