/**
 * B2B AI Extraction Upload API
 *
 * B2B AI抽出アップロードAPI
 * Handles file upload and initiates AI extraction
 *
 * @route POST /api/b2b/ai-extraction/upload
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getPerformanceMonitor } from '@/lib/performance-monitor'

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000,
  enableLogging: true,
})

// ============================================================
// Security Constants
// ============================================================

// Maximum file size: 10MB (reduced from 50MB for security)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Magic numbers (file signatures) for security validation
const FILE_MAGIC_NUMBERS: Record<string, RegExp> = {
  pdf: /^%PDF-/,
  ai: /%(AI|Adobe)/,
  psd: /^8BPS/,
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validate file by magic number (file signature)
 * Prevents files with misleading extensions from being uploaded
 */
function validateFileByMagicNumber(buffer: Buffer, expectedType: string): boolean {
  const header = buffer.slice(0, 1024).toString('ascii')

  if (expectedType === 'pdf') return FILE_MAGIC_NUMBERS.pdf.test(header)
  if (expectedType === 'ai') return FILE_MAGIC_NUMBERS.ai.test(header)
  if (expectedType === 'psd') return FILE_MAGIC_NUMBERS.psd.test(header)

  // For unknown type, accept any valid format
  return (
    FILE_MAGIC_NUMBERS.pdf.test(header) ||
    FILE_MAGIC_NUMBERS.ai.test(header) ||
    FILE_MAGIC_NUMBERS.psd.test(header)
  )
}

// ============================================================
// POST Handler - Upload File
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('order_id') as string
    const dataType = formData.get('data_type') as string || 'design_file'

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: { code: 'MISSING_FILE', message: 'ファイルがありません' } },
        { status: 400 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { error: { code: 'MISSING_ORDER_ID', message: '注文IDがありません' } },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: 'FILE_TOO_LARGE',
            message: `ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください`
          }
        },
        { status: 413 }
      )
    }

    // Validate file type (extension)
    if (!file.name.endsWith('.ai') && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE_TYPE', message: '.ai/.pdfファイルのみアップロード可能です' } },
        { status: 400 }
      )
    }

    // Convert to buffer for magic number validation
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Magic Number validation (file signature check)
    const fileType = file.name.endsWith('.pdf') ? 'pdf' : 'ai'
    if (!validateFileByMagicNumber(buffer, fileType)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_FILE_CONTENT',
            message: `ファイル内容が期待された形式(${fileType})と一致しません。ファイルが破損しているか、拡張子が間違っています。`
          }
        },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '認証されていません' } },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, role, company_id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: { code: 'PROFILE_NOT_FOUND', message: 'ユーザープロフィールが見つかりません' } },
        { status: 404 }
      )
    }

    // Verify order ownership
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id, company_id, status')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json(
        { error: { code: 'ORDER_NOT_FOUND', message: '注文が見つかりません' } },
        { status: 404 }
      )
    }

    if (order.user_id !== profile.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'この注文にアクセスする権限がありません' } },
        { status: 403 }
      )
    }

    // Generate file ID
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Upload file to Supabase Storage (use buffer)
    const fileName = `${orderId}/${fileId}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('design-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError || !uploadData) {
      console.error('File upload error:', uploadError)
      return NextResponse.json(
        { error: { code: 'UPLOAD_FAILED', message: 'ファイルのアップロードに失敗しました' } },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('design-files')
      .getPublicUrl(fileName)

    // Create file record in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .insert({
        id: fileId,
        order_id: orderId,
        uploaded_by: profile.id,
        file_type: 'AI',
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        version: 1,
        is_latest: true,
        validation_status: 'PENDING',
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (fileError || !fileRecord) {
      console.error('File record creation error:', fileError)
      // Clean up uploaded file
      await supabase.storage.from('design-files').remove([fileName])
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'ファイル記録の作成に失敗しました' } },
        { status: 500 }
      )
    }

    // Create production_data record
    const { data: productionData, error: prodError } = await supabase
      .from('production_data')
      .insert({
        order_id: orderId,
        file_id: fileId,
        data_type: dataType,
        title: `デザインファイル: ${file.name}`,
        version: '1.0',
        validation_status: 'PENDING',
        received_at: new Date().toISOString(),
        submitted_by_customer: true,
        // AI extraction fields - will be populated by extraction service
        extracted_data: null,
        confidence_score: null,
        extraction_metadata: null,
      })
      .select()
      .single()

    if (prodError || !productionData) {
      console.error('Production data creation error:', prodError)
    }

    // Trigger AI extraction (non-blocking)
    triggerAIExtraction(fileId, orderId, fileName).catch((err) => {
      console.error('AI extraction trigger error:', err)
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          file_id: fileId,
          production_data_id: productionData?.id,
          status: 'processing' as const,
          uploaded_at: new Date().toISOString(),
          file_url: urlData.publicUrl,
          estimated_completion: new Date(Date.now() + 60000).toISOString(), // 1 minute estimate
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '予期しないエラーが発生しました' } },
      { status: 500 }
    )
  } finally {
    // Track AI extraction upload API execution time
    const duration = Date.now() - startTime
    perfMonitor.trackQuery(`POST /api/b2b/ai-extraction/upload`, duration)
  }
}

// ============================================================
// AI Extraction Trigger
// ============================================================

/**
 * Trigger AI extraction for uploaded file
 * This would typically call a background job or queue system
 */
async function triggerAIExtraction(
  fileId: string,
  orderId: string,
  fileName: string
): Promise<void> {
  // TODO: Implement actual AI extraction integration
  // This could be:
  // 1. A background job queue (e.g., Bull, Agenda)
  // 2. A serverless function
  // 3. A separate microservice

  console.log(`[AI Extraction] Triggered for file ${fileName} (ID: ${fileId})`)

  // Mock extraction for now - in production, this would:
  // 1. Convert .ai to PDF/PNG
  // 2. Call AI vision API (e.g., GPT-4 Vision, Claude Vision, Google Cloud Vision)
  // 3. Parse extracted data
  // 4. Validate and store results

  // Simulate async processing
  await new Promise((resolve) => setTimeout(resolve, 3000))
}
