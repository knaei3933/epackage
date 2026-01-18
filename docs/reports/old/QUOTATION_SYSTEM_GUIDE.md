# Quotation System API Documentation

Complete guide for the Epackage Lab quotation system with database integration.

## Overview

The quotation system provides a complete workflow from creating quotations to converting them into orders. All operations are integrated with Supabase database and provide type-safe interfaces.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Database Schema](#database-schema)
3. [Utility Library](#utility-library)
4. [Frontend Integration](#frontend-integration)
5. [Workflow States](#workflow-states)
6. [Error Handling](#error-handling)

## API Endpoints

### 1. Create/Save Quotation

**Endpoint:** `POST /api/quotations/save`

**Description:** Creates a new quotation or saves an existing one as draft.

**Request Body:**
```typescript
{
  userId: string;                    // User ID from auth
  quotationNumber: string;           // Format: QT-YYYY-NNNN
  status?: 'draft' | 'sent' | ...;   // Default: 'draft'
  totalAmount: number;               // Total price including tax
  validUntil?: string;               // ISO date string (optional)
  notes?: string | null;             // Customer notes
  items?: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    specifications?: Record<string, unknown>;
  }>;
}
```

**Response:**
```typescript
{
  success: true;
  quotation: {
    id: string;
    quotation_number: string;
    status: 'draft';
    user_id: string;
    // ... other quotation fields
  };
  message: string;
}
```

**Example Usage:**
```typescript
const response = await fetch('/api/quotations/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    quotationNumber: 'QT-2026-0001',
    status: 'draft',
    totalAmount: 150000,
    validUntil: '2026-02-03',
    notes: 'Custom specifications required',
    items: [{
      productName: 'Stand-up Pouch - PET/AL',
      quantity: 1000,
      unitPrice: 150,
      specifications: {
        width: 200,
        height: 300,
        depth: 80,
        material: 'pet_al'
      }
    }]
  })
});
```

### 2. Submit Quotation

**Endpoint:** `POST /api/quotations/submit`

**Description:** Submits a draft quotation for admin review. Changes status from 'draft' to 'sent'.

**Request Body:**
```typescript
{
  quotationId: string;
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}
```

**Response:**
```typescript
{
  success: true;
  quotation: {
    id: string;
    status: 'sent';
    sent_at: string;
    // ... updated quotation fields
  };
  message: '見積を提出しました。管理者が確認次第、ご連絡いたします。'
}
```

**Validation Rules:**
- Quotation must exist
- Current status must be 'draft'
- Automatically sets `sent_at` timestamp
- Updates customer info if provided

### 3. Get Quotation by ID

**Endpoint:** `GET /api/quotations/[id]`

**Description:** Fetches a single quotation with all items.

**Response:**
```typescript
{
  success: true;
  quotation: {
    id: string;
    quotation_number: string;
    status: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    valid_until: string;
    items: Array<{
      id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      specifications: Record<string, unknown>;
    }>;
    // ... other fields
  };
}
```

### 4. Update Quotation

**Endpoint:** `PATCH /api/quotations/[id]`

**Description:** Updates quotation details. Status transitions are validated.

**Request Body:**
```typescript
{
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  validUntil?: string;
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted';
}
```

**Valid Status Transitions:**
```
draft → sent, rejected
sent → approved, rejected, expired
approved → converted
rejected → (no transitions allowed)
expired → (no transitions allowed)
converted → (no transitions allowed)
```

**Example Usage:**
```typescript
const response = await fetch(`/api/quotations/${quotationId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerInfo: {
      name: 'Yamada Taro',
      email: 'yamada@example.com'
    },
    status: 'sent'
  })
});
```

### 5. Convert Quotation to Order

**Endpoint:** `POST /api/quotations/[id]/convert`

**Description:** Converts an approved quotation into an order. Creates order and order_items records, updates quotation status to 'converted'.

**Request Body:**
```typescript
{
  notes?: string;              // Optional order notes
  paymentTerm?: 'credit' | 'advance';  // Payment term
}
```

**Response:**
```typescript
{
  success: true;
  order: {
    id: string;
    order_number: string;      // Format: ORD-YYYY-NNNN
    status: 'QUOTATION';
    quotation_id: string;
    total_amount: number;
    items: Array<{
      id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    // ... other order fields
  };
  quotation: {
    id: string;
    status: 'converted';
  };
  message: '注文を作成しました。'
}
```

**Validation Rules:**
- Quotation must exist
- Status must be 'approved'
- Quotation must not be expired
- Order must not already exist for this quotation
- All quotation items are copied to order_items

**Example Usage:**
```typescript
const response = await fetch(`/api/quotations/${quotationId}/convert`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentTerm: 'credit',
    notes: 'Please deliver by end of month'
  })
});
```

### 6. Check Conversion Eligibility

**Endpoint:** `GET /api/quotations/[id]/convert`

**Description:** Checks if a quotation can be converted to an order without actually converting it.

**Response:**
```typescript
{
  success: true;
  data: {
    quotation: {
      id: string;
      quotation_number: string;
      status: string;
      total_amount: number;
      valid_until: string;
    };
    conversionStatus: {
      canConvert: boolean;
      isExpired: boolean;
      hasOrder: boolean;
      existingOrder?: {
        id: string;
        order_number: string;
      };
      reason?: string;  // Explanation if cannot convert
    };
  };
}
```

### 7. List Quotations

**Endpoint:** `GET /api/quotations/list`

**Description:** Retrieves all quotations for the current user. Supports status filtering.

**Query Parameters:**
- `status`: Optional filter by status ('draft', 'sent', 'approved', etc.)

**Response:**
```typescript
{
  success: true;
  quotations: Array<{
    id: string;
    quotation_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    items: Array<QuotationItem>;
    // ... other fields
  }>;
}
```

**Example Usage:**
```typescript
// Get all quotations
const response = await fetch('/api/quotations/list');

// Get only draft quotations
const draftResponse = await fetch('/api/quotations/list?status=draft');

// Get only approved quotations
const approvedResponse = await fetch('/api/quotations/list?status=approved');
```

## Database Schema

### quotations Table

```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id),
  quotation_number TEXT UNIQUE NOT NULL,  -- QT-YYYY-NNNN
  status TEXT NOT NULL DEFAULT 'draft',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subtotal_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  valid_until DATE,
  notes TEXT,
  pdf_url TEXT,
  admin_notes TEXT,
  sales_rep TEXT,
  estimated_delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  subtotal DECIMAL(10,2)  -- Alias for subtotal_amount
);

-- Indexes
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
```

### quotation_items Table

```sql
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  specifications JSONB,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product_id ON quotation_items(product_id);
```

### orders Table (Related)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id),
  quotation_id UUID REFERENCES quotations(id),
  order_number TEXT UNIQUE NOT NULL,  -- ORD-YYYY-NNNN
  status TEXT NOT NULL DEFAULT 'QUOTATION',
  current_state TEXT,
  state_metadata JSONB,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  notes TEXT,
  payment_term TEXT CHECK (payment_term IN ('credit', 'advance')),
  shipping_address JSONB,
  billing_address JSONB,
  requested_delivery_date DATE,
  delivery_notes TEXT,
  estimated_delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);
```

## Utility Library

Location: `src/lib/quotation-api.ts`

The utility library provides type-safe helper functions for all quotation operations.

### Import

```typescript
import {
  createQuotation,
  getQuotation,
  updateQuotation,
  submitQuotation,
  convertQuotationToOrder,
  checkConversionEligibility,
  getQuotations,
  generateQuotationNumber,
  formatCurrency,
  formatDate,
  getQuotationStatusLabel,
  canSubmitQuotation,
  canConvertToOrder
} from '@/lib/quotation-api';
```

### Helper Functions

#### generateQuotationNumber()

Generates a unique quotation number in the format `QT-YYYY-NNNN`.

```typescript
const quotationNumber = generateQuotationNumber();
// Returns: "QT-2026-0427"
```

#### formatCurrency(amount)

Formats a number as Japanese Yen currency.

```typescript
const formatted = formatCurrency(150000);
// Returns: "¥150,000"
```

#### formatDate(dateString)

Formats an ISO date string for display.

```typescript
const formatted = formatDate('2026-01-15T10:30:00Z');
// Returns: "2026/01/15"
```

#### getQuotationStatusLabel(status)

Returns the Japanese label for a quotation status.

```typescript
const label = getQuotationStatusLabel('draft');
// Returns: "下書き"

const label = getQuotationStatusLabel('approved');
// Returns: "承認済み"
```

#### canSubmitQuotation(quotation)

Checks if a quotation can be submitted.

```typescript
if (canSubmitQuotation(quotation)) {
  // Enable submit button
}
```

#### canConvertToOrder(quotation)

Checks if a quotation can be converted to an order.

```typescript
if (canConvertToOrder(quotation)) {
  // Enable convert button
  await convertQuotationToOrder(quotation.id);
}
```

## Frontend Integration

### Example: ImprovedQuotingWizard Integration

The `ImprovedQuotingWizard` component has been updated with full DB integration:

```typescript
function ResultStep({ result, onReset }: { result: UnifiedQuoteResult; onReset: () => void }) {
  const { user } = useAuth();
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Save as draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const quotationData = {
        userId: user.id,
        quotationNumber: `QT-${Date.now()}`,
        status: 'draft' as const,
        totalAmount: result.totalPrice,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [/* ... */]
      };

      const response = await fetch('/api/quotations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
      });

      const savedQuotation = await response.json();
      setSavedQuotationId(savedQuotation.quotation?.id);
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit for admin review
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save first if not already saved
      let quotationId = savedQuotationId;
      if (!quotationId) {
        await handleSave();
        quotationId = savedQuotationId;
      }

      // Submit the quotation
      const response = await fetch('/api/quotations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId,
          customerInfo: {
            name: user.user_metadata?.full_name,
            email: user.email,
          }
        }),
      });

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Quote result display */}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? '保存中...' : '下書き保存'}
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '提出中...' : '見積を提出'}
        </button>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div>見積を下書きとして保存しました。</div>
      )}
      {submitStatus === 'success' && (
        <div>見積を提出しました。管理者が確認次第、ご連絡いたします。</div>
      )}
    </div>
  );
}
```

## Workflow States

### Quotation Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                        QUOTATION WORKFLOW                    │
└──────────────────────────────────────────────────────────────┘

    User Actions:
    ┌────────┐
    │ Create │
    └───┬────┘
        │
        ▼
    ┌────────┐  Save     ┌──────────┐
    │  Draft │──────────>│  Saved   │
    └────────┘            └──────────┘
        │
        │ Submit
        ▼
    ┌────────┐  Approve  ┌───────────┐
    │  Sent  │──────────>│ Approved  │
    └────────┘            └─────┬─────┘
                             │
                             │ Convert
                             ▼
                        ┌─────────┐
                        │ Converted│
                        └─────────┘

    Admin Actions:
    - Review sent quotations
    - Approve or reject
    - Add admin notes
    - Set pricing adjustments

    Automatic Transitions:
    - Draft → Sent (user submits)
    - Sent → Expired (after valid_until date)
    - Approved → Converted (user creates order)
```

### State Descriptions

| Status | Japanese | Description | Can Convert? |
|--------|----------|-------------|--------------|
| `draft` | 下書き | Initial state, editable | No |
| `sent` | 送信済み | Submitted for review, pending approval | No |
| `approved` | 承認済み | Approved by admin, ready to convert | Yes |
| `rejected` | 却下 | Rejected by admin | No |
| `expired` | 期限切れ | Past valid_until date | No |
| `converted` | 注文変換済み | Converted to order | No |

### Order Creation Flow

When a quotation is converted to an order:

1. **Validation**
   - Quotation status is 'approved'
   - Quotation is not expired
   - No order exists for this quotation

2. **Order Creation**
   - Generate order number: `ORD-YYYY-NNNN`
   - Copy quotation data to order
   - Set status to 'QUOTATION'
   - Store quotation_id reference

3. **Items Copy**
   - Copy all quotation_items to order_items
   - Preserve specifications and pricing
   - Maintain display order

4. **Quotation Update**
   - Change status to 'converted'
   - Keep quotation for reference

## Error Handling

### Common Error Responses

All API endpoints return consistent error responses:

```typescript
{
  success: false,
  error: string,           // Human-readable error message
  details?: string,        // Additional error details
  currentStatus?: string,  // Current status for validation errors
  allowedTransitions?: string[]  // Valid transitions for status updates
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Handling Example

```typescript
const response = await fetch('/api/quotations/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(quotationData),
});

if (!response.ok) {
  const error = await response.json();

  switch (response.status) {
    case 400:
      console.error('Validation error:', error.error);
      // Show validation message to user
      break;
    case 401:
      console.error('Unauthorized - redirecting to login');
      // Redirect to login
      break;
    case 500:
      console.error('Server error:', error.details);
      // Show generic error message
      break;
    default:
      console.error('Unknown error:', error.error);
  }
  return;
}

const data = await response.json();
// Handle success
```

## Testing

### Manual Testing Checklist

- [ ] Create quotation as draft
- [ ] Submit quotation (draft → sent)
- [ ] Update quotation details
- [ ] Approve quotation (admin action)
- [ ] Convert to order (sent → approved → converted)
- [ ] List all quotations
- [ ] Filter quotations by status
- [ ] Validate status transitions
- [ ] Test expired quotation handling
- [ ] Test duplicate order prevention

### API Testing with cURL

```bash
# Create quotation
curl -X POST http://localhost:3000/api/quotations/save \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "quotationNumber": "QT-2026-0001",
    "totalAmount": 150000,
    "items": [{
      "productName": "Test Product",
      "quantity": 1000,
      "unitPrice": 150
    }]
  }'

# Submit quotation
curl -X POST http://localhost:3000/api/quotations/submit \
  -H "Content-Type: application/json" \
  -d '{
    "quotationId": "quotation-uuid",
    "customerInfo": {
      "name": "Test User",
      "email": "test@example.com"
    }
  }'

# Convert to order
curl -X POST http://localhost:3000/api/quotations/quotation-uuid/convert \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTerm": "credit"
  }'
```

## Best Practices

1. **Always handle errors**: Check response.ok and handle different status codes
2. **Use type guards**: Utilize helper functions like `canSubmitQuotation()`
3. **Store quotation IDs**: Keep track of saved quotation IDs for subsequent operations
4. **Validate on client**: Pre-validate data before sending to API
5. **Show loading states**: Use loading indicators during async operations
6. **Provide feedback**: Show success/error messages to users
7. **Optimistic updates**: Update UI immediately, rollback on error
8. **Cache quotations**: Store fetched quotations to reduce API calls

## Troubleshooting

### Common Issues

**Issue**: "Quotation not found" error
- **Cause**: Invalid quotation ID or insufficient permissions
- **Solution**: Verify quotation ID and user authentication

**Issue**: "Invalid status transition" error
- **Cause**: Attempting invalid status change
- **Solution**: Check allowed transitions, use GET to verify current status

**Issue**: "Only approved quotations can be converted" error
- **Cause**: Quotation not approved yet
- **Solution**: Wait for admin approval or update status manually (admin only)

**Issue**: Order already exists
- **Cause**: Quotation already converted
- **Solution**: Use GET /convert to check existing order

## Support

For issues or questions:
- Check database logs: `supabase logs --table quotations`
- Review API responses in browser DevTools
- Verify environment variables are set correctly
- Check Supabase RLS policies

## Related Documentation

- [Supabase Integration Guide](./SUPABASE_SETUP.md)
- [Database Schema](../current/architecture/database-schema-v2.md)
- [Type System](../../src/types/database.ts)
- [Pricing Engine](../../src/lib/unified-pricing-engine.ts)
