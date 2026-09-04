-- =====================================================
-- Migration: Phase 6.5 - Add Missing Foreign Key Constraints
-- Purpose: Add foreign key constraints with proper cascade rules
-- Created: 2025-02-07
-- =====================================================
-- This migration adds missing foreign key constraints to ensure
-- referential integrity across the database.
--
-- Target Relationships:
-- - quotations → profiles (users)
-- - orders → quotations
-- - orders → profiles (users)
-- - contracts → orders
-- - contracts → profiles (users)
--
-- =====================================================

-- =====================================================
-- Step 1: quotations → profiles FK
-- =====================================================

DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'quotations'
      AND constraint_name LIKE '%user%profiles%'
  ) THEN
    ALTER TABLE quotations
      ADD CONSTRAINT fk_quotations_user_profile
      FOREIGN KEY (user_id) REFERENCES profiles(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;

    RAISE NOTICE 'Added FK: quotations.user_id → profiles.id';
  ELSE
    RAISE NOTICE 'FK already exists: quotations.user_id → profiles.id';
  END IF;
END $$;

-- =====================================================
-- Step 2: orders → quotations FK
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'orders'
      AND constraint_name LIKE '%quotation%'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT fk_orders_quotation
      FOREIGN KEY (quotation_id) REFERENCES quotations(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;

    RAISE NOTICE 'Added FK: orders.quotation_id → quotations.id';
  ELSE
    RAISE NOTICE 'FK already exists: orders.quotation_id → quotations.id';
  END IF;
END $$;

-- =====================================================
-- Step 3: orders → profiles FK
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'orders'
      AND constraint_name LIKE '%user%profiles%'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT fk_orders_user_profile
      FOREIGN KEY (user_id) REFERENCES profiles(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;

    RAISE NOTICE 'Added FK: orders.user_id → profiles.id';
  ELSE
    RAISE NOTICE 'FK already exists: orders.user_id → profiles.id';
  END IF;
END $$;

-- =====================================================
-- Step 4: contracts → orders FK
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_tables WHERE table_name = 'contracts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'contracts'
        AND constraint_name LIKE '%order%'
    ) THEN
      ALTER TABLE contracts
        ADD CONSTRAINT fk_contracts_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE;

      RAISE NOTICE 'Added FK: contracts.order_id → orders.id';
    ELSE
      RAISE NOTICE 'FK already exists: contracts.order_id → orders.id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- Step 5: contracts → profiles FK
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_tables WHERE table_name = 'contracts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'contracts'
        AND constraint_name LIKE '%user%profiles%'
    ) THEN
      ALTER TABLE contracts
        ADD CONSTRAINT fk_contracts_user_profile
        FOREIGN KEY (user_id) REFERENCES profiles(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;

      RAISE NOTICE 'Added FK: contracts.user_id → profiles.id';
    ELSE
      RAISE NOTICE 'FK already exists: contracts.user_id → profiles.id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- Step 6: quotation_items → quotations FK
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'quotation_items'
      AND constraint_name LIKE '%quotation%'
  ) THEN
    ALTER TABLE quotation_items
      ADD CONSTRAINT fk_quotation_items_quotation
      FOREIGN KEY (quotation_id) REFERENCES quotations(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;

    RAISE NOTICE 'Added FK: quotation_items.quotation_id → quotations.id';
  ELSE
    RAISE NOTICE 'FK already exists: quotation_items.quotation_id → quotations.id';
  END IF;
END $$;

-- =====================================================
-- Step 7: order_items → orders FK
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'order_items'
      AND constraint_name LIKE '%order%'
  ) THEN
    ALTER TABLE order_items
      ADD CONSTRAINT fk_order_items_order
      FOREIGN KEY (order_id) REFERENCES orders(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE;

    RAISE NOTICE 'Added FK: order_items.order_id → orders.id';
  ELSE
    RAISE NOTICE 'FK already exists: order_items.order_id → orders.id';
  END IF;
END $$;

-- =====================================================
-- Step 8: Verification
-- =====================================================

DO $$
DECLARE
  v_fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY';

  RAISE NOTICE 'Foreign Key Constraints Added';
  RAISE NOTICE 'Total foreign key constraints in database: %', v_fk_count;
END $$;

-- Show all foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 6.5 Migration: Foreign key constraints added';
  RAISE NOTICE 'Cascade rules: ON DELETE CASCADE, ON UPDATE CASCADE';
  RAISE NOTICE 'Excepts: orders.quotation_id, contracts.order_id (SET NULL)';
END $$;
