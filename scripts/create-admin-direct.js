/**
 * Quick Admin Creation Script (Direct PostgreSQL)
 * Run: node scripts/create-admin-direct.js
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { config } = require('dotenv');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load env
config({ path: resolve('.env.local') });

async function createAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  const email = 'admin@epackage-lab.com';
  const password = 'Admin1234';

  try {
    console.log('\n🔐 Creating Admin Account\n');

    await client.connect();
    console.log('✅ Connected to database');

    // Check if user exists
    const result = await client.query('SELECT id, email, role, status FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      // Update existing user
      const user = result.rows[0];
      console.log(`⚠️  User exists: ${user.id}`);

      await client.query(
        'UPDATE users SET role = $1, status = $2, "updated_at" = NOW() WHERE id = $3',
        ['ADMIN', 'ACTIVE', user.id]
      );
      console.log('✅ Updated to ADMIN/ACTIVE');
    } else {
      // Create new user
      console.log('1. Creating new user...');

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `usr_${Date.now()}`;

      await client.query(`
        INSERT INTO users (
          id, email, password, "emailVerified",
          "kanjiLastName", "kanjiFirstName",
          "kanaLastName", "kanaFirstName",
          "businessType", "productCategory",
          role, status, "lastLoginAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        userId,
        email,
        hashedPassword,
        new Date(),
        '管理',
        '者',
        'かんり',
        'しゃ',
        'CORPORATION',
        'OTHER',
        'ADMIN',
        'ACTIVE',
        new Date()
      ]);

      console.log(`✅ User created: ${userId}`);
    }

    // Verify
    const verify = await client.query('SELECT id, email, role, status FROM users WHERE email = $1', [email]);

    console.log('\n─────────────────────────────────────────────');
    console.log('✅ Admin Account Ready!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', verify.rows[0].role);
    console.log('📊 Status:', verify.rows[0].status);
    console.log('─────────────────────────────────────────────\n');
    console.log('🌐 Login: http://localhost:3000/signin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
