const { chromium, Browser, Page } = require('playwright');
const { writeFileSync } = require('fs');
const { join } = require('path');

async function analyzeBrixaPage() {
  let browser = null;
  let page = null;

  try {
    // 브라우저 시작
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });

    // 페이지 생성
    page = await browser.newPage();

    // 페이지 설정
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 네트워크 응답 기다리기
    page.on('response', async (response) => {
      if (response.status() >= 400) {
        console.log(`Error ${response.status()}: ${response.url()}`);
      }
    });

    // 로그인 페이지로 이동
    console.log('로그인 페이지로 이동...');
    await page.goto('https://brixa.jp/mypage/senders', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    console.log('페이지 로딩 완료');

    // 스크린샷 촬영
    await page.screenshot({
      path: join(__dirname, 'brixa-fullpage.png'),
      fullPage: true
    });
    console.log('전체 페이지 스크린샷 저장 완료');

    // 로그인 폼 채우기
    console.log('로그인 정보 입력...');

    // 아이디 입력
    const usernameField = await page.locator('input[name="username"], input[type="email"], input[id="username"], input[id="email"], input[placeholder*="아이디"], input[placeholder*="ID"], input[placeholder*="email"]').first();
    if (await usernameField.isVisible()) {
      await usernameField.fill('kim@kanei-trade.co.jp');
      console.log('아이디 입력 완료');
    }

    // 비밀번호 입력
    const passwordField = await page.locator('input[type="password"], input[name="password"], input[id="password"], input[placeholder*="비밀번호"], input[placeholder*="password"]').first();
    if (await passwordField.isVisible()) {
      await passwordField.fill('Ghkrdlsdyd1100');
      console.log('비밀번호 입력 완료');
    }

    // 로그인 버튼 클릭
    const loginButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login"), input[type="submit"]').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('로그인 버튼 클릭');
    }

    // 로그인 완료 대기
    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 추가 대기

    // 로그인 후 스크린샷 촬영
    await page.screenshot({
      path: join(__dirname, 'brixa-after-login.png'),
      fullPage: true
    });
    console.log('로그인 후 스크린샷 저장 완료');

    // 페이지 구조 분석
    console.log('페이지 구조 분석 시작...');

    // 전체 페이지 타이틀 가져오기
    const pageTitle = await page.title();
    console.log('페이지 타이틀:', pageTitle);

    // 헤더 구조 분석
    console.log('\n=== 헤더 구조 분석 ===');
    const header = await page.locator('header').first();
    if (await header.isVisible()) {
      const headerHtml = await header.innerHTML();
      await writeFileSync(join(__dirname, 'brixa-header.html'), headerHtml);
      console.log('헤더 HTML 저장 완료');

      // 헤더 내 요소들
      const headerElements = await header.locator('*').all();
      console.log(`헤더 내 요소 개수: ${headerElements.length}`);
    }

    // 메인 네비게이션 분석
    console.log('\n=== 메인 네비게이션 분석 ===');
    const navElements = await page.locator('nav, .nav, .navigation, .menu, .sidebar').all();
    console.log(`네비게이션 컴포넌트 개수: ${navElements.length}`);

    for (let i = 0; i < navElements.length; i++) {
      const nav = navElements[i];
      if (await nav.isVisible()) {
        const navHtml = await nav.innerHTML();
        const navClasses = await nav.getAttribute('class');
        const navId = await nav.getAttribute('id');

        console.log(`\n네비게이션 ${i + 1}:`);
        console.log(`- ID: ${navId}`);
        console.log(`- Classes: ${navClasses}`);

        // 메뉴 아이템 분석
        const menuItems = await nav.locator('a, button').all();
        console.log(`- 메뉴 아이템 개수: ${menuItems.length}`);

        for (let j = 0; j < Math.min(menuItems.length, 10); j++) {
          const item = menuItems[j];
          const itemText = await item.textContent();
          const itemHref = await item.getAttribute('href');
          const itemClasses = await item.getAttribute('class');

          console.log(`  - 메뉴 ${j + 1}: "${itemText}" (${itemHref}) - ${itemClasses}`);
        }

        // HTML 저장
        await writeFileSync(join(__dirname, `brixa-nav-${i + 1}.html`), navHtml);
      }
    }

    // 주요 섹션 분석
    console.log('\n=== 주요 섹션 분석 ===');
    const sections = await page.locator('section, .section, .content, .main').all();
    console.log(`주요 섹션 개수: ${sections.length}`);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (await section.isVisible()) {
        const sectionHtml = await section.innerHTML();
        const sectionClasses = await section.getAttribute('class');
        const sectionId = await section.getAttribute('id');

        console.log(`\n섹션 ${i + 1}:`);
        console.log(`- ID: ${sectionId}`);
        console.log(`- Classes: ${sectionClasses}`);
        console.log(`- HTML 길이: ${sectionHtml.length}`);

        // 섹션 제목 추출
        const heading = await section.locator('h1, h2, h3, h4, h5, h6').first();
        if (await heading.isVisible()) {
          const headingText = await heading.textContent();
          console.log(`- 제목: ${headingText}`);
        }

        // HTML 저장
        await writeFileSync(join(__dirname, `brixa-section-${i + 1}.html`), sectionHtml);
      }
    }

    // 주문 현황 섹션 특별 분석
    console.log('\n=== 주문 현황 섹션 분석 ===');
    const orderSections = await page.locator(':text-is("신규주문"), :text-is("Reorder"), :text-is("주문이력"), :text-is("납품"), :text-is("청구정보"), :text("Order")').all();
    console.log(`주문 관련 섹션 개수: ${orderSections.length}`);

    for (let i = 0; i < orderSections.length; i++) {
      const orderSection = orderSections[i];
      if (await orderSection.isVisible()) {
        const orderHtml = await orderSection.innerHTML();
        const orderClasses = await orderSection.getAttribute('class');

        console.log(`\n주문 섹션 ${i + 1}:`);
        console.log(`- Classes: ${orderClasses}`);

        // 부모 요구 찾기
        const parentSection = await orderSection.locator('xpath=..').first();
        const parentClasses = await parentSection.getAttribute('class');
        const parentId = await parentSection.getAttribute('id');

        console.log(`- 부모 ID: ${parentId}`);
        console.log(`- 부모 Classes: ${parentClasses}`);

        await writeFileSync(join(__dirname, `brixa-order-section-${i + 1}.html`), orderHtml);
      }
    }

    // 회원 정보 섹션 분석
    console.log('\n=== 회원 정보 섹션 분석 ===');
    const profileSections = await page.locator(':text-is("회원정보"), :text-is("Profile"), :text-is("프로필")').all();
    console.log(`회원 정보 섹션 개수: ${profileSections.length}`);

    for (let i = 0; i < profileSections.length; i++) {
      const profileSection = profileSections[i];
      if (await profileSection.isVisible()) {
        const profileHtml = await profileSection.innerHTML();
        const profileClasses = await profileSection.getAttribute('class');

        console.log(`\n회원 정보 섹션 ${i + 1}:`);
        console.log(`- Classes: ${profileClasses}`);

        await writeFileSync(join(__dirname, `brixa-profile-section-${i + 1}.html`), profileHtml);
      }
    }

    // 전체 페이지 HTML 가져오기
    const fullHtml = await page.content();
    await writeFileSync(join(__dirname, 'brixa-full.html'), fullHtml);
    console.log('\n전체 페이지 HTML 저장 완료');

    // UI 컴포넌트 분석
    console.log('\n=== UI 컴포넌트 분석 ===');

    // 버튼 분석
    const buttons = await page.locator('button').all();
    console.log(`버튼 개수: ${buttons.length}`);

    // 링크 분석
    const links = await page.locator('a').all();
    console.log(`링크 개수: ${links.length}`);

    // 폼 요소 분석
    const formElements = await page.locator('input, select, textarea').all();
    console.log(`폼 요소 개수: ${formElements.length}`);

    // 테이블 분석
    const tables = await page.locator('table').all();
    console.log(`테이블 개수: ${tables.length}`);

    // 카드 컴포넌트 분석
    const cards = await page.locator('.card, .panel, .box, .widget').all();
    console.log(`카드/패널 컴포넌트 개수: ${cards.length}`);

    // 분석 결과 요약
    console.log('\n=== 분석 결과 요약 ===');
    console.log(`- 페이지 타이틀: ${pageTitle}`);
    console.log(`- 전체 HTML 길이: ${fullHtml.length}`);
    console.log(`- 스크린샷: brixa-fullpage.png, brixa-after-login.png`);
    console.log(`- HTML 파일: brixa-full.html, brixa-header.html, nav-*.html, section-*.html`);

    return {
      pageTitle,
      fullHtmlLength: fullHtml.length,
      navCount: navElements.length,
      sectionCount: sections.length,
      orderSectionsFound: orderSections.length,
      profileSectionsFound: profileSections.length,
      screenshots: ['brixa-fullpage.png', 'brixa-after-login.png'],
      htmlFiles: [
        'brixa-full.html',
        'brixa-header.html',
        ...Array.from({ length: navElements.length }, (_, i) => `brixa-nav-${i + 1}.html`),
        ...Array.from({ length: sections.length }, (_, i) => `brixa-section-${i + 1}.html`),
        ...Array.from({ length: orderSections.length }, (_, i) => `brixa-order-section-${i + 1}.html`),
        ...Array.from({ length: profileSections.length }, (_, i) => `brixa-profile-section-${i + 1}.html`)
      ]
    };

  } catch (error) {
    console.error('오류 발생:', error.message);
    return { error: error.message };
  } finally {
    // 브라우저 종료
    if (browser) {
      await browser.close();
    }
  }
}

// 함수 실행
analyzeBrixaPage().then(result => {
  console.log('\n분석 완료!');
  console.log('저장된 파일들:', result?.htmlFiles || []);
  console.log('스크린샷:', result?.screenshots || []);
}).catch(error => {
  console.error('실패:', error.message);
});