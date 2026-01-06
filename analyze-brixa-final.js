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

    // 로그인으로 이동
    console.log('로그인 페이지로 이동...');
    await page.goto('https://brixa.jp/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 로그인 폼 채우기
    console.log('로그인 정보 입력...');

    // 이메일/아이디 필드 - type="text" placeholder="ユーザー名またはメールアドレス"
    const usernameField = await page.locator('input[type="text"][placeholder="ユーザー名またはメールアドレス"]').first();
    if (await usernameField.isVisible()) {
      await usernameField.fill('kim@kanei-trade.co.jp');
      console.log('아이디 입력 완료');
    }

    // 비밀번호 필드 - type="password" placeholder="パスワード"
    const passwordField = await page.locator('input[type="password"][placeholder="パスワード"]').first();
    if (await passwordField.isVisible()) {
      await passwordField.fill('Ghkrdlsdyd1100');
      console.log('비밀번호 입력 완료');
    }

    // 로그인 버튼 클릭 - type="submit" 내부에 SVG와 "ログ인" 텍스트
    const loginButton = await page.locator('button[type="submit"]').first();
    if (await loginButton.isVisible()) {
      loginButton.click();
      console.log('로그인 버튼 클릭');
    }

    // 로그인 완료 대기
    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 로그인 성공 확인
    console.log('로그인 후 페이지로 이동...');

    // 마이페이지로 직접 이동
    await page.goto('https://brixa.jp/mypage/senders', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 스크린샷 촬영
    await page.screenshot({
      path: join(__dirname, 'brixa-mypage-final.png'),
      fullPage: true
    });
    console.log('마이페이지 스크린샷 저장 완료');

    // 전체 HTML 가져오기
    const fullHtml = await page.content();
    writeFileSync(join(__dirname, 'brixa-mypage-full.html'), fullHtml);
    console.log('전체 HTML 저장 완료');

    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);

    // 페이지 구조 분석
    console.log('\n=== 페이지 구조 분석 ===');

    // 헤더 분석
    const header = await page.locator('header').first();
    if (await header.isVisible()) {
      const headerHtml = await header.innerHTML();
      writeFileSync(join(__dirname, 'brixa-header-mypage.html'), headerHtml);
      console.log('헤더 HTML 저장 완료');
    }

    // 네비게이션 메뉴 분석
    console.log('\n=== 네비게이션 메뉴 분석 ===');
    const navSelectors = [
      'nav',
      '.nav',
      '.navigation',
      '.sidebar',
      '.menu',
      '.main-menu',
      '.account-menu',
      '.user-menu'
    ];

    for (const selector of navSelectors) {
      const elements = await page.locator(selector).all();
      console.log(`${selector}: ${elements.length}개 요소 발견`);

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (await element.isVisible()) {
          const html = await element.innerHTML();
          const classes = await element.getAttribute('class');
          const id = await element.getAttribute('id');

          console.log(`  - 요소 ${i + 1}: ID=${id}, Classes=${classes}`);

          // 메뉴 아이템 추출
          const links = await element.locator('a, button').all();
          console.log(`    메뉴 아이템: ${links.length}개`);

          for (let j = 0; j < Math.min(links.length, 5); j++) {
            const link = links[j];
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            console.log(`      - ${text} (${href})`);
          }

          // HTML 저장
          writeFileSync(join(__dirname, `brixa-${selector.replace(/[^a-zA-Z0-9]/g, '-')}-${i + 1}.html`), html);
        }
      }
    }

    // 주요 콘텐츠 영역 분석
    console.log('\n=== 콘텐츠 영역 분석 ===');
    const contentSelectors = [
      'main',
      '.main',
      '.content',
      '.main-content',
      '.container',
      '.page-content',
      '.dashboard'
    ];

    for (const selector of contentSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        const html = await element.innerHTML();
        const classes = await element.getAttribute('class');
        const id = await element.getAttribute('id');

        console.log(`${selector}: ID=${id}, Classes=${classes}`);
        writeFileSync(join(__dirname, `brixa-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.html`), html);
      }
    }

    // 섹션별 분석
    console.log('\n=== 주요 섹션 분석 ===');

    // 각종 섹션 키워드로 검색
    const sectionKeywords = [
      { name: '신규주문', selectors: [':text-is("신규주문")', ':text("신규주문")'] },
      { name: 'Reorder', selectors: [':text-is("Reorder")', ':text("Reorder")'] },
      { name: '주문이력', selectors: [':text-is("주문이력")', ':text("주문이력")'] },
      { name: '납품', selectors: [':text-is("납품")', ':text("납품")'] },
      { name: '청구정보', selectors: [':text-is("청구정보")', ':text("청구정보")'] },
      { name: 'Delivery', selectors: [':text-is("Delivery")', ':text("Delivery")'] },
      { name: 'Billing', selectors: [':text-is("Billing")', ':text("Billing")'] },
      { name: '회원정보', selectors: [':text-is("회원정보")', ':text("회원정보")'] },
      { name: 'Profile', selectors: [':text-is("Profile")', ':text("Profile")'] }
    ];

    for (const section of sectionKeywords) {
      for (const selector of section.selectors) {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`${section.name}: ${elements.length}개 발견`);

          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const html = await element.innerHTML();
            const parent = await element.locator('xpath=..').first();
            const parentClasses = await parent.getAttribute('class');
            const parentId = await parent.getAttribute('id');

            console.log(`  - 위치: ID=${parentId}, Classes=${parentClasses}`);
            writeFileSync(join(__dirname, `brixa-section-${section.name}-${i + 1}.html`), html);
          }
        }
      }
    }

    // UI 컴포넌트 통계
    console.log('\n=== UI 컴포넌트 통계 ===');

    const stats = {
      buttons: await page.locator('button').count(),
      links: await page.locator('a').count(),
      inputs: await page.locator('input').count(),
      selects: await page.locator('select').count(),
      textareas: await page.locator('textarea').count(),
      tables: await page.locator('table').count(),
      forms: await page.locator('form').count(),
      divs: await page.locator('div').count(),
      sections: await page.locator('section').count(),
      articles: await page.locator('article').count(),
      cards: await page.locator('.card, .panel, .box, .widget, .dashboard-card').count(),
      lists: await page.locator('ul, ol').count(),
      images: await page.locator('img').count()
    };

    for (const [key, value] of Object.entries(stats)) {
      console.log(`${key}: ${value}개`);
    }

    // 생성된 파일 목록
    const files = [
      'brixa-mypage-final.png',
      'brixa-mypage-full.html',
      'brixa-header-mypage.html'
    ];

    // 동적 파일 목록 추가
    const fs = require('fs');
    if (fs.existsSync(join(__dirname))) {
      const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
      htmlFiles.forEach(file => {
        if (!files.includes(file)) {
          files.push(file);
        }
      });
    }

    console.log('\n=== 생성된 파일 ===');
    files.forEach(file => console.log(`- ${file}`));

    return {
      pageTitle: title,
      files: files,
      stats: stats,
      message: '페이지 분석 완료'
    };

  } catch (error) {
    console.error('오류 발생:', error.message);
    return { error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 함수 실행
analyzeBrixaPage().then(result => {
  console.log('\n분석 결과:', result);
}).catch(error => {
  console.error('실패:', error.message);
});