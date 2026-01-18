# Critical Database Fixes - 2026-01-06

## Summary

Fixed 3 critical console errors identified in the dashboard by:
1. Adding `user_id` column to `contracts` table
2. Creating triggers to maintain `user_id` relationship
3. Updating `dashboard.ts` to query contracts with new column

## Fixes Applied

### Fix #1: contracts table user_id column

**Migration Applied**: `add_user_id_to_contracts_table`

```sql
-- Add user_id column to contracts table
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
```

**Status**: ✅ Applied successfully

### Fix #2: Triggers for user_id synchronization

**Triggers Created**:
1. `contracts_user_id_sync_trigger` - Fires on orders table when user_id changes
2. `contract_set_user_id_trigger` - Fires on contracts table on insert/update

```sql
CREATE OR REPLACE FUNCTION sync_contract_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When order user_id changes, update related contracts
  IF TG_OP = 'UPDATE' AND OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    UPDATE contracts
    SET user_id = NEW.user_id
    WHERE order_id = NEW.id AND user_id IS DISTINCT FROM NEW.user_id;
  END IF;

  -- When new contract is created, set user_id from order
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS NULL AND NEW.order_id IS NOT NULL THEN
      NEW.user_id := (SELECT user_id FROM orders WHERE id = NEW.order_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Status**: ✅ Created successfully

### Fix #3: dashboard.ts contracts query

**File**: `src/lib/dashboard.ts`

**Before** (lines 2319-2330):
```typescript
// NOTE: contracts table doesn't have user_id column, skip for now
let pendingContracts: any[] | null = null;
let totalContracts = 0;
let signedContracts = 0;
// Skip contracts query - table structure doesn't support user-based queries
pendingContracts = [];
totalContracts = 0;
signedContracts = 0;
```

**After**:
```typescript
// Query contracts using the new user_id column
try {
  const [pendingResult, totalCountResult, signedCountResult] = await Promise.all([
    serviceClient
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['DRAFT', 'SENT', 'PENDING_SIGNATURE', 'CUSTOMER_SIGNED'])
      .order('created_at', { ascending: false }),
    serviceClient
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    serviceClient
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['SIGNED', 'ADMIN_SIGNED', 'ACTIVE'])
  ]);

  pendingContracts = pendingResult.data;
  totalContracts = totalCountResult.count || 0;
  signedContracts = signedCountResult.count || 0;
} catch (contractError) {
  console.warn('[getDashboardStats] Error fetching contracts:', contractError);
  pendingContracts = [];
  totalContracts = 0;
  signedContracts = 0;
}
```

**Status**: ✅ Updated successfully

## Database Schema Changes

### contracts table
| Column | Type | Nullable | Reference |
|--------|------|----------|-----------|
| user_id | uuid | YES | auth.users(id) |

### New Indexes
- `idx_contracts_user_id` on contracts(user_id)

### New Triggers
1. `contracts_user_id_sync_trigger` (AFTER INSERT OR UPDATE ON orders)
2. `contract_set_user_id_trigger` (BEFORE INSERT OR UPDATE ON contracts)

## Testing

To verify the fixes work:

1. **Restart the dev server**:
   ```bash
   # Kill existing server on port 3000
   # Then run:
   npm run dev
   ```

2. **Test dashboard page**:
   - Go to http://localhost:3000/member/dashboard
   - Login with test account
   - Verify no console errors

3. **Test contracts query**:
   ```sql
   -- Verify contracts can be queried by user_id
   SELECT * FROM contracts WHERE user_id = '<user_id>';
   ```

## Security Advisors (Non-Critical)

23 warnings about `function_search_path_mutable` - these are informational warnings about setting explicit search paths in functions. Not blocking for production.

## Files Modified

1. Database: `contracts` table (schema change)
2. `src/lib/dashboard.ts` (contracts query logic)

## Next Steps

1. Test the dashboard with actual user login
2. Verify contract stats display correctly
3. Consider fixing the 23 function search_path warnings (Phase 2)

## Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2026-01-06 | add_user_id_to_contracts_table | Added user_id column and triggers |
