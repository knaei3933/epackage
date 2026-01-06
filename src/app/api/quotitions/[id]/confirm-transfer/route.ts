import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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
    const supabase = createRouteHandlerClient({ cookies });

    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id: quotationId } = await params;

    // 2. 요청 데이터 파싱
    const body: ConfirmTransferRequest = await request.json();
    const { transferDate, amount } = body;

    if (!transferDate || !amount) {
      return NextResponse.json(
        { error: '송금일과 송금액을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 3. 견적 조회 및 소유권 확인
    const { data: quotation, error: quoteError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .eq('user_id', user.id)
      .single();

    if (quoteError || !quotation) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없거나 접근 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 4. 송금 정보 저장
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
      console.error('송금 정보 저장 실패:', updateError);
      return NextResponse.json(
        { error: '송금 정보 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 5. 주문 생성
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
      console.error('주문 생성 실패:', orderError);
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 6. 견적 상품 정보를 주문 상품으로 복사
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
        console.error('주문 상품 복사 실패:', itemsError);
        // 주문은 생성되었으므로 경고만 로그
      }
    }

    return NextResponse.json({
      success: true,
      message: '송금 확인이 완료되고 주문이 생성되었습니다.',
      orderId: order.id,
      quotationId,
    });

  } catch (error) {
    console.error('송금 확인 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
