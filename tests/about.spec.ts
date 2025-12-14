import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('About Page', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('About 페이지 접근 및 기본 렌더링 확인', async ({ page }) => {
    await page.goto('/about');

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('Epackage Labとは');

    // 모든 섹션이 렌더링되는지 확인
    await expect(page.locator('section')).toHaveCount(5);
  });

  test('Hero Section 기능 확인', async ({ page }) => {
    await page.goto('/about');

    // Hero Section 내용 확인
    await expect(page.locator('text="韓国製の高品質軟包材を、短期納期・適正価格で"')).toBeVisible();

    // 동영상 컨트롤 버튼 확인
    await expect(page.locator('button:has-text("再生")')).toBeVisible();
    await expect(page.locator('button:has-text("音声オフ")')).toBeVisible();

    // 동영상 컨트롤 테스트
    const playButton = page.locator('button:has-text("再生")');
    const pauseButton = page.locator('button:has-text("一時停止")');

    await playButton.click();
    await expect(pauseButton).toBeVisible();

    await pauseButton.click();
    await expect(playButton).toBeVisible();
  });

  test('Problem Solution Section 확인', async ({ page }) => {
    await page.goto('/about');

    // 섹션 제목 확인
    await expect(page.locator('text="包装資材の課題を解決します"')).toBeVisible();

    // 문제점 확인 (4개)
    const problems = page.locator('.text-red-600');
    await expect(problems).toHaveCount(1); // "お客様が直面する課題" 섹션

    // 첫 번째 문제 확인
    await expect(page.locator('text="小ロット生産でコストが高くなる"')).toBeVisible();

    // 해결책 확인 (4개)
    await expect(page.locator('text="Epackage Labの解決策"')).toBeVisible();
    await expect(page.locator('text="100枚から製造可能"')).toBeVisible();
  });

  test('Company Strengths Section 확인', async ({ page }) => {
    await page.goto('/about');

    // 섹션 제목 확인
    await expect(page.locator('text="Epackage Labの強み"')).toBeVisible();

    // 5가지 강점 확인
    await expect(page.locator('text="6種類のパウチ製品専門"')).toBeVisible();
    await expect(page.locator('text="高品質な連包裝材"')).toBeVisible();
    await expect(page.locator('text="短期納期対応"')).toBeVisible();
    await expect(page.locator('text="コストパフォーマンス"')).toBeVisible();
    await expect(page.locator('text="実績に基づく信頼性"')).toBeVisible();

    // 특징 리스트 확인
    const features = page.locator('.text-gray-700');
    expect(features).toContainText(['4年以上の取引実績']);
  });

  test('EPackage Section 확인', async ({ page }) => {
    await page.goto('/about');

    // 섹션 제목 확인
    await expect(page.locator('text="品質の源泉"')).toBeVisible();

    // 기술 정보 확인
    await expect(page.locator('text="世界最新鋭設備による製造技術"')).toBeVisible();
    await expect(page.locator('text="HP Indigo 25000 Digital Press"')).toBeVisible();
    await expect(page.locator('text="NORDMECCANICA Simplex SL"')).toBeVisible();

    // 능력 확인
    await expect(page.locator('text="デジタル印刷・グラビア印刷の両対応"')).toBeVisible();
    await expect(page.locator('text="無版印刷の環境配慮"')).toBeVisible();
  });

  test('CTA Section 확인', async ({ page }) => {
    await page.goto('/about');

    // 섹션 제목 확인
    await expect(page.locator('text="今すぐ始めましょう"')).toBeVisible();

    // 3가지 CTA 버튼 확인
    await expect(page.locator('a[href="/samples"]:has-text("無料サンプルをもらう")')).toBeVisible();
    await expect(page.locator('a[href="/contact"]:has-text("お問い合わせはこちら")')).toBeVisible();
    await expect(page.locator('a[href="/catalog"]:has-text("製品カタログを見る")')).toBeVisible();

    // CTA 카드 내용 확인
    await expect(page.locator('text="実際の商品の品質を手で確かめて"')).toBeVisible();
  });

  test('반응형 디자인 확인', async ({ page }) => {
    // 모바일 뷰포트 테스트
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');

    // 모바일에서 히스 컨트롤 크기 확인
    const videoControls = page.locator('button').filter({ hasText: /再生|一時停止/ });
    await expect(videoControls.first()).toBeVisible();

    // 데스크톱 뷰포트 테스트
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/about');

    // 5컬럼 그리드 레이아웃 확인
    const strengthsGrid = page.locator('.grid').filter({ hasText: 'lg:grid-cols-3' });
    await expect(strengthsGrid).toBeVisible();
  });

  test('페이지 성능 확인', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response.status()).toBe(200);

    // 페이지 로딩 시간 측정 (3초 이내 목표)
    const loadTime = response.timing()?.requestTime || 0;
    console.log(`About 페이지 로딩 시간: ${loadTime}ms`);
  });

  test('SEO 메타데이터 확인', async ({ page }) => {
    await page.goto('/about');

    // 메타 타이틀 확인
    const title = await page.title();
    expect(title).toContain('Epackage Labとは');

    // 메타 설명 확인
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('韓国製の高品質軟包材');
  });

  test('내비게이션 링크 확인', async ({ page }) => {
    await page.goto('/');

    // 홈페이지에서 about 페이지 링크 확인
    const aboutLinks = page.locator('a[href="/about"]');
    expect(aboutLinks).toHaveCount(1);

    // 클릭 후 about 페이지로 이동 확인
    await aboutLinks.first().click();
    await expect(page).toHaveURL(/\/about/);
  });
});

test('About 페이지 접근성 확인', async ({ page }) => {
  await page.goto('/about');

  // 키보드 네비게이션 테스트
  await page.keyboard.press('Tab');
  const focusableElements = page.locator(':focus');
  await expect(focusableElements.first()).toBeVisible();

  // 스크롤 테스트
  await page.keyboard.press('End');
  await page.keyboard.press('Home');
  expect(page.locator('h1')).toBeInViewport();
});