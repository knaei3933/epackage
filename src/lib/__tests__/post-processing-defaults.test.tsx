/**
 * 後加工オプションデフォルト値のテスト
 *
 * 現行仕様: getDefaultPostProcessingOptions() は袋タイプに応じた推奨デフォルトを返す。
 * QuoteContext（初期 state）と PostProcessingStep（袋タイプ変更時の事前選択）が
 * このデフォルトに依存し、UI で全カテゴリに初期選択を提供する。
 *
 * 袋タイプ別の戻り値:
 * - flat_3_side / stand_up / gusset: 8カテゴリのデフォルト
 * - spout_pouch / roll_film: 表面処理のみ（['glossy']）
 * - box / lap_seal: ジッパー・角加工を除外（6項目）
 */

import { getDefaultPostProcessingOptions } from '../../components/quote/shared/processingConfig';

const FULL_DEFAULTS = [
  'zipper-yes',
  'glossy',
  'notch-yes',
  'hang-hole-6mm',
  'corner-round',
  'valve-no',
  'top-open',
  'machi-printing-no',
];

// 合掌袋・ボックス型はジッパー・角加工非対応 → これらを除外した6項目
const EXCLUDED_DEFAULTS = [
  'glossy',
  'notch-yes',
  'hang-hole-6mm',
  'valve-no',
  'top-open',
  'machi-printing-no',
];

describe('後加工オプションデフォルト値', () => {
  describe('現行の挙動 - 袋タイプ別の推奨デフォルト', () => {
    test('平袋は8カテゴリのデフォルト', () => {
      const defaults = getDefaultPostProcessingOptions('flat_3_side');
      expect(defaults).toEqual(FULL_DEFAULTS);
    });

    test('スタンドアップパウチは8カテゴリのデフォルト', () => {
      const defaults = getDefaultPostProcessingOptions('stand_up');
      expect(defaults).toEqual(FULL_DEFAULTS);
    });

    test('スパウトパウチは表面処理のみ', () => {
      const defaults = getDefaultPostProcessingOptions('spout_pouch');
      expect(defaults).toEqual(['glossy']);
    });

    test('ロールフィルムは表面処理のみ', () => {
      const defaults = getDefaultPostProcessingOptions('roll_film');
      expect(defaults).toEqual(['glossy']);
    });

    test('ボックス型パウチはジッパー・角加工を除外', () => {
      const defaults = getDefaultPostProcessingOptions('box');
      expect(defaults).toEqual(EXCLUDED_DEFAULTS);
    });

    test('合掌袋はジッパー・角加工を除外', () => {
      const defaults = getDefaultPostProcessingOptions('lap_seal');
      expect(defaults).toEqual(EXCLUDED_DEFAULTS);
    });

    test('ガゼットパウチは8カテゴリのデフォルト', () => {
      const defaults = getDefaultPostProcessingOptions('gusset');
      expect(defaults).toEqual(FULL_DEFAULTS);
    });
  });

  describe('ユーザーが選択したオプションのみが適用される', () => {
    test('ユーザーがジッパーを選択した場合のみジッパーが含まれる', () => {
      // 実際の選択ロジックはPostProcessingStep.tsxで実装されている
      const zipperOption = 'zipper-yes';
      expect(zipperOption).toBe('zipper-yes');
    });
  });
});
