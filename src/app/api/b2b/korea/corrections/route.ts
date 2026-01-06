/**
 * API Route: Korea Corrections Management
 *
 * 한국 파트너 수정사항 처리 API
 * - GET: 수정사항 목록 조회
 * - POST: 새 수정사항 등록
 * - PATCH: 수정사항 상태 업데이트
 *
 * /api/b2b/korea/corrections
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendKoreaCorrectionNotificationEmail } from '@/lib/email';
import { createRecipient } from '@/lib/email-templates';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Types
// ============================================================

interface CreateCorrectionRequest {
  orderId: string;
  quotationId?: string;
  correctionSource?: 'email' | 'phone' | 'portal' | 'manual';
  correctionReference?: string;
  issueDescription: string;
  issueCategory?: string;
  urgency?: 'normal' | 'urgent' | 'expedited';
  correctedData?: Record<string, any>;
  correctionNotes?: string;
}

interface UpdateCorrectionRequest {
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  adminNotes?: string;
  correctedFiles?: string[];
  customerNotified?: boolean;
}

// ============================================================
// GET: List corrections
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { searchParams } = new URL(request.url);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'list_corrections',
      userId: user.id,
      route: '/api/b2b/korea/corrections',
    });

    let query = supabaseAdmin
      .from('korea_corrections')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name,
          customer_company
        ),
        quotations (
          id,
          quotation_number
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (urgency) {
      query = query.eq('urgency', urgency);
    }

    const { data: corrections, error } = await query;

    if (error) {
      console.error('[Korea Corrections] GET error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Get count
    const { count } = await supabaseAdmin
      .from('korea_corrections')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: corrections || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error: any) {
    console.error('[Korea Corrections] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Create new correction
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateCorrectionRequest = await request.json();

    const {
      orderId,
      quotationId,
      correctionSource = 'email',
      correctionReference,
      issueDescription,
      issueCategory,
      urgency = 'normal',
      correctedData = {},
      correctionNotes,
    } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!issueDescription) {
      return NextResponse.json(
        { success: false, error: 'Issue description is required' },
        { status: 400 }
      );
    }

    // Verify order exists
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'create_correction',
      userId: user.id,
      route: '/api/b2b/korea/corrections',
    });

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, customer_id, customer_name')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create correction record
    const { data: correction, error: insertError } = await supabaseAdmin
      .from('korea_corrections')
      .insert({
        order_id: orderId,
        quotation_id: quotationId || null,
        correction_source: correctionSource,
        correction_reference: correctionReference,
        issue_description: issueDescription,
        issue_category: issueCategory,
        urgency,
        corrected_data: correctedData,
        correction_notes: correctionNotes,
        assigned_to: user.id,
      })
      .select()
      .single();

    if (insertError || !correction) {
      console.error('[Korea Corrections] POST error:', insertError);
      return NextResponse.json(
        { success: false, error: insertError?.message || 'Failed to create correction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: correction,
    });
  } catch (error: any) {
    console.error('[Korea Corrections] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Update correction
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { correctionId, ...updates } = body;

    if (!correctionId) {
      return NextResponse.json(
        { success: false, error: 'Correction ID is required' },
        { status: 400 }
      );
    }

    // Update correction
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'update_correction',
      userId: user.id,
      route: '/api/b2b/korea/corrections',
    });

    const { data: correction, error: updateError } = await supabaseAdmin
      .from('korea_corrections')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        ...(updates.status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', correctionId)
      .select()
      .single();

    if (updateError || !correction) {
      console.error('[Korea Corrections] PATCH error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError?.message || 'Failed to update correction' },
        { status: 500 }
      );
    }

    // If status changed to completed and customer not notified, send notification
    if (updates.status === 'completed' && !correction.customer_notified) {
      try {
        // Get order details
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('id, order_number, customer_id, customer_name, customer_email, customer_company')
          .eq('id', correction.order_id)
          .single();

        if (order?.customer_email) {
          // Prepare corrected files for email
          const correctedFiles = (correction.corrected_files || []).map((url: string) => ({
            fileName: url.split('/').pop() || 'file',
            fileUrl: url,
          }));

          // Send notification email
          const emailResult = await sendKoreaCorrectionNotificationEmail(
            {
              orderId: order.id,
              orderNumber: order.order_number,
              correctionDescription: correction.issue_description,
              correctedFiles,
              correctionDate: new Date().toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              notes: correction.admin_notes,
              recipient: createRecipient(order.customer_name, order.customer_email, order.customer_company),
            }
          );

          if (emailResult.success) {
            // Update customer_notified flag
            await supabaseAdmin
              .from('korea_corrections')
              .update({
                customer_notified: true,
                customer_notification_date: new Date().toISOString(),
              })
              .eq('id', correctionId);

            console.log('[Korea Corrections] Customer notification sent:', {
              correctionId,
              customerEmail: order.customer_email,
              messageId: emailResult.messageId,
            });
          } else {
            console.error('[Korea Corrections] Failed to send customer notification:', emailResult.error);
          }
        } else {
          console.warn('[Korea Corrections] No customer email found for order:', order?.id);
        }
      } catch (emailError: any) {
        console.error('[Korea Corrections] Email notification error:', emailError);
        // Don't fail the request if email fails, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      data: correction,
    });
  } catch (error: any) {
    console.error('[Korea Corrections] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
