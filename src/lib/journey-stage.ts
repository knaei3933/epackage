/**
 * Journey Stage Mapping Utility
 *
 * 見積→注文→入稿→校正→承認 の顧客向けジャーニー進行マッピング
 *
 * JourneyStepper コンポーネントと NextActionBanner の単一データソース。
 * 注文内の作業ステップ（DesignWorkflowSection）とは粒度が異なる:
 * - このモジュール: ページをまたぐ顧客ジャーニー全体の位置
 * - DesignWorkflowSection: 1つの注文内の作業ステップ（入稿→校正承認）
 *
 * @module lib/journey-stage
 */

import type { OrderStatus } from '@/types/order-status';

// =====================================================
// Types
// =====================================================

export type JourneyStageKey =
  | 'quotation'
  | 'order'
  | 'data_upload'
  | 'correction'
  | 'approval'
  | 'production';

export type JourneyStageState = 'done' | 'current' | 'upcoming';

export interface JourneyStageResult {
  /** 現在のステージ。ジャーニー完了後（製造以降）は null */
  currentStage: JourneyStageKey | null;
  /** 各ステージの表示状態（ステッパー描画用） */
  stageStates: Record<JourneyStageKey, JourneyStageState>;
  /** ジャーニー5段階がすべて完了（製造以降のステータス） */
  isComplete: boolean;
  /** キャンセルされた注文/見積 */
  isCancelled: boolean;
}

// =====================================================
// Stage Definitions (Japanese labels — member UI is ja)
// =====================================================

export const JOURNEY_STAGES: Array<{
  key: JourneyStageKey;
  label: string;
}> = [
  { key: 'quotation', label: '見積' },
  { key: 'order', label: '注文' },
  { key: 'data_upload', label: '入稿' },
  { key: 'correction', label: '校正' },
  { key: 'approval', label: '承認' },
  { key: 'production', label: '製造' },
];

// =====================================================
// Internal Helpers
// =====================================================

const ALL_STAGE_KEYS: JourneyStageKey[] = JOURNEY_STAGES.map((s) => s.key);

function buildResult(
  currentIndex: number | null,
  isCancelled: boolean
): JourneyStageResult {
  const stageStates = {} as Record<JourneyStageKey, JourneyStageState>;
  for (const key of ALL_STAGE_KEYS) {
    const index = ALL_STAGE_KEYS.indexOf(key);
    if (currentIndex === null) {
      stageStates[key] = isCancelled ? 'upcoming' : 'done';
    } else if (index < currentIndex) {
      stageStates[key] = 'done';
    } else if (index === currentIndex) {
      stageStates[key] = 'current';
    } else {
      stageStates[key] = 'upcoming';
    }
  }

  return {
    currentStage: currentIndex === null ? null : ALL_STAGE_KEYS[currentIndex],
    stageStates,
    isComplete: currentIndex === null && !isCancelled,
    isCancelled,
  };
}

// =====================================================
// Order Status → Journey Stage
// =====================================================

/**
 * 注文ステータスの進捗に対応するジャーニーステージのインデックス。
 * -1 はキャンセル、null はジャーニー完了（製造以降）を表す。
 *
 * exhaustiveness: OrderStatus の全値をカバー（A2 テストで列挙検証）。
 */
const ORDER_STATUS_STAGE: Record<OrderStatus, number | null> = {
  // 見積段階（注文前）
  QUOTATION_PENDING: 0,
  QUOTATION_APPROVED: 1,

  // 注文段階（内容確定・修正承認ループを含む）
  MODIFICATION_REQUESTED: 1,
  MODIFICATION_APPROVED: 3,
  MODIFICATION_REJECTED: 1,

  // 入稿段階
  DATA_UPLOAD_PENDING: 2,

  // 校正段階
  DATA_UPLOADED: 3,
  CORRECTION_IN_PROGRESS: 3,

  // 承認段階
  CORRECTION_COMPLETED: 4,
  CUSTOMER_APPROVAL_PENDING: 4,

  // 製造段階（承認後は顧客は出荷を待つのみ）
  WORK_ORDER: 5,
  PRODUCTION: 5,

  // ジャーニー完了（出荷以降は追跡カードで案内）
  READY_TO_SHIP: null,
  SHIPPED: null,
  DELIVERED: null,

  // キャンセル
  CANCELLED: -1,
};

/**
 * 注文ステータスからジャーニー進行状態を導出する。
 * 未知のステータス（レガシーデータ等）は安全のため「注文」段階の現在地として扱う。
 */
export function getOrderJourneyStage(status: OrderStatus | string): JourneyStageResult {
  const mapped = ORDER_STATUS_STAGE[status as OrderStatus];

  if (mapped === undefined) {
    // 未知ステータス: 注文段階の現在地として安全にフォールバック
    return buildResult(1, false);
  }
  if (mapped === -1) {
    return buildResult(null, true);
  }
  return buildResult(mapped, false);
}

// =====================================================
// Quotation Status → Journey Stage
// =====================================================

/**
 * 見積ステータスからジャーニー進行状態を導出する。
 * 見積詳細ページで使用（DRAFT/SENT/APPROVED/REJECTED/EXPIRED/CONVERTED/CANCELLED）。
 */
export function getQuotationJourneyStage(status: string): JourneyStageResult {
  switch (status.toUpperCase()) {
    case 'DRAFT':
    case 'SENT':
      // 見積確認・承認待ち
      return buildResult(0, false);
    case 'APPROVED':
      // 見積承認済 → 注文へ
      return buildResult(1, false);
    case 'CONVERTED':
      // 注文に変換済 → 注文段階の作業中
      return buildResult(1, false);
    case 'REJECTED':
    case 'EXPIRED':
    case 'CANCELLED':
      return buildResult(null, true);
    default:
      // 未知ステータス: 見積段階の現在地として安全にフォールバック
      return buildResult(0, false);
  }
}
