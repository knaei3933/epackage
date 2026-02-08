# Email Sending Functionality Guide

## Overview

This project now includes comprehensive email sending functionality for customer management, powered by the existing email infrastructure.

## Features

- **Email Providers**: Supports Xserver SMTP (via Nodemailer) and Resend
- **Template System**: 14+ pre-built Japanese business email templates
- **Customer Management**: Dedicated customer email functions
- **Admin API**: Secure API endpoint for email sending
- **Batch Sending**: Send to multiple recipients efficiently
- **Attachments**: Support for file attachments

## Architecture

```
src/lib/email/
├── index.ts                  # Main export module
├── epack-templates.ts        # 14+ email templates (Japanese)
├── epack-mailer.ts          # Xserver SMTP mailer service
├── customer-emails.ts       # Customer-specific email functions
├── notificationService.ts   # SendGrid notification service
├── order-status-emails.ts   # Order status emails
└── templates.ts             # Additional templates

src/app/api/admin/email/send/
└── route.ts                 # Admin email API endpoint
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Email Provider (resend or nodemailer)
EMAIL_PROVIDER=nodemailer

# Xserver SMTP Configuration (for nodemailer)
XSERVER_SMTP_HOST=smtp.xserver.jp
XSERVER_SMTP_PORT=587
XSERVER_SMTP_USER=your-email@domain.com
XSERVER_SMTP_PASSWORD=your-password

# Sender Information
FROM_EMAIL=info@epackage-lab.com
REPLY_TO_EMAIL=info@epackage-lab.com

# Optional: Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=https://epackage-lab.com
```

## Usage

### 1. Admin API Endpoint

**Endpoint**: `POST /api/admin/email/send`

**Authentication**: Admin only (uses `withAdminAuth` middleware)

#### Request Types

##### A. Custom Email

```json
{
  "type": "custom",
  "to": ["customer1@example.com", "customer2@example.com"],
  "subject": "重要なお知らせ",
  "html": "<p>メール本文</p>",
  "text": "プレーンテキスト本文"
}
```

##### B. Template Email

```json
{
  "type": "template",
  "template": "quoteReady",
  "to": "customer@example.com",
  "data": {
    "customer_name": "山田太郎",
    "customer_email": "customer@example.com",
    "company_name": "株式会社テスト",
    "quotation_number": "QT-2025-001",
    "total_amount": 100000,
    "valid_until": "2025-12-31",
    "view_url": "https://epackage-lab.com/quotations/QT-2025-001"
  }
}
```

##### C. Batch Email

```json
{
  "type": "batch",
  "template": "quoteReady",
  "recipients": [
    { "email": "customer1@example.com", "name": "山田太郎" },
    { "email": "customer2@example.com", "name": "佐藤次郎" }
  ],
  "baseData": {
    "quotation_number": "QT-2025-001",
    "view_url": "https://epackage-lab.com/quotations/QT-2025-001",
    "total_amount": 100000,
    "valid_until": "2025-12-31"
  }
}
```

### 2. Direct Function Usage

#### Customer Emails

```typescript
import { customerEmails } from '@/lib/email';

// Welcome Email
await customerEmails.sendWelcome({
  customer_email: 'new@example.com',
  customer_name: '新規様',
  company_name: '株式会社新規',
  login_url: 'https://epackage-lab.com/login',
  member_dashboard_url: 'https://epackage-lab.com/member',
});

// Quote Follow-up
await customerEmails.sendQuoteFollowUp({
  customer_email: 'customer@example.com',
  customer_name: '顧客名',
  quotation_number: 'QT-2025-001',
  quotation_id: 'uuid',
  total_amount: 100000,
  valid_until: '2025-12-31',
  view_url: 'https://epackage-lab.com/quotations/QT-2025-001',
});

// Order Status Update
await customerEmails.sendOrderStatusUpdate(
  'customer@example.com',
  '顧客名',
  'ORD-2025-001',
  'スタンアップパウチ',
  'shipped',
  {
    tracking_number: '1234567890JP',
    carrier: 'ヤマト運輸',
    tracking_url: 'https://track.yamato-transport.co.jp/',
    estimated_delivery: '2025-03-20',
  }
);
```

#### Using EpackMailer Directly

```typescript
import { epackMailer } from '@/lib/email';

const result = await epackMailer.send(
  'quoteReady',
  {
    customer_name: '山田太郎',
    customer_email: 'customer@example.com',
    quotation_number: 'QT-2025-001',
    view_url: 'https://...',
    total_amount: 100000,
    valid_until: '2025-12-31',
  }
);

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Failed:', result.error);
}
```

## Available Templates

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `quoteReady` | 見積書完成通知 | 見積作成完了時 |
| `quoteApproved` | 見積承認完了 | 顧客による見積承認時 |
| `dataUploadRequest` | データ入稿依頼 | 印刷データ入稿リクエスト |
| `dataReceived` | データ受領確認 | データ受領確認 |
| `modificationRequest` | 修正依頼 | データ修正リクエスト |
| `modificationApproved` | 修正承認完了 | 修正データ承認時 |
| `modificationRejected` | 修正却下確認 | 修正却下時 |
| `correctionReady` | 校正完了 | 校正完了通知 |
| `approvalRequest` | 承認依頼 | 顧客承認リクエスト |
| `productionStarted` | 製造開始 | 製造開始通知 |
| `readyToShip` | 出荷準備完了 | 出荷準備完了 |
| `shipped` | 出荷完了 | 商品発送通知 |
| `orderCancelled` | 注文キャンセル | キャンセル完了 |
| `koreaCorrectionRequest` | 韓国チーム校正依頼 | 韓国チーム向け |

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "メールを送信しました。",
  "messageId": "abc123-def456"
}
```

### Batch Response

```json
{
  "success": true,
  "message": "3件のメールを送信しました。",
  "results": [
    { "recipient": "email1@example.com", "success": true, "messageId": "msg1" },
    { "recipient": "email2@example.com", "success": true, "messageId": "msg2" },
    { "recipient": "email3@example.com", "success": false, "error": "Bounced" }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "メールの送信に失敗しました。",
  "error": "Error details"
}
```

## Testing

### Test Email Endpoint

The project includes a test email endpoint at `/api/admin/test-email`.

```bash
curl -X POST https://epackage-lab.com/api/admin/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"recipient": "test@example.com"}'
```

### Development Mode

When SMTP is not configured, emails will be logged to console instead of being sent:

```
[EpackMailer] Console mode - Email content:
============================================================
To: test@example.com
Template: quoteReady
Data: {...}
============================================================
```

## Best Practices

1. **Always use templates** for business emails to maintain consistency
2. **Batch sending** for multiple recipients to avoid rate limits
3. **Handle errors** gracefully and log for debugging
4. **Validate emails** before sending
5. **Use meaningful subject lines** following Japanese business email etiquette
6. **Provide plain text fallback** for accessibility
7. **Test thoroughly** before sending to production

## Troubleshooting

### Emails not sending

1. Check environment variables are set correctly
2. Verify SMTP credentials with Xserver
3. Check firewall/security settings
4. Review console logs for errors

### Templates not found

1. Verify template ID matches available templates
2. Check `src/lib/email/epack-templates.ts` exports

### Authentication errors

1. Verify admin token is valid
2. Check `withAdminAuth` middleware is working
3. Ensure user has ADMIN role

## Future Enhancements

- [ ] Custom HTML email support (currently returns "not implemented")
- [ ] Email tracking and analytics
- [ ] Scheduled email sending
- [ ] Email preview generation
- [ ] Multi-language templates
- [ ] Attachment upload from admin UI

## Support

For issues or questions:
- Check console logs for detailed error messages
- Review existing email implementations in `src/lib/email/`
- Test using the test email endpoint first
