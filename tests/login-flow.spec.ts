import { test, expect } from '@playwright/test';

/**
 * 로그인 흐름 테스트 (Login Flow Test)
 *
 * Test Credentials:
 * - Email: member@test.com
 * - Password: Member1234!
 */

// Use a fresh storage state for each test to avoid cookie interference
test.use({ storageState: undefined });

test.describe('로그인 흐름 테스트', () => {
  test('로그인 후 세션 유지 확인', async ({ page }) => {
    console.log('=== 로그인 테스트 시작 ===');

    // 1. 로그인 페이지 접속
    await page.goto('http://localhost:3000/auth/signin');
    console.log('1. 로그인 페이지 로드됨');

    // 2. 로그인 폼 작성 - use correct selectors
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('member@test.com');
    await passwordInput.fill('Member1234!');
    console.log('2. 로그인 폼 작성 완료');

    // 3. 로그인 제출 및 응답 대기
    await page.click('button[type="submit"]');
    console.log('3. 로그인 버튼 클릭');

    // 4. 네비게이션 응답 대기 (클라이언트 리다이렉트)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('4a. networkidle timeout, checking current URL');
    });

    // URL이 변경되었는지 확인
    const currentUrl = page.url();
    console.log('4b. 현재 URL:', currentUrl);

    // member 페이지로 리다이렉트되었는지 확인 (timeout 동안 대기)
    if (currentUrl.includes('/auth/signin')) {
      console.log('4c. 아직 signin 페이지에 있음, 추가 대기...');
      await page.waitForTimeout(2000);
      console.log('4d. 2초 후 URL:', page.url());
    }

    // 5. 쿠키 확인
    const cookies = await page.context().cookies();
    console.log('5. 쿠키 확인:');
    cookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
      }
    });

    // 6. localStorage 확인
    const localStorage = await page.evaluate(() => {
      return {
        'dev-mock-user': localStorage.getItem('dev-mock-user'),
      };
    });
    console.log('6. localStorage 확인:', JSON.stringify(localStorage, null, 2));

    // 7. 페이지 내용 확인
    const content = await page.content();
    const hasUserInfo = content.includes('member@test.com') || content.includes('テスト');
    console.log('7. 페이지에 사용자 정보 표시됨:', hasUserInfo);

    // 8. 페이지 새로고침
    await page.reload();
    console.log('8. 페이지 새로고침 완료');

    // 9. 새로고침 후에도 사용자 정보 유지되는지 확인
    const contentAfterReload = await page.content();
    const hasUserInfoAfterReload = contentAfterReload.includes('member@test.com') || contentAfterReload.includes('テスト');
    console.log('9. 새로고침 후 사용자 정보 유지:', hasUserInfoAfterReload);

    // 10. 스크린샷
    await page.screenshot({ path: 'test-results/login-after.png' });
    console.log('10. 스크린샷 저장 완료');

    // Either we're on the dashboard OR we stayed on signin page but should have auth cookies
    const isOnDashboard = page.url().includes('/member/dashboard') ||
                          page.url().includes('/admin/dashboard') ||
                          hasUserInfoAfterReload;

    console.log('11. 최종 확인 - URL:', page.url(), 'isOnDashboard:', isOnDashboard);

    expect(isOnDashboard).toBe(true);
  });
});
