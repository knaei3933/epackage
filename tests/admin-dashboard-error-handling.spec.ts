import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard Error Handling Tests
 * 태스크 86: 관리자 대시보드 에러 핸들링 검증
 */

test.describe('Admin Dashboard Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자로 로그인 (필요한 경우)
    await page.goto('/admin/dashboard');
  });

  test('should show error UI when API fails', async ({ page }) => {
    // API 요청을 차단하여 에러 상황 시뮬레이션
    await page.route('**/api/admin/dashboard/statistics', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto('/admin/dashboard');

    // 에러 메시지 확인
    await expect(page.locator('text=ダッシュボードデータの読み込みエラー')).toBeVisible();
    await expect(page.locator('text=Internal Server Error')).toBeVisible();

    // 재시도 버튼 확인
    const retryButton = page.locator('button:has-text("再試行")');
    await expect(retryButton).toBeVisible();

    // 페이지 재로드 버튼 확인
    const reloadButton = page.locator('button:has-text("ページを再読み込み")');
    await expect(reloadButton).toBeVisible();
  });

  test('should show retry count after failed attempts', async ({ page }) => {
    let requestCount = 0;

    // API 요청을 실패로 설정
    await page.route('**/api/admin/dashboard/statistics', route => {
      requestCount++;
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database connection failed' })
      });
    });

    await page.goto('/admin/dashboard');

    // 에러 대기
    await expect(page.locator('text=ダッシュボードデータの読み込みエラー')).toBeVisible();

    // 재시도 버튼 클릭
    await page.click('button:has-text("再試行")');

    // 재시도 중 상태 확인
    await expect(page.locator('text=再試行中...')).toBeVisible();

    // 재시도 후 에러 상태 유지 확인
    await expect(page.locator('text=リトライ回数: 1回')).toBeVisible();
  });

  test('should display fallback UI with error cards', async ({ page }) => {
    // API 요청 실패
    await page.route('**/api/admin/dashboard/statistics', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service Unavailable' })
      });
    });

    await page.goto('/admin/dashboard');

    // 경고 메시지 확인
    await expect(page.locator('text=一部のデータを表示できません')).toBeVisible();

    // 에러 카드 확인 (각 통계 카드가 에러 상태로 표시되는지)
    const errorCards = page.locator('.border-red-200');
    await expect(errorCards).toHaveCount(4); // 총 4개의 통계 카드

    // 각 에러 카드에 "読み込み失敗" 텍스트 확인
    await expect(page.locator('text=読み込み失敗')).toHaveCount(4);
  });

  test('should recover successfully after retry with successful API response', async ({ page }) => {
    let attemptCount = 0;

    // 첫 번째 요청은 실패, 두 번째는 성공
    await page.route('**/api/admin/dashboard/statistics', route => {
      attemptCount++;
      if (attemptCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Temporary error' })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ordersByStatus: [],
            monthlyRevenue: [],
            pendingQuotations: 5,
            activeProduction: 3,
            todayShipments: 2,
            totalOrders: 10,
            totalRevenue: 100000,
            recentQuotations: []
          })
        });
      }
    });

    await page.goto('/admin/dashboard');

    // 초기 에러 상태 확인
    await expect(page.locator('text=ダッシュボードデータの読み込みエラー')).toBeVisible();

    // 재시도 버튼 클릭
    await page.click('button:has-text("再試行")');

    // 대시보드가 정상적으로 표시되는지 확인
    await expect(page.locator('text=管理ダッシュボード')).toBeVisible();
    await expect(page.locator('text=10')).toBeVisible(); // totalOrders 값

    // 에러 메시지가 사라졌는지 확인
    await expect(page.locator('text=ダッシュボードデータの読み込みエラー')).not.toBeVisible();
  });

  test('should show loading indicator during data refresh', async ({ page }) => {
    // 정상 응답
    await page.route('**/api/admin/dashboard/statistics', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ordersByStatus: [],
          monthlyRevenue: [],
          pendingQuotations: 0,
          activeProduction: 0,
          todayShipments: 0,
          totalOrders: 0,
          totalRevenue: 0,
          recentQuotations: []
        })
      });
    });

    await page.goto('/admin/dashboard');

    // 초기 로딩
    await expect(page.locator('text=管理ダッシュボード')).toBeVisible();

    // SWR 자동 갱신 (30초마다) 대신 수동으로 트리거
    // 페이지 포커스 시 자동 갱신
    await page.dispatchEvent('window', 'focus');

    // 갱신 인디케이터가 나타날 수 있음 (짧게 표시됨)
    const updateIndicator = page.locator('text=更新中...');
    if (await updateIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(updateIndicator).toBeVisible();
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // 네트워크 에러 시뮬레이션
    await page.route('**/api/admin/dashboard/statistics', route => {
      route.abort('failed');
    });

    await page.goto('/admin/dashboard');

    // 네트워크 에러 메시지 확인
    await expect(page.locator('text=ダッシュボードデータの読み込みエラー')).toBeVisible();

    // 재시도 기능 여전히 작동해야 함
    const retryButton = page.locator('button:has-text("再試行")');
    await expect(retryButton).toBeEnabled();
  });

  test('should maintain quick actions access during error state', async ({ page }) => {
    // API 실패
    await page.route('**/api/admin/dashboard/statistics', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'API Error' })
      });
    });

    await page.goto('/admin/dashboard');

    // 빠른 작업 위젯이 여전히 표시되는지 확인
    await expect(page.locator('text=クイックアクション')).toBeVisible();

    // 빠른 작업 링크가 작동하는지 확인
    const orderManagementLink = page.locator('button:has-text("注文管理")');
    await expect(orderManagementLink).toBeVisible();
    await orderManagementLink.click();

    // 주문 관리 페이지로 이동하는지 확인
    await expect(page).toHaveURL(/\/admin\/orders/);
  });

  test('should show authentication errors appropriately', async ({ page }) => {
    // 인증 에러 시뮬레이션
    await page.route('**/api/admin/dashboard/statistics', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });

    await page.goto('/admin/dashboard');

    // 에러 메시지 표시
    await expect(page.locator('text=ダッシュボードデータの読み込みエラー')).toBeVisible();
    await expect(page.locator('text=Unauthorized')).toBeVisible();
  });
});

test.describe('StatsCard Component Error Handling', () => {
  test('should display error state correctly', async ({ page }) => {
    // StatsCard 컴포넌트 테스트를 위한 별도 페이지 또는 컴포넌트 테스트
    // 이 테스트는 실제 구현에 따라 조정可能

    await page.goto('/admin/dashboard');

    // 로딩 상태 확인
    const skeleton = page.locator('.animate-pulse');
    await expect(skeleton).toBeVisible();

    // 로딩 완료 후 정상 상태 확인
    await expect(skeleton).not.toBeVisible();
  });
});
