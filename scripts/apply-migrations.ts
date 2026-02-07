/**
 * Apply database migrations via Supabase REST API
 * This script applies the Korean member role and comment visibility migrations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration(sql: string, name: string) {
  console.log(`\n=== Applying: ${name} ===`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Error applying ${name}:`, error);
      return false;
    }

    console.log(`✅ Successfully applied: ${name}`);
    return true;
  } catch (err) {
    console.error(`❌ Exception applying ${name}:`, err);
    return false;
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

  // Note: We'll apply RLS policies separately as they need special handling

  await applyMigration(migration1, 'Add Korean member role');
  await applyMigration(migration2, 'Add comment visibility column');

  console.log('\n=== Migrations complete ===');
}

main().catch(console.error);
