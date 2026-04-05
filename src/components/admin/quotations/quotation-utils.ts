/**
 * quotation-utils - 見積もり関連ユーティリティ関数
 */

import type { Quotation } from '@/types/quotation';

/**
 * 製品タイプの画像マッピング - processing-iconsを使用
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
    opening?: 'top' | 'bottom'
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
      case 'notch-straight':
        options.notch = true;
        break;
      case 'notch-no':
        options.notch = false;
        break;
      case 'hang-hole-6mm':
      case 'hang-hole-8mm':
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
      case 'top-open':
        options.opening = 'top';
        break;
      case 'bottom-open':
        options.opening = 'bottom';
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
 * ステータスを正規化する関数
 */
export function normalizeStatus(status: string): Quotation['status'] {
  const validStatuses = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'];
  const upperStatus = status.toUpperCase();

  if (validStatuses.includes(upperStatus)) {
    return upperStatus as Quotation['status'];
  }

  // マッピングテーブル
  const statusMap: Record<string, Quotation['status']> = {
    'draft': 'DRAFT',
    'sent': 'SENT',
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
    'expired': 'EXPIRED',
    'converted': 'CONVERTED',
  };

  return statusMap[upperStatus] || 'DRAFT';
}

/**
 * ステータスラベルの定義
 */
export const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  'DRAFT': { label: 'ドラフト', variant: 'default' },
  'SENT': { label: '送信済み', variant: 'warning' },
  'APPROVED': { label: '承認済み', variant: 'success' },
  'REJECTED': { label: '拒否', variant: 'error' },
  'EXPIRED': { label: '期限切れ', variant: 'error' },
  'CONVERTED': { label: '注文変換済み', variant: 'success' },
};
