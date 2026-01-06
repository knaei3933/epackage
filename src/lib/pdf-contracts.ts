/**
 * Contract PDF Generator
 *
 * 契約書PDF生成器
 */

import { jsPDF } from 'jspdf';

/**
 * Contract data structure for PDF generation
 */
export interface ContractPDFData {
  contractNumber: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  validFrom?: string;
  validUntil?: string;
  terms?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    specifications?: any;
  }>;
  status: string;
  signatures: {
    customer: {
      signed: boolean;
      signedAt?: string;
      url?: string;
    };
    admin: {
      signed: boolean;
      signedAt?: string;
      url?: string;
    };
  };
}

/**
 * Generate Contract PDF
 *
 * 契約書PDFを生成
 *
 * @param data - Contract data
 * @returns PDF buffer
 */
export async function generateContractPDF(
  data: ContractPDFData
): Promise<Uint8Array> {
  // Create PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SALES CONTRACT', 105, yPos, { align: 'center' });
  doc.text('販売契約書', 105, yPos + 7, { align: 'center' });

  yPos += 20;

  // Contract number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contract Number: ${data.contractNumber}`, 20, yPos);
  doc.text(`契約番号: ${data.contractNumber}`, 20, yPos + 5);

  yPos += 15;

  // Parties
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES / 当事者:', 20, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer: ${data.customerName}`, 25, yPos);
  doc.text(`Email: ${data.customerEmail}`, 25, yPos + 5);

  yPos += 15;

  // Items
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRACT ITEMS / 契約品目:', 20, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');

  data.items.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(`${index + 1}. ${item.product_name}`, 25, yPos);
    doc.text(`   Quantity: ${item.quantity}`, 25, yPos + 5);
    doc.text(`   Unit Price: ${data.currency} ${item.unit_price.toLocaleString()}`, 25, yPos + 10);
    doc.text(`   Total: ${data.currency} ${item.total_price.toLocaleString()}`, 25, yPos + 15);

    yPos += 22;
  });

  // Total
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: ${data.currency} ${data.totalAmount.toLocaleString()}`, 20, yPos);

  yPos += 15;

  // Validity
  doc.setFont('helvetica', 'normal');
  if (data.validFrom) {
    doc.text(`Valid From: ${new Date(data.validFrom).toLocaleDateString('ja-JP')}`, 20, yPos);
    yPos += 5;
  }
  if (data.validUntil) {
    doc.text(`Valid Until: ${new Date(data.validUntil).toLocaleDateString('ja-JP')}`, 20, yPos);
    yPos += 5;
  }

  // Terms
  if (data.terms) {
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS AND CONDITIONS / 取引条件:', 20, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.terms, 170);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }

  // Signatures
  yPos += 15;
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURES / 署名:', 20, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');

  // Customer signature
  doc.text('Customer Signature / 顧客署名:', 20, yPos);
  if (data.signatures.customer.signed) {
    doc.text(`Signed: ${data.signatures.customer.signedAt ? new Date(data.signatures.customer.signedAt).toLocaleString('ja-JP') : 'N/A'}`, 25, yPos + 7);
    if (data.signatures.customer.url) {
      doc.text(`Signature: ${data.signatures.customer.url}`, 25, yPos + 12);
    }
  } else {
    doc.text('Status: Pending', 25, yPos + 7);
  }

  // Admin signature
  doc.text('Admin Signature / 管理者署名:', 110, yPos);
  if (data.signatures.admin.signed) {
    doc.text(`Signed: ${data.signatures.admin.signedAt ? new Date(data.signatures.admin.signedAt).toLocaleString('ja-JP') : 'N/A'}`, 115, yPos + 7);
    if (data.signatures.admin.url) {
      doc.text(`Signature: ${data.signatures.admin.url}`, 115, yPos + 12);
    }
  } else {
    doc.text('Status: Pending', 115, yPos + 7);
  }

  // Status
  yPos += 20;
  doc.setFont('helvetica', 'bold');
  doc.text(`Contract Status: ${data.status.toUpperCase()}`, 105, yPos, { align: 'center' });

  // Return PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}
