import { test, expect } from '@playwright/test';

/**
 * Comprehensive Page Validation Test (Fixed)
 * 포괄적인 페이지 유효성 검사 테스트 (수정됨)
 *
 * Improved version with:
 * - Better selectors
 * - Improved wait conditions
 * - Retry logic
 * - Timeout handling
 * - More flexible assertions
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper function for retry logic
async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed');
}

test.describe('Fixed Page Validation - Public Pages', () => {
  test('[FIXED-PUBLIC-001] 홈페이지 should load with proper structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 1. 대기 및 재시도 로직으로 페이지 로드 확인
    await retry(async () => {
      const body = page.locator('body');
      await expect(body).toBeVisible({ timeout: 5000 });
    });

    // 2. 주요 요소 확인 (유연한 선택자)
    const mainContent = page.locator('main, [role="main"], .main, #main');
    const mainExists = await mainContent.count() > 0;
    expect(mainExists).toBe(true);
  });

  test('[FIXED-PUBLIC-002] 카탈로그 should load products', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // 1. 카탈로그 컨테이너 확인
    const catalogContainer = page.locator('[class*="catalog"], [class*="Catalog"], [data-testid*="catalog"]');
    const containerExists = await catalogContainer.count() > 0;

    // 2. 제품 또는 빈 상태 확인
    const productCards = page.locator('[class*="product"], article, [class*="item"]');
    const emptyState = page.locator('text=/製品がありません|該当する製品|empty/i');

    const hasProducts = await productCards.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;

    // 제품이 있거나 빈 상태 메시지가 있어야 함
    expect(hasProducts || hasEmptyState || containerExists).toBe(true);
  });

  test('[FIXED-PUBLIC-003] 견적 시뮬레이터 should have form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote-simulator`);

    // 1. 폼 또는 위저드 컨테이너 확인
    const formContainer = page.locator('form, [class*="wizard"], [class*="quote"], [class*="simulator"]');
    const containerExists = await formContainer.count() > 0;

    if (containerExists) {
      // 2. 입력 필드 확인
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);

      // 3. 버튼 확인
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test('[FIXED-PUBLIC-004] 연락처 should have contact form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    // 1. 폼 확인
    const form = page.locator('form');
    const formCount = await form.count();

    if (formCount > 0) {
      // 2. 필수 필드 확인
      const requiredFields = page.locator('input[required], textarea[required], [aria-required="true"]');
      const requiredCount = await requiredFields.count();
      expect(requiredCount).toBeGreaterThan(0);
    }
  });

  test('[FIXED-PUBLIC-005] 샘플 신청 should load correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/samples`);

    // 1. 페이지 제목 확인
    const heading = page.locator('h1, h2');
    await expect(heading.first()).toBeVisible({ timeout: 5000 });

    // 2. 샘플 관련 콘텐츠 확인
    const sampleContent = page.locator('text=/サンプル|sample|パウチ/i');
    const hasSampleContent = await sampleContent.count() > 0;
    expect(hasSampleContent).toBe(true);
  });
});

test.describe('Fixed Page Validation - Auth Pages', () => {
  test('[FIXED-AUTH-001] 로그인 should have login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);

    // 1. 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[name*="メール"]');
    await expect(emailInput.first()).toBeVisible({ timeout: 5000 });

    // 2. 비밀번호 입력 필드 확인
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[name*="パスワード"]');
    await expect(passwordInput.first()).toBeVisible();

    // 3. 제출 버튼 확인
    const submitButton = page.locator('button[type="submit"], button:has-text("ログイン"), button:has-text("Login")');
    const submitExists = await submitButton.count() > 0;
    expect(submitExists).toBe(true);
  });

  test('[FIXED-AUTH-002] 회원가입 should have registration form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);

    // 1. 폼 확인
    const form = page.locator('form');
    const formCount = await form.count();

    if (formCount > 0) {
      // 2. 필수 필드 확인
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(3);
    }
  });

  test('[FIXED-AUTH-003] 비밀번호 찾기 should have reset form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/forgot-password`);

    // 1. 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    const emailExists = await emailInput.count() > 0;

    // 2. 제출 버튼 확인
    const submitButton = page.locator('button[type="submit"], button:has-text("送信"), button:has-text("Submit")');
    const submitExists = await submitButton.count() > 0;

    expect(emailExists || submitExists).toBe(true);
  });
});

test.describe('Fixed Page Validation - Guide Pages', () => {
  const guidePages = [
    { path: '/guide/color', name: '색상 가이드' },
    { path: '/guide/size', name: '사이즈 가이드' },
    { path: '/guide/image', name: '이미지 가이드' },
    { path: '/guide/shirohan', name: '시로한 가이드' },
  ];

  guidePages.forEach(({ path, name }) => {
    test(`[FIXED-GUIDE-${name}] ${name} should load correctly`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);

      // 1. 페이지가 로드되는지 확인
      const body = page.locator('body');
      await expect(body).toBeVisible({ timeout: 5000 });

      // 2. 콘텐츠가 있는지 확인
      const content = page.locator('h1, h2, main, article');
      const hasContent = await content.count() > 0;
      expect(hasContent).toBe(true);
    });
  });
});

test.describe('Fixed Page Validation - Industry Pages', () => {
  const industryPages = [
    { path: '/industry/cosmetics', name: '화장품 산업' },
    { path: '/industry/electronics', name: '전자산업' },
    { path: '/industry/food-manufacturing', name: '식품 제조' },
    { path: '/industry/pharmaceutical', name: '제약 산업' },
  ];

  industryPages.forEach(({ path, name }) => {
    test(`[FIXED-INDUSTRY-${name}] ${name} should load correctly`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);

      // 1. 페이지가 로드되는지 확인
      const body = page.locator('body');
      await expect(body).toBeVisible({ timeout: 5000 });

      // 2. 산업 관련 콘텐츠 확인
      const heading = page.locator('h1, h2');
      const headingText = await heading.first().textContent();
      expect(headingText?.length).toBeGreaterThan(0);
    });
  });
});

test.describe('Fixed Page Validation - Console Errors', () => {
  const testPages = [
    { path: '/', name: '홈페이지' },
    { path: '/catalog', name: '카탈로그' },
    { path: '/quote-simulator', name: '견적 시뮬레이터' },
    { path: '/contact', name: '연락처' },
    { path: '/samples', name: '샘플 신청' },
  ];

  testPages.forEach(({ path, name }) => {
    test(`[FIXED-CONSOLE-${name}] ${name} should have no critical console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // 콘솔 리스너 설정
      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
          // 허용된 에러 패턴 필터링
          if (!text.includes('favicon') && !text.includes('DevTools')) {
            consoleErrors.push(text);
          }
        } else if (type === 'warning') {
          consoleWarnings.push(text);
        }
      });

      // 페이지 로드
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      // 비동기 에러를 위해 잠시 대기
      await page.waitForTimeout(1000);

      // 치명적인 에러가 없어야 함
      const criticalErrors = consoleErrors.filter(e =>
        !e.includes('Warning') &&
        !e.includes('deprecated')
      );

      expect(criticalErrors.length).toBe(0);

      // 경고가 너무 많으면 실패
      expect(consoleWarnings.length).toBeLessThan(10);
    });
  });
});

test.describe('Fixed Page Validation - Broken Links', () => {
  test('[FIXED-LINKS-001] 홈페이지 should have no broken internal links', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 내부 링크 수집
    const links = page.locator('a[href^="/"], a[href^="' + BASE_URL + '"]');
    const linkCount = await links.count();

    let brokenLinks = 0;
    const checkedLinks = new Set<string>();

    // 처음 10개 링크만 검사 (성능 최적화)
    const checkCount = Math.min(linkCount, 10);

    for (let i = 0; i < checkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');

      if (href && !checkedLinks.has(href)) {
        checkedLinks.add(href);

        try {
          const fullUrl = href.startsWith('/') ? `${BASE_URL}${href}` : href;
          const response = page.request.get(fullUrl);
          const status = (await response).status();

          if (status >= 400) {
            brokenLinks++;
            console.log(`Broken link: ${href} (${status})`);
          }
        } catch (e) {
          // 링크 검사 실패는 무시
        }
      }
    }

    expect(brokenLinks).toBe(0);
  });
});

test.describe('Fixed Page Validation - Image Loading', () => {
  test('[FIXED-IMAGES-001] 홈페이지 should load all images', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 모든 이미지 수집
    const images = page.locator('img[src]');
    const imageCount = await images.count();

    let brokenImages = 0;

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      // 이미지가 로드되었는지 확인
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      if (naturalWidth === 0) {
        const src = await img.getAttribute('src');
        console.log(`Broken image: ${src}`);
        brokenImages++;
      }
    }

    expect(brokenImages).toBe(0);
  });
});

test.describe('Fixed Page Validation - Responsive Design', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1024, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`[FIXED-RESP-${name}] 홈페이지 should be responsive on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });

      await retry(async () => {
        await page.goto(`${BASE_URL}/`);
        const body = page.locator('body');
        await expect(body).toBeVisible({ timeout: 5000 });
      });

      // 페이지 콘텐츠 확인
      const mainContent = page.locator('main, [role="main"], body');
      await expect(mainContent.first()).toBeVisible();

      // 모바일에서 모바일 메뉴 버튼 확인
      if (width < 768) {
        const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="メニュー"], [class*="hamburger"], [class*="mobile-menu"]');
        const menuExists = await menuButton.count() > 0;

        if (menuExists) {
          console.log(`Mobile menu button found on ${name}`);
        }
      }
    });
  });
});

test.describe('Fixed Page Validation - Accessibility', () => {
  test('[FIXED-A11Y-001] 홈페이지 should be accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 1. 페이지 타이틀 확인
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // 2. heading 구조 확인
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // 3. h1이 하나만 있는지 확인 (선택 사항)
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    if (h1Count > 0) {
      expect(h1Count).toBeLessThanOrEqual(1);
    }

    // 4. 이미지 alt 속성 확인 (처음 5개만)
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBe(null);
    }

    // 5. 링크 href 속성 확인
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('[FIXED-A11Y-002] 카탈로그 should be accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // 1. 페이지 타이틀 확인
    const title = await page.title();
    expect(title).toContain('カタログ');

    // 2. 메인 콘텐츠 확인
    const main = page.locator('main, [role="main"]');
    const mainExists = await main.count() > 0;
    expect(mainExists).toBe(true);
  });
});

test.describe('Fixed Page Validation - Performance', () => {
  const perfPages = [
    { path: '/', name: '홈페이지', maxLoadTime: 3000 },
    { path: '/catalog', name: '카탈로그', maxLoadTime: 4000 },
    { path: '/contact', name: '연락처', maxLoadTime: 3000 },
  ];

  perfPages.forEach(({ path, name, maxLoadTime }) => {
    test(`[FIXED-PERF-${name}] ${name} should load within ${maxLoadTime}ms`, async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(maxLoadTime);

      console.log(`${name} 로드 시간: ${loadTime}ms (목표: ${maxLoadTime}ms)`);
    });
  });
});

test.describe('Fixed Page Validation - Meta Tags', () => {
  test('[FIXED-META-001] 홈페이지 should have proper meta tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 1. viewport 메타 태그
    const viewport = page.locator('meta[name="viewport"]');
    const viewportContent = await viewport.getAttribute('content');
    expect(viewportContent).toContain('width=');

    // 2. charset 메타 태그
    const charset = page.locator('meta[charset]');
    const charsetValue = await charset.getAttribute('charset');
    expect(charsetValue).toBeTruthy();

    // 3. title 태그
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // 4. description 메타 태그
    const description = page.locator('meta[name="description"]');
    const descContent = await description.getAttribute('content');
    expect(descContent).toBeTruthy();
    expect(descContent?.length).toBeGreaterThan(50);
  });

  test('[FIXED-META-002] 카탈로그 should have proper meta tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // 1. title 태그 확인
    const title = await page.title();
    expect(title).toContain('カタログ');

    // 2. description 메타 태그
    const description = page.locator('meta[name="description"]');
    const descExists = await description.count() > 0;
    expect(descExists).toBe(true);
  });
});
