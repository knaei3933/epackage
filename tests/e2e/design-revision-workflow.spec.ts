import { test, expect } from '@playwright/test';

test.describe('Design Revision Workflow v2 - Component Display', () => {
  test.beforeEach(async ({ page }) => {
    // Go to homepage first
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should display homepage', async ({ page }) => {
    // Check if homepage loads
    await expect(page).toHaveTitle(/Epackage Lab/);
  });

  test('should navigate to member portal', async ({ page }) => {
    // Try to access member login page
    await page.goto('http://localhost:3000/member/login');
    await page.waitForLoadState('networkidle');

    // Check if login page is accessible
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
  });

  test('should check for new components in codebase', async ({ page }) => {
    // This test verifies the new component files exist
    const fs = require('fs');
    const path = require('path');

    const componentsToCheck = [
      'src/components/member/FileResubmissionSection.tsx',
      'src/components/member/RejectionReasonModal.tsx',
      'src/components/member/RevisionHistoryTimeline.tsx'
    ];

    const projectRoot = 'C:/Users/kanei/claudecode/02.Homepage_Dev/02.epac_homepagever1.1';

    for (const component of componentsToCheck) {
      const fullPath = path.join(projectRoot, component);
      const exists = fs.existsSync(fullPath);
      console.log(`${component}: ${exists ? 'EXISTS' : 'MISSING'}`);
      expect(exists).toBe(true);
    }
  });

  test('should check for new API routes', async ({ page }) => {
    const fs = require('fs');
    const path = require('path');

    const apiRoutesToCheck = [
      'src/app/api/member/orders/[id]/resubmit-file/route.ts',
      'src/app/api/member/orders/[id]/revision-history/route.ts',
      'src/app/api/admin/orders/[id]/notify-designer-rejection/route.ts'
    ];

    const projectRoot = 'C:/Users/kanei/claudecode/02.Homepage_Dev/02.epac_homepagever1.1';

    for (const route of apiRoutesToCheck) {
      const fullPath = path.join(projectRoot, route);
      const exists = fs.existsSync(fullPath);
      console.log(`${route}: ${exists ? 'EXISTS' : 'MISSING'}`);
      expect(exists).toBe(true);
    }
  });

  test('should check for file naming utility', async ({ page }) => {
    const fs = require('fs');
    const path = require('path');

    const fileNamingPath = path.join(
      'C:/Users/kanei/claudecode/02.Homepage_Dev/02.epac_homepagever1.1',
      'src/lib/file-naming.ts'
    );

    const exists = fs.existsSync(fileNamingPath);
    console.log(`file-naming.ts: ${exists ? 'EXISTS' : 'MISSING'}`);
    expect(exists).toBe(true);

    // Check if the file has the required functions
    if (exists) {
      const content = fs.readFileSync(fileNamingPath, 'utf-8');
      const hasParseFunction = content.includes('parseCustomerFilename');
      const hasGenerateFunction = content.includes('generateCorrectionFilename');
      const hasExtractLanguage = content.includes('extractLanguage');

      console.log(`parseCustomerFilename: ${hasParseFunction ? 'EXISTS' : 'MISSING'}`);
      console.log(`generateCorrectionFilename: ${hasGenerateFunction ? 'EXISTS' : 'MISSING'}`);
      console.log(`extractLanguage: ${hasExtractLanguage ? 'EXISTS' : 'MISSING'}`);

      expect(hasParseFunction).toBe(true);
      expect(hasGenerateFunction).toBe(true);
      expect(hasExtractLanguage).toBe(true);
    }
  });

  test('should check for database migration file', async ({ page }) => {
    const fs = require('fs');
    const path = require('path');

    const migrationPath = path.join(
      'C:/Users/kanei/claudecode/02.Homepage_Dev/02.epac_homepagever1.1',
      'supabase/migrations/20260222000000_design_revision_workflow_v2.sql'
    );

    const exists = fs.existsSync(migrationPath);
    console.log(`design_revision_workflow_v2.sql: ${exists ? 'EXISTS' : 'MISSING'}`);
    expect(exists).toBe(true);

    // Check if migration has required tables
    if (exists) {
      const content = fs.readFileSync(migrationPath, 'utf-8');
      const hasCustomerSubmissions = content.includes('customer_file_submissions');
      const hasRevisionNotifications = content.includes('revision_notifications');
      const hasRevisionColumns = content.includes('original_customer_filename');

      console.log(`customer_file_submissions table: ${hasCustomerSubmissions ? 'EXISTS' : 'MISSING'}`);
      console.log(`revision_notifications table: ${hasRevisionNotifications ? 'EXISTS' : 'MISSING'}`);
      console.log(`design_revisions columns: ${hasRevisionColumns ? 'EXISTS' : 'MISSING'}`);

      expect(hasCustomerSubmissions).toBe(true);
      expect(hasRevisionNotifications).toBe(true);
      expect(hasRevisionColumns).toBe(true);
    }
  });

  test('should check for email templates', async ({ page }) => {
    const fs = require('fs');
    const path = require('path');

    const projectRoot = 'C:/Users/kanei/claudecode/02.Homepage_Dev/02.epac_homepagever1.1';

    const templatesToCheck = [
      'src/lib/email/templates/designer-revision-rejected.ts',
      'src/lib/email/templates/designer-revision-approved.ts'
    ];

    for (const template of templatesToCheck) {
      const fullPath = path.join(projectRoot, template);
      const exists = fs.existsSync(fullPath);
      console.log(`${template}: ${exists ? 'EXISTS' : 'MISSING'}`);
      expect(exists).toBe(true);
    }
  });
});

test.describe('Design Revision Workflow v2 - File Naming Tests', () => {
  test('should test file naming functions', async ({ page }) => {
    // Test the file naming utility functions
    const { parseCustomerFilename, generateCorrectionFilename, extractLanguage } = require('../src/lib/file-naming');

    // Test 1: Parse standard Chinese filename
    const chineseFilename = '中国語_入稿データ_ORD-2026-MLU0AQIY_20260220.pdf';
    const parsed = parseCustomerFilename(chineseFilename);
    console.log('Parsed Chinese filename:', parsed);
    expect(parsed).not.toBeNull();
    expect(parsed?.language).toBe('中国語');
    expect(parsed?.orderNumber).toBe('ORD-2026-MLU0AQIY');

    // Test 2: Generate correction filename
    const correctionFilename = generateCorrectionFilename(chineseFilename, 1);
    console.log('Generated correction filename:', correctionFilename);
    expect(correctionFilename).toContain('校正データ');
    expect(correctionFilename).toContain('_R1');

    // Test 3: Extract language
    const language = extractLanguage(chineseFilename);
    console.log('Extracted language:', language);
    expect(language).toBe('中国語');

    // Test 4: Korean filename
    const koreanFilename = '韓国語_入稿データ_ORD-2026-ABC12345_20260221.ai';
    const parsedKorean = parseCustomerFilename(koreanFilename);
    console.log('Parsed Korean filename:', parsedKorean);
    expect(parsedKorean?.language).toBe('韓国語');

    const koreanCorrection = generateCorrectionFilename(koreanFilename, 2);
    console.log('Korean correction filename:', koreanCorrection);
    expect(koreanCorrection).toContain('韓国語_校正データ');
    expect(koreanCorrection).toContain('_R2');

    // Test 5: Japanese filename
    const japaneseFilename = '日本語_入稿データ_ORD-2026-XYZ98765_20260222.eps';
    const parsedJapanese = parseCustomerFilename(japaneseFilename);
    console.log('Parsed Japanese filename:', parsedJapanese);
    expect(parsedJapanese?.language).toBe('日本語');
  });
});
