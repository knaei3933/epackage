export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

/**
 * ============================================================
 * Member Delivery Address (Individual) API
 * ============================================================
 *
 * GET /api/member/addresses/delivery/[id] - Get specific delivery address
 * PUT /api/member/addresses/delivery/[id] - Update delivery address
 * DELETE /api/member/addresses/delivery/[id] - Delete delivery address
 *
 * Uses cookie-based authentication (middleware sets headers)
 */

// ============================================================
// Validation Schema
// ============================================================

const updateDeliveryAddressSchema = z.object({
  name: z.string().min(1, '納品先名は必須です').optional(),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません').optional(),
  prefecture: z.string().min(1, '都道府県は必須です').optional(),
  city: z.string().min(1, '市区町村は必須です').optional(),
  address: z.string().min(1, '番地は必須です').optional(),
  building: z.string().optional(),
  phone: z.string().min(1, '電話番号は必須です').optional(),
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
// GET Handler - Get Single Delivery Address
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: address, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Delivery address fetch error:', error);
      return NextResponse.json(
        { error: '住所の取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: '住所が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error('Delivery address API error:', error);
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
// PUT Handler - Update Delivery Address
// ============================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateDeliveryAddressSchema.safeParse(body);

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

    const { id } = await params;
    const addressData = validationResult.data;
    const supabase = createServiceClient();

    // If setting as default, unset other defaults
    if (addressData.isDefault) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Build update object
    const updateObj: Record<string, unknown> = {};
    if (addressData.name !== undefined) updateObj.name = addressData.name;
    if (addressData.postalCode !== undefined) updateObj.postal_code = addressData.postalCode;
    if (addressData.prefecture !== undefined) updateObj.prefecture = addressData.prefecture;
    if (addressData.city !== undefined) updateObj.city = addressData.city;
    if (addressData.address !== undefined) updateObj.address = addressData.address;
    if (addressData.building !== undefined) updateObj.building = addressData.building;
    if (addressData.phone !== undefined) updateObj.phone = addressData.phone;
    if (addressData.contactPerson !== undefined) updateObj.contact_person = addressData.contactPerson;
    if (addressData.isDefault !== undefined) updateObj.is_default = addressData.isDefault;

    // Update address
    const { data: updatedAddress, error: updateError } = await supabase
      .from('delivery_addresses')
      .update(updateObj)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Delivery address update error:', updateError);
      return NextResponse.json(
        { error: '住所の更新に失敗しました', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    if (!updatedAddress) {
      return NextResponse.json(
        { error: '住所が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '納品先住所を更新しました',
      data: updatedAddress,
    });
  } catch (error) {
    console.error('Delivery address API error:', error);
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
// DELETE Handler - Delete Delivery Address
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Check if it's the default address
    const { data: address } = await supabase
      .from('delivery_addresses')
      .select('is_default')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!address) {
      return NextResponse.json(
        { error: '住所が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (address.is_default) {
      return NextResponse.json(
        { error: 'デフォルトの住所は削除できません', code: 'CANNOT_DELETE_DEFAULT' },
        { status: 400 }
      );
    }

    // Delete address
    const { error: deleteError } = await supabase
      .from('delivery_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Delivery address delete error:', deleteError);
      return NextResponse.json(
        { error: '住所の削除に失敗しました', code: 'DELETE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '納品先住所を削除しました',
    });
  } catch (error) {
    console.error('Delivery address API error:', error);
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
