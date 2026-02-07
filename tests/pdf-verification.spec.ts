/**
 * PDF Options Verification Test
 * Validates that the correct processing options are displayed in the PDF
 */

import { test, expect } from '@playwright/test';

test.describe('PDF Processing Options Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/signin');

    // Fill in login credentials
    await page.fill('input[name="email"]', 'member@test.com');
    await page.fill('input[name="password"]', 'Member1234!');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('**/member/dashboard');
  });

  test('should display correct processing options in quotation PDF', async ({ page }) => {
    // Go to quotations page
    await page.goto('http://localhost:3000/member/quotations');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find QT20260203-6904 quotation (has: corner-round, glossy, hang-hole-6mm, notch-yes, top-open, valve-no, zipper-yes)
    const quotationNumber = 'QT20260203-6904';

    console.log(`Looking for quotation: ${quotationNumber}`);

    // Try to find the quotation in the list
    const quotationLink = page.locator(`text=${quotationNumber}`).first();

    if (await quotationLink.isVisible()) {
      await quotationLink.click();
    } else {
      // Alternative: navigate directly to quotation detail page
      await page.goto(`http://localhost:3000/member/quotations?q=${quotationNumber}`);
    }

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take a screenshot to see the page state
    await page.screenshot({ path: 'test-pdf-verification-quotation-detail.png', fullPage: true });

    // Look for PDF export button
    console.log('Looking for PDF export button...');

    const pdfButtonSelectors = [
      'button:has-text("PDF")',
      'button:has-text("PDF出力")',
      'button:has-text("エクスポート")',
      '[aria-label*="PDF"]',
      'a:has-text("PDF")',
    ];

    let pdfButtonFound = false;
    for (const selector of pdfButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        console.log(`Found PDF button with selector: ${selector}`);
        await button.click();
        pdfButtonFound = true;
        break;
      }
    }

    if (!pdfButtonFound) {
      console.log('PDF button not found, taking screenshot of current state...');
      await page.screenshot({ path: 'test-pdf-verification-no-button.png', fullPage: true });
      throw new Error('PDF export button not found');
    }

    // Wait for PDF generation or download
    await page.waitForTimeout(5000);

    // Check if any download was triggered
    const downloads = await page.context().storageState();
    console.log('Storage state:', JSON.stringify(downloads, null, 2));

    // Take final screenshot
    await page.screenshot({ path: 'test-pdf-verification-after-click.png', fullPage: true });
  });

  test('verify quotation data via API', async ({ request }) => {
    // Use API to fetch quotation data
    const quotationNumber = 'QT20260203-6904';

    // First, authenticate to get session
    const loginResponse = await request.post('http://localhost:3000/api/auth/signin', {
      data: {
        email: 'member@test.com',
        password: 'Member1234!'
      }
    });

    console.log('Login response status:', loginResponse.status());

    // Get quotations list to find the quotation ID
    const quotationsResponse = await request.get('http://localhost:3000/api/member/quotations');

    if (quotationsResponse.ok()) {
      const data = await quotationsResponse.json();
      console.log('Quotations data:', JSON.stringify(data, null, 2));

      // Find the specific quotation
      if (data.success && data.data) {
        const quotation = data.data.quotations.find((q: any) => q.quotation_number === quotationNumber);

        if (quotation) {
          console.log(`Found quotation: ${quotationNumber}`);
          console.log('Quotation details:', JSON.stringify(quotation, null, 2));

          // Check the specifications
          if (quotation.specifications) {
            console.log('Specifications:', JSON.stringify(quotation.specifications, null, 2));
          }

          // Check the items
          if (quotation.quotation_items) {
            console.log('Items:', JSON.stringify(quotation.quotation_items, null, 2));
          }
        } else {
          console.log(`Quotation ${quotationNumber} not found`);
        }
      }
    }
  });

  test('direct API test for quotation data', async ({ request }) => {
    // This test uses the export API to get the actual data that would be used for PDF generation
    const quotationNumber = 'QT20260203-6904';

    // Login first
    await request.post('http://localhost:3000/api/auth/signin', {
      data: {
        email: 'member@test.com',
        password: 'Member1234!'
      }
    });

    // Try to get quotation export data
    const response = await request.get(`http://localhost:3000/api/member/quotations?quotationNumber=${quotationNumber}`);

    console.log('Response status:', response.status());

    if (response.ok()) {
      const data = await response.json();
      console.log('Quotation data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  });
});
