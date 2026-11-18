'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresá un email válido.');
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (resetError) {
      setError('No se pudo enviar el email. Verificá la dirección e intentá nuevamente.');
      setLoading(false);
      return;
    }

    setMessage('Te enviamos un email con instrucciones para restablecer tu contraseña.');
    setLoading(false);
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
            <h1 className="text-2xl font-bold text-text-primary">Recuperar contraseña</h1>
            <p className="text-text-secondary mt-1">Te enviaremos un enlace para crear una nueva</p>
          </header>

          {error && <div className="mb-6 p-4 rounded-xl bg-error-bg text-error-text border border-error-border" role="alert">{error}</div>}
          {message && <div className="mb-6 p-4 rounded-xl bg-success-bg text-success-text border border-success-border" role="status">{message}</div>}

          <div className="form-group">
            <label htmlFor="reset-email" className="label">Email</label>
            <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" placeholder="tu@clinica.com" disabled={loading} autoFocus />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-6">
            {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            <a href="/login" className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2">Volver al login</a>
          </p>
        </div>
      </form>
    </main>
  );
}
