/**
 * API Route: Send Design Data to Korea
 *
 * 한국 파트너에게 디자인 데이터 전송 API
 * - AI 추출 데이터를 이메일 본문에 포함
 * - 파일 첨부 지원
 *
 * POST /api/b2b/korea/send-data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  sendKoreaDataTransferWithAttachments,
} from '@/lib/email';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Types
// ============================================================

interface SendDataToKoreaRequest {
  orderId: string;
  quotationNumber?: string;
  urgency?: 'normal' | 'urgent' | 'expedited';
  notes?: string;
  koreaEmail?: string;
}

interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

// ============================================================
// Constants
// ============================================================

const MAX_ATTACHMENTS = 20;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================================
// GET: Check Korea email configuration
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const koreaEmail = process.env.KOREA_PARTNER_EMAIL;

    return NextResponse.json({
      success: true,
      configured: !!koreaEmail,
      koreaEmail: koreaEmail ? koreaEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
      maxAttachments: MAX_ATTACHMENTS,
      maxTotalSize: MAX_TOTAL_SIZE,
    });
  } catch (error: any) {
    console.error('[Korea Send Data] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Send data to Korea
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SendDataToKoreaRequest = await request.json();

    const {
      orderId,
      quotationNumber,
      urgency = 'normal',
      notes,
      koreaEmail,
    } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order and quotation data from database
    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'send_data_to_korea',
      userId: user.id,
      route: '/api/b2b/korea/send-data',
    });

    // Fetch order with customer and items
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        customer_id,
        customer_name,
        customer_company,
        total_amount,
        estimated_delivery,
        quotation_id,
        quotations (
          id,
          quotation_number
        ),
        order_items (
          product_name,
          quantity
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle quotations relationship (array)
    const quotation = Array.isArray(order.quotations) && order.quotations.length > 0
      ? order.quotations[0]
      : null;

    // Fetch AI extracted data from design_revisions
    const { data: revisions, error: revisionsError } = await supabaseAdmin
      .from('design_revisions')
      .select('ai_extracted_data, korean_corrected_data')
      .eq('order_id', orderId)
      .order('revision_number', { ascending: false })
      .limit(1);

    // Fetch files attached to this order
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('id, original_filename, file_url, file_type, file_size_bytes')
      .eq('order_id', orderId)
      .eq('is_latest', true);

    if (filesError) {
      console.error('[Korea Send Data] Files fetch error:', filesError);
    }

    // Check attachment limits
    if (files && files.length > MAX_ATTACHMENTS) {
      return NextResponse.json(
        { success: false, error: `Too many files. Maximum ${MAX_ATTACHMENTS} attachments allowed.` },
        { status: 400 }
      );
    }

    const totalSize = files?.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0) || 0;
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { success: false, error: `Total file size exceeds ${MAX_TOTAL_SIZE / (1024 * 1024)}MB limit.` },
        { status: 400 }
      );
    }

    // Prepare AI extracted data
    const aiExtractedData = revisions?.[0]?.korean_corrected_data || revisions?.[0]?.ai_extracted_data || {};

    // Prepare file attachments
    const emailFiles: FileAttachment[] = files?.map((f) => ({
      fileName: f.original_filename,
      fileUrl: f.file_url,
      fileType: f.file_type || 'UNKNOWN',
      fileSize: f.file_size_bytes || 0,
    })) || [];

    // Prepare items list
    const items = order.order_items?.map((item: any) => ({
      productName: item.product_name,
      quantity: item.quantity,
    })) || [];

    // Send email with file attachments
    const attachmentData = files?.map((f) => ({
      filename: f.original_filename,
      href: f.file_url, // Use public URL for Supabase Storage files
    })) || [];

    const emailResult = await sendKoreaDataTransferWithAttachments(
      {
        orderId: order.order_number || order.id,
        quotationNumber: quotationNumber || quotation?.quotation_number || 'N/A',
        customerName: order.customer_name || '고객',
        customerCompany: order.customer_company || undefined,
        items,
        aiExtractedData,
        files: emailFiles,
        notes,
        urgency,
      },
      attachmentData,
      koreaEmail
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log the send action
    try {
      await supabaseAdmin.from('korea_transfer_log').insert({
        order_id: orderId,
        sent_by: user.id,
        sent_to: koreaEmail || process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com',
        files_count: files?.length || 0,
        urgency,
        message_id: emailResult.messageId,
        status: 'sent',
      });
    } catch (logErr) {
      console.error('[Korea Send Data] Log insert error:', logErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl,
        filesCount: files?.length || 0,
        urgency,
      },
    });
  } catch (error: any) {
    console.error('[Korea Send Data] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
