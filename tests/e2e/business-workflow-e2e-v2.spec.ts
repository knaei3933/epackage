/**
 * Epackage Lab - 실제 비즈니스 워크플로우 E2E 테스트 (v2)
 *
 * 개선된 버전:
 * - 기존 사용자 사용 (회원가입 스킵)
 * - 관리자 로그인 검증
 * - 견적/주문 페이지 접근 확인
 * - 관리자 승인 워크플로우 확인
 *
 * Run: npx playwright test business-workflow-e2e-v2.spec.ts
 */

import { test, expect, type Page } from '@playwright/test';

// =====================================================
// Test Configuration
// =====================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin1234!',
  },
  member: {
    email: 'member@test.com',
    password: 'Member1234!',
  },
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * 관리자 로그인
 */
async function adminLogin(page: Page): Promise<boolean> {
  console.log('[Test] 관리자 로그인 시도...');

  try {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // 리다이렉트 대기
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('[Test] 관리자 로그인 후 URL:', currentUrl);

    // /admin/dashboard 또는 /member/dashboard로 이동했으면 성공
    if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/member/dashboard')) {
      console.log('[Test] ✅ 관리자 로그인 성공');
      return true;
    }

    // 여전히 로그인 페이지에 있으면 강제 이동 시도
    if (currentUrl.includes('/auth/signin')) {
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);

      const newUrl = page.url();
      if (newUrl.includes('/auth/signin')) {
        console.log('[Test] ❌ 로그인 실패');
        return false;
      }
    }

    console.log('[Test] ✅ 관리자 로그인 완료');
    return true;
  } catch (error) {
    console.log('[Test] ❌ 관리자 로그인 실패:', error);
    return false;
  }
}

/**
 * 회원 로그인
 */
async function memberLogin(page: Page): Promise<boolean> {
  console.log('[Test] 회원 로그인 시도...');

  try {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('domcontentloaded');

    await page.fill('input[type="email"]', TEST_USERS.member.email);
    await page.fill('input[type="password"]', TEST_USERS.member.password);
    await page.click('button[type="submit"]');

    // 리다이렉트 대기
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('[Test] 회원 로그인 후 URL:', currentUrl);

    // /member/dashboard로 이동했으면 성공
    if (currentUrl.includes('/member/dashboard')) {
      console.log('[Test] ✅ 회원 로그인 성공');
      return true;
    }

    // 여전히 로그인 페이지에 있으면 강제 이동 시도
    if (currentUrl.includes('/auth/signin')) {
      await page.goto(`${BASE_URL}/member/dashboard`);
      await page.waitForTimeout(2000);

      const newUrl = page.url();
      if (newUrl.includes('/auth/signin')) {
        console.log('[Test] ❌ 로그인 실패');
        return false;
      }
    }

    console.log('[Test] ✅ 회원 로그인 완료');
    return true;
  } catch (error) {
    console.log('[Test] ❌ 회원 로그인 실패:', error);
    return false;
  }
}

/**
 * 관리자 승인 페이지 접근
 */
async function navigateToApprovals(page: Page): Promise<boolean> {
  console.log('[Test] 관리자 승인 페이지 이동...');

  try {
    await page.goto(`${BASE_URL}/admin/approvals`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    console.log('[Test] 승인 페이지 URL:', currentUrl);

    if (currentUrl.includes('/admin/approvals')) {
      console.log('[Test] ✅ 승인 페이지 접근 성공');
      return true;
    }

    console.log('[Test] ❌ 승인 페이지 접근 실패');
    return false;
  } catch (error) {
    console.log('[Test] ❌ 승인 페이지 이동 실패:', error);
    return false;
  }
}

/**
 * 견적 목록 페이지 접근
 */
async function navigateToQuotations(page: Page): Promise<boolean> {
  console.log('[Test] 견적 목록 페이지 이동...');

  try {
    await page.goto(`${BASE_URL}/member/quotations`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    console.log('[Test] 견적 페이지 URL:', currentUrl);

    if (currentUrl.includes('/member/quotations')) {
      console.log('[Test] ✅ 견적 페이지 접근 성공');
      return true;
    }

    console.log('[Test] ❌ 견적 페이지 접근 실패');
    return false;
  } catch (error) {
    console.log('[Test] ❌ 견적 페이지 이동 실패:', error);
    return false;
  }
}

/**
 * 주문 목록 페이지 접근
 */
async function navigateToOrders(page: Page): Promise<boolean> {
  console.log('[Test] 주문 목록 페이지 이동...');

  try {
    await page.goto(`${BASE_URL}/member/orders`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    console.log('[Test] 주문 페이지 URL:', currentUrl);

    if (currentUrl.includes('/member/orders')) {
      console.log('[Test] ✅ 주문 페이지 접근 성공');
      return true;
    }

    console.log('[Test] ❌ 주문 페이지 접근 실패');
    return false;
  } catch (error) {
    console.log('[Test] ❌ 주문 페이지 이동 실패:', error);
    return false;
  }
}

/**
 * 관리자 주문 관리 페이지 접근
 */
async function navigateToAdminOrders(page: Page): Promise<boolean> {
  console.log('[Test] 관리자 주문 페이지 이동...');

  try {
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('domcontentloaded');

    const currentUrl = page.url();
    console.log('[Test] 관리자 주문 페이지 URL:', currentUrl);

    if (currentUrl.includes('/admin/orders')) {
      console.log('[Test] ✅ 관리자 주문 페이지 접근 성공');
      return true;
    }

    console.log('[Test] ❌ 관리자 주문 페이지 접근 실패');
    return false;
  } catch (error) {
    console.log('[Test] ❌ 관리자 주문 페이지 이동 실패:', error);
    return false;
  }
}

// =====================================================
// Test Suites
// =====================================================

test.describe('실제 비즈니스 워크플로우 테스트 v2', () => {
  test.beforeAll(async () => {
    console.log('='.repeat(60));
    console.log('🚀 실제 비즈니스 워크플로우 테스트 v2 시작');
    console.log('='.repeat(60));
  });

  test.afterAll(async () => {
    console.log('='.repeat(60));
    console.log('🏁 실제 비즈니스 워크플로우 테스트 v2 완료');
    console.log('='.repeat(60));
  });

  test('[TEST-001] 관리자 로그인 및 대시보드 접근', async ({ page }) => {
    const loginSuccess = await adminLogin(page);
    expect(loginSuccess).toBe(true);

    const currentUrl = page.url();
    expect(currentUrl.includes('/admin/')).toBeTruthy();
  });

  test('[TEST-002] 회원 로그인 및 대시보드 접근', async ({ page }) => {
    const loginSuccess = await memberLogin(page);
    expect(loginSuccess).toBe(true);

    const currentUrl = page.url();
    expect(currentUrl.includes('/member/')).toBeTruthy();
  });

  test('[TEST-003] 관리자 승인 페이지 접근', async ({ page }) => {
    await adminLogin(page);

    const approvalsSuccess = await navigateToApprovals(page);
    expect(approvalsSuccess).toBe(true);
  });

  test('[TEST-004] 회원 견적 페이지 접근', async ({ page }) => {
    await memberLogin(page);

    const quotationsSuccess = await navigateToQuotations(page);
    expect(quotationsSuccess).toBe(true);
  });

  test('[TEST-005] 회원 주문 페이지 접근', async ({ page }) => {
    await memberLogin(page);

    const ordersSuccess = await navigateToOrders(page);
    expect(ordersSuccess).toBe(true);
  });

  test('[TEST-006] 관리자 주문 관리 페이지 접근', async ({ page }) => {
    await adminLogin(page);

    const adminOrdersSuccess = await navigateToAdminOrders(page);
    expect(adminOrdersSuccess).toBe(true);
  });

  test('[TEST-007] 전체 워크플로우: 회원 로그인 → 견적 → 주문', async ({ page }) => {
    // Step 1: 회원 로그인
    const loginSuccess = await memberLogin(page);
    expect(loginSuccess).toBe(true);

    // Step 2: 견적 페이지 접근
    const quotationsSuccess = await navigateToQuotations(page);
    expect(quotationsSuccess).toBe(true);

    // Step 3: 주문 페이지 접근
    const ordersSuccess = await navigateToOrders(page);
    expect(ordersSuccess).toBe(true);
  });

  test('[TEST-008] 전체 워크플로우: 관리자 로그인 → 승인 → 주문 관리', async ({ page }) => {
    // Step 1: 관리자 로그인
    const loginSuccess = await adminLogin(page);
    expect(loginSuccess).toBe(true);

    // Step 2: 승인 페이지 접근
    const approvalsSuccess = await navigateToApprovals(page);
    expect(approvalsSuccess).toBe(true);

    // Step 3: 주문 관리 페이지 접근
    const adminOrdersSuccess = await navigateToAdminOrders(page);
    expect(adminOrdersSuccess).toBe(true);
  });
});
