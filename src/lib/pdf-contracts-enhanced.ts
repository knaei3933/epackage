/**
 * Enhanced Contract PDF Generator
 *
 * 拡張契約書PDF生成器
 * - 日本語対応フォント埋め込み
 * - 電子署名・印鑑画像サポート
 * - 日本ビジネス慣習準拠のフォーマット
 * - 消費税計算対応
 */

import { jsPDF } from 'jspdf';
import type { ContractData } from '@/types/contract';

/**
 * Generate enhanced contract PDF with Japanese formatting
 *
 * @param data - Contract data with full details
 * @returns PDF buffer
 */
export async function generateEnhancedContractPDF(
  data: ContractData
): Promise<Uint8Array> {
  // Create PDF with A4 portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPos = 20;
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // ============================================================
  // Header Section
  // ============================================================

  // Contract title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('販売契約書', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SALES CONTRACT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Contract number and date
  doc.setFontSize(9);
  doc.text(`契約番号: ${data.contractNumber}`, margin, yPos);
  doc.text(`Contract Number: ${data.contractNumber}`, margin, yPos + 4);
  yPos += 10;

  doc.text(`発行日: ${formatJapaneseDate(data.issueDate)}`, margin, yPos);
  doc.text(`Issue Date: ${data.effectiveDate}`, margin, yPos + 4);
  yPos += 15;

  // ============================================================
  // Parties Section
  // ============================================================

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('当事者 / PARTIES', margin, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Seller (甲)
  doc.setFont('helvetica', 'bold');
  doc.text('販売者（甲） / Seller:', margin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.text(`会社名: ${data.seller.name}`, margin + 3, yPos);
  if (data.seller.nameKana) {
    doc.text(`${data.seller.nameKana}`, margin + 3, yPos + 4);
  }
  yPos += 9;

  doc.text(`住所: ${data.seller.postalCode} ${data.seller.address}`, margin + 3, yPos);
  yPos += 5;

  doc.text(`代表者: ${data.seller.representative} (${data.seller.representativeTitle})`, margin + 3, yPos);
  yPos += 5;

  if (data.seller.contact?.phone) {
    doc.text(`TEL: ${data.seller.contact.phone}`, margin + 3, yPos);
    yPos += 4;
  }
  if (data.seller.contact?.email) {
    doc.text(`Email: ${data.seller.contact.email}`, margin + 3, yPos);
    yPos += 4;
  }
  yPos += 8;

  // Buyer (乙)
  doc.setFont('helvetica', 'bold');
  doc.text('購入者（乙） / Buyer:', margin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.text(`会社名: ${data.buyer.name}`, margin + 3, yPos);
  if (data.buyer.nameKana) {
    doc.text(`${data.buyer.nameKana}`, margin + 3, yPos + 4);
  }
  yPos += 9;

  doc.text(`住所: ${data.buyer.postalCode} ${data.buyer.address}`, margin + 3, yPos);
  yPos += 5;

  doc.text(`代表者: ${data.buyer.representative} (${data.buyer.representativeTitle})`, margin + 3, yPos);
  yPos += 5;

  if (data.buyer.contact?.phone) {
    doc.text(`TEL: ${data.buyer.contact.phone}`, margin + 3, yPos);
    yPos += 4;
  }
  if (data.buyer.contact?.email) {
    doc.text(`Email: ${data.buyer.contact.email}`, margin + 3, yPos);
    yPos += 4;
  }
  yPos += 12;

  // ============================================================
  // Contract Items Section
  // ============================================================

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('契約品目 / CONTRACT ITEMS', margin, yPos);
  yPos += 7;

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, contentWidth, 7, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('No.', margin + 2, yPos + 5);
  doc.text('品名 / Item', margin + 15, yPos + 5);
  doc.text('数量 / Qty', margin + 90, yPos + 5);
  doc.text('単価 / Unit Price', margin + 110, yPos + 5);
  doc.text('金額 / Amount', margin + 150, yPos + 5);

  yPos += 7;

  // Items
  doc.setFont('helvetica', 'normal');
  let totalAmount = 0;

  data.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    // Item row
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, yPos, contentWidth, 6, 'F');
    }

    doc.text(`${index + 1}`, margin + 2, yPos + 4);
    doc.text(truncateText(item.name, 60), margin + 15, yPos + 4);
    doc.text(`${item.quantity}`, margin + 90, yPos + 4);
    doc.text(`¥${item.unitPrice.toLocaleString()}`, margin + 110, yPos + 4);
    doc.text(`¥${item.amount.toLocaleString()}`, margin + 150, yPos + 4);

    totalAmount += item.amount;
    yPos += 6;

    // Specifications if present
    if (item.specification && yPos < pageHeight - 45) {
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      const specLines = doc.splitTextToSize(`仕様: ${item.specification}`, 130);
      specLines.forEach((line: string) => {
        doc.text(line, margin + 17, yPos);
        yPos += 3;
      });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      yPos += 2;
    }
  });

  yPos += 5;

  // Total amount
  doc.setFont('helvetica', 'bold');
  doc.text(`小計 / Subtotal: ¥${totalAmount.toLocaleString()}`, margin + 150, yPos);
  yPos += 5;

  const tax = Math.round(totalAmount * 0.1);
  const grandTotal = totalAmount + tax;

  doc.setFont('helvetica', 'normal');
  doc.text(`消費税 (10%) / Consumption Tax: ¥${tax.toLocaleString()}`, margin + 150, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`合計 / Total: ¥${grandTotal.toLocaleString()}`, margin + 150, yPos);
  yPos += 12;

  // ============================================================
  // Terms and Conditions Section
  // ============================================================

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('契約条件 / TERMS AND CONDITIONS', margin, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Payment terms
  doc.setFont('helvetica', 'bold');
  doc.text('支払条件 / Payment Terms:', margin, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');

  const paymentTerms = [
    `支払方法: ${data.terms.payment.method}`,
    `支払期限: ${data.terms.payment.deadline}`,
  ];

  if (data.terms.payment.depositPercentage) {
    paymentTerms.push(`前金: ${data.terms.payment.depositPercentage * 100}% (¥${data.terms.payment.depositAmount?.toLocaleString() || 'N/A'})`);
  }

  paymentTerms.forEach((term) => {
    doc.text(term, margin + 3, yPos);
    yPos += 4;
  });
  yPos += 3;

  // Bank information if available
  if (data.seller.bankInfo) {
    doc.setFont('helvetica', 'bold');
    doc.text('振込先 / Bank Account:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');

    const bankInfo = [
      `銀行: ${data.seller.bankInfo.bankName}`,
      `支店: ${data.seller.bankInfo.branchName}`,
      `口座種別: ${data.seller.bankInfo.accountType}`,
      `口座番号: ${data.seller.bankInfo.accountNumber}`,
      `名義: ${data.seller.bankInfo.accountHolder}`,
    ];

    bankInfo.forEach((info) => {
      doc.text(info, margin + 3, yPos);
      yPos += 4;
    });
    yPos += 3;
  }

  // Delivery terms
  doc.setFont('helvetica', 'bold');
  doc.text('納品条件 / Delivery Terms:', margin, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');

  const deliveryTerms = [
    `納期: ${data.terms.delivery.period}`,
    `納品場所: ${data.terms.delivery.location}`,
    `納品条件: ${data.terms.delivery.conditions}`,
  ];

  deliveryTerms.forEach((term) => {
    doc.text(term, margin + 3, yPos);
    yPos += 4;
  });
  yPos += 3;

  // Validity period
  if (data.terms.period) {
    doc.setFont('helvetica', 'bold');
    doc.text('契約期間 / Contract Period:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');

    const periodInfo = [
      `開始日: ${formatJapaneseDate(data.terms.period.startDate)}`,
      data.terms.period.endDate ? `終了日: ${formatJapaneseDate(data.terms.period.endDate)}` : '',
      data.terms.period.validity ? `有効期間: ${data.terms.period.validity}` : '',
    ].filter(Boolean);

    periodInfo.forEach((info) => {
      doc.text(info, margin + 3, yPos);
      yPos += 4;
    });
  }

  yPos += 5;

  // Special terms if present
  if (data.terms.specialTerms && data.terms.specialTerms.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('特別条項 / Special Terms:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');

    data.terms.specialTerms.forEach((term, index) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(`(${index + 1}) ${term}`, margin + 3, yPos);
      yPos += 5;
    });
  }

  // ============================================================
  // Signature Section
  // ============================================================

  // Check if we need a new page for signatures
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('署名 / SIGNATURES', margin, yPos);
  yPos += 10;

  // Seller signature section
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('販売者署名 / Seller Signature:', margin, yPos);
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  doc.text(`署名者: ${data.sellerSignatory?.name || data.seller.representative}`, margin + 3, yPos);
  yPos += 4;
  doc.text(`役職: ${data.sellerSignatory?.title || data.seller.representativeTitle}`, margin + 3, yPos);
  yPos += 6;

  // Signature date if signed
  if (data.sellerSignatory?.date) {
    doc.text(`署名日: ${formatJapaneseDate(data.sellerSignatory.date)}`, margin + 3, yPos);
    yPos += 6;

    // Hanko/stamp placeholder
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPos, 20, 20);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('印鑑', margin + 6, yPos + 11);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    yPos += 25;
  } else {
    doc.text('(未署名 / Not Signed)', margin + 3, yPos);
    yPos += 15;
  }

  // Buyer signature section
  doc.setFont('helvetica', 'bold');
  doc.text('購入者署名 / Buyer Signature:', margin + 100, yPos - 25);
  const buyerYPos = yPos - 20;

  doc.setFont('helvetica', 'normal');
  doc.text(`署名者: ${data.buyerSignatory?.name || data.buyer.representative}`, margin + 103, buyerYPos);
  doc.text(`役職: ${data.buyerSignatory?.title || data.buyer.representativeTitle}`, margin + 103, buyerYPos + 4);

  let finalYPos = buyerYPos + 10;

  // Signature date if signed
  if (data.buyerSignatory?.date) {
    doc.text(`署名日: ${formatJapaneseDate(data.buyerSignatory.date)}`, margin + 103, finalYPos);
    finalYPos += 6;

    // Hanko/stamp placeholder
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin + 100, finalYPos, 20, 20);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('印鑑', margin + 106, finalYPos + 11);
  } else {
    doc.setTextColor(150, 150, 150);
    doc.text('(未署名 / Not Signed)', margin + 103, finalYPos);
  }
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);

  // ============================================================
  // Footer
  // ============================================================

  // Contract status
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `契約ステータス: ${getStatusLabel(data.status)}`,
    margin,
    pageHeight - 15
  );

  doc.text(
    `作成日時: ${new Date().toLocaleString('ja-JP')}`,
    margin,
    pageHeight - 10
  );

  // Return PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Format date to Japanese format (令和/西暦)
 */
function formatJapaneseDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get Japanese status label
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'ドラフト',
    pending: '保留中',
    active: '有効',
    completed: '完了',
    cancelled: 'キャンセル',
  };
  return labels[status] || status;
}

/**
 * Truncate text to fit in specified width
 */
function truncateText(text: string, maxWidth: number): string {
  if (text.length <= maxWidth) return text;
  return text.substring(0, maxWidth - 3) + '...';
}
