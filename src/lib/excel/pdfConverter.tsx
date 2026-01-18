/**
 * PDF Converter
 *
 * PDF変換機能
 * - Excel見積もりデータからPDFを生成
 * - 日本語フォント対応 (Noto Sans JP)
 * - A4縦、日本のビジネスフォーマット
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
  pdf,
  renderToStream,
} from '@react-pdf/renderer';
import type { QuotationData } from './excelQuotationTypes';

// Client-side components (PDFDownloadButton, PDFViewer, BlobProvider) are not used
// in server-side PDF generation. They are available but need to be imported separately
// if needed for client-side rendering.

// =====================================================
// Font Registration (Dynamic)
// =====================================================

/**
 * Helper function to read font file from local node_modules
 * Works in Node.js server-side environment without Webpack issues
 */
async function fetchFontBuffer(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  const fs = require('fs');
  const path = require('path');

  try {
    console.log('[PDF] Loading fonts from local node_modules...');

    // Read font files directly from node_modules
    // Using .woff format which works better with @react-pdf/renderer
    const regularPath = path.join(
      process.cwd(),
      'node_modules',
      '@fontsource',
      'noto-sans-jp',
      'files',
      'noto-sans-jp-0-400-normal.woff'
    );

    const boldPath = path.join(
      process.cwd(),
      'node_modules',
      '@fontsource',
      'noto-sans-jp',
      'files',
      'noto-sans-jp-0-700-normal.woff'
    );

    const regularBuffer = fs.readFileSync(regularPath);
    const boldBuffer = fs.readFileSync(boldPath);

    // Convert Buffer to ArrayBuffer
    const regularArrayBuffer = regularBuffer.buffer.slice(
      regularBuffer.byteOffset,
      regularBuffer.byteOffset + regularBuffer.byteLength
    );
    const boldArrayBuffer = boldBuffer.buffer.slice(
      boldBuffer.byteOffset,
      boldBuffer.byteOffset + boldBuffer.byteLength
    );

    console.log('[PDF] Fonts loaded successfully from local files');
    return { regular: regularArrayBuffer, bold: boldArrayBuffer };
  } catch (error) {
    console.error('[PDF] Failed to load fonts from local files:', error);
    throw error;
  }
}

/**
 * Font registration cache to avoid fetching multiple times
 */
let fontsRegistered = false;

/**
 * Register Japanese font for PDF rendering
 * Uses native https module to load font from CDN as ArrayBuffer for server-side compatibility
 */
async function registerFonts() {
  if (fontsRegistered) {
    return;
  }

  try {
    console.log('[PDF] Registering fonts...');

    // Load fonts from local node_modules
    const { regular: regularBuffer, bold: boldBuffer } = await fetchFontBuffer();

    // Register fonts with @react-pdf/renderer
    Font.register({
      family: 'Noto Sans JP',
      fonts: [
        {
          src: regularBuffer,
          fontWeight: 400,
        },
        {
          src: boldBuffer,
          fontWeight: 700,
        },
      ],
    });

    fontsRegistered = true;
    console.log('[PDF] Fonts registered successfully');
  } catch (error) {
    console.error('[PDF] Failed to register fonts:', error);
    throw error;
  }
}

// =====================================================
// PDF Styles
// =====================================================

/**
 * PDF stylesheet for quotation document
 * Based on Japanese business quotation format
 */
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Noto Sans JP',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
  },

  // Header section
  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Client and supplier info
  infoSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  clientInfo: {
    flex: 1,
  },

  supplierInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },

  sectionLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
  },

  textLine: {
    marginBottom: 3,
  },

  // Payment terms
  paymentTerms: {
    marginBottom: 15,
    border: '1 solid #000',
    padding: 10,
  },

  paymentRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  paymentLabel: {
    fontWeight: 'bold',
    width: 80,
  },

  // Specifications
  specifications: {
    marginBottom: 15,
  },

  specRow: {
    flexDirection: 'row',
    marginBottom: 3,
    borderBottom: '1 solid #CCC',
    paddingBottom: 3,
  },

  specLabel: {
    fontWeight: 'bold',
    width: 100,
  },

  // Order table
  orderTable: {
    marginBottom: 15,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEE',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '2 solid #000',
  },

  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #CCC',
  },

  colNo: { width: 40 },
  colSku: { width: 60 },
  colQty: { width: 70, textAlign: 'right' },
  colUnitPrice: { width: 90, textAlign: 'right' },
  colDiscount: { width: 70, textAlign: 'right' },
  colTotal: { width: 100, textAlign: 'right' },

  // Processing options
  processingOptions: {
    marginBottom: 15,
  },

  optionRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  optionLabel: {
    width: 150,
  },

  // Order summary
  orderSummary: {
    marginTop: 10,
    borderTop: '2 solid #000',
    paddingTop: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  summaryLabel: {
    fontWeight: 'bold',
    width: 150,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },

  // Watermark
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.1,
    fontSize: 48,
    fontWeight: 'bold',
  },
});

// =====================================================
// PDF Document Component
// =====================================================

/**
 * Quotation PDF Document Component
 * @param data - Excel quotation data (QuotationData type)
 */
export const QuotationPDFDocument = ({ data }: { data: QuotationData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark */}
      {data.watermark && (
        <Text style={styles.watermark}>{data.watermark.text}</Text>
      )}

      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>見積書</Text>
      </View>

      {/* Client and Supplier Info */}
      <View style={styles.infoSection}>
        <View style={styles.clientInfo}>
          <Text style={styles.sectionLabel}>御中</Text>
          <Text style={styles.textLine}>{data.customer.companyName}</Text>
          <Text style={styles.textLine}>
            〒{data.customer.postalCode}
          </Text>
          <Text style={styles.textLine}>{data.customer.address}</Text>
          {data.customer.contactPerson && (
            <Text style={styles.textLine}>
              担当者: {data.customer.contactPerson}
            </Text>
          )}
        </View>

        <View style={styles.supplierInfo}>
          <Text style={styles.textLine}>{data.supplier.brandName}</Text>
          {data.supplier.subBrand && (
            <Text style={styles.textLine}>{data.supplier.subBrand}</Text>
          )}
          <Text style={styles.textLine}>{data.supplier.companyName}</Text>
          <Text style={styles.textLine}>
            〒{data.supplier.postalCode}
          </Text>
          <Text style={styles.textLine}>{data.supplier.address}</Text>
          <Text style={styles.textLine}>{data.supplier.phone}</Text>
          {data.supplier.email && (
            <Text style={styles.textLine}>{data.supplier.email}</Text>
          )}
        </View>
      </View>

      {/* Payment Terms */}
      <View style={styles.paymentTerms}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>見積番号:</Text>
          <Text>{data.metadata.quotationNumber}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>見積日付:</Text>
          <Text>{data.metadata.issueDate}</Text>
        </View>
        {data.metadata.validDate && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>有効期限:</Text>
            <Text>{data.metadata.validDate}</Text>
          </View>
        )}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>支払方法:</Text>
          <Text>{data.paymentTerms.paymentMethod}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>納期:</Text>
          <Text>{data.paymentTerms.deliveryDate}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>振込先:</Text>
          <Text>{data.paymentTerms.bankInfo}</Text>
        </View>
      </View>

      {/* Specifications */}
      <View style={styles.specifications}>
        <Text style={styles.sectionLabel}>仕様</Text>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>仕様番号:</Text>
          <Text>{data.specifications.specNumber}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>袋タイプ:</Text>
          <Text>{data.specifications.pouchType}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>内容物:</Text>
          <Text>{data.specifications.contents}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>サイズ:</Text>
          <Text>{data.specifications.size}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>素材:</Text>
          <Text>{data.specifications.material}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>シール幅:</Text>
          <Text>{data.specifications.sealWidth}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>封入方向:</Text>
          <Text>{data.specifications.fillDirection}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>ノッチ形状:</Text>
          <Text>{data.specifications.notchShape}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>ノッチ位置:</Text>
          <Text>{data.specifications.notchPosition}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>吊り下げ加工:</Text>
          <Text>{data.specifications.hangingHole ? 'あり' : 'なし'}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>吊り下げ位置:</Text>
          <Text>{data.specifications.hangingPosition}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>チャック位置:</Text>
          <Text>{data.specifications.ziplockPosition}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>角加工:</Text>
          <Text>{data.specifications.cornerRadius}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.orderTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.colNo}>No.</Text>
          <Text style={styles.colSku}>SKU</Text>
          <Text style={styles.colQty}>数量</Text>
          <Text style={styles.colUnitPrice}>単価</Text>
          <Text style={styles.colDiscount}>割引</Text>
          <Text style={styles.colTotal}>合計(税別)</Text>
        </View>

        {data.orders.map((order) => (
          <View key={order.no} style={styles.tableRow}>
            <Text style={styles.colNo}>{order.no}</Text>
            <Text style={styles.colSku}>{order.skuCount}</Text>
            <Text style={styles.colQty}>{order.quantity.toLocaleString()}</Text>
            <Text style={styles.colUnitPrice}>¥{order.unitPrice.toFixed(1)}</Text>
            <Text style={styles.colDiscount}>{order.discount > 0 ? `¥${order.discount}` : '-'}</Text>
            <Text style={styles.colTotal}>¥{order.total.toLocaleString()}</Text>
          </View>
        ))}

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>品目数:</Text>
            <Text>{data.orderSummary.totalSkuCount} SKU</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>総数量:</Text>
            <Text>{data.orderSummary.totalQuantity.toLocaleString()} 個</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>小計(税別):</Text>
            <Text>¥{data.orderSummary.subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>消費税({(data.orderSummary.taxRate * 100).toFixed(0)}%):</Text>
            <Text>¥{data.orderSummary.taxAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontSize: 12 }]}>総額(税込):</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>¥{data.orderSummary.totalWithTax.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Processing Options */}
      <View style={styles.processingOptions}>
        <Text style={styles.sectionLabel}>加工オプション</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>チャック:</Text>
          <Text>{data.options.ziplock ? '○' : '-'}</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>ノッチ:</Text>
          <Text>{data.options.notch ? '○' : '-'}</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>吊り下げ穴:</Text>
          <Text>{data.options.hangingHole ? '○' : '-'}</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>角加工:</Text>
          <Text>{data.options.cornerRound ? '○' : '-'}</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>ガス抜きバルブ:</Text>
          <Text>{data.options.gasVent ? '○' : '-'}</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Easy Cut:</Text>
          <Text>{data.options.easyCut ? '○' : '-'}</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>型抜き:</Text>
          <Text>{data.options.embossing ? '○' : '-'}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer} fixed>
        本見積書の有効期限は {data.metadata.validDate || '指定なし'} です
      </Text>
    </Page>
  </Document>
);

// =====================================================
// PDF Generation Functions
// =====================================================

/**
 * Generate PDF document from Excel quotation data
 * @param data - Excel quotation data
 * @returns PDF blob
 */
export async function generatePdfDocument(
  data: QuotationData
): Promise<Blob> {
  // Ensure fonts are registered before generating PDF
  await registerFonts();

  const blob = await pdf(<QuotationPDFDocument data={data} />).toBlob();
  return blob;
}

/**
 * Generate PDF buffer from Excel quotation data
 * @param data - Excel quotation data
 * @returns PDF buffer
 */
export async function generatePdfBuffer(
  data: QuotationData
): Promise<Uint8Array> {
  // Ensure fonts are registered before generating PDF
  await registerFonts();

  // Use pdf() directly and handle the result with proper type checking
  const doc = pdf(<QuotationPDFDocument data={data} />);

  // Wait for the document to be ready
  await doc.toBlob(); // This triggers the PDF generation

  // The pdf() function's internal state now contains the generated PDF
  // We need to access it through the blob, but toBlob has the dataUrl.split issue
  // Let's try a workaround: use the base64 approach with proper type handling

  try {
    // Try toString() which returns base64 data URL
    const result = await doc.toString();

    // Handle different return types
    if (typeof result === 'string') {
      // Remove data URL prefix if present
      const base64Data = result.replace(/^data:application\/pdf;base64,/, '');
      return Uint8Array.from(Buffer.from(base64Data, 'base64'));
    } else if (result instanceof Uint8Array) {
      return result;
    } else if (Buffer.isBuffer(result)) {
      return new Uint8Array(result.buffer, result.byteOffset, result.byteLength);
    } else {
      // Last resort: try to convert whatever we got
      console.warn('[PDF] Unexpected return type from toString():', typeof result);
      throw new Error(`Unexpected PDF generation result type: ${typeof result}`);
    }
  } catch (error) {
    console.error('[PDF] Failed to generate PDF using toString():', error);

    // Fallback: Try to get the blob and convert it
    try {
      const blob = await doc.toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (blobError) {
      console.error('[PDF] Fallback toBlob() also failed:', blobError);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Convert Excel quotation data to PDF base64 string
 * @param data - Excel quotation data
 * @returns Base64 encoded PDF string
 */
export async function generatePdfBase64(
  data: QuotationData
): Promise<string> {
  // Ensure fonts are registered before generating PDF
  await registerFonts();

  // Use pdf() directly and handle the result with proper type checking
  const doc = pdf(<QuotationPDFDocument data={data} />);

  // Wait for the document to be ready
  await doc.toBlob(); // This triggers the PDF generation

  try {
    // Try toString() which returns base64 data URL
    const result = await doc.toString();

    // Handle different return types
    if (typeof result === 'string') {
      // Remove data URL prefix if present and return just the base64
      return result.replace(/^data:application\/pdf;base64,/, '');
    } else if (result instanceof Uint8Array) {
      return Buffer.from(result.buffer, result.byteOffset, result.byteLength).toString('base64');
    } else if (Buffer.isBuffer(result)) {
      return result.toString('base64');
    } else {
      console.warn('[PDF] Unexpected return type from toString():', typeof result);
      throw new Error(`Unexpected PDF generation result type: ${typeof result}`);
    }
  } catch (error) {
    console.error('[PDF] Failed to generate PDF using toString():', error);

    // Fallback: Try to get the blob and convert it
    try {
      const blob = await doc.toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    } catch (blobError) {
      console.error('[PDF] Fallback toBlob() also failed:', blobError);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Download PDF file with automatic filename
 * @param data - Excel quotation data
 * @param filename - Optional filename (defaults to quotation number)
 */
export async function downloadPdf(
  data: QuotationData,
  filename?: string
): Promise<void> {
  const blob = await generatePdfDocument(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${data.metadata.quotationNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Preview PDF in browser
 * @param data - Excel quotation data
 *
 * NOTE: Client-side components (PDFViewer, PDFDownloadButton, BlobProvider) are not exported
 * because @react-pdf/renderer's client components cause ESM import issues in Next.js 16.
 * Use the server-side generatePdfBuffer() and downloadPdf() functions instead.
 */
// export function previewPdf(data: QuotationData): React.ReactElement {
//   Client-side PDF preview not available due to ESM import restrictions.
//   Use server-side PDF generation via /api/member/quotations/[id]/export endpoint.
// }

/**
 * PDF Download Button Component
 * NOTE: Client-side components are not exported due to ESM import restrictions.
 * Use the downloadPdf() function or the API endpoint instead.
 */
// export function PdfDownloadButton(...) { ... }

/**
 * PDF Blob Provider Component
 * NOTE: Client-side components are not exported due to ESM import restrictions.
 * Use the server-side PDF generation functions instead.
 */
// export function PdfBlobProvider(...) { ... }

// =====================================================
// Utility Functions
// =====================================================

/**
 * Validate quotation data for PDF generation
 * @param data - Excel quotation data
 * @returns Validation result with errors
 *
 * Note: Customer fields like postalCode can be empty - the PDF template
 * will use default values. We only validate critical fields that prevent
 * PDF generation entirely.
 */
export function validatePdfData(data: QuotationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Only validate critical fields - customer details have defaults in the template
  if (!data.metadata?.quotationNumber) {
    errors.push('Quotation number is required');
  }
  if (!data.orders?.length) {
    errors.push('At least one order item is required');
  }
  if (!data.supplier) {
    errors.push('Supplier information is required');
  }
  if (!data.paymentTerms) {
    errors.push('Payment terms are required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate PDF file size estimate
 * @param data - Excel quotation data
 * @returns Estimated file size in bytes
 */
export function estimatePdfSize(data: QuotationData): number {
  // Rough estimation: ~1000 bytes per page + 50 bytes per item
  const baseSize = 1000;
  const itemsSize = data.orders.length * 50;
  const specsSize = Object.keys(data.specifications).length * 30;
  const optionsSize = Object.keys(data.options).length * 20;

  return baseSize + itemsSize + specsSize + optionsSize;
}

/**
 * Check if PDF size is within limits (500KB)
 * @param data - Excel quotation data
 * @returns True if estimated size is within limit
 */
export function isPdfSizeAcceptable(data: QuotationData): boolean {
  const estimatedSize = estimatePdfSize(data);
  const maxSize = 500 * 1024; // 500KB
  return estimatedSize <= maxSize;
}
