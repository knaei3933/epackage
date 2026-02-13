export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/dashboard';

/**
 * ============================================================
 * Member Billing Address (Individual) API
 * ============================================================
 *
 * GET /api/member/addresses/billing/[id] - Get specific billing address
 * PUT /api/member/addresses/billing/[id] - Update billing address
 * DELETE /api/member/addresses/billing/[id] - Delete billing address
 *
 * Uses cookie-based authentication (middleware sets headers)
 */

// ============================================================
// Validation Schema
// ============================================================

const updateBillingAddressSchema = z.object({
  companyName: z.string().min(1, '会社名は必須です').optional(),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません').optional(),
  prefecture: z.string().min(1, '都道府県は必須です').optional(),
  city: z.string().min(1, '市区町村は必須です').optional(),
  address: z.string().min(1, '番地は必須です').optional(),
  building: z.string().optional(),
  taxNumber: z.string().optional(),
  email: z.string().email('メールアドレスの形式が正しくありません').optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ============================================================
// GET Handler - Get Single Billing Address
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: address, error } = await supabase
      .from('billing_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Billing address fetch error:', error);
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
    console.error('Billing address API error:', error);
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
// PUT Handler - Update Billing Address
// ============================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updateBillingAddressSchema.safeParse(body);

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
        .from('billing_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Build update object
    const updateObj: Record<string, unknown> = {};
    if (addressData.companyName !== undefined) updateObj.company_name = addressData.companyName;
    if (addressData.postalCode !== undefined) updateObj.postal_code = addressData.postalCode;
    if (addressData.prefecture !== undefined) updateObj.prefecture = addressData.prefecture;
    if (addressData.city !== undefined) updateObj.city = addressData.city;
    if (addressData.address !== undefined) updateObj.address = addressData.address;
    if (addressData.building !== undefined) updateObj.building = addressData.building;
    if (addressData.taxNumber !== undefined) updateObj.tax_number = addressData.taxNumber;
    if (addressData.email !== undefined) updateObj.email = addressData.email;
    if (addressData.phone !== undefined) updateObj.phone = addressData.phone;
    if (addressData.isDefault !== undefined) updateObj.is_default = addressData.isDefault;

    // Update address
    const { data: updatedAddress, error: updateError } = await supabase
      .from('billing_addresses')
      .update(updateObj)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Billing address update error:', updateError);
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
      message: '請求先住所を更新しました',
      data: updatedAddress,
    });
  } catch (error) {
    console.error('Billing address API error:', error);
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
// DELETE Handler - Delete Billing Address
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
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
      .from('billing_addresses')
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
      .from('billing_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Billing address delete error:', deleteError);
      return NextResponse.json(
        { error: '住所の削除に失敗しました', code: 'DELETE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '請求先住所を削除しました',
    });
  } catch (error) {
    console.error('Billing address API error:', error);
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
