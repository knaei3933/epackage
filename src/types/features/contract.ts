/**
 * Contract Feature Types
 *
 * 契約管理機能に関連する型定義
 * @module types/features/contract
 */

import type { Json, ContractStatus } from '../database';

// =====================================================
// Contract Types
// =====================================================

/**
 * 契約書
 */
export interface Contract {
  id: string;
  contract_number: string;
  order_id: string;
  work_order_id: string | null;
  company_id: string;
  customer_name: string;
  customer_representative: string;
  total_amount: number;
  currency: string;
  status: ContractStatus;
  customer_signed_at: string | null;
  admin_signed_at: string | null;
  signature_data: Json | null;
  customer_ip_address: string | null;
  admin_ip_address: string | null;
  pdf_url: string | null;
  terms: Json | null;
  notes: string | null;
  // Japan e-Signature Law Compliance Fields
  customer_signature_type: 'handwritten' | 'hanko' | 'mixed' | null;
  admin_signature_type: 'handwritten' | 'hanko' | 'mixed' | null;
  customer_hanko_image_path: string | null;
  admin_hanko_image_path: string | null;
  customer_timestamp_token: string | null;
  admin_timestamp_token: string | null;
  customer_timestamp_verified: boolean | null;
  admin_timestamp_verified: boolean | null;
  customer_certificate_url: string | null;
  admin_certificate_url: string | null;
  signature_expires_at: string | null;
  legal_validity_confirmed: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * 契約条件
 */
export interface ContractTerms {
  payment_terms: string;
  delivery_terms: string;
  warranty_terms: string;
  cancellation_policy: string;
  special_conditions?: string[];
}

// =====================================================
// Signature Types
// =====================================================

/**
 * 署名データ
 */
export interface SignatureData {
  signature_type: 'handwritten' | 'hanko' | 'mixed';
  signature_image_url?: string;
  hanko_image_url?: string;
  timestamp_token?: string;
  timestamp_verified?: boolean;
  certificate_url?: string;
  ip_address?: string;
  user_agent?: string;
  signed_at: string;
}

// =====================================================
// Hanko (Seal) Types
// =====================================================

/**
 * はんこ画像
 */
export interface HankoImage {
  id: string;
  user_id: string;
  hanko_name: string;
  image_url: string;
  original_filename: string | null;
  file_size: number | null;
  mime_type: string | null;
  is_default: boolean;
  validation_data: Json | null;
  created_at: string;
  updated_at: string;
}

/**
 * はんこ登録入力
 */
export interface HankoCreateInput {
  hanko_name: string;
  image_data: string; // Base64 encoded image
  is_default?: boolean;
}
