const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  const pages = [
    { url: '/member/dashboard', name: '대시보드' },
    { url: '/member/profile', name: '프로필 보기' },
    { url: '/member/edit', name: '회원정보수정' },
    { url: '/member/orders/new', name: '새 주문' },
    { url: '/member/orders/history', name: '주문 내역' },
    { url: '/member/deliveries', name: '배송지 관리' },
    { url: '/member/invoices', name: '청구지 관리' },
    { url: '/member/quotations', name: '견적서 내역' },
    { url: '/member/samples', name: '샘플 요청 내역' },
    { url: '/member/inquiries', name: '문의 내역' },
  ];

  const results = [];

  for (const pageData of pages) {
    console.log(`\n=== Testing: ${pageData.name} (${pageData.url}) ===`);

    try {
      await page.goto(`http://localhost:3005${pageData.url}`, { waitUntil: 'networkidle', timeout: 15000 });

      const title = await page.title();
      const url = page.url();

      // Check if redirected to login
      if (url.includes('/auth/signin') || url.includes('/auth/register')) {
        console.log(`⚠️  Requires authentication (redirected to ${url.includes('/signin') ? 'login' : 'register'})`);
        results.push({ page: pageData.name, status: 'Auth Required', url });
      } else if (title.includes('404') || (await page.locator('text=404').count() > 0)) {
        console.log(`❌ 404 Page Not Found`);
        results.push({ page: pageData.name, status: '404', url });
      } else {
        console.log(`✅ Accessible - Title: ${title}`);

        // Check for main content
        const hasContent = await page.evaluate(() => {
          const body = document.body.innerText;
          return body && body.length > 100;
        });

        if (hasContent) {
          results.push({ page: pageData.name, status: 'OK', url });
        } else {
          results.push({ page: pageData.name, status: 'No Content', url });
        }
      }

      // Take screenshot
      await page.screenshot({
        path: `mypage-test-${pageData.name.replace(/\s+/g, '-')}.png`,
        fullPage: false
      });

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({ page: pageData.name, status: 'Error', error: error.message });
    }
  }

  // Summary
  console.log('\n\n========================================');
  console.log('MYPAGE功能测试结果 / マイページ機能テスト結果');
  console.log('========================================');
  results.forEach(r => {
    const icon = r.status === 'OK' ? '✅' : r.status === 'Auth Required' ? '🔐' : '❌';
    console.log(`${icon} ${r.page}: ${r.status}`);
  });

  const ok = results.filter(r => r.status === 'OK').length;
  const auth = results.filter(r => r.status === 'Auth Required').length;
  const error = results.filter(r => r.status !== 'OK' && r.status !== 'Auth Required').length;

  console.log(`\n✅ 正常動作: ${ok}個`);
  console.log(`🔐 認証必要: ${auth}個`);
  console.log(`❌ エラー: ${error}個`);

  await page.waitForTimeout(5000);
  await browser.close();
})();
