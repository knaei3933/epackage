import { test, expect } from '@playwright/test';

test('PDF generation test', async ({ page, context }) => {
  // Serve the test HTML file
  const htmlPath = 'C:\\Users\\kanei\\claudecode\\02.Homepage_Dev\\02.epac_homepagever1.1\\test-pdf-full.html';
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Click the PDF generation button
  await page.click('button');

  // Wait for PDF generation
  await page.waitForTimeout(5000);

  // Take screenshot of the result
  await page.screenshot({ path: 'pdf-test-result.png', fullPage: true });

  console.log('Screenshot saved to pdf-test-result.png');
});
