# Phase 6: Database Standardization Plan

## Current State Analysis

### 1. ENUM Types (30+ found)
Multiple status enums with inconsistent values:

| ENUM | Values | Issue |
|------|--------|-------|
| `order_status` | pending, approved, in_production, ready, shipped, delivered | Specific to orders |
| `quotation_status` | draft, pending, approved, rejected, converted | Overlaps with orders |
| `contract_status` | draft, pending, active, completed, cancelled | Different lifecycle |
| `user_status` | PENDING, ACTIVE, SUSPENDED, DELETED | Case inconsistency |
| `inquiry_status` | pending, in_progress, resolved, cancelled | Different naming |
| `shipment_status` | pending, in_transit, delivered, cancelled | Shipping-specific |

**Problem:** No unified workflow status across related entities.

### 2. Timestamp Columns (Inconsistent naming)
- `created_at` (35 tables)
- `createdAt` (12 tables)
- `created` (3 tables)
- `date_created` (1 table)

**Target:** Standardize to `created_at`, `updated_at`, `deleted_at`

### 3. Missing Foreign Key Constraints
Several relationships lack proper FK constraints and cascade rules.

## Standardization Plan

### Step 1: Create Unified Workflow Status Type

```sql
-- Create unified workflow status
CREATE TYPE workflow_status AS ENUM (
  'draft',           -- 初期状態
  'pending',         -- 承認待ち
  'approved',        -- 承認済み
  'rejected',        -- 拒否
  'active',          -- アクティブ
  'in_progress',     -- 進行中
  'completed',       -- 完了
  'cancelled',       -- キャンセル
  'converted',       -- 変換済み（見積→注文など）
  'ready',          -- 準備完了
  'shipped',        -- 出荷済み
  'delivered'        -- 配送完了
);
```

### Step 2: Migrate Tables to Use Unified Status

**Priority Tables:**
1. `quotations` - quotation_status → workflow_status
2. `orders` - order_status → workflow_status
3. `contracts` - contract_status → workflow_status
4. `work_orders` - work_order_status → workflow_status
5. `inquiries` - inquiry_status → workflow_status

**Migration Strategy:**
```sql
-- Example for quotations table
ALTER TABLE quotations
  ALTER COLUMN quotation_status TYPE workflow_status
  USING quotation_status::text::workflow_status;

-- Add comment
COMMENT ON COLUMN quotations.quotation_status IS 'Unified workflow status';
```

### Step 3: Standardize Timestamp Columns

**Target Pattern:**
```sql
-- Rename to snake_case
ALTER TABLE table_name
  RENAME COLUMN createdAt TO created_at,
  RENAME COLUMN updatedAt TO updated_at,
  RENAME COLUMN deletedAt TO deleted_at;
```

**Affected Tables (12+):**
- profiles (created, updated)
- companies (created_at, updated_at - check)
- quotations (check)
- orders (check)
- contracts (check)

### Step 4: Add Missing Foreign Keys

**Key Relationships:**
```sql
-- quotations → users
ALTER TABLE quotations
  ADD CONSTRAINT fk_quotations_user
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

-- orders → quotations
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_quotation
  FOREIGN KEY (quotation_id) REFERENCES quotations(id)
  ON DELETE SET NULL;
```

### Step 5: Add Update Timestamp Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
```

## Implementation Order

### Phase 6.1: Preparation (Risk: LOW)
1. Create unified workflow_status enum
2. Create migration scripts
3. Backup database

### Phase 6.2: Status Migration (Risk: MEDIUM)
1. Migrate quotations table
2. Migrate orders table
3. Migrate contracts table
4. Update application code

### Phase 6.3: Timestamp Standardization (Risk: MEDIUM)
1. Rename columns in batches
2. Update application code
3. Test all APIs

### Phase 6.4: Foreign Keys & Triggers (Risk: MEDIUM)
1. Add missing FK constraints
2. Create update triggers
3. Test cascade behavior

## Rollback Plan

Each migration will include:
1. Pre-migration backup
2. Reversible migration script
3. Verification queries

```sql
-- Rollback example
ALTER TABLE quotations
  ALTER COLUMN quotation_status TYPE quotation_status_old
  USING quotation_status::text::quotation_status_old;
```

## Risk Assessment

| Change | Risk | Mitigation |
|---------|------|------------|
| Status enum unification | MEDIUM | Extensive testing, rollback plan |
| Timestamp renaming | LOW | Application code updates |
| FK constraints | LOW | Backup first, cascade rules |
| Triggers | LOW | Simple proven pattern |

## Timeline Estimate

- Phase 6.1: 2 hours (preparation)
- Phase 6.2: 4 hours (status migration + testing)
- Phase 6.3: 3 hours (timestamps + testing)
- Phase 6.4: 2 hours (FK + triggers + testing)

**Total:** 11 hours (spread across 2-3 days for safety)
