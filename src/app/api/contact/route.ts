/**
 * Contact Form API Route
 *
 * Contact Form 제출 처리:
 * - Zod validation
 * - DB 저장 (inquiries 테이블)
 * - SendGrid 이메일 발송 (고객 + 관리자)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendContactEmail } from '@/lib/email';
import type { Database } from '@/types/database';
import { withRateLimit, createApiRateLimiter } from '@/lib/rate-limiter';

// Rate limiter instance for contact API (10 requests per 15 minutes)
const contactRateLimiter = createApiRateLimiter();

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe insert helper for inquiries table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertInquiry(
  supabase: ReturnType<typeof createServiceClient>,
  data: Database['public']['Tables']['inquiries']['Insert']
) {
  return (supabase as any)
    .from('inquiries')
    .insert(data)
    .select()
    .single();
}

// ============================================================
// Schema Validation
// ============================================================

const contactFormSchema = z.object({
  // Name fields
  kanjiLastName: z.string().min(1, '姓を入力してください'),
  kanjiFirstName: z.string().min(1, '名を入力してください'),
  kanaLastName: z.string().min(1, 'セイを入力してください'),
  kanaFirstName: z.string().min(1, 'メイを入力してください'),

  // Contact information
  company: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  fax: z.string().optional(),

  // Address (optional)
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),

  // Inquiry details
  inquiryType: z.enum(['product', 'quotation', 'sample', 'order', 'billing', 'other', 'general', 'technical', 'sales', 'support'], {
    errorMap: () => ({ message: 'お問い合わせ種類を選択してください' })
  }),
  subject: z.string().min(1, '件名を入力してください'),
  message: z.string().min(10, 'お問い合わせ内容を10文字以上で入力してください'),
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  preferredContact: z.string().optional(),

  // Privacy consent
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'プライバシーポリシーに同意してください'
  })
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// =====================================================
// API Route Handler
// =====================================================

/**
 * Contact form POST handler with rate limiting
 */
async function handleContactPost(request: NextRequest): Promise<NextResponse> {
  const requestId = `CTC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log('[Contact API] Request received:', {
    requestId,
    timestamp: new Date().toISOString()
  });

  try {
    // Parse request body
    const body = await request.json();

    // Validate data
    const validatedData = contactFormSchema.parse(body);

    // Build customer name
    const customerName = `${validatedData.kanjiLastName} ${validatedData.kanjiFirstName}`;
    const customerNameKana = `${validatedData.kanaLastName} ${validatedData.kanaFirstName}`;

    // Prepare database record
    // Note: Database column is 'type' (not 'inquiry_type')
    const inquiryRecord: Database['public']['Tables']['inquiries']['Insert'] = {
      user_id: null, // External request (no logged-in user)
      inquiry_number: requestId, // Primary inquiry number
      request_number: requestId, // Human-readable request number
      type: validatedData.inquiryType as Database['public']['Tables']['inquiries']['Row']['type'],
      customer_name: customerName,
      customer_name_kana: customerNameKana,
      company_name: validatedData.company || null,
      email: validatedData.email,
      phone: validatedData.phone,
      fax: validatedData.fax || null,
      postal_code: validatedData.postalCode || null,
      prefecture: validatedData.prefecture || null,
      city: validatedData.city || null,
      street: validatedData.street || null,
      subject: validatedData.subject,
      message: validatedData.message,
      response: null, // No response yet for new inquiry
      urgency: (validatedData.urgency || 'normal') as Database['public']['Tables']['inquiries']['Row']['urgency'],
      preferred_contact: validatedData.preferredContact || null,
      privacy_consent: validatedData.privacyConsent,
      status: 'pending' as Database['public']['Tables']['inquiries']['Row']['status'],
      admin_notes: null,
      responded_at: null
    };

    // Save to database
    console.log('[Contact API] Saving to database...');
    const supabase = createServiceClient();

    const { data: savedInquiry, error: dbError } = await insertInquiry(supabase, inquiryRecord);

    if (dbError) {
      console.error('[Contact API] Database error:', dbError);
      throw new Error(`Database save failed: ${dbError.message}`);
    }

    console.log('[Contact API] Saved to database:', savedInquiry?.id);

    // Send emails
    console.log('[Contact API] Sending emails...');
    const emailResult = await sendContactEmail({
      name: customerName,
      email: validatedData.email,
      company: validatedData.company,
      inquiryType: validatedData.inquiryType,
      subject: validatedData.subject,
      message: validatedData.message,
      urgency: validatedData.urgency,
      preferredContact: validatedData.preferredContact,
      requestId
    });

    if (!emailResult.success) {
      console.error('[Contact API] Email errors:', emailResult.errors);
      // Email 실패는 에러로 처리하지 않고 로그만 남김
      // DB는 이미 저장되었으므로 성공 응답
    } else {
      console.log('[Contact API] Emails sent successfully:', {
        customer: emailResult.customerEmail?.messageId,
        admin: emailResult.adminEmail?.messageId
      });
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'お問い合わせを受け付けました。確認メールをお送りしました。',
      data: {
        requestId,
        inquiryId: savedInquiry?.id,
        emailSent: emailResult.success,
        messageIds: {
          customer: emailResult.customerEmail?.messageId,
          admin: emailResult.adminEmail?.messageId
        }
      }
    });

  } catch (error) {
    console.error('[Contact API] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      console.log('[Contact API] Validation error:', error.errors);
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
        error: 'お問い合わせの処理に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Export POST handler with rate limiting wrapper
 */
export const POST = withRateLimit(handleContactPost, contactRateLimiter);

/**
 * GET 메서드 - API 상태 확인
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Contact API is working',
    timestamp: new Date().toISOString()
  });
}
