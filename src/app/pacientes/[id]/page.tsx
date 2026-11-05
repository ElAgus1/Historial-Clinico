// src/app/pacientes/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { obtenerPacientePorId } from '@/app/actions';
import { DetallePaciente } from './detalle-paciente';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function PacienteData({ params }: PageProps) {
  const { id } = await params;
  const result = await obtenerPacientePorId(id);

  if (!result.success) {
    notFound();
  }

  return <DetallePaciente paciente={result.data} />;
}

export default function PacientePage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-6 bg-slate-200 rounded w-1/2" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <PacienteData params={params} />
    </Suspense>
  );
}