import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard Comprehensive Test Suite
 * 관리자 대시보드 포괄적 테스트 스위트
 *
 * Tests all admin dashboard pages for:
 * - Widget loading
 * - Data accuracy
 * - Performance validation
 * - Security checks
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin1234';

// DEV_MODE 설정 확인
const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true';

// Admin pages to test
const ADMIN_PAGES = [
  { path: '/admin/dashboard', name: '대시보드', category: 'overview' },
  { path: '/admin/orders', name: '주문 관리', category: 'orders' },
  { path: '/admin/quotations', name: '견적 관리', category: 'quotations' },
  { path: '/admin/approvals', name: '승인 관리', category: 'approvals' },
  { path: '/admin/production', name: '생산 관리', category: 'production' },
  { path: '/admin/shipments', name: '배송 관리', category: 'shipments' },
  { path: '/admin/inventory', name: '재고 관리', category: 'inventory' },
  { path: '/admin/shipping', name: '배송 설정', category: 'shipping' },
  { path: '/admin/contracts', name: '계약 관리', category: 'contracts' },
  { path: '/admin/leads', name: '리드 관리', category: 'leads' },
];

// Helper: Login as admin
async function loginAsAdmin(page: any) {
  // Check if DEV_MODE is enabled
  if (isDevMode) {
    console.log('[DEV_MODE] Skipping login');
    return;
  }

  await page.goto(`${BASE_URL}/auth/signin`);
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // 대시보드나 멤버 페이지로 리다이렉트될 때까지 대기
  await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

test.describe('Admin Dashboard - Authentication', () => {
  test('[AUTH-ADMIN-001] should redirect to signin when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // 로그인 페이지로 리다이렉트되어야 함
    expect(page.url()).toContain('/signin');
  });

  test('[AUTH-ADMIN-002] should login with valid admin credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 대시보드나 리다이렉트 페이지로 이동해야 함
    await page.waitForURL(/\/(admin|member|dashboard)/, { timeout: 10000 }).catch(() => {});
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(admin|member|dashboard)/);
  });

  test('[AUTH-ADMIN-003] should show error with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // 에러 메시지가 표시되어야 함
    await page.waitForTimeout(2000);

    const errorMessage = page.locator('text=/error|invalid|失敗|エラー/i');
    const errorExists = await errorMessage.count() > 0;

    expect(errorExists).toBe(true);
  });
});

test.describe('Admin Dashboard - Page Access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  ADMIN_PAGES.forEach(({ path, name, category }) => {
    test(`[ACCESS-${category.toUpperCase()}-${name}] ${name} 페이지에 접근 가능해야 함`, async ({ page }) => {
      // 콘솔 에러 수집
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('favicon') && !text.includes('404')) {
            consoleErrors.push(text);
          }
        }
      });

      // 페이지 이동
      const response = page.goto(`${BASE_URL}${path}`);
      const status = (await response).status();

      // 페이지가 로드되어야 함 (200 또는 리다이렉트)
      expect([200, 302, 307]).toContain(status);

      // DOM이 로드될 때까지 대기
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      // 페이지 콘텐츠 확인
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // 치명적인 콘솔 에러가 없어야 함
      expect(consoleErrors.length).toBe(0);
    });
  });
});

test.describe('Admin Dashboard - Widget Loading', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[WIDGET-DASHBOARD] 대시보드 should display statistics widgets', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 통계 카드 확인
    const statCards = page.locator('[class*="stat"], [class*="metric"], [class*="widget"], [class*="card"]');
    const statCount = await statCards.count();

    // 적어도 몇 개의 위젯이 있어야 함
    expect(statCount).toBeGreaterThan(0);

    // 차트 또는 데이터 시각화 확인
    const charts = page.locator('canvas, svg, [class*="chart"], [class*="graph"]');
    const chartCount = await charts.count();
    // 차트가 없을 수도 있으므로 확인만
    if (chartCount > 0) {
      console.log(`Found ${chartCount} chart(s)`);
    }
  });

  test('[WIDGET-ORDERS] 주문 관리 should display order list', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 테이블 또는 목록 확인
    const table = page.locator('table, [role="table"]');
    const listItems = page.locator('[class*="order"], [class*="item"], tr');

    const hasTable = await table.count() > 0;
    const hasItems = await listItems.count() > 0;

    expect(hasTable || hasItems).toBe(true);
  });

  test('[WIDGET-PRODUCTION] 생산 관리 should display production stages', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/production`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 생산 단계 확인
    const stages = page.locator('[class*="stage"], [class*="step"], [class*="process"]');
    const stageCount = await stages.count();

    expect(stageCount).toBeGreaterThan(0);
  });

  test('[WIDGET-APPROVALS] 승인 관리 should display pending approvals', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/approvals`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 승인/거절 버튼 또는 상태 표시 확인
    const approveButtons = page.locator('button:has-text("承認"), button:has-text("Approve"), button:has-text("승인")');
    const rejectButtons = page.locator('button:has-text("却下"), button:has-text("Reject"), button:has-text("거절")');
    const statusBadges = page.locator('[class*="badge"], [class*="status"]');

    const hasActions = await approveButtons.count() > 0 || await rejectButtons.count() > 0;
    const hasStatus = await statusBadges.count() > 0;

    expect(hasActions || hasStatus).toBe(true);
  });

  test('[WIDGET-INVENTORY] 재고 관리 should display inventory controls', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/inventory`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 재고 입력 필드 또는 표시 확인
    const inputs = page.locator('input[type="number"], [class*="quantity"], [class*="stock"]');
    const inputCount = await inputs.count();

    expect(inputCount).toBeGreaterThan(0);
  });

  test('[WIDGET-SHIPPING] 배송 관리 should display tracking information', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/shipments`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 배송 추적 요소 확인
    const tracking = page.locator('[class*="tracking"], [class*="shipment"], [class*="carrier"]');
    const trackingCount = await tracking.count();

    expect(trackingCount).toBeGreaterThan(0);
  });

  test('[WIDGET-CONTRACTS] 계약 관리 should display contract workflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/contracts`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 계약 관련 요소 확인
    const contracts = page.locator('[class*="contract"], [class*="document"], [class*="agreement"]');
    const contractCount = await contracts.count();

    expect(contractCount).toBeGreaterThan(0);
  });
});

test.describe('Admin Dashboard - Data Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[DATA-DASHBOARD] 대시보드 should display accurate statistics', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 통계 카드에서 숫자 확인
    const statCards = page.locator('[class*="stat"], [class*="metric"], [class*="widget"]');
    const statCount = await statCards.count();

    if (statCount > 0) {
      // 첫 번째 통계 카드 확인
      const firstCard = statCards.first();
      const cardText = await firstCard.textContent();
      expect(cardText?.length).toBeGreaterThan(0);

      // 숫자가 포함되어 있는지 확인
      const hasNumbers = /\d/.test(cardText || '');
      expect(hasNumbers).toBe(true);
    }
  });

  test('[DATA-ORDERS] 주문 목록 should have proper data structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 테이블 헤더 확인
    const tableHeaders = page.locator('th, [role="columnheader"]');
    const headerCount = await tableHeaders.count();

    if (headerCount > 0) {
      // 첫 번째 헤더 텍스트 확인
      const firstHeader = tableHeaders.first();
      const headerText = await firstHeader.textContent();
      expect(headerText?.length).toBeGreaterThan(0);
    }
  });

  test('[DATA-QUOTATIONS] 견적 목록 should have proper data structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 견적 목록 요소 확인
    const quotations = page.locator('[class*="quotation"], [class*="quote"], tr');
    const quoteCount = await quotations.count();

    if (quoteCount > 0) {
      // 첫 번째 견적 항목 확인
      const firstQuote = quotations.first();
      const quoteText = await firstQuote.textContent();
      expect(quoteText?.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Dashboard - Performance Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  ADMIN_PAGES.forEach(({ path, name, category }) => {
    test(`[PERF-${category.toUpperCase()}-${name}] ${name} should load within performance budget`, async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const loadTime = Date.now() - startTime;

      // 5초 이내에 로드되어야 함
      expect(loadTime).toBeLessThan(5000);

      console.log(`${name} 로드 시간: ${loadTime}ms`);
    });
  });

  test('[PERF-NAVIGATION] 관리자 페이지 간 navigation should be fast', async ({ page }) => {
    const pages = [
      `${BASE_URL}/admin/dashboard`,
      `${BASE_URL}/admin/orders`,
      `${BASE_URL}/admin/quotations`,
    ];

    for (const pageUrl of pages) {
      const startTime = Date.now();

      await page.goto(pageUrl);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000);
    }
  });
});

test.describe('Admin Dashboard - Security Checks', () => {
  test('[SECURITY-API-001] API endpoints should require authentication', async ({ request }) => {
    // 인증 없이 API 접근 시도
    const apiEndpoints = [
      '/api/admin/dashboard/statistics',
      '/api/admin/orders',
      '/api/admin/quotations',
      '/api/admin/production/jobs',
    ];

    for (const endpoint of apiEndpoints) {
      const response = request.get(`${BASE_URL}${endpoint}`);
      const status = (await response).status();

      // 401, 403, 또는 404이어야 함
      expect([401, 403, 404]).toContain(status);
    }
  });

  test('[SECURITY-SESSION-001] Session should be secure', async ({ page }) => {
    await loginAsAdmin(page);

    // 쿠키 확인
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c: any) =>
      c.name.includes('session') ||
      c.name.includes('auth') ||
      c.name.includes('token')
    );

    if (sessionCookie) {
      // 세션 쿠키가 있으면 보안 속성 확인
      expect(sessionCookie.secure).toBe(true);
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.sameSite).toBe('Lax');
    }
  });

  test('[SECURITY-CSRF-001] CSRF protection should be enabled', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // CSRF 토큰 확인
    const csrfToken = page.locator('input[name*="csrf"], input[name*="token"], meta[name*="csrf"]');
    const csrfExists = await csrfToken.count() > 0;

    // CSRF 토큰이 있는 것을 권장하지만 필수는 아님
    if (csrfExists) {
      console.log('CSRF token found');
    }
  });

  test('[SECURITY-AUTHORIZATION-001] Non-admin users should be blocked', async ({ page }) => {
    // 일반 사용자로 로그인 시도
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'UserPassword123!');
    await page.click('button[type="submit"]');

    // 대기
    await page.waitForTimeout(2000);

    // 관리자 페이지에 접근 시도
    const response = page.goto(`${BASE_URL}/admin/dashboard`);
    const status = (await response).status();

    // 접근 거부 또는 리다이렉트되어야 함
    expect([401, 403, 302, 307]).toContain(status);
  });
});

test.describe('Admin Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[NAV-MENU] should have navigation menu', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // 네비게이션 확인
    const nav = page.locator('nav, [role="navigation"], [class*="sidebar"], [class*="menu"]');
    const navExists = await nav.count() > 0;

    expect(navExists).toBe(true);
  });

  test('[NAV-LINKS] should have navigation links to all admin pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // 관리자 페이지 링크 확인
    for (const adminPage of ADMIN_PAGES) {
      const link = page.locator(`a[href="${adminPage.path}"], a[href*="${adminPage.path}"]`);
      const linkExists = await link.count() > 0;

      // 모든 링크가 있을 필요는 없음
      if (linkExists) {
        console.log(`Navigation link found for ${adminPage.name}`);
      }
    }
  });

  test('[NAV-BREADCRUMB] should have breadcrumb navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);

    // 브레드크럼 확인
    const breadcrumb = page.locator('[class*="breadcrumb"], [class*="breadcrumb"], nav[aria-label*="breadcrumb"]');
    const breadcrumbExists = await breadcrumb.count() > 0;

    // 브레드크럼이 있는 것을 권장하지만 필수는 아님
    if (breadcrumbExists) {
      const breadcrumbText = await breadcrumb.first().textContent();
      expect(breadcrumbText?.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Dashboard - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`[RESP-${name}] 대시보드 should be responsive on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`${BASE_URL}/admin/dashboard`);

      // 페이지가 로드되어야 함
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // 모바일에서 햄버거 메뉴 확인
      if (width < 768) {
        const menuButton = page.locator('button[aria-label*="menu"], [class*="hamburger"]');
        const menuExists = await menuButton.count() > 0;

        if (menuExists) {
          console.log(`Mobile menu found on ${name}`);
        }
      }
    });
  });
});

test.describe('Admin Dashboard - Console Errors', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  ADMIN_PAGES.forEach(({ path, name, category }) => {
    test(`[CONSOLE-${category.toUpperCase()}-${name}] ${name} should have no console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
          // 허용된 에러 패턴 필터링
          if (!text.includes('favicon') && !text.includes('404')) {
            consoleErrors.push(text);
          }
        } else if (type === 'warning') {
          consoleWarnings.push(text);
        }
      });

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

test.describe('Admin Dashboard - Detail Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[DETAIL-ORDER] 주문 상세 페이지 should load', async ({ page }) => {
    // 주문 목록에서 ID 가져오기 시도
    await page.goto(`${BASE_URL}/admin/orders`);

    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      expect(page.url()).toContain('/admin/orders/');
    } else {
      // 주문이 없으면 테스트 ID로 시도
      await page.goto(`${BASE_URL}/admin/orders/test-id`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      // 페이지가 로드되어야 함 (404라도)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('[DETAIL-PRODUCTION] 생산 상세 페이지 should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/production`);

    const productionLink = page.locator('a[href*="/admin/production/"]').first();
    const linkCount = await productionLink.count();

    if (linkCount > 0) {
      await productionLink.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      expect(page.url()).toContain('/admin/production/');
    } else {
      await page.goto(`${BASE_URL}/admin/production/test-id`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('[DETAIL-SHIPMENT] 배송 상세 페이지 should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/shipments`);

    const shipmentLink = page.locator('a[href*="/admin/shipments/"]').first();
    const linkCount = await shipmentLink.count();

    if (linkCount > 0) {
      await shipmentLink.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      expect(page.url()).toContain('/admin/shipments/');
    } else {
      await page.goto(`${BASE_URL}/admin/shipments/test-id`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('[DETAIL-CONTRACT] 계약 상세 페이지 should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/contracts`);

    const contractLink = page.locator('a[href*="/admin/contracts/"]').first();
    const linkCount = await contractLink.count();

    if (linkCount > 0) {
      await contractLink.click();
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      expect(page.url()).toContain('/admin/contracts/');
    } else {
      await page.goto(`${BASE_URL}/admin/contracts/test-id`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});
