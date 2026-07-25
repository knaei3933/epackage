/**
 * Supabase SQL Execution Library
 *
 * Server-side SQL execution using Supabase Postgres RPC
 * This mimics the Supabase MCP executeSql tool interface for server-side use
 *
 * @module lib/supabase-sql
 */

import { createServiceClient } from '@/lib/supabase';

// MCP executeSql tool の戻り値型
export interface SqlResult<T = unknown> {
  data?: T[];
  error?: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  rowsAffected?: number;
}

/**
 * Execute raw SQL using Supabase Postgres connection
 * Server-side only - uses service role key to bypass RLS
 *
 * @param query SQL query string
 * @param params Query parameters array
 * @returns SqlResult<T>
 *
 * @example
 * ```ts
 * const result = await executeSql<{ id: string; name: string }>(
 *   'SELECT id, name FROM users WHERE id = $1',
 *   [userId]
 * )
 * if (result.error) throw new Error(result.error.message)
 * const users = result.data ?? []
 * ```
 */
export async function executeSql<T = unknown>(
  query: string,
  params: (string | number | boolean | null)[] = []
): Promise<SqlResult<T>> {
  try {
    const supabase = createServiceClient();

    // Use Postgres RPC to execute raw SQL
    // Note: This requires the execute_sql RPC function to exist in Supabase
    const { data, error, status } = await supabase.rpc('execute_sql', {
      sql_query: query,
      sql_params: params,
    }) as { data: T[] | null; error: { message: string; code?: string; details?: string; hint?: string } | null; status?: number };

    if (error) {
      console.error('[executeSql] SQL execution error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status,
      });

      return {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
      };
    }

    return {
      data: data ?? [],
      rowsAffected: Array.isArray(data) ? data.length : 0,
    };
  } catch (error) {
    console.error('[executeSql] Unexpected error:', error);

    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXECUTE_ERROR',
      },
    };
  }
}
