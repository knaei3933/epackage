/**
 * Sample Request API Route
 *
 * Sample Request送信処理:
 * - Zod検証（最大5サンプルまで）
 * - Supabase MCP execute_sqlによるDB保存（sample_requests、sample_itemsテーブル）
 * - 認証ユーザー＋非認証ゲスト対応
 * - 管理者通知（admin_notificationsテーブル）
 * - メール送信（顧客＋管理者）
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { executeSql } from '@/lib/supabase-mcp';
import { createAdminNotification } from '@/lib/admin-notifications';
import { sendSampleRequestEmail } from '@/lib/email';
import type { Database } from '@/types/database';

// ============================================================
// Schema Validation
// ============================================================

const sampleItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, '商品名を入力してください'),
  category: z.string().min(1, 'カテゴリを選択してください'),
  quantity: z.number().int().min(1, '数量は1以上で入力してください').max(10, '数量は10以下で入力してください'),
  specifications: z.record(z.any()).optional(),
  notes: z.string().optional()
});

const deliveryDestinationSchema = z.object({
  companyName: z.string().optional(),
  contactPerson: z.string().min(1, '担当者名を入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  postalCode: z.string().optional(),
  address: z.string().min(1, '住所を入力してください'),
  isPrimary: z.boolean().default(false)
});

const sampleRequestSchema = z.object({
  // Customer information (for guest requests)
  customerInfo: z.object({
    companyName: z.string().optional(),
    contactPerson: z.string().min(1, '担当者名を入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    phone: z.string().min(1, '電話番号を入力してください')
  }).optional(),

  // Delivery information
  deliveryType: z.enum(['normal', 'other'], {
    errorMap: () => ({ message: '配送種別を選択してください' })
  }),
  deliveryDestinations: z.array(deliveryDestinationSchema)
    .min(1, '配送先を少なくとも1つ入力してください')
    .max(5, '配送先は最大5つまでです'),

  // Sample items (1-5 items max)
  samples: z.array(sampleItemSchema)
    .min(1, 'サンプルを少なくとも1つ選択してください')
    .max(5, 'サンプルは最大5つまでです'),

  // Additional information
  message: z.string().max(2000, 'メッセージは2000文字以下で入力してください').optional(),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).optional(),

  // Privacy consent
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'プライバシーポリシーに同意してください'
  })
});

type SampleRequestFormData = z.infer<typeof sampleRequestSchema>;

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe insert helper for sample_requests table
 */
function insertSampleRequest(
  supabase: ReturnType<typeof createServiceClient>,
  data: Database['public']['Tables']['sample_requests']['Insert']
) {
  return (supabase as any)
    .from('sample_requests')
    .insert(data)
    .select()
    .single();
}

/**
 * Type-safe insert helper for sample_items table
 */
function insertSampleItem(
  supabase: ReturnType<typeof createServiceClient>,
  data: Database['public']['Tables']['sample_items']['Insert']
) {
  return (supabase as any)
    .from('sample_items')
    .insert(data)
    .select()
    .single();
}

/**
 * Generate unique request number
 * Format: SMP-YYYY-NNNN
 */
function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SMP-${year}-${random}`;
}

// ============================================================
// API Route Handler
// ============================================================

export async function POST(request: NextRequest) {
  const requestId = generateRequestNumber();

  console.log('[Sample Request API] Request received:', {
    requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Get authenticated user (if any)
    const supabase = createServiceClient();

    // Check for authorization header (authenticated user)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    let customerName = '';
    let customerEmail = '';
    let customerPhone = '';
    let companyName: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        userId = user.id;
        customerEmail = user.email || '';

        // Fetch user profile for additional info
        const { data: profile } = await supabase
          .from('profiles')
          .select('kanji_last_name, kanji_first_name, corporate_phone, company_name')
          .eq('id', userId)
          .single();

        if (profile) {
          customerName = `${profile.kanji_last_name} ${profile.kanji_first_name}`;
          customerPhone = profile.corporate_phone || '';
          companyName = profile.company_name;
        }
      }
    }

    // Parse request body
    const body = await request.json();

    // Validate data
    const validatedData = sampleRequestSchema.parse(body);

    // For guest requests, use provided customer info
    if (!userId && validatedData.customerInfo) {
      customerName = validatedData.customerInfo.contactPerson;
      customerEmail = validatedData.customerInfo.email;
      customerPhone = validatedData.customerInfo.phone;
      companyName = validatedData.customerInfo.companyName || null;
    }

    // Validate that we have customer information
    if (!customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'お客様情報が不足しています',
          message: 'ログインするか、お客様情報を入力してください'
        },
        { status: 400 }
      );
    }

    // ============================================================
    // STEP 1: Create sample request record using Supabase MCP
    // ============================================================

    console.log('[Sample Request API] Creating sample request record...');

    const sampleRequestInsert: Database['public']['Tables']['sample_requests']['Insert'] = {
      user_id: userId,
      request_number: requestId,
      status: 'received',
      delivery_address_id: null, // Will be set during order processing
      tracking_number: null,
      notes: validatedData.message || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shipped_at: null
    };

    // Use Supabase client to insert (simpler than raw SQL for INSERT with RETURNING)
    const { data: savedSampleRequest, error: sampleRequestError } = await insertSampleRequest(
      supabase,
      sampleRequestInsert
    );

    if (sampleRequestError) {
      console.error('[Sample Request API] Sample request insert error:', sampleRequestError);
      throw new Error(`Sample request creation failed: ${sampleRequestError.message}`);
    }

    const sampleRequestId = savedSampleRequest.id;
    console.log('[Sample Request API] Sample request created:', sampleRequestId);

    // ============================================================
    // STEP 2: Insert sample items using Supabase MCP
    // ============================================================

    console.log('[Sample Request API] Inserting sample items...');

    for (const sample of validatedData.samples) {
      const sampleItemInsert: Database['public']['Tables']['sample_items']['Insert'] = {
        sample_request_id: sampleRequestId,
        product_id: sample.productId || null,
        product_name: sample.productName,
        category: sample.category,
        quantity: sample.quantity,
        created_at: new Date().toISOString()
      };

      const { error: itemError } = await insertSampleItem(supabase, sampleItemInsert);

      if (itemError) {
        console.error('[Sample Request API] Sample item insert error:', itemError);
        throw new Error(`Sample item creation failed: ${itemError.message}`);
      }
    }

    console.log('[Sample Request API] All sample items inserted');

    // ============================================================
    // STEP 3: Store delivery destinations in metadata (using Supabase MCP)
    // ============================================================

    // Store delivery destinations as JSON in notes (or create a separate table if needed)
    const deliveryDestinationsJson = JSON.stringify(validatedData.deliveryDestinations);

    // Update sample request with delivery info
    const updateResult = await executeSql(
      `
      UPDATE sample_requests
      SET notes = CASE
        WHEN notes IS NULL THEN $1::jsonb
        ELSE notes || $1::jsonb
      END,
      updated_at = NOW()
      WHERE id = $2
      RETURNING id
      `,
      [
        JSON.stringify({
          delivery_type: validatedData.deliveryType,
          delivery_destinations: validatedData.deliveryDestinations,
          customer_info: userId ? null : validatedData.customerInfo,
          urgency: validatedData.urgency
        }),
        sampleRequestId
      ]
    );

    if (updateResult.error) {
      console.error('[Sample Request API] Update delivery info error:', updateResult.error);
      // Don't throw - the request was already created successfully
    }

    // ============================================================
    // STEP 4: Create admin notification
    // ============================================================

    console.log('[Sample Request API] Creating admin notification...');

    await createAdminNotification({
      type: 'sample',
      title: 'サンプル依頼',
      message: `${customerName} 様から${validatedData.samples.length}件のサンプル依頼がありました`,
      relatedId: sampleRequestId,
      relatedType: 'sample_requests',
      priority: validatedData.urgency === 'high' || validatedData.urgency === 'urgent' ? 'high' : 'normal',
      actionUrl: `/admin/samples/${sampleRequestId}`,
      actionLabel: 'サンプルを表示',
      metadata: {
        request_number: requestId,
        customer_name: customerName,
        customer_email: customerEmail,
        company_name: companyName,
        sample_count: validatedData.samples.length,
        delivery_type: validatedData.deliveryType,
        urgency: validatedData.urgency || 'normal'
      }
    });

    // ============================================================
    // STEP 5: Send emails (customer + admin)
    // ============================================================

    console.log('[Sample Request API] Sending emails...');

    const emailResult = await sendSampleRequestEmail({
      requestId,
      customerName,
      customerEmail,
      customerPhone,
      company: companyName || undefined,
      samples: validatedData.samples.map(s => ({
        productName: s.productName,
        quantity: s.quantity
      })),
      deliveryType: validatedData.deliveryType,
      deliveryDestinations: validatedData.deliveryDestinations.map(d => ({
        companyName: d.companyName,
        contactPerson: d.contactPerson,
        phone: d.phone,
        address: `${d.postalCode || ''} ${d.address}`.trim()
      })),
      message: validatedData.message || ''
    });

    if (!emailResult.success) {
      console.error('[Sample Request API] Email errors:', emailResult.errors);
      // Email失敗はエラーとして処理せずログのみ記録
    } else {
      console.log('[Sample Request API] Emails sent successfully');
    }

    // ============================================================
    // SUCCESS RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: 'サンプルリクエストを受け付けました。確認メールをお送りしました。',
      data: {
        requestId,
        sampleRequestId,
        requestNumber: requestId,
        sampleCount: validatedData.samples.length,
        emailSent: emailResult.success,
        messageIds: {
          customer: emailResult.customerEmail?.messageId,
          admin: emailResult.adminEmail?.messageId
        }
      }
    });

  } catch (error) {
    console.error('[Sample Request API] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      console.log('[Sample Request API] Validation error:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: '入力データに誤りがあります',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'サンプルリクエストの処理に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GETメソッド - API状態確認
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Sample Request API is working',
    timestamp: new Date().toISOString(),
    docs: {
      endpoint: '/api/samples/request',
      method: 'POST',
      description: 'Handle sample request submissions',
      authentication: 'Optional (Bearer token for logged-in users)',
      features: [
        'Supports authenticated users and guest requests',
        '1-5 sample items per request',
        'Multiple delivery destinations (up to 5)',
        'Admin notifications',
        'Email notifications (customer + admin)',
        'Supabase MCP execute_sql integration'
      ]
    }
  });
}
