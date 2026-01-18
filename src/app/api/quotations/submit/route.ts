/**
 * POST /api/quotations/submit
 *
 * Submit a new quotation with items for admin review
 *
 * ALL DATABASE OPERATIONS USE SUPABASE SQL EXECUTION
 * (Server-side alternative to Supabase MCP for production use)
 *
 * Request body:
 * {
 *   items: Array<{
 *     product_name: string;
 *     quantity: number;
 *     unit_price: number;
 *     total_price: number;
 *     category?: string;
 *     specifications?: object;
 *     notes?: string;
 *   }>;
 *   notes?: string;
 *   urgency?: 'normal' | 'urgent' | 'expedited';
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import {
  getQuotationProfile,
  generateQuotationNumber,
  insertQuotation,
  insertQuotationItems,
  getCompleteQuotation,
  deleteQuotation,
} from '@/lib/supabase-sql';

interface QuotationItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category?: string;
  specifications?: object;
  notes?: string;
}

interface SubmitRequestBody {
  items: QuotationItem[];
  notes?: string;
  urgency?: 'normal' | 'urgent' | 'expedited';
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabase } = createSupabaseSSRClient(request);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const body = await request.json() as SubmitRequestBody;

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: '最少でも1つの商品が必要です。' },
        { status: 400 }
      );
    }

    // Validate items
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];

      if (!item.product_name || !item.product_name.trim()) {
        return NextResponse.json(
          { error: `商品 ${i + 1}: 商品名は必須です。` },
          { status: 400 }
        );
      }

      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: `商品 ${i + 1}: 数量は0より大きくなければなりません。` },
          { status: 400 }
        );
      }

      if (item.unit_price === undefined || item.unit_price < 0) {
        return NextResponse.json(
          { error: `商品 ${i + 1}: 単価は必須です。` },
          { status: 400 }
        );
      }

      if (item.total_price === undefined || item.total_price < 0) {
        return NextResponse.json(
          { error: `商品 ${i + 1}: 合計は必須です。` },
          { status: 400 }
        );
      }
    }

    // ============================================================
    // DATABASE OPERATION 1: Get user profile (Supabase SQL)
    // ============================================================

    const profileResult = await getQuotationProfile(user.id);

    if (profileResult.error) {
      console.error('[Supabase SQL] Error fetching profile:', profileResult.error);
    }

    const profile = profileResult.data?.[0];
    const customerName = profile
      ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
      : user.email?.split('@')[0] || '未登録';

    // Calculate totals
    const subtotal = body.items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.1; // Japanese consumption tax (10%)
    const totalAmount = subtotal + taxAmount;

    // ============================================================
    // DATABASE OPERATION 2: Generate quotation number (Supabase SQL)
    // ============================================================

    const lastQuotationResult = await generateQuotationNumber();

    let sequenceNumber = 1;
    if (lastQuotationResult.data && lastQuotationResult.data.length > 0) {
      const lastSeq = parseInt(lastQuotationResult.data[0].quotation_number.split('-')[2]);
      sequenceNumber = lastSeq + 1;
    }

    const currentYear = new Date().getFullYear();
    const quotationNumber = `QT-${currentYear}-${String(sequenceNumber).padStart(4, '0')}`;

    // ============================================================
    // DATABASE OPERATION 3: Insert quotation (Supabase SQL)
    // ============================================================

    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const insertQuotationResult = await insertQuotation({
      user_id: user.id,
      quotation_number: quotationNumber,
      status: 'SENT', // Submitted for review
      customer_name: customerName,
      customer_email: user.email || '',
      customer_phone: profile?.corporate_phone || null,
      subtotal_amount: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      subtotal: subtotal, // Alias for compatibility
      notes: body.notes || null,
      valid_until: validUntil,
      sent_at: new Date().toISOString(),
    });

    if (insertQuotationResult.error || !insertQuotationResult.data || insertQuotationResult.data.length === 0) {
      console.error('[Supabase SQL] Error creating quotation:', insertQuotationResult.error);
      return NextResponse.json(
        { error: '見積の作成に失敗しました。' },
        { status: 500 }
      );
    }

    const quotationId = insertQuotationResult.data[0].id;

    // ============================================================
    // DATABASE OPERATION 4: Insert quotation items (Supabase SQL)
    // ============================================================

    const itemsToInsert = body.items.map((item, index) => ({
      quotation_id: quotationId,
      display_order: index,
      product_name: item.product_name,
      category: item.category || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      specifications: item.specifications ? JSON.stringify(item.specifications) : null,
      notes: item.notes || null,
    }));

    const insertItemsResult = await insertQuotationItems(itemsToInsert);

    if (insertItemsResult.error) {
      console.error('[Supabase SQL] Error creating quotation items:', insertItemsResult.error);

      // Rollback quotation creation
      await deleteQuotation(quotationId);

      return NextResponse.json(
        { error: '見積明細の作成に失敗しました。' },
        { status: 500 }
      );
    }

    // ============================================================
    // DATABASE OPERATION 5: Fetch complete quotation with items (Supabase SQL)
    // ============================================================

    const completeQuotationResult = await getCompleteQuotation(quotationId);

    if (completeQuotationResult.error || !completeQuotationResult.data || completeQuotationResult.data.length === 0) {
      console.error('[Supabase SQL] Error fetching complete quotation:', completeQuotationResult.error);
    }

    const completeQuotation = completeQuotationResult.data?.[0];

    // Map quotation_items to items for consistency
    const finalQuotation = completeQuotation ? {
      ...completeQuotation,
      items: completeQuotation.quotation_items || [],
      quotation_items: undefined, // Remove the temp field
    } : {
      id: quotationId,
      quotation_number: quotationNumber,
      status: 'SENT',
      items: body.items.map((item, index) => ({
        id: `temp-${index}`,
        quotation_id: quotationId,
        product_name: item.product_name,
        category: item.category || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        specifications: item.specifications || null,
        notes: item.notes || null,
        display_order: index,
        created_at: new Date().toISOString(),
      })),
    };

    console.log('[API /quotations/submit] Quotation submitted successfully (via Supabase SQL):', {
      quotationId,
      quotationNumber,
      status: 'SENT',
      itemCount: body.items.length,
      totalAmount,
    });

    return NextResponse.json(
      {
        success: true,
        quotation: finalQuotation,
        message: '見積を提出しました。管理者が確認次第、ご連絡いたします。'
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Error in POST /api/quotations/submit:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
