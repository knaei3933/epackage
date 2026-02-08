/**
 * Shipment Feature Types
 *
 * 配送管理機能に関連する型定義
 * @module types/features/shipment
 */

import type { Json } from '../database';

// =====================================================
// Shipment Types
// =====================================================

/**
 * 配送情報
 */
export interface Shipment {
  id: string;
  order_id: string;
  delivery_address_id: string | null;
  shipment_number: string;
  tracking_number: string | null;
  carrier_name: string;
  carrier_code: string | null;
  service_level: string | null;
  shipping_method: 'ground' | 'air' | 'sea' | 'rail' | 'courier';
  shipping_cost: number;
  currency: string;
  package_details: Json;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  status:
    | 'pending'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'failed'
    | 'returned'
    | 'cancelled';
  shipped_at: string | null;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  delivered_to: string | null;
  delivery_signature_url: string | null;
  delivery_photo_url: string | null;
  shipping_notes: string | null;
  delivery_notes: string | null;
}

/**
 * 配送追跡情報
 */
export interface ShipmentTracking {
  id: string;
  shipment_id: string;
  status_code: string;
  status_description: string;
  location: string | null;
  facility_name: string | null;
  event_data: Json;
  event_at: string;
  received_at: string;
  source: 'api' | 'manual' | 'webhook';
}

// =====================================================
// Delivery Address Types
// =====================================================

/**
 * 配送先住所
 */
export interface DeliveryAddress {
  id: string;
  user_id: string;
  name: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address: string;
  building: string | null;
  phone: string;
  contact_person: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 配送先作成入力
 */
export interface DeliveryAddressCreateInput {
  name: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  phone: string;
  contact_person?: string;
  is_default?: boolean;
}
