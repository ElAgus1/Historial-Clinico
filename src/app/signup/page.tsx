'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresá un email válido.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError('No se pudo crear la cuenta. Verificá los datos e intentá nuevamente.');
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace('/pacientes');
      router.refresh();
      return;
    }

    setMessage('Cuenta creada. Revisá tu email para confirmar la cuenta antes de ingresar.');
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setError(null);
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (oauthError) {
      setError('No se pudo iniciar sesión con Google. Intente nuevamente.');
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-text-primary">Crear una cuenta</h1>
            <p className="text-text-secondary mt-1">Empezá a gestionar tus pacientes</p>
          </header>

          {error && <div className="mb-6 p-4 rounded-xl bg-error-bg text-error-text border border-error-border" role="alert">{error}</div>}
          {message && <div className="mb-6 p-4 rounded-xl bg-success-bg text-success-text border border-success-border" role="status">{message}</div>}

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="signup-email" className="label">Email</label>
              <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" placeholder="tu@clinica.com" disabled={loading} autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password" className="label">Contraseña</label>
              <div className="relative">
                <input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="input pr-12" placeholder="Mínimo 8 caracteres" disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} disabled={loading}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm-password" className="label">Repetir contraseña</label>
              <input id="signup-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input" disabled={loading} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-6">
            {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-stroke-subtle" /></div>
            <div className="relative flex justify-center"><span className="bg-surface-primary px-3 text-sm text-content-muted">o</span></div>
          </div>

          <button type="button" onClick={handleGoogleSignup} disabled={loading} className="btn-secondary btn-lg w-full">
            Continuar con Google
          </button>

          <p className="mt-6 text-center text-sm text-text-secondary">
            ¿Ya tenés una cuenta?{' '}
            <a href="/login" className="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2">Ingresar</a>
          </p>
        </div>
      </form>
    </main>
  );
}
