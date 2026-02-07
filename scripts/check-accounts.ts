/**
 * Check Accounts Script
 * データベース内のユーザーアカウントを確認
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAccounts() {
  console.log('=== ユーザーアカウント確認 ===\n');

  // 全ユーザー取得
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, role, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('エラー:', error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️ ユーザーアカウントが見つかりませんでした。');
    return;
  }

  console.log(`✅ ${profiles.length}件のユーザーアカウントが見つかりました:\n`);

  for (const profile of profiles) {
    console.log(`📧 ${profile.email}`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   Status: ${profile.status}`);
    console.log(`   Created: ${new Date(profile.created_at).toLocaleString('ja-JP')}`);
    console.log('');
  }

  // ADMINアカウントのみ表示
  console.log('=== 管理者アカウント ===');
  const admins = profiles.filter(p => p.role === 'ADMIN');
  if (admins.length > 0) {
    for (const admin of admins) {
      console.log(`✅ ${admin.email} (${admin.status})`);
    }
  } else {
    console.log('⚠️ 管理者アカウントが見つかりません');
  }

  // MEMBERアカウントのみ表示
  console.log('\n=== 会員アカウント ===');
  const members = profiles.filter(p => p.role === 'MEMBER');
  if (members.length > 0) {
    for (const member of members) {
      console.log(`✅ ${member.email} (${member.status})`);
    }
  } else {
    console.log('⚠️ 会員アカウントが見つかりません');
  }

  console.log('\n===================================');
  console.log('管理者用ログイン情報:');
  console.log('Email: admin@epackage-lab.com');
  console.log('Password: Admin123!');
  console.log('===================================');
}

checkAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
