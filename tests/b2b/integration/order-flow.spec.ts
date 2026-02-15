/**
 * B2B 주문 플로우 E2E 테스트 (B2B Order Flow E2E Tests)
 * 10단계 주문 프로세스 통합 테스트
 */

import { test, expect } from '@playwright/test';

// 테스트 데이터
const TEST_DATA = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Test1234!'
  },
  customer: {
    email: process.env.TEST_CUSTOMER_EMAIL || 'customer@test.com',
    password: process.env.TEST_CUSTOMER_PASSWORD || 'Test1234!',
    companyName: '테스트 주식회사'
  }
};

test.describe('B2B 주문 플로우 통합 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.customer.email);
    await page.fill('input[name="password"]', TEST_DATA.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/member/dashboard');
  });

  test('1. 견적 요청부터 주문 생성까지', async ({ page }) => {
    // 1. 견적 요청 페이지로 이동
    await page.goto('/member/quotations/new');
    await expect(page.locator('h1')).toContainText('견적 요청');

    // 2. 제품 추가 (최소 1개)
    await page.click('text=제품 추가');
    await page.fill('input[name="items.0.product_name"]', '테스트 패키지');
    await page.fill('input[name="items.0.quantity"]', '1000');
    await page.selectOption('select[name="items.0.category"]', 'box');

    // 3. 견적 저장 및 전송
    await page.click('button:has-text("견적 요청")');
    await expect(page.locator('.bg-green-50')).toBeVisible();
    await expect(page.locator('.bg-green-50')).toContainText('견적 요청이 접수되었습니다');

    // 4. 견적 번호 확인
    const quotationNumber = await page.locator('text=QT-').textContent();
    expect(quotationNumber).toMatch(/QT-\d{4}-\d{4}/);
  });

  test('2. 관리자: 견적 승인 및 작업표준서 생성', async ({ page, context }) => {
    // 고객 로그아웃
    await page.click('button:has-text("로그아웃")');

    // 관리자 로그인
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.admin.email);
    await page.fill('input[name="password"]', TEST_DATA.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');

    // 관리자 대시보드에서 견적 목록 확인
    await page.goto('/admin/quotations');
    await expect(page.locator('text=견적 관리')).toBeVisible();

    // 첫 번째 견적 선택
    await page.click('.quotations-list a:first-child');

    // 견적 승인
    await page.click('button:has-text("견적 승인")');
    await expect(page.locator('.bg-green-50')).toBeVisible();

    // 작업표준서 생성
    await page.click('button:has-text("작업표준서 생성")');
    await page.fill('input[name="specifications.print_method"]', '오프셋 인쇄');
    await page.fill('input[name="specifications.paper_type"]', '아트지 200g');
    await page.fill('input[name="specifications.dimensions"]', '100x100x50mm');
    await page.click('button:has-text("저장")');

    await expect(page.locator('.bg-green-50')).toContainText('작업표준서가 생성되었습니다');
  });

  test('3. 관리자: 계약서 생성 및 송부', async ({ page }) => {
    await page.goto('/admin/contracts');

    // 계약서 생성 버튼
    await page.click('button:has-text("계약서 생성")');

    // 주문 선택
    await page.selectOption('select[name="order_id"]', { label: /ORD-/ });

    // 계약 조건 입력
    await page.fill('input[name="payment_terms"]', '검수 후 30일 지급');
    await page.fill('input[name="delivery_terms"]', '공장 인도');
    await page.fill('input[name="valid_until"]', getFutureDate(30));

    await page.click('button:has-text("계약서 생성")');
    await expect(page.locator('.bg-green-50')).toContainText('계약서가 생성되었습니다');
  });

  test('4. 고객: 전자서명', async ({ page, context }) => {
    // 관리자 로그아웃 후 고객 로그인
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.customer.email);
    await page.fill('input[name="password"]', TEST_DATA.customer.password);
    await page.click('button[type="submit"]');

    // 대시보드에서 서명 대기 중인 계약서 확인
    await page.goto('/member/dashboard');
    await page.click('text=계약서 서명 대기');

    // 계약서 미리보기 확인
    await expect(page.locator('iframe[src*="contract"]')).toBeVisible();

    // 이용약관 동의
    await page.check('input[type="checkbox"]');

    // 서명 (캔버스에 서명)
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 50, y: 50 } });
    await canvas.dragTo(canvas, { sourcePosition: { x: 50, y: 50 }, targetPosition: { x: 150, y: 50 } });

    // 서명 완료
    await page.click('button:has-text("서명 완료")');
    await expect(page.locator('.bg-green-50')).toContainText('전자서명이 완료되었습니다');
  });

  test('5. 관리자: 계약서 서명 (양측 완료)', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.admin.email);
    await page.fill('input[name="password"]', TEST_DATA.admin.password);
    await page.click('button[type="submit"]');

    await page.goto('/admin/contracts');
    await page.click('text=서명 대기');

    // 관리자 서명
    await page.check('input[type="checkbox"]');
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 50, y: 50 } });
    await canvas.dragTo(canvas, { sourcePosition: { x: 50, y: 50 }, targetPosition: { x: 150, y: 50 } });
    await page.click('button:has-text("서명 완료")');

    // 주문 상태가 CONTRACT_SIGNED로 변경 확인
    await expect(page.locator('text=CONTRACT_SIGNED')).toBeVisible();
  });

  test('6. 관리자: 생산 시작 및 진척률 업데이트', async ({ page }) => {
    await page.goto('/admin/production');

    // 생산 시작
    await page.click('text=생산 시작');
    await page.selectOption('select[name="assigned_to"]', { label: /운영자/ });
    await page.click('button:has-text("생산 시작")');

    // 생산 공정 업데이트 (9단계)
    const productionSteps = [
      'prepress',
      'printing',
      'die_cutting',
      'folding',
      'gluing',
      'inspection',
      'packaging',
      'qc',
      'completed'
    ];

    for (const step of productionSteps) {
      await page.selectOption(`select[name="sub_status"]`, step);
      await page.fill('input[name="progress_percentage"]', String(((productionSteps.indexOf(step) + 1) / productionSteps.length) * 100));
      await page.click('button:has-text("업데이트")');
      await page.waitForTimeout(500); // 각 단계별 대기
    }

    // 최종 상태 확인
    await expect(page.locator('text=100%')).toBeVisible();
  });

  test('7. 관리자: 입고 처리', async ({ page }) => {
    await page.goto('/admin/stock-in');

    // 주문 선택
    await page.selectOption('select[name="order_id"]', { label: /ORD-/ });

    // 입고 정보 입력
    await page.fill('input[name="quantity"]', '1000');
    await page.fill('input[name="warehouse_location"]', 'A-01-03');

    // 품질 검사 결과
    await page.check('input[value="PASSED"]');

    await page.click('button:has-text("입고 완료")');
    await expect(page.locator('.bg-green-50')).toContainText('입고 처리가 완료되었습니다');
  });

  test('8. 관리자: 출하 처리', async ({ page }) => {
    await page.goto('/admin/shipments');

    // 송장 번호 입력
    await page.fill('input[name="invoice_number"]', `INV-${new Date().getFullYear()}-TEST001`);
    await page.selectOption('select[name="carrier"]', 'yamato');
    await page.fill('input[name="tracking_number"]', '1234-5678-9012');
    await page.fill('input[name="shipping_date"]', new Date().toISOString().split('T')[0]);

    await page.click('button:has-text("출하 완료")');
    await expect(page.locator('.bg-green-50')).toContainText('출하 처리가 완료되었습니다');
  });

  test('9. 고객: 주문 추적 확인', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.customer.email);
    await page.fill('input[name="password"]', TEST_DATA.customer.password);
    await page.click('button[type="submit"]');

    await page.goto('/member/orders');

    // 주문 상세 페이지로 이동
    await page.click('a:first-child');

    // 타임라인 확인
    await expect(page.locator('text=진행 상황')).toBeVisible();

    // 모든 단계가 완료되었는지 확인
    const completedStages = await page.locator('.bg-green-500').count();
    expect(completedStages).toBeGreaterThan(0);

    // 배송 정보 확인
    await expect(page.locator('text=배송 추적')).toBeVisible();
  });

  test('10. 고객: 문서 다운로드', async ({ page }) => {
    await page.goto('/member/orders');
    await page.click('a:first-child');

    // 문서 다운로드 테스트
    const downloadPromise = page.waitForEvent('download');

    // 견적서 다운로드
    await page.click('text=견적서 다운로드');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('견적서');

    // 작업표준서 다운로드
    await page.click('text=작업표준서 다운로드');
    const workOrderDownload = await page.waitForEvent('download');
    expect(workOrderDownload.suggestedFilename()).toContain('작업표준서');

    // 계약서 다운로드
    await page.click('text=계약서 다운로드');
    const contractDownload = await page.waitForEvent('download');
    expect(contractDownload.suggestedFilename()).toContain('계약서');
  });
});

test.describe('B2B 대시보드 테스트', () => {
  test('고객 대시보드 통계 확인', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.customer.email);
    await page.fill('input[name="password"]', TEST_DATA.customer.password);
    await page.click('button[type="submit"]');

    await page.goto('/member/dashboard');

    // 통계 카드 확인
    await expect(page.locator('text=전체 주문')).toBeVisible();
    await expect(page.locator('text=완료 주문')).toBeVisible();
    await expect(page.locator('text=견적 요청')).toBeVisible();
    await expect(page.locator('text=샘플 요청')).toBeVisible();

    // 최근 주문 목록 확인
    await expect(page.locator('text=최근 주문')).toBeVisible();
  });

  test('관리자 대시보드 통계 확인', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_DATA.admin.email);
    await page.fill('input[name="password"]', TEST_DATA.admin.password);
    await page.click('button[type="submit"]');

    await page.goto('/admin/dashboard');

    // 관리자 통계 확인
    await expect(page.locator('text=대시보드')).toBeVisible();
    await expect(page.locator('text=미처리 견적')).toBeVisible();
    await expect(page.locator('text=생산 중 주문')).toBeVisible();
  });
});

// 헬퍼 함수
function getFutureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
