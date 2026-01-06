import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface FlowStep {
  stepNumber: string;
  title: string;
  content: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}

interface BrixaFlowData {
  steps: FlowStep[];
  faqs: FAQItem[];
}

async function extractBrixaFlowContent(): Promise<void> {
  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down actions for better visibility
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page: Page = await context.newPage();

  console.log('Navigating to Brixa flow page...');
  await page.goto('https://brixa.jp/flow', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Wait for page to load
  await page.waitForTimeout(5000);

  const flowData: BrixaFlowData = {
    steps: [],
    faqs: []
  };

  // Extract the 4 steps
  console.log('\n=== Extracting 4 Steps ===\n');

  for (let stepNum = 1; stepNum <= 4; stepNum++) {
    const stepSelector = `text=/0${stepNum}\\./`;
    console.log(`Looking for step ${stepNum}...`);

    try {
      // Find and click the step
      const stepElement = await page.locator(stepSelector).first();
      await stepElement.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Check if it's clickable (might be an accordion or tab)
      const isClickable = await stepElement.isEnabled();

      if (isClickable) {
        await stepElement.click();
        await page.waitForTimeout(1500); // Wait for content to appear
      }

      // Extract content
      const stepTitle = await stepElement.textContent() || '';

      // Look for content near this step
      const contentSelectors = [
        `xpath=//ancestor::*[contains(text(), '0${stepNum}.')]//following-sibling::*`,
        `xpath=//ancestor::*[contains(text(), '0${stepNum}.')]//parent::*/*`,
        `xpath=//*[contains(text(), '0${stepNum}.')]/..`
      ];

      const stepContent: string[] = [];

      // Try multiple approaches to find related content
      for (const selector of contentSelectors) {
        try {
          const contentElements = await page.locator(selector).all();
          for (const elem of contentElements) {
            const text = await elem.textContent({ timeout: 1000 });
            if (text && text.trim().length > 0 && !text.includes(`0${stepNum}`)) {
              stepContent.push(text.trim());
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      flowData.steps.push({
        stepNumber: `0${stepNum}`,
        title: stepTitle.trim(),
        content: stepContent.filter(c => c.length > 0)
      });

      console.log(`✓ Captured step ${stepNum}: ${stepTitle.trim()}`);

    } catch (error) {
      console.log(`✗ Error capturing step ${stepNum}:`, error);
    }
  }

  // Extract FAQs
  console.log('\n=== Extracting FAQs ===\n');

  try {
    // Look for FAQ sections
    const faqSelectors = [
      '.faq-item',
      '.faq',
      '[class*="faq"]',
      '[class*="question"]',
      'details',
      '.accordion-item'
    ];

    const faqItems: FAQItem[] = [];

    for (const selector of faqSelectors) {
      try {
        const faqElements = await page.locator(selector).all();
        console.log(`Found ${faqElements.length} FAQ elements with selector: ${selector}`);

        for (const elem of faqElements) {
          try {
            // Try to click to expand if it's an accordion
            await elem.click().catch(() => {});
            await page.waitForTimeout(500);

            // Extract question and answer
            const question = await elem.locator('summary, .question, [class*="question"]').first().textContent().catch(() => '');
            const answer = await elem.locator('.answer, .content, [class*="answer"], [class*="content"]').first().textContent().catch(() => '');

            if (question || answer) {
              faqItems.push({
                question: question?.trim() || 'Question not found',
                answer: answer?.trim() || 'Answer not found'
              });
            }
          } catch (e) {
            // Skip this FAQ item if there's an error
          }
        }

        if (faqItems.length > 0) {
          flowData.faqs = faqItems;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    console.log(`✓ Captured ${flowData.faqs.length} FAQ items`);

  } catch (error) {
    console.log('✗ Error capturing FAQs:', error);
  }

  // Also capture all visible text as fallback
  console.log('\n=== Capturing All Page Text ===\n');
  const allText = await page.textContent('body');
  console.log('Total page text length:', allText?.length || 0);

  await browser.close();

  // Save to file
  const outputPath = path.join(process.cwd(), 'brixa-flow-complete.txt');
  const outputContent = formatOutput(flowData, allText || '');

  fs.writeFileSync(outputPath, outputContent, 'utf-8');
  console.log(`\n✓ Content saved to: ${outputPath}`);
}

function formatOutput(data: BrixaFlowData, allText: string): string {
  let output = '='.repeat(80) + '\n';
  output += 'BRIXA FLOW PAGE - COMPLETE CONTENT\n';
  output += 'URL: https://brixa.jp/flow\n';
  output += 'Date: ' + new Date().toLocaleString('ja-JP') + '\n';
  output += '='.repeat(80) + '\n\n';

  // Format Steps
  output += '## 4단계 이용 절차 (4-Step Process)\n';
  output += '-'.repeat(80) + '\n\n';

  if (data.steps.length > 0) {
    data.steps.forEach((step) => {
      output += `### ${step.stepNumber}. ${step.title}\n`;
      output += '-'.repeat(40) + '\n';
      if (step.content.length > 0) {
        step.content.forEach(content => {
          output += `${content}\n\n`;
        });
      } else {
        output += '(No content captured)\n\n';
      }
    });
  } else {
    output += '(No steps were captured)\n\n';
  }

  // Format FAQs
  output += '\n## FAQ (자주 묻는 질문)\n';
  output += '-'.repeat(80) + '\n\n';

  if (data.faqs.length > 0) {
    data.faqs.forEach((faq, index) => {
      output += `### Q${index + 1}: ${faq.question}\n`;
      output += `${faq.answer}\n\n`;
    });
  } else {
    output += '(No FAQs were captured)\n\n';
  }

  // Add full page text as reference
  output += '\n## Full Page Text (Reference)\n';
  output += '-'.repeat(80) + '\n';
  output += allText;

  return output;
}

// Run the extraction
extractBrixaFlowContent().catch(console.error);
