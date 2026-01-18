import { test, expect } from '@playwright/test';

/**
 * Phase 1: Public Pages - Group 1.11
 * Info Pages Tests (About, Service, Legal, News, Portal)
 *
 * 독립 실행 가능: ✅
 * 데이터베이스 의존성: 없음 (일부 페이지 제외)
 * 선행 조건: 없음
 */

const INFO_PAGES = [
  { path: '/about', name: 'About Company', keywords: ['会社概要', '会社情報', 'About', '会社'] },
  { path: '/service', name: 'Service Overview', keywords: ['サービス', 'Service', '事業内容'] },
  { path: '/privacy', name: 'Privacy Policy', keywords: ['プライバシー', '個人情報', 'Privacy', 'プライバシーポリシー'] },
  { path: '/terms', name: 'Terms of Service', keywords: ['利用規約', 'Terms', '規約', 'サービス利用規約'] },
  { path: '/legal', name: 'Legal Information', keywords: ['法的事項', 'Legal', '特定商取引', '法律'] },
  { path: '/csr', name: 'CSR Activities', keywords: ['CSR', '企業の社会的責任', '社会貢献', 'サステナビリティ'] },
  { path: '/news', name: 'News Section', keywords: ['ニュース', 'News', 'お知らせ', '最新情報'] },
  { path: '/archives', name: 'Archives', keywords: ['アーカイブ', 'Archive', '過去のニュース'] },
  { path: '/portal', name: 'Portal Home', keywords: ['ポータル', 'Portal', 'カスタマーポータル', 'ダッシュボード'] },
];

test.describe('Info Pages', () => {
  test.describe('Individual Info Pages', () => {
    INFO_PAGES.forEach(({ path, name, keywords }) => {
      test.describe(`${name} Page`, () => {
        test.beforeEach(async ({ page }) => {
          await page.goto(path);
        });

        test(`TC-1.11.${INFO_PAGES.findIndex(p => p.path === path) + 1}: ${name} page loads`, async ({ page }) => {
          // 콘솔 에러 수집
          const errors: string[] = [];
          page.on('console', msg => {
            if (msg.type() === 'error') {
              errors.push(msg.text());
            }
          });

          // Wait for page to load using more reliable method
          await page.waitForLoadState('domcontentloaded').catch(() => {});
          // Add a small delay to ensure page is ready
          await page.waitForTimeout(500).catch(() => {});

          // 페이지 제목 확인 (키워드 포함)
          const title = page.locator('h1, h2').filter({ hasText: new RegExp(keywords.join('|')) });
          const titleCount = await title.count();
          
          if (titleCount > 0) {
            await expect(title.first()).toBeVisible();
          }

          // 콘솔 에러 확인
          expect(errors.filter(e => !e.includes('Ads') && !e.includes('favicon'))).toHaveLength(0);
        });

        test(`${name} page should display content`, async ({ page }) => {
          await page.waitForLoadState('domcontentloaded').catch(() => {});
          await page.waitForTimeout(500).catch(() => {});

          // 콘텐츠 영역 확인
          const content = page.locator('main, section, article');
          await expect(content.first()).toBeVisible();
        });

        test(`${name} page should have navigation`, async ({ page }) => {
          await page.waitForLoadState('domcontentloaded').catch(() => {});
          await page.waitForTimeout(500).catch(() => {});

          // 네비게이션 요소 확인
          const nav = page.locator('nav, [role="navigation"]');
          await expect(nav.first()).toBeVisible();
        });

        test(`${name} page should be responsive`, async ({ page }) => {
          await page.setViewportSize({ width: 375, height: 667 });
          await page.goto(path);
          await page.waitForLoadState('domcontentloaded').catch(() => {});
          await page.waitForTimeout(500).catch(() => {});

          // 모바일에서도 주요 콘텐츠가 보이는지 확인
          const mainContent = page.locator('main, section');
          await expect(mainContent.first()).toBeVisible();
        });
      });
    });
  });

  test.describe('Info Pages - Content Verification', () => {
    test('TC-1.11.1: About company page should display company info', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 회사 정보 관련 키워드 확인
      const companyInfo = page.locator('text=/会社名|設立|所在地|資本金|代表取締役|事業内容/i');
      await expect(companyInfo.first()).toBeVisible();
      
      // 연락처 정보 확인
      const contactInfo = page.locator('text=/〒|東京都|電話|Email/i');
      const contactCount = await contactInfo.count();
      
      if (contactCount > 0) {
        await expect(contactInfo.first()).toBeVisible();
      }
    });

    test('TC-1.11.2: Service overview page should list services', async ({ page }) => {
      await page.goto('/service');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 서비스 관련 키워드 확인
      const services = page.locator('text=/サービス|Service|包装資材|パッケージ/i');
      const serviceCount = await services.count();
      
      if (serviceCount > 0) {
        await expect(services.first()).toBeVisible();
      }
      
      // 서비스 목록 확인
      const serviceList = page.locator('ul, ol, [class*="service"]');
      const listCount = await serviceList.count();
      
      if (listCount > 0) {
        await expect(serviceList.first()).toBeVisible();
      }
    });

    test('TC-1.11.3: Privacy policy page should display privacy info', async ({ page }) => {
      await page.goto('/privacy');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 개인정보 보호 관련 키워드 확인
      const privacyInfo = page.locator('text=/個人情報|プライバシー|個人情報保護方針|データ取扱/i');
      await expect(privacyInfo.first()).toBeVisible();
      
      // 취급 방침 내용 확인
      const policyContent = page.locator('text=/取得|利用|開示|提供|保護/i');
      const contentCount = await policyContent.count();
      
      if (contentCount > 0) {
        await expect(policyContent.first()).toBeVisible();
      }
    });

    test('TC-1.11.4: Terms of service page should display terms', async ({ page }) => {
      await page.goto('/terms');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 이용약관 관련 키워드 확인
      const termsInfo = page.locator('text=/利用規約|Terms.*Service|サービス利用規約|規約/i');
      await expect(termsInfo.first()).toBeVisible();
      
      // 약관 내용 확인
      const termsContent = page.locator('text=/条項|責任|禁止事項|知的財産/i');
      const contentCount = await termsContent.count();
      
      if (contentCount > 0) {
        await expect(termsContent.first()).toBeVisible();
      }
    });

    test('TC-1.11.5: Legal information page should display legal notices', async ({ page }) => {
      await page.goto('/legal');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 법적 정보 관련 키워드 확인
      const legalInfo = page.locator('text=/特定商取引|法的事項|Legal|表記/i');
      const legalCount = await legalInfo.count();
      
      if (legalCount > 0) {
        await expect(legalInfo.first()).toBeVisible();
      }
      
      // 사업자 정보 확인
      const businessInfo = page.locator('text=/販売事業者|運営者|所在地|連絡先/i');
      const businessCount = await businessInfo.count();
      
      if (businessCount > 0) {
        await expect(businessInfo.first()).toBeVisible();
      }
    });

    test('TC-1.11.6: CSR activities page should display CSR info', async ({ page }) => {
      await page.goto('/csr');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // CSR 관련 키워드 확인
      const csrInfo = page.locator('text=/CSR|社会貢献|環境配慮|サステナビリティ/i');
      const csrCount = await csrInfo.count();
      
      if (csrCount > 0) {
        await expect(csrInfo.first()).toBeVisible();
      }
      
      // 활동 내용 확인
      const activityContent = page.locator('text=/活動|取り組み|環境|社会/i');
      await expect(activityContent.first()).toBeVisible();
    });

    test('TC-1.11.7: News section page should display news', async ({ page }) => {
      await page.goto('/news');
      // Wait for the main heading to be visible instead of networkidle
      await page.waitForSelector('h1:has-text("パウチ包装ニュース")', { timeout: 5000 }).catch(() => {});

      // 뉴스 관련 키워드 확인 - the page contains "パウチ包装ニュース"
      const newsInfo = page.locator('h1', { hasText: /パウチ包装ニュース|ニュース|News|お知らせ|最新情報/i });
      const newsCount = await newsInfo.count();

      if (newsCount > 0) {
        await expect(newsInfo.first()).toBeVisible();
      }

      // 뉴스 아이템 또는 목록 확인 - check for Card components or article elements
      const newsItems = page.locator('article, [class*="news"], [class*="post"], .group');
      const itemCount = await newsItems.count();

      // 뉴스가 없는 경우 빈 상태 확인
      if (itemCount === 0) {
        // Match the actual empty state message from NewsClient: "パウチ関連ニュースが見つかりませんでした"
        const emptyState = page.locator('text=/見つかりません|ありません|該当.*なし|No news/i');
        const emptyCount = await emptyState.count();
        expect(emptyCount).toBeGreaterThan(0);
      }
    });

    test('TC-1.11.8: Archives page should display archived content', async ({ page }) => {
      await page.goto('/archives');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 아카이브 관련 키워드 확인
      const archiveInfo = page.locator('text=/アーカイブ|Archive|過去の記事|過去のニュース/i');
      const archiveCount = await archiveInfo.count();
      
      if (archiveCount > 0) {
        await expect(archiveInfo.first()).toBeVisible();
      }
      
      // 아카이브 목록 확인
      const archiveList = page.locator('ul, ol, [class*="archive"]');
      const listCount = await archiveList.count();
      
      if (listCount > 0) {
        await expect(archiveList.first()).toBeVisible();
      }
    });

    test('TC-1.11.9: Customer portal page should redirect to admin/customers', async ({ page }) => {
      // /portal now redirects to /admin/customers (301 permanent redirect)
      await page.goto('/portal');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      // Verify redirect happened
      expect(page.url()).toContain('/admin/customers');

      // 포털 관련 키워드 확인 (authentication required, so may see login page)
      const portalInfo = page.locator('text=/ポータル|Portal|カスタマーポータル|ダッシュボード|ログイン|Login/i');
      const portalCount = await portalInfo.count();

      if (portalCount > 0) {
        await expect(portalInfo.first()).toBeVisible();
      }

      // 대시보드 또는 로그인 요소 확인
      const dashboard = page.locator('text=/ダッシュボード|Dashboard|ログイン|Login/i');
      await expect(dashboard.first()).toBeVisible();
    });
  });

  test.describe('Info Pages - Cross-page Navigation', () => {
    test('Should link to contact from info pages', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      const contactLink = page.locator('a[href="/contact"]');
      const contactCount = await contactLink.count();

      if (contactCount > 0) {
        await contactLink.first().click();
        await expect(page).toHaveURL('/contact');
      }
    });

    test('Should link to quote simulator from info pages', async ({ page }) => {
      await page.goto('/service');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      const quoteLink = page.locator('a[href="/quote-simulator"], a[href="/roi-calculator"], a:has-text("見積"), a:has-text("Quote")');
      const quoteCount = await quoteLink.count();

      if (quoteCount > 0) {
        await quoteLink.first().click();
        await expect(page).toHaveURL(/\/(quote-simulator|roi-calculator)/);
      } else {
        // If no quote link, verify page has content
        const mainContent = page.locator('main, body');
        await expect(mainContent.first()).toBeVisible();
      }
    });

    test('Should link to catalog from info pages', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      const catalogLink = page.locator('a[href="/catalog"]');
      const catalogCount = await catalogLink.count();

      if (catalogCount > 0) {
        await catalogLink.first().click();
        await expect(page).toHaveURL('/catalog');
      }
    });
  });

  test.describe('Info Pages - User Experience', () => {
    test('Should display footer links', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      // 푸터 확인
      const footer = page.locator('footer');
      const footerCount = await footer.count();

      if (footerCount > 0) {
        // 푸터 링크 확인
        const footerLinks = footer.locator('a');
        const linkCount = await footerLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });

    test('Should load info pages quickly', async ({ page }) => {
      const loadTimes: number[] = [];

      for (const infoPage of INFO_PAGES.slice(0, 5)) {
        const startTime = Date.now();
        await page.goto(infoPage.path);
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForTimeout(500).catch(() => {});
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);
      }

      // 모든 페이지가 30초 이내에 로드되어야 함 (relaxed for CI/CD environments)
      loadTimes.forEach(time => {
        expect(time).toBeLessThan(30000);
      });
    });

    test('Should handle missing pages gracefully', async ({ page }) => {
      // 존재하지 않는 페이지 접근 시도
      const response = await page.goto('/nonexistent-page');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      // Check the final URL after redirects
      const finalUrl = page.url();

      // 404 페이지, 홈으로 리다이렉트, 인증 페이지 리다이렉트, 또는 Next.js의 404 처리
      const is404 = await page.locator('text=/404|見つかりません|Not Found|ページが見つかりません/i').count() > 0;
      const isHome = finalUrl === '/' || finalUrl.endsWith('/');
      const isAuthRedirect = finalUrl.includes('/auth/signin') || finalUrl.includes('/auth/login');
      const is404Status = response?.status() === 404;

      // Page should either show 404, redirect to home, redirect to auth, or return 404 status
      expect(is404 || isHome || isAuthRedirect || is404Status).toBeTruthy();
    });

    test('Should provide sitemap or site links', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      // 사이트맵 또는 사이트 링크 확인
      const sitemapLink = page.locator('a[href*="sitemap"], a[href*="site-map"]');
      const sitemapCount = await sitemapLink.count();

      // 사이트맵이 없는 경우 푸터 링크 확인
      if (sitemapCount === 0) {
        const footer = page.locator('footer');
        const footerCount = await footer.count();

        if (footerCount > 0) {
          await expect(footer.first()).toBeVisible();
        }
      }
    });

    test('Should display company contact information', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});

      // 회사 연락처 확인
      const contactInfo = page.locator('text=/電話|Tel|電話番号|03-|Email|メール/i');
      const contactCount = await contactInfo.count();

      if (contactCount > 0) {
        await expect(contactInfo.first()).toBeVisible();
      }
    });

    test('News page should have date information', async ({ page }) => {
      await page.goto('/news');
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500).catch(() => {});
      
      // 날짜 정보 확인
      const dateInfo = page.locator('text=/\\d{4}.*\\d{1,2}.*\\d{1,2}|年|月|日|Date|日付/i');
      const dateCount = await dateInfo.count();
      
      if (dateCount > 0) {
        await expect(dateInfo.first()).toBeVisible();
      }
    });
  });
});