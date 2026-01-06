# Quote to Order Conversion API - Test Examples

## Prerequisites

Before testing, ensure:

1. You have a valid admin JWT token
2. There's at least one approved quotation in the database
3. Supabase environment variables are configured

## Getting an Admin JWT Token

```bash
# Login as admin user
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@epackage-lab.com",
    "password": "your-admin-password"
  }'

# Response will contain access_token
```

## Test 1: Check if Quotation Can Be Converted

Replace `YOUR_JWT_TOKEN` with actual admin JWT and `QUOTATION_UUID` with a valid quotation ID.

```bash
curl -X GET "http://localhost:3000/api/admin/convert-to-order?quotationId=QUOTATION_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (Can Convert):**
```json
{
  "canConvert": true,
  "quotation": {
    "id": "uuid-here",
    "quotation_number": "QT-2025-0001",
    "customer_name": "山田太郎",
    "customer_email": "customer@example.com",
    "total_amount": 110000,
    "subtotal_amount": 100000,
    "tax_amount": 10000,
    "valid_until": "2025-02-01T00:00:00.000Z",
    "estimated_delivery_date": "2025-03-15T00:00:00.000Z",
    "status": "APPROVED"
  },
  "itemCount": 2,
  "itemsSummary": [
    {
      "product_name": "スタンドアップパウチ",
      "quantity": 1000,
      "unit_price": 80,
      "total_price": 80000
    },
    {
      "product_name": "ガセット袋",
      "quantity": 500,
      "unit_price": 40,
      "total_price": 20000
    }
  ]
}
```

**Expected Response (Cannot Convert):**
```json
{
  "canConvert": false,
  "error": "Quotation must be in APPROVED status to convert. Current status: DRAFT"
}
```

## Test 2: Convert Quotation to Order (Minimal)

```bash
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": "QUOTATION_UUID"
  }'
```

## Test 3: Convert Quotation to Order (Full)

```bash
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": "QUOTATION_UUID",
    "paymentTerm": "credit",
    "shippingAddress": {
      "postalCode": "100-0001",
      "prefecture": "東京都",
      "city": "千代田区",
      "addressLine1": "丸の内1-1-1",
      "addressLine2": "〇〇ビル10階",
      "company": "テスト株式会社",
      "contactName": "山田太郎",
      "phone": "03-1234-5678"
    },
    "billingAddress": {
      "postalCode": "100-0001",
      "prefecture": "東京都",
      "city": "千代田区",
      "address": "丸の内1-1-1",
      "building": "〇〇ビル10階",
      "companyName": "テスト株式会社",
      "email": "billing@example.com",
      "phone": "03-1234-5678",
      "taxNumber": "1234567890123"
    },
    "requestedDeliveryDate": "2025-03-01",
    "deliveryNotes": "午前中に配送をお願いします",
    "customerNotes": "急ぎの案件です"
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Quotation successfully converted to order",
  "order": {
    "id": "new-order-uuid",
    "order_number": "ORD-2025-0001",
    "status": "DATA_RECEIVED",
    "current_state": "DATA_RECEIVED",
    "total_amount": 110000,
    "customer_name": "山田太郎",
    "customer_email": "customer@example.com",
    "created_at": "2025-01-01T12:00:00.000Z"
  },
  "quotation": {
    "id": "original-quotation-uuid",
    "quotation_number": "QT-2025-0001",
    "status": "CONVERTED"
  },
  "items": [
    {
      "id": "temp-0",
      "product_name": "スタンドアップパウチ",
      "quantity": 1000,
      "unit_price": 80,
      "total_price": 80000
    },
    {
      "id": "temp-1",
      "product_name": "ガセット袋",
      "quantity": 500,
      "unit_price": 40,
      "total_price": 20000
    }
  ]
}
```

## Test 4: Validation Errors

### Missing Quotation ID

```bash
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "error": "Invalid request data",
  "details": {
    "quotationId": ["Invalid quotation ID format"]
  }
}
```

### Invalid Address Data

```bash
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": "QUOTATION_UUID",
    "shippingAddress": {
      "postalCode": "",
      "prefecture": "",
      "city": "",
      "addressLine1": "",
      "company": "",
      "contactName": "",
      "phone": ""
    }
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid request data",
  "details": {
    "shippingAddress": {
      "postalCode": ["Postal code is required"],
      "prefecture": ["Prefecture is required"],
      ...
    }
  }
}
```

## Test 5: Authorization Errors

### No Token

```bash
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Content-Type: application/json" \
  -d '{"quotationId": "QUOTATION_UUID"}'
```

**Expected Response:**
```json
{
  "error": "Unauthorized. Admin access required."
}
```

### Non-Admin User

```bash
# Use a regular user JWT token (not admin)
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer REGULAR_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"quotationId": "QUOTATION_UUID"}'
```

**Expected Response:**
```json
{
  "error": "Forbidden. Admin access required."
}
```

## Test 6: Business Logic Errors

### Quotation Not Found

```bash
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quotationId": "00000000-0000-0000-0000-000000000000"}'
```

**Expected Response:**
```json
{
  "error": "Quotation not found"
}
```

### Quotation Not Approved

```bash
# Use a quotation ID with status other than APPROVED
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quotationId": "DRAFT_QUOTATION_UUID"}'
```

**Expected Response:**
```json
{
  "error": "Quotation must be in APPROVED status to convert. Current status: DRAFT"
}
```

### Already Converted

```bash
# Try to convert the same quotation twice
curl -X POST http://localhost:3000/api/admin/convert-to-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quotationId": "ALREADY_CONVERTED_QUOTATION_UUID"}'
```

**Expected Response:**
```json
{
  "error": "This quotation has already been converted to an order"
}
```

## Postman Collection

You can import these requests into Postman:

```json
{
  "info": {
    "name": "Quote to Order Conversion API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "adminToken",
      "value": "YOUR_JWT_TOKEN"
    },
    {
      "key": "quotationId",
      "value": "QUOTATION_UUID"
    }
  ]
}
```

## Monitoring

Check browser console or server logs for:

```
[Quote to Order] Converting quotation QUOTATION_UUID
[Quote to Order] Generated order number: ORD-2025-0001
[Quote to Order] Order created successfully
[Order Email] Customer email sent successfully
[Order Email] Admin email sent successfully
```

## Cleanup

After testing, you can delete test orders:

```sql
-- Delete test orders (use with caution)
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'ORD-2025-%'
);
DELETE FROM order_status_history WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'ORD-2025-%'
);
DELETE FROM order_audit_log WHERE table_name = 'orders'
  AND record_id IN (SELECT id FROM orders WHERE order_number LIKE 'ORD-2025-%');
DELETE FROM orders WHERE order_number LIKE 'ORD-2025-%';

-- Reset quotation status (if needed)
UPDATE quotations SET status = 'APPROVED' WHERE id = 'YOUR_QUOTATION_UUID';
```
