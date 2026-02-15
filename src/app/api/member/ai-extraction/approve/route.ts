/**
 * Member AI Extraction Approval API
 *
 * メンバーAI抽出承認API
 * Handles approval of extracted data for production
 *
 * @route POST /api/member/ai-extraction/approve
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'

// ============================================================
// Validation Schema
// ============================================================

const approveDataSchema = z.object({
  file_id: z.string().min(1, 'ファイルIDは必須です'),
  approved_data: z.object({
    dimensions: z.object({
      width_mm: z.number(),
      height_mm: z.number(),
      gusset_mm: z.number().optional(),
    }),
    materials: z.object({
      raw: z.string(),
      layers: z.array(z.object({
        type: z.string(),
        thickness_microns: z.number(),
        position: z.number(),
      })),
      total_thickness_microns: z.number(),
    }),
    options: z.object({
      zipper: z.boolean(),
      zipper_type: z.string().optional(),
      notch: z.string(),
      corner_round: z.string(),
      hang_hole: z.boolean(),
      hang_hole_type: z.string().optional(),
    }),
    colors: z.object({
      mode: z.string(),
      front_colors: z.array(z.object({
        name: z.string(),
        cmyk: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      })),
      back_colors: z.array(z.object({
        name: z.string(),
        cmyk: z.tuple([z.number(), z.number(), z.number(), z.number()]),
      })).optional(),
      color_stations: z.number(),
    }),
    design_elements: z.object({
      logos: z.array(z.object({
        position: z.string(),
        size: z.string(),
      })),
      text: z.array(z.object({
        content: z.string(),
        font: z.string(),
        size: z.string(),
      })),
      graphics: z.array(z.object({
        type: z.string(),
        description: z.string(),
      })),
    }),
    print_specifications: z.object({
      resolution_dpi: z.number(),
      color_mode: z.string(),
      bleed_mm: z.number(),
      print_type: z.string(),
    }),
    notes: z.string().optional(),
  }),
  create_work_order: z.boolean().default(false),
  notes: z.string().optional(),
})

type ApproveDataRequest = z.infer<typeof approveDataSchema>

// ============================================================
// POST Handler - Approve Extracted Data
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = approveDataSchema.parse(body)

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
      console.log('[AI Extraction Approve] Using user ID from middleware:', userId)
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
      console.log('[AI Extraction Approve] Authenticated user:', userId)
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, role, company_id')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: { code: 'PROFILE_NOT_FOUND', message: 'ユーザープロフィールが見つかりません' } },
        { status: 404 }
      )
    }

    // Fetch file with production data
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select(`
        *,
        production_data (*)
      `)
      .eq('id', validatedData.file_id)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: { code: 'FILE_NOT_FOUND', message: 'ファイルが見つかりません' } },
        { status: 404 }
      )
    }

    // Verify order ownership
    const order = await supabase
      .from('orders')
      .select('id, user_id, status, quotation_id')
      .eq('id', file.order_id)
      .single()

    if (!order || (order as any).user_id !== profile.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'このファイルにアクセスする権限がありません' } },
        { status: 403 }
      )
    }

    // Get production data
    const productionData = (file as any).production_data?.[0]

    if (!productionData) {
      return NextResponse.json(
        { error: { code: 'PROD_DATA_NOT_FOUND', message: '生産データが見つかりません' } },
        { status: 404 }
      )
    }

    // Update production data with approved data
    const { data: updatedData, error: updateError } = await supabase
      .from('production_data')
      .update({
        specifications: validatedData.approved_data,
        validation_status: 'VALID',
        approved_for_production: true,
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
        approval_notes: validatedData.notes,
        extracted_data: validatedData.approved_data,
      })
      .eq('id', productionData.id)
      .select()
      .single()

    if (updateError || !updatedData) {
      console.error('Production data update error:', updateError)
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'データの更新に失敗しました' } },
        { status: 500 }
      )
    }

    // Update order status to DATA_RECEIVED if needed
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'DATA_RECEIVED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', file.order_id)

    if (orderUpdateError) {
      console.error('Order status update error:', orderUpdateError)
    }

    // Create work order if requested
    let workOrderId = null
    if (validatedData.create_work_order) {
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .insert({
          order_id: file.order_id,
          quotation_id: (order as any).quotation_id || null,
          title: `作業標準書 - ${new Date().toLocaleDateString('ja-JP')}`,
          version: '1.0',
          status: 'GENERATED',
          specifications: validatedData.approved_data,
          production_flow: {
            steps: [
              { name: 'デザイン確認', status: 'pending' },
              { name: '材料準備', status: 'pending' },
              { name: '印刷', status: 'pending' },
              { name: 'ラミネート', status: 'pending' },
              { name: 'スリット', status: 'pending' },
              { name: '製袋', status: 'pending' },
              { name: '検査', status: 'pending' },
            ],
          },
          generated_by: profile.id,
        })
        .select()
        .single()

      if (!workOrderError && workOrder) {
        workOrderId = workOrder.id

        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'WORK_ORDER' })
          .eq('id', file.order_id)
      }
    }

    // Send notifications (non-blocking)
    sendApprovalNotifications(file.order_id, profile, updatedData).catch((err) => {
      console.error('Notification error:', err)
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          production_data_id: updatedData.id,
          work_order_id: workOrderId,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: profile.id,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Approval error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'リクエストデータが無効です',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '予期しないエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// ============================================================
// Notification Function
// ============================================================

/**
 * Send approval notifications to admin and customer
 */
async function sendApprovalNotifications(
  orderId: string,
  profile: any,
  productionData: any
): Promise<void> {
  // TODO: Implement email notifications
  console.log(`[Approval] Order ${orderId} data approved by ${profile.id}`)
}
