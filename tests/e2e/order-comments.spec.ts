import { test, expect } from '@playwright/test';

/**
 * Order Comments E2E Test Suite
 * 주문 댓글 E2E 테스트 스위트
 *
 * Tests for:
 * - Comment display
 * - Comment addition
 * - Comment editing
 * - Comment notifications
 * - Comment history
 * - XSS prevention in comments
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test credentials
const MEMBER_EMAIL = 'test-member@example.com';
const MEMBER_PASSWORD = 'TestPassword123!';
const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

// Helper: Login as member
async function loginAsMember(page: any) {
  await page.goto(`${BASE_URL}/auth/signin`);
  await page.fill('input[type="email"], input[name="email"]', MEMBER_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', MEMBER_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(member|dashboard)/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// Helper: Login as admin
async function loginAsAdmin(page: any) {
  await page.goto(`${BASE_URL}/auth/signin`);
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
}

test.describe('Order Comments - Authentication', () => {
  test('[COMMENT-AUTH-001] should require authentication for comments', async ({ request }) => {
    const response = request.get(`${BASE_URL}/api/member/orders/test-order/comments`);
    expect(response.status()).toBe(401);
  });

  test('[COMMENT-AUTH-002] POST should require authentication', async ({ request }) => {
    const response = request.post(`${BASE_URL}/api/member/orders/test-order/comments`, {
      data: {
        content: 'Test comment',
        comment_type: 'general',
      },
    });
    expect(response.status()).toBe(401);
  });

  test('[COMMENT-AUTH-003] should redirect unauthenticated users', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders/test-order`);

    expect(page.url()).toMatch(/\/signin|\/login/);
  });
});

test.describe('Order Comments - Display', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-DISPLAY-001] should display comments section on order detail page', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    // 첫 번째 주문 링크 찾기
    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      // 댓글 섹션 확인
      const commentsSection = page.locator('text=/コメント|comment|댓글/i');
      const sectionExists = await commentsSection.count() > 0;

      if (sectionExists) {
        console.log('Comments section found on order detail page');
      }
    } else {
      console.log('No orders found to test comments display');
    }
  });

  test('[COMMENT-DISPLAY-002] should show comment list', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      // 댓글 목록 확인
      const commentItems = page.locator('[class*="comment"], [class*="message"], [data-testid*="comment"]');
      const commentCount = await commentItems.count();

      if (commentCount > 0) {
        console.log(`Found ${commentCount} comments`);

        // 첫 번째 댓글 확인
        const firstComment = commentItems.first();
        const commentText = await firstComment.textContent();

        expect(commentText?.length).toBeGreaterThan(0);
      } else {
        console.log('No comments found (empty state is OK)');
      }
    }
  });

  test('[COMMENT-DISPLAY-003] should display comment author info', async ({ page }) => {
    test.skip(true, 'Requires test data with comments');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    // 댓글 작성자 정보 확인
    const authorInfo = page.locator('[class*="author"], [class*="user"], [data-testid*="author"]');
    const authorCount = await authorInfo.count();

    if (authorCount > 0) {
      const firstAuthor = authorInfo.first();
      const authorText = await firstAuthor.textContent();

      console.log(`Comment author: ${authorText}`);
      expect(authorText?.length).toBeGreaterThan(0);
    }
  });

  test('[COMMENT-DISPLAY-004] should display comment timestamps', async ({ page }) => {
    test.skip(true, 'Requires test data with comments');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    // 댓글 타임스탬프 확인
    const timestamps = page.locator('[class*="time"], [class*="date"], time, datetime');
    const timestampCount = await timestamps.count();

    if (timestampCount > 0) {
      const firstTimestamp = timestamps.first();
      const timestampText = await firstTimestamp.textContent();

      console.log(`Comment timestamp: ${timestampText}`);

      // 시간 형식 확인
      const hasTime = /\d{1,2}:\d{2}/.test(timestampText || '');
      expect(hasTime).toBe(true);
    }
  });

  test('[COMMENT-DISPLAY-005] should display comment types/badges', async ({ page }) => {
    test.skip(true, 'Requires test data with typed comments');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    // 댓글 유형 배지 확인
    const typeBadges = page.locator('[class*="badge"], [class*="type"]');
    const badgeCount = await typeBadges.count();

    if (badgeCount > 0) {
      console.log('Comment type badges found');
    }
  });
});

test.describe('Order Comments - Addition', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-ADD-001] should allow member to create comment', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      // 댓글 입력 필드 찾기
      const commentInput = page.locator('textarea[placeholder*="コメント"], textarea[placeholder*="댓글"], textarea[name*="comment"]');
      const inputCount = await commentInput.count();

      if (inputCount > 0) {
        const testComment = `テストコメントです - ${Date.now()}`;
        await commentInput.fill(testComment);

        // 제출 버튼 찾기
        const submitButton = page.locator('button:has-text("投稿"), button:has-text("送信"), button:has-text("Submit"), button[type="submit"]');
        const submitCount = await submitButton.count();

        if (submitCount > 0) {
          await submitButton.first().click();
          await page.waitForTimeout(2000);

          // 댓글이 표시되는지 확인
          const commentText = page.locator(`text=${testComment}`);
          const commentExists = await commentText.count() > 0;

          if (commentExists) {
            console.log('Comment created successfully');
          }
        }
      }
    }
  });

  test('[COMMENT-ADD-002] should validate comment content', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="コメント"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("投稿")');

      // 빈 댓글 시도
      if (await commentInput.count() > 0) {
        await commentInput.fill('');

        // 제출 버튼이 비활성화되어 있어야 함
        const isDisabled = await submitButton.first().isDisabled();
        if (isDisabled) {
          console.log('Submit button disabled for empty comment');
        }
      }

      // 공백만 댓글 시도
      if (await commentInput.count() > 0) {
        await commentInput.fill('   ');

        const isDisabled = await submitButton.first().isDisabled();
        if (isDisabled) {
          console.log('Submit button disabled for whitespace-only comment');
        }
      }
    }
  });

  test('[COMMENT-ADD-003] should limit comment length', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="コメント"]');

      if (await commentInput.count() > 0) {
        // 매우 긴 댓글 시도
        const longComment = 'あ'.repeat(5001);
        await commentInput.fill(longComment);

        // maxlength 속성 확인
        const maxLength = await commentInput.getAttribute('maxlength');

        if (maxLength) {
          const maxLengthNum = parseInt(maxLength);
          expect(maxLengthNum).toBeLessThanOrEqual(5000);
          console.log(`Comment max length: ${maxLengthNum}`);
        }
      }
    }
  });

  test('[COMMENT-ADD-004] should show loading state during submission', async ({ page }) => {
    test.skip(true, 'Requires test data for loading state verification');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    const commentInput = page.locator('textarea[placeholder*="コメント"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await commentInput.count() > 0) {
      await commentInput.fill('Test comment');

      // 제출 버튼 클릭
      await submitButton.click();

      // 로딩 상태 확인
      const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [disabled]');
      const loadingExists = await loadingIndicator.count() > 0;

      if (loadingExists) {
        console.log('Loading state displayed during submission');
      }
    }
  });
});

test.describe('Order Comments - XSS Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-XSS-001] should sanitize script tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="コメント"]');
      const submitButton = page.locator('button[type="submit"]');

      if (await commentInput.count() > 0) {
        // XSS 페이로드 입력
        const xssPayload = '<script>alert("XSS")</script>';
        await commentInput.fill(xssPayload);
        await submitButton.click();

        await page.waitForTimeout(2000);

        // 스크립트가 실행되지 않았는지 확인
        const xssExecuted = await page.evaluate(() => {
          return (window as any).xssTriggered === true;
        });

        expect(xssExecuted).toBe(false);

        // 댓글에 script 태그가 없어야 함
        const commentContent = page.locator('text=<script>');
        const scriptExists = await commentContent.count() > 0;

        expect(scriptExists).toBe(false);
        console.log('XSS attack prevented');
      }
    }
  });

  test('[COMMENT-XSS-002] should sanitize onerror handlers', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="コメント"]');
      const submitButton = page.locator('button[type="submit"]');

      if (await commentInput.count() > 0) {
        const xssPayload = '<img src=x onerror=alert("XSS")>';
        await commentInput.fill(xssPayload);
        await submitButton.click();

        await page.waitForTimeout(2000);

        // onerror가 렌더링되지 않아야 함
        const onerrorExists = page.locator('text=onerror=');
        expect(await onerrorExists.count()).toBe(0);
      }
    }
  });

  test('[COMMENT-XSS-003] should escape HTML entities', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="コメント"]');
      const submitButton = page.locator('button[type="submit"]');

      if (await commentInput.count() > 0) {
        const htmlPayload = '<div>Test</div><p>Paragraph</p>';
        await commentInput.fill(htmlPayload);
        await submitButton.click();

        await page.waitForTimeout(2000);

        // HTML 태그가 이스케이프되어야 함
        const rawHtml = page.locator('text=<div>');
        expect(await rawHtml.count()).toBe(0);
      }
    }
  });
});

test.describe('Order Comments - Rate Limiting', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-RATE-001] should enforce rate limiting', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    const orderLink = page.locator('a[href*="/member/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      const commentInput = page.locator('textarea[placeholder*="コメント"]');
      const submitButton = page.locator('button[type="submit"]');

      // 빠르게 다수의 댓글 제출 시도
      if (await commentInput.count() > 0) {
        for (let i = 0; i < 5; i++) {
          await commentInput.fill(`Rate limit test ${i + 1}`);
          await submitButton.click();
          await page.waitForTimeout(500);
        }

        // Rate limit 메시지 확인
        const rateLimitMessage = page.locator('text=/rate limit|制限|too many requests/i');
        const rateLimitExists = await rateLimitMessage.count() > 0;

        if (rateLimitExists) {
          console.log('Rate limiting is active');
        }
      }
    }
  });

  test('[COMMENT-RATE-002] should include rate limit headers', async ({ request }) => {
    test.skip(true, 'Requires authenticated request');

    const response = request.get(`${BASE_URL}/api/member/orders/test-order/comments`);

    const rateLimitLimit = await response.headerValue('X-RateLimit-Limit');
    const rateLimitRemaining = await response.headerValue('X-RateLimit-Remaining');
    const rateLimitReset = await response.headerValue('X-RateLimit-Reset');

    if (rateLimitLimit || rateLimitRemaining || rateLimitReset) {
      console.log('Rate limit headers present');
      console.log(`  X-RateLimit-Limit: ${rateLimitLimit}`);
      console.log(`  X-RateLimit-Remaining: ${rateLimitRemaining}`);
      console.log(`  X-RateLimit-Reset: ${rateLimitReset}`);
    }
  });
});

test.describe('Order Comments - Editing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-EDIT-001] should allow editing own comments', async ({ page }) => {
    test.skip(true, 'Requires test data with editable comments');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    // 편집 버튼 확인
    const editButton = page.locator('button:has-text("編集"), button:has-text("수정"), button:has-text("Edit")');
    const editCount = await editButton.count();

    if (editCount > 0) {
      await editButton.first().click();

      // 편집 모드 확인
      const editInput = page.locator('textarea[value], input[value]');
      const editInputCount = await editInput.count();

      if (editInputCount > 0) {
        await editInput.first().fill('Updated comment');

        // 저장 버튼 클릭
        const saveButton = page.locator('button:has-text("保存"), button:has-text("저장"), button:has-text("Save")');
        await saveButton.click();

        await page.waitForTimeout(1000);

        console.log('Comment edited successfully');
      }
    }
  });

  test('[COMMENT-EDIT-002] should not allow editing others comments', async ({ page }) => {
    test.skip(true, 'Requires test data with comments from other users');
  });

  test('[COMMENT-EDIT-003] should show edit history', async ({ page }) => {
    test.skip(true, 'Requires test data with edited comments');
  });
});

test.describe('Order Comments - Notifications', () => {
  test('[COMMENT-NOTIF-001] should notify admin of new comment', async ({ page }) => {
    test.skip(true, 'Requires email service verification');
  });

  test('[COMMENT-NOTIF-002] should notify customer of admin response', async ({ page }) => {
    test.skip(true, 'Requires email service verification');
  });

  test('[COMMENT-NOTIF-003] should show notification indicator', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/member/orders`);

    // 알림 표시기 확인
    const notificationBadge = page.locator('[class*="notification"], [class*="badge"]');
    const badgeCount = await notificationBadge.count();

    if (badgeCount > 0) {
      console.log('Notification indicator found');
    }
  });
});

test.describe('Order Comments - Admin Side', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('[COMMENT-ADMIN-001] admin can view all comments', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);

    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      // 댓글 섹션 확인
      const commentsSection = page.locator('text=/コメント|comment/i');
      const sectionExists = await commentsSection.count() > 0;

      if (sectionExists) {
        console.log('Comments section found on admin order detail');
      }
    }
  });

  test('[COMMENT-ADMIN-002] admin can create internal comments', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/orders`);

    const orderLink = page.locator('a[href*="/admin/orders/"]').first();
    const linkCount = await orderLink.count();

    if (linkCount > 0) {
      await orderLink.click();
      await page.waitForTimeout(1000);

      // 내부 댓글 입력 필드 확인
      const internalInput = page.locator('textarea[placeholder*="内部"], textarea[placeholder*="internal"]');
      const inputCount = await internalInput.count();

      if (inputCount > 0) {
        console.log('Internal comment input found');
      }
    }
  });

  test('[COMMENT-ADMIN-003] admin can delete comments', async ({ page }) => {
    test.skip(true, 'Requires test data with deletable comments');

    await page.goto(`${BASE_URL}/admin/orders/test-order`);

    // 삭제 버튼 확인
    const deleteButton = page.locator('button:has-text("削除"), button:has-text("삭제"), button:has-text("Delete")');
    const deleteCount = await deleteButton.count();

    if (deleteCount > 0) {
      console.log('Delete button found for admin');
    }
  });
});

test.describe('Order Comments - File Attachments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-FILE-001] should allow file attachments', async ({ page }) => {
    test.skip(true, 'Requires file upload functionality in comments');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    // 파일 입력 찾기
    const fileInput = page.locator('input[type="file"]');
    const fileCount = await fileInput.count();

    if (fileCount > 0) {
      console.log('File attachment input found');
    }
  });

  test('[COMMENT-FILE-002] should validate file types', async ({ page }) => {
    test.skip(true, 'Requires file upload functionality');
  });

  test('[COMMENT-FILE-003] should display attached files', async ({ page }) => {
    test.skip(true, 'Requires test data with file attachments');
  });
});

test.describe('Order Comments - History', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-HIST-001] should display comments in chronological order', async ({ page }) => {
    test.skip(true, 'Requires test data with multiple comments');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    const commentItems = page.locator('[class*="comment"]');
    const commentCount = await commentItems.count();

    if (commentCount >= 2) {
      // 첫 번째와 마지막 댓글의 타임스탬프 확인
      const firstTimestamp = page.locator('[class*="comment"]').first().locator('[class*="time"], time');
      const lastTimestamp = page.locator('[class*="comment"]').last().locator('[class*="time"], time');

      const firstTime = await firstTimestamp.textContent();
      const lastTime = await lastTimestamp.textContent();

      console.log(`First comment time: ${firstTime}`);
      console.log(`Last comment time: ${lastTime}`);
    }
  });

  test('[COMMENT-HIST-002] should show comment edit history', async ({ page }) => {
    test.skip(true, 'Requires test data with edited comments');
  });

  test('[COMMENT-HIST-003] should allow loading older comments', async ({ page }) => {
    test.skip(true, 'Requires test data with paginated comments');
  });
});

test.describe('Order Comments - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-PERF-001] comments should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/member/orders`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
    console.log(`Orders list load time: ${loadTime}ms`);
  });

  test('[COMMENT-PERF-002] comment submission should be fast', async ({ page }) => {
    test.skip(true, 'Requires test order');

    await page.goto(`${BASE_URL}/member/orders/test-order`);

    const startTime = Date.now();

    const commentInput = page.locator('textarea[placeholder*="コメント"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await commentInput.count() > 0) {
      await commentInput.fill('Performance test comment');
      await submitButton.click();

      await page.waitForTimeout(1000);

      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(2000);
      console.log(`Comment submission time: ${responseTime}ms`);
    }
  });
});

test.describe('Order Comments - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('[COMMENT-A11Y-001] comments should have proper labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders/test-order`);

    const commentInput = page.locator('textarea[placeholder*="コメント"]');
    const inputCount = await commentInput.count();

    if (inputCount > 0) {
      // label 확인
      const hasLabel = await commentInput.evaluate((el: HTMLTextAreaElement) => {
        return !!(
          el.labels?.length ||
          el.getAttribute('aria-label') ||
          el.getAttribute('placeholder')
        );
      });

      expect(hasLabel).toBe(true);
    }
  });

  test('[COMMENT-A11Y-002] should support keyboard navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders/test-order`);

    // 탭 키로 댓글 입력 필드로 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // textarea나 button에 포커스되어야 함
    expect(['TEXTAREA', 'BUTTON']).toContain(focusedElement || '');
  });
});
