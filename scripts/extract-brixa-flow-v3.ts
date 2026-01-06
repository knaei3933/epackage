import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function extractBrixaFlowContent(): Promise<void> {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Navigating to Brixa flow page...');
  await page.goto('https://brixa.jp/flow', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait for page to be fully loaded
  console.log('Waiting for page to load...');
  await page.waitForTimeout(8000);

  console.log('\n=== Extracting Content ===\n');

  // Extract JSON data embedded in the page
  const embeddedData = await page.evaluate(() => {
    // Get all script tags
    const scripts = Array.from(document.querySelectorAll('script'));
    const data: any = {
      steps: [],
      faqs: []
    };

    // Look for self.__next_f.push which contains the data
    for (const script of scripts) {
      const text = script.textContent || '';
      // Try to find JSON data in the script
      const matches = text.match(/"expandedContent":"([^"]+)"/g);

      if (matches) {
        matches.forEach(match => {
          const content = match.replace(/"expandedContent":"/, '').replace(/"$/, '');
          // Decode unicode escapes
          const decoded = content.replace(/\\u([0-9a-f]{4})/gi, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          ).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

          if (decoded.length > 10) {
            data.steps.push(decoded);
          }
        });
      }
    }

    return data;
  });

  console.log('Found embedded steps:', embeddedData.steps.length);

  // Now manually click through each step to get full content
  const manualData: any = {
    title: '利用手順',
    steps: [] as any[],
    faqs: [] as any[]
  };

  // Try to find and click step elements
  for (let i = 1; i <= 4; i++) {
    console.log(`\nProcessing step ${i}...`);

    try {
      // Try multiple selectors
      const selectors = [
        `text=0${i}`,
        `[class*="step"][data-index="${i-1}"]`,
        `[class*="Step"]:nth-of-type(${i})`
      ];

      let found = false;
      for (const selector of selectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            await element.click();
            await page.waitForTimeout(2000);

            // Extract visible content
            const content = await page.evaluate((idx) => {
              // Get all text content from the page
              const body = document.body.textContent || '';
              return body;
            }, i);

            manualData.steps.push({
              step: i,
              content: content.substring(0, 2000) // Limit length
            });

            found = true;
            console.log(`✓ Captured step ${i}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!found) {
        console.log(`✗ Step ${i} not found`);
      }
    } catch (error) {
      console.log(`✗ Error processing step ${i}:`, error);
    }
  }

  // Now try to click FAQ items
  console.log('\nProcessing FAQs...');

  try {
    // Look for FAQ elements and click them
    const faqElements = await page.locator('[class*="faq"], details, [role="button"]').all();
    console.log(`Found ${faqElements.length} potential FAQ elements`);

    for (let i = 0; i < Math.min(faqElements.length, 20); i++) {
      try {
        await faqElements[i].scrollIntoViewIfNeeded();
        await faqElements[i].click();
        await page.waitForTimeout(1000);

        const text = await faqElements[i].textContent();
        if (text && text.length > 10) {
          manualData.faqs.push({
            index: i + 1,
            content: text.trim()
          });
        }
      } catch (e) {
        // Continue
      }
    }

    console.log(`✓ Captured ${manualData.faqs.length} FAQ items`);
  } catch (error) {
    console.log('✗ Error processing FAQs:', error);
  }

  // Close browser
  await browser.close();

  // Combine data
  const finalData = {
    title: manualData.title,
    embeddedSteps: embeddedData.steps,
    manualSteps: manualData.steps,
    faqs: manualData.faqs
  };

  // Format and save output
  const output = formatOutput(finalData);
  const outputPath = path.join(process.cwd(), 'brixa-flow-complete.txt');

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`\n✓ Content saved to: ${outputPath}`);
}

function formatOutput(data: any): string {
  let output = '='.repeat(80) + '\n';
  output += 'BRIXA FLOW PAGE - COMPLETE CONTENT\n';
  output += 'URL: https://brixa.jp/flow\n';
  output += 'Date: ' + new Date().toLocaleString('ja-JP') + '\n';
  output += '='.repeat(80) + '\n\n';

  // Title
  output += `## ${data.title}\n\n`;

  // Embedded Steps
  output += '## 4단계 이용 절차 (4-Step Process)\n';
  output += '-'.repeat(80) + '\n\n';

  if (data.embeddedSteps && data.embeddedSteps.length > 0) {
    data.embeddedSteps.forEach((step: string, index: number) => {
      output += `### Step 0${index + 1}\n`;
      output += `${step}\n\n`;
    });
  } else {
    output += '(No embedded steps found)\n\n';
  }

  // Manual Steps
  if (data.manualSteps && data.manualSteps.length > 0) {
    output += '\n## Manually Clicked Steps\n';
    output += '-'.repeat(80) + '\n\n';
    data.manualSteps.forEach((step: any) => {
      output += `### Step ${step.step}\n`;
      output += `${step.content}\n\n`;
    });
  }

  // FAQs
  output += '\n## FAQ (자주 묻는 질문)\n';
  output += '-'.repeat(80) + '\n\n';

  if (data.faqs && data.faqs.length > 0) {
    data.faqs.forEach((faq: any) => {
      output += `### Q${faq.index}\n`;
      output += `${faq.content}\n\n`;
    });
  } else {
    output += '(No FAQs were captured)\n\n';
  }

  return output;
}

// Run the extraction
extractBrixaFlowContent().catch(console.error);
