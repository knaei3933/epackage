/**
 * Production Feature Types
 *
 * 生産管理機能に関連する型定義
 * @module types/features/production
 */

import type { Json, TimestampFields } from '../database';

// =====================================================
// Work Order Types
// =====================================================

/**
 * 作業標準書ステータス
 */
export type WorkOrderStatus =
  | 'DRAFT'
  | 'GENERATED'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'COMPLETED';

/**
 * 作業標準書
 */
export interface WorkOrder {
  id: string;
  work_order_number: string;
  order_id: string;
  quotation_id: string | null;
  title: string;
  version: string;
  status: WorkOrderStatus;
  specifications: Json;
  production_flow: Json;
  quality_standards: Json;
  packaging_specs: Json;
  estimated_completion: string | null;
  pdf_url: string | null;
  generated_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Production Job Types
// =====================================================

/**
 * 生産ジョブ
 */
export interface ProductionJob {
  id: string;
  order_id: string;
  work_order_id: string | null;
  production_log_id: string | null;
  job_number: string;
  job_name: string;
  job_type:
    | 'design_setup'
    | 'material_prep'
    | 'printing'
    | 'lamination'
    | 'slitting'
    | 'pouch_making'
    | 'quality_check'
    | 'packaging'
    | 'other';
  description: string | null;
  specifications: Json;
  status:
    | 'pending'
    | 'scheduled'
    | 'in_progress'
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';
  priority: number;
  assigned_to: string | null;
  assigned_at: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  estimated_duration_minutes: number | null;
  actual_start_at: string | null;
  actual_end_at: string | null;
  actual_duration_minutes: number | null;
  progress_percentage: number;
  current_step: string | null;
  steps_total: number;
  steps_completed: number;
  output_quantity: number;
  output_uom: string;
  rejected_quantity: number;
  rejection_reason: string | null;
  depends_on: Json;
  failure_reason: string | null;
  retry_count: number;
  max_retries: number;
  parent_job_id: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Production Log Types
// =====================================================

/**
 * 生産ログ
 */
export interface ProductionLog {
  id: string;
  order_id: string;
  work_order_id: string | null;
  sub_status:
    | 'design_received'
    | 'work_order_created'
    | 'material_prepared'
    | 'printing'
    | 'lamination'
    | 'slitting'
    | 'pouch_making'
    | 'qc_passed'
    | 'packaged';
  progress_percentage: number;
  assigned_to: string | null;
  photo_url: string | null;
  notes: string | null;
  measurements: Json | null;
  logged_at: string;
  created_at: string;
}

// =====================================================
// Production Data Types
// =====================================================

/**
 * 生産データ
 */
export interface ProductionData {
  id: string;
  order_id: string;
  data_type:
    | 'design_file'
    | 'specification'
    | 'approval'
    | 'material_data'
    | 'layout_data'
    | 'color_data'
    | 'other';
  title: string;
  description: string | null;
  version: string;
  file_id: string | null;
  file_url: string | null;
  validation_status: 'pending' | 'valid' | 'invalid' | 'needs_revision';
  validated_by: string | null;
  validated_at: string | null;
  validation_notes: string | null;
  validation_errors: Json | null;
  approved_for_production: boolean;
  approved_by: string | null;
  approved_at: string | null;
  submitted_by_customer: boolean;
  customer_contact_info: Json | null;
  received_at: string;
  extracted_data: Json | null;
  confidence_score: number | null;
  extraction_metadata: Json | null;
  created_at: string;
  updated_at: string;
}
