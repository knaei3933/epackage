const { chromium } = require('playwright');
const { writeFileSync } = require('fs');
const { join } = require('path');

async function analyzeBrixaPage() {
  let browser = null;
  let page = null;

  try {
    console.log('브라우저 시작...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('페이지 생성...');
    page = await browser.newPage();

    console.log('로그인 페이지로 이동...');
    await page.goto('https://brixa.jp/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('페이지 로딩 완료');

    // 페이지 소스 저장
    const html = await page.content();
    writeFileSync(join(__dirname, 'brixa-login-page.html'), html);
    console.log('로그인 페이지 HTML 저장');

    // 스크린샷
    await page.screenshot({
      path: join(__dirname, 'brixa-login-screenshot.png'),
      fullPage: true
    });

    // 폼 요소 확인
    const usernameField = await page.locator('input[name="username"], input[type="email"], input[id="username"], input[id="email"]').first();
    const passwordField = await page.locator('input[type="password"]').first();

    if (await usernameField.isVisible() && await passwordField.isVisible()) {
      console.log('로그인 폼 발견');

      await usernameField.fill('kim@kanei-trade.co.jp');
      await passwordField.fill('Ghkrdlsdyd1100');

      const loginButton = await page.locator('button[type="submit"]').first();
      if (await loginButton.isVisible()) {
        loginButton.click();
        console.log('로그인 시도');

        // 로그인 완료 대기
        await page.waitForLoadState('networkidle');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 마이페이지로 이동
        console.log('마이페이지로 이동...');
        await page.goto('https://brixa.jp/mypage/senders', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        // 마이페이지 스크린샷
        await page.screenshot({
          path: join(__dirname, 'brixa-mypage.png'),
          fullPage: true
        });

        // 마이페이지 HTML 저장
        const mypageHtml = await page.content();
        writeFileSync(join(__dirname, 'brixa-mypage.html'), mypageHtml);
        console.log('마이페이지 HTML 저장');

        // 페이지 제목 확인
        const title = await page.title();
        console.log('페이지 제목:', title);

        // 네비게이션 요소 검색
        const navElements = await page.locator('nav, .nav, .navigation, .sidebar').all();
        console.log('네비게이션 개수:', navElements.length);

        // 주요 섹션 검색
        const orderKeywords = ['신규주문', '주문이력', '납품', '청구정보', 'Reorder', 'Order History', 'Delivery'];
        const sections = await page.locator('*').all();

        console.log('\n=== 페이지 구조 분석 ===');

        // 헤더 분석
        const header = await page.locator('header').first();
        if (await header.isVisible()) {
          const headerHtml = await header.innerHTML();
          writeFileSync(join(__dirname, 'brixa-header.html'), headerHtml);
          console.log('헤더 HTML 저장 완료');
        }

        // 사이드바 분석
        const sidebar = await page.locator('.sidebar, .side-menu, .navigation').first();
        if (await sidebar.isVisible()) {
          const sidebarHtml = await sidebar.innerHTML();
          writeFileSync(join(__dirname, 'brixa-sidebar.html'), sidebarHtml);
          console.log('사이드바 HTML 저장 완료');
        }

        // 콘텐츠 영역 분석
        const mainContent = await page.locator('.main-content, .content, .main, .container').first();
        if (await mainContent.isVisible()) {
          const contentHtml = await mainContent.innerHTML();
          writeFileSync(join(__dirname, 'brixa-content.html'), contentHtml);
          console.log('콘텐츠 HTML 저장 완료');
        }

        // 메뉴 아이템 추출
        console.log('\n=== 메뉴 아이템 분석 ===');
        const menuItems = await page.locator('a, button').filter({ hasText: /신규주문|Reorder|주문이력|납품|청구정보|회원정보|Logout/i });

        for (let i = 0; i < await menuItems.count(); i++) {
          const item = await menuItems.nth(i);
          const text = await item.textContent();
          const href = await item.getAttribute('href');
          const classes = await item.getAttribute('class');
          console.log(`메뉴 ${i + 1}: "${text}" - ${href} (${classes})`);
        }

        // 주문 현황 섹션 찾기
        console.log('\n=== 주문 현황 섹션 검색 ===');
        for (const keyword of orderKeywords) {
          const elements = await page.locator(`*:text-is("${keyword}")`).all();
          console.log(`'${keyword}' 포함 요소: ${elements.length}개`);

          if (elements.length > 0) {
            const elementHtml = await elements[0].innerHTML();
            writeFileSync(join(__dirname, `brixa-${keyword.replace(/\s/g, '_')}.html`), elementHtml);
          }
        }

        // 회원 정보 섹션 찾기
        const profileKeywords = ['회원정보', '프로필', 'Profile'];
        console.log('\n=== 회원 정보 섹션 검색 ===');
        for (const keyword of profileKeywords) {
          const elements = await page.locator(`*:text-is("${keyword}")`).all();
          console.log(`'${keyword}' 포함 요소: ${elements.length}개`);
        }

        // 전체 요소 분석 요약
        const buttonCount = await page.locator('button').count();
        const linkCount = await page.locator('a').count();
        const tableCount = await page.locator('table').count();
        const formCount = await page.locator('form').count();

        console.log('\n=== 페이지 요약 ===');
        console.log(`- 페이지 제목: ${title}`);
        console.log(`- 버튼 개수: ${buttonCount}`);
        console.log(`- 링크 개수: ${linkCount}`);
        console.log(`- 테이블 개수: ${tableCount}`);
        console.log(`- 폼 개수: ${formCount}`);

        // 생성된 파일 목록
        const files = [
          'brixa-login-page.html',
          'brixa-mypage.html',
          'brixa-header.html',
          'brixa-sidebar.html',
          'brixa-content.html',
          'brixa-login-screenshot.png',
          'brixa-mypage.png'
        ];

        console.log('\n=== 생성된 파일 ===');
        files.forEach(file => console.log(`- ${file}`));

        return {
          pageTitle: title,
          files: files,
          message: '페이지 분석 완료'
        };

      } else {
        console.log('로그인 버튼을 찾을 수 없음');
      }
    } else {
      console.log('로그인 폼을 찾을 수 없음');
      console.log('아이디 필드:', await usernameField.isVisible());
      console.log('비밀번호 필드:', await passwordField.isVisible());
    }

    return { message: '로그인 필요' };

  } catch (error) {
    console.error('오류 발생:', error.message);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzeBrixaPage().then(result => {
  console.log('\n분석 결과:', result);
}).catch(error => {
  console.error('실패:', error.message);
});