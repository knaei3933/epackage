-- Add skip_contract column to orders table
-- 契約書プロセスをスキップするフラグを追加

-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders'
    AND column_name = 'skip_contract'
  ) THEN
    ALTER TABLE orders ADD COLUMN skip_contract BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN orders.skip_contract IS '契約書プロセスをスキップするかどうか（新しいワークフロー用）';
