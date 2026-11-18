'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthStateListener() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const sessionExpired = event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session);

      const isPublicAuthPage =
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/auth/reset-password' ||
        pathname === '/auth/update-password';

      if (sessionExpired && !isPublicAuthPage) {
        router.replace('/login?expired=1');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
