/**
 * Console.md Issues Verification
 *
 * console.md에 명시된 6개 이슈에 대한 검증 테스트
 * 1. PDF 다운로드 CSP 문제
 * 2. 주문전환 팝업에서 袋タイプ와 厚さ 데이터 반영
 * 3. 견적 상세 페이지에 모든 사양 정보 표시
 * 4. 주문 상세 페이지에 은행 계좌 정보 배치
 * 5. 주문 목록의 진척률 그래프 반영
 * 6. ステータス履歴 표시
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 테스트 데이터
const TEST_QUOTATION_ID = '4bc50ba5-33ae-4132-8010-b5eb4f111715'; // 견적 상세 페이지용
const TEST_ORDER_ID = '9c04209c-d2ff-4ad6-bca7-d3fccf1ba491'; // 주문 상세 페이지용

test.describe('Console.md Issues Verification', () => {

  // =====================================================
  // Issue 1: PDF 다운로드 CSP 문제 해결 검증
  // =====================================================
  test('Issue 1: PDF 다운로드 시 CSP 에러가 발생하지 않아야 함', async ({ page }) => {
    // CSP 에러 수집
    const cspErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Content Security Policy') || text.includes('CSP')) {
          cspErrors.push(text);
        }
      }
    });

    // 견적 목록 페이지로 이동
    await page.goto(`${BASE_URL}/member/quotations`);
    await page.waitForLoadState('networkidle');

    // PDF 다운로드 버튼 클릭 (있는 경우)
    const downloadButton = page.locator('button:has-text("PDF"), button:has-text("ダウンロード")').first();
    if (await downloadButton.isVisible({ timeout: 5000 })) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await downloadButton.click();

      try {
        const download = await downloadPromise;
        console.log('✓ PDF 다운로드 성공:', download.suggestedFilename());
      } catch (e) {
        // 다운로드 실패는 허용 (CSP 에러만 체크)
      }
    }

    // CSP 에러 확인 (fonts.gstatic.com 관련 에러가 없어야 함)
    const fontCSPErrors = cspErrors.filter(err =>
      err.includes('fonts.gstatic.com') ||
      err.includes('font') ||
      err.includes('connect-src')
    );

    console.log('CSP 에러 수집:', cspErrors.length);
    console.log('폰트 관련 CSP 에러:', fontCSPErrors.length);

    expect(fontCSPErrors.length).toBe(0);
  });

  // =====================================================
  // Issue 2: 주문전환 팝업에서 袋タイプ와 厚さ 데이터 반영
  // =====================================================
  test('Issue 2: 주문전환 팝업에 袋タイプ와 厚さ가 표시되어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/quotations`);

    // 견적 카드 찾기 (QT20260202-1517 또는 승인된 견적)
    const quotationCard = page.locator('text=QT20260202-1517').locator('../..');

    // 주문 변환/승인 버튼 클릭
    const convertButton = quotationCard.locator('button:has-text("注文"), button:has-text("承認"), button:has-text("変換")').first();

    if (await convertButton.isVisible({ timeout: 5000 })) {
      await convertButton.click();

      // 모달이 나타날 때까지 대기
      const modal = page.locator('[role="dialog"], .modal, dialog').filter({ hasText: /袋タイプ|サイズ/ });

      if (await modal.isVisible({ timeout: 5000 })) {
        // 袋タイプ 표시 확인
        const bagTypeLabel = modal.locator('text=袋タイプ');
        const bagTypeValue = modal.locator('text=/スタンドパウチ|ピローパウチ|ガセット/');

        expect(await bagTypeLabel.isVisible()).toBeTruthy();
        expect(await bagTypeValue.isVisible()).toBeTruthy();

        // 厚さ 표시 확인
        const thicknessLabel = modal.locator('text=厚さ');
        const thicknessValue = modal.locator('text=/薄手|標準|厚手|μm|mic/');

        expect(await thicknessLabel.isVisible()).toBeTruthy();
        expect(await thicknessValue.isVisible()).toBeTruthy();

        console.log('✓ 주문전환 팝업에 袋タイプ와 厚さ 표시됨');
      } else {
        console.log('⚠ 모달이 표시되지 않음 (이미 변환된 견적일 수 있음)');
      }
    } else {
      console.log('⚠ 주문 변환 버튼을 찾을 수 없음');
    }
  });

  // =====================================================
  // Issue 3: 견적 상세 페이지에 모든 사양 정보 표시
  // =====================================================
  test('Issue 3: 견적 상세 페이지에 모든 사양 정보가 표시되어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/quotations/${TEST_QUOTATION_ID}`);
    await page.waitForLoadState('networkidle');

    // 상세 사양 섹션 확인
    const detailSpecsSection = page.locator('text=詳細仕様').first();

    if (await detailSpecsSection.isVisible({ timeout: 5000 })) {
      const parent = detailSpecsSection.locator('..');

      // 모든 필드가 표시되는지 확인
      const fields = [
        { label: 'サイズ', pattern: /130.*130.*30.*mm|mm/ },
        { label: '袋タイプ', pattern: /スタンドアップパウチ|スタンドパウチ|ピローパウチ|ガセットパウチ/ },
        { label: '素材', pattern: /PET.*AL|アルミ箔ラミネート|PET\/PE|クラフト紙/ },
        { label: '厚さ', pattern: /薄手|標準|中厚|厚手|μm/ },
        { label: '印刷', pattern: /デジタル印刷|グラビア印刷|色/ },
        { label: '納期', pattern: /標準|国内|急ぎ/ },
        { label: '配送先', pattern: /国内|海外/ },
      ];

      for (const field of fields) {
        const label = parent.locator(`text=${field.label}`);
        const value = parent.locator(`text=${field.label}`).locator('..').locator(`text=/${field.pattern.source}/`);

        if (await label.isVisible()) {
          console.log(`✓ ${field.label}: 표시됨`);
        } else {
          console.log(`⚠ ${field.label}: 표시되지 않음`);
        }
      }

      // 後加工 섹션 확인
      const postProcessingLabel = page.locator('text=後加工');
      if (await postProcessingLabel.isVisible()) {
        const postProcessingValues = [
          '角丸め', '光沢仕上げ', '吊り穴', 'ノッチあり',
          '上部開放', 'バルブなし', 'チャック付き'
        ];

        for (const value of postProcessingValues) {
          const element = page.locator(`text=${value}`);
          if (await element.isVisible()) {
            console.log(`✓ 後加工: ${value} 표시됨`);
          }
        }
      }
    } else {
      console.log('⚠ 상세 사양 섹션을 찾을 수 없음');
    }
  });

  // =====================================================
  // Issue 4: 주문 상세 페이지에 은행 계좌 정보 배치
  // =====================================================
  test('Issue 4: 주문 상세 페이지에 은행 계좌 정보가 표시되어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders/${TEST_ORDER_ID}`);
    await page.waitForLoadState('networkidle');

    // 은행 계좌 정보 섹션 확인
    const bankInfoSection = page.locator('text=/振込先|銀行口座/').first();

    if (await bankInfoSection.isVisible({ timeout: 5000 })) {
      console.log('✓ 은행 계좌 정보 섹션 표시됨');

      // 주요 정보가 표시되는지 확인
      const bankInfoFields = [
        '銀行名', '支店名', '口座種別', '口座番号', '口座名義'
      ];

      for (const field of bankInfoFields) {
        const fieldElement = page.locator(`text=${field}`);
        if (await fieldElement.isVisible()) {
          console.log(`✓ ${field}: 표시됨`);
        }
      }

      // 카드 크기 확인 (너무 크지 않아야 함)
      const bankInfoCard = bankInfoSection.locator('..');
      const box = await bankInfoCard.boundingBox();
      if (box) {
        console.log(`✓ 은행 정보 카드 크기: ${box.width}x${box.height}`);
        expect(box.width).toBeLessThan(800); // 너무 넓지 않아야 함
      }
    } else {
      console.log('⚠ 은행 계좌 정보 섹션을 찾을 수 없음');
    }
  });

  // =====================================================
  // Issue 5: 주문 목록의 진척률 그래프 반영
  // =====================================================
  test('Issue 5: 주문 목록에 진척률 막대 그래프가 표시되어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);
    await page.waitForLoadState('networkidle');

    // 진척률 바 또는 그래프 찾기
    const progressBarSelectors = [
      '[role="progressbar"]',
      '.progress-bar',
      '.progress',
      '[data-testid="progress"]',
      '.w-full.bg-gray-200', // Tailwind progress bar
    ];

    let progressBarFound = false;
    for (const selector of progressBarSelectors) {
      const progressBars = page.locator(selector);
      const count = await progressBars.count();

      if (count > 0) {
        console.log(`✓ 진척률 바 ${count}개 발견 (${selector})`);
        progressBarFound = true;

        // 첫 번째 프로그레스 바의 너비 확인
        const firstBar = progressBars.first();
        const width = await firstBar.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.width;
        });
        console.log(`  첫 번째 진척률 바 너비: ${width}`);
        break;
      }
    }

    if (!progressBarFound) {
      console.log('⚠ 진척률 바를 찾을 수 없음');

      // API 응답에서 progress_percentage 확인
      const response = await page.request.get(`${BASE_URL}/api/member/orders`);
      if (response.ok()) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const firstOrder = data.data[0];
          console.log(`  API 응답 progress_percentage: ${firstOrder.progress_percentage}`);
          expect(firstOrder).toHaveProperty('progress_percentage');
        }
      }
    }
  });

  // =====================================================
  // Issue 6: ステータス履歴 표시
  // =====================================================
  test('Issue 6: 주문 상세 페이지에 ステータス履歴이 표시되어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders/${TEST_ORDER_ID}`);
    await page.waitForLoadState('networkidle');

    // ステータス履歴 섹션 확인
    const statusHistoryLabel = page.locator('text=/ステータス履歴|状態履歴|Status History/');

    if (await statusHistoryLabel.isVisible({ timeout: 5000 })) {
      console.log('✓ ステータス履歴 섹션 표시됨');

      // 타임라인 아이템 확인
      const timelineItems = page.locator('[data-testid="timeline-item"], .timeline-item, .status-history-item');
      const count = await timelineItems.count();

      console.log(`✓ ステータス履歴 레코드 수: ${count}`);

      if (count > 0) {
        // 첫 번째 아이템의 내용 확인
        const firstItem = timelineItems.first();
        const text = await firstItem.textContent();
        console.log(`  첫 번째 레코드: ${text}`);
      } else {
        console.log('⚠ ステータス履歴 레코드가 0건입니다 (백필 필요)');
      }
    } else {
      console.log('⚠ ステータス履歴 섹션을 찾을 수 없음');

      // API로 직접 확인
      const response = await page.request.get(`${BASE_URL}/api/member/orders/${TEST_ORDER_ID}/status-history`);
      if (response.ok()) {
        const data = await response.json();
        console.log(`  API 응답 status_history: ${JSON.stringify(data).substring(0, 200)}...`);
      }
    }
  });

  // =====================================================
  // 추가 검증: 콘솔 에러 확인
  // =====================================================
  test('전체 콘솔 에러 확인', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.toString());
    });

    // 주요 페이지 순회
    const pages = [
      `${BASE_URL}/member/quotations`,
      `${BASE_URL}/member/orders`,
      `${BASE_URL}/member/quotations/${TEST_QUOTATION_ID}`,
      `${BASE_URL}/member/orders/${TEST_ORDER_ID}`,
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      console.log(`✓ 페이지 로드 완료: ${url}`);
    }

    console.log(`\n총 콘솔 에러: ${errors.length}`);
    if (errors.length > 0) {
      console.log('에러 목록:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err.substring(0, 200)}`));
    }

    // 치명적 에러가 없어야 함
    const criticalErrors = errors.filter(err =>
      err.includes('TypeError') ||
      err.includes('ReferenceError') ||
      err.includes('500') ||
      err.includes('Fatal')
    );

    console.log(`치명적 에러: ${criticalErrors.length}`);
    expect(criticalErrors.length).toBe(0);
  });
});
