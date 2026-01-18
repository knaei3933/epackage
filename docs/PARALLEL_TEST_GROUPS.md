# 병렬 테스트 실행 그룹 가이드

**Version**: 2.0
**Updated**: 2026-01-12
**Based on**: Comprehensive test directory analysis

---

## 개요

이 문서는 모든 테스트 파일을 **의존성 그룹**으로 분류하여 최적의 병렬 실행 전략을 제공합니다.

### 핵심 원칙

1. **상태 공유 없는 테스트** = 병렬 실행 가능 ✅
2. **순차 실행 필요** = 같은 그룹으로 분리 ⚠️
3. **인증 필요** = 인증 후 병렬 실행 가능 🔐

---

## 그룹 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL EXECUTION GROUPS                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  GROUP A: PUBLIC │  │  GROUP B: AUTH   │  │  GROUP C: MEMBER │     │
│  │  12 files         │  │  5 files          │  │  8 files          │     │
│  │  ALL PARALLEL     │  │  SEQUENTIAL       │  │  PARALLEL*        │     │
│  │  workers: 12      │  │  workers: 1       │  │  workers: 4       │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  GROUP D: ADMIN  │  │  GROUP E: FLOW   │  │  GROUP F: VALIDATE│     │
│  │  10 files         │  │  6 files          │  │  9 files          │     │
│  │  PARALLEL*        │  │  SEQUENTIAL       │  │  PARALLEL**       │     │
│  │  workers: 5       │  │  workers: 1       │  │  workers: 6       │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

* = 같은 인증 자격 공유 (로그인 후 병렬)
** = 독립 검증 테스트 (서로 다른 대상)
```

---

## GROUP A: 공개 페이지 (Public Pages)

**의존성**: 없음
**병렬 실행**: 완전 병렬 가능
**최대 Workers**: 12

### 구성

| 파일 | 경로 | 테스트 수 | 실행 시간 |
|------|------|-----------|-----------|
| 홈페이지 네비게이션 | `phase-1-public/01-home-navigation.spec.ts` | 8 | ~30s |
| 카탈로그 | `phase-1-public/02-catalog.spec.ts` | 12 | ~45s |
| 제품 상세 | `phase-1-public/03-product-detail.spec.ts` | 7 | ~30s |
| 견적 시뮬레이터 | `phase-1-public/04-quote-simulator.spec.ts` | 12 | ~60s |
| 스마트 견적 | `phase-1-public/05-smart-quote.spec.ts` | 8 | ~60s |
| ROI 계산기 | `phase-1-public/06-roi-calculator.spec.ts` | 4 | ~30s |
| 샘플 요청 | `phase-1-public/07-samples.spec.ts` | 9 | ~60s |
| 문의하기 | `phase-1-public/08-contact.spec.ts` | 6 | ~45s |
| 산업별 솔루션 | `phase-1-public/09-industry-solutions.spec.ts` | 5 | ~40s |
| 가이드 페이지 | `phase-1-public/10-guide-pages.spec.ts` | 6 | ~35s |
| 정보 페이지 | `phase-1-public/11-info-pages.spec.ts` | 9 | ~40s |
| 제품 비교 | `phase-1-public/12-compare.spec.ts` | 10 | ~40s |
| 다중 수량 비교 | `multi-quantity-comparison.spec.ts` | 8 | ~50s |

### 실행 명령

```bash
# 전체 병렬 실행
npx playwright test tests/e2e/phase-1-public/ multi-quantity-comparison.spec.ts --workers=12

# 또는 개별 파일 지정
npx playwright test tests/e2e/phase-1-public/01-home-navigation.spec.ts \
                 tests/e2e/phase-1-public/02-catalog.spec.ts \
                 tests/e2e/phase-1-public/03-product-detail.spec.ts \
                 tests/e2e/phase-1-public/04-quote-simulator.spec.ts \
                 tests/e2e/phase-1-public/05-smart-quote.spec.ts \
                 tests/e2e/phase-1-public/06-roi-calculator.spec.ts \
                 tests/e2e/phase-1-public/07-samples.spec.ts \
                 tests/e2e/phase-1-public/08-contact.spec.ts \
                 tests/e2e/phase-1-public/09-industry-solutions.spec.ts \
                 tests/e2e/phase-1-public/10-guide-pages.spec.ts \
                 tests/e2e/phase-1-public/11-info-pages.spec.ts \
                 tests/e2e/phase-1-public/12-compare.spec.ts \
                 multi-quantity-comparison.spec.ts \
                 --workers=12
```

### 병렬 실행 가능 이유

- ✅ 인증 불필요
- ✅ 데이터베이스 읽기 전용 (products, categories 등)
- ✅ 서로 다른 페이지 테스트
- ✅ 상태 공유 없음

---

## GROUP B: 인증 플로우 (Authentication)

**의존성**: 순차 실행 필수
**병렬 실행**: 순차적 실행만 가능
**최대 Workers**: 1

### 구성

| 파일 | 경로 | 테스트 수 | 실행 시간 | 의존성 |
|------|------|-----------|-----------|--------|
| 회원가입 플로우 | `phase-2-auth/01-registration-flow.spec.ts` | 7 | ~90s | - |
| 로그인 플로우 | `phase-2-auth/02-login-flow.spec.ts` | 6 | ~60s | 회원가입 의존 |
| 로그아웃 플로우 | `phase-2-auth/03-logout-flow.spec.ts` | 5 | ~30s | 로그인 의존 |
| 비밀번호 찾기 | `phase-2-auth/04-forgot-password.spec.ts` | 4 | ~45s | 독립 |
| 대기/정지 상태 | `phase-2-auth/05-status-pages.spec.ts` | 2 | ~30s | 독립 |

### 실행 명령

```bash
# 전체 순차 실행 (권장)
npx playwright test tests/e2e/phase-2-auth/ --workers=1

# 독립 테스트만 병렬 실행
npx playwright test tests/e2e/phase-2-auth/04-forgot-password.spec.ts \
                 tests/e2e/phase-2-auth/05-status-pages.spec.ts \
                 --workers=2
```

### 순차 실행 필요 이유

- ⚠️ 회원가입 → 로그인 의존성
- ⚠️ 로그인 → 로그아웃 의존성
- ⚠️ 사용자 생성 순서 중요
- ⚠️ 인증 상태 공유

---

## GROUP C: 회원 포털 (Member Portal)

**의존성**: MEMBER 로그인 필요
**병렬 실행**: 로그인 후 병렬 가능
**최대 Workers**: 4

### 구성

| 파일 | 경로 | 테스트 수 | 실행 시간 | 공유 상태 |
|------|------|-----------|-----------|-----------|
| 회원 대시보드 | `phase-3-member/01-dashboard.spec.ts` | 5 | ~40s | MEMBER 세션 |
| 주문 내역 | `phase-3-member/02-orders.spec.ts` | 5 | ~50s | MEMBER 세션 |
| 주문 상세 | `phase-3-member/03-order-detail.spec.ts` | 7 | ~60s | MEMBER 세션 |
| 견적서 관리 | `phase-3-member/04-quotations.spec.ts` | 7 | ~50s | MEMBER 세션 |
| 견적 요청 | `phase-3-member/05-quotation-request.spec.ts` | 6 | ~60s | MEMBER 세션 |
| 프로필 관리 | `phase-3-member/06-profile.spec.ts` | 5 | ~45s | MEMBER 세션 |
| 계약서 관리 | `phase-3-member/07-contracts.spec.ts` | 4 | ~40s | MEMBER 세션 |
| 문서 관리 | `phase-3-member/08-documents.spec.ts` | 4 | ~35s | MEMBER 세션 |
| 포털 홈 | `phase-5-portal/01-portal-home.spec.ts` | 3 | ~30s | 로그인 세션 |
| 포털 프로필 | `phase-5-portal/02-portal-profile.spec.ts` | 3 | ~35s | 로그인 세션 |
| 고객 포털 | `customer-portal.spec.ts` | 6 | ~50s | 로그인 세션 |

### 실행 명령

```bash
# 회원 인증 후 병렬 실행
npx playwright test tests/e2e/phase-3-member/ \
                 tests/e2e/phase-5-portal/ \
                 customer-portal.spec.ts \
                 --workers=4
```

### 병렬 실행 가능 이유

- ✅ 같은 MEMBER 자격 사용
- ✅ 서로 다른 페이지/기능 테스트
- ✅ 읽기 전용 작업 (dashboard, orders list)
- ⚠️ 같은 세션 공유하지만 격리된 페이지

---

## GROUP D: 관리자 포털 (Admin Portal)

**의존성**: ADMIN 로그인 필요
**병렬 실행**: 로그인 후 병렬 가능
**최대 Workers**: 5

### 구성

| 파일 | 경로 | 테스트 수 | 실행 시간 | 공유 상태 |
|------|------|-----------|-----------|-----------|
| 관리자 대시보드 | `phase-4-admin/01-dashboard.spec.ts` | 5 | ~40s | ADMIN 세션 |
| 회원 승인 | `phase-4-admin/02-member-approval.spec.ts` | 5 | ~50s | ADMIN 세션 |
| 주문 관리 | `phase-4-admin/03-orders.spec.ts` | 5 | ~60s | ADMIN 세션 |
| 견적 관리 | `phase-4-admin/04-quotations.spec.ts` | 5 | ~50s | ADMIN 세션 |
| 계약 관리 | `phase-4-admin/05-contracts.spec.ts` | 4 | ~45s | ADMIN 세션 |
| 생산 관리 | `phase-4-admin/06-production.spec.ts` | 4 | ~50s | ADMIN 세션 |
| 재고 관리 | `phase-4-admin/07-inventory.spec.ts` | 4 | ~40s | ADMIN 세션 |
| 배송 관리 | `phase-4-admin/08-shipping.spec.ts` | 4 | ~45s | ADMIN 세션 |
| 리드 관리 | `phase-4-admin/09-leads.spec.ts` | 3 | ~35s | ADMIN 세션 |
| 관리자 승인 플로우 | `admin-approval-flow.spec.ts` | 8 | ~70s | ADMIN 세션 |

### 실행 명령

```bash
# 관리자 인증 후 병렬 실행
npx playwright test tests/e2e/phase-4-admin/ \
                 admin-approval-flow.spec.ts \
                 --workers=5
```

### 병렬 실행 가능 이유

- ✅ 같은 ADMIN 자격 사용
- ✅ 서로 다른 관리 기능 테스트
- ✅ 격리된 페이지/기능
- ⚠️ 같은 세션 공유하지만 독립적 동작

---

## GROUP E: 통합 플로우 (Integration Flows)

**의존성**: 데이터베이스 상태 공유
**병렬 실행**: 순차 실행 필수
**최대 Workers**: 1

### 구성

| 파일 | 경로 | 테스트 수 | 실행 시간 | 의존성 |
|------|------|-----------|-----------|--------|
| 문의 플로우 | `contact-flow.spec.ts` | 5 | ~60s | inquiries 테이블 정리 |
| 샘플 요청 플로우 | `sample-request-flow.spec.ts` | 6 | ~70s | sample_requests 정리 |
| 회원 플로우 | `member-flow.spec.ts` | 8 | ~90s | 사용자 생성/정리 |
| 견적→주문 | `quote-to-order.spec.ts` | 7 | ~80s | quotations → orders |
| 생산 추적 | `production-tracking.spec.ts` | 6 | ~60s | production_jobs |
| 배송 워크플로우 | `shipment-workflow.spec.ts` | 7 | ~70s | shipments |

### 실행 명령

```bash
# 순차 실행 (필수)
npx playwright test contact-flow.spec.ts \
                 sample-request-flow.spec.ts \
                 member-flow.spec.ts \
                 quote-to-order.spec.ts \
                 production-tracking.spec.ts \
                 shipment-workflow.spec.ts \
                 --workers=1
```

### 순차 실행 필요 이유

- ⚠️ **데이터베이스 정리 충돌**: 같은 테이블 삭제
- ⚠️ **생성 데이터 의존**: quote → order 순서
- ⚠️ **beforeAll/afterAll 훅**: 설정/정리 공유
- ⚠️ **멀티 페이지 컨텍스트**: admin + member 페이지 사용

---

## GROUP F: 검증 및 보안 (Validation & Security)

**의존성**: 없음 (독립 검증)
**병렬 실행**: 완전 병렬 가능
**최대 Workers**: 6

### 구성

| 파일 | 경로 | 테스트 수 | 실행 시간 | 독립성 |
|------|------|-----------|-----------|--------|
| 전체 페이지 검증 | `all-pages-validation.spec.ts` | 74 | ~120s | ✅ 독립 |
| 포괄 페이지 검증 | `comprehensive-page-validation.spec.ts` | 40 | ~80s | ✅ 독립 |
| 관리자 대시보드 포괄 | `admin-dashboard-comprehensive.spec.ts` | 12 | ~60s | ✅ 독립 |
| 콘솔 에러 체크 | `comprehensive-console-check.spec.ts` | 20 | ~50s | ✅ 독립 |
| 보안 픽스 | `security-fixes.spec.ts` | 8 | ~40s | ✅ 독립 |
| 고객 승인 | `customer-approvals.spec.ts` | 7 | ~50s | ✅ 독립 |
| 주문 코멘트 | `order-comments.spec.ts` | 6 | ~45s | ✅ 독립 |
| 작업 검증 | `task-verification.spec.ts` | 5 | ~30s | ✅ 독립 |
| 콘솔 에러 체크 | `console-error-check.spec.ts` | 10 | ~30s | ✅ 독립 |
| 파일 검증 | `file-validation.spec.ts` | 6 | ~40s | ✅ 독립 |

### 실행 명령

```bash
# 전체 병렬 실행
npx playwright test all-pages-validation.spec.ts \
                 comprehensive-page-validation.spec.ts \
                 admin-dashboard-comprehensive.spec.ts \
                 comprehensive-console-check.spec.ts \
                 security-fixes.spec.ts \
                 customer-approvals.spec.ts \
                 order-comments.spec.ts \
                 task-verification.spec.ts \
                 console-error-check.spec.ts \
                 file-validation.spec.ts \
                 --workers=6
```

### 병렬 실행 가능 이유

- ✅ 읽기 전용 검증
- ✅ 상태 변경 없음
- ✅ 독립 테스트 대상
- ✅ 서로 다른 검증 목표

---

## 빠른 참조 매트릭스

| 그룹 | 파일 수 | 병렬 가능 | Workers | 예상 시간 |
|------|---------|-----------|---------|-----------|
| **A: Public** | 13 | ✅ 전체 | 12 | ~5분 |
| **B: Auth** | 5 | ⚠️ 순차 | 1 | ~5분 |
| **C: Member** | 11 | ✅ 인증 후 | 4 | ~6분 |
| **D: Admin** | 10 | ✅ 인증 후 | 5 | ~6분 |
| **E: Flow** | 6 | ⚠️ 순차 | 1 | ~7분 |
| **F: Validate** | 10 | ✅ 전체 | 6 | ~6분 |

---

## 권장 실행 순서

### 1. 빠른 스모크 테스트 (Smoke Test)

가장 빠른 핵심 기능 검증:

```bash
# 각 그룹에서 1개씩만 실행
npx playwright test phase-1-public/01-home-navigation.spec.ts \
                 phase-2-auth/02-login-flow.spec.ts \
                 phase-3-member/01-dashboard.spec.ts \
                 phase-4-admin/01-dashboard.spec.ts \
                 console-error-check.spec.ts \
                 --workers=5
```

### 2. 전체 순차 실행 (가장 안전)

```bash
# 그룹별 순차 실행
npx playwright test phase-1-public/ multi-quantity-comparison.spec.ts --workers=12
npx playwright test phase-2-auth/ --workers=1
npx playwright test phase-3-member/ phase-5-portal/ customer-portal.spec.ts --workers=4
npx playwright test phase-4-admin/ admin-approval-flow.spec.ts --workers=5
npx playwright test contact-flow.spec.ts sample-request-flow.spec.ts member-flow.spec.ts quote-to-order.spec.ts production-tracking.spec.ts shipment-workflow.spec.ts --workers=1
npx playwright test all-pages-validation.spec.ts comprehensive-page-validation.spec.ts admin-dashboard-comprehensive.spec.ts comprehensive-console-check.spec.ts security-fixes.spec.ts customer-approvals.spec.ts order-comments.spec.ts task-verification.spec.ts console-error-check.spec.ts file-validation.spec.ts --workers=6
```

### 3. 최적 병렬 실행 (권장)

```bash
# Phase별 병렬 실행 (총 ~29분)
npx playwright test tests/e2e/phase-1-public/ multi-quantity-comparison.spec.ts --workers=12 &
npx playwright test tests/e2e/phase-2-auth/ --workers=1 &
npx playwright test tests/e2e/phase-3-member/ tests/e2e/phase-5-portal/ customer-portal.spec.ts --workers=4 &
npx playwright test tests/e2e/phase-4-admin/ admin-approval-flow.spec.ts --workers=5 &
npx playwright test contact-flow.spec.ts sample-request-flow.spec.ts member-flow.spec.ts quote-to-order.spec.ts production-tracking.spec.ts shipment-workflow.spec.ts --workers=1 &
npx playwright test all-pages-validation.spec.ts comprehensive-page-validation.spec.ts admin-dashboard-comprehensive.spec.ts comprehensive-console-check.spec.ts security-fixes.spec.ts customer-approvals.spec.ts order-comments.spec.ts task-verification.spec.ts console-error-check.spec.ts file-validation.spec.ts --workers=6 &
wait
```

---

## CI/CD 통합 예시

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        group: [public, auth, member, admin, validate]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        run: |
          case "${{ matrix.group }}" in
            public)
              npx playwright test tests/e2e/phase-1-public/ multi-quantity-comparison.spec.ts --workers=12
              ;;
            auth)
              npx playwright test tests/e2e/phase-2-auth/ --workers=1
              ;;
            member)
              npx playwright test tests/e2e/phase-3-member/ tests/e2e/phase-5-portal/ customer-portal.spec.ts --workers=4
              ;;
            admin)
              npx playwright test tests/e2e/phase-4-admin/ admin-approval-flow.spec.ts --workers=5
              ;;
            validate)
              npx playwright test all-pages-validation.spec.ts comprehensive-page-validation.spec.ts admin-dashboard-comprehensive.spec.ts comprehensive-console-check.spec.ts security-fixes.spec.ts customer-approvals.spec.ts order-comments.spec.ts task-verification.spec.ts console-error-check.spec.ts file-validation.spec.ts --workers=6
              ;;
          esac

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 테스트 격리 전략

### 데이터베이스 충돌 방지

| 문제 | 해결 방법 |
|------|-----------|
| 같은 이메일 사용 | 타임스탬프 기반 고유 이메일 |
| 주문 번호 중복 | UUID/타임스탬프 조합 |
| 견적 번호 중복 | UUID/타임스탬프 조합 |
| 테이블 정리 충돌 | `afterEach`에서 개별 정리 |

### 인증 상태 격리

```typescript
// 각 테스트 파일마다 독립적인 인증 설정
test.beforeEach(async ({ page }) => {
  // MEMBER 테스트
  const email = `test-member-${Date.now()}@example.com`;
  await page.goto('/auth/register');
  await registerUser(page, { email });

  // 또는 고정 테스트 계정 사용
  await page.goto('/auth/signin');
  await signIn(page, {
    email: process.env.TEST_MEMBER_EMAIL,
    password: process.env.TEST_MEMBER_PASSWORD
  });
});

test.afterEach(async ({ page }) => {
  // 정리 작업
  await signOut(page);
});
```

---

## 실행 시간 추정

| 그룹 | 순차 시간 | 병렬 시간 | 절감율 |
|------|-----------|-----------|--------|
| A: Public | ~55분 | ~5분 | 91% |
| B: Auth | ~5분 | ~5분 | 0% |
| C: Member | ~45분 | ~6분 | 87% |
| D: Admin | ~50분 | ~6분 | 88% |
| E: Flow | ~7분 | ~7분 | 0% |
| F: Validate | ~35분 | ~6분 | 83% |
| **전체** | **~197분** | **~35분** | **82%** |

---

## 환경 변수 설정

```bash
# .env.test
# 인증
TEST_MEMBER_EMAIL=test-member@example.com
TEST_MEMBER_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=AdminPassword123!

# 데이터베이스
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# 개발 모드
NODE_ENV=test
ENABLE_DEV_MOCK_AUTH=false
```

---

## 빠른 실행 (스크립트 사용)

### Windows (권장)

```batch
# 모든 그룹 실행
scripts\run-tests-all-groups.bat

# 개별 그룹 실행
scripts\run-tests-group-a-public.bat      # 공개 페이지
scripts\run-tests-group-b-auth.bat        # 인증
scripts\run-tests-group-c-member.bat      # 회원 포털
scripts\run-tests-group-d-admin.bat       # 관리자 포털
scripts\run-tests-group-e-flows.bat       # 통합 플로우
scripts\run-tests-group-f-validation.bat  # 검증 및 보안
```

### Linux/Mac

```bash
# 모든 그룹 실행
bash scripts/run-tests-all-groups.sh

# 개별 그룹 실행
bash scripts/run-tests-group-a-public.sh      # 공개 페이지
bash scripts/run-tests-group-b-auth.sh        # 인증
bash scripts/run-tests-group-c-member.sh      # 회원 포털
bash scripts/run-tests-group-d-admin.sh       # 관리자 포털
bash scripts/run-tests-group-e-flows.sh       # 통합 플로우
bash scripts/run-tests-group-f-validation.sh  # 검증 및 보안
```

---

## 다음 단계

1. ✅ 테스트 파일 분석 완료
2. ✅ 병렬 실행 그룹 구성 완료
3. ✅ 각 그룹별 실행 스크립트 작성 완료
4. ⏳ CI/CD 파이프라인 통합
5. ⏳ 테스트 리포트 통합

---

## 참고 문서

- `docs/COMPREHENSIVE_TEST_PLAN.md` - 308 테스트 시나리오
- `docs/TEST_SCENARIOS_QUICK_REFERENCE.md` - 빠른 참조 가이드
- `playwright.config.ts` - Playwright 설정
