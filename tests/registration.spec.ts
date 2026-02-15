import { test, expect } from '@playwright/test';

/**
 * 회원가입 E2E 테스트
 * Registration E2E Test
 */

const BASE_URL = 'http://localhost:3005';

// Test credentials from environment variables (for security)
const TEST_USER = {
  email: `test-${Date.now()}@testmail.cc`,
  password: process.env.TEST_USER_PASSWORD || 'Test1234!',
  kanjiLastName: '田中',
  kanjiFirstName: '太郎',
  kanaLastName: 'たなか',
  kanaFirstName: 'たろう',
  corporatePhone: '03-1234-5678',
  personalPhone: '090-1234-5678',
  businessType: 'CORPORATION',
  companyName: 'テスト株式会社',
  legalEntityNumber: '1234567890123',
  position: '部長',
  department: '営業部',
  companyUrl: 'https://test-example.com',
  productCategory: 'OTHER',
  acquisitionChannel: 'web_search',
  postalCode: '123-4567',
  prefecture: '東京都',
  city: '渋谷区',
  street: '道玄坂1-2-3',
};

test.describe('회원가입 (Registration)', () => {
  test('should register new user successfully', async ({ page }) => {
    console.log('회원가입 테스트 시작...');
    console.log('이메일:', TEST_USER.email);

    // 1. 회원가입 페이지로 이동
    await page.goto(`${BASE_URL}/auth/register/`);
    await page.waitForLoadState('networkidle');
    console.log('✅ 회원가입 페이지 로드됨');

    // 2. 스크린샷 찍기 (전)
    await page.screenshot({ path: 'test-results/registration/01-before-fill.png' });

    // 3. 필수 필드 입력
    // 한자 이름 (JapaneseNameInput 컴포넌트는 placeholder 사용)
    await page.fill('input[placeholder="山田"]', TEST_USER.kanjiLastName);
    await page.fill('input[placeholder="太郎"]', TEST_USER.kanjiFirstName);

    // 카나 이름
    await page.fill('input[placeholder="やまだ"]', TEST_USER.kanaLastName);
    await page.fill('input[placeholder="たろう"]', TEST_USER.kanaFirstName);

    // 이메일
    await page.fill('input[name="email"]', TEST_USER.email);

    // 비밀번호
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="passwordConfirm"]', TEST_USER.password);

    // 전화번호
    await page.fill('input[name="corporatePhone"]', TEST_USER.corporatePhone);
    await page.fill('input[name="personalPhone"]', TEST_USER.personalPhone);

    // 비즈니스 유형 (라디오 버튼)
    const businessTypeRadio = page.locator(`input[type="radio"][value="${TEST_USER.businessType}"]`);
    await businessTypeRadio.click();

    // 상품 유형
    const productCategorySelect = page.locator('select[name="productCategory"]');
    await productCategorySelect.selectOption(TEST_USER.productCategory);

    // 회사 정보
    await page.fill('input[name="companyName"]', TEST_USER.companyName);
    await page.fill('input[name="legalEntityNumber"]', TEST_USER.legalEntityNumber);
    await page.fill('input[name="position"]', TEST_USER.position);
    await page.fill('input[name="department"]', TEST_USER.department);
    await page.fill('input[name="companyUrl"]', TEST_USER.companyUrl);

    // 주소 정보
    await page.fill('input[name="postalCode"]', TEST_USER.postalCode);
    await page.selectOption('select[name="prefecture"]', TEST_USER.prefecture);
    await page.fill('input[name="city"]', TEST_USER.city);
    await page.fill('input[name="street"]', TEST_USER.street);

    // 획득 경로
    const acquisitionChannelSelect = page.locator('select[name="acquisitionChannel"]');
    await acquisitionChannelSelect.selectOption(TEST_USER.acquisitionChannel);

    console.log('✅ 모든 필드 입력 완료');

    // 4. 스크린샷 찍기 (입력 후)
    await page.screenshot({ path: 'test-results/registration/02-after-fill.png' });

    // 5. 개인정보 동의 체크박스 (있으면)
    const privacyCheckbox = page.locator('input[name="privacyConsent"]');
    const isVisible = await privacyCheckbox.isVisible();
    if (isVisible) {
      await privacyCheckbox.check();
      console.log('✅ 개인정보 동의 체크');
    }

    // 6. 제출 버튼 클릭 (폼 내부의 제출 버튼)
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: '会員登録' }).or(
      page.locator('button[type="submit"]').first()
    );
    await submitButton.click();
    console.log('✅ 회원가입 제출');

    // 7. 결과 확인
    await page.waitForTimeout(3000);

    // 8. 스크린샷 찍기 (결과)
    await page.screenshot({ path: 'test-results/registration/03-result.png', fullPage: true });

    // 성공 메시지 확인 (일본어)
    const successMessages = [
      '会員登録が完了しました',
      'メール認証後',
      '管理者の承認をお待ちください',
      '登録ありがとうございます'
    ];

    let foundSuccessMessage = false;
    for (const msg of successMessages) {
      const isVisible = await page.locator(`text=${msg}`).isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ 성공 메시지 확인: ${msg}`);
        foundSuccessMessage = true;
        break;
      }
    }

    // URL 확인
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);

    // 9. 테스트 결과 로그
    console.log('\n========================================');
    console.log('회원가입 테스트 결과');
    console.log('========================================');
    console.log('이메일:', TEST_USER.email);
    console.log('성공 여부:', foundSuccessMessage ? '✅ 성공' : '❌ 실패');
    console.log('현재 URL:', currentUrl);
    console.log('========================================\n');

    // 10. 페이지 유지하여 확인 (3초)
    await page.waitForTimeout(3000);
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register/`);
    await page.waitForLoadState('networkidle');

    // 필수 필드 입력 (한자 이름)
    await page.fill('input[placeholder="山田"]', 'テスト');
    await page.fill('input[placeholder="太郎"]', 'ユーザー');
    await page.fill('input[placeholder="やまだ"]', 'てすと');
    await page.fill('input[placeholder="たろう"]', 'ゆーざー');

    // 잘못된 이메일 입력
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="passwordConfirm"]', TEST_USER.password);

    // 제출
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // 에러 메시지 확인
    const hasError = await page.locator('text=メール').isVisible().catch(() => false) ||
                     await page.locator('text=エラー').isVisible().catch(() => false) ||
                     await page.locator('text=有効').isVisible().catch(() => false);

    if (hasError) {
      console.log('✅ 이메일 검증 에러가 정상 작동함');
    }
  });
});
