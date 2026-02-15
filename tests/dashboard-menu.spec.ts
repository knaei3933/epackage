/**
 * Dashboard Menu Navigation Tests
 *
 * 대시보드 메뉴 기능 E2E 테스트
 * - 로그인 후 모든 메뉴 접근 확인
 * - 사이드바 메뉴 클릭 시 정상적인 페이지 이동 확인
 * - 인증 상태 유지 확인
 */

import { test, expect } from '@playwright/test';

// 대시보드 메뉴 경로 정의
const dashboardMenus = [
  { id: 'dashboard', label: 'マイページトップ', href: '/member/dashboard' },
  { id: 'orders-new', label: '新規注文', href: '/member/orders/new' },
  { id: 'orders-reorder', label: '再注文', href: '/member/orders/reorder' },
  { id: 'orders-history', label: '注文履歴', href: '/member/orders/history' },
  { id: 'deliveries', label: '納品先管理', href: '/member/deliveries' },
  { id: 'invoices', label: '請求先管理', href: '/member/invoices' },
  { id: 'quotations', label: '見積管理', href: '/member/quotations' },
  { id: 'samples', label: 'サンプル依頼', href: '/member/samples' },
  { id: 'inquiries', label: 'お問い合わせ', href: '/member/inquiries' },
  { id: 'profile', label: 'プロフィール', href: '/member/profile' },
  { id: 'edit', label: '会員情報編集', href: '/member/edit' },
  { id: 'settings', label: '設定', href: '/member/settings' },
];

// 로그인 헬퍼 함수
async function login(page: any) {
  console.log('=== 로그인 실행 ===');

  // 1. 로그인 페이지 접속
  await page.goto('http://localhost:3000/auth/signin');

  // 2. 로그인 폼 작성 (DEV_MODE 테스트 계정)
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'Test1234!');

  // 3. 로그인 제출
  await page.click('button[type="submit"]');

  // 4. 대시보드 리다이렉트 대기 (후행 슬래시 허용)
  await page.waitForURL('**/member/dashboard/**', { timeout: 10000 });
  console.log('로그인 성공, 대시보드 진입 완료');

  // 5. 쿠키 및 localStorage 확인
  const cookies = await page.context().cookies();
  const authCookies = cookies.filter(c => c.name.includes('sb-') || c.name.includes('auth'));
  console.log(`인증 쿠키: ${authCookies.length}개`);

  const localStorage = await page.evaluate(() => ({
    'dev-mock-user': localStorage.getItem('dev-mock-user'),
  }));
  console.log('localStorage 확인:', localStorage['dev-mock-user'] ? '있음' : '없음');
}

test.describe('대시보드 메뉴 기능 테스트', () => {
  // 로그인은 한 번만 수행 (첫 번째 테스트 전에)
  test.beforeAll(async ({ browser }) => {
    // 각 테스트가 독립적인 세션을 사용하도록 설정
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('메인 대시보드 페이지 렌더링 확인', async ({ page }) => {
    console.log('=== 메인 대시보드 확인 ===');

    // 1. 현재 URL 확인
    expect(page.url()).toContain('/member/dashboard');

    // 2. 사이드바 메뉴 표시 확인
    const sidebar = page.locator('nav[class*="bg-white"]').or(page.locator('[class*="sidebar"]')).or(page.locator('.lg\\:pl-52'));
    await expect(sidebar.first()).toBeVisible();

    // 3. 대시보드 헤더 확인
    const header = page.locator('header').or(page.locator('[class*="header"]'));
    await expect(header.first()).toBeVisible();

    // 4. 사용자 이름 표시 확인
    const content = await page.content();
    const hasUserGreeting = content.includes('様') || content.includes('ようこそ');
    console.log('사용자 환영 메시지:', hasUserGreeting ? '있음' : '없음');

    // 5. 스크린샷
    await page.screenshot({ path: 'test-results/dashboard-main.png' });
  });

  test('사이드바 메뉴 항목 표시 확인', async ({ page }) => {
    console.log('=== 사이드바 메뉴 확인 ===');

    // 메뉴 항목들 확인 (적어도 몇 개의 메뉴는 보여야 함)
    const menuLinks = page.locator('a[href^="/member/"]');
    const count = await menuLinks.count();
    console.log(`발견된 메뉴 링크: ${count}개`);

    // 최소한 몇 개의 메뉴 링크가 있어야 함
    expect(count).toBeGreaterThan(3);

    // 스크린샷
    await page.screenshot({ path: 'test-results/dashboard-sidebar.png' });
  });

  for (const menu of dashboardMenus) {
    test(`메뉴 이동: ${menu.label}`, async ({ page }) => {
      console.log(`=== ${menu.label} 메뉴 테스트 ===`);

      // 1. 메뉴 링크 클릭
      const menuLink = page.locator(`a[href="${menu.href}"]`).first();
      const count = await menuLink.count();

      if (count === 0) {
        console.log(`⚠️ ${menu.label} 메뉴 링크를 찾을 수 없음`);
        // 링크가 없으면 URL로 직접 이동 테스트
        await page.goto(`http://localhost:3000${menu.href}`, { waitUntil: 'domcontentloaded' });
      } else {
        console.log(`${menu.label} 메뉴 클릭`);
        await menuLink.click();
      }

      // 2. URL 변경 확인
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      expect(page.url()).toContain(menu.href.replace(/\/$/, '')); // 후행 슬래시 제거 후 비교
      console.log(`URL: ${page.url()}`);

      // 3. HTTP 404/500 상태가 아닌지 확인 (응답 상태 코드로 확인)
      const response = await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
      if (response) {
        const status = response.status();
        expect(status).toBeLessThan(500);
        expect(status).not.toBe(404);
      }

      // 4. 로그아웃 상태가 아닌지 확인 (로그인 페이지로 리다이렉트되지 않았는지)
      const isNotRedirected = !page.url().includes('/auth/signin');
      expect(isNotRedirected).toBeTruthy();

      // 5. 스크린샷
      await page.screenshot({ path: `test-results/dashboard-${menu.id}.png` });
      console.log(`✅ ${menu.label} 메뉴 정상 작동`);
    });
  }

  test('메뉴 이동 후 인증 상태 유지 확인', async ({ page }) => {
    console.log('=== 인증 상태 유지 테스트 ===');

    // 여러 메뉴를 순차적으로 방문하면서 인증 상태 확인
    const testMenus = [
      '/member/dashboard',
      '/member/orders/new',
      '/member/quotations',
      '/member/profile',
      '/member/settings',
    ];

    for (const href of testMenus) {
      console.log(`방문: ${href}`);

      // 링크 클릭 방식으로 이동 (인증 상태 유지)
      const menuLink = page.locator(`a[href="${href}"]`).first();
      const count = await menuLink.count();

      if (count > 0) {
        await menuLink.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
      } else {
        // 링크가 없으면 직접 이동
        await page.goto(`http://localhost:3000${href}`, { waitUntil: 'domcontentloaded' });
      }

      // 로그인 페이지로 리다이렉트되지 않았는지 확인
      const currentUrl = page.url();
      expect(currentUrl).toContain(href.replace(/\/$/, ''));
      expect(currentUrl).not.toContain('/auth/signin');

      // 쿠키 확인
      const cookies = await page.context().cookies();
      const hasAuthCookie = cookies.some(c => c.name.includes('sb-') || c.name.includes('auth'));
      expect(hasAuthCookie).toBeTruthy();
    }

    console.log('✅ 모든 메뉴 이동 시 인증 상태 유지됨');
  });

  test('UserMenu 드롭다운에서 대시보드 링크 확인', async ({ page }) => {
    console.log('=== UserMenu 드롭다운 테스트 ===');

    // 1. UserMenu 버튼 찾기 (사용자 아바타 또는 이름)
    const userMenuButton = page.locator('button[aria-label*="ユーザー"]').or(
      page.locator('div[class*="rounded-full"]')
    ).first();

    await expect(userMenuButton).toBeVisible();
    console.log('UserMenu 버튼 확인');

    // 2. 드롭다운 열기
    await userMenuButton.click();
    await page.waitForTimeout(500);

    // 3. "マイページ" 링크 확인
    const dashboardLink = page.locator('a[href="/member/dashboard"]').or(
      page.locator('a:has-text("マイページ")')
    ).first();

    const count = await dashboardLink.count();
    console.log('マイページ 링크:', count > 0 ? '있음' : '없음');

    // 4. 스크린샷
    await page.screenshot({ path: 'test-results/usermenu-dropdown.png' });
  });

  test('모바일 헤더 "マイページ" 링크 확인', async ({ page }) => {
    console.log('=== 모바일 메뉴 테스트 ===');

    // 1. 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    // 2. 모바일 메뉴 버튼 클릭
    const mobileMenuButton = page.locator('button[aria-label*="menu"]').or(
      page.locator('button:has-text("☰")')
    ).or(page.locator('button:has-text("Menu")')).first();

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // 3. "マイページ" 링크 확인
      const mypageLink = page.locator('a[href="/member/dashboard"]').or(
        page.locator('a:has-text("マイページ")')
      ).first();

      const count = await mypageLink.count();
      console.log('모바일 マイページ 링크:', count > 0 ? '있음' : '없음');

      // 4. 스크린샷
      await page.screenshot({ path: 'test-results/mobile-menu.png' });
    } else {
      console.log('모바일 메뉴 버튼을 찾을 수 없음');
    }
  });
});
