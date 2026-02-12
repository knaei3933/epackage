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

// Helper function to get Supabase credentials at runtime
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('[supabase-browser] Credentials not configured, returning mock client');
    return null;
  }

  return { url, key };
};

// Lazy initialization pattern - only create client when accessed
let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseBrowserClient = () => {
  if (_supabase) return _supabase;

  const config = getSupabaseConfig();

  if (!config) {
    // Return a mock client that gracefully handles unconfigured state
    return {
      from: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      select: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      insert: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      update: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      delete: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      rpc: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: 'Not configured' } }),
        getSession: async () => ({ data: { session: null }, error: { message: 'Not configured' } }),
      },
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
    } as any;
  }

  _supabase = createClient<Database>(config.url, config.key, {
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

  return _supabase;
};

// Backward compatibility: export default named export as alias
export const supabase = getSupabaseBrowserClient();
