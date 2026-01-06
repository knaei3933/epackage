/**
 * Shipment Tracking Service
 * Integrates with multiple carrier APIs to track shipments
 * and update database with real-time tracking information
 */

import { createServiceClient } from '@/lib/supabase';
import {
  CarrierType,
  ShipmentStatus,
  TrackingEvent,
  TrackingInfo,
  CarrierTrackingResponse,
} from '@/types/shipment';
import { getTrackingStatus } from './shipping-carriers';

// =====================================================
// Types
// =====================================================

export interface TrackingUpdateResult {
  success: boolean;
  shipmentId: string;
  trackingNumber: string;
  status?: ShipmentStatus;
  estimatedDelivery?: string;
  eventsAdded?: number;
  error?: string;
}

export interface ShipmentTrackingDetails {
  shipmentId: string;
  shipmentNumber: string;
  orderId: string;
  carrier: CarrierType;
  trackingNumber?: string;
  status: ShipmentStatus;
  estimatedDelivery?: Date;
  trackingUrl?: string;
  trackingEvents: TrackingEvent[];
  currentLocation?: string;
  deliveryAttempts: number;
  signatureRequired: boolean;
  signatureUrl?: string;
}

// =====================================================
// Tracking Service Class
// =====================================================

class ShipmentTrackingService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
  }

  // =====================================================
  // Main Tracking Update Methods
  // =====================================================

  /**
   * Update tracking information for a single shipment
   */
  async updateShipmentTracking(
    shipmentId: string
  ): Promise<TrackingUpdateResult> {
    try {
      // Get shipment details
      const { data: shipment, error } = await this.supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (error || !shipment) {
        throw new Error(`Shipment not found: ${shipmentId}`);
      }

      if (!shipment.tracking_number) {
        return {
          success: false,
          shipmentId,
          trackingNumber: 'N/A',
          error: 'No tracking number assigned',
        };
      }

      // Get tracking status from carrier
      const carrier = shipment.carrier_code as CarrierType;
      const trackingInfo = await getTrackingStatus(
        carrier,
        shipment.tracking_number
      );

      // Process and store tracking events
      const eventsAdded = await this.storeTrackingEvents(
        shipmentId,
        trackingInfo.events
      );

      // Update shipment with latest tracking data
      const updateData: any = {
        tracking_status_code: trackingInfo.current_status,
        status: this.mapStatusToDb(trackingInfo.current_status),
        tracking_events: trackingInfo.events,
        tracking_history: this.buildTrackingHistory(
          shipment.tracking_history || [],
          trackingInfo.events
        ),
        last_tracking_update: new Date().toISOString(),
      };

      // Update estimated delivery if provided
      if (trackingInfo.estimated_delivery) {
        updateData.estimated_delivery_date = trackingInfo.estimated_delivery;
      }

      // Update delivery timestamp if delivered
      if (trackingInfo.current_status === ShipmentStatus.DELIVERED) {
        updateData.actual_delivery_date = new Date().toISOString();
        updateData.delivered_at = new Date().toISOString();
      }

      // Update timestamps based on status
      if (trackingInfo.current_status === ShipmentStatus.PICKED_UP) {
        updateData.pickup_confirmed = true;
        updateData.pickup_confirmed_at = new Date().toISOString();
      } else if (trackingInfo.current_status === ShipmentStatus.IN_TRANSIT) {
        if (!shipment.in_transit_since) {
          updateData.in_transit_since = new Date().toISOString();
        }
      } else if (trackingInfo.current_status === ShipmentStatus.OUT_FOR_DELIVERY) {
        if (!shipment.out_for_delivery_since) {
          updateData.out_for_delivery_since = new Date().toISOString();
        }
      }

      // Update current location from latest event
      if (trackingInfo.events.length > 0) {
        const latestEvent = trackingInfo.events[0];
        updateData.current_location = latestEvent.location;
      }

      // Update shipment in database
      const { error: updateError } = await this.supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipmentId);

      if (updateError) {
        throw new Error(`Failed to update shipment: ${updateError.message}`);
      }

      return {
        success: true,
        shipmentId,
        trackingNumber: shipment.tracking_number,
        status: trackingInfo.current_status,
        estimatedDelivery: trackingInfo.estimated_delivery,
        eventsAdded,
      };
    } catch (error) {
      console.error('Error updating shipment tracking:', error);
      return {
        success: false,
        shipmentId,
        trackingNumber: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch update tracking for multiple shipments
   */
  async updateMultipleShipments(shipmentIds: string[]): Promise<TrackingUpdateResult[]> {
    const results: TrackingUpdateResult[] = [];

    // Process in batches to avoid overwhelming carrier APIs
    const batchSize = 5;
    for (let i = 0; i < shipmentIds.length; i += batchSize) {
      const batch = shipmentIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((id) => this.updateShipmentTracking(id))
      );
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < shipmentIds.length) {
        await this.delay(2000); // 2 second delay between batches
      }
    }

    return results;
  }

  /**
   * Update all active shipments (scheduled job)
   */
  async updateAllActiveShipments(): Promise<{
    updated: number;
    failed: number;
    results: TrackingUpdateResult[];
  }> {
    // Get all active shipments with tracking numbers
    const { data: shipments, error } = await this.supabase
      .from('shipments')
      .select('id')
      .in('status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery'])
      .not('tracking_number', 'is', null);

    if (error || !shipments) {
      throw new Error('Failed to fetch active shipments');
    }

    const shipmentIds = shipments.map((s) => s.id);
    const results = await this.updateMultipleShipments(shipmentIds);

    const updated = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return { updated, failed, results };
  }

  // =====================================================
  // Tracking Information Retrieval
  // =====================================================

  /**
   * Get comprehensive tracking details for a shipment
   */
  async getShipmentTrackingDetails(
    shipmentId: string
  ): Promise<ShipmentTrackingDetails | null> {
    const { data: shipment, error } = await this.supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (error || !shipment) {
      return null;
    }

    // Get tracking events
    const { data: events } = await this.supabase
      .from('shipment_tracking_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('event_time', { ascending: false });

    return {
      shipmentId: shipment.id,
      shipmentNumber: shipment.shipment_number,
      orderId: shipment.order_id,
      carrier: shipment.carrier_code as CarrierType,
      trackingNumber: shipment.tracking_number,
      status: shipment.status as ShipmentStatus,
      estimatedDelivery: shipment.estimated_delivery_date
        ? new Date(shipment.estimated_delivery_date)
        : undefined,
      trackingUrl: this.buildTrackingUrl(
        shipment.carrier_code,
        shipment.tracking_number
      ),
      trackingEvents: (events || []).map(this.mapDbEventToTrackingEvent),
      currentLocation: shipment.current_location,
      deliveryAttempts: shipment.delivery_attempts || 0,
      signatureRequired: shipment.delivery_signature_required || false,
      signatureUrl: shipment.delivery_signature_url,
    };
  }

  /**
   * Get tracking information summary
   */
  async getTrackingInfo(
    shipmentId: string
  ): Promise<TrackingInfo | null> {
    const details = await this.getShipmentTrackingDetails(shipmentId);
    if (!details) return null;

    return {
      carrier: details.carrier,
      trackingNumber: details.trackingNumber || '',
      status: details.status,
      estimatedDelivery: details.estimatedDelivery,
      tracking_history: details.trackingEvents,
    };
  }

  /**
   * Add manual tracking event
   */
  async addManualTrackingEvent(
    shipmentId: string,
    status: string,
    description: string,
    location?: string
  ): Promise<void> {
    const event = {
      shipment_id: shipmentId,
      status,
      event_time: new Date().toISOString(),
      location,
      description,
      raw_data: { manual: true },
    };

    const { error } = await this.supabase
      .from('shipment_tracking_events')
      .insert(event);

    if (error) {
      throw new Error(`Failed to add tracking event: ${error.message}`);
    }
  }

  // =====================================================
  // Delivery Management
  // =====================================================

  /**
   * Mark delivery attempt
   */
  async recordDeliveryAttempt(
    shipmentId: string,
    success: boolean,
    notes?: string,
    signatureUrl?: string
  ): Promise<void> {
    const { data: shipment } = await this.supabase
      .from('shipments')
      .select('delivery_attempts')
      .eq('id', shipmentId)
      .single();

    const attempts = (shipment?.delivery_attempts || 0) + 1;

    const updateData: any = {
      delivery_attempts: attempts,
    };

    if (success) {
      updateData.status = 'delivered';
      updateData.actual_delivery_date = new Date().toISOString();
      updateData.delivered_at = new Date().toISOString();
    }

    if (signatureUrl) {
      updateData.delivery_signature_url = signatureUrl;
    }

    await this.addManualTrackingEvent(
      shipmentId,
      success ? 'DELIVERED' : 'DELIVERY_ATTEMPTED',
      success ? '配達完了' : '配達試行',
      notes
    );

    const { error } = await this.supabase
      .from('shipments')
      .update(updateData)
      .eq('id', shipmentId);

    if (error) {
      throw new Error(`Failed to record delivery attempt: ${error.message}`);
    }
  }

  /**
   * Record shipping exception
   */
  async recordShippingException(
    shipmentId: string,
    exceptionType: string,
    description: string,
    resolved: boolean = false
  ): Promise<void> {
    const { data: shipment } = await this.supabase
      .from('shipments')
      .select('shipping_exceptions')
      .eq('id', shipmentId)
      .single();

    const exceptions = shipment?.shipping_exceptions || [];
    exceptions.push({
      type: exceptionType,
      description,
      resolved,
      timestamp: new Date().toISOString(),
    });

    const { error } = await this.supabase
      .from('shipments')
      .update({
        shipping_exceptions: exceptions,
      })
      .eq('id', shipmentId);

    if (error) {
      throw new Error(`Failed to record exception: ${error.message}`);
    }

    await this.addManualTrackingEvent(
      shipmentId,
      'EXCEPTION',
      `${exceptionType}: ${description}`
    );
  }

  // =====================================================
  // Helper Methods
  // =====================================================

  private async storeTrackingEvents(
    shipmentId: string,
    events: Array<{
      datetime: string;
      status: string;
      location?: string;
      description_ja: string;
      description_en: string;
    }>
  ): Promise<number> {
    let added = 0;

    for (const event of events) {
      // Check if event already exists
      const { data: existing } = await this.supabase
        .from('shipment_tracking_events')
        .select('id')
        .eq('shipment_id', shipmentId)
        .eq('event_time', event.datetime)
        .eq('status', event.status)
        .single();

      if (!existing) {
        const { error } = await this.supabase
          .from('shipment_tracking_events')
          .insert({
            shipment_id: shipmentId,
            status: event.status,
            event_time: event.datetime,
            location: event.location,
            description: event.description_en,
            raw_data: event,
          });

        if (!error) {
          added++;
        }
      }
    }

    return added;
  }

  private buildTrackingHistory(
    existing: any[],
    newEvents: any[]
  ): any[] {
    const history = [...existing];
    for (const event of newEvents) {
      history.push({
        timestamp: event.datetime,
        status: event.status,
        location: event.location,
        description: event.description_en,
      });
    }
    return history;
  }

  private mapStatusToDb(status: ShipmentStatus): string {
    const mapping: Record<ShipmentStatus, string> = {
      [ShipmentStatus.PENDING]: 'pending',
      [ShipmentStatus.PICKED_UP]: 'picked_up',
      [ShipmentStatus.IN_TRANSIT]: 'in_transit',
      [ShipmentStatus.OUT_FOR_DELIVERY]: 'out_for_delivery',
      [ShipmentStatus.DELIVERED]: 'delivered',
      [ShipmentStatus.FAILED]: 'failed',
      [ShipmentStatus.RETURNED]: 'returned',
    };
    return mapping[status];
  }

  private mapDbEventToTrackingEvent(event: any): TrackingEvent {
    return {
      id: event.id,
      shipment_id: event.shipment_id,
      event_time: event.event_time,
      status: event.status,
      location: event.location,
      description_ja: event.description || '',
      description_en: event.description || '',
      raw_data: event.raw_data,
      created_at: event.created_at,
    };
  }

  private buildTrackingUrl(carrierCode: string, trackingNumber?: string): string | undefined {
    if (!trackingNumber) return undefined;

    const urls: Record<string, string> = {
      yamato: `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number=${trackingNumber}`,
      sagawa: `https://k2k.sagawa-exp.co.jp/p/web/okurijosearch.do?okurijoNo=${trackingNumber}`,
      jp_post: `https://tracking.post.japanpost.jp/services/english/trace.html?searchStr=${trackingNumber}`,
      seino: `https://track.seino.co.jp/kamotsu/TrackNoTop?nos=${trackingNumber}`,
    };

    return urls[carrierCode.toLowerCase()];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =====================================================
// Export singleton instance
// =====================================================

export const shipmentTrackingService = new ShipmentTrackingService();
export default shipmentTrackingService;
