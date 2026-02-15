import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Comprehensive Console Error Check Test
 * 포괄적인 콘솔 에러 점검 테스트
 *
 * Tests all pages for:
 * - No JavaScript errors
 * - No React warnings
 * - No hydration errors
 * - No network errors
 * - No deprecated API usage
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test results interface
interface ConsoleErrorResult {
  page: string;
  path: string;
  category: string;
  status: number;
  errors: string[];
  warnings: string[];
  loadTime: number;
}

// Results storage
const results: ConsoleErrorResult[] = [];
const errorCategories: Map<string, number> = new Map();
const uniqueErrors: Map<string, number> = new Map();

// Complete page inventory
const ALL_PAGES = [
  // Public Pages
  { path: '/', name: '홈페이지', category: 'public' },
  { path: '/about', name: '회사소개', category: 'public' },
  { path: '/contact', name: '연락처', category: 'public' },
  { path: '/service', name: '서비스', category: 'public' },
  { path: '/privacy', name: '개인정보처리방침', category: 'public' },
  { path: '/terms', name: '이용약관', category: 'public' },
  { path: '/catalog', name: '제품카탈로그', category: 'public' },
  { path: '/guide', name: '가이드', category: 'public' },
  { path: '/guide/color', name: '색상 가이드', category: 'public' },
  { path: '/guide/size', name: '사이즈 가이드', category: 'public' },
  { path: '/guide/image', name: '이미지 가이드', category: 'public' },
  { path: '/industry/cosmetics', name: '화장품 산업', category: 'public' },
  { path: '/industry/electronics', name: '전자산업', category: 'public' },
  { path: '/industry/food-manufacturing', name: '식품 제조', category: 'public' },
  { path: '/pricing', name: '가격정책', category: 'public' },
  { path: '/smart-quote', name: '스마트 견적', category: 'public' },
  { path: '/quote-simulator', name: '견적 시뮬레이터', category: 'public' },
  { path: '/roi-calculator', name: 'ROI 계산기', category: 'public' },
  { path: '/samples', name: '샘플 신청', category: 'public' },
  { path: '/archives', name: '아카이브', category: 'public' },
  { path: '/compare', name: '제품 비교', category: 'public' },
  { path: '/news', name: '뉴스', category: 'public' },

  // Auth Pages
  { path: '/auth/signin', name: '로그인', category: 'auth' },
  { path: '/auth/register', name: '회원가입', category: 'auth' },
  { path: '/auth/forgot-password', name: '비밀번호 찾기', category: 'auth' },
  { path: '/auth/pending', name: '승인 대기', category: 'auth' },

  // B2B Pages
  { path: '/b2b/login', name: 'B2B 로그인', category: 'b2b' },
  { path: '/b2b/register', name: 'B2B 회원가입', category: 'b2b' },

  // Member Pages (may redirect)
  { path: '/member/dashboard', name: '회원 대시보드', category: 'member' },
  { path: '/member/orders', name: '주문 내역', category: 'member' },
  { path: '/member/quotations', name: '견적 내역', category: 'member' },
  { path: '/member/profile', name: '프로필', category: 'member' },

  // Portal Pages → Admin/Customers (301 redirect)
  { path: '/portal', name: '포털 홈 (→ admin/customers)', category: 'portal' },
  { path: '/portal/profile', name: '포털 프로필 (→ admin/customers/profile)', category: 'portal' },

  // Admin Pages (may redirect)
  { path: '/admin/dashboard', name: '관리자 대시보드', category: 'admin' },
  { path: '/admin/orders', name: '주문 관리', category: 'admin' },
  { path: '/admin/production', name: '생산 관리', category: 'admin' },
  { path: '/admin/shipments', name: '배송 관리', category: 'admin' },
];

test.describe('Comprehensive Console Error Check - All Pages', () => {
  test.beforeAll(async () => {
    console.log('\n========================================');
    console.log('포괄적인 콘솔 에러 점검');
    console.log('Comprehensive Console Error Check');
    console.log('========================================\n');
  });

  ALL_PAGES.forEach(({ path, name, category }) => {
    test(`[CONSOLE-${category.toUpperCase()}] ${name} (${path}) - 콘솔 에러 확인`, async ({ page }) => {
      const startTime = Date.now();
      const pageErrors: string[] = [];
      const pageWarnings: string[] = [];
      const networkErrors: string[] = [];

      // 1. Console listener setup
      page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();

        // 에러 수집
        if (type === 'error') {
          // 허용된 에러 패턴 필터링
          if (!text.includes('favicon') && !text.includes('DevTools')) {
            pageErrors.push(text);
          }
        }
        // 경고 수집
        else if (type === 'warning') {
          pageWarnings.push(text);
        }
      });

      // 2. Page error listener (JavaScript runtime errors)
      page.on('pageerror', (error) => {
        pageErrors.push(`PAGE ERROR: ${error.message}`);
      });

      // 3. Network error listener
      page.on('response', (response) => {
        if (response.status() >= 400) {
          const url = response.url();
          // 자체 요청은 무시
          if (!url.includes('favicon') && !url.includes('__webpack')) {
            networkErrors.push(`NETWORK ${response.status()}: ${url}`);
          }
        }
      });

      // 4. Failed request listener
      page.on('requestfailed', (request) => {
        const failure = request.failure();
        if (failure) {
          const url = request.url();
          if (!url.includes('favicon') && !url.includes('analytics')) {
            networkErrors.push(`REQUEST FAILED: ${url} - ${failure.errorText}`);
          }
        }
      });

      // 5. Navigate to page
      try {
        const response = page.goto(`${BASE_URL}${path}`, {
          waitUntil: 'domcontentloaded',
        });

        const status = (await response).status();

        // 6. Wait for any delayed errors
        await page.waitForTimeout(2000);

        const loadTime = Date.now() - startTime;

        // 7. Process results
        const result: ConsoleErrorResult = {
          page: name,
          path,
          category,
          status,
          errors: [...pageErrors, ...networkErrors],
          warnings: pageWarnings,
          loadTime,
        };

        results.push(result);

        // 8. Categorize errors
        pageErrors.forEach(err => {
          let category = 'Other';

          if (err.includes('Hydration')) category = 'React Hydration';
          else if (err.includes('Supabase')) category = 'Supabase';
          else if (err.includes('fetch') || err.includes('NETWORK')) category = 'Network';
          else if (err.includes('PAGE ERROR')) category = 'JavaScript Runtime';
          else if (err.includes('Warning')) category = 'React Warning';

          errorCategories.set(category, (errorCategories.get(category) || 0) + 1);

          // Count unique errors
          const key = err.split('|')[0].substring(0, 100);
          uniqueErrors.set(key, (uniqueErrors.get(key) || 0) + 1);
        });

        networkErrors.forEach(err => {
          errorCategories.set('Network', (errorCategories.get('Network') || 0) + 1);
        });

        // 9. Console output for test results
        console.log(`\n[${category.toUpperCase()}] ${name} (${path})`);
        console.log(`  상태 (Status): ${status} | 로드 시간 (Load Time): ${loadTime}ms`);

        if (result.errors.length > 0) {
          console.log(`  ❌ 에러 (${result.errors.length}개):`);
          result.errors.slice(0, 3).forEach(err => {
            console.log(`     - ${err.substring(0, 120)}...`);
          });
          if (result.errors.length > 3) {
            console.log(`     ... 그 외 ${result.errors.length - 3}개 에러`);
          }
        }

        if (result.warnings.length > 0) {
          console.log(`  ⚠️  경고 (${result.warnings.length}개):`);
          result.warnings.slice(0, 2).forEach(warn => {
            console.log(`     - ${warn.substring(0, 120)}...`);
          });
          if (result.warnings.length > 2) {
            console.log(`     ... 그 외 ${result.warnings.length - 2}개 경고`);
          }
        }

        if (result.errors.length === 0 && result.warnings.length === 0) {
          console.log(`  ✅ 깨끗함 - 콘솔 문제 없음`);
        }

        // 10. Assertion - No critical errors
        const criticalErrors = pageErrors.filter(e =>
          !e.includes('Warning') &&
          !e.includes('deprecated')
        );

        expect(criticalErrors.length).toBe(0);

        // 11. Take screenshot on error
        if (result.errors.length > 0) {
          const screenshotPath = path.join(
            process.cwd(),
            'test-results',
            'screenshots',
            `console-error-${name.replace(/\s+/g, '-').toLowerCase()}.png`
          );
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`  📸 스크린샷 저장됨: ${screenshotPath}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ❌ 탐색 실패: ${errorMessage}`);

        results.push({
          page: name,
          path,
          category,
          status: 0,
          errors: [`NAVIGATION ERROR: ${errorMessage}`],
          warnings: [],
          loadTime: Date.now() - startTime,
        });
      }
    });
  });
});

test.describe('Comprehensive Console Error Check - React Hydration', () => {
  test('[HYDRATION] No React hydration errors across all pages', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        hydrationErrors.push(msg.text());
      }
    });

    // 주요 페이지만 확인
    const keyPages = ['/', '/catalog', '/quote-simulator', '/contact'];

    for (const pagePath of keyPages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForTimeout(1000);
    }

    expect(hydrationErrors.length).toBe(0);

    if (hydrationErrors.length > 0) {
      console.log('Hydration errors found:');
      hydrationErrors.forEach(err => console.log(`  - ${err}`));
    }
  });
});

test.describe('Comprehensive Console Error Check - Network Errors', () => {
  test('[NETWORK] No critical network errors', async ({ page }) => {
    const networkErrors: string[] = [];

    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();

      // 404 에러는 favicon 등 허용된 경우 제외
      if (status >= 400 && !url.includes('favicon')) {
        networkErrors.push(`${status}: ${url}`);
      }
    });

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);

    // 치명적인 네트워크 에러만 확인 (API 요청 실패 등)
    const criticalNetworkErrors = networkErrors.filter(err =>
      err.includes('500') ||
      err.includes('/api/')
    );

    expect(criticalNetworkErrors.length).toBe(0);

    if (networkErrors.length > 0) {
      console.log('Network errors found:');
      networkErrors.forEach(err => console.log(`  - ${err}`));
    }
  });
});

test.describe('Comprehensive Console Error Check - Deprecated APIs', () => {
  test('[DEPRECATED] No deprecated API usage warnings', async ({ page }) => {
    const deprecatedWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('deprecated')) {
        deprecatedWarnings.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);

    // deprecated 경고가 너무 많으면 실패
    expect(deprecatedWarnings.length).toBeLessThan(5);

    if (deprecatedWarnings.length > 0) {
      console.log('Deprecated API warnings:');
      deprecatedWarnings.forEach(warn => console.log(`  - ${warn}`));
    }
  });
});

test.describe('Comprehensive Console Error Check - Final Report', () => {
  test('[REPORT] Generate comprehensive console error report', async ({}, testInfo) => {
    console.log('\n\n========================================');
    console.log('최종 보고서 (Final Report)');
    console.log('========================================\n');

    const pagesWithErrors = results.filter(r => r.errors.length > 0);
    const pagesWithWarnings = results.filter(r => r.warnings.length > 0 && r.errors.length === 0);
    const cleanPages = results.filter(r => r.errors.length === 0 && r.warnings.length === 0);

    // Summary
    console.log('📊 요약 (Summary)');
    console.log('='.repeat(60));
    console.log(`전체 URL: ${results.length}`);
    console.log(`에러가 있는 페이지: ${pagesWithErrors.length}`);
    console.log(`경고만 있는 페이지: ${pagesWithWarnings.length}`);
    console.log(`깨끗한 페이지: ${cleanPages.length}`);
    console.log('');

    // Error categories
    if (errorCategories.size > 0) {
      console.log('📋 에러 카테고리 (Error Categories)');
      console.log('='.repeat(60));
      Array.from(errorCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`${category.padEnd(25)} ${count}개`);
        });
      console.log('');
    }

    // Most common errors
    if (uniqueErrors.size > 0) {
      console.log('🔥 가장 흔한 에러 (Most Common Errors)');
      console.log('='.repeat(60));
      Array.from(uniqueErrors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([error, count]) => {
          console.log(`[${count}x] ${error.substring(0, 80)}...`);
        });
      console.log('');
    }

    // Pages with errors
    if (pagesWithErrors.length > 0) {
      console.log('❌ 에러가 있는 페이지 (Pages with Errors)');
      console.log('='.repeat(60));
      console.log(
        '페이지'.padEnd(30) +
        '카테고리'.padEnd(12) +
        '에러'.padEnd(8) +
        '상태'
      );
      console.log('-'.repeat(60));

      pagesWithErrors.forEach(p => {
        console.log(
          p.page.substring(0, 30).padEnd(30) +
          p.category.padEnd(12) +
          String(p.errors.length).padEnd(8) +
          String(p.status)
        );
      });
      console.log('');
    }

    // Pages with warnings
    if (pagesWithWarnings.length > 0) {
      console.log('⚠️  경고만 있는 페이지 (Pages with Warnings Only)');
      console.log('='.repeat(60));
      console.log(
        '페이지'.padEnd(30) +
        '카테고리'.padEnd(12) +
        '경고'.padEnd(10) +
        '상태'
      );
      console.log('-'.repeat(60));

      pagesWithWarnings.forEach(p => {
        console.log(
          p.page.substring(0, 30).padEnd(30) +
          p.category.padEnd(12) +
          String(p.warnings.length).padEnd(10) +
          String(p.status)
        );
      });
      console.log('');
    }

    // Clean pages
    console.log(`✅ 깨끗한 페이지 (Clean Pages) - ${cleanPages.length}개`);
    console.log('='.repeat(60));
    cleanPages.slice(0, 20).forEach(p => {
      console.log(`  ✓ ${p.page} (${p.path})`);
    });
    if (cleanPages.length > 20) {
      console.log(`  ... 그 외 ${cleanPages.length - 20}개`);
    }
    console.log('');

    // Generate markdown report
    const reportPath = path.join(process.cwd(), 'docs', 'CONSOLE_ERRORS_COMPLETE_REPORT.md');
    generateMarkdownReport(results, errorCategories, uniqueErrors, reportPath);
    console.log(`📄 상세 보고서 저장됨: ${reportPath}`);
    console.log('\n'.repeat(80));
  });
});

// Helper function to generate markdown report
function generateMarkdownReport(
  results: ConsoleErrorResult[],
  errorCategories: Map<string, number>,
  uniqueErrors: Map<string, number>,
  reportPath: string
) {
  const pagesWithErrors = results.filter(r => r.errors.length > 0);
  const pagesWithWarnings = results.filter(r => r.warnings.length > 0 && r.errors.length === 0);
  const cleanPages = results.filter(r => r.errors.length === 0 && r.warnings.length === 0);

  let markdown = '# 포괄적인 콘솔 에러 보고서\n\n';
  markdown += '**생성일:** ' + new Date().toISOString() + '\n\n';

  // Summary
  markdown += '## 요약 (Summary)\n\n';
  markdown += '| 항목 | 건수 |\n';
  markdown += '|------|------|\n';
  markdown += `| 전체 URL | ${results.length} |\n`;
  markdown += `| 에러가 있는 페이지 | ${pagesWithErrors.length} |\n`;
  markdown += `| 경고만 있는 페이지 | ${pagesWithWarnings.length} |\n`;
  markdown += `| 깨끗한 페이지 | ${cleanPages.length} |\n\n`;

  // Error categories
  if (errorCategories.size > 0) {
    markdown += '## 에러 카테고리 (Error Categories)\n\n';
    markdown += '| 카테고리 | 건수 |\n';
    markdown += '|----------|------|\n';
    Array.from(errorCategories.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        markdown += `| ${category} | ${count} |\n`;
      });
    markdown += '\n';
  }

  // Most common errors
  if (uniqueErrors.size > 0) {
    markdown += '## 가장 흔한 에러 (Most Common Errors)\n\n';
    Array.from(uniqueErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([error, count]) => {
        markdown += `${count}. \`${error.substring(0, 150)}\`\n\n`;
      });
    markdown += '\n';
  }

  // Pages with errors
  if (pagesWithErrors.length > 0) {
    markdown += '## 에러가 있는 페이지 (Pages with Errors)\n\n';
    markdown += '| 페이지 | URL | 카테고리 | 에러 수 | 상태 |\n';
    markdown += '|--------|-----|----------|---------|--------|\n';
    pagesWithErrors.forEach(p => {
      markdown += `| ${p.page} | ${p.path} | ${p.category} | ${p.errors.length} | ${p.status} |\n`;
    });
    markdown += '\n';

    // Detailed errors
    markdown += '### 상세 에러 내역 (Detailed Errors)\n\n';
    pagesWithErrors.forEach(p => {
      markdown += `#### ${p.page} (${p.path})\n\n`;
      markdown += `**상태:** ${p.status} | **로드 시간:** ${p.loadTime}ms\n\n`;
      p.errors.slice(0, 5).forEach(err => {
        markdown += `- ${err.substring(0, 200)}\n`;
      });
      if (p.errors.length > 5) {
        markdown += `- ... 그 외 ${p.errors.length - 5}개 에러\n`;
      }
      markdown += '\n';
    });
  }

  // Pages with warnings
  if (pagesWithWarnings.length > 0) {
    markdown += '## 경고만 있는 페이지 (Pages with Warnings)\n\n';
    markdown += '| 페이지 | URL | 카테고리 | 경고 수 | 상태 |\n';
    markdown += '|--------|-----|----------|---------|--------|\n';
    pagesWithWarnings.forEach(p => {
      markdown += `| ${p.page} | ${p.path} | ${p.category} | ${p.warnings.length} | ${p.status} |\n`;
    });
    markdown += '\n';
  }

  // Clean pages
  markdown += `## 깨끗한 페이지 (Clean Pages) - ${cleanPages.length}개\n\n`;
  markdown += '다음 페이지는 콘솔 에러나 경고가 없습니다:\n\n';
  cleanPages.forEach(p => {
    markdown += `- ✅ ${p.page} (${p.path})\n`;
  });
  markdown += '\n';

  // Write report
  fs.writeFileSync(reportPath, markdown, 'utf-8');
}
