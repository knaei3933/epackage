/**
 * Admin User Addresses API
 *
 * 管理者が会員の登録住所（配送先・請求先）を取得するAPI
 * - 配送先住所リスト
 * - 請求先住所リスト
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Supabaseのsnake_caseカラムをcamelCaseに変換するヘルパー関数
 */
function transformDeliveryAddress(dbAddress: any) {
  if (!dbAddress) return null;
  return {
    id: dbAddress.id,
    name: dbAddress.name,
    postalCode: dbAddress.postal_code,
    prefecture: dbAddress.prefecture,
    city: dbAddress.city,
    address: dbAddress.address,
    building: dbAddress.building,
    phone: dbAddress.phone,
    contactPerson: dbAddress.contact_person,
    isDefault: dbAddress.is_default,
    userId: dbAddress.user_id,
    createdAt: dbAddress.created_at,
    updatedAt: dbAddress.updated_at,
  };
}

function transformBillingAddress(dbAddress: any) {
  if (!dbAddress) return null;
  return {
    id: dbAddress.id,
    companyName: dbAddress.company_name,
    postalCode: dbAddress.postal_code,
    prefecture: dbAddress.prefecture,
    city: dbAddress.city,
    address: dbAddress.address,
    building: dbAddress.building,
    taxNumber: dbAddress.tax_number,
    email: dbAddress.email,
    phone: dbAddress.phone,
    isDefault: dbAddress.is_default,
    userId: dbAddress.user_id,
    createdAt: dbAddress.created_at,
    updatedAt: dbAddress.updated_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: userId } = await params;
    const supabase = createServiceClient();

    // 배송지 주소 목록 조회
    const { data: deliveryAddresses, error: deliveryError } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    // 청구지 주소 목록 조회
    const { data: billingAddresses, error: billingError } = await supabase
      .from('billing_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    // camelCaseに変換
    const transformedDeliveryAddresses = (deliveryAddresses || []).map(transformDeliveryAddress);
    const transformedBillingAddresses = (billingAddresses || []).map(transformBillingAddress);

    return NextResponse.json({
      success: true,
      data: {
        deliveryAddresses: transformedDeliveryAddresses,
        billingAddresses: transformedBillingAddresses,
      },
    });
  } catch (error) {
    console.error('[AdminUserAddresses] Error:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
