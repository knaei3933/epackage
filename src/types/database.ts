export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Product {
    id: string
    category: 'flat_3_side' | 'stand_up' | 'gusset' | 'box' | 'flat_with_zip' | 'special' | 'soft_pouch'
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
    created_at: string
    updated_at: string
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
    product_samples: Json[]
    purpose: string
    status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled'
    tracking_number: string | null
    created_at: string
    updated_at: string
}

export type Database = {
    public: {
        Tables: {
            // Enhanced contacts table
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

            // Enhanced inquiries table
            inquiries: {
                Row: {
                    id: string
                    contact_id: string | null
                    name: string
                    email: string
                    phone: string | null
                    company: string | null
                    subject: string
                    message: string
                    inquiry_type: string
                    status: string
                    priority: string
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    contact_id?: string | null
                    name: string
                    email: string
                    phone?: string | null
                    company?: string | null
                    subject: string
                    message: string
                    inquiry_type?: string
                    status?: string
                    priority?: string
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    contact_id?: string | null
                    name?: string
                    email?: string
                    phone?: string | null
                    company?: string | null
                    subject?: string
                    message?: string
                    inquiry_type?: string
                    status?: string
                    priority?: string
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }

            // Products table for B2B e-commerce
            products: {
                Row: Product
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
            }

            // Quotes table
            quotes: {
                Row: Quote
                Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Quote, 'id' | 'created_at' | 'updated_at'>>
            }

            // Sample requests table
            sample_requests: {
                Row: SampleRequest
                Insert: Omit<SampleRequest, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<SampleRequest, 'id' | 'created_at' | 'updated_at'>>
            }

            // Enhanced quotation requests
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
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
