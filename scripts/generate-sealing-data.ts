/**
 * generate-sealing-data.ts
 *
 * 이패키지 가공.xlsx (가공1호기 シート, D24:J101) から
 * src/lib/sealing-data.ts を再生成するスクリプト。
 *
 * 機能:
 *   1. Excel ファイルが指定された場合: xlsx パースで D/E/F/J 列を読み込み変換
 *   2. Excel ファイル未指定時: docs/quote/seal-width-and-gusset-logic.md 第6節の
 *      抜粋表（R24-R101 全78レコード）をフォールバックデータとして使用
 *
 * 実行例:
 *   npx tsx scripts/generate-sealing-data.ts                          # docs フォールバック
 *   npx tsx scripts/generate-sealing-data.ts "Z:\path\이패키지 가공.xlsx"  # Excel 直読み
 *
 * 出力: src/lib/sealing-data.ts （ヘッダ @generated 印付き・手編集禁止）
 */

import * as fs from 'fs';
import * as path from 'path';

interface SealingRecord {
  width: number;
  gusset: number;
  sealPair: [number, number];
  columnCount?: 2 | 3 | 4;
}

/**
 * Excel ファイル未指定時のフォールバックデータ。
 * docs/quote/seal-width-and-gusset-logic.md 第6節（R24-R101 全78レコード）と完全一致。
 * [行番号, 幅, マチ, 列数, J列 "A*B"]
 */
const FALLBACK_RAW: Array<[number, number, number, 2 | 3 | 4, string]> = [
  [24, 80, 25, 2, '7.5*7.5'],
  [25, 90, 25, 2, '7.5*6'],
  [26, 95, 25, 4, '5*5'],
  [27, 100, 30, 4, '5*5'],
  [28, 100, 30, 2, '10*10'],
  [29, 105, 30, 2, '7.5*7.5'],
  [30, 105, 45, 2, '5*5'],
  [31, 110, 40, 2, '10*10'],
  [32, 120, 30, 4, '5*5'],
  [33, 120, 30, 2, '10*10'],
  [34, 120, 35, 2, '5*5'],
  [35, 120, 40, 2, '10*10'],
  [36, 130, 30, 2, '10*7.5'],
  [37, 130, 30, 2, '5*5'],
  [38, 130, 35, 2, '10*10'],
  [39, 130, 38, 2, '10*10'],
  [40, 130, 40, 2, '5*5'],
  [41, 130, 40, 2, '10*10'],
  [42, 130, 45, 2, '10*10'],
  [43, 135, 35, 2, '10*10'],
  [44, 140, 30, 2, '5*5'],
  [45, 140, 35, 2, '5*5'],
  [46, 140, 40, 4, '10*10'],
  [47, 140, 40, 2, '7.5*7.5'],
  [48, 145, 43, 2, '5*5'],
  [49, 150, 30, 2, '7.5*7.5'],
  [50, 150, 35, 2, '10*10'],
  [51, 150, 40, 2, '10*10'],
  [52, 150, 43, 2, '10*10'],
  [53, 150, 45, 2, '5*5'],
  [54, 150, 45, 2, '10*7.5'],
  [55, 155, 40, 2, '5*5'],
  [56, 155, 45, 2, '10*7.5'],
  [57, 160, 30, 2, '10*10'],
  [58, 160, 43, 2, '10*10'],
  [59, 160, 50, 2, '10*10'],
  [60, 165, 38, 2, '10*10'],
  [61, 165, 45, 2, '5*5'],
  [62, 170, 38, 2, '10*10'],
  [63, 170, 45, 2, '10*10'],
  [64, 170, 50, 2, '10*10'],
  [65, 175, 38, 2, '10*10'],
  [66, 180, 30, 2, '10*10'],
  [67, 180, 35, 2, '10*10'],
  [68, 180, 40, 2, '10*10'],
  [69, 180, 45, 2, '10*10'],
  [70, 180, 50, 2, '10*10'],
  [71, 190, 35, 2, '10*10'],
  [72, 190, 45, 2, '10*10'],
  [73, 200, 30, 4, '10*10'],
  [74, 200, 43, 2, '5*5'],
  [75, 200, 43, 2, '10*10'],
  [76, 200, 50, 2, '5*5'],
  [77, 200, 55, 2, '10*10'],
  [78, 200, 60, 2, '10*10'],
  [79, 210, 50, 2, '10*10'],
  [80, 220, 35, 2, '10*10'],
  [81, 220, 40, 2, '10*10'],
  [82, 220, 50, 2, '10*10'],
  [83, 220, 55, 2, '10*10'],
  [84, 230, 40, 2, '10*10'],
  [85, 230, 50, 2, '10*10'],
  [86, 230, 70, 2, '10*10'],
  [87, 240, 40, 2, '10*10'],
  [88, 240, 50, 2, '10*10'],
  [89, 240, 60, 2, '5*5'],
  [90, 250, 30, 2, '7.5*7.5'],
  [91, 250, 50, 2, '10*10'],
  [92, 250, 60, 2, '7.5*7.5'],
  [93, 260, 60, 2, '5*5'],
  [94, 270, 40, 2, '5*5'],
  [95, 270, 40, 4, '10*10'],
  [96, 280, 50, 2, '10*10'],
  [97, 280, 60, 2, '10*10'],
  [98, 280, 63, 2, '10*10'],
  [99, 280, 75, 2, '10*10'],
  [100, 290, 63, 2, '10*10'],
  [101, 330, 60, 2, '10*10'],
];

/**
 * J列 "A*B" を [A, B] に変換（例: "10*7.5" → [10, 7.5]）
 */
function parseSealPair(raw: string): [number, number] {
  const parts = raw.split('*').map(s => parseFloat(s.trim()));
  if (parts.length !== 2 || parts.some(n => Number.isNaN(n))) {
    throw new Error(`Invalid sealPair format: "${raw}" (expected "A*B")`);
  }
  return [parts[0], parts[1]];
}

/**
 * 生レコード配列 → SealingRecord[] に変換
 */
function buildRecords(
  raw: Array<[number, number, number, 2 | 3 | 4, string]>
): Array<{ row: number; record: SealingRecord }> {
  return raw.map(([row, width, gusset, columnCount, sealRaw]) => ({
    row,
    record: {
      width,
      gusset,
      sealPair: parseSealPair(sealRaw),
      columnCount,
    },
  }));
}

/**
 * Excel ファイルから D24:J101 を読み込む（xlsx 依存・オプション）
 * Excel ファイル未指定・読み込み失敗時は null を返しフォールバックを使用
 */
async function readFromExcel(
  excelPath: string
): Promise<Array<[number, number, number, 2 | 3 | 4, string]> | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = require('xlsx');
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets['가공1호기'];
    if (!sheet) {
      console.warn(`[warn] シート "가공1호기" が見つかりません。フォールバックを使用します。`);
      return null;
    }
    const records: Array<[number, number, number, 2 | 3 | 4, string]> = [];
    // D=4, E=5, F=6, J=10 列。行 24-101
    for (let rowNum = 24; rowNum <= 101; rowNum++) {
      const width = sheet[`D${rowNum}`]?.v;
      const gusset = sheet[`E${rowNum}`]?.v;
      const columnCount = sheet[`F${rowNum}`]?.v;
      const seal = sheet[`J${rowNum}`]?.v;
      if (width == null || gusset == null || seal == null) continue;
      records.push([
        rowNum,
        Number(width),
        Number(gusset),
        (Number(columnCount) || 2) as 2 | 3 | 4,
        String(seal),
      ]);
    }
    return records;
  } catch (err) {
    console.warn(`[warn] Excel 読み込み失敗: ${(err as Error).message}。フォールバックを使用します。`);
    return null;
  }
}

/**
 * SealingRecord[] → sealing-data.ts ソースコード文字列を生成
 */
function generateSource(items: Array<{ row: number; record: SealingRecord }>): string {
  const lines: string[] = [];
  lines.push('// @generated from 이패키지 가공.xlsx by scripts/generate-sealing-data.ts - DO NOT EDIT MANUALLY');
  lines.push('');
  lines.push('/**');
  lines.push(' * 後加工シール幅データ（金型ツール保有組み合わせ）');
  lines.push(' *');
  lines.push(' * 元データ: 이패키지 가공.xlsx / 가공1호기 シート / D24:J101（全78レコード）');
  lines.push(' * 参照ドキュメント: docs/quote/seal-width-and-gusset-logic.md 第6節');
  lines.push(' *');
  lines.push(' * J列 "A*B" は保有するシール幅ツール（金型）の組み合わせを表す:');
  lines.push(' *   - `7.5*7.5` = 7.5mm工具を2つ保有 → 選択肢 {7.5}');
  lines.push(' *   - `10*7.5`  = 10mm工具1つ + 7.5mm工具1つ保有 → 選択肢 {10, 7.5}');
  lines.push(' *');
  lines.push(' * 本ファイルは scripts/generate-sealing-data.ts により機械生成されている。');
  lines.push(' * Excel改訂時は同スクリプトを再実行して再生成すること（手編集禁止）。');
  lines.push(' */');
  lines.push('');
  lines.push('/**');
  lines.push(' * シール幅レコード（Excel 1行 = 1工具保有パターン）');
  lines.push(' */');
  lines.push('export interface SealingRecord {');
  lines.push('  /** パウチ幅 mm（D列・例: R80 → 80） */');
  lines.push('  width: number;');
  lines.push('  /** マチ mm（E列） */');
  lines.push('  gusset: number;');
  lines.push('  /** J列 "A*B" の展開値 [A, B] */');
  lines.push('  sealPair: [number, number];');
  lines.push('  /** 版取り列数（F列・将来拡張予約・シール幅選択には現状未使用） */');
  lines.push('  columnCount?: 2 | 3 | 4;');
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * Excel D24:J101 全78レコード');
  lines.push(' * 行番号コメント（R24-R101）は Excel 原本とのトレーサビリティ用');
  lines.push(' */');
  lines.push('export const SEALING_RECORDS: SealingRecord[] = [');
  for (const { row, record } of items) {
    lines.push(`  // R${row}`);
    lines.push(
      `  { width: ${record.width}, gusset: ${record.gusset}, sealPair: [${record.sealPair[0]}, ${record.sealPair[1]}], columnCount: ${record.columnCount} },`
    );
  }
  lines.push('];');
  lines.push('');
  lines.push('/**');
  lines.push(' * 指定された幅+マチに対応するシール幅選択肢を取得する（厳密一致のみ）');
  lines.push(' *');
  lines.push(' * 該当レコード（r.width === width && r.gusset === gusset）の J列 sealPair を');
  lines.push(' * {A, B} に展開し、Set で重複排除した上で昇順（狭い順: 5→7.5→10）で返す。');
  lines.push(' *');
  lines.push(' * normalize / closest（直近値への丸め）は行わない。');
  lines.push(' * Excel に該当しない条件（底マチなし・不在サイズ・5mm単位外のマチ等）は');
  lines.push(' * 空配列を返し、呼び出し側で従来3択 [5, 7.5, 10] へフォールバックする。');
  lines.push(' *');
  lines.push(' * @param width パウチの幅（mm）');
  lines.push(' * @param gusset マチ（mm）');
  lines.push(' * @returns 利用可能なシール幅の配列（昇順）。該当なしの場合は空配列');
  lines.push(' */');
  lines.push('export function getAvailableSealWidths(width: number, gusset: number): number[] {');
  lines.push('  const set = new Set<number>();');
  lines.push('  for (const r of SEALING_RECORDS) {');
  lines.push('    if (r.width === width && r.gusset === gusset) {');
  lines.push('      set.add(r.sealPair[0]);');
  lines.push('      set.add(r.sealPair[1]);');
  lines.push('    }');
  lines.push('  }');
  lines.push('  return [...set].sort((a, b) => a - b);');
  lines.push('}');
  return lines.join('\n') + '\n';
}

async function main() {
  const excelArg = process.argv[2];
  let raw = FALLBACK_RAW;
  let source = 'docs フォールバック（docs/quote/seal-width-and-gusset-logic.md 第6節）';

  if (excelArg) {
    const excelData = await readFromExcel(excelArg);
    if (excelData && excelData.length > 0) {
      raw = excelData;
      source = `Excel 直読み（${excelArg}）`;
    }
  }

  const items = buildRecords(raw);
  const output = generateSource(items);

  const outPath = path.resolve(__dirname, '..', 'src', 'lib', 'sealing-data.ts');
  fs.writeFileSync(outPath, output, 'utf8');

  console.log(`[info] データソース: ${source}`);
  console.log(`[info] 生成レコード数: ${items.length}（期待値: 78）`);
  console.log(`[ok]   ${outPath} を生成しました。`);
  if (items.length !== 78) {
    console.warn(`[warn] レコード数が 78 ではありません（${items.length}）。Excel データを確認してください。`);
  }
}

main().catch(err => {
  console.error('[error]', err);
  process.exit(1);
});
