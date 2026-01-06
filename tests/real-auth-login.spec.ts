import { test, expect } from '@playwright/test';

test.describe('실제 Supabase 인증 테스트', () => {
  test.describe.configure({ mode: 'serial' });

  test('MEMBER 계정 로그인 - member@test.com', async ({ page }) => {
    console.log('=== MEMBER 계정 로그인 테스트 시작 ===');

    // 1. 로그인 페이지 접속
    await page.goto('http://localhost:3000/auth/signin');
    console.log('1. 로그인 페이지 로드됨:', page.url());

    // 2. 로그인 폼 작성
    await page.fill('input[type="email"]', 'member@test.com');
    await page.fill('input[type="password"]', 'Member1234!');
    console.log('2. 로그인 폼 작성 완료');

    // 3. 로그인 제출
    await page.click('button[type="submit"]');
    console.log('3. 로그인 버튼 클릭');

    // 4. 리다이렉트 대기 (대시보드로 이동해야 함)
    try {
      await page.waitForURL('**/member/dashboard/**', { timeout: 10000 });
      console.log('4. 리다이렉트 완료, URL:', page.url());

      // 5. 대시보드가 로드되었는지 확인
      const content = await page.content();
      const hasDashboard = content.includes('dashboard') || content.includes('ダッシュボード') || content.includes('注文') || content.includes('見積');
      console.log('5. 대시보드 내용 확인:', hasDashboard);

      // 6. 쿠키 확인 (Supabase 쿠키)
      const cookies = await page.context().cookies();
      const supabaseCookies = cookies.filter(c => c.name.includes('sb-'));
      console.log('6. Supabase 쿠키 개수:', supabaseCookies.length);
      supabaseCookies.forEach(cookie => {
        console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
      });

      // 7. 스크린샷
      await page.screenshot({ path: 'test-results/member-login-success.png' });
      console.log('7. 스크린샷 저장 완료');

      expect(page.url()).toContain('/member/dashboard');
      expect(supabaseCookies.length).toBeGreaterThan(0);
    } catch (error) {
      // 로그인 실패 시 스크린샷 및 콘솔 로그 저장
      await page.screenshot({ path: 'test-results/member-login-failed.png' });
      console.error('로그인 실패:', error);
      console.log('현재 URL:', page.url());

      // 페이지 내용 확인
      const content = await page.content();
      if (content.includes('error') || content.includes('Error')) {
        console.log('페이지에 에러 메시지가 있습니다');
      }

      throw error;
    }
  });

  test('ADMIN 계정 로그인 - admin@epackage-lab.com', async ({ page }) => {
    console.log('=== ADMIN 계정 로그인 테스트 시작 ===');

    // 1. 로그인 페이지 접속
    await page.goto('http://localhost:3000/auth/signin');
    console.log('1. 로그인 페이지 로드됨:', page.url());

    // 2. 로그인 폼 작성
    await page.fill('input[type="email"]', 'admin@epackage-lab.com');
    await page.fill('input[type="password"]', 'Admin1234!');
    console.log('2. 로그인 폼 작성 완료');

    // 3. 로그인 제출
    await page.click('button[type="submit"]');
    console.log('3. 로그인 버튼 클릭');

    // 4. 리다이렉트 대기 (관리자 대시보드로 이동해야 함)
    try {
      await page.waitForURL('**/admin/dashboard/**', { timeout: 10000 });
      console.log('4. 리다이렉트 완료, URL:', page.url());

      // 5. 대시보드가 로드되었는지 확인
      const content = await page.content();
      const hasDashboard = content.includes('dashboard') || content.includes('ダッシュボード') || content.includes('注文') || content.includes('見積') || content.includes('管理');
      console.log('5. 대시보드 내용 확인:', hasDashboard);

      // 6. 쿠키 확인 (Supabase 쿠키)
      const cookies = await page.context().cookies();
      const supabaseCookies = cookies.filter(c => c.name.includes('sb-'));
      console.log('6. Supabase 쿠키 개수:', supabaseCookies.length);
      supabaseCookies.forEach(cookie => {
        console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
      });

      // 7. 스크린샷
      await page.screenshot({ path: 'test-results/admin-login-success.png' });
      console.log('7. 스크린샷 저장 완료');

      expect(page.url()).toContain('/admin/dashboard');
      expect(supabaseCookies.length).toBeGreaterThan(0);
    } catch (error) {
      // 로그인 실패 시 스크린샷 및 콘솔 로그 저장
      await page.screenshot({ path: 'test-results/admin-login-failed.png' });
      console.error('로그인 실패:', error);
      console.log('현재 URL:', page.url());

      // 페이지 내용 확인
      const content = await page.content();
      if (content.includes('error') || content.includes('Error')) {
        console.log('페이지에 에러 메시지가 있습니다');
      }

      throw error;
    }
  });
});
