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
      admin_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_order_notes: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          korea_email_address: string | null
          notes: string
          order_id: string
          sent_to_korea_at: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          korea_email_address?: string | null
          notes?: string
          order_id: string
          sent_to_korea_at?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          korea_email_address?: string | null
          notes?: string
          order_id?: string
          sent_to_korea_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_published: boolean
          priority: string
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          priority?: string
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          priority?: string
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      approval_request_comments: {
        Row: {
          approval_request_id: string
          author_id: string
          author_role: string
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          parent_comment_id: string | null
          updated_at: string | null
        }
        Insert: {
          approval_request_id: string
          author_id: string
          author_role: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          parent_comment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_request_id?: string
          author_id?: string
          author_role?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          parent_comment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_request_comments_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "customer_approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_request_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_request_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "approval_request_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_request_files: {
        Row: {
          approval_request_id: string
          created_at: string | null
          file_category: string | null
          file_name: string
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          approval_request_id: string
          created_at?: string | null
          file_category?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          approval_request_id?: string
          created_at?: string | null
          file_category?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_request_files_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "customer_approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_request_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          ip_validation: Json | null
          jurisdiction: string
          outcome: string
          request_id: string | null
          resource_id: string | null
          resource_type: string
          retention_period_days: number
          scheduled_deletion_at: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          ip_validation?: Json | null
          jurisdiction?: string
          outcome: string
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          retention_period_days?: number
          scheduled_deletion_at?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          ip_validation?: Json | null
          jurisdiction?: string
          outcome?: string
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          retention_period_days?: number
          scheduled_deletion_at?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_addresses: {
        Row: {
          address: string
          building: string | null
          city: string
          company_name: string
          created_at: string
          email: string | null
          id: string
          is_default: boolean
          phone: string | null
          postal_code: string
          prefecture: string
          tax_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          building?: string | null
          city: string
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          is_default?: boolean
          phone?: string | null
          postal_code: string
          prefecture: string
          tax_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          building?: string | null
          city?: string
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          is_default?: boolean
          phone?: string | null
          postal_code?: string
          prefecture?: string
          tax_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          description: string | null
          id: string
          name_en: string
          name_ja: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id: string
          name_en: string
          name_ja: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          name_en?: string
          name_ja?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      blog_images: {
        Row: {
          alt_text: string | null
          created_at: string
          created_by: string | null
          file_size: number
          height: number | null
          id: string
          mime_type: string
          original_filename: string
          post_id: string | null
          storage_path: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          created_by?: string | null
          file_size: number
          height?: number | null
          id?: string
          mime_type: string
          original_filename: string
          post_id?: string | null
          storage_path: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          created_by?: string | null
          file_size?: number
          height?: number | null
          id?: string
          mime_type?: string
          original_filename?: string
          post_id?: string | null
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_images_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category: string
          content: string
          content_type: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_path: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: string
          tags: string[] | null
          template_data: Json | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category: string
          content: string
          content_type?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_path?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: string
          tags?: string[] | null
          template_data?: Json | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category?: string
          content?: string
          content_type?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_path?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: string
          tags?: string[] | null
          template_data?: Json | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_failover_logs: {
        Row: {
          created_at: string | null
          event_type: string
          from_provider: string | null
          id: number
          metadata: Json | null
          reason: string | null
          to_provider: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          from_provider?: string | null
          id?: number
          metadata?: Json | null
          reason?: string | null
          to_provider?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          from_provider?: string | null
          id?: number
          metadata?: Json | null
          reason?: string | null
          to_provider?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          business_type: string | null
          city: string | null
          company_name: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          legal_entity_number: string | null
          postal_code: string | null
          prefecture: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          business_type?: string | null
          city?: string | null
          company_name: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          legal_entity_number?: string | null
          postal_code?: string | null
          prefecture?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: string | null
          city?: string | null
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          legal_entity_number?: string | null
          postal_code?: string | null
          prefecture?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contract_reminders: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          message: string | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          message?: string | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          message?: string | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_reminders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_reminders_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          admin_signature_url: string | null
          admin_signed_at: string | null
          contract_data: Json
          contract_number: string
          contract_type: string
          created_at: string
          currency: string
          customer_email: string
          customer_ip_address: string | null
          customer_name: string
          customer_signature_url: string | null
          customer_signed_at: string | null
          expires_at: string | null
          final_contract_url: string | null
          id: string
          last_reminded_at: string | null
          notes: string | null
          order_id: string
          quotation_id: string | null
          reminder_count: number | null
          sent_at: string | null
          status: string
          terms: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          admin_signature_url?: string | null
          admin_signed_at?: string | null
          contract_data?: Json
          contract_number: string
          contract_type?: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_ip_address?: string | null
          customer_name: string
          customer_signature_url?: string | null
          customer_signed_at?: string | null
          expires_at?: string | null
          final_contract_url?: string | null
          id?: string
          last_reminded_at?: string | null
          notes?: string | null
          order_id: string
          quotation_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          admin_signature_url?: string | null
          admin_signed_at?: string | null
          contract_data?: Json
          contract_number?: string
          contract_type?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_ip_address?: string | null
          customer_name?: string
          customer_signature_url?: string | null
          customer_signed_at?: string | null
          expires_at?: string | null
          final_contract_url?: string | null
          id?: string
          last_reminded_at?: string | null
          notes?: string | null
          order_id?: string
          quotation_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string
          terms?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "contracts_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          final_amount: number
          id: string
          order_id: string | null
          original_amount: number
          quotation_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          final_amount: number
          id?: string
          order_id?: string | null
          original_amount: number
          quotation_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          final_amount?: number
          id?: string
          order_id?: string | null
          original_amount?: number
          quotation_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: true
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "coupon_usage_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: true
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_customer_types: string[] | null
          applicable_customers: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          description_ja: string | null
          id: string
          max_uses: number | null
          max_uses_per_customer: number | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          name: string
          name_ja: string | null
          notes: string | null
          status: Database["public"]["Enums"]["coupon_status"] | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          applicable_customer_types?: string[] | null
          applicable_customers?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          description_ja?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_customer?: number | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          name: string
          name_ja?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["coupon_status"] | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          applicable_customer_types?: string[] | null
          applicable_customers?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          description_ja?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_customer?: number | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          name?: string
          name_ja?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["coupon_status"] | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_approval_requests: {
        Row: {
          approval_type: string
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          korea_correction_id: string | null
          metadata: Json | null
          order_id: string
          requested_at: string | null
          requested_by: string
          responded_at: string | null
          responded_by: string | null
          response_notes: string | null
          status: string
          title: string
          updated_at: string | null
          version: number
        }
        Insert: {
          approval_type: string
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          korea_correction_id?: string | null
          metadata?: Json | null
          order_id: string
          requested_at?: string | null
          requested_by: string
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          status?: string
          title: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          approval_type?: string
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          korea_correction_id?: string | null
          metadata?: Json | null
          order_id?: string
          requested_at?: string | null
          requested_by?: string
          responded_at?: string | null
          responded_by?: string | null
          response_notes?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_approval_requests_korea_correction_id_fkey"
            columns: ["korea_correction_id"]
            isOneToOne: false
            referencedRelation: "korea_corrections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_approval_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_approval_requests_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          customer_id: string
          id: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string
          customer_id: string
          id?: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_file_submissions: {
        Row: {
          file_id: string | null
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          is_current: boolean
          order_id: string
          order_item_id: string | null
          original_filename: string
          previous_submission_id: string | null
          replaced_at: string | null
          replaced_by: string | null
          submission_number: number
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_id?: string | null
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          is_current?: boolean
          order_id: string
          order_item_id?: string | null
          original_filename: string
          previous_submission_id?: string | null
          replaced_at?: string | null
          replaced_by?: string | null
          submission_number?: number
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          file_id?: string | null
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_current?: boolean
          order_id?: string
          order_item_id?: string | null
          original_filename?: string
          previous_submission_id?: string | null
          replaced_at?: string | null
          replaced_by?: string | null
          submission_number?: number
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_file_submissions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_file_submissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_file_submissions_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_file_submissions_previous_submission_id_fkey"
            columns: ["previous_submission_id"]
            isOneToOne: false
            referencedRelation: "customer_file_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_file_submissions_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_file_submissions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_addresses: {
        Row: {
          address: string
          building: string | null
          city: string
          contact_person: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          phone: string
          postal_code: string
          prefecture: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          building?: string | null
          city: string
          contact_person?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          phone: string
          postal_code: string
          prefecture: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          building?: string | null
          city?: string
          contact_person?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          phone?: string
          postal_code?: string
          prefecture?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_postprocessing_positions: {
        Row: {
          created_at: string
          hang_hole_diameter: string | null
          hang_hole_position: string | null
          id: string
          input_by_name: string | null
          input_by_type: string | null
          notch_bottom: string | null
          notch_top: string | null
          print_position: string | null
          revision_id: string
          sku_name: string
          special_processing: string | null
          updated_at: string
          zipper_position: string | null
        }
        Insert: {
          created_at?: string
          hang_hole_diameter?: string | null
          hang_hole_position?: string | null
          id?: string
          input_by_name?: string | null
          input_by_type?: string | null
          notch_bottom?: string | null
          notch_top?: string | null
          print_position?: string | null
          revision_id: string
          sku_name: string
          special_processing?: string | null
          updated_at?: string
          zipper_position?: string | null
        }
        Update: {
          created_at?: string
          hang_hole_diameter?: string | null
          hang_hole_position?: string | null
          id?: string
          input_by_name?: string | null
          input_by_type?: string | null
          notch_bottom?: string | null
          notch_top?: string | null
          print_position?: string | null
          revision_id?: string
          sku_name?: string
          special_processing?: string | null
          updated_at?: string
          zipper_position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_postprocessing_positions_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "design_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      design_revisions: {
        Row: {
          ai_extracted_data: Json | null
          ai_extraction_confidence: number | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          change_summary: Json | null
          changed_fields: string[] | null
          comment_ja: string | null
          comment_ko: string | null
          completed_at: string | null
          corrected_files: string[] | null
          correction_notes: string | null
          created_at: string
          customer_action: string | null
          customer_action_at: string | null
          customer_comment: string | null
          customer_notes: string | null
          customer_submission_id: string | null
          data_diff: Json | null
          estimated_completion_date: string | null
          generated_correction_filename: string | null
          id: string
          korean_corrected_data: Json | null
          order_id: string | null
          order_item_id: string | null
          original_customer_filename: string | null
          original_file_url: string | null
          original_files: string[] | null
          partner_comment: string | null
          preview_image_url: string | null
          priority: string | null
          quotation_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_decision: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision_description: string | null
          revision_name: string
          revision_number: number
          revision_reason: string | null
          sku_name: string | null
          spec_sheet_url: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          translation_completed_at: string | null
          translation_requested_at: string | null
          translation_status: string | null
          updated_at: string
          uploaded_by_id: string | null
          uploaded_by_type: string | null
        }
        Insert: {
          ai_extracted_data?: Json | null
          ai_extraction_confidence?: number | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: Json | null
          changed_fields?: string[] | null
          comment_ja?: string | null
          comment_ko?: string | null
          completed_at?: string | null
          corrected_files?: string[] | null
          correction_notes?: string | null
          created_at?: string
          customer_action?: string | null
          customer_action_at?: string | null
          customer_comment?: string | null
          customer_notes?: string | null
          customer_submission_id?: string | null
          data_diff?: Json | null
          estimated_completion_date?: string | null
          generated_correction_filename?: string | null
          id?: string
          korean_corrected_data?: Json | null
          order_id?: string | null
          order_item_id?: string | null
          original_customer_filename?: string | null
          original_file_url?: string | null
          original_files?: string[] | null
          partner_comment?: string | null
          preview_image_url?: string | null
          priority?: string | null
          quotation_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_decision?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_description?: string | null
          revision_name: string
          revision_number?: number
          revision_reason?: string | null
          sku_name?: string | null
          spec_sheet_url?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          translation_completed_at?: string | null
          translation_requested_at?: string | null
          translation_status?: string | null
          updated_at?: string
          uploaded_by_id?: string | null
          uploaded_by_type?: string | null
        }
        Update: {
          ai_extracted_data?: Json | null
          ai_extraction_confidence?: number | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          change_summary?: Json | null
          changed_fields?: string[] | null
          comment_ja?: string | null
          comment_ko?: string | null
          completed_at?: string | null
          corrected_files?: string[] | null
          correction_notes?: string | null
          created_at?: string
          customer_action?: string | null
          customer_action_at?: string | null
          customer_comment?: string | null
          customer_notes?: string | null
          customer_submission_id?: string | null
          data_diff?: Json | null
          estimated_completion_date?: string | null
          generated_correction_filename?: string | null
          id?: string
          korean_corrected_data?: Json | null
          order_id?: string | null
          order_item_id?: string | null
          original_customer_filename?: string | null
          original_file_url?: string | null
          original_files?: string[] | null
          partner_comment?: string | null
          preview_image_url?: string | null
          priority?: string | null
          quotation_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_decision?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_description?: string | null
          revision_name?: string
          revision_number?: number
          revision_reason?: string | null
          sku_name?: string | null
          spec_sheet_url?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          translation_completed_at?: string | null
          translation_requested_at?: string | null
          translation_status?: string | null
          updated_at?: string
          uploaded_by_id?: string | null
          uploaded_by_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_revisions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_customer_submission_id_fkey"
            columns: ["customer_submission_id"]
            isOneToOne: false
            referencedRelation: "customer_file_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "design_revisions_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_revisions_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      designer_task_assignments: {
        Row: {
          access_token_expires_at: string | null
          access_token_hash: string | null
          assigned_at: string | null
          assigned_by: string | null
          completed_at: string | null
          designer_id: string | null
          id: string
          last_accessed_at: string | null
          notes: string | null
          order_id: string | null
          status: string | null
        }
        Insert: {
          access_token_expires_at?: string | null
          access_token_hash?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          designer_id?: string | null
          id?: string
          last_accessed_at?: string | null
          notes?: string | null
          order_id?: string | null
          status?: string | null
        }
        Update: {
          access_token_expires_at?: string | null
          access_token_hash?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          completed_at?: string | null
          designer_id?: string | null
          id?: string
          last_accessed_at?: string | null
          notes?: string | null
          order_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designer_task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_task_assignments_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_task_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      designer_upload_tokens: {
        Row: {
          access_count: number
          created_at: string
          created_by: string
          designer_email: string | null
          designer_id: string | null
          designer_name: string | null
          expires_at: string
          id: string
          last_accessed_at: string | null
          order_id: string
          status: string
          token_hash: string
          token_prefix: string
          upload_count: number
        }
        Insert: {
          access_count?: number
          created_at?: string
          created_by: string
          designer_email?: string | null
          designer_id?: string | null
          designer_name?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          order_id: string
          status?: string
          token_hash: string
          token_prefix: string
          upload_count?: number
        }
        Update: {
          access_count?: number
          created_at?: string
          created_by?: string
          designer_email?: string | null
          designer_id?: string | null
          designer_name?: string | null
          expires_at?: string
          id?: string
          last_accessed_at?: string | null
          order_id?: string
          status?: string
          token_hash?: string
          token_prefix?: string
          upload_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "designer_upload_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_upload_tokens_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_upload_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_log: {
        Row: {
          accessed_at: string
          action: string
          document_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          order_id: string | null
          quotation_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string
          action: string
          document_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          order_id?: string | null
          quotation_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string
          action?: string
          document_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          order_id?: string | null
          quotation_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_log_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "document_access_log_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          file_path: string
          file_size_bytes: number | null
          file_type: Database["public"]["Enums"]["file_type"]
          file_url: string
          id: string
          is_latest: boolean
          order_id: string | null
          order_item_id: string | null
          original_filename: string
          quotation_id: string | null
          sku_name: string | null
          source_file_id: string | null
          uploaded_at: string
          uploaded_by: string | null
          validated_at: string | null
          validation_results: Json | null
          validation_status: Database["public"]["Enums"]["file_validation_status"]
          version: number
        }
        Insert: {
          file_path: string
          file_size_bytes?: number | null
          file_type: Database["public"]["Enums"]["file_type"]
          file_url: string
          id?: string
          is_latest?: boolean
          order_id?: string | null
          order_item_id?: string | null
          original_filename: string
          quotation_id?: string | null
          sku_name?: string | null
          source_file_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          validated_at?: string | null
          validation_results?: Json | null
          validation_status?: Database["public"]["Enums"]["file_validation_status"]
          version?: number
        }
        Update: {
          file_path?: string
          file_size_bytes?: number | null
          file_type?: Database["public"]["Enums"]["file_type"]
          file_url?: string
          id?: string
          is_latest?: boolean
          order_id?: string | null
          order_item_id?: string | null
          original_filename?: string
          quotation_id?: string | null
          sku_name?: string | null
          source_file_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          validated_at?: string | null
          validation_results?: Json | null
          validation_status?: Database["public"]["Enums"]["file_validation_status"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "files_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          admin_notes: string | null
          city: string | null
          company_name: string | null
          created_at: string
          customer_name: string
          customer_name_kana: string
          email: string
          fax: string | null
          id: string
          inquiry_number: string
          message: string
          order_id: string | null
          phone: string
          postal_code: string | null
          prefecture: string | null
          preferred_contact: string | null
          privacy_consent: boolean
          request_number: string | null
          responded_at: string | null
          response: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          street: string | null
          subject: string
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at: string
          urgency: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          customer_name?: string
          customer_name_kana?: string
          email?: string
          fax?: string | null
          id?: string
          inquiry_number: string
          message: string
          order_id?: string | null
          phone?: string
          postal_code?: string | null
          prefecture?: string | null
          preferred_contact?: string | null
          privacy_consent?: boolean
          request_number?: string | null
          responded_at?: string | null
          response?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          street?: string | null
          subject: string
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
          urgency?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          customer_name?: string
          customer_name_kana?: string
          email?: string
          fax?: string | null
          id?: string
          inquiry_number?: string
          message?: string
          order_id?: string | null
          phone?: string
          postal_code?: string | null
          prefecture?: string | null
          preferred_contact?: string | null
          privacy_consent?: boolean
          request_number?: string | null
          responded_at?: string | null
          response?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          street?: string | null
          subject?: string
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
          urgency?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_messages: {
        Row: {
          attachments: Json
          body: string
          created_at: string
          id: string
          inquiry_id: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachments?: Json
          body: string
          created_at?: string
          id?: string
          inquiry_id: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachments?: Json
          body?: string
          created_at?: string
          id?: string
          inquiry_id?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          bin_location: string | null
          created_at: string
          id: string
          max_stock_level: number | null
          needs_reorder: boolean | null
          product_code: string
          product_id: string
          product_name: string
          quantity_allocated: number
          quantity_available: number | null
          quantity_on_hand: number
          reorder_point: number
          updated_at: string
          warehouse_location: string
        }
        Insert: {
          bin_location?: string | null
          created_at?: string
          id?: string
          max_stock_level?: number | null
          needs_reorder?: boolean | null
          product_code: string
          product_id: string
          product_name: string
          quantity_allocated?: number
          quantity_available?: number | null
          quantity_on_hand?: number
          reorder_point?: number
          updated_at?: string
          warehouse_location?: string
        }
        Update: {
          bin_location?: string | null
          created_at?: string
          id?: string
          max_stock_level?: number | null
          needs_reorder?: boolean | null
          product_code?: string
          product_id?: string
          product_name?: string
          quantity_allocated?: number
          quantity_available?: number | null
          quantity_on_hand?: number
          reorder_point?: number
          updated_at?: string
          warehouse_location?: string
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string
          entry_date: string | null
          id: string
          inventory_id: string
          notes: Json | null
          performed_by: string | null
          quantity: number
          quantity_after: number
          quantity_before: number
          reason: string | null
          reference_number: string | null
          supplier_name: string | null
          transaction_at: string
          transaction_type: string
        }
        Insert: {
          created_at?: string
          entry_date?: string | null
          id?: string
          inventory_id: string
          notes?: Json | null
          performed_by?: string | null
          quantity: number
          quantity_after: number
          quantity_before: number
          reason?: string | null
          reference_number?: string | null
          supplier_name?: string | null
          transaction_at?: string
          transaction_type: string
        }
        Update: {
          created_at?: string
          entry_date?: string | null
          id?: string
          inventory_id?: string
          notes?: Json | null
          performed_by?: string | null
          quantity?: number
          quantity_after?: number
          quantity_before?: number
          reason?: string | null
          reference_number?: string | null
          supplier_name?: string | null
          transaction_at?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string | null
          display_order: number
          id: string
          invoice_id: string
          notes: string | null
          product_code: string | null
          product_id: string | null
          product_name: string
          quantity: number
          tax_amount: number | null
          tax_rate: number
          total_price: number
          unit: string
          unit_price: number
        }
        Insert: {
          description?: string | null
          display_order?: number
          id?: string
          invoice_id: string
          notes?: string | null
          product_code?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          tax_amount?: number | null
          tax_rate?: number
          total_price?: number
          unit?: string
          unit_price: number
        }
        Update: {
          description?: string | null
          display_order?: number
          id?: string
          invoice_id?: string
          notes?: string | null
          product_code?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          tax_amount?: number | null
          tax_rate?: number
          total_price?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          admin_notes: string | null
          bank_account: Json | null
          company_address: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          discount_amount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          order_id: string | null
          paid_amount: number
          paid_at: string | null
          payment_method: string | null
          payment_terms: string | null
          pdf_url: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          bank_account?: Json | null
          company_address?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          discount_amount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          order_id?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          bank_account?: Json | null
          company_address?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          paid_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      korea_corrections: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          completed_at: string | null
          corrected_data: Json | null
          corrected_files: string[] | null
          correction_date: string
          correction_notes: string | null
          correction_reference: string | null
          correction_source: Database["public"]["Enums"]["correction_source"]
          created_at: string
          customer_notification_date: string | null
          customer_notified: boolean
          id: string
          issue_category: string | null
          issue_description: string | null
          order_id: string
          quotation_id: string | null
          status: Database["public"]["Enums"]["correction_status"]
          updated_at: string
          urgency: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          corrected_data?: Json | null
          corrected_files?: string[] | null
          correction_date?: string
          correction_notes?: string | null
          correction_reference?: string | null
          correction_source?: Database["public"]["Enums"]["correction_source"]
          created_at?: string
          customer_notification_date?: string | null
          customer_notified?: boolean
          id?: string
          issue_category?: string | null
          issue_description?: string | null
          order_id: string
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          corrected_data?: Json | null
          corrected_files?: string[] | null
          correction_date?: string
          correction_notes?: string | null
          correction_reference?: string | null
          correction_source?: Database["public"]["Enums"]["correction_source"]
          created_at?: string
          customer_notification_date?: string | null
          customer_notified?: boolean
          id?: string
          issue_category?: string | null
          issue_description?: string | null
          order_id?: string
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "korea_corrections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "korea_corrections_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "korea_corrections_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      korea_transfer_log: {
        Row: {
          created_at: string
          files_count: number
          id: string
          message_id: string | null
          order_id: string
          sent_by: string
          sent_to: string
          status: string
          urgency: string
        }
        Insert: {
          created_at?: string
          files_count?: number
          id?: string
          message_id?: string | null
          order_id: string
          sent_by: string
          sent_to: string
          status?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          files_count?: number
          id?: string
          message_id?: string | null
          order_id?: string
          sent_by?: string
          sent_to?: string
          status?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "korea_transfer_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_for: string
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_for: string
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_for?: string
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      order_agreements: {
        Row: {
          agreed_at: string
          agreed_terms: Json
          created_at: string
          full_name: string
          id: string
          ip_address: string | null
          order_id: string
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          agreed_at?: string
          agreed_terms: Json
          created_at?: string
          full_name: string
          id?: string
          ip_address?: string | null
          order_id: string
          terms_version?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          agreed_at?: string
          agreed_terms?: Json
          created_at?: string
          full_name?: string
          id?: string
          ip_address?: string | null
          order_id?: string
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_agreements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_comments: {
        Row: {
          attachments: string[] | null
          author_id: string
          author_role: string
          comment_type: string
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          is_internal: boolean | null
          metadata: Json | null
          order_id: string
          parent_comment_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          author_id: string
          author_role: string
          comment_type?: string
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          metadata?: Json | null
          order_id: string
          parent_comment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          author_id?: string
          author_role?: string
          comment_type?: string
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_internal?: boolean | null
          metadata?: Json | null
          order_id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_comments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "order_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      order_file_uploads: {
        Row: {
          drive_content_link: string | null
          drive_file_id: string
          drive_file_name: string | null
          drive_view_link: string | null
          file_name: string
          file_type: string
          id: string
          order_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          drive_content_link?: string | null
          drive_file_id: string
          drive_file_name?: string | null
          drive_view_link?: string | null
          file_name: string
          file_type: string
          id?: string
          order_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          drive_content_link?: string | null
          drive_file_id?: string
          drive_file_name?: string | null
          drive_view_link?: string | null
          file_name?: string
          file_type?: string
          id?: string
          order_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_file_uploads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_file_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku_name: string | null
          specifications: Json | null
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          sku_name?: string | null
          specifications?: Json | null
          total_price?: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku_name?: string | null
          specifications?: Json | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          created_at: string
          from_status: string
          id: string
          order_id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          from_status: string
          id?: string
          order_id: string
          reason?: string | null
          to_status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string
          id?: string
          order_id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived_at: string | null
          billing_address: Json | null
          billing_address_id: string | null
          cancelled_at: string | null
          coupon_id: string | null
          created_at: string
          current_stage: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: Json | null
          delivery_address_id: string | null
          discount_amount: number
          discount_type: string | null
          id: string
          manual_discount_amount: number | null
          manual_discount_percentage: number | null
          modification_reason: string | null
          modification_requested_at: string | null
          modification_responded_at: string | null
          modification_response: string | null
          notes: string | null
          order_number: string
          previous_specifications: Json | null
          quotation_id: string | null
          shipped_at: string | null
          skip_contract: boolean | null
          status: Database["public"]["Enums"]["b2b_order_status"] | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          billing_address?: Json | null
          billing_address_id?: string | null
          cancelled_at?: string | null
          coupon_id?: string | null
          created_at?: string
          current_stage?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_address_id?: string | null
          discount_amount?: number
          discount_type?: string | null
          id?: string
          manual_discount_amount?: number | null
          manual_discount_percentage?: number | null
          modification_reason?: string | null
          modification_requested_at?: string | null
          modification_responded_at?: string | null
          modification_response?: string | null
          notes?: string | null
          order_number: string
          previous_specifications?: Json | null
          quotation_id?: string | null
          shipped_at?: string | null
          skip_contract?: boolean | null
          status?: Database["public"]["Enums"]["b2b_order_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          billing_address?: Json | null
          billing_address_id?: string | null
          cancelled_at?: string | null
          coupon_id?: string | null
          created_at?: string
          current_stage?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_address_id?: string | null
          discount_amount?: number
          discount_type?: string | null
          id?: string
          manual_discount_amount?: number | null
          manual_discount_percentage?: number | null
          modification_reason?: string | null
          modification_requested_at?: string | null
          modification_responded_at?: string | null
          modification_response?: string | null
          notes?: string | null
          order_number?: string
          previous_specifications?: Json | null
          quotation_id?: string | null
          shipped_at?: string | null
          skip_contract?: boolean | null
          status?: Database["public"]["Enums"]["b2b_order_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "billing_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "delivery_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
          token: string
          token_hash: string
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown
          token: string
          token_hash: string
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          token?: string
          token_hash?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_confirmations: {
        Row: {
          amount: number
          confirmed_at: string
          confirmed_by: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          quotation_id: string
          reference_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          confirmed_at?: string
          confirmed_by: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method: string
          quotation_id: string
          reference_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          confirmed_at?: string
          confirmed_by?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          quotation_id?: string
          reference_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_confirmations_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_confirmations_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "payment_confirmations_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      production_data: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_for_production: boolean
          confidence_score: number | null
          created_at: string
          customer_contact_info: Json | null
          data_type: string
          description: string | null
          extracted_data: Json | null
          extraction_metadata: Json | null
          file_id: string | null
          file_url: string | null
          id: string
          order_id: string
          received_at: string
          submitted_by_customer: boolean
          title: string
          updated_at: string
          validated_at: string | null
          validated_by: string | null
          validation_errors: Json | null
          validation_notes: string | null
          validation_status: string
          version: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_for_production?: boolean
          confidence_score?: number | null
          created_at?: string
          customer_contact_info?: Json | null
          data_type: string
          description?: string | null
          extracted_data?: Json | null
          extraction_metadata?: Json | null
          file_id?: string | null
          file_url?: string | null
          id?: string
          order_id: string
          received_at?: string
          submitted_by_customer?: boolean
          title: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_errors?: Json | null
          validation_notes?: string | null
          validation_status?: string
          version?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_for_production?: boolean
          confidence_score?: number | null
          created_at?: string
          customer_contact_info?: Json | null
          data_type?: string
          description?: string | null
          extracted_data?: Json | null
          extraction_metadata?: Json | null
          file_id?: string | null
          file_url?: string | null
          id?: string
          order_id?: string
          received_at?: string
          submitted_by_customer?: boolean
          title?: string
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_errors?: Json | null
          validation_notes?: string | null
          validation_status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_data_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_data_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_data_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_data_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_logs: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          logged_at: string
          measurements: Json | null
          notes: string | null
          order_id: string
          photo_url: string | null
          progress_percentage: number
          sub_status: Database["public"]["Enums"]["production_sub_status"]
          work_order_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          logged_at?: string
          measurements?: Json | null
          notes?: string | null
          order_id: string
          photo_url?: string | null
          progress_percentage?: number
          sub_status: Database["public"]["Enums"]["production_sub_status"]
          work_order_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          logged_at?: string
          measurements?: Json | null
          notes?: string | null
          order_id?: string
          photo_url?: string | null
          progress_percentage?: number
          sub_status?: Database["public"]["Enums"]["production_sub_status"]
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_logs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          actual_completion_date: string | null
          created_at: string | null
          current_stage: Database["public"]["Enums"]["production_stage"]
          estimated_completion_date: string | null
          id: string
          order_id: string
          priority: string | null
          progress_percentage: number | null
          stage_data: Json
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["production_stage"]
          estimated_completion_date?: string | null
          id?: string
          order_id: string
          priority?: string | null
          progress_percentage?: number | null
          stage_data?: Json
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["production_stage"]
          estimated_completion_date?: string | null
          id?: string
          order_id?: string
          priority?: string | null
          progress_percentage?: number | null
          stage_data?: Json
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          applications: string[] | null
          category: string
          created_at: string | null
          description_en: string
          description_ja: string
          description_ko: string | null
          features: string[] | null
          id: string
          image: string | null
          is_active: boolean
          lead_time_days: number
          materials: string[] | null
          min_order_quantity: number
          name_en: string
          name_ja: string
          name_ko: string | null
          pricing_formula: Json | null
          sort_order: number
          specifications: Json | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          applications?: string[] | null
          category: string
          created_at?: string | null
          description_en: string
          description_ja: string
          description_ko?: string | null
          features?: string[] | null
          id: string
          image?: string | null
          is_active?: boolean
          lead_time_days?: number
          materials?: string[] | null
          min_order_quantity?: number
          name_en: string
          name_ja: string
          name_ko?: string | null
          pricing_formula?: Json | null
          sort_order?: number
          specifications?: Json | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          applications?: string[] | null
          category?: string
          created_at?: string | null
          description_en?: string
          description_ja?: string
          description_ko?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          is_active?: boolean
          lead_time_days?: number
          materials?: string[] | null
          min_order_quantity?: number
          name_en?: string
          name_ja?: string
          name_ko?: string | null
          pricing_formula?: Json | null
          sort_order?: number
          specifications?: Json | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acquisition_channel: string | null
          building: string | null
          business_document_path: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          capital: string | null
          city: string | null
          company_name: string | null
          company_url: string | null
          corporate_number: string | null
          corporate_phone: string | null
          created_at: string
          department: string | null
          designer_name_en: string | null
          designer_name_ko: string | null
          email: string
          fax: string | null
          founded_year: string | null
          id: string
          kana_first_name: string
          kana_last_name: string
          kanji_first_name: string
          kanji_last_name: string
          last_login_at: string | null
          legal_entity_number: string | null
          markup_rate: number | null
          markup_rate_note: string | null
          notification_settings: Json | null
          personal_phone: string | null
          position: string | null
          postal_code: string | null
          prefecture: string | null
          preferred_language: string | null
          product_category: Database["public"]["Enums"]["product_category"]
          representative_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings: Json | null
          status: Database["public"]["Enums"]["user_status"]
          street: string | null
          updated_at: string
          user_type: string | null
          verification_expires_at: string | null
          verification_token: string | null
        }
        Insert: {
          acquisition_channel?: string | null
          building?: string | null
          business_document_path?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          capital?: string | null
          city?: string | null
          company_name?: string | null
          company_url?: string | null
          corporate_number?: string | null
          corporate_phone?: string | null
          created_at?: string
          department?: string | null
          designer_name_en?: string | null
          designer_name_ko?: string | null
          email: string
          fax?: string | null
          founded_year?: string | null
          id: string
          kana_first_name: string
          kana_last_name: string
          kanji_first_name: string
          kanji_last_name: string
          last_login_at?: string | null
          legal_entity_number?: string | null
          markup_rate?: number | null
          markup_rate_note?: string | null
          notification_settings?: Json | null
          personal_phone?: string | null
          position?: string | null
          postal_code?: string | null
          prefecture?: string | null
          preferred_language?: string | null
          product_category: Database["public"]["Enums"]["product_category"]
          representative_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          street?: string | null
          updated_at?: string
          user_type?: string | null
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Update: {
          acquisition_channel?: string | null
          building?: string | null
          business_document_path?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          capital?: string | null
          city?: string | null
          company_name?: string | null
          company_url?: string | null
          corporate_number?: string | null
          corporate_phone?: string | null
          created_at?: string
          department?: string | null
          designer_name_en?: string | null
          designer_name_ko?: string | null
          email?: string
          fax?: string | null
          founded_year?: string | null
          id?: string
          kana_first_name?: string
          kana_last_name?: string
          kanji_first_name?: string
          kanji_last_name?: string
          last_login_at?: string | null
          legal_entity_number?: string | null
          markup_rate?: number | null
          markup_rate_note?: string | null
          notification_settings?: Json | null
          personal_phone?: string | null
          position?: string | null
          postal_code?: string | null
          prefecture?: string | null
          preferred_language?: string | null
          product_category?: Database["public"]["Enums"]["product_category"]
          representative_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          street?: string | null
          updated_at?: string
          user_type?: string | null
          verification_expires_at?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          cost_breakdown: Json | null
          created_at: string
          id: string
          loss_meters: number | null
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          quotation_id: string
          secured_meters: number | null
          sku_index: number | null
          specifications: Json | null
          theoretical_meters: number | null
          total_meters: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          cost_breakdown?: Json | null
          created_at?: string
          id?: string
          loss_meters?: number | null
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          quotation_id: string
          secured_meters?: number | null
          sku_index?: number | null
          specifications?: Json | null
          theoretical_meters?: number | null
          total_meters?: number | null
          total_price?: number
          unit_price: number
        }
        Update: {
          cost_breakdown?: Json | null
          created_at?: string
          id?: string
          loss_meters?: number | null
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          quotation_id?: string
          secured_meters?: number | null
          sku_index?: number | null
          specifications?: Json | null
          theoretical_meters?: number | null
          total_meters?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          company_id: string | null
          coupon_id: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          discount_type: string | null
          estimated_delivery_date: string | null
          id: string
          loss_meters: number | null
          notes: string | null
          pdf_url: string | null
          printing_type: string
          quotation_number: string
          rejected_at: string | null
          sales_rep: string | null
          sent_at: string | null
          sku_count: number | null
          status: Database["public"]["Enums"]["quotation_status"]
          subtotal: number | null
          subtotal_amount: number
          tax_amount: number
          total_amount: number
          total_cost_breakdown: Json | null
          total_meters: number | null
          updated_at: string
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          company_id?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          discount_type?: string | null
          estimated_delivery_date?: string | null
          id?: string
          loss_meters?: number | null
          notes?: string | null
          pdf_url?: string | null
          printing_type?: string
          quotation_number: string
          rejected_at?: string | null
          sales_rep?: string | null
          sent_at?: string | null
          sku_count?: number | null
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number | null
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          total_cost_breakdown?: Json | null
          total_meters?: number | null
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          company_id?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          discount_type?: string | null
          estimated_delivery_date?: string | null
          id?: string
          loss_meters?: number | null
          notes?: string | null
          pdf_url?: string | null
          printing_type?: string
          quotation_number?: string
          rejected_at?: string | null
          sales_rep?: string | null
          sent_at?: string | null
          sku_count?: number | null
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number | null
          subtotal_amount?: number
          tax_amount?: number
          total_amount?: number
          total_cost_breakdown?: Json | null
          total_meters?: number | null
          updated_at?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_config: {
        Row: {
          id: number
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: number
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: number
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      revision_notifications: {
        Row: {
          body_html: string | null
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          recipient_role: string
          revision_id: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          body_html?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          recipient_role: string
          revision_id: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          body_html?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          recipient_role?: string
          revision_id?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revision_notifications_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "design_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_items: {
        Row: {
          category: string
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          sample_request_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity: number
          sample_request_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sample_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_items_sample_request_id_fkey"
            columns: ["sample_request_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_request_destinations: {
        Row: {
          address: string
          company_name: string | null
          contact_person: string
          created_at: string
          id: string
          phone: string
          postal_code: string | null
          sample_request_id: string
        }
        Insert: {
          address: string
          company_name?: string | null
          contact_person: string
          created_at?: string
          id?: string
          phone: string
          postal_code?: string | null
          sample_request_id: string
        }
        Update: {
          address?: string
          company_name?: string | null
          contact_person?: string
          created_at?: string
          id?: string
          phone?: string
          postal_code?: string | null
          sample_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_request_destinations_sample_request_id_fkey"
            columns: ["sample_request_id"]
            isOneToOne: false
            referencedRelation: "sample_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_requests: {
        Row: {
          created_at: string
          delivery_address_id: string | null
          id: string
          notes: string | null
          request_number: string
          shipped_at: string | null
          status: Database["public"]["Enums"]["sample_request_status"]
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_address_id?: string | null
          id?: string
          notes?: string | null
          request_number: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["sample_request_status"]
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_address_id?: string | null
          id?: string
          notes?: string | null
          request_number?: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["sample_request_status"]
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_requests_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "delivery_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_tracking_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_time: string | null
          id: string
          location: string | null
          raw_data: Json | null
          shipment_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          raw_data?: Json | null
          shipment_id?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          raw_data?: Json | null
          shipment_id?: string | null
          status?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          carrier_code: string | null
          carrier_name: string | null
          carrier_tracking_url: string | null
          created_at: string | null
          current_location: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          delivery_notes: string | null
          delivery_signature_required: boolean | null
          delivery_signature_url: string | null
          estimated_delivery_date: string | null
          id: string
          in_transit_since: string | null
          last_tracking_update: string | null
          order_id: string | null
          out_for_delivery_since: string | null
          package_details: Json | null
          pickup_confirmed: boolean | null
          pickup_confirmed_at: string | null
          service_level: string | null
          shipment_number: string
          shipped_at: string | null
          shipping_cost: number | null
          shipping_exceptions: Json | null
          shipping_method: string | null
          shipping_notes: string | null
          status: string | null
          tracking_events: Json | null
          tracking_history: Json | null
          tracking_number: string | null
          tracking_status_code: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          carrier_code?: string | null
          carrier_name?: string | null
          carrier_tracking_url?: string | null
          created_at?: string | null
          current_location?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          delivery_notes?: string | null
          delivery_signature_required?: boolean | null
          delivery_signature_url?: string | null
          estimated_delivery_date?: string | null
          id?: string
          in_transit_since?: string | null
          last_tracking_update?: string | null
          order_id?: string | null
          out_for_delivery_since?: string | null
          package_details?: Json | null
          pickup_confirmed?: boolean | null
          pickup_confirmed_at?: string | null
          service_level?: string | null
          shipment_number: string
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_exceptions?: Json | null
          shipping_method?: string | null
          shipping_notes?: string | null
          status?: string | null
          tracking_events?: Json | null
          tracking_history?: Json | null
          tracking_number?: string | null
          tracking_status_code?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          carrier_code?: string | null
          carrier_name?: string | null
          carrier_tracking_url?: string | null
          created_at?: string | null
          current_location?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          delivery_notes?: string | null
          delivery_signature_required?: boolean | null
          delivery_signature_url?: string | null
          estimated_delivery_date?: string | null
          id?: string
          in_transit_since?: string | null
          last_tracking_update?: string | null
          order_id?: string | null
          out_for_delivery_since?: string | null
          package_details?: Json | null
          pickup_confirmed?: boolean | null
          pickup_confirmed_at?: string | null
          service_level?: string | null
          shipment_number?: string
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_exceptions?: Json | null
          shipping_method?: string | null
          shipping_notes?: string | null
          status?: string | null
          tracking_events?: Json | null
          tracking_history?: Json | null
          tracking_number?: string | null
          tracking_status_code?: string | null
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sku_quotes: {
        Row: {
          cost_breakdown: Json
          created_at: string | null
          id: string
          loss_meters: number | null
          printing_type: string
          quantity: number
          quote_id: string
          secured_meters: number | null
          sku_code: string
          sku_index: number
          specifications: Json
          theoretical_meters: number | null
          total_meters: number | null
          updated_at: string | null
        }
        Insert: {
          cost_breakdown?: Json
          created_at?: string | null
          id?: string
          loss_meters?: number | null
          printing_type?: string
          quantity: number
          quote_id: string
          secured_meters?: number | null
          sku_code: string
          sku_index: number
          specifications?: Json
          theoretical_meters?: number | null
          total_meters?: number | null
          updated_at?: string | null
        }
        Update: {
          cost_breakdown?: Json
          created_at?: string | null
          id?: string
          loss_meters?: number | null
          printing_type?: string
          quantity?: number
          quote_id?: string
          secured_meters?: number | null
          sku_code?: string
          sku_index?: number
          specifications?: Json
          theoretical_meters?: number | null
          total_meters?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sku_quotes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotation_sku_summary"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "sku_quotes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_action_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          performed_at: string | null
          performed_by: string
          production_order_id: string
          stage: Database["public"]["Enums"]["production_stage"]
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          performed_at?: string | null
          performed_by: string
          production_order_id: string
          stage: Database["public"]["Enums"]["production_stage"]
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          performed_at?: string | null
          performed_by?: string
          production_order_id?: string
          stage?: Database["public"]["Enums"]["production_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "stage_action_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_action_history_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          key: string
          unit: string | null
          updated_at: string | null
          updated_by: string | null
          value: Json
          value_type: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          unit?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value: Json
          value_type?: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          unit?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          channels: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          recipient_id: string
          recipient_type: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          channels?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          channels?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_google_tokens: {
        Row: {
          created_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_google_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
Views: {
      quotation_sku_summary: {
        Row: {
          actual_sku_count: number | null
          calculated_total_meters: number | null
          loss_meters: number | null
          quotation_id: string | null
          quotation_number: string | null
          sku_count: number | null
          sku_details: Json | null
          total_amount: number | null
          total_cost_breakdown: Json | null
          total_meters: number | null
        }
        Relationships: []
      }
      shipments_with_order_details: {
        Row: {
          carrier_code: string | null
          carrier_name: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_notes: string | null
          estimated_delivery_date: string | null
          id: string | null
          order_id: string | null
          order_number: string | null
          order_user_id: string | null
          package_details: Json | null
          service_level: string | null
          shipment_number: string | null
          shipped_at: string | null
          shipping_cost: number | null
          shipping_method: string | null
          shipping_notes: string | null
          status: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_with_recent_tracking: {
        Row: {
          carrier_code: string | null
          carrier_name: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_notes: string | null
          estimated_delivery_date: string | null
          id: string | null
          order_id: string | null
          order_number: string | null
          order_user_id: string | null
          package_details: Json | null
          recent_tracking: Json | null
          service_level: string | null
          shipment_number: string | null
          shipped_at: string | null
          shipping_cost: number | null
          shipping_method: string | null
          shipping_notes: string | null
          status: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
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
