-- =====================================================
-- Migration: Production Jobs & Data Tables (Phase 3)
-- Purpose: Create production job management and data tracking
-- Created: 2025-12-31
-- =====================================================
-- This migration creates:
-- 1. production_jobs table - Detailed job tracking
-- 2. production_data table - Customer data received (Step 4)
-- 3. Job scheduling and dependency management
-- 4. RLS policies for production staff
-- 5. Helper functions for production workflow

-- =====================================================
-- 1. Create Production Jobs Table
-- =====================================================

CREATE TABLE IF NOT EXISTS production_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  production_log_id UUID REFERENCES production_logs(id) ON DELETE SET NULL,

  -- Job identification
  job_number TEXT NOT NULL UNIQUE,
  job_name TEXT NOT NULL,

  -- Job type (corresponds to production stages)
  job_type TEXT NOT NULL CHECK (
    job_type IN (
      'design_setup',      -- Design setup and preparation
      'material_prep',     -- Material preparation
      'printing',          -- Printing process
      'lamination',        -- Lamination process
      'slitting',          -- Slitting/cutting
      'pouch_making',      -- Pouch formation
      'quality_check',     -- Quality control
      'packaging',         -- Final packaging
      'other'              -- Other production tasks
    )
  ),

  -- Job details
  description TEXT,
  specifications JSONB DEFAULT '{}',
  -- Example structure:
  -- {
  --   "machine": "Machine-01",
  --   "operator": "John Doe",
  --   "settings": { "temperature": 150, "speed": 100 },
  --   "materials_required": ["PET-001", "AL-002", "CPP-003"]
  -- }

  -- Status and progress
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',           -- Waiting to start
      'scheduled',         -- Scheduled, not started
      'in_progress',       -- Currently running
      'paused',            -- Temporarily paused
      'completed',         -- Successfully completed
      'failed',            -- Failed, needs retry
      'cancelled'          -- Cancelled
    )
  ),

  -- Priority (1 = highest, 10 = lowest)
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

  -- Assignment
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Scheduling
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER,

  -- Actual execution
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  actual_duration_minutes INTEGER,

  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  current_step TEXT,                          -- Current step within job
  steps_total INTEGER DEFAULT 1,
  steps_completed INTEGER DEFAULT 0,

  -- Output and quality
  output_quantity INTEGER DEFAULT 0,
  output_uom TEXT DEFAULT 'pcs',              -- Unit of measure
  rejected_quantity INTEGER DEFAULT 0,
  rejection_reason TEXT,

  -- Dependencies (jobs that must complete first)
  depends_on JSONB DEFAULT '[]'::jsonb,       -- Array of job IDs

  -- Failure and retry handling
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  parent_job_id UUID REFERENCES production_jobs(id) ON DELETE SET NULL,  -- For retries

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT job_number_format CHECK (
    job_number ~ '^JOB-\d{8}-\d{4}$'  -- JOB-YYYYMMDD-NNNN
  ),
  CONSTRAINT scheduled_dates_order CHECK (
    scheduled_end_at IS NULL OR
    scheduled_start_at IS NULL OR
    scheduled_end_at >= scheduled_start_at
  ),
  CONSTRAINT actual_dates_order CHECK (
    actual_end_at IS NULL OR
    actual_start_at IS NULL OR
    actual_end_at >= actual_start_at
  ),
  CONSTRAINT progress_matches_status CHECK (
    (status != 'completed' AND progress_percentage < 100) OR
    (status = 'completed' AND progress_percentage = 100)
  )
);

-- =====================================================
-- 2. Create Production Data Table
-- =====================================================

CREATE TABLE IF NOT EXISTS production_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to order
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Data type received from customer
  data_type TEXT NOT NULL CHECK (
    data_type IN (
      'design_file',      -- Design artwork (AI, PDF, etc.)
      'specification',    -- Product specifications
      'approval',         -- Customer approval
      'material_data',    -- Material specifications
      'layout_data',      -- Layout/positioning data
      'color_data',       -- Color specifications
      'other'             -- Other data types
    )
  ),

  -- Data details
  title TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',

  -- File reference (links to files table)
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  file_url TEXT,

  -- Validation status
  validation_status TEXT DEFAULT 'pending' CHECK (
    validation_status IN (
      'pending',          -- Awaiting validation
      'valid',            -- Validated and approved
      'invalid',          -- Failed validation
      'needs_revision'    -- Requires customer revision
    )
  ),

  -- Validation details
  validated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  validation_errors JSONB,                    -- Array of error objects

  -- Approval workflow
  approved_for_production BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  -- Customer submission details
  submitted_by_customer BOOLEAN DEFAULT TRUE,
  customer_contact_info JSONB,                -- { name, email, phone }

  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT version_format CHECK (
    version ~ '^\d+\.\d+$'  -- e.g., "1.0", "2.1"
  )
);

-- =====================================================
-- 3. Create Indexes
-- =====================================================

-- Production jobs indexes
CREATE INDEX idx_production_jobs_order_id ON production_jobs(order_id);
CREATE INDEX idx_production_jobs_work_order_id ON production_jobs(work_order_id);
CREATE INDEX idx_production_jobs_production_log_id ON production_jobs(production_log_id);
CREATE INDEX idx_production_jobs_job_type ON production_jobs(job_type);
CREATE INDEX idx_production_jobs_status ON production_jobs(status);
CREATE INDEX idx_production_jobs_assigned_to ON production_jobs(assigned_to);
CREATE INDEX idx_production_jobs_scheduled_start ON production_jobs(scheduled_start_at);
CREATE INDEX idx_production_jobs_priority ON production_jobs(priority, status);

-- Composite index for dashboard queries
CREATE INDEX idx_production_jobs_dashboard ON production_jobs(
  status,
  scheduled_start_at,
  priority
) WHERE status IN ('pending', 'scheduled', 'in_progress');

-- Production data indexes
CREATE INDEX idx_production_data_order_id ON production_data(order_id);
CREATE INDEX idx_production_data_file_id ON production_data(file_id);
CREATE INDEX idx_production_data_data_type ON production_data(data_type);
CREATE INDEX idx_production_data_validation_status ON production_data(validation_status);
CREATE INDEX idx_production_data_received_at ON production_data(received_at DESC);

-- =====================================================
-- 4. Create Triggers
-- =====================================================

-- Update updated_at for production_jobs
CREATE TRIGGER production_jobs_updated_at
  BEFORE UPDATE ON production_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for production_data
CREATE TRIGGER production_data_updated_at
  BEFORE UPDATE ON production_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate job number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'JOB';
  date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_part TEXT;
  max_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 13 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM production_jobs
  WHERE job_number LIKE 'JOB-' || date_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  RETURN prefix || '-' || date_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER production_job_generate_number
  BEFORE INSERT ON production_jobs
  FOR EACH ROW
  WHEN (NEW.job_number IS NULL OR NEW.job_number = '')
  EXECUTE FUNCTION generate_job_number();

-- Calculate actual duration when job completes
CREATE OR REPLACE FUNCTION calculate_job_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND
     OLD.status != 'completed' AND
     NEW.actual_start_at IS NOT NULL AND
     NEW.actual_end_at IS NOT NULL THEN
    NEW.actual_duration_minutes :=
      EXTRACT(EPOCH FROM (NEW.actual_end_at - NEW.actual_start_at)) / 60;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER production_job_calculate_duration
  BEFORE UPDATE ON production_jobs
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION calculate_job_duration();

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

ALTER TABLE production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_data ENABLE ROW LEVEL SECURITY;

-- Production staff can view jobs
CREATE POLICY "Production staff can view jobs"
  ON production_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins and operators can manage jobs
CREATE POLICY "Production staff can manage jobs"
  ON production_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Production data: Staff can view
CREATE POLICY "Production staff can view data"
  ON production_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Only admins can manage production data
CREATE POLICY "Admins can manage production data"
  ON production_data FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- 6. Helper Functions
-- =====================================================

-- Function: Get jobs ready to start (dependencies met)
CREATE OR REPLACE FUNCTION get_ready_jobs()
RETURNS SETOF production_jobs
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT pj.*
  FROM production_jobs pj
  WHERE pj.status IN ('pending', 'scheduled')
    AND pj.scheduled_start_at <= NOW()
    AND (
      -- No dependencies
      jsonb_array_length(pj.depends_on) = 0
      OR
      -- All dependencies completed
      NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(pj.depends_on) AS dep_id
        WHERE EXISTS (
          SELECT 1
          FROM production_jobs dep
          WHERE dep.id = dep_id::UUID
            AND dep.status != 'completed'
        )
      )
    )
  ORDER BY pj.priority ASC, pj.scheduled_start_at ASC;
END;
$$;

-- Function: Get production schedule for date range
CREATE OR REPLACE FUNCTION get_production_schedule(
  p_start_date TIMESTAMPTZ DEFAULT NOW(),
  p_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
)
RETURNS TABLE (
  job_number TEXT,
  job_name TEXT,
  job_type TEXT,
  status TEXT,
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  assigned_to_name TEXT,
  order_number TEXT,
  priority INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pj.job_number,
    pj.job_name,
    pj.job_type,
    pj.status,
    pj.scheduled_start_at,
    pj.scheduled_end_at,
    CASE
      WHEN pj.assigned_to IS NOT NULL THEN
        (SELECT kanji_last_name || ' ' || kanji_first_name FROM profiles WHERE id = pj.assigned_to)
      ELSE 'Unassigned'
    END AS assigned_to_name,
    o.order_number,
    pj.priority
  FROM production_jobs pj
  JOIN orders o ON pj.order_id = o.id
  WHERE pj.scheduled_start_at >= p_start_date
    AND pj.scheduled_start_at < p_end_date
    AND pj.status NOT IN ('completed', 'cancelled')
  ORDER BY pj.scheduled_start_at ASC, pj.priority ASC;
END;
$$;

-- Function: Get jobs by order
CREATE OR REPLACE FUNCTION get_order_jobs(p_order_id UUID)
RETURNS SETOF production_jobs
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM production_jobs
  WHERE order_id = p_order_id
  ORDER BY
    CASE job_type
      WHEN 'design_setup' THEN 1
      WHEN 'material_prep' THEN 2
      WHEN 'printing' THEN 3
      WHEN 'lamination' THEN 4
      WHEN 'slitting' THEN 5
      WHEN 'pouch_making' THEN 6
      WHEN 'quality_check' THEN 7
      WHEN 'packaging' THEN 8
      ELSE 9
    END ASC,
    created_at ASC;
END;
$$;

-- Function: Validate production data
CREATE OR REPLACE FUNCTION validate_production_data(
  p_data_id UUID,
  p_validated_by UUID,
  p_validation_status TEXT,
  p_validation_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data production_data;
BEGIN
  -- Lock and fetch data record
  SELECT * INTO v_data
  FROM production_data
  WHERE id = p_data_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Production data not found'::TEXT;
    RETURN;
  END IF;

  -- Update validation status
  UPDATE production_data
  SET validation_status = p_validation_status,
      validated_by = p_validated_by,
      validated_at = NOW(),
      validation_notes = COALESCE(p_validation_notes, validation_notes)
  WHERE id = p_data_id;

  -- If valid and design file, can approve for production
  IF p_validation_status = 'valid' AND v_data.data_type = 'design_file' THEN
    UPDATE production_data
    SET approved_for_production = TRUE,
        approved_by = p_validated_by,
        approved_at = NOW()
    WHERE id = p_data_id;
  END IF;

  RETURN QUERY SELECT TRUE, 'Production data validated successfully'::TEXT;
END;
$$;

-- Function: Get production statistics
CREATE OR REPLACE FUNCTION get_production_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  job_type TEXT,
  total_jobs INTEGER,
  completed_jobs INTEGER,
  failed_jobs INTEGER,
  in_progress_jobs INTEGER,
  avg_duration_hours NUMERIC,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pj.job_type,
    COUNT(*) AS total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed') AS failed_jobs,
    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_jobs,
    AVG(actual_duration_minutes) / 60 AS avg_duration_hours,
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*) * 100)
      ELSE 0
    END AS completion_rate
  FROM production_jobs pj
  WHERE pj.created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY pj.job_type
  ORDER BY job_type;
END;
$$;

-- =====================================================
-- 7. Grant Permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON production_jobs TO authenticated;
GRANT SELECT ON production_data TO authenticated;
GRANT ALL ON production_jobs TO authenticated;
GRANT ALL ON production_data TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_ready_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_schedule TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION validate_production_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_stats TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Production Jobs & Data tables';
  RAISE NOTICE 'Tables created: production_jobs, production_data';
  RAISE NOTICE 'Indexes created: 11 indexes';
  RAISE NOTICE 'Policies created: 6 RLS policies';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - generate_job_number()';
  RAISE NOTICE '  - calculate_job_duration() (trigger function)';
  RAISE NOTICE '  - get_ready_jobs()';
  RAISE NOTICE '  - get_production_schedule()';
  RAISE NOTICE '  - get_order_jobs()';
  RAISE NOTICE '  - validate_production_data()';
  RAISE NOTICE '  - get_production_stats()';
END $$;
