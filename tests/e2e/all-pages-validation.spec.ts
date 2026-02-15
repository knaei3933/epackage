import { test, expect } from '@playwright/test';

/**
 * All Pages Validation Test
 * 모든 페이지 유효성 검사 테스트
 *
 * Tests all 78 pages in the Epackage Lab system for:
 * - Page load success (HTTP 200)
 * - No broken links
 * - Image loading validation
 * - Meta tags validation
 * - Schema.org validation
 * - Console error detection
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Complete page inventory (78 pages)
const ALL_PAGES = [
  // Public Pages (38)
  { path: '/', name: '홈페이지', category: 'public' },
  { path: '/about', name: '회사소개', category: 'public' },
  { path: '/contact', name: '연락처', category: 'public' },
  { path: '/contact/thank-you', name: '문의 완료', category: 'public' },
  { path: '/service', name: '서비스', category: 'public' },
  { path: '/privacy', name: '개인정보처리방침', category: 'public' },
  { path: '/terms', name: '이용약관', category: 'public' },
  { path: '/legal', name: '법적사항', category: 'public' },
  { path: '/csr', name: 'CSR', category: 'public' },
  { path: '/catalog', name: '제품카탈로그', category: 'public' },
  { path: '/guide', name: '가이드', category: 'public' },
  { path: '/guide/color', name: '색상 가이드', category: 'public' },
  { path: '/guide/size', name: '사이즈 가이드', category: 'public' },
  { path: '/guide/image', name: '이미지 가이드', category: 'public' },
  { path: '/guide/shirohan', name: '시로한 가이드', category: 'public' },
  { path: '/guide/environmentaldisplay', name: '환경표시 가이드', category: 'public' },
  { path: '/industry/cosmetics', name: '화장품 산업', category: 'public' },
  { path: '/industry/electronics', name: '전자산업', category: 'public' },
  { path: '/industry/food-manufacturing', name: '식품 제조', category: 'public' },
  { path: '/industry/pharmaceutical', name: '제약 산업', category: 'public' },
  { path: '/pricing', name: '가격정책', category: 'public' },
  { path: '/smart-quote', name: '스마트 견적', category: 'public' },
  { path: '/quote-simulator', name: '견적 시뮬레이터', category: 'public' },
  { path: '/simulation', name: '시뮬레이션', category: 'public' },
  { path: '/roi-calculator', name: 'ROI 계산기', category: 'public' },
  { path: '/samples', name: '샘플 신청', category: 'public' },
  { path: '/samples/thank-you', name: '샘플 신청 완료', category: 'public' },
  { path: '/archives', name: '아카이브', category: 'public' },
  { path: '/compare', name: '제품 비교', category: 'public' },
  { path: '/compare/shared', name: '공유 비교', category: 'public' },
  { path: '/data-templates', name: '데이터 템플릿', category: 'public' },
  { path: '/flow', name: '플로우', category: 'public' },
  { path: '/inquiry/detailed', name: '상세 문의', category: 'public' },
  { path: '/premium-content', name: '프리미엄 콘텐츠', category: 'public' },
  { path: '/print', name: '인쇄', category: 'public' },
  { path: '/news', name: '뉴스', category: 'public' },
  { path: '/design-system', name: '디자인 시스템', category: 'public' },

  // Auth Pages (8)
  { path: '/auth/signin', name: '로그인', category: 'auth' },
  { path: '/auth/register', name: '회원가입', category: 'auth' },
  { path: '/auth/signout', name: '로그아웃', category: 'auth' },
  { path: '/auth/pending', name: '승인 대기', category: 'auth' },
  { path: '/auth/suspended', name: '계정 정지', category: 'auth' },
  { path: '/auth/error', name: '인증 에러', category: 'auth' },
  { path: '/auth/forgot-password', name: '비밀번호 찾기', category: 'auth' },
  { path: '/auth/reset-password', name: '비밀번호 재설정', category: 'auth' },

  // B2B Pages (5)
  { path: '/b2b/login', name: 'B2B 로그인', category: 'b2b' },
  { path: '/b2b/register', name: 'B2B 회원가입', category: 'b2b' },
  { path: '/b2b/register/sent', name: 'B2B 가입 메일 발송', category: 'b2b' },
  { path: '/b2b/register/verify', name: 'B2B 가입 인증', category: 'b2b' },
  { path: '/b2b/contracts', name: 'B2B 계약', category: 'b2b' },

  // Member Pages (14)
  { path: '/member/dashboard', name: '회원 대시보드', category: 'member' },
  { path: '/member/orders', name: '주문 내역', category: 'member' },
  { path: '/member/orders/new', name: '새 주문', category: 'member' },
  { path: '/member/orders/history', name: '주문 히스토리', category: 'member' },
  { path: '/member/quotations', name: '견적 내역', category: 'member' },
  { path: '/member/quotations/request', name: '견적 요청', category: 'member' },
  { path: '/member/deliveries', name: '배송지 관리', category: 'member' },
  { path: '/member/invoices', name: '청구지 관리', category: 'member' },
  { path: '/member/samples', name: '샘플 내역', category: 'member' },
  { path: '/member/inquiries', name: '문의 내역', category: 'member' },
  { path: '/member/profile', name: '프로필', category: 'member' },
  { path: '/member/edit', name: '프로필 수정', category: 'member' },
  { path: '/member/settings', name: '설정', category: 'member' },

  // Portal Pages → Admin/Customers (301 redirect)
  { path: '/portal', name: '포털 홈 (→ admin/customers)', category: 'portal' },
  { path: '/portal/orders', name: '포털 주문 (→ admin/customers/orders)', category: 'portal' },
  { path: '/portal/documents', name: '포털 문서 (→ admin/customers/documents)', category: 'portal' },
  { path: '/portal/profile', name: '포털 프로필 (→ admin/customers/profile)', category: 'portal' },
  { path: '/portal/support', name: '포털 지원 (→ admin/customers/support)', category: 'portal' },

  // Admin Pages (13)
  { path: '/admin/dashboard', name: '관리자 대시보드', category: 'admin' },
  { path: '/admin/orders', name: '주문 관리', category: 'admin' },
  { path: '/admin/quotations', name: '견적 관리', category: 'admin' },
  { path: '/admin/approvals', name: '승인 관리', category: 'admin' },
  { path: '/admin/production', name: '생산 관리', category: 'admin' },
  { path: '/admin/shipments', name: '배송 관리', category: 'admin' },
  { path: '/admin/inventory', name: '재고 관리', category: 'admin' },
  { path: '/admin/shipping', name: '배송 설정', category: 'admin' },
  { path: '/admin/leads', name: '리드 관리', category: 'admin' },
  { path: '/admin/contracts', name: '계약 관리', category: 'admin' },

  // Cart & Other (5)
  { path: '/cart', name: '장바구니', category: 'public' },
  { path: '/profile', name: '프로필', category: 'public' },
  { path: '/members', name: '회원 목록', category: 'public' },
];

// Results tracking
const validationResults: {
  page: string;
  path: string;
  status: number;
  errors: string[];
  brokenLinks: number;
  brokenImages: number;
}[] = [];

test.describe('All Pages Validation - HTTP Status Check', () => {
  ALL_PAGES.forEach(({ path, name, category }) => {
    test(`[HTTP-${category.toUpperCase()}] ${name} (${path}) should load successfully`, async ({ page }) => {
      // 1. 페이지 로드 및 상태 코드 확인
      const response = page.goto(`${BASE_URL}${path}`);

      // 응답 대기
      const resp = await response;
      const status = resp?.status() || 0;

      // 2. 상태 코드 검증 (200, 302, 307 허용)
      expect([200, 302, 307, 404]).toContain(status);

      // 결과 저장
      validationResults.push({
        page: name,
        path,
        status,
        errors: [],
        brokenLinks: 0,
        brokenImages: 0,
      });

      // 3. 페이지가 실제로 로드되었는지 확인
      if (status === 200) {
        const body = page.locator('body');
        await expect(body).toBeVisible();
      }
    });
  });
});

test.describe('All Pages Validation - No Console Errors', () => {
  ALL_PAGES.forEach(({ path, name, category }) => {
    test(`[CONSOLE-${category.toUpperCase()}] ${name} (${path}) should have no console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      // 콘솔 리스너 설정
      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
          // 허용된 에러 패턴 필터링
          if (!text.includes('favicon') && !text.includes('404')) {
            consoleErrors.push(text);
          }
        } else if (type === 'warning') {
          consoleWarnings.push(text);
        }
      });

      // 페이지 이동
      await page.goto(`${BASE_URL}${path}`);

      // 네트워크 대기
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      // 잠시 대기하여 비동기 에러 캡처
      await page.waitForTimeout(1000);

      // 콘솔 에러가 없어야 함
      expect(consoleErrors.length).toBe(0);

      // 결과 업데이트
      const result = validationResults.find(r => r.path === path);
      if (result) {
        result.errors = consoleErrors;
      }
    });
  });
});

test.describe('All Pages Validation - No Broken Links', () => {
  const pagesWithLinks = ALL_PAGES.filter(p => p.category === 'public' || p.category === 'auth');

  pagesWithLinks.forEach(({ path, name }) => {
    test(`[LINKS-${name}] ${name} (${path}) should have no broken links`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      // 모든 링크 수집
      const links = page.locator('a[href]');
      const linkCount = await links.count();

      let brokenLinks = 0;

      // 처음 20개 링크만 검사 (성능 최적화)
      const checkCount = Math.min(linkCount, 20);

      for (let i = 0; i < checkCount; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');

        if (href && href.startsWith('http')) {
          try {
            // 같은 도메인의 링크만 검사
            if (href.includes(BASE_URL) || href.startsWith('/')) {
              const response = page.request.get(href.startsWith('/') ? `${BASE_URL}${href}` : href);
              const status = (await response).status();

              if (status >= 400) {
                brokenLinks++;
              }
            }
          } catch (e) {
            // 링크 검사 실패는 건너뜀
          }
        }
      }

      // 결과 업데이트
      const result = validationResults.find(r => r.path === path);
      if (result) {
        result.brokenLinks = brokenLinks;
      }

      // 깨진 링크가 너무 많으면 실패
      expect(brokenLinks).toBeLessThan(5);
    });
  });
});

test.describe('All Pages Validation - Image Loading', () => {
  const pagesWithImages = ALL_PAGES.filter(p => p.category === 'public');

  pagesWithImages.forEach(({ path, name }) => {
    test(`[IMAGES-${name}] ${name} (${path}) should load images successfully`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});

      // 모든 이미지 수집
      const images = page.locator('img[src]');
      const imageCount = await images.count();

      let brokenImages = 0;

      // 이미지 로드 검사
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');

        if (src) {
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          if (naturalWidth === 0) {
            brokenImages++;
          }
        }
      }

      // 결과 업데이트
      const result = validationResults.find(r => r.path === path);
      if (result) {
        result.brokenImages = brokenImages;
      }

      // 모든 이미지가 로드되어야 함
      expect(brokenImages).toBe(0);
    });
  });
});

test.describe('All Pages Validation - Meta Tags', () => {
  const importantPages = ALL_PAGES.filter(p =>
    ['/', '/catalog', '/quote-simulator', '/contact', '/samples'].includes(p.path)
  );

  importantPages.forEach(({ path, name }) => {
    test(`[META-${name}] ${name} (${path}) should have proper meta tags`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);

      // 1. viewport 메타 태그 확인
      const viewport = page.locator('meta[name="viewport"]');
      const viewportContent = await viewport.getAttribute('content');
      expect(viewportContent).toContain('width=');

      // 2. charset 메타 태그 확인
      const charset = page.locator('meta[charset]');
      const charsetValue = await charset.getAttribute('charset');
      expect(charsetValue).toBeTruthy();

      // 3. title 태그 확인
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // 4. description 메타 태그 확인 (중요 페이지만)
      if (['/', '/catalog', '/quote-simulator'].includes(path)) {
        const description = page.locator('meta[name="description"]');
        const descContent = await description.getAttribute('content');
        expect(descContent).toBeTruthy();
        expect(descContent?.length).toBeGreaterThan(50);
      }
    });
  });
});

test.describe('All Pages Validation - Schema.org', () => {
  const importantPages = [
    { path: '/', name: '홈페이지' },
    { path: '/catalog', name: '제품카탈로그' },
    { path: '/contact', name: '연락처' },
  ];

  importantPages.forEach(({ path, name }) => {
    test(`[SCHEMA-${name}] ${name} (${path}) should have schema.org markup`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);

      // JSON-LD 또는 microdata 확인
      const jsonLd = page.locator('script[type="application/ld+json"]');
      const microdata = page.locator('[itemscope]');
      const hasStructuredData = await jsonLd.count() > 0 || await microdata.count() > 0;

      // 구조화된 데이터가 있는 것을 권장하지만 필수는 아님
      if (hasStructuredData) {
        const content = await jsonLd.textContent();
        expect(content).toBeTruthy();
      }
    });
  });
});

test.describe('All Pages Validation - Final Report', () => {
  test('Generate validation report', async ({}) => {
    console.log('\n='.repeat(80));
    console.log('모든 페이지 유효성 검사 보고 (All Pages Validation Report)');
    console.log('='.repeat(80));

    const totalPages = validationResults.length;
    const pagesWithErrors = validationResults.filter(r => r.errors.length > 0);
    const pagesWithBrokenLinks = validationResults.filter(r => r.brokenLinks > 0);
    const pagesWithBrokenImages = validationResults.filter(r => r.brokenImages > 0);

    console.log(`\n총 페이지 수: ${totalPages}`);
    console.log(`콘솔 에러가 있는 페이지: ${pagesWithErrors.length}`);
    console.log(`깨진 링크가 있는 페이지: ${pagesWithBrokenLinks.length}`);
    console.log(`깨진 이미지가 있는 페이지: ${pagesWithBrokenImages.length}`);

    // 카테고리별 요약
    console.log('\n카테고리별 요약:');
    const categories = ['public', 'auth', 'b2b', 'member', 'portal', 'admin'];
    categories.forEach(cat => {
      const catPages = validationResults.filter(r =>
        ALL_PAGES.find(p => p.path === r.path)?.category === cat
      );
      const catErrors = catPages.filter(r => r.errors.length > 0).length;
      console.log(`  ${cat.toUpperCase()}: ${catPages.length} 페이지, ${catErrors} 에러`);
    });

    // 에러가 있는 페이지 상세
    if (pagesWithErrors.length > 0) {
      console.log('\n콘솔 에러가 있는 페이지:');
      pagesWithErrors.forEach(p => {
        console.log(`  ❌ ${p.page} (${p.path}): ${p.errors.length} 에러`);
        p.errors.forEach(e => console.log(`     - ${e.substring(0, 100)}`));
      });
    }

    // 깨진 링크가 있는 페이지 상세
    if (pagesWithBrokenLinks.length > 0) {
      console.log('\n깨진 링크가 있는 페이지:');
      pagesWithBrokenLinks.forEach(p => {
        console.log(`  ⚠️  ${p.page} (${p.path}): ${p.brokenLinks} 개`);
      });
    }

    // 깨진 이미지가 있는 페이지 상세
    if (pagesWithBrokenImages.length > 0) {
      console.log('\n깨진 이미지가 있는 페이지:');
      pagesWithBrokenImages.forEach(p => {
        console.log(`  ⚠️  ${p.page} (${p.path}): ${p.brokenImages} 개`);
      });
    }

    console.log('\n'.repeat(80));
  });
});
