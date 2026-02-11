import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface ConfirmTransferRequest {
  transferDate: string; // ISO datetime
  amount: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    // 1. 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です。' },
        { status: 401 }
      );
    }

    const { id: quotationId } = await params;

    // 2. リクエストデータ解析
    const body: ConfirmTransferRequest = await request.json();
    const { transferDate, amount } = body;

    if (!transferDate || !amount) {
      return NextResponse.json(
        { error: '送金日と送金額を両方入力してください。' },
        { status: 400 }
      );
    }

    // 3. 見積照会および所有権確認
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .eq('user_id', user.id)
      .single();

    if (quoteError || !quotation) {
      return NextResponse.json(
        { error: '見積書が見つからないか、アクセス権限がありません。' },
        { status: 404 }
      );
    }

    // 4. 送金情報保存
    const { error: updateError } = await supabase
      .from('quotations')
      .update({
        transfer_date: transferDate,
        transfer_amount: amount,
        status: 'converted_to_order',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId);

    if (updateError) {
      console.error('送金情報保存失敗:', updateError);
      return NextResponse.json(
        { error: '送金情報の保存に失敗しました。' },
        { status: 500 }
      );
    }

    // 5. 注文作成
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        quotation_id: quotationId,
        user_id: user.id,
        company_name: quotation.company_name || '',
        contact_name: quotation.contact_name || '',
        email: quotation.email || '',
        phone: quotation.phone || '',
        status: 'pending',
        total_amount: amount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('注文作成失敗:', orderError);
      return NextResponse.json(
        { error: '注文の作成に失敗しました。' },
        { status: 500 }
      );
    }

    // 6. 見積商品情報を注文商品にコピー
    const { data: quoteItems } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId);

    if (quoteItems && quoteItems.length > 0) {
      const orderItems = quoteItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        specifications: item.specifications,
        created_at: new Date().toISOString(),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('注文商品コピー失敗:', itemsError);
        // 注文は作成されているため警告のみログ
      }
    }

    return NextResponse.json({
      success: true,
      message: '送金確認が完了し、注文が作成されました。',
      orderId: order.id,
      quotationId,
    });

  } catch (error) {
    console.error('送金確認APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
