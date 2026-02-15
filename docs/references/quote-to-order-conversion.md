# Quote to Order Conversion System

## Overview

This document describes the implementation of the automatic Quote → Order conversion system for Epackage Lab. The system enables seamless conversion of approved quotations into orders with proper validation, transaction handling, and notifications.

## API Endpoint

### POST `/api/admin/convert-to-order`

Converts an approved quotation into an order.

#### Request Body

```typescript
{
  quotationId: string;                    // Required: UUID of the quotation
  paymentTerm?: 'credit' | 'advance';    // Optional: Payment term (default: credit)
  shippingAddress?: {                     // Optional: Shipping address
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    company: string;
    contactName: string;
    phone: string;
  };
  billingAddress?: {                      // Optional: Billing address
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    companyName: string;
    email?: string;
    phone?: string;
    taxNumber?: string;
  };
  requestedDeliveryDate?: string;         // Optional: ISO date string
  deliveryNotes?: string;                 // Optional: Delivery instructions
  customerNotes?: string;                 // Optional: Customer notes
}
```

#### Response (Success - 201)

```typescript
{
  success: true;
  message: "Quotation successfully converted to order";
  order: {
    id: string;
    order_number: string;                // Format: ORD-YYYY-NNNN
    status: "DATA_RECEIVED";
    current_state: string;
    total_amount: number;
    customer_name: string;
    customer_email: string;
    created_at: string;
  };
  quotation: {
    id: string;
    quotation_number: string;
    status: "CONVERTED";
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}
```

#### Response (Error - 400/401/403/500)

```typescript
{
  success: false;
  error: string;                          // Error message
  details?: Record<string, string[] | string>;  // Validation details (400)
}
```

### GET `/api/admin/convert-to-order?quotationId={uuid}`

Validates if a quotation can be converted to an order.

#### Response (Success - 200)

```typescript
{
  canConvert: true;
  quotation: {
    id: string;
    quotation_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    subtotal_amount: number;
    tax_amount: number;
    valid_until: string | null;
    estimated_delivery_date: string | null;
    status: string;
  };
  itemCount: number;
  itemsSummary: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}
```

#### Response (Cannot Convert - 200)

```typescript
{
  canConvert: false;
  error: string;  // Reason why conversion is not possible
}
```

## Validation Rules

### Quotation Status Check

- **Must be APPROVED**: Only quotations with status `APPROVED` can be converted
- **Not expired**: Quotation `valid_until` date must be in the future (if set)
- **Not already converted**: Quotation must not have an existing order linked

### Required Data

- At least one quotation item must exist
- Customer information must be complete (name, email)
- Pricing data must be valid (subtotal, tax, total)

## Database Operations

### Transaction Flow

1. **Generate order number**: Creates unique order number (ORD-YYYY-NNNN)
2. **Insert order**: Creates order record with status `DATA_RECEIVED`
3. **Copy items**: Duplicates all quotation items to order items
4. **Update quotation**: Changes quotation status to `CONVERTED`
5. **Create status history**: Logs initial status change
6. **Create audit logs**: Records all changes for compliance

### Rollback Behavior

If any step fails, the system performs automatic rollback:

- Order items deleted if order creation fails
- Order deleted if items copy fails
- Quotation status reverted if audit log fails

### Order Number Format

```
ORD-YYYY-NNNN
  │   │    └─ Sequential number (0001-9999)
  │   └────── Year
  └────────── Order prefix
```

Example: `ORD-2025-0001`

## Email Notifications

### Customer Email

Sent to: `{customer_email}`

Subject: `【Epackage Lab】注文を受け付けました ({orderNumber})`

Content includes:
- Order number and details
- Itemized list with prices
- Payment terms
- Estimated delivery date
- Shipping address
- Next steps (data receipt → work order → contract → production)

### Admin Notification Email

Sent to: `{ADMIN_EMAIL}` (from environment variable)

Subject: `【新規注文】{orderNumber} - {customerName}`

Content includes:
- Order ID and number
- Customer information with contact links
- Order summary
- Link to management dashboard

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `QUOTATION_NOT_FOUND` | Quotation does not exist | 400 |
| `QUOTATION_NOT_APPROVED` | Quotation not in APPROVED status | 400 |
| `QUOTATION_ALREADY_CONVERTED` | Order already exists for this quotation | 400 |
| `QUOTATION_EXPIRED` | Quotation validity period has passed | 400 |
| `NO_ITEMS_FOUND` | No items in quotation | 400 |
| `UNAUTHORIZED` | No valid admin token | 401 |
| `FORBIDDEN` | User is not an active admin | 403 |
| `ORDER_CREATION_FAILED` | Database error creating order | 500 |

### Error Response Format

```typescript
{
  error: "Human-readable error message",
  details: {  // Only in development mode
    field: ["Detailed error messages"]
  }
}
```

## Security

### Authentication

- Bearer token required in `Authorization` header
- Token must be valid Supabase JWT
- User must have `ADMIN` role
- User status must be `ACTIVE`

### Authorization Check

```typescript
const { data: adminProfile } = await supabase
  .from('profiles')
  .select('role, status')
  .eq('id', adminUserId)
  .single();

if (!adminProfile || adminProfile.role !== 'ADMIN' || adminProfile.status !== 'ACTIVE') {
  return 403 Forbidden;
}
```

## Audit Trail

All conversion actions are logged in `order_audit_log` table:

- **Table name**: `orders`, `quotations`
- **Action**: `INSERT` (order), `UPDATE` (quotation status)
- **Changed by**: Admin user ID
- **IP address**: From `X-Forwarded-For` header
- **User agent**: From `User-Agent` header
- **Timestamp**: ISO 8601 format

## Testing

### Example: Convert Quotation to Order

```bash
curl -X POST https://your-domain.com/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": "uuid-of-approved-quotation",
    "paymentTerm": "credit",
    "shippingAddress": {
      "postalCode": "100-0001",
      "prefecture": "東京都",
      "city": "千代田区",
      "addressLine1": "丸の内1-1-1",
      "company": "テスト株式会社",
      "contactName": "山田太郎",
      "phone": "03-1234-5678"
    },
    "requestedDeliveryDate": "2025-03-01"
  }'
```

### Example: Check if Quotation Can Be Converted

```bash
curl -X GET "https://your-domain.com/api/admin/convert-to-order?quotationId=uuid-of-quotation" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## File Structure

```
src/
├── app/
│   └── api/
│       └── admin/
│           └── convert-to-order/
│               └── route.ts          # Main API endpoint
├── lib/
│   ├── email-order.ts                # Order email templates
│   └── supabase.ts                   # Database client
└── types/
    ├── database.ts                   # Supabase types
    ├── order-conversion.ts           # Conversion types
    └── order-status.ts               # Order status types
```

## Environment Variables

Required:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (optional, defaults shown)
FROM_EMAIL=noreply@epackage-lab.com
ADMIN_EMAIL=admin@epackage-lab.com
SENDGRID_API_KEY=SG.your-sendgrid-key
```

## Future Enhancements

Potential improvements:

1. **Batch conversion**: Convert multiple quotations at once
2. **Webhook notifications**: Send order events to external systems
3. **Custom order numbers**: Support custom order number formats
4. **Partial conversion**: Convert selected items only
5. **Order templates**: Pre-configured shipping/billing addresses
6. **Approval workflow**: Multi-step approval before conversion
7. **Price adjustment**: Allow price modifications during conversion
8. **Currency support**: Multi-currency order processing

## Troubleshooting

### Issue: "Quotation not found"

**Cause**: Invalid UUID or quotation doesn't exist
**Solution**: Verify quotation ID and check database

### Issue: "Quotation must be in APPROVED status"

**Cause**: Quotation status is not `APPROVED`
**Solution**: Update quotation status to `APPROVED` first

### Issue: "Order creation failed"

**Cause**: Database constraint or connection error
**Solution**: Check database logs and connection settings

### Issue: "Emails not sending"

**Cause**: Email service not configured or API keys missing
**Solution**: Verify `SENDGRID_API_KEY` and email configuration

### Issue: "Forbidden. Admin access required"

**Cause**: User is not an admin or account not active
**Solution**: Check user role and status in profiles table
