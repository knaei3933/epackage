/**
 * Epackage Lab Email Templates
 *
 * Epackage Lab 専用メールテンプレート
 * 日本語ビジネスマナーに準拠したB2Bメールテンプレート
 *
 * @module lib/email/epack-templates
 */

// ============================================================
// Type Definitions
// ============================================================

export interface EpackEmailData {
  order_id?: string
  order_number?: string
  quotation_id?: string
  quotation_number?: string
  customer_name: string
  customer_email: string
  company_name?: string
  product_name?: string
  view_url: string
  [key: string]: any
}

// ============================================================
// Bank Information (振込先銀行口座)
// ============================================================

import { getBankInfoText, getBankInfoHtml, getFooterText } from './email-settings';
import type { BankInfo, CompanyInfo } from '@/types/email';

// Synchronous fallback for bank info text (used in templates)
const DEFAULT_BANK_INFO: BankInfo = {
  bank_name: 'PayPay銀行',
  branch_name: 'ビジネス営業部支店(005)',
  account_type: '普通',
  account_number: '5630235',
  account_holder: 'カネイボウエキ（カ',
};

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  company_name_ja: 'イーパックラボ',
  company_name_en: 'EPackage Lab',
  support_email: 'support@epackage-lab.com',
  support_phone: 'XX-XXXX-XXXX',
  postal_code: '000-0000',
  address: '東京都〇〇区〇〇1-2-3',
};

// Generate bank info text synchronously (with optional bankInfo parameter)
function getBankInfoTextSync(bankInfo: BankInfo = DEFAULT_BANK_INFO): string {
  return `
振込先銀行口座
━━━━━━━━━━━━━━━━━━━━
銀行名：${bankInfo.bank_name}
支店名：${bankInfo.branch_name}
預金種目：${bankInfo.account_type}
口座番号：${bankInfo.account_number}
口座名義：${bankInfo.account_holder}
━━━━━━━━━━━━━━━━━━━━
`.trim();
}

// Generate bank info HTML synchronously (with optional bankInfo parameter)
function getBankInfoHtmlSync(bankInfo: BankInfo = DEFAULT_BANK_INFO): string {
  return `
      <div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px;">
        <strong style="display: block; margin-bottom: 10px;">振込先銀行口座</strong>
        <div style="line-height: 1.8;">
          銀行名：${bankInfo.bank_name}<br>
          支店名：${bankInfo.branch_name}<br>
          預金種目：${bankInfo.account_type}<br>
          口座番号：${bankInfo.account_number}<br>
          口座名義：${bankInfo.account_holder}
        </div>
      </div>
  `.trim();
}

// Legacy constant for backward compatibility (uses default values)
const BANK_INFO = getBankInfoTextSync()

// ============================================================
// Common Email Components
// ============================================================

// Generate footer text synchronously (with optional companyInfo parameter)
function getFooterTextSync(year: number = new Date().getFullYear(), companyInfo: CompanyInfo = DEFAULT_COMPANY_INFO): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${companyInfo.company_name_en} (${companyInfo.company_name_ja})
〒${companyInfo.postal_code}
${companyInfo.address}
TEL: ${companyInfo.support_phone}
Email: ${companyInfo.support_email}
URL: https://epackage-lab.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
本メールはシステムにより自動送信されています。
お問い合わせ: ${companyInfo.support_email}
Copyright © ${year} ${companyInfo.company_name_en}. All rights reserved.
`.trim();
}

const FOOTER = (year: number = new Date().getFullYear()) => getFooterTextSync(year)

const createHeader = (title: string, gradient: string = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => `
  <div class="header" style="background: ${gradient}; color: white; padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
  </div>`

const createInfoBox = (title: string, rows: Array<{label: string, value: string, highlight?: boolean}>) => `
  <div class="info-box" style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
    <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold;">${title}</h3>
    ${rows.map(row => `
      <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <span class="info-label" style="font-weight: bold; width: 140px; color: #666; flex-shrink: 0;">${row.label}</span>
        <span class="info-value" style="${row.highlight ? 'font-weight: bold; color: #667eea; font-size: 18px;' : ''}">${row.value}</span>
      </div>
    `).join('')}
  </div>`

const createButton = (text: string, url: string, style: string = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => `
  <div style="text-align: center; margin: 20px 0;">
    <a href="${url}" class="button" style="display: inline-block; background: ${style}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">${text}</a>
  </div>`

const createBaseHtml = (content: string, headerColor: string = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Epackage Lab (EPackage Lab)</strong></p>
      <p style="margin: 5px 0;">Email: support@epackage-lab.com</p>
      <p style="margin: 5px 0;">URL: https://epackage-lab.com</p>
      <p style="margin: 15px 0 5px 0;">本メールはシステムにより自動送信されています。</p>
      <p style="margin: 5px 0;">Copyright © ${new Date().getFullYear()} Epackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`.trim()

// ============================================================
// Template 1: Quote Ready (見積作成完了)
// ============================================================

export const quoteReadyEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】見積書が完成いたしました (${data.quotation_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご依頼いただきました見積書の作成が完了いたしました。
つきましては、下記の通りご案内申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【見積案内】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

見積番号：${data.quotation_number}
お客様名：${data.customer_name}
${data.company_name ? `会社名：${data.company_name}` : ''}

見積金額：¥${Number(data.total_amount || 0).toLocaleString('ja-JP')}（税込）
有効期限：${data.valid_until}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

詳細は以下のURLよりご確認いただけます。

${data.view_url}

見積内容をご確認いただき、ご進行使いただきたく存じます。
ご不明な点やご質問がございましたら、お気軽にお問い合わせください。

引き続き、何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('見積書が完成いたしました')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご依頼いただきました見積書の作成が完了いたしました。<br>つきましては、下記の通りご案内申し上げます。</p>

        ${createInfoBox('見積案内', [
          { label: '見積番号', value: data.quotation_number || '' },
          { label: 'お客様名', value: data.customer_name },
          ...(data.company_name ? [{ label: '会社名', value: data.company_name }] : []),
          { label: '見積金額', value: `¥${Number(data.total_amount || 0).toLocaleString('ja-JP')}（税込）`, highlight: true },
          { label: '有効期限', value: data.valid_until || '' },
        ])}

        ${createButton('見積を確認する', data.view_url)}

        <div class="info">
          <strong>📌 ご確認ください</strong><br>
          見積内容をご確認いただき、ご進行使いただきたく存じます。<br>
          ご不明な点やご質問がございましたら、お気軽にお問い合わせください。
        </div>

        <p style="margin-bottom: 0;">引き続き、何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content)
  }
}

// ============================================================
// Template 2: Quote Approved (見積承認完了)
// ============================================================

export const quoteApprovedEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】見積を承認いたしました (${data.quotation_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご提出いただきました見積書の承認が完了いたしましたことを
ご通知申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【見積承認完了】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

見積番号：${data.quotation_number}
承認日時：${new Date().toLocaleString('ja-JP')}
見積金額：¥${Number(data.total_amount || 0).toLocaleString('ja-JP')}（税込）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

つきましては、本件に基づき製造を開始させていただきます。

今後の進捗については、順次ご案内させていただきます。

見積詳細は以下のURLよりご確認いただけます。

${data.view_url}

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('見積を承認いたしました', 'linear-gradient(135deg, #10b981 0%, #059669 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご提出いただきました見積書の承認が完了いたしましたことを<br>ご通知申し上げます。</p>

        ${createInfoBox('見積承認完了', [
          { label: '見積番号', value: data.quotation_number || '' },
          { label: '承認日時', value: new Date().toLocaleString('ja-JP') },
          { label: '見積金額', value: `¥${Number(data.total_amount || 0).toLocaleString('ja-JP')}（税込）`, highlight: true },
        ])}

        ${createButton('見積を確認する', data.view_url, 'linear-gradient(135deg, #10b981 0%, #059669 100%)')}

        <div class="success">
          <strong>✅ 製造開始のご案内</strong><br>
          つきましては、本件に基づき製造を開始させていただきます。<br>
          今後の進捗については、順次ご案内させていただきます。
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #10b981 0%, #059669 100%)')
  }
}

// ============================================================
// Template 3: Data Upload Request (データ入稿依頼)
// ============================================================

export const dataUploadRequestEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】データ入稿のお願い (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご注文いただきました商品の製造を開始するにあたり、
印刷用データのご入稿をお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【入稿データのお願い】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
商品名：${data.product_name || ''}
入稿期限：${data.upload_deadline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【入稿データの仕様】
・ファイル形式：AI（Illustrator）、PDF、EPS
・文字のアウトライン化：必須
・画像解像度：350dpi以上
・カラーモード：CMYKモード
・トリムマーク・トンボ：必須
・塗り足し：各辺3mm以上

下記のURLよりデータをご入稿いただけます。

${data.view_url}

ご入稿後、当社にてデータ確認を行い、別途ご連絡させていただきます。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('データ入稿のお願い', 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご注文いただきました商品の製造を開始するにあたり、<br>印刷用データのご入稿をお願い申し上げます。</p>

        ${createInfoBox('入稿データのお願い', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '商品名', value: data.product_name || '' },
          { label: '入稿期限', value: data.upload_deadline || '' },
        ])}

        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 16px; font-weight: bold;">📐 入稿データの仕様</h3>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>ファイル形式：AI（Illustrator）、PDF、EPS</li>
            <li>文字のアウトライン化：<strong>必須</strong></li>
            <li>画像解像度：350dpi以上</li>
            <li>カラーモード：CMYKモード</li>
            <li>トリムマーク・トンボ：<strong>必須</strong></li>
            <li>塗り足し：各辺3mm以上</li>
          </ul>
        </div>

        ${createButton('データを入稿する', data.view_url, 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}

        <p style="margin-bottom: 0;">ご入稿後、当社にてデータ確認を行い、別途ご連絡させていただきます。<br>何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')
  }
}

// ============================================================
// Template 4: Data Received (データ受領確認)
// ============================================================

export const dataReceivedEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】データを受領いたしました (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご入稿いただきましたデータを受領いたしましたことを
ご報告申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【データ受領確認】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
受領日時：${new Date().toLocaleString('ja-JP')}
ファイル名：${data.file_name || ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

現在、当社にてデータの確認作業を行っております。
データに問題がないかを確認後、別途ご連絡させていただきます。

完了までしばらくお待ちください。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('データを受領いたしました', 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご入稿いただきましたデータを受領いたしましたことを<br>ご報告申し上げます。</p>

        ${createInfoBox('データ受領確認', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '受領日時', value: new Date().toLocaleString('ja-JP') },
          { label: 'ファイル名', value: data.file_name || '' },
        ])}

        <div class="info">
          <strong>📋 データ確認中</strong><br>
          現在、当社にてデータの確認作業を行っております。<br>
          データに問題がないかを確認後、別途ご連絡させていただきます。<br>
          完了までしばらくお待ちください。
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)')
  }
}

// ============================================================
// Template 4.5: Partial SKU Submission Warning (一部SKU入稿警告)
// ============================================================

export const partialSKUSubmissionEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】一部SKUの入稿データが不足しています (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    const submittedSkus = data.submitted_skus || 0
    const totalSkus = data.total_skus || 0
    const pendingSkusList = data.pending_skus || []

    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

先ほどご入稿いただいたデータを受領いたしましたが、
注文に含まれる一部SKUの入稿データがまだ不足しております。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【入稿進捗状況】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
入稿済みSKU：${submittedSkus} / ${totalSkus}
未入稿SKU：${totalSkus - submittedSkus}件

${pendingSkusList.length > 0 ? `【未入稿のSKU一覧】
${pendingSkusList.map((sku: any) => `  - ${sku.productName} (数量: ${sku.quantity})`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

つきましては、お手数ですが不足しているSKUの入稿データも
ご提供いただけますようお願い申し上げます。

すべてのSKUのデータが揃い次第、製造工程に進ませていただきます。

詳細は以下のURLよりご確認いただけます。
${data.view_url}

何卒よろしくお願い申し上げます。

${FOOTER()}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const submittedSkus = data.submitted_skus || 0
    const totalSkus = data.total_skus || 0
    const pendingSkusList = data.pending_skus || []
    const progressPercent = totalSkus > 0 ? Math.round((submittedSkus / totalSkus) * 100) : 0

    const pendingSkuRows = pendingSkusList.map((sku: any) => `
      <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <span class="info-label" style="font-weight: bold; width: 140px; color: #666; flex-shrink: 0;">製品名</span>
        <span class="info-value" style="font-weight: bold; color: #dc2626;">${sku.productName}</span>
      </div>
      <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <span class="info-label" style="font-weight: bold; width: 140px; color: #666; flex-shrink: 0;">数量</span>
        <span class="info-value">${sku.quantity}枚</span>
      </div>
    `).join('')

    const content = `
      ${createHeader('一部SKUの入稿データが不足しています', 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>先ほどご入稿いただいたデータを受領いたしましたが、<br>注文に含まれる一部SKUの入稿データがまだ不足しております。</p>

        ${createInfoBox('入稿進捗状況', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '入稿済みSKU', value: `${submittedSkus} / ${totalSkus}`, highlight: true },
          { label: '未入稿SKU', value: `${totalSkus - submittedSkus}件`, highlight: true },
        ])}

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #92400e;">進捗状況</h3>
          <div style="background: white; border-radius: 4px; padding: 10px; margin-bottom: 10px;">
            <div style="background: #e5e7eb; border-radius: 4px; height: 24px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
            </div>
            <p style="text-align: center; margin: 8px 0 0 0; font-size: 14px; color: #666;">${progressPercent}% 完了</p>
          </div>
          ${pendingSkusList.length > 0 ? `
            <h4 style="margin: 15px 0 10px 0; font-size: 14px; font-weight: bold; color: #92400e;">未入稿のSKU一覧</h4>
            ${pendingSkuRows}
          ` : ''}
        </div>

        <div class="info" style="background: white; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
          <strong>⚠️ 残りのSKUデータをご入稿ください</strong><br>
          つきましては、お手数ですが不足しているSKUの入稿データも<br>
          ご提供いただけますようお願い申し上げます。<br>
          すべてのSKUのデータが揃い次第、製造工程に進ませていただきます。
        </div>

        ${createButton('注文詳細を確認', data.view_url, 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')
  }
}

// ============================================================
// Template 5: Modification Request (修正承認依頼)
// ============================================================

export const modificationRequestEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】データ修正のお願い (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご入稿いただきましたデータを確認いたしましたところ、
一部修正が必要な箇所がございました。

つきましては、お手数ですが修正をお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【修正内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}

${data.modification_details || '修正内容の詳細は以下のURLよりご確認ください。'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

詳細は以下のURLよりご確認いただけます。

${data.view_url}

修正完了後、再度データのご入稿をお願いいたします。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('データ修正のお願い', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご入稿いただきましたデータを確認いたしましたところ、<br>一部修正が必要な箇所がございました。</p>
        <p>つきましては、お手数ですが修正をお願い申し上げます。</p>

        <div class="alert">
          <strong>⚠️ 修正が必要です</strong><br>
          ${data.modification_details || '詳細は以下のURLよりご確認ください。'}
        </div>

        ${createInfoBox('修正内容', [
          { label: '注文番号', value: data.order_number || '' },
        ])}

        ${createButton('修正内容を確認する', data.view_url, 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}

        <p style="margin-bottom: 0;">修正完了後、再度データのご入稿をお願いいたします。<br>何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')
  }
}

// ============================================================
// Template 6: Modification Approved (修正承認完了)
// ============================================================

export const modificationApprovedEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】修正内容を承認いたしました (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご提出いただきました修正データの確認が完了し、
承認いたしましたことをご通知申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【修正承認完了】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
承認日時：${new Date().toLocaleString('ja-JP')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

確認いたしましたデータにて、製造工程に進ませていただきます。

引き続き、何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('修正内容を承認いたしました', 'linear-gradient(135deg, #10b981 0%, #059669 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご提出いただきました修正データの確認が完了し、<br>承認いたしましたことをご通知申し上げます。</p>

        ${createInfoBox('修正承認完了', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '承認日時', value: new Date().toLocaleString('ja-JP') },
        ])}

        <div class="success">
          <strong>✅ 製造工程に進みます</strong><br>
          確認いたしましたデータにて、製造工程に進ませていただきます。
        </div>

        <p style="margin-bottom: 0;">引き続き、何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #10b981 0%, #059669 100%)')
  }
}

// ============================================================
// Template 7: Modification Rejected (修正却下確認)
// ============================================================

export const modificationRejectedEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】修正却下のご連絡 (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご提案いたしました修正内容について、
お客様より却下の申し入れがございましたことをお伝えいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【修正却下確認】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
却下日時：${new Date().toLocaleString('ja-JP')}
却下理由：${data.rejection_reason || 'お客様のご意向によるものです'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

つきましては、修正内容を反映せず、当初の仕様にて
製造を進めさせていただきます。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('修正却下のご連絡', 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご提案いたしました修正内容について、<br>お客様より却下の申し入れがございましたことをお伝えいたします。</p>

        ${createInfoBox('修正却下確認', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '却下日時', value: new Date().toLocaleString('ja-JP') },
          { label: '却下理由', value: data.rejection_reason || 'お客様のご意向によるものです' },
        ])}

        <div class="info">
          <strong>ℹ️ 当初仕様にて製造</strong><br>
          つきましては、修正内容を反映せず、当初の仕様にて<br>
          製造を進めさせていただきます。
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)')
  }
}

// ============================================================
// Template 8: Correction Ready (校正完了)
// ============================================================

export const correctionReadyEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】校正完了のご案内 (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、校正作業が完了いたしましたのでご案内申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【校正完了】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
完了日時：${new Date().toLocaleString('ja-JP')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

校正データは以下のURLよりご確認いただけます。

${data.view_url}

ご確認いただき、問題がなければ製造工程に進ませていただきます。
修正が必要な場合は、期限内にご連絡をお願いいたします。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('校正完了のご案内', 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、校正作業が完了いたしましたのでご案内申し上げます。</p>

        ${createInfoBox('校正完了', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '完了日時', value: new Date().toLocaleString('ja-JP') },
        ])}

        ${createButton('校正データを確認する', data.view_url, 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')}

        <div class="info">
          <strong>👀 ご確認のお願い</strong><br>
          ご確認いただき、問題がなければ製造工程に進ませていただきます。<br>
          修正が必要な場合は、期限内にご連絡をお願いいたします。
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')
  }
}

// ============================================================
// Template 9: Approval Request (顧客承認待ち)
// ============================================================

export const approvalRequestEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】承認のお願い (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、校正データが完成いたしましたので、
ご承認をお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【承認依頼】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
承認期限：${data.approval_deadline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

校正データは以下のURLよりご確認いただけます。

${data.view_url}

ご確認いただき、承認ボタンよりお手続きをお願いいたします。
期限までにご返答がない場合は、了解とみなして製造を進めさせて
いただく場合がございます。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('承認のお願い', 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、校正データが完成いたしましたので、<br>ご承認をお願い申し上げます。</p>

        ${createInfoBox('承認依頼', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '承認期限', value: data.approval_deadline || '' },
        ])}

        ${createButton('校正データを確認・承認する', data.view_url, 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)')}

        <div class="alert">
          <strong>⚠️ ご注意ください</strong><br>
          期限までにご返答がない場合は、了解とみなして製造を進めさせて<br>
          いただく場合がございます。予めご了承ください。
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)')
  }
}

// ============================================================
// Template 10: Production Started (製造開始)
// ============================================================

export const productionStartedEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】製造を開始いたしました (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご注文いただきました商品の製造を開始いたしましたので
ご案内申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【製造開始】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
商品名：${data.product_name || ''}
開始日時：${new Date().toLocaleString('ja-JP')}
予定完了日：${data.estimated_completion}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

現在、製造ラインにて順調に製造を進めております。
完成次第、出荷手続きに入らせていただきます。

引き続き、何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('製造を開始いたしました', 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご注文いただきました商品の製造を開始いたしましたので<br>ご案内申し上げます。</p>

        ${createInfoBox('製造開始', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '商品名', value: data.product_name || '' },
          { label: '開始日時', value: new Date().toLocaleString('ja-JP') },
          { label: '予定完了日', value: data.estimated_completion || '', highlight: true },
        ])}

        <div class="success">
          <strong>🏭 製造中</strong><br>
          現在、製造ラインにて順調に製造を進めております。<br>
          完成次第、出荷手続きに入らせていただきます。
        </div>

        <p style="margin-bottom: 0;">引き続き、何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)')
  }
}

// ============================================================
// Template 11: Ready to Ship (出荷準備完了)
// ============================================================

export const readyToShipEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】出荷準備が完了いたしました (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご注文いただきました商品の出荷準備が完了いたしましたので
ご案内申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【出荷準備完了】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
商品名：${data.product_name || ''}
数量：${data.quantity || ''}
準備完了日：${new Date().toLocaleString('ja-JP')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

本日、もしくは翌営業日に発送手続きを行わせていただきます。
発送完了次第、追跡番号をお送りいたします。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      ${createHeader('出荷準備が完了いたしました', 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご注文いただきました商品の出荷準備が完了いたしましたので<br>ご案内申し上げます。</p>

        ${createInfoBox('出荷準備完了', [
          { label: '注文番号', value: data.order_number || '' },
          { label: '商品名', value: data.product_name || '' },
          { label: '数量', value: data.quantity || '' },
          { label: '準備完了日', value: new Date().toLocaleString('ja-JP') },
        ])}

        <div class="info">
          <strong>📦 発送予定</strong><br>
          本日、もしくは翌営業日に発送手続きを行わせていただきます。<br>
          発送完了次第、追跡番号をお送りいたします。
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)')
  }
}

// ============================================================
// Template 12: Shipped (出荷完了)
// ============================================================

export const shippedEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】商品を発送いたしました (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    const trackingInfo = data.tracking_number ? `
配送業者：${data.carrier || ''}
追跡番号：${data.tracking_number}
` : ''

    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご注文いただきました商品を発送いたしましたので
ご案内申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【発送完了】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
商品名：${data.product_name || ''}
発送日：${new Date().toLocaleString('ja-JP')}
${trackingInfo}お届け予定日：${data.estimated_delivery}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.tracking_number ? `
配送状況は以下のURLより確認できます。

${data.tracking_url}

` : ''}詳細な注文情報は、以下のリンクから確認できます。

${data.view_url}

商品のお届けを楽しみにしております。

何卒よろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const trackingSection = data.tracking_number ? `
      <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">配送業者</span>
        <span class="info-value">${data.carrier || '-'}</span>
      </div>
      <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">追跡番号</span>
        <span class="info-value"><strong>${data.tracking_number}</strong></span>
      </div>
    ` : ''

    const trackingButton = data.tracking_url ? `
      <a href="${data.tracking_url}" class="button" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold;">配送状況を追跡</a>
    ` : ''

    const content = `
      ${createHeader('商品を発送いたしました 🎉', 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご注文いただきました商品を発送いたしましたので<br>ご案内申し上げます。</p>

        <div style="background: #ecfeff; border: 2px dashed #06b6d4; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
          <p style="margin: 0; font-size: 18px;">商品をお届けできることを楽しみにしています！</p>
        </div>

        <div class="info-box" style="background: white; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold;">発送情報</h3>
          <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">注文番号</span>
            <span class="info-value">${data.order_number}</span>
          </div>
          <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">商品名</span>
            <span class="info-value">${data.product_name || ''}</span>
          </div>
          <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">発送日</span>
            <span class="info-value">${new Date().toLocaleString('ja-JP')}</span>
          </div>
          ${trackingSection}
          <div class="info-row" style="display: flex; padding: 10px 0;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">お届け予定日</span>
            <span class="info-value" style="color: #06b6d4; font-weight: bold;">${data.estimated_delivery}</span>
          </div>
        </div>

        <div style="text-align: center;">
          ${trackingButton}
          <a href="${data.view_url}" class="button" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold;">注文詳細を見る</a>
        </div>

        <p style="margin-bottom: 0;">何卒よろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)')
  }
}

// ============================================================
// Template 13: Order Cancelled (注文キャンセル)
// ============================================================

export const orderCancelledEmail = {
  subject: (data: EpackEmailData): string => {
    return `【Epackage Lab】注文をキャンセルいたしました (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 様

平素より格別のご愛顧を賜り、厚く御礼申し上げます。
Epackage Labでございます。

この度、ご注文いただきました注文をキャンセルいたしましたので
ご案内申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【キャンセル完了】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

注文番号：${data.order_number}
キャンセル日時：${new Date().toLocaleString('ja-JP')}
キャンセル理由：${data.cancellation_reason || 'お客様のご依頼によるものです'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.refund_amount ? `
【返金について】
返金金額：¥${Number(data.refund_amount).toLocaleString('ja-JP')}
返金方法：${data.refund_method || 'ご指定の支払方法にて返金いたします'}

${BANK_INFO}
` : ''}

今後とも、Epackage Labをよろしくお願い申し上げます。

${FOOTER}
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const refundSection = data.refund_amount ? `
      <div class="info-box" style="background: white; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
        <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold;">返金について</h3>
        <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">返金金額</span>
          <span class="info-value" style="font-weight: bold; color: #6b7280; font-size: 18px;">¥${Number(data.refund_amount).toLocaleString('ja-JP')}</span>
        </div>
        <div class="info-row" style="display: flex; padding: 10px 0;">
          <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">返金方法</span>
          <span class="info-value">${data.refund_method || 'ご指定の支払方法にて返金いたします'}</span>
        </div>
      </div>

      ${getBankInfoHtmlSync()}
    ` : ''

    const content = `
      ${createHeader('注文をキャンセルいたしました', 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)')}
      <div class="content">
        <p style="margin-top: 0;">${data.customer_name} 様</p>
        <p>平素より格別のご愛顧を賜り、厚く御礼申し上げます。<br>Epackage Labでございます。</p>
        <p>この度、ご注文いただきました注文をキャンセルいたしましたので<br>ご案内申し上げます。</p>

        ${createInfoBox('キャンセル完了', [
          { label: '注文番号', value: data.order_number || '' },
          { label: 'キャンセル日時', value: new Date().toLocaleString('ja-JP') },
          { label: 'キャンセル理由', value: data.cancellation_reason || 'お客様のご依頼によるものです' },
        ])}

        ${refundSection}

        <p style="margin-bottom: 0;">今後とも、Epackage Labをよろしくお願い申し上げます。</p>
      </div>
    `
    return createBaseHtml(content, 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)')
  }
}

// ============================================================
// Template 14: Korea Correction Request (한국팀 교정 요청)
// ============================================================

export const koreaCorrectionRequestEmail = {
  subject: (data: EpackEmailData): string => {
    return `[Epackage Lab] 한국팀 교정 요청 (${data.order_number})`
  },

  plainText: (data: EpackEmailData): string => {
    return `
${data.customer_name} 님

안녕하세요, Epackage Lab입니다.

고객님께서 제출하신 데이터 검토가 완료되었습니다.
일부 수정이 필요한 부분이 있어 교정 요청을 보내드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【교정 요청】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

주문 번호：${data.order_number}
요청 일시：${new Date().toLocaleString('ko-KR')}
수정 사항：${data.correction_details || '상세 내용은 아래 URL에서 확인해주세요.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

상세 내용은 아래 URL에서 확인하실 수 있습니다.

${data.view_url}

수정 완료 후 재업로드 부탁드립니다.

감사합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Epackage Lab (이패키지랩)
Email: support@epackage-lab.com
URL: https://epackage-lab.com

본 이메일은 시스템에 의해 자동 발송되었습니다.
Copyright © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
`.trim()
  },

  html: (data: EpackEmailData): string => {
    const content = `
      <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold;">한국팀 교정 요청</h1>
      </div>
      <div class="content" style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="margin-top: 0;">${data.customer_name} 님</p>
        <p>안녕하세요, Epackage Lab입니다.</p>
        <p>고객님께서 제출하신 데이터 검토가 완료되었습니다.<br>일부 수정이 필요한 부분이 있어 교정 요청을 보내드립니다.</p>

        <div class="info-box" style="background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 4px 4px 0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: bold;">교정 요청</h3>
          <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">주문 번호</span>
            <span class="info-value">${data.order_number}</span>
          </div>
          <div class="info-row" style="display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">요청 일시</span>
            <span class="info-value">${new Date().toLocaleString('ko-KR')}</span>
          </div>
          <div class="info-row" style="display: flex; padding: 10px 0;">
            <span class="info-label" style="font-weight: bold; width: 140px; color: #666;">수정 사항</span>
            <span class="info-value">${data.correction_details || '상세 내용은 아래 URL에서 확인해주세요.'}</span>
          </div>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${data.view_url}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">수정 내역 확인하기</a>
        </div>

        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>📝 안내</strong><br>
          수정 완료 후 재업로드 부탁드립니다.
        </div>

        <p style="margin-bottom: 0;">감사합니다.</p>
      </div>
      <div class="footer" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
        <p style="margin: 5px 0;"><strong>Epackage Lab (이패키지랩)</strong></p>
        <p style="margin: 5px 0;">Email: support@epackage-lab.com</p>
        <p style="margin: 5px 0;">URL: https://epackage-lab.com</p>
        <p style="margin: 15px 0 5px 0;">본 이메일은 시스템에 의해 자동 발송되었습니다.</p>
        <p style="margin: 5px 0;">Copyright © ${new Date().getFullYear()} Epackage Lab. All rights reserved.</p>
      </div>
    `
    return createBaseHtml(content.replace('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'), 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)')
  }
}

// ============================================================
// Template Export
// ============================================================

export const epackEmailTemplates = {
  quoteReady: quoteReadyEmail,
  quoteApproved: quoteApprovedEmail,
  dataUploadRequest: dataUploadRequestEmail,
  dataReceived: dataReceivedEmail,
  partialSKUSubmission: partialSKUSubmissionEmail,
  modificationRequest: modificationRequestEmail,
  modificationApproved: modificationApprovedEmail,
  modificationRejected: modificationRejectedEmail,
  correctionReady: correctionReadyEmail,
  approvalRequest: approvalRequestEmail,
  productionStarted: productionStartedEmail,
  readyToShip: readyToShipEmail,
  shipped: shippedEmail,
  orderCancelled: orderCancelledEmail,
  koreaCorrectionRequest: koreaCorrectionRequestEmail,
} as const

export type EpackTemplateId = keyof typeof epackEmailTemplates
