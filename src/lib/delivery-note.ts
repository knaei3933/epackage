/**
 * Delivery Note / Packing Slip Generator
 *
 * 納品書・送り状発行システム
 *
 * Generates professional delivery notes and packing slips for Japanese B2B
 * Uses jsPDF for PDF generation with Japanese font support
 */

import { jsPDF } from 'jspdf';

// ============================================================
// Types
// ============================================================

export interface DeliveryNoteData {
  // Order Information
  orderNumber: string;
  orderDate: string;
  shipmentNumber: string;

  // Company Information
  shipFrom: {
    name: string;
    address: string;
    postalCode: string;
    phone: string;
    email?: string;
  };

  // Customer Information
  shipTo: {
    name: string;
    company?: string;
    department?: string;
    address: string;
    postalCode: string;
    phone?: string;
    contactPerson?: string;
  };

  // Shipping Information
  shipping: {
    carrier: 'yamato' | 'sagawa' | 'jp_post' | 'seino';
    carrierName: string;
    trackingNumber?: string;
    shippingDate: string;
    estimatedDeliveryDate?: string;
    deliveryTimeSlot?: string;
    serviceType?: string;
  };

  // Items
  items: Array<{
    code: string;
    name: string;
    nameJa?: string;
    specifications?: string;
    quantity: number;
    unit: string;
    price?: number;
    tax?: number;
    amount?: number;
  }>;

  // Additional Information
  notes?: string[];
  handlingInstructions?: string;
  internalNotes?: string;

  // Branding
  logoUrl?: string;
  stampUrl?: string;
}

// ============================================================
// Carrier Labels
// ============================================================

const CARRIER_LABELS: Record<string, { ja: string; ko: string; en: string }> = {
  yamato: { ja: 'ヤマト運輸', ko: '야마토 운송', en: 'Yamato Transport' },
  sagawa: { ja: '佐川急便', ko: '사가와 급행', en: 'Sagawa Express' },
  jp_post: { ja: '日本郵便', ko: '일본 우편', en: 'Japan Post' },
  seino: { ja: 'セイノー運輸', ko: '세이노 운송', en: 'Seino Transport' },
};

// ============================================================
// Main Generator Function
// ============================================================

/**
 * Generate delivery note PDF
 * @param data - Delivery note data
 * @returns jsPDF document instance
 */
export function generateDeliveryNote(data: DeliveryNoteData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // ============================================================
  // Header Section
  // ============================================================

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('納品書 / 送り状', pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 10;

  // Subtitle (Delivery Note)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Delivery Note / Packing Slip', pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 15;

  // ============================================================
  // Ship From Section (Left Column)
  // ============================================================

  const leftColumnX = margin;
  const rightColumnX = pageWidth / 2 + 10;

  // Ship From Label
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('送付元 / From', leftColumnX, yPosition);
  yPosition += 7;

  // Ship From Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.shipFrom.name, leftColumnX, yPosition);
  yPosition += 5;
  doc.text(`〒${data.shipFrom.postalCode}`, leftColumnX, yPosition);
  yPosition += 5;
  doc.text(data.shipFrom.address, leftColumnX, yPosition);
  yPosition += 5;
  doc.text(`TEL: ${data.shipFrom.phone}`, leftColumnX, yPosition);
  if (data.shipFrom.email) {
    yPosition += 5;
    doc.text(`Email: ${data.shipFrom.email}`, leftColumnX, yPosition);
  }

  // ============================================================
  // Ship To Section (Reset to top for right column)
  // ============================================================

  let rightColumnY = margin + 32;

  // Ship To Label
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('送付先 / To', rightColumnX, rightColumnY);
  rightColumnY += 7;

  // Ship To Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (data.shipTo.company) {
    doc.text(data.shipTo.company, rightColumnX, rightColumnY);
    rightColumnY += 5;
  }
  if (data.shipTo.department) {
    doc.text(data.shipTo.department, rightColumnX, rightColumnY);
    rightColumnY += 5;
  }

  doc.text(`${data.shipTo.name} 様`, rightColumnX, rightColumnY);
  rightColumnY += 5;
  doc.text(`〒${data.shipTo.postalCode}`, rightColumnX, rightColumnY);
  rightColumnY += 5;
  doc.text(data.shipTo.address, rightColumnX, rightColumnY);

  if (data.shipTo.phone) {
    rightColumnY += 5;
    doc.text(`TEL: ${data.shipTo.phone}`, rightColumnX, rightColumnY);
  }
  if (data.shipTo.contactPerson) {
    rightColumnY += 5;
    doc.text(`担当者: ${data.shipTo.contactPerson}`, rightColumnX, rightColumnY);
  }

  // Update yPosition based on which column was longer
  yPosition = Math.max(yPosition, rightColumnY) + 15;

  // ============================================================
  // Order Information
  // ============================================================

  // Add a border around order info
  const infoBoxHeight = 30;
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, infoBoxHeight);

  // Order Number (Left)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('注文番号 / Order No.', margin + 5, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.orderNumber, margin + 5, yPosition + 12);

  // Shipment Number (Center Left)
  doc.setFont('helvetica', 'bold');
  doc.text('出荷番号 / Shipment No.', pageWidth / 2 - 30, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.shipmentNumber, pageWidth / 2 - 30, yPosition + 12);

  // Order Date (Center Right)
  doc.setFont('helvetica', 'bold');
  doc.text('注文日 / Order Date', pageWidth / 2 + 5, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(data.orderDate), pageWidth / 2 + 5, yPosition + 12);

  // Shipping Date (Right)
  doc.setFont('helvetica', 'bold');
  doc.text('出荷日 / Ship Date', pageWidth - 55, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(data.shipping.shippingDate), pageWidth - 55, yPosition + 12);

  yPosition += infoBoxHeight + 15;

  // ============================================================
  // Shipping Information
  // ============================================================

  // Carrier Info Box
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20);

  // Carrier Name
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('配送業者 / Carrier', margin + 5, yPosition + 3);
  doc.setFont('helvetica', 'normal');
  const carrierName = CARRIER_LABELS[data.shipping.carrier]?.ja || data.shipping.carrierName;
  doc.text(carrierName, margin + 5, yPosition + 10);

  // Tracking Number (if available)
  if (data.shipping.trackingNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text('追跡番号 / Tracking No.', margin + 60, yPosition + 3);
    doc.setFont('helvetica', 'normal');
    doc.text(data.shipping.trackingNumber, margin + 60, yPosition + 10);
  }

  // Estimated Delivery (if available)
  if (data.shipping.estimatedDeliveryDate) {
    doc.setFont('helvetica', 'bold');
    doc.text('配達予定日 / Est. Delivery', pageWidth - 60, yPosition + 3);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(data.shipping.estimatedDeliveryDate), pageWidth - 60, yPosition + 10);
  }

  // Delivery Time Slot (if available)
  if (data.shipping.deliveryTimeSlot) {
    doc.setFont('helvetica', 'bold');
    doc.text('時間帯 / Time Slot', pageWidth - 60, yPosition + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(data.shipping.deliveryTimeSlot, pageWidth - 60, yPosition + 16);
  }

  yPosition += 25;

  // ============================================================
  // Items Table
  // ============================================================

  const tableTop = yPosition;
  const tableLeft = margin;
  const tableWidth = pageWidth - 2 * margin;
  const rowHeight = 8;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(tableLeft, tableTop, tableWidth, rowHeight, 'F');
  doc.setDrawColor(100, 100, 100);
  doc.line(tableLeft, tableTop + rowHeight, tableLeft + tableWidth, tableTop + rowHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  const colWidths = {
    no: 15,
    code: 30,
    name: 65,
    specs: 30,
    quantity: 25,
    unit: 15,
    price: 30,
    amount: 35,
  };

  let x = tableLeft + 2;
  doc.text('No.', x, tableTop + 5);
  x += colWidths.no;
  doc.text('商品コード', x, tableTop + 5);
  x += colWidths.code;
  doc.text('商品名', x, tableTop + 5);
  x += colWidths.name;
  doc.text('仕様', x, tableTop + 5);
  x += colWidths.specs;
  doc.text('数量', x, tableTop + 5);
  x += colWidths.quantity;
  doc.text('単位', x, tableTop + 5);
  x += colWidths.unit;
  doc.text('単価', x, tableTop + 5);
  x += colWidths.price;
  doc.text('金額', x, tableTop + 5);

  // Table Rows
  yPosition = tableTop + rowHeight;
  doc.setFont('helvetica', 'normal');

  data.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition + rowHeight > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;

      // Repeat header on new page
      doc.setFillColor(240, 240, 240);
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, 'F');
      doc.setDrawColor(100, 100, 100);
      doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);

      doc.setFont('helvetica', 'bold');
      x = tableLeft + 2;
      doc.text('No.', x, yPosition + 5);
      x += colWidths.no;
      doc.text('商品コード', x, yPosition + 5);
      x += colWidths.code;
      doc.text('商品名', x, yPosition + 5);
      x += colWidths.name;
      doc.text('仕様', x, yPosition + 5);
      x += colWidths.specs;
      doc.text('数量', x, yPosition + 5);
      x += colWidths.quantity;
      doc.text('単位', x, yPosition + 5);
      x += colWidths.unit;
      doc.text('単価', x, yPosition + 5);
      x += colWidths.price;
      doc.text('金額', x, yPosition + 5);

      yPosition += rowHeight;
      doc.setFont('helvetica', 'normal');
    }

    // Draw row border
    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);

    x = tableLeft + 2;
    doc.text(`${index + 1}`, x, yPosition + 5);
    x += colWidths.no;
    doc.text(item.code, x, yPosition + 5);
    x += colWidths.code;

    // Product name (truncate if too long)
    const name = item.nameJa || item.name;
    const truncatedName = name.length > 20 ? name.substring(0, 18) + '...' : name;
    doc.text(truncatedName, x, yPosition + 5);
    x += colWidths.name;

    // Specifications (truncate if too long)
    const specs = item.specifications || '-';
    const truncatedSpecs = specs.length > 12 ? specs.substring(0, 10) + '...' : specs;
    doc.text(truncatedSpecs, x, yPosition + 5);
    x += colWidths.specs;

    doc.text(`${item.quantity}`, x, yPosition + 5);
    x += colWidths.quantity;
    doc.text(item.unit, x, yPosition + 5);
    x += colWidths.unit;

    // Price and Amount (if available)
    if (item.price !== undefined) {
      doc.text(`¥${item.price.toLocaleString()}`, x, yPosition + 5);
      x += colWidths.price;
      const amount = item.amount || item.price * item.quantity;
      doc.text(`¥${amount.toLocaleString()}`, x, yPosition + 5);
    }

    yPosition += rowHeight;
  });

  // Table bottom border
  doc.setDrawColor(100, 100, 100);
  doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
  yPosition += 10;

  // ============================================================
  // Notes Section
  // ============================================================

  if (data.notes && data.notes.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('特記事項 / Notes', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    data.notes.forEach((note) => {
      doc.text(`・ ${note}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // ============================================================
  // Handling Instructions (if provided)
  // ============================================================

  if (data.handlingInstructions) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('取扱注意 / Handling Instructions', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const instructions = doc.splitTextToSize(data.handlingInstructions, pageWidth - 2 * margin);
    doc.text(instructions, margin + 5, yPosition);
    yPosition += instructions.length * 5 + 5;
  }

  // ============================================================
  // Footer
  // ============================================================

  const footerY = pageHeight - 30;

  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  // Company info in footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    data.shipFrom.name,
    margin,
    footerY + 10
  );
  doc.text(
    `〒${data.shipFrom.postalCode} ${data.shipFrom.address}`,
    margin,
    footerY + 16
  );
  doc.text(
    `TEL: ${data.shipFrom.phone}`,
    margin,
    footerY + 22
  );

  // Page number
  const pageCount = doc.internal.pages.length - 1;
  doc.text(
    `Page 1 of ${pageCount}`,
    pageWidth / 2,
    footerY + 16,
    { align: 'center' }
  );

  // Generation date
  doc.text(
    `発行日: ${formatDate(new Date().toISOString())}`,
    pageWidth - margin,
    footerY + 16,
    { align: 'right' }
  );

  return doc;
}

/**
 * Generate delivery note and return as blob
 * @param data - Delivery note data
 * @returns PDF blob
 */
export function generateDeliveryNoteBlob(data: DeliveryNoteData): Blob {
  const doc = generateDeliveryNote(data);
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

/**
 * Generate delivery note and return as base64
 * @param data - Delivery note data
 * @returns Base64 encoded PDF
 */
export function generateDeliveryNoteBase64(data: DeliveryNoteData): string {
  const doc = generateDeliveryNote(data);
  return doc.output('datauristring');
}

/**
 * Generate delivery note and download
 * @param data - Delivery note data
 * @param filename - Download filename (default: delivery-note-{shipmentNumber}.pdf)
 */
export function downloadDeliveryNote(
  data: DeliveryNoteData,
  filename?: string
): void {
  const doc = generateDeliveryNote(data);
  const defaultFilename = `delivery-note-${data.shipmentNumber}.pdf`;
  doc.save(filename || defaultFilename);
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format date for display (Japanese format)
 * @param dateString - ISO date string
 * @returns Formatted date string (YYYY/MM/DD)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Calculate total amount from items
 * @param items - Items array
 * @returns Total amount
 */
export function calculateTotalAmount(
  items: DeliveryNoteData['items']
): number {
  return items.reduce((total, item) => {
    if (item.amount !== undefined) {
      return total + item.amount;
    }
    if (item.price !== undefined) {
      return total + (item.price * item.quantity);
    }
    return total;
  }, 0);
}

/**
 * Calculate total tax from items
 * @param items - Items array
 * @returns Total tax
 */
export function calculateTotalTax(
  items: DeliveryNoteData['items']
): number {
  return items.reduce((total, item) => {
    if (item.tax !== undefined) {
      return total + item.tax;
    }
    return total;
  }, 0);
}

// ============================================================
// Export
// ============================================================

export const deliveryNote = {
  generateDeliveryNote,
  generateDeliveryNoteBlob,
  generateDeliveryNoteBase64,
  downloadDeliveryNote,
  calculateTotalAmount,
  calculateTotalTax,
};

export default deliveryNote;
