/**
 * @jest-environment node
 */

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('jspdf', () => ({
  __esModule: true,
  jsPDF: jest.fn(),
}));

import {
  generateInvoicePDF,
} from '../pdf/invoice-pdf';
import {
  generateMultiQuantityPDF,
} from '../pdf/multi-quantity-pdf';
import {
  generateQuotePDF,
} from '../pdf/quote-pdf';

import type { InvoiceData, QuoteData } from '../pdf/types';

const quoteData: QuoteData = {
  quoteNumber: 'Q-GUARD',
  issueDate: '2026-09-01',
  expiryDate: '2026-10-01',
  customerName: '株式会社テスト',
  items: [{
    id: 'item',
    name: 'スタンドパウチ',
    quantity: 1,
    unit: '枚',
    unitPrice: 1,
  }],
  paymentTerms: '銀行振込',
  deliveryDate: '30日',
  deliveryLocation: '指定場所',
  validityPeriod: '30日',
};

const invoiceData: InvoiceData = {
  invoiceNumber: 'INV-GUARD',
  issueDate: '2026-09-01',
  dueDate: '2026-10-01',
  billingName: '株式会社テスト',
  items: [{
    id: 'item',
    name: '印刷制作費',
    quantity: 1,
    unit: '式',
    unitPrice: 1,
    amount: 1,
  }],
  paymentMethod: '銀行振込',
};

describe('lazy PDF generator browser-only guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns browser-only failures without loading canvas or jsPDF', async () => {
    const quote = await generateQuotePDF(quoteData);
    const invoice = await generateInvoicePDF(invoiceData);
    const multiQuantity = generateMultiQuantityPDF([{
      quantity: 1,
      unitPrice: 1,
      totalPrice: 1,
      recommendation: { method: 'digital' },
    }]);

    await expect(multiQuantity).rejects.toThrow(
      '数量パターンPDF生成はブラウザ環境でサポートされている機能です'
    );
    expect(quote.success).toBe(false);
    expect(quote.errorEn).toBe(
      'Quote PDF generation is only supported in browser environment'
    );
    expect(invoice.success).toBe(false);
    expect(invoice.errorEn).toBe(
      'Invoice PDF generation is only supported in browser environment'
    );
    expect(jest.mocked(require('html2canvas').default)).not.toHaveBeenCalled();
    expect(jest.mocked(require('jspdf').jsPDF)).not.toHaveBeenCalled();
  });
});
