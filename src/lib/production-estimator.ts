/**
 * Production Completion Estimator
 *
 * 生産完了予測システム
 *
 * Calculates estimated completion dates based on:
 * - Current production stage
 * - Average duration for each remaining stage
 * - Working hours and holidays
 * - Priority adjustments
 */

import type { ProductionStage, ProductionOrder } from '@/types/production';
import { getProductionStages, getStageStepNumber } from '@/types/production';

// =====================================================
// Configuration
// =====================================================

/**
 * Average duration for each production stage (in hours)
 * 生産ステージの平均所要時間（時間）
 */
export const STAGE_DURATIONS: Record<ProductionStage, {
  avgHours: number;
  minHours: number;
  maxHours: number;
}> = {
  data_received: { avgHours: 0.5, minHours: 0.25, maxHours: 1 },
  inspection: { avgHours: 2, minHours: 1, maxHours: 4 },
  design: { avgHours: 8, minHours: 4, maxHours: 16 },
  plate_making: { avgHours: 4, minHours: 2, maxHours: 8 },
  printing: { avgHours: 16, minHours: 8, maxHours: 32 },
  surface_finishing: { avgHours: 6, minHours: 3, maxHours: 12 },
  die_cutting: { avgHours: 4, minHours: 2, maxHours: 8 },
  lamination: { avgHours: 3, minHours: 2, maxHours: 6 },
  final_inspection: { avgHours: 2, minHours: 1, maxHours: 4 },
};

/**
 * Priority multipliers for completion estimates
 * 優先度に基づく所要時間の調整係数
 */
export const PRIORITY_MULTIPLIERS: Record<string, number> = {
  urgent: 0.7,    // 30% faster
  high: 0.85,     // 15% faster
  normal: 1.0,    // Standard
  low: 1.2,       // 20% slower
};

/**
 * Working hours configuration
 * 営業時間設定
 */
export const WORKING_HOURS = {
  startHour: 8,   // 8:00 AM
  endHour: 17,    // 5:00 PM
  workingDays: [1, 2, 3, 4, 5] as const, // Mon-Fri (0=Sun, 6=Sat)
};

// =====================================================
// Main Estimation Functions
// =====================================================

/**
 * Calculate estimated completion date for a production order
 * 生産注文の予定完了日を計算
 *
 * @param productionOrder - Production order with current stage data
 * @returns Estimated completion date (ISO timestamp)
 */
export function calculateEstimatedCompletion(
  productionOrder: ProductionOrder
): string {
  const currentStage = productionOrder.current_stage;
  const stages = getProductionStages();
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex === stages.length - 1) {
    // Already at final stage, estimate based on remaining duration
    return estimateStageCompletion(currentStage, productionOrder);
  }

  // Calculate total remaining hours
  let totalHours = 0;
  const priority = productionOrder.priority || 'normal';
  const priorityMultiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;

  // Add remaining time for current stage if in progress
  const currentStageData = productionOrder.stage_data[currentStage];
  if (currentStageData.status === 'in_progress') {
    const stageDuration = STAGE_DURATIONS[currentStage];
    const elapsedHours = currentStageData.started_at
      ? calculateElapsedHours(currentStageData.started_at)
      : 0;
    const remainingHours = Math.max(0, stageDuration.avgHours - elapsedHours);
    totalHours += remainingHours * priorityMultiplier;
  }

  // Add duration for all remaining stages
  for (let i = currentIndex + 1; i < stages.length; i++) {
    const stage = stages[i];
    const stageDuration = STAGE_DURATIONS[stage];
    totalHours += stageDuration.avgHours * priorityMultiplier;
  }

  // Calculate completion date considering working hours
  return addWorkingHours(new Date(), totalHours).toISOString();
}

/**
 * Calculate estimated completion date for a specific stage
 * 特定ステージの予定完了日を計算
 *
 * @param stage - Production stage
 * @param productionOrder - Production order
 * @returns Estimated completion date (ISO timestamp)
 */
export function estimateStageCompletion(
  stage: ProductionStage,
  productionOrder: ProductionOrder
): string {
  const stageData = productionOrder.stage_data[stage];
  const stageDuration = STAGE_DURATIONS[stage];
  const priority = productionOrder.priority || 'normal';
  const priorityMultiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;

  if (stageData.status === 'completed') {
    return stageData.completed_at || new Date().toISOString();
  }

  if (stageData.status === 'in_progress' && stageData.started_at) {
    const elapsedHours = calculateElapsedHours(stageData.started_at);
    const remainingHours = Math.max(0, (stageDuration.avgHours * priorityMultiplier) - elapsedHours);
    return addWorkingHours(new Date(), remainingHours).toISOString();
  }

  // Stage not started yet - calculate from now
  return addWorkingHours(new Date(), stageDuration.avgHours * priorityMultiplier).toISOString();
}

/**
 * Calculate ETA for all stages
 * 全ステージの予定完了日を計算
 *
 * @param productionOrder - Production order
 * @returns Object with estimated dates for each stage
 */
export function calculateAllStageEstimates(
  productionOrder: ProductionOrder
): Record<ProductionStage, { estimatedDate: string | null; confidence: 'high' | 'medium' | 'low' }> {
  const stages = getProductionStages();
  const currentStage = productionOrder.current_stage;
  const currentIndex = stages.indexOf(currentStage);
  const estimates: Record<ProductionStage, { estimatedDate: string | null; confidence: 'high' | 'medium' | 'low' }> = {} as any;

  let cumulativeDate = new Date();
  const priority = productionOrder.priority || 'normal';
  const priorityMultiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageData = productionOrder.stage_data[stage];

    if (stageData.status === 'completed' && stageData.completed_at) {
      estimates[stage] = {
        estimatedDate: stageData.completed_at,
        confidence: 'high',
      };
      cumulativeDate = new Date(stageData.completed_at);
    } else if (stageData.status === 'in_progress' && stageData.started_at) {
      const stageDuration = STAGE_DURATIONS[stage];
      const elapsedHours = calculateElapsedHours(stageData.started_at);
      const remainingHours = Math.max(0, (stageDuration.avgHours * priorityMultiplier) - elapsedHours);
      cumulativeDate = addWorkingHours(cumulativeDate, remainingHours);
      estimates[stage] = {
        estimatedDate: cumulativeDate.toISOString(),
        confidence: i <= currentIndex ? 'high' : 'medium',
      };
    } else if (i > currentIndex) {
      // Future stage
      const stageDuration = STAGE_DURATIONS[stage];
      cumulativeDate = addWorkingHours(cumulativeDate, stageDuration.avgHours * priorityMultiplier);
      const confidence = i === currentIndex + 1 ? 'high' : i <= currentIndex + 3 ? 'medium' : 'low';
      estimates[stage] = {
        estimatedDate: cumulativeDate.toISOString(),
        confidence,
      };
    } else {
      estimates[stage] = {
        estimatedDate: null,
        confidence: 'low',
      };
    }
  }

  return estimates;
}

/**
 * Get production milestone summary
 * 生産マイルストーン要約
 *
 * @param productionOrder - Production order
 * @returns Summary of key milestones
 */
export function getMilestoneSummary(
  productionOrder: ProductionOrder
): {
  currentStage: string;
  currentProgress: number;
  overallProgress: number;
  estimatedCompletion: string;
  estimatedHoursRemaining: number;
  estimatedDaysRemaining: number;
  isOnTrack: boolean;
  isDelayed: boolean;
} {
  const currentStage = productionOrder.current_stage;
  const stages = getProductionStages();
  const currentIndex = stages.indexOf(currentStage);

  // Calculate progress
  const currentProgress = getStageStepNumber(currentStage) / stages.length * 100;
  const overallProgress = productionOrder.progress_percentage || currentProgress;

  // Calculate remaining hours
  let remainingHours = 0;
  const priority = productionOrder.priority || 'normal';
  const priorityMultiplier = PRIORITY_MULTIPLIERS[priority] || 1.0;

  // Current stage remaining time
  const currentStageData = productionOrder.stage_data[currentStage];
  if (currentStageData.status === 'in_progress' && currentStageData.started_at) {
    const stageDuration = STAGE_DURATIONS[currentStage];
    const elapsedHours = calculateElapsedHours(currentStageData.started_at);
    remainingHours += Math.max(0, (stageDuration.avgHours * priorityMultiplier) - elapsedHours);
  }

  // Remaining stages time
  for (let i = currentIndex + 1; i < stages.length; i++) {
    const stage = stages[i];
    const stageDuration = STAGE_DURATIONS[stage];
    remainingHours += stageDuration.avgHours * priorityMultiplier;
  }

  // Calculate estimated completion
  const estimatedCompletion = addWorkingHours(new Date(), remainingHours).toISOString();

  // Check if on track or delayed
  const isDelayed = productionOrder.stage_data[currentStage]?.status === 'delayed';
  const isOnTrack = !isDelayed && overallProgress > 0;

  // Convert hours to working days (8 hours per day)
  const estimatedDaysRemaining = Math.ceil(remainingHours / 8);

  return {
    currentStage,
    currentProgress: Math.round(currentProgress),
    overallProgress: Math.round(overallProgress),
    estimatedCompletion,
    estimatedHoursRemaining: Math.round(remainingHours),
    estimatedDaysRemaining,
    isOnTrack,
    isDelayed,
  };
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Add working hours to a date, skipping non-working hours
 * 営業時間を考慮して日時に時間を追加
 *
 * @param date - Starting date
 * @param hours - Hours to add
 * @returns New date with working hours added
 */
function addWorkingHours(date: Date, hours: number): Date {
  const result = new Date(date);
  let remainingHours = hours;

  while (remainingHours > 0) {
    const currentHour = result.getHours();
    const currentDay = result.getDay();

    // Skip weekends
    if (!WORKING_HOURS.workingDays.includes(currentDay as any)) {
      result.setDate(result.getDate() + 1);
      result.setHours(WORKING_HOURS.startHour, 0, 0, 0);
      continue;
    }

    // Skip non-working hours (before start or after end)
    if (currentHour < WORKING_HOURS.startHour) {
      result.setHours(WORKING_HOURS.startHour, 0, 0, 0);
      continue;
    }

    if (currentHour >= WORKING_HOURS.endHour) {
      result.setDate(result.getDate() + 1);
      result.setHours(WORKING_HOURS.startHour, 0, 0, 0);
      continue;
    }

    // Calculate hours until end of day
    const hoursUntilEndOfDay = WORKING_HOURS.endHour - currentHour;
    const hoursToAdd = Math.min(remainingHours, hoursUntilEndOfDay);

    result.setHours(result.getHours() + hoursToAdd);
    remainingHours -= hoursToAdd;
  }

  return result;
}

/**
 * Calculate elapsed hours from a start timestamp
 * 開始時刻からの経過時間を計算
 *
 * @param startedAt - ISO timestamp of start time
 * @returns Elapsed hours (considering only working hours)
 */
function calculateElapsedHours(startedAt: string): number {
  const start = new Date(startedAt);
  const now = new Date();
  let elapsed = 0;
  let current = new Date(start);

  while (current < now) {
    const currentHour = current.getHours();
    const currentDay = current.getDay();

    // Skip weekends
    if (!WORKING_HOURS.workingDays.includes(currentDay as any)) {
      current.setDate(current.getDate() + 1);
      current.setHours(WORKING_HOURS.startHour, 0, 0, 0);
      continue;
    }

    // Skip non-working hours
    if (currentHour < WORKING_HOURS.startHour) {
      current.setHours(WORKING_HOURS.startHour, 0, 0, 0);
      continue;
    }

    if (currentHour >= WORKING_HOURS.endHour) {
      current.setDate(current.getDate() + 1);
      current.setHours(WORKING_HOURS.startHour, 0, 0, 0);
      continue;
    }

    // Add one hour
    const nextHour = new Date(current);
    nextHour.setHours(currentHour + 1);
    if (nextHour > now) {
      elapsed += (Number(now) - Number(current)) / (1000 * 60 * 60);
      break;
    }
    elapsed += 1;
    current = nextHour;
  }

  return elapsed;
}

// =====================================================
// Batch Estimation Functions
// =====================================================

/**
 * Calculate completion estimates for multiple production orders
 * 複数の生産注文の完了予測を計算
 *
 * @param orders - Array of production orders
 * @returns Array of orders with estimated completion dates
 */
export function batchCalculateCompletionEstimates(
  orders: ProductionOrder[]
): Array<ProductionOrder & { estimatedCompletion: string }> {
  return orders.map(order => ({
    ...order,
    estimatedCompletion: calculateEstimatedCompletion(order),
  }));
}

// =====================================================
// Export
// =====================================================

export const productionEstimator = {
  // Main functions
  calculateEstimatedCompletion,
  estimateStageCompletion,
  calculateAllStageEstimates,
  getMilestoneSummary,

  // Batch operations
  batchCalculateCompletionEstimates,

  // Configuration
  STAGE_DURATIONS,
  PRIORITY_MULTIPLIERS,
  WORKING_HOURS,
};

export default productionEstimator;
