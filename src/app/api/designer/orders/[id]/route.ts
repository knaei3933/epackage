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
import { createServerClient } from '@supabase/ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// =====================================================
// Helper: Get authenticated designer info
// =====================================================

interface DesignerAuth {
  userId: string;
  role: string;
  status: string;
  email: string;
}

async function getAuthenticatedDesigner(request: NextRequest): Promise<DesignerAuth | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const roleFromMiddleware = request.headers.get('x-user-role');
  const statusFromMiddleware = request.headers.get('x-user-status');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && roleFromMiddleware && isFromMiddleware) {
    // Verify it's a KOREA_DESIGNER role
    if (roleFromMiddleware !== 'KOREA_DESIGNER') {
      return null;
    }

    return {
      userId: userIdFromMiddleware,
      role: roleFromMiddleware,
      status: statusFromMiddleware || 'ACTIVE',
      email: '', // Will be fetched from profile if needed
    };
  }

  // Fallback to SSR client auth
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
    console.error('[Designer Order Detail] Auth error:', authError);
    return null;
  }

  // Get user profile to check role
  const supabaseAdmin = createAuthenticatedServiceClient({
    operation: 'get_designer_profile',
    userId: user.id,
    route: '/api/designer/orders/[id]',
  });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role, status, email')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'KOREA_DESIGNER') {
    console.error('[Designer Order Detail] Profile error or not a designer:', profileError);
    return null;
  }

  return {
    userId: user.id,
    role: profile.role,
    status: profile.status || 'ACTIVE',
    email: profile.email || user.email || '',
  };
}

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

    const designer = await getAuthenticatedDesigner(request);

    if (!designer) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Designer access required', errorEn: 'Unauthorized - Designer access required' },
        { status: 401 }
      );
    }

    if (designer.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Account is not active', errorEn: 'Account is not active' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    const supabase = createAuthenticatedServiceClient({
      operation: 'get_designer_order_detail',
      userId: designer.userId,
      route: '/api/designer/orders/[id]',
    });

    // 1. Check if designer is assigned to this order
    const { data: assignment, error: assignmentError } = await supabase
      .from('designer_task_assignments')
      .select('id, status, assigned_at, notes')
      .eq('designer_id', designer.userId)
      .eq('order_id', orderId)
      .maybeSingle();

    // If not assigned via designer_task_assignments, fall back to checking designer email list
    // This maintains backward compatibility during transition
    let isAuthorized = !!assignment;

    if (!isAuthorized) {
      // Fallback: Check if user email is in korea_designer_emails list
      const { data: setting } = await supabase
        .from('notification_settings')
        .select('value')
        .eq('key', 'korea_designer_emails')
        .maybeSingle();

      const designerEmails = (setting?.value as string[]) || [];
      isAuthorized = designer.email && designerEmails.includes(designer.email);

      // Also check if order status is correction-related
      if (isAuthorized) {
        const { data: orderStatusCheck } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        isAuthorized = orderStatusCheck?.status &&
          ['CORRECTION_IN_PROGRESS', 'CUSTOMER_APPROVAL_PENDING'].includes(orderStatusCheck.status);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Not assigned to this order', errorEn: 'Not assigned to this order' },
        { status: 403 }
      );
    }

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
