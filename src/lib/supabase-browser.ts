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
    // Create a chainable query builder mock
    const createQueryMock = () => ({
      select: (columns?: string) => createQueryMock(),
      insert: (data: any) => createQueryMock(),
      update: (data: any) => createQueryMock(),
      delete: () => createQueryMock(),
      eq: (column: string, value: any) => createQueryMock(),
      neq: (column: string, value: any) => createQueryMock(),
      gt: (column: string, value: any) => createQueryMock(),
      gte: (column: string, value: any) => createQueryMock(),
      lt: (column: string, value: any) => createQueryMock(),
      lte: (column: string, value: any) => createQueryMock(),
      like: (column: string, value: any) => createQueryMock(),
      ilike: (column: string, value: any) => createQueryMock(),
      in: (column: string, values: any[]) => createQueryMock(),
      order: (column: string, options?: { ascending: boolean }) => createQueryMock(),
      limit: (n: number) => createQueryMock(),
      range: (from: number, to: number) => createQueryMock(),
      single: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      maybeSingle: () => ({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
      then: (resolve: any) => resolve({ data: null, error: { message: 'Not configured', code: 'CONFIG_ERROR' } }),
    });

    return {
      from: (table: string) => createQueryMock(),
      select: (columns?: string) => createQueryMock(),
      insert: (data: any) => createQueryMock(),
      update: (data: any) => createQueryMock(),
      delete: () => createQueryMock(),
      rpc: (fn: string, params?: any) => createQueryMock(),
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
