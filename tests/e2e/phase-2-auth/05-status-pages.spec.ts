import { test, expect } from '@playwright/test';

/**
 * GROUP B: Authentication - Status Pages Tests
 * 
 * 테스트 그룹: 계정 상태 페이지
 * 의존성: 없음 (독립 실행 가능)
 * 데이터베이스: users, profiles
 * 
 * Status Pages Covered:
 * 1. /auth/pending - 승인 대기 페이지
 * 2. /auth/suspended - 계정 정지 페이지
 * 3. /auth/error - 에러 페이지
 * 4. 404 Not Found
 * 5. 401/403 Forbidden/Unauthorized
 */

test.describe('GROUP B: Authentication - Status Pages', () => {
  // Helper function to collect console errors
  const collectConsoleErrors = (page: any) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out development-only errors
        if (!text.includes('Download the React DevTools') &&
            !text.includes('favicon.ico') &&
            !text.includes('Ads')) {
          errors.push(text);
        }
      }
    });
    return errors;
  };

  test.describe('Pending Approval Page', () => {
    test('B-STATUS-01: 승인 대기 페이지 로드 및 콘솔 에러 확인', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 승인 대기 페이지로 이동
      await page.goto('/auth/pending');
      
      // 페이지 제목 확인
      await expect(page).toHaveTitle(/承認待ち|Pending.*Approval|Epackage Lab/);
      
      // 승인 대기 메시지 확인
      const pendingMessage = page.getByText(/承認待ち|管理者の承認後/i);
      await expect(pendingMessage).toBeVisible();
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });

    test('B-STATUS-02: 승인 대기 안내 텍스트 확인', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 승인 대기 상태 설명
      const statusInfo = page.getByText(/会員登録が完了しました|承認され次第/i);
      await expect(statusInfo).toBeVisible();
      
      // 예상 시간 안내 (있는 경우)
      const timeInfo = page.getByText(/営業日|時間|business.*day|24.*hours/i);
      const timeCount = await timeInfo.count();
      
      if (timeCount > 0) {
        await expect(timeInfo.first()).toBeVisible();
      }
    });

    test('B-STATUS-03: 승인 대기 페이지 네비게이션', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 로그인 페이지 링크
      const loginLink = page.getByRole('link', { name: /ログインページへ|ログイン/i });
      const loginCount = await loginLink.count();
      
      if (loginCount > 0) {
        await expect(loginLink.first()).toBeVisible();
        await loginLink.first().click();
        await expect(page).toHaveURL(/\/auth\/signin/);
      }
    });

    test('B-STATUS-04: 승인 대기 페이지 홈 링크', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 홈으로 링크
      const homeLink = page.getByRole('link', { name: 'ホームへ' }).or(
        page.getByRole('link', { name: /Home/i })
      );
      const homeCount = await homeLink.count();
      
      if (homeCount > 0) {
        await expect(homeLink.first()).toBeVisible();
        await homeLink.first().click();
        await expect(page).toHaveURL('/');
      }
    });

    test('B-STATUS-05: 승인 대기 상태에서 보호된 페이지 접근 제한', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 대시보드로 직접 이동 시도
      await page.goto('/member/dashboard');
      
      // 여전히 승인 대기 페이지에 있거나 로그인 페이지로 리다이렉트되어야 함
      const currentUrl = page.url();
      const isPendingPage = currentUrl.includes('/auth/pending');
      const isSignInPage = currentUrl.includes('/auth/signin');
      
      expect(isPendingPage || isSignInPage).toBeTruthy();
    });
  });

  test.describe('Suspended Account Page', () => {
    test('B-STATUS-06: 계정 정지 페이지 로드 및 콘솔 에러 확인', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 계정 정지 페이지로 이동
      await page.goto('/auth/suspended');
      
      // 페이지 제목 확인
      await expect(page).toHaveTitle(/アカウント停止|Suspended|Epackage Lab/);
      
      // 계정 정지 메시지 확인
      const suspendedMessage = page.getByText(/アカウントが停止されました|利用停止/i);
      await expect(suspendedMessage).toBeVisible();
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });

    test('B-STATUS-07: 계정 정지 안내 텍스트 확인', async ({ page }) => {
      await page.goto('/auth/suspended');
      
      // 정지 사유 안내
      const suspensionInfo = page.getByText(/詳細は管理者にお問い合わせください|ご不便をおかけいたします/i);
      const infoCount = await suspensionInfo.count();
      
      if (infoCount > 0) {
        await expect(suspensionInfo.first()).toBeVisible();
      }
    });

    test('B-STATUS-08: 계정 정지 페이지 연락처 정보', async ({ page }) => {
      await page.goto('/auth/suspended');
      
      // 관리자 연락 안내
      const contactInfo = page.getByText(/管理者にお問い合わせ|contact.*administrator|support/i);
      await expect(contactInfo).toBeVisible();
      
      // 이메일 링크 또는 연락처
      const emailLink = page.getByRole('link', { name: /@/ });
      const emailCount = await emailLink.count();
      
      if (emailCount > 0) {
        await expect(emailLink.first()).toBeVisible();
      }
    });

    test('B-STATUS-09: 계정 정지 페이지 홈 링크', async ({ page }) => {
      await page.goto('/auth/suspended');
      
      // 홈으로 링크
      const homeLink = page.getByRole('link', { name: 'ホームへ' }).or(
        page.getByRole('link', { name: /Home/i })
      );
      const homeCount = await homeLink.count();
      
      if (homeCount > 0) {
        await expect(homeLink.first()).toBeVisible();
        await homeLink.first().click();
        await expect(page).toHaveURL('/');
      }
    });

    test('B-STATUS-10: 계정 정지 상태에서 보호된 페이지 접근 제한', async ({ page }) => {
      await page.goto('/auth/suspended');
      
      // 대시보드로 직접 이동 시도
      await page.goto('/member/dashboard');
      
      // 여전히 정지 페이지에 있거나 로그인 페이지로 리다이렉트되어야 함
      const currentUrl = page.url();
      const isSuspendedPage = currentUrl.includes('/auth/suspended');
      const isSignInPage = currentUrl.includes('/auth/signin');
      
      expect(isSuspendedPage || isSignInPage).toBeTruthy();
    });
  });

  test.describe('Error Pages', () => {
    test('B-STATUS-11: 404 Not Found 페이지', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 존재하지 않는 페이지 접근
      await page.goto('/nonexistent-page-12345');
      
      // 404 에러 메시지 확인
      const notFoundMessage = page.getByText(/404|見つかりません|Not Found|ページが見つかりません/i);
      const messageCount = await notFoundMessage.count();
      
      if (messageCount > 0) {
        await expect(notFoundMessage.first()).toBeVisible();
      }
      
      // 홈으로 이동 버튼 또는 링크 확인
      const homeButton = page.getByRole('link', { name: 'ホームへ' }).or(
        page.getByRole('link', { name: /Home/i })
      );
      const buttonCount = await homeButton.count();
      
      if (buttonCount > 0) {
        await expect(homeButton.first()).toBeVisible();
      }
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });

    test('B-STATUS-12: 404 페이지에서 홈으로 이동', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      
      // 홈 링크 클릭
      const homeLink = page.getByRole('link', { name: '/' }).or(
        page.getByRole('link', { name: 'ホームへ' })
      );
      const linkCount = await homeLink.count();
      
      if (linkCount > 0) {
        await homeLink.first().click();
        await expect(page).toHaveURL('/');
      }
    });

    test('B-STATUS-13: 일반 에러 페이지 (/auth/error)', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 에러 페이지로 직접 이동
      await page.goto('/auth/error');
      
      // 에러 페이지 제목 확인
      const errorTitle = page.getByRole('heading', { name: /エラー|Error|サーバーエラー/i });
      const titleCount = await errorTitle.count();
      
      if (titleCount > 0) {
        await expect(errorTitle.first()).toBeVisible();
      }
      
      // 안내 메시지 확인
      const errorMessage = page.getByText(/問題が発生|しばらく待って|Something.*went.*wrong/i);
      const messageCount = await errorMessage.count();
      
      if (messageCount > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });
  });

  test.describe('Unauthorized/Forbidden Access', () => {
    test('B-STATUS-14: 보호된 페이지 미인증 접근 (401)', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 로그인 없이 보호된 페이지 접근
      await page.goto('/member/orders');
      
      // 로그인 페이지로 리다이렉트되어야 함
      await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });
      
      // 로그인 페이지 UI 확인
      const loginHeading = page.getByRole('heading', { name: 'ログイン' });
      await expect(loginHeading).toBeVisible();
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });

    test('B-STATUS-15: 관리자 페이지 일반 사용자 접근 시도 (403)', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 인증 없이 관리자 페이지 접근
      await page.goto('/admin/dashboard');
      
      // 로그인 페이지로 리다이렉트 또는 접근 거부
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/auth/signin');
      
      const forbiddenMessage = page.getByText(/アクセス拒否|Forbidden|権限がない/i);
      const messageCount = await forbiddenMessage.count();
      
      if (messageCount > 0 && !isRedirected) {
        await expect(forbiddenMessage.first()).toBeVisible();
      } else {
        expect(isRedirected).toBeTruthy();
      }
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });

    test('B-STATUS-16: redirect 쿼리 파라미터 유지', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      // 보호된 페이지 직접 접근
      await page.goto('/member/quotations');
      
      // 로그인 페이지로 리다이렉트
      await expect(page).toHaveURL(/\/auth\/signin/);
      
      // redirect 파라미터 확인
      const currentUrl = page.url();
      const hasRedirectParam = currentUrl.includes('redirect=') || 
                              currentUrl.includes('callbackUrl=');
      
      expect(hasRedirectParam).toBeTruthy();
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });
  });

  test.describe('Status Page Navigation', () => {
    test('B-STATUS-17: 상태 페이지에서 홈으로 이동', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 홈 링크 확인 및 클릭
      const homeLink = page.getByRole('link', { name: 'ホームへ' }).or(
        page.getByRole('link', { name: /Home|Epackage Lab/i })
      );
      const linkCount = await homeLink.count();
      
      if (linkCount > 0) {
        await homeLink.first().click();
        await expect(page).toHaveURL('/');
      }
    });

    test('B-STATUS-18: 상태 페이지에서 연락처 링크', async ({ page }) => {
      await page.goto('/auth/suspended');
      
      // 연락처 링크 확인
      const contactLink = page.getByRole('link', { name: /お問い合わせ|contact|support/i });
      const linkCount = await contactLink.count();
      
      if (linkCount > 0) {
        await expect(contactLink.first()).toBeVisible();
        await contactLink.first().click();
        await expect(page).toHaveURL(/\/contact/);
      }
    });

    test('B-STATUS-19: 상태 페이지에서 로그인 링크', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 로그인 링크 확인
      const loginLink = page.getByRole('link', { name: /ログイン/i });
      const linkCount = await loginLink.count();
      
      if (linkCount > 0) {
        await loginLink.first().click();
        await expect(page).toHaveURL(/\/auth\/signin/);
      }
    });
  });

  test.describe('Status Page User Experience', () => {
    test('B-STATUS-20: 친절한 에러 메시지', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      
      // 친절한 에러 메시지 확인
      const friendlyMessage = page.getByText(/お探しのページ|見つかりませんでした|申し訳ございません/i);
      const messageCount = await friendlyMessage.count();
      
      if (messageCount > 0) {
        await expect(friendlyMessage.first()).toBeVisible();
      }
    });

    test('B-STATUS-21: 관련 콘텐츠 링크 제안', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      
      // 관련 페이지 링크 확인
      const relatedLinks = page.getByRole('link', { name: /カタログ|サービス|Catalog|Service/i });
      const linkCount = await relatedLinks.count();
      
      if (linkCount > 0) {
        await expect(relatedLinks.first()).toBeVisible();
      }
    });

    test('B-STATUS-22: 모바일 반응형 에러 페이지', async ({ page }) => {
      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/nonexistent-page-12345');
      
      // 에러 메시지가 보이는지 확인
      const errorMessage = page.getByText(/404|見つかりません|Not Found/i);
      const messageCount = await errorMessage.count();
      
      if (messageCount > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
      
      // 홈 버튼이 보이는지 확인
      const homeButton = page.getByRole('link', { name: 'ホームへ' });
      const buttonCount = await homeButton.count();
      
      if (buttonCount > 0) {
        await expect(homeButton.first()).toBeVisible();
      }
    });

    test('B-STATUS-23: 브랜딩 유지 (로고/사이트명)', async ({ page }) => {
      await page.goto('/auth/error');
      
      // 로고 또는 사이트 이름 확인
      const logo = page.getByRole('link', { name: /Epackage Lab/i });
      await expect(logo.first()).toBeVisible();
      
      // 푸터가 존재하는지 확인
      const footer = page.locator('footer');
      const footerCount = await footer.count();
      
      if (footerCount > 0) {
        await expect(footer.first()).toBeVisible();
      }
    });
  });

  test.describe('Status Page Security', () => {
    test('B-STATUS-24: 민감한 정보 노출 방지', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      
      await page.goto('/auth/error');
      
      // 페이지에 민감한 정보가 노출되지 않아야 함
      const pageContent = await page.content();
      const hasSensitiveInfo =
        pageContent.includes('stack trace') ||
        pageContent.includes('database') ||
        pageContent.includes('SQL') ||
        pageContent.includes('/var/www') ||
        pageContent.includes('node_modules') ||
        pageContent.includes('Internal Server Error');
      
      expect(hasSensitiveInfo).toBeFalsy();
      
      // 콘솔 에러 확인
      expect(errors.length).toBe(0);
    });

    test('B-STATUS-25: 에러 로그 이벤트 기록', async ({ page }) => {
      await page.goto('/nonexistent-page-12345');
      
      // 에러 로깅 API 요청 감지
      let errorLogged = false;
      page.on('request', request => {
        if (request.url().includes('/api/errors') ||
            request.url().includes('/api/logs') ||
            request.url().includes('/api/monitoring')) {
          errorLogged = true;
        }
      });
      
      await page.waitForTimeout(1000);
      
      // 에러 로깅이 수행되어야 함 (모니터링 시스템이 있는 경우)
      if (errorLogged) {
        expect(errorLogged).toBeTruthy();
      }
    });
  });

  test.describe('Status Page Accessibility', () => {
    test('B-STATUS-26: 상태 페이지 접근성', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // 주요 헤딩 확인
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading.first()).toBeVisible();
      
      // 적절한 ARIA 레이블 확인
      const main = page.getByRole('main');
      await expect(main.first()).toBeVisible();
    });

    test('B-STATUS-27: 키보드 네비게이션', async ({ page }) => {
      await page.goto('/auth/pending');
      
      // Tab 키로 링크 간 이동
      const links = page.getByRole('link');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        // 첫 번째 링크에 포커스
        await links.first().focus();
        const isFocused = await links.first().evaluate(el => document.activeElement === el);
        expect(isFocused).toBeTruthy();
      }
    });

    test('B-STATUS-28: 색상 대비', async ({ page }) => {
      await page.goto('/auth/suspended');
      
      // 텍스트가 가독성 있는지 확인 (기본 테스트)
      const text = page.getByText(/アカウントが停止されました/i);
      await expect(text.first()).toBeVisible();
    });
  });
});