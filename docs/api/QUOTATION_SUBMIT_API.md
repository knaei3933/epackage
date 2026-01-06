# Quotation Submission API

## Overview

`POST /api/quotations/submit` - Submit a new quotation with items for admin review.

## Authentication

**Required**: Yes (Bearer token via session cookies)

Uses Next.js 16 compatible `createRouteHandlerClient` with `await cookies()`.

## Request

### Headers

```
Content-Type: application/json
```

### Body

```typescript
{
  items: Array<{
    product_name: string;      // Required
    quantity: number;           // Required, must be > 0
    unit_price: number;         // Required, must be >= 0
    total_price: number;        // Required, must be >= 0
    product_code?: string;      // Optional
    category?: string;          // Optional
    specifications?: object;    // Optional
    notes?: string;             // Optional
  }>;
  notes?: string;               // Optional, customer notes
  urgency?: 'normal' | 'urgent' | 'expedited'; // Optional (for future use)
}
```

### Validation Rules

- **items**: Must be an array with at least 1 item
- **product_name**: Required, non-empty string
- **quantity**: Required, number greater than 0
- **unit_price**: Required, non-negative number
- **total_price**: Required, non-negative number

## Response

### Success (201 Created)

```json
{
  "success": true,
  "quotation": {
    "id": "uuid",
    "quotation_number": "QT-2026-0001",
    "user_id": "user-uuid",
    "status": "SENT",
    "customer_name": "山田 太郎",
    "customer_email": "user@example.com",
    "customer_phone": "+81-3-1234-5678",
    "subtotal_amount": 10000,
    "tax_amount": 1000,
    "total_amount": 11000,
    "notes": "納期をお早めにお願いします。",
    "valid_until": "2026-02-03T00:00:00.000Z",
    "sent_at": "2026-01-04T12:00:00.000Z",
    "created_at": "2026-01-04T12:00:00.000Z",
    "quotation_items": [
      {
        "id": "item-uuid",
        "quotation_id": "uuid",
        "product_name": "スタンドアップパウチ",
        "product_code": "SUP-001",
        "category": "pouch",
        "quantity": 1000,
        "unit_price": 10,
        "total_price": 10000,
        "display_order": 0,
        "created_at": "2026-01-04T12:00:00.000Z"
      }
    ]
  },
  "message": "見積を提出しました。管理者が確認次第、ご連絡いたします。"
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "error": "認証されていません。"
}
```

#### 400 Bad Request

```json
{
  "error": "最少でも1つの商品が必要です。"
}
```

or

```json
{
  "error": "商品 1: 商品名は必須です。"
}
```

or

```json
{
  "error": "商品 1: 数量は0より大きくなければなりません。"
}
```

#### 500 Internal Server Error

```json
{
  "error": "見積の作成に失敗しました。"
}
```

or

```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## Implementation Details

### Quotation Number Generation

The API automatically generates a unique quotation number in the format: `QT-YYYY-NNNN`

- `YYYY`: Current year
- `NNNN`: Sequential 4-digit number (resets annually)

Example: `QT-2026-0001`, `QT-2026-0002`

### Tax Calculation

Japanese consumption tax (10%) is automatically calculated:

```typescript
subtotal = sum(items.total_price)
taxAmount = subtotal * 0.1
totalAmount = subtotal + taxAmount
```

### Validity Period

Quotations are valid for 30 days from creation by default.

### Customer Information

The API automatically extracts customer information from the authenticated user's profile:

- **customer_name**: `{kanji_last_name} {kanji_first_name}` from profiles table
- **customer_email**: User's email from auth
- **customer_phone**: `corporate_phone` from profiles table

### Rollback on Error

If quotation items fail to create, the quotation is automatically deleted to prevent orphaned records.

## Example Usage

### JavaScript/TypeScript

```typescript
const response = await fetch('/api/quotations/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      {
        product_name: 'スタンドアップパウチ',
        quantity: 1000,
        unit_price: 10,
        total_price: 10000,
        product_code: 'SUP-001',
        category: 'pouch',
        specifications: {
          size: '200x300mm',
          material: 'PET/AL/PE',
        },
      },
    ],
    notes: '納期をお早めにお願いします。',
    urgency: 'urgent',
  }),
});

const data = await response.json();

if (response.ok) {
  console.log('Quotation submitted:', data.quotation.quotation_number);
} else {
  console.error('Error:', data.error);
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/quotations/submit \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_name": "スタンドアップパウチ",
        "quantity": 1000,
        "unit_price": 10,
        "total_price": 10000
      }
    ],
    "notes": "納期をお早めにお願いします。"
  }'
```

## Database Schema

### quotations Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| quotation_number | string | QT-YYYY-NNNN format |
| status | enum | DRAFT, SENT, APPROVED, REJECTED, EXPIRED, CONVERTED |
| customer_name | string | Customer name snapshot |
| customer_email | string | Customer email snapshot |
| customer_phone | string | Customer phone snapshot |
| subtotal_amount | number | Amount before tax |
| tax_amount | number | 10% consumption tax |
| total_amount | number | Final amount including tax |
| notes | string | Customer notes |
| valid_until | timestamp | Valid for 30 days |
| sent_at | timestamp | Submission timestamp |
| created_at | timestamp | Creation timestamp |

### quotation_items Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| quotation_id | uuid | FK to quotations |
| product_name | string | Product name |
| product_code | string | Product SKU |
| category | string | Product category |
| quantity | number | Order quantity |
| unit_price | number | Price per unit |
| total_price | number | Line total (quantity * unit_price) |
| specifications | json | Product specifications |
| notes | string | Item-specific notes |
| display_order | number | Sort order |
| created_at | timestamp | Creation timestamp |

## Security

- **Authentication required**: All requests must be authenticated
- **User isolation**: Quotations are automatically linked to the authenticated user
- **Input validation**: All fields are validated before database insertion
- **SQL injection protection**: Supabase client uses parameterized queries
- **Rate limiting**: Should be implemented at API middleware level

## Next.js 16 Compatibility

This API uses Next.js 16 compatible patterns:

```typescript
// ✅ Correct: Await cookies()
const cookieStore = await cookies();
const supabase = createRouteHandlerClient<Database>({
  cookies: () => cookieStore,
});

// ❌ Incorrect: Not awaiting cookies()
const cookieStore = cookies(); // This will fail in Next.js 16
```

## Testing

Unit tests are available in:
`src/app/api/quotations/submit/__tests__/route.test.ts`

Run tests:
```bash
npm test -- src/app/api/quotations/submit/__tests__/route.test.ts
```

## Related APIs

- `GET /api/quotations` - List user's quotations
- `GET /api/quotations/[id]` - Get quotation details
- `POST /api/quotations` - Create draft quotation
- `POST /api/b2b/quotations` - B2B quotation creation

## Future Enhancements

- [ ] Add urgency level processing
- [ ] Send email notification to admin on submission
- [ ] Send confirmation email to customer
- [ ] Implement rate limiting
- [ ] Add support for file attachments
- [ ] Generate PDF automatically on submission
