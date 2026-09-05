/**
 * Contact Form API Route
 *
 * Contact Form送信処理:
 * - Zod検証
 * - DB保存（inquiriesテーブル）
 * - SendGridメール送信（顧客＋管理者）
 */

export const dynamic = 'force-dynamic';

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

function generateSampleRequestNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SMP-${year}-${random}`;
}

/**
 * Create the normalized sample-request records consumed by the office label
 * agent, then enqueue immediate printing. `/samples` intentionally posts the
 * simple public form to this API, so sample inquiries must be bridged here.
 */
async function createSampleLabelPipeline(
  supabase: ReturnType<typeof createServiceClient>,
  inquiryId: string,
  data: ContactFormData
): Promise<{ requestNumber: string; sampleRequestId: string }> {
  const supabaseAny = supabase as any;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const requestNumber = generateSampleRequestNumber();

    const { data: savedRequest, error: requestError } = await supabaseAny
      .from('sample_requests')
      .insert({
        request_number: requestNumber,
        status: 'received',
        notes: data.message || 'パウチサンプルセットをご依頼いたします。',
      })
      .select('id')
      .single();

    if (requestError) {
      lastError = requestError.message;
      // 23505: unique request_number collision; retry with a new number.
      if (requestError.code === '23505') continue;
      throw new Error(`Sample request creation failed: ${requestError.message}`);
    }

    const sampleRequestId = savedRequest.id as string;

    const { error: itemError } = await supabaseAny
      .from('sample_items')
      .insert({
        sample_request_id: sampleRequestId,
        product_name: 'パウチサンプルセット',
        category: 'standup-pouch',
        quantity: 1,
      });

    if (itemError) {
      await supabaseAny.from('sample_requests').delete().eq('id', sampleRequestId);
      throw new Error(`Sample item creation failed: ${itemError.message}`);
    }

    const { data: savedDestination, error: destinationError } = await supabaseAny
      .from('sample_request_destinations')
      .insert({
        sample_request_id: sampleRequestId,
        company_name: data.company || null,
        contact_person: `${data.kanjiLastName} ${data.kanjiFirstName}`,
        phone: data.phone,
        postal_code: data.postalCode || null,
        address: data.address,
      })
      .select('id')
      .single();

    if (destinationError) {
      await supabaseAny.from('sample_requests').delete().eq('id', sampleRequestId);
      throw new Error(`Sample destination creation failed: ${destinationError.message}`);
    }

    const destinationId = savedDestination.id as string;

    const { error: printError } = await supabaseAny
      .from('label_prints')
      .insert({ destination_id: destinationId, source: 'batch' });
    if (printError) {
      await supabaseAny.from('sample_requests').delete().eq('id', sampleRequestId);
      throw new Error(`Label job creation failed: ${printError.message}`);
    }

    return { requestNumber, sampleRequestId };
  }

  throw new Error(`Sample request creation failed: ${lastError || 'request number collision'}`);
}

async function linkInquiryToSampleRequest(
  supabase: ReturnType<typeof createServiceClient>,
  inquiryId: string,
  requestNumber: string
): Promise<void> {
  const { error } = await (supabase as any)
    .from('inquiries')
    .update({ request_number: requestNumber })
    .eq('id', inquiryId);
  if (error) {
    console.error('[Contact API] Failed to link inquiry to sample request:', error);
  }
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

  // Address (optional) - single address field from ContactForm
  postalCode: z.string().optional(),
  address: z.string().optional(),

  // Inquiry details
  inquiryType: z.enum(['product', 'quotation', 'sample', 'order', 'other'], {
    errorMap: () => ({ message: 'お問い合わせ種類を選択してください' })
  }),
  subject: z.string().optional(), // Generated by ContactForm
  message: z.string().optional(), // Message is optional for sample requests (default provided by form)
  urgency: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  preferredContact: z.string().optional(),

  // Privacy consent (optional for guest inquiries)
  privacyConsent: z.boolean().optional()
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

    if (validatedData.inquiryType === 'sample' && (!validatedData.postalCode?.trim() || !validatedData.address?.trim())) {
      return NextResponse.json({
        success: false,
        error: '入力データに誤りがあります',
        message: 'サンプル発送のため、郵便番号と住所を入力してください',
      }, { status: 400 });
    }

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
      prefecture: null, // ContactForm sends single address field
      city: null, // ContactForm sends single address field
      street: validatedData.address || null, // Map address to street column
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

    let labelRequestNumber: string | null = null;
    if (validatedData.inquiryType === 'sample') {
      const labelPipeline = await createSampleLabelPipeline(
        supabase,
        savedInquiry.id,
        validatedData
      );
      await linkInquiryToSampleRequest(supabase, savedInquiry.id, labelPipeline.requestNumber);
      labelRequestNumber = labelPipeline.requestNumber;
      console.log('[Contact API] Sample label job created:', labelPipeline);
    }

    // Send emails
    console.log('[Contact API] Sending emails...');
    const emailResult = await sendContactEmail({
      name: customerName,
      nameKana: customerNameKana,
      email: validatedData.email,
      company: validatedData.company,
      inquiryType: validatedData.inquiryType,
      subject: validatedData.subject,
      message: validatedData.message,
      urgency: validatedData.urgency,
      preferredContact: validatedData.preferredContact,
      phone: validatedData.phone,
      fax: validatedData.fax,
      postalCode: validatedData.postalCode,
      address: validatedData.address,
      requestId
    });

    if (!emailResult.success) {
      console.error('[Contact API] Email errors:', emailResult.errors);
      // Email失敗はエラーとして処理せずログのみ記録
      // DBは既に保存済みのため成功レスポンス
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
        sampleRequestNumber: labelRequestNumber,
        labelQueued: Boolean(labelRequestNumber),
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
 * GETメソッド - API状態確認
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Contact API is working',
    timestamp: new Date().toISOString()
  });
}
