// src/lib/schemas.ts
import { z } from 'zod';

export const pacienteSchema = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  fechaNacimiento: z
    .string()
    .min(1, 'La fecha de nacimiento es obligatoria')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida')
    .refine((date) => new Date(date) <= new Date(), 'La fecha no puede ser futura')
    .refine((date) => {
      const edad = new Date().getFullYear() - new Date(date).getFullYear();
      return edad >= 0 && edad <= 120;
    }, 'Edad fuera de rango válido (0-120 años)'),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[\d\s\-\+\(\)]*$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  motivoConsulta: z
    .string()
    .max(1000, 'El motivo de consulta no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  instagram: z
    .string()
    .max(100, 'El Instagram no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  nombrePadre: z
    .string()
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .optional()
    .or(z.literal('')),
  nombreMadre: z
    .string()
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .optional()
    .or(z.literal('')),
  pareja: z
    .string()
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .optional()
    .or(z.literal('')),
  sexo: z
    .string()
    .max(50, 'El sexo no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
});

export const sesionSchema = z.object({
  pacienteId: z.string().uuid('ID de paciente inválido'),
  fechaSesion: z
    .string()
    .min(1, 'La fecha de la sesión es obligatoria')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida')
    .refine((date) => new Date(date) <= new Date(), 'La fecha no puede ser futura'),
  notasClinicas: z
    .string()
    .min(10, 'Las notas clínicas deben tener al menos 10 caracteres')
    .max(5000, 'Las notas clínicas no pueden exceder 5000 caracteres'),
});

export const citaSchema = z.object({
  pacienteId: z.string().uuid('ID de paciente inválido'),
  fechaCita: z
    .string()
    .min(1, 'La fecha de la cita es obligatoria')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida')
    .refine((date) => new Date(date) > new Date(), 'La cita debe ser futura'),
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;
export type SesionFormData = z.infer<typeof sesionSchema>;
export type CitaFormData = z.infer<typeof citaSchema>;