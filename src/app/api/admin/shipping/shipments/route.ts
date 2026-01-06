import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

/**
 * GET /api/admin/shipping/shipments
 * 出荷一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    const searchParams = request.nextUrl.searchParams;
    const filterStatus = searchParams.get('status');
    const filterCarrier = searchParams.get('carrier');

    let query = supabase
      .from('shipments')
      .select(`
        *,
        orders!inner(
          id,
          order_number,
          customer_name
        )
      `)
      .order('created_at', { ascending: false });

    if (filterStatus && filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    if (filterCarrier && filterCarrier !== 'all') {
      query = query.eq('carrier_code', filterCarrier);
    }

    const { data: shipments, error } = await query;

    if (error) {
      console.error('出荷データ取得エラー:', error);
      return NextResponse.json(
        { error: '出荷データの取得に失敗しました' },
        { status: 500 }
      );
    }

    const transformedShipments = shipments?.map((s: ShipmentRow) => ({
      id: s.id,
      shipmentNumber: s.shipment_number,
      trackingNumber: s.tracking_number,
      orderNumber: s.orders?.order_number || '',
      customerName: s.orders?.customer_name || '',
      carrierName: s.carrier_name,
      carrierCode: s.carrier_code,
      status: s.status,
      shippedAt: s.shipped_at,
      estimatedDeliveryDate: s.estimated_delivery_date,
      deliveredAt: s.delivered_at,
      trackingUrl: s.tracking_url,
      shippingCost: s.shipping_cost,
      shippingMethod: s.shipping_method,
      serviceLevel: s.service_level,
      packageDetails: s.package_details,
      shippingNotes: s.shipping_notes,
      deliveryNotes: s.delivery_notes
    })) || [];

    return NextResponse.json(transformedShipments);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
