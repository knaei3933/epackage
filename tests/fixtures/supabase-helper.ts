/**
 * Supabase Test Helper
 * Supabase 테스트 헬퍼
 *
 * Provides a unified way to handle Supabase client initialization
 * for E2E tests, with proper handling of missing credentials.
 *
 * Usage:
 *   import { getSupabaseClient, isSupabaseConfigured } from '../fixtures/supabase-helper';
 *
 *   if (!isSupabaseConfigured()) {
 *     test.skip(true, 'Supabase credentials not configured');
 *   }
 *
 *   const supabase = getSupabaseClient();
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Check if Supabase credentials are properly configured
 * Supabase 자격 증명이 올바르게 구성되어 있는지 확인
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));
};

/**
 * Get Supabase client for tests
 * Returns null if credentials are not configured
 *
 * Prefer service role key for admin operations (test setup/teardown)
 * Falls back to anon key for read-only operations
 */
export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // Use service role key for admin operations
  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Fall back to anon key
  if (supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return null;
};

/**
 * Get Supabase anon client for client-side operations
 */
export const getSupabaseAnonClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Get Supabase service client for admin operations
 */
export const getSupabaseServiceClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Skip test if Supabase is not configured
 * Use this in test.beforeEach or at the beginning of tests
 */
export const skipIfNoSupabase = () => {
  if (!isSupabaseConfigured()) {
    test.skip(true, 'Supabase credentials not configured - skipping test');
  }
};

/**
 * Log Supabase configuration status
 */
export const logSupabaseStatus = () => {
  console.log('[Supabase Test Helper] Configuration status:');
  console.log('  - URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
  console.log('  - Anon Key:', supabaseAnonKey ? '✓ Configured' : '✗ Missing');
  console.log('  - Service Role Key:', supabaseServiceKey ? '✓ Configured' : '✗ Missing');
  console.log('  - Overall:', isSupabaseConfigured() ? '✓ Ready' : '✗ Not configured');
};
