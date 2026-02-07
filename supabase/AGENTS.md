# Supabase Directory - Database Migrations & Configuration

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains all Supabase database migrations, storage bucket configurations, and database schema definitions for the Epackage Lab B2B e-commerce platform. It manages the entire PostgreSQL database layer including tables, RLS policies, functions, triggers, and enums.

## Directory Structure

```
supabase/
├── migrations/              # SQL migration files (chronologically ordered)
├── .temp/                   # Supabase CLI temporary files
├── README.md                # Migration instructions and troubleshooting
└── AGENTS.md                # This file - AI agent reference guide
```

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Migration instructions, CLI usage, troubleshooting guide |
| `.temp/project-ref` | Supabase project reference ID |

## Subdirectories

### `migrations/`

Contains 82+ SQL migration files that define the entire database schema. Migrations are named with timestamp prefixes (`YYYYMMDDHHMMSS_description.sql`) for proper ordering.

**Core Schema Migrations:**
- `001_dashboard_schema.sql` - Initial dashboard schema (orders, addresses, quotations)
- `20250125000000_create_profiles_table.sql` - User profiles extending auth.users
- `20250130000001_create_companies_table.sql` - Company/Legal entity management
- `20250130000008_create_quotations_tables.sql` - Quotation system
- `20251231000001_create_products_table.sql` - Product catalog
- `20251231000002_create_inventory_tables.sql` - Inventory management
- `20251231000003_create_production_jobs_tables.sql` - Production workflow
- `20251231000005_create_shipments_tables.sql` - Shipping and tracking

**Advanced Features:**
- `20250101_create_ai_parser_tables.sql` - AI file parsing system
- `20250101000000_create_signatures_table.sql` - Digital signature storage
- `20250119000002_create_rbac_tables.sql` - Role-based access control
- `20250112_create_coupons_table.sql` - Coupon/discount system
- `20260119000000_create_unified_notifications.sql` - Notification system

**Storage Buckets:**
- `20260201000004_create_correction_files_bucket.sql` - Korean correction files
- `20260206000001_create_quotation_pdfs_bucket.sql` - Quotation PDF storage

### `.temp/`

Supabase CLI temporary files (auto-generated, do not edit):
- `cli-latest` - CLI version info
- `project-ref` - Project reference ID
- `postgres-version`, `gotrue-version`, `rest-version`, `storage-version` - Service versions

## For AI Agents

### Migration Naming Convention

**Format:** `YYYYMMDDHHMMSS_descriptive_name.sql`

**Examples:**
- `20250125000000_create_profiles_table.sql`
- `20260104000001_enable_rls_on_core_tables.sql`
- `20260204000000_add_10step_workflow_transitions.sql`

**Rules:**
1. Always use 14-digit timestamp (YYYYMMDDHHMMSS)
2. Use snake_case for descriptive names
3. Prefix with action: `create_`, `add_`, `alter_`, `drop_`, `fix_`
4. Be specific about what the migration does

### Creating New Migrations

**Step 1: Generate timestamp**
```bash
# Get current timestamp in correct format
date +%Y%m%d%H%M%S
```

**Step 2: Create migration file**
```bash
# Format: {timestamp}_{description}.sql
touch supabase/migrations/20260208000000_your_feature.sql
```

**Step 3: Follow migration template**
```sql
-- =====================================================
-- Migration: Your Feature Name
-- Purpose: Brief description of what this does
-- Created: YYYY-MM-DD
-- =====================================================

-- 1. Create/Alter Tables
-- 2. Create Types/Enums
-- 3. Create Indexes
-- 4. Create Functions
-- 5. Create Triggers
-- 6. Enable RLS and Create Policies
```

**Step 4: Apply migration**
```bash
# Using Supabase CLI
supabase db push

# Or manually via Dashboard
# SQL Editor → Paste migration → Run
```

### Common Patterns

**1. Create Table with RLS**
```sql
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- ... columns ...
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE example ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON example FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all"
  ON example FOR ALL
  USING (auth.role() = 'service_role');
```

**2. Add Column to Existing Table**
```sql
ALTER TABLE orders
  ADD COLUMN new_column TEXT,
  ADD COLUMN another_column INTEGER DEFAULT 0;
```

**3. Create Index**
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
```

**4. Create Enum Type**
```sql
CREATE TYPE custom_status AS ENUM (
  'PENDING',
  'ACTIVE',
  'COMPLETED'
);

ALTER TABLE items
  ADD COLUMN status custom_status DEFAULT 'PENDING';
```

**5. Create Trigger Function**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**6. Add Foreign Key (if missing)**
```sql
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_user_id
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

### RLS Policy Patterns

**Public Read (Authenticated)**
```sql
CREATE POLICY "Authenticated can view"
  ON table_name FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

**User Own Data Only**
```sql
CREATE POLICY "Users can view own"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);
```

**Admin Access**
```sql
CREATE POLICY "Admins can manage all"
  ON table_name FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE user_role = 'ADMIN'
    )
  );
```

**Service Role (Backend)**
```sql
CREATE POLICY "Service role full access"
  ON table_name FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### Migration Categories

| Category | Pattern | Examples |
|----------|---------|----------|
| **Schema Creation** | `create_*_table.sql` | `create_profiles_table.sql` |
| **Schema Updates** | `alter_*_table.sql` | `alter_orders_for_b2b.sql` |
| **Feature Additions** | `add_*_column.sql` | `add_payment_confirmation.sql` |
| **Feature Removals** | `drop_*_column.sql` | `drop_unused_indexes.sql` |
| **Performance** | `add_*_indexes.sql` | `add_performance_indexes.sql` |
| **Security** | `enable_rls_*.sql` | `enable_rls_on_core_tables.sql` |
| **Data Fixes** | `fix_*_issue.sql` | `fix_user_role_enum.sql` |
| **Data Seeding** | `seed_*_data.sql` | `seed_system_settings.sql` |
| **Storage** | `create_*_bucket.sql` | `create_quotation_pdfs_bucket.sql` |

### Key Tables Reference

| Table | Purpose | Migration File |
|-------|---------|----------------|
| `profiles` | User profiles (extends auth.users) | `create_profiles_table.sql` |
| `companies` | Legal entity/company info | `create_companies_table.sql` |
| `orders` | Customer orders | `001_dashboard_schema.sql` |
| `quotations` | Price quotations | `create_quotations_tables.sql` |
| `products` | Product catalog | `create_products_table.sql` |
| `inventory` | Stock management | `create_inventory_tables.sql` |
| `production_jobs` | Production workflow | `create_production_jobs_tables.sql` |
| `shipments` | Shipping/tracking | `create_shipments_tables.sql` |
| `files` | Design file management | `create_files_table.sql` |
| `notifications` | Unified notifications | `create_unified_notifications.sql` |
| `contracts` | Contract management | `create_contracts_table.sql` |
| `invoices` | Billing/invoices | `create_invoices_table.sql` |

### Enum Types Reference

| Enum | Values | Purpose |
|------|--------|---------|
| `user_role` | `ADMIN`, `MEMBER`, `KOREAN_MEMBER`, `SUPER_ADMIN` | User permissions |
| `order_status` | `pending` → `cancelled` | Order workflow |
| `quotation_status` | `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `EXPIRED`, `CONVERTED` | Quotation states |
| `legal_entity_type` | `KK`, `GK`, `GKDK`, `TK`, `KKK`, `Other` | Japanese company types |
| `file_type` | `AI`, `PDF`, `PSD`, `PNG`, `JPG`, `EXCEL`, `OTHER` | Design file formats |

### Supabase CLI Commands

```bash
# Link project (first time)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/database.ts

# Open database UI
supabase db studio

# Check migration status
supabase migration list

# Reset database (development only!)
supabase db reset
```

### Testing Migrations

**Before applying:**
1. Review SQL for syntax errors
2. Check foreign key references exist
3. Verify enum values are correct
4. Ensure RLS policies are defined

**After applying:**
1. Verify table created: `\dt` in psql or check Table Editor
2. Check indexes: `\di` in psql
3. Test RLS policies with different roles
4. Verify triggers are working

### Dependencies

**External:**
- Supabase CLI (install via `npm install -g supabase`)
- Supabase project with PostgreSQL database
- PostgreSQL 15+ (Supabase default)

**Internal:**
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/supabase-authenticated.ts` - Authenticated client
- `types/database.ts` - Generated TypeScript types

### Troubleshooting

**Migration conflicts:**
- Check if migration already applied: `supabase migration list`
- For duplicate errors, use `IF NOT EXISTS` clauses
- Never modify existing migration files - create new ones

**RLS policy issues:**
- Verify RLS enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`
- Check policy names don't conflict
- Test with `SET ROLE` to simulate different users

**Foreign key errors:**
- Ensure referenced tables exist before adding FKs
- Use correct ON DELETE behavior (CASCADE, SET NULL, RESTRICT)
- Check data types match between columns

### Best Practices

1. **Always timestamp migrations** - Use current timestamp format
2. **Use transactions** - Wrap complex changes in BEGIN/COMMIT
3. **Add comments** - Document complex logic in SQL
4. **Index wisely** - Add indexes on foreign keys and query columns
5. **Test locally** - Use `supabase start` for local development
6. **Never edit applied migrations** - Create new migration for changes
7. **Use IF NOT EXISTS** - Make migrations idempotent where possible
8. **Document breaking changes** - Note any data loss or API changes

### Related Documentation

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL Reference](https://www.postgresql.org/docs/)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [../README.md](../README.md) - Project documentation
