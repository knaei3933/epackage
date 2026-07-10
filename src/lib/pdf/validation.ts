/**
 * PDF Data Validation
 */

import type { QuoteData, InvoiceData } from './types';
import type { ContractData } from '../../types/contract';

/**
 * Validate PDF generation data
 *
 * PDF生成データの検証
 */
export function validatePdfData(
  data: QuoteData | InvoiceData | ContractData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if ('quoteNumber' in data) {
    // Quote validation
    const quote = data as QuoteData;
    if (!quote.quoteNumber) errors.push('見積番号が必要です');
    if (!quote.issueDate) errors.push('発行日が必要です');
    if (!quote.customerName) errors.push('顧客名が必要です');
    if (!quote.items || quote.items.length === 0) errors.push('明細が必要です');
  } else if ('invoiceNumber' in data) {
    // Invoice validation
    const invoice = data as InvoiceData;
    if (!invoice.invoiceNumber) errors.push('請求書番号が必要です');
    if (!invoice.issueDate) errors.push('発行日が必要です');
    if (!invoice.billingName) errors.push('請求先名が必要です');
    if (!invoice.items || invoice.items.length === 0) errors.push('明細が必要です');
  } else if ('contractNumber' in data) {
    // Contract validation
    const contract = data as ContractData;
    if (!contract.contractNumber) errors.push('契約番号が必要です');
    if (!contract.issueDate) errors.push('発行日が必要です');
    if (!contract.seller) errors.push('販売元情報が必要です');
    if (!contract.buyer) errors.push('購入元情報が必要です');
    if (!contract.items || contract.items.length === 0) errors.push('契約項目が必要です');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

