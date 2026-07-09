import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { sendManufacturerOrderEmail, type ManufacturerOrderItem } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id: quotationId } = await params;
  const supabase = createServiceClient();

  // 1. Load manufacturer email from system_settings
  const { data: emailSetting, error: emailError } = await supabase
    .from('system_settings')
    .select('value')
    .eq('category', 'production')
    .eq('key', 'manufacturer_order_email')
    .single();

  if (emailError || !emailSetting?.value) {
    return NextResponse.json(
      { success: false, error: '제조사 발주 메일 주소가 설정되지 않았습니다. 관리자 설정 > 제조에서 production.manufacturer_order_email을 입력하세요.' },
      { status: 400 }
    );
  }

  const manufacturerEmail = emailSetting.value as string;

  // 2. Load quotation + items
  const { data: quotation, error: quotError } = await supabase
    .from('quotations')
    .select('id, quotation_number, customer_name')
    .eq('id', quotationId)
    .single();

  if (quotError || !quotation) {
    return NextResponse.json({ success: false, error: '견적을 찾을 수 없습니다.' }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('id, product_name, bag_type, quantity, specifications, cost_breakdown, film_cost_details')
    .eq('quotation_id', quotationId);

  if (itemsError || !items) {
    return NextResponse.json({ success: false, error: '견적 품목 조회 실패' }, { status: 500 });
  }

  // 3. Extract KRW cost values from cost_breakdown + film_cost_details
  let body: { notes?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const manufacturerItems: ManufacturerOrderItem[] = [];
  let totalManufacturingCostKRW = 0;

  for (const item of items) {
    const cb = (item.cost_breakdown || {}) as Record<string, any>;
    const specs = (item.specifications || {}) as Record<string, any>;
    const fcd = (item.film_cost_details || specs.film_cost_details || {}) as Record<string, any>;

    // exchange rate: stored value preferred, fallback 0.12
    const exchangeRate = cb.exchangeRate ?? 0.12;
    const jpyToKrw = (jpy: number) => Math.round(jpy / exchangeRate);

    const materialCostKRW = cb.materialCost ? jpyToKrw(cb.materialCost) : (fcd.totalCostKRW ?? 0);
    const printingCostKRW = cb.printing ? jpyToKrw(cb.printing) : 0;
    const laminationCostKRW = cb.laminationCost ? jpyToKrw(cb.laminationCost) : (fcd.breakdown?.lamination?.cost ?? 0);
    const slitterCostKRW = cb.slitterCost ? jpyToKrw(cb.slitterCost) : (fcd.breakdown?.slitter?.final ?? 0);
    const pouchProcessingCostKRW = cb.pouchProcessingCost ? jpyToKrw(cb.pouchProcessingCost) : 0;
    const surfaceTreatmentCostKRW = cb.surfaceTreatmentCost ? jpyToKrw(cb.surfaceTreatmentCost) : 0;

    const postProcessingTotalKRW = laminationCostKRW + slitterCostKRW + pouchProcessingCostKRW + surfaceTreatmentCostKRW;
    const baseCostKRW = cb.baseCost ? jpyToKrw(cb.baseCost) : (materialCostKRW + printingCostKRW + postProcessingTotalKRW);

    const manufacturerMarginRate = cb.manufacturerMarginRate;
    const manufacturerMarginKRW = cb.manufacturingMargin ? jpyToKrw(cb.manufacturingMargin) : Math.round(baseCostKRW * (manufacturerMarginRate ?? 0.3));
    const manufacturingCostKRW = baseCostKRW + manufacturerMarginKRW;

    totalManufacturingCostKRW += manufacturingCostKRW;

    manufacturerItems.push({
      productName: item.product_name || specs.bag_type_display || '품목',
      bagType: item.bag_type || specs.bag_type || '-',
      quantity: item.quantity || 0,
      specifications: {
        size: specs.size || (specs.width && specs.height ? `${specs.width}×${specs.height}mm` : undefined),
        material: specs.material_display || specs.material,
        printing: specs.printing_display || specs.printing,
        spoutSize: specs.spoutSize,
      },
      materialCostKRW,
      printingCostKRW,
      laminationCostKRW,
      slitterCostKRW,
      pouchProcessingCostKRW,
      surfaceTreatmentCostKRW,
      postProcessingTotalKRW,
      baseCostKRW,
      manufacturerMarginRate,
      manufacturerMarginKRW,
      manufacturingCostKRW,
      spoutPriceKRW: cb.spoutPriceKRW,
      spoutQuantity: cb.spoutQuantity,
      spoutCostKRW: cb.spoutCostKRW,
      spoutRoundTripShippingKRW: cb.spoutRoundTripShippingKRW,
      outsourcingShippingKRW: cb.outsourcingShippingKRW,
      materialMarkupRate: cb.materialMarkupRate ?? fcd.materialMarkupRate,
      laminationUnitPriceKRW: fcd.laminationUnitPriceKRW,
      laminationCycles: fcd.laminationCycles,
      hasALMaterial: fcd.hasALMaterial,
      slitterUnitPriceKRW: fcd.slitterUnitPriceKRW,
      slitterMinCostKRW: fcd.slitterMinCostKRW,
    });
  }

  if (manufacturerItems.length === 0) {
    return NextResponse.json({ success: false, error: '발송할 품목이 없습니다.' }, { status: 400 });
  }

  // 4. Send email
  const result = await sendManufacturerOrderEmail({
    quoteNumber: quotation.quotation_number,
    customerName: quotation.customer_name || '-',
    recipientEmail: manufacturerEmail,
    items: manufacturerItems,
    totalManufacturingCostKRW,
    notes: body.notes,
  });

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    messageId: result.messageId,
    previewUrl: result.previewUrl,
    recipient: manufacturerEmail,
  });
}
