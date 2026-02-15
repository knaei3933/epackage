# Epackage Lab Email Service

イーパックラボ (EPackage Lab) 専用メールテンプレートと送信サービス

## Features

- 14種類の日本語ビジネスメールテンプレート
- HTML + Plain Text デュアルフォーマット
- SendGrid 連携による高信頼性メール送信
- オーダーステータス自動連動メール送信
- 韓国語対応テンプレート (韓国チーム校正依頼)

## Template List

| Template ID | Description | Recipient |
|------------|-------------|-----------|
| `quoteReady` | 見積作成完了 | 顧客 |
| `quoteApproved` | 見積承認完了 | 顧客 |
| `dataUploadRequest` | データ入稿依頼 | 顧客 |
| `dataReceived` | データ受領確認 | 顧客 |
| `modificationRequest` | 修正承認依頼 | 顧客 |
| `modificationApproved` | 修正承認完了 | 顧客 |
| `modificationRejected` | 修正却下確認 | 顧客 |
| `correctionReady` | 校正完了 | 顧客 |
| `approvalRequest` | 顧客承認待ち | 顧客 |
| `productionStarted` | 製造開始 | 顧客 |
| `readyToShip` | 出荷準備完了 | 顧客 |
| `shipped` | 出荷完了 | 顧客 |
| `orderCancelled` | 注文キャンセル | 顧客 |
| `koreaCorrectionRequest` | 韓国チーム校正依頼 | 韓国担当者 |

## Usage

### Basic Email Sending

```typescript
import { epackMailer } from '@/lib/email'

const result = await epackMailer.quoteReady({
  quotation_id: 'QT-2025-001',
  quotation_number: 'QT-2025-001',
  customer_email: 'customer@example.com',
  customer_name: '山田 太郎',
  company_name: '株式会社ABC',
  total_amount: 100000,
  valid_until: '2025-12-31',
  view_url: 'https://epackage-lab.com/quotations/QT-2025-001',
})

if (result.success) {
  console.log('Email sent:', result.messageId)
}
```

### Order Status-Based Email

```typescript
import { orderStatusEmails } from '@/lib/email'

const result = await orderStatusEmails.sendForStatus(
  'shipped',
  {
    orderId: 'ord-001',
    orderNumber: 'ORD-2025-001',
    customerEmail: 'customer@example.com',
    customerName: '山田 太郎',
    productName: 'スタンアップパウチ',
    viewUrl: 'https://epackage-lab.com/member/orders/ord-001',
  },
  {
    trackingNumber: '1234567890JP',
    carrier: 'ヤマト運輸',
    estimatedDelivery: '2025-03-15',
    trackingUrl: 'https://track.yamato-transport.co.jp/',
  }
)
```

### Individual Template Functions

```typescript
// 見積作成完了
await epackMailer.quoteReady(data)

// データ入稿依頼
await epackMailer.dataUploadRequest(data)

// 修正依頼
await epackMailer.modificationRequest(data)

// 出荷完了
await epackMailer.shipped(data)

// 注文キャンセル
await epackMailer.orderCancelled(data)
```

## Data Types

```typescript
interface EpackEmailData {
  // Common fields
  customer_email: string
  customer_name: string
  view_url: string

  // Quotation fields
  quotation_id?: string
  quotation_number?: string
  total_amount?: number
  valid_until?: string

  // Order fields
  order_id?: string
  order_number?: string
  product_name?: string
  quantity?: string

  // Workflow fields
  upload_deadline?: string
  approval_deadline?: string
  estimated_completion?: string
  estimated_delivery?: string

  // Tracking fields
  tracking_number?: string
  carrier?: string
  tracking_url?: string

  // Modification fields
  modification_details?: string
  correction_details?: string
  rejection_reason?: string

  // Refund fields
  refund_amount?: number
  refund_method?: string
  cancellation_reason?: string
}
```

## Bank Information (振込先銀行口座)

```
銀行名：PayPay銀行
支店名：ビジネス営業部支店(005)
預金種目：普通
口座番号：5630235
口座名義：カネイボウエキ（カ
```

## Environment Variables

```env
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@epackage-lab.com
REPLY_TO_EMAIL=support@epackage-lab.com
```

## Testing

```typescript
import { epackMailer } from '@/lib/email'

// Send test email
const result = await epackMailer.sendTest(
  'test@example.com',
  'quoteReady'
)
```

## File Structure

```
src/lib/email/
├── epack-templates.ts       # 14 email templates
├── epack-mailer.ts          # SendGrid mailer service
├── order-status-emails.ts   # Status-based email dispatcher
└── index.ts                 # Module exports
```

## Design Principles

1. **Japanese Business Etiquette**: Proper keigo (敬語) and business phrasing
2. **Responsive HTML**: Mobile-friendly email design
3. **Dual Format**: Both HTML and plain text versions
4. **Brand Consistency**: Epackage Lab branding throughout
5. **Status Automation**: Automatic email sending based on order status
