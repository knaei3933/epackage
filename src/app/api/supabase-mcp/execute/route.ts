/**
 * Supabase MCP Execute API Route (SECURE)
 *
 * Supabase MCP ToolsのAPIエンドポイント
 * クライアントサイドからSupabase MCPのexecuteSqlツールを呼び出すためのAPI
 *
 * SECURITY: Admin authentication required for all requests
 * SECURITY: Dangerous SQL keywords are filtered
 * SECURITY: All SQL executions are logged for audit
 *
 * POST /api/supabase-mcp/execute
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyAdminAuth } from '@/lib/auth-helpers'
import { validateDevModeSafety } from '@/lib/env-validation'

interface ExecuteRequest {
  query: string
  params: (string | number | boolean | null)[]
}

/**
 * Dangerous SQL keywords that should never be allowed
 */
const DANGEROUS_SQL_KEYWORDS = [
  'DROP',
  'DELETE',
  'TRUNCATE',
  'ALTER',
  'GRANT',
  'REVOKE',
  'CREATE',
  'INSERT',
  'UPDATE',
  'EXECUTE',
  'SCRIPT',
  'EXEC',
] as const;

/**
 * SQL injection patterns to detect
 */
const INJECTION_PATTERNS = [
  /--/,           // SQL comments
  /\/\*/,         // Multi-line comment start
  /\*\//,         // Multi-line comment end
  /;\s*DROP/i,    // DROP after semicolon
  /;\s*DELETE/i,  // DELETE after semicolon
  /;\s*ALTER/i,   // ALTER after semicolon
] as const;

/**
 * POST /api/supabase-mcp/execute
 * Supabase SQLを実行する（SECURE - Admin Authentication Required）
 */
export async function POST(request: NextRequest) {
  // ==================== SECURITY LAYER 1: Environment Validation ====================
  try {
    validateDevModeSafety();
  } catch (error) {
    console.error('[MCP] Environment validation failed:', error);
    return NextResponse.json(
      { error: { message: 'Server configuration error', code: 'CONFIG_ERROR' } },
      { status: 500 }
    );
  }

  // ==================== SECURITY LAYER 2: Authentication ====================
  const authResult = await verifyAdminAuth(request);

  if (!authResult) {
    console.warn('[MCP] Unauthorized access attempt');

    return NextResponse.json(
      { error: { message: 'Admin authentication required', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  // ==================== SECURITY LAYER 3: Request Parsing ====================
  let body: ExecuteRequest;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Invalid JSON body', code: 'INVALID_JSON' } },
      { status: 400 }
    );
  }

  const { query, params = [] } = body;

  // ==================== SECURITY LAYER 4: Query Validation ====================

  // 4.1 Basic validation
  if (!query || typeof query !== 'string') {
    return NextResponse.json(
      { error: { message: 'Query is required', code: 'INVALID_QUERY' } },
      { status: 400 }
    );
  }

  if (!Array.isArray(params)) {
    return NextResponse.json(
      { error: { message: 'Params must be an array', code: 'INVALID_PARAMS' } },
      { status: 400 }
    );
  }

  // 4.2 Query length limit
  if (query.length > 10000) {
    console.warn('[MCP] Query too long:', {
      userId: authResult.userId,
      length: query.length,
    });

    return NextResponse.json(
      { error: { message: 'Query too long (max 10000 characters)', code: 'QUERY_TOO_LONG' } },
      { status: 400 }
    );
  }

  // 4.3 Dangerous keyword detection
  const upperQuery = query.toUpperCase();

  for (const keyword of DANGEROUS_SQL_KEYWORDS) {
    if (upperQuery.includes(keyword)) {
      console.warn('[MCP] Dangerous SQL keyword detected:', {
        userId: authResult.userId,
        role: authResult.role,
        keyword,
        queryPreview: query.substring(0, 100),
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          error: {
            message: `Dangerous SQL keyword not allowed: ${keyword}`,
            code: 'DANGEROUS_SQL',
          },
        },
        { status: 403 }
      );
    }
  }

  // 4.4 Injection pattern detection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(query)) {
      console.warn('[MCP] SQL injection pattern detected:', {
        userId: authResult.userId,
        pattern: pattern.source,
        queryPreview: query.substring(0, 100),
      });

      return NextResponse.json(
        {
          error: {
            message: 'Invalid SQL pattern detected',
            code: 'INVALID_SQL_PATTERN',
          },
        },
        { status: 403 }
      );
    }
  }

  // ==================== SECURITY LAYER 5: SQL Execution ====================
  const supabase = createServiceClient();

  const startTime = Date.now();

  const { data, error, count } = await supabase.rpc('execute_sql', {
    sql_query: query,
    sql_params: params,
  });

  const executionTime = Date.now() - startTime;

  // ==================== SECURITY LAYER 6: Audit Logging ====================
  console.log('[MCP] SQL execution audit:', {
    userId: authResult.userId,
    role: authResult.role,
    isDevMode: authResult.isDevMode,
    queryLength: query.length,
    paramCount: params.length,
    executionTimeMs: executionTime,
    success: !error,
    errorCode: error?.code,
    timestamp: new Date().toISOString(),
  });

  // ==================== ERROR HANDLING ====================
  if (error) {
    console.error('[MCP] SQL execution error:', {
      userId: authResult.userId,
      code: error.code,
      message: error.message,
    });

    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code || 'SQL_ERROR',
          details: error.details,
          hint: error.hint,
        },
      },
      { status: 400 }
    );
  }

  // ==================== SUCCESS RESPONSE ====================
  return NextResponse.json({
    data: Array.isArray(data) ? data : [data],
    rowsAffected: count || 0,
    executionTimeMs: executionTime,
  });
}

/**
 * GET /api/supabase-mcp/execute
 * メソッド不許可
 */
export async function GET() {
  return NextResponse.json(
    { error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' } },
    { status: 405 }
  )
}
