import type { Metadata } from 'next';
import './globals.css';
import { getAuthenticatedUser } from '@/lib/supabase/auth';
import AuthStateListener from './auth-state-listener';

export const metadata: Metadata = {
  title: 'Historial Clínico',
  description: 'Gestión de pacientes e historial clínico',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPromise = getAuthenticatedUser();
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <AuthStateListener />
        {children}
        <AuthFooter userPromise={userPromise} />
      </body>
    </html>
  );
}

async function AuthFooter({ userPromise }: { userPromise: ReturnType<typeof getAuthenticatedUser> }) {
  const user = await userPromise;
  if (!user) return null;

  return (
    <footer className="mt-auto flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
      <span className="text-sm text-slate-600">{user.email}</span>
      <form action="/logout" method="post">
        <button type="submit" className="text-sm font-medium text-teal-700 hover:text-teal-900">
          Cerrar sesión
        </button>
      </form>
    </footer>
  );
}
