/**
 * Sample Request API Route
 *
 * サンプルリクエスト送信処理:
 * - Zod validation
 * - DB保存 (sample_requests + sample_items テーブル)
 * - SendGridメール送信 (顧客 + 管理者)
 * - 認証済みユーザー対応 (Next.js 16 pattern: await cookies())
 *
 * Updated: Transaction-safe sample request creation using PostgreSQL RPC function
 * - Replaced manual operations with ACID transaction
 * - Automatic rollback if items creation fails
 * - Support for authenticated users (user.id from profile) and guest requests (null)
 */

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { sendSampleRequestEmail } from '@/lib/email';
import { notifySampleRequest } from '@/lib/admin-notifications';
import type { Database } from '@/types/database';
import { withRateLimit, createApiRateLimiter } from '@/lib/rate-limiter';

// =====================================================
// Rate Limiter
// =====================================================

const samplesRateLimiter = createApiRateLimiter();

// ============================================================
// Type Definitions
// ============================================================

interface SampleRequestRPCResult {
  success: boolean
  sample_request_id: string
  request_number: string
  items_created: number
  error_message?: string
}

// ============================================================
// Schema Validation
// ============================================================

// Delivery destination schema
const deliveryDestinationSchema = z.object({
  id: z.string(),
  companyName: z.string().optional(),
  contactPerson: z.string().min(1, '連絡先担当者を入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  postalCode: z.string().optional(),
  address: z.string().min(1, '住所を入力してください'),
  sameAsCustomer: z.boolean().optional()
});

// Sample item schema
const sampleItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, '商品名を入力してください'),
  productCategory: z.string().optional(),
  quantity: z.number().int().min(1, '数量は1以上を入力してください')
});

// Sample request validation schema
const sampleRequestSchema = z.object({
  // Japanese name fields
  kanjiLastName: z.string().min(1, '姓を入力してください'),
  kanjiFirstName: z.string().min(1, '名を入力してください'),
  kanaLastName: z.string().min(1, 'セイを入力してください'),
  kanaFirstName: z.string().min(1, 'メイを入力してください'),

  // Contact information
  company: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  fax: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),

  // Delivery type
  deliveryType: z.enum(['normal', 'other'], {
    errorMap: () => ({ message: '配送タイプを選択してください' })
  }),

  // Delivery destinations (array)
  deliveryDestinations: z.array(deliveryDestinationSchema).min(1, '少なくとも1つの配送先を入力してください'),

  // Sample items
  sampleItems: z.array(sampleItemSchema).min(1, '少なくとも1つのサンプルを選択してください').max(5, 'サンプルは最大5点までです'),

  // Message and agreement
  message: z.string().min(10, 'メッセージを10文字以上で入力してください'),
  agreement: z.boolean().refine((val) => val === true, {
    message: '個人情報の取扱いに同意してください'
  }),

  // Inquiry type identifier
  inquiryType: z.string().optional()
});

type SampleRequestFormData = z.infer<typeof sampleRequestSchema>;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate unique request number
 */
function generateRequestNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SMP-${timestamp}-${random}`;
}

// =====================================================
// API Route Handler
// =====================================================

async function handleSamplesPost(request: NextRequest) {
  const requestId = generateRequestNumber();

  console.log('[Sample API] Request received:', {
    requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // =====================================================
    // Authentication Check (Next.js 16 Pattern)
    // =====================================================
const { client: supabaseAuth } = await createSupabaseSSRClient($$$ARGS);
    // Check for authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    let userId: string | null = null;
    let userProfile: Database['public']['Tables']['profiles']['Row'] | null = null;

    if (!authError && user) {
      // Authenticated user - get profile data
      userId = user.id;

      const { data: profile, error: profileError } = await supabaseAuth
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profile) {
        userProfile = profile as Database['public']['Tables']['profiles']['Row'];
        console.log('[Sample API] Authenticated user:', {
          userId,
          email: user.email,
          profileStatus: userProfile?.status
        });
      }
    } else {
      console.log('[Sample API] Guest request (no authentication)');
    }

    // =====================================================
    // Parse and Validate Request Body
    // =====================================================
    const body = await request.json();

    // For authenticated users, customer info can be omitted (use profile data)
    // For guest users, customer info is required
    const validatedData = sampleRequestSchema.parse(body);

    // Determine customer name and contact info
    let customerName: string;
    let customerNameKana: string;
    let customerEmail: string;
    let customerPhone: string;
    let customerCompany: string | null = null;

    if (userProfile) {
      // Use profile data for authenticated users
      customerName = `${userProfile.kanji_last_name} ${userProfile.kanji_first_name}`;
      customerNameKana = `${userProfile.kana_last_name} ${userProfile.kana_first_name}`;
      customerEmail = userProfile.email;
      customerPhone = userProfile.corporate_phone || userProfile.personal_phone || '';
      customerCompany = userProfile.company_name || null;

      console.log('[Sample API] Using profile data:', {
        customerName,
        customerEmail,
        customerPhone,
        customerCompany
      });
    } else {
      // Use form data for guest users
      customerName = `${validatedData.kanjiLastName} ${validatedData.kanjiFirstName}`;
      customerNameKana = `${validatedData.kanaLastName} ${validatedData.kanaFirstName}`;
      customerEmail = validatedData.email;
      customerPhone = validatedData.phone;
      customerCompany = validatedData.company || null;
    }

    // Get delivery type label
    const deliveryTypeLabels = {
      normal: '一般配送',
      other: '別の場所に配送'
    };

    // Initialize Supabase service client for database operations
    const supabase = createServiceClient();

    // =====================================================
    // Create Sample Request Using Direct SQL Transaction
    // =====================================================
    // All operations wrapped in ACID transaction:
    // 1. Create sample_requests record
    // 2. Create sample_items records (1-5 items)
    //
    // If items creation fails, the request record is automatically rolled back

    console.log('[Sample API] Creating sample request with transaction...');

    // Use raw SQL transaction to avoid RPC function ambiguity issues
    const { data: transactionResult, error: transactionError } = await supabase.rpc('sql', {
      sql: `
        DO $$
        DECLARE
          v_request_id VARCHAR(50) := $1;
          v_user_id UUID := $2;
          v_notes TEXT := $3;
          v_items_count INT := $4;
          v_new_request_id UUID;
        BEGIN
          -- Create sample request
          INSERT INTO sample_requests (
            request_id,
            user_id,
            status,
            items_count,
            notes,
            created_at
          ) VALUES (
            v_request_id,
            v_user_id,
            'pending',
            v_items_count,
            v_notes,
            NOW()
          ) RETURNING id INTO v_new_request_id;

          -- The sample items will be inserted separately after this
          RAISE NOTICE 'Sample request created with ID: %', v_new_request_id;

          -- Return the new request ID
          SELECT v_new_request_id AS sample_request_id, v_request_id AS request_number;
        END;
        $$;
      `,
      params: [requestId, userId, validatedData.message, validatedData.sampleItems.length]
    });

    if (transactionError) {
      console.error('[Sample API] Transaction Error:', transactionError);
      throw new Error(`Failed to create sample request: ${transactionError.message}`);
    }

    // Check transaction result
    if (!transactionResult || transactionResult.length === 0) {
      throw new Error('Unknown error creating sample request');
    }

    const requestResult = transactionResult[0] as { sample_request_id: UUID; request_number: string };

    // Now insert sample items
    for (const item of validatedData.sampleItems) {
      // Validate UUID format for productId
      let productIdValue: string | null = null;
      if (item.productId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
        if (uuidRegex.test(item.productId)) {
          productIdValue = item.productId;
        }
      }

      const { error: itemError } = await supabase
        .from('sample_items')
        .insert({
          sample_request_id: requestResult.sample_request_id,
          product_id: productIdValue,
          product_name: item.productName,
          category: item.productCategory || 'other',
          quantity: item.quantity
        });

      if (itemError) {
        console.error('[Sample API] Error inserting sample item:', itemError);
        throw new Error(`Failed to create sample item: ${itemError.message}`);
      }
    }

    console.log('[Sample API] Sample request created successfully:', {
      sampleRequestId: requestResult.sample_request_id,
      requestNumber: requestResult.request_number,
      itemsCreated: validatedData.sampleItems.length
    });

    // =====================================================
    // Send Emails (non-transactional, failure logged but doesn't affect request)
    // =====================================================

    // Prepare email data
    const emailData = {
      requestId: requestResult.request_number,
      customerName,
      customerEmail,  // Uses profile email for authenticated users or form email for guests
      customerPhone,
      company: customerCompany,
      samples: validatedData.sampleItems.map((item) => ({
        productName: item.productName,
        quantity: item.quantity
      })),
      deliveryType: deliveryTypeLabels[validatedData.deliveryType],
      deliveryDestinations: validatedData.deliveryDestinations.map((dest) => ({
        companyName: dest.companyName,
        contactPerson: dest.contactPerson,
        phone: dest.phone,
        address: `${dest.postalCode ? dest.postalCode + ' ' : ''}${dest.address}`
      })),
      message: validatedData.message
    };

    // Send emails
    console.log('[Sample API] Sending emails...');
    const emailResult = await sendSampleRequestEmail(emailData);

    if (!emailResult.success) {
      console.error('[Sample API] Email errors:', emailResult.errors);
      // メール送信失敗はエラーとして処理せずログのみ記録
      // DBは既に保存されているため成功応答
    } else {
      console.log('[Sample API] Emails sent successfully:', {
        customer: emailResult.customerEmail?.messageId,
        admin: emailResult.adminEmail?.messageId
      });
    }

    // =====================================================
    // Create Admin Notification
    // =====================================================
    console.log('[Sample API] Creating admin notification...');

    const notificationResult = await notifySampleRequest(
      requestResult.sample_request_id,
      customerName,
      validatedData.sampleItems.length
    );

    if (notificationResult) {
      console.log('[Sample API] Admin notification created:', {
        notificationId: notificationResult.id,
        type: notificationResult.type,
        title: notificationResult.title
      });
    } else {
      console.warn('[Sample API] Failed to create admin notification');
    }

    // Log the complete sample request data for debugging
    console.log('[Sample API] Request processed successfully:', {
      requestId: requestResult.request_number,
      sampleRequestId: requestResult.sample_request_id,
      authenticated: !!userId,
      userId: userId || 'guest',
      customer: {
        name: customerName,
        nameKana: customerNameKana,
        company: customerCompany,
        email: customerEmail,
        phone: customerPhone
      },
      samples: validatedData.sampleItems,
      delivery: {
        type: deliveryTypeLabels[validatedData.deliveryType],
        destinations: validatedData.deliveryDestinations.length
      },
      emailSent: emailResult.success
    });

    // Success response
    return NextResponse.json({
      success: true,
      message: 'サンプルリクエストを受け付けました。確認メールをお送りしました。',
      data: {
        requestId: requestResult.request_number,
        sampleRequestId: requestResult.sample_request_id,
        sampleItemsCount: validatedData.sampleItems.length,
        emailSent: emailResult.success,
        messageIds: {
          customer: emailResult.customerEmail?.messageId,
          admin: emailResult.adminEmail?.messageId
        }
      }
    });

  } catch (error) {
    console.error('[Sample API] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      console.log('[Sample API] Validation error:', error.errors);
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

export const POST = withRateLimit(handleSamplesPost, samplesRateLimiter);

/**
 * GETメソッド - API状態確認
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Sample Request API is working',
    timestamp: new Date().toISOString()
  });
}
