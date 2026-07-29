/**
 * Shipment Tracking API Routes
 * Provides endpoints for tracking updates and information
 *
 * SECURITY: withMemberAuth で管理系ロール（ADMIN/OPERATOR/SALES）に制限。
 * createServiceClient は RLS を完全バイパスするため、認可制限で保護
 * （未認証 401・member/KOREA_DESIGNER 403・POST/PUT の配送記録改ざんリスクを解消）。
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { shipmentTrackingService } from '@/lib/shipment-tracking-service';
import { withMemberAuth } from '@/lib/api-auth';
import { SHIPMENTS_ALLOWED_ROLES } from '@/lib/shipments-constants';

// =====================================================
// GET /api/shipments/tracking
// Get tracking information for a shipment
// =====================================================

export const GET = withMemberAuth<any>(
  async (request) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const shipmentId = searchParams.get('shipmentId');
      const shipmentNumber = searchParams.get('shipmentNumber');
      const trackingNumber = searchParams.get('trackingNumber');

      // Validate request
      if (!shipmentId && !shipmentNumber && !trackingNumber) {
        return NextResponse.json(
          { error: 'Must provide shipmentId, shipmentNumber, or trackingNumber' },
          { status: 400 }
        );
      }

      const supabase = createServiceClient();

      // Find shipment if not provided by ID
      let targetShipmentId = shipmentId;

      if (!targetShipmentId && (shipmentNumber || trackingNumber)) {
        // PostgREST の or フィルタで value をダブルクォートで囲み、
        // shipmentNumber / trackingNumber に含まれる , や .（合法追跡番号の国際フォーマット含む）が
        // フィルタ区切り / 演算子区切りとして誤認されるのを防ぐ。
        // 合法追跡番号の . を破壊しない（strip ではなくクォートで保護）。
        const quoteValue = (v: string) => `"${v.replace(/"/g, '\\"')}"`;
        const filters: string[] = [];
        if (shipmentNumber) filters.push(`shipment_number.eq.${quoteValue(shipmentNumber)}`);
        if (trackingNumber) filters.push(`tracking_number.eq.${quoteValue(trackingNumber)}`);

        const { data: shipment, error } = await supabase
          .from('shipments')
          .select('id')
          .or(filters.join(','))
          .single();

        if (error || !shipment) {
          return NextResponse.json(
            { error: 'Shipment not found' },
            { status: 404 }
          );
        }

        targetShipmentId = shipment.id;
      }

      // Get tracking details
      const trackingDetails = await shipmentTrackingService.getShipmentTrackingDetails(
        targetShipmentId as string
      );

      if (!trackingDetails) {
        return NextResponse.json(
          { error: 'Tracking information not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(trackingDetails);
    } catch (error) {
      console.error('Error fetching tracking information:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tracking information' },
        { status: 500 }
      );
    }
  },
  { allowedRoles: SHIPMENTS_ALLOWED_ROLES },
);

// =====================================================
// POST /api/shipments/tracking
// Update tracking information (manual trigger or webhook)
// =====================================================

export const POST = withMemberAuth<any>(
  async (request) => {
    try {
      const body = await request.json();
      const { shipmentId, action } = body;

      if (!shipmentId) {
        return NextResponse.json(
          { error: 'shipmentId is required' },
          { status: 400 }
        );
      }

      // Handle different actions
      switch (action) {
        case 'update':
          // Update tracking from carrier API
          const result = await shipmentTrackingService.updateShipmentTracking(shipmentId);
          return NextResponse.json(result);

        case 'delivery_attempt':
          // Record delivery attempt
          const { success, notes, signatureUrl } = body;
          await shipmentTrackingService.recordDeliveryAttempt(
            shipmentId,
            success,
            notes,
            signatureUrl
          );
          return NextResponse.json({ success: true });

        case 'exception':
          // Record shipping exception
          const { exceptionType, description, resolved } = body;
          await shipmentTrackingService.recordShippingException(
            shipmentId,
            exceptionType,
            description,
            resolved
          );
          return NextResponse.json({ success: true });

        case 'manual_event':
          // Add manual tracking event
          const { status, description: eventDescription, location } = body;
          await shipmentTrackingService.addManualTrackingEvent(
            shipmentId,
            status,
            eventDescription,
            location
          );
          return NextResponse.json({ success: true });

        default:
          return NextResponse.json(
            { error: 'Invalid action. Supported: update, delivery_attempt, exception, manual_event' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update tracking' },
        { status: 500 }
      );
    }
  },
  { allowedRoles: SHIPMENTS_ALLOWED_ROLES },
);

// =====================================================
// PUT /api/shipments/tracking
// Batch update multiple shipments
// =====================================================

export const PUT = withMemberAuth<any>(
  async (request) => {
    try {
      const body = await request.json();
      const { shipmentIds, updateAll } = body;

      let results;

      if (updateAll) {
        // Update all active shipments
        results = await shipmentTrackingService.updateAllActiveShipments();
      } else if (shipmentIds && Array.isArray(shipmentIds)) {
        // Update specific shipments
        results = await shipmentTrackingService.updateMultipleShipments(shipmentIds);
      } else {
        return NextResponse.json(
          { error: 'Must provide shipmentIds array or set updateAll=true' },
          { status: 400 }
        );
      }

      return NextResponse.json(results);
    } catch (error) {
      console.error('Error in batch tracking update:', error);
      return NextResponse.json(
        { error: 'Failed to update tracking' },
        { status: 500 }
      );
    }
  },
  { allowedRoles: SHIPMENTS_ALLOWED_ROLES },
);
