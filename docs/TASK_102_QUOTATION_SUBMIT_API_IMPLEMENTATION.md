# Task 102: Quotation Submission API Implementation Summary

## Overview
Implemented a production-ready Quotation Submission API (`POST /api/quotations/submit`) that uses Supabase SQL execution for all database operations.

## Implementation Details

### Files Created/Modified

#### 1. New Library: `src/lib/supabase-sql.ts`
Created a server-side SQL execution library that provides:
- `executeSql<T>()`: Generic SQL execution with type safety
- `getQuotationProfile()`: Fetch user profile data
- `generateQuotationNumber()`: Generate unique quotation numbers (QT-YYYY-NNNN format)
- `insertQuotation()`: Insert quotation record with returning ID
- `insertQuotationItems()`: Bulk insert quotation items
- `getCompleteQuotation()`: Fetch quotation with related items using JSON aggregation
- `deleteQuotation()`: Delete quotation for rollback scenarios

**Key Features:**
- Uses Supabase service client (bypasses RLS for server operations)
- Parameterized queries (SQL injection protection)
- Type-safe result handling
- Error handling with detailed error messages
- Follows MCP-style interface for consistency

#### 2. Updated: `src/app/api/quotations/submit/route.ts`
Complete rewrite to use the new Supabase SQL library.

**Database Operations:**
1. **Get User Profile**: Fetch customer name, phone, company from profiles table
2. **Generate Quotation Number**: Auto-increment sequence per year (QT-2026-0001)
3. **Insert Quotation**: Create quotation record with calculated totals
4. **Insert Quotation Items**: Bulk insert all items with proper escaping
5. **Fetch Complete Quotation**: Return quotation with items using JSON aggregation

**Request Schema:**
```typescript
{
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_code?: string;
    category?: string;
    specifications?: object;
    notes?: string;
  }>;
  notes?: string;
  urgency?: 'normal' | 'urgent' | 'expedited';
}
```

**Response Schema:**
```typescript
{
  success: true;
  quotation: {
    id: string;
    quotation_number: string; // e.g., "QT-2026-0001"
    status: "SENT";
    customer_name: string;
    customer_email: string;
    subtotal_amount: number;
    tax_amount: number; // 10% Japanese consumption tax
    total_amount: number;
    valid_until: string; // 30 days from creation
    items: Array<QuotationItem>;
  };
  message: string;
}
```

#### 3. Fixed: `src/app/api/admin/inventory/update/route.ts`
- Fixed incorrect MCP import path
- Updated to use standard Supabase client

#### 4. Fixed: `src/app/api/admin/production/update-status/route.ts`
- Fixed incorrect MCP import path
- Updated to use `executeSql` from `@/lib/supabase-sql`

## Database Schema

### Tables Used

**quotations**
```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  quotation_number TEXT UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'SENT',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subtotal_amount NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL, -- Alias for compatibility
  notes TEXT,
  valid_until TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**quotation_items**
```sql
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  specifications JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### SQL Query Examples

**Generate Quotation Number:**
```sql
SELECT quotation_number
FROM quotations
WHERE quotation_number LIKE 'QT-2026-%'
ORDER BY quotation_number DESC
LIMIT 1
```

**Insert Quotation:**
```sql
INSERT INTO quotations (
  user_id, quotation_number, status,
  customer_name, customer_email, customer_phone,
  subtotal_amount, tax_amount, total_amount,
  notes, valid_until, sent_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING id
```

**Fetch Complete Quotation:**
```sql
SELECT
  q.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', qi.id,
        'product_name', qi.product_name,
        'quantity', qi.quantity,
        -- ... other fields
      ) ORDER BY qi.display_order
    ) FILTER (WHERE qi.id IS NOT NULL),
    '[]'
  ) as quotation_items
FROM quotations q
LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
WHERE q.id = $1
GROUP BY q.id
```

## Business Logic

### Quotation Number Generation
- Format: `QT-YYYY-NNNN` (e.g., QT-2026-0001)
- Auto-increment per calendar year
- Sequence resets to 0001 at start of new year

### Tax Calculation
- Japanese consumption tax: 10%
- `tax_amount = subtotal * 0.1`
- `total_amount = subtotal + tax_amount`

### Validity Period
- Default: 30 days from creation
- Stored in `valid_until` field
- Can be customized per quotation

### Status Flow
- Initial status: `SENT` (submitted for admin review)
- Possible transitions: SENT → APPROVED → CONVERTED → EXPIRED
- Alternative: SENT → REJECTED

## Security Features

1. **Authentication Required**: Uses Supabase Auth to verify user session
2. **SQL Injection Protection**: Parameterized queries throughout
3. **Input Validation**: Validates all required fields before DB operations
4. **Transaction Safety**: Rollback quotation creation if items insertion fails
5. **Error Handling**: Detailed error messages without exposing sensitive data

## API Contract

### Request Example
```bash
POST /api/quotations/submit
Content-Type: application/json
Authorization: Bearer <supabase_jwt_token>

{
  "items": [
    {
      "product_name": "スタンドアップパウチ",
      "quantity": 1000,
      "unit_price": 150,
      "total_price": 150000,
      "product_code": "SUP-001",
      "category": "stand_up",
      "specifications": {
        "size": "200x300mm",
        "material": "PET/AL/PE"
      }
    }
  ],
  "notes": "急ぎのお見積もりです",
  "urgency": "urgent"
}
```

### Response Example (Success)
```json
{
  "success": true,
  "quotation": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "quotation_number": "QT-2026-0001",
    "status": "SENT",
    "customer_name": "山田 太郎",
    "customer_email": "yamada@example.com",
    "subtotal_amount": 150000,
    "tax_amount": 15000,
    "total_amount": 165000,
    "valid_until": "2026-02-03T10:00:00Z",
    "items": [...]
  },
  "message": "見積を提出しました。管理者が確認次第、ご連絡いたします。"
}
```

### Response Example (Error)
```json
{
  "error": "最少でも1つの商品が必要です。"
}
```

## Testing Recommendations

### Unit Tests
- Test quotation number generation logic
- Test tax calculation accuracy
- Test input validation for each field
- Test rollback on items insertion failure

### Integration Tests
- Test complete submission flow with authentication
- Test database constraints (foreign keys, unique quotation numbers)
- Test concurrent quotation submissions
- Test invalid user authentication

### E2E Tests
- Test from frontend form submission to database record
- Test PDF generation using submitted quotation
- Test admin approval workflow

## Performance Considerations

1. **Database Indexes**: Ensure indexes exist on:
   - `quotations(quotation_number)`
   - `quotations(user_id, created_at)`
   - `quotation_items(quotation_id)`

2. **Query Optimization**:
   - Use `RETURNING` clause to avoid extra queries
   - Bulk insert items instead of loop inserts
   - JSON aggregation for related data

3. **Connection Pooling**: Supabase handles automatically

## Future Enhancements

1. **Notification System**: Send email to admin on quotation submission
2. **PDF Generation**: Auto-generate PDF quotation on submission
3. **Draft System**: Save quotations as DRAFT before submission
4. **Versioning**: Track quotation revisions
5. **Approval Workflow**: Multi-step approval process

## Related Files

- `src/lib/supabase-sql.ts` - SQL execution library
- `src/app/api/quotations/submit/route.ts` - Main API route
- `src/lib/quotation-api.ts` - Client-side API wrapper
- `src/types/database.ts` - TypeScript type definitions

## Task Status
- Status: **DONE**
- Task ID: 102
- Completed: 2026-01-04
