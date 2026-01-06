const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const pages = [
    { url: '/member/dashboard', name: 'Dashboard' },
    { url: '/member/profile', name: 'Profile' },
    { url: '/member/edit', name: 'Profile Edit' },
    { url: '/member/orders/new', name: 'New Orders' },
    { url: '/member/orders/history', name: 'Order History' },
    { url: '/member/deliveries', name: 'Deliveries' },
    { url: '/member/invoices', name: 'Invoices' },
    { url: '/member/quotations', name: 'Quotations' },
    { url: '/member/samples', name: 'Samples' },
    { url: '/member/inquiries', name: 'Inquiries' },
  ];

  const results = [];

  for (const pageData of pages) {
    console.log(`\n=== ${pageData.name} ===`);
    console.log(`URL: http://localhost:3005${pageData.url}`);

    try {
      // Wait longer for page load
      const response = await page.goto(`http://localhost:3005${pageData.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const status = response.status();
      const finalUrl = page.url();
      const title = await page.title();

      console.log(`Status: ${status}`);
      console.log(`Final URL: ${finalUrl}`);
      console.log(`Title: ${title}`);

      // Check for authentication redirect
      if (finalUrl.includes('/auth/signin') || finalUrl.includes('/auth/register')) {
        console.log('→ Requires Authentication');
        results.push({ page: pageData.name, status: 'Auth Required' });
      }
      // Check for 404
      else if (title.includes('404') || await page.locator('text=404').count() > 0) {
        console.log('→ 404 Not Found');
        results.push({ page: pageData.name, status: '404' });
      }
      else {
        // Get page content
        const content = await page.evaluate(() => {
          const body = document.body.innerText || '';
          return body.substring(0, 300);
        });

        console.log(`Content Preview: ${content.substring(0, 150)}...`);

        // Check if content is loading or has actual content
        const isLoading = content.includes('読み込み中') ||
                         content.includes('Loading') ||
                         content.includes('読み込み') ||
                         content.length < 200;

        if (isLoading && status === 200) {
          console.log('→ Loading (infinite loading or client-side issue)');
          results.push({ page: pageData.name, status: 'Loading Issue' });
        } else if (content.length > 200) {
          console.log('→ OK');
          results.push({ page: pageData.name, status: 'OK' });
        } else {
          console.log('→ Empty/Loading');
          results.push({ page: pageData.name, status: 'Empty/Loading' });
        }
      }

      // Take screenshot
      await page.screenshot({
        path: `mypage-${pageData.name.toLowerCase().replace(/\s+/g, '-')}-detail.png`,
        fullPage: true
      });

    } catch (error) {
      console.log(`→ Error: ${error.message}`);
      results.push({ page: pageData.name, status: 'Error', error: error.message });
    }
  }

  // Summary
  console.log('\n\n========================================');
  console.log('MYPAGE TEST RESULTS');
  console.log('========================================');
  results.forEach(r => {
    let icon = '❌';
    if (r.status === 'OK') icon = '✅';
    else if (r.status === 'Auth Required') icon = '🔐';
    else if (r.status === 'Loading Issue') icon = '⏳';
    else if (r.status === 'Empty/Loading') icon = '⚠️';

    console.log(`${icon} ${r.page}: ${r.status}`);
  });

  const ok = results.filter(r => r.status === 'OK').length;
  const auth = results.filter(r => r.status === 'Auth Required').length;
  const loading = results.filter(r => r.status === 'Loading Issue' || r.status === 'Empty/Loading').length;
  const errors = results.filter(r => r.status === '404' || r.status === 'Error').length;

  console.log(`\n✅ OK: ${ok}`);
  console.log(`🔐 Auth Required: ${auth}`);
  console.log(`⏳ Loading Issues: ${loading}`);
  console.log(`❌ Errors: ${errors}`);

  await page.waitForTimeout(3000);
  await browser.close();
})();
