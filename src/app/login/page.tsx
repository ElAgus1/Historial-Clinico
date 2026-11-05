'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Email o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    router.replace('/pacientes');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial Clínico</h1>
          <p className="text-slate-500 mt-1">Ingresá para acceder a tus pacientes</p>
        </div>
        {error && <p className="p-3 rounded-lg bg-red-50 text-red-700" role="alert">{error}</p>}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Contraseña
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        <button disabled={loading} className="w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-50">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
