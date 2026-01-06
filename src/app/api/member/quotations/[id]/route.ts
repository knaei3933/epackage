/**
 * Quotation Detail API (Member Portal)
 *
 * Task #104: Get quotation detail by ID
 * - GET: Fetch single quotation with items
 * - PATCH: Update quotation (DRAFT status only)
 * - DELETE: Delete quotation (DRAFT status only)
 *
 * All DB operations via Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Helper function to get authenticated user ID from request
 * Supports both cookie-based auth and DEV_MODE header from middleware
 */
async function getAuthenticatedUserId(request: NextRequest): Promise<{ userId: string; supabase: any } | null> {
  const cookieStore = await cookies();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          const cookie = cookieStore.get(key);
          return cookie?.value ?? null;
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        },
        removeItem: (key: string) => {
          cookieStore.delete(key);
        },
      },
    },
  });

  // Check for DEV_MODE header from middleware
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (isDevMode && devModeUserId) {
    // DEV_MODE: Use header from middleware
    console.log('[Quotation Detail API] DEV_MODE: Using x-user-id header:', devModeUserId);
    return { userId: devModeUserId, supabase };
  }

  // Normal auth: Use cookie-based auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return null;
  }

  return { userId: user.id, supabase };
}

/**
 * Helper function to create authenticated Supabase client
 * @deprecated Use getAuthenticatedUserId instead for better DEV_MODE support
 */
async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          const cookie = cookieStore.get(key);
          return cookie?.value ?? null;
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        },
        removeItem: (key: string) => {
          cookieStore.delete(key);
        },
      },
    },
  });
}

/**
 * GET /api/member/quotations/[id]
 * Get quotation detail by ID
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "quotation": { ... }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUserId(request);

    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, supabase } = authResult;
    const quotationId = params.id;

    // Fetch quotation with items
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `)
      .eq('id', quotationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '見積が見つかりません。', errorEn: 'Quotation not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      quotation: {
        ...quotation,
        items: quotation.quotation_items || [],
      },
    });
  } catch (error) {
    console.error('[Quotation Detail API] Error:', error);
    return NextResponse.json(
      {
        error: '見積の取得に失敗しました。',
        errorEn: 'Failed to fetch quotation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/member/quotations/[id]
 * Update quotation (DRAFT status only)
 *
 * Request Body:
 * {
 *   "customer_name": "string" (optional),
 *   "customer_email": "string" (optional),
 *   "customer_phone": "string | null" (optional),
 *   "notes": "string | null" (optional),
 *   "valid_until": "ISO date string | null" (optional),
 *   "items": [...]
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUserId(request);

    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, supabase } = authResult;
    const quotationId = params.id;
    const body = await request.json();

    // First, check if quotation exists and belongs to user
    const { data: existingQuotation, error: fetchError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '見積が見つかりません。', errorEn: 'Quotation not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Check if quotation is in DRAFT status
    if (existingQuotation.status !== 'DRAFT') {
      return NextResponse.json(
        {
          error: 'ドラフト状態の見積のみ編集できます。',
          errorEn: 'Only DRAFT quotations can be modified'
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updates: Record<string, any> = {};
    if (body.customer_name) updates.customer_name = body.customer_name;
    if (body.customer_email) updates.customer_email = body.customer_email;
    if (body.customer_phone !== undefined) updates.customer_phone = body.customer_phone;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.valid_until !== undefined) updates.valid_until = body.valid_until;

    // Update items if provided
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      await supabase
        .from('quotation_items')
        .delete()
        .eq('quotation_id', quotationId);

      // Insert new items
      const itemsToInsert = body.items.map((item: any) => ({
        quotation_id: quotationId,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        specifications: item.specifications || null,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) {
        throw itemsError;
      }

      // Recalculate totals
      const subtotalAmount = body.items.reduce(
        (sum: number, item: any) => sum + (item.quantity * item.unit_price),
        0
      );
      const taxAmount = subtotalAmount * 0.1;
      updates.subtotal_amount = subtotalAmount;
      updates.tax_amount = taxAmount;
      updates.total_amount = subtotalAmount + taxAmount;
    }

    // Update quotation
    const { data: updatedQuotation, error: updateError } = await supabase
      .from('quotations')
      .update(updates)
      .eq('id', quotationId)
      .select(`
        *,
        quotation_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      quotation: {
        ...updatedQuotation,
        items: updatedQuotation.quotation_items || [],
      },
      message: '見積を更新しました。',
      messageEn: 'Quotation updated successfully.',
    });
  } catch (error) {
    console.error('[Quotation Detail API] PATCH Error:', error);
    return NextResponse.json(
      {
        error: '見積の更新に失敗しました。',
        errorEn: 'Failed to update quotation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/member/quotations/[id]
 * Delete quotation (DRAFT status only)
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "見積を削除しました。"
 * }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getAuthenticatedUserId(request);

    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, supabase } = authResult;
    const quotationId = params.id;

    // First, check if quotation exists and belongs to user
    const { data: existingQuotation, error: fetchError } = await supabase
      .from('quotations')
      .select('status')
      .eq('id', quotationId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '見積が見つかりません。', errorEn: 'Quotation not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Check if quotation is in DRAFT status
    if (existingQuotation.status !== 'DRAFT') {
      return NextResponse.json(
        {
          error: 'ドラフト状態の見積のみ削除できます。',
          errorEn: 'Only DRAFT quotations can be deleted'
        },
        { status: 400 }
      );
    }

    // Delete quotation items first (foreign key constraint)
    await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', quotationId);

    // Delete quotation
    const { error: deleteError } = await supabase
      .from('quotations')
      .delete()
      .eq('id', quotationId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: '見積を削除しました。',
      messageEn: 'Quotation deleted successfully.',
    });
  } catch (error) {
    console.error('[Quotation Detail API] DELETE Error:', error);
    return NextResponse.json(
      {
        error: '見積の削除に失敗しました。',
        errorEn: 'Failed to delete quotation',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
