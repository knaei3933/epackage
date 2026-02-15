export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

/**
 * ============================================================
 * Member Billing Addresses API
 * ============================================================
 *
 * GET /api/member/addresses/billing - Get user's billing addresses
 * POST /api/member/addresses/billing - Create new billing address
 *
 * Uses cookie-based authentication (middleware sets headers)
 */

// ============================================================
// Validation Schema
// ============================================================

const billingAddressSchema = z.object({
  companyName: z.string().min(1, '会社名は必須です'),
  postalCode: z.string().regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address: z.string().min(1, '番地は必須です'),
  building: z.string().optional(),
  taxNumber: z.string().optional(),
  email: z.string().email('メールアドレスの形式が正しくありません').optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ============================================================
// GET Handler - List Billing Addresses
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Supabase SSR client to get authenticated user
    const { client: supabaseAuth } = await createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const supabase = createServiceClient();

    const { data: addresses, error } = await supabase
      .from('billing_addresses')
      .select('*')
      .eq('user_id', userId)
      // is_default = true인 항목이 먼저 오도록 정렬
      .order('is_default', { ascending: false })
      // 그 다음 created_at 순으로 정렬 (최신순)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Billing addresses fetch error:', error);
      return NextResponse.json(
        { error: '住所の取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedAddresses = (addresses || []).map((addr: any) => ({
      id: addr.id,
      userId: addr.user_id,
      companyName: addr.company_name,
      postalCode: addr.postal_code,
      prefecture: addr.prefecture,
      city: addr.city,
      address: addr.address,
      building: addr.building,
      taxNumber: addr.tax_number,
      email: addr.email,
      phone: addr.phone,
      isDefault: addr.is_default,
      createdAt: addr.created_at,
      updatedAt: addr.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedAddresses,
    });
  } catch (error) {
    console.error('Billing addresses API error:', error);
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
// POST Handler - Create Billing Address
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Supabase SSR client to get authenticated user
    const { client: supabaseAuth } = await createSupabaseSSRClient(request);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();
    const validationResult = billingAddressSchema.safeParse(body);

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
        .from('billing_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Create new address
    const { data: newAddress, error: createError } = await supabase
      .from('billing_addresses')
      .insert({
        user_id: userId,
        company_name: addressData.companyName,
        postal_code: addressData.postalCode,
        prefecture: addressData.prefecture,
        city: addressData.city,
        address: addressData.address,
        building: addressData.building,
        tax_number: addressData.taxNumber,
        email: addressData.email,
        phone: addressData.phone,
        is_default: addressData.isDefault ?? false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Billing address creation error:', createError);
      return NextResponse.json(
        { error: '住所の作成に失敗しました', code: 'CREATE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '請求先住所を登録しました',
      data: newAddress,
    }, { status: 201 });
  } catch (error) {
    console.error('Billing addresses API error:', error);
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
