// src/app/pacientes/nuevo/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { crearPaciente } from '@/app/actions';
import { pacienteSchema, type PacienteFormData } from '@/lib/schemas';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    mode: 'onChange',
    defaultValues: {
      nombreCompleto: '',
      fechaNacimiento: '',
      telefono: '',
      motivoConsulta: '',
    },
  });

  const today = new Date().toISOString().split('T')[0];

  async function onSubmit(data: PacienteFormData) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const result = await crearPaciente(data);

    if (result.success) {
      router.push(`/pacientes/${result.data.id}`);
      router.refresh();
    } else {
      setServerError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
    setIsSubmitting(false);
  }

  function getErrorMessage(fieldName: string): string | undefined {
    const serverFieldErrors = fieldErrors[fieldName];
    if (serverFieldErrors?.length) return serverFieldErrors[0];
    return errors[fieldName as keyof PacienteFormData]?.message;
  }

  function hasError(fieldName: string): boolean {
    return !!getErrorMessage(fieldName);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg px-2 py-1"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Volver
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Paciente</h1>
          <p className="text-slate-500 mt-1">Complete la información para crear el historial clínico</p>
        </header>

        {serverError && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700"
            role="alert"
          >
            <div className="flex-shrink-0 mt-0.5">
              <X className="h-5 w-5" aria-hidden="true" />
            </div>
            <p>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="nombreCompleto"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Nombre completo <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              {...register('nombreCompleto')}
              id="nombreCompleto"
              type="text"
              autoComplete="name"
              placeholder="Juan Pérez García"
              className={`w-full px-4 py-3 rounded-xl border ${
                hasError('nombreCompleto')
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
              } bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0`}
              aria-invalid={hasError('nombreCompleto')}
              aria-describedby={hasError('nombreCompleto') ? 'nombreCompleto-error' : undefined}
              disabled={isSubmitting}
            />
            {hasError('nombreCompleto') && (
              <p id="nombreCompleto-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {getErrorMessage('nombreCompleto')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fechaNacimiento"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Fecha de nacimiento <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              {...register('fechaNacimiento')}
              id="fechaNacimiento"
              type="date"
              max={today}
              className={`w-full px-4 py-3 rounded-xl border ${
                hasError('fechaNacimiento')
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
              } bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0`}
              aria-invalid={hasError('fechaNacimiento')}
              aria-describedby={hasError('fechaNacimiento') ? 'fechaNacimiento-error' : undefined}
              disabled={isSubmitting}
            />
            {hasError('fechaNacimiento') && (
              <p id="fechaNacimiento-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {getErrorMessage('fechaNacimiento')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Teléfono
            </label>
            <input
              {...register('telefono')}
              id="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="+54 9 11 1234-5678"
              className={`w-full px-4 py-3 rounded-xl border ${
                hasError('telefono')
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
              } bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0`}
              aria-invalid={hasError('telefono')}
              aria-describedby={hasError('telefono') ? 'telefono-error' : undefined}
              disabled={isSubmitting}
            />
            {hasError('telefono') && (
              <p id="telefono-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {getErrorMessage('telefono')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="motivoConsulta"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Motivo de consulta
            </label>
            <textarea
              {...register('motivoConsulta')}
              id="motivoConsulta"
              rows={4}
              placeholder="Breve descripción del motivo por el que consulta..."
              className={`w-full px-4 py-3 rounded-xl border ${
                hasError('motivoConsulta')
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
              } bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y`}
              aria-invalid={hasError('motivoConsulta')}
              aria-describedby={hasError('motivoConsulta') ? 'motivoConsulta-error' : undefined}
              disabled={isSubmitting}
            />
            {hasError('motivoConsulta') && (
              <p id="motivoConsulta-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {getErrorMessage('motivoConsulta')}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
              <Save className="h-5 w-5" aria-hidden="true" />
              {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
            </button>
            <Link
              href="/pacientes"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}