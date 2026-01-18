# Payment APIs Quick Reference Guide

Quick reference for the Order Receipt and Payment Confirmation APIs.

## Table of Contents
1. [Order Receipt API](#order-receipt-api)
2. [Payment Confirmation API](#payment-confirmation-api)
3. [Error Codes](#error-codes)
4. [Configuration](#configuration)

---

## Order Receipt API

### Endpoint
```
POST /api/orders/receive
```

### Authentication
```
X-API-Key: your-api-key
```

### Request Example
```json
{
  "external_order_id": "EXT-20250105-0001",
  "customer_name": "山田太郎",
  "customer_email": "yamada@example.com",
  "customer_phone": "03-1234-5678",
  "company_name": "株式会社テスト",
  "items": [
    {
      "product_name": "三辺シール袋",
      "quantity": 1000,
      "unit_price": 150,
      "specifications": {
        "size": "100x150mm",
        "material": "PET/PE"
      }
    }
  ],
  "subtotal": 150000,
  "tax_amount": 15000,
  "total_amount": 165000,
  "payment_method": "bank_transfer",
  "payment_term": "advance",
  "shipping_address": {
    "postal_code": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "address": "丸の内1-1-1",
    "building": "テストビル10F",
    "contact_person": "山田太郎",
    "phone": "03-1234-5678"
  }
}
```

### Response Example (Success)
```json
{
  "success": true,
  "order_id": "uuid-here",
  "order_number": "EXT-20250105-0001",
  "message": "Order received successfully"
}
```

### Response Example (Validation Error)
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "customer_email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}
```

---

## Payment Confirmation API

### Endpoints
```
POST /api/payments/confirm  # Confirm payment
GET  /api/payments/confirm?payment_id={id}  # Get payment status
```

### Authentication
```
X-API-Key: your-api-key
```

### POST Request Example
```json
{
  "payment_id": "pay_1234567890",
  "external_order_id": "EXT-20250105-0001",
  "amount": 165000,
  "currency": "JPY",
  "payment_method": "credit_card",
  "payment_gateway": "stripe",
  "status": "completed",
  "transaction_id": "ch_1234567890",
  "payment_date": "2026-01-05T10:30:00Z",
  "idempotency_key": "idem_1234567890",
  "gateway_data": {
    "card_brand": "visa",
    "card_last4": "4242"
  }
}
```

### With Webhook Signature
```json
{
  "payment_id": "pay_1234567890",
  "amount": 165000,
  "currency": "JPY",
  "payment_method": "credit_card",
  "payment_gateway": "stripe",
  "status": "completed",
  "payment_date": "2026-01-05T10:30:00Z",
  "webhook_signature": {
    "provider": "stripe",
    "signature": "t=1704451200,v1=abc123...",
    "payload": "{...}"
  }
}
```

### Response Example (Success)
```json
{
  "success": true,
  "payment_id": "pay_1234567890",
  "confirmation_id": "uuid-here",
  "order_id": "order-uuid",
  "order_number": "EXT-20250105-0001",
  "message": "Payment confirmed successfully"
}
```

### GET Request Example
```
GET /api/payments/confirm?payment_id=uuid-here
GET /api/payments/confirm?transaction_id=ch_1234567890
```

### GET Response Example
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "order_id": "order-uuid",
    "payment_method": "credit_card",
    "payment_gateway": "stripe",
    "amount": 165000,
    "currency": "JPY",
    "status": "completed",
    "payment_date": "2026-01-05T10:30:00Z",
    "transaction_id": "ch_1234567890"
  }
}
```

---

## Error Codes

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success (idempotent request) |
| 201 | Created (new resource) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid API key) |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

### Validation Error Codes
| Code | Description |
|------|-------------|
| `REQUIRED_FIELD` | Missing required field |
| `INVALID_EMAIL` | Invalid email format |
| `INVALID_AMOUNT` | Invalid amount (must be positive) |
| `INVALID_DATE` | Invalid date format |
| `INVALID_QUANTITY` | Invalid quantity (must be positive) |
| `INVALID_PRICE` | Invalid price (must be non-negative) |
| `INVALID_PAYMENT_TERM` | Invalid payment term (must be 'credit' or 'advance') |
| `INVALID_PAYMENT_METHOD` | Invalid payment method |
| `INVALID_SIGNATURE` | Invalid webhook signature |

---

## Configuration

### Environment Variables

```bash
# API Keys
EXTERNAL_API_KEYS=key1,key2,key3

# Square
SQUARE_WEBHOOK_SIGNATURE_KEY=your_square_key
SQUARE_LOCATION_ID=your_location_id

# Stripe
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_CLIENT_ID=your_client_id

# SB Payment
SB_PAYMENT_MERCHANT_ID=your_merchant_id
SB_PAYMENT_HASH_KEY=your_hash_key
```

### Payment Methods
- `bank_transfer` - 銀行振込
- `credit_card` - クレジットカード
- `paypal` - PayPal
- `square` - Square
- `stripe` - Stripe
- `sb_payment` - SBペイメントサービス
- `other` - その他

### Payment Gateways
- `square` - Square (Japan)
- `stripe` - Stripe (Japan)
- `paypal` - PayPal
- `sb_payment` - SB Payment Service
- `manual` - Manual confirmation
- `none` - No gateway

### Payment Statuses
- `pending` - 未入金
- `processing` - 処理中
- `completed` - 入金済み
- `failed` - 入金失敗
- `cancelled` - キャンセル
- `refunded` - 返金済み
- `partial_refund` - 一部返金

### Payment Terms
- `credit` - 掛け払い (後払い)
- `advance` - 前払い (先払い)

---

## Quick Testing

### Test Order Receipt
```bash
curl -X POST http://localhost:3000/api/orders/receive \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-12345" \
  -d '{
    "customer_name": "テスト",
    "customer_email": "test@example.com",
    "items": [{"product_name": "商品", "quantity": 1, "unit_price": 1000}],
    "subtotal": 1000,
    "tax_amount": 100,
    "total_amount": 1100,
    "payment_method": "bank_transfer",
    "payment_term": "advance"
  }'
```

### Test Payment Confirmation
```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-12345" \
  -d '{
    "payment_id": "pay_test",
    "amount": 1100,
    "currency": "JPY",
    "payment_method": "bank_transfer",
    "payment_gateway": "manual",
    "status": "completed",
    "payment_date": "2026-01-05T10:30:00Z"
  }'
```

---

## Idempotency Keys

### Order Receipt
Use `external_order_id` to ensure idempotency:
```json
{
  "external_order_id": "UNIQUE-ID-HERE",
  "customer_name": "...",
  ...
}
```

### Payment Confirmation
Use `idempotency_key` to ensure idempotency:
```json
{
  "idempotency_key": "UNIQUE-ID-HERE",
  "payment_id": "pay_...",
  ...
}
```

---

## Rate Limiting

- **Limit**: 100 requests per minute per API key
- **Headers** (when rate limited):
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1704451200
  ```

---

## Japanese Email Notifications

### Order Confirmation Email
- Automatically sent to `customer_email`
- Subject: `【Epackage Lab】ご注文確認 (ORDER-NUMBER)`
- Includes order details, items, and pricing

### Payment Confirmation Email
- Automatically sent to order's customer email
- Subject: `【Epackage Lab】入金確認 (ORDER-NUMBER)`
- Includes payment details and order information

---

## Webhook Signature Verification

### Square
```typescript
const signature = req.headers['x-square-hmacsha256-signature'];
const payload = JSON.stringify(req.body);
const isValid = verifySquareSignature(signature, payload, webhookKey);
```

### Stripe
```typescript
const signature = req.headers['stripe-signature'];
const payload = JSON.stringify(req.body);
const isValid = verifyStripeSignature(signature, payload, webhookSecret);
```

### PayPal
```typescript
const webhookId = process.env.PAYPAL_WEBHOOK_ID;
const payload = JSON.stringify(req.body);
const isValid = verifyPayPalSignature(signature, payload, webhookId);
```

---

## Database Tables

### payment_confirmations
```sql
CREATE TABLE payment_confirmations (
  id UUID PRIMARY KEY,
  quotation_id UUID REFERENCES quotations(id),
  order_id UUID REFERENCES orders(id),
  payment_method VARCHAR(50) NOT NULL,
  payment_gateway VARCHAR(50) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'JPY',
  reference_number VARCHAR(255),
  transaction_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  gateway_response JSONB,
  notes TEXT,
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

---

## Support & Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check API key is valid
   - Verify `X-API-Key` header

2. **400 Validation Error**
   - Check request schema
   - Verify required fields
   - Check data types

3. **429 Rate Limit Exceeded**
   - Wait before retrying
   - Implement exponential backoff
   - Contact admin for limit increase

4. **Order Not Found**
   - Verify order ID
   - Check order exists in database

### Debug Mode
Add `?debug=true` to API URLs for detailed error messages.

---

## Type Definitions

Full TypeScript types available in:
- `src/types/payment.ts`

---

For complete documentation, see: `docs/P2-12_P2-13_IMPLEMENTATION_SUMMARY.md`
