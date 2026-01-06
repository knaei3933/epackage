/**
 * Sample Request API Route
 *
 * Sample Request 제출 처리:
 * - Zod validation
 * - DB 저장 (sample_requests + sample_items 테이블)
 * - SendGrid 이메일 발송 (고객 + 관리자)
 * - 인증된 사용자 지원 (Next.js 16 pattern: await cookies())
 *
 * Updated: Transaction-safe sample request creation using PostgreSQL RPC function
 * - Replaced manual operations with ACID transaction
 * - Automatic rollback if items creation fails
 * - Support for authenticated users (user.id from profile) and guest requests (null)
 */

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
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
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabaseAuth = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

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
    // Create Sample Request Using Transaction-Safe RPC Function
    // =====================================================
    // All operations wrapped in ACID transaction:
    // 1. Create sample_requests record
    // 2. Create sample_items records (1-5 items)
    //
    // If items creation fails, the request record is automatically rolled back

    // Prepare sample items JSONB for RPC function
    const sampleItemsJson = validatedData.sampleItems.map((item) => ({
      productId: item.productId || null,
      productName: item.productName,
      productCategory: item.productCategory || 'other',
      quantity: item.quantity
    }));

    console.log('[Sample API] Creating sample request with transaction...');

    // RPC call with typed parameters - pass user_id (authenticated) or null (guest)
    // Note: Parameters reordered to match function signature (required params first, then optional)
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('create_sample_request_transaction', {
      p_notes: validatedData.message,
      p_sample_items: sampleItemsJson,
      p_user_id: userId,  // Authenticated user ID or null for guest requests
      p_request_number: requestId
    });

    if (rpcError) {
      console.error('[Sample API] RPC Error creating sample request:', rpcError);
      throw new Error(`Failed to create sample request: ${rpcError.message}`);
    }

    // Check RPC function result
    if (!rpcResult || rpcResult.length === 0) {
      throw new Error('Unknown error creating sample request');
    }

    const result = rpcResult[0] as SampleRequestRPCResult;

    // Handle failure case
    if (!result.success || !result.sample_request_id) {
      throw new Error(result.error_message || 'Failed to create sample request');
    }

    console.log('[Sample API] Sample request created successfully:', {
      sampleRequestId: result.sample_request_id,
      requestNumber: result.request_number,
      itemsCreated: result.items_created
    });

    // =====================================================
    // Send Emails (non-transactional, failure logged but doesn't affect request)
    // =====================================================

    // Prepare email data
    const emailData = {
      requestId: result.request_number,
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
      // Email 실패는 에러로 처리하지 않고 로그만 남김
      // DB는 이미 저장되었으므로 성공 응답
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
      result.sample_request_id,
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
      requestId: result.request_number,
      sampleRequestId: result.sample_request_id,
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
        requestId: result.request_number,
        sampleRequestId: result.sample_request_id,
        sampleItemsCount: result.items_created,
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
 * GET 메서드 - API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Sample Request API is working',
    timestamp: new Date().toISOString()
  });
}
