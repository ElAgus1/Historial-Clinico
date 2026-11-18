'use client';

import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('No se pudo actualizar la contraseña. Solicitá un nuevo enlace e intentá nuevamente.');
      setLoading(false);
      return;
    }

    setMessage('Tu contraseña fue actualizada correctamente.');
    setLoading(false);
    setTimeout(() => router.replace('/login'), 1200);
  }

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-[400px]">
        <div className="card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-600" aria-hidden="true" />
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 text-brand-600 mb-4 dark:bg-brand-900/30 dark:text-brand-400" aria-hidden="true">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Nueva contraseña</h1>
            <p className="text-text-secondary mt-1">Elegí una contraseña segura para tu cuenta</p>
          </header>

          {error && <div className="mb-6 p-4 rounded-xl bg-error-bg text-error-text border border-error-border" role="alert">{error}</div>}
          {message && <div className="mb-6 p-4 rounded-xl bg-success-bg text-success-text border border-success-border" role="status">{message}</div>}

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="new-password" className="label">Nueva contraseña</label>
              <div className="relative">
                <input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="input pr-12" placeholder="Mínimo 8 caracteres" disabled={loading} autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} disabled={loading}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password" className="label">Repetir contraseña</label>
              <input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="input" disabled={loading} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-6">
            {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>
    </main>
  );
}
