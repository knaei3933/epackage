<!-- Parent: ../../AGENTS.md -->

# src/app/api/quotations/ - Quotation API Routes

**Purpose:** REST API endpoints for quotation creation and management.

## Directory Structure

```
api/quotations/
├── save/
│   └── route.ts                 # POST: Create new quotation (authenticated)
├── guest-save/
│   └── route.ts                 # POST: Create guest quotation (unauthenticated)
└── [id]/
    └── route.ts                 # GET/DELETE: Quotation operations (if exists)
```

## Key Files

### Save Route (`save/route.ts`)
- **POST /api/quotations/save** - Create authenticated quotation
- Requires authentication (user must be logged in)
- Creates records in both `quotations` and `quotation_items` tables
- Transaction-style error handling (rollback on failure)

**Request Body:**
```typescript
{
  quotationNumber?: string;      // Auto-generated if not provided
  totalAmount?: number;
  grandTotal?: number;
  pricing?: { totalPrice: number };
  items?: QuotationItemData[];   // Array from ResultStep
  specifications?: Record<string, unknown>;
  postProcessing?: string[];
  skuData?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  success: true;
  message: '見積を作成しました。';
  quotation: {
    id: string;
    quotation_number: string;
    items: QuotationItemData[];
  };
}
```

### Guest Save Route (`guest-save/route.ts`)
- **POST /api/quotations/guest-save** - Create guest quotation
- No authentication required
- Stores customer email for follow-up
- Creates quotation without user_id

## For AI Agents

### Quotation API Patterns

When working with quotation APIs:

1. **Authentication Required**:
   - `save/route.ts` requires authenticated user
   - Check `user` from `supabase.auth.getUser()`
   - Verify user status is ACTIVE

2. **Quotation Number Generation**:
   ```typescript
   const quotationNumber = `QT${YYYY}${MM}${DD}${timestamp}`;
   ```

3. **Transaction Pattern** (Supabase doesn't support transactions):
   ```typescript
   // Insert quotation
   const { data: quotation } = await supabase
     .from('quotations').insert(...).select().single();

   // Insert items
   const { data: items } = await supabase
     .from('quotation_items').insert(itemsToInsert);

   // Rollback on error
   if (itemsError) {
     await supabase.from('quotations').delete().eq('id', quotation.id);
   }
   ```

4. **Default Addresses**:
   - Fetch user's default delivery_address
   - Fetch user's default billing_address
   - Attach to quotation if available

5. **Error Handling**:
   - 401: Not authenticated
   - 403: Account not active
   - 404: Profile not found
   - 500: Database/transaction error

### Common Tasks

- **Add new field**: Add to request body interface and insert object
- **Modify validation**: Add Zod schema validation
- **Change quotation number format**: Update generation logic
- **Add email notification**: Trigger email after successful creation

### Database Tables Used

- `quotations` - Main quotation record
- `quotation_items` - Line items (one-to-many)
- `profiles` - User verification
- `delivery_addresses` - Default delivery address
- `billing_addresses` - Default billing address

### Dependencies

- `@supabase/supabase-js@^2.89.0` - Database client
- `next@^16.1.4` - Next.js App Router

### Related Files

- `src/lib/supabase-ssr.ts` - Server-side Supabase client
- `src/types/database.ts` - Database type definitions
- `src/lib/email.ts` - Email notification system
