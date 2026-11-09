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

      if (sessionExpired && pathname !== '/login') {
        router.replace('/login');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
