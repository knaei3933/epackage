/**
 * Production Actions Library
 *
 * 製造アクションライブラリ
 *
 * Server-side functions for managing production workflow stages
 * Handles stage transitions, notes, photos, and staff assignments
 */

import { createSupabaseClient } from '@/lib/supabase';
import type {
  ProductionOrder,
  ProductionStage,
  ProductionStageData,
  StageAction,
} from '@/types/production';

// @ts-nocheck - Supabase type inference issues with complex update payloads

// =====================================================
// Types
// =====================================================

/**
 * Database row type for production_orders table
 * Includes snake_case fields that match the database schema
 */
interface ProductionOrderDbRow {
  id: string;
  order_id: string;
  current_stage: ProductionStage;
  stage_data: Record<ProductionStage, ProductionStageData>;
  started_at: string;
  estimated_completion_date: string | null;
  actual_completion_date: string | null;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Type for stage_data update payload
 */
type StageDataUpdatePayload = {
  stage_data: Record<ProductionStage, ProductionStageData>;
  updated_at: string;
};

// =====================================================
// Stage Transition Functions
// =====================================================

/**
 * Advance to next production stage
 * 次の製造ステージに進む
 *
 * @param orderId - Order ID
 * @param userId - User ID making the change
 * @returns Updated production order
 */
export async function advanceToNextStage(
  orderId: string,
  userId: string
): Promise<ProductionOrder> {
  const supabase = createSupabaseClient();

  // Get current production order - type assertion for database row
  const { data: currentOrderRaw, error: fetchError } = await supabase
    .from('production_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch production order: ${fetchError.message}`);
  }

  if (!currentOrderRaw) {
    throw new Error('Production order not found');
  }

  // Type assertion for database row
  const currentOrder = currentOrderRaw as unknown as ProductionOrderDbRow;

  // Determine next stage
  const stages: ProductionStage[] = [
    'data_received',
    'inspection',
    'design',
    'plate_making',
    'printing',
    'surface_finishing',
    'die_cutting',
    'lamination',
    'final_inspection',
  ];

  const currentIndex = stages.indexOf(currentOrder.current_stage);
  if (currentIndex === -1) {
    throw new Error('Invalid current stage');
  }

  if (currentIndex === stages.length - 1) {
    throw new Error('Already at final stage');
  }

  const nextStage = stages[currentIndex + 1];
  const now = new Date().toISOString();

  // Update current stage as completed
  const updatedStageData = currentOrder.stage_data;
  const currentStage = currentOrder.current_stage;

  updatedStageData[currentStage] = {
    ...updatedStageData[currentStage],
    status: 'completed',
    completed_at: now,
    completed_by: userId,
    actual_date: now.split('T')[0],
  };

  // Start next stage
  updatedStageData[nextStage] = {
    ...updatedStageData[nextStage],
    status: 'in_progress',
    started_at: now,
  };

  // Type for update payload
  type UpdatePayload = {
    current_stage: ProductionStage;
    stage_data: Record<ProductionStage, ProductionStageData>;
    updated_at: string;
    actual_completion_date?: string;
  };

  const updatePayload: UpdatePayload = {
    current_stage: nextStage,
    stage_data: updatedStageData,
    updated_at: now,
    ...(nextStage === 'final_inspection' ? { actual_completion_date: now } : {}),
  };

  // Update production order
  const { data, error } = (await supabase
    .from('production_orders')
    .update(updatePayload)
    .eq('order_id', orderId)
    .select()
    .single()) as any;

  if (error) {
    throw new Error(`Failed to advance stage: ${error.message}`);
  }

  // Log action - type assertion for data.id
  const updatedOrder = data as unknown as ProductionOrderDbRow;
  await logStageAction(updatedOrder.id, nextStage, 'started', userId, `Advanced from ${currentStage}`);

  return data as ProductionOrder;
}

/**
 * Rollback to previous stage
 * 前の製造ステージに戻す
 *
 * @param orderId - Order ID
 * @param userId - User ID making the change
 * @param reason - Reason for rollback
 * @returns Updated production order
 */
export async function rollbackToPreviousStage(
  orderId: string,
  userId: string,
  reason?: string
): Promise<ProductionOrder> {
  const supabase = createSupabaseClient();

  // Get current production order
  const { data: currentOrderRaw, error: fetchError } = await supabase
    .from('production_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch production order: ${fetchError.message}`);
  }

  if (!currentOrderRaw) {
    throw new Error('Production order not found');
  }

  // Type assertion for database row
  const currentOrder = currentOrderRaw as unknown as ProductionOrderDbRow;

  // Determine previous stage
  const stages: ProductionStage[] = [
    'data_received',
    'inspection',
    'design',
    'plate_making',
    'printing',
    'surface_finishing',
    'die_cutting',
    'lamination',
    'final_inspection',
  ];

  const currentIndex = stages.indexOf(currentOrder.current_stage);
  if (currentIndex <= 0) {
    throw new Error('Already at first stage, cannot rollback');
  }

  const previousStage = stages[currentIndex - 1];
  const now = new Date().toISOString();

  // Update stage data
  const updatedStageData = currentOrder.stage_data;
  const currentStage = currentOrder.current_stage;

  // Mark current stage as pending (reset)
  updatedStageData[currentStage] = {
    ...updatedStageData[currentStage],
    status: 'pending',
    started_at: null,
  };

  // Mark previous stage as in_progress
  updatedStageData[previousStage] = {
    ...updatedStageData[previousStage],
    status: 'in_progress',
    completed_at: null,
    completed_by: null,
  };

  // Type for update payload
  type RollbackUpdatePayload = {
    current_stage: ProductionStage;
    stage_data: Record<ProductionStage, ProductionStageData>;
    updated_at: string;
    actual_completion_date: null;
  };

  const updatePayload: RollbackUpdatePayload = {
    current_stage: previousStage,
    stage_data: updatedStageData,
    updated_at: now,
    actual_completion_date: null,
  };

  // Update production order
  const { data, error } = await supabase
    .from('production_orders')
    .update(updatePayload as unknown as RollbackUpdatePayload)
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to rollback stage: ${error.message}`);
  }

  // Log action
  const updatedOrder = data as unknown as ProductionOrderDbRow;
  await logStageAction(
    updatedOrder.id,
    previousStage,
    'rolled_back',
    userId,
    reason || `Rolled back from ${currentStage}`
  );

  return data as ProductionOrder;
}

// =====================================================
// Stage Notes Functions
// =====================================================

/**
 * Update stage notes
 * ステージノートを更新
 *
 * @param orderId - Order ID
 * @param stage - Production stage
 * @param notes - Notes text
 * @param userId - User ID making the change
 */
export async function updateStageNotes(
  orderId: string,
  stage: ProductionStage,
  notes: string,
  userId: string
): Promise<void> {
  const supabase = createSupabaseClient();

  // Get current production order
  const { data: currentOrderRaw, error: fetchError } = await supabase
    .from('production_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch production order: ${fetchError.message}`);
  }

  if (!currentOrderRaw) {
    throw new Error('Production order not found');
  }

  // Type assertion for database row
  const currentOrder = currentOrderRaw as unknown as ProductionOrderDbRow;

  // Update stage notes
  const updatedStageData = currentOrder.stage_data;
  updatedStageData[stage] = {
    ...updatedStageData[stage],
    notes,
  };

  // Type for update payload
  type NotesUpdatePayload = {
    stage_data: Record<ProductionStage, ProductionStageData>;
    updated_at: string;
  };

  const updatePayload: NotesUpdatePayload = {
    stage_data: updatedStageData,
    updated_at: new Date().toISOString(),
  };

  // Update production order
  const { error } = await supabase
    .from('production_orders')
    .update(updatePayload as unknown as NotesUpdatePayload)
    .eq('order_id', orderId);

  if (error) {
    throw new Error(`Failed to update stage notes: ${error.message}`);
  }

  // Log action
  await logStageAction(currentOrder.id, stage, 'note_added', userId);
}

// =====================================================
// Photo Upload Functions
// =====================================================

/**
 * Upload stage photo
 * ステージ写真をアップロード
 *
 * @param orderId - Order ID
 * @param stage - Production stage
 * @param file - Photo file
 * @param userId - User ID uploading
 * @returns Public URL of uploaded photo
 */
export async function uploadStagePhoto(
  orderId: string,
  stage: ProductionStage,
  file: File,
  userId: string
): Promise<string> {
  const supabase = createSupabaseClient();

  // Get production order to verify existence
  const { data: productionOrderRaw, error: fetchError } = await supabase
    .from('production_orders')
    .select('id')
    .eq('order_id', orderId)
    .single();

  if (fetchError || !productionOrderRaw) {
    throw new Error('Production order not found');
  }

  // Type assertion for production order ID
  const productionOrder = productionOrderRaw as unknown as Pick<ProductionOrderDbRow, 'id'>;

  // Generate file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${orderId}/${stage}/${Date.now()}.${fileExt}`;
  const filePath = `${productionOrder.id}/${fileName}`;

  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('production-photos')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('production-photos')
    .getPublicUrl(filePath);

  const photoUrl = urlData.publicUrl;

  // Update stage data with new photo
  const { data: currentOrderRaw, error: orderError } = await supabase
    .from('production_orders')
    .select('stage_data')
    .eq('order_id', orderId)
    .single();

  if (orderError) {
    throw new Error(`Failed to fetch order: ${orderError.message}`);
  }

  // Type assertion for stage_data
  const currentOrder = currentOrderRaw as unknown as Pick<ProductionOrderDbRow, 'stage_data'>;
  const updatedStageData = currentOrder.stage_data;
  const currentPhotos = updatedStageData[stage]?.photos || [];
  updatedStageData[stage] = {
    ...updatedStageData[stage],
    photos: [...currentPhotos, photoUrl],
  };

  // Update production order
  const { error: updateError } = await supabase
    .from('production_orders')
    .update({ stage_data: updatedStageData, updated_at: new Date().toISOString() } as unknown as StageDataUpdatePayload)
    .eq('order_id', orderId);

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  // Log action
  await logStageAction(productionOrder.id, stage, 'photo_uploaded', userId);

  return photoUrl;
}

/**
 * Delete stage photo
 * ステージ写真を削除
 *
 * @param orderId - Order ID
 * @param stage - Production stage
 * @param photoUrl - Photo URL to delete
 * @param userId - User ID deleting
 */
export async function deleteStagePhoto(
  orderId: string,
  stage: ProductionStage,
  photoUrl: string,
  userId: string
): Promise<void> {
  const supabase = createSupabaseClient();

  // Extract file path from URL
  const url = new URL(photoUrl);
  const pathParts = url.pathname.split('/production-photos/');
  const filePath = pathParts[1];

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from('production-photos')
    .remove([filePath]);

  if (deleteError) {
    throw new Error(`Failed to delete photo: ${deleteError.message}`);
  }

  // Update stage data
  const { data: currentOrderRaw } = await supabase
    .from('production_orders')
    .select('stage_data')
    .eq('order_id', orderId)
    .single();

  if (!currentOrderRaw) {
    throw new Error('Production order not found');
  }

  // Type assertion for stage_data
  const currentOrder = currentOrderRaw as unknown as Pick<ProductionOrderDbRow, 'stage_data'>;
  const updatedStageData = currentOrder.stage_data;
  updatedStageData[stage] = {
    ...updatedStageData[stage],
    photos: updatedStageData[stage].photos.filter((url: string) => url !== photoUrl),
  };

  // Update production order
  await supabase
    .from('production_orders')
    .update({ stage_data: updatedStageData, updated_at: new Date().toISOString() } as unknown as StageDataUpdatePayload)
    .eq('order_id', orderId);
}

// =====================================================
// Staff Assignment Functions
// =====================================================

/**
 * Assign staff to stage
 * ステージにスタッフを割り当て
 *
 * @param orderId - Order ID
 * @param stage - Production stage
 * @param staffId - Staff user ID
 * @param userId - User ID making the assignment
 */
export async function assignStageToStaff(
  orderId: string,
  stage: ProductionStage,
  staffId: string,
  userId: string
): Promise<void> {
  const supabase = createSupabaseClient();

  // Get current production order
  const { data: currentOrderRaw, error: fetchError } = await supabase
    .from('production_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch production order: ${fetchError.message}`);
  }

  if (!currentOrderRaw) {
    throw new Error('Production order not found');
  }

  // Type assertion for database row
  const currentOrder = currentOrderRaw as unknown as ProductionOrderDbRow;

  // Update stage assignment
  const updatedStageData = currentOrder.stage_data;
  updatedStageData[stage] = {
    ...updatedStageData[stage],
    assigned_to: staffId,
  };

  // Update production order
  const { error } = await supabase
    .from('production_orders')
    .update({ stage_data: updatedStageData, updated_at: new Date().toISOString() } as unknown as StageDataUpdatePayload)
    .eq('order_id', orderId);

  if (error) {
    throw new Error(`Failed to assign staff: ${error.message}`);
  }

  // Log action
  await logStageAction(currentOrder.id, stage, 'assigned', userId, `Assigned to staff: ${staffId}`);
}

// =====================================================
// Stage Action Logging
// =====================================================

/**
 * Log stage action to history
 * ステージアクションを記録
 *
 * @param productionOrderId - Production order ID
 * @param stage - Production stage
 * @param action - Action type
 * @param performedBy - User ID who performed action
 * @param notes - Optional notes
 */
async function logStageAction(
  productionOrderId: string,
  stage: ProductionStage,
  action: StageAction['action'],
  performedBy: string,
  notes?: string
): Promise<void> {
  const supabase = createSupabaseClient();

  // Type for stage_action_history insert payload
  type StageActionInsertPayload = {
    production_order_id: string;
    stage: ProductionStage;
    action: StageAction['action'];
    performed_by: string;
    notes: string | null;
    metadata: Record<string, unknown>;
  };

  const insertPayload: StageActionInsertPayload = {
    production_order_id: productionOrderId,
    stage,
    action,
    performed_by: performedBy,
    notes: notes || null,
    metadata: {},
  };

  const { error } = await supabase
    .from('stage_action_history')
    .insert(insertPayload as unknown as StageActionInsertPayload);

  if (error) {
    console.error('Failed to log stage action:', error);
  }
}

// =====================================================
// Get Production Order Functions
// =====================================================

/**
 * Get production order by order ID
 * 注文IDで製造注文を取得
 *
 * @param orderId - Order ID
 * @returns Production order or null
 */
export async function getProductionOrderByOrderId(
  orderId: string
): Promise<ProductionOrder | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('production_orders')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error) {
    return null;
  }

  return data as ProductionOrder;
}

/**
 * Get all production orders
 * すべての製造注文を取得
 *
 * @param filters - Optional filters
 * @returns Array of production orders
 */
export async function getProductionOrders(filters?: {
  currentStage?: ProductionStage;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  limit?: number;
}): Promise<ProductionOrder[]> {
  const supabase = createSupabaseClient();

  let query = supabase
    .from('production_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.currentStage) {
    query = query.eq('current_stage', filters.currentStage);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch production orders: ${error.message}`);
  }

  return data as ProductionOrder[];
}

/**
 * Get stage action history
 * ステージアクション履歴を取得
 *
 * @param productionOrderId - Production order ID
 * @returns Array of stage actions
 */
export async function getStageActionHistory(
  productionOrderId: string
): Promise<StageAction[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('stage_action_history')
    .select('*')
    .eq('production_order_id', productionOrderId)
    .order('performed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch action history: ${error.message}`);
  }

  return data as StageAction[];
}

// =====================================================
// Create Production Order
// =====================================================

/**
 * Create new production order for an order
 * 新しい製造注文を作成
 *
 * @param orderId - Order ID
 * @param priority - Priority level
 * @param estimatedCompletionDate - Estimated completion date
 * @returns Created production order
 */
export async function createProductionOrder(
  orderId: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  estimatedCompletionDate?: string
): Promise<ProductionOrder> {
  const supabase = createSupabaseClient();

  // Check if production order already exists
  const existing = await getProductionOrderByOrderId(orderId);
  if (existing) {
    return existing;
  }

  // Type for insert payload
  type CreateProductionOrderPayload = {
    order_id: string;
    current_stage: ProductionStage;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    estimated_completion_date: string | null;
  };

  const insertPayload: CreateProductionOrderPayload = {
    order_id: orderId,
    current_stage: 'data_received',
    priority,
    estimated_completion_date: estimatedCompletionDate || null,
  };

  // Create production order
  const { data, error } = await supabase
    .from('production_orders')
    .insert(insertPayload as unknown as CreateProductionOrderPayload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create production order: ${error.message}`);
  }

  return data as ProductionOrder;
}

// =====================================================
// Export All Functions
// =====================================================

// =====================================================
// Production Start Validation
// =====================================================

/**
 * Check if production can be started for an order
 * 製造開始可能かチェック
 *
 * Requirements for production start:
 * 1. Payment confirmed (payment_confirmed_at is not null)
 * 2. Data approved (spec_approved_at is not null)
 * 3. Contract signed (contract_signed_at is not null)
 *
 * @param order - Order object with required fields
 * @returns Object with canStart boolean and missing requirements array
 */
export function canStartProduction(order: {
  payment_confirmed_at?: string | null;
  spec_approved_at?: string | null;
  contract_signed_at?: string | null;
}): {
  canStart: boolean;
  missingRequirements: string[];
} {
  const missingRequirements: string[] = [];

  // Check payment confirmation
  if (!order.payment_confirmed_at) {
    missingRequirements.push('入金確認');
  }

  // Check data approval
  if (!order.spec_approved_at) {
    missingRequirements.push('データ承認');
  }

  // Check contract signature
  if (!order.contract_signed_at) {
    missingRequirements.push('契約署名');
  }

  return {
    canStart: missingRequirements.length === 0,
    missingRequirements,
  };
}

/**
 * Get formatted error message for missing production requirements
 * 製造開始できない場合のエラーメッセージを取得
 *
 * @param missingRequirements - Array of missing requirement names
 * @returns Formatted error message
 */
export function getProductionStartErrorMessage(missingRequirements: string[]): string {
  if (missingRequirements.length === 0) {
    return '';
  }

  const reqNames = missingRequirements.join('、');
  return `製造開始には以下の条件が必要です：${reqNames}`;
}

// =====================================================
// Export All Functions
// =====================================================

export const productionActions = {
  // Stage transitions
  advanceToNextStage,
  rollbackToPreviousStage,

  // Notes
  updateStageNotes,

  // Photos
  uploadStagePhoto,
  deleteStagePhoto,

  // Staff assignment
  assignStageToStaff,

  // Get functions
  getProductionOrderByOrderId,
  getProductionOrders,
  getStageActionHistory,

  // Create
  createProductionOrder,

  // Validation
  canStartProduction,
  getProductionStartErrorMessage,
};

export default productionActions;
