/**
 * Quotation to PDF Mapper
 *
 * Excel形式の見積もりデータをPDF生成用のQuoteData形式に変換
 * Maps QuotationData (from excelQuotationTypes) to QuoteData (for pdf-generator)
 */

import type { QuotationData } from './excelQuotationTypes';
import type { QuoteData, QuoteItem } from '@/lib/pdf-generator';

/**
 * Convert QuotationData to QuoteData for PDF generation
 * @param quotationData - Excel format quotation data
 * @returns PDF generator format quote data
 */
export function mapQuotationDataToQuoteData(quotationData: QuotationData): QuoteData {
  // Extract specifications
  const specs = quotationData.specifications;

  // Map order items to quote items
  const items: QuoteItem[] = quotationData.orders.map((order, index) => ({
    id: `item-${index + 1}`,
    name: order.name || `SKU ${order.skuCount}`,
    description: specs.size ? `サイズ: ${specs.size}` : undefined,
    quantity: order.quantity,
    unit: '枚',
    unitPrice: order.unitPrice,
    amount: order.total,
  }));

  // Extract optional processing
  const optionalProcessing = {
    zipper: quotationData.options.ziplock || false,
    notch: quotationData.options.notch || false,
    hangingHole: quotationData.options.hangingHole || false,
    hangHoleSize: specs.hangingPosition === '6mm' ? '6mm' as const : specs.hangingPosition === '8mm' ? '8mm' as const : undefined,
    cornerProcessing: quotationData.options.cornerRound || false,
    gasValve: quotationData.options.gasVent || false,
    easyCut: quotationData.options.easyCut || false,
    dieCut: quotationData.options.embossing || false,
    surfaceFinish: specs.surfaceFinish === '光沢仕上げ' ? '光沢' as const : specs.surfaceFinish === 'マット仕上げ' ? 'マット' as const : '光沢' as const,
    zipperPositionSpecified: quotationData.options.ziplock || false,
    openingPosition: '上端' as const,
  };

  // Extract specifications
  const specifications = {
    specNumber: specs.specNumber || 'L',
    bagType: specs.pouchTypeEn || specs.pouchType || 'Stand Pouch',
    contents: specs.contents || '',
    size: specs.size || '',
    material: specs.material || '',
    thicknessType: '', // Will be mapped from material if needed
    sealWidth: specs.sealWidth || '',
    sealDirection: specs.fillDirection === '上' ? '上端' : specs.fillDirection === '下' ? '下端' : specs.fillDirection || '',
    notchShape: specs.notchShape || '',
    notchPosition: specs.notchPosition || '',
    hanging: specs.hanging || '',
    hangingPosition: specs.hangingPosition || '',
    zipperPosition: specs.ziplockPosition || '',
    cornerR: specs.cornerRadius || '',
  };

  // Map customer info
  const customerName = quotationData.customer.companyName || quotationData.customer.contactPerson || 'お客様';

  return {
    quoteNumber: quotationData.metadata.quotationNumber,
    issueDate: formatDate(quotationData.metadata.issueDate),
    expiryDate: formatDate(quotationData.metadata.validDate || quotationData.metadata.issueDate),
    customerName,
    postalCode: quotationData.customer.postalCode,
    address: quotationData.customer.address,
    contactPerson: quotationData.customer.contactPerson,
    phone: quotationData.customer.phone,
    email: quotationData.customer.email,
    items,
    specifications,
    optionalProcessing,
    paymentTerms: quotationData.paymentTerms.paymentMethod,
    deliveryDate: quotationData.paymentTerms.deliveryDate,
    deliveryLocation: quotationData.paymentTerms.deliveryLocation,
    validityPeriod: quotationData.paymentTerms.quotationExpiry || '見積日から30日間',
    remarks: quotationData.notes,
    skuData: {
      count: quotationData.orderSummary.totalSkuCount,
      items: quotationData.orders.map((order) => ({
        skuNumber: order.skuCount,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        totalPrice: order.total,
      })),
    },
    bankInfo: quotationData.paymentTerms.bankInfo ? {
      bankName: 'PayPay銀行',
      branchName: 'ビジネス営業部支店',
      accountType: '普通' as const,
      accountNumber: '5630235',
      accountHolder: 'カネイボウエキ株式会社',
    } : undefined,
    supplierInfo: quotationData.paymentTerms.bankInfo ? {
      name: quotationData.supplier.brandName || 'EPACKAGE Lab',
      subBrand: quotationData.supplier.subBrand || 'by kanei-trade',
      companyName: quotationData.supplier.companyName || '金井貿易株式会社',
      postalCode: quotationData.supplier.postalCode || '〒673-0846',
      address: quotationData.supplier.address || '兵庫県明石市上ノ丸2-11-21',
      phone: quotationData.supplier.phone || 'TEL: 050-1793-6500',
      email: quotationData.supplier.email || 'info@package-lab.com',
    } : undefined,
  };
}

/**
 * Format date from Japanese format to YYYY-MM-DD
 * @param dateStr - Date string in Japanese format or YYYY-MM-DD
 * @returns Date in YYYY-MM-DD format
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];

  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try parsing Japanese date format (令和6年4月1日)
  const japaneseDateMatch = dateStr.match(/令和(\d+)年(\d+)月(\d+)日/);
  if (japaneseDateMatch) {
    const eraYear = parseInt(japaneseDateMatch[1], 10);
    const month = japaneseDateMatch[2].padStart(2, '0');
    const day = japaneseDateMatch[3].padStart(2, '0');
    // 令和 is Reiwa, starting from 2019
    const westernYear = 2018 + eraYear;
    return `${westernYear}-${month}-${day}`;
  }

  // Default: return today's date
  return new Date().toISOString().split('T')[0];
}
