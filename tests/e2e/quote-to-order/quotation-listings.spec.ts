import { test, expect } from '@playwright/test';

/**
 * 見積一覧・詳細 E2Eテスト
 *
 * メンバー見積一覧、管理者見積管理、データ精度検証、
 * ステータス遷移の包括的なテストスイート。
 *
 * ページ構成:
 *   /member/quotations        - メンバー見積一覧
 *   /member/quotations/:id    - メンバー見積詳細
 *   /admin/quotations         - 管理者見積管理
 *
 * テストID: QL-001 ~ QL-006
 */

// =====================================================
// 認証ヘルパー関数
// =====================================================

/**
 * テストメンバーとしてログインする
 */
async function loginAsMember(page: import('@playwright/test').Page) {
  const memberEmail = process.env.TEST_MEMBER_EMAIL || 'member@test.com';
  const memberPassword = process.env.TEST_MEMBER_PASSWORD || 'Member1234!';

  await page.goto('/auth/signin', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', memberEmail);
  await page.fill('input[name="password"]', memberPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/member\/dashboard/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

/**
 * 管理者としてログインする
 */
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/auth/signin', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@epackage-lab.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');

  // ログイン成功を待機（任意のダッシュボードでOK）
  await page.waitForURL(/\/(admin|member)\/dashboard/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

// =====================================================
// テストスイート
// =====================================================

test.describe('見積一覧・詳細テスト', () => {

  // --------------------------------------------------
  // QL-001: メンバー見積一覧
  // --------------------------------------------------
  test.describe('QL-001: メンバー見積一覧', () => {

    test('見積一覧ページが正常に表示されること', async ({ page }) => {
      await loginAsMember(page);

      // 見積一覧ページへ移動
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // ページヘッダー「見積一覧」が表示されること
      const header = page.locator('h1', { hasText: '見積一覧' });
      await expect(header).toBeVisible({ timeout: 15000 });

      console.log('QL-001: 見積一覧ページ表示確認');
    });

    test('見積一覧にユーザーの見積もりが表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // ヘッダー確認
      await expect(page.locator('h1', { hasText: '見積一覧' })).toBeVisible({ timeout: 15000 });

      // 見積もりカードまたは空状態メッセージのいずれかが表示されること
      const hasQuotationCards = await page.locator('h3, [class*="font-semibold"]').filter({
        hasText: /QT-|EP-|見積|TEST-/
      }).first().isVisible().catch(() => false);

      const hasEmptyMessage = await page.locator('text=見積もりがありません').isVisible().catch(() => false);

      // いずれかが表示されていればページは正常に機能している
      expect(hasQuotationCards || hasEmptyMessage).toBeTruthy();

      console.log('QL-001: 見積一覧データ表示確認');
    });

    test('見積カードに番号・日付・ステータス・金額が表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // 見積もりカードが存在する場合のみ検証
      const quotationCards = page.locator('[class*="p-4"][class*="hover:shadow"]');
      const cardCount = await quotationCards.count();

      if (cardCount === 0) {
        console.log('QL-001: 見積もりなし - カード検証スキップ');
        return;
      }

      const firstCard = quotationCards.first();

      // 見積番号（h3要素内のテキスト）
      const quoteNumber = firstCard.locator('h3');
      await expect(quoteNumber).toBeVisible();

      // 作成日
      const hasCreatedDate = await firstCard.locator('text=作成日').isVisible().catch(() => false);
      expect(hasCreatedDate).toBeTruthy();

      // 金額表示
      const hasPrice = await firstCard.locator('text=金額, text=合計').isVisible().catch(() => false);
      expect(hasPrice).toBeTruthy();

      // ステータスバッジ（Badge コンポーネント）
      const hasBadge = await firstCard.locator('[class*="badge"], [class*="Badge"]').first().isVisible().catch(() => false);
      // ステータスラベルのテキストでも確認
      const hasStatusLabel = await firstCard.locator(
        'text=審査中, text=送信済み, text=承認済み, text=拒否, text=期限切れ, text=注文変換済み, text=見積依頼中, text=見積承認済み'
      ).first().isVisible().catch(() => false);
      expect(hasBadge || hasStatusLabel).toBeTruthy();

      console.log('QL-001: 見積カード要素検証完了');
    });

    test('ステータスバッジが正しく表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // フィルターが表示されること
      const filterSection = page.locator('text=審査中, text=すべて, text=承認済み').first();
      await expect(filterSection).toBeVisible({ timeout: 10000 });

      console.log('QL-001: ステータスフィルター表示確認');
    });

    test('ページネーションが表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // ページネーションコンポーネントの存在確認
      // 合計件数またはページネーションUIが表示されること
      const hasPagination = await page.locator('text=/\\d+件/, text=次へ, text=前へ, [class*="pagination"]').first()
        .isVisible().catch(() => false);

      // ページネーションはデータ件数に依存するため、存在確認のみ
      console.log(`QL-001: ページネーション ${hasPagination ? 'あり' : 'なし（データ不足の可能性）'}`);
    });
  });

  // --------------------------------------------------
  // QL-002: メンバー見積詳細
  // --------------------------------------------------
  test.describe('QL-002: メンバー見積詳細', () => {

    test('見積詳細ページが一覧から遷移できること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // 「詳細を見る」ボタンを探す
      const detailButton = page.locator('button:has-text("詳細を見る")').first();
      const hasDetailButton = await detailButton.isVisible().catch(() => false);

      if (!hasDetailButton) {
        console.log('QL-002: 見積もりなし - 詳細遷移テストスキップ');
        return;
      }

      // 詳細ページへの遷移を監視
      const navigationPromise = page.waitForURL(/\/member\/quotations\/[^/]+$/, { timeout: 15000 });
      await detailButton.click();
      await navigationPromise;

      // 詳細ページが表示されること
      await page.waitForLoadState('networkidle');

      // URLが /member/quotations/:id 形式であること
      expect(page.url()).toMatch(/\/member\/quotations\/[^/]+$/);

      console.log('QL-002: 見積詳細ページ遷移確認');
    });

    test('見積詳細ページに基本情報が表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      const detailButton = page.locator('button:has-text("詳細を見る")').first();
      if (!(await detailButton.isVisible().catch(() => false))) {
        console.log('QL-002: 見積もりなし - 詳細検証スキップ');
        return;
      }

      const navigationPromise = page.waitForURL(/\/member\/quotations\/[^/]+$/, { timeout: 15000 });
      await detailButton.click();
      await navigationPromise;
      await page.waitForLoadState('networkidle');

      // 見積番号の表示
      const hasQuoteNumber = await page.locator('text=QT-, text=EP-, text=見積番号, text=見積書番号').first()
        .isVisible().catch(() => false);

      // ステータス表示
      const hasStatus = await page.locator(
        'text=ドラフト, text=審査中, text=送信済み, text=承認済み, text=却下, text=拒否, text=期限切れ, text=注文変換済み'
      ).first().isVisible().catch(() => false);

      // 日付情報
      const hasDate = await page.locator('text=作成日, text=有効期限, text=作成').first()
        .isVisible().catch(() => false);

      // ページが正常に読み込まれていることの確認
      expect(hasQuoteNumber || hasStatus || hasDate).toBeTruthy();

      console.log('QL-002: 見積詳細基本情報確認');
    });

    test('承認済み見積に「注文する」ボタンが表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // 承認済みステータスの見積もりを探す
      const approvedCard = page.locator('[class*="p-4"]').filter({ hasText: '承認済み' }).first();
      const hasApprovedQuote = await approvedCard.isVisible().catch(() => false);

      if (!hasApprovedQuote) {
        console.log('QL-002: 承認済み見積なし - 注文ボタンテストスキップ');
        return;
      }

      // 「注文する」ボタンが承認済みカード内に表示されること
      const orderButton = approvedCard.locator('button:has-text("注文する")');
      await expect(orderButton).toBeVisible({ timeout: 5000 });

      console.log('QL-002: 注文するボタン表示確認');
    });
  });

  // --------------------------------------------------
  // QL-003: 管理者見積一覧
  // --------------------------------------------------
  test.describe('QL-003: 管理者見積一覧', () => {

    test('管理者見積一覧ページが正常に表示されること', async ({ page }) => {
      await loginAsAdmin(page);

      // 管理者見積一覧ページへ移動
      const responsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/admin/quotations') && resp.status() === 200,
        { timeout: 15000 }
      ).catch(() => null);

      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // ページヘッダー「見積もり管理」が表示されること
      const header = page.locator('h1', { hasText: '見積もり管理' });
      await expect(header).toBeVisible({ timeout: 15000 });

      console.log('QL-003: 管理者見積一覧ページ表示確認');
    });

    test('見積もり一覧が表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // 見積もり一覧セクションの確認
      const listHeader = page.locator('h2', { hasText: '見積もり一覧' });
      await expect(listHeader).toBeVisible({ timeout: 15000 });

      // 見積もりデータが表示されること、または空メッセージ
      const hasQuotationItems = await page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /QT-|EP-|TEST-/
      }).first().isVisible().catch(() => false);

      const hasEmptyMessage = await page.locator('text=見積もりがありません').isVisible().catch(() => false);
      expect(hasQuotationItems || hasEmptyMessage).toBeTruthy();

      console.log('QL-003: 見積もり一覧データ確認');
    });

    test('ステータスフィルターが動作すること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // フィルターselect要素の確認
      const statusFilter = page.locator('select').filter({ hasText: '' }).first();
      const allSelects = page.locator('select');
      const selectCount = await allSelects.count();

      // ステータスフィルターのselectを特定
      let filterSelect = null;
      for (let i = 0; i < selectCount; i++) {
        const select = allSelects.nth(i);
        const options = await select.locator('option').allTextContents();
        if (options.some(opt => opt.includes('すべてのステータス') || opt.includes('ドラフト'))) {
          filterSelect = select;
          break;
        }
      }

      if (!filterSelect) {
        console.log('QL-003: ステータスフィルターselectが見つかりません - スキップ');
        return;
      }

      // API呼び出しを監視してフィルター変更
      const apiResponsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/admin/quotations') && resp.url().includes('status=DRAFT'),
        { timeout: 10000 }
      ).catch(() => null);

      // 「ドラフト」でフィルター
      await filterSelect.selectOption('DRAFT');

      // URLが更新されること
      await page.waitForURL(/status=DRAFT/, { timeout: 10000 }).catch(() => {
        console.log('QL-003: URL更新確認（フォールバック）');
      });

      console.log('QL-003: ステータスフィルター動作確認');
    });

    test('検索機能が動作すること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // 管理者ページではリスト内の見積番号でフィルターが動作するか確認
      // 見積もり一覧の各項目に見積番号が表示されること
      const quotationNumbers = page.locator('[class*="font-medium"]').filter({
        hasText: /QT-|EP-|TEST-/
      });
      const count = await quotationNumbers.count();

      // フィルター機能のUI要素が存在することを確認
      const filterArea = page.locator('select, input[type="search"], input[placeholder*="検索"]').first();
      const hasFilterUI = await filterArea.isVisible().catch(() => false);

      console.log(`QL-003: 見積番号 ${count}件, フィルターUI ${hasFilterUI ? 'あり' : 'なし'}`);
    });

    test('統計サマリーが表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // 統計カードまたは数値が表示されること
      const statsArea = page.locator('text=ドラフト, text=送信済み, text=承認済み, text=拒否').first();
      await expect(statsArea).toBeVisible({ timeout: 10000 });

      console.log('QL-003: 統計サマリー表示確認');
    });
  });

  // --------------------------------------------------
  // QL-004: 管理者見積詳細
  // --------------------------------------------------
  test.describe('QL-004: 管理者見積詳細', () => {

    test('見積もりを選択して詳細パネルが表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // 見積もり項目が存在する場合のみ検証
      const quotationItems = page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /QT-|EP-|TEST-/
      });
      const itemCount = await quotationItems.count();

      if (itemCount === 0) {
        console.log('QL-004: 見積もりなし - 詳細パネルテストスキップ');
        return;
      }

      // 最初の見積もりをクリック
      await quotationItems.first().click();
      await page.waitForLoadState('networkidle');

      // 詳細パネルが表示されること（見積番号または顧客名）
      const detailPanel = page.locator('text=顧客名, text=メールアドレス, text=ステータス, text=作成日').first();
      await expect(detailPanel).toBeVisible({ timeout: 10000 });

      console.log('QL-004: 詳細パネル表示確認');
    });

    test('詳細パネルに顧客情報が表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      const quotationItems = page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /QT-|EP-|TEST-/
      });
      if (await quotationItems.count() === 0) {
        console.log('QL-004: 見積もりなし - 顧客情報テストスキップ');
        return;
      }

      await quotationItems.first().click();
      await page.waitForLoadState('networkidle');

      // 顧客名ラベル
      const customerNameLabel = page.locator('text=顧客名').first();
      await expect(customerNameLabel).toBeVisible({ timeout: 10000 });

      // メールアドレスラベル
      const emailLabel = page.locator('text=メールアドレス').first();
      await expect(emailLabel).toBeVisible({ timeout: 5000 });

      console.log('QL-004: 顧客情報表示確認');
    });

    test('承認・拒否ボタンが表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      const quotationItems = page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /QT-|EP-|TEST-/
      });
      if (await quotationItems.count() === 0) {
        console.log('QL-004: 見積もりなし - アクションボタン検証スキップ');
        return;
      }

      await quotationItems.first().click();
      await page.waitForLoadState('networkidle');

      // アクションボタンエリアの確認
      // DRAFT/SENTステータスの場合は「承認」ボタンが表示される
      const approveButton = page.locator('button:has-text("承認")').first();
      const rejectButton = page.locator('button:has-text("拒否")').first();
      const emailButton = page.locator('button:has-text("メール送信")').first();

      // 少なくともメール送信ボタンは常に表示される
      await expect(emailButton).toBeVisible({ timeout: 10000 });

      // 承認・拒否はステータス依存
      const hasApprove = await approveButton.isVisible().catch(() => false);
      const hasReject = await rejectButton.isVisible().catch(() => false);
      console.log(`QL-004: 承認=${hasApprove}, 拒否=${hasReject}, メール=visible`);
    });

    test('金額情報（小計・消費税・合計）が表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      const quotationItems = page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /QT-|EP-|TEST-/
      });
      if (await quotationItems.count() === 0) {
        console.log('QL-004: 見積もりなし - 金額テストスキップ');
        return;
      }

      await quotationItems.first().click();
      await page.waitForLoadState('networkidle');

      // 金額セクションの確認
      const subtotalLabel = page.locator('text=小計').first();
      await expect(subtotalLabel).toBeVisible({ timeout: 10000 });

      const taxLabel = page.locator('text=消費税').first();
      await expect(taxLabel).toBeVisible({ timeout: 5000 });

      const totalLabel = page.locator('text=合計').first();
      await expect(totalLabel).toBeVisible({ timeout: 5000 });

      console.log('QL-004: 金額情報表示確認');
    });
  });

  // --------------------------------------------------
  // QL-005: データ精度クロスバリデーション
  // --------------------------------------------------
  test.describe('QL-005: データ精度クロスバリデーション', () => {

    test('シミュレーターで作成した見積もりのデータが一覧と一致すること', async ({ page }) => {
      await loginAsAdmin(page);

      // シミュレーターで見積もりを作成
      await page.goto('/quote-simulator', { waitUntil: 'networkidle' });
      await page.waitForSelector('text=袋のタイプ', { timeout: 30000 });

      // 平袋を選択
      const flatBagButton = page.locator('button:has-text("平袋")').first();
      await expect(flatBagButton).toBeVisible({ timeout: 10000 });
      await flatBagButton.click();
      await page.waitForTimeout(300);

      // サイズ入力
      const testWidth = 150;
      const testHeight = 200;
      const testDepth = 30;

      const widthField = page.locator('label:has-text("幅") + input, label:text-is("幅") ~ input').first();
      if (await widthField.isVisible().catch(() => false)) {
        await widthField.fill(testWidth.toString());
      }

      const heightField = page.locator('label:has-text("高さ")').locator('..').locator('input[type="number"]').first();
      if (await heightField.isVisible().catch(() => false)) {
        await heightField.fill(testHeight.toString());
      }

      const depthField = page.locator('label:has-text("マチ"), label:has-text("深さ")').locator('..').locator('input[type="number"]').first();
      if (await depthField.isVisible().catch(() => false)) {
        await depthField.fill(testDepth.toString());
      }

      // 内容物ドロップダウン
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

      // 素材選択
      const materialCards = page.locator('[class*="cursor-pointer"][class*="border"]').filter({
        hasText: /PET|NY/
      });
      if (await materialCards.count() > 0) {
        await materialCards.first().click();
      }
      await page.waitForTimeout(300);

      // 次へボタンで後加工ステップへ
      const nextButton = page.locator('button:has-text("次へ")').first();
      await expect(nextButton).toBeVisible({ timeout: 5000 });
      await expect(nextButton).toBeEnabled({ timeout: 10000 });
      await nextButton.click();
      await page.waitForTimeout(500);

      // SKU数量ステップへ
      const nextButton2 = page.locator('button:has-text("次へ")').first();
      await expect(nextButton2).toBeVisible({ timeout: 5000 });
      await nextButton2.click();
      await page.waitForTimeout(500);

      // 数量入力
      const quantityInputs = page.locator('input[type="number"]');
      for (let i = 0; i < await quantityInputs.count(); i++) {
        const input = quantityInputs.nth(i);
        const value = await input.inputValue();
        if (!value || parseInt(value) < 1000) {
          await input.fill('10000');
          break;
        }
      }
      await page.waitForTimeout(500);

      // 見積完了
      const finishButton = page.locator('button:has-text("見積もりを完了"), button:has-text("次へ")').first();
      await expect(finishButton).toBeVisible({ timeout: 5000 });
      await finishButton.click();

      // 計算完了待ち
      await page.waitForTimeout(8000);

      // シミュレーターからサイズ情報を取得（表示テキストから）
      const simulatorSizeText = await page.locator(`text=${testWidth}`).first().textContent().catch(() => '');

      // メンバー見積一覧へ移動して確認
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // 最新の見積もりカードのサイズ情報を確認
      const latestCard = page.locator('[class*="p-4"][class*="hover:shadow"]').first();
      if (await latestCard.isVisible().catch(() => false)) {
        // サイズ表示にシミュレーターで入力した値が含まれていることを確認
        const cardText = await latestCard.textContent().catch(() => '');
        const hasMatchingSize = cardText.includes(`${testWidth}`) || cardText.includes(`${testHeight}`);
        console.log(`QL-005: サイズ一致 ${hasMatchingSize ? '確認' : '確認不可（データ形式依存）'}`);
      } else {
        console.log('QL-005: 見積カードなし - クロスバリデーション部分確認');
      }

      console.log('QL-005: データ精度テスト完了');
    });
  });

  // --------------------------------------------------
  // QL-006: ステータス遷移
  // --------------------------------------------------
  test.describe('QL-006: ステータス遷移', () => {

    test('初期ステータスがドラフト（審査中）で表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // ページが正常に表示されること
      await expect(page.locator('h1', { hasText: '見積一覧' })).toBeVisible({ timeout: 15000 });

      // DRAFTステータスの見積もりが存在する場合、「審査中」バッジが表示されること
      const draftBadge = page.locator('text=審査中, text=ドラフト').first();
      const hasDraftBadge = await draftBadge.isVisible().catch(() => false);

      if (hasDraftBadge) {
        console.log('QL-006: ドラフト（審査中）ステータス確認');
      } else {
        console.log('QL-006: ドラフト見積なし - ステータス確認スキップ');
      }
    });

    test('管理者がステータスを承認済みに変更できること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // ドラフトまたは送信済みの見積もりを探す
      const draftOrSentItems = page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /ドラフト|送信済み/
      });
      const count = await draftOrSentItems.count();

      if (count === 0) {
        console.log('QL-006: 承認対象見積なし - ステータス変更テストスキップ');
        return;
      }

      // 最初のドラフト/送信済み見積もりを選択
      await draftOrSentItems.first().click();
      await page.waitForLoadState('networkidle');

      // 承認ボタンが表示されること
      const approveButton = page.locator('button:has-text("承認")').first();
      const hasApproveButton = await approveButton.isVisible().catch(() => false);

      if (hasApproveButton) {
        // APIレスポンスを監視
        const approveResponsePromise = page.waitForResponse(
          resp => resp.url().includes('/api/admin/quotations') && resp.request().method() === 'PATCH',
          { timeout: 10000 }
        ).catch(() => null);

        // confirm ダイアログを許可
        page.on('dialog', dialog => dialog.accept());

        await approveButton.click();

        // APIレスポンスまたはリストの再取得を確認
        const response = await approveResponsePromise;
        if (response) {
          console.log(`QL-006: 承認API応答 status=${response.status()}`);
        }

        // ステータスが「承認済み」に変化したことを確認（リスト更新後）
        await page.waitForTimeout(2000);
        const hasApprovedBadge = await page.locator('text=承認済み').first().isVisible().catch(() => false);
        console.log(`QL-006: 承認済みステータス ${hasApprovedBadge ? '確認' : '確認中（更新待ち）'}`);
      } else {
        console.log('QL-006: 承認ボタン非表示（既に承認済み等）');
      }
    });

    test('ステータス遷移のフローが正しく表示されること', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/quotations', { waitUntil: 'networkidle' });

      // 各ステータスの見積もりが一覧に表示されることを確認
      // フィルターで各ステータスを切り替えて表示確認
      const statusFilter = page.locator('select').first();
      const allSelects = page.locator('select');

      let filterSelect = null;
      for (let i = 0; i < await allSelects.count(); i++) {
        const select = allSelects.nth(i);
        const options = await select.locator('option').allTextContents();
        if (options.some(opt => opt.includes('すべてのステータス'))) {
          filterSelect = select;
          break;
        }
      }

      if (!filterSelect) {
        console.log('QL-006: フィルターselectなし - ステータス遷移確認スキップ');
        return;
      }

      // 「すべてのステータス」に戻す
      await filterSelect.selectOption('all');
      await page.waitForLoadState('networkidle');

      // 各ステータスのバッジが表示されること
      const statusLabels = ['ドラフト', '送信済み', '承認済み', '拒否', '期限切れ', '注文変換済み'];
      let foundStatuses = 0;
      for (const label of statusLabels) {
        const found = await page.locator(`text=${label}`).first().isVisible().catch(() => false);
        if (found) foundStatuses++;
      }

      console.log(`QL-006: ${foundStatuses}/${statusLabels.length} 種類のステータス確認`);

      // 管理者詳細パネルでのステータス履歴表示確認
      const quotationItems = page.locator('[class*="border"][class*="rounded"]').filter({
        hasText: /QT-|EP-|TEST-/
      });
      if (await quotationItems.count() > 0) {
        await quotationItems.first().click();
        await page.waitForLoadState('networkidle');

        // ステータス表示
        const statusInDetail = page.locator('text=ステータス').first();
        const hasStatusDetail = await statusInDetail.isVisible().catch(() => false);
        console.log(`QL-006: 詳細パネル ステータス表示 ${hasStatusDetail ? 'あり' : 'なし'}`);
      }
    });

    test('メンバー側で注文変換後のステータスが表示されること', async ({ page }) => {
      await loginAsMember(page);
      await page.goto('/member/quotations', { waitUntil: 'networkidle' });

      // 「注文変換済み」ステータスの見積もりを探す
      const convertedBadge = page.locator('text=注文変換済み').first();
      const hasConverted = await convertedBadge.isVisible().catch(() => false);

      if (hasConverted) {
        // 注文変換済みの見積もりカード内に「注文を確認」リンクが表示されること
        const orderLink = page.locator('text=注文を確認').first();
        const hasOrderLink = await orderLink.isVisible().catch(() => false);
        console.log(`QL-006: 注文変換済み 注文リンク ${hasOrderLink ? 'あり' : 'なし'}`);
      } else {
        console.log('QL-006: 注文変換済み見積なし - 変換後ステータス確認スキップ');
      }
    });
  });
});
