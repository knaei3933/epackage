/**
 * Quotation Save API Route
 *
 * 見積作成API（見積もりシミュレーター用）
 * POST /api/quotations/save - 新しい見積を作成
 * - ログイン済みユーザー: ユーザー情報と紐付けて保存
 * - ✅ quotation_itemsテーブルにもレコードを作成
 * - ✅ エラーハンドリング改善
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper: Create Supabase client with cookie support (env check moved to runtime)
async function createSupabaseClient() {
  const cookieStore = await cookies();

  // Get environment variables at request time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

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

// =====================================================
// Type Definitions
// =====================================================

interface QuotationItemData {
  id?: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  specifications?: Record<string, unknown>;
}

interface AppliedCoupon {
  couponId?: string;
  type?: string;
}

interface SaveRequestBody {
  quotationNumber?: string;
  totalAmount?: number;
  grandTotal?: number;
  pricing?: {
    totalPrice: number;
  };
  items?: QuotationItemData[];
  specifications?: Record<string, unknown>;
  postProcessing?: string[];
  skuData?: Record<string, unknown>;
  appliedCoupon?: AppliedCoupon;
  discountAmount?: number;
  adjustedTotal?: number;
}

// Helper: Get service role client (env check moved to runtime)
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export const dynamic = 'force-dynamic';

// POST: 新しい見積を作成
// ✅ quotation_itemsテーブルにもレコードを作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const supabaseService = getServiceRoleClient();

    // セッション確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const isAuthenticated = !userError && user;

    // ✅ 認証必須（DBのuser_id NOT NULL制約のため）
    if (!isAuthenticated || !user) {
      console.error('[API /quotations/save] User not authenticated');
      return NextResponse.json(
        {
          error: '見積を保存するにはログインが必要です。',
          errorEn: 'Authentication required to save quotation',
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    // プロフィールからユーザー情報取得（company_nameを含む）
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, status, email, kanji_last_name, kanji_first_name, company_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[API /quotations/save] Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'ユーザープロフィールの取得に失敗しました。' },
        { status: 404 }
      );
    }

    if (profile.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '有効なアカウントのみ見積を作成できます。' },
        { status: 403 }
      );
    }

    // 会社名があれば会社名を優先、なければ氏名、さらになければメールアドレス
    const customerName = profile.company_name ||
      (profile.kanji_last_name && profile.kanji_first_name
        ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
        : profile.email || '未登録');
    const customerEmail = profile.email || '';

    // リクエストボディをパース
    const body: SaveRequestBody = await request.json();

    // デバッグログ
    console.log('[API /quotations/save] Request body:', JSON.stringify(body, null, 2));

    // 見積番号生成
    const quotationNumber = body.quotationNumber ||
      `QT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${Date.now().toString(36).toUpperCase()}`;

    // 価格データの決定
    // adjustedTotalがあればそれを使用、なければ従来通りgrandTotal/totalAmountを使用
    const baseTotal = body.totalAmount || body.pricing?.totalPrice || 0;
    const grandTotal = body.adjustedTotal || body.grandTotal || baseTotal;
    const hasCoupon = body.appliedCoupon && body.discountAmount !== undefined;

    console.log('[API /quotations/save] totalAmount:', baseTotal, 'adjustedTotal:', body.adjustedTotal, 'grandTotal:', grandTotal, 'hasCoupon:', hasCoupon);

    // itemsデータの準備
    let itemsToSave: QuotationItemData[] = [];

    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      // ResultStepからのリクエスト（items形式）
      itemsToSave = body.items;
    } else {
      // ホームページシミュレーターからのリクエスト（単一アイテム）
      itemsToSave = [{
        productName: 'カスタム製品',
        quantity: 1,
        unitPrice: grandTotal,
        specifications: {
          ...body.specifications,
          postProcessing: body.postProcessing,
          skuData: body.skuData,
        },
      }];
    }

    console.log('[API /quotations/save] Items to save:', itemsToSave.length);

    // ユーザーのデフォルト住所を取得
    const { data: defaultDelivery } = await supabaseService
      .from('delivery_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    const { data: defaultBilling } = await supabaseService
      .from('billing_addresses')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    const deliveryAddressId = defaultDelivery?.id || null;
    const billingAddressId = defaultBilling?.id || null;

    console.log('[API /quotations/save] Default addresses:', {
      deliveryAddressId,
      billingAddressId,
    });

    // トランザクション処理: quotation + quotation_items
    // 注: Supabaseはトランザクションを直接サポートしていないため、
    // エラー時のロールバック処理を実装

    let quotation: any;
    let quotationItems: any[] = [];

    try {
      // 1. 見積を作成
      const quotationInsertData: Record<string, unknown> = {
        user_id: userId,
        quotation_number: quotationNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        total_amount: grandTotal,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        delivery_address_id: deliveryAddressId,
        billing_address_id: billingAddressId,
        notes: JSON.stringify({
          items: itemsToSave,
          quotationData: body,
        }),
      };

      // クーポン情報があれば追加
      if (hasCoupon) {
        quotationInsertData.coupon_id = body.appliedCoupon?.couponId || null;
        quotationInsertData.discount_amount = body.discountAmount;
        quotationInsertData.discount_type = body.appliedCoupon?.type || null;
      }

      const { data: quotationData, error: insertError } = await supabaseService
        .from('quotation')
        .insert(quotationInsertData)
        .select()
        .single();

      if (insertError) {
        console.error('[API /quotations/save] Insert quotation error:', insertError);
        throw new Error(`見積の作成に失敗しました: ${insertError.message}`);
      }

      quotation = quotationData;
      console.log('[API /quotations/save] Quotation created:', quotation.id);

      // 2. 見積アイテムを作成
      const itemsToInsert = itemsToSave.map((item, index) => ({
        quotation_id: quotation.id,
        product_id: item.productId || null,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        specifications: item.specifications || null,
      }));

      const { data: itemsData, error: itemsError } = await supabaseService
        .from('quotation_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('[API /quotations/save] Insert quotation_items error:', itemsError);
        // ロールバック: 見積を削除
        await supabaseService.from('quotation').delete().eq('id', quotation.id);
        throw new Error(`見積アイテムの作成に失敗しました: ${itemsError.message}`);
      }

      quotationItems = itemsData || [];
      console.log('[API /quotations/save] Quotation items created:', quotationItems.length);

    } catch (error: any) {
      console.error('[API /quotations/save] Transaction error:', error);
      return NextResponse.json(
        {
          error: error.message || '見積作成中にエラーが発生しました。',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '見積を作成しました。',
        quotation: {
          ...quotation,
          items: quotationItems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /quotations/save] Unexpected error:', error);

    // JSONパースエラー等のハンドリング
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: '無効なリクエスト形式です。',
          errorEn: 'Invalid request format',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: '見積作成中にエラーが発生しました。',
        errorEn: 'Failed to create quotation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
