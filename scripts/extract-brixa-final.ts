import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function extractBrixaFlowContent(): Promise<void> {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('Navigating to Brixa flow page...');
  await page.goto('https://brixa.jp/flow', {
    timeout: 60000
  });

  // Wait for page to be fully loaded
  console.log('Waiting for page to fully load (15 seconds)...');
  await page.waitForTimeout(15000);

  const allContent: any = {
    title: '',
    steps: [] as any[],
    faqs: [] as any[]
  };

  // Get page title
  allContent.title = await page.locator('h1').first().textContent() || '';

  console.log('\n=== Extracting 4 Steps ===\n');

  // Extract the 4 steps - try clicking on them
  const stepNumbers = ['01', '02', '03', '04'];
  const stepTitles = [
    '見積書を発行する',
    'パッケージを発注する',
    '校了とご契約・ご入金',
    '納品'
  ];

  for (let i = 0; i < 4; i++) {
    console.log(`\n--- Processing Step ${i + 1}: ${stepTitles[i]} ---`);

    try {
      // Look for the step element
      const stepNum = stepNumbers[i];
      const stepTitle = stepTitles[i];

      // Try to find and click on step
      const stepSelectors = [
        `text="${stepTitle}"`,
        `text=${stepNum}`,
        `[class*="step"]:has-text("${stepTitle}")`,
        `[class*="flow"]:has-text("${stepTitle}")`
      ];

      let clicked = false;
      for (const selector of stepSelectors) {
        try {
          const elem = await page.locator(selector).first();
          if (await elem.isVisible({ timeout: 3000 })) {
            await elem.click({ timeout: 5000 });
            await page.waitForTimeout(2000);
            clicked = true;
            console.log(`✓ Clicked step using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      // Now capture all visible content related to this step
      const content = await page.evaluate((num, title) => {
        const results: string[] = [];

        // Look for any text content that contains the step number or title
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          const parent = el.parentElement;

          // Only capture if this is a direct text node (not contained in parent)
          if ((text.includes(num) || text.includes(title)) && text.length > 10 && text.length < 1000) {
            // Check if parent doesn't already contain this text
            if (parent && !parent.textContent?.includes(text)) {
              results.push(text);
            }
          }
        });

        return results;
      }, stepNum, stepTitle);

      if (content.length > 0) {
        allContent.steps.push({
          step: i + 1,
          number: stepNum,
          title: stepTitle,
          content: content.join('\n\n')
        });
        console.log(`✓ Captured ${content.length} content items for step ${i + 1}`);
      } else {
        // Fallback: capture the expanded content from the page
        const expandedContent = await page.evaluate(() => {
          // Look for expanded content sections
          const expanded = Array.from(document.querySelectorAll('[class*="expanded"], [class*="content"], [class*="detail"]'))
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 20);

          return expanded;
        });

        allContent.steps.push({
          step: i + 1,
          number: stepNum,
          title: stepTitle,
          content: expandedContent[i] || '(No content captured)'
        });
        console.log(`✓ Captured fallback content for step ${i + 1}`);
      }

    } catch (error) {
      console.log(`✗ Error capturing step ${i + 1}:`, error);
      allContent.steps.push({
        step: i + 1,
        number: stepNumbers[i],
        title: stepTitles[i],
        content: '(Error capturing content)'
      });
    }
  }

  console.log('\n=== Extracting FAQs ===\n');

  // Now try to capture FAQs
  const faqQuestions = [
    '納期はどれくらいですか。',
    '袋の素材はどのようなものがありますか。',
    '印刷の色数によって価格が変わりますか。',
    '片面印刷と両面印刷とは価格が変わりますか。',
    '金や銀色を印刷したいのですが可能でしょうか。',
    '対応不可な袋はありますか。',
    'どう封入しますか。',
    '最低でもいくらがかかりますか。',
    '印刷なし（無地）の袋は依頼できますか。',
    'サイズの制限はありますか。',
    '印刷範囲の制限はありますか。',
    '最小ロットは何枚からですか。',
    '袋に元々色が付いていますか。'
  ];

  for (let i = 0; i < faqQuestions.length; i++) {
    const question = faqQuestions[i];
    console.log(`\n--- Processing FAQ ${i + 1}: ${question.substring(0, 30)}... ---`);

    try {
      // Try to find and click the FAQ
      const faqSelectors = [
        `text="${question}"`,
        `[class*="faq"]:has-text("${question.substring(0, 10)}")`
      ];

      let clicked = false;
      for (const selector of faqSelectors) {
        try {
          const elem = await page.locator(selector).first();
          if (await elem.isVisible({ timeout: 3000 })) {
            await elem.click({ timeout: 5000 });
            await page.waitForTimeout(1500);
            clicked = true;
            console.log(`✓ Clicked FAQ ${i + 1}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      // Capture the answer
      const answer = await page.evaluate((q) => {
        // Look for answer near the question
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const text = el.textContent?.trim() || '';
          if (text.includes(q) && text.length > 50 && text.length < 2000) {
            // This might contain both question and answer
            const parts = text.split(q);
            if (parts.length > 1) {
              return parts[1].trim();
            }
          }
        }
        return '';
      }, question);

      allContent.faqs.push({
        question,
        answer: answer || '(Answer not captured)'
      });
      console.log(`✓ Captured answer for FAQ ${i + 1}`);

    } catch (error) {
      console.log(`✗ Error capturing FAQ ${i + 1}:`, error);
      allContent.faqs.push({
        question,
        answer: '(Error capturing answer)'
      });
    }
  }

  // Close browser
  await browser.close();

  // Format and save output
  const output = formatOutput(allContent);
  const outputPath = path.join(process.cwd(), 'brixa-flow-complete.txt');

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`\n✓ Content saved to: ${outputPath}`);
}

function formatOutput(data: any): string {
  let output = '='.repeat(80) + '\n';
  output += 'BRIXA FLOW PAGE - COMPLETE CONTENT\n';
  output += 'URL: https://brixa.jp/flow\n';
  output += 'Date: ' + new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) + '\n';
  output += '='.repeat(80) + '\n\n';

  // Title
  output += `# ${data.title}\n\n`;
  output += 'Brixaは誰でも簡単にパッケージ製造をご依頼いただけるサービスです。\n';
  output += 'スムーズでストレスのないパッケージ製造体験をぜひご体感ください。\n\n';

  // Steps
  output += '## 4단계 이용 절차 (4-Step Process)\n';
  output += '='.repeat(80) + '\n\n';

  if (data.steps && data.steps.length > 0) {
    data.steps.forEach((step: any) => {
      output += `### ${step.number}. ${step.title}\n`;
      output += '-'.repeat(40) + '\n';
      output += `${step.content}\n\n`;
    });
  }

  // FAQs
  output += '\n## FAQ (자주 묻는 질문)\n';
  output += '='.repeat(80) + '\n\n';

  if (data.faqs && data.faqs.length > 0) {
    data.faqs.forEach((faq: any, index: number) => {
      output += `### Q${index + 1}: ${faq.question}\n`;
      output += `${faq.answer}\n\n`;
    });
  }

  return output;
}

// Run the extraction
extractBrixaFlowContent().catch(console.error);
