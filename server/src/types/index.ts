export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'manager';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Product {
  id: number;
  name: string;
  name_ja: string;
  description: string;
  description_ja: string;
  category: string;
  price: number;
  stock_quantity: number;
  min_order_quantity: number;
  specifications: Record<string, any>;
  images: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Quotation {
  id: number;
  user_id: number;
  items: QuotationItem[];
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  valid_until: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SampleRequest {
  id: number;
  user_id: number;
  items: SampleItem[];
  shipping_address: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SampleItem {
  product_id: number;
  quantity: number;
}

export interface Address {
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
  building_name?: string;
}

export interface Inquiry {
  id: number;
  user_id?: number;
  type: 'general' | 'technical' | 'sales' | 'support';
  subject: string;
  message: string;
  contact_info: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed';
  assigned_to?: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: number;
  user_id: number;
  token_hash: string;
  refresh_token_hash?: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  created_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}