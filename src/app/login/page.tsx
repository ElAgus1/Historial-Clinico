'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string): string | null {
    if (name === 'email') {
      if (!value) return 'El email es obligatorio';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
    }
    if (name === 'password') {
      if (!value) return 'La contraseña es obligatoria';
      if (value.length < 8) return 'Mínimo 8 caracteres';
    }
    return null;
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error || '' }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError || '',
        password: passwordError || '',
      });
      return;
    }

    setLoading(true);
    setFieldErrors({});

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Email o contraseña incorrectos. Verificá tus credenciales.');
      setLoading(false);
      return;
    }

    router.replace('/pacientes');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <form onSubmit={handleSubmit} noValidate id="main-content" className="w-full max-w-[400px]">
        <div className="card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-600" aria-hidden="true" />

          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 text-brand-600 mb-4 dark:bg-brand-900/30 dark:text-brand-400" aria-hidden="true">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Historial Clínico</h1>
            <p className="text-text-secondary mt-1">Accedé a tus pacientes</p>
          </header>

          {error && (
            <div
              className="mb-6 p-4 rounded-xl bg-error-bg text-error-text border border-error-border flex items-start gap-3"
              role="alert"
              aria-live="assertive"
            >
              <svg className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={handleBlur}
                placeholder="tu@clinica.com"
                className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                disabled={loading}
                autoFocus
              />
              {fieldErrors.email && (
                <p id="email-error" className="field-error" role="alert">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`input pr-12 ${fieldErrors.password ? 'input-error' : ''}`}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="field-error" role="alert">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-lg w-full mt-6"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="mt-6 text-center text-sm text-text-muted">
            <a href="/auth/reset-password" className="text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </p>
        </div>
      </form>
    </main>
  );
}