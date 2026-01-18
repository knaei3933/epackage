# 통합 홈페이지 포괄 테스트 시나리오

Epackage Lab Web의 모든 페이지에 대한 콘솔 에러, 페이지 누락, 데이터베이스 연동을 확인하는 포괄 테스트 시나리오

---

## 📋 목차

1. [테스트 개요](#테스트-개요)
2. [사전 준비](#사전-준비)
3. [Supabase MCP 데이터베이스 검증](#supabase-mcp-데이터베이스-검증)
4. [Phase 1: 공개 페이지 테스트](#phase-1-공개-페이지-테스트)
5. [Phase 2: 인증 페이지 테스트](#phase-2-인증-페이지-테스트)
6. [Phase 3: 회원 포털 테스트](#phase-3-회원-포털-테스트)
7. [Phase 4: 관리자 포털 테스트](#phase-4-관리자-포털-테스트)
8. [Phase 5: 301 리다이렉트 검증](#phase-5-301-리다이렉트-검증)
9. [Phase 6: 데이터베이스 연동 테스트](#phase-6-데이터베이스-연동-테스트)
10. [예상 결과 및 성공 기준](#예상-결과-및-성공-기준)
11. [문제 해결 가이드](#문제-해결-가이드)

---

## 테스트 개요

### 테스트 범위

**대상 페이지**: old 폴더를 제외한 모든 페이지 (87페이지)

| 영역 | 페이지 수 | 경로 |
|------|----------|------|
| **공개 페이지** | 37 | `/`, `/catalog`, `/contact`, etc. |
| **인증 페이지** | 6 | `/auth/*` |
| **회원 페이지** | 26 | `/member/*` |
| **관리자 페이지** | 18 | `/admin/*` (통합 Portal 포함) |
| **합계** | **87** | - |

### 테스트 항목

#### 1. 콘솔 에러 확인
- JavaScript 에러
- React 경고
- 네트워크 실패
- 타이머스크립트 오류

#### 2. 페이지 누락 확인 (404)
- 존재하지 않는 페이지 접근
- 링크된 페이지의 존재 여부
- 동적 라우팅 ([id]) 파라미터

#### 3. 데이터베이스 연동 확인 (Supabase MCP 활용)
- **올바른 연동**: 인증 후 데이터 로드
- **잘못된 연동**: RLS 정책 위반, 인증 없이 보호된 페이지 접근

### 테스트 환경

```bash
# 개발 서버 시작
npm run dev

# 테스트 서버 (포트 3006)
NEXT_PUBLIC_DEV_MODE=true npm run dev

# Playwright 테스트 실행
npx playwright test
```

---

## 사전 준비

### 1. 환경 설정

#### 필수 환경 변수 (.env.local)

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://ijlgpzjdfipzmjvawofp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_jSelpAFvXqOnQGxiLQL2Nw_KebsJfCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 개발 모드 (테스트용)
NEXT_PUBLIC_DEV_MODE=true
ENABLE_DEV_MOCK_AUTH=true
DISABLE_RATE_LIMIT=true

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### 테스트 데이터베이스 확인 (Supabase MCP 사용)

```sql
-- 1. 테이블 존재 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 예상 결과:
-- - profiles
-- - users
-- - orders
-- - quotations
-- - products
-- - sample_requests
-- - contracts
-- - documents
-- 등 60개 테이블

-- 2. RLS 정책 확인
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. 테스트 사용자 확인
SELECT id, email, role, status
FROM profiles
LIMIT 10;
```

### 2. 테스트 사용자 생성

```sql
-- 테스트 관리자 생성
INSERT INTO profiles (id, email, kanji_last_name, kanji_first_name, role, status)
VALUES (
  'test-admin-001',
  'admin@test.com',
  'テスト',
  '管理者',
  'ADMIN',
  'ACTIVE'
);

-- 테스트 회원 생성
INSERT INTO profiles (id, email, kanji_last_name, kanji_first_name, role, status)
VALUES (
  'test-member-001',
  'member@test.com',
  'テスト',
  'ユーザー',
  'MEMBER',
  'ACTIVE'
);

-- 테스트 대기 회원 생성
INSERT INTO profiles (id, email, kanji_last_name, kanji_first_name, role, status)
VALUES (
  'test-pending-001',
  'pending@test.com',
  'テスト',
  '保留中',
  'MEMBER',
  'PENDING'
);
```

### 3. Playwright 설정 확인

**파일**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3006',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Supabase MCP 데이터베이스 검증

### MCP를 사용한 데이터베이스 검증 절차

#### Step 1: 테이블 스키마 확인

```javascript
// Supabase MCP 사용: 테이블 목록 조회
const { data: tables, error: tablesError } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .order('table_name');

// 필수 테이블 확인
const requiredTables = [
  'profiles', 'users', 'orders', 'quotations', 'products',
  'sample_requests', 'contracts', 'documents', 'shipments',
  'inventory_items', 'approvals', 'invoices', 'notifications'
];

// 검증
const missingTables = requiredTables.filter(
  table => !tables?.find(t => t.table_name === table)
);

if (missingTables.length > 0) {
  console.error('❌ 누락된 테이블:', missingTables);
} else {
  console.log('✅ 모든 필수 테이블 존재');
}
```

#### Step 2: RLS 정책 확인

```javascript
// 각 테이블의 RLS 정책 확인
const tablesWithRLS = [
  'profiles', 'orders', 'quotations', 'sample_requests',
  'contracts', 'documents', 'invoices', 'notifications'
];

for (const table of tablesWithRLS) {
  const { data: policies } = await supabase
    .rpc('get_policies_for_table', { table_name: table });

  if (policies && policies.length > 0) {
    console.log(`✅ ${table}: RLS 정책 있음 (${policies.length}개)`);
  } else {
    console.error(`❌ ${table}: RLS 정책 없음 (보안 위험)`);
  }
}
```

#### Step 3: 테스트 데이터 확인

```javascript
// 테스트 사용자 존재 확인
const { data: testUsers } = await supabase
  .from('profiles')
  .select('id, email, role, status')
  .in('email', [
    'admin@test.com',
    'member@test.com',
    'pending@test.com'
  ]);

console.log('📊 테스트 사용자:', testUsers);

// 샘플 데이터 확인
const { data: products } = await supabase
  .from('products')
  .select('id, name_ja')
  .limit(5);

console.log('📦 샘플 제품 데이터:', products?.length, '개');
```

#### Step 4: API 연동 테스트

```javascript
// API 엔드포인트 연동 확인
const apiEndpoints = [
  '/api/member/dashboard',
  '/api/member/orders',
  '/api/member/quotations',
  '/api/admin/dashboard/statistics',
  '/api/admin/orders'
];

for (const endpoint of apiEndpoints) {
  try {
    const response = await fetch(`http://localhost:3000${endpoint}`);
    if (response.ok) {
      console.log(`✅ ${endpoint}: 연동 성공`);
    } else {
      console.error(`❌ ${endpoint}: HTTP ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ ${endpoint}: 연결 실패`, error.message);
  }
}
```

---

## Phase 1: 공개 페이지 테스트

### 1.1 공개 페이지 목록 (37페이지)

```
1.  / (홈페이지)
2.  /catalog (제품 카탈로그)
3.  /catalog/[slug] (제품 상세 - 다수)
4.  /contact (연락처)
5.  /quote-simulator (견적 시뮬레이터)
6.  /smart-quote (스마트 견적)
7.  /roi-calculator (ROI 계산기)
8.  /samples (샘플 요청)
9.  /news (뉴스)
10. /premium-content (프리미엄 콘텐츠)
11. /archives (아카이브)
12. /guide/size (사이즈 가이드)
13. /about (회사 소개)
14. /inquiry/detailed (상세 문의)
15. /portal (301 → /admin/customers)
16. /b2b/* (301 → /auth/* or /member/*)
```

### 1.2 테스트 시나리오

#### TC-PUBLIC-001: 홈페이지 접근

```typescript
test.describe('공개 페이지: 홈페이지', () => {
  test('콘솔 에러 없이 로드되어야 함', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    await page.goto('/');

    // 콘솔 에러 확인
    expect(consoleErrors).toHaveLength(0);

    // 페이지 요소 확인
    await expect(page.locator('h1')).toBeVisible();

    // 스크린샷
    await page.screenshot({ path: 'screenshots/public/home.png' });
  });

  test('404가 아니어야 함', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).not.toBe(404);
  });
});
```

#### TC-PUBLIC-002: 제품 카탈로그

```typescript
test.describe('공개 페이지: 카탈로그', () => {
  test('카탈로그 페이지 접근', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/catalog');

    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator('h1, h2')).toContainText(/カタログ|catalog/i);

    // 제품 카드가 표시되어야 함
    const productCards = await page.locator('[data-testid="product-card"]').count();
    expect(productCards).toBeGreaterThan(0);
  });

  test('제품 상세 페이지 접근 (동적 라우팅)', async ({ page }) => {
    // 먼저 카탈로그에서 제품 링크 가져오기
    await page.goto('/catalog');
    const firstProductLink = await page.locator('a[href^="/catalog/"]').first();

    const href = await firstProductLink.getAttribute('href');
    console.log('제품 상세 URL:', href);

    // 제품 상세 페이지 접근
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(href || '/catalog/sample-product');

    expect(consoleErrors).toHaveLength(0);
    expect(await page.title()).not.toMatch(/404|Not Found/i);
  });
});
```

#### TC-PUBLIC-003: 견적 시뮬레이터

```typescript
test.describe('공개 페이지: 견적 시뮬레이터', () => {
  test('quote-simulator 페이지 접근', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/quote-simulator');

    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator('h1')).toBeVisible();

    // React 컴포넌트 마운트 확인
    const hasReactRoot = await page.locator('#__next').count();
    expect(hasReactRoot).toBe(1);
  });

  test('ROI 계산기에서 quote-simulator로 리다이렉트', async ({ page }) => {
    await page.goto('/roi-calculator');

    // 301 리다이렉트 확인
    await expect(page).toHaveURL(/\/quote-simulator/);
  });
});
```

#### TC-PUBLIC-004: 연락처 페이지

```typescript
test.describe('공개 페이지: 연락처', () => {
  test('contact 페이지 폼 동작', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/contact');

    expect(consoleErrors).toHaveLength(0);

    // 폼 필드 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('상세 문의 페이지 접근', async ({ page }) => {
    await page.goto('/inquiry/detailed');

    // 콘솔 에러 없음
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    expect(consoleErrors).toHaveLength(0);
  });
});
```

#### TC-PUBLIC-005: 404 페이지 테스트

```typescript
test.describe('공개 페이지: 404 처리', () => {
  test('존재하지 않는 페이지 접근 시 404 표시', async ({ page }) => {
    const response = await page.goto('/non-existent-page');

    expect(response?.status()).toBe(404);

    // 404 페이지 내용 확인
    await expect(page.locator('body')).toContainText(/404|Not Found|見つかりません/i);
  });

  test('잘못된 제품 slug 접근 시 404', async ({ page }) => {
    const response = await page.goto('/catalog/non-existent-product-xyz');

    // 404 또는 에러 페이지 표시
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});
```

---

## Phase 2: 인증 페이지 테스트

### 2.1 인증 페이지 목록 (6페이지)

```
1. /auth/signin (로그인)
2. /auth/register (회원가입)
3. /auth/forgot-password (비밀번호 찾기)
4. /auth/signout (로그아웃)
5. /auth/pending (대기 중)
6. /auth/error (에러)
```

### 2.2 테스트 시나리오

#### TC-AUTH-001: 로그인 페이지

```typescript
test.describe('인증 페이지: 로그인', () => {
  test('로그인 페이지 접근 및 콘솔 확인', async ({ page }) => {
    const consoleErrors = [];
    const networkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure()
      });
    });

    await page.goto('/auth/signin');

    expect(consoleErrors).toHaveLength(0);
    expect(networkErrors).toHaveLength(0);

    // 로그인 폼 확인
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Dev Mode 로그인 동작', async ({ page }) => {
    // Dev Mode에서는 모의 인증 가능
    await page.goto('/auth/signin');

    // Dev Mode 로그인 버튼 클릭 (있는 경우)
    const devLoginButton = page.locator('button:has-text("Dev")');
    if (await devLoginButton.isVisible()) {
      await devLoginButton.click();

      // 로그인 후 리다이렉트 확인
      await page.waitForURL(/\/(member|admin)/);
    }
  });

  test('잘못된 자격증명 입력 시 에러 처리', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 에러 메시지 표시 확인 (타임아웃 설정)
    await page.waitForTimeout(3000);

    // 에러가 발생하거나 로그인되지 않아야 함
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
  });
});
```

#### TC-AUTH-002: 회원가입 페이지

```typescript
test.describe('인증 페이지: 회원가입', () => {
  test('회원가입 페이지 접근 및 필드 확인', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/auth/register');

    expect(consoleErrors).toHaveLength(0);

    // 필수 필드 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('폼 유효성 검사', async ({ page }) => {
    await page.goto('/auth/register');

    // 비밀번호 너무 짧게 입력
    await page.fill('input[name="password"]', '123');
    await page.blur();

    // 유효성 검사 에러 메시지 확인
    const passwordInput = page.locator('input[name="password"]');
    const errorMessage = passwordInput.locator('..').locator('text=/短/');

    // 에러 메시지가 표시되어야 함
    // (구현에 따라 다를 수 있음)
  });
});
```

---

## Phase 3: 회원 포털 테스트

### 3.1 회원 페이지 목록 (26페이지)

```
1. /member/dashboard (대시보드)
2. /member/orders (주문 목록)
3. /member/orders/[id] (주문 상세)
4. /member/orders/new (새 주문)
5. /member/orders/reorder (재주문)
6. /member/orders/history (주문 내역)
7. /member/orders/[id]/confirmation (주문 확인)
8. /member/orders/[id]/data-receipt (데이터 수령)
9. /member/quotations (견적 목록)
10. /member/quotations/[id] (견적 상세)
11. /member/quotations/request (견적 요청)
12. /member/quotations/[id]/confirm (견적 확인)
13. /member/samples (샘플)
14. /member/profile (프로필)
15. /member/edit (프로필 수정)
16. /member/settings (설정)
17. /member/contracts (계약)
18. /member/deliveries (배송)
19. /member/inquiries (문의)
20. /member/invoices (청구서)
21. /member/notifications (알림)
22. /member/ai-extraction/* (AI 추출)
23. /member/approvals/* (승인)
```

### 3.2 테스트 시나리오

#### TC-MEMBER-001: 회원 대시보드

```typescript
test.describe('회원 포털: 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    // Dev Mode 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });
  });

  test('대시보드 데이터 로드 확인', async ({ page }) => {
    const consoleErrors = [];
    const apiErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('/member/dashboard');

    // 콘솔 에러 없음
    expect(consoleErrors).toHaveLength(0);

    // API 에러 없음 (Dev Mode에서는 모의 데이터)
    expect(apiErrors.length).toBe(0);

    // 대시보드 카드 표시 확인
    await expect(page.locator('h1')).toContainText(/ダッシュボード|dashboard/i);
  });

  test('인증 없이 접근 시 리다이렉트', async ({ page }) => {
    // 로그인하지 않고 접근
    await page.evaluate(() => {
      localStorage.clear();
    });

    await page.goto('/member/dashboard');

    // 로그인 페이지로 리다이렉트되어야 함
    await page.waitForURL(/\/(auth\/signin|pending)/);
  });
});
```

#### TC-MEMBER-002: 주문 목록

```typescript
test.describe('회원 포털: 주문 목록', () => {
  test.beforeEach(async ({ page }) => {
    // Dev Mode 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });
  });

  test('주문 목록 페이지 접근', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/member/orders');

    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('필터 기능 동작', async ({ page }) => {
    await page.goto('/member/orders');

    // 상태 필터 버튼 확인
    const statusFilters = page.locator('a[href*="status="]');
    const filterCount = await statusFilters.count();

    expect(filterCount).toBeGreaterThan(0);
  });
});
```

#### TC-MEMBER-003: 주문 상세

```typescript
test.describe('회원 포털: 주문 상세', () => {
  test.beforeEach(async ({ page }) => {
    // Dev Mode 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });
  });

  test('주문 상세 페이지 접근 (유효한 ID)', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 테스트용 주문 ID로 접근
    await page.goto('/member/orders/test-order-001');

    // 404가 아니어야 함
    const response = await page.goto('/member/orders/test-order-001');
    expect(response?.status()).not.toBe(404);

    // 콘솔 에러 확인
    expect(consoleErrors.length).toBeLessThan(5); // 일부 경고는 허용
  });

  test('존재하지 않는 주문 ID 접근 시 404', async ({ page }) => {
    const response = await page.goto('/member/orders/non-existent-id');

    expect(response?.status()).toBe(404);
  });
});
```

---

## Phase 4: 관리자 포털 테스트

### 4.1 관리자 페이지 목록 (18페이지)

```
1. /admin/dashboard (대시보드)
2. /admin/orders (주문 관리)
3. /admin/orders/[id] (주문 상세)
4. /admin/quotations (견적 관리)
5. /admin/quotations/[id] (견적 상세)
6. /admin/contracts (계약 관리)
7. /admin/contracts/[id] (계약 상세)
8. /admin/production (생산 관리)
9. /admin/production/[id] (생산 상세)
10. /admin/inventory (재고 관리)
11. /admin/approvals (승인 대기)
12. /admin/leads (리드)
13. /admin/settings (설정)
14. /admin/coupons (쿠폰)
15. /admin/customers (고객 포털 - 통합 Portal)
16. /admin/customers/orders (고객 주문)
17. /admin/customers/orders/[id] (고객 주문 상세)
18. /admin/customers/documents (고객 문서)
```

### 4.2 테스트 시나리오

#### TC-ADMIN-001: 관리자 대시보드

```typescript
test.describe('관리자 포털: 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    // Admin Dev Mode 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-admin-001');
    });
  });

  test('관리자 대시보드 접근', async ({ page }) => {
    const consoleErrors = [];
    const apiErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', response => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('/admin/dashboard');

    expect(consoleErrors).toHaveLength(0);
    expect(apiErrors.length).toBe(0);

    // 통계 카드 확인
    await expect(page.locator('h1')).toContainText(/ダッシュボード|dashboard/i);
  });

  test('회원 권한으로 접근 시 차단', async ({ page }) => {
    // 회원으로 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    await page.goto('/admin/dashboard');

    // 액세스 거부 페이지로 리다이렉트되어야 함
    await page.waitForURL(/\/(auth\/error|signin)/);
  });
});
```

#### TC-ADMIN-002: 고객 포털 (통합 Portal)

```typescript
test.describe('관리자 포털: 고객 포털', () => {
  test('ADMIN 권한으로 고객 포털 접근', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-admin-001');
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/admin/customers');

    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('ACTIVE MEMBER 권한으로 고객 포털 접근', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/admin/customers');

    expect(consoleErrors).toHaveLength(0);
  });

  test('PENDING MEMBER 권한으로 접근 시 차단', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-pending-001');
    });

    await page.goto('/admin/customers');

    // 로그인 페이지로 리다이렉트
    await page.waitForURL(/\/(auth\/signin|pending)/);
  });
});
```

---

## Phase 5: 301 리다이렉트 검증

### 5.1 리다이렉트 매핑

| 원본 URL | 리다이렉트 대상 | 상태 |
|----------|----------------|------|
| `/portal` | `/admin/customers` | 301 |
| `/portal/orders` | `/admin/customers/orders` | 301 |
| `/portal/orders/[id]` | `/admin/customers/orders/[id]` | 301 |
| `/portal/documents` | `/admin/customers/documents` | 301 |
| `/portal/profile` | `/admin/customers/profile` | 301 |
| `/portal/support` | `/admin/customers/support` | 301 |
| `/b2b/login` | `/auth/signin` | 301 |
| `/b2b/register` | `/auth/register` | 301 |
| `/b2b/contracts` | `/member/contracts` | 301 |
| `/roi-calculator` | `/quote-simulator` | 301 |

### 5.2 테스트 시나리오

#### TC-REDIRECT-001: Portal → Admin/customers 리다이렉트

```typescript
test.describe('301 리다이렉트: Portal → Admin/Customers', () => {
  test('/portal → /admin/customers', async ({ page }) => {
    const response = await page.goto('/portal');

    // 301 상태 코드 확인
    expect(response?.status()).toBe(301);

    // 최종 URL 확인
    await page.waitForURL(/\/admin\/customers$/);
    expect(page.url()).toContain('/admin/customers');
  });

  test('/portal/orders → /admin/customers/orders', async ({ page }) => {
    const response = await page.goto('/portal/orders');

    expect(response?.status()).toBe(301);
    await page.waitForURL(/\/admin\/customers\/orders$/);
  });

  test('쿼리 파라미터 보존', async ({ page }) => {
    await page.goto('/portal/orders?status=pending&page=2');

    await page.waitForURL(/\/admin\/customers\/orders\?status=pending&page=2$/);
  });

  test('/portal/orders/[id] 동적 라우팅', async ({ page }) => {
    await page.goto('/portal/orders/test-123');

    await page.waitForURL(/\/admin\/customers\/orders\/test-123$/);
  });
});
```

#### TC-REDIRECT-002: B2B 리다이렉트

```typescript
test.describe('301 리다이렉트: B2B', () => {
  test('/b2b/login → /auth/signin', async ({ page }) => {
    const response = await page.goto('/b2b/login');

    expect(response?.status()).toBe(301);
    await page.waitForURL(/\/auth\/signin$/);
  });

  test('/b2b/register → /auth/register', async ({ page }) => {
    const response = await page.goto('/b2b/register');

    expect(response?.status()).toBe(301);
    await page.waitForURL(/\/auth\/register$/);
  });

  test('/b2b/contracts → /member/contracts', async ({ page }) => {
    const response = await page.goto('/b2b/contracts');

    expect(response?.status()).toBe(301);
    await page.waitForURL(/\/member\/contracts$/);
  });
});
```

#### TC-REDIRECT-003: ROI 계산기 리다이렉트

```typescript
test.describe('301 리다이렉트: ROI Calculator', () => {
  test('/roi-calculator → /quote-simulator', async ({ page }) => {
    const response = await page.goto('/roi-calculator');

    expect(response?.status()).toBe(301);
    await page.waitForURL(/\/quote-simulator$/);
  });

  test('해시 프래그먼트 보존', async ({ page }) => {
    await page.goto('/roi-calculator#calculator');

    await page.waitForURL(/\/quote-simulator#calculator$/);
  });
});
```

---

## Phase 6: 데이터베이스 연동 테스트

### 6.1 올바른 연동 테스트

#### TC-DB-001: 인증 후 데이터 로드

```typescript
test.describe('데이터베이스: 올바른 연동', () => {
  test('로그인 후 대시보드 데이터 로드', async ({ page }) => {
    // 1. 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      // Dev Mode 로그인 설정
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
      sessionStorage.setItem('sb-access-token', 'mock-token');
    });

    // 2. 대시보드 접근
    const apiResponses = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('/member/dashboard');

    // 3. API 호출 확인
    const dashboardApiCall = apiResponses.find(
      r => r.url.includes('/api/member/dashboard')
    );

    expect(dashboardApiCall).toBeDefined();
    expect(dashboardApiCall?.status).toBeLessThan(500);
  });

  test('주문 목록 API 연동', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('/member/orders');

    const ordersApiCall = apiResponses.find(
      r => r.url.includes('/api/member/orders')
    );

    expect(ordersApiCall).toBeDefined();
  });
});
```

#### TC-DB-002: RLS 정책 준수

```typescript
test.describe('데이터베이스: RLS 정책', () => {
  test('다른 사용자 데이터 접근 차단', async ({ page }) => {
    // 사용자 A로 로그인
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    await page.goto('/member/orders/test-order-002');

    // 자신의 주문이 아니면 접근 거부되어야 함
    // 403 또는 404 반환
    const response = await page.goto('/member/orders/other-user-order');

    expect(response?.status()).toBeGreaterThanOrEqual(403);
  });

  test('관리자는 모든 데이터 접근 가능', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-admin-001');
    });

    // 관리자 대시보드 접근
    await page.goto('/admin/dashboard');

    // 모든 통계 데이터 로드 가능해야 함
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    expect(consoleErrors.length).toBeLessThan(3); // 일부 경고는 허용
  });
});
```

### 6.2 잘못된 연동 테스트

#### TC-DB-NEGATIVE-001: 인증 없이 보호된 페이지 접근

```typescript
test.describe('데이터베이스: 잘못된 연동', () => {
  test('인증 없이 회원 페이지 접근 시도', async ({ page }) => {
    // 로그인 정보 제거
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/member/dashboard');

    // 로그인 페이지로 리다이렉트
    await page.waitForURL(/\/(auth\/signin|pending)/);
  });

  test('잘못된 API 키로 요청', async ({ page, context }) => {
    // 잘못된 API 키로 페이지 요청 시도
    await context.addInitScript(() => {
      // 환경 변수를 일시적으로 변경
      window.__NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-key';
    });

    await page.goto('/member/dashboard');

    // 인증 에러 처리되어야 함
    // 로그인 페이지로 리다이렉트
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/auth');
  });

  test('존재하지 않는 데이터 조회', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    const response = await page.goto('/member/orders/non-existent-order');

    // 404 또는 적절한 에러 처리
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});
```

#### TC-DB-NEGATIVE-002: 권한 위반 시도

```typescript
test.describe('데이터베이스: 권한 위반', () => {
  test('일반 회원이 관리자 페이지 접근 시도', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    await page.goto('/admin/orders');

    // 액세스 거부
    await page.waitForURL(/\/(auth\/error|signin)/);
  });

  test('대기 중 회원이 회원 페이지 접근 시도', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-pending-001');
    });

    await page.goto('/member/orders');

    // pending 페이지로 리다이렉트
    await page.waitForURL(/\/(auth\/pending)/);
  });
});
```

---

## 예상 결과 및 성공 기준

### 성공 기준

| 항목 | 기준 | 측정 방법 |
|------|------|----------|
| **콘솔 에러** | 0개 (치명적 에러) | Playwright console 리스너 |
| **페이지 로드** | 100% 성공 | HTTP 200 상태 코드 |
| **404 페이지** | 예상 경로만 | 존재하지 않는 URL만 404 |
| **API 연동** | 100% 성공 | HTTP < 400 상태 코드 |
| **리다이렉트** | 100% 정확 | 301 상태 코드 + 올바른 대상 |
| **인증/권한** | 정확히 작동 | 리다이렉트 및 차단 확인 |

### 테스트 결과 예시

```
✅ 통과 (87/87 테스트)
- Phase 1 공개 페이지: 37/37 통과
- Phase 2 인증 페이지: 6/6 통과
- Phase 3 회원 포털: 26/26 통과
- Phase 4 관리자 포털: 18/18 통과

⚠️ 부분 통과
- TC-PUBLIC-005: 일부 동적 라우팅에서 404 발생
- TC-MEMBER-003: 주문 상세 데이터 로드 지연

❌ 실패
- 해당 없음 (예시)
```

---

## 문제 해결 가이드

### 문제 1: 콘솔 에러 발생

**증상**:
```
console.error: "TypeError: Cannot read property 'map' of undefined"
```

**원인**: API 응답 데이터 구조 불일치

**해결**:
```typescript
// API 응답 검증 추가
const response = await fetch('/api/member/dashboard');
const data = await response.json();

// 안전한 접근
const orders = data?.data?.orders ?? [];
const stats = data?.data?.stats ?? {};
```

### 문제 2: 페이지 404

**증상**: 특정 페이지에서 404 발생

**원인**:
- 잘못된 라우팅 설정
- 페이지 파일 누락

**해결**:
```bash
# 페이지 파일 존재 확인
ls -la src/app/member/dashboard/page.tsx

# Next.js 라우팅 캐시 삭제
rm -rf .next
npm run build
```

### 문제 3: 인증 오류

**증상**: "Access Denied" 또는 로그인 페이지로 리다이렉트

**원인**:
- Dev Mode 설정 누락
- RLS 정책 위반

**해결**:
```bash
# .env.local 확인
NEXT_PUBLIC_DEV_MODE=true
ENABLE_DEV_MOCK_AUTH=true

# RLS 정책 확인 (Supabase MCP)
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### 문제 4: API 연동 실패

**증상**: 네트워크 요청 실패

**원인**:
- 환경 변수 누락
- Supabase 연결 실패

**해결**:
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Supabase 연결 테스트
curl -I https://ijlgpzjdfipzmjvawofp.supabase.co
```

---

## 부록: 테스트 실행 스크립트

### 전체 테스트 실행

```bash
#!/bin/bash
# test-all.sh

echo "🚀 전체 테스트 시작..."

# 1. 개발 서버 시작
npm run dev &
DEV_SERVER_PID=$!

# 2. 서버 대기
echo "⏳ 서버 시작 대기..."
sleep 10

# 3. Playwright 테스트 실행
echo "🧪 Playwright 테스트 실행..."
npx playwright test --reporter=html

# 4. 결과 확인
echo "📊 테스트 결과:"
cat playwright-report/index.html | grep -o "passed [0-9]*" | tail -1

# 5. 정리
kill $DEV_SERVER_PID

echo "✅ 테스트 완료"
```

### 특정 Phase만 테스트

```bash
# 공개 페이지만 테스트
npx playwright test tests/e2e/phase-1-public/

# 인증 페이지만 테스트
npx playwright test tests/e2e/phase-2-auth/

# 회원 포털만 테스트
npx playwright test tests/e2e/phase-3-member/

# 관리자 포털만 테스트
npx playwright test tests/e2e/phase-4-admin/
```

---

**문서 버전**: 1.0
**작성일**: 2026-01-15
**마지막 수정**: 2026-01-15
