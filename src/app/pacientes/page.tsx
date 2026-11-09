import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Users, Phone, FileText, Calendar, MoreHorizontal, ChevronDown } from 'lucide-react';
import { obtenerPacientes } from '@/app/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface PacientesListProps {
  initialData: Awaited<ReturnType<typeof obtenerPacientes>>;
}

function PacientesList({ initialData }: PacientesListProps) {
  const result = initialData;

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-error-bg mb-4" aria-hidden="true">
            <Users className="h-8 w-8 text-error-text" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">Error al cargar pacientes</h3>
          <p className="text-text-secondary mb-6">{result.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const pacientes = result.data;

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-bg-tertiary mb-6" aria-hidden="true">
          <Users className="h-10 w-10 text-text-muted" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">No hay pacientes registrados</h3>
        <p className="text-text-secondary mb-8 max-w-sm mx-auto">Comienza creando tu primer historial clínico para llevar el control de tus consultas.</p>
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 btn-primary"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo Paciente
        </Link>
      </div>
    );
  }

  function calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  function formatearMesAnio(fecha: Date): string {
    return format(new Date(fecha), 'MMM yyyy', { locale: es });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" role="list" aria-label="Lista de pacientes">
      {pacientes.map((paciente) => (
        <article
          key={paciente.id}
          className="card-interactive group relative overflow-hidden"
          role="listitem"
          aria-labelledby={`patient-name-${paciente.id}`}
        >
          <Link
            href={`/pacientes/${paciente.id}`}
            className="block p-5 h-full focus:outline-none"
          >
            <header className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3
                  id={`patient-name-${paciente.id}`}
                  className="text-text-primary font-semibold text-base truncate group-hover:text-brand-600 transition-colors"
                >
                  {paciente.nombreCompleto}
                </h3>
                <p className="text-text-secondary text-sm mt-1 flex items-center gap-1.5">
                  <span aria-hidden="true">{calcularEdad(paciente.fechaNacimiento)} años</span>
                  <span className="text-text-muted">•</span>
                  <span>Paciente desde {formatearMesAnio(paciente.createdAt)}</span>
                </p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 transition-colors" aria-hidden="true">
                <Users className="h-5 w-5" />
              </div>
            </header>

            <div className="space-y-2.5 text-sm">
              {paciente.telefono && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{paciente.telefono}</span>
                </div>
              )}
              {paciente.motivoConsulta && (
                <div className="flex items-start gap-2 text-text-secondary">
                  <FileText className="h-4 w-4 text-text-muted flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="line-clamp-2">{paciente.motivoConsulta}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-text-muted pt-2 border-t border-border-subtle">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                <span>{paciente._count.sesiones} sesión{paciente._count.sesiones !== 1 ? 'es' : ''}</span>
                <span className="flex-1"></span>
                <span className="text-xs">{formatearMesAnio(paciente.createdAt)}</span>
              </div>
            </div>
          </Link>

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-fast" aria-hidden="true">
            <div className="relative">
              <button
                className="btn-ghost btn-icon p-1.5 rounded-lg bg-bg-primary/80 backdrop-blur"
                aria-label={`Más opciones para ${paciente.nombreCompleto}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <article className="card p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="skeleton-title mb-2" />
          <div className="skeleton-text w-1/2" />
        </div>
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>
      <div className="space-y-2.5">
        <div className="skeleton-text w-3/4" />
        <div className="skeleton-text w-5/6" />
        <div className="skeleton-text w-1/3" />
      </div>
    </article>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" role="list" aria-label="Cargando pacientes">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default async function PacientesPage() {
  const result = await obtenerPacientes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="mb-8" id="main-content">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Pacientes</h1>
            <p className="text-text-secondary mt-1">Gestiona el historial clínico de tus pacientes</p>
          </div>
          <Link
            href="/pacientes/nuevo"
            className="btn-primary btn-lg whitespace-nowrap"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nuevo Paciente
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              id="patient-search"
              placeholder="Buscar paciente..."
              className="input pl-10"
              aria-label="Buscar paciente"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
            <select className="input pl-10 pr-8 appearance-none" aria-label="Filtrar pacientes">
              <option value="all">Todos</option>
              <option value="upcoming">Con próximas citas</option>
              <option value="no-sessions">Sin sesiones</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" aria-hidden="true" />
          </div>
        </div>
      </header>

      <Suspense fallback={<SkeletonGrid />}>
        <PacientesList initialData={result} />
      </Suspense>
    </div>
  );
}