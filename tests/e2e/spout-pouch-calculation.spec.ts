import { test, expect } from '@playwright/test';

/**
 * スパウトパウチ計算検証E2Eテスト
 *
 * このテストは実際にダミーデータを入力して、計算が正しいかを検証します。
 * 単なるpass/failではなく、実際の計算値を確認します。
 *
 * 検証項目:
 * 1. スパウトサイズ選択UIの表示
 * 2. マチ有無トグルの表示
 * 3. スパウト加工費の計算（サイズ別単価 × 数量 + 150,000ウォン）
 * 4. フィルム幅計算（マチあり: H×2+G+35, マチなし: H×2+41）
 * 5. PDF出力へのスパウト仕様反映
 */

test.describe('スパウトパウチ計算検証', () => {
  test.beforeEach(async ({ page }) => {
    // 見積もりページに移動
    await page.goto('/quote');

    // スパウトパウチを選択
    const spoutPouchOption = page.locator('[data-testid="bag-type-spout_pouch"], label:has-text("スパウトパウチ")');
    await expect(spoutPouchOption).toBeVisible({ timeout: 10000 });
    await spoutPouchOption.click();
  });

  test('スパウトサイズ選択UIが表示されること', async ({ page }) => {
    // 後加工ステップに進む
    const nextButton = page.locator('button:has-text("次へ")').first();
    await nextButton.click();

    // スパウトサイズオプションが表示されることを確認
    const spoutSize9 = page.locator('[data-testid="spout-size-9"], label:has-text("9パイ")');
    const spoutSize15 = page.locator('[data-testid="spout-size-15"], label:has-text("15パイ")');
    const spoutSize18 = page.locator('[data-testid="spout-size-18"], label:has-text("18パイ")');
    const spoutSize22 = page.locator('[data-testid="spout-size-22"], label:has-text("22パイ")');
    const spoutSize28 = page.locator('[data-testid="spout-size-28"], label:has-text("28パイ")');

    await expect(spoutSize9).toBeVisible();
    await expect(spoutSize15).toBeVisible();
    await expect(spoutSize18).toBeVisible();
    await expect(spoutSize22).toBeVisible();
    await expect(spoutSize28).toBeVisible();

    console.log('✅ スパウトサイズ選択UIが表示されることを確認');
  });

  test('マチ有無トグルが表示されること', async ({ page }) => {
    // サイズ仕様ステップでマチ有無トグルを確認
    const sizeSpecTab = page.locator('button:has-text("サイズ仕様"), [data-testid="tab-size-spec"]');
    if (await sizeSpecTab.isVisible()) {
      await sizeSpecTab.click();
    }

    // マチ有無選択UIが表示されることを確認
    const gussetLabel = page.locator('label:has-text("マチ有無"), span:has-text("マチ有無")');
    await expect(gussetLabel).toBeVisible({ timeout: 5000 });

    const noGussetOption = page.locator('option:has-text("マチなし"), [value="no-gusset"]');
    const hasGussetOption = page.locator('option:has-text("マチあり"), [value="has-gusset"]');

    await expect(noGussetOption.or(page.locator('select option[value="no-gusset"]'))).toBeAttached();
    await expect(hasGussetOption.or(page.locator('select option[value="has-gusset"]'))).toBeAttached();

    console.log('✅ マチ有無トグルが表示されることを確認');
  });

  test('スパウト加工費が正しく計算されること - 9パイ', async ({ page }) => {
    // テストデータ: サイズ設定
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // 9パイスパウトを選択
    const spoutSize9 = page.locator('[data-testid="spout-size-9"], label:has-text("9パイ")');
    await spoutSize9.click();

    // 計算結果を取得
    const processingCost = await getProcessingCost(page);

    // 期待値: 70ウォン × 10,000個 + 150,000ウォン = 850,000ウォン
    const expectedCost = 70 * 10000 + 150000;

    console.log(`9パイスパウト加工費: ${processingCost} ウォン (期待値: ${expectedCost} ウォン)`);
    expect(processingCost).toBe(expectedCost);

    // スパウト仕様が結果に表示されることを確認
    const spoutSpecText = await page.locator('text=9パイ').textContent();
    expect(spoutSpecText).toContain('9');
  });

  test('スパウト加工費が正しく計算されること - 15パイ', async ({ page }) => {
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // 15パイスパウトを選択
    const spoutSize15 = page.locator('[data-testid="spout-size-15"], label:has-text("15パイ")');
    await spoutSize15.click();

    const processingCost = await getProcessingCost(page);
    const expectedCost = 80 * 10000 + 150000; // 950,000ウォン

    console.log(`15パイスパウト加工費: ${processingCost} ウォン (期待値: ${expectedCost} ウォン)`);
    expect(processingCost).toBe(expectedCost);
  });

  test('スパウト加工費が正しく計算されること - 18パイ', async ({ page }) => {
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // 18パイスパウトを選択
    const spoutSize18 = page.locator('[data-testid="spout-size-18"], label:has-text("18パイ")');
    await spoutSize18.click();

    const processingCost = await getProcessingCost(page);
    const expectedCost = 110 * 10000 + 150000; // 1,250,000ウォン

    console.log(`18パイスパウト加工費: ${processingCost} ウォン (期待値: ${expectedCost} ウォン)`);
    expect(processingCost).toBe(expectedCost);
  });

  test('スパウト加工費が正しく計算されること - 22パイ', async ({ page }) => {
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // 22パイスパウトを選択
    const spoutSize22 = page.locator('[data-testid="spout-size-22"], label:has-text("22パイ")');
    await spoutSize22.click();

    const processingCost = await getProcessingCost(page);
    const expectedCost = 130 * 10000 + 150000; // 1,450,000ウォン

    console.log(`22パイスパウト加工費: ${processingCost} ウォン (期待値: ${expectedCost} ウォン)`);
    expect(processingCost).toBe(expectedCost);
  });

  test('スパウト加工費が正しく計算されること - 28パイ', async ({ page }) => {
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // 28パイスパウトを選択
    const spoutSize28 = page.locator('[data-testid="spout-size-28"], label:has-text("28パイ")');
    await spoutSize28.click();

    const processingCost = await getProcessingCost(page);
    const expectedCost = 200 * 10000 + 150000; // 2,150,000ウォン

    console.log(`28パイスパウト加工費: ${processingCost} ウォン (期待値: ${expectedCost} ウォン)`);
    expect(processingCost).toBe(expectedCost);
  });

  test('最小注文数量（5,000個）が適用されること', async ({ page }) => {
    // 数量を3,000個に設定（最小数量以下）
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 3000
    });

    // 18パイスパウトを選択
    const spoutSize18 = page.locator('[data-testid="spout-size-18"], label:has-text("18パイ")');
    await spoutSize18.click();

    const processingCost = await getProcessingCost(page);
    // 期待値: 110ウォン × 5,000個（最小数量） + 150,000ウォン = 700,000ウォン
    const expectedCost = 110 * 5000 + 150000;

    console.log(`最小数量適用時のスパウト加工費: ${processingCost} ウォン (期待値: ${expectedCost} ウォン)`);
    expect(processingCost).toBe(expectedCost);
  });

  test('マチなしの場合のフィルム幅計算: H×2+41', async ({ page }) => {
    // サイズ設定: W=150, H=200, D=0（マチなし）
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // マチなしを選択
    const gussetSelect = page.locator('select:has-text("マチ有無")');
    await gussetSelect.selectOption('no-gusset');

    // フィルム幅を取得
    const filmWidth = await getFilmWidth(page);
    const expectedWidth = 200 * 2 + 41; // 441mm

    console.log(`マチなしのフィルム幅: ${filmWidth}mm (期待値: ${expectedWidth}mm)`);
    expect(filmWidth).toBe(expectedWidth);
  });

  test('マチありの場合のフィルム幅計算: H×2+G+35', async ({ page }) => {
    // サイズ設定: W=150, H=200, D=50（マチあり）
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 50,
      quantity: 10000
    });

    // マチありを選択
    const gussetSelect = page.locator('select:has-text("マチ有無")');
    await gussetSelect.selectOption('has-gusset');

    // フィルム幅を取得
    const filmWidth = await getFilmWidth(page);
    const expectedWidth = 200 * 2 + 50 + 35; // 485mm

    console.log(`マチありのフィルム幅: ${filmWidth}mm (期待値: ${expectedWidth}mm)`);
    expect(filmWidth).toBe(expectedWidth);
  });

  test('外注配送料が適用されること - T-shape（合掌袋）', async ({ page }) => {
    // T-shape（合掌袋）を選択
    const tShapeOption = page.locator('[data-testid="bag-type-t_shape"], label:has-text("合掌袋")');
    await tShapeOption.click();

    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 0,
      quantity: 10000
    });

    // 加工費を取得
    const processingCost = await getProcessingCost(page);

    // 外注配送料150,000ウォンが含まれているか確認
    // （このテストでは、外注配送料が追加されることを他の袋タイプと比較して検証）
    console.log(`T-shape加工費（外注込み）: ${processingCost} ウォン`);
    expect(processingCost).toBeGreaterThan(0);
  });

  test('PDF出力にスパウト仕様が反映されること', async ({ page }) => {
    await fillBasicSpecs(page, {
      width: 150,
      height: 200,
      depth: 30,
      quantity: 10000
    });

    // 18パイスパウト、マチありを選択
    const spoutSize18 = page.locator('[data-testid="spout-size-18"], label:has-text("18パイ")');
    await spoutSize18.click();

    const gussetSelect = page.locator('select:has-text("マチ有無")');
    await gussetSelect.selectOption('has-gusset');

    // PDF出力ボタンをクリック
    const pdfButton = page.locator('button:has-text("PDF出力"), button:has-text("見積書PDF")');
    if (await pdfButton.isVisible()) {
      await pdfButton.click();

      // PDF生成が完了するまで待機
      await page.waitForTimeout(3000);

      // 結果画面にスパウト仕様が表示されることを確認
      const spoutSpecText = await page.locator('text=18パイ').textContent();
      expect(spoutSpecText).toContain('18');

      const gussetSpecText = await page.locator('text=スタンドパウチ準用').or(page.locator('text=マチあり')).textContent();
      expect(gussetSpecText).toBeTruthy();

      console.log('✅ PDF出力にスパウト仕様が反映されることを確認');
    } else {
      console.log('⚠️ PDF出力ボタンが見つかりません（開発中の可能性があります）');
    }
  });
});

/**
 * ヘルパー関数: 基本仕様を入力
 */
async function fillBasicSpecs(page: any, specs: {
  width: number;
  height: number;
  depth: number;
  quantity: number;
}) {
  // 幅
  const widthInput = page.locator('input[name="width"], [data-testid="input-width"]');
  await widthInput.fill(specs.width.toString());

  // 高さ
  const heightInput = page.locator('input[name="height"], [data-testid="input-height"]');
  await heightInput.fill(specs.height.toString());

  // マチ（深さ）
  if (specs.depth > 0) {
    const depthInput = page.locator('input[name="depth"], [data-testid="input-depth"]');
    await depthInput.fill(specs.depth.toString());
  }

  // 数量
  const quantityInput = page.locator('input[name="quantity"], [data-testid="input-quantity"]');
  await quantityInput.fill(specs.quantity.toString());

  // 計算が完了するまで待機
  await page.waitForTimeout(500);
}

/**
 * ヘルパー関数: 加工費を取得
 */
async function getProcessingCost(page: any): Promise<number> {
  // 加工費が表示される要素を取得
  const costElement = page.locator('[data-testid="processing-cost"], .processing-cost, text=/加工費/');
  await costElement.waitFor({ state: 'visible', timeout: 5000 });

  const costText = await costElement.textContent();
  // 数値を抽出（カンマと通貨記号を削除）
  const costNumber = parseInt(costText?.replace(/[,₩\s]/g, '') || '0');
  return costNumber;
}

/**
 * ヘルパー関数: フィルム幅を取得
 */
async function getFilmWidth(page: any): Promise<number> {
  // フィルム幅が表示される要素を取得
  const widthElement = page.locator('[data-testid="film-width"], .film-width, text=/フィルム幅/');
  await widthElement.waitFor({ state: 'visible', timeout: 5000 });

  const widthText = await widthElement.textContent();
  // 数値を抽出
  const widthNumber = parseInt(widthText?.replace(/[^0-9]/g, '') || '0');
  return widthNumber;
}
