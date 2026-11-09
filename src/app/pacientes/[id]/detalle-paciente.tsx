// src/app/pacientes/[id]/detalle-paciente.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, Calendar, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { agregarSesion } from '@/app/actions';
import { sesionSchema, type SesionFormData } from '@/lib/schemas';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Paciente {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date | string;
  telefono: string | null;
  motivoConsulta: string | null;
  createdAt: Date | string;
  sesiones: Array<{
    id: string;
    fechaSesion: Date | string;
    notasClinicas: string;
    proximaCita: Date | string | null;
    createdAt: Date | string;
  }>;
}

interface DetallePacienteProps {
  paciente: Paciente;
}

export function DetallePaciente({ paciente }: DetallePacienteProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSesion, setExpandedSesion] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SesionFormData>({
    resolver: zodResolver(sesionSchema),
    mode: 'onChange',
    defaultValues: {
      pacienteId: paciente.id,
      fechaSesion: new Date().toISOString().split('T')[0],
      notasClinicas: '',
      proximaCita: '',
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const fechaNacimiento = typeof paciente.fechaNacimiento === 'string'
    ? parseISO(paciente.fechaNacimiento)
    : paciente.fechaNacimiento;

  function calcularEdad(fechaNac: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

  function formatearFecha(fecha: Date | string): string {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  }

  function formatearFechaHora(fecha: Date | string): string {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    return format(d, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
  }

  async function onSubmit(data: SesionFormData) {
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    const result = await agregarSesion(data);

    if (result.success) {
      reset({ pacienteId: paciente.id, fechaSesion: today, notasClinicas: '', proximaCita: '' });
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
    return errors[fieldName as keyof SesionFormData]?.message;
  }

  function hasError(fieldName: string): boolean {
    return !!getErrorMessage(fieldName);
  }

  function toggleExpand(sesionId: string) {
    setExpandedSesion(expandedSesion === sesionId ? null : sesionId);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-lg px-2 py-1"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Volver a pacientes
      </Link>

      <header className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{paciente.nombreCompleto}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {calcularEdad(fechaNacimiento)} años
              </span>
              {paciente.telefono && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  {paciente.telefono}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Paciente desde {format(typeof paciente.createdAt === 'string' ? parseISO(paciente.createdAt) : paciente.createdAt, 'MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>
          {paciente.motivoConsulta && (
            <div className="bg-slate-50 rounded-xl p-4 max-w-xs">
              <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Motivo:</span> {paciente.motivoConsulta}</p>
            </div>
          )}
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6" aria-labelledby="nueva-sesion-heading">
        <h2 id="nueva-sesion-heading" className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-600" aria-hidden="true" />
          Nueva Sesión
        </h2>

        {serverError && (
          <div
            className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700"
            role="alert"
          >
            <p>{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fechaSesion"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Fecha de la sesión <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                {...register('fechaSesion')}
                id="fechaSesion"
                type="date"
                max={today}
                className={`w-full px-4 py-3 rounded-xl border ${
                  hasError('fechaSesion')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
                } bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0`}
                aria-invalid={hasError('fechaSesion')}
                aria-describedby={hasError('fechaSesion') ? 'fechaSesion-error' : undefined}
                disabled={isSubmitting}
              />
              {hasError('fechaSesion') && (
                <p id="fechaSesion-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {getErrorMessage('fechaSesion')}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="proximaCita"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Próxima cita (opcional)
              </label>
              <input
                {...register('proximaCita')}
                id="proximaCita"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  hasError('proximaCita')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
                } bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0`}
                aria-invalid={hasError('proximaCita')}
                aria-describedby={hasError('proximaCita') ? 'proximaCita-error' : undefined}
                disabled={isSubmitting}
              />
              {hasError('proximaCita') && (
                <p id="proximaCita-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {getErrorMessage('proximaCita')}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="notasClinicas"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Notas clínicas <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              {...register('notasClinicas')}
              id="notasClinicas"
              rows={5}
              placeholder="Registre la evolución, observaciones, técnicas utilizadas, plan de tratamiento..."
              className={`w-full px-4 py-3 rounded-xl border ${
                hasError('notasClinicas')
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500'
              } bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y font-mono text-sm`}
              aria-invalid={hasError('notasClinicas')}
              aria-describedby={hasError('notasClinicas') ? 'notasClinicas-error' : undefined}
              disabled={isSubmitting}
            />
            {hasError('notasClinicas') && (
              <p id="notasClinicas-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {getErrorMessage('notasClinicas')}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            <Save className="h-5 w-5" aria-hidden="true" />
            {isSubmitting ? 'Guardando sesión...' : 'Guardar Sesión'}
          </button>
        </form>
      </section>

      <section aria-labelledby="historial-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="historial-heading" className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal-600" aria-hidden="true" />
            Historial de Sesiones ({paciente.sesiones.length})
          </h2>
        </div>

        {paciente.sesiones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" aria-hidden="true" />
            <h3 className="text-slate-600 font-medium mb-1">No hay sesiones registradas</h3>
            <p className="text-slate-400">La primera sesión aparecerá aquí después de guardarla</p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Lista de sesiones">
            {paciente.sesiones.map((sesion) => {
              const fechaSesion = typeof sesion.fechaSesion === 'string' ? parseISO(sesion.fechaSesion) : sesion.fechaSesion;
              const isExpanded = expandedSesion === sesion.id;

              return (
                <article
                  key={sesion.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                  role="listitem"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(sesion.id)}
                    className="w-full p-5 flex items-start justify-between gap-4 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-2xl"
                    aria-expanded={isExpanded}
                    aria-controls={`sesion-content-${sesion.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-teal-600" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            Sesión del {formatearFecha(fechaSesion)}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Registrada: {formatearFechaHora(sesion.createdAt)}
                          </p>
                        </div>
                      </div>
                      {sesion.proximaCita && (
                        <div className="mt-2 flex items-center gap-1.5 text-sm text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg inline-flex">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                          <span>Próxima cita: {formatearFechaHora(sesion.proximaCita)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                  </button>

                  <div
                    id={`sesion-content-${sesion.id}`}
                    role="region"
                    aria-label={`Detalles de la sesión del ${formatearFecha(fechaSesion)}`}
                    className={`${isExpanded ? 'block' : 'hidden'} border-t border-slate-100 bg-slate-50/50 animate-slide-down`}
                  >
                    <div className="p-5">
                      <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {sesion.notasClinicas}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}