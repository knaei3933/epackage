/**
 * 製品タイプと見積もりステータスの共通設定
 *
 * このファイルは以下のコンポーネント間で共有される定数と関数を提供します:
 * - AdminQuotationsClient (管理者用見積もりリスト)
 * - QuotationsClient (会員用見積もりリスト)
 */

import type { Quotation } from '@/types/entities';

// =====================================================
// 製品タイプ画像マッピング
// =====================================================

/**
 * 製品タイプの画像マッピング - processing-iconsを使用
 * bagTypeIdをキーとして、日本語名と画像パスを取得
 */
export const BAG_TYPE_IMAGES: Record<string, { name: string; image: string }> = {
  'flat_3_side': { name: '三方シール平袋', image: '/images/processing-icons/flat-3-side.png' },
  'stand_up': { name: 'スタンドパウチ', image: '/images/processing-icons/stand.png' },
  'box': { name: 'ガゼットパウチ', image: '/images/processing-icons/box-pouch.png' },
  'spout_pouch': { name: 'スパウトパウチ', image: '/images/processing-icons/spout.png' },
  'roll_film': { name: 'ロールフィルム', image: '/images/processing-icons/roll-film.png' },
  'flat_gusset': { name: 'ガセット平袋', image: '/images/processing-icons/flat-3-side-stand.png' },
  'flat_with_zip': { name: 'ジッパー付き平袋', image: '/images/processing-icons/zipper-3-side.png' },
  '3_side': { name: '三方シール', image: '/images/processing-icons/flat-3-side.png' },
  '4_side': { name: '四方シール', image: '/images/processing-icons/flat-3-side.png' },
  'gusset': { name: 'ガセット', image: '/images/processing-icons/gusset.png' },
  'bottom_gusset': { name: '底ガセット', image: '/images/processing-icons/gusset.png' },
};

// =====================================================
// 見積もりステータス設定
// =====================================================

/**
 * 管理者用見積もりステータスラベル
 * 管理者画面で使用する詳細なステータス表示
 */
export const ADMIN_STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  'DRAFT': { label: 'ドラフト', variant: 'default' },
  'draft': { label: 'ドラフト', variant: 'default' },
  'SENT': { label: '送信済み', variant: 'warning' },
  'sent': { label: '送信済み', variant: 'warning' },
  'APPROVED': { label: '承認済み', variant: 'success' },
  'approved': { label: '承認済み', variant: 'success' },
  'REJECTED': { label: '拒否', variant: 'error' },
  'rejected': { label: '拒否', variant: 'error' },
  'EXPIRED': { label: '期限切れ', variant: 'default' },
  'expired': { label: '期限切れ', variant: 'default' },
  'CONVERTED': { label: '注文変換済み', variant: 'success' },
  'converted': { label: '注文変換済み', variant: 'success' },
  // 10-step workflow statuses
  'QUOTATION_PENDING': { label: '見積依頼中', variant: 'default' },
  'QUOTATION_APPROVED': { label: '見積承認済み', variant: 'success' },
  'DATA_UPLOAD_PENDING': { label: 'データ入待ち', variant: 'default' },
  'DATA_UPLOADED': { label: 'データ入完了', variant: 'warning' },
  'CORRECTION_IN_PROGRESS': { label: '修正中', variant: 'warning' },
  'CORRECTION_COMPLETED': { label: '修正完了', variant: 'warning' },
  'CUSTOMER_APPROVAL_PENDING': { label: '顧客承認待ち', variant: 'warning' },
  'PRODUCTION': { label: '製造中', variant: 'warning' },
  'READY_TO_SHIP': { label: '出荷予定', variant: 'warning' },
  'SHIPPED': { label: '出荷完了', variant: 'success' },
  'CANCELLED': { label: 'キャンセル', variant: 'error' },
};

/**
 * 会員用見積もりステータスラベル（簡易版）
 * 会員画面で使用するシンプルなステータス表示
 */
export const MEMBER_STATUS_LABELS: Record<string, string> = {
  'DRAFT': '審査中',
  'draft': '審査中',
  'SENT': '送信済み',
  'sent': '送信済み',
  'APPROVED': '承認済み',
  'approved': '承認済み',
  'REJECTED': '拒否',
  'rejected': '拒否',
  'EXPIRED': '期限切れ',
  'expired': '期限切れ',
  'CONVERTED': '注文変換済み',
  'converted': '注文変換済み',
  // 10-step workflow statuses
  'QUOTATION_PENDING': '見積依頼中',
  'QUOTATION_APPROVED': '見積承認済み',
  'DATA_UPLOAD_PENDING': 'データ入待ち',
  'DATA_UPLOADED': 'データ入完了',
  'CORRECTION_IN_PROGRESS': '修正中',
  'CORRECTION_COMPLETED': '修正完了',
  'CUSTOMER_APPROVAL_PENDING': '顧客承認待ち',
  'PRODUCTION': '製造中',
  'READY_TO_SHIP': '出荷予定',
  'SHIPPED': '出荷完了',
  'CANCELLED': 'キャンセル',
};

/**
 * 会員用見積もりステータスバリアント
 * Badgeコンポーネントのvariantプロパティ用
 */
export const MEMBER_STATUS_VARIANTS: Record<string, 'secondary' | 'info' | 'success' | 'error' | 'warning'> = {
  'DRAFT': 'secondary',
  'draft': 'secondary',
  'SENT': 'info',
  'sent': 'info',
  'APPROVED': 'success',
  'approved': 'success',
  'REJECTED': 'error',
  'rejected': 'error',
  'EXPIRED': 'secondary',
  'expired': 'secondary',
  'CONVERTED': 'success',
  'converted': 'success',
  // 10-step workflow statuses
  'QUOTATION_PENDING': 'secondary',
  'QUOTATION_APPROVED': 'success',
  'DATA_UPLOAD_PENDING': 'secondary',
  'DATA_UPLOADED': 'info',
  'CORRECTION_IN_PROGRESS': 'warning',
  'CORRECTION_COMPLETED': 'info',
  'CUSTOMER_APPROVAL_PENDING': 'warning',
  'PRODUCTION': 'warning',
  'READY_TO_SHIP': 'info',
  'SHIPPED': 'success',
  'CANCELLED': 'error',
};

// =====================================================
// ユーティリティ関数
// =====================================================

/**
 * postProcessingOptionsをPostProcessingPreview用に変換
 * PostProcessingPreviewコンポーネントのID形式に合わせる
 */
export function convertToPreviewOptions(postProcessingOptions: string[] = []) {
  const options: {
    zipper?: boolean
    finish?: 'matte' | 'glossy'
    notch?: boolean
    punching?: boolean
    corner?: 'round' | 'square'
    opening?: 'top' | 'bottom'  // PostProcessingPreviewは'opening-top'/'opening-bottom'形式を使用
    valve?: boolean
  } = {};

  postProcessingOptions.forEach((opt: string) => {
    switch (opt) {
      case 'zipper-yes':
        options.zipper = true;
        break;
      case 'zipper-no':
        options.zipper = false;
        break;
      case 'glossy':
        options.finish = 'glossy';
        break;
      case 'matte':
        options.finish = 'matte';
        break;
      case 'notch-yes':
        options.notch = true;
        break;
      case 'notch-no':
        options.notch = false;
        break;
      case 'hang-hole-6mm':
      case 'hang-hole-8mm':
      case 'hang-hole-10mm':
        options.punching = true;
        break;
      case 'hang-hole-no':
        options.punching = false;
        break;
      case 'corner-round':
        options.corner = 'round';
        break;
      case 'corner-square':
        options.corner = 'square';
        break;
      // PostProcessingPreviewのID形式に合わせる: 'top-open' -> 'opening-top'
      case 'top-open':
        options.opening = 'top';  // PostProcessingPreview内で'opening-top'に変換される
        break;
      case 'bottom-open':
        options.opening = 'bottom';  // PostProcessingPreview内で'opening-bottom'に変換される
        break;
      case 'valve-yes':
        options.valve = true;
        break;
      case 'valve-no':
        options.valve = false;
        break;
    }
  });

  return options;
}

/**
 * データベースの小文字ステータスをコードの大文字に変換
 * 10-step workflowのステータスを既存のステータスにマッピング
 */
export function normalizeQuotationStatus(status: string): Quotation['status'] {
  const statusMap: Record<string, Quotation['status']> = {
    'draft': 'DRAFT',
    'sent': 'SENT',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
    'expired': 'EXPIRED',
    'converted': 'CONVERTED',
    // 10-step workflow statuses
    'quotation_pending': 'DRAFT',
    'quotation_approved': 'APPROVED',
    'data_upload_pending': 'DRAFT',
    'data_uploaded': 'SENT',
    'correction_in_progress': 'DRAFT',
    'correction_completed': 'SENT',
    'customer_approval_pending': 'SENT',
    'production': 'APPROVED',
    'ready_to_ship': 'APPROVED',
    'shipped': 'APPROVED',
    'cancelled': 'REJECTED',
  };
  return statusMap[status?.toLowerCase()] || 'DRAFT';
}
