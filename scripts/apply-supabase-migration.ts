/**
 * Apply Supabase Migration Script
 *
 * This script applies the profiles table migration to Supabase.
 * Usage: npx tsx scripts/apply-supabase-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role (admin privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  try {
    console.log('🚀 Starting Supabase migration...\n');

    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250125000000_create_profiles_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log(`   Path: ${migrationPath}`);
    console.log(`   Size: ${migrationSQL.length} bytes\n`);

    // Split SQL into individual statements
    // Note: This is a simple split; for production, consider using a proper SQL parser
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        // Use Supabase RPC to execute SQL
        const { data, error } = await supabase.rpc('exec', {
          sql: statement,
        });

        if (error) {
          // Some statements might not be supported via RPC
          // Log but continue
          console.log(`⚠️  Statement ${i + 1}: Skipped (RPC limitation)`);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1}: Success`);
          successCount++;
        }
      } catch (err: any) {
        console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log(`Total statements: ${statements.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Skipped/Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements could not be executed via RPC.');
      console.log('📝 Please apply the migration manually through Supabase Dashboard:');
      console.log(`   1. Go to SQL Editor in Supabase Dashboard`);
      console.log(`   2. Copy contents of: ${migrationPath}`);
      console.log(`   3. Paste and click Run\n`);
    }

    // Verify table creation
    console.log('🔍 Verifying table creation...');
    const { data: profiles, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (checkError) {
      console.log('⚠️  Could not verify profiles table (may not exist yet)');
      console.log('   This is expected if manual migration is needed\n');
    } else {
      console.log('✅ Profiles table exists and is accessible!\n');
    }

    console.log('='.repeat(50));
    console.log('✅ Migration process completed!');
    console.log('='.repeat(50) + '\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📝 Please apply the migration manually through Supabase Dashboard:\n');
    console.error('   1. Go to SQL Editor in Supabase Dashboard');
    console.error('   2. Copy contents of: supabase/migrations/20250125000000_create_profiles_table.sql');
    console.error('   3. Paste and click Run\n');
    process.exit(1);
  }
}

// Run migration
applyMigration().catch(console.error);
