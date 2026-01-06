import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function extractBrixaFlowContent(): Promise<void> {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Navigating to Brixa flow page...');
  await page.goto('https://brixa.jp/flow', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Wait for page to be fully loaded
  console.log('Waiting for page to load...');
  await page.waitForTimeout(5000);

  console.log('\n=== Extracting Content ===\n');

  // Extract all visible text from the page
  const mainContent = await page.evaluate(() => {
    const results: any = {
      title: '',
      steps: [] as any[],
      faqs: [] as any[]
    };

    // Get page title
    const titleElem = document.querySelector('h1');
    if (titleElem) {
      results.title = titleElem.textContent?.trim() || '';
    }

    // Try to find flow steps
    // Method 1: Look for elements with data attributes or specific classes
    const stepSelectors = [
      '[class*="flow"] [class*="step"]',
      '[class*="process"] [class*="step"]',
      '[data-step]',
      '[class*="Flow"]'
    ];

    for (const selector of stepSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach((el, index) => {
          const stepText = el.textContent?.trim() || '';
          if (stepText.length > 0) {
            results.steps.push({
              index: index + 1,
              content: stepText
            });
          }
        });
        if (results.steps.length > 0) break;
      }
    }

    // Method 2: Look for numbered sections (01, 02, 03, 04)
    if (results.steps.length === 0) {
      const allElements = document.querySelectorAll('*');
      const stepPattern = /^(0[1-4]|[1-4])\s*[.：:]\s*/;

      allElements.forEach(el => {
        const text = el.textContent?.trim() || '';
        if (stepPattern.test(text) && text.length < 500 && text.length > 10) {
          // Check if this element is directly visible (not inside another)
          const parent = el.parentElement;
          if (parent && !parent.textContent?.includes(el.textContent || '')) {
            results.steps.push({
              index: results.steps.length + 1,
              content: text
            });
          }
        }
      });
    }

    // Method 3: Look for FAQ items
    const faqSelectors = [
      '[class*="faq"]',
      '[class*="FAQ"]',
      'details',
      '[role="button"][aria-expanded]'
    ];

    for (const selector of faqSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const question = el.querySelector('summary, [class*="question"]')?.textContent?.trim() ||
                        el.textContent?.split('\n')[0]?.trim() || '';
        const answer = el.querySelector('[class*="answer"], [class*="content"]')?.textContent?.trim() ||
                       el.textContent?.replace(question, '').trim() || '';

        if (question.length > 0 && answer.length > 0) {
          results.faqs.push({
            question,
            answer
          });
        }
      });

      if (results.faqs.length > 0) break;
    }

    return results;
  });

  console.log('Captured data:', JSON.stringify(mainContent, null, 2));

  // Close browser
  await browser.close();

  // Format and save output
  const output = formatOutput(mainContent);
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
  if (data.title) {
    output += `## ${data.title}\n\n`;
  }

  // Steps
  output += '## 4단계 이용 절차 (4-Step Process)\n';
  output += '-'.repeat(80) + '\n\n';

  if (data.steps && data.steps.length > 0) {
    data.steps.forEach((step: any) => {
      output += `### Step ${step.index}\n`;
      output += `${step.content}\n\n`;
    });
  } else {
    output += '(No steps were captured - see raw content below)\n\n';
  }

  // FAQs
  output += '\n## FAQ (자주 묻는 질문)\n';
  output += '-'.repeat(80) + '\n\n';

  if (data.faqs && data.faqs.length > 0) {
    data.faqs.forEach((faq: any, index: number) => {
      output += `### Q${index + 1}: ${faq.question}\n`;
      output += `${faq.answer}\n\n`;
    });
  } else {
    output += '(No FAQs were captured)\n\n';
  }

  return output;
}

// Run the extraction
extractBrixaFlowContent().catch(console.error);
