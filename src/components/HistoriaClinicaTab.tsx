'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { guardarAnamnesis } from '@/app/actions';
import type { AnamnesisFormData } from '@/lib/schemas';
import { GenogramaUploader } from './GenogramaUploader';

interface HistoriaClinicaTabProps {
  pacienteId: string;
  anamnesis: {
    antecedentesPropios: string | null;
    antecedentesFamiliares: string | null;
    genogramaPath: string | null;
    historiaVital: unknown;
  } | null;
}

const emptyEtapa = { academico: '', social: '', familiar: '' };

function asHistoriaVital(value: unknown): AnamnesisFormData['historiaVital'] {
  if (!value || typeof value !== 'object') {
    return {
      primaria: { ...emptyEtapa },
      secundario: { ...emptyEtapa },
      actualidad: { ...emptyEtapa },
    };
  }
  const raw = value as {
    primaria?: Partial<typeof emptyEtapa>;
    secundario?: Partial<typeof emptyEtapa>;
    actualidad?: Partial<typeof emptyEtapa>;
  };
  return {
    primaria: { academico: raw.primaria?.academico ?? '', social: raw.primaria?.social ?? '', familiar: raw.primaria?.familiar ?? '' },
    secundario: { academico: raw.secundario?.academico ?? '', social: raw.secundario?.social ?? '', familiar: raw.secundario?.familiar ?? '' },
    actualidad: { academico: raw.actualidad?.academico ?? '', social: raw.actualidad?.social ?? '', familiar: raw.actualidad?.familiar ?? '' },
  };
}

export function HistoriaClinicaTab({ pacienteId, anamnesis }: HistoriaClinicaTabProps) {
  const [antecedentesPropios, setAntecedentesPropios] = useState(anamnesis?.antecedentesPropios ?? '');
  const [antecedentesFamiliares, setAntecedentesFamiliares] = useState(anamnesis?.antecedentesFamiliares ?? '');
  const [historiaVital, setHistoriaVital] = useState(() => asHistoriaVital(anamnesis?.historiaVital));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateEtapa(etapa: 'primaria' | 'secundario' | 'actualidad', campo: 'academico' | 'social' | 'familiar', value: string) {
    setSaved(false);
    setHistoriaVital((current) => {
      if (etapa === 'actualidad') {
        return { ...current, actualidad: { ...current.actualidad, [campo]: value } };
      }
      return { ...current, [etapa]: { ...current[etapa], [campo]: value } };
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    const result = await guardarAnamnesis(pacienteId, {
      antecedentesPropios,
      antecedentesFamiliares,
      historiaVital,
    });
    if (result.success) setSaved(true);
    else setError(result.error);
    setIsSaving(false);
  }

  const etapas: Array<{
    key: 'primaria' | 'secundario' | 'actualidad';
    title: 'PRIMARIA' | 'SECUNDARIO' | 'ACTUALIDAD';
  }> = [
    { key: 'primaria', title: 'PRIMARIA' },
    { key: 'secundario', title: 'SECUNDARIO' },
    { key: 'actualidad', title: 'ACTUALIDAD' },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-error-bg text-error-text border border-error-border flex items-start gap-3" role="alert">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <section className="card p-5 sm:p-6" aria-labelledby="antecedentes-heading">
        <h3 id="antecedentes-heading" className="text-lg font-semibold text-text-primary mb-4">Registro de Antecedentes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="antecedentesPropios" className="label">Antecedentes Propios</label>
            <textarea
              id="antecedentesPropios"
              value={antecedentesPropios}
              onChange={(event) => { setSaved(false); setAntecedentesPropios(event.target.value); }}
              rows={8}
              maxLength={10000}
              className="input resize-y"
            />
          </div>
          <div className="form-group">
            <label htmlFor="antecedentesFamiliares" className="label">Antecedentes Familiares</label>
            <textarea
              id="antecedentesFamiliares"
              value={antecedentesFamiliares}
              onChange={(event) => { setSaved(false); setAntecedentesFamiliares(event.target.value); }}
              rows={8}
              maxLength={10000}
              className="input resize-y"
            />
          </div>
        </div>
      </section>

      <GenogramaUploader pacienteId={pacienteId} path={anamnesis?.genogramaPath ?? null} />

      <section className="card p-5 sm:p-6" aria-labelledby="biografia-heading">
        <h3 id="biografia-heading" className="text-lg font-semibold text-text-primary mb-4">Desglose Biográfico</h3>
        <div className="space-y-5">
          {etapas.map((etapa) => (
            <div key={etapa.key} className="rounded-xl border border-border-subtle p-4 sm:p-5 bg-bg-secondary">
              <h4 className="text-sm font-semibold tracking-wider text-brand-700 mb-4">{etapa.title}</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="form-group">
                  <label htmlFor={`${etapa.key}-academico`} className="label">
                    {etapa.key === 'actualidad' ? 'Aspectos académicos / laborales' : 'Aspectos académicos'}
                  </label>
                  <textarea
                    id={`${etapa.key}-academico`}
                    value={etapa.key === 'actualidad' ? historiaVital.actualidad.academico : historiaVital[etapa.key].academico}
                    onChange={(event) => updateEtapa(etapa.key, 'academico', event.target.value)}
                    rows={5}
                    maxLength={5000}
                    className="input resize-y"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`${etapa.key}-social`} className="label">Aspectos sociales</label>
                  <textarea
                    id={`${etapa.key}-social`}
                    value={etapa.key === 'actualidad' ? historiaVital.actualidad.social : historiaVital[etapa.key].social}
                    onChange={(event) => updateEtapa(etapa.key, 'social', event.target.value)}
                    rows={5}
                    maxLength={5000}
                    className="input resize-y"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`${etapa.key}-familiar`} className="label">Aspectos familiares</label>
                  <textarea
                    id={`${etapa.key}-familiar`}
                    value={etapa.key === 'actualidad' ? historiaVital.actualidad.familiar : historiaVital[etapa.key].familiar}
                    onChange={(event) => updateEtapa(etapa.key, 'familiar', event.target.value)}
                    rows={5}
                    maxLength={5000}
                    className="input resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <p className="text-sm text-success-text flex items-center gap-2" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Historia clínica guardada
          </p>
        )}
        <button type="button" onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
          {isSaving ? 'Guardando...' : 'Guardar historia clínica'}
        </button>
      </div>
    </div>
  );
}
