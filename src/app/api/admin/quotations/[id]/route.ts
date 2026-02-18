/**
 * Admin Quotation Detail API
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase';
import { getMaterialSpecification, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';

interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: any;
  notes: string | null;
  display_order: number;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) return unauthorizedResponse();

    // Next.js 15: params is a Promise, need to await it
    const { id: quotationId } = await params;
    const supabase = createServiceClient();

    const { data: quotation } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (!quotation) {
      return NextResponse.json({ error: '見積が見つかりません。' }, { status: 404 });
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, company_name, kanji_last_name, kanji_first_name, corporate_phone, personal_phone')
      .eq('id', quotation.user_id)
      .single();

    console.log('[Quotation Detail API] quotation keys:', Object.keys(quotation));
    console.log('[Quotation Detail API] has specifications?', !!quotation.specifications);
    console.log('[Quotation Detail API] has saved_specifications?', !!quotation.saved_specifications);
    console.log('[Quotation Detail API] has items_data?', !!quotation.items_data);
    console.log('[Quotation Detail API] specifications:', quotation.specifications);
    console.log('[Quotation Detail API] userProfile:', userProfile);

    console.log('[Quotation Detail API] Fetching items for quotation_id:', quotationId);

    const { data: items, error: itemsError } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId)
      .order('created_at', { ascending: true });

    console.log('[Quotation Detail API] itemsError:', itemsError);
    console.log('[Quotation Detail API] quotation_items found:', items?.length || 0);
    console.log('[Quotation Detail API] items raw data:', items);

    const itemsWithBreakdown = (items || []).map(item => ({
      ...item,
      breakdown: calculateBreakdown(item),
    }));

    // Merge quotation with profile data
    const quotationWithProfile = {
      ...quotation,
      items: itemsWithBreakdown,
      company_name: userProfile?.company_name || null,
      kanji_last_name: userProfile?.kanji_last_name || null,
      kanji_first_name: userProfile?.kanji_first_name || null,
      corporate_phone: userProfile?.corporate_phone || null,
      personal_phone: userProfile?.personal_phone || null,
    };

    console.log('[Quotation Detail API] quotationWithProfile keys:', Object.keys(quotationWithProfile));
    console.log('[Quotation Detail API] corporate_phone:', quotationWithProfile.corporate_phone);
    console.log('[Quotation Detail API] personal_phone:', quotationWithProfile.personal_phone);
    console.log('[Quotation Detail API] userProfile keys:', userProfile ? Object.keys(userProfile) : 'null');

    return NextResponse.json({
      success: true,
      quotation: quotationWithProfile,
    });
  } catch (error) {
    console.error('[Quotation Detail API] Error:', error);
    return NextResponse.json({ error: 'エラーが発生しました。' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) return unauthorizedResponse();

    // Next.js 15: params is a Promise, need to await it
    const { id: quotationId } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    if (body.admin_notes !== undefined) {
      await supabase.from('quotations').update({ admin_notes: body.admin_notes }).eq('id', quotationId);
    }

    if (body.items && Array.isArray(body.items)) {
      for (const itemUpdate of body.items) {
        const updateData: any = {};
        if (itemUpdate.specifications !== undefined) updateData.specifications = itemUpdate.specifications;
        if (itemUpdate.unit_price !== undefined) updateData.unit_price = itemUpdate.unit_price;
        if (itemUpdate.quantity !== undefined) updateData.quantity = itemUpdate.quantity;

        if (Object.keys(updateData).length > 0) {
          await supabase.from('quotation_items').update(updateData)
            .eq('id', itemUpdate.item_id).eq('quotation_id', quotationId);
        }
      }
      await recalculateTotals(supabase, quotationId);
    }

    return NextResponse.json({ success: true, message: '更新しました。' });
  } catch (error) {
    return NextResponse.json({ error: 'エラーが発生しました。' }, { status: 500 });
  }
}

interface CostBreakdown {
  // フィルム材料費
  materialCost: number;
  // ラミネート費
  laminationCost: number;
  // スリッター費
  slitterCost: number;
  // 表面処理費
  surfaceTreatmentCost: number;
  // パウチ加工費
  pouchProcessingCost: number;
  // 印刷費
  printingCost: number;
  // 製造者マージン
  manufacturingMargin: number;
  // 関税
  duty: number;
  // 配送料
  delivery: number;
  // 販売マージン
  salesMargin: number;
  // 総原価
  totalCost: number;
}

// =====================================================
// 仕様情報ヘルパー関数
// =====================================================

function getBagTypeName(bagTypeId: string): string {
  const types: Record<string, string> = {
    'flat_pouch': '平袋',
    'flat_3_side': '合掌袋',
    'stand_up': 'スタンドパウチ',
    'gazette': 'ガゼットパウチ',
    'roll_film': 'ロールフィルム',
    'spout_pouch': 'スパウトパウチ',
    'zipper_pouch': 'チャック付袋',
  };
  return types[bagTypeId] || bagTypeId;
}

function getMaterialName(materialId: string): string {
  // 完全なフィルム構造を返す（外層/バリア層/シーラント層）
  const materials: Record<string, string> = {
    'pet_al': 'PET/AL/LLDPE',  // 外層: PET、バリア: AL、シーラント: LLDPE
    'pet_llppe': 'PET/LLDPE',
    'pet_pet': 'PET/PET/LLDPE',  // 外層: PET、中間層: PET、シーラント: LLDPE
    'kp kp': 'KP/KP/LLDPE',  // 外層: KP、中間層: KP、シーラント: LLDPE
    'kp_al': 'KP/AL/LLDPE',  // 外層: KP、バリア: AL、シーラント: LLDPE
    'pet': 'PET/LLDPE',  // 2層構造
    'ppe': 'PPE/LLDPE',  // 2層構造
  };
  return materials[materialId] || materialId;
}

// 説明用の素材名（詳細説明）
function getMaterialDescription(materialId: string): string {
  const descriptions: Record<string, string> = {
    'pet_al': 'PET/AL (アルミラミネート)',
    'pet_llppe': 'PET/LLDPE',
    'pet_pet': 'PET/PET',
    'kp kp': 'KP/KP',
    'kp_al': 'KP/AL',
    'pet': 'PET',
    'ppe': 'PPE',
  };
  return descriptions[materialId] || materialId;
}

function getThicknessName(thickness: string): string {
  const thicknesses: Record<string, string> = {
    'thin': '薄い (60-80μm)',
    'medium': '中間 (90-120μm)',
    'thick': '厚い (130-150μm)',
  };
  return thicknesses[thickness] || thickness;
}

function getPostProcessingDisplay(options: string[]): string[] {
  const displayNames: Record<string, string> = {
    'corner-round': 'コーナーR',
    'glossy': '光沢 (グロッシー)',
    'matte': 'マット',
    'hang-hole-6mm': 'ハングホール (6mm)',
    'hang-hole-8mm': 'ハングホール (8mm)',
    'notch-yes': 'ノッチ',
    'notch-no': 'ノッチなし',
    'zipper-yes': 'ジッパー',
    'zipper-no': 'ジッパーなし',
    'valve-yes': 'バルブ',
    'valve-no': 'バルブなし',
    'spout-yes': 'スパウト',
    'spout-no': 'スパウトなし',
    'sealing-width-5mm': 'シール幅5mm',
    'sealing-width-8mm': 'シール幅8mm',
    'sealing-width-10mm': 'シール幅10mm',
    'top-open': 'トップオープン',
    'top-closed': 'トップクローズ',
    'machi-printing-yes': 'マチ印刷あり',
    'machi-printing-no': 'マチ印刷なし',
  };
  return options.map(opt => displayNames[opt] || opt);
}

function getPrintingTypeName(printingType: string): string {
  const types: Record<string, string> = {
    'digital': 'デジタル印刷',
    'gravure': 'グラビア印刷',
    'flexographic': 'フレキソ印刷',
    'uv': 'UV印刷',
  };
  return types[printingType] || printingType;
}

// =====================================================
// calculateBreakdown関数
// =====================================================

function calculateBreakdown(item: QuotationItem) {
  const specs = item.specifications || {};
  const width = specs.width || 0;
  const height = specs.height || 0;
  const depth = specs.depth || 0;

  // cost_breakdownが既に保存されている場合はそれを使用
  if (item.cost_breakdown) {
    const savedBreakdown = item.cost_breakdown as CostBreakdown;
    return {
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      specifications: {
        // 基本情報
        bag_type: specs.bagTypeId || specs.bag_type,
        bag_type_display: getBagTypeName(specs.bagTypeId || specs.bag_type),
        material: specs.materialId || specs.material,
        material_display: getMaterialName(specs.materialId || specs.material),
        // 素材詳細仕様（各層の素材と厚み）
        material_specification: getMaterialSpecification(
          specs.materialId || specs.material,
          specs.thicknessSelection
        ),
        // 重量範囲
        weight_range: (() => {
          const options = MATERIAL_THICKNESS_OPTIONS[specs.materialId || specs.material];
          if (!options) return null;
          const thickness = options.find(opt => opt.id === specs.thicknessSelection);
          return thickness?.weightRange || null;
        })(),
        thickness: specs.thicknessSelection,
        thickness_display: getThicknessName(specs.thicknessSelection),
        // サイズ
        width,
        height,
        depth,
        dimensions: specs.dimensions || `${width}×${height}${depth ? `×${depth}` : ''}mm`,
        size: `${width}×${height}${depth ? `×${depth}` : ''}mm`,
        // 印刷
        printing: specs.printingType || specs.printing_type,
        printing_display: getPrintingTypeName(specs.printingType || specs.printing_type),
        printing_type: specs.printingType || specs.printing_type,
        colors: 'フルカラー',  // 色数は常にフルカラー表示
        isUVPrinting: specs.isUVPrinting,
        // 後加工
        post_processing: specs.postProcessingOptions || specs.post_processing || [],
        post_processing_display: getPostProcessingDisplay(specs.postProcessingOptions || specs.post_processing || []),
        zipper: specs.zipper || specs.postProcessingOptions?.includes('zipper-yes') || specs.post_processing?.includes('zipper-yes'),
        spout: specs.spout || specs.postProcessingOptions?.includes('spout-yes') || specs.post_processing?.includes('spout-yes'),
        // その他
        urgency: specs.urgency,
        contents: specs.contents,
        contentsType: specs.contentsType,
        productCategory: specs.productCategory,
        deliveryLocation: specs.deliveryLocation,
        distributionEnvironment: specs.distributionEnvironment,
        sealWidth: specs.sealWidth,
        doubleSided: specs.doubleSided,
      },
      area: { mm2: width * height, m2: (width * height) / 1000000 },
      sku_info: specs.sku_quantities ? {
        count: specs.sku_quantities.length,
        quantities: specs.sku_quantities,
        total: specs.sku_quantities.reduce((sum: number, q: number) => sum + q, 0),
      } : null,
      // 詳細な原価内訳を追加
      breakdown: savedBreakdown,
    };
  }

  // cost_breakdownがない場合は、unit_priceから概算を生成
  // 注: これはフォールバックであり、正確な値ではありません
  const totalCost = item.total_price;
  const estimatedMaterialCost = Math.round(totalCost * 0.4); // 約40%
  const estimatedProcessingCost = Math.round(totalCost * 0.15); // 約15%
  const estimatedPrintingCost = Math.round(totalCost * 0.1); // 約10%
  const estimatedMargin = Math.round(totalCost * 0.2); // 約20%
  const estimatedDelivery = Math.round(totalCost * 0.08); // 約8%

  return {
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    specifications: {
      // 基本情報
      bag_type: specs.bagTypeId || specs.bag_type,
      bag_type_display: getBagTypeName(specs.bagTypeId || specs.bag_type),
      material: specs.materialId || specs.material,
      material_display: getMaterialName(specs.materialId || specs.material),
      // 素材詳細仕様（各層の素材と厚み）
      material_specification: getMaterialSpecification(
        specs.materialId || specs.material,
        specs.thicknessSelection
      ),
      // 重量範囲
      weight_range: (() => {
        const options = MATERIAL_THICKNESS_OPTIONS[specs.materialId || specs.material];
        if (!options) return null;
        const thickness = options.find(opt => opt.id === specs.thicknessSelection);
        return thickness?.weightRange || null;
      })(),
      thickness: specs.thicknessSelection,
      thickness_display: getThicknessName(specs.thicknessSelection),
      // サイズ
      width,
      height,
      depth,
      dimensions: specs.dimensions || `${width}×${height}${depth ? `×${depth}` : ''}mm`,
      size: `${width}×${height}${depth ? `×${depth}` : ''}mm`,
      // 印刷
      printing: specs.printingType || specs.printing_type,
      printing_display: getPrintingTypeName(specs.printingType || specs.printing_type),
      printing_type: specs.printingType || specs.printing_type,
      colors: 'フルカラー',  // 色数は常にフルカラー表示
      isUVPrinting: specs.isUVPrinting,
      // 後加工
      post_processing: specs.postProcessingOptions || specs.post_processing || [],
      post_processing_display: getPostProcessingDisplay(specs.postProcessingOptions || specs.post_processing || []),
      zipper: specs.zipper || specs.postProcessingOptions?.includes('zipper-yes') || specs.post_processing?.includes('zipper-yes'),
      spout: specs.spout || specs.postProcessingOptions?.includes('spout-yes') || specs.post_processing?.includes('spout-yes'),
      // その他
      urgency: specs.urgency,
      contents: specs.contents,
      contentsType: specs.contentsType,
      productCategory: specs.productCategory,
      deliveryLocation: specs.deliveryLocation,
      distributionEnvironment: specs.distributionEnvironment,
      sealWidth: specs.sealWidth,
      doubleSided: specs.doubleSided,
    },
    area: { mm2: width * height, m2: (width * height) / 1000000 },
    sku_info: specs.sku_quantities ? {
      count: specs.sku_quantities.length,
      quantities: specs.sku_quantities,
      total: specs.sku_quantities.reduce((sum: number, q: number) => sum + q, 0),
    } : null,
    // 詳細な原価内訳（概算）
    breakdown: {
      materialCost: estimatedMaterialCost,
      laminationCost: Math.round(estimatedMaterialCost * 0.15),
      slitterCost: Math.round(estimatedMaterialCost * 0.08),
      surfaceTreatmentCost: 0,
      pouchProcessingCost: estimatedProcessingCost,
      printingCost: estimatedPrintingCost,
      manufacturingMargin: Math.round((estimatedMaterialCost + estimatedProcessingCost + estimatedPrintingCost) * 0.4),
      duty: Math.round((estimatedMaterialCost + estimatedProcessingCost + estimatedPrintingCost) * 1.4 * 0.12 * 0.05),
      delivery: estimatedDelivery,
      salesMargin: estimatedMargin,
      totalCost: totalCost,
    } as CostBreakdown,
  };
}

async function recalculateTotals(supabase: any, quotationId: string) {
  const { data: items } = await supabase.from('quotation_items').select('quantity, unit_price').eq('quotation_id', quotationId);
  if (!items || items.length === 0) return;

  // Use same rounding logic as quote simulator
  // Quote Simulator rounds totalPrice to nearest 100 yen: Math.round(totalPrice / 100) * 100
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
  const roundedSubtotal = Math.round(subtotal / 100) * 100;
  const tax = roundedSubtotal * 0.1;
  const roundedTax = Math.round(tax);
  const total = Math.round((roundedSubtotal + roundedTax) / 100) * 100;

  console.log('[recalculateTotals] Price calculation:', {
    quotationId,
    rawSubtotal: subtotal,
    roundedSubtotal,
    rawTax: tax,
    roundedTax,
    total,
  });

  await supabase.from('quotation').update({
    subtotal_amount: roundedSubtotal,
    tax_amount: roundedTax,
    total_amount: total,
    updated_at: new Date().toISOString(),
  }).eq('id', quotationId);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
