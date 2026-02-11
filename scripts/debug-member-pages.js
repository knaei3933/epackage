// Debug script to capture page snapshots for member/samples and member/inquiries pages
const { chromium } = require('playwright');

async function debugPages() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3006/member/samples', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/debug-samples-page.png', fullPage: true });

  // Get page HTML
  const samplesHtml = await page.content();
  console.log('=== SAMPLES PAGE SNAPSHOT ===');
  console.log(samplesHtml.substring(0, 5000));

  // Navigate to inquiries
  await page.goto('http://localhost:3006/member/inquiries', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/debug-inquiries-page.png', fullPage: true });

  const inquiriesHtml = await page.content();
  console.log('=== INQUIRIES PAGE SNAPSHOT ===');
  console.log(inquiriesHtml.substring(0, 5000));

  await browser.close();
}

debugPages().catch(console.error);
