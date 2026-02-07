-- =====================================================
-- RBAC (Role-Based Access Control) Tables Migration
-- =====================================================
-- ロールベースアクセス制御システム
-- 詳細な権限管理を実現します

-- =====================================================
-- Create Permissions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- =====================================================
-- Create Role Permissions Mapping Table
-- =====================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Index for role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- =====================================================
-- Insert Initial Permissions
-- =====================================================

-- User management permissions
INSERT INTO permissions (name, description, category) VALUES
  ('user:read', 'View user information', 'users'),
  ('user:write', 'Create and update users', 'users'),
  ('user:approve', 'Approve user registrations', 'users'),
  ('user:delete', 'Delete users', 'users');

-- Order management permissions
INSERT INTO permissions (name, description, category) VALUES
  ('order:read', 'View orders', 'orders'),
  ('order:create', 'Create orders', 'orders'),
  ('order:update', 'Update orders', 'orders'),
  ('order:delete', 'Delete orders', 'orders'),
  ('order:approve', 'Approve orders', 'orders');

-- Quotation management permissions
INSERT INTO permissions (name, description, category) VALUES
  ('quotation:read', 'View quotations', 'quotations'),
  ('quotation:create', 'Create quotations', 'quotations'),
  ('quotation:update', 'Update quotations', 'quotations'),
  ('quotation:delete', 'Delete quotations', 'quotations'),
  ('quotation:approve', 'Approve quotations', 'quotations');

-- Production permissions
INSERT INTO permissions (name, description, category) VALUES
  ('production:read', 'View production data', 'production'),
  ('production:update', 'Update production status', 'production'),
  ('production:manage', 'Manage production workflow', 'production');

-- Inventory permissions
INSERT INTO permissions (name, description, category) VALUES
  ('inventory:read', 'View inventory', 'inventory'),
  ('inventory:update', 'Update inventory', 'inventory'),
  ('inventory:adjust', 'Adjust inventory levels', 'inventory');

-- Finance permissions
INSERT INTO permissions (name, description, category) VALUES
  ('finance:read', 'View financial data', 'finance'),
  ('finance:approve', 'Approve financial transactions', 'finance');

-- Shipment permissions
INSERT INTO permissions (name, description, category) VALUES
  ('shipment:read', 'View shipments', 'shipments'),
  ('shipment:create', 'Create shipments', 'shipments'),
  ('shipment:update', 'Update shipments', 'shipments');

-- Contract permissions
INSERT INTO permissions (name, description, category) VALUES
  ('contract:read', 'View contracts', 'contracts'),
  ('contract:sign', 'Sign contracts', 'contracts'),
  ('contract:approve', 'Approve contracts', 'contracts');

-- Sample permissions
INSERT INTO permissions (name, description, category) VALUES
  ('sample:read', 'View sample requests', 'samples'),
  ('sample:create', 'Create sample requests', 'samples'),
  ('sample:approve', 'Approve sample requests', 'samples');

-- Settings permissions
INSERT INTO permissions (name, description, category) VALUES
  ('settings:read', 'View system settings', 'settings'),
  ('settings:write', 'Modify system settings', 'settings');

-- Notification permissions
INSERT INTO permissions (name, description, category) VALUES
  ('notification:read', 'View notifications', 'notifications'),
  ('notification:send', 'Send notifications', 'notifications');

-- Report permissions
INSERT INTO permissions (name, description, category) VALUES
  ('report:read', 'View reports', 'reports'),
  ('report:export', 'Export reports', 'reports');

-- =====================================================
-- Assign Permissions to Roles
-- =====================================================

-- ADMIN role: All permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'ADMIN', id FROM permissions;

-- MEMBER role: Limited permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'MEMBER', id FROM permissions WHERE name IN (
  -- User permissions
  'user:read',
  -- Order permissions
  'order:read',
  'order:create',
  -- Quotation permissions
  'quotation:read',
  'quotation:create',
  -- Sample permissions
  'sample:read',
  'sample:create',
  -- Production permissions
  'production:read',
  -- Inventory permissions
  'inventory:read',
  -- Shipment permissions
  'shipment:read',
  -- Contract permissions
  'contract:read',
  'contract:sign',
  -- Notification permissions
  'notification:read',
  -- Report permissions
  'report:read'
);

-- OPERATOR role: Production and operations focused
INSERT INTO role_permissions (role, permission_id)
SELECT 'OPERATOR', id FROM permissions WHERE name IN (
  -- Production permissions
  'production:read',
  'production:update',
  'production:manage',
  -- Inventory permissions
  'inventory:read',
  'inventory:update',
  'inventory:adjust',
  -- Shipment permissions
  'shipment:read',
  'shipment:create',
  'shipment:update',
  -- Order permissions
  'order:read',
  'order:update',
  -- Notification permissions
  'notification:read',
  'notification:send'
);

-- SALES role: Sales and quotations focused
INSERT INTO role_permissions (role, permission_id)
SELECT 'SALES', id FROM permissions WHERE name IN (
  -- User permissions
  'user:read',
  'user:approve',
  -- Quotation permissions
  'quotation:read',
  'quotation:create',
  'quotation:update',
  'quotation:approve',
  -- Order permissions
  'order:read',
  'order:create',
  'order:update',
  'order:approve',
  -- Sample permissions
  'sample:read',
  'sample:create',
  'sample:approve',
  -- Contract permissions
  'contract:read',
  'contract:approve',
  -- Notification permissions
  'notification:read',
  'notification:send',
  -- Report permissions
  'report:read',
  'report:export'
);

-- ACCOUNTING role: Finance focused
INSERT INTO role_permissions (role, permission_id)
SELECT 'ACCOUNTING', id FROM permissions WHERE name IN (
  -- Order permissions
  'order:read',
  -- Quotation permissions
  'quotation:read',
  -- Finance permissions
  'finance:read',
  'finance:approve',
  -- Invoice permissions
  'invoice:read',
  'invoice:create',
  'invoice:update',
  -- Contract permissions
  'contract:read',
  'contract:approve',
  -- Report permissions
  'report:read',
  'report:export'
);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read permissions
CREATE POLICY "Authenticated can read permissions"
  ON permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can read role_permissions
CREATE POLICY "Authenticated can read role permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify permissions
CREATE POLICY "Admins can insert permissions"
  ON permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update permissions"
  ON permissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete permissions"
  ON permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Only admins can modify role_permissions
CREATE POLICY "Admins can insert role permissions"
  ON role_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete role permissions"
  ON role_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_uuid UUID,
  permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN profiles pr ON pr.role = rp.role
    WHERE pr.id = user_uuid
      AND p.name = permission_name
  ) INTO has_perm;

  -- Admins always have all permissions
  IF NOT has_perm THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = user_uuid AND role = 'ADMIN'
    ) INTO has_perm;
  END IF;

  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE (
  permission_name TEXT,
  permission_category TEXT,
  permission_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.name,
    p.category,
    p.description
  FROM role_permissions rp
  JOIN permissions p ON p.id = rp.permission_id
  JOIN profiles pr ON pr.role = rp.role
  WHERE pr.id = user_uuid
  ORDER BY p.category, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any of the specified permissions
CREATE OR REPLACE FUNCTION user_has_any_permission(
  user_uuid UUID,
  VARIADIC permission_names TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN profiles pr ON pr.role = rp.role
    WHERE pr.id = user_uuid
      AND p.name = ANY(permission_names)
  ) INTO has_perm;

  -- Admins always have all permissions
  IF NOT has_perm THEN
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = user_uuid AND role = 'ADMIN'
    ) INTO has_perm;
  END IF;

  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a role
CREATE OR REPLACE FUNCTION get_role_permissions(role_name TEXT)
RETURNS TABLE (
  permission_name TEXT,
  permission_category TEXT,
  permission_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name,
    p.category,
    p.description
  FROM role_permissions rp
  JOIN permissions p ON p.id = rp.permission_id
  WHERE rp.role = role_name
  ORDER BY p.category, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant Permissions
-- =====================================================

GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

GRANT EXECUTE ON FUNCTION user_has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_any_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_role_permissions TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE permissions IS 'Permission definitions for RBAC system';
COMMENT ON TABLE role_permissions IS 'Role to permission mapping for RBAC system';

COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission';
COMMENT ON FUNCTION get_user_permissions IS 'Get all permissions for a user';
COMMENT ON FUNCTION user_has_any_permission IS 'Check if user has any of the specified permissions';
COMMENT ON FUNCTION get_role_permissions IS 'Get all permissions for a role';

-- =====================================================
-- Data Validation
-- =====================================================

DO $$
DECLARE
  perm_count INT;
  role_perm_count INT;
BEGIN
  SELECT COUNT(*) INTO perm_count FROM permissions;
  SELECT COUNT(*) INTO role_perm_count FROM role_permissions;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'RBAC Setup Summary';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total permissions created: %', perm_count;
  RAISE NOTICE 'Total role permissions assigned: %', role_perm_count;
  RAISE NOTICE '====================================';
END $$;
