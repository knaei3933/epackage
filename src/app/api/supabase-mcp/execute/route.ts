/**
 * Supabase MCP Execute API Route
 *
 * Supabase MCP ToolsのAPIエンドポイント
 * クライアントサイドからSupabase MCPのexecuteSqlツールを呼び出すためのAPI
 *
 * POST /api/supabase-mcp/execute
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

interface ExecuteRequest {
  query: string
  params: (string | number | boolean | null)[]
}

/**
 * POST /api/supabase-mcp/execute
 * Supabase SQLを実行する
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json()

    const { query, params = [] } = body

    // バリデーション
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: { message: 'Query is required', code: 'INVALID_QUERY' } },
        { status: 400 }
      )
    }

    if (!Array.isArray(params)) {
      return NextResponse.json(
        { error: { message: 'Params must be an array', code: 'INVALID_PARAMS' } },
        { status: 400 }
      )
    }

    // Supabaseサービスクライアントを作成
    const supabase = createServiceClient()

    // SQLを実行（Supabase RPCを使用）
    const { data, error, count } = await supabase.rpc('execute_sql', {
      sql_query: query,
      sql_params: params,
    })

    if (error) {
      console.error('[Supabase MCP] SQL execution error:', error)

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
      )
    }

    // 成功レスポンス
    return NextResponse.json({
      data: Array.isArray(data) ? data : [data],
      rowsAffected: count || 0,
    })

  } catch (error) {
    console.error('[Supabase MCP] API error:', error)

    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'API_ERROR',
        },
      },
      { status: 500 }
    )
  }
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
