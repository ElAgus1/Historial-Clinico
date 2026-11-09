'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, X, AlertCircle, User, Calendar, Phone, FileText } from 'lucide-react';
import Link from 'next/link';
import { crearPaciente } from '@/app/actions';
import { pacienteSchema, type PacienteFormData } from '@/lib/schemas';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  function validateField(name: string, value: string): string | null {
    if (name === 'nombreCompleto') {
      if (!value.trim()) return 'El nombre completo es obligatorio';
      if (value.trim().length < 2) return 'Mínimo 2 caracteres';
      if (value.trim().length > 100) return 'Máximo 100 caracteres';
    }
    if (name === 'fechaNacimiento') {
      if (!value) return 'La fecha de nacimiento es obligatoria';
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha > hoy) return 'La fecha no puede ser futura';
      const edad = hoy.getFullYear() - fecha.getFullYear();
      if (edad > 120) return 'Edad no válida';
    }
    if (name === 'telefono') {
      if (value && value.length > 30) return 'Máximo 30 caracteres';
    }
    if (name === 'motivoConsulta') {
      if (value && value.length > 500) return 'Máximo 500 caracteres';
    }
    return null;
  }

  async function onSubmit(data: PacienteFormData) {
    setIsSubmitting(true);
    setServerError(null);

    const nombreError = validateField('nombreCompleto', data.nombreCompleto);
    const fechaError = validateField('fechaNacimiento', data.fechaNacimiento);
    const telefonoError = validateField('telefono', data.telefono ?? '');
    const motivoError = validateField('motivoConsulta', data.motivoConsulta ?? '');

    if (nombreError || fechaError || telefonoError || motivoError) {
      setFieldErrors({
        nombreCompleto: nombreError || '',
        fechaNacimiento: fechaError || '',
        telefono: telefonoError || '',
        motivoConsulta: motivoError || '',
      });
      setIsSubmitting(false);
      return;
    }

    const result = await crearPaciente(data);

    if (result.success) {
      router.push(`/pacientes/${result.data.id}`);
      router.refresh();
    } else {
      setServerError(result.error || 'No se pudo crear el paciente');
      if (result.fieldErrors) {
        const newErrors: Record<string, string> = {};
        Object.entries(result.fieldErrors).forEach(([key, messages]) => {
          newErrors[key] = messages[0];
        });
        setFieldErrors(newErrors);
      }
    }
    setIsSubmitting(false);
  }

  function getErrorMessage(fieldName: string): string | undefined {
    const serverErrorMsg = fieldErrors[fieldName];
    if (serverErrorMsg) return serverErrorMsg;
    return errors[fieldName as keyof PacienteFormData]?.message;
  }

  function hasError(fieldName: string): boolean {
    return !!getErrorMessage(fieldName);
  }

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="border-b border-border-subtle bg-bg-secondary px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/pacientes"
            className="btn-ghost btn-icon p-1.5"
            aria-label="Volver a pacientes"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Nuevo Paciente</h1>
            <p className="text-sm text-text-secondary">Complete la información para crear el historial clínico</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:px-6 lg:px-8" id="main-content">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-6 sm:p-8 space-y-6">
            {serverError && (
              <div
                className="p-4 rounded-xl bg-error-bg text-error-text border border-error-border flex items-start gap-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p>{serverError}</p>
              </div>
            )}

            <div className="form-section">
              <div className="form-group">
                <label htmlFor="nombreCompleto" className="label flex items-center gap-2">
                  <User className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  Nombre completo <span className="text-error-text" aria-hidden="true">*</span>
                </label>
                <input
                  {...register('nombreCompleto')}
                  id="nombreCompleto"
                  type="text"
                  autoComplete="name"
                  placeholder="Juan Pérez García"
                  className={`input ${hasError('nombreCompleto') ? 'input-error' : ''}`}
                  aria-invalid={hasError('nombreCompleto')}
                  aria-describedby={hasError('nombreCompleto') ? 'nombreCompleto-error' : undefined}
                  disabled={isSubmitting}
                />
                {hasError('nombreCompleto') && (
                  <p id="nombreCompleto-error" className="field-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {getErrorMessage('nombreCompleto')}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fechaNacimiento" className="label flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  Fecha de nacimiento <span className="text-error-text" aria-hidden="true">*</span>
                </label>
                <input
                  {...register('fechaNacimiento')}
                  id="fechaNacimiento"
                  type="date"
                  max={today}
                  className={`input ${hasError('fechaNacimiento') ? 'input-error' : ''}`}
                  aria-invalid={hasError('fechaNacimiento')}
                  aria-describedby={hasError('fechaNacimiento') ? 'fechaNacimiento-error' : undefined}
                  disabled={isSubmitting}
                />
                {hasError('fechaNacimiento') && (
                  <p id="fechaNacimiento-error" className="field-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {getErrorMessage('fechaNacimiento')}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefono" className="label flex items-center gap-2">
                  <Phone className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  id="telefono"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+54 9 11 1234-5678"
                  className={`input ${hasError('telefono') ? 'input-error' : ''}`}
                  aria-invalid={hasError('telefono')}
                  aria-describedby={hasError('telefono') ? 'telefono-error' : undefined}
                  disabled={isSubmitting}
                />
                {hasError('telefono') && (
                  <p id="telefono-error" className="field-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {getErrorMessage('telefono')}
                  </p>
                )}
                <p className="field-hint">Opcional. Formato libre.</p>
              </div>

              <div className="form-group">
                <label htmlFor="motivoConsulta" className="label flex items-center gap-2">
                  <FileText className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  Motivo de consulta
                </label>
                <textarea
                  {...register('motivoConsulta')}
                  id="motivoConsulta"
                  rows={4}
                  placeholder="Breve descripción del motivo por el que consulta..."
                  className={`input resize-y ${hasError('motivoConsulta') ? 'input-error' : ''}`}
                  aria-invalid={hasError('motivoConsulta')}
                  aria-describedby={hasError('motivoConsulta') ? 'motivoConsulta-error' : undefined}
                  disabled={isSubmitting}
                />
                {hasError('motivoConsulta') && (
                  <p id="motivoConsulta-error" className="field-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {getErrorMessage('motivoConsulta')}
                  </p>
                )}
                <p className="field-hint">Opcional. Máximo 500 caracteres.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-subtle">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary btn-lg flex-1 sm:flex-none"
              >
                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                <Save className="h-5 w-5" aria-hidden="true" />
                {isSubmitting ? 'Guardando paciente...' : 'Guardar Paciente'}
              </button>
              <Link
                href="/pacientes"
                className="btn-secondary btn-lg flex-1 sm:flex-none"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Cancelar</span>
              </Link>
            </div>
          </form>
        </div>
      </div>

      <footer className="border-t border-border-subtle bg-bg-secondary px-4 py-4">
        <p className="max-w-2xl mx-auto text-center text-sm text-text-muted">
          Los datos se almacenan de forma segura y cumplen con la normativa de protección de datos médicos.
        </p>
      </footer>
    </main>
  );
}