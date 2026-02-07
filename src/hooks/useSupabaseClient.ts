/**
 * Client-side Supabase hook
 *
 * This hook provides a Supabase client for Client Components.
 * It dynamically imports the browser client to prevent build-time issues.
 */

import { useState, useEffect } from 'react';

export function useSupabaseClient() {
  const [supabase, setSupabase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initClient = async () => {
      try {
        // Dynamic import to prevent build issues
        const { createClient } = await import('@supabase/supabase-js');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn('[useSupabaseClient] Missing Supabase credentials');
          return;
        }

        const client = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
            storage: {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
          },
        });

        if (mounted) {
          setSupabase(client);
        }
      } catch (error) {
        console.error('[useSupabaseClient] Failed to initialize:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initClient();

    return () => {
      mounted = false;
    };
  }, []);

  return { supabase, loading };
}
