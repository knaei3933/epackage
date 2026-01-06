# Japanese Business Email Templates System

A comprehensive email template system for Epackage Lab with proper Japanese business etiquette (keigo), responsive HTML design, and plain text fallbacks.

## Features

- **Japanese Business Etiquette**: Proper keigo (honorifics) and business formatting
- **Dual Format**: HTML and plain text versions for maximum compatibility
- **Responsive Design**: Mobile-friendly email templates
- **Security**: XSS prevention with content sanitization
- **Type Safety**: Full TypeScript support
- **Template Selection**: Easy-to-use API for different email types

## Available Templates

### Customer-Facing Templates

1. **Welcome Email** (`welcome_customer`)
   - New customer registration confirmation
   - Temporary password delivery
   - Service introduction

2. **Approval Notification** (`approval_customer`)
   - Request approval confirmation
   - Approval details and next steps

3. **Rejection Notification** (`rejection_customer`)
   - Request rejection with explanation
   - Alternative options and contact information

4. **Quote Created** (`quote_created_customer`)
   - New quotation notification
   - Quote details and validity period
   - Link to quote review/approval

5. **Order Status Update** (`order_status_update`)
   - Order progress notifications
   - Status updates: processing, in_production, quality_check, ready, delayed

6. **Shipment Notification** (`shipment_notification`)
   - Shipping confirmation
   - Tracking number and carrier info
   - Estimated delivery date

### Admin Templates

7. **New Order Alert** (`admin_new_order`)
   - Notification of new customer orders
   - Order details for admin review

8. **Quote Request Alert** (`admin_quote_request`)
   - Notification of new quote requests
   - Quote details for admin processing

## Usage

### Basic Example

```typescript
import {
  sendWelcomeEmail,
  createRecipient
} from '@/lib/email';

// Create recipient
const recipient = createRecipient(
  '山田太郎',           // Name
  'yamada@example.com', // Email
  '株式会社ABC'        // Company (optional)
);

// Send welcome email
const result = await sendWelcomeEmail(recipient, {
  loginUrl: 'https://epackage-lab.com/login',
  tempPassword: 'TempPass123!'
});

console.log('Success:', result.success);
console.log('Message ID:', result.messageId);
```

### Approval Notification

```typescript
import { sendApprovalEmail, createRecipient } from '@/lib/email';

const recipient = createRecipient(
  '佐藤花子',
  'sato@example.com',
  'XYZ商事'
);

await sendApprovalEmail(
  recipient,
  'サンプルリクエスト',                    // Request type
  '商品サンプル5点のリクエスト',           // Details
  '担当者: 田中',                         // Approved by
  {
    approvalDate: new Date().toISOString(),
    nextSteps: 'サンプル準備完了後、発送いたします'
  }
);
```

### Quote Created Notification

```typescript
import { sendQuoteCreatedEmail, createRecipient } from '@/lib/email';

const recipient = createRecipient('高橋美咲', 'takahisa@example.com');

const quoteInfo = {
  quoteId: 'QT-2024-001234',
  validUntil: '2024-03-31',
  totalAmount: 250000,
  items: [
    {
      description: 'OPPアルミ袋 (200x300mm)',
      quantity: 1000,
      unitPrice: 150,
      amount: 150000
    },
    // ... more items
  ]
};

await sendQuoteCreatedEmail(
  recipient,
  quoteInfo,
  'https://epackage-lab.com/quotes/QT-2024-001234'
);
```

### Order Status Update

```typescript
import { sendOrderStatusUpdateEmail, createRecipient } from '@/lib/email';

const recipient = createRecipient('伊藤健太', 'ito@example.com');

const orderInfo = {
  orderId: 'ORD-2024-005678',
  orderDate: '2024-01-15',
  totalAmount: 450000,
  items: [
    {
      name: 'スタンドアップパウチ',
      quantity: 2000,
      price: 225
    }
  ]
};

await sendOrderStatusUpdateEmail(
  recipient,
  orderInfo,
  'in_production', // status: 'processing' | 'in_production' | 'quality_check' | 'ready' | 'delayed'
  {
    estimatedCompletion: '2024-02-15',
    statusDetails: '現在、製造工程を進めております'
  }
);
```

### Shipment Notification

```typescript
import { sendShipmentNotificationEmail, createRecipient } from '@/lib/email';

const recipient = createRecipient('渡辺麻衣', 'watanabe@example.com');

const orderInfo = {
  orderId: 'ORD-2024-005678',
  orderDate: '2024-01-15',
  totalAmount: 450000,
  items: [
    {
      name: 'スタンドアップパウチ',
      quantity: 2000,
      price: 225
    }
  ]
};

const shipmentInfo = {
  trackingNumber: 'JP12345678901234567890',
  carrier: 'ヤマト運輸',
  estimatedDelivery: '2024-01-20',
  shippingAddress: '〒100-0001\n東京都千代田区1-1-1\n渡辺麻衣 様'
};

await sendShipmentNotificationEmail(
  recipient,
  orderInfo,
  shipmentInfo,
  {
    trackingUrl: 'https://track.yamato-transport.co.jp/JA01?id=JP12345678901234567890'
  }
);
```

### Admin Notifications

```typescript
import {
  sendAdminNewOrderEmail,
  sendAdminQuoteRequestEmail
} from '@/lib/email';

// New order notification
await sendAdminNewOrderEmail(orderInfo, {
  name: '近藤太一',
  email: 'kondo@example.com',
  company: 'JKL包装'
});

// Quote request notification
await sendAdminQuoteRequestEmail(quoteInfo, {
  name: '中田裕子',
  email: 'nakata@example.com',
  company: 'MNL食品'
});
```

## Template Customization

All templates follow Japanese business email conventions:

- **Keigo (Honorifics)**: Proper sonkeigo (respectful language) and kenjougo (humble language)
- **Structure**: Greeting → Main content → Closing
- **Formatting**: Traditional Japanese email layout
- **Colors**: Professional color schemes matching each email type
- **Responsive**: Mobile-optimized layouts

## Email Rendering

### HTML Features

- Inline CSS for email client compatibility
- Responsive tables for layout
- Mobile-first design
- Fallback fonts for Japanese characters

### Plain Text

- Well-formatted text version
- Proper line breaks and spacing
- All critical information included

## Security

All user input is sanitized using `sanitize-html` to prevent XSS attacks:

```typescript
function sanitizeContent(content: string): string {
  const clean = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return clean.replace(/\n/g, '<br>');
}
```

## Development vs Production

### Development (Ethereal Email)

```typescript
const result = await sendWelcomeEmail(recipient);
console.log('Preview URL:', result.previewUrl);
// Visit the URL to see the email in browser
```

### Production (SendGrid/AWS SES)

Automatically uses configured email service:

```bash
# .env.local
SENDGRID_API_KEY=SG.your-key-here
FROM_EMAIL=noreply@epackage-lab.com
ADMIN_EMAIL=admin@epackage-lab.com
```

## Testing

See `email-templates.examples.ts` for comprehensive usage examples including:

- Error handling
- Batch email sending
- Order status workflows
- API route integration

## Type Definitions

```typescript
interface EmailRecipient {
  name: string;
  email: string;
  company?: string;
}

interface QuoteInfo {
  quoteId: string;
  validUntil: string;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface OrderInfo {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface ShipmentInfo {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: string;
}
```

## File Structure

```
src/lib/
├── email.ts                      # Main email sending functions
├── email-templates.ts            # Template definitions and rendering
└── email-templates.examples.ts   # Usage examples
```

## Best Practices

1. **Always use `createRecipient`** to create recipient objects with proper sanitization
2. **Handle errors** from email sending functions
3. **Use preview URLs** in development to test email appearance
4. **Provide complete data** for all template fields
5. **Follow Japanese business etiquette** when customizing templates

## Troubleshooting

### Email not sending

Check email configuration:
```typescript
import { getEmailConfigStatus } from '@/lib/email';

const status = getEmailConfigStatus();
console.log(status);
// { mode, transportType, configured, hasSendGrid, hasAwsSes, ... }
```

### TypeScript errors

Ensure all imported types match:
```typescript
import type { QuoteInfo, OrderInfo, ShipmentInfo } from '@/lib/email-templates';
```

### Template not found

Use correct template type:
```typescript
type EmailTemplateType =
  | 'welcome_customer'
  | 'approval_customer'
  | 'rejection_customer'
  | 'quote_created_customer'
  | 'order_status_update'
  | 'shipment_notification'
  | 'admin_new_order'
  | 'admin_quote_request';
```

## Support

For issues or questions:
- Check examples in `email-templates.examples.ts`
- Review type definitions in `email-templates.ts`
- Test with Ethereal Email in development mode
