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

export interface Product {
    id: string
    category: 'flat_3_side' | 'stand_up' | 'gusset' | 'box' | 'flat_with_zip' | 'special' | 'soft_pouch' | 'spout_pouch' | 'roll_film'
    name_ja: string
    name_en: string
    description_ja: string
    description_en: string
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
  product_code: string | null
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
                    user_type: 'B2C' | 'B2B' | null  // B2C: 일반 소비자, B2B: 기업 고객
                    company_name: string | null
                    legal_entity_number: string | null
                    corporate_number: string | null  // 사업자등록번호 (13자리) - 법인번호와 별도
                    position: string | null
                    department: string | null
                    company_url: string | null
                    product_category: 'COSMETICS' | 'CLOTHING' | 'ELECTRONICS' | 'KITCHEN' | 'FURNITURE' | 'OTHER'
                    acquisition_channel: string | null
                    postal_code: string | null
                    prefecture: string | null
                    city: string | null
                    street: string | null
                    building: string | null  // 건물명
                    role: 'ADMIN' | 'MEMBER'
                    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'
                    // B2B 추가 필드
                    founded_year: string | null  // 설립연도
                    capital: string | null  // 자본금
                    representative_name: string | null  // 대표자명
                    business_document_path: string | null  // 사업자등록증 저장 경로
                    verification_token: string | null  // 이메일 인증 토큰
                    verification_expires_at: string | null  // 인증 토큰 만료일
                    created_at: string
                    updated_at: string
                    last_login_at: string | null
                }
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>>
            }

            // Orders table
            // Orders table - B2B 확장 (Extended for B2B Order Management)
            orders: {
                Row: {
                    id: string
                    user_id: string  // FK to profiles
                    company_id: string | null  // FK to companies
                    quotation_id: string | null  // FK to quotations (created from approved quotation)
                    order_number: string  // ORD-YYYY-NNNN format
                    current_state: string  // Current state in 10-step workflow
                    state_metadata: Json | null  // State-related data
                    status: 'PENDING' | 'QUOTATION' | 'DATA_RECEIVED' | 'WORK_ORDER' | 'CONTRACT_SENT' | 'CONTRACT_SIGNED' | 'PRODUCTION' | 'STOCK_IN' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
                    total_amount: number  // Order total amount
                    subtotal: number  // Subtotal amount
                    tax_amount: number  // Tax amount
                    customer_name: string  // Customer name snapshot
                    customer_email: string  // Customer email snapshot
                    notes: string | null  // Order notes
                    created_at: string
                    updated_at: string
                    shipped_at: string | null
                    delivered_at: string | null
                    // Order confirmation fields
                    payment_term: 'credit' | 'advance'  // 掛け払い | 前払
                    shipping_address: Json | null  // Shipping address
                    billing_address: Json | null  // Billing address
                    requested_delivery_date: string | null  // Requested delivery date
                    delivery_notes: string | null  // Delivery notes
                    estimated_delivery_date: string | null  // Estimated delivery date
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

            // Quotations table - B2B 확장 (Extended for B2B)
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

            // Quotation items table - B2B 확장 (Extended for B2B)
            quotation_items: {
                Row: {
                    id: string
                    quotation_id: string  // FK to quotations
                    product_id: string | null  // FK to products (if available)
                    product_name: string  // Product name
                    product_code: string | null  // Product code/SKU
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
                    extracted_data: Json | null  // AI 추출된 제품 사양 데이터
                    confidence_score: number | null  // 추출 신뢰도 (0-1)
                    extraction_metadata: Json | null  // 추출 메타데이터 (provider, model, processingTime, etc.)
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
            quotation_status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
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
