'use client'

/**
 * OrderHistoryPDFButton Component
 *
 * 注文履歴PDFダウンロードボタン
 * - 複数注文のPDF生成
 * - 日本語フォント対応（html2canvas + jsPDF）
 * - Supabase MCPを使用して注文データ取得
 * - 日本語ビジネスフォーマット（A4）
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'

// PDFライブラリを動的import - ボタンクリック時のみロード（+80KB節約）
const jsPDF = dynamic(() => import('jspdf').then(mod => ({ default: mod.default || mod })), { ssr: false })
const html2canvas = dynamic(() => import('html2canvas').then(mod => ({ default: mod.default || mod })), { ssr: false })
const DOMPurify = dynamic(() => import('dompurify').then(mod => ({ default: mod.default || mod })), { ssr: false })

import { Button } from '@/components/ui/Button'
import { getOrdersForExport } from '@/lib/supabase-mcp'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface OrderHistoryPDFButtonProps {
  orderIds: string[]
  filename?: string
}

/**
 * 注文データ型
 */
interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  total_amount: number
  tax_amount: number
  subtotal: number
  customer_name?: string
  delivery_address?: any
  items: OrderItem[]
}

/**
 * 日本語ステータスラベル
 */
const STATUS_LABELS: Record<string, string> = {
  'PENDING': '見積中',
  'QUOTATION': '見積送付',
  'DATA_RECEIVED': 'データ受領',
  'WORK_ORDER': '製造指示',
  'CONTRACT_SENT': '契約送付',
  'CONTRACT_SIGNED': '契約締結',
  'PRODUCTION': '製造中',
  'STOCK_IN': '入庫済',
  'SHIPPED': '発送済',
  'DELIVERED': '納品完了',
  'CANCELLED': 'キャンセル',
}

/**
 * 注文履歴HTML生成
 * 日本語フォンートでA4サイズ
 */
function generateOrderHistoryHTML(orders: Order[]): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja })
  }

  const formatYen = (amount: number) => {
    return `¥${amount.toLocaleString('ja-JP')}`
  }

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status
  }

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
      font-family: "Hiragino Sans", "Yu Gothic", "Meiryo", "MS PGothic", sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
      background: #fff;
      padding: 5mm 7mm;
      width: 210mm;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 5mm;
      padding-bottom: 3mm;
      border-bottom: 2px solid #000;
    }

    .title {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 0.2em;
      margin-bottom: 2mm;
    }

    .subtitle {
      font-size: 9pt;
      color: #666;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3mm;
      font-size: 9pt;
      color: #666;
    }

    .order-section {
      margin-bottom: 5mm;
      padding: 3mm;
      border: 1px solid #000;
      background: #fff;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3mm;
      padding-bottom: 2mm;
      border-bottom: 1px solid #ccc;
    }

    .order-number {
      font-size: 12pt;
      font-weight: bold;
    }

    .order-date {
      font-size: 9pt;
      color: #666;
    }

    .order-info {
      display: flex;
      gap: 5mm;
      margin-bottom: 3mm;
    }

    .info-item {
      flex: 1;
    }

    .info-label {
      font-weight: bold;
      font-size: 8pt;
      color: #666;
      margin-bottom: 1mm;
    }

    .info-value {
      font-size: 10pt;
    }

    .items-table {
      width: 100%;
      margin-bottom: 3mm;
      border-collapse: collapse;
    }

    .items-table th {
      background: #f0f0f0;
      padding: 2mm;
      text-align: left;
      font-size: 9pt;
      font-weight: bold;
      border: 1px solid #000;
    }

    .items-table td {
      padding: 2mm;
      font-size: 9pt;
      border: 1px solid #000;
    }

    .items-table td:nth-child(2),
    .items-table td:nth-child(3),
    .items-table td:nth-child(4) {
      text-align: right;
    }

    .totals-row {
      text-align: right;
      padding-top: 2mm;
      border-top: 1px solid #000;
    }

    .total-label {
      font-size: 10pt;
      font-weight: bold;
    }

    .total-amount {
      font-size: 14pt;
      font-weight: bold;
      color: #c00;
    }

    .footer {
      margin-top: 5mm;
      padding-top: 3mm;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">注　文　履　歴　書</div>
    <div class="subtitle">Order History</div>
  </div>

  <div class="info-row">
    <div>発行日: ${format(new Date(), 'yyyy年MM月dd日')}</div>
    <div>件数: ${orders.length}件</div>
  </div>

  ${orders.map(order => `
  <div class="order-section">
    <div class="order-header">
      <div class="order-number">注文番号: ${order.order_number || order.id}</div>
      <div class="order-date">${formatDate(order.created_at)}</div>
    </div>

    <div class="order-info">
      <div class="info-item">
        <div class="info-label">ステータス</div>
        <div class="info-value">${getStatusLabel(order.status)}</div>
      </div>
      ${order.customer_name ? `
      <div class="info-item">
        <div class="info-label">お客様名</div>
        <div class="info-value">${order.customer_name}</div>
      </div>
      ` : ''}
    </div>

    ${order.items && order.items.length > 0 ? `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%">商品名</th>
          <th style="width: 15%">数量</th>
          <th style="width: 20%">単価</th>
          <th style="width: 20%">金額</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>${formatYen(item.unit_price)}</td>
          <td>${formatYen(item.total_price)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="totals-row">
      <div class="total-label">小計: ${formatYen(order.subtotal || 0)}</div>
      <div style="margin-top: 1mm;">消費税: ${formatYen(order.tax_amount || 0)}</div>
      <div class="total-amount" style="margin-top: 2mm;">合計: ${formatYen(order.total_amount || 0)}</div>
    </div>
  </div>
  `).join('')}

  <div class="footer">
    <p>この書類は ${format(new Date(), 'yyyy年MM月dd日 HH:mm')} に自動生成されました。</p>
    <p>EPACKAGE Lab - オーダーメイドバッグ印刷専門</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * 注文履歴PDFボタン
 * 選択された注文履歴をPDFとしてダウンロード
 */
export function OrderHistoryPDFButton({
  orderIds,
  filename = `注文履歴_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
}: OrderHistoryPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  /**
   * PDFダウンロード処理
   */
  const handleDownload = async () => {
    if (orderIds.length === 0) {
      alert('PDF生成する注文がありません')
      return
    }

    setIsGenerating(true)

    try {
      // 注文データ取得
      const result = await getOrdersForExport(orderIds)

      if (result.error) {
        throw new Error(`注文データの取得に失敗しました: ${result.error.message}`)
      }

      if (!result.data || result.data.length === 0) {
        throw new Error('注文データが見つかりません')
      }

      const orders = result.data as Order[]

      // HTML生成
      const html = generateOrderHistoryHTML(orders)

      // 一時DOM要素を作成
      if (typeof window === 'undefined') {
        throw new Error('PDF生成はブラウザ環境でサポートされている機能です')
      }

      // ページレイアウトを凍結
      const htmlElement = document.documentElement
      const bodyElement = document.body

      const originalStyles = {
        htmlOverflow: htmlElement.style.overflow,
        htmlPosition: htmlElement.style.position,
        htmlWidth: htmlElement.style.width,
        htmlTop: htmlElement.style.top,
        bodyOverflow: bodyElement.style.overflow,
        bodyPosition: bodyElement.style.position,
        bodyWidth: bodyElement.style.width,
        bodyTransform: bodyElement.style.transform,
      }

      const scrollX = window.pageXOffset || document.documentElement.scrollLeft
      const scrollY = window.pageYOffset || document.documentElement.scrollTop

      htmlElement.style.overflow = 'hidden'
      htmlElement.style.position = 'fixed'
      htmlElement.style.width = '100vw'
      htmlElement.style.top = `-${scrollY}px`

      bodyElement.style.overflow = 'hidden'
      bodyElement.style.position = 'fixed'
      bodyElement.style.width = '100vw'
      bodyElement.style.transform = 'translateZ(0)'

      try {
        await new Promise(resolve => requestAnimationFrame(resolve))
        await new Promise(resolve => setTimeout(resolve, 50))

        // 非表示コンテナ作成
        const container = document.createElement('div')
        container.style.position = 'fixed'
        container.style.left = '-99999px'
        container.style.top = '-99999px'
        container.style.width = '210mm'
        container.style.minHeight = '297mm'
        container.style.zIndex = '-999999'
        container.style.background = '#ffffff'
        container.style.padding = '0'
        container.style.margin = '0'

        // HTMLをセット（サニタイズ）
        container.innerHTML = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'div', 'span', 'p', 'br', 'strong', 'em', 'b', 'i', 'u',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
            'style'
          ],
          ALLOWED_ATTR: [
            'class', 'style', 'id', 'colspan', 'rowspan', 'width', 'height'
          ],
          ALLOW_DATA_ATTR: false,
        })

        document.body.appendChild(container)

        await new Promise(resolve => setTimeout(resolve, 500))

        // キャプチャ
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
        })

        // クリーンアップ
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }

        // PDF生成
        const imgData = canvas.toDataURL('image/png', 0.95)
        const a4Width = 210
        const a4Height = 297
        const marginTop = 10
        const marginBottom = 10
        const marginLeft = 15
        const marginRight = 15
        const contentWidth = a4Width - marginLeft - marginRight
        const contentHeight = a4Height - marginTop - marginBottom

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        })

        const canvasAspectRatio = canvas.width / canvas.height
        const contentAspectRatio = contentWidth / contentHeight

        let finalWidth, finalHeight, xOffset, yOffset

        if (canvasAspectRatio > contentAspectRatio) {
          finalWidth = contentWidth
          finalHeight = contentWidth / canvasAspectRatio
          xOffset = marginLeft
          yOffset = marginTop + (contentHeight - finalHeight) / 2
        } else {
          finalHeight = contentHeight
          finalWidth = contentHeight * canvasAspectRatio
          xOffset = marginLeft + (contentWidth - finalWidth) / 2
          yOffset = marginTop
        }

        doc.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)

        // PDF保存
        doc.save(filename)

        alert('PDFをダウンロードしました')

      } finally {
        // スタイル復元
        htmlElement.style.overflow = originalStyles.htmlOverflow
        htmlElement.style.position = originalStyles.htmlPosition
        htmlElement.style.width = originalStyles.htmlWidth
        htmlElement.style.top = originalStyles.htmlTop

        bodyElement.style.overflow = originalStyles.bodyOverflow
        bodyElement.style.position = originalStyles.bodyPosition
        bodyElement.style.width = originalStyles.bodyWidth
        bodyElement.style.transform = originalStyles.bodyTransform

        window.scrollTo(scrollX, scrollY)
      }

    } catch (error: unknown) {
      console.error('PDF generation error:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : 'PDF生成に失敗しました'

      alert(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isGenerating || orderIds.length === 0}
    >
      {isGenerating ? '生成中...' : `注文履歴をPDFダウンロード (${orderIds.length}件)`}
    </Button>
  )
}
