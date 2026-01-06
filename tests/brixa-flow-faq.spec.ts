import { test, expect } from '@playwright/test';

test('scrape Brixa FAQ content', async ({ page }) => {
  await page.goto('https://brixa.jp/flow');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Find all FAQ items
  const faqItems = await page.locator('text=/納期|袋の素材|印刷の色数|片面印刷|金や銀色|対応不可|封入|無地|サイズ/').all();

  console.log(`Found ${faqItems.length} FAQ items`);

  const results: string[] = [];

  for (let i = 0; i < faqItems.length; i++) {
    const item = faqItems[i];

    // Click the item to reveal answer
    try {
      await item.click();
      await page.waitForTimeout(500);

      // Get the full text content after click
      const text = await item.evaluate(el => el.textContent || '');
      results.push(text);

      console.log(`\n--- FAQ ${i + 1} ---`);
      console.log(text);
    } catch (e) {
      console.log(`Error at item ${i}:`, e);
    }
  }

  // Save results to console for manual review
  console.log('\n=== ALL FAQ CONTENT ===');
  console.log(results.join('\n\n'));
});
