const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Multi-Quantity Quotation Test ===');

  try {
    // Navigate to quote simulator
    console.log('1. Navigating to quote simulator...');
    await page.goto('http://localhost:3000/quote-simulator/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select bag type
    console.log('2. Selecting bag type...');
    await page.selectOption('select[name="bagTypeId"]', 'stand_pouch');
    await page.waitForTimeout(500);

    // Select material
    console.log('3. Selecting material...');
    await page.selectOption('select[name="materialId"]', 'pet_al');
    await page.waitForTimeout(500);

    // Set dimensions
    console.log('4. Setting dimensions...');
    await page.fill('input[name="width"]', '200');
    await page.fill('input[name="height"]', '300');
    await page.waitForTimeout(500);

    // Scroll to quantity section
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // Add multiple quantities
    console.log('5. Adding multiple quantities...');

    // Find the quantity input and add quantities
    const quantities = ['1000', '2000', '5000'];

    for (const qty of quantities) {
      console.log(`   Adding quantity: ${qty}`);

      // Click "Add Quantity" button if it exists
      const addButton = await page.$('button:has-text("追加"), button:has-text("Add")');
      if (addButton) {
        await addButton.click();
        await page.waitForTimeout(500);
      }

      // Find quantity input and set value
      const qtyInputs = await page.$$('input[type="number"]');
      if (qtyInputs.length > 0) {
        // Try to find an empty or existing quantity input
        let inputSet = false;
        for (const input of qtyInputs) {
          const value = await input.inputValue();
          if (!value || value === '') {
            await input.fill(qty);
            inputSet = true;
            await page.waitForTimeout(300);
            break;
          }
        }

        // If all inputs have values, try to add to the last one
        if (!inputSet && qtyInputs.length > 0) {
          await qtyInputs[qtyInputs.length - 1].fill(qty);
          await page.waitForTimeout(300);
        }
      }

      await page.waitForTimeout(500);
    }

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Click Calculate button
    console.log('6. Clicking Calculate button...');
    const calcButton = await page.$('button:has-text("計算"), button:has-text("Calculate")');
    if (calcButton) {
      await calcButton.click();
      await page.waitForTimeout(3000);
    }

    // Take screenshot
    console.log('7. Taking screenshot...');
    await page.screenshot({ path: 'test-quotations-multi-qty.png' });
    console.log('   Screenshot saved to test-quotations-multi-qty.png');

    // Scroll to download button
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Click PDF download button
    console.log('8. Clicking PDF Download button...');
    const downloadButton = await page.$('button:has-text("PDFダウンロード"), button:has-text("Download PDF")');
    if (downloadButton) {
      await downloadButton.click();
      console.log('   PDF Download clicked!');
      await page.waitForTimeout(5000);

      // Check for download
      const downloads = await page.context().downloads();
      console.log(`   Downloads: ${downloads.length} files`);
      for (const download of downloads) {
        console.log(`   - ${download.suggestedFilename()}`);
      }
    } else {
      console.log('   PDF Download button not found!');
    }

    // Wait to see results
    console.log('9. Waiting 5 seconds to see results...');
    await page.waitForTimeout(5000);

    // Final screenshot
    await page.screenshot({ path: 'test-quotations-final.png' });
    console.log('   Final screenshot saved to test-quotations-final.png');

    console.log('\n=== Test Complete ===');
    console.log('Please check:');
    console.log('1. The screenshots to verify multi-quantity display');
    console.log('2. /member/quotations/ page to see saved quotations');
    console.log('3. Database should have multiple items per quotation');

  } catch (error) {
    console.error('Test error:', error);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
})();
