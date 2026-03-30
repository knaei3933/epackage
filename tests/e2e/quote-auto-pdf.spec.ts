import { test, expect } from '@playwright/test';

/**
 * 見積結果ページでの自動PDF生成検証E2Eテスト
 *
 * 目的: 見積結果ページで自動PDF生成が実行されない問題を調査・修正
 *
 * 検証項目:
 * 1. ブラウザを起動してquote-simulatorページに移動
 * 2. ログイン状態を確認・実行
 * 3. 見積もりを最後まで進める
 * 4. 見積結果ページで以下を確認:
 *    - コンソールに [ResultStep] TEST - Component rendering! が表示される
 *    - コンソールに [ResultStep] Auto-save useEffect triggered が表示される
 *    - コンソールに [autoGenerateAndSave] 自動PDF生成・DB保存開始 が表示される
 *    - PDFが自動的にダウンロードされる
 */

test.describe('見積結果ページ 自動PDF生成検証', () => {
  test.beforeEach(async ({ page, context }) => {
    // コンソールログを収集
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`[Browser Console] ${text}`);
    });

    // ダウンロードイベントをリッスン
    const downloads: string[] = [];
    context.on('download', download => {
      downloads.push(download.suggestedFilename());
      console.log(`[Download] ${download.suggestedFilename()}`);
    });

    // テストコンテキストに保存
    test.info().annotations.push({ type: 'console-logs', description: JSON.stringify(logs) });
    test.info().annotations.push({ type: 'downloads', description: JSON.stringify(downloads) });
  });

  test('自動PDF生成が実行されることを検証', async ({ page, context }) => {
    // 1. ブラウザを起動してquote-simulatorページに移動
    console.log('=== ステップ1: quote-simulatorページに移動 ===');
    await page.goto('/quote-simulator', { waitUntil: 'networkidle' });

    // ページが読み込まれたことを確認
    await expect(page.locator('body')).toBeVisible();

    // 2. ログイン状態を確認・実行
    console.log('=== ステップ2: ログイン状態を確認 ===');

    // ログインが必要かチェック
    const loginIndicator = page.locator('[data-testid="login-indicator"], .login-indicator');
    const isLoggedIn = await loginIndicator.count() > 0 && await loginIndicator.isVisible();

    if (!isLoggedIn) {
      // ログインページにリダイレクトされたかチェック
      const currentUrl = page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        console.log('ログインが必要です。ログインを実行します...');

        // ログインフォームを待機
        await page.waitForSelector('input[name="email"], input[type="email"], input[placeholder*="メール"]', { timeout: 5000 });

        // ログイン情報を入力
        const emailInput = page.locator('input[name="email"], input[type="email"], input[placeholder*="メール"]').first();
        await emailInput.fill('admin@epackage-lab.com');

        const passwordInput = page.locator('input[name="password"], input[type="password"], input[placeholder*="パスワード"]').first();
        await passwordInput.fill('Admin123!');

        // ログインボタンをクリック
        const loginButton = page.locator('button:has-text("ログイン"), button:has-text("Login"), button[type="submit"]').first();
        await loginButton.click();

        // ログイン後、quote-simulatorページに戻る
        await page.waitForURL(/\/quote-simulator/, { timeout: 10000 });
        console.log('ログイン成功');
      }
    } else {
      console.log('既にログイン済みです');
    }

    // 3. 見積もりを最後まで進める
    console.log('=== ステップ3: 見積もり手順を進める ===');

    // 基本仕様ステップ: 製品タイプを選択（平袋）
    const flatPouchOption = page.locator('[data-testid="bag-type-flat_pouch"], label:has-text("平袋")');
    await expect(flatPouchOption).toBeVisible({ timeout: 10000 });
    await flatPouchOption.click();
    console.log('製品タイプを選択: 平袋');

    // 内容物を入力
    const contentsInput = page.locator('input[name="contents"], [data-testid="input-contents"]');
    await contentsInput.fill('テスト製品');
    console.log('内容物を入力');

    // 主成分を入力
    const ingredientInput = page.locator('input[name="ingredient"], [data-testid="input-ingredient"]');
    await ingredientInput.fill('テスト成分');
    console.log('主成分を入力');

    // 流通環境を選択
    const distributionSelect = page.locator('select[name="distribution"], [data-testid="select-distribution"]');
    await distributionSelect.selectOption({ label: '常温' });
    console.log('流通環境を選択: 常温');

    // サイズを入力
    const widthInput = page.locator('input[name="width"], [data-testid="input-width"]');
    await widthInput.fill('150');
    console.log('幅を入力: 150mm');

    const heightInput = page.locator('input[name="height"], [data-testid="input-height"]');
    await heightInput.fill('200');
    console.log('高さを入力: 200mm');

    const depthInput = page.locator('input[name="depth"], [data-testid="input-depth"]');
    await depthInput.fill('30');
    console.log('マチを入力: 30mm');

    // SKU数量を入力
    const quantityInput = page.locator('input[name="quantity"], [data-testid="input-quantity"]').first();
    await quantityInput.fill('10000');
    console.log('数量を入力: 10,000個');

    // 計算が完了するまで待機
    await page.waitForTimeout(1000);

    // 次へボタンをクリックして後加工ステップへ
    const nextButton1 = page.locator('button:has-text("次へ"), button:has-text("Next")').first();
    await nextButton1.click();
    console.log('後加工ステップへ移動');

    // 後加工ステップが表示されるまで待機
    await page.waitForTimeout(500);

    // 次へボタンをクリックしてSKU数量ステップへ
    const nextButton2 = page.locator('button:has-text("次へ"), button:has-text("Next")').first();
    await nextButton2.click();
    console.log('SKU数量ステップへ移動');

    // SKU数量ステップが表示されるまで待機
    await page.waitForTimeout(500);

    // 次へボタンをクリックして見積結果ページへ
    const nextButton3 = page.locator('button:has-text("次へ"), button:has-text("Next")').first();
    await nextButton3.click();
    console.log('見積結果ページへ移動');

    // 見積結果ページが表示されるまで待機
    await page.waitForTimeout(2000);

    // 4. 見積結果ページで確認事項を検証
    console.log('=== ステップ4: 見積結果ページを検証 ===');

    // コンソールログを収集
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // 結果ページが表示されていることを確認
    const resultPage = page.locator('[data-testid="result-page"], .result-page, h1:has-text("見積結果")');
    await expect(resultPage).toBeVisible({ timeout: 5000 });
    console.log('見積結果ページが表示されました');

    // コンソールログから重要なメッセージを抽出
    await page.waitForTimeout(3000); // コンソールログが収集されるまで待機

    const hasTestLog = consoleLogs.some(log => log.includes('[ResultStep] TEST - Component rendering!'));
    const hasAutoSaveLog = consoleLogs.some(log => log.includes('[ResultStep] Auto-save useEffect triggered'));
    const hasAutoGenerateLog = consoleLogs.some(log => log.includes('[autoGenerateAndSave] 自動PDF生成・DB保存開始'));

    console.log('=== コンソールログ検証結果 ===');
    console.log(`[ResultStep] TEST - Component rendering!: ${hasTestLog ? '✅ 検出' : '❌ 未検出'}`);
    console.log(`[ResultStep] Auto-save useEffect triggered: ${hasAutoSaveLog ? '✅ 検出' : '❌ 未検出'}`);
    console.log(`[autoGenerateAndSave] 自動PDF生成・DB保存開始: ${hasAutoGenerateLog ? '✅ 検出' : '❌ 未検出'}`);

    // 各ログが表示されていることをアサート
    expect(hasTestLog, '[ResultStep] TEST - Component rendering! が表示されません').toBe(true);
    expect(hasAutoSaveLog, '[ResultStep] Auto-save useEffect triggered が表示されません').toBe(true);
    expect(hasAutoGenerateLog, '[autoGenerateAndSave] 自動PDF生成・DB保存開始 が表示されません').toBe(true);

    // 5. PDFダウンロードを検証
    console.log('=== ステップ5: PDFダウンロードを検証 ===');

    // ダウンロードを待機
    let downloadFound = false;
    let downloadedFile = '';

    try {
      const download = await page.waitForEvent('download', { timeout: 10000 });
      downloadFound = true;
      downloadedFile = download.suggestedFilename();
      console.log(`PDFダウンロードを検出: ${downloadedFile}`);

      // ファイル名がPDFであることを確認
      expect(downloadedFile.toLowerCase()).toContain('.pdf');
    } catch (error) {
      console.log('PDFダウンロードが検出されませんでした');
      console.log('エラー詳細:', error);
    }

    expect(downloadFound, 'PDFが自動的にダウンロードされませんでした').toBe(true);

    console.log('=== テスト完了 ===');
  });

  test('結果ステップの詳細を調査', async ({ page }) => {
    // テスト用に簡略化された手順で結果ページへ
    await page.goto('/quote-simulator');

    // 基本入力
    const flatPouchOption = page.locator('[data-testid="bag-type-flat_pouch"], label:has-text("平袋")');
    await flatPouchOption.click();

    const contentsInput = page.locator('input[name="contents"], [data-testid="input-contents"]');
    await contentsInput.fill('テスト製品');

    const widthInput = page.locator('input[name="width"], [data-testid="input-width"]');
    await widthInput.fill('150');

    const heightInput = page.locator('input[name="height"], [data-testid="input-height"]');
    await heightInput.fill('200');

    const quantityInput = page.locator('input[name="quantity"], [data-testid="input-quantity"]').first();
    await quantityInput.fill('10000');

    await page.waitForTimeout(1000);

    // すべての次へボタンをクリックして結果ページへ
    for (let i = 0; i < 3; i++) {
      const nextButton = page.locator('button:has-text("次へ"), button:has-text("Next")').first();
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // 結果ページを待機
    await page.waitForTimeout(3000);

    // ページのHTMLスナップショットを取得
    const resultPageContent = await page.content();
    console.log('=== 結果ページのHTML構造 ===');
    console.log(resultPageContent.substring(0, 2000)); // 最初の2000文字を表示

    // ResultStepコンポーネントが存在するか確認
    const hasResultStep = resultPageContent.includes('ResultStep') || resultPageContent.includes('result-page');
    console.log(`ResultStepコンポーネントの存在: ${hasResultStep ? '✅' : '❌'}`);

    // コンソールログを確認
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    await page.waitForTimeout(2000);

    console.log('=== コンソールログ（詳細） ===');
    consoleLogs.forEach(log => console.log(`  ${log}`));
  });
});
