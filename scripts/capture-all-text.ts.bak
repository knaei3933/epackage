const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://brixa.jp/flow');

  // Wait for page to fully load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  // Try to click all FAQ items to reveal content
  console.log('Attempting to click FAQ elements...');

  // Try multiple selectors for FAQ items
  const selectors = [
    'text=納期はどれくらいですか',
    'text=袋の素材はどのようなものがありますか',
    'text=印刷の色数によって価格が変わりますか',
    'text=片面印刷と両面印刷とは価格が変わりますか',
    'text=金や銀色を印刷したいのですが可能でしょうか',
    'text=対応不可な袋はありますか',
    'text=どう封入しますか',
    'text=最低でもいくらがかかりますか',
    'text=印刷なし（無地）の袋は依頼できますか',
    'text=サイズの制限はありますか',
    'text=印刷範囲の制限はありますか',
    'text=最小ロットは何枚からですか',
    'text=袋に元々色が付いていますか',
  ];

  for (const selector of selectors) {
    try {
      await page.waitForTimeout(500);
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        console.log(`Clicked: ${selector}`);
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log(`Could not click: ${selector}`);
    }
  }

  await page.waitForTimeout(2000);

  // Get all visible text
  const allText = await page.evaluate(() => {
    return document.body.innerText;
  });

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('brixa-full-text.txt', allText, 'utf-8');

  console.log('Saved to brixa-full-text.txt');

  await browser.close();
})();
