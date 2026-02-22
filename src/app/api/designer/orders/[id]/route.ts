/**
 * Designer Order Detail API
 *
 * Gets order details for correction work
 * - GET: Retrieve order details with items, files, and existing revisions
 * - Verifies designer is assigned to this order via designer_task_assignments
 *
 * @route /api/designer/orders/[id]
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { getAuthenticatedDesignerOrToken } from '@/lib/designer-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// =====================================================
// Types
// =====================================================

interface OrderDetailResponse {
  success: boolean;
  order?: {
    id: string;
    order_number: string;
    status: string;
    customer_name: string;
    customer_email: string;
    created_at: string;
    items: Array<{
      id: string;
      product_name: string;
      quantity: number;
      specifications: any;
    }>;
    files: Array<{
      id: string;
      file_name: string;
      file_url: string;
      file_type: string;
      uploaded_at: string;
    }>;
    revisions: Array<{
      id: string;
      revision_number: number;
      approval_status: string;
      comment_ko: string | null;
      comment_ja: string | null;
      translation_status: string;
      preview_image_url: string;
      original_file_url: string;
      created_at: string;
      uploaded_by_type: string;
      sku_name?: string;
    }>;
    assignment?: {
      id: string;
      status: string;
      assigned_at: string;
      notes: string | null;
    };
  };
  error?: string;
  errorEn?: string;
}

// =====================================================
// GET Handler - Get Order Details
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Designer Order Detail] GET request received');

    const { id: orderId } = await params;

    // Extract token from URL query parameter
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || undefined;

    // Authenticate using middleware OR token
    const authResult = await getAuthenticatedDesignerOrToken(request, orderId, token);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.errorKo || authResult.error || 'Authentication required',
          errorEn: authResult.error || 'Authentication required',
        },
        { status: 401 }
      );
    }

    const supabase = createAuthenticatedServiceClient({
      operation: 'get_designer_order_detail',
      userId: authResult.designerId!,
      route: '/api/designer/orders/[id]',
    });

    // 1. Get assignment details (already verified by getAuthenticatedDesignerOrToken)
    const { data: assignment, error: assignmentError } = await supabase
      .from('designer_task_assignments')
      .select('id, status, assigned_at, notes')
      .eq('designer_id', authResult.designerId!)
      .eq('order_id', orderId)
      .maybeSingle();

    // 2. Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, customer_name, customer_email, created_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // 3. Get order items in parallel with files
    const [itemsResult, filesResult, revisionsResult] = await Promise.all([
      supabase
        .from('order_items')
        .select('id, product_name, quantity, specifications')
        .eq('order_id', orderId),
      supabase
        .from('files')
        .select('id, file_name, file_url, file_type, created_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false }),
      supabase
        .from('design_revisions')
        .select('id, revision_number, approval_status, comment_ko, comment_ja, translation_status, preview_image_url, original_file_url, created_at, uploaded_by_type, order_item_id')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false }),
    ]);

    // 4. Build order items map for SKU lookup
    const orderItemsMap = new Map(
      (itemsResult.data || []).map(item => [item.id, item])
    );

    // 5. Transform revisions with SKU names
    const transformedRevisions = (revisionsResult.data || []).map((rev: any) => {
      let skuName = null;
      if (rev.order_item_id) {
        const item = orderItemsMap.get(rev.order_item_id);
        if (item) {
          skuName = `${item.product_name} (${item.quantity})`;
        }
      }
      return {
        ...rev,
        sku_name: skuName,
      };
    });

    const response: OrderDetailResponse = {
      success: true,
      order: {
        ...order,
        items: itemsResult.data || [],
        files: (filesResult.data || []).map((f: any) => ({
          id: f.id,
          file_name: f.file_name,
          file_url: f.file_url,
          file_type: f.file_type,
          uploaded_at: f.created_at,
        })),
        revisions: transformedRevisions,
        assignment: assignment ? {
          id: assignment.id,
          status: assignment.status,
          assigned_at: assignment.assigned_at,
          notes: assignment.notes,
        } : undefined,
      },
    };

    console.log('[Designer Order Detail] Returning order:', order.order_number);

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('[Designer Order Detail] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error', errorEn: 'Internal server error' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
