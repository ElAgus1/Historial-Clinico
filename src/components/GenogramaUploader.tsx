'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ImageIcon, Loader2, Maximize2, Trash2, Upload, X } from 'lucide-react';
import { eliminarGenograma, obtenerUrlGenograma, subirGenograma } from '@/app/actions';

interface GenogramaUploaderProps {
  pacienteId: string;
  path: string | null;
}

export function GenogramaUploader({ pacienteId, path }: GenogramaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    const result = await subirGenograma(pacienteId, formData);
    if (result.success) {
      const preview = await obtenerUrlGenograma(pacienteId);
      if (preview.success) setPreviewUrl(preview.data.url);
    } else {
      setError(result.error);
    }
    setIsUploading(false);
  }, [pacienteId]);

  useEffect(() => {
    let cancelled = false;
    if (!path) return;

    void obtenerUrlGenograma(pacienteId).then((result) => {
      if (!cancelled && result.success) setPreviewUrl(result.data.url);
    });

    return () => {
      cancelled = true;
    };
  }, [pacienteId, path]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const item = Array.from(event.clipboardData?.items ?? []).find((entry) => entry.type.startsWith('image/'));
      if (!item) return;
      const file = item.getAsFile();
      if (file) void uploadFile(file);
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadFile]);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await eliminarGenograma(pacienteId);
    if (result.success) {
      setPreviewUrl(null);
      setShowPreview(false);
    } else {
      setError(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="genograma-heading">
      <h3 id="genograma-heading" className="text-lg font-semibold text-text-primary mb-4">Genograma</h3>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-error-bg text-error-text border border-error-border flex items-center gap-2" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="space-y-3">
          <button type="button" onClick={() => setShowPreview(true)} className="block w-full overflow-hidden rounded-xl border border-border-default bg-bg-tertiary" aria-label="Ampliar genograma">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Genograma del paciente" className="max-h-72 w-full object-contain" />
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowPreview(true)} className="btn-secondary">
              <Maximize2 className="h-4 w-4" aria-hidden="true" /> Ampliar
            </button>
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary" disabled={isUploading}>
              <Upload className="h-4 w-4" aria-hidden="true" /> Reemplazar
            </button>
            <button type="button" onClick={handleDelete} className="btn-ghost text-error-text" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
              Borrar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files[0];
            if (file) void uploadFile(file);
          }}
          className={`w-full min-h-44 rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-colors ${dragging ? 'border-brand-500 bg-brand-50' : 'border-border-default bg-bg-secondary'}`}
        >
          {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-hidden="true" /> : <ImageIcon className="h-8 w-8 text-brand-600" aria-hidden="true" />}
          <span className="font-medium text-text-primary">Arrastrá una imagen aquí o seleccionala</span>
          <span className="text-sm text-text-muted">JPG, PNG o WebP · máximo 10 MB · también podés pegarla con Ctrl+V</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFile(file);
          event.target.value = '';
        }}
      />

      {showPreview && previewUrl && (
        <div className="fixed inset-0 z-[70] bg-black/80 p-4 sm:p-8 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Vista ampliada del genograma">
          <button type="button" onClick={() => setShowPreview(false)} className="absolute right-4 top-4 btn-secondary" aria-label="Cerrar vista ampliada">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Vista ampliada del genograma" className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </section>
  );
}
