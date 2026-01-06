/**
 * Production Data Status API (Member Portal)
 *
 * Task 109: Data Import Status UI
 * - GET: Fetch production data status for an order
 * - Returns data import status and required modifications
 * - All DB operations via Supabase MCP
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// =====================================================
// Environment Variables
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// =====================================================
// GET Handler
// =====================================================

/**
 * GET /api/member/orders/[id]/production-data
 * Get production data import status for an order
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": [ ...productionDataItems ],
 *   "requiredModifications": [ ... ]
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user (support both cookie auth and DEV_MODE header)
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

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Production Data API] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        return NextResponse.json(
          {
            error: '認証されていません。',
            errorEn: 'Authentication required',
          },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    const { id: orderId } = await params;

    // 2. Verify order exists and belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== userId) {
      return NextResponse.json(
        {
          error: 'アクセス権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 3. Get production data items
    const { data: productionData, error: dataError } = await supabase
      .from('production_data')
      .select('*')
      .eq('order_id', orderId)
      .order('received_at', { ascending: false });

    if (dataError) {
      console.error('[Production Data API] Fetch error:', dataError);
    }

    // 4. Determine required modifications based on validation status
    const requiredModifications: string[] = [];

    if (productionData) {
      productionData.forEach((item) => {
        if (item.validation_status === 'invalid') {
          requiredModifications.push(
            `${item.title}: データが無効です。${item.validation_notes || '再提出してください。'}`
          );
        } else if (item.validation_status === 'needs_revision') {
          requiredModifications.push(
            `${item.title}: ${item.validation_notes || '修正が必要です。'}`
          );
        }

        // Check for validation errors
        if (item.validation_errors && typeof item.validation_errors === 'object') {
          const errors = item.validation_errors as Record<string, unknown>;
          Object.keys(errors).forEach((key) => {
            requiredModifications.push(
              `${item.title}: ${key} - ${JSON.stringify(errors[key])}`
            );
          });
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: productionData || [],
        requiredModifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Production Data API] Unexpected error:', error);

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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
