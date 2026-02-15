/**
 * Contract PDF Generation API
 *
 * 契約書PDF生成API
 * - POST: 契約書データからPDFを生成
 * - Playwrightとhtml2pdfを使用したPDF生成
 * - 日本語契約書フォーマット対応
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { chromium as playwright } from 'playwright';
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ContractData, PdfGenerationOptions, PdfGenerationResult } from '@/types/contract';

// ============================================================
// Types
// ============================================================

interface GeneratePdfRequest {
  data: ContractData;
  options?: PdfGenerationOptions;
}

interface GeneratePdfResponse extends PdfGenerationResult {
  filename?: string;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_PDF_OPTIONS = {
  format: 'A4' as const,
  orientation: 'portrait' as const,
  displayHeaderFooter: false,
  printBackground: true,
  margin: {
    top: '20mm',
    bottom: '20mm',
    left: '15mm',
    right: '15mm',
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format date to Japanese era format (令和6年4月1日)
 */
function formatJapaneseDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Japanese eras
  const eras = [
    { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
    { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
    { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
    { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
    { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
  ];

  const era = eras.find(e => d >= e.start && d <= e.end);
  if (!era) {
    // Fallback to Western calendar if era not found
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const year = d.getFullYear() - era.start.getFullYear() + 1;
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${era.name}${year}年${month}月${day}日`;
}

/**
 * Format currency to Japanese yen format
 */
function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * Calculate totals from contract items
 */
function calculateTotals(items: ContractData['items']) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.1; // 10% consumption tax
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

// ============================================================
// HTML Template Generation
// ============================================================

async function generateContractHtml(data: ContractData): Promise<string> {
  // Calculate totals
  const { subtotal, tax, total } = calculateTotals(data.items);

  // Prepare template data
  const templateData = {
    contractNumber: data.contractNumber,
    issueDate: formatJapaneseDate(data.issueDate),
    effectiveDate: formatJapaneseDate(data.effectiveDate),
    validUntil: data.validUntil ? formatJapaneseDate(data.validUntil) : '',
    orderNumber: data.orderNumber || '',
    status: data.status,

    // Seller (甲)
    sellerName: data.seller.name,
    sellerNameKana: data.seller.nameKana || '',
    sellerPostalCode: data.seller.postalCode,
    sellerAddress: data.seller.address,
    sellerRepresentative: data.seller.representative,
    sellerRepresentativeTitle: data.seller.representativeTitle,
    sellerPhone: data.seller.contact?.phone || '',
    sellerEmail: data.seller.contact?.email || '',
    sellerFax: data.seller.contact?.fax || '',

    // Buyer (乙)
    buyerName: data.buyer.name,
    buyerNameKana: data.buyer.nameKana || '',
    buyerPostalCode: data.buyer.postalCode,
    buyerAddress: data.buyer.address,
    buyerRepresentative: data.buyer.representative,
    buyerRepresentativeTitle: data.buyer.representativeTitle,
    buyerPhone: data.buyer.contact?.phone || '',
    buyerEmail: data.buyer.contact?.email || '',
    buyerFax: data.buyer.contact?.fax || '',

    // Items
    items: data.items.map((item, index) => ({
      no: index + 1,
      name: item.name,
      specification: item.specification,
      quantity: item.quantity.toLocaleString(),
      unit: item.unit,
      unitPrice: item.unitPrice.toLocaleString(),
      amount: item.amount.toLocaleString(),
      remarks: item.remarks || '',
    })),
    itemCount: data.items.length,

    // Totals
    subtotal: subtotal.toLocaleString(),
    tax: tax.toLocaleString(),
    total: total.toLocaleString(),
    totalInWords: convertNumberToJapaneseKanji(total),

    // Payment terms
    paymentMethod: data.terms.payment.method,
    paymentDeadline: data.terms.payment.deadline,
    depositPercentage: data.terms.payment.depositPercentage
      ? `${data.terms.payment.depositPercentage * 100}%`
      : '',
    depositAmount: data.terms.payment.depositAmount
      ? formatYen(data.terms.payment.depositAmount)
      : '',

    // Delivery terms
    deliveryPeriod: data.terms.delivery.period,
    deliveryLocation: data.terms.delivery.location,
    deliveryConditions: data.terms.delivery.conditions,
    partialDelivery: data.terms.delivery.partialDelivery ? '可能' : '不可',

    // Contract period
    contractStartDate: data.terms.period?.startDate
      ? formatJapaneseDate(data.terms.period.startDate)
      : '',
    contractEndDate: data.terms.period?.endDate
      ? formatJapaneseDate(data.terms.period.endDate)
      : '',
    contractValidity: data.terms.period?.validity || '',

    // Special terms
    specialTerms: data.terms.specialTerms || [],

    // Remarks
    remarks: data.remarks || '',

    // Signatories
    sellerSignatory: data.sellerSignatory
      ? {
          name: data.sellerSignatory.name,
          title: data.sellerSignatory.title,
          department: data.sellerSignatory.department || '',
          date: data.sellerSignatory.date
            ? formatJapaneseDate(data.sellerSignatory.date)
            : '',
          hasStamp: !!data.sellerSignatory.stamp,
          hasSignature: !!data.sellerSignatory.signature,
        }
      : null,

    buyerSignatory: data.buyerSignatory
      ? {
          name: data.buyerSignatory.name,
          title: data.buyerSignatory.title,
          department: data.buyerSignatory.department || '',
          date: data.buyerSignatory.date
            ? formatJapaneseDate(data.buyerSignatory.date)
            : '',
          hasStamp: !!data.buyerSignatory.stamp,
          hasSignature: !!data.buyerSignatory.signature,
        }
      : null,

    // Attachments
    attachments: data.attachments?.map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
    })) || [],
  };

  // Register Handlebars helpers
  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
  });

  Handlebars.registerHelper('formatYen', function (amount) {
    return formatYen(amount);
  });

  // Try to read template file, fallback to inline template
  let templateSource: string;

  try {
    const templatePath = join(process.cwd(), 'templet', 'contract_ja_kanei_trade_improved.html');
    templateSource = await readFile(templatePath, 'utf-8');
  } catch (error) {
    // Fallback inline template
    templateSource = getInlineContractTemplate();
  }

  // Compile and render template
  const template = Handlebars.compile(templateSource);
  return template(templateData);
}

/**
 * Convert number to Japanese kanji (for amount in words)
 */
function convertNumberToJapaneseKanji(amount: number): string {
  const units = ['', '万', '億', '兆'];
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let result = '';
  let unitIndex = 0;

  while (amount > 0) {
    const chunk = amount % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      if (chunk >= 1000) chunkStr += digits[Math.floor(chunk / 1000)] + '千';
      if (chunk % 1000 >= 100) chunkStr += digits[Math.floor((chunk % 1000) / 100)] + '百';
      if (chunk % 100 >= 10) chunkStr += digits[Math.floor((chunk % 100) / 10)] + '十';
      if (chunk % 10 >= 1) chunkStr += digits[chunk % 10];
      result = chunkStr + units[unitIndex] + result;
    }
    amount = Math.floor(amount / 10000);
    unitIndex++;
  }

  return result + '円';
}

/**
 * Get inline contract template as fallback
 */
function getInlineContractTemplate(): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>前金契約書 - {{contractNumber}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "MS Mincho", "Yu Mincho", serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
      padding: 20mm;
    }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 15px; }
    .header-info { display: flex; justify-content: center; gap: 20px; font-size: 9pt; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .party-box { padding: 15px; border: 1px solid #ccc; }
    .party-box h3 { font-size: 11pt; margin-bottom: 10px; }
    .party-info div { margin-bottom: 5px; }
    .party-info label { font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .text-right { text-align: right; }
    .terms { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .term-box { padding: 12px; border: 1px solid #ddd; background: #f9f9f9; }
    .signatories { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 40px; }
    .signatory-box { padding: 15px; border: 1px solid #ccc; text-align: center; }
    .stamp-placeholder { width: 60px; height: 60px; border: 1px dashed #999; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #666; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 8pt; color: #666; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>前　金　契　約　書</h1>
    <div class="header-info">
      <span>契約番号：{{contractNumber}}</span>
      {{#if orderNumber}}<span>注文番号：{{orderNumber}}</span>{{/if}}
      <span>発行日：{{issueDate}}</span>
    </div>
  </div>

  <div class="section">
    <div class="parties">
      <div class="party-box">
        <h3>販売者（甲）</h3>
        <div class="party-info">
          <div><label>会社名：</label>{{sellerName}}</div>
          {{#if sellerNameKana}}<div>{{sellerNameKana}}</div>{{/if}}
          <div><label>住所：</label>〒{{sellerPostalCode}}<br>{{sellerAddress}}</div>
          <div><label>代表者：</label>{{sellerRepresentativeTitle}} {{sellerRepresentative}}</div>
          {{#if sellerPhone}}<div>TEL：{{sellerPhone}}</div>{{/if}}
          {{#if sellerEmail}}<div>Email：{{sellerEmail}}</div>{{/if}}
        </div>
      </div>
      <div class="party-box">
        <h3>購入者（乙）</h3>
        <div class="party-info">
          <div><label>会社名：</label>{{buyerName}}</div>
          {{#if buyerNameKana}}<div>{{buyerNameKana}}</div>{{/if}}
          <div><label>住所：</label>〒{{buyerPostalCode}}<br>{{buyerAddress}}</div>
          <div><label>代表者：</label>{{buyerRepresentativeTitle}} {{buyerRepresentative}}</div>
          {{#if buyerPhone}}<div>TEL：{{buyerPhone}}</div>{{/if}}
          {{#if buyerEmail}}<div>Email：{{buyerEmail}}</div>{{/if}}
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">契約品目</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">No.</th>
          <th>品名</th>
          <th>型式・仕様</th>
          <th class="text-right" style="width: 70px;">数量</th>
          <th class="text-right" style="width: 50px;">単位</th>
          <th class="text-right" style="width: 90px;">単価</th>
          <th class="text-right" style="width: 100px;">金額</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td class="text-right">{{no}}</td>
          <td>{{name}}</td>
          <td>{{specification}}</td>
          <td class="text-right">{{quantity}}</td>
          <td class="text-right">{{unit}}</td>
          <td class="text-right">¥{{unitPrice}}</td>
          <td class="text-right">¥{{amount}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="6" class="text-right"><strong>小計</strong></td>
          <td class="text-right">¥{{subtotal}}</td>
        </tr>
        <tr>
          <td colspan="6" class="text-right">消費税（10%）</td>
          <td class="text-right">¥{{tax}}</td>
        </tr>
        <tr style="background: #f0f0f0; font-weight: bold;">
          <td colspan="6" class="text-right">合計</td>
          <td class="text-right">¥{{total}}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">契約条件</h2>
    <div class="terms">
      <div class="term-box">
        <h3>支払条件</h3>
        <div><label>支払方法：</label>{{paymentMethod}}</div>
        <div><label>支払期限：</label>{{paymentDeadline}}</div>
        {{#if depositPercentage}}<div><label>前金率：</label>{{depositPercentage}}</div>{{/if}}
        {{#if depositAmount}}<div><label>前金額：</label>{{depositAmount}}</div>{{/if}}
      </div>
      <div class="term-box">
        <h3>納品条件</h3>
        <div><label>納期：</label>{{deliveryPeriod}}</div>
        <div><label>納品場所：</label>{{deliveryLocation}}</div>
        <div><label>納品条件：</label>{{deliveryConditions}}</div>
        <div><label>分割納品：</label>{{partialDelivery}}</div>
      </div>
    </div>
    {{#if contractStartDate}}
    <div class="term-box" style="margin-top: 15px;">
      <h3>契約期間</h3>
      <div><label>開始日：</label>{{contractStartDate}}</div>
      {{#if contractEndDate}}<div><label>終了日：</label>{{contractEndDate}}</div>{{/if}}
      {{#if contractValidity}}<div><label>有効期間：</label>{{contractValidity}}</div>{{/if}}
    </div>
    {{/if}}
  </div>

  {{#if remarks}}
  <div class="section">
    <h2 class="section-title">備考</h2>
    <div style="padding: 10px; background: #f9f9f9; border: 1px solid #ddd;">
      {{remarks}}
    </div>
  </div>
  {{/if}}

  <div class="section">
    <h2 class="section-title">署名</h2>
    <div class="signatories">
      <div class="signatory-box">
        <h3>販売者署名</h3>
        {{#if sellerSignatory}}
          <div style="margin: 10px 0;">
            <div><strong>{{sellerSignatory.name}}</strong></div>
            <div>{{sellerSignatory.title}}</div>
            {{#if sellerSignatory.department}}<div>{{sellerSignatory.department}}</div>{{/if}}
            {{#if sellerSignatory.date}}<div>署名日：{{sellerSignatory.date}}</div>{{/if}}
          </div>
          {{#if sellerSignatory.hasStamp}}
          <div class="stamp-placeholder">印鑑</div>
          {{/if}}
        {{else}}
          <p style="color: #666; font-style: italic;">未署名</p>
        {{/if}}
      </div>
      <div class="signatory-box">
        <h3>購入者署名</h3>
        {{#if buyerSignatory}}
          <div style="margin: 10px 0;">
            <div><strong>{{buyerSignatory.name}}</strong></div>
            <div>{{buyerSignatory.title}}</div>
            {{#if buyerSignatory.department}}<div>{{buyerSignatory.department}}</div>{{/if}}
            {{#if buyerSignatory.date}}<div>署名日：{{buyerSignatory.date}}</div>{{/if}}
          </div>
          {{#if buyerSignatory.hasStamp}}
          <div class="stamp-placeholder">印鑑</div>
          {{/if}}
        {{else}}
          <p style="color: #666; font-style: italic;">未署名</p>
        {{/if}}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>本契約書は電子署名法および電子契約法に準拠しています</p>
    <p>This contract is compliant with the Electronic Signature Act and Electronic Contract Act</p>
  </div>
</body>
</html>
  `;
}

// ============================================================
// POST Handler - Generate PDF
// ============================================================

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const body = (await request.json()) as GeneratePdfRequest;

    if (!body.data) {
      return NextResponse.json(
        {
          success: false,
          error: '契約データが必要です',
        } as PdfGenerationResult,
        { status: 400 }
      );
    }

    // Generate HTML from template
    const html = await generateContractHtml(body.data);

    // Launch Playwright browser
    browser = await playwright.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, {
      waitUntil: 'networkidle',
    });

    // Generate PDF
    const pdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...body.options,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    // Close browser
    await browser.close();
    browser = null;

    // Check if returnBase64 is requested
    const returnBase64 = (body.options as any)?.returnBase64 || false;

    if (returnBase64) {
      // Return base64 encoded PDF
      const base64 = pdfBuffer.toString('base64');

      return NextResponse.json({
        success: true,
        pdfBuffer: base64,
        metadata: {
          generatedAt: new Date().toISOString(),
          fileSize: pdfBuffer.length,
          pageCount: 1, // TODO: Calculate actual page count
        },
      } as PdfGenerationResult & { pdfBuffer: string });
    }

    // Return PDF file
    const filename = body.options?.outputPath || `${body.data.contractNumber}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Contract PDF generation error:', error);

    // Clean up browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PDF生成に失敗しました',
      } as PdfGenerationResult,
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS Handler - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
