/**
 * Specification Sheet PDF Generator
 *
 * 仕様書PDFジェネレーター
 * - HTMLテンプレートから仕様書PDFを生成
 * - 日本語技術ドキュメント対応
 * - B2B作業標準書フォーマット
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium as playwright } from 'playwright';
import * as Handlebars from 'handlebars';
import type {
  SpecSheetData,
  SpecSheetPdfOptions,
  SpecSheetPdfResult,
  SpecSheetTemplateData,
  DimensionRow,
  SpecFeature,
  PerformanceRow,
} from '@/types/specsheet';

// ============================================================
// Configuration
// ============================================================

const SPEC_SHEET_TEMPLATE_PATH = path.join(
  process.cwd(),
  'templet',
  'specsheet_ja.html'
);

const DEFAULT_PDF_OPTIONS: Required<SpecSheetPdfOptions> = {
  format: 'A4',
  orientation: 'portrait',
  template: 'standard',
  language: 'ja',
  includeDiagrams: true,
  includePricing: false,
  includeApproval: false,
  outputPath: '',
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format number to Japanese currency format
 */
function formatJapaneseCurrency(amount: number, currency: 'JPY' | 'USD' = 'JPY'): string {
  const symbol = currency === 'JPY' ? '¥' : '$';
  return `${symbol}${amount.toLocaleString('ja-JP')}`;
}

/**
 * Format date to Japanese format
 */
function formatJapaneseDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const eras = [
    { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
    { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
    { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
    { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
    { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
  ];

  const era = eras.find(e => dateObj >= e.start && dateObj <= e.end);
  if (era) {
    const year = dateObj.getFullYear() - era.start.getFullYear() + 1;
    return `${era.name}${year}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  }

  return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
}

/**
 * Get category name in Japanese
 */
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    packaging: '包装資材',
    bag: '袋製品',
    film: 'フィルム',
    container: '容器',
    label: 'ラベル',
    sealing: '封筒',
    custom: 'カスタム',
  };
  return categoryNames[category] || category;
}

/**
 * Get transparency name in Japanese
 */
function getTransparencyName(transparency: string): string {
  const names: Record<string, string> = {
    transparent: '透明',
    translucent: '半透明',
    opaque: '不透明',
  };
  return names[transparency] || transparency;
}

/**
 * Get printing method name in Japanese
 */
function getPrintingMethodName(method: string): string {
  const names: Record<string, string> = {
    gravure: 'グラビア印刷',
    flexo: 'フレキソ印刷',
    offset: 'オフセット印刷',
    digital: 'デジタル印刷',
    none: '印刷なし',
  };
  return names[method] || method;
}

// ============================================================
// Template Processing
// ============================================================

/**
 * Load and compile HTML template
 */
async function loadTemplate(): Promise<HandlebarsTemplateDelegate> {
  const templatePath = SPEC_SHEET_TEMPLATE_PATH;

  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    // Use default template
    return getDefaultTemplate();
  }

  const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
  return Handlebars.compile(templateContent);
}

/**
 * Get default template (inline HTML)
 */
function getDefaultTemplate(): HandlebarsTemplateDelegate {
  const template = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>仕様書 - {{specSheet.specNumber}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 10px;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }

    .container {
      max-width: 210mm;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }

    .header-left h1 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .header-left p {
      font-size: 9px;
      color: #666;
    }

    .header-right {
      text-align: right;
    }

    .spec-number {
      font-size: 14px;
      font-weight: 700;
      color: #c00;
    }

    .revision {
      font-size: 9px;
      color: #666;
    }

    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      background: #f5f5f5;
      padding: 8px 12px;
      margin-bottom: 10px;
      border-left: 4px solid #333;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .info-table th,
    .info-table td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }

    .info-table th {
      background: #f9f9f9;
      font-weight: 500;
      width: 25%;
    }

    .dimensions-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .dimensions-table th,
    .dimensions-table td {
      border: 1px solid #ddd;
      padding: 6px 10px;
      text-align: center;
    }

    .dimensions-table th {
      background: #f9f9f9;
      font-weight: 500;
    }

    .materials-list {
      list-style: none;
    }

    .materials-list li {
      padding: 6px 0;
      border-bottom: 1px dotted #ddd;
    }

    .materials-list li:last-child {
      border-bottom: none;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .feature-item {
      display: flex;
      align-items: center;
    }

    .feature-item-label {
      font-weight: 500;
      margin-right: 8px;
    }

    .approval-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }

    .approval-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .approval-box {
      text-align: center;
    }

    .approval-box-title {
      font-weight: 500;
      margin-bottom: 8px;
    }

    .signature-line {
      border-top: 1px solid #999;
      margin-top: 30px;
      padding-top: 5px;
    }

    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      font-size: 8px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>製品仕様書</h1>
        <p>EPACKAGE Lab株式会社</p>
      </div>
      <div class="header-right">
        <div class="spec-number">{{specSheet.specNumber}}</div>
        <div class="revision">Rev. {{specSheet.revision}}</div>
        <div>{{specSheet.issueDate}}</div>
      </div>
    </div>

    <!-- Customer Information -->
    <div class="section">
      <div class="section-title">顧客情報</div>
      <table class="info-table">
        <tr>
          <th>会社名</th>
          <td>{{customer.name}}</td>
        </tr>
        {{#if customer.department}}
        <tr>
          <th>部署</th>
          <td>{{customer.department}}</td>
        </tr>
        {{/if}}
        <tr>
          <th>担当者</th>
          <td>{{customer.contactPerson}}</td>
        </tr>
      </table>
    </div>

    <!-- Product Information -->
    <div class="section">
      <div class="section-title">製品情報</div>
      <table class="info-table">
        <tr>
          <th>製品名</th>
          <td>{{product.name}}</td>
        </tr>
        <tr>
          <th>製品コード</th>
          <td>{{product.productCode}}</td>
        </tr>
        <tr>
          <th>カテゴリー</th>
          <td>{{product.categoryName}}</td>
        </tr>
      </table>
    </div>

    <!-- Dimensions -->
    <div class="section">
      <div class="section-title">寸法</div>
      <table class="dimensions-table">
        <thead>
          <tr>
            <th>項目</th>
            <th>数値</th>
            <th>単位</th>
            {{#if product.dimensionsTable.[0].remarks}}
            <th>備考</th>
            {{/if}}
          </tr>
        </thead>
        <tbody>
          {{#each product.dimensionsTable}}
          <tr>
            <td>{{item}}</td>
            <td>{{value}}</td>
            <td>{{unit}}</td>
            {{#if ../product.dimensionsTable.[0].remarks}}
            <td>{{remarks}}</td>
            {{/if}}
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <!-- Materials -->
    <div class="section">
      <div class="section-title">材質構成</div>
      <ul class="materials-list">
        {{#each product.materials}}
        <li>第{{layer}}層：{{material}}{{#if thickness}}（厚み：{{thickness}}μm）{{/if}}{{#if function}} - {{function}}{{/if}}</li>
        {{/each}}
      </ul>
    </div>

    <!-- Specifications -->
    <div class="section">
      <div class="section-title">仕様・特徴</div>
      <div class="features-grid">
        {{#each product.specifications}}
        <div class="feature-item">
          <span class="feature-item-label">{{item}}：</span>
          <span>{{description}}</span>
        </div>
        {{/each}}
      </div>
    </div>

    <!-- Performance Standards (if available) -->
    {{#if product.performance}}
    <div class="section">
      <div class="section-title">性能基準</div>
      <table class="dimensions-table">
        <thead>
          <tr>
            <th>項目</th>
            <th>基準値</th>
            {{#if product.performance.[0].method}}
            <th>測定方法</th>
            {{/if}}
          </tr>
        </thead>
        <tbody>
          {{#each product.performance}}
          <tr>
            <td>{{item}}</td>
            <td>{{value}}</td>
            {{#if ../product.performance.[0].method}}
            <td>{{method}}</td>
            {{/if}}
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
    {{/if}}

    <!-- Compliance Standards (if available) -->
    {{#if product.compliance}}
    <div class="section">
      <div class="section-title">規格準拠</div>
      <ul>
        {{#each product.compliance}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/if}}

    <!-- Production Information -->
    <div class="section">
      <div class="section-title">生産仕様</div>
      <table class="info-table">
        <tr>
          <th>生産方法</th>
          <td>{{production.method}}</td>
        </tr>
        <tr>
          <th>包装単位</th>
          <td>{{production.packaging.quantity}} {{production.packaging.unit}}</td>
        </tr>
        <tr>
          <th>リードタイム</th>
          <td>{{production.delivery.leadTime}}</td>
        </tr>
        <tr>
          <th>最小ロット</th>
          <td>{{production.delivery.minLotSize}} {{production.delivery.lotUnit}}</td>
        </tr>
      </table>
    </div>

    <!-- Design Information (if available) -->
    {{#if design}}
    <div class="section">
      <div class="section-title">デザイン仕様</div>
      <table class="info-table">
        {{#if design.printing}}
        <tr>
          <th>印刷方法</th>
          <td>{{design.printing}}</td>
        </tr>
        {{/if}}
        {{#if design.colorGuide}}
        <tr>
          <th>カラー</th>
          <td>{{#each design.colorGuide}}{{this}}{{#unless @last}}、{{/unless}}{{/each}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    {{/if}}

    <!-- Pricing Information (if available) -->
    {{#if pricing}}
    <div class="section">
      <div class="section-title">価格情報</div>
      <table class="info-table">
        <tr>
          <th>単価</th>
          <td>{{pricing.basePrice}}</td>
        </tr>
        <tr>
          <th>最低発注量</th>
          <td>{{pricing.moq}}</td>
        </tr>
        {{#if pricing.volumeDiscount}}
        <tr>
          <th>数量割引</th>
          <td>{{#each pricing.volumeDiscount}}{{this}}{{#unless @last}}、{{/unless}}{{/each}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    {{/if}}

    <!-- Remarks (if available) -->
    {{#if remarks}}
    <div class="section">
      <div class="section-title">備考</div>
      <p>{{remarks}}</p>
    </div>
    {{/if}}

    <!-- Approval Section (if enabled) -->
    {{#if approvals}}
    <div class="approval-section">
      <div class="section-title">承認</div>
      <div class="approval-grid">
        {{#if approvals.preparedBy}}
        <div class="approval-box">
          <div class="approval-box-title">作成者</div>
          <div>{{approvals.preparedBy}}</div>
          {{#if approvals.preparedDate}}
          <div>{{approvals.preparedDate}}</div>
          {{/if}}
          <div class="signature-line">署名</div>
        </div>
        {{/if}}
        {{#if approvals.approver1}}
        <div class="approval-box">
          <div class="approval-box-title">{{approvals.approver1.title}}</div>
          <div>{{approvals.approver1.name}}</div>
          {{#if approvals.approver1.date}}
          <div>{{approvals.approver1.date}}</div>
          {{/if}}
          <div class="signature-line">署名</div>
        </div>
        {{/if}}
        {{#if approvals.approver2}}
        <div class="approval-box">
          <div class="approval-box-title">{{approvals.approver2.title}}</div>
          <div>{{approvals.approver2.name}}</div>
          {{#if approvals.approver2.date}}
          <div>{{approvals.approver2.date}}</div>
          {{/if}}
          <div class="signature-line">署名</div>
        </div>
        {{/if}}
      </div>
    </div>
    {{/if}}

    <!-- Footer -->
    <div class="footer">
      <p>この仕様書はEPACKAGE Lab株式会社の機密情報です。無断転載を禁じます。</p>
      <p>EPACKAGE Lab株式会社 | 兵庫県明石市上ノ丸2-11-21-102 | TEL: +81-80-6942-7235</p>
    </div>
  </div>
</body>
</html>
  `;

  return Handlebars.compile(template);
}

/**
 * Prepare template data from spec sheet data
 */
function prepareTemplateData(data: SpecSheetData): SpecSheetTemplateData {
  // Build dimensions table
  const dimensionsTable: DimensionRow[] = [];
  const dim = data.product.dimensions;

  if (dim.length !== undefined) {
    dimensionsTable.push({
      item: '長さ',
      value: dim.length.toString(),
      unit: 'mm',
    });
  }
  if (dim.width !== undefined) {
    dimensionsTable.push({
      item: '幅',
      value: dim.width.toString(),
      unit: 'mm',
    });
  }
  if (dim.height !== undefined) {
    dimensionsTable.push({
      item: '高さ/奥行き',
      value: dim.height.toString(),
      unit: 'mm',
    });
  }
  if (dim.thickness !== undefined) {
    dimensionsTable.push({
      item: '厚み',
      value: dim.thickness.toString(),
      unit: 'μm',
    });
  }
  if (dim.opening !== undefined) {
    dimensionsTable.push({
      item: '口径',
      value: dim.opening.toString(),
      unit: 'mm',
    });
  }
  if (dim.tolerance) {
    dimensionsTable.push({
      item: '許容差',
      value: dim.tolerance,
      unit: '',
    });
  }

  // Build specifications list
  const specifications: SpecFeature[] = [];
  const specs = data.product.specifications;

  if (specs.application) {
    specifications.push({
      item: '用途',
      description: specs.application,
    });
  }
  if (specs.heatResistance) {
    specifications.push({
      item: '耐熱温度',
      description: specs.heatResistance,
    });
  }
  if (specs.coldResistance) {
    specifications.push({
      item: '耐冷温度',
      description: specs.coldResistance,
    });
  }
  if (specs.transparency) {
    specifications.push({
      item: '透明度',
      description: getTransparencyName(specs.transparency),
    });
  }
  specifications.push({
    item: '耐水性',
    description: specs.waterResistance ? 'あり' : 'なし',
  });
  specifications.push({
    item: '気密性',
    description: specs.airTightness ? 'あり' : 'なし',
  });
  specifications.push({
    item: '防湿性',
    description: specs.moistureResistance ? 'あり' : 'なし',
  });
  specifications.push({
    item: '帯電防止',
    description: specs.antistatic ? 'あり' : 'なし',
  });
  specifications.push({
    item: '紫外線カット',
    description: specs.uvProtection ? 'あり' : 'なし',
  });
  if (specs.features && specs.features.length > 0) {
    specs.features.forEach((feature, index) => {
      specifications.push({
        item: `特徴${index + 1}`,
        description: feature,
      });
    });
  }

  // Build performance table (if available)
  const performance: PerformanceRow[] | undefined = data.product.performance ? [
    ...(data.product.performance.tensileStrength ? [{
      item: '引張強度',
      value: data.product.performance.tensileStrength,
    }] : []),
    ...(data.product.performance.tearStrength ? [{
      item: '破裂強度',
      value: data.product.performance.tearStrength,
    }] : []),
    ...(data.product.performance.sealStrength ? [{
      item: '密封強度',
      value: data.product.performance.sealStrength,
    }] : []),
    ...(data.product.performance.wvtr ? [{
      item: '透湿度',
      value: data.product.performance.wvtr,
    }] : []),
    ...(data.product.performance.otr ? [{
      item: '酸素透過度',
      value: data.product.performance.otr,
    }] : []),
  ] : undefined;

  // Build compliance list (if available)
  const compliance: string[] | undefined = data.product.compliance ? [
    ...(data.product.compliance.foodSanitationAct ? ['食品衛生法準拠'] : []),
    ...(data.product.compliance.jisStandards || []).map(s => `JIS: ${s}`),
    ...(data.product.compliance.isoStandards || []).map(s => `ISO: ${s}`),
    ...(data.product.compliance.otherStandards || []),
  ] : undefined;

  // Build design information (if available)
  const design = data.design ? {
    printing: data.design.printing
      ? `${getPrintingMethodName(data.design.printing.method)}、${data.design.printing.colors}色、${data.design.printing.sides === 'both' ? '両面' : data.design.printing.sides === 'front' ? '表面' : '裏面'}`
      : undefined,
    colorGuide: data.design.colorGuide
      ? [
          ...(data.design.colorGuide.baseColors || []),
          ...(data.design.colorGuide.spotColors || []),
        ]
      : undefined,
    designData: data.design.designData
      ? `${data.design.designData.format}、${data.design.designData.resolution}、${data.design.designData.colorMode}`
      : undefined,
  } : undefined;

  // Build pricing information (if available)
  const pricing = data.pricing ? {
    basePrice: formatJapaneseCurrency(data.pricing.basePrice.unitPrice, data.pricing.basePrice.currency),
    moq: data.pricing.basePrice.moq.toString(),
    volumeDiscount: data.pricing.volumeDiscount?.map(d =>
      `${d.quantity}個以上: ${(d.discountRate * 100).toFixed(1)}%引き`
    ),
  } : undefined;

  // Build approval section (if enabled)
  const approvals = data.approvals && data.approvals.length > 0 ? {
    preparedBy: data.approvals[0]?.name,
    preparedDate: data.approvals[0]?.date,
    approver1: data.approvals[1] ? {
      name: data.approvals[1].name,
      title: data.approvals[1].title,
      date: data.approvals[1].date,
    } : undefined,
    approver2: data.approvals[2] ? {
      name: data.approvals[2].name,
      title: data.approvals[2].title,
      date: data.approvals[2].date,
    } : undefined,
  } : undefined;

  return {
    header: {
      companyName: 'EPACKAGE Lab株式会社',
      companyNameKana: 'イーパックケージラボカブシキガイシャ',
      address: '兵庫県明石市上ノ丸2-11-21-102',
      phone: '+81-80-6942-7235',
      email: 'info@epackage-lab.com',
      website: 'https://epackage-lab.com',
    },
    specSheet: {
      specNumber: data.specNumber,
      revision: data.revision,
      issueDate: formatJapaneseDate(data.issueDate),
      title: data.title,
      categoryName: getCategoryName(data.category),
    },
    customer: {
      name: data.customer.name,
      department: data.customer.department,
      contactPerson: data.customer.contactPerson,
    },
    product: {
      name: data.product.name,
      productCode: data.product.productCode,
      dimensionsTable,
      materials: data.product.materials,
      specifications,
      performance,
      compliance,
    },
    production: {
      method: data.production.method,
      process: data.production.process,
      qualityControl: {
        inspectionStandards: data.production.qualityControl.inspectionStandards,
        aqlStandards: data.production.qualityControl.aqlStandards,
      },
      packaging: data.production.packaging,
      delivery: data.production.delivery,
    },
    design,
    pricing,
    remarks: data.remarks,
    approvals,
  };
}

// ============================================================
// PDF Generation Functions
// ============================================================

/**
 * Generate specification sheet PDF
 * @param data - Spec sheet data
 * @param options - PDF generation options
 * @returns PDF generation result
 */
export async function generateSpecSheetPdf(
  data: SpecSheetData,
  options: SpecSheetPdfOptions = {}
): Promise<SpecSheetPdfResult> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };

  let browser = null;
  let page = null;

  try {
    // Load and compile template
    const template = await loadTemplate();
    const templateData = prepareTemplateData(data);
    const html = template(templateData);

    // Launch Playwright browser
    browser = await playwright.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();

    // Set content and wait for network idle
    await page.setContent(html, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Generate PDF
    // Type assertion for Puppeteer PDF options (orientation is valid but not in older type definitions)
    const pdfBuffer = await page.pdf({
      format: opts.format,
      // @ts-ignore - orientation is valid in newer Puppeteer versions
      orientation: opts.orientation as 'portrait' | 'landscape',
      displayHeaderFooter: false,
      printBackground: true,
    } as Parameters<typeof page.pdf>[0]);

    // Save to file if output path specified
    if (opts.outputPath) {
      await fs.promises.mkdir(path.dirname(opts.outputPath), { recursive: true });
      await fs.promises.writeFile(opts.outputPath, pdfBuffer);
      return {
        success: true,
        filePath: opts.outputPath,
        buffer: Buffer.from(pdfBuffer),
        metadata: {
          generatedAt: new Date().toISOString(),
          fileSize: pdfBuffer.length,
          specNumber: data.specNumber,
          revision: data.revision,
        },
      };
    }

    return {
      success: true,
      buffer: Buffer.from(pdfBuffer),
      metadata: {
        generatedAt: new Date().toISOString(),
        fileSize: pdfBuffer.length,
        specNumber: data.specNumber,
        revision: data.revision,
      },
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    // Clean up
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Generate spec sheet PDF and return as base64 string
 * @param data - Spec sheet data
 * @returns Base64 encoded PDF
 */
export async function generateSpecSheetPdfBase64(
  data: SpecSheetData
): Promise<{ success: boolean; base64?: string; error?: string }> {
  const result = await generateSpecSheetPdf(data);

  if (!result.success || !result.buffer) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    base64: result.buffer.toString('base64'),
  };
}

/**
 * Validate spec sheet data for PDF generation
 * @param data - Spec sheet data to validate
 * @returns Validation result
 */
export function validateSpecSheetData(
  data: SpecSheetData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.specNumber) {
    errors.push('仕様書番号は必須です');
  }
  if (!data.revision) {
    errors.push('版数は必須です');
  }
  if (!data.issueDate) {
    errors.push('発行日は必須です');
  }
  if (!data.customer?.name) {
    errors.push('顧客名は必須です');
  }
  if (!data.product?.name) {
    errors.push('製品名は必須です');
  }
  if (!data.product?.productCode) {
    errors.push('製品コードは必須です');
  }
  if (!data.product?.dimensions) {
    errors.push('製品寸法は必須です');
  }
  if (!data.product?.materials || data.product.materials.length === 0) {
    errors.push('材質構成は必須です');
  }
  if (!data.production?.method) {
    errors.push('生産方法は必須です');
  }
  if (!data.production?.delivery?.leadTime) {
    errors.push('リードタイムは必須です');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate PDF file size
 * @param data - Spec sheet data
 * @returns Estimated size in bytes
 */
export function estimateSpecSheetPdfSize(data: SpecSheetData): number {
  // Rough estimation: ~3000 bytes base + 200 bytes per material layer + 500 bytes per specification
  const baseSize = 3000;
  const materialsSize = data.product.materials.length * 200;
  const specsSize = Object.keys(data.product.specifications).length * 500;
  const performanceSize = data.product.performance ? 500 : 0;
  const complianceSize = data.product.compliance ? 300 : 0;
  const designSize = data.design ? 400 : 0;
  const pricingSize = data.pricing ? 300 : 0;
  const approvalSize = data.approvals?.length ? data.approvals.length * 200 : 0;

  return baseSize + materialsSize + specsSize + performanceSize + complianceSize + designSize + pricingSize + approvalSize;
}

/**
 * Create mock spec sheet data for testing
 * @returns Mock spec sheet data
 */
export function createMockSpecSheetData(): SpecSheetData {
  return {
    specNumber: 'B2B-SPEC-2024-001',
    revision: '1.0',
    issueDate: '2024-04-01',
    validUntil: '2025-04-01',
    status: 'active',
    category: 'bag',
    title: 'オーダーメイドスタンドパウチ袋仕様書',
    description: '食品包装用スタンドパウチ袋の技術仕様書',

    customer: {
      name: 'テスト食品株式会社',
      department: '資材調達部',
      contactPerson: '山田 太郎',
      contact: {
        phone: '03-1234-5678',
        email: 'yamada@test-food.co.jp',
      },
    },

    product: {
      id: 'PROD-001',
      name: 'オーダーメイドスタンドパウチ袋',
      nameKana: 'オーダーメイドスタンドパウチブクロ',
      productCode: 'SP-A4-100',
      category: 'bag',

      dimensions: {
        length: 200,
        width: 140,
        thickness: 100,
        opening: 40,
        tolerance: '±2mm',
      },

      materials: [
        {
          layer: 1,
          material: 'PET（ポリエチレンテレフタレート）',
          thickness: 12,
          function: '外層・印刷面',
        },
        {
          layer: 2,
          material: 'AL（アルミニウム箔）',
          thickness: 7,
          function: 'バリア層',
        },
        {
          layer: 3,
          material: 'PE（ポリエチレン）',
          thickness: 81,
          function: '内層・熱密封層',
        },
      ],

      specifications: {
        application: '乾燥食品・スナック菓子包装',
        heatResistance: '最高120℃',
        coldResistance: '最低-20℃',
        transparency: 'opaque',
        waterResistance: true,
        airTightness: true,
        moistureResistance: true,
        antistatic: false,
        uvProtection: false,
        features: [
          '底部ガセットによる自立性',
          'ジッパー付きによる再密封可能',
        ],
      },

      performance: {
        tensileStrength: '40MPa以上',
        tearStrength: '150N以上',
        sealStrength: '15N/15mm以上',
        wvtr: '1g/㎡・day以下',
        otr: '1cc/㎡・day以下',
      },

      compliance: {
        foodSanitationAct: true,
        jisStandards: ['Z1707'],
        isoStandards: ['9001'],
      },
    },

    production: {
      method: 'インフレーション成形・ラミネート加工',
      process: [
        'フィルム押出し',
        '印刷',
        'ラミネート',
        '製袋',
        '検査',
      ],
      equipment: ['フィルム押出し機', 'グラビア印刷機', 'ラミネート機', '製袋機'],

      qualityControl: {
        inspectionStandards: [
          '外観検査',
          '寸法検査',
          '密封強度検査',
          'バリア性能検査',
        ],
        testMethods: [
          'JIS Z 0238（密封強度試験）',
          'JIS K 7129（透湿度試験）',
        ],
        aqlStandards: 'AQL 1.5',
      },

      packaging: {
        unit: '箱',
        quantity: 1000,
        packingSpec: '段ボール箱詰め（防湿処理済）',
      },

      delivery: {
        leadTime: '受注確認後30日〜45日',
        minLotSize: 5000,
        lotUnit: '個',
      },
    },

    design: {
      printing: {
        method: 'gravure',
        colors: 8,
        sides: 'front',
        finishing: ['ニス加工', 'エンボス'],
      },
      colorGuide: {
        baseColors: ['プロセスカラー（CMYK）'],
        spotColors: ['PANTONE 186 C（赤）', 'DIC 156（青）'],
        colorCodes: {
          red: 'PANTONE 186 C',
          blue: 'DIC 156',
        },
      },
      designData: {
        format: 'PDF',
        resolution: '350dpi',
        colorMode: 'CMYK',
        fileUrl: 'https://example.com/design.pdf',
      },
    },

    pricing: {
      basePrice: {
        unitPrice: 150,
        moq: 5000,
        currency: 'JPY',
      },
      volumeDiscount: [
        { quantity: 10000, discountRate: 0.05 },
        { quantity: 50000, discountRate: 0.10 },
      ],
      options: [
        { name: 'ジッパー追加', price: 10, unit: '円/個' },
        { name: '穴あけ加工', price: 3, unit: '円/個' },
      ],
      validityPeriod: '発行日から90日間',
    },

    remarks: '本仕様書は特定の製品仕様を示すものであり、実際の製品と異なる場合があります。詳細は担当者にお問い合わせください。',

    approvals: [
      {
        name: '鈴木 一郎',
        title: '技術担当',
        date: '2024-04-01',
        status: 'approved',
      },
      {
        name: '佐藤 花子',
        title: '品質管理部長',
        date: '2024-04-02',
        status: 'approved',
        comments: '仕様確認完了',
      },
    ],
  };
}
