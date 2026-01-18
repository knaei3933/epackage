import { test, expect } from '@playwright/test';

/**
 * Console Error Check Test Suite
 * 콘솔 에러 점검 테스트 스위트
 *
 * Tests for:
 * - Real-time error detection
 * - Error categorization
 * - Error reporting
 * - Error recovery testing
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Error categories
interface ErrorCategory {
  name: string;
  pattern: RegExp;
  count: number;
}

// Test pages
const TEST_PAGES = [
  { path: '/', name: '홈페이지', category: 'public' },
  { path: '/catalog', name: '카탈로그', category: 'public' },
  { path: '/quote-simulator', name: '견적 시뮬레이터', category: 'public' },
  { path: '/samples', name: '샘플 신청', category: 'public' },
  { path: '/contact', name: '연락처', category: 'public' },
  { path: '/about', name: '회사소개', category: 'public' },
  { path: '/service', name: '서비스', category: 'public' },
  { path: '/privacy', name: '개인정보처리방침', category: 'public' },
  { path: '/terms', name: '이용약관', category: 'public' },
  { path: '/guide/color', name: '색상 가이드', category: 'public' },
  { path: '/guide/size', name: '사이즈 가이드', category: 'public' },
  { path: '/industry/cosmetics', name: '화장품 산업', category: 'public' },
  { path: '/industry/electronics', name: '전자산업', category: 'public' },
  { path: '/roi-calculator', name: 'ROI 계산기', category: 'public' },
  { path: '/auth/signin', name: '로그인', category: 'auth' },
  { path: '/auth/register', name: '회원가입', category: 'auth' },
  { path: '/auth/forgot-password', name: '비밀번호 찾기', category: 'auth' },
];

test.describe('Console Error Check - Real-time Detection', () => {
  TEST_PAGES.forEach(({ path, name, category }) => {
    test(`[ERROR-${category.toUpperCase()}-${name}] ${name} - 실시간 에러 감지`, async ({ page }) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const infos: string[] = [];

      // 콘솔 리스너 설정
      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();
        const url = page.url();

        const logEntry = `[${type.toUpperCase()}] ${text} (${url})`;

        if (type === 'error') {
          // 허용된 에러 패턴 필터링
          if (!text.includes('favicon') && !text.includes('DevTools')) {
            errors.push(logEntry);
          }
        } else if (type === 'warning') {
          warnings.push(logEntry);
        } else if (type === 'info') {
          infos.push(logEntry);
        }
      });

      // 페이지 에러 리스너 (JavaScript runtime errors)
      page.on('pageerror', (error) => {
        errors.push(`[PAGE ERROR] ${error.message} | Stack: ${error.stack}`);
      });

      // 페이지로 이동
      const response = page.goto(`${BASE_URL}${path}`, {
        waitUntil: 'domcontentloaded',
      });

      const status = (await response).status();

      // 비동기 에러를 위해 대기
      await page.waitForTimeout(2000);

      // 결과 로그
      console.log(`\n[${category.toUpperCase()}] ${name} (${path})`);
      console.log(`상태 (Status): ${status}`);

      if (errors.length > 0) {
        console.log(`❌ 에러 (${errors.length}개):`);
        errors.slice(0, 5).forEach(err => console.log(`   ${err}`));
        if (errors.length > 5) {
          console.log(`   ... 그 외 ${errors.length - 5}개 에러`);
        }
      }

      if (warnings.length > 0) {
        console.log(`⚠️  경고 (${warnings.length}개):`);
        warnings.slice(0, 3).forEach(warn => console.log(`   ${warn}`));
        if (warnings.length > 3) {
          console.log(`   ... 그 외 ${warnings.length - 3}개 경고`);
        }
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`✅ 깨끗함 - 콘솔 문제 없음`);
      }

      // 치명적인 에러가 없어야 함
      const criticalErrors = errors.filter(e =>
        !e.includes('Warning') &&
        !e.includes('deprecated')
      );

      expect(criticalErrors.length).toBe(0);

      // 경고가 너무 많으면 실패
      expect(warnings.length).toBeLessThan(20);
    });
  });
});

test.describe('Console Error Check - Error Categorization', () => {
  const errorCategories: ErrorCategory[] = [
    { name: 'React Hydration', pattern: /Hydration|hydration/, count: 0 },
    { name: 'Supabase', pattern: /Supabase|supabase/, count: 0 },
    { name: 'API/Fetch', pattern: /fetch|API|api/, count: 0 },
    { name: 'Network', pattern: /Network|network|ERR_CONNECTION/, count: 0 },
    { name: 'JavaScript Runtime', pattern: /PAGE ERROR|TypeError|ReferenceError/, count: 0 },
    { name: 'React Warning', pattern: /Warning.*react|React.*Warning/, count: 0 },
    { name: 'Deprecated API', pattern: /deprecated|Deprecated/, count: 0 },
  ];

  test('[ERROR-CAT-001] 에러 카테고리 분석', async ({ page }) => {
    const allErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          allErrors.push(text);
        }
      }
    });

    page.on('pageerror', (error) => {
      allErrors.push(`PAGE ERROR: ${error.message}`);
    });

    // 주요 페이지 방문
    const keyPages = ['/', '/catalog', '/quote-simulator', '/contact'];

    for (const pagePath of keyPages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(1000);
    }

    // 에러 카테고리 분류
    allErrors.forEach(error => {
      for (const category of errorCategories) {
        if (category.pattern.test(error)) {
          category.count++;
          break;
        }
      }
    });

    // 결과 출력
    console.log('\n에러 카테고리별 분석:');
    console.log('='.repeat(60));

    errorCategories.forEach(category => {
      if (category.count > 0) {
        console.log(`${category.name.padEnd(25)} ${category.count}개`);
      }
    });

    if (allErrors.length === 0) {
      console.log('에러 없음 (No errors found)');
    }

    // 전체 에러 수 확인
    expect(allErrors.length).toBe(0);
  });
});

test.describe('Console Error Check - Error Reporting', () => {
  test('[ERROR-REP-001] 에러 상세 리포트 생성', async ({ page }) => {
    const pageErrors: {
      page: string;
      url: string;
      errors: string[];
      warnings: string[];
      status: number;
    }[] = [];

    // 각 페이지에서 에러 수집
    for (const pageInfo of TEST_PAGES) {
      const errors: string[] = [];
      const warnings: string[] = [];

      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error' && !text.includes('favicon')) {
          errors.push(text);
        } else if (type === 'warning') {
          warnings.push(text);
        }
      });

      const response = page.goto(`${BASE_URL}${pageInfo.path}`);
      const status = (await response).status();

      await page.waitForTimeout(1000);

      pageErrors.push({
        page: pageInfo.name,
        url: pageInfo.path,
        errors,
        warnings,
        status,
      });
    }

    // 리포트 생성
    console.log('\n'.repeat(80));
    console.log('상세 콘솔 에러 리포트 (Detailed Console Error Report)');
    console.log('='.repeat(80));

    const pagesWithErrors = pageErrors.filter(p => p.errors.length > 0);
    const pagesWithWarnings = pageErrors.filter(p => p.warnings.length > 0 && p.errors.length === 0);
    const cleanPages = pageErrors.filter(p => p.errors.length === 0 && p.warnings.length === 0);

    console.log(`\n총 페이지: ${pageErrors.length}`);
    console.log(`에러가 있는 페이지: ${pagesWithErrors.length}`);
    console.log(`경고만 있는 페이지: ${pagesWithWarnings.length}`);
    console.log(`깨끗한 페이지: ${cleanPages.length}\n`);

    if (pagesWithErrors.length > 0) {
      console.log('에러가 있는 페이지:');
      console.log('-'.repeat(80));
      pagesWithErrors.forEach(p => {
        console.log(`  ${p.page} (${p.url}) - ${p.errors.length} 에러`);
        p.errors.slice(0, 2).forEach(e => {
          console.log(`    - ${e.substring(0, 100)}...`);
        });
      });
    }

    if (pagesWithWarnings.length > 0) {
      console.log('\n경고만 있는 페이지:');
      console.log('-'.repeat(80));
      pagesWithWarnings.forEach(p => {
        console.log(`  ${p.page} (${p.url}) - ${p.warnings.length} 경고`);
      });
    }

    console.log(`\n깨끗한 페이지 (${cleanPages.length}개):`);
    cleanPages.slice(0, 10).forEach(p => {
      console.log(`  ✓ ${p.page}`);
    });

    console.log('\n'.repeat(80));

    // 모든 페이지가 깨끗해야 함
    expect(pagesWithErrors.length).toBe(0);
  });

  test('[ERROR-REP-002] 심각한 에러 우선 보고', async ({ page }) => {
    const criticalErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();

        // 심각한 에러 패턴
        const criticalPatterns = [
          /uncaught/i,
          /fatal/i,
          /crash/i,
          /cannot read/i,
          /undefined is not/i,
          /null is not/i,
        ];

        for (const pattern of criticalPatterns) {
          if (pattern.test(text)) {
            criticalErrors.push(`[CRITICAL] ${text}`);
            break;
          }
        }
      }
    });

    // 모든 테스트 페이지 방문
    for (const pageInfo of TEST_PAGES) {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await page.waitForTimeout(500);
    }

    // 심각한 에러 보고
    if (criticalErrors.length > 0) {
      console.log('\n❌ 심각한 에러 발견 (Critical Errors Found):');
      criticalErrors.forEach(err => console.log(`  ${err}`));
    }

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Console Error Check - Error Recovery', () => {
  test('[ERROR-REC-001] 네트워크 에러 복구 테스트', async ({ page }) => {
    await page.goto(`${BASE_URL}/catalog`);

    // 네트워크 요청 모니터링
    const failedRequests: string[] = [];

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (failure) {
        failedRequests.push(`${request.url()} - ${failure.errorText}`);
      }
    });

    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 일부 요청이 실패해도 페이지가 작동해야 함
    const bodyVisible = await page.locator('body').isVisible();

    expect(bodyVisible).toBe(true);

    if (failedRequests.length > 0) {
      console.log(`일부 요청 실패하지만 페이지 작동: ${failedRequests.length}개 실패`);
    }
  });

  test('[ERROR-REC-002] JavaScript 에러 후 페이지 동작 테스트', async ({ page }) => {
    let jsErrorOccurred = false;

    page.on('pageerror', (error) => {
      jsErrorOccurred = true;
      console.log(`JavaScript error: ${error.message}`);
    });

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);

    // JavaScript 에러가 발생해도 페이지는 작동해야 함
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // 기본 기능 테스트
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test('[ERROR-REC-003] 에러 발생 후 다른 페이지로 이동 테스트', async ({ page }) => {
    // 에러가 발생할 수 있는 페이지 방문
    await page.goto(`${BASE_URL}/this-page-does-not-exist`);

    // 홈페이지로 이동 시도
    await page.goto(`${BASE_URL}/`);

    // 홈페이지가 정상 작동해야 함
    const body = page.locator('body');
    await expect(body).toBeVisible();

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Console Error Check - Memory Leaks', () => {
  test('[ERROR-MEM-001] 메모리 누수 확인', async ({ page }) => {
    // 여러 페이지 방문으로 메모리 사용량 확인
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 10개 페이지 방문
    for (let i = 0; i < 10; i++) {
      await page.goto(`${BASE_URL}/catalog`);
      await page.waitForTimeout(500);
      await page.goto(`${BASE_URL}/`);
      await page.waitForTimeout(500);
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

    console.log(`메모리 증가: ${memoryIncreaseMB.toFixed(2)} MB`);

    // 메모리 증가가 너무 크면 안 됨 (50MB 이하 권장)
    expect(memoryIncreaseMB).toBeLessThan(50);
  });
});

test.describe('Console Error Check - Deprecated APIs', () => {
  test('[ERROR-DEP-001] 사용되지 않는 API 사용 확인', async ({ page }) => {
    const deprecatedWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('deprecated')) {
        deprecatedWarnings.push(msg.text());
      }
    });

    // 주요 페이지 방문
    const keyPages = ['/', '/catalog', '/quote-simulator', '/contact'];

    for (const pagePath of keyPages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(1000);
    }

    // deprecated 경고 보고
    if (deprecatedWarnings.length > 0) {
      console.log('\n사용되지 않는 API 경고:');
      deprecatedWarnings.forEach(warn => console.log(`  ${warn}`));
    } else {
      console.log('사용되지 않는 API 사용 없음');
    }

    // deprecated API 사용이 너무 많으면 안 됨
    expect(deprecatedWarnings.length).toBeLessThan(10);
  });
});

test.describe('Console Error Check - React Hydration', () => {
  test('[ERROR-HYD-001] React hydration 에러 확인', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const text = msg.text();
        if (text.toLowerCase().includes('hydrat')) {
          hydrationErrors.push(text);
        }
      }
    });

    // 모든 테스트 페이지 방문
    for (const pageInfo of TEST_PAGES.slice(0, 10)) {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      await page.waitForTimeout(1000);
    }

    // hydration 에러 보고
    if (hydrationErrors.length > 0) {
      console.log('\nReact hydration 에러:');
      hydrationErrors.forEach(err => console.log(`  ${err}`));
    }

    expect(hydrationErrors.length).toBe(0);
  });
});

test.describe('Console Error Check - Resource Loading', () => {
  test('[ERROR-RES-001] 리소스 로딩 에러 확인', async ({ page }) => {
    const failedResources: string[] = [];

    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();

      // 4xx 및 5xx 에러 수집 (favicon 제외)
      if (status >= 400 && !url.includes('favicon')) {
        failedResources.push(`${status}: ${url}`);
      }
    });

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    await page.waitForTimeout(2000);

    // 실패한 리소스 보고
    if (failedResources.length > 0) {
      console.log('\n실패한 리소스:');
      failedResources.slice(0, 10).forEach(res => console.log(`  ${res}`));

      if (failedResources.length > 10) {
        console.log(`  ... 그 외 ${failedResources.length - 10}개 리소스`);
      }
    }

    // 실패한 리소스가 너무 많으면 안 됨
    expect(failedResources.length).toBeLessThan(20);
  });

  test('[ERROR-RES-002] 이미지 로딩 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // 모든 이미지 확인
    const images = page.locator('img[src]');
    const imageCount = await images.count();

    let brokenImages = 0;

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);

      // 이미지가 로드되었는지 확인
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      if (naturalWidth === 0) {
        const src = await img.getAttribute('src');
        console.log(`Broken image: ${src}`);
        brokenImages++;
      }
    }

    // 깨진 이미지가 없어야 함
    expect(brokenImages).toBe(0);
  });
});

test.describe('Console Error Check - Performance Metrics', () => {
  test('[ERROR-PERF-001] CLS (Cumulative Layout Shift) 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // CLS 측정 (간단 버전)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(clsValue), 3000);
      });
    });

    console.log(`CLS: ${cls.toFixed(4)}`);

    // CLS가 0.1 이하여야 함 (권장 기준)
    expect(cls).toBeLessThan(0.25); // 허용 기준 (빨간색)
  });

  test('[ERROR-PERF-002] FID (First Input Delay) 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // 페이지 상호작용 후 FID 측정
    await page.click('body');
    await page.waitForTimeout(100);

    // FID는 측정하기 어려우므로 대신 응답성 확인
    const responsive = await page.evaluate(() => {
      const start = performance.now();
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(performance.now() - start);
        });
      });
    });

    console.log(`응답성 지연: ${responsive.toFixed(2)}ms`);
  });
});

test.describe('Console Error Check - Final Summary', () => {
  test('[ERROR-SUMMARY] 최종 요약 생성', async ({}) => {
    console.log('\n'.repeat(80));
    console.log('콘솔 에러 점검 최종 요약');
    console.log('Console Error Check Final Summary');
    console.log('='.repeat(80));

    console.log('\n검사한 페이지:');
    TEST_PAGES.forEach(p => {
      console.log(`  ✓ ${p.name} (${p.path})`);
    });

    console.log('\n에러 검사 카테고리:');
    console.log('  • JavaScript Runtime Errors');
    console.log('  • Network Errors');
    console.log('  • React Hydration Errors');
    console.log('  • Deprecated API Warnings');
    console.log('  • Resource Loading Errors');
    console.log('  • Memory Leaks');
    console.log('  • Performance Issues');

    console.log('\n검사 항목:');
    console.log('  ✅ Console Errors (콘솔 에러)');
    console.log('  ✅ Console Warnings (콘솔 경고)');
    console.log('  ✅ Page Errors (페이지 에러)');
    console.log('  ✅ Network Failures (네트워크 실패)');
    console.log('  ✅ Image Loading (이미지 로딩)');
    console.log('  ✅ Performance Metrics (성능 지표)');

    console.log('\n'.repeat(80));
    console.log('테스트 완료 (Test Complete)');
    console.log('='.repeat(80));
  });
});
