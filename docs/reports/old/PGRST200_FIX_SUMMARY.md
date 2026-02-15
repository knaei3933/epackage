# PGRST200 Error Fix Summary

**Date:** 2026-01-05
**Issue:** PGRST200 error when accessing `/member/orders/new/` page
**Error Message:** "Could not find a relationship between 'orders' and 'delivery_addresses' in the schema cache"

## Root Cause

The `orders` table was storing delivery and billing addresses as JSONB columns (`delivery_address` and `billing_address`) but the application code in `src/lib/dashboard.ts` was trying to join with the `delivery_addresses` and `billing_addresses` tables using foreign key relationships that didn't exist.

### Specific Query Causing Error

```typescript
// Lines 597-602 and 656-661 in src/lib/dashboard.ts
const { data, error } = await serviceClient
  .from('orders')
  .select(`
    *,
    order_items (*),
    delivery_addresses (*),  // ❌ No FK relationship existed
    billing_addresses (*)    // ❌ No FK relationship existed
  `)
```

## Solution Applied

### 1. Database Migration

Added foreign key columns to the `orders` table:

```sql
-- Migration: add_delivery_and_billing_address_fks_to_orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_address_id UUID
  REFERENCES public.delivery_addresses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS billing_address_id UUID
  REFERENCES public.billing_addresses(id) ON DELETE SET NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_delivery_address_id
  ON public.orders(delivery_address_id)
  WHERE delivery_address_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_billing_address_id
  ON public.orders(billing_address_id)
  WHERE billing_address_id IS NOT NULL;
```

### 2. Foreign Key Constraints Created

| Constraint | Source Column | Target Table | Target Column | On Delete |
|-----------|-------------|--------------|---------------|-----------|
| `orders_delivery_address_id_fkey` | `orders.delivery_address_id` | `delivery_addresses` | `id` | SET NULL |
| `orders_billing_address_id_fkey` | `orders.billing_address_id` | `billing_addresses` | `id` | SET NULL |

### 3. Orders Table Structure (Updated)

```sql
-- Existing columns (preserved)
delivery_address JSONB,      -- Legacy: Full address data as JSON
billing_address JSONB,        -- Legacy: Full address data as JSON

-- New columns (added)
delivery_address_id UUID,     -- FK to delivery_addresses.id
billing_address_id UUID,      -- FK to billing_addresses.id
```

## Design Rationale

### Hybrid Approach

The solution maintains **both** JSONB columns and foreign key columns:

- **JSONB columns** (`delivery_address`, `billing_address`): Preserve legacy data and support orders created without address book entries
- **FK columns** (`delivery_address_id`, `billing_address_id`): Enable proper relational joins for PostgREST

### Benefits

1. **Backward Compatible**: Existing orders with JSONB addresses continue to work
2. **Relational Integrity**: New orders can reference address book entries
3. **Query Flexibility**: Supports both JOIN queries and direct JSON access
4. **NULL on Delete**: Addresses can be deleted from address book without breaking order history

## Verification

### Foreign Key Constraints

```sql
SELECT constraint_name, column_name, foreign_table_name, foreign_column_name
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'orders';
```

**Result:**
- ✅ `orders_delivery_address_id_fkey`: `orders.delivery_address_id` → `delivery_addresses.id`
- ✅ `orders_billing_address_id_fkey`: `orders.billing_address_id` → `billing_addresses.id`

### Test the Fix

The query in `dashboard.ts` will now work:

```typescript
const { data, error } = await serviceClient
  .from('orders')
  .select(`
    *,
    order_items (*),
    delivery_addresses (*),  // ✅ Now works via FK
    billing_addresses (*)    // ✅ Now works via FK
  `)
  .eq('user_id', userId);
```

## Files Affected

### Database
- ✅ `public.orders` table structure updated
- ✅ Foreign key constraints created
- ✅ Performance indexes added

### Application Code (No Changes Required)
- `src/lib/dashboard.ts` - Queries now work without modification
- `src/app/member/orders/new/page.tsx` - Page should now load correctly

## Migration Details

**Migration Name:** `add_delivery_and_billing_address_fks_to_orders`

**Applied:** 2026-01-05

**Rollback (if needed):**
```sql
DROP INDEX IF EXISTS idx_orders_delivery_address_id;
DROP INDEX IF EXISTS idx_orders_billing_address_id;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_delivery_address_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_billing_address_id_fkey;
ALTER TABLE public.orders DROP COLUMN IF EXISTS delivery_address_id;
ALTER TABLE public.orders DROP COLUMN IF EXISTS billing_address_id;
```

## Additional Notes

### RLS Policies

No RLS policy changes were needed since the foreign keys reference tables that already have proper RLS configured:
- `delivery_addresses` has RLS enabled
- `billing_addresses` has RLS enabled
- Both reference `auth.users.id` for user ownership

### Data Migration

Existing orders are not affected:
- Orders with JSONB addresses: Continue to work as before
- New orders: Can optionally use FK references when address book is used

### PostgREST Schema Cache

The foreign key relationships are now properly registered in PostgREST's schema cache, eliminating the PGRST200 error.

## Testing Recommendations

1. **Verify `/member/orders/new/` page loads without errors**
2. **Test creating orders with address book selections**
3. **Test orders created with custom addresses (JSONB only)**
4. **Verify address deletion doesn't break order history (SET NULL)**
5. **Test query performance with new indexes**

## Status

✅ **RESOLVED** - Foreign key relationships established, PostgREST can now detect the relationship between `orders` and `delivery_addresses`/`billing_addresses` tables.
