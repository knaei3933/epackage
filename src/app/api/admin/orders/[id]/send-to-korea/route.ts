/**
 * Send Design Data to Korea Partner API
 *
 * デザインデータ韓国送付API
 * - AI抽出データを取得してメール本文に記載
 * - 原本デザインファイルを添付
 * - design@epackage-lab.com → info@package-lab.com
 *
 * @route /api/admin/orders/[id]/send-to-korea
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendKoreaDataTransferWithAttachments } from '@/lib/email';

// =====================================================
// Environment Variables
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// =====================================================
// Types
// =====================================================

interface SendToKoreaResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

// =====================================================
// POST Handler - Send to Korea
// =====================================================

/**
 * POST /api/admin/orders/[id]/send-to-korea
 * Send design data with AI extraction to Korea partner
 *
 * Request Body:
 * - notes: Optional additional notes for Korea partner
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Design data sent to Korea",
 *   "messageId": "...",
 *   "previewUrl": "..." // Development only
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です。', errorEn: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    // 2. Get order details with files
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        created_at,
        items,
        quotation_id,
        files (
          id,
          file_type,
          original_filename,
          file_url,
          file_path,
          ai_extraction_data
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // 3. Get AI extraction data from files
    const files = order.files || [];
    const designFiles = files.filter((f: any) =>
      ['AI', 'PDF', 'PSD'].includes(f.file_type)
    );

    if (designFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'デザインファイルが見つかりません。',
          errorEn: 'No design files found',
          hint: 'AI、PDF、PSDファイルを先にアップロードしてください'
        },
        { status: 400 }
      );
    }

    // 4. Aggregate AI extraction data
    const aiExtractedData = {
      specifications: {} as Record<string, any>,
      printing: {} as Record<string, any>,
      design: {} as Record<string, any>,
    };

    designFiles.forEach((file: any) => {
      if (file.ai_extraction_data) {
        Object.assign(aiExtractedData.specifications, file.ai_extraction_data.specifications);
        Object.assign(aiExtractedData.printing, file.ai_extraction_data.printing);
        Object.assign(aiExtractedData.design, file.ai_extraction_data.design);
      }
    });

    // 5. Parse order items for product details
    const items = order.items || [];
    const firstItem = items[0] || {};
    const specs = firstItem.specifications || {};

    // 6. Prepare email data
    const emailData = {
      orderId: order.id,
      quotationNumber: order.order_number,
      companyName: order.customer_name || 'お客様',
      customerName: order.customer_name || 'お客様',
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone || '',
      orderDate: order.created_at,
      aiExtractedData: {
        // Specifications
        bagType: specs.bagTypeId || '-',
        dimensions: specs.dimensions || `${specs.width || 0}×${specs.height || 0}${specs.depth ? `×${specs.depth}` : ''}`,
        material: specs.materialId || '-',
        thickness: specs.thicknessSelection || '-',

        // Printing
        printingType: specs.printingType || '-',
        colorMode: specs.printingColors ? `${specs.printingColors}色` : '-',
        colors: specs.printingColors || 0,

        // Design
        productName: firstItem.productName || '-',
        hasLogo: specs.hasLogo || false,
        hasBarcode: specs.hasBarcode || false,
      },
      notes: '', // Will be filled from request body
    };

    // 7. Get notes from request body
    const body = await request.json().catch(() => ({}));
    emailData.notes = body.notes || '';

    // 8. Prepare file attachments
    // For now, we'll use public URLs. In production, you might want to download files
    const attachmentData = designFiles.map((file: any) => ({
      filename: file.original_filename,
      href: file.file_url,
    }));

    // 9. Send email to Korea partner
    const result = await sendKoreaDataTransferWithAttachments(
      emailData,
      attachmentData,
      process.env.KOREA_PARTNER_EMAIL || 'info@package-lab.com'
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: '韓国送付メールの送信に失敗しました。',
          errorEn: 'Failed to send Korea email',
          details: result.error
        },
        { status: 500 }
      );
    }

    // 10. Log the action to order history
    await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        action: 'sent_to_korea',
        description: 'デザインデータを韓国パートナーに送信',
        performed_by: user.id,
        metadata: {
          messageId: result.messageId,
          filesSent: designFiles.length,
        }
      });

    // 11. Update order stage
    await supabase
      .from('orders')
      .update({
        current_stage: 'DATA_TO_KR',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    const response: SendToKoreaResponse = {
      success: true,
      message: 'デザインデータを韓国パートナーに送信しました。',
      messageId: result.messageId,
    };

    if (result.previewUrl) {
      response.previewUrl = result.previewUrl;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Send to Korea] Error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
