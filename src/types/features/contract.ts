/**
 * Contract Feature Types
 *
 * 契約管理機能に関連する型定義
 * @module types/features/contract
 */

import type { Database, Json } from '../database';
import type { ContractStatus } from '../core/database';

// 実DB contracts テーブルの Row 型（commit-1 で実DB 28カラムへ再生成済み）。
type ContractsRow = Database['public']['Tables']['contracts']['Row'];

// =====================================================
// Contract Types
// =====================================================

/**
 * 契約書
 *
 * 実DB contracts テーブル（28カラム）へ完全整合。
 * status のみ業務 union（ContractStatus）へ上書きし、それ以外は
 * database.ts の Row 型をそのまま継承する（drift カラムの再発防止）。
 */
export interface Contract extends Omit<ContractsRow, 'status'> {
  status: ContractStatus;
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
