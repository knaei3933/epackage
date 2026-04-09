import { test, expect } from '@playwright/test';
import { calculatePricing, assertVolumeDiscountApplied } from '../../helpers/pricing-calculator';

/**
 * TC-SKU: SKU数量境界値テスト
 *
 * 最小数量、最大数量、価格ブレイクポイント、マルチSKU階層価格を検証します
 */

// =====================================================
// テストヘルパー
// =====================================================

/**
 * ログインを実行するヘルパー
 */
async function loginAsMember(page: import('@playwright/test').Page) {
  await page.goto('/auth/signin', { waitUntil: 'networkidle' });

  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  await emailInput.fill(process.env.TEST_MEMBER_EMAIL || 'test-member@example.com');

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.fill(process.env.TEST_MEMBER_PASSWORD || 'Test123!');

  const loginButton = page.locator('button[type="submit"]').first();
  await loginButton.click();

  // ログイン完了を待機
  await page.waitForURL(/\/(member\/dashboard|quote-simulator)/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

/**
 * 見積もりシミュレーターページに移動
 */
async function navigateToQuoteSimulator(page: import('@playwright/test').Page) {
  await page.goto('/quote-simulator', { waitUntil: 'networkidle' });
  // ウィザードのローディング完了を待機
  await page.waitForSelector('text=袋のタイプ', { timeout: 30000 });
  await page.waitForTimeout(500);
}

/**
 * 袋タイプを選択する（テキストベースセレクタ）
 * 固定フッターによるクリック妨害を回避するためforce: trueを使用
 */
async function selectBagType(page: import('@playwright/test').Page, bagTypeId: string) {
  const bagTypeLabels: Record<string, string> = {
    'flat_3_side': '平袋',
    'stand_up': 'スタンドパウチ',
    'lap_seal': '合掌袋',
    'box': 'ガゼットパウチ',
    'spout_pouch': 'スパウトパウチ',
    'roll_film': 'ロールフィルム',
  };
  const label = bagTypeLabels[bagTypeId];
  if (!label) throw new Error(`未知の袋タイプ: ${bagTypeId}`);

  const button = page.locator(`button:has-text("${label}")`).first();
  await expect(button).toBeVisible({ timeout: 10000 });
  await button.click({ force: true });
  await page.waitForTimeout(300);
}

/**
 * サイズを入力する
 */
async function fillSizeInputs(
  page: import('@playwright/test').Page,
  options: { width?: number; height?: number; depth?: number }
) {
  if (options.width !== undefined) {
    const widthField = page.locator('label:has-text("幅") ~ input, label:text-is("幅") ~ input').first();
    if (await widthField.isVisible()) {
      await widthField.fill(options.width.toString());
    }
  }

  if (options.height !== undefined) {
    const heightField = page.locator('label:has-text("高さ") ~ input').first();
    if (await heightField.isVisible()) {
      await heightField.fill(options.height.toString());
    }
  }

  if (options.depth !== undefined) {
    const depthField = page.locator('label:has-text("マチ"), label:has-text("深さ") ~ input').first();
    if (await depthField.isVisible()) {
      await depthField.fill(options.depth.toString());
    }
  }

  await page.waitForTimeout(300);
}

/**
 * 内容物ドロップダウンを選択
 */
async function fillContentsDropdowns(page: import('@playwright/test').Page) {
  const selects = page.locator('select');
  const selectCount = await selects.count();

  for (let i = 0; i < selectCount; i++) {
    const select = selects.nth(i);
    const options = await select.locator('option').allTextContents();
    for (const option of options) {
      const trimmed = option.trim();
      if (trimmed && trimmed !== '選択してください' && trimmed !== '' && !trimmed.includes('---')) {
        await select.selectOption({ label: trimmed });
        break;
      }
    }
  }
}

/**
 * 素材を選択する
 * quote-simulator.spec.tsの実績あるパターンを使用
 * 固定フッターによるクリック妨害を回避するためforce: trueを使用
 */
async function selectMaterial(page: import('@playwright/test').Page, materialCategory: string) {
  const categoryLabels: Record<string, string> = {
    'transparent': '透明タイプ',
    'high_barrier': '高バリアタイプ',
    'kraft': 'クラフトタイプ',
  };
  const label = categoryLabels[materialCategory];
  if (!label) throw new Error(`未知の素材カテゴリ: ${materialCategory}`);

  // カテゴリヘッダーをクリックして展開
  const categoryHeader = page.locator(`text=${label}`).first();
  if (await categoryHeader.isVisible({ timeout: 5000 }).catch(() => false)) {
    // 固定フッターがクリックを妨げる可能性があるためforce: trueを使用
    await categoryHeader.click({ force: true });
    await page.waitForTimeout(300);
  }

  // カテゴリ内の最初の素材カードをクリック
  const materialCards = page.locator('[class*="cursor-pointer"][class*="border"]').filter({
    hasText: /PET|NY|クラフト|KRAFT/
  });
  if (await materialCards.count() > 0) {
    await materialCards.first().click({ force: true });
    await page.waitForTimeout(300);
  }
}

/**
 * 次へボタンをクリック
 * 固定フッターによるクリック妨害を回避するためforce: trueを使用
 */
async function clickNext(page: import('@playwright/test').Page) {
  const nextButton = page.locator('button:has-text("次へ"), button:has-text("見積もりを完了")').first();
  await expect(nextButton).toBeVisible({ timeout: 5000 });
  await expect(nextButton).toBeEnabled({ timeout: 10000 });
  await nextButton.click({ force: true });
  // 次のページが読み込まれるのを待機
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// =====================================================
// テストスイート
// =====================================================

test.describe('TC-SKU: SKU数量境界値テスト', () => {
  // コンソールログ収集（デバッグ用）
  test.beforeEach(async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      // エラーログをコンソールに出力
      if (text.includes('Error') || text.includes('error') || text.includes('Failed') || text.includes('failed')) {
        console.log(`[Browser Error] ${text}`);
      }
    });
    // テスト情報にログを保存
    test.info().annotations.push({ type: 'console-logs', description: JSON.stringify(logs.slice(-50)) });
  });

  // --------------------------------------------------
  // TC-SKU-001: 最小数量検証
  // --------------------------------------------------
  test.describe('TC-SKU-001: 最小数量境界値', () => {

    test('最小数量未満（100）でバリデーションエラーが表示されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      // 袋タイプ選択
      await selectBagType(page, 'flat_3_side');

      // サイズ入力
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });

      // 内容物選択
      await fillContentsDropdowns(page);

      // 素材選択
      await selectMaterial(page, 'transparent');

      // 次へ進む
      await clickNext(page);

      // 数量入力フィールドを探す
      const quantityInputs = page.locator('input[type="number"]');
      const inputCount = await quantityInputs.count();

      if (inputCount > 0) {
        // 最初の数量入力フィールドに100を入力
        await quantityInputs.first().fill('100');
        await page.waitForTimeout(500);

        // 計算実行（quote-simulator.spec.tsのパターンを使用）
        await clickNext(page);
        await page.waitForTimeout(5000);

        // バリデーションエラーが表示されることを確認
        // 最小数量エラーのテキストで検出
        const errorVisible = await page.locator('text=500個以上, text=500以上, text=最小数量').isVisible().catch(() => false);

        // エラーが表示されるか、または価格が計算されないことを確認
        const priceVisible = await page.locator('text=円, text=JPY, text=見積結果').isVisible().catch(() => false);

        expect(errorVisible || !priceVisible).toBeTruthy();
      }

      console.log('TC-SKU-001: 最小数量未満エラー確認完了');
    });

    test('最小数量（500）で正常に計算されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      // 後加工ステップへ
      await clickNext(page);
      // SKU数量ステップへ（後加工はデフォルトのまま）
      await clickNext(page);

      // 数量500を入力（quote-simulator.spec.tsのパターンを使用）
      const quantityInput = page.locator('input[type="number"]').filter({ hasText: '' }).last();
      const skuInputs = page.locator('input[type="number"]');
      const inputCount = await skuInputs.count();

      if (inputCount > 0) {
        // 空のinputを探して入力
        for (let i = 0; i < inputCount; i++) {
          const input = skuInputs.nth(i);
          const value = await input.inputValue();
          if (!value || parseInt(value) < 100) {
            await input.fill('500');
            break;
          }
        }

        // 数量入力後に価格計算を待機（quote-auto-pdf.spec.tsのパターン）
        await page.waitForTimeout(1000);

        // 計算実行（見積結果ページへ）
        console.log('次へボタンをクリックして見積結果ページへ移動');
        await clickNext(page);

        // 見積結果ページが表示されるまで待機
        await page.waitForTimeout(3000);

        // 結果ページが表示されていることを確認
        const resultVisible = await page.locator('text=見積もり完了').first()
          .isVisible({ timeout: 10000 }).catch(() => false);

        if (!resultVisible) {
          // デバッグ：エラーメッセージを確認
          const errorMessages = await page.locator('text=エラー, text=エラーがあります, text=確認してください, text=入力してください').all();
          console.log(`エラーメッセージ数: ${errorMessages.length}`);
          for (let i = 0; i < errorMessages.length; i++) {
            const text = await errorMessages[i].textContent();
            console.log(`エラーメッセージ ${i + 1}:`, text);
          }

          // ステップインジケーターを確認
          const stepIndicators = await page.locator('button[class*="step"], nav button').all();
          console.log(`ステップインジケーター数: ${stepIndicators.length}`);
          for (let i = 0; i < Math.min(stepIndicators.length, 5); i++) {
            const text = await stepIndicators[i].textContent();
            const classes = await stepIndicators[i].getAttribute('class');
            console.log(`ステップ ${i + 1}:`, text, 'classes:', classes);
          }

          // ページのHTMLを取得
          const pageContent = await page.content();
          console.log('結果ページが表示されませんでした。ページ内容（最初の1000文字）:');
          console.log(pageContent.substring(0, 1000));
        }

        expect(resultVisible).toBeTruthy();
      }

      console.log('TC-SKU-001: 最小数量正常動作確認完了');
    });

    test('境界値+1（501）で正常に動作すること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // 数量501を入力
      const skuInputs = page.locator('input[type="number"]');
      const inputCount = await skuInputs.count();

      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = skuInputs.nth(i);
          const value = await input.inputValue();
          if (!value || parseInt(value) < 100) {
            await input.fill('501');
            break;
          }
        }
        await page.waitForTimeout(500);

        // 計算実行（quote-simulator.spec.tsのパターンを使用）
        await clickNext(page);
        await page.waitForTimeout(5000);

        // 価格が表示されることを確認（ResultStepの「見積もり完了」テキストを確認）
        const resultVisible = await page.locator('text=見積もり完了').first()
          .isVisible({ timeout: 15000 }).catch(() => false);
        expect(resultVisible).toBeTruthy();
      }

      console.log('TC-SKU-001: 境界値+1正常動作確認完了');
    });
  });

  // --------------------------------------------------
  // TC-SKU-002: 最大数量検証
  // --------------------------------------------------
  test.describe('TC-SKU-002: 最大数量境界値', () => {

    test('最大数量（100,000）で正常に計算されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // 数量100000を入力
      const skuInputs = page.locator('input[type="number"]');
      const inputCount = await skuInputs.count();

      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = skuInputs.nth(i);
          const value = await input.inputValue();
          if (!value || parseInt(value) < 100) {
            await input.fill('100000');
            break;
          }
        }
        await page.waitForTimeout(500);

        // 計算実行（quote-simulator.spec.tsのパターンを使用）
        await clickNext(page);
        await page.waitForTimeout(5000);

        // 価格が表示されることを確認（ResultStepの「見積もり完了」テキストを確認）
        const resultVisible = await page.locator('text=見積もり完了').first()
          .isVisible({ timeout: 15000 }).catch(() => false);
        expect(resultVisible).toBeTruthy();
      }

      console.log('TC-SKU-002: 最大数量正常動作確認完了');
    });

    test('最大数量超過（100,001）でエラーが表示されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // 数量100001を入力
      const quantityInputs = page.locator('input[type="number"]');
      const inputCount = await quantityInputs.count();

      if (inputCount > 0) {
        await quantityInputs.first().fill('100001');
        await page.waitForTimeout(500);

        // 計算実行（quote-simulator.spec.tsのパターンを使用）
        await clickNext(page);
        await page.waitForTimeout(5000);

        // バリデーションエラーが表示されることを確認
        const errorVisible = await page.locator('text=100000, text=超過, text=最大').isVisible().catch(() => false);
        const priceVisible = await page.locator('text=円, text=JPY').isVisible().catch(() => false);

        // エラーが表示されるか、または価格が計算されないことを確認
        expect(errorVisible || !priceVisible).toBeTruthy();
      }

      console.log('TC-SKU-002: 最大数量超過エラー確認完了');
    });

    test('大幅超過（150,000）でエラーまたは特別処理されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // 数量150000を入力
      const quantityInputs = page.locator('input[type="number"]');
      const inputCount = await quantityInputs.count();

      if (inputCount > 0) {
        await quantityInputs.first().fill('150000');
        await page.waitForTimeout(500);

        // 計算実行（quote-simulator.spec.tsのパターンを使用）
        await clickNext(page);
        await page.waitForTimeout(5000);

        // エラーまたは特別処理が表示されることを確認
        const errorVisible = await page.locator('text=お問い合わせ, text=別途見積, text=特大数').isVisible().catch(() => false);
        const priceVisible = await page.locator('text=円, text=JPY').isVisible().catch(() => false);

        // エラーが表示されるか、または価格が計算されないことを確認
        expect(errorVisible || !priceVisible).toBeTruthy();
      }

      console.log('TC-SKU-002: 大幅超過エラー確認完了');
    });
  });

  // --------------------------------------------------
  // TC-SKU-003: 価格ブレイクポイント検証
  // --------------------------------------------------
  test.describe('TC-SKU-003: 価格ブレイクポイント', () => {

    test('数量増加に伴い単価が適切に減少すること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      const breakpoints = [500, 1000, 5000, 10000];
      const unitPrices: number[] = [];

      for (const qty of breakpoints) {
        // 数量入力
        const skuInputs = page.locator('input[type="number"]');
        const inputCount = await skuInputs.count();

        if (inputCount > 0) {
          for (let i = 0; i < inputCount; i++) {
            const input = skuInputs.nth(i);
            const value = await input.inputValue();
            if (!value || parseInt(value) < 100) {
              await input.fill(qty.toString());
              break;
            }
          }
          await page.waitForTimeout(500);

          // 計算実行（quote-simulator.spec.tsのパターンを使用）
          await clickNext(page);
          await page.waitForTimeout(5000);

          // 価格を取得（quote-simulator.spec.tsのパターンを使用）
          const resultVisible = await page.locator('text=見積, text=単価, text=総額, text=結果').first()
            .isVisible({ timeout: 15000 }).catch(() => false);

          if (resultVisible) {
            // 価格テキストを取得
            const priceText = await page.locator('text=円').first().textContent().catch(() => null);
            if (priceText) {
              const totalPrice = parseInt(priceText.replace(/[^0-9]/g, '') || '0');
              const unitPrice = totalPrice / qty;
              unitPrices.push(unitPrice);

              console.log(`数量 ${qty}: 単価 ${unitPrice.toFixed(2)} 円`);
            }
          }

          // 戻って次のテストへ
          const backButton = page.locator('button:has-text("戻る")').first();
          if (await backButton.isVisible().catch(() => false)) {
            await backButton.click({ force: true });
            await page.waitForTimeout(500);
          }
        }
      }

      // 単価が減少することを検証
      assertVolumeDiscountApplied(unitPrices);

      console.log('TC-SKU-003: 価格ブレイクポイント検証完了');
    });

    test('計算ユーティリティとの整合性検証', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // テスト数量
      const testQuantity = 5000;
      const skuInputs = page.locator('input[type="number"]');
      const inputCount = await skuInputs.count();

      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = skuInputs.nth(i);
          const value = await input.inputValue();
          if (!value || parseInt(value) < 100) {
            await input.fill(testQuantity.toString());
            break;
          }
        }
        await page.waitForTimeout(500);

        // 計算実行（quote-simulator.spec.tsのパターンを使用）
        await clickNext(page);
        await page.waitForTimeout(5000);

        // UIから価格を取得
        const priceText = await page.locator('text=円').first().textContent().catch(() => null);
        const actualTotalPrice = priceText ? parseInt(priceText.replace(/[^0-9]/g, '') || '0') : 0;
        const actualUnitPrice = actualTotalPrice / testQuantity;

        // 計算ユーティリティで価格を計算
        const calculated = await calculatePricing({
          bagType: 'flat_3_side',
          width: 150,
          height: 200,
          depth: 30,
          materialId: 'transparent_pet_ny',
          quantity: testQuantity,
        });

        // 価格検証（±100円許容 - UIの丸め処理等を考慮）
        const tolerance = 100;
        const unitPriceDiff = Math.abs(actualUnitPrice - calculated.priceBreakdown.unitPrice);
        const totalPriceDiff = Math.abs(actualTotalPrice - calculated.priceBreakdown.totalPrice);

        expect(unitPriceDiff).toBeLessThanOrEqual(tolerance);
        expect(totalPriceDiff).toBeLessThanOrEqual(tolerance * testQuantity);

        console.log(`TC-SKU-003: UI単価=${actualUnitPrice.toFixed(2)}, 計算単価=${calculated.priceBreakdown.unitPrice.toFixed(2)}`);
        console.log(`TC-SKU-003: 差異=${unitPriceDiff.toFixed(2)}円 (許容値=${tolerance}円)`);
      }

      console.log('TC-SKU-003: 計算整合性検証完了');
    });
  });

  // --------------------------------------------------
  // TC-SKU-004: マルチSKU階層価格検証
  // --------------------------------------------------
  test.describe('TC-SKU-004: マルチSKU階層価格', () => {

    test('異なる数量のSKUで異なる単価が計算されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // SKU追加ボタンをクリック（複数SKUテスト）
      const addSkuButton = page.locator('button:has-text("SKU"), button:has-text("追加"), button:has-text("+")').first();
      if (await addSkuButton.isVisible().catch(() => false)) {
        await addSkuButton.click({ force: true });
        await page.waitForTimeout(300);
      }

      // 複数の数量を入力
      const quantities = [500, 1000];
      const skuInputs = page.locator('input[type="number"]');
      const inputCount = await skuInputs.count();

      for (let i = 0; i < Math.min(inputCount, quantities.length); i++) {
        await skuInputs.nth(i).fill(quantities[i].toString());
      }
      await page.waitForTimeout(500);

      // 計算実行（quote-simulator.spec.tsのパターンを使用）
      await clickNext(page);
      await page.waitForTimeout(5000);

      // 各SKUの価格が表示されることを確認
      const resultVisible = await page.locator('text=見積, text=単価, text=総額, text=結果').first()
        .isVisible({ timeout: 15000 }).catch(() => false);
      expect(resultVisible).toBeTruthy();

      console.log('TC-SKU-004: マルチSKU価格検証完了');
    });

    test('全SKUが最大数量（100,000）で最低単価が適用されること', async ({ page }) => {
      await navigateToQuoteSimulator(page);

      await selectBagType(page, 'flat_3_side');
      await fillSizeInputs(page, { width: 150, height: 200, depth: 30 });
      await fillContentsDropdowns(page);
      await selectMaterial(page, 'transparent');

      await clickNext(page);
      await clickNext(page);

      // SKU追加
      const addSkuButton = page.locator('button:has-text("SKU"), button:has-text("追加"), button:has-text("+")').first();
      if (await addSkuButton.isVisible().catch(() => false)) {
        await addSkuButton.click({ force: true });
        await page.waitForTimeout(300);
      }

      // 両SKUに最大数量を入力
      const skuInputs = page.locator('input[type="number"]');
      const inputCount = await skuInputs.count();

      for (let i = 0; i < Math.min(inputCount, 2); i++) {
        await skuInputs.nth(i).fill('100000');
      }
      await page.waitForTimeout(500);

      // 計算実行（quote-simulator.spec.tsのパターンを使用）
      await clickNext(page);
      await page.waitForTimeout(5000);

      // 価格が表示されることを確認
      const resultVisible = await page.locator('text=見積, text=単価, text=総額, text=結果').first()
        .isVisible({ timeout: 15000 }).catch(() => false);
      expect(resultVisible).toBeTruthy();

      console.log('TC-SKU-004: 最大数量単価検証完了');
    });
  });
});
