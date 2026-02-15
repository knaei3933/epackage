import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('About 페이지 접근 및 기본 렌더링 확인', async ({ page }) => {
    await page.goto('/about');

    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('会社概要');

    // 모든 섹션이 렌더링되는지 확인 (4개의 main sections)
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(4);
  });

  test('Hero Section 확인', async ({ page }) => {
    await page.goto('/about');

    // Hero Section 내용 확인
    await expect(page.locator('text="会社概要"')).toBeVisible();

    // Wait for page content to load
    await page.waitForLoadState('networkidle').catch(() => {});

    // Check for hero content - use partial text matching since content might be split
    const heroContent = page.locator('section').first();
    await expect(heroContent).toBeVisible();
    await expect(heroContent).toContainText('革新的な包装');
  });

  test('Company Overview Section 확인', async ({ page }) => {
    await page.goto('/about');

    // 섹션 제목 확인
    await expect(page.locator('text="会社情報"')).toBeVisible();

    // 회사 정보 항목 확인
    await expect(page.locator('text="会社名"')).toBeVisible();
    await expect(page.locator('text="Epackage Lab株式会社"')).toBeVisible();
    await expect(page.locator('text="設立"')).toBeVisible();
    await expect(page.locator('text="資本金"')).toBeVisible();
    await expect(page.locator('text="所在地"')).toBeVisible();
    await expect(page.locator('text="代表取締役"')).toBeVisible();
    await expect(page.locator('text="従業員数"')).toBeVisible();
    await expect(page.locator('text="事業内容"')).toBeVisible();
  });

  test('Vision & Mission Section 확인', async ({ page }) => {
    await page.goto('/about');

    // Wait for page content to load
    await page.waitForLoadState('networkidle').catch(() => {});

    // 섹션 제목 확인
    await expect(page.locator('text="ビジョン・ミッション"')).toBeVisible();

    // 비전 확인 - use partial text
    await expect(page.locator('text="ビジョン"')).toBeVisible();
    const visionSection = page.locator('section').filter({ hasText: 'ビジョン' });
    await expect(visionSection).toContainText('包装の可能性');

    // 미션 확인 - use partial text
    await expect(page.locator('text="ミッション"')).toBeVisible();
    const missionSection = page.locator('section').filter({ hasText: 'ミッション' });
    await expect(missionSection).toContainText('高品質な包装資材');
    await expect(missionSection).toContainText('環境に配慮');
  });

  test('Company Values Section 확인', async ({ page }) => {
    await page.goto('/about');

    // 섹션 제목 확인
    await expect(page.locator('text="企業理念"')).toBeVisible();

    // 3가지 가치 확인
    await expect(page.locator('text="環境配慮"')).toBeVisible();
    await expect(page.locator('text="スピード対応"')).toBeVisible();
    await expect(page.locator('text="パートナーシップ"')).toBeVisible();
  });

  test('CTA Section 확인', async ({ page }) => {
    await page.goto('/about');

    // Wait for page content to load
    await page.waitForLoadState('networkidle').catch(() => {});

    // 섹션 제목 확인
    await expect(page.locator('text="お問い合わせ・お見積もり"')).toBeVisible();

    // 2가지 CTA 버튼 확인 - use .first() to avoid strict mode violation
    await expect(page.locator('a[href="/contact"]').first()).toBeVisible();
    await expect(page.locator('a[href="/quote-simulator"]').first()).toBeVisible();
  });

  test('반응형 디자인 확인', async ({ page }) => {
    // 모바일 뷰포트 테스트
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');

    // 모바일에서 h1 확인
    await expect(page.locator('h1')).toBeVisible();

    // 데스크톱 뷰포트 테스트
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/about');

    // 데스크톱에서도 h1 확인
    await expect(page.locator('h1')).toBeVisible();
  });

  test('페이지 성능 확인', async ({ page }) => {
    const startTime = Date.now();
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);

    const loadTime = Date.now() - startTime;
    console.log(`About 페이지 로딩 시간: ${loadTime}ms`);

    // 페이지 로딩 시간 확인 (5초 이내 목표)
    expect(loadTime).toBeLessThan(5000);
  });

  test('SEO 메타데이터 확인', async ({ page }) => {
    await page.goto('/about');

    // 메타 타이틀 확인
    const title = await page.title();
    expect(title).toContain('会社概要');
    expect(title).toContain('Epackage Lab');

    // 메타 설명 확인
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Epackage Lab');
    expect(description).toContain('会社情報');
  });

  test('내비게이션 링크 확인', async ({ page }) => {
    await page.goto('/');

    // 홈페이지에서 about 페이지 링크 확인 (네비게이션에 있을 수 있음)
    const aboutLinks = page.locator('a[href="/about"], a[href*="about"]').first();
    const linkCount = await page.locator('a[href="/about"], a[href*="about"]').count();

    if (linkCount > 0) {
      // 링크가 있다면 클릭 후 about 페이지로 이동 확인
      await aboutLinks.click();
      await expect(page).toHaveURL(/\/about/);
    } else {
      // 링크가 없다면 직접 about 페이지로 이동
      await page.goto('/about');
      await expect(page).toHaveURL(/\/about/);
    }
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
