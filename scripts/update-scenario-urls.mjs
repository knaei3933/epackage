/**
 * シナリオファイルの一括更新スクリプト
 *
 * - localhost:3000 → localhost:3002
 * - admin@example.com → admin@test.epac.co.jp
 * - member@test.com → member@test.epac.co.jp
 * - TestAdmin123! → Admin1234!
 * - Test1234! → Member1234!
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 更新対象のディレクトリ（resultsは除外）
const SCENARIO_DIRS = [
  resolve(process.cwd(), 'docs/test-scenarios/homepage'),
  resolve(process.cwd(), 'docs/test-scenarios/member'),
  resolve(process.cwd(), 'docs/test-scenarios/admin'),
  resolve(process.cwd(), 'docs/test-scenarios/integration'),
];

// 置換ルール
const REPLACEMENTS = [
  [/localhost:3000/g, 'localhost:3002'],
  [/admin@example\.com/g, 'admin@test.epac.co.jp'],
  [/member@test\.com/g, 'member@test.epac.co.jp'],
  [/TestAdmin123!/g, 'Admin1234!'],
  [/Test1234!/g, 'Member1234!'],
];

async function updateScenarioFiles() {
  console.log('=== シナリオファイル一括更新 ===\n');

  let updatedCount = 0;
  let skippedCount = 0;

  for (const dir of SCENARIO_DIRS) {
    // ディレクトリ内の.mdファイルを検索
    const files = await glob(`${dir}/*.md`, { windowsPathsNoEscape: true });

    for (const file of files) {
      // resultsディレクトリのファイルはスキップ
      if (file.includes('/results/')) {
        skippedCount++;
        continue;
      }

      try {
        let content = readFileSync(file, 'utf-8');
        let modified = false;

        // 各置換ルールを適用
        for (const [pattern, replacement] of REPLACEMENTS) {
          const newContent = content.replace(pattern, replacement);
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }

        if (modified) {
          writeFileSync(file, content, 'utf-8');
          console.log(`✅ 更新: ${file}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ エラー: ${file}`, error.message);
      }
    }
  }

  console.log(`\n=== 完了 ===`);
  console.log(`更新: ${updatedCount}ファイル`);
  console.log(`スキップ: ${skippedCount}ファイル`);
}

updateScenarioFiles().catch(console.error);
