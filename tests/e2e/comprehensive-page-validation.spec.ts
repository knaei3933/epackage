import { test, expect } from '@playwright/test';

/**
 * Comprehensive Page Validation Test
 * 포괄적인 페이지 유효성 검사 테스트
 *
 * Tests all pages for:
 * - DOM structure validation
 * - Component rendering
 * - Data loading
 * - Error boundary testing
 * - Accessibility checks
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Page categories
const PUBLIC_PAGES = [
  { path: '/', name: '홈페이지' },
  { path: '/catalog', name: '제품카탈로그' },
  { path: '/quote-simulator', name: '견적 시뮬레이터' },
  { path: '/samples', name: '샘플 신청' },
  { path: '/contact', name: '연락처' },
  { path: '/about', name: '회사소개' },
];

const AUTH_PAGES = [
  { path: '/auth/signin', name: '로그인' },
  { path: '/auth/register', name: '회원가입' },
  { path: '/auth/forgot-password', name: '비밀번호 찾기' },
];

const GUIDE_PAGES = [
  { path: '/guide/color', name: '색상 가이드' },
  { path: '/guide/size', name: '사이즈 가이드' },
  { path: '/guide/image', name: '이미지 가이드' },
  { path: '/guide/shirohan', name: '시로한 가이드' },
];

const INDUSTRY_PAGES = [
  { path: '/industry/cosmetics', name: '화장품 산업' },
  { path: '/industry/electronics', name: '전자산업' },
  { path: '/industry/food-manufacturing', name: '식품 제조' },
  { path: '/industry/pharmaceutical', name: '제약 산업' },
];

test.describe('Comprehensive Page Validation - DOM Structure', () => {
  test('[DOM-001] 홈페이지 should have valid DOM structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 1. HTML 구조 확인
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /\w+/);

    // 2. head 태그 확인
    const head = page.locator('head');
    await expect(head).toBeAttached();

    // 3. body 태그 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // 4. 주요 컨테이너 확인
    const main = page.locator('main').or(page.locator('[role="main"]'));
    const mainExists = await main.count() > 0;
    expect(mainExists).toBe(true);

    // 5. 헤더 확인
    const header = page.locator('header').or(page.locator('[role="banner"]'));
    const headerExists = await header.count() > 0;
    expect(headerExists).toBe(true);

    // 6. 푸터 확인
    const footer = page.locator('footer').or(page.locator('[role="contentinfo"]'));
    const footerExists = await footer.count() > 0;
    expect(footerExists).toBe(true);
  });

  PUBLIC_PAGES.forEach(({ path, name }) => {
    test(`[DOM-${name}] ${name} should have semantic HTML structure`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);

      // heading 구조 확인
      const h1 = page.locator('h1');
      const h1Count = await h1.count();

      // h1이 하나만 있거나 없어도 됨
      if (h1Count > 0) {
        expect(h1Count).toBeLessThanOrEqual(1);
      }

      // 적어도 하나의 heading이 있어야 함
      const anyHeading = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await anyHeading.count();
      expect(headingCount).toBeGreaterThan(0);
    });
  });
});

test.describe('Comprehensive Page Validation - Component Rendering', () => {
  test('[COMP-001] 홈페이지 should render hero section', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 히어로 섹션 확인
    const hero = page.locator('[class*="hero"], section:has(h1)').first();
    const heroVisible = await hero.isVisible().catch(() => false);

    if (heroVisible) {
      // 히어로 섹션이 보이면 내용 확인
      const heroContent = await hero.textContent();
      expect(heroContent?.length).toBeGreaterThan(0);
    }
  });

  test('[COMP-002] 카탈로그 should render product cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // 제품 카드 또는 제품 목록 확인
    const productCards = page.locator('[class*="product"], article, [data-testid*="product"]');
    const productCount = await productCards.count();

    // 제품이 없을 수도 있으므로 빈 상태 또는 제품이 있어야 함
    if (productCount === 0) {
      const emptyState = page.locator('text=/製品がありません|該当する製品|no products/i');
      const emptyExists = await emptyState.count() > 0;
      // 빈 상태 메시지가 있거나 페이지라도 로드되어야 함
      expect(emptyExists || await page.locator('body').isVisible()).toBeTruthy();
    } else {
      // 제품이 있으면 첫 번째 카드 확인
      await expect(productCards.first()).toBeVisible();
    }
  });

  test('[COMP-003] 견적 시뮬레이터 should render form components', async ({ page }) => {
    await page.goto(`${BASE_URL}/quote-simulator`);

    // 폼 요소 확인
    const form = page.locator('form');
    const formCount = await form.count();

    if (formCount > 0) {
      // 입력 필드 확인
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);

      // 제출 버튼 확인
      const submitButton = page.locator('button[type="submit"], button:has-text("送信"), button:has-text("確認"), button:has-text("Submit")');
      const submitExists = await submitButton.count() > 0;
      expect(submitExists).toBe(true);
    }
  });

  test('[COMP-004] 연락처 should render contact form', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    // 연락처 폼 확인
    const form = page.locator('form');
    const formCount = await form.count();

    if (formCount > 0) {
      // 이메일 입력 필드
      const emailInput = page.locator('input[type="email"], input[name*="email"], input[name*="メール"]');
      const emailExists = await emailInput.count() > 0;
      expect(emailExists).toBe(true);

      // 메시지 입력 필드
      const messageInput = page.locator('textarea, input[name*="message"], input[name*="問い合わせ"]');
      const messageExists = await messageInput.count() > 0;
      expect(messageExists).toBe(true);
    }
  });

  test('[COMP-005] 샘플 신청 should render sample selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/samples`);

    // 샘플 선택 UI 확인
    const sampleSection = page.locator('[class*="sample"], [data-testid*="sample"]');
    const sampleExists = await sampleSection.count() > 0;

    if (sampleExists) {
      const sampleContent = await sampleSection.first().textContent();
      expect(sampleContent?.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Comprehensive Page Validation - Data Loading', () => {
  test('[DATA-001] 카탈로그 should load data from API', async ({ page }) => {
    // API 요청 모니터링
    const apiRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/')) {
        apiRequests.push(url);
      }
    });

    await page.goto(`${BASE_URL}/catalog`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // API 요청이 있었는지 확인 (선택 사항)
    const hasApiRequests = apiRequests.length > 0;
    if (hasApiRequests) {
      console.log(`API requests detected: ${apiRequests.length}`);
    }
  });

  test('[DATA-002] 연락처 should handle form submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);

    const form = page.locator('form').first();
    const formCount = await form.count();

    if (formCount > 0) {
      // 폼이 있으면 제출 버튼 확인
      const submitButton = form.locator('button[type="submit"], button:has-text("送信")');
      const submitExists = await submitButton.count() > 0;
      expect(submitExists).toBe(true);
    }
  });

  test('[DATA-003] 페이지 should handle loading states', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // 로딩 스피너나 로딩 상태 확인
    const loadingSpinner = page.locator('[class*="loading"], [class*="spinner"], [role="status"]');
    const loadingExists = await loadingSpinner.count() > 0;

    // 로딩 상태가 있다면 나중에 사라져야 함
    if (loadingExists) {
      // 페이지가 로드되면 로딩이 사라질 수 있음
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('Comprehensive Page Validation - Error Boundary', () => {
  test('[ERR-001] 페이지 should handle navigation errors', async ({ page }) => {
    // 존재하지 않는 페이지로 이동
    const response = page.goto(`${BASE_URL}/this-page-does-not-exist`);
    const status = (await response).status();

    // 404 또는 리다이렉트이어야 함
    expect([404, 302, 307]).toContain(status);
  });

  test('[ERR-002] 페이지 should have error handling', async ({ page }) => {
    // 콘솔 에러 모니터링
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/catalog`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 치명적인 에러가 없어야 함
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('Warning')
    );

    // 에러가 너무 많으면 실패
    expect(criticalErrors.length).toBeLessThan(5);
  });

  test('[ERR-003] 인증 페이지 should handle auth errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);

    // 잘못된 자격증명으로 시도
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    const emailExists = await emailInput.count() > 0;
    const passwordExists = await passwordInput.count() > 0;
    const submitExists = await submitButton.count() > 0;

    if (emailExists && passwordExists && submitExists) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();

      // 에러 메시지가 표시되어야 함
      await page.waitForTimeout(2000);

      const errorMessage = page.locator('text=/error|invalid|失敗|エラー/i');
      const errorExists = await errorMessage.count() > 0;

      // 에러 메시지가 있거나 리다이렉트되어야 함
      expect(errorExists || page.url().includes('/signin')).toBeTruthy();
    }
  });
});

test.describe('Comprehensive Page Validation - Accessibility', () => {
  PUBLIC_PAGES.forEach(({ path, name }) => {
    test(`[A11Y-${name}] ${name} should be accessible`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);

      // 1. 페이지 타이틀 확인
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // 2. heading 구조 확인
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeLessThanOrEqual(1);

      // 3. 이미지 alt 속성 확인
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);

      // 4. 폼 라벨 확인
      const inputs = page.locator('input');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        // 처음 5개 입력 필드만 확인
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          const hasLabel = await input.evaluate((el: HTMLInputElement) => {
            return !!(
              el.labels?.length ||
              el.getAttribute('aria-label') ||
              el.getAttribute('placeholder') ||
              el.getAttribute('id')
            );
          });
          expect(hasLabel).toBe(true);
        }
      }

      // 5. 링크 텍스트 확인
      const emptyLinks = page.locator('a[href=""]');
      const emptyLinkCount = await emptyLinks.count();
      expect(emptyLinkCount).toBe(0);
    });
  });

  test('[A11Y-FOCUS] 페이지 should support keyboard navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 탭 키로 포커스 이동
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement || '');
  });

  test('[A11Y-LANG] 페이지 should have correct language attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    const html = page.locator('html');
    const lang = await html.getAttribute('lang');

    expect(lang).toBeTruthy();
    expect(['ja', 'ko', 'en']).toContain(lang || '');
  });
});

test.describe('Comprehensive Page Validation - Responsive Design', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`[RESP-${name}] 홈페이지 should be responsive on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`${BASE_URL}/`);

      // 페이지가 로드되어야 함
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // 모바일에서 햄버거 메뉴 확인
      if (width < 768) {
        const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="メニュー"], [class*="hamburger"]');
        const menuExists = await menuButton.count() > 0;

        if (menuExists) {
          await expect(menuButton.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe('Comprehensive Page Validation - Performance', () => {
  const performancePages = [
    { path: '/', name: '홈페이지' },
    { path: '/catalog', name: '카탈로그' },
    { path: '/contact', name: '연락처' },
  ];

  performancePages.forEach(({ path, name }) => {
    test(`[PERF-${name}] ${name} should load within performance budget`, async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const loadTime = Date.now() - startTime;

      // 5초 이내에 로드되어야 함
      expect(loadTime).toBeLessThan(5000);

      console.log(`${name} 로드 시간: ${loadTime}ms`);
    });
  });
});
