'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, Calendar, ChevronDown, ChevronUp, Clock, Phone, Edit, Trash2, AlertCircle, Plus, X, Heart, User, MapPin, Briefcase, Church } from 'lucide-react';
import Link from 'next/link';
import { actualizarPaciente, agregarCita, actualizarCita, agregarSesion, actualizarSesion, archivarPaciente, eliminarCita, eliminarSesion } from '@/app/actions';
import { citaSchema, pacienteSchema, sesionSchema, type CitaFormData, type PacienteFormData, type SesionFormData } from '@/lib/schemas';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RichTextEditor } from '@/components/RichTextEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HistoriaClinicaTab } from '@/components/HistoriaClinicaTab';

interface Paciente {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: Date | string | null;
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
  createdAt: Date | string;
  sesiones: Array<{
    id: string;
    fechaSesion: Date | string;
    notasClinicas: string;
    createdAt: Date | string;
  }>;
  citas: Array<{
    id: string;
    fechaCita: Date | string;
    createdAt: Date | string;
  }>;
  anamnesis: {
    antecedentesPropios: string | null;
    antecedentesFamiliares: string | null;
    genogramaPath: string | null;
    historiaVital: unknown;
  } | null;
}

interface DetallePacienteProps {
  paciente: Paciente;
}

export function DetallePaciente({ paciente }: DetallePacienteProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSesion, setExpandedSesion] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingSesion, setEditingSesion] = useState<Paciente['sesiones'][number] | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isSessionSaving, setIsSessionSaving] = useState(false);
  const [showCitaModal, setShowCitaModal] = useState(false);
  const [editingCita, setEditingCita] = useState<Paciente['citas'][number] | null>(null);
  const [citaError, setCitaError] = useState<string | null>(null);
  const [isCitaSaving, setIsCitaSaving] = useState(false);
  const [deleteCitaConfirm, setDeleteCitaConfirm] = useState<string | null>(null);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isPatientSaving, setIsPatientSaving] = useState(false);
  const [patientEditError, setPatientEditError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'evoluciones' | 'historia'>('evoluciones');

  const patientEditForm = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    mode: 'onChange',
  });

  const editForm = useForm<SesionFormData>({
    resolver: zodResolver(sesionSchema),
    mode: 'onChange',
  });

  const citaForm = useForm<CitaFormData>({
    resolver: zodResolver(citaSchema),
    mode: 'onChange',
    defaultValues: {
      pacienteId: paciente.id,
      fechaCita: '',
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<SesionFormData>({
    resolver: zodResolver(sesionSchema),
    mode: 'onChange',
    defaultValues: {
      pacienteId: paciente.id,
      fechaSesion: new Date().toISOString().split('T')[0],
      notasClinicas: '',
    },
  });

  const notasClinicas = useWatch({ control, name: 'notasClinicas' }) ?? '';
  const today = new Date().toISOString().split('T')[0];
  const fechaNacimiento = paciente.fechaNacimiento
    ? (typeof paciente.fechaNacimiento === 'string' ? parseISO(paciente.fechaNacimiento) : paciente.fechaNacimiento)
    : null;

  function calcularEdad(fechaNac: Date | null): number | null {
    if (!fechaNac) return null;
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

  function redirectIfSessionExpired(error: string): boolean {
    if (error === 'Sesión expirada. Inicie sesión nuevamente.') {
      router.replace('/login?expired=1');
      router.refresh();
      return true;
    }
    return false;
  }

  async function onSubmit(data: SesionFormData) {
    setIsSubmitting(true);
    setServerError(null);

    const result = await agregarSesion(data);

    if (result.success) {
      reset({ pacienteId: paciente.id, fechaSesion: today, notasClinicas: '' });
      router.refresh();
    } else {
      if (redirectIfSessionExpired(result.error)) return;
      setServerError(result.error || 'No se pudo guardar la sesión');
    }
    setIsSubmitting(false);
  }

  function startEditingPatient() {
    setIsEditingPatient(true);
    setPatientEditError(null);
    patientEditForm.reset({
      nombreCompleto: paciente.nombreCompleto,
      fechaNacimiento: paciente.fechaNacimiento
        ? (typeof paciente.fechaNacimiento === 'string' ? parseISO(paciente.fechaNacimiento) : paciente.fechaNacimiento).toISOString().split('T')[0]
        : '',
      telefono: paciente.telefono ?? '',
      motivoConsulta: paciente.motivoConsulta ?? '',
      nombrePadre: paciente.nombrePadre ?? '',
      nombreMadre: paciente.nombreMadre ?? '',
      estadoCivil: paciente.estadoCivil ?? '',
      sexo: paciente.sexo ?? '',
      lugarNacimiento: paciente.lugarNacimiento ?? '',
      lugarResidencia: paciente.lugarResidencia ?? '',
      profesion: paciente.profesion ?? '',
      religion: paciente.religion ?? '',
    });
  }

  async function handlePatientEditSubmit(data: PacienteFormData) {
    setIsPatientSaving(true);
    setPatientEditError(null);
    const result = await actualizarPaciente({ ...data, id: paciente.id });
    if (result.success) {
      setIsEditingPatient(false);
      router.refresh();
    } else {
      if (redirectIfSessionExpired(result.error)) return;
      setPatientEditError(result.error);
    }
    setIsPatientSaving(false);
  }

  function scrollToNewSession() {
    document.getElementById('nueva-sesion-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('fechaSesion')?.focus(), 300);
  }

  function openNewCita() {
    setEditingCita(null);
    setCitaError(null);
    citaForm.reset({ pacienteId: paciente.id, fechaCita: '' });
    setShowCitaModal(true);
  }

  function openEditCita(cita: Paciente['citas'][number]) {
    setEditingCita(cita);
    setCitaError(null);
    const fecha = typeof cita.fechaCita === 'string' ? parseISO(cita.fechaCita) : cita.fechaCita;
    citaForm.reset({
      pacienteId: paciente.id,
      fechaCita: fecha.toISOString().slice(0, 16),
    });
    setShowCitaModal(true);
  }

  async function handleCitaSubmit(data: CitaFormData) {
    setIsCitaSaving(true);
    setCitaError(null);
    const result = editingCita
      ? await actualizarCita({ ...data, id: editingCita.id })
      : await agregarCita(data);

    if (result.success) {
      setShowCitaModal(false);
      setEditingCita(null);
      router.refresh();
    } else {
      if (redirectIfSessionExpired(result.error)) return;
      setCitaError(result.error);
    }
    setIsCitaSaving(false);
  }

  async function handleDeleteCita() {
    if (!deleteCitaConfirm) return;
    const result = await eliminarCita(deleteCitaConfirm);
    if (result.success) {
      setDeleteCitaConfirm(null);
      router.refresh();
    } else {
      if (redirectIfSessionExpired(result.error)) return;
      setCitaError(result.error);
      setDeleteCitaConfirm(null);
    }
  }

  async function handleArchive() {
    const result = await archivarPaciente(paciente.id);
    if (!result.success) {
      if (redirectIfSessionExpired(result.error)) return;
      setServerError(result.error);
      setShowDeleteConfirm(null);
      return;
    }

    router.replace('/pacientes');
    router.refresh();
  }

  function startEditing(sesion: Paciente['sesiones'][number]) {
    setEditingSesion(sesion);
    setSessionError(null);
    editForm.reset({
      pacienteId: paciente.id,
      fechaSesion: (typeof sesion.fechaSesion === 'string' ? parseISO(sesion.fechaSesion) : sesion.fechaSesion).toISOString().split('T')[0],
      notasClinicas: sesion.notasClinicas,
    });
  }

  async function handleEditSubmit(data: SesionFormData) {
    if (!editingSesion) return;
    setIsSessionSaving(true);
    setSessionError(null);
    const result = await actualizarSesion({ ...data, id: editingSesion.id });
    if (result.success) {
      setEditingSesion(null);
      router.refresh();
    } else {
      if (redirectIfSessionExpired(result.error)) return;
      setSessionError(result.error);
    }
    setIsSessionSaving(false);
  }

  async function handleDeleteSession() {
    if (!showDeleteConfirm) return;
    const result = await eliminarSesion(showDeleteConfirm);
    if (result.success) {
      setShowDeleteConfirm(null);
      router.refresh();
    } else {
      if (redirectIfSessionExpired(result.error)) return;
      setServerError(result.error);
      setShowDeleteConfirm(null);
    }
  }

  function getErrorMessage(fieldName: string): string | undefined {
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
                {calcularEdad(fechaNacimiento) !== null ? `${calcularEdad(fechaNacimiento)} años` : 'Edad no registrada'}
              </span>
              {paciente.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {paciente.telefono}
                </span>
              )}
              {paciente.lugarNacimiento && (
                <span>Nació en {paciente.lugarNacimiento}</span>
              )}
              {paciente.lugarResidencia && (
                <span>Reside en {paciente.lugarResidencia}</span>
              )}
              {paciente.profesion && (
                <span>{paciente.profesion}</span>
              )}
              {paciente.religion && (
                <span>{paciente.religion}</span>
              )}
              {paciente.motivoConsulta && (
                <span className="w-full sm:w-auto"><strong>Motivo:</strong> {paciente.motivoConsulta}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Paciente desde {format(typeof paciente.createdAt === 'string' ? parseISO(paciente.createdAt) : paciente.createdAt, 'MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={startEditingPatient} className="btn-secondary btn-sm">
              <Edit className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Editar</span>
            </button>
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
            {(() => {
              const isArchiving = showDeleteConfirm === paciente.id;
              return (
                <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-bg flex items-center justify-center" aria-hidden="true">
                <AlertCircle className="h-5 w-5 text-error-text" />
              </div>
              <h2 id="delete-confirm-title" className="text-lg font-semibold text-text-primary">
                {isArchiving ? 'Archivar paciente' : 'Eliminar sesión'}
              </h2>
            </div>
            <p className="text-text-secondary mb-6">
              {isArchiving
                ? <>¿Estás seguro de que querés archivar a <strong>{paciente.nombreCompleto}</strong>? Esta acción no elimina el historial, pero oculta al paciente de la lista principal.</>
                : '¿Estás seguro de que querés eliminar esta sesión? Esta acción no se puede deshacer.'}
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
                onClick={isArchiving ? handleArchive : handleDeleteSession}
              >
                {isArchiving ? 'Archivar' : 'Eliminar'}
              </button>
            </div>
                </>
              );
            })()}
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
              {paciente.sexo && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Sexo</dt>
                    <dd className="text-text-primary">{paciente.sexo}</dd>
                  </div>
                </div>
              )}
              {paciente.nombrePadre && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Nombre del padre</dt>
                    <dd className="text-text-primary">{paciente.nombrePadre}</dd>
                  </div>
                </div>
              )}
              {paciente.nombreMadre && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Nombre de la madre</dt>
                    <dd className="text-text-primary">{paciente.nombreMadre}</dd>
                  </div>
                </div>
              )}
              {paciente.estadoCivil && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <Heart className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Estado civil</dt>
                    <dd className="text-text-primary">{paciente.estadoCivil}</dd>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                  <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <dt className="text-xs font-medium text-text-muted">Fecha de nacimiento</dt>
                  <dd className="text-text-primary">
                    {paciente.fechaNacimiento
                      ? `${formatearFechaCorta(paciente.fechaNacimiento)}${calcularEdad(fechaNacimiento) !== null ? ` (${calcularEdad(fechaNacimiento)} años)` : ''}`
                      : 'No registrada'}
                  </dd>
                </div>
              </div>
              {paciente.lugarNacimiento && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Lugar de nacimiento</dt>
                    <dd className="text-text-primary">{paciente.lugarNacimiento}</dd>
                  </div>
                </div>
              )}
              {paciente.lugarResidencia && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Residencia actual</dt>
                    <dd className="text-text-primary">{paciente.lugarResidencia}</dd>
                  </div>
                </div>
              )}
              {paciente.profesion && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <Briefcase className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Profesión / trabajo</dt>
                    <dd className="text-text-primary">{paciente.profesion}</dd>
                  </div>
                </div>
              )}
              {paciente.religion && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center" aria-hidden="true">
                    <Church className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-text-muted">Religión</dt>
                    <dd className="text-text-primary">{paciente.religion}</dd>
                  </div>
                </div>
              )}
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

          <section className="card p-5 border-border-success-border/50 bg-success-bg/30" aria-labelledby="next-appointment-heading">
              <h2 id="next-appointment-heading" className="text-sm font-semibold text-success-text uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Próxima cita
              </h2>
              {paciente.citas.length === 0 ? (
                <p className="text-text-secondary">No hay próxima cita</p>
              ) : (
                <div className="space-y-2">
                  {paciente.citas.map((cita) => (
                    <div key={cita.id} className="flex items-start justify-between gap-3 rounded-lg bg-white/60 dark:bg-black/10 p-3">
                      <div className="text-success-text min-w-0">
                        <p className="font-medium">{formatearFechaHora(cita.fechaCita)}</p>
                        <p className="text-sm opacity-80 mt-1">
                          {format(typeof cita.fechaCita === 'string' ? parseISO(cita.fechaCita) : cita.fechaCita, "EEEE", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => openEditCita(cita)} className="btn-ghost btn-sm text-success-text" aria-label="Reprogramar cita">
                          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setDeleteCitaConfirm(cita.id)} className="btn-ghost btn-sm text-error-text" aria-label="Eliminar cita">
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={openNewCita} className="btn-secondary w-full mt-3 gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar cita
              </button>
          </section>

          <section className="card p-5" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
              Acciones rápidas
            </h2>
            <div className="space-y-2">
              {!isEditingPatient && (
              <button type="button" onClick={scrollToNewSession} className="btn btn-secondary w-full justify-start gap-3">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Nueva sesión
              </button>
              )}
              <button type="button" onClick={startEditingPatient} className="btn btn-ghost w-full justify-start gap-3">
                <Edit className="h-4 w-4" aria-hidden="true" />
                Editar paciente
              </button>
            </div>
          </section>
        </aside>

        <main className="space-y-6" aria-label="Historial clínico">
          <nav className="card p-1.5 flex items-center gap-1" aria-label="Secciones del paciente">
            <button
              type="button"
              onClick={() => setActiveTab('evoluciones')}
              className={`btn-sm flex-1 ${activeTab === 'evoluciones' ? 'btn-primary' : 'btn-ghost'}`}
              aria-pressed={activeTab === 'evoluciones'}
            >
              Evoluciones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('historia')}
              className={`btn-sm flex-1 ${activeTab === 'historia' ? 'btn-primary' : 'btn-ghost'}`}
              aria-pressed={activeTab === 'historia'}
            >
              Historia Clínica
            </button>
          </nav>
          {isEditingPatient ? (
            <section className="card p-5 sm:p-6" aria-labelledby="editar-paciente-heading">
              <div className="flex items-center justify-between mb-5">
                <h2 id="editar-paciente-heading" className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Edit className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  Editar paciente
                </h2>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setIsEditingPatient(false)}>
                  Cancelar
                </button>
              </div>
              {patientEditError && (
                <div className="mb-4 p-3 rounded-xl bg-error-bg text-error-text border border-error-border" role="alert">{patientEditError}</div>
              )}
              <form onSubmit={patientEditForm.handleSubmit(handlePatientEditSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-nombreCompleto" className="label">Nombre completo *</label>
                    <input {...patientEditForm.register('nombreCompleto')} id="edit-nombreCompleto" className="input" disabled={isPatientSaving} />
                    {patientEditForm.formState.errors.nombreCompleto && <p className="field-error">{patientEditForm.formState.errors.nombreCompleto.message}</p>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-fechaNacimiento" className="label">Fecha de nacimiento</label>
                    <input {...patientEditForm.register('fechaNacimiento')} id="edit-fechaNacimiento" type="date" max={today} className="input" disabled={isPatientSaving} />
                    {patientEditForm.formState.errors.fechaNacimiento && <p className="field-error">{patientEditForm.formState.errors.fechaNacimiento.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-telefono" className="label">Teléfono</label>
                    <input {...patientEditForm.register('telefono')} id="edit-telefono" type="tel" className="input" disabled={isPatientSaving} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-sexo" className="label">Sexo</label>
                    <select {...patientEditForm.register('sexo')} id="edit-sexo" className="input" disabled={isPatientSaving}>
                      <option value="">Sin especificar</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                      <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-estadoCivil" className="label">Estado civil</label>
                    <select {...patientEditForm.register('estadoCivil')} id="edit-estadoCivil" className="input" disabled={isPatientSaving}>
                      <option value="">Sin especificar</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Unión convivencial">Unión convivencial</option>
                      <option value="Separado/a">Separado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-nombrePadre" className="label">Nombre del padre</label>
                    <input {...patientEditForm.register('nombrePadre')} id="edit-nombrePadre" className="input" disabled={isPatientSaving} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-nombreMadre" className="label">Nombre de la madre</label>
                    <input {...patientEditForm.register('nombreMadre')} id="edit-nombreMadre" className="input" disabled={isPatientSaving} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-lugarNacimiento" className="label">Lugar de nacimiento</label>
                    <input {...patientEditForm.register('lugarNacimiento')} id="edit-lugarNacimiento" className="input" disabled={isPatientSaving} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-lugarResidencia" className="label">Residencia actual</label>
                    <input {...patientEditForm.register('lugarResidencia')} id="edit-lugarResidencia" className="input" disabled={isPatientSaving} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-profesion" className="label">Profesión / trabajo</label>
                    <input {...patientEditForm.register('profesion')} id="edit-profesion" className="input" disabled={isPatientSaving} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-religion" className="label">Religión</label>
                    <input {...patientEditForm.register('religion')} id="edit-religion" className="input" disabled={isPatientSaving} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-motivoConsulta" className="label">Motivo de consulta</label>
                  <textarea {...patientEditForm.register('motivoConsulta')} id="edit-motivoConsulta" rows={4} className="input resize-y" disabled={isPatientSaving} />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditingPatient(false)} disabled={isPatientSaving}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={isPatientSaving}>
                    {isPatientSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Guardar cambios
                  </button>
                </div>
              </form>
            </section>
          ) : activeTab === 'evoluciones' ? (
          <section className="card p-5 sm:p-6" aria-labelledby="nueva-sesion-heading">
            <h2 id="nueva-sesion-heading" className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Nueva Sesión
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1">
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

              </div>

              <div className="form-group">
                <label htmlFor="notasClinicas" className="label">
                  Notas clínicas <span className="text-error-text" aria-hidden="true">*</span>
                </label>
                <RichTextEditor
                  value={notasClinicas}
                  onChange={(val) => setValue('notasClinicas', val, { shouldValidate: true, shouldDirty: true })}
                  error={getErrorMessage('notasClinicas')}
                  disabled={isSubmitting}
                />
                {hasError('notasClinicas') && (
                  <p id="notasClinicas-error" className="field-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {getErrorMessage('notasClinicas')}
                  </p>
                )}
                <p className="field-hint">Tiptap Editor: Usá <code className="bg-bg-tertiary px-1 rounded"># </code> para títulos y <code className="bg-bg-tertiary px-1 rounded">* </code> para listas.</p>
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
          ) : (
            <HistoriaClinicaTab pacienteId={paciente.id} anamnesis={paciente.anamnesis} />
          )}

          {!isEditingPatient && activeTab === 'evoluciones' && (
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
                          <div className="prose prose-sm max-w-none text-text-secondary font-sans leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {sesion.notasClinicas}
                            </ReactMarkdown>
                          </div>
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-subtle">
                            <span className="text-xs text-text-muted flex-1">
                              Creada: {formatearFechaHora(sesion.createdAt)}
                            </span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => startEditing(sesion)} className="btn-ghost btn-sm text-text-muted hover:text-text-primary">
                                <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="hidden sm:inline">Editar</span>
                              </button>
                              <button type="button" onClick={() => setShowDeleteConfirm(sesion.id)} className="btn-ghost btn-sm text-text-muted hover:text-error-text">
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="hidden sm:inline">Eliminar</span>
                              </button>
                            </div>

                            {editingSesion && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="edit-session-title">
                                <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                  <h2 id="edit-session-title" className="text-xl font-semibold text-text-primary mb-5">Editar sesión</h2>
                                  {sessionError && <div className="mb-4 p-3 rounded-xl bg-error-bg text-error-text border border-error-border" role="alert">{sessionError}</div>}
                                  <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4" noValidate>
                                    <div className="grid grid-cols-1">
                                      <div className="form-group">
                                        <label htmlFor="edit-fechaSesion" className="label">Fecha de la sesión</label>
                                        <input {...editForm.register('fechaSesion')} id="edit-fechaSesion" type="date" max={today} className="input" disabled={isSessionSaving} />
                                      </div>
                                    </div>
                                    <div className="form-group">
                                      <label htmlFor="edit-notasClinicas" className="label">Notas clínicas</label>
                                      <textarea {...editForm.register('notasClinicas')} id="edit-notasClinicas" rows={8} className="input resize-y font-mono text-sm" disabled={isSessionSaving} />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                      <button type="button" className="btn-secondary" onClick={() => setEditingSesion(null)} disabled={isSessionSaving}>Cancelar</button>
                                      <button type="submit" className="btn-primary" disabled={isSessionSaving}>
                                        {isSessionSaving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                                        Guardar cambios
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
          )}
        </main>
      </div>

      {showCitaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="cita-modal-title">
          <div className="card p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 id="cita-modal-title" className="text-xl font-semibold text-text-primary">
                {editingCita ? 'Reprogramar cita' : 'Agregar cita'}
              </h2>
              <button type="button" onClick={() => setShowCitaModal(false)} className="btn-ghost btn-sm" aria-label="Cerrar">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {citaError && (
              <div className="mb-4 p-3 rounded-xl bg-error-bg text-error-text border border-error-border" role="alert">{citaError}</div>
            )}
            <form onSubmit={citaForm.handleSubmit(handleCitaSubmit)} className="space-y-4" noValidate>
              <div className="form-group">
                <label htmlFor="fechaCita" className="label">Fecha y hora <span className="text-error-text" aria-hidden="true">*</span></label>
                <input
                  {...citaForm.register('fechaCita')}
                  id="fechaCita"
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  className="input"
                  disabled={isCitaSaving}
                />
                {citaForm.formState.errors.fechaCita && (
                  <p className="field-error" role="alert">{citaForm.formState.errors.fechaCita.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn-secondary" onClick={() => setShowCitaModal(false)} disabled={isCitaSaving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isCitaSaving}>
                  {isCitaSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {editingCita ? 'Guardar cambios' : 'Agregar cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCitaConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-cita-title">
          <div className="card p-6 max-w-md w-full">
            <h2 id="delete-cita-title" className="text-lg font-semibold text-text-primary mb-3">Eliminar cita</h2>
            <p className="text-text-secondary mb-6">¿Estás seguro de que querés eliminar esta cita? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setDeleteCitaConfirm(null)}>Cancelar</button>
              <button type="button" className="btn-destructive flex-1" onClick={handleDeleteCita}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}