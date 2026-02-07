/**
 * Playwright Global Setup
 *
 * テスト実行前の初期設定
 * - ブラウザ設定
 * - テスト環境の準備
 * - データベース初期化（必要な場合）
 */

import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('='.repeat(60));
  console.log('🚀 Starting Playwright Global Setup');
  console.log('='.repeat(60));

  const baseURL = config.projects?.[0]?.use?.baseURL || process.env.BASE_URL || 'http://localhost:3006';
  console.log(`📍 Base URL: ${baseURL}`);

  // =====================================================
  // 環境変数の検証
  // =====================================================
  console.log('\n📋 Validating environment variables...');

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  // 必須環境変数のチェック
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`  ✅ ${envVar}: ***設定済み***`);
    } else {
      console.warn(`  ⚠️  ${envVar}: 未設定（テスト実行に影響する可能性があります）`);
    }
  }

  // =====================================================
  // テストユーザーの検証
  // =====================================================
  console.log('\n👤 Test users configured:');
  console.log('  📧 Member: member@test.com (Member1234!)');
  console.log('  📧 Admin: admin@epackage-lab.com (Admin123!)');

  // =====================================================
  // サーバー稼働確認
  // =====================================================
  console.log('\n🌐 Checking server availability...');

  try {
    const http = require('http');

    const checkServer = () => {
      return new Promise<boolean>((resolve) => {
        const url = new URL(baseURL);
        const req = http.request(
          {
            hostname: url.hostname,
            port: url.port || 80,
            path: '/',
            method: 'GET',
            timeout: 5000,
          },
          (res: any) => {
            console.log(`  ✅ Server is responding (Status: ${res.statusCode})`);
            resolve(true);
          }
        );

        req.on('error', (error: Error) => {
          console.warn(`  ⚠️  Server check failed: ${error.message}`);
          console.warn(`  💡 Ensure server is running: npm run dev`);
          resolve(false);
        });

        req.on('timeout', () => {
          req.destroy();
          console.warn(`  ⚠️  Server check timed out`);
          resolve(false);
        });

        req.end();
      });
    };

    await checkServer();
  } catch (error) {
    console.warn(`  ⚠️  Server check skipped: ${error}`);
  }

  // =====================================================
  // Playwrightの設定確認
  // =====================================================
  console.log('\n⚙️  Playwright configuration:');
  console.log(`  📂 Test directory: ${config.testDir}`);
  console.log(`  🖥️  Projects: ${config.projects?.length || 0}`);

  if (config.projects) {
    config.projects.forEach((project, index) => {
      console.log(`    ${index + 1}. ${project.name}`);
    });
  }

  // =====================================================
  // 完了
  // =====================================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ Global setup completed successfully');
  console.log('='.repeat(60));
  console.log('');
}

export default globalSetup;

// =====================================================
// Helper Functions
// =====================================================

async function setupTestDatabase() {
  // TODO: Implement database setup
  // - Create test database schema
  // - Run migrations
  // - Clear existing test data
}

async function seedTestData() {
  // TODO: Implement test data seeding
  // - Create test users (admin, member)
  // - Create sample quotations
  // - Create sample orders
  // - Upload test files
}

async function verifyAppAccessible(baseURL: string) {
  // TODO: Implement application health check
  // - Ping application
  // - Verify critical endpoints
  // - Check database connection
}
