/**
 * Shipment Processing System Types
 * For Epackage Lab Japanese B2B System
 */

// Carrier types (配送業者)
export enum CarrierType {
  YAMATO = 'yamato',      // ヤマト運輸 (宅急便)
  SAGAWA = 'sagawa',      // 佐川急便
  JP_POST = 'jp_post',    // 日本郵便
  SEINO = 'seino',        // 西濃運輸
}

// Shipment status (配送ステータス)
export enum ShipmentStatus {
  PENDING = 'pending',                  // 待機中
  PICKED_UP = 'picked_up',              // 引渡済み
  IN_TRANSIT = 'in_transit',            // 輸送中
  OUT_FOR_DELIVERY = 'out_for_delivery', // 配達中
  DELIVERED = 'delivered',              // 配達完了
  FAILED = 'failed',                    // 配達失敗
  RETURNED = 'returned',                // 返品
}

// Service types (配送サービス種別)
export enum ShippingServiceType {
  COOL = 'cool',        // クール宅急便 (refrigerated)
  TAKKYUBIN = 'takkyubin', // 宅急便 (regular)
  REGULAR = 'regular',   // 通常便
  MAIL = 'mail',         // メール便 (small packet)
}

// Delivery time slots (配達時間帯)
export enum DeliveryTimeSlot {
  NONE = 'none',        // 指定なし
  MORNING = 'morning',  // 午前 (8-12)
  TIME_12_14 = '12_14', // 12-14時
  TIME_14_16 = '14_16', // 14-16時
  TIME_16_18 = '16_18', // 16-18時
  TIME_18_20 = '18_20', // 18-20時
  TIME_19_21 = '19_21', // 19-21時
}

// Localized carrier names
export const CARRIER_NAMES: Record<CarrierType, { ja: string; en: string }> = {
  [CarrierType.YAMATO]: { ja: 'ヤマト運輸', en: 'Yamato Transport' },
  [CarrierType.SAGAWA]: { ja: '佐川急便', en: 'Sagawa Express' },
  [CarrierType.JP_POST]: { ja: '日本郵便', en: 'Japan Post' },
  [CarrierType.SEINO]: { ja: '西濃運輸', en: 'Seino Transport' },
};

// Localized status names
export const SHIPMENT_STATUS_NAMES: Record<ShipmentStatus, { ja: string; en: string }> = {
  [ShipmentStatus.PENDING]: { ja: '待機中', en: 'Pending Pickup' },
  [ShipmentStatus.PICKED_UP]: { ja: '引渡済み', en: 'Picked Up' },
  [ShipmentStatus.IN_TRANSIT]: { ja: '輸送中', en: 'In Transit' },
  [ShipmentStatus.OUT_FOR_DELIVERY]: { ja: '配達中', en: 'Out for Delivery' },
  [ShipmentStatus.DELIVERED]: { ja: '配達完了', en: 'Delivered' },
  [ShipmentStatus.FAILED]: { ja: '配達失敗', en: 'Delivery Failed' },
  [ShipmentStatus.RETURNED]: { ja: '返品', en: 'Returned' },
};

// Localized service type names
export const SERVICE_TYPE_NAMES: Record<ShippingServiceType, { ja: string; en: string }> = {
  [ShippingServiceType.COOL]: { ja: 'クール宅急便', en: 'Cool Takkyubin' },
  [ShippingServiceType.TAKKYUBIN]: { ja: '宅急便', en: 'Takkyubin' },
  [ShippingServiceType.REGULAR]: { ja: '通常便', en: 'Regular' },
  [ShippingServiceType.MAIL]: { ja: 'メール便', en: 'Mail' },
};

// Localized time slot names
export const TIME_SLOT_NAMES: Record<DeliveryTimeSlot, { ja: string; en: string }> = {
  [DeliveryTimeSlot.NONE]: { ja: '指定なし', en: 'No Preference' },
  [DeliveryTimeSlot.MORNING]: { ja: '午前 (8-12時)', en: 'Morning (8-12)' },
  [DeliveryTimeSlot.TIME_12_14]: { ja: '12-14時', en: '12:00-14:00' },
  [DeliveryTimeSlot.TIME_14_16]: { ja: '14-16時', en: '14:00-16:00' },
  [DeliveryTimeSlot.TIME_16_18]: { ja: '16-18時', en: '16:00-18:00' },
  [DeliveryTimeSlot.TIME_18_20]: { ja: '18-20時', en: '18:00-20:00' },
  [DeliveryTimeSlot.TIME_19_21]: { ja: '19-21時', en: '19:00-21:00' },
};

// Package dimensions
export interface PackageDimensions {
  length: number;  // cm
  width: number;   // cm
  height: number;  // cm
}

// Address structure
export interface ShippingAddress {
  name: string;        // 氏名
  postal_code: string; // 郵便番号 (e.g., "100-0001")
  prefecture: string;  // 都道府県
  city: string;        // 市区町村
  address: string;     // 番地
  building?: string;   // 建物名
  phone: string;       // 電話番号
}

// Shipment record
export interface Shipment {
  id: string;
  shipment_number: string;
  order_id: string;

  // Carrier info
  carrier: CarrierType;
  service_type: ShippingServiceType;
  tracking_number?: string;

  // Package info
  package_count: number;
  weight_kg?: number;
  dimensions_cm?: PackageDimensions;

  // Delivery preferences
  delivery_time_slot: DeliveryTimeSlot;
  delivery_date_request?: string; // YYYY-MM-DD

  // Addresses
  shipping_address: ShippingAddress;
  sender_address: ShippingAddress;

  // Dates
  pickup_scheduled_for?: string;
  picked_up_at?: string;
  estimated_delivery?: string;
  delivered_at?: string;

  // Status
  status: ShipmentStatus;

  // Tracking data
  tracking_data: Record<string, any>;

  // Documents
  shipping_label_url?: string;
  commercial_invoice_url?: string;
  pickup_slip_url?: string;

  // Pricing
  shipping_cost?: number;
  cod_amount?: number;

  // Notes
  internal_notes?: string;
  customer_notes?: string;
  carrier_notes?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

// Tracking event
export interface TrackingEvent {
  id: string;
  shipment_id: string;
  event_time: string;
  status: string;
  location?: string;
  description_ja: string;
  description_en: string;
  raw_data?: Record<string, any>;
  created_at: string;
}

// Tracking info summary
export interface TrackingInfo {
  carrier: CarrierType;
  tracking_number: string;
  status: ShipmentStatus;
  estimated_delivery?: Date;
  tracking_history: TrackingEvent[];
}

// Shipment notification
export interface ShipmentNotification {
  id: string;
  shipment_id: string;
  notification_type: string;
  recipient_email: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  provider_message_id?: string;
}

// Create shipment request
export interface CreateShipmentRequest {
  order_id: string;
  carrier: CarrierType;
  service_type?: ShippingServiceType;
  pickup_scheduled_for?: string; // ISO datetime
  delivery_time_slot?: DeliveryTimeSlot;
  delivery_date_request?: string; // YYYY-MM-DD
  package_count?: number;
  weight_kg?: number;
  dimensions_cm?: PackageDimensions;
  customer_notes?: string;
}

// Schedule pickup request
export interface SchedulePickupRequest {
  pickup_time: string; // ISO datetime
  special_instructions?: string;
}

// Bulk create request
export interface BulkCreateShipmentRequest {
  order_ids: string[];
  carrier: CarrierType;
  service_type?: ShippingServiceType;
  pickup_scheduled_for?: string;
}

// Carrier API response structures
export interface CarrierShipmentResponse {
  tracking_number: string;
  label_url?: string;
  pickup_confirmation?: string;
  estimated_delivery?: string;
  raw_response: Record<string, any>;
}

export interface CarrierTrackingResponse {
  current_status: ShipmentStatus;
  estimated_delivery?: string;
  events: Array<{
    datetime: string;
    status: string;
    location?: string;
    description_ja: string;
    description_en: string;
  }>;
  raw_response: Record<string, any>;
}

// Shipment list filters
export interface ShipmentFilters {
  status?: ShipmentStatus;
  carrier?: CarrierType;
  tracking_number?: string;
  order_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string; // Search in shipment_number or customer name
}

// Shipment list response
export interface ShipmentListResponse {
  shipments: Shipment[];
  total: number;
  page: number;
  page_size: number;
}

// Order validation for shipment readiness
export interface OrderShipmentReadiness {
  is_ready: boolean;
  reasons?: string[];
  order?: {
    id: string;
    order_number: string;
    production_status: string;
    payment_status: string;
    shipping_address: ShippingAddress;
  };
}

// Carrier API configuration
export interface CarrierApiConfig {
  apiKey: string;
  senderCode?: string;
  contractCode?: string;
  endpoint: string;
  sandbox?: boolean;
}

// Error types
export class ShipmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ShipmentError';
  }
}

export class CarrierApiError extends Error {
  constructor(
    message: string,
    public carrier: CarrierType,
    public details?: any
  ) {
    super(message);
    this.name = 'CarrierApiError';
  }
}
