/**
 * Client-side PDF Generator
 *
 * クライアント側PDF生成機能
 * - ブラウザ環境でPDFを生成
 * - CDNからフォントを読み込み
 * - 日本語ビジネス見積書フォーマット
 */

'use client';

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
import type { QuotationData } from './excelQuotationTypes';

// =====================================================
// Font Registration (Client-side)
// =====================================================

/**
 * Convert ArrayBuffer to Base64 Data URL
 * @react-pdf/renderer requires data URL format for browser fonts
 */
function arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string = 'font/woff2'): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Register fonts for client-side PDF generation
 * Uses Google Fonts API with fallback to multiple CDNs
 * Converts ArrayBuffer to base64 data URL for @react-pdf/renderer
 */
async function registerClientFonts(): Promise<void> {
  // Check if fonts are already registered
  if ((globalThis as any).__fontsRegistered) {
    return;
  }

  // Multiple CDN sources for fallback
  const fontSources = [
    {
      name: 'Google Fonts gstatic',
      regular: 'https://fonts.gstatic.com/s/notosansjp/v25/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      bold: 'https://fonts.gstatic.com/s/notosansjp/v25/KFOkCnqEu92Fr1Mu51xMIzIFKw.woff2',
    },
    {
      name: 'unpkg CDN',
      regular: 'https://unpkg.com/@fontsource/noto-sans-jp@5.0.21/files/noto-sans-jp-japanese-400-normal.woff2',
      bold: 'https://unpkg.com/@fontsource/noto-sans-jp@5.0.21/files/noto-sans-jp-japanese-700-normal.woff2',
    },
  ];

  let lastError: Error | null = null;

  for (const source of fontSources) {
    try {
      console.log(`[Client PDF] Trying ${source.name}...`);

      // Fetch fonts from current source
      const [regularResponse, boldResponse] = await Promise.all([
        fetch(source.regular, { mode: 'cors' }),
        fetch(source.bold, { mode: 'cors' }),
      ]);

      // Check responses
      if (!regularResponse.ok || !boldResponse.ok) {
        throw new Error(`Failed to fetch: regular=${regularResponse.status}, bold=${boldResponse.status}`);
      }

      const [regularBuffer, boldBuffer] = await Promise.all([
        regularResponse.arrayBuffer(),
        boldResponse.arrayBuffer(),
      ]);

      console.log('[Client PDF] Font buffers loaded, converting to data URLs...');

      // Convert to base64 data URLs for @react-pdf/renderer
      const regularDataUrl = arrayBufferToDataUrl(regularBuffer);
      const boldDataUrl = arrayBufferToDataUrl(boldBuffer);

      console.log('[Client PDF] Registering fonts...');

      // Register fonts with data URL format
      Font.register({
        family: 'Noto Sans JP',
        fonts: [
          {
            src: regularDataUrl,
            fontWeight: 400,
            fontStyle: 'normal',
          },
          {
            src: boldDataUrl,
            fontWeight: 700,
            fontStyle: 'normal',
          },
        ],
      });

      (globalThis as any).__fontsRegistered = true;
      console.log(`[Client PDF] Fonts registered successfully from ${source.name}`);
      return; // Success - exit function
    } catch (error) {
      console.warn(`[Client PDF] Failed to fetch from ${source.name}:`, error);
      lastError = error as Error;
      // Try next source
    }
  }

  // All sources failed
  console.error('[Client PDF] All font sources failed');
  throw new Error(`Failed to register fonts from all sources. Last error: ${lastError?.message}`);
}

// =====================================================
// PDF Stylesheet
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
 * Generate PDF blob on client side
 * @param data - Quotation data
 * @returns PDF blob
 */
export async function generatePdfBlob(data: QuotationData): Promise<Blob> {
  // Note: Using standard Helvetica font for stability
  // Custom font registration is disabled due to CSP and compatibility issues

  // Generate PDF directly without custom fonts
  const doc = pdf(<QuotationPDFDocument data={data} />);
  const blob = await doc.toBlob();

  return blob;
}

/**
 * Download PDF file with automatic filename
 * @param data - Quotation data
 * @param filename - Optional filename
 */
export async function downloadPdf(data: QuotationData, filename?: string): Promise<void> {
  const blob = await generatePdfBlob(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${data.metadata.quotationNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
