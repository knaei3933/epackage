/**
 * Shared types for AdminCustomerManagementClient and its parts.
 */

import type { UserStatus, UserRole } from '@/types/auth';

export interface Profile {
  id: string;
  email: string;
  kanji_last_name: string;
  kanji_first_name: string;
  kana_last_name: string;
  kana_first_name: string;
  corporate_phone: string | null;
  personal_phone: string | null;
  business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR';
  company_name: string | null;
  legal_entity_number: string | null;
  position: string | null;
  department: string | null;
  company_url: string | null;
  product_category: string;
  acquisition_channel: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  building: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
  latestQuotation?: {
    id: string;
    quotation_number: string;
    status: string;
    total_amount: number;
    created_at: string;
  };
  totalQuotations?: number;
  pendingQuotations?: number;
}

export interface CustomerFilters {
  status: UserStatus | 'ALL';
  search: string;
  registrationPeriod: 'all' | 'week' | 'month' | 'quarter' | 'year';
}

export interface CustomerListResponse {
  success: boolean;
  data?: Profile[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface ContactHistory {
  id: string;
  type: 'email' | 'call' | 'note';
  subject?: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface QuotationItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Record<string, unknown>;
  notes: string | null;
}

export interface CustomerQuotation {
  id: string;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  items?: QuotationItem[];
}

export interface CustomerDetailResponse {
  success: boolean;
  data?: {
    customer: Profile;
    statistics: {
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string | null;
      totalQuotations: number;
      pendingQuotations: number;
    };
    recentOrders: Record<string, unknown>[];
    quotations: CustomerQuotation[];
    contactHistory: ContactHistory[];
  };
  error?: string;
}
