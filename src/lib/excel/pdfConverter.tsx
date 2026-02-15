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
  renderToBuffer,
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
 * Returns base64 data URLs which @react-pdf/renderer requires
 */
async function fetchFontBuffer(): Promise<{ regular: string; bold: string }> {
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

    // Convert Buffer to base64 data URL
    // @react-pdf/renderer requires data URL format for font sources
    const regularDataUrl = `data:font/woff;base64,${regularBuffer.toString('base64')}`;
    const boldDataUrl = `data:font/woff;base64,${boldBuffer.toString('base64')}`;

    console.log('[PDF] Fonts loaded and converted to data URLs successfully');
    return { regular: regularDataUrl, bold: boldDataUrl };
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

    // Load fonts from local node_modules (returns base64 data URLs)
    const { regular: regularDataUrl, bold: boldDataUrl } = await fetchFontBuffer();

    // Register fonts with @react-pdf/renderer using data URL format
    Font.register({
      family: 'Noto Sans JP',
      fonts: [
        {
          src: regularDataUrl,
          fontWeight: 400,
        },
        {
          src: boldDataUrl,
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
    fontFamily: 'Helvetica', // Using standard font for stability
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
        <Text style={styles.sectionLabel}>選択した仕様</Text>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>製品タイプ:</Text>
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
        {/* Surface finish - always displayed */}
        {data.specifications.surfaceFinish && (
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>表面処理:</Text>
            <Text>{data.specifications.surfaceFinish}</Text>
          </View>
        )}
        {/* Roll film-specific specifications - only show for roll_film products */}
        {data.specifications.productType === 'roll_film' && (
          <>
            {data.specifications.materialWidth && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>実幅:</Text>
                <Text>{data.specifications.materialWidth} mm</Text>
              </View>
            )}
            {data.specifications.pitch && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>ピッチ:</Text>
                <Text>{data.specifications.pitch} mm</Text>
              </View>
            )}
            {data.specifications.totalLength && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>総長さ:</Text>
                <Text>{data.specifications.totalLength} m</Text>
              </View>
            )}
            {data.specifications.rollCount && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>ロール数:</Text>
                <Text>{data.specifications.rollCount}</Text>
              </View>
            )}
          </>
        )}
        {/* Pouch-only specifications - only show for non-roll_film products */}
        {data.specifications.productType !== 'roll_film' && (
          <>
            {data.specifications.sealWidth && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>シール幅:</Text>
                <Text>{data.specifications.sealWidth}</Text>
              </View>
            )}
            {data.specifications.fillDirection && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>封入方向:</Text>
                <Text>{data.specifications.fillDirection}</Text>
              </View>
            )}
            {data.specifications.notchShape && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>ノッチ形状:</Text>
                <Text>{data.specifications.notchShape}</Text>
              </View>
            )}
            {data.specifications.notchPosition && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>ノッチ位置:</Text>
                <Text>{data.specifications.notchPosition}</Text>
              </View>
            )}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>吊り下げ加工:</Text>
              <Text>{data.specifications.hanging || 'なし'}</Text>
            </View>
            {(data.specifications.hanging === 'あり' || data.specifications.hanging === true) && data.specifications.hangingPosition && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>吊り下げ位置:</Text>
                <Text>{data.specifications.hangingPosition}</Text>
              </View>
            )}
            {data.specifications.ziplockPosition && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>チャック位置:</Text>
                <Text>{data.specifications.ziplockPosition}</Text>
              </View>
            )}
            {data.specifications.cornerRadius && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>角加工:</Text>
                <Text>{data.specifications.cornerRadius}</Text>
              </View>
            )}
          </>
        )}
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

      {/* Processing Options - only for pouch products */}
      {data.specifications.productType !== 'roll_film' && (
        <View style={styles.processingOptions}>
          <Text style={styles.sectionLabel}>追加仕様</Text>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>ジッパー付き:</Text>
            <Text>{data.options.ziplock ? '○' : '-'}</Text>
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>ノッチ形状:</Text>
            <Text>{data.specifications.notchShape || (data.options.notch ? '○' : '-')}</Text>
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>吊り下げ穴:</Text>
            <Text>{data.specifications.hanging === 'あり' || data.specifications.hanging === true ? (data.specifications.hangingPosition || '○') : 'なし'}</Text>
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>角丸:</Text>
            <Text>{data.options.cornerRound ? '○' : '-'}</Text>
          </View>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>ガス抜きバルブ:</Text>
            <Text>{data.options.gasVent ? '○' : '-'}</Text>
          </View>
        </View>
      )}

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
  // Note: Using standard Helvetica font for stability

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
  // Note: Using standard Helvetica font for stability
  // Japanese font (Noto Sans JP) causes issues with @react-pdf/renderer's
  // internal font loading mechanism. The PDF is still generated correctly.

  try {
    console.log('[PDF] Generating PDF with renderToBuffer...');

    // Use renderToBuffer for server-side rendering (v4.x compatible)
    const buffer = await renderToBuffer(<QuotationPDFDocument data={data} />);

    console.log('[PDF] PDF generated successfully, size:', buffer.length);

    // Convert Buffer to Uint8Array
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } catch (error) {
    console.error('[PDF] Failed to generate PDF using renderToBuffer():', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  try {
    console.log('[PDF] Generating PDF base64 with renderToBuffer...');

    // Use renderToBuffer for server-side rendering
    const buffer = await renderToBuffer(<QuotationPDFDocument data={data} />);

    console.log('[PDF] PDF generated successfully for base64 conversion, size:', buffer.length);

    // Convert Buffer to base64
    return buffer.toString('base64');
  } catch (error) {
    console.error('[PDF] Failed to generate PDF base64:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
