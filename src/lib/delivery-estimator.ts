/**
 * Simple Delivery Date Estimator
 *
 * 簡易納期見積もりシステム
 *
 * Based on customer approval date:
 * - Production: 4 weeks (20 business days, excluding Japanese holidays)
 * - Shipping number available: Week 3
 * - Delivery: 4-5 days after shipping (admin adjustable)
 */

import { createClient } from '@supabase/supabase-js';

// =====================================================
// Configuration
// =====================================================

/**
 * Production timeline (in business days)
 * 生産スケジュール（営業日）
 */
export const PRODUCTION_TIMELINE = {
  totalWeeks: 4,                    // 総4週間
  businessDays: 20,                 // 20営業日
  trackingNumberWeek: 3,            // 3週目に送り状番号発行
  shippingDaysMin: 4,               // 配送最小4日
  shippingDaysMax: 5,               // 配送最大5日
};

/**
 * Japanese holidays (YYYY-MM-DD format)
 * 日本の祝日
 * Admin should update this annually
 */
export const JAPANESE_HOLIDAYS_2025 = [
  '2025-01-01',  // 元日
  '2025-01-13',  // 成人の日
  '2025-02-11',  // 建国記念の日
  '2025-02-23',  // 天皇誕生日
  '2025-02-24',  // 振替休日
  '2025-03-20',  // 春分の日
  '2025-04-29',  // 昭和の日
  '2025-05-03',  // 憲法記念日
  '2025-05-04',  // みどりの日
  '2025-05-05',  // こどもの日
  '2025-05-06',  // 振替休日
  '2025-07-21',  // 海の日
  '2025-08-11',  // 山の日
  '2025-08-12',  // 振替休日
  '2025-09-15',  // 敬老の日
  '2025-09-23',  // 秋分の日
  '2025-10-13',  // スポーツの日
  '2025-11-03',  // 文化の日
  '2025-11-23',  // 勤労感謝の日
  '2025-11-24',  // 振替休日
  '2025-12-25',  // 振替休日
];

/**
 * Combined holidays for all years
 */
export const JAPANESE_HOLIDAYS = [
  ...JAPANESE_HOLIDAYS_2025,
  // Add 2026 holidays when needed
  '2026-01-01',  // 元日
  '2026-01-12',  // 成人の日
  '2026-02-11',  // 建国記念の日
  '2026-02-23',  // 天皇誕生日
  '2026-03-20',  // 春分の日
  '2026-04-29',  // 昭和の日
  '2026-05-03',  // 憲法記念日
  '2026-05-04',  // みどりの日
  '2026-05-05',  // こどもの日
  '2026-07-21',  // 海の日
  '2026-08-11',  // 山の日
  '2026-09-15',  // 敬老の日
  '2026-09-23',  // 秋分の日
  '2026-10-12',  // スポーツの日
  '2026-11-03',  // 文化の日
  '2026-11-23',  // 勤労感謝の日
];

// =====================================================
// Date Utility Functions
// =====================================================

/**
 * Check if a date is a Japanese holiday
 * @param date - Date to check
 * @returns true if holiday
 */
export function isJapaneseHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return JAPANESE_HOLIDAYS.includes(dateStr);
}

/**
 * Check if a date is a weekend
 * @param date - Date to check
 * @returns true if Saturday or Sunday
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0=Sunday, 6=Saturday
}

/**
 * Check if a date is a business day (not weekend, not holiday)
 * @param date - Date to check
 * @returns true if business day
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isJapaneseHoliday(date);
}

/**
 * Add business days to a date
 * @param startDate - Starting date
 * @param businessDays - Number of business days to add
 * @returns New date with business days added
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate);
  let daysToAdd = businessDays;

  while (daysToAdd > 0) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      daysToAdd--;
    }
  }

  return result;
}

/**
 * Count business days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of business days
 */
export function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  current.setDate(current.getDate() + 1); // Start from next day

  while (current < endDate) {
    if (isBusinessDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// =====================================================
// Delivery Estimation Functions
// =====================================================

/**
 * Calculate delivery schedule from approval date
 * @param approvalDate - Customer approval date (ISO string or Date)
 * @param customDays - Optional custom production days
 * @returns Delivery schedule with key dates
 */
export function calculateDeliverySchedule(
  approvalDate: string | Date,
  customDays?: number
): DeliverySchedule {
  const start = new Date(approvalDate);
  const productionDays = customDays || PRODUCTION_TIMELINE.businessDays;

  // Calculate production completion (4 weeks / 20 business days)
  const productionCompleteDate = addBusinessDays(start, productionDays);

  // Calculate tracking number available date (week 3 = 15 business days)
  const trackingNumberDate = addBusinessDays(start, 15);

  // Calculate estimated delivery dates (4-5 days after production complete)
  const deliveryDateMin = addBusinessDays(productionCompleteDate, PRODUCTION_TIMELINE.shippingDaysMin);
  const deliveryDateMax = addBusinessDays(productionCompleteDate, PRODUCTION_TIMELINE.shippingDaysMax);

  // Calculate today's progress
  const today = new Date();
  const businessDaysPassed = countBusinessDays(start, today);
  const progressPercentage = Math.min(
    Math.round((businessDaysPassed / productionDays) * 100),
    100
  );

  return {
    approvalDate: start.toISOString(),
    productionCompleteDate: productionCompleteDate.toISOString(),
    trackingNumberDate: trackingNumberDate.toISOString(),
    deliveryDateMin: deliveryDateMin.toISOString(),
    deliveryDateMax: deliveryDateMax.toISOString(),
    businessDaysTotal: productionDays,
    businessDaysPassed,
    progressPercentage,
    isOverdue: today > deliveryDateMax,
    currentPhase: getCurrentPhase(businessDaysPassed, productionDays),
  };
}

/**
 * Get current production phase
 * @param daysPassed - Business days passed since approval
 * @param totalDays - Total business days for production
 * @returns Current phase description
 */
function getCurrentPhase(
  daysPassed: number,
  totalDays: number
): {
  phase: string;
  phaseJa: string;
  weekNumber: number;
} {
  if (daysPassed >= totalDays) {
    return {
      phase: 'production_complete',
      phaseJa: '生産完了',
      weekNumber: 4,
    };
  }

  const weekNumber = Math.ceil((daysPassed + 1) / 5);
  const weekPhase = Math.min(weekNumber, 4);

  const phases: Record<number, { phase: string; phaseJa: string }> = {
    1: { phase: 'production_week_1', phaseJa: '生産1週目' },
    2: { phase: 'production_week_2', phaseJa: '生産2週目' },
    3: { phase: 'production_week_3', phaseJa: '生産3週目（送り状番号発行）' },
    4: { phase: 'production_week_4', phaseJa: '生産4週目' },
  };

  return {
    ...phases[weekPhase],
    weekNumber: weekPhase,
  };
}

/**
 * Format date for display (Japanese format)
 * @param date - Date or ISO string
 * @returns Formatted date string (YYYY/MM/DD)
 */
export function formatDateJP(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Format date with weekday (Japanese)
 * @param date - Date or ISO string
 * @returns Formatted date with weekday
 */
export function formatDateWithWeekdayJP(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[d.getDay()];
  return `${formatDateJP(d)}(${weekday})`;
}

// =====================================================
// Types
// =====================================================

export interface DeliverySchedule {
  approvalDate: string;              // 承認日
  productionCompleteDate: string;    // 生産完了予定日
  trackingNumberDate: string;        // 送り状番号発行予定日
  deliveryDateMin: string;           // 配送到着予定日（最小）
  deliveryDateMax: string;           // 配送到着予定日（最大）
  businessDaysTotal: number;         // 総営業日
  businessDaysPassed: number;        // 経過営業日
  progressPercentage: number;        // 進行率（%）
  isOverdue: boolean;                // 遅延有無
  currentPhase: {
    phase: string;
    phaseJa: string;
    weekNumber: number;
  };
}

export interface ManualDeliveryAdjustment {
  trackingNumber?: string;           // 送り状番号
  shippingDate?: string;             // 出荷日
  estimatedDeliveryDate?: string;    // 予定到着日
  actualDeliveryDate?: string;       // 実際到着日
  notes?: string;                    // 管理者メモ
}

// =====================================================
// Export
// =====================================================

export const deliveryEstimator = {
  // Configuration
  PRODUCTION_TIMELINE,
  JAPANESE_HOLIDAYS_2025,
  JAPANESE_HOLIDAYS,

  // Date utilities
  isJapaneseHoliday,
  isWeekend,
  isBusinessDay,
  addBusinessDays,
  countBusinessDays,
  formatDateJP,
  formatDateWithWeekdayJP,

  // Main estimation
  calculateDeliverySchedule,
};

export default deliveryEstimator;
