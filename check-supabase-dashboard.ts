import { chromium } from 'playwright';

async function checkSupabaseDashboard() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to Supabase Dashboard...');
    await page.goto('https://supabase.com/dashboard/project/ijlgpzjdfipzmjvawofp', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for page to stabilize
    await page.waitForTimeout(5000);

    const title = await page.title();
    const url = page.url();

    console.log('Page Title:', title);
    console.log('Current URL:', url);

    // Take screenshot
    await page.screenshot({
      path: 'supabase-dashboard-status.png',
      fullPage: true
    });

    // Check current status
    if (url.includes('/project/ijlgpzjdfipzmjvawofp')) {
      console.log('✅ Successfully accessed the project page!');

      // Check for paused status indicators
      const pageContent = await page.content();
      if (pageContent.includes('paused') ||
          pageContent.includes('restore') ||
          pageContent.includes('resume')) {
        console.log('⚠️ Project may be paused - check dashboard for resume option');
      }

      // Check for common project status elements
      const statusElements = await page.$$('[class*="status"], [class*="pause"], [class*="resume"]');
      if (statusElements.length > 0) {
        console.log(`Found ${statusElements.length} potential status elements`);
      }

    } else if (url.includes('sign-in') || url.includes('login')) {
      console.log('🔐 Login required - waiting for auto-redirect with existing session...');
      // Wait for potential auto-redirect if session exists
      await page.waitForTimeout(5000);
      const finalUrl = page.url();
      console.log('Final URL after wait:', finalUrl);

      if (finalUrl.includes('/project/ijlgpzjdfipzmjvawofp')) {
        console.log('✅ Successfully accessed after authentication!');
      }
    }

    console.log('Screenshot saved to: supabase-dashboard-status.png');
    console.log('Please check the screenshot for visual confirmation.');

    // Keep browser open for manual inspection
    console.log('Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkSupabaseDashboard();
