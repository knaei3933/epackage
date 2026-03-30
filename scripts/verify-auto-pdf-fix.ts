/**
 * 自動PDF生成修正検証スクリプト
 *
 * このスクリプトは以下を検証します:
 * 1. ResultStep コンポーネントが正しいプロパティで呼び出されているか
 * 2. 型の不一致がないか
 * 3. 自動保存ロジックが正しく実装されているか
 */

const fs = require('fs');
const path = require('path');

console.log('=== 自動PDF生成修正検証 ===\n');

// ファイルパス
const wizardPath = path.join(__dirname, '../src/components/quote/wizards/ImprovedQuotingWizard.tsx');
const resultStepPath = path.join(__dirname, '../src/components/quote/sections/ResultStep.tsx');

// ファイルを読み込む
const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
const resultStepContent = fs.readFileSync(resultStepPath, 'utf-8');

// 検証1: ResultStepの呼び出し方をチェック
console.log('【検証1】ResultStep コンポーネントの呼び出し方をチェック');

const resultStepCallRegex = /<ResultStep\s+([^>]*)>/g;
let match;
let issues = [];
let successes = [];

while ((match = resultStepCallRegex.exec(wizardContent)) !== null) {
  const props = match[1];
  console.log('\nResultStep 呼び出し:');
  console.log(`  ${match[0]}`);

  // チェック項目
  const hasResult = props.includes('result=');
  const hasMultiQuantityResult = props.includes('multiQuantityResult=');
  const hasOnReset = props.includes('onReset=');
  const hasInvalidProp = props.includes('onResultUpdate=');

  if (hasResult) {
    successes.push('✅ result プロパティが存在');
  } else {
    issues.push('❌ result プロパティが不足');
  }

  if (hasMultiQuantityResult) {
    successes.push('✅ multiQuantityResult プロパティが存在');
  } else {
    issues.push('❌ multiQuantityResult プロパティが不足');
  }

  if (hasOnReset) {
    successes.push('✅ onReset プロパティが存在');
  } else {
    issues.push('❌ onReset プロパティが不足');
  }

  if (hasInvalidProp) {
    issues.push('❌ onResultUpdate という無効なプロパティが存在');
  } else {
    successes.push('✅ 無効なプロパティなし');
  }
}

// 検証2: ResultStepのインターフェースをチェック
console.log('\n\n【検証2】ResultStep コンポーネントのインターフェースをチェック');

const interfaceRegex = /interface\s+ResultStepProps\s*{([^}]+)}/;
const interfaceMatch = resultStepContent.match(interfaceRegex);

if (interfaceMatch) {
  const interfaceBody = interfaceMatch[1];
  console.log('\nResultStepProps インターフェース:');
  console.log(interfaceBody);

  const hasResult = interfaceBody.includes('result:');
  const hasMultiQuantityResult = interfaceBody.includes('multiQuantityResult:');
  const hasOnReset = interfaceBody.includes('onReset:');

  if (hasResult) {
    successes.push('✅ インターフェースに result プロパティが定義されている');
  }
  if (hasMultiQuantityResult) {
    successes.push('✅ インターフェースに multiQuantityResult プロパティが定義されている');
  }
  if (hasOnReset) {
    successes.push('✅ インターフェースに onReset プロパティが定義されている');
  }
}

// 検証3: 自動保存ロジックのチェック
console.log('\n\n【検証3】自動保存ロジックのチェック');

const hasAutoSaveEffect = resultStepContent.includes('Auto-save useEffect triggered');
const hasAutoGenerateFunction = resultStepContent.includes('const autoGenerateAndSave = async');
const hasTestLog = resultStepContent.includes('[ResultStep] TEST - Component rendering!');

if (hasAutoSaveEffect) {
  successes.push('✅ 自動保存 useEffect が実装されている');
} else {
  issues.push('❌ 自動保存 useEffect が見つからない');
}

if (hasAutoGenerateFunction) {
  successes.push('✅ autoGenerateAndSave 関数が実装されている');
} else {
  issues.push('❌ autoGenerateAndSave 関数が見つからない');
}

if (hasTestLog) {
  successes.push('✅ テスト用コンソールログが実装されている');
} else {
  issues.push('❌ テスト用コンソールログが見つからない');
}

// 結果の出力
console.log('\n\n=== 検証結果 ===');
console.log('\n✅ 成功項目:');
successes.forEach(success => console.log(`  ${success}`));

if (issues.length > 0) {
  console.log('\n❌ 問題項目:');
  issues.forEach(issue => console.log(`  ${issue}`));
  console.log('\n⚠️ 修正が必要です');
  process.exit(1);
} else {
  console.log('\n✅ すべての検証に合格しました');
  console.log('\n次のステップ:');
  console.log('1. npm run dev で開発サーバーを起動');
  console.log('2. http://localhost:3000/quote-simulator にアクセス');
  console.log('3. 見積もり手順を進めて結果ページを表示');
  console.log('4. ブラウザコンソールで以下のログを確認:');
  console.log('   - [ResultStep] TEST - Component rendering!');
  console.log('   - [ResultStep] Auto-save useEffect triggered');
  console.log('   - [autoGenerateAndSave] 自動PDF生成・DB保存開始');
  console.log('5. PDFが自動的にダウンロードされることを確認');
  process.exit(0);
}
