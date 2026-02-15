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

export interface Product {
    id: string
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
                    business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR'
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
                    role: 'ADMIN' | 'MEMBER'
                    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'
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
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['order_items']['Row']>
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
            }

            // Inquiries table (extended for contact form)
            // Note: Database uses 'type' column (not 'inquiry_type')
            inquiries: {
                Row: {
                    id: string
                    user_id: string | null
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
                Insert: Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['inquiries']['Row'], 'id' | 'created_at' | 'updated_at'>>
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
            }

            // Legacy table (kept for compatibility - not in Supabase)
            contacts: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    name: string
                    company: string | null
                    email: string
                    phone: string | null
                    position: string | null
                    industry: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    company?: string | null
                    email: string
                    phone?: string | null
                    position?: string | null
                    industry?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    company?: string | null
                    email?: string
                    phone?: string | null
                    position?: string | null
                    industry?: string | null
                }
            }

            // Additional table for quotation requests (not in Supabase yet)
            quotation_requests: {
                Row: {
                    id: string
                    contact_id: string | null
                    company: string | null
                    contact_person: string
                    email: string
                    phone: string | null
                    project_description: string
                    requirements: Json | null
                    budget_range: string | null
                    timeline: string | null
                    status: string
                    priority: string
                    estimated_delivery_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    contact_id?: string | null
                    company?: string | null
                    contact_person: string
                    email: string
                    phone?: string | null
                    project_description: string
                    requirements?: Json | null
                    budget_range?: string | null
                    timeline?: string | null
                    status?: string
                    priority?: string
                    estimated_delivery_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    contact_id?: string | null
                    company?: string | null
                    contact_person?: string
                    email?: string
                    phone?: string | null
                    project_description?: string
                    requirements?: Json | null
                    budget_range?: string | null
                    timeline?: string | null
                    status?: string
                    priority?: string
                    estimated_delivery_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
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
            }

            // Work Orders table - 作業標準書
            work_orders: {
                Row: {
                    id: string
                    work_order_number: string  // WO-YYYY-NNNN
                    order_id: string  // FK to orders
                    quotation_id: string | null  // FK to quotations
                    title: string  // 作業標準書タイトル
                    version: string  // バージョン (v1.0, v1.1, ...)
                    status: 'DRAFT' | 'GENERATED' | 'APPROVED' | 'IN_PRODUCTION' | 'COMPLETED'
                    specifications: Json  // 製品仕様書
                    production_flow: Json  // 製造工程フロー
                    quality_standards: Json  // 品質基準
                    packaging_specs: Json  // 包装仕様
                    estimated_completion: string | null  // 納期管理工程表
                    pdf_url: string | null  // PDF URL
                    generated_by: string | null  // 作成者 (user_id)
                    approved_by: string | null  // 承認者 (user_id)
                    approved_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['work_orders']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['work_orders']['Row'], 'id' | 'created_at' | 'updated_at'>>
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
            }

            // Files table - ファイル管理
            files: {
                Row: {
                    id: string
                    order_id: string | null  // FK to orders
                    quotation_id: string | null  // FK to quotations
                    work_order_id: string | null  // FK to work_orders
                    production_log_id: string | null  // FK to production_logs
                    uploaded_by: string  // アップロード者 (user_id)
                    file_type: 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER'
                    file_name: string  // 元のファイル名
                    file_url: string  // Storage URL
                    file_size: number  // ファイルサイズ (bytes)
                    version: number  // バージョン番号
                    is_latest: boolean  // 最新バージョンフラグ
                    validation_status: 'PENDING' | 'VALID' | 'INVALID'  // 検証ステータス
                    validation_errors: Json | null  // 検証エラー
                    metadata: Json | null  // 追加メタデータ
                    // AI Extraction fields
                    ai_extraction_status: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_revision' | null
                    ai_extraction_data: Json | null  // 抽出されたデータ
                    ai_confidence_score: number | null  // 信頼度スコア (0-1)
                    ai_extraction_method: 'ai_parser' | 'manual' | 'hybrid' | 'adobe_api' | 'pattern_matching' | 'manual_entry' | 'ai_vision' | 'ocr' | null
                    ai_extracted_at: string | null  // 抽出日時
                    ai_validation_errors: Json | null  // AI抽出エラー
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['files']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['files']['Row'], 'id' | 'created_at'>>
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
            }

            // Order Audit Log table - 監査ログ
            order_audit_log: {
                Row: {
                    id: string
                    table_name: string  // テーブル名 (orders, quotations, etc.)
                    record_id: string  // レコードID
                    action: 'INSERT' | 'UPDATE' | 'DELETE'  // アクション
                    old_data: Json | null  // 変更前データ
                    new_data: Json | null  // 変更後データ
                    changed_fields: string[] | null  // 変更されたフィールド
                    changed_by: string  // 変更者 (user_id)
                    changed_at: string  // 変更日時
                    ip_address: string | null  // IPアドレス
                    user_agent: string | null  // User Agent
                }
                Insert: Omit<Database['public']['Tables']['order_audit_log']['Row'], 'id' | 'changed_at'>
                Update: Partial<Database['public']['Tables']['order_audit_log']['Row']>
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
            }

            // Production jobs table - 生産ジョブ (Production Jobs)
            production_jobs: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    work_order_id: string | null  // FK to work_orders
                    production_log_id: string | null  // FK to production_logs
                    job_number: string  // JOB-YYYYMMDD-NNNN
                    job_name: string  // Job name
                    job_type: 'design_setup' | 'material_prep' | 'printing' | 'lamination' | 'slitting' | 'pouch_making' | 'quality_check' | 'packaging' | 'other'
                    description: string | null
                    specifications: Json  // Job specifications
                    status: 'pending' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'failed' | 'cancelled'
                    priority: number  // 1-10 (1 = highest)
                    assigned_to: string | null  // FK to profiles
                    assigned_at: string | null
                    scheduled_start_at: string | null
                    scheduled_end_at: string | null
                    estimated_duration_minutes: number | null
                    actual_start_at: string | null
                    actual_end_at: string | null
                    actual_duration_minutes: number | null
                    progress_percentage: number  // 0-100
                    current_step: string | null
                    steps_total: number
                    steps_completed: number
                    output_quantity: number  // Output quantity
                    output_uom: string  // Unit of measure
                    rejected_quantity: number  // Rejected quantity
                    rejection_reason: string | null
                    depends_on: Json  // Array of job IDs
                    failure_reason: string | null
                    retry_count: number
                    max_retries: number
                    parent_job_id: string | null  // For retries
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['production_jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['production_jobs']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }

            // Production data table - データ入稿 (Data Received)
            production_data: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    data_type: 'design_file' | 'specification' | 'approval' | 'material_data' | 'layout_data' | 'color_data' | 'other'
                    title: string  // Data title
                    description: string | null
                    version: string  // e.g., "1.0"
                    file_id: string | null  // FK to files
                    file_url: string | null
                    validation_status: 'pending' | 'valid' | 'invalid' | 'needs_revision'
                    validated_by: string | null  // FK to profiles
                    validated_at: string | null
                    validation_notes: string | null
                    validation_errors: Json | null
                    approved_for_production: boolean
                    approved_by: string | null  // FK to profiles
                    approved_at: string | null
                    submitted_by_customer: boolean
                    customer_contact_info: Json | null
                    received_at: string
                    // AI Extraction fields
                    extracted_data: Json | null  // AI抽出された製品仕様データ
                    confidence_score: number | null  // 抽出信頼度 (0-1)
                    extraction_metadata: Json | null  // 抽出メタデータ (provider, model, processingTime, etc.)
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['production_data']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['production_data']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }

            // Spec sheets table - 仕様書 (Specification Sheets)
            spec_sheets: {
                Row: {
                    id: string
                    product_id: string | null  // FK to products
                    work_order_id: string | null  // FK to work_orders
                    spec_number: string  // SPEC-YYYYMMDD-NNNN
                    version: string  // e.g., "1.0"
                    title: string  // Spec title
                    description: string | null
                    category: string | null  // Spec category
                    specifications: Json  // Spec data in JSON
                    pdf_url: string | null  // PDF document URL
                    status: 'draft' | 'pending_review' | 'active' | 'deprecated' | 'archived'
                    effective_at: string | null  // When spec becomes active
                    expires_at: string | null  // Optional expiration
                    created_by: string | null  // FK to profiles
                    approved_by: string | null  // FK to profiles
                    approved_at: string | null
                    approval_notes: string | null
                    parent_spec_id: string | null  // For versioning
                    is_latest_version: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['spec_sheets']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['spec_sheets']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }

            // Spec sections table - 仕様書セクション (Spec Sections)
            spec_sections: {
                Row: {
                    id: string
                    spec_sheet_id: string  // FK to spec_sheets
                    section_number: string  // e.g., "1.0", "2.1"
                    section_title: string  // Section title
                    section_type: 'general' | 'materials' | 'dimensions' | 'printing' | 'barrier' | 'mechanical' | 'visual' | 'packaging' | 'testing' | 'other'
                    section_content: string  // Detailed content
                    section_data: Json  // Structured data
                    display_order: number  // Display order
                    parent_section_id: string | null  // For subsections
                    level: number  // Hierarchy level
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['spec_sections']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['spec_sections']['Row'], 'id' | 'created_at' | 'updated_at'>>
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
            }

            // Shipment tracking table - 配送追跡 (Shipment Tracking)
            shipment_tracking: {
                Row: {
                    id: string
                    shipment_id: string  // FK to shipments
                    status_code: string  // Carrier status code
                    status_description: string  // Human-readable description
                    location: string | null  // Current location
                    facility_name: string | null  // Facility name
                    event_data: Json  // Additional event data
                    event_at: string  // Event timestamp
                    received_at: string  // When received by system
                    source: string  // 'api', 'manual', 'webhook'
                }
                Insert: Omit<Database['public']['Tables']['shipment_tracking']['Row'], 'id' | 'received_at'>
                Update: Partial<Database['public']['Tables']['shipment_tracking']['Row']>
            }

            // Company invitations table - 会社招待管理 (Company Invitations)
            company_invitations: {
                Row: {
                    id: string
                    email: string  // 招待先メールアドレス
                    company_id: string  // 会社名 or company ID
                    invited_by: string  // FK to profiles (招待者)
                    role: 'ADMIN' | 'MEMBER'  // 招待された役割
                    token: string  // 招待トークン (一意識別子)
                    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'  // 招待ステータス
                    message: string | null  // 招待メッセージ
                    expires_at: string  // 有効期限
                    accepted_by: string | null  // FK to profiles (承諾者)
                    accepted_at: string | null  // 承諾日時
                    created_at: string
                    updated_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['company_invitations']['Row'], 'id' | 'created_at'>
                Update: Partial<Omit<Database['public']['Tables']['company_invitations']['Row'], 'id' | 'created_at'>>
            }

            // ============================================================
            // ELECTRONIC SIGNATURE SYSTEM TABLES (Phase 5)
            // ============================================================

            // Signatures table - 電子署名レコード (Signature Records)
            signatures: {
                Row: {
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
                Insert: Omit<Database['public']['Tables']['signatures']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['signatures']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }

            // Signature Events table - 署名イベント監査ログ (Signature Audit Trail)
            signature_events: {
                Row: {
                    id: string
                    envelope_id: string
                    provider: string
                    event: string
                    metadata: Json
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['signature_events']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['signature_events']['Row']>
            }

            // Hanko Images table - はんこ画像 (Japanese Seal Images)
            hanko_images: {
                Row: {
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
                Insert: Omit<Database['public']['Tables']['hanko_images']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['hanko_images']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }

            // Web Vitals table - Webパフォーマンス指標
            web_vitals: {
                Row: {
                    id: string
                    metric_name: string  // 'LCP', 'FID', 'CLS', 'FCP', 'TTFB'
                    value: number
                    rating: 'good' | 'needs-improvement' | 'poor'
                    page: string | null  // URL path
                    user_id: string | null
                    metadata: Json | null
                    device_type: string | null
                    connection_type: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['web_vitals']['Row'], 'id' | 'created_at'>
                Update: Partial<Database['public']['Tables']['web_vitals']['Row']>
            }

            // Audit Logs table - 監査ログ (Audit Logs for Electronic Signature System)
            audit_logs: {
                Row: {
                    id: string
                    timestamp: string
                    event_type: 'system_start' | 'system_shutdown' | 'user_login' | 'user_logout' | 'timestamp_created' | 'timestamp_verified' | 'signature_created' | 'signature_verified' | 'contract_created' | 'contract_signed' | 'contract_status_changed' | 'ip_validation' | 'security_alert' | 'data_access' | 'data_modification' | 'data_deletion' | 'admin_action' | 'error_occurred'
                    resource_type: 'timestamp_token' | 'signature' | 'contract' | 'user' | 'system' | 'ip_validation' | 'other'
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
            }

            // Customer Notifications table - カスタマー通知 (Customer Notifications)
            customer_notifications: {
                Row: {
                    id: string
                    user_id: string  // FK to profiles
                    notification_type: 'order_update' | 'shipment_update' | 'contract_ready' | 'quote_ready' | 'production_update' | 'document_ready' | 'delivery_scheduled'
                    title: string
                    title_ja: string
                    message: string
                    message_ja: string
                    order_id: string | null  // FK to orders
                    quotation_id: string | null  // FK to quotations
                    shipment_id: string | null  // FK to shipments
                    action_url: string | null
                    action_label: string | null
                    action_label_ja: string | null
                    read: boolean  // Read status
                    sent_via_email: boolean  // Email delivery status
                    sent_via_sms: boolean  // SMS delivery status
                    expires_at: string | null  // Notification expiry date
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['customer_notifications']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['customer_notifications']['Row'], 'id' | 'created_at' | 'updated_at'>>
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
            }

            // ============================================================
            // FILM COST SYSTEM NEW TABLES (Phase 4)
            // ============================================================

            // System Settings table - 시스템 설정 (film material prices, processing costs, etc.)
            system_settings: {
                Row: {
                    id: string
                    category: string  // e.g., 'film_material', 'pouch_processing', 'printing', 'lamination', 'slitter', 'exchange_rate', 'duty_rate', 'delivery', 'production', 'pricing'
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
            }

            // ============================================================
            // Order Comments table - 注文コメントシステム
            // ============================================================
            order_comments: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    content: string
                    comment_type: 'general' | 'production' | 'shipping' | 'billing' | 'correction' | 'internal'
                    author_id: string  // FK to profiles
                    author_role: 'customer' | 'admin' | 'production'
                    is_internal: boolean
                    attachments: Json  // JSON array of attachment info
                    parent_comment_id: string | null  // FK to order_comments (self-reference)
                    metadata: Json
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['order_comments']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['order_comments']['Row'], 'id' | 'created_at'>>
            }

            // ============================================================
            // Customer Approval Requests table - 顧客承認リクエストシステム
            // ============================================================
            customer_approval_requests: {
                Row: {
                    id: string
                    order_id: string  // FK to orders
                    korea_correction_id: string | null  // FK to korea_corrections
                    title: string
                    description: string
                    approval_type: 'correction' | 'spec_change' | 'price_adjustment' | 'delay' | 'other'
                    status: 'pending' | 'approved' | 'rejected' | 'cancelled'
                    response_notes: string | null
                    responded_at: string | null
                    responded_by: string | null  // FK to users
                    expires_at: string  // Default 7 days from request
                    requested_by: string  // FK to users
                    requested_at: string
                    metadata: Json
                    version: number  // Optimistic locking
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['customer_approval_requests']['Row'], 'id' | 'created_at' | 'updated_at' | 'requested_at'>
                Update: Partial<Omit<Database['public']['Tables']['customer_approval_requests']['Row'], 'id' | 'created_at' | 'updated_at' | 'requested_at'>>
            }

            // Approval Request Files table - 承認リクエスト添付ファイル
            approval_request_files: {
                Row: {
                    id: string
                    approval_request_id: string  // FK to customer_approval_requests
                    file_name: string
                    file_type: string
                    file_url: string
                    file_size_bytes: number
                    file_category: 'specification' | 'quote' | 'contract' | 'image' | 'document' | 'other'
                    uploaded_at: string
                    uploaded_by: string | null  // FK to users
                }
                Insert: Omit<Database['public']['Tables']['approval_request_files']['Row'], 'id' | 'uploaded_at'>
                Update: Partial<Database['public']['Tables']['approval_request_files']['Row']>
            }

            // Approval Request Comments table - 承認リクエストコメント
            approval_request_comments: {
                Row: {
                    id: string
                    approval_request_id: string  // FK to customer_approval_requests
                    content: string
                    author_id: string  // FK to users
                    author_role: 'admin' | 'member' | 'system'
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['approval_request_comments']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['approval_request_comments']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            // Business types
            business_type: 'INDIVIDUAL' | 'CORPORATION'
            // Product categories
            product_category: 'COSMETICS' | 'CLOTHING' | 'ELECTRONICS' | 'KITCHEN' | 'FURNITURE' | 'OTHER'
            // User roles
            user_role: 'ADMIN' | 'MEMBER'
            // User status
            user_status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'
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

            // Work order status
            work_order_status: 'DRAFT' | 'GENERATED' | 'APPROVED' | 'IN_PRODUCTION' | 'COMPLETED'

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

            // Production data types
            production_data_type: 'design_file' | 'specification' | 'approval' | 'material_data' | 'layout_data' | 'color_data' | 'other'

            // Production data validation status
            production_data_validation_status: 'pending' | 'valid' | 'invalid' | 'needs_revision'

            // Spec sheet status
            spec_sheet_status: 'draft' | 'pending_review' | 'active' | 'deprecated' | 'archived'

            // Spec section types
            spec_section_type: 'general' | 'materials' | 'dimensions' | 'printing' | 'barrier' | 'mechanical' | 'visual' | 'packaging' | 'testing' | 'other'

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
