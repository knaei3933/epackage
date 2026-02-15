/**
 * Member AI Extraction Status API
 *
 * メンバーAI抽出ステータスAPI
 * Returns the current status of AI extraction
 *
 * @route GET /api/member/ai-extraction/status?file_id={fileId}
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ============================================================
// GET Handler - Check Extraction Status
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileId = searchParams.get('file_id')

    if (!fileId) {
      return NextResponse.json(
        { error: { code: 'MISSING_FILE_ID', message: 'ファイルIDがありません' } },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const response = NextResponse.json({ success: false })
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options })
        },
      },
    })

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id')
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware'

    let userId: string

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware
      console.log('[AI Extraction Status] Using user ID from middleware:', userId)
    } else {
      // Fallback to SSR client auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: '認証されていません' } },
          { status: 401 }
        )
      }
      userId = user.id
      console.log('[AI Extraction Status] Authenticated user:', userId)
    }

    // Fetch file record with extraction data
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select(`
        *,
        production_data (*)
      `)
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: { code: 'FILE_NOT_FOUND', message: 'ファイルが見つかりません' } },
        { status: 404 }
      )
    }

    // Get production data for this file
    const productionData = (file as any).production_data?.[0]

    if (!productionData) {
      return NextResponse.json(
        {
          success: true,
          data: {
            file_id: fileId,
            status: 'pending' as const,
            progress: 0,
            current_step: 'ファイルの検証中...',
          },
        },
        { status: 200 }
      )
    }

    // Map validation status to extraction status
    let extractionStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_revision' = 'pending'
    let progress = 0
    let currentStep = ''

    switch (productionData.validation_status) {
      case 'PENDING':
        extractionStatus = 'processing'
        progress = 0.1
        currentStep = 'AI抽出を開始...'
        break
      case 'VALID':
        extractionStatus = 'completed'
        progress = 1.0
        currentStep = '完了'
        break
      case 'INVALID':
        extractionStatus = 'failed'
        progress = 0.9
        currentStep = '検証エラー'
        break
      case 'NEEDS_REVISION':
        extractionStatus = 'needs_revision'
        progress = 0.9
        currentStep = '修正が必要'
        break
    }

    // Parse extracted data and validation errors
    const extractedData = productionData.extracted_data as any
    const validationErrors = productionData.validation_errors as any

    // Calculate progress based on validation status
    if (extractionStatus === 'completed' && extractedData) {
      progress = 1.0
    } else if (extractionStatus === 'failed' || extractionStatus === 'needs_revision') {
      progress = 0.9
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          file_id: fileId,
          status: extractionStatus,
          progress,
          current_step: currentStep,
          extracted_data: extractedData,
          validation_errors: validationErrors,
          warnings: extractedData?.warnings || [],
          confidence_score: productionData.confidence_score,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'ステータスの取得に失敗しました' } },
      { status: 500 }
    )
  }
}
