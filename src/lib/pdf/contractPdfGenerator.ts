/**
 * Contract PDF Generator
 *
 * 契約PDFジェネレーター
 * - HTMLテンプレートから契約書PDFを生成
 * - 日本語法的フォーマット対応
 * - 電子署名・印鑑データ統合
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium as playwright } from 'playwright';
import * as Handlebars from 'handlebars';
import type {
  ContractData,
  ContractItem,
  ContractSignatory,
  PdfGenerationOptions,
  PdfGenerationResult,
  ContractParty,
  ContractTerms,
} from '@/types/contract';

// ============================================================
// Configuration
// ============================================================

const CONTRACT_TEMPLATE_PATH = path.join(
  process.cwd(),
  'templet',
  'contract_ja_kanei_trade_improved.html'
);

const DEFAULT_PDF_OPTIONS: PdfGenerationOptions = {
  format: 'A4',
  orientation: 'portrait',
  displayHeaderFooter: false,
  printBackground: true,
};

// ============================================================
// Template Processing
// ============================================================

/**
 * Load and compile HTML template
 */
async function loadTemplate(): Promise<HandlebarsTemplateDelegate> {
  const templateContent = await fs.promises.readFile(
    CONTRACT_TEMPLATE_PATH,
    'utf-8'
  );
  return Handlebars.compile(templateContent);
}

/**
 * Prepare template data from contract data
 * Maps new ContractData structure to template variables
 */
function prepareTemplateData(data: ContractData): Record<string, unknown> {
  // Map buyer/seller to client/supplier for template compatibility
  const buyer = data.buyer;
  const seller = data.seller;

  return {
    contractNumber: data.contractNumber,
    issueDate: data.issueDate,
    effectiveDate: data.effectiveDate,
    validUntil: data.validUntil || '',
    orderNumber: data.orderNumber || '',

    // Buyer (Client) information
    clientName: buyer.name,
    clientNameKana: buyer.nameKana || '',
    clientAddress: `${buyer.postalCode} ${buyer.address}`,
    clientRepresentative: buyer.representative,
    clientRepresentativeTitle: buyer.representativeTitle,
    clientPhone: buyer.contact?.phone || '',
    clientEmail: buyer.contact?.email || '',

    // Seller (Supplier) information
    supplierName: seller.name,
    supplierNameKana: seller.nameKana || '',
    supplierAddress: `${seller.postalCode} ${seller.address}`,
    supplierRepresentative: seller.representative,
    supplierRepresentativeTitle: seller.representativeTitle,

    // Contract items
    items: data.items.map(item => ({
      ...item,
      unitPrice: item.unitPrice.toLocaleString('ja-JP'),
      amount: item.amount.toLocaleString('ja-JP'),
    })),

    // Calculate totals
    totalAmount: data.items.reduce((sum, item) => sum + item.amount, 0),
    subtotalAmount: data.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('ja-JP'),

    // Payment terms
    paymentMethod: data.terms.payment.method,
    paymentDeadline: data.terms.payment.deadline,
    depositPercentage: data.terms.payment.depositPercentage
      ? `${data.terms.payment.depositPercentage * 100}%`
      : '',
    depositAmount: data.terms.payment.depositAmount
      ? `¥${data.terms.payment.depositAmount.toLocaleString('ja-JP')}`
      : '',
    bankInfo: seller.bankInfo
      ? `${seller.bankInfo.bankName} ${seller.bankInfo.branchName} ${seller.bankInfo.accountType} ${seller.bankInfo.accountNumber}`
      : '',

    // Delivery terms
    deliveryPeriod: data.terms.delivery.period,
    deliveryLocation: data.terms.delivery.location,
    deliveryConditions: data.terms.delivery.conditions,

    // Special terms
    specialTerms: data.terms.specialTerms || [],
    hasSpecialTerms: (data.terms.specialTerms?.length || 0) > 0,

    // Remarks
    remarks: data.remarks || '',

    // Signatory images (buyer = client, seller = supplier)
    clientStamp: data.buyerSignatory?.stamp?.imageUrl || '',
    clientSignature: data.buyerSignatory?.signature?.imageUrl || '',
    supplierStamp: data.sellerSignatory?.stamp?.imageUrl || '',
    supplierSignature: data.sellerSignatory?.signature?.imageUrl || '',

    // Signatory dates
    clientSignDate: data.buyerSignatory?.date || '',
    supplierSignDate: data.sellerSignatory?.date || '',

    // Signatory names
    clientSignName: data.buyerSignatory?.name || buyer.representative,
    supplierSignName: data.sellerSignatory?.name || seller.representative,

    // Signatory flags
    hasClientStamp: !!data.buyerSignatory?.stamp,
    hasClientSignature: !!data.buyerSignatory?.signature,
    hasSupplierStamp: !!data.sellerSignatory?.stamp,
    hasSupplierSignature: !!data.sellerSignatory?.signature,
  };
}

// ============================================================
// PDF Generation Functions
// ============================================================

/**
 * Generate contract PDF from contract data
 * @param data - Contract data
 * @param options - PDF generation options
 * @returns PDF generation result
 */
export async function generateContractPdf(
  data: ContractData,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };

  let browser = null;
  let page = null;

  try {
    // Verify template exists
    if (!fs.existsSync(CONTRACT_TEMPLATE_PATH)) {
      return {
        success: false,
        error: `Contract template not found: ${CONTRACT_TEMPLATE_PATH}`,
      };
    }

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
    // Type assertion for Puppeteer PDF options (orientation is valid in Playwright's PDF options)
    const pdfBuffer = await page.pdf({
      format: opts.format,
      orientation: opts.orientation as 'portrait' | 'landscape',
      displayHeaderFooter: opts.displayHeaderFooter,
      printBackground: opts.printBackground,
    });

    // Save to file if output path specified
    if (opts.outputPath) {
      await fs.promises.mkdir(path.dirname(opts.outputPath), { recursive: true });
      await fs.promises.writeFile(opts.outputPath, pdfBuffer);
      return {
        success: true,
        filePath: opts.outputPath,
        buffer: Buffer.from(pdfBuffer),
      };
    }

    return {
      success: true,
      buffer: Buffer.from(pdfBuffer),
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
 * Generate contract PDF and return as base64 string
 * @param data - Contract data
 * @returns Base64 encoded PDF
 */
export async function generateContractPdfBase64(
  data: ContractData
): Promise<{ success: boolean; base64?: string; error?: string }> {
  const result = await generateContractPdf(data);

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
 * Generate contract PDF with custom styling
 * @param data - Contract data
 * @param customCss - Custom CSS to inject
 * @param options - PDF generation options
 * @returns PDF generation result
 */
export async function generateContractPdfWithStyling(
  data: ContractData,
  customCss: string,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };

  let browser = null;
  let page = null;

  try {
    // Load and compile template
    const template = await loadTemplate();
    const templateData = prepareTemplateData(data);
    const html = template(templateData);

    browser = await playwright.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();

    // Inject custom CSS
    await page.addStyleTag({ content: customCss });

    // Set content and generate PDF
    await page.setContent(html, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Type assertion for Puppeteer PDF options (orientation is valid in Playwright's PDF options)
    const pdfBuffer = await page.pdf({
      format: opts.format,
      orientation: opts.orientation as 'portrait' | 'landscape',
      displayHeaderFooter: opts.displayHeaderFooter,
      printBackground: opts.printBackground,
    });

    if (opts.outputPath) {
      await fs.promises.mkdir(path.dirname(opts.outputPath), { recursive: true });
      await fs.promises.writeFile(opts.outputPath, pdfBuffer);
      return {
        success: true,
        filePath: opts.outputPath,
        buffer: Buffer.from(pdfBuffer),
      };
    }

    return {
      success: true,
      buffer: Buffer.from(pdfBuffer),
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Validate contract data for PDF generation
 * @param data - Contract data to validate
 * @returns Validation result
 */
export function validateContractData(
  data: ContractData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.contractNumber) {
    errors.push('Contract number is required');
  }
  if (!data.issueDate) {
    errors.push('Issue date is required');
  }
  if (!data.effectiveDate) {
    errors.push('Effective date is required');
  }
  if (!data.buyer?.name) {
    errors.push('Buyer name is required');
  }
  if (!data.seller?.name) {
    errors.push('Seller name is required');
  }
  if (!data.items?.length) {
    errors.push('At least one contract item is required');
  }
  if (!data.terms?.payment?.method) {
    errors.push('Payment method is required');
  }
  if (!data.terms?.delivery?.period) {
    errors.push('Delivery period is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate PDF file size
 * @param data - Contract data
 * @returns Estimated size in bytes
 */
export function estimateContractPdfSize(data: ContractData): number {
  // Rough estimation: ~2000 bytes base + 500 bytes per item + 1000 bytes per signatory
  const baseSize = 2000;
  const itemsSize = data.items.length * 500;
  const signatorySize = (data.buyerSignatory ? 1 : 0) * 1000 +
                       (data.sellerSignatory ? 1 : 0) * 1000;
  const attachmentSize = (data.attachments?.length || 0) * 500;

  return baseSize + itemsSize + signatorySize + attachmentSize;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Format date to Japanese format
 * @param date - Date object or ISO string
 * @returns Formatted date string (令和6年4月1日)
 */
export function formatJapaneseContractDate(date: Date | string): string {
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

  // Fallback to Western calendar
  return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
}

/**
 * Create mock contract data for testing
 * @returns Mock contract data
 */
export function createMockContractData(): ContractData {
  return {
    contractNumber: 'CTR-2024-001',
    issueDate: '2024-04-01',
    effectiveDate: '2024-04-15',
    validUntil: '2025-04-14',
    orderNumber: 'ORD-2024-001',
    status: 'active',

    // Buyer (乙 - 購入者)
    buyer: {
      name: 'テスト株式会社',
      nameKana: 'テストカブシキガイシャ',
      postalCode: '100-0001',
      address: '東京都千代田区千代田1-1-1',
      representative: '山田 太郎',
      representativeTitle: '代表取締役',
      contact: {
        phone: '03-1234-5678',
        email: 'test@example.com',
        fax: '03-1234-5679',
      },
    },

    // Seller (甲 - 販売者)
    seller: {
      name: 'EPACKAGE Lab株式会社',
      nameKana: 'イーパックケージラボカブシキガイシャ',
      postalCode: '673-0846',
      address: '兵庫県明石市上ノ丸2-11-21',
      representative: '金井 一郎',
      representativeTitle: '代表取締役',
      contact: {
        phone: '050-1793-6500',
        email: 'info@package-lab.com',
      },
      bankInfo: {
        bankName: 'PayPay銀行',
        branchName: 'ビジネス営業部支店',
        accountType: '普通',
        accountNumber: '5630235',
        accountHolder: '金井貿易株式会社',
      },
    },

    // Contract items
    items: [
      {
        id: 'ITEM-001',
        name: 'オーダーメイドバッグ（スタンドパウチ）',
        specification: 'サイズ: A4、素材: PET/AL/PE、厚み: 100μm',
        quantity: 1000,
        unit: '個',
        unitPrice: 150,
        amount: 150000,
        remarks: '特別仕様',
      },
    ],

    // Contract terms
    terms: {
      payment: {
        method: '銀行振込',
        deadline: '納品後30日以内',
        depositPercentage: 0.3,
        depositAmount: 45000,
      },
      delivery: {
        period: '契約日から約30日',
        location: '貴社指定場所',
        conditions: '分割納品可能',
        partialDelivery: true,
      },
      period: {
        startDate: '2024-04-15',
        endDate: '2025-04-14',
        validity: '1年間',
      },
      specialTerms: [
        '本契約に定める以外の事項については、別途合意書により定める。',
        '本契約の有効期間は、発行日から1年間とする。',
      ],
    },

    // Signatories
    sellerSignatory: {
      name: '金井 一郎',
      title: '代表取締役',
      date: '2024-04-01',
    },
    buyerSignatory: {
      name: '山田 太郎',
      title: '代表取締役',
      date: '2024-04-01',
    },

    // Remarks
    remarks: 'テスト用契約書です。',
  };
}
