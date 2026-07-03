// @generated from 이패키지 가공.xlsx by scripts/generate-sealing-data.ts - DO NOT EDIT MANUALLY

/**
 * 後加工シール幅データ（金型ツール保有組み合わせ）
 *
 * 元データ: 이패키지 가공.xlsx / 가공1호기 シート / D24:J101（全78レコード）
 * 参照ドキュメント: docs/quote/seal-width-and-gusset-logic.md 第6節
 *
 * J列 "A*B" は保有するシール幅ツール（金型）の組み合わせを表す:
 *   - `7.5*7.5` = 7.5mm工具を2つ保有 → 選択肢 {7.5}
 *   - `10*7.5`  = 10mm工具1つ + 7.5mm工具1つ保有 → 選択肢 {10, 7.5}
 *
 * 本ファイルは scripts/generate-sealing-data.ts により機械生成されている。
 * Excel改訂時は同スクリプトを再実行して再生成すること（手編集禁止）。
 */

/**
 * シール幅レコード（Excel 1行 = 1工具保有パターン）
 */
export interface SealingRecord {
  /** パウチ幅 mm（D列・例: R80 → 80） */
  width: number;
  /** マチ mm（E列） */
  gusset: number;
  /** J列 "A*B" の展開値 [A, B] */
  sealPair: [number, number];
  /** 版取り列数（F列・将来拡張予約・シール幅選択には現状未使用） */
  columnCount?: 2 | 3 | 4;
}

/**
 * Excel D24:J101 全78レコード
 * 行番号コメント（R24-R101）は Excel 原本とのトレーサビリティ用
 */
export const SEALING_RECORDS: SealingRecord[] = [
  // R24
  { width: 80, gusset: 25, sealPair: [7.5, 7.5], columnCount: 2 },
  // R25
  { width: 90, gusset: 25, sealPair: [7.5, 6], columnCount: 2 },
  // R26
  { width: 95, gusset: 25, sealPair: [5, 5], columnCount: 4 },
  // R27
  { width: 100, gusset: 30, sealPair: [5, 5], columnCount: 4 },
  // R28
  { width: 100, gusset: 30, sealPair: [10, 10], columnCount: 2 },
  // R29
  { width: 105, gusset: 30, sealPair: [7.5, 7.5], columnCount: 2 },
  // R30
  { width: 105, gusset: 45, sealPair: [5, 5], columnCount: 2 },
  // R31
  { width: 110, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R32
  { width: 120, gusset: 30, sealPair: [5, 5], columnCount: 4 },
  // R33
  { width: 120, gusset: 30, sealPair: [10, 10], columnCount: 2 },
  // R34
  { width: 120, gusset: 35, sealPair: [5, 5], columnCount: 2 },
  // R35
  { width: 120, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R36
  { width: 130, gusset: 30, sealPair: [10, 7.5], columnCount: 2 },
  // R37
  { width: 130, gusset: 30, sealPair: [5, 5], columnCount: 2 },
  // R38
  { width: 130, gusset: 35, sealPair: [10, 10], columnCount: 2 },
  // R39
  { width: 130, gusset: 38, sealPair: [10, 10], columnCount: 2 },
  // R40
  { width: 130, gusset: 40, sealPair: [5, 5], columnCount: 2 },
  // R41
  { width: 130, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R42
  { width: 130, gusset: 45, sealPair: [10, 10], columnCount: 2 },
  // R43
  { width: 135, gusset: 35, sealPair: [10, 10], columnCount: 2 },
  // R44
  { width: 140, gusset: 30, sealPair: [5, 5], columnCount: 2 },
  // R45
  { width: 140, gusset: 35, sealPair: [5, 5], columnCount: 2 },
  // R46
  { width: 140, gusset: 40, sealPair: [10, 10], columnCount: 4 },
  // R47
  { width: 140, gusset: 40, sealPair: [7.5, 7.5], columnCount: 2 },
  // R48
  { width: 145, gusset: 43, sealPair: [5, 5], columnCount: 2 },
  // R49
  { width: 150, gusset: 30, sealPair: [7.5, 7.5], columnCount: 2 },
  // R50
  { width: 150, gusset: 35, sealPair: [10, 10], columnCount: 2 },
  // R51
  { width: 150, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R52
  { width: 150, gusset: 43, sealPair: [10, 10], columnCount: 2 },
  // R53
  { width: 150, gusset: 45, sealPair: [5, 5], columnCount: 2 },
  // R54
  { width: 150, gusset: 45, sealPair: [10, 7.5], columnCount: 2 },
  // R55
  { width: 155, gusset: 40, sealPair: [5, 5], columnCount: 2 },
  // R56
  { width: 155, gusset: 45, sealPair: [10, 7.5], columnCount: 2 },
  // R57
  { width: 160, gusset: 30, sealPair: [10, 10], columnCount: 2 },
  // R58
  { width: 160, gusset: 43, sealPair: [10, 10], columnCount: 2 },
  // R59
  { width: 160, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R60
  { width: 165, gusset: 38, sealPair: [10, 10], columnCount: 2 },
  // R61
  { width: 165, gusset: 45, sealPair: [5, 5], columnCount: 2 },
  // R62
  { width: 170, gusset: 38, sealPair: [10, 10], columnCount: 2 },
  // R63
  { width: 170, gusset: 45, sealPair: [10, 10], columnCount: 2 },
  // R64
  { width: 170, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R65
  { width: 175, gusset: 38, sealPair: [10, 10], columnCount: 2 },
  // R66
  { width: 180, gusset: 30, sealPair: [10, 10], columnCount: 2 },
  // R67
  { width: 180, gusset: 35, sealPair: [10, 10], columnCount: 2 },
  // R68
  { width: 180, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R69
  { width: 180, gusset: 45, sealPair: [10, 10], columnCount: 2 },
  // R70
  { width: 180, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R71
  { width: 190, gusset: 35, sealPair: [10, 10], columnCount: 2 },
  // R72
  { width: 190, gusset: 45, sealPair: [10, 10], columnCount: 2 },
  // R73
  { width: 200, gusset: 30, sealPair: [10, 10], columnCount: 4 },
  // R74
  { width: 200, gusset: 43, sealPair: [5, 5], columnCount: 2 },
  // R75
  { width: 200, gusset: 43, sealPair: [10, 10], columnCount: 2 },
  // R76
  { width: 200, gusset: 50, sealPair: [5, 5], columnCount: 2 },
  // R77
  { width: 200, gusset: 55, sealPair: [10, 10], columnCount: 2 },
  // R78
  { width: 200, gusset: 60, sealPair: [10, 10], columnCount: 2 },
  // R79
  { width: 210, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R80
  { width: 220, gusset: 35, sealPair: [10, 10], columnCount: 2 },
  // R81
  { width: 220, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R82
  { width: 220, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R83
  { width: 220, gusset: 55, sealPair: [10, 10], columnCount: 2 },
  // R84
  { width: 230, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R85
  { width: 230, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R86
  { width: 230, gusset: 70, sealPair: [10, 10], columnCount: 2 },
  // R87
  { width: 240, gusset: 40, sealPair: [10, 10], columnCount: 2 },
  // R88
  { width: 240, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R89
  { width: 240, gusset: 60, sealPair: [5, 5], columnCount: 2 },
  // R90
  { width: 250, gusset: 30, sealPair: [7.5, 7.5], columnCount: 2 },
  // R91
  { width: 250, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R92
  { width: 250, gusset: 60, sealPair: [7.5, 7.5], columnCount: 2 },
  // R93
  { width: 260, gusset: 60, sealPair: [5, 5], columnCount: 2 },
  // R94
  { width: 270, gusset: 40, sealPair: [5, 5], columnCount: 2 },
  // R95
  { width: 270, gusset: 40, sealPair: [10, 10], columnCount: 4 },
  // R96
  { width: 280, gusset: 50, sealPair: [10, 10], columnCount: 2 },
  // R97
  { width: 280, gusset: 60, sealPair: [10, 10], columnCount: 2 },
  // R98
  { width: 280, gusset: 63, sealPair: [10, 10], columnCount: 2 },
  // R99
  { width: 280, gusset: 75, sealPair: [10, 10], columnCount: 2 },
  // R100
  { width: 290, gusset: 63, sealPair: [10, 10], columnCount: 2 },
  // R101
  { width: 330, gusset: 60, sealPair: [10, 10], columnCount: 2 },
];

/**
 * 指定された幅+マチに対応するシール幅選択肢を取得する（厳密一致のみ）
 *
 * 該当レコード（r.width === width && r.gusset === gusset）の J列 sealPair を
 * {A, B} に展開し、Set で重複排除した上で昇順（狭い順: 5→7.5→10）で返す。
 *
 * normalize / closest（直近値への丸め）は行わない。
 * Excel に該当しない条件（底マチなし・不在サイズ・5mm単位外のマチ等）は
 * 空配列を返し、呼び出し側で従来3択 [5, 7.5, 10] へフォールバックする。
 *
 * @param width パウチの幅（mm）
 * @param gusset マチ（mm）
 * @returns 利用可能なシール幅の配列（昇順）。該当なしの場合は空配列
 */
export function getAvailableSealWidths(width: number, gusset: number): number[] {
  const set = new Set<number>();
  for (const r of SEALING_RECORDS) {
    if (r.width === width && r.gusset === gusset) {
      set.add(r.sealPair[0]);
      set.add(r.sealPair[1]);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * 底マチ（gusset）ありパウチかを判定する（3軸判定・純粋関数）
 *
 * シール幅Excel適用（Rev.5）の前提となる底マチあり判定。
 * QuoteContext.checkStepComplete と ImprovedQuotingWizard.PostProcessingStep で
 * 同一ロジックを共有するため、本関数に集約（重複回避・共通化）。
 *
 * 判定ルール（plan Rev.5 AC-A4 準拠）:
 *   - spout_pouch: hasGusset === true かつ depth > 0 の両立で底マチあり
 *     （hasGusset !== true は平袋準用＝底マチなし）
 *   - 上記以外: GUSSETED_TYPES に含まれる bagTypeId かつ depth > 0 で底マチあり
 *   - lap_seal は QuoteContext.needsGusset に含まれるが底マチなし（depth=0 強制）のため除外
 *   - flat_3_side / roll_film は底マチなし（GUSSETED_TYPES に含まず）
 *
 * ※ QuoteState 型に依存しない個別引数とすることで循環参照を回避。
 *
 * @param bagTypeId 袋タイプID（state.bagTypeId）
 * @param hasGusset マチ有無（state.hasGusset・spout_pouch 専用）
 * @param depth マチ/深さ mm（state.depth・undefined 可）
 * @returns 底マチありの場合 true
 */
const GUSSETED_TYPES = ['stand_up', 'zipper_stand', 'gusset', 'box', 't_shape', 'm_shape', 'spout'];

export function isGussetedBag(
  bagTypeId: string,
  hasGusset: boolean | undefined,
  depth: number | undefined
): boolean {
  return bagTypeId === 'spout_pouch'
    ? hasGusset === true && (depth ?? 0) > 0
    : GUSSETED_TYPES.includes(bagTypeId) && (depth ?? 0) > 0;
}
