const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Set longer timeout
  page.setDefaultTimeout(60000);

  await page.goto('https://brixa.jp/flow', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Wait for content to appear
  await page.waitForTimeout(5000);

  // Try to find and click FAQ items using various selectors
  const faqQuestions = [
    '納期はどれくらいですか',
    '袋の素材はどのようなものがありますか',
    '印刷の色数によって価格が変わりますか',
    '片面印刷と両面印刷とは価格が変わりますか',
    '金や銀色を印刷したいのですが可能でしょうか',
    '対応不可な袋はありますか',
    'どう封入しますか',
    '最低でもいくらがかかりますか',
    '印刷なし（無地）の袋は依頼できますか',
    'サイズの制限はありますか',
    '印刷範囲の制限はありますか',
    '最小ロットは何枚からですか',
    '袋に元々色が付いていますか'
  ];

  const results = [];

  // Find all clickable FAQ elements
  const faqElements = await page.locator('text=納期はどれくらい').all();
  console.log(`Found ${faqElements.length} FAQ elements for first question`);

  // Try clicking various elements
  const clickSelectors = [
    'FAQ h3, .faq-item, .question, [class*="question"], [class*="faq"]',
    'details > summary',
    '.accordion-item',
  ];

  for (const sel of clickSelectors) {
    try {
      const elements = await page.locator(sel).all();
      console.log(`Found ${elements.length} elements for selector: ${sel}`);

      if (elements.length > 0) {
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
          try {
            await elements[i].click();
            await page.waitForTimeout(500);
            const text = await elements[i].textContent();
            console.log(`Clicked element ${i}:`, text?.substring(0, 100));
          } catch (e) {
            // Ignore
          }
        }
      }
    } catch (e) {
      console.log(`Error with selector ${sel}:`, e.message);
    }
  }

  // Get all visible text after interactions
  await page.waitForTimeout(2000);
  const allText = await page.textContent('body');

  console.log('\n=== PAGE CONTENT (first 5000 chars) ===');
  console.log(allText?.substring(0, 5000));

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('brixa-scraped-content.txt', allText || '');

  await browser.close();
})();
