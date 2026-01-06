const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Check Next.js dev mode indicator
  await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });

  const hasDevIndicator = await page.evaluate(() => {
    // Check for Next.js dev toolbar
    return document.querySelector('[data-nextjs-dev-toolbar]') !== null ||
           document.body.innerText.includes('Ready in');
  });

  console.log('Dev Mode:', hasDevIndicator ? 'Yes' : 'No (probably production)');

  // Try accessing the problematic pages directly
  const testPages = [
    'http://localhost:3005/member/edit',
    'http://localhost:3005/member/orders/new',
    'http://localhost:3005/member/orders/history'
  ];

  for (const url of testPages) {
    console.log('\n--- Testing:', url, '---');
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log('Status:', response.status());
      console.log('Final URL:', page.url());

      const is404 = await page.evaluate(() => {
        return document.body.innerText.includes('404') ||
               document.title.includes('404');
      });
      console.log('Is 404:', is404);

      // Check page content
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
      console.log('Content preview:', bodyText.substring(0, 100));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }

  await browser.close();
})();
