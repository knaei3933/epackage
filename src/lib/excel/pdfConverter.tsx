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
} from '@react-pdf/renderer';

// @ts-ignore - These may not be available in all versions
const ReactPDF = require('@react-pdf/renderer') as any;
const PDFDownloadButton = ReactPDF.PDFDownloadButton;
const PDFViewer = ReactPDF.PDFViewer;
const BlobProvider = ReactPDF.BlobProvider;
// @ts-ignore - Font files
import NotoSansJP_Regular from '@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2';
// @ts-ignore - Font files
import NotoSansJP_Bold from '@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff2';
import type { QuotationData } from './excelQuotationTypes';

// =====================================================
// Font Registration
// =====================================================

/**
 * Register Japanese font for PDF rendering
 * Using local font files from @fontsource/noto-sans-jp
 */
Font.register({
  family: 'Noto Sans JP',
  fonts: [
    {
      src: NotoSansJP_Regular,
      fontWeight: 400,
    },
    {
      src: NotoSansJP_Bold,
      fontWeight: 700,
    },
  ],
});

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
  const stream = await pdf(<QuotationPDFDocument data={data} />).toBuffer();
  // Convert ReadableStream to Uint8Array
  const arrayBuffer = await (stream as any).arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Convert Excel quotation data to PDF base64 string
 * @param data - Excel quotation data
 * @returns Base64 encoded PDF string
 */
export async function generatePdfBase64(
  data: QuotationData
): Promise<string> {
  const blob = await pdf(<QuotationPDFDocument data={data} />).toBlob();
  // Convert blob to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string)?.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
 */
export function previewPdf(data: QuotationData): React.ReactElement {
  return (
    <PDFViewer>
      <QuotationPDFDocument data={data} />
    </PDFViewer>
  );
}

/**
 * PDF Download Button Component
 * @param data - Excel quotation data
 * @param filename - Optional filename
 * @param className - Optional CSS class
 * @param children - Button children
 */
export function PdfDownloadButton({
  data,
  filename,
  className,
  children,
}: {
  data: QuotationData;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <PDFDownloadButton
      document={<QuotationPDFDocument data={data} />}
      fileName={filename || `${data.metadata.quotationNumber}.pdf`}
      className={className}
    >
      {children || 'PDFをダウンロード'}
    </PDFDownloadButton>
  );
}

/**
 * PDF Blob Provider Component
 * Provides PDF blob to child function
 * @param data - Excel quotation data
 * @param children - Function receiving blob and url
 */
export function PdfBlobProvider({
  data,
  children,
}: {
  data: QuotationData;
  children: (params: { blob: Blob | null; url: string | null; loading: boolean; error: Error | null }) => React.ReactElement;
}) {
  return (
    <BlobProvider document={<QuotationPDFDocument data={data} />}>
      {children}
    </BlobProvider>
  );
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Validate quotation data for PDF generation
 * @param data - Excel quotation data
 * @returns Validation result with errors
 */
export function validatePdfData(data: QuotationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.customer?.companyName) {
    errors.push('Customer company name is required');
  }
  if (!data.customer?.postalCode) {
    errors.push('Customer postal code is required');
  }
  if (!data.metadata?.quotationNumber) {
    errors.push('Quotation number is required');
  }
  if (!data.orders?.length) {
    errors.push('At least one order item is required');
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
