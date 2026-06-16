/**
 * Production Types
 *
 * 製造工程関連の型定義
 * - 9段階の製造ステージ
 * - ステージステータス
 * - ラベル定義
 *
 * NOTE: src/components/shared/production/ProductionProgress.tsx で
 * 同名の ProductionStage interface が定義されているが、そちらは
 * UI レンダリング用の stage オブジェクト（id, name_ja, status 等）。
 * こちらは admin 画面の horizontal stepper 用の string literal union 型。
 * 両者は別物のため、呼び分けて使用すること。
 */

// =====================================================
// Production Stage (9 stages)
// =====================================================

export type ProductionStage =
  | 'order_received'
  | 'design_check'
  | 'plate_making'
  | 'printing'
  | 'lamination'
  | 'slitting'
  | 'bag_making'
  | 'quality_check'
  | 'shipping_preparation';

// =====================================================
// Stage Status
// =====================================================

export type ProductionStageStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

// =====================================================
// Stage Data
// =====================================================

export interface ProductionStageData {
  status: ProductionStageStatus;
  completed_at?: string;
  assigned_to?: string;
  notes?: string;
  photos?: string[];
  estimated_date?: string;
  actual_date?: string;
}

// =====================================================
// Stage Labels
// =====================================================

export interface StageLabel {
  icon: string;
  ja: string;
  ko: string;
  en: string;
  stepNumber?: number;
}

export const PRODUCTION_STAGE_LABELS: Record<ProductionStage, StageLabel> = {
  order_received: {
    icon: '📋',
    ja: '受注',
    ko: '주문 접수',
    en: 'Order Received',
  },
  design_check: {
    icon: '🎨',
    ja: 'デザイン確認',
    ko: '디자인 확인',
    en: 'Design Check',
  },
  plate_making: {
    icon: '🖨️',
    ja: '製版',
    ko: '판 제작',
    en: 'Plate Making',
  },
  printing: {
    icon: '🖨️',
    ja: '印刷',
    ko: '인쇄',
    en: 'Printing',
  },
  lamination: {
    icon: '🔄',
    ja: 'ラミネート',
    ko: '라미네이션',
    en: 'Lamination',
  },
  slitting: {
    icon: '✂️',
    ja: 'スリット',
    ko: '슬리팅',
    en: 'Slitting',
  },
  bag_making: {
    icon: '📦',
    ja: '製袋',
    ko: '제대',
    en: 'Bag Making',
  },
  quality_check: {
    icon: '✅',
    ja: '品質確認',
    ko: '품질 확인',
    en: 'Quality Check',
  },
  shipping_preparation: {
    icon: '🚚',
    ja: '出荷準備',
    ko: '출하 준비',
    en: 'Shipping Preparation',
  },
};

// =====================================================
// Status Labels
// =====================================================

export interface StatusLabel {
  ja: string;
  ko: string;
  en: string;
  bgColor: string;
  color: string;
}

export const STAGE_STATUS_LABELS: Record<ProductionStageStatus, StatusLabel> = {
  pending: {
    ja: '待機中',
    ko: '대기 중',
    en: 'Pending',
    bgColor: 'bg-gray-100',
    color: 'text-gray-600',
  },
  in_progress: {
    ja: '進行中',
    ko: '진행 중',
    en: 'In Progress',
    bgColor: 'bg-blue-100',
    color: 'text-blue-600',
  },
  completed: {
    ja: '完了',
    ko: '완료',
    en: 'Completed',
    bgColor: 'bg-green-100',
    color: 'text-green-600',
  },
  delayed: {
    ja: '遅延',
    ko: '지연',
    en: 'Delayed',
    bgColor: 'bg-red-100',
    color: 'text-red-600',
  },
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * 全製造ステージを順序通りに取得
 * Get all production stages in order
 */
export function getProductionStages(): ProductionStage[] {
  return [
    'order_received',
    'design_check',
    'plate_making',
    'printing',
    'lamination',
    'slitting',
    'bag_making',
    'quality_check',
    'shipping_preparation',
  ];
}
