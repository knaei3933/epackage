export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

/**
 * ============================================================
 * Member Delivery Addresses API
 * ============================================================
 *
 * GET /api/member/addresses/delivery - Get user's delivery addresses
 * POST /api/member/addresses/delivery - Create new delivery address
 *
 * Uses cookie-based authentication (middleware sets headers)
 */

// ============================================================
// Validation Schema
// ============================================================

const deliveryAddressSchema = z.object({
  name: z.string().min(1, '納品先名は必須です'),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address: z.string().min(1, '番地は必須です'),
  building: z.string().optional(),
  phone: z.string().min(1, '電話番号は必須です'),
  contactPerson: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get user ID from middleware headers (cookie-based auth)
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return headersList.get('x-user-id');
  } catch (error) {
    console.error('[getUserIdFromRequest] Error:', error);
    return null;
  }
}

// ============================================================
// GET Handler - List Delivery Addresses
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();

    const { data: addresses, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      // is_default = true인 항목이 먼저 오도록 정렬
      .order('is_default', { ascending: false })
      // 그 다음 created_at 순으로 정렬 (최신순)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Delivery addresses fetch error:', error);
      return NextResponse.json(
        { error: '住所の取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedAddresses = (addresses || []).map((addr: any) => ({
      id: addr.id,
      userId: addr.user_id,
      name: addr.name,
      postalCode: addr.postal_code,
      prefecture: addr.prefecture,
      city: addr.city,
      address: addr.address,
      building: addr.building,
      phone: addr.phone,
      contactPerson: addr.contact_person,
      isDefault: addr.is_default,
      createdAt: addr.created_at,
      updatedAt: addr.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedAddresses,
    });
  } catch (error) {
    console.error('Delivery addresses API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Create Delivery Address
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = deliveryAddressSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '無効なデータです',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const addressData = validationResult.data;
    const supabase = createServiceClient();

    // If setting as default, unset other defaults
    if (addressData.isDefault) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Create new address
    const { data: newAddress, error: createError } = await supabase
      .from('delivery_addresses')
      .insert({
        user_id: userId,
        name: addressData.name,
        postal_code: addressData.postalCode,
        prefecture: addressData.prefecture,
        city: addressData.city,
        address: addressData.address,
        building: addressData.building,
        phone: addressData.phone,
        contact_person: addressData.contactPerson,
        is_default: addressData.isDefault ?? false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Delivery address creation error:', createError);
      return NextResponse.json(
        { error: '住所の作成に失敗しました', code: 'CREATE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '納品先住所を登録しました',
      data: newAddress,
    }, { status: 201 });
  } catch (error) {
    console.error('Delivery addresses API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
