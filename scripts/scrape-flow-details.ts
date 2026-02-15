const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  console.log('Navigating to Brixa flow page...');
  await page.goto('https://brixa.jp/flow', { waitUntil: 'networkidle', timeout: 60000 });

  console.log('Waiting for page to load...');
  await page.waitForTimeout(10000);

  // Get initial page content
  const initialText = await page.evaluate(() => document.body.innerText);
  console.log('Initial page text length:', initialText.length);

  // Try to find and click on interactive elements
  console.log('Looking for interactive elements...');

  // Look for buttons, links, or clickable items
  const clickables = await page.locator('button, a, [role="button"], div[class*="flow"], div[class*="step"]').all();
  console.log(`Found ${clickables.length} clickable elements`);

  for (let i = 0; i < Math.min(clickables.length, 20); i++) {
    try {
      const element = clickables[i];
      const isVisible = await element.isVisible();
      if (isVisible) {
        const text = await element.textContent();
        console.log(`Clickable ${i}: "${text?.substring(0, 50)}..."`);

        // Click and wait
        await element.click();
        await page.waitForTimeout(2000);

        // Get any new content that appeared
        const newText = await page.evaluate(() => document.body.innerText);
        if (newText !== initialText) {
          console.log('Content changed after click!');
        }

        // Go back if possible
        if (page.url() !== 'https://brixa.jp/flow') {
          await page.goBack();
          await page.waitForTimeout(2000);
        }
      }
    } catch (e) {
      console.log(`Error with clickable ${i}: ${e.message}`);
    }
  }

  // Click FAQ items
  console.log('Clicking FAQ items...');
  const faqSelectors = [
    'text=納期はどれくらい',
    'text=袋の素材',
    'text=印刷の色数',
    'text=片面印刷',
    'text=金や銀色',
    'text=対応不可',
    'text=どう封入',
    'text=最低でも',
    'text=印刷なし',
    'text=サイズの制限',
    'text=印刷範囲',
    'text=最小ロット',
    'text=袋に元々',
  ];

  for (const selector of faqSelectors) {
    try {
      await page.waitForTimeout(500);
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        console.log(`Clicked FAQ: ${selector}`);
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Ignore
    }
  }

  // Get final page content
  await page.waitForTimeout(3000);
  const finalText = await page.evaluate(() => document.body.innerText);
  console.log('Final page text length:', finalText.length);

  // Save all content
  fs.writeFileSync('brixa-flow-complete.txt', finalText, 'utf-8');

  console.log('Saved to brixa-flow-complete.txt');

  await browser.close();
})();
