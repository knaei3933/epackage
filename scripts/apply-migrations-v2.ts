/**
 * Apply database migrations via direct SQL execution
 * Using pg to execute SQL directly
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database connection string from .env.local
const DB_URL = 'postgresql://postgres:vozlwl1109@db.ijlgpzjdfipzmjvawofp.supabase.co:5432/postgres';

async function executeSQL(sql: string, name: string) {
  console.log(`\n=== Applying: ${name} ===`);

  // Create a temporary file with the SQL
  const tempFile = join(process.cwd(), '.temp-migration.sql');
  require('fs').writeFileSync(tempFile, sql);

  try {
    const result = execSync(
      `psql "${DB_URL}" -f "${tempFile}"`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    console.log(result);
    console.log(`✅ Successfully applied: ${name}`);
    return true;
  } catch (err: any) {
    console.error(`❌ Error applying ${name}:`, err.message);
    return false;
  } finally {
    // Clean up temp file
    try {
      require('fs').unlinkSync(tempFile);
    } catch {}
  }
}

async function main() {
  console.log('Starting database migrations...');

  // Migration 1: Add Korean member role
  const migration1 = `
-- Add korean_member role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'korean_member' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'korean_member';
    END IF;
END $$;

-- Add production role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'production' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'production';
    END IF;
END $$;

-- Verify
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumsortorder;
  `;

  // Migration 2: Add visibility column
  const migration2 = `
-- Add visibility column with default value
ALTER TABLE order_comments
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all';

-- Update comment_type CHECK constraint to include new types
ALTER TABLE order_comments
DROP CONSTRAINT IF EXISTS order_comments_comment_type_check;

ALTER TABLE order_comments
ADD CONSTRAINT order_comments_comment_type_check
CHECK (comment_type IN ('general', 'design', 'production', 'shipping', 'correction', 'internal'));

-- Update author_role CHECK constraint to include new roles
ALTER TABLE order_comments
DROP CONSTRAINT IF EXISTS order_comments_author_role_check;

ALTER TABLE order_comments
ADD CONSTRAINT order_comments_author_role_check
CHECK (author_role IN ('customer', 'admin', 'korean_member', 'production'));

-- Create index on visibility for faster filtering
CREATE INDEX IF NOT EXISTS idx_order_comments_visibility
ON order_comments(visibility);
  `;

  await executeSQL(migration1, 'Add Korean member role');
  await executeSQL(migration2, 'Add comment visibility column');

  console.log('\n=== Migrations complete ===');
}

main().catch(console.error);
