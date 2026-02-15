/**
 * Debug Admin Login - Console Error Capture
 *
 * 관리자 로그인 시 발생하는 콘솔 에러를 캡처하는 디버그 테스트
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'Admin1234!',
};

test.describe('Debug Admin Login', () => {
  test('capture console errors during admin login', async ({ page }) => {
    // 콘솔 메시지 캡처
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // 페이지 에러 캡처
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.log('[Page Error]', error.message);
    });

    // 네트워크 요청/응답 캡처
    const networkRequests: { url: string; method: string; status?: number; response?: string }[] = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
      });
    });

    page.on('response', response => {
      const req = networkRequests.find(r => r.url === response.url());
      if (req) {
        req.status = response.status();
        req.response = response.status().toString();
      }
    });

    // 로그인 페이지 이동
    console.log('\n=== 관리자 로그인 시도 ===');
    console.log(`Email: ${ADMIN_USER.email}`);
    console.log(`Password: ${ADMIN_USER.password}\n`);

    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    console.log('[1] 로그인 페이지 로드됨');
    console.log('  URL:', page.url());

    // 로그인 폼 작성
    await page.fill('input[type="email"]', ADMIN_USER.email);
    await page.fill('input[type="password"]', ADMIN_USER.password);

    console.log('[2] 폼 작성 완료');

    // 제출 버튼 클릭 전 스크린샷
    await page.screenshot({ path: 'test-results/screenshots/debug-01-before-submit.png' });

    // 제출 버튼 클릭
    console.log('[3] 제출 버튼 클릭...');
    await page.click('button[type="submit"]');

    // 응답 대기
    await page.waitForTimeout(5000);
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    console.log('[4] 제출 후 상태');
    console.log('  URL:', page.url());

    // 제출 후 스크린샷
    await page.screenshot({ path: 'test-results/screenshots/debug-02-after-submit.png', fullPage: true });

    // 콘솔 메시지 출력
    console.log('\n=== 콘솔 메시지 ===');
    consoleMessages.forEach(msg => console.log('  ', msg));

    // 콘솔 에러 출력
    if (consoleErrors.length > 0) {
      console.log('\n=== 콘솔 에러 ===');
      consoleErrors.forEach(err => console.log('  ❌', err));
    }

    // 페이지 에러 출력
    if (pageErrors.length > 0) {
      console.log('\n=== 페이지 에러 ===');
      pageErrors.forEach(err => console.log('  ❌', err));
    }

    // 네트워크 요청 출력
    console.log('\n=== 네트워크 요청 ===');
    networkRequests.slice(-10).forEach(req => {
      const icon = req.status && req.status >= 400 ? '❌' : '✅';
      console.log(`  ${icon} ${req.method} ${req.url} -> ${req.status || 'pending'}`);
    });

    // 페이지 내용 확인
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      if (bodyText.includes('ログイン') || bodyText.includes('サインイン')) {
        console.log('\n❌ 여전히 로그인 페이지에 있음');
      } else if (page.url().includes('/admin/') || page.url().includes('/member/')) {
        console.log('\n✅ 로그인 성공! 대시보드로 이동함');
      } else {
        console.log('\n⚠️  다른 페이지로 리다이렉트됨');
      }
    }

    // 결과 파일 저장
    const report = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      consoleMessages,
      consoleErrors,
      pageErrors,
      networkRequests: networkRequests.slice(-20),
    };

    const fs = require('fs');
    fs.mkdirSync('test-results/debug', { recursive: true });
    fs.writeFileSync(
      'test-results/debug/admin-login-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\n=== 리포트 저장됨 ===');
    console.log('  test-results/debug/admin-login-report.json');

    // 테스트는 항상 통과하도록 (정보 수집이 목적)
    expect(true).toBe(true);
  });
});
