// Epackage Lab Database Type Definitions
// Supabase 데이터베이스 타입 정의

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// 공통 타입
export interface DatabaseTimestamps {
  created_at: string
  updated_at: string
}

export interface DatabaseEntity {
  id: string
}

// ENUM 타입 정의
export type ProductCategory =
  | 'packaging_materials'
  | 'containers'
  | 'labels'
  | 'sealing_solutions'
  | 'custom_packaging'
  | 'eco_friendly'
  | 'industrial_packaging'
  | 'consumer_goods'
  | 'other'

export type RequestStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'on_hold'

export type InquiryStatus =
  | 'new'
  | 'in_progress'
  | 'resolved'
  | 'closed'

export type QuotationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'cancelled'

export type SampleStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type InquiryType =
  | 'general'
  | 'technical'
  | 'partnership'
  | 'complaint'

export type PriorityLevel =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

// 데이터베이스 테이블 타입 정의
export interface Contact extends DatabaseEntity, DatabaseTimestamps {
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  position?: string | null
  industry?: string | null
}

export interface Product extends DatabaseEntity, DatabaseTimestamps {
  name: string
  category: ProductCategory
  description?: string | null
  specifications?: Json | null
  min_order_quantity?: number | null
  unit_price?: number | null
  is_active: boolean
}

export interface QuotationRequest extends DatabaseEntity, DatabaseTimestamps {
  contact_id?: string | null
  company?: string | null
  contact_person: string
  email: string
  phone?: string | null
  project_description: string
  requirements?: Json | null
  budget_range?: string | null
  timeline?: string | null
  status: QuotationStatus
  priority: PriorityLevel
  estimated_delivery_date?: string | null
}

export interface QuotationRequestProduct extends DatabaseEntity {
  quotation_request_id: string
  product_id: string
  quantity: number
  unit_price?: number | null
  total_price?: number | null
  notes?: string | null
  created_at: string
}

export interface SampleRequest extends DatabaseEntity, DatabaseTimestamps {
  contact_id?: string | null
  company?: string | null
  contact_person: string
  email: string
  phone?: string | null
  product_category: ProductCategory
  sample_description?: string | null
  purpose?: string | null
  shipping_address?: Json | null
  status: SampleStatus
  tracking_number?: string | null
  shipping_date?: string | null
  expected_delivery_date?: string | null
}

export interface Inquiry extends DatabaseEntity, DatabaseTimestamps {
  contact_id?: string | null
  name: string
  email: string
  phone?: string | null
  company?: string | null
  subject: string
  message: string
  inquiry_type: InquiryType
  status: InquiryStatus
  priority: PriorityLevel
  assigned_to?: string | null
}

export interface InquiryResponse extends DatabaseEntity {
  inquiry_id: string
  responder_name: string
  response: string
  is_internal: boolean
  created_at: string
}

export interface Attachment extends DatabaseEntity {
  table_name: string
  record_id: string
  file_name: string
  file_path: string
  file_size?: number | null
  file_type?: string | null
  uploaded_by?: string | null
  created_at: string
}

// 데이터베이스 전체 타입 (Supabase 타입 생성용)
export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: Contact
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      quotation_requests: {
        Row: QuotationRequest
        Insert: Omit<QuotationRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<QuotationRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      quotation_request_products: {
        Row: QuotationRequestProduct
        Insert: Omit<QuotationRequestProduct, 'id' | 'created_at'>
        Update: Partial<Omit<QuotationRequestProduct, 'id' | 'created_at'>>
      }
      sample_requests: {
        Row: SampleRequest
        Insert: Omit<SampleRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SampleRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      inquiries: {
        Row: Inquiry
        Insert: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>>
      }
      inquiry_responses: {
        Row: InquiryResponse
        Insert: Omit<InquiryResponse, 'id' | 'created_at'>
        Update: Partial<Omit<InquiryResponse, 'id' | 'created_at'>>
      }
      attachments: {
        Row: Attachment
        Insert: Omit<Attachment, 'id' | 'created_at'>
        Update: Partial<Omit<Attachment, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      product_category: ProductCategory
      request_status: RequestStatus
      inquiry_status: InquiryStatus
      inquiry_type: InquiryType
      priority_level: PriorityLevel
    }
  }
}

// API 요청/응답 타입
export interface CreateContactRequest {
  name: string
  company?: string
  email?: string
  phone?: string
  position?: string
  industry?: string
}

export interface CreateQuotationRequestRequest {
  contact_id?: string
  company?: string
  contact_person: string
  email: string
  phone?: string
  project_description: string
  requirements?: Json
  budget_range?: string
  timeline?: string
  priority?: PriorityLevel
  estimated_delivery_date?: string
  products?: Array<{
    product_id: string
    quantity: number
    unit_price?: number
    notes?: string
  }>
}

export interface CreateSampleRequestRequest {
  contact_id?: string
  company?: string
  contact_person: string
  email: string
  phone?: string
  product_category: ProductCategory
  sample_description?: string
  purpose?: string
  shipping_address?: Json
  priority?: PriorityLevel
}

export interface CreateInquiryRequest {
  contact_id?: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  inquiry_type?: InquiryType
  priority?: PriorityLevel
}

export interface CreateInquiryResponseRequest {
  inquiry_id: string
  responder_name: string
  response: string
  is_internal?: boolean
}

// 페이징 및 필터링 타입
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface OrderingParams {
  column?: string
  ascending?: boolean
}

export interface FilterParams {
  status?: RequestStatus | InquiryStatus
  priority?: PriorityLevel
  category?: ProductCategory
  inquiry_type?: InquiryType
  date_from?: string
  date_to?: string
  search?: string
}

export interface QueryParams extends PaginationParams, OrderingParams, FilterParams {
  select?: string
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null
  error: {
    message: string
    code?: string
    details?: Json
  } | null
  count?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number
  hasMore: boolean
  page: number
  limit: number
}

// 유틸리티 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 폼 데이터 타입
export interface ContactFormData {
  name: string
  company: string
  email: string
  phone: string
  position: string
  industry: string
}

export interface QuotationRequestFormData {
  contact_info: {
    company: string
    contact_person: string
    email: string
    phone: string
  }
  project_details: {
    description: string
    requirements: Json
    budget_range: string
    timeline: string
    priority: PriorityLevel
    estimated_delivery_date?: string
  }
  products: Array<{
    product_id: string
    quantity: number
    notes?: string
  }>
}

export interface SampleRequestFormData {
  contact_info: {
    company: string
    contact_person: string
    email: string
    phone: string
  }
  sample_details: {
    product_category: ProductCategory
    description: string
    purpose: string
    shipping_address: Json
    priority: PriorityLevel
  }
}

export interface InquiryFormData {
  contact_info: {
    name: string
    email: string
    phone: string
    company: string
  }
  inquiry_details: {
    subject: string
    message: string
    inquiry_type: InquiryType
    priority: PriorityLevel
  }
}

// 통계 및 리포트 타입
export interface DashboardStats {
  total_contacts: number
  total_quotations: number
  total_samples: number
  total_inquiries: number
  pending_quotations: number
  pending_samples: number
  new_inquiries: number
  completed_quotations: number
}

export interface MonthlyStats {
  month: string
  quotations: number
  samples: number
  inquiries: number
}

export interface CategoryStats {
  category: ProductCategory
  count: number
  percentage: number
}

// 에러 타입
export interface DatabaseError {
  message: string
  code?: string
  details?: Json
  hint?: string
}