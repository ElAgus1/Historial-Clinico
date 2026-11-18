// src/app/page.tsx
import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

export default async function HomePage() {
  const user = await getAuthenticatedUser();
  redirect(user ? '/pacientes' : '/login');
}