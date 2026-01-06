import { test, expect } from '@playwright/test';

test.describe('로그인 디버그 테스트', () => {
  test('로그인 과정 단계별 확인', async ({ page }) => {
    console.log('=== 로그인 디버그 테스트 시작 ===');

    // 1. 로그인 페이지 접속
    await page.goto('http://localhost:3000/auth/signin');
    console.log('1. 로그인 페이지 로드됨, URL:', page.url());

    // 2. 폼이 렌더링될 때까지 대기
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('2. 폼 렌더링 완료');

    // 3. 이메일 입력 필드 찾기 (placeholder로 찾기)
    const emailInput = page.getByPlaceholder('example@company.com');
    await expect(emailInput).toBeVisible();
    console.log('3. 이메일 입력 필드 찾음');

    // 4. 이메일 입력
    await emailInput.click();
    await emailInput.fill('test@test.com');
    console.log('4. 이메일 입력 완료:', await emailInput.inputValue());

    // 5. 비밀번호 입력 필드 찾기 (placeholder로 찾기)
    const passwordInput = page.getByPlaceholder('••••••••');
    await expect(passwordInput).toBeVisible();
    console.log('5. 비밀번호 입력 필드 찾음');

    // 6. 비밀번호 입력
    await passwordInput.click();
    await passwordInput.fill('Test1234!');
    console.log('6. 비밀번호 입력 완료');

    // 7. 폼 제출 전 상태 스냅샷
    await page.screenshot({ path: 'test-results/login-before-submit.png' });
    console.log('7. 제출 전 스크린샷 저장');

    // 8. 제출 버튼 클릭 (type="submit" 속성으로 찾기)
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: 'ログイン' });
    await expect(submitButton).toBeVisible();
    console.log('8. 제출 버튼 찾음, 클릭 시작...');

    // 9. 네트워크 요청 감시하며 제출
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/auth/signin')),
      submitButton.click(),
    ]);
    console.log('9. 제출 버튼 클릭 완료, API 응답 수신');

    // 10. API 응답 확인
    const responseStatus = response.status();
    console.log('10. API 응답 상태:', responseStatus);
    try {
      const responseBody = await response.text();
      console.log('    API 응답 본문 (일부):', responseBody.substring(0, 200));
    } catch (e) {
      console.log('    API 응답 본문: (리다이렉트 응답)');
    }

    // 11. URL 변경 대기 (window.location.href 사용 시 네비게이션 완료 대기 필요)
    await page.waitForURL('**/member/**', { timeout: 5000 }).catch(() => {
      console.log('11. 멤버 페이지로 네비게이션되지 않음, 현재 URL:', page.url());
    });
    console.log('11. 현재 URL:', page.url());

    // 12. 쿠키 확인
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => c.name.includes('sb-'));
    console.log('12. 인증 쿠키 개수:', authCookies.length);
    authCookies.forEach(c => console.log(`    - ${c.name}: ${c.value.substring(0, 30)}...`));

    // 13. localStorage 확인
    const localStorage = await page.evaluate(() => {
      return {
        'dev-mock-user': window.localStorage.getItem('dev-mock-user'),
      };
    });
    console.log('13. localStorage 상태:', localStorage['dev-mock-user'] ? '데이터 있음' : '데이터 없음');

    // 14. 최종 스크린샷
    await page.screenshot({ path: 'test-results/login-after-submit.png' });
    console.log('14. 제출 후 스크린샷 저장');

    // 15. 성공 여부 판단
    const isOnMemberPage = page.url().includes('/member');
    const hasAuthCookies = authCookies.length > 0;
    const hasLocalStorage = !!localStorage['dev-mock-user'];

    console.log('=== 테스트 결과 ===');
    console.log('- 멤버 페이지 도달:', isOnMemberPage);
    console.log('- 인증 쿠키 있음:', hasAuthCookies);
    console.log('- localStorage 있음:', hasLocalStorage);

    if (isOnMemberPage && hasAuthCookies && hasLocalStorage) {
      console.log('✅ 로그인 성공!');
    } else {
      console.log('❌ 로그인 실패 또는 부분 성공');

      // 페이지 내용 확인
      const pageContent = await page.content();
      const hasErrorMessage = pageContent.includes('エラー') || pageContent.includes('error');

      if (hasErrorMessage) {
        // 에러 메시지 추출
        const errorElement = page.locator('text=/エラー|error/').first();
        if (await errorElement.isVisible()) {
          console.log('에러 메시지:', await errorElement.textContent());
        }
      }
    }

    expect(hasAuthCookies).toBe(true);
  });
});
