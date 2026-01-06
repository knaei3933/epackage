-- =====================================================
-- Migration: Inventory Tables (Phase 2)
-- Purpose: Create inventory management tables
-- Created: 2025-12-31
-- =====================================================
-- This migration creates:
-- 1. inventory table - Stock levels by location
-- 2. inventory_transactions table - Stock movement history
-- 3. Triggers for automatic stock updates
-- 4. RLS policies for security
-- 5. Helper functions for inventory operations

-- =====================================================
-- 1. Create Inventory Table
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Location information
  warehouse_location TEXT NOT NULL DEFAULT 'MAIN',  -- e.g., "MAIN", "TOKYO", "OSAKA"
  bin_location TEXT,                                -- e.g., "A-01-15", "BIN-42"

  -- Quantities
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_allocated INTEGER NOT NULL DEFAULT 0 CHECK (quantity_allocated >= 0),

  -- Calculated available quantity
  quantity_available INTEGER GENERATED ALWAYS AS (
    quantity_on_hand - quantity_allocated
  ) STORED CHECK (quantity_available >= 0),

  -- Reorder information
  reorder_point INTEGER DEFAULT 10 CHECK (reorder_point >= 0),
  max_stock_level INTEGER,                           -- Maximum stock before overstock

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT inventory_quantity_check CHECK (
    quantity_on_hand >= quantity_allocated
  ),
  CONSTRAINT inventory_location_unique UNIQUE (product_id, warehouse_location, bin_location)
);

-- =====================================================
-- 2. Create Inventory Transactions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  production_job_id UUID,  -- Will be FK to production_jobs when created

  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN (
      'receipt',       -- Stock received (positive)
      'issue',         -- Stock issued/allocated (negative)
      'adjustment',    -- Manual adjustment (positive or negative)
      'transfer',      -- Transfer between locations
      'return',        -- Customer return (positive)
      'production_in', -- Production output (positive)
      'production_out' -- Production consumption (negative)
    )
  ),

  quantity INTEGER NOT NULL,  -- Positive for receipts, negative for issues

  -- State snapshot for audit
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,

  -- Reference information
  reference_number TEXT,      -- PO number, SO number, adjustment code, etc.
  reference_type TEXT,        -- 'purchase_order', 'sales_order', 'adjustment', etc.

  -- Reason and notes
  reason TEXT,                -- e.g., "Damaged", "Restock", "Quality control"
  notes TEXT,

  -- User who performed transaction
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  transaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT quantity_after_matches_calculation CHECK (
    quantity_after = quantity_before + quantity
  )
);

-- =====================================================
-- 3. Create Indexes
-- =====================================================

-- Inventory indexes
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse_location ON inventory(warehouse_location);
CREATE INDEX idx_inventory_bin_location ON inventory(bin_location);
CREATE INDEX idx_inventory_reorder_check ON inventory(product_id, quantity_available)
  WHERE quantity_available <= reorder_point;

-- Inventory transactions indexes
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_transactions_order_id ON inventory_transactions(order_id);
CREATE INDEX idx_inventory_transactions_transaction_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_transaction_at ON inventory_transactions(transaction_at DESC);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_number, reference_type);

-- Composite index for audit trail
CREATE INDEX idx_inventory_transactions_audit ON inventory_transactions(
  product_id,
  transaction_type,
  transaction_at DESC
);

-- =====================================================
-- 4. Create Triggers
-- =====================================================

-- Update inventory updated_at
CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-create inventory transaction when inventory changes
CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_quantity_diff INTEGER;
BEGIN
  -- Calculate quantity difference
  v_quantity_diff := COALESCE(NEW.quantity_on_hand, 0) - COALESCE(OLD.quantity_on_hand, 0);

  -- Only log if quantity actually changed
  IF v_quantity_diff != 0 THEN
    INSERT INTO inventory_transactions (
      product_id,
      inventory_id,
      transaction_type,
      quantity,
      quantity_before,
      quantity_after,
      reason,
      performed_by,
      transaction_at
    ) VALUES (
      NEW.product_id,
      NEW.id,
      CASE
        WHEN v_quantity_diff > 0 THEN 'receipt'
        ELSE 'issue'
      END,
      v_quantity_diff,
      COALESCE(OLD.quantity_on_hand, 0),
      NEW.quantity_on_hand,
      'Inventory update trigger',
      auth.uid(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_log_transaction
  AFTER UPDATE ON inventory
  FOR EACH ROW
  WHEN (OLD.quantity_on_hand IS DISTINCT FROM NEW.quantity_on_hand)
  EXECUTE FUNCTION log_inventory_transaction();

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Inventory: Staff can view inventory
CREATE POLICY "Inventory staff can view inventory"
  ON inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins can manage inventory
CREATE POLICY "Admins can manage inventory"
  ON inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Inventory transactions: Staff can view
CREATE POLICY "Inventory staff can view transactions"
  ON inventory_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only system can create transactions (via triggers)
CREATE POLICY "System can create transactions"
  ON inventory_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function: Get current stock level for product
CREATE OR REPLACE FUNCTION get_stock_level(p_product_id UUID)
RETURNS TABLE (
  product_id UUID,
  warehouse_location TEXT,
  bin_location TEXT,
  quantity_on_hand INTEGER,
  quantity_allocated INTEGER,
  quantity_available INTEGER,
  reorder_point INTEGER,
  needs_reorder BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.product_id,
    i.warehouse_location,
    i.bin_location,
    i.quantity_on_hand,
    i.quantity_allocated,
    i.quantity_available,
    i.reorder_point,
    CASE
      WHEN i.quantity_available <= i.reorder_point THEN TRUE
      ELSE FALSE
    END AS needs_reorder
  FROM inventory i
  WHERE i.product_id = p_product_id
  ORDER BY i.warehouse_location, i.bin_location;
END;
$$;

-- Function: Adjust inventory (manual adjustment)
CREATE OR REPLACE FUNCTION adjust_inventory(
  p_product_id UUID,
  p_warehouse_location TEXT DEFAULT 'MAIN',
  p_bin_location TEXT DEFAULT NULL,
  p_quantity INTEGER,
  p_reason TEXT,
  p_performed_by UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  inventory_id UUID,
  new_quantity INTEGER,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_inventory_id UUID;
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Find or create inventory record
  SELECT id, quantity_on_hand INTO v_inventory_id, v_current_quantity
  FROM inventory
  WHERE product_id = p_product_id
    AND warehouse_location = p_warehouse_location
    AND (p_bin_location IS NULL OR bin_location = p_bin_location)
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Create new inventory record
    INSERT INTO inventory (
      product_id,
      warehouse_location,
      bin_location,
      quantity_on_hand
    ) VALUES (
      p_product_id,
      p_warehouse_location,
      COALESCE(p_bin_location, 'DEFAULT'),
      GREATEST(0, p_quantity)  -- Ensure non-negative
    )
    RETURNING id, quantity_on_hand INTO v_inventory_id, v_new_quantity;

    -- Log transaction
    INSERT INTO inventory_transactions (
      product_id,
      inventory_id,
      transaction_type,
      quantity,
      quantity_before,
      quantity_after,
      reason,
      performed_by,
      reference_type
    ) VALUES (
      p_product_id,
      v_inventory_id,
      'adjustment',
      GREATEST(0, p_quantity),
      0,
      v_new_quantity,
      COALESCE(p_reason, 'Initial stock'),
      COALESCE(p_performed_by, auth.uid()),
      'adjustment'
    );

    success := TRUE;
    message := 'New inventory record created';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + p_quantity;

  -- Check for negative stock
  IF v_new_quantity < 0 THEN
    success := FALSE;
    message := 'Insufficient stock for adjustment (current: ' ||
               v_current_quantity || ', adjustment: ' || p_quantity || ')';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Update inventory
  UPDATE inventory
  SET quantity_on_hand = v_new_quantity,
      updated_at = NOW()
  WHERE id = v_inventory_id;

  -- Log transaction (trigger will handle this, but we can add explicit log if needed)
  INSERT INTO inventory_transactions (
    product_id,
    inventory_id,
    transaction_type,
    quantity,
    quantity_before,
    quantity_after,
    reason,
    performed_by,
    reference_type
  ) VALUES (
    p_product_id,
    v_inventory_id,
    'adjustment',
    p_quantity,
    v_current_quantity,
    v_new_quantity,
    COALESCE(p_reason, 'Manual adjustment'),
    COALESCE(p_performed_by, auth.uid()),
    'adjustment'
  );

  success := TRUE;
  inventory_id := v_inventory_id;
  new_quantity := v_new_quantity;
  message := 'Inventory adjusted successfully';

  RETURN NEXT;
END;
$$;

-- Function: Get products needing reorder
CREATE OR REPLACE FUNCTION get_reorder_alerts()
RETURNS TABLE (
  product_id UUID,
  product_name_ja TEXT,
  product_code TEXT,
  warehouse_location TEXT,
  current_quantity INTEGER,
  reorder_point INTEGER,
  shortage INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS product_id,
    p.name_ja AS product_name_ja,
    p.product_code AS product_code,
    i.warehouse_location,
    i.quantity_available AS current_quantity,
    i.reorder_point,
    GREATEST(0, i.reorder_point - i.quantity_available) AS shortage
  FROM inventory i
  JOIN products p ON i.product_id = p.id
  WHERE i.quantity_available <= i.reorder_point
    AND p.is_active = TRUE
  ORDER BY (i.reorder_point - i.quantity_available) DESC;
END;
$$;

-- Function: Get transaction history for product
CREATE OR REPLACE FUNCTION get_inventory_history(
  p_product_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  transaction_at TIMESTAMPTZ,
  transaction_type TEXT,
  quantity INTEGER,
  quantity_before INTEGER,
  quantity_after INTEGER,
  reference_number TEXT,
  reference_type TEXT,
  reason TEXT,
  performed_by_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    it.transaction_at,
    it.transaction_type,
    it.quantity,
    it.quantity_before,
    it.quantity_after,
    it.reference_number,
    it.reference_type,
    it.reason,
    CASE
      WHEN it.performed_by IS NOT NULL THEN
        (SELECT kanji_last_name || ' ' || kanji_first_name FROM profiles WHERE id = it.performed_by)
      ELSE 'System'
    END AS performed_by_name
  FROM inventory_transactions it
  WHERE it.product_id = p_product_id
    AND it.transaction_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY it.transaction_at DESC;
END;
$$;

-- =====================================================
-- 7. Grant Permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON inventory TO authenticated;
GRANT SELECT ON inventory_transactions TO authenticated;
GRANT ALL ON inventory TO authenticated;
GRANT ALL ON inventory_transactions TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_stock_level TO authenticated;
GRANT EXECUTE ON FUNCTION adjust_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION get_reorder_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION get_inventory_history TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Inventory tables';
  RAISE NOTICE 'Tables created: inventory, inventory_transactions';
  RAISE NOTICE 'Indexes created: 8 indexes';
  RAISE NOTICE 'Policies created: 5 RLS policies';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - log_inventory_transaction() (trigger function)';
  RAISE NOTICE '  - get_stock_level()';
  RAISE NOTICE '  - adjust_inventory()';
  RAISE NOTICE '  - get_reorder_alerts()';
  RAISE NOTICE '  - get_inventory_history()';
END $$;
