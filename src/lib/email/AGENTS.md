<!-- Parent: ../AGENTS.md -->

# Email Module

**Purpose:** Email templates and sending logic for Epackage Lab B2B workflow notifications.

## Overview

This module handles all email communications for the Epackage Lab platform, including:
- Japanese business email templates with proper keigo (敬語)
- Order status-based automatic email dispatching
- SendGrid/Xserver SMTP integration for reliable delivery
- Account deletion notifications
- Korea team correction requests (Korean language support)

---

## Key Files

### Core Services

| File | Purpose | Exports |
|------|---------|---------|
| `index.ts` | Module exports | All email services and templates |
| `notificationService.ts` | SendGrid-based notification service | `sendEmail`, `handleNotificationEvent`, template functions |
| `epack-mailer.ts` | Xserver SMTP mailer for Epackage Lab | `epackMailer`, `sendEpackEmail` |
| `epack-templates.ts` | 14 Japanese email templates | `epackEmailTemplates`, template functions |
| `order-status-emails.ts` | Status-based email dispatcher | `orderStatusEmails`, `sendEmailForOrderStatus` |
| `account-deleted.ts` | Account deletion email | `sendAccountDeletionEmail` |

### Template Files (`templates/`)

| File | Template ID | Recipient | Trigger |
|------|-------------|-----------|---------|
| `quote_created_admin.ts` | `quote_created_admin` | Admin | New quotation created |
| `quote_approved_customer.ts` | `quote_approved_customer` | Customer | Quotation approved |
| `contract_sent.ts` | `contract_sent` | Customer | Contract sent for signature |
| `contract_signed_admin.ts` | `contract_signed_admin` | Admin | Contract signed by customer |
| `production_update.ts` | `production_update` | Customer | Production status updated |
| `shipped.ts` | `shipped` | Customer | Order shipped |

---

## For AI Agents

### Email Patterns

When working with emails in this module:

1. **Use the status-based dispatcher** for order workflow emails:
   ```typescript
   import { orderStatusEmails } from '@/lib/email'

   await orderStatusEmails.sendForStatus('shipped', config, metadata)
   ```

2. **Use epackMailer for Epackage Lab business emails**:
   ```typescript
   import { epackMailer } from '@/lib/email'

   await epackMailer.shipped({
     order_id: '...',
     order_number: 'ORD-2025-001',
     customer_email: 'customer@example.com',
     customer_name: '山田 太郎',
     // ... other fields
   })
   ```

3. **For admin notifications**, use `notificationService`:
   ```typescript
   import { sendQuoteCreatedAdminEmail } from '@/lib/email'

   await sendQuoteCreatedAdminEmail(data)
   ```

### Adding New Email Templates

1. Create template in `templates/[template-name].ts`:
   ```typescript
   export const subject = (data: TemplateData) => `Subject`
   export const plainText = (data: TemplateData) => `Plain text body`
   export const html = (data: TemplateData) => `<html>...</html>`
   ```

2. Register in `templates/index.ts`

3. Add to event mapping in `notificationService.ts` if needed

### Japanese Email Etiquette

All Epackage Lab emails follow Japanese business email standards:
- Proper keigo (sonkeigo, kenjougo)
- Standard greeting/opening (平素より格別のご愛顧を賜り...)
- Standard closing (何卒よろしくお願い申し上げます)
- Company information footer

### Status Email Mapping

Order status → Email template mapping (in `order-status-emails.ts`):

| Order Status | Email Template | Metadata Required |
|--------------|----------------|-------------------|
| `data_upload_required` | Data Upload Request | `deadline` |
| `data_received` | Data Received Confirmation | `fileName` |
| `modification_required` | Modification Request | `modificationDetails` |
| `modification_approved` | Modification Approved | - |
| `modification_rejected` | Modification Rejected | `rejectionReason` |
| `correction_ready` | Correction Ready | - |
| `approval_pending` | Approval Request | `deadline` |
| `in_production` | Production Started | `estimatedCompletion` |
| `ready_to_ship` | Ready to Ship | `quantity` |
| `shipped` | Shipped | `trackingNumber`, `carrier`, `estimatedDelivery` |
| `cancelled` | Order Cancelled | `cancellationReason`, `refundAmount`, `refundMethod` |
| `korea_correction_pending` | Korea Correction Request | `correctionDetails` |

---

## Dependencies

### External

- `@sendgrid/mail` - SendGrid API client
- `nodemailer` - SMTP transport (Xserver, AWS SES)

### Internal

- `@/types/email` - Email type definitions
- `@/lib/email/templates` - Email templates

### Environment Variables

```env
# SendGrid (primary)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@epackage-lab.com
REPLY_TO_EMAIL=support@epackage-lab.com
ADMIN_EMAIL=admin@epackage-lab.com

# Xserver SMTP (Epackage Lab)
XSERVER_SMTP_HOST=smtp.xserver.ne.jp
XSERVER_SMTP_PORT=587
XSERVER_SMTP_USER=username
XSERVER_SMTP_PASSWORD=password

# AWS SES (fallback)
AWS_SES_SMTP_USERNAME=AKIA...
AWS_SES_SMTP_PASSWORD=xxxxx
AWS_SES_SMTP_HOST=email-smtp.ap-northeast-1.amazonaws.com
AWS_SES_SMTP_PORT=587
```

---

## Common Tasks

### Send a Status-Based Email

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

### Send Account Deletion Email

```typescript
import { sendAccountDeletionEmail } from '@/lib/email/account-deleted'

await sendAccountDeletionEmail(
  'user@example.com',
  'user-id-123',
  new Date(),
  {
    profile: 1,
    orders: 5,
    quotations: 3,
    // ... other counts
  }
)
```

### Test Email Sending

```typescript
import { epackMailer } from '@/lib/email'

await epackMailer.sendTest('test@example.com', 'quoteReady')
```

---

## Testing

Tests are in `__tests__/`:
- `notificationService.test.ts` - SendGrid notification service tests
- `templates.test.ts` - Email template rendering tests

---

## Architecture Notes

1. **Transport Fallback Chain**: SendGrid → AWS SES → Console
2. **Dual Format**: All templates provide both HTML and plain text
3. **Status Automation**: Order status changes trigger automatic emails
4. **Bank Information**: PayPay Bank account included in refund emails
5. **Multilingual**: Japanese primary, Korean for Korea team corrections
