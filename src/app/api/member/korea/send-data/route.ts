/**
 * API Route: Send Design Data to Korea
 *
 * 韓国パートナーへのデザインデータ送信API
 * - AI抽出データをメール本文に含む
 * - ファイル添付対応
 *
 * POST /api/member/korea/send-data
 *
 * Migrated from /api/b2b/korea/send-data
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import {
  sendKoreaDataTransferWithAttachments,
} from '@/lib/email';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { notifyKoreaDataTransfer } from '@/lib/admin-notifications';

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
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Korea Send Data] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Korea Send Data] Auth error:', authError);
    return null;
  }

  return user.id;
}

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
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
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

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'send_data_to_korea',
      userId: userId,
      route: '/api/member/korea/send-data',
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
        customerName: order.customer_name || 'お客様',
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
        sent_by: userId,
        sent_to: koreaEmail || process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com',
        files_count: files?.length || 0,
        urgency,
        message_id: emailResult.messageId,
        status: 'sent',
      });

      // Send admin notification for Korea transfer
      await notifyKoreaDataTransfer(
        orderId,
        order.order_number,
        quotationNumber || quotation?.quotation_number || 'N/A',
        koreaEmail || process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com'
      );
    } catch (logErr) {
      console.error('[Korea Send Data] Log/Notification error:', logErr);
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
