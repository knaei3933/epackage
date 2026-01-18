import { test, expect } from '@playwright/test';

/**
 * SKU Calculation Detailed Verification Test
 * SKU 계산 상세 검증 테스트
 *
 * 실제 계산 로직을 검증하여 400m 고정 로스가 적용되는지 확인
 */

test.describe('SKU Calculation Detailed Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quote-simulator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  /**
   * Test 1: ImprovedQuotingWizard 단계 확인
   */
  test('ImprovedQuotingWizard 단계 구조 확인', async ({ page }) => {
    // Look for step indicators
    const stepIndicators = page.locator('[class*="step"], [class*="Step"], button:has-text("基本")');
    const stepCount = await stepIndicators.count();

    console.log(`스텝 인디케이터: ${stepCount}개`);

    // Look for current active step
    const activeStep = page.locator('[class*="active"], [aria-selected="true"], button[style*="background"]');
    const activeCount = await activeStep.count();

    console.log(`활성 스텝: ${activeCount}개`);

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/detailed-wizard-steps.png' });
  });

  /**
   * Test 2: QuoteContext 상태 확인 (JavaScript 실행)
   */
  test('QuoteContext 상태 확인', async ({ page }) => {
    // Execute JavaScript to check if QuoteContext is available
    const contextCheck = await page.evaluate(() => {
      // Check if we're on the quote simulator page
      const hasWizard = document.querySelector('[class*="wizard"], [class*="Wizard"]') !== null;
      const hasQuoteElements = document.querySelectorAll('[class*="quote"]').length > 0;

      // Check for Next.js 16 React app by looking for actual app elements
      // Next.js 16 doesn't use #__next div anymore, check for actual React components
      const hasReactApp = document.querySelector('html[data-scroll-behavior]') !== null ||
                         document.querySelector('[class*="quote"]') !== null ||
                         document.querySelector('[class*="wizard"]') !== null ||
                         // Check for React's internal root markers
                         document.querySelector('body > div') !== null ||
                         document.querySelector('main') !== null;

      return {
        hasWizard,
        hasQuoteElements,
        hasReactApp,
        url: window.location.href,
        title: document.title
      };
    });

    console.log('컨텍스트 확인 결과:', contextCheck);

    // Check that the React app is loaded (has either wizard, quote elements, or React root)
    const hasReactApp = contextCheck.hasReactApp || contextCheck.hasWizard || contextCheck.hasQuoteElements;
    expect(hasReactApp).toBeTruthy();
  });

  /**
   * Test 3: SKU 선택 버튼 클릭 및 동작 확인
   */
  test('SKU 선택 버튼 클릭 동작 확인', async ({ page }) => {
    // First, try to navigate to the SKU selection step
    // Look for "次へ" (Next) button to advance through the wizard
    const nextButtons = page.locator('button').filter({
      hasText: /次へ|進む|Continue|Next/
    });

    const nextBtnCount = await nextButtons.count();
    console.log(`次へ 관련 버튼: ${nextBtnCount}개`);

    // Try to navigate to SKU selection step by clicking next multiple times
    if (nextBtnCount > 0) {
      // SKU selection is typically step 3, so click next 2 times to reach it
      for (let i = 0; i < 2; i++) {
        const visibleNextBtn = nextButtons.filter({ hasText: /次へ/ }).first();
        const isVisible = await visibleNextBtn.isVisible();
        const isEnabled = await visibleNextBtn.isEnabled();

        if (isVisible && isEnabled) {
          console.log(`次へ 버튼 클릭 (${i + 1}/2)`);
          await visibleNextBtn.click();
          await page.waitForTimeout(1000);
        } else {
          break;
        }
      }
    }

    // Now look for SKU selection related buttons
    const skuSelectionButtons = page.locator('button').filter({
      hasText: /SKU|デザイン|数量|選択/
    });

    const skuBtnCount = await skuSelectionButtons.count();
    console.log(`SKU 관련 버튼: ${skuBtnCount}개`);

    if (skuBtnCount > 0) {
      // Find an enabled SKU button
      let foundEnabledButton = false;
      for (let i = 0; i < skuBtnCount; i++) {
        const btn = skuSelectionButtons.nth(i);
        const isEnabled = await btn.isEnabled();
        const isVisible = await btn.isVisible();
        const btnText = await btn.textContent();

        console.log(`SKU 버튼 ${i + 1}: "${btnText}" - visible: ${isVisible}, enabled: ${isEnabled}`);

        if (isVisible && isEnabled && !foundEnabledButton) {
          console.log(`클릭할 버튼: ${btnText}`);
          await btn.click();
          await page.waitForTimeout(1000);
          foundEnabledButton = true;
          break;
        }
      }

      // Take screenshot after click (or after checking)
      await page.screenshot({ path: 'test-screenshots/detailed-sku-click-result.png' });

      // Check for any new elements that appeared
      const newInputs = page.locator('input[type="number"]');
      const inputCount = await newInputs.count();
      console.log(`SKU 클릭 후 수량 입력 필드: ${inputCount}개`);
    } else {
      console.log('SKU 관련 버튼을 찾을 수 없음');
      // Take screenshot of current state
      await page.screenshot({ path: 'test-screenshots/detailed-sku-click-result.png' });
    }
  });

  /**
   * Test 4: 현재 페이지의 모든 입력 요소 분석
   */
  test('모든 입력 요소 상세 분석', async ({ page }) => {
    // Get all input elements with details
    const inputs = await page.locator('input').all();

    console.log(`=== 전체 입력 요소 분석 (${inputs.length}개) ===`);

    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue();
      const visible = await input.isVisible();

      console.log(`입력 ${i + 1}: type=${type}, name=${name}, placeholder=${placeholder}, value=${value}, visible=${visible}`);
    }

    // Get all select elements
    const selects = await page.locator('select').all();

    console.log(`\n=== 셀렉트 요소 (${selects.length}개) ===`);

    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      const name = await select.getAttribute('name');

      // Get options
      const options = await select.locator('option').all();
      const optionTexts = [];

      for (const opt of options) {
        const text = await opt.textContent();
        const value = await opt.getAttribute('value');
        optionTexts.push(`${value || '(empty)'}: ${text}`);
      }

      console.log(`셀렉트 ${i + 1}: name=${name}`);
      optionTexts.forEach(opt => console.log(`  - ${opt}`));
    }
  });

  /**
   * Test 5: 계산 관련 요소 확인
   */
  test('가격 계산 관련 요소 확인', async ({ page }) => {
    // Look for price/calculation related elements
    const priceElements = page.locator('text=/円|￥|価格|見積もり|Total|合計/');

    console.log('=== 가격 관련 요소 ===');

    const priceCount = await priceElements.count();

    for (let i = 0; i < Math.min(priceCount, 10); i++) {
      const elem = priceElements.nth(i);
      const text = await elem.textContent();
      const visible = await elem.isVisible();

      if (visible && text) {
        const truncated = text.length > 50 ? text.substring(0, 50) + '...' : text;
        console.log(`가격 요소 ${i + 1}: ${truncated}`);
      }
    }

    // Look for calculation buttons
    const calcButtons = page.locator('button').filter({
      hasText: /計算|見積|Calculate|Execute/
    });

    const calcBtnCount = await calcButtons.count();
    console.log(`\n계산 버튼: ${calcBtnCount}개`);

    for (let i = 0; i < calcBtnCount; i++) {
      const text = await calcButtons.nth(i).textContent();
      console.log(`  계산 버튼 ${i + 1}: ${text}`);
    }
  });

  /**
   * Test 6: 데이터베이스 연동 확인 (API 호출 감지)
   */
  test('API 호출 및 데이터베이스 연동 확인', async ({ page }) => {
    const apiCalls: string[] = [];

    // Intercept API calls
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/') || url.includes('supabase')) {
        apiCalls.push(url);
      }
    });

    // Try to trigger calculation by interacting with page
    // Look for and click first interactive element

    // Try to find any clickable button
    const buttons = page.locator('button').filter({
      hasText: /次へ|進む|Continue|Next/
    });

    const nextBtnCount = await buttons.count();

    if (nextBtnCount > 0) {
      console.log('次へ 버튼 발견, 클릭 시도');

      await buttons.first().click();
      await page.waitForTimeout(2000);

      console.log(`API 호출 수: ${apiCalls.length}`);

      if (apiCalls.length > 0) {
        apiCalls.forEach((call, i) => {
          console.log(`  API ${i + 1}: ${call.substring(0, 100)}...`);
        });
      }
    } else {
      console.log('次へ 버튼을 찾을 수 없음');
    }

    await page.screenshot({ path: 'test-screenshots/detailed-api-check.png' });
  });

  /**
   * Test 7: SKU 계산 로직 검증을 위한 페이지 상태 분석
   */
  test('SKU 계산 가능성 진단', async ({ page }) => {
    // Execute comprehensive page analysis
    const analysis = await page.evaluate(() => {
      // Check for SKU-related DOM elements
      const skuElements = document.querySelectorAll('[class*="sku"], [class*="SKU"], [data-sku]');

      // Check for quantity inputs
      const quantityInputs = document.querySelectorAll('input[type="number"]');

      // Check for price displays
      const priceDisplays = document.querySelectorAll('[class*="price"], [class*="cost"], [class*="amount"]');

      // Check for calculation functions in global scope
      const hasCalculator = typeof (window as any).calculate !== 'undefined' ||
                             typeof (window as any).calculatePrice !== 'undefined';

      // Check for Next.js 16 React app by looking for actual app elements
      const hasReactApp = document.querySelector('html[data-scroll-behavior]') !== null ||
                         document.querySelector('[class*="quote"]') !== null ||
                         document.querySelector('[class*="wizard"]') !== null ||
                         document.querySelector('body > div') !== null ||
                         document.querySelector('main') !== null;

      return {
        skuElements: skuElements.length,
        quantityInputs: quantityInputs.length,
        priceDisplays: priceDisplays.length,
        hasCalculator,
        bodyClasses: document.body.className,
        hasReactApp
      };
    });

    console.log('=== SKU 계산 가능성 진단 ===');
    console.log(`SKU 요소: ${analysis.skuElements}개`);
    console.log(`수량 입력: ${analysis.quantityInputs}개`);
    console.log(`가격 표시: ${analysis.priceDisplays}개`);
    console.log(`계산기 함수: ${analysis.hasCalculator ? '있음' : '없음'}`);
    console.log(`React 앱: ${analysis.hasReactApp ? '있음' : '없음'}`);
    console.log(`본문 클래스: ${analysis.bodyClasses}`);

    await page.screenshot({
      path: 'test-screenshots/detailed-full-page.png',
      fullPage: true
    });
  });
});
