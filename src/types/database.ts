// =====================================================
// Base Types
// =====================================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

// =====================================================
// Import Unified Order Status Types
// =====================================================

/**
 * Order status types are now centralized in order-status.ts
 * This provides:
 * - Single source of truth for all order statuses
 * - Type-safe status transitions and validation
 * - Multilingual UI labels (Japanese/Korean/English)
 * - Legacy compatibility mapping
 * - Type guards for status checking
 */
export type {
  OrderStatus,
  OrderStatusLegacy,
  ProductionSubStatus,
} from '@/types/order-status';

export {
  ORDER_STATUS_LABELS,
  PRODUCTION_SUB_STATUS_LABELS,
  OrderStatusMapping,
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  getNextStatuses,
  isTerminalStatus,
  isActiveStatus,
  isOrderStatus,
  isOrderStatusLegacy,
  isProductionSubStatus,
  isProductionStatus,
  isContractStatus,
  isInitialPhase,
  isFulfillmentPhase,
  getStatusLabel,
  getStatusDescription,
  getStatusCategory,
  getProductionSubStatusLabel,
  getStatusProgress,
  getAllStatuses,
  getAllProductionSubStatuses,
} from '@/types/order-status';

// Re-export labels for backward compatibility
import { ORDER_STATUS_LABELS as _ORDER_STATUS_LABELS, type OrderStatus } from '@/types/order-status';
export const OrderStatusLabels = _ORDER_STATUS_LABELS;

// Delivery type for sample requests
export type DeliveryType = 'normal' | 'other'

// Delivery destination (can be multiple)
export interface DeliveryDestination {
    id: string
    companyName?: string
    contactPerson: string
    phone: string
    postalCode?: string
    address: string
    isPrimary: boolean
}

// Product Content Types
export interface ProductFAQ {
    question_ja: string
    question_en: string
    answer_ja: string
    answer_en: string
    category?: string
}

export interface ProductDownload {
    title_ja: string
    title_en: string
    url: string
    type: 'catalog' | 'spec_sheet' | 'technical_guide'
    size?: string
}

export interface ProductCertification {
    name: string
    issuer: string
    image_url?: string
    description?: string
}

export interface ProductTechnicalDiagram {
    title: string
    url: string
    description?: string
}

export interface ProductReview {
    id: string
    client_name: string
    rating: number
    comment: string
    date: string
    industry?: string
}

export interface ProductCustomizationOption {
    name: string
    options: string[]
    default?: string
}

export interface ProductPackagingInfo {
    packaging_type: string
    pallet_quantity?: number
    carton_quantity?: number
    dimensions?: string
    weight?: string
}

/**
 * Partial Product interface for static catalog data (without timestamps).
 * Used by catalog client components that consume static product data
 * via getAllProducts() and similar static-data helpers.
 */
export interface ProductBase {
    id: string
    name?: string
    name_ja?: string
    name_en?: string
    name_ko?: string
    category?: string
    description?: string | null
    description_ja?: string | null
    description_en?: string | null
    description_ko?: string | null
    specifications?: Json
    materials?: string[]
    image?: string | null
    pricing_formula?: Json
    min_order_quantity?: number
    lead_time_days?: number
    sort_order?: number
    is_active?: boolean
    tags?: string[]
    applications?: string[]
    features?: string[]
    faq?: ProductFAQ[]
    downloads?: ProductDownload[]
    related_case_studies?: string[]
    certifications?: ProductCertification[]
    technical_diagrams?: ProductTechnicalDiagram[]
    reviews?: ProductReview[]
    customization_options?: ProductCustomizationOption[]
    packaging_info?: ProductPackagingInfo
}

export interface Product extends ProductBase {
    category: 'flat_3_side' | 'stand_up' | 'gusset' | 'box' | 'flat_with_zip' | 'special' | 'soft_pouch' | 'spout_pouch' | 'roll_film'
    name_ja: string
    name_en: string
    name_ko?: string
    description_ja: string
    description_en: string
    description_ko?: string
    specifications: Json
    materials: string[]
    pricing_formula: Json
    min_order_quantity: number
    lead_time_days: number
    sort_order: number
    is_active: boolean
    created_at?: string
    updated_at?: string
    image?: string
    tags?: string[]
    applications?: string[]
    features?: string[]
    // Phase 1: 基本拡張
    faq?: ProductFAQ[]
    downloads?: ProductDownload[]
    related_case_studies?: string[] // Archive IDs
    certifications?: ProductCertification[]
    // Phase 2: 信頼性構築
    technical_diagrams?: ProductTechnicalDiagram[]
    reviews?: ProductReview[]
    customization_options?: ProductCustomizationOption[]
    packaging_info?: ProductPackagingInfo
}

export interface Quote {
    id: string
    customer_info: Json
    product_configurations: Json[]
    calculated_prices: Json
    total_price: number
    currency: string
    status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected'
    expires_at: string
    created_at: string
    updated_at: string
}

export interface SampleRequest {
    id: string
    company_name: string
    contact_person: string
    email: string
    phone: string
    shipping_address: Json
    delivery_type: DeliveryType
    delivery_destinations: Json | null  // Array of DeliveryDestination
    product_samples: Json[]
    purpose: string
    status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
    tracking_number: string | null
    created_at: string
    updated_at: string
}

// ============================================================
// Application Types (B2B Order System)
// ============================================================

/**
 * Shipping/Billing Address interface
 */
export interface Address {
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2?: string
  company: string
  contactName: string
  phone: string
}

/**
 * Quotation Item interface
 */
export interface QuotationItem {
  id: string
  quotation_id: string
  product_id: string | null
  product_name: string
  category: string | null
  quantity: number
  unit_price: number
  total_price: number
  specifications: Json | null
  notes: string | null
  display_order: number
  created_at: string
}

/**
 * Quotation interface (with items)
 */
export interface Quotation {
  id: string
  user_id: string
  company_id: string | null
  quotation_number: string
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
  customer_name: string
  customer_email: string
  customer_phone: string | null
  subtotal: number
  subtotal_amount: number
  tax_amount: number
  total_amount: number
  valid_until: string | null
  notes: string | null
  pdf_url: string | null
  admin_notes: string | null
  sales_rep: string | null
  estimated_delivery_date: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  approved_at: string | null
  rejected_at: string | null
  items?: QuotationItem[]
}

/**
 * Order Item interface
 */
export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  specifications: Json | null
  notes: string | null
  created_at: string
}

/**
 * Order interface (with items)
 */
export interface Order {
  id: string
  user_id: string
  company_id: string | null
  quotation_id: string | null
  orderNumber: string  // order_number
  status: OrderStatus
  paymentTerm: 'credit' | 'advance'
  subtotal: number
  taxAmount: number  // tax_amount
  totalAmount: number  // total_amount
  shippingAddress: Address | null  // shipping_address
  billingAddress: Address | null  // billing_address
  requestedDeliveryDate: string | null  // requested_delivery_date
  deliveryNotes: string | null  // delivery_notes
  estimatedDeliveryDate: string | null  // estimated_delivery_date
  items?: OrderItem[]
  customer_name: string
  customer_email: string
  notes: string | null
  created_at: string
  updated_at: string
  shipped_at: string | null
  delivered_at: string | null
}

// ============================================================
// Database Types (Supabase generated)
// ============================================================

export type Database = {
    public: {
        Tables: {
            // Profiles table (extends Supabase auth.users)
            profiles: {
                Row: {
                    id: string
                    email: string
                    kanji_last_name: string
                    kanji_first_name: string
                    kana_last_name: string
                    kana_first_name: string
                    corporate_phone: string | null
                    personal_phone: string | null
                    business_type: 'INDIVIDUAL' | 'CORPORATION'
                    user_type: 'B2C' | 'B2B' | null  // B2C: 一般消費者, B2B: 企業顧客
                    company_name: string | null
                    legal_entity_number: string | null
                    corporate_number: string | null  // 登録番号 (13桁) - 法人番号とは別
                    position: string | null
                    department: string | null
                    company_url: string | null
                    product_category: 'COSMETICS' | 'CLOTHING' | 'ELECTRONICS' | 'KITCHEN' | 'FURNITURE' | 'OTHER'
                    acquisition_channel: string | null
                    postal_code: string | null
                    prefecture: string | null
                    city: string | null
                    street: string | null
                    building: string | null  // 建物名
                    role: 'ADMIN' | 'MEMBER' | 'KOREA_DESIGNER' | 'OPERATOR' | 'SALES'
                    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'INVITED'
                    // Designer-specific fields
                    designer_name_ko: string | null  // Korean name
                    designer_name_en: string | null  // English name
                    preferred_language: 'ja' | 'ko' | 'en'  // Preferred language for UI
                    notification_settings: Json | null  // Notification preferences
                    // B2B追加フィールド
                    founded_year: string | null  // 設立年
                    capital: string | null  // 資本金
                    representative_name: string | null  // 代表者名
                    business_document_path: string | null  // 事業登錄証保存パス
                    verification_token: string | null  // メール認証トークン
                    verification_expires_at: string | null  // 認証トークン有効期限
                    settings: Json | null  // User settings (notifications, language, timezone)
                    markup_rate: number  // Customer-specific markup rate (default 0.5 = 50%)
                    markup_rate_note: string | null  // Note for custom markup rate
                    created_at: string
                    updated_at: string
                    last_login_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>>
                // task #8 第5段階: postgrest-js v1.19+ の select 型推論が
                // Relationships 未定義テーブルを SelectQueryError→never に短絡する問題の回避。
                // 空配列で `[] extends GenericRelationship[]` = true とし ProcessNodes を有効化。
                Relationships: []
            }

            // Orders table
            orders: {
                Row: {
                    id: string
                    user_id: string  // FK to auth.users
                    order_number: string  // Unique order number
                    status: OrderStatus  // Order status enum
                    total_amount: number  // Order total amount
                    notes: string | null  // Order notes
                    created_at: string
                    updated_at: string
                    shipped_at: string | null
                    delivered_at: string | null
                    cancelled_at: string | null
                    delivery_address: Json | null  // Delivery address JSON
                    billing_address: Json | null  // Billing address JSON
                    subtotal: number | null  // Subtotal amount
                    tax_amount: number | null  // Tax amount
                    customer_name: string | null  // Customer name snapshot
                    customer_email: string | null  // Customer email snapshot
                    customer_phone: string | null  // Customer phone snapshot
                    delivery_address_id: string | null  // FK to delivery_addresses
                    billing_address_id: string | null  // FK to billing_addresses
                    quotation_id: string | null  // FK to quotations
                    manual_discount_percentage: number  // Manual discount percentage (0-100) applied by admin
                    manual_discount_amount: number  // Calculated manual discount amount
                }
                Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Order items table
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    product_name: string
                    quantity: number
                    unit_price: number
                    total_price: number
                    specifications: Json | null
                    sku_name: string | null  // SKU name for the product item (e.g., EPAC-001)
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['order_items']['Row']>
                Relationships: []
            }

            // Delivery addresses table
            delivery_addresses: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    postal_code: string
                    prefecture: string
                    city: string
                    address: string
                    building: string | null
                    phone: string
                    contact_person: string | null
                    is_default: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['delivery_addresses']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['delivery_addresses']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Billing addresses table
            billing_addresses: {
                Row: {
                    id: string
                    user_id: string
                    company_name: string
                    postal_code: string
                    prefecture: string
                    city: string
                    address: string
                    building: string | null
                    tax_number: string | null
                    email: string | null
                    phone: string | null
                    is_default: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['billing_addresses']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['billing_addresses']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Quotations table - B2B拡張 (Extended for B2B)
            quotations: {
                Row: {
                    id: string
                    user_id: string  // FK to profiles
                    company_id: string | null  // FK to companies
                    quotation_number: string  // QT-YYYY-NNNN format
                    status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
                    customer_name: string  // Customer name snapshot
                    customer_email: string  // Customer email snapshot
                    customer_phone: string | null  // Customer phone snapshot
                    subtotal_amount: number  // Amount before tax
                    tax_amount: number  // Japanese consumption tax (10%)
                    total_amount: number  // Final amount including tax
                    valid_until: string | null  // Default 30 days from creation
                    notes: string | null  // Customer-visible notes
                    pdf_url: string | null  // Generated PDF URL
                    admin_notes: string | null  // Internal admin notes
                    // クーポン関連フィールド (Coupon fields)
                    coupon_id: string | null  // FK to coupons
                    discount_amount: number  // 割引額
                    discount_type: 'percentage' | 'fixed_amount' | 'free_shipping' | null  // 割引タイプ
                    created_at: string
                    updated_at: string
                    sent_at: string | null
                    approved_at: string | null
                    rejected_at: string | null
                    // Additional fields for order confirmation
                    sales_rep: string | null  // Sales representative
                    estimated_delivery_date: string | null  // Estimated delivery date
                    subtotal: number  // Alias for subtotal_amount
                }
                Insert: Omit<Database['public']['Tables']['quotations']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['quotations']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Quotation items table - B2B拡張 (Extended for B2B)
            quotation_items: {
                Row: {
                    id: string
                    quotation_id: string  // FK to quotations
                    product_id: string | null  // FK to products (if available)
                    product_name: string  // Product name
                    category: string | null  // Product category
                    quantity: number  // Order quantity
                    unit_price: number  // Price per unit
                    total_price: number  // Auto-calculated (quantity * unit_price)
                    specifications: Json | null  // Product specs in JSON format
                    notes: string | null  // Item-specific notes
                    display_order: number  // Display order in quotation
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['quotation_items']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['quotation_items']['Row']>
                Relationships: []
            }

            // Sample requests table
            sample_requests: {
                Row: {
                    id: string
                    user_id: string | null  // Nullable for external guest requests
                    request_number: string
                    status: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
                    delivery_address_id: string | null
                    tracking_number: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                    shipped_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['sample_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['sample_requests']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Sample items table
            sample_items: {
                Row: {
                    id: string
                    sample_request_id: string
                    product_id: string | null
                    product_name: string
                    category: string
                    quantity: number
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['sample_items']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['sample_items']['Row']>
                Relationships: []
            }

            // Sample request destinations table (C-23: 配送先データ DB保存・監査可能化)
            // 注: 本テーブルは migration 20260704000001 で作成。本番適用後に
            // `supabase gen types` で本型定義は自動再生成される（手動追加は一時的）。
            sample_request_destinations: {
                Row: {
                    id: string
                    sample_request_id: string
                    company_name: string | null
                    contact_person: string
                    phone: string
                    postal_code: string | null
                    address: string
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['sample_request_destinations']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['sample_request_destinations']['Row']>
                Relationships: []
            }

            // Inquiries table (extended for contact form)
            // Note: Database uses 'type' column (not 'inquiry_type')
            inquiries: {
                Row: {
                    id: string
                    user_id: string | null
                    order_id: string | null  // FK to orders - 注文チャット連携（1注文=1スレッド・null 時は一般 inquiry）
                    inquiry_number: string  // Original inquiry number
                    request_number: string | null  // Human-readable request number (REQ-YYYY-XXX)
                    type: 'product' | 'quotation' | 'sample' | 'order' | 'billing' | 'other' | 'general' | 'technical' | 'sales' | 'support'
                    customer_name: string
                    customer_name_kana: string
                    company_name: string | null
                    email: string
                    phone: string
                    fax: string | null
                    postal_code: string | null
                    prefecture: string | null
                    city: string | null
                    street: string | null
                    subject: string
                    message: string
                    response: string | null
                    urgency: 'low' | 'normal' | 'high' | 'urgent' | null
                    preferred_contact: string | null
                    privacy_consent: boolean
                    status: 'open' | 'responded' | 'resolved' | 'closed' | 'pending' | 'in_progress'
                    admin_notes: string | null
                    created_at: string
                    updated_at: string
                    responded_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'created_at' | 'updated_at' | 'order_id'> & {
                    // 注文チャット連携（order-inquiry-link）: 省略可・未設定時は一般 inquiry
                    order_id?: string | null
                }
                Update: Partial<Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Announcements table
            announcements: {
                Row: {
                    id: string
                    title: string
                    content: string
                    category: 'maintenance' | 'update' | 'notice' | 'promotion'
                    priority: 'low' | 'medium' | 'high'
                    is_published: boolean
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // ============================================================
            // B2B SYSTEM NEW TABLES (Phase 1)
            // ============================================================

            // Companies table - 企業情報管理
            companies: {
                Row: {
                    id: string
                    corporate_number: string  // 法人番号 (13桁)
                    name: string  // 登記上の正式名称
                    name_kana: string  // カタカナ表記
                    legal_entity_type: 'KK' | 'GK' | 'GKDK' | 'TK' | 'KKK' | 'Other'  // 法人種類
                    industry: string  // 業種
                    payment_terms: string | null  // 支払条件
                    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Contracts table - 契約書管理 (Enhanced for Japan e-Signature Law)
            contracts: {
                Row: {
                    id: string
                    contract_number: string  // CTR-YYYY-NNNN
                    order_id: string  // FK to orders
                    work_order_id: string | null  // FK to work_orders
                    company_id: string  // FK to companies
                    customer_name: string  // 契約者名（乙）
                    customer_representative: string  // 代理人
                    total_amount: number  // 契約金額
                    currency: string  // 通貨 (JPY)
                    status: 'DRAFT' | 'SENT' | 'CUSTOMER_SIGNED' | 'ADMIN_SIGNED' | 'ACTIVE' | 'CANCELLED'
                    customer_signed_at: string | null  // 顧客署名日時
                    admin_signed_at: string | null  // 管理者署名日時
                    signature_data: Json | null  // 署名データ
                    customer_ip_address: string | null
                    admin_ip_address: string | null
                    pdf_url: string | null  // 契約書PDF URL
                    terms: Json | null  // 契約条件
                    notes: string | null
                    // Japan e-Signature Law Compliance Fields (電子署名法対応フィールド)
                    customer_signature_type: 'handwritten' | 'hanko' | 'mixed' | null  // 顧客署名タイプ
                    admin_signature_type: 'handwritten' | 'hanko' | 'mixed' | null  // 管理者署名タイプ
                    customer_hanko_image_path: string | null  // 顧客はんこ画像パス
                    admin_hanko_image_path: string | null  // 管理者はんこ画像パス
                    customer_timestamp_token: string | null  // 顧客タイムスタンプトークン (TSA)
                    admin_timestamp_token: string | null  // 管理者タイムスタンプトークン (TSA)
                    customer_timestamp_verified: boolean | null  // 顧客タイムスタンプ検証済み
                    admin_timestamp_verified: boolean | null  // 管理者タイムスタンプ検証済み
                    customer_certificate_url: string | null  // 顧客署名証明書URL
                    admin_certificate_url: string | null  // 管理者署名証明書URL
                    signature_expires_at: string | null  // 署名有効期限
                    legal_validity_confirmed: boolean | null  // 法的効力確認済み
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Production Logs table - 生産進捗ログ
            production_logs: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    work_order_id: string | null  // FK to work_orders
                    sub_status: 'design_received' | 'work_order_created' | 'material_prepared' | 'printing' | 'lamination' | 'slitting' | 'pouch_making' | 'qc_passed' | 'packaged'
                    progress_percentage: number  // 進捗率 (0-100)
                    assigned_to: string | null  // 担当者 (user_id)
                    photo_url: string | null  // 写真URL
                    notes: string | null  // メモ・コメント
                    measurements: Json | null  // 測定値・検査データ
                    logged_at: string  // 記録日時
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['production_logs']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['production_logs']['Row']>
                Relationships: []
            }

            // Files table - ファイル管理 (実DB 17カラムに完全一致・2026-07-26 information_schema 照合)
            files: {
                Row: {
                    id: string
                    order_id: string | null  // FK to orders
                    quotation_id: string | null  // FK to quotations
                    file_type: 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER'
                    original_filename: string  // 元のファイル名
                    file_url: string  // Storage URL
                    file_path: string  // Storage object path (production_data/{userId}/{orderId}/{file}・NOT NULL・実DB)
                    file_size_bytes: number | null  // ファイルサイズ bytes (nullable)
                    version: number  // バージョン番号 (default 1)
                    is_latest: boolean  // 最新バージョンフラグ (default true)
                    validation_status: 'PENDING' | 'VALID' | 'INVALID'  // 検証ステータス (default 'PENDING')
                    validation_results: Json | null  // 検証結果 (jsonb)
                    uploaded_by: string  // アップロード者 (user_id)
                    uploaded_at: string  // アップロード日時 (default now())
                    validated_at: string | null  // 検証日時
                    source_file_id: string | null  // FK to files (元ファイル・バージョン管理用)
                    order_item_id: string | null  // FK to order_items
                }
                Insert: Omit<Database['public']['Tables']['files']['Row'], 'id' | 'version' | 'is_latest' | 'validation_status' | 'uploaded_at'>
                Update: Partial<Omit<Database['public']['Tables']['files']['Row'], 'id'>>
                Relationships: []
            }

            // Design Revisions table - デザイン修正・承認管理
            design_revisions: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    revision_number: number  // 修正回数
                    revision_name: string | null  // 修正名（例：「第1回修正」）
                    order_item_id: string | null  // FK to order_items (特定アイテムの修正のみ)
                    sku_name: string | null  // SKU name snapshot (denormalized for performance)
                    customer_files: Json | null  // 顧客アップロードファイル情報（filesテーブル参照）
                    corrected_files: Json | null  // パートナー修正ファイル情報（filesテーブル参照）
                    preview_image_url: string | null  // プレビュー画像URL
                    original_file_url: string | null  // 元ファイルURL
                    customer_comment: string | null  // 顧客コメント
                    partner_comment: string | null  // パートナーコメント (deprecated)
                    // Korean designer bilingual support
                    comment_ko: string | null  // Korean designer's original comment
                    comment_ja: string | null  // Japanese translation
                    translation_status: 'pending' | 'translated' | 'failed' | 'manual'  // Translation status
                    translation_requested_at: string | null  // When translation was requested
                    translation_completed_at: string | null  // When translation completed
                    // Uploader tracking
                    uploaded_by_type: 'admin' | 'korea_designer' | 'member'  // Who uploaded
                    uploaded_by_id: string | null  // FK to profiles (uploader)
                    approval_status: 'pending' | 'approved' | 'rejected'  // 承認ステータス
                    approved_by: string | null  // 承認者 (user_id)
                    approved_at: string | null  // 承認日時
                    // Design Revision Workflow v2 - Customer file submission tracking
                    original_customer_filename: string | null  // Original customer uploaded filename
                    generated_correction_filename: string | null  // Generated correction filename (e.g., ORD-001_SkuName_R1_correction.ai)
                    customer_submission_id: string | null  // FK to customer_file_submissions
                    // Rejection tracking
                    rejection_reason: string | null  // Reason for rejection
                    rejected_at: string | null  // Rejection timestamp
                    rejected_by: string | null  // FK to profiles (user who rejected)
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['design_revisions']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['design_revisions']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Customer File Submissions table - カスタマーファイル提出管理 (Design Revision Workflow v2)
            customer_file_submissions: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    order_item_id: string | null  // FK to order_items
                    file_id: string | null  // FK to files
                    original_filename: string  // Original uploaded filename
                    file_url: string  // Storage URL
                    file_type: string  // File type (AI, PDF, PSD, etc.)
                    file_size_bytes: number | null  // File size in bytes
                    submission_number: number  // Sequential submission number per order (1, 2, 3, ...)
                    is_current: boolean  // TRUE = active submission, FALSE = replaced
                    replaced_at: string | null  // When this submission was replaced
                    replaced_by: string | null  // FK to profiles (user who replaced)
                    previous_submission_id: string | null  // FK to customer_file_submissions (previous version)
                    uploaded_by: string  // FK to profiles (user who uploaded)
                    uploaded_at: string  // Upload timestamp
                }
                Insert: Omit<Database['public']['Tables']['customer_file_submissions']['Row'], 'id' | 'uploaded_at'>
                Update: Partial<Database['public']['Tables']['customer_file_submissions']['Row']>
                Relationships: []
            }

            // Revision Notifications table - リビジョン通知管理 (Design Revision Workflow v2)
            revision_notifications: {
                Row: {
                    id: string
                    revision_id: string  // FK to design_revisions
                    notification_type: 'uploaded' | 'approved' | 'rejected' | 'reminder'  // Type of notification
                    recipient_email: string  // Recipient email address
                    recipient_role: 'customer' | 'designer' | 'admin'  // Recipient role
                    status: 'pending' | 'sent' | 'failed'  // Notification status
                    sent_at: string | null  // When notification was sent
                    error_message: string | null  // Error message if failed
                    subject: string | null  // Email subject
                    body_html: string | null  // Email body HTML
                    created_at: string  // Creation timestamp
                }
                Insert: Omit<Database['public']['Tables']['revision_notifications']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['revision_notifications']['Row']>
                Relationships: []
            }

            // Order Status History table - ステータス変更履歴
            order_status_history: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    from_status: string  // 変更前ステータス
                    to_status: string  // 変更後ステータス
                    changed_by: string  // 変更者 (user_id)
                    changed_at: string  // 変更日時
                    reason: string | null  // 変更理由
                    metadata: Json | null  // 追加情報
                }
                Insert: Omit<Database['public']['Tables']['order_status_history']['Row'], 'id' | 'changed_at'>
                Update: Partial<Database['public']['Tables']['order_status_history']['Row']>
                Relationships: []
            }

            // ============================================================
            // B2B WORKFLOW SYSTEM NEW TABLES (Phase 2-6)
            // ============================================================

            // Products table - 製品マスター (Product Master)
            products: {
                Row: {
                    id: string
                    product_code: string  // PRD-YYYYMMDD-NNNN
                    name_ja: string  // Japanese product name
                    name_en: string  // English product name
                    description_ja: string | null
                    description_en: string | null
                    category: 'flat_3_side' | 'stand_up' | 'gusset' | 'box' | 'flat_with_zip' | 'special' | 'soft_pouch' | 'spout_pouch' | 'roll_film'
                    material_type: 'PET' | 'AL' | 'CPP' | 'PE' | 'NY' | 'PAPER' | 'OTHER'
                    specifications: Json  // Detailed specs in JSON
                    base_price: number  // Base price in JPY
                    currency: string  // 'JPY', 'USD', 'EUR'
                    pricing_formula: Json | null  // Pricing calculation formula
                    stock_quantity: number  // Current stock level
                    reorder_level: number  // Reorder point
                    min_order_quantity: number  // Minimum order quantity
                    lead_time_days: number  // Production lead time in days
                    is_active: boolean  // Product availability
                    sort_order: number  // Display order
                    image_url: string | null  // Product image URL
                    meta_keywords: string[] | null  // SEO keywords
                    meta_description: string | null  // SEO description
                    created_at: string
                    updated_at: string
                    version: number  // Optimistic locking version
                }
                Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Inventory table - 在庫管理 (Inventory Management)
            inventory: {
                Row: {
                    id: string
                    product_id: string  // FK to products
                    warehouse_location: string  // e.g., "MAIN", "TOKYO"
                    bin_location: string | null  // e.g., "A-01-15"
                    quantity_on_hand: number  // Physical stock
                    quantity_allocated: number  // Allocated for orders
                    quantity_available: number  // Available (generated column)
                    reorder_point: number  // Reorder threshold
                    max_stock_level: number | null  // Maximum stock level
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Inventory transactions table - 在庫移動履歴 (Inventory Transaction History)
            inventory_transactions: {
                Row: {
                    id: string
                    product_id: string  // FK to products
                    inventory_id: string | null  // FK to inventory
                    order_id: string | null  // FK to orders
                    production_job_id: string | null  // FK to production_jobs
                    transaction_type: 'receipt' | 'issue' | 'adjustment' | 'transfer' | 'return' | 'production_in' | 'production_out'
                    quantity: number  // Positive for receipts, negative for issues
                    quantity_before: number  // State before transaction
                    quantity_after: number  // State after transaction
                    reference_number: string | null  // Reference number
                    reference_type: string | null  // Reference type
                    reason: string | null  // Transaction reason
                    notes: string | null  // Additional notes
                    performed_by: string | null  // FK to profiles
                    transaction_at: string  // Transaction timestamp
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['inventory_transactions']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['inventory_transactions']['Row']>
                Relationships: []
            }

            // Shipments table - 出荷管理 (Shipment Management)
            shipments: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    delivery_address_id: string | null  // FK to delivery_addresses
                    shipment_number: string  // SHP-YYYYMMDD-NNNN
                    tracking_number: string | null
                    carrier_name: string  // e.g., "Yamato Transport"
                    carrier_code: string | null  // e.g., "YTO"
                    service_level: string | null  // "EXPRESS", "STANDARD"
                    shipping_method: 'ground' | 'air' | 'sea' | 'rail' | 'courier'
                    shipping_cost: number
                    currency: string
                    package_details: Json  // Package info
                    tracking_url: string | null
                    estimated_delivery_date: string | null  // DATE only
                    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned' | 'cancelled'
                    shipped_at: string | null
                    estimated_delivery_at: string | null
                    delivered_at: string | null
                    created_at: string
                    updated_at: string
                    delivered_to: string | null  // Person who received
                    delivery_signature_url: string | null
                    delivery_photo_url: string | null
                    shipping_notes: string | null
                    delivery_notes: string | null
                }
                Insert: Omit<Database['public']['Tables']['shipments']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['shipments']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Audit Logs table - 監査ログ (Audit Logs for Electronic Signature System)
            audit_logs: {
                Row: {
                    id: string
                    timestamp: string
                    event_type: 'system_start' | 'system_shutdown' | 'user_login' | 'user_logout' | 'timestamp_created' | 'timestamp_verified' | 'signature_created' | 'signature_verified' | 'contract_created' | 'contract_signed' | 'contract_status_changed' | 'ip_validation' | 'security_alert' | 'data_access' | 'data_modification' | 'data_deletion' | 'admin_action' | 'error_occurred'
                    resource_type: 'timestamp_token' | 'signature' | 'contract' | 'user' | 'system' | 'ip_validation' | 'order' | 'order_item' | 'other'
                    resource_id: string | null
                    user_id: string | null
                    user_email: string | null
                    ip_address: string | null
                    ip_validation: Json | null  // { trust_level, source, is_private, warnings }
                    session_id: string | null
                    user_agent: string | null
                    request_id: string | null
                    outcome: 'success' | 'failure' | 'partial'
                    details: Json | null  // Structured details
                    error_message: string | null
                    jurisdiction: 'JP' | 'OTHER'  // Legal jurisdiction
                    retention_period_days: number  // Data retention period (days)
                    scheduled_deletion_at: string | null  // Scheduled deletion date
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['audit_logs']['Row']>
                Relationships: []
            }

            // Payment Confirmations table - 支払確認 (Task 108)
            payment_confirmations: {
                Row: {
                    id: string
                    quotation_id: string  // FK to quotations
                    payment_method: 'bank_transfer' | 'credit_card' | 'paypal' | 'other'
                    payment_date: string  // ISO timestamp
                    amount: number  // Payment amount
                    reference_number: string | null  // Transaction reference
                    notes: string | null  // Additional notes
                    confirmed_by: string  // FK to profiles (user who confirmed)
                    confirmed_at: string  // Confirmation timestamp
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['payment_confirmations']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['payment_confirmations']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // ============================================================
            // FILM COST SYSTEM NEW TABLES (Phase 4)
            // ============================================================

            // System Settings table - 시스템 설정 (film material prices, processing costs, etc.)
            system_settings: {
                Row: {
                    id: string
                    category: string  // e.g., 'film_material', 'pouch_processing', 'printing', 'lamination', 'slitter', 'exchange_rate', 'tax', 'delivery', 'production', 'pricing'
                    key: string  // e.g., 'PET_unit_price', 'AL_density', 'flat_3_side_cost', 'cost_per_m2'
                    value: Json  // JSONB value (number, string, boolean, or object)
                    value_type: string  // 'number', 'string', 'boolean', 'object'
                    description: string | null
                    unit: string | null  // e.g., '원/kg', 'kg/m³', '원', '원/m²', '%'
                    is_active: boolean
                    effective_date: string  // TIMESTAMPTZ
                    updated_by: string | null  // FK to profiles
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['system_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['system_settings']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Coupons table - 쿠폰 관리
            coupons: {
                Row: {
                    id: string
                    code: string  // Unique coupon code
                    name: string  // Coupon name
                    name_ja: string | null  // Japanese name
                    description: string | null
                    description_ja: string | null
                    type: 'percentage' | 'fixed_amount' | 'free_shipping'  // coupon_type enum
                    value: number  // Discount value (percentage or fixed amount)
                    minimum_order_amount: number  // Minimum order amount to qualify
                    maximum_discount_amount: number | null  // Maximum discount cap
                    max_uses: number | null  // Total usage limit (null = unlimited)
                    current_uses: number  // Current usage count
                    max_uses_per_customer: number  // Per-customer usage limit
                    status: 'active' | 'inactive' | 'expired' | 'scheduled'  // coupon_status enum
                    valid_from: string  // TIMESTAMPTZ
                    valid_until: string | null  // TIMESTAMPTZ
                    applicable_customers: string[] | null  // Array of customer IDs
                    applicable_customer_types: string[] | null  // e.g., ['VIP', 'NEW']
                    created_by: string | null  // FK to profiles
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            // Coupon Usage table - 쿠폰 사용 기록
            coupon_usage: {
                Row: {
                    id: string
                    coupon_id: string  // FK to coupons
                    user_id: string  // FK to profiles
                    order_id: string | null  // FK to orders
                    quotation_id: string | null  // FK to quotations
                    discount_amount: number  // Applied discount amount
                    original_amount: number  // Original amount before discount
                    final_amount: number  // Final amount after discount
                    used_at: string  // TIMESTAMPTZ
                }
                Insert: Omit<Database['public']['Tables']['coupon_usage']['Row'], 'id' | 'used_at'>
                Update: Partial<Database['public']['Tables']['coupon_usage']['Row']>
                Relationships: []
            }

            // ============================================================
            // KOREAN DESIGNER WORKFLOW TABLES
            // ============================================================

            // Designer Task Assignments table - デザイナータスク割り当て
            designer_task_assignments: {
                Row: {
                    id: string
                    designer_id: string  // FK to profiles (KOREA_DESIGNER)
                    order_id: string  // FK to orders
                    assigned_by: string | null  // FK to profiles (admin who assigned)
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'  // Assignment status
                    assigned_at: string  // TIMESTAMPTZ
                    completed_at: string | null  // TIMESTAMPTZ
                    notes: string | null  // Assignment notes
                    upload_token_id: string | null  // FK to upload_tokens
                    token_email_sent_at: string | null  // TIMESTAMPTZ
                    token_email_status: 'pending' | 'sent' | 'failed' | null  // Token email status
                    access_token_hash: string | null  // SHA-256 hash of access token for token-based order access
                    access_token_expires_at: string | null  // TIMESTAMPTZ - Token expiration timestamp
                    last_accessed_at: string | null  // TIMESTAMPTZ - Last time the token was used
                }
                Insert: Omit<Database['public']['Tables']['designer_task_assignments']['Row'], 'id' | 'assigned_at'>
                Update: Partial<Omit<Database['public']['Tables']['designer_task_assignments']['Row'], 'id' | 'assigned_at'>>
                Relationships: []
            }

        // ============================================================
        // 追加テーブル定義（実DB存在・database.ts 未定義・task #117 B-3）
        // list_tables(verbose=true) の実DBスキーマから生成。手書き資産とは別物。
        // ============================================================

            admin_notifications: {
                Row: {
                    id: string
                    type: string  // Notification type: order, quotation, sample, registration, production, shipment,
                    title: string
                    message: string
                    related_id: string | null  // ID of related entity (order, quotation, etc.)
                    related_type: string | null  // Type of related entity (orders, quotations, etc.)
                    priority: string | null  // Notification priority: low, normal, high, urgent
                    user_id: string | null  // FK -> profiles.id
                    is_read: boolean | null
                    read_at: string | null
                    action_url: string | null
                    action_label: string | null
                    metadata: Json | null
                    created_at: string | null
                    expires_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['admin_notifications']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['admin_notifications']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            admin_order_notes: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    admin_id: string
                    notes: string
                    sent_to_korea_at: string | null
                    korea_email_address: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['admin_order_notes']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['admin_order_notes']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            approval_request_comments: {
                Row: {
                    id: string
                    approval_request_id: string  // FK -> customer_approval_requests.id
                    content: string
                    author_id: string  // FK -> profiles.id
                    author_role: string
                    parent_comment_id: string | null  // FK -> approval_request_comments.id
                    created_at: string | null
                    updated_at: string | null
                    metadata: Json | null
                }
                Insert: Omit<Database['public']['Tables']['approval_request_comments']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['approval_request_comments']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            approval_request_files: {
                Row: {
                    id: string
                    approval_request_id: string  // FK -> customer_approval_requests.id
                    file_name: string
                    file_type: string
                    file_url: string
                    file_size_bytes: number | null
                    file_category: string | null
                    uploaded_by: string | null  // FK -> profiles.id
                    uploaded_at: string | null
                    created_at: string | null
                    metadata: Json | null
                }
                Insert: Omit<Database['public']['Tables']['approval_request_files']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['approval_request_files']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            blog_categories: {
                Row: {
                    id: string
                    name_ja: string
                    name_en: string
                    description: string | null
                    sort_order: number | null
                }
                Insert: Omit<Database['public']['Tables']['blog_categories']['Row'], 'id'>
                Update: Partial<Omit<Database['public']['Tables']['blog_categories']['Row'], 'id'>>
                Relationships: []
            }

            blog_images: {
                Row: {
                    id: string
                    post_id: string | null  // FK -> blog_posts.id
                    storage_path: string
                    original_filename: string
                    mime_type: string
                    file_size: number
                    width: number | null
                    height: number | null
                    alt_text: string | null
                    created_at: string
                    created_by: string | null  // FK -> profiles.id
                }
                Insert: Omit<Database['public']['Tables']['blog_images']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['blog_images']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            blog_posts: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    content: string
                    excerpt: string | null
                    category: string  // FK -> blog_categories.id
                    tags: string[] | null
                    meta_title: string | null
                    meta_description: string | null
                    og_image_path: string | null
                    canonical_url: string | null
                    author_id: string | null  // FK -> profiles.id
                    status: string
                    published_at: string | null
                    created_at: string
                    updated_at: string
                    view_count: number | null
                    reading_time_minutes: number | null
                    content_type: string | null
                    template_data: Json | null
                    featured: boolean | null
                }
                Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            chatbot_failover_logs: {
                Row: {
                    id: string
                    event_type: string
                    from_provider: string | null
                    to_provider: string | null
                    reason: string | null
                    metadata: Json | null
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['chatbot_failover_logs']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['chatbot_failover_logs']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            contract_reminders: {
                Row: {
                    id: string
                    contract_id: string  // FK -> contracts.id
                    reminder_type: string
                    scheduled_for: string
                    sent_at: string | null
                    status: string
                    subject: string | null
                    message: string | null
                    sent_by: string | null  // FK -> profiles.id
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['contract_reminders']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['contract_reminders']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            customer_approval_requests: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    korea_correction_id: string | null  // FK -> korea_corrections.id
                    title: string
                    description: string
                    approval_type: string
                    status: string
                    response_notes: string | null
                    responded_at: string | null
                    responded_by: string | null  // FK -> profiles.id
                    expires_at: string | null
                    requested_by: string  // FK -> profiles.id
                    requested_at: string | null
                    created_at: string | null
                    updated_at: string | null
                    metadata: Json | null
                    version: number
                }
                Insert: Omit<Database['public']['Tables']['customer_approval_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['customer_approval_requests']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            design_postprocessing_positions: {
                Row: {
                    id: string
                    revision_id: string  // FK -> design_revisions.id
                    sku_name: string  // SKU名（スナップショット）
                    notch_top: string | null  // ノッチ位置（上から）。例: "上から20mm"
                    notch_bottom: string | null  // ノッチ位置（下から）。例: "下から15mm"
                    hang_hole_diameter: string | null  // 吊り下げ穴径。例: "6mm", "8mm"
                    hang_hole_position: string | null  // 吊り下げ位置。例: "上から15mm"
                    zipper_position: string | null  // チャック位置。例: "上から30mm"
                    print_position: string | null  // 印刷位置情報
                    special_processing: string | null  // 特殊加工に関するメモ
                    input_by_type: string | null  // 入力者タイプ: ADMINまたはKOREA_DESIGNER
                    input_by_name: string | null  // 入力者名
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['design_postprocessing_positions']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['design_postprocessing_positions']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            designer_upload_tokens: {
                Row: {
                    id: string
                    token_hash: string
                    token_prefix: string
                    order_id: string  // FK -> orders.id
                    designer_id: string | null  // FK -> profiles.id
                    status: string
                    expires_at: string
                    created_at: string
                    last_accessed_at: string | null
                    access_count: number
                    upload_count: number
                    created_by: string  // FK -> profiles.id
                    designer_name: string | null
                    designer_email: string | null
                }
                Insert: Omit<Database['public']['Tables']['designer_upload_tokens']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['designer_upload_tokens']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            document_access_log: {
                Row: {
                    id: string
                    user_id: string  // FK -> profiles.id
                    quotation_id: string | null  // FK -> quotations.id
                    order_id: string | null  // FK -> orders.id
                    document_type: string
                    action: string
                    accessed_at: string
                    ip_address: string | null
                    user_agent: string | null
                    metadata: Json | null
                }
                Insert: Omit<Database['public']['Tables']['document_access_log']['Row'], 'id'>
                Update: Partial<Omit<Database['public']['Tables']['document_access_log']['Row'], 'id'>>
                Relationships: []
            }

            inquiry_messages: {
                Row: {
                    id: string
                    inquiry_id: string  // FK -> inquiries.id
                    sender_type: string
                    sender_id: string | null  // FK -> profiles.id
                    body: string
                    attachments: Json
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['inquiry_messages']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['inquiry_messages']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string  // FK -> invoices.id
                    product_id: string | null
                    product_name: string
                    product_code: string | null
                    description: string | null
                    quantity: number
                    unit: string
                    unit_price: number
                    total_price: number
                    tax_rate: number
                    tax_amount: number | null
                    notes: string | null
                    display_order: number
                }
                Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id'>
                Update: Partial<Omit<Database['public']['Tables']['invoice_items']['Row'], 'id'>>
                Relationships: []
            }

            invoices: {
                Row: {
                    id: string
                    invoice_number: string
                    user_id: string  // FK -> profiles.id
                    company_id: string | null  // FK -> companies.id
                    order_id: string | null  // FK -> orders.id
                    customer_name: string
                    customer_email: string
                    customer_phone: string | null
                    company_name: string | null
                    company_address: string | null
                    status: string
                    subtotal_amount: number
                    tax_amount: number
                    discount_amount: number
                    total_amount: number
                    paid_amount: number
                    issue_date: string
                    due_date: string
                    paid_at: string | null
                    payment_method: string | null
                    payment_terms: string | null
                    bank_account: Json | null
                    notes: string | null
                    customer_notes: string | null
                    pdf_url: string | null
                    admin_notes: string | null
                    created_at: string
                    updated_at: string
                    sent_at: string | null
                    viewed_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            korea_corrections: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    quotation_id: string | null  // FK -> quotations.id
                    correction_source: string
                    correction_reference: string | null
                    correction_date: string
                    issue_description: string | null
                    issue_category: string | null
                    urgency: string | null
                    corrected_data: Json | null
                    correction_notes: string | null
                    assigned_to: string | null  // FK -> auth.users.id
                    status: string
                    admin_notes: string | null
                    corrected_files: string[] | null
                    customer_notified: boolean
                    customer_notification_date: string | null
                    created_at: string
                    updated_at: string
                    completed_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['korea_corrections']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['korea_corrections']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            korea_transfer_log: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    sent_by: string  // FK -> auth.users.id
                    sent_to: string
                    files_count: number
                    urgency: string
                    message_id: string | null
                    status: string
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['korea_transfer_log']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['korea_transfer_log']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            notification_settings: {
                Row: {
                    id: string
                    key: string
                    value: Json
                    description: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['notification_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['notification_settings']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            notifications: {
                Row: {
                    id: string
                    type: string  // Notification type (e.g., order_cancelled, order_modified)
                    title: string  // Notification title
                    message: string  // Notification message
                    related_id: string | null  // Related entity ID (e.g., order_id)
                    created_for: string  // Recipient user ID or "admin"
                    is_read: boolean | null  // Whether the notification has been read
                    created_at: string
                    read_at: string | null  // When the notification was read
                }
                Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            order_comments: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    content: string
                    comment_type: string
                    author_id: string  // FK -> profiles.id
                    author_role: string
                    is_internal: boolean | null
                    attachments: string[] | null
                    parent_comment_id: string | null  // FK -> order_comments.id
                    created_at: string | null
                    updated_at: string | null
                    deleted_at: string | null
                    metadata: Json | null
                }
                Insert: Omit<Database['public']['Tables']['order_comments']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['order_comments']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            order_file_uploads: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    file_name: string
                    file_type: string
                    drive_file_id: string
                    drive_view_link: string | null
                    drive_content_link: string | null
                    uploaded_at: string
                    uploaded_by: string | null  // FK -> profiles.id
                    drive_file_name: string | null
                }
                Insert: Omit<Database['public']['Tables']['order_file_uploads']['Row'], 'id'>
                Update: Partial<Omit<Database['public']['Tables']['order_file_uploads']['Row'], 'id'>>
                Relationships: []
            }

            password_reset_tokens: {
                Row: {
                    id: string
                    user_id: string  // FK -> auth.users.id
                    token: string
                    token_hash: string
                    expires_at: string
                    used_at: string | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['password_reset_tokens']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['password_reset_tokens']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            permissions: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    category: string
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            production_data: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    data_type: string
                    title: string
                    description: string | null
                    version: string
                    file_id: string | null  // FK -> files.id
                    file_url: string | null
                    validation_status: string
                    validated_by: string | null  // FK -> profiles.id
                    validated_at: string | null
                    validation_notes: string | null
                    validation_errors: Json | null
                    approved_for_production: boolean
                    approved_by: string | null  // FK -> profiles.id
                    approved_at: string | null
                    submitted_by_customer: boolean
                    customer_contact_info: Json | null
                    received_at: string
                    extracted_data: Json | null
                    confidence_score: number | null
                    extraction_metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['production_data']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['production_data']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            production_orders: {
                Row: {
                    id: string
                    order_id: string  // FK -> orders.id
                    current_stage: string
                    stage_data: Json  // JSONB object containing data for all 9 production stages
                    started_at: string | null
                    estimated_completion_date: string | null
                    actual_completion_date: string | null
                    progress_percentage: number | null  // Auto-calculated progress based on completed stages
                    priority: string | null  // Priority level: low, normal, high, urgent
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['production_orders']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['production_orders']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            remote_config: {
                Row: {
                    id: number
                    key: string
                    value: Json
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['remote_config']['Row'], 'id' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['remote_config']['Row'], 'id' | 'updated_at'>>
                Relationships: []
            }

            role_permissions: {
                Row: {
                    id: string
                    role: string
                    permission_id: string  // FK -> permissions.id
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['role_permissions']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['role_permissions']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            shipment_tracking_events: {
                Row: {
                    id: string
                    shipment_id: string | null
                    status: string
                    event_time: string | null
                    location: string | null
                    description: string | null
                    raw_data: Json | null
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['shipment_tracking_events']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['shipment_tracking_events']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            sku_quotes: {
                Row: {
                    id: string
                    quote_id: string  // FK -> quotations.id
                    sku_index: number
                    sku_code: string  // Unique SKU identifier (e.g., SKU-001)
                    quantity: number
                    theoretical_meters: number | null
                    secured_meters: number | null
                    loss_meters: number | null
                    total_meters: number | null
                    cost_breakdown: Json
                    specifications: Json  // SKU specifications (dimensions, material, thickness, etc.)
                    created_at: string | null
                    updated_at: string | null
                    printing_type: string  // 印刷方式: digital(既定) / gravure。Phase 4b
                }
                Insert: Omit<Database['public']['Tables']['sku_quotes']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['sku_quotes']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }

            stage_action_history: {
                Row: {
                    id: string
                    production_order_id: string  // FK -> production_orders.id
                    stage: string
                    action: string
                    performed_by: string  // FK -> profiles.id
                    performed_at: string | null
                    notes: string | null
                    metadata: Json | null
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['stage_action_history']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['stage_action_history']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            unified_notifications: {
                Row: {
                    id: string
                    recipient_id: string  // FK -> profiles.id
                    recipient_type: string
                    type: string
                    title: string
                    message: string
                    related_id: string | null
                    related_type: string | null
                    priority: string | null
                    metadata: Json | null
                    channels: Json | null
                    is_read: boolean | null
                    read_at: string | null
                    action_url: string | null
                    action_label: string | null
                    expires_at: string | null
                    created_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['unified_notifications']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['unified_notifications']['Row'], 'id' | 'created_at'>>
                Relationships: []
            }

            user_google_tokens: {
                Row: {
                    id: string
                    user_id: string  // FK -> profiles.id
                    refresh_token: string
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['user_google_tokens']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['user_google_tokens']['Row'], 'id' | 'created_at' | 'updated_at'>>
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            // task #8 Phase 2: .rpc() で呼ばれる関数の型定義（never 型短絡を解消）。
            // 本番DB未存在の関数も含む。実行時の存在・スキーマ整合は Task #20 で別途対応。

            // 注文作成（quotation → order）。本番DB未適用（Task #20）。
            create_order_from_quotation: {
                Args: {
                    p_quotation_id: string
                    p_user_id: string
                    p_order_number: string | null
                }
                Returns: {
                    success: boolean
                    order_id: string | null
                    order_number: string | null
                    error_message: string | null
                }[]
            }

            // メンバーダッシュボード統計（本番DB定義あり、SETOF TABLE(...)）
            get_dashboard_stats: {
                Args: {
                    p_user_id?: string
                    p_is_admin?: boolean
                }
                Returns: {
                    total_orders: number
                    pending_orders: number
                    completed_orders: number
                    total_quotations: number
                    pending_quotations: number
                    total_samples: number
                    processing_samples: number
                }[]
            }
        }
        Enums: {
            // Business types
            business_type: 'INDIVIDUAL' | 'CORPORATION'
            // Product categories
            product_category: 'COSMETICS' | 'CLOTHING' | 'ELECTRONICS' | 'KITCHEN' | 'FURNITURE' | 'OTHER'
            // User roles
            user_role: 'ADMIN' | 'MEMBER' | 'KOREA_DESIGNER' | 'OPERATOR' | 'SALES'
            // User status
            user_status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'INVITED'
            // Order status
            order_status: 'pending' | 'processing' | 'manufacturing' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
            // Quotation status
            status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
            // Sample request status
            sample_request_status: 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
            // Inquiry types (extended with contact form types)
            inquiry_type: 'product' | 'quotation' | 'sample' | 'order' | 'billing' | 'other' | 'general' | 'technical' | 'sales' | 'support'
            // Inquiry status (extended with contact form statuses)
            inquiry_status: 'open' | 'responded' | 'resolved' | 'closed' | 'pending' | 'in_progress'

            // ============================================================
            // B2B SYSTEM NEW ENUMS (Phase 1)
            // ============================================================

            // Legal entity types (法人種類)
            legal_entity_type: 'KK' | 'GK' | 'GKDK' | 'TK' | 'KKK' | 'Other'

            // Company status
            company_status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'

            // Contract status
            contract_status: 'DRAFT' | 'SENT' | 'CUSTOMER_SIGNED' | 'ADMIN_SIGNED' | 'ACTIVE' | 'CANCELLED'

            // Production sub-status (9 stages)
            production_sub_status: 'design_received' | 'work_order_created' | 'material_prepared' | 'printing' | 'lamination' | 'slitting' | 'pouch_making' | 'qc_passed' | 'packaged'

            // File types
            file_type: 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER'

            // File validation status
            file_validation_status: 'PENDING' | 'VALID' | 'INVALID'

            // Invitation status
            invitation_status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'

            // Audit log actions
            audit_action: 'INSERT' | 'UPDATE' | 'DELETE'

            // ============================================================
            // B2B WORKFLOW SYSTEM NEW ENUMS (Phase 2-6)
            // ============================================================

            // Product categories
            product_category_type: 'flat_3_side' | 'stand_up' | 'gusset' | 'box' | 'flat_with_zip' | 'special' | 'soft_pouch' | 'spout_pouch' | 'roll_film'

            // Material types
            material_type: 'PET' | 'AL' | 'CPP' | 'PE' | 'NY' | 'PAPER' | 'OTHER'

            // Inventory transaction types
            inventory_transaction_type: 'receipt' | 'issue' | 'adjustment' | 'transfer' | 'return' | 'production_in' | 'production_out'

            // Production job types
            production_job_type: 'design_setup' | 'material_prep' | 'printing' | 'lamination' | 'slitting' | 'pouch_making' | 'quality_check' | 'packaging' | 'other'

            // Production job status
            production_job_status: 'pending' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'failed' | 'cancelled'

            // Shipment status
            shipment_status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned' | 'cancelled'

            // Shipping methods
            shipping_method: 'ground' | 'air' | 'sea' | 'rail' | 'courier'

            // ============================================================
            // ELECTRONIC SIGNATURE SYSTEM NEW ENUMS (Phase 5)
            // ============================================================

            // Signature types (署名タイプ)
            signature_type: 'handwritten' | 'hanko' | 'mixed'

            // Signature status
            signature_status: 'pending' | 'viewed' | 'signed' | 'delivered' | 'cancelled' | 'expired' | 'declined'

            // Signature provider
            signature_provider: 'docusign' | 'hellosign' | 'local'

            // ============================================================
            // FILM COST SYSTEM NEW ENUMS (Phase 4)
            // ============================================================

            // Coupon type
            coupon_type: 'percentage' | 'fixed_amount' | 'free_shipping'

            // Coupon status
            coupon_status: 'active' | 'inactive' | 'expired' | 'scheduled'

            // ============================================================
            // KOREAN DESIGNER WORKFLOW ENUMS
            // ============================================================

            // Translation status for designer comments
            translation_status: 'pending' | 'translated' | 'failed' | 'manual'

            // Translation provider
            translation_provider: 'google' | 'manual'

            // Language codes for translation
            language_code: 'ko' | 'ja' | 'en'

            // Uploader type for design revisions
            uploader_type: 'admin' | 'korea_designer' | 'member'

            // Designer task assignment status
            designer_task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// ============================================================
// Electronic Signature Tables
// ============================================================

/**
 * Signatures table - Main signature records
 */
export interface Signature {
  id: string
  document_id: string
  order_id: string | null
  contract_id: string | null
  provider: 'docusign' | 'hellosign' | 'local'
  envelope_id: string | null
  status: 'pending' | 'viewed' | 'signed' | 'delivered' | 'cancelled' | 'expired' | 'declined'
  signature_type: 'handwritten' | 'hanko' | 'mixed' | null
  signers: Json
  signature_data: Json | null
  subject: string | null
  message: string | null
  sent_at: string | null
  viewed_at: string | null
  signed_at: string | null
  expires_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  metadata: Json
}

/**
 * Signature Events table - Audit trail
 */
export interface SignatureEvent {
  id: string
  envelope_id: string
  provider: string
  event: string
  metadata: Json
  created_at: string
}

/**
 * Hanko Images table - Japanese seal images
 */
export interface HankoImage {
  id: string
  user_id: string
  hanko_name: string
  image_url: string
  original_filename: string | null
  file_size: number | null
  mime_type: string | null
  is_default: boolean
  validation_data: Json | null
  created_at: string
  updated_at: string
}

// ============================================================
// Blog CMS Tables
// ============================================================

/**
 * Blog Posts table - Blog article posts
 */
export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string  // Markdown content
  excerpt: string | null  // Short description (max 160 chars)
  category: 'news' | 'technical' | 'industry' | 'company'
  tags: string[]  // Array of tag strings
  meta_title: string | null  // Override title for SEO (max 60 chars)
  meta_description: string | null  // Override description (max 160 chars)
  og_image_path: string | null  // Path in Supabase Storage
  canonical_url: string | null  // Optional canonical URL
  author_id: string | null  // FK to profiles
  status: 'draft' | 'review' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  view_count: number
  reading_time_minutes: number | null
}

/**
 * Blog Images table - Blog image management
 */
export interface BlogImage {
  id: string
  post_id: string | null  // FK to blog_posts
  storage_path: string  // Full path in Supabase Storage
  original_filename: string
  mime_type: string
  file_size: number
  width: number | null
  height: number | null
  alt_text: string | null
  created_at: string
  created_by: string | null  // FK to profiles
}

/**
 * Blog Categories table - Blog category lookup
 */
export interface BlogCategory {
  id: 'news' | 'technical' | 'industry' | 'company'
  name_ja: string  // Japanese display name
  name_en: string  // English display name
  description: string | null
  sort_order: number
}
