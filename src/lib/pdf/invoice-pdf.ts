/**
 * Invoice PDF Generator
 */

import html2canvas from "html2canvas";
import { jsPDF } from 'jspdf';
import type { InvoiceData, PdfGenerationOptions, PdfGenerationResult } from './types';
import { JAPANESE_CONSTANTS } from './constants';
import { formatJapaneseDate, formatYen, calculateTotals } from './format-helpers';
import { sanitizePdfHtml } from './sanitize';
import { validatePdfData } from './validation';

/**
 * Generate Invoice PDF (Japanese format)
 *
 * 日本語形式で請求書PDFを生成
 *
 * @param data - Invoice data
 * @param options - PDF generation options
 * @returns PDF generation result with base64 or buffer
 */
export async function generateInvoicePDF(
  data: InvoiceData,
  options: PdfGenerationOptions = {}
): Promise<PdfGenerationResult> {
  try {
    // Validate data
    const validation = validatePdfData(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        errorEn: validation.errors.join(', '),
      };
    }

    // Calculate totals
    const { subtotal, tax, total } = calculateTotals(data.items);

    // Create HTML template for invoice
    const html = generateInvoiceHTML(data, { subtotal, tax, total });

    // Create a temporary DOM element for rendering
    if (typeof window === 'undefined') {
      // Server-side: Return error (requires browser environment)
      return {
        success: false,
        error: '請求書PDF生成はブラウザ環境でサポートされている機能です',
        errorEn: 'Invoice PDF generation is only supported in browser environment',
      };
    }

    // Use existing PDF generation infrastructure
    const element = document.createElement('div');
    // Sanitize HTML before innerHTML to prevent XSS attacks
    element.innerHTML = sanitizePdfHtml(html);
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '210mm'; // A4 width
    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
      });

      document.body.removeChild(element);

      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Return result based on options
      if (options.returnBase64 ?? false) {
        const base64 = pdf.output('datauristring');
        return {
          success: true,
          base64,
          dataUrl: base64,
        };
      }

      if (options.returnBuffer ?? false) {
        // Browser-compatible: use Uint8Array instead of Node.js Buffer
        const arrayBuffer = pdf.output('arraybuffer');
        const uint8Array = new Uint8Array(arrayBuffer);
        return {
          success: true,
          pdfBuffer: uint8Array,
        };
      }

      // Default: download
      const filename = `Invoice_${data.invoiceNumber}.pdf`;
      pdf.save(filename);

      return {
        success: true,
        filename,
      };
    } catch (canvasError) {
      document.body.removeChild(element);
      throw canvasError;
    }
  } catch (error: unknown) {
    const errMsg = (error as { message?: string }).message;
    console.error('[Invoice PDF] Generation error:', error);
    return {
      success: false,
      error: errMsg || '請求書PDF生成中にエラーが発生しました',
      errorEn: errMsg || 'Error generating invoice PDF',
    };
  }
}

/**
 * Generate Invoice HTML template
 *
 * 請求書HTMLテンプレートを生成
 */
function generateInvoiceHTML(
  data: InvoiceData,
  totals: { subtotal: number; tax: number; total: number }
): string {
  const templates = JAPANESE_CONSTANTS.INVOICE_TEMPLATES;
  const t = templates.ja; // Use Japanese template

  // Format currency
  const formatYen = (amount: number) => { const r = Math.round(amount * 10) / 10; return `¥${r.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`; };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // Bank account info
  const bankAccount: InvoiceData['bankInfo'] = data.bankInfo;

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      width: 210mm;
      padding: 10mm;
      background: #fff;
    }

    .header {
      text-align: center;
      margin-bottom: 10mm;
      border-bottom: 2px solid #000;
      padding-bottom: 5mm;
    }

    .title {
      font-size: 24pt;
      font-weight: bold;
      letter-spacing: 0.5em;
      margin-bottom: 2mm;
    }

    .invoice-number {
      font-size: 14pt;
      font-weight: bold;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5mm;
    }

    .info-item {
      flex: 1;
    }

    .info-label {
      font-weight: bold;
      margin-bottom: 1mm;
    }

    .info-value {
      font-size: 11pt;
    }

    .party-section {
      display: flex;
      gap: 10mm;
      margin-bottom: 10mm;
    }

    .party-box {
      flex: 1;
      border: 1px solid #ccc;
      padding: 3mm;
    }

    .party-title {
      font-weight: bold;
      background: #f0f0f0;
      padding: 1mm;
      margin: -3mm -3mm 2mm -3mm;
      text-align: center;
    }

    .party-name {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 1mm;
    }

    .party-detail {
      margin-bottom: 0.5mm;
      white-space: pre-line;
    }

    .items-table {
      width: 100%;
      margin-bottom: 10mm;
      border-collapse: separate;
      border-spacing: 0;
    }

    .items-table th,
    .items-table td {
      border: 1px solid #000;
      padding: 2mm;
      text-align: left;
    }

    .items-table th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }

    .items-table td:nth-child(3),
    .items-table td:nth-child(4),
    .items-table td:nth-child(5) {
      text-align: right;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10mm;
    }

    .totals-table {
      width: 80mm;
      border-collapse: separate;
      border-spacing: 0;
    }

    .totals-table td {
      padding: 1mm 2mm;
      border: 1px solid #000;
    }

    .totals-table td:first-child {
      font-weight: bold;
    }

    .totals-table .total-row {
      background: #f0f0f0;
      font-weight: bold;
      font-size: 12pt;
    }

    .coupon-banner {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 4px;
      padding: 3mm;
      margin-bottom: 8mm;
      text-align: center;
    }

    .coupon-banner-title {
      font-weight: bold;
      font-size: 11pt;
      color: #856404;
      margin-bottom: 1mm;
    }

    .coupon-banner-detail {
      font-size: 10pt;
      color: #856404;
    }

    .totals-table .discount-row {
      color: #28a745;
    }

    .totals-table .adjusted-total-row {
      background: #e8f5e9;
      font-weight: bold;
      font-size: 12pt;
      color: #2e7d32;
    }

    .payment-section {
      border: 1px solid #ccc;
      padding: 3mm;
      margin-bottom: 5mm;
    }

    .payment-title {
      font-weight: bold;
      margin-bottom: 2mm;
    }

    .payment-detail {
      margin-bottom: 1mm;
    }

    .remarks-section {
      border: 1px solid #ccc;
      padding: 3mm;
    }

    .remarks-title {
      font-weight: bold;
      margin-bottom: 2mm;
    }

    .remarks-content {
      white-space: pre-line;
    }

    .footer {
      margin-top: 10mm;
      padding-top: 5mm;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="title">${t.title}</div>
    <div class="invoice-number">${t.invoiceNumber}: ${data.invoiceNumber}</div>
  </div>

  <!-- Info Row -->
  <div class="info-row">
    <div class="info-item">
      <div class="info-label">${t.issueDate}</div>
      <div class="info-value">${formatDate(data.issueDate)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">${t.dueDate}</div>
      <div class="info-value">${formatDate(data.dueDate)}</div>
    </div>
  </div>

  <!-- Party Section -->
  <div class="party-section">
    <div class="party-box">
      <div class="party-title">${t.supplier}</div>
      <div class="party-name">${data.supplierInfo?.companyName || ''}</div>
      <div class="party-detail">${data.supplierInfo?.address || ''}</div>
      <div class="party-detail">${data.supplierInfo?.phone || ''}</div>
      ${data.supplierInfo?.contactPerson ? `<div class="party-detail">${t.contactPerson}: ${data.supplierInfo.contactPerson}</div>` : ''}
    </div>
    <div class="party-box">
      <div class="party-title">${t.billingTo}</div>
      <div class="party-name">${data.billingName}</div>
      <div class="party-detail">${data.address || ''}</div>
      ${data.contactPerson ? `<div class="party-detail">${t.contactPerson}: ${data.contactPerson}</div>` : ''}
    </div>
  </div>

  ${data.shippingName ? `
  <div class="party-box" style="margin-bottom: 10mm;">
    <div class="party-title">${t.shippingTo}</div>
    <div class="party-name">${data.shippingName}</div>
    <div class="party-detail">${data.shippingAddress || ''}</div>
  </div>
  ` : ''}

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 10%">${t.no}</th>
        <th style="width: 35%">${t.description}</th>
        <th style="width: 15%">${t.quantity}</th>
        <th style="width: 15%">${t.unitPrice}</th>
        <th style="width: 15%">${t.amount}</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item, index) => `
        <tr>
          <td style="text-align: center">${index + 1}</td>
          <td>
            ${item.name}
            ${item.description ? `<br><small>${item.description}</small>` : ''}
          </td>
          <td style="text-align: right">${item.quantity.toLocaleString('ja-JP')} ${item.unit || ''}</td>
          <td style="text-align: right">${formatYen(item.unitPrice)}</td>
          <td style="text-align: right">${formatYen(item.amount || item.quantity * item.unitPrice)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Totals Section -->
  ${data.appliedCoupon ? `
  <!-- Coupon Banner -->
  <div class="coupon-banner" style="margin-bottom: 5mm;">
    <div class="coupon-banner-title">クーポン適用</div>
    <div class="coupon-banner-detail">
      ${data.appliedCoupon.nameJa || data.appliedCoupon.name} (${data.appliedCoupon.code}) -
      ${data.appliedCoupon.type === 'percentage' ? `${data.appliedCoupon.value}%OFF` : `${formatYen(data.appliedCoupon.value)}OFF`}
    </div>
  </div>
  ` : ''}
  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>${t.subtotal}</td>
        <td style="text-align: right">${formatYen(totals.subtotal)}</td>
      </tr>
      <tr>
        <td>${t.tax} (10%)</td>
        <td style="text-align: right">${formatYen(totals.tax)}</td>
      </tr>
      ${data.appliedCoupon ? `
      <tr class="discount-row">
        <td>クーポン割引</td>
        <td style="text-align: right">-${formatYen(data.appliedCoupon.discountAmount)}</td>
      </tr>
      ` : ''}
      <tr class="${data.adjustedTotal !== undefined && data.adjustedTotal !== totals.total ? 'adjusted-total-row' : 'total-row'}">
        <td>${data.adjustedTotal !== undefined && data.adjustedTotal !== totals.total ? '合計（割引後）' : t.total}</td>
        <td style="text-align: right">${formatYen(data.adjustedTotal !== undefined ? data.adjustedTotal : totals.total)}</td>
      </tr>
    </table>
  </div>

  <!-- Payment Section -->
  <div class="payment-section">
    <div class="payment-title">${t.paymentMethod}</div>
    <div class="payment-detail"><strong>${t.paymentMethod}:</strong> ${data.paymentMethod}</div>
    ${bankAccount?.bankName ? `
      <div class="payment-detail"><strong>${t.bankName}:</strong> ${bankAccount.bankName}</div>
    ` : ''}
    ${bankAccount?.branchName ? `
      <div class="payment-detail"><strong>${t.branchName}:</strong> ${bankAccount.branchName}</div>
    ` : ''}
    ${bankAccount?.accountType ? `
      <div class="payment-detail"><strong>${t.accountType}:</strong> ${bankAccount.accountType}</div>
    ` : ''}
    ${bankAccount?.accountNumber ? `
      <div class="payment-detail"><strong>${t.accountNumber}:</strong> ${bankAccount.accountNumber}</div>
    ` : ''}
    ${bankAccount?.accountHolder ? `
      <div class="payment-detail"><strong>${t.accountHolder}:</strong> ${bankAccount.accountHolder}</div>
    ` : ''}
  </div>

  ${data.remarks ? `
  <div class="remarks-section">
    <div class="remarks-title">${t.remarks}</div>
    <div class="remarks-content">${data.remarks}</div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <!-- フッターテキスト削除 -->
  </div>
</body>
</html>
  `.trim();
}

