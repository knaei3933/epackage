/**
 * Direct Database Update Script
 * Updates user to ADMIN/ACTIVE status
 */

const { Client } = require('pg');
const { config } = require('dotenv');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load env
config({ path: resolve('.env.local') });

async function updateToAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  const email = 'admin@epackage-lab.com';

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Update to ADMIN/ACTIVE
    await client.query(
      'UPDATE profiles SET role = $1, status = $2, updated_at = NOW() WHERE email = $3',
      ['ADMIN', 'ACTIVE', email]
    );
    console.log('✅ Updated to ADMIN/ACTIVE');

    // Verify
    const result = await client.query('SELECT email, role, status FROM profiles WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('\n========================================');
      console.log('✅ Admin Account Ready!');
      console.log('========================================');
      console.log('📧 Email:', user.email);
      console.log('🔑 Password: Admin1234');
      console.log('🔐 Role:', user.role);
      console.log('📊 Status:', user.status);
      console.log('========================================\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

updateToAdmin()
  .then(() => {
    console.log('✅ Done! Now running login test...\n');
    // Run playwright test
    const { spawn } = require('child_process');
    const playwright = spawn('npx', ['playwright', 'test', 'tests/login-test.spec.ts', '--headed', '--project=chromium'], {
      stdio: 'inherit',
      shell: true
    });
    playwright.on('close', (code) => {
      console.log(`\nPlaywright test exited with code ${code}`);
      process.exit(code);
    });
  })
  .catch(() => process.exit(1));
