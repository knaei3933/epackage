import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3002/quote-simulator', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Select material first (PET AL)
    const petAlButton = page.locator('button').filter({ hasText: 'PET AL' }).first();
    if (await petAlButton.count() > 0) {
      await petAlButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check thickness dropdown
    const thicknessSelect = page.locator('select').filter({ hasText: /選択してください/ }).first();
    const options = await thicknessSelect.locator('option').all();
    
    console.log('Thickness options found:', options.length);
    
    for (let i = 0; i < Math.min(options.length, 5); i++) {
      const text = await options[i].textContent();
      console.log(`Option ${i}: "${text}"`);
    }
    
    await page.screenshot({ path: 'C:/tmp/ui-dropdown-spec.png', fullPage: true });
    console.log('Screenshot saved');
    
  } finally {
    await browser.close();
  }
})();
