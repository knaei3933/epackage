/**
 * Production Tracking Types
 *
 * 製造追跡型システム
 *
 * 9-stage production workflow tracking system for Epackage Lab
 * Defines production stages, status types, and related interfaces
 */

// =====================================================
// Production Stage Enum (9 Stages)
// =====================================================

/**
 * Production workflow stages
 * 製造ワークフローステージ
 *
 * Complete production workflow from data receipt to final inspection/shipping
 */
export type ProductionStage =
  | 'data_received'      // 1. データ受領 - Data received
  | 'inspection'         // 2. 検品 - Inspection
  | 'design'             // 3. 設計 - Design
  | 'plate_making'       // 4. 製版 - Plate making
  | 'printing'           // 5. 印刷 - Printing
  | 'surface_finishing'  // 6. 表面加工 - Surface finishing
  | 'die_cutting'        // 7. 打ち抜き - Die cutting
  | 'lamination'         // 8. 貼り合わせ - Lamination
  | 'final_inspection';  // 9. 検品・出荷 - Final inspection & shipping

// =====================================================
// Stage Status Types
// =====================================================

/**
 * Individual stage status
 * ステージステータス
 */
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

// =====================================================
// Production Stage Data Interface
// =====================================================

/**
 * Individual stage data structure
 * 個別ステージデータ構造
 *
 * Stores all information for a single production stage
 */
export interface ProductionStageData {
  status: StageStatus;
  completed_at: string | null;        // ISO timestamp
  completed_by: string | null;        // user_id
  notes: string | null;
  photos: string[];                   // Array of photo URLs
  assigned_to: string | null;         // user_id of assigned staff
  estimated_date: string | null;      // ISO date string
  actual_date: string | null;         // ISO date string
  started_at: string | null;          // ISO timestamp
  metadata: Record<string, unknown>;  // Additional stage-specific data
}

// =====================================================
// Production Order Interface
// =====================================================

/**
 * Production order tracking record
 * 生産注文追跡記録
 *
 * Main production tracking entity linked to an order
 */
export interface ProductionOrder {
  id: string;
  order_id: string;                    // FK to orders table
  current_stage: ProductionStage;
  stage_data: Record<ProductionStage, ProductionStageData>;
  started_at: string;                  // ISO timestamp
  estimated_completion_date: string | null;  // ISO date
  actual_completion_date: string | null;     // ISO timestamp
  created_at: string;
  updated_at: string;
  progress_percentage: number;         // 0-100
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// =====================================================
// Stage Action Types
// =====================================================

/**
 * Stage action history
 * ステージアクション履歴
 */
export interface StageAction {
  id: string;
  production_order_id: string;
  stage: ProductionStage;
  action: 'started' | 'completed' | 'paused' | 'resumed' | 'rolled_back' | 'note_added' | 'photo_uploaded' | 'assigned';
  performed_by: string;                // user_id
  performed_at: string;                // ISO timestamp
  notes: string | null;
  metadata: Record<string, any>;
}

// =====================================================
// Stage Labels & Localization
// =====================================================

/**
 * Production stage display labels with multilingual support
 * 製造ステージ表示ラベル（多言語対応）
 */
export const PRODUCTION_STAGE_LABELS: Record<ProductionStage, {
  ja: string;       // Japanese
  ko: string;       // Korean
  en: string;       // English
  icon: string;     // Emoji icon
  stepNumber: number;
}> = {
  data_received: {
    ja: 'データ受領',
    ko: 'データ受領',
    en: 'Data Received',
    icon: '📥',
    stepNumber: 1,
  },
  inspection: {
    ja: '検品',
    ko: '検品',
    en: 'Inspection',
    icon: '🔍',
    stepNumber: 2,
  },
  design: {
    ja: '設計',
    ko: '設計',
    en: 'Design',
    icon: '🎨',
    stepNumber: 3,
  },
  plate_making: {
    ja: '製版',
    ko: '製版',
    en: 'Plate Making',
    icon: '🖨️',
    stepNumber: 4,
  },
  printing: {
    ja: '印刷',
    ko: '印刷',
    en: 'Printing',
    icon: '📄',
    stepNumber: 5,
  },
  surface_finishing: {
    ja: '表面加工',
    ko: '表面加工',
    en: 'Surface Finishing',
    icon: '✨',
    stepNumber: 6,
  },
  die_cutting: {
    ja: '打ち抜き',
    ko: '打ち抜き',
    en: 'Die Cutting',
    icon: '✂️',
    stepNumber: 7,
  },
  lamination: {
    ja: '貼り合わせ',
    ko: '貼り合わせ',
    en: 'Lamination',
    icon: '📚',
    stepNumber: 8,
  },
  final_inspection: {
    ja: '検品・出荷',
    ko: '検品・出荷',
    en: 'Final Inspection & Shipping',
    icon: '📦',
    stepNumber: 9,
  },
} as const;

/**
 * Stage status labels
 * ステージステータスラベル
 */
export const STAGE_STATUS_LABELS: Record<StageStatus, {
  ja: string;
  ko: string;
  en: string;
  color: string;      // Tailwind color class
  bgColor: string;    // Background color class
}> = {
  pending: {
    ja: '待機中',
    ko: '待機中',
    en: 'Pending',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  in_progress: {
    ja: '進行中',
    ko: '進行中',
    en: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  completed: {
    ja: '完了',
    ko: '完了',
    en: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  delayed: {
    ja: '遅延',
    ko: '遅延',
    en: 'Delayed',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
} as const;

// =====================================================
// Production Workflow Configuration
// =====================================================

/**
 * Get ordered array of production stages
 * @returns Array of ProductionStage in workflow order
 */
export function getProductionStages(): ProductionStage[] {
  return [
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
}

/**
 * Get stage label
 * @param stage Production stage
 * @param locale Language locale
 * @returns Localized stage label
 */
export function getStageLabel(
  stage: ProductionStage,
  locale: 'ja' | 'ko' | 'en' = 'ja'
): string {
  return PRODUCTION_STAGE_LABELS[stage][locale];
}

/**
 * Get stage icon
 * @param stage Production stage
 * @returns Emoji icon
 */
export function getStageIcon(stage: ProductionStage): string {
  return PRODUCTION_STAGE_LABELS[stage].icon;
}

/**
 * Get stage step number
 * @param stage Production stage
 * @returns Step number (1-9)
 */
export function getStageStepNumber(stage: ProductionStage): number {
  return PRODUCTION_STAGE_LABELS[stage].stepNumber;
}

/**
 * Get next stage in workflow
 * @param currentStage Current production stage
 * @returns Next stage or null if at final stage
 */
export function getNextStage(
  currentStage: ProductionStage
): ProductionStage | null {
  const stages = getProductionStages();
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null;
  }
  return stages[currentIndex + 1];
}

/**
 * Get previous stage in workflow
 * @param currentStage Current production stage
 * @returns Previous stage or null if at first stage
 */
export function getPreviousStage(
  currentStage: ProductionStage
): ProductionStage | null {
  const stages = getProductionStages();
  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return stages[currentIndex - 1];
}

/**
 * Calculate progress percentage based on current stage
 * @param currentStage Current production stage
 * @returns Progress percentage (0-100)
 */
export function calculateStageProgress(currentStage: ProductionStage): number {
  const stepNumber = getStageStepNumber(currentStage);
  return Math.round((stepNumber / 9) * 100);
}

/**
 * Calculate overall production order progress
 * @param stageData All stage data
 * @returns Progress percentage (0-100)
 */
export function calculateProductionProgress(
  stageData: Record<ProductionStage, ProductionStageData>
): number {
  const stages = getProductionStages();
  let completedStages = 0;
  let inProgressWeight = 0;

  for (const stage of stages) {
    const data = stageData[stage];
    if (data.status === 'completed') {
      completedStages += 1;
    } else if (data.status === 'in_progress') {
      // Count in-progress as 50% complete
      inProgressWeight += 0.5;
    }
  }

  return Math.round(((completedStages + inProgressWeight) / stages.length) * 100);
}

/**
 * Initialize stage data for a new production order
 * @param orderId Order ID
 * @returns Initial stage data object
 */
export function initializeStageData(
  orderId: string
): Record<ProductionStage, ProductionStageData> {
  const stages = getProductionStages();
  const stageData: Partial<Record<ProductionStage, ProductionStageData>> = {};

  for (const stage of stages) {
    stageData[stage] = {
      status: 'pending',
      completed_at: null,
      completed_by: null,
      notes: null,
      photos: [],
      assigned_to: null,
      estimated_date: null,
      actual_date: null,
      started_at: null,
      metadata: {},
    };
  }

  return stageData as Record<ProductionStage, ProductionStageData>;
}

// =====================================================
// Type Guards
// =====================================================

/**
 * Type guard: Check if value is valid ProductionStage
 */
export function isProductionStage(value: string): value is ProductionStage {
  return getProductionStages().includes(value as ProductionStage);
}

/**
 * Type guard: Check if value is valid StageStatus
 */
export function isStageStatus(value: string): value is StageStatus {
  return ['pending', 'in_progress', 'completed', 'delayed'].includes(value);
}

// =====================================================
// Default Export
// =====================================================

/**
 * Production tracking system exports
 */
const ProductionTrackingSystem = {
  // Constants
  PRODUCTION_STAGE_LABELS,
  STAGE_STATUS_LABELS,

  // Type Guards
  isProductionStage,
  isStageStatus,

  // Utilities
  getProductionStages,
  getStageLabel,
  getStageIcon,
  getStageStepNumber,
  getNextStage,
  getPreviousStage,
  calculateStageProgress,
  calculateProductionProgress,
  initializeStageData,
} as const;

export default ProductionTrackingSystem;
