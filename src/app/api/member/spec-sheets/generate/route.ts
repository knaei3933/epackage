/**
 * API Route: Generate Spec Sheet from Order Data
 *
 * 注文データから仕様書生成API
 * - AI抽出データと韓国パートナー修正事項の反映
 * - PDF生成及びデータベース保存
 * - 顧客承認の準備
 *
 * /api/member/spec-sheets/generate
 *
 * Migrated from /api/b2b/spec-sheets/generate
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { generateSpecSheetPdfBase64 } from '@/lib/pdf/specSheetPdfGenerator';
import type { SpecSheetData, SpecSheetStatus } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface GenerateSpecSheetRequest {
  orderId: string;
  workOrderId?: string;
  productId?: string;
}

// ============================================================
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Spec Sheet Generation] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Spec Sheet Generation] Auth error:', authError);
    return null;
  }

  return user.id;
}

// ============================================================
// POST: Generate Spec Sheet
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: GenerateSpecSheetRequest = await request.json();
    const { orderId, workOrderId, productId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'generate_spec_sheet',
      userId: userId,
      route: '/api/member/spec-sheets/generate',
    });

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        quotations (
          *,
          quotation_items (
            *,
            products (*)
          )
        ),
        korea_corrections (
          *,
          corrected_files
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get AI-extracted data from files
    const { data: files } = await supabaseAdmin
      .from('uploaded_files')
      .select('*')
      .eq('order_id', orderId)
      .eq('data_type', 'design');

    // Extract AI data from files
    let aiExtractedData: any = {};
    if (files && files.length > 0) {
      const designFile = files.find((f: any) => f.file_type === 'ai');
      if (designFile?.ai_extracted_data) {
        aiExtractedData = designFile.ai_extracted_data;
      }
    }

    // Get Korea corrections if any
    const corrections = (order as any).korea_corrections || [];
    const latestCorrection = corrections
      .filter((c: any) => c.status === 'completed')
      .sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];

    // Build spec sheet data
    const specSheetData: SpecSheetData = buildSpecSheetData(
      order,
      aiExtractedData,
      latestCorrection
    );

    // Generate PDF
    const pdfResult = await generateSpecSheetPdfBase64(specSheetData);

    if (!pdfResult.success) {
      return NextResponse.json(
        { success: false, error: pdfResult.error || 'Failed to generate PDF' },
        { status: 500 }
      );
    }

    // Upload PDF to Supabase Storage
    const fileName = `specsheet-${order.order_number}-${Date.now()}.pdf`;
    const filePath = `spec-sheets/${orderId}/${fileName}`;

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfResult.base64!, 'base64');

    const { error: uploadError } = await supabaseAdmin.storage
      .from('spec-sheets')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Spec Sheet Generation] Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload PDF' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('spec-sheets')
      .getPublicUrl(filePath);

    // Check if spec sheet already exists for this order
    const { data: existingSpec } = await supabaseAdmin
      .from('spec_sheets')
      .select('*')
      .eq('work_order_id', orderId)
      .eq('is_latest_version', true)
      .single();

    let specSheetId: string;

    if (existingSpec) {
      // Update existing spec sheet
      const { data: updatedSpec, error: updateError } = await supabaseAdmin
        .from('spec_sheets')
        .update({
          specifications: specSheetData as any,
          pdf_url: publicUrl,
          status: 'pending_review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSpec.id)
        .select()
        .single();

      if (updateError || !updatedSpec) {
        return NextResponse.json(
          { success: false, error: updateError?.message || 'Failed to update spec sheet' },
          { status: 500 }
        );
      }

      specSheetId = updatedSpec.id;
    } else {
      // Create new spec sheet
      const { data: newSpec, error: insertError } = await supabaseAdmin
        .from('spec_sheets')
        .insert({
          work_order_id: orderId,
          title: `仕様書 - ${order.order_number}`,
          description: `${order.product_name || 'Custom Product'} 仕様書`,
          specifications: specSheetData as any,
          pdf_url: publicUrl,
          status: 'pending_review',
          created_by: userId,
        })
        .select()
        .single();

      if (insertError || !newSpec) {
        return NextResponse.json(
          { success: false, error: insertError?.message || 'Failed to create spec sheet' },
          { status: 500 }
        );
      }

      specSheetId = newSpec.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        specSheetId,
        specNumber: specSheetData.specNumber,
        pdfUrl: publicUrl,
        status: 'pending_review',
        message: '仕様書が生成されました。顧客の承認をお待ちしています。',
      },
    });
  } catch (error: any) {
    console.error('[Spec Sheet Generation] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Build spec sheet data from order, AI data, and corrections
 */
function buildSpecSheetData(
  order: any,
  aiData: any,
  correction: any
): SpecSheetData {
  // Use corrected data if available, otherwise use AI data
  const dataSource = correction?.corrected_data || aiData || {};

  // Generate spec number
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const specNumber = `SPEC-${dateStr}-${String(order.order_number?.slice(-4) || '0001').padStart(4, '0')}`;

  // Build dimensions from data
  const dimensions = dataSource.dimensions || {};
  const materials = dataSource.materials || [];

  return {
    specNumber,
    revision: '1.0',
    issueDate: new Date().toLocaleDateString('ja-JP'),
    status: 'pending' as SpecSheetStatus,
    category: 'packaging',
    title: `${order.product_name || 'Custom Product'} 仕様書`,
    description: `注文番号: ${order.order_number}`,
    customer: {
      name: order.customer_name || 'Customer',
      department: order.customer_company || '',
      contactPerson: order.customer_name || 'Customer Representative',
      contact: {
        email: order.customer_email,
        phone: order.customer_phone,
      },
    },
    product: {
      id: order.product_id || '',
      name: order.product_name || 'Custom Product',
      productCode: order.product_code || `CUSTOM-${order.order_number}`,
      category: 'packaging',
      dimensions: {
        length: dimensions.width,
        width: dimensions.length,
        height: dimensions.depth,
        thickness: dimensions.thickness,
        tolerance: dimensions.tolerance,
      },
      materials: materials.map((m: any, i: number) => ({
        layer: i + 1,
        material: m.name || m.material || 'Unknown',
        thickness: m.thickness,
        function: m.function,
      })),
      specifications: {
        application: dataSource.application,
        heatResistance: dataSource.heat_resistance,
        coldResistance: dataSource.cold_resistance,
        transparency: dataSource.transparency,
        waterResistance: dataSource.water_resistance,
        airTightness: dataSource.air_tightness,
        moistureResistance: dataSource.moisture_resistance,
        antistatic: dataSource.antistatic,
        uvProtection: dataSource.uv_protection,
        features: dataSource.features || [],
      },
      performance: dataSource.performance ? {
        tensileStrength: dataSource.performance.tensile_strength,
        tearStrength: dataSource.performance.tear_strength,
        sealStrength: dataSource.performance.seal_strength,
        wvtr: dataSource.performance.wvtr,
        otr: dataSource.performance.otr,
      } : undefined,
      compliance: dataSource.compliance ? {
        foodSanitationAct: dataSource.compliance.food_sanitation_act,
        jisStandards: dataSource.compliance.jis_standards,
        isoStandards: dataSource.compliance.iso_standards,
        otherStandards: dataSource.compliance.other_standards,
      } : undefined,
    },
    production: {
      method: dataSource.production_method || 'Standard',
      process: dataSource.production_process || ['Design', 'Printing', 'Lamination', 'Slitting', 'Bag Making'],
      equipment: dataSource.equipment,
      qualityControl: {
        inspectionStandards: dataSource.inspection_standards || ['Visual inspection', 'Dimension check', 'Seal strength test'],
        testMethods: dataSource.test_methods,
        aqlStandards: dataSource.aql_standards,
      },
      packaging: {
        unit: dataSource.packaging_unit || 'pcs',
        quantity: dataSource.packaging_quantity || 1000,
        packingSpec: dataSource.packing_spec || 'Standard export packing',
      },
      delivery: {
        leadTime: dataSource.lead_time || '4-6 weeks',
        minLotSize: dataSource.min_lot_size || 1000,
        lotUnit: dataSource.lot_unit || 'pcs',
      },
    },
    design: dataSource.printing ? {
      printing: {
        method: dataSource.printing.method || 'gravure',
        colors: dataSource.printing.colors || 9,
        sides: dataSource.printing.sides || 'both',
        finishing: dataSource.printing.finishing,
      },
      colorGuide: dataSource.color_guide ? {
        baseColors: dataSource.color_guide.base_colors,
        spotColors: dataSource.color_guide.spot_colors,
        colorCodes: dataSource.color_guide.color_codes,
      } : undefined,
      designData: dataSource.design_data ? {
        format: dataSource.design_data.format || 'AI',
        resolution: dataSource.design_data.resolution || '300dpi',
        colorMode: dataSource.design_data.color_mode || 'CMYK',
        fileUrl: dataSource.design_data.file_url,
      } : undefined,
    } : undefined,
    pricing: dataSource.pricing ? {
      basePrice: {
        unitPrice: dataSource.pricing.unit_price || 0,
        moq: dataSource.pricing.moq || 1000,
        currency: 'JPY',
      },
      volumeDiscount: dataSource.pricing.volume_discount,
      options: dataSource.pricing.options,
      validityPeriod: dataSource.pricing.validity_period || '90 days',
    } : undefined,
    remarks: correction?.admin_notes || dataSource.remarks,
    attachments: correction?.corrected_files ? correction.corrected_files.map((url: string, i: number) => ({
      id: `file-${i}`,
      name: url.split('/').pop() || 'file',
      type: 'application/pdf',
      size: 0,
      url,
      uploadedAt: new Date().toISOString(),
    })) : [],
  };
}
