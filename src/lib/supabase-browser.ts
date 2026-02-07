/**
 * Client-side Supabase Client
 *
 * This file is ONLY for Client Components.
 * Server Components should use @/lib/supabase (getServerClient, createServiceClient)
 *
 * IMPORTANT: This file MUST only be imported from Client Components.
 * Importing this file in Server Components will cause build errors.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials not configured');
}

// Client-side Supabase instance for Realtime subscriptions
// This is only used in Client Components
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,   // ✅ 自動リフレッシュ有効化（30分セッション維持）
    persistSession: true,     // ✅ セッション持続有効化
    detectSessionInUrl: true, // ✅ URLからのセッション検出有効化
    storage: {
      // Use sessionStorage as fallback for client-side access
      // HTTP-only cookies are still used for server-side auth
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        try {
          return sessionStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        try {
          sessionStorage.setItem(key, value);
        } catch {
          // Ignore storage errors
        }
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        try {
          sessionStorage.removeItem(key);
        } catch {
          // Ignore storage errors
        }
      },
    },
  },
});
