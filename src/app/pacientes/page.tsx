// src/app/pacientes/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Users, FileText, Calendar, Phone } from 'lucide-react';
import { obtenerPacientes } from '@/app/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

async function PacientesList() {
  const result = await obtenerPacientes();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <p className="text-lg">{result.error}</p>
      </div>
    );
  }

  const pacientes = result.data;

  if (pacientes.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" aria-hidden="true" />
        <h3 className="text-slate-600 text-lg font-medium mb-2">No hay pacientes registrados</h3>
        <p className="text-slate-400 mb-6">Comienza agregando tu primer paciente</p>
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo Paciente
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {pacientes.map((paciente) => (
        <Link
          key={paciente.id}
          href={`/pacientes/${paciente.id}`}
          className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 font-semibold text-base truncate group-hover:text-teal-700 transition-colors">
                {paciente.nombreCompleto}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {format(paciente.fechaNacimiento, 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors" aria-hidden="true">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-2.5 text-sm">
            {paciente.telefono && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{paciente.telefono}</span>
              </div>
            )}
            {paciente.motivoConsulta && (
              <div className="flex items-start gap-2 text-slate-600">
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="line-clamp-2">{paciente.motivoConsulta}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-100">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{paciente._count.sesiones} sesión{paciente._count.sesiones !== 1 ? 'es' : ''}</span>
              <span className="flex-1"></span>
              <span className="text-xs">
                {format(paciente.createdAt, 'MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function PacientesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gestiona el historial clínico de tus pacientes</p>
        </div>
        <Link
          href="/pacientes/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 whitespace-nowrap"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          Nuevo Paciente
        </Link>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      }>
        <PacientesList />
      </Suspense>
    </div>
  );
}