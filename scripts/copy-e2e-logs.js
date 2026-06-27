/**
 * E2Eテスト結果ログ保存スクリプト
 *
 * Playwright の JSON レポート (test-results/test-results.json) を
 * .omc/logs/e2e-results-{YYYYMMDD-HHmm}.json にコピーして履歴を保持する。
 * `npm run test:e2e:logged` から呼び出される想定。
 *
 * 用途: テスト実行結果の時系列トレンドを追跡し、CI/ローカルでの
 * リグレッション分析を可能にする。
 */

const fs = require('fs');
const path = require('path');

// =====================================================
// パス定義
// =====================================================

const projectRoot = path.resolve(__dirname, '..');
const sourceFile = path.join(projectRoot, 'test-results', 'test-results.json');
const logsDir = path.join(projectRoot, '.omc', 'logs');

// =====================================================
// メイン処理
// =====================================================

/**
 * 現在日時から YYYYMMDD-HHmm 形式のタイムスタンプ文字列を生成する。
 * @returns {string} 例: "20260628-1430"
 */
function buildTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${yyyy}${mm}${dd}-${hh}${min}`;
}

function main() {
  // ソースファイルが存在しない場合は警告して終了（非ゼロ終了しない）
  // ※ E2E が全失敗しても JSON レポートは生成される想定だが、
  //    reporter 設定不全等で欠落している可能性も考慮
  if (!fs.existsSync(sourceFile)) {
    console.warn(`[copy-e2e-logs] ソースファイルが存在しません: ${sourceFile}`);
    console.warn('[copy-e2e-logs] E2Eテストが未実行か、JSONレポートが生成されていません。スキップします。');
    return;
  }

  // ログディレクトリを生成（既存の場合は noop）
  fs.mkdirSync(logsDir, { recursive: true });

  // タイムスタンプ付きファイル名でコピー
  const timestamp = buildTimestamp();
  const destFile = path.join(logsDir, `e2e-results-${timestamp}.json`);

  fs.copyFileSync(sourceFile, destFile);

  console.log(`[copy-e2e-logs] E2E結果ログを保存しました:`);
  console.log(`  ${destFile}`);
}

main();
