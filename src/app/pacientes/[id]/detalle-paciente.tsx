'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, Calendar, ChevronDown, ChevronUp, Clock, Phone, Edit, Trash2, AlertCircle } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  function formatearFechaCorta(fecha: Date | string): string {
    const d = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    return format(d, 'dd/MM/yyyy', { locale: es });
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
      setServerError(result.error || 'No se pudo guardar la sesión');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8" id="main-content">
        <Link
          href="/pacientes"
          className="btn-ghost btn-sm sm:btn-lg flex items-center gap-2"
          aria-label="Volver a la lista de pacientes"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Volver a pacientes</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary truncate">
              {paciente.nombreCompleto}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {calcularEdad(fechaNacimiento)} años
              </span>
              {paciente.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {paciente.telefono}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Paciente desde {format(typeof paciente.createdAt === 'string' ? parseISO(paciente.createdAt) : paciente.createdAt, 'MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/pacientes/${paciente.id}/editar`}
              className="btn-secondary btn-sm"
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Editar</span>
            </Link>
            <button
              type="button"
              className="btn-destructive btn-sm"
              onClick={() => setShowDeleteConfirm(paciente.id)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Archivar</span>
            </button>
          </div>
        </div>
      </header>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
          <div className="card p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-bg flex items-center justify-center" aria-hidden="true">
                <AlertCircle className="h-5 w-5 text-error-text" />
              </div>
              <h2 id="delete-confirm-title" className="text-lg font-semibold text-text-primary">Archivar paciente</h2>
            </div>
            <p className="text-text-secondary mb-6">
              ¿Estás seguro de que querés archivar a <strong>{paciente.nombreCompleto}</strong>?
              Esta acción no elimina el historial, pero oculta al paciente de la lista principal.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                className="btn-destructive flex-1"
                onClick={() => {
                  setShowDeleteConfirm(null);
                }}
              >
                Archivar
              </button>
            </div>
          </div>
        </div>
      )}

      {serverError && (
        <div
          className="mb-6 p-4 rounded-xl bg-error-bg text-error-text border border-error-border flex items-start gap-3"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 space-y-5" aria-label="Información del paciente">
          <section className="card p-5" aria-labelledby="info-heading">
            <h2 id="info-heading" className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Información
            </h2>
            <dl className="space-y-4">
              {paciente.telefono && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <Phone className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Teléfono</dt>
                    <dd className="text-text-primary">{paciente.telefono}</dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                  <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-muted">Fecha de nacimiento</dt>
                  <dd className="text-text-primary">{formatearFechaCorta(paciente.fechaNacimiento)} ({calcularEdad(fechaNacimiento)} años)</dd>
                </div>
              </div>
              {paciente.motivoConsulta && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Motivo de consulta</dt>
                    <dd className="text-text-primary">{paciente.motivoConsulta}</dd>
                  </div>
                </div>
              )}
            </dl>
          </section>

          {paciente.sesiones.length > 0 && paciente.sesiones[0].proximaCita && (
            <section className="card p-5 border-border-success-border/50 bg-success-bg/30" aria-labelledby="next-appointment-heading">
              <h2 id="next-appointment-heading" className="text-sm font-semibold text-success-text uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Próxima cita
              </h2>
              <div className="text-success-text">
                <p className="font-medium">{formatearFechaHora(paciente.sesiones[0].proximaCita!)}</p>
                <p className="text-sm opacity-80 mt-1">
                  {format(new Date(paciente.sesiones[0].proximaCita!), "EEEE", { locale: es })}
                </p>
              </div>
            </section>
          )}

          <section className="card p-5" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Acciones rápidas
            </h2>
            <div className="space-y-2">
              <button className="btn-secondary w-full justify-start gap-3">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Nueva sesión
              </button>
              <Link
                href={`/pacientes/${paciente.id}/editar`}
                className="btn-ghost w-full justify-start gap-3"
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
                Editar paciente
              </Link>
            </div>
          </section>
        </aside>

        <main className="space-y-6" aria-label="Historial clínico">
          <section className="card p-5 sm:p-6 sticky top-24 z-10 glass-strong" aria-labelledby="nueva-sesion-heading">
            <h2 id="nueva-sesion-heading" className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Nueva Sesión
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="fechaSesion" className="label">
                    Fecha de la sesión <span className="text-error-text" aria-hidden="true">*</span>
                  </label>
                  <input
                    {...register('fechaSesion')}
                    id="fechaSesion"
                    type="date"
                    max={today}
                    className={`input ${hasError('fechaSesion') ? 'input-error' : ''}`}
                    aria-invalid={hasError('fechaSesion')}
                    aria-describedby={hasError('fechaSesion') ? 'fechaSesion-error' : undefined}
                    disabled={isSubmitting}
                  />
                  {hasError('fechaSesion') && (
                    <p id="fechaSesion-error" className="field-error" role="alert">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {getErrorMessage('fechaSesion')}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="proximaCita" className="label">
                    Próxima cita (opcional)
                  </label>
                  <input
                    {...register('proximaCita')}
                    id="proximaCita"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className={`input ${hasError('proximaCita') ? 'input-error' : ''}`}
                    aria-invalid={hasError('proximaCita')}
                    aria-describedby={hasError('proximaCita') ? 'proximaCita-error' : undefined}
                    disabled={isSubmitting}
                  />
                  {hasError('proximaCita') && (
                    <p id="proximaCita-error" className="field-error" role="alert">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {getErrorMessage('proximaCita')}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notasClinicas" className="label">
                  Notas clínicas <span className="text-error-text" aria-hidden="true">*</span>
                </label>
                <textarea
                  {...register('notasClinicas')}
                  id="notasClinicas"
                  rows={5}
                  placeholder="Registre la evolución, observaciones, técnicas utilizadas, plan de tratamiento..."
                  className={`input resize-y font-mono text-sm ${hasError('notasClinicas') ? 'input-error' : ''}`}
                  aria-invalid={hasError('notasClinicas')}
                  aria-describedby={hasError('notasClinicas') ? 'notasClinicas-error' : undefined}
                  disabled={isSubmitting}
                />
                {hasError('notasClinicas') && (
                  <p id="notasClinicas-error" className="field-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {getErrorMessage('notasClinicas')}
                  </p>
                )}
                <p className="field-hint">Mínimo 10 caracteres. Se guardan de forma segura.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full sm:w-auto"
              >
                {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                <Save className="h-5 w-5" aria-hidden="true" />
                {isSubmitting ? 'Guardando sesión...' : 'Guardar Sesión'}
              </button>
            </form>
          </section>

          <section aria-labelledby="historial-heading">
            <div className="flex items-center justify-between mb-4">
              <h2 id="historial-heading" className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                Historial de Sesiones ({paciente.sesiones.length})
              </h2>
            </div>

            {paciente.sesiones.length === 0 ? (
              <div className="card p-10 sm:p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-tertiary mb-4" aria-hidden="true">
                  <FileText className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-text-primary font-medium mb-1">No hay sesiones registradas</h3>
                <p className="text-text-secondary mb-6">La primera sesión aparecerá aquí después de guardarla</p>
              </div>
            ) : (
              <div className="space-y-3" role="list" aria-label="Lista de sesiones">
                {paciente.sesiones.map((sesion) => {
                  const fechaSesion = typeof sesion.fechaSesion === 'string' ? parseISO(sesion.fechaSesion) : sesion.fechaSesion;
                  const isExpanded = expandedSesion === sesion.id;

                  return (
                    <article
                      key={sesion.id}
                      className="card overflow-hidden"
                      role="listitem"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(sesion.id)}
                        className="accordion-trigger w-full p-5"
                        aria-expanded={isExpanded}
                        aria-controls={`sesion-content-${sesion.id}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-text-primary truncate">
                              Sesión del {formatearFecha(fechaSesion)}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              Registrada: {formatearFechaHora(sesion.createdAt)}
                            </p>
                          </div>
                          {sesion.proximaCita && (
                            <div className="flex-shrink-0 flex items-center gap-1.5 text-sm text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 rounded-lg">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                              <span>Próxima: {formatearFechaCorta(sesion.proximaCita)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-text-muted" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-text-muted" aria-hidden="true" />
                          )}
                        </div>
                      </button>

                      <div
                        id={`sesion-content-${sesion.id}`}
                        role="region"
                        aria-label={`Detalles de la sesión del ${formatearFecha(fechaSesion)}`}
                        className="accordion-content border-t border-border-subtle bg-bg-primary/50"
                      >
                        <div className="p-5">
                          <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap font-mono text-sm leading-relaxed">
                            {sesion.notasClinicas}
                          </div>
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-subtle">
                            <span className="text-xs text-text-muted flex-1">
                              Creada: {formatearFechaHora(sesion.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button className="btn-ghost btn-sm text-text-muted hover:text-error-text">
                                <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              <button className="btn-ghost btn-sm text-text-muted hover:text-error-text">
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="hidden sm:inline">Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}