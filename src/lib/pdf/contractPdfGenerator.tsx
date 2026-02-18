/**
 * Contract PDF Generator using @react-pdf/renderer
 *
 * 契約書PDF生成ライブラリ
 * - Playwrightの代わりに@react-pdf/rendererを使用
 * - 日本語フォント（Noto Sans JP）対応
 * - unstable_cacheによるキャッシュ機能
 */

import { unstable_cache } from 'next/cache';
import { Document, Page, Text, View, Font, StyleSheet } from '@react-pdf/renderer';
import type { ContractData } from '@/types/contract';

// ============================================================
// Font Registration
// ============================================================

// Register Noto Sans JP for Japanese text support
Font.register({
  family: 'Noto Sans JP',
  src: 'https://fonts.gstatic.com/s/notosansjp/v52/FPTMWSPYFLKtOe3Llh5yTMhk0G0WyCwMysiOOkA.ipanamp.woff2',
  fontStyle: 'normal',
  fontWeight: 400,
});

Font.register({
  family: 'Noto Sans JP',
  src: 'https://fonts.gstatic.com/s/notosansjp/v52/EITtR9ieMYA9UbqWfcGxVEyIq1dKvSGLwUB9a4L.woff2',
  fontStyle: 'normal',
  fontWeight: 700,
});

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Noto Sans JP',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #333',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: '8 12',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 15,
  },
  tableHeader: {
    backgroundColor: '#e8e8e8',
    fontWeight: 700,
  },
  tableRow: {
    borderBottom: '1 solid #ddd',
  },
  tableCell: {
    padding: '8 12',
    textAlign: 'left',
  },
  tableCellRight: {
    padding: '8 12',
    textAlign: 'right',
  },
  termBox: {
    backgroundColor: '#f9f9f9',
    border: '1 solid #ddd',
    padding: 12,
    marginBottom: 10,
  },
  termLabel: {
    fontWeight: 700,
    marginRight: 5,
  },
  signatoryBox: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    border: '1 solid #ddd',
    padding: 12,
    minHeight: 100,
  },
  signatoryName: {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 5,
  },
  signatoryInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  stampPlaceholder: {
    border: '2 dashed #999',
    padding: '15 30',
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #ddd',
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  bold: {
    fontWeight: 700,
  },
  textRight: {
    textAlign: 'right',
  },
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format date to Japanese era format (令和6年4月1日)
 */
function formatJapaneseDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const eras = [
    { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
    { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
    { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
    { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
    { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
  ];

  const era = eras.find(e => d >= e.start && d <= e.end);
  if (!era) {
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const year = d.getFullYear() - era.start.getFullYear() + 1;
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${era.name}${year}年${month}月${day}日`;
}

/**
 * Format currency to Japanese yen format
 */
function formatYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

// ============================================================
// PDF Document Component
// ============================================================

interface ContractPdfProps {
  data: ContractData;
}

function ContractPdf({ data }: ContractPdfProps) {
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.1;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>販売契約書</Text>
          <Text style={styles.subtitle}>
            契約番号: {data.contractNumber || 'N/A'}
          </Text>
          <Text style={styles.subtitle}>
            作成日: {formatJapaneseDate(data.createdAt || new Date())}
          </Text>
        </View>

        {/* Contract Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>契約当事者</Text>
          <View style={styles.termBox}>
            <Text style={styles.bold}>販売者:</Text>
            <Text>{data.seller?.name || ''}</Text>
            <Text>{data.seller?.address || ''}</Text>
          </View>
          <View style={styles.termBox}>
            <Text style={styles.bold}>購入者:</Text>
            <Text>{data.buyer?.name || ''}</Text>
            <Text>{data.buyer?.address || ''}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>契約物品</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>品名</Text>
              <Text style={styles.tableCell}>数量</Text>
              <Text style={styles.tableCell}>単位</Text>
              <Text style={styles.tableCell}>単価</Text>
              <Text style={styles.tableCell}>金額</Text>
            </View>

            {/* Rows */}
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.quantity}</Text>
                <Text style={styles.tableCell}>{item.unit}</Text>
                <Text style={styles.tableCell}>{formatYen(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.textRight]}>{formatYen(item.amount)}</Text>
              </View>
            ))}

            {/* Totals */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.textRight]} colSpan={4}>小計</Text>
              <Text style={[styles.tableCell, styles.textRight]}>{formatYen(subtotal)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.textRight]} colSpan={4}>消費税（10%）</Text>
              <Text style={[styles.tableCell, styles.textRight]}>{formatYen(tax)}</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]}>
              <Text style={[styles.tableCell, styles.bold, styles.textRight]} colSpan={4}>合計</Text>
              <Text style={[styles.tableCell, styles.bold, styles.textRight]}>{formatYen(total)}</Text>
            </View>
          </View>
        </View>

        {/* Contract Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>契約条件</Text>
          <View style={styles.termBox}>
            <Text style={styles.bold}>支払条件</Text>
            <Text><Text style={styles.termLabel}>支払方法:</Text> {data.payment?.method || ''}</Text>
            <Text><Text style={styles.termLabel}>支払期限:</Text> {data.payment?.deadline || ''}</Text>
            {data.payment?.depositPercentage && (
              <Text><Text style={styles.termLabel}>前金率:</Text> {data.payment.depositPercentage}</Text>
            )}
            {data.payment?.depositAmount && (
              <Text><Text style={styles.termLabel}>前金額:</Text> {formatYen(data.payment.depositAmount)}</Text>
            )}
          </View>
          <View style={styles.termBox}>
            <Text style={styles.bold}>納品条件</Text>
            <Text><Text style={styles.termLabel}>納期:</Text> {data.delivery?.period || ''}</Text>
            <Text><Text style={styles.termLabel}>納品場所:</Text> {data.delivery?.location || ''}</Text>
            <Text><Text style={styles.termLabel}>納品条件:</Text> {data.delivery?.conditions || ''}</Text>
            <Text><Text style={styles.termLabel}>分割納品:</Text> {data.delivery?.partialDelivery || '不可'}</Text>
          </View>
        </View>

        {/* Contract Period */}
        {data.contractStartDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>契約期間</Text>
            <View style={styles.termBox}>
              <Text><Text style={styles.termLabel}>開始日:</Text> {formatJapaneseDate(data.contractStartDate)}</Text>
              {data.contractEndDate && (
                <Text><Text style={styles.termLabel}>終了日:</Text> {formatJapaneseDate(data.contractEndDate)}</Text>
              )}
              {data.contractValidity && (
                <Text><Text style={styles.termLabel}>有効期間:</Text> {data.contractValidity}</Text>
              )}
            </View>
          </View>
        )}

        {/* Remarks */}
        {data.remarks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>備考</Text>
            <View style={styles.termBox}>
              <Text>{data.remarks}</Text>
            </View>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>署名</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Seller Signature */}
            <View style={styles.signatoryBox}>
              <Text style={styles.bold}>販売者署名</Text>
              {data.sellerSignatory ? (
                <>
                  <Text style={styles.signatoryName}>{data.sellerSignatory.name}</Text>
                  <Text style={styles.signatoryInfo}>{data.sellerSignatory.title}</Text>
                  {data.sellerSignatory.department && (
                    <Text style={styles.signatoryInfo}>{data.sellerSignatory.department}</Text>
                  )}
                  {data.sellerSignatory.date && (
                    <Text style={styles.signatoryInfo}>署名日: {formatJapaneseDate(data.sellerSignatory.date)}</Text>
                  )}
                  {data.sellerSignatory.hasStamp && (
                    <View style={styles.stampPlaceholder}>
                      <Text>印鑑</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={{ color: '#999', fontStyle: 'italic' }}>未署名</Text>
              )}
            </View>

            {/* Buyer Signature */}
            <View style={styles.signatoryBox}>
              <Text style={styles.bold}>購入者署名</Text>
              {data.buyerSignatory ? (
                <>
                  <Text style={styles.signatoryName}>{data.buyerSignatory.name}</Text>
                  <Text style={styles.signatoryInfo}>{data.buyerSignatory.title}</Text>
                  {data.buyerSignatory.department && (
                    <Text style={styles.signatoryInfo}>{data.buyerSignatory.department}</Text>
                  )}
                  {data.buyerSignatory.date && (
                    <Text style={styles.signatoryInfo}>署名日: {formatJapaneseDate(data.buyerSignatory.date)}</Text>
                  )}
                  {data.buyerSignatory.hasStamp && (
                    <View style={styles.stampPlaceholder}>
                      <Text>印鑑</Text>
                    </View>
                  )}
                </>
              ) : (
                <Text style={{ color: '#999', fontStyle: 'italic' }}>未署名</Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>本契約書は電子署名法および電子契約法に準拠しています</Text>
          <Text>This contract is compliant with the Electronic Signature Act and Electronic Contract Act</Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================
// PDF Generation with Cache
// ============================================================

/**
 * Generate PDF contract using @react-pdf/renderer
 * Results are cached for 1 hour using unstable_cache
 */
export async function generateContractPdf(data: ContractData): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');

  const pdfBuffer = await renderToBuffer(<ContractPdf data={data} />);
  return pdfBuffer;
}

/**
 * Cached version of contract PDF generation
 * Cache key based on contract data hash
 */
export const getCachedContractPdf = unstable_cache(
  async (data: ContractData): Promise<Buffer> => {
    return await generateContractPdf(data);
  },
  ['contract-pdf'],
  {
    revalidate: 3600, // 1 hour
    tags: ['contract-pdf'],
  }
);

export default ContractPdf;
