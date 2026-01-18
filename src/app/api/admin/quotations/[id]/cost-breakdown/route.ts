/**
 * Admin API: Get Cost Breakdown for a Quotation
 *
 * Returns detailed cost breakdown for a quotation including:
 * - SKU-level costs
 * - Material, printing, lamination, slitter, pouch processing costs
 * - Duty and delivery costs
 * - Total cost vs. selling price
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/quotations/[id]/cost-breakdown
 *
 * Get detailed cost breakdown for a quotation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const quotationId = params.id;

    // Get quotation details
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('id, quotation_number, sku_count, total_meters, loss_meters, total_cost_breakdown, total_amount')
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Get SKU quotes if available
    const { data: skuQuotes, error: skuError } = await supabase
      .from('sku_quotes')
      .select('*')
      .eq('quote_id', quotationId)
      .order('sku_index');

    // If no SKU quotes, check quotation_items for legacy data
    let legacyItems = null;
    if (!skuQuotes || skuError || skuQuotes.length === 0) {
      const { data: items } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotationId);

      legacyItems = items;
    }

    // Calculate total cost from data
    let totalCost = 0;

    if (skuQuotes && skuQuotes.length > 0) {
      // Calculate from SKU quotes
      totalCost = skuQuotes.reduce((sum, sku) => {
        const costBreakdown = sku.cost_breakdown as { totalCost?: number } | null;
        return sum + (costBreakdown?.totalCost || 0);
      }, 0);
    } else if (quotation.total_cost_breakdown) {
      // Calculate from quotation's total_cost_breakdown
      const breakdown = quotation.total_cost_breakdown as { totalCost?: number } | null;
      totalCost = breakdown?.totalCost || 0;
    } else if (legacyItems && legacyItems.length > 0) {
      // Calculate from legacy quotation_items
      totalCost = legacyItems.reduce((sum, item) => {
        const costBreakdown = item.cost_breakdown as { totalCost?: number } | null;
        return sum + (costBreakdown?.totalCost || 0);
      }, 0);
    }

    // Calculate profit
    const totalPrice = quotation.total_amount || 0;
    const profit = totalPrice - totalCost;
    const profitMargin = totalPrice > 0 ? (profit / totalPrice) * 100 : 0;

    // Build response
    const response = {
      quotation: {
        id: quotation.id,
        quotationNumber: quotation.quotation_number,
        skuCount: quotation.sku_count || 1,
        totalMeters: quotation.total_meters,
        lossMeters: quotation.loss_meters || 400,
        totalPrice: quotation.total_amount
      },
      totalCost: Math.round(totalCost),
      totalPrice: Math.round(totalPrice),
      profit: Math.round(profit),
      profitMargin: Math.round(profitMargin * 100) / 100,
      skus: skuQuotes && skuQuotes.length > 0
        ? skuQuotes.map(sku => ({
            skuIndex: sku.sku_index,
            skuCode: sku.sku_code,
            quantity: sku.quantity,
            theoreticalMeters: sku.theoretical_meters,
            securedMeters: sku.secured_meters,
            lossMeters: sku.loss_meters,
            totalMeters: sku.total_meters,
            costBreakdown: sku.cost_breakdown
          }))
        : legacyItems && legacyItems.length > 0
        ? legacyItems.map((item, index) => ({
            skuIndex: item.sku_index || index,
            quantity: item.quantity,
            theoreticalMeters: item.theoretical_meters,
            securedMeters: item.secured_meters,
            lossMeters: item.loss_meters,
            totalMeters: item.total_meters,
            costBreakdown: item.cost_breakdown
          }))
        : [],
      summary: quotation.total_cost_breakdown || null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cost breakdown:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
