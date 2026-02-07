/**
 * テスト用アカウント確認・作成スクリプト
 *
 * Run: npx tsx scripts/check-test-accounts.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1xndmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXsvt58';

const supabase = createClient(supabaseUrl, supabaseKey);

// テスト用認証情報
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@test.epac.co.jp',
    password: 'Admin1234!'
  },
  member: {
    email: 'member@test.epac.co.jp',
    password: 'Member1234!'
  }
};

async function checkOrCreateAccounts() {
  console.log('=== テスト用アカウント確認・作成 ===\n');

  // 管理者アカウント
  console.log('1. 管理者アカウント確認中...');
  const { data: existingAdmin } = await supabase
    .from('profiles')
    .select('id, email, role, status')
    .eq('email', TEST_CREDENTIALS.admin.email);

  if (existingAdmin && existingAdmin.length > 0) {
    console.log('✅ 管理者アカウント存在:', existingAdmin[0].email);
  } else {
    console.log('❌ 管理者アカウントなし → 作成します');
    const { data: newAdmin, error: adminError } = await supabase.auth.signUp({
      email: TEST_CREDENTIALS.admin.email,
      password: TEST_CREDENTIALS.admin.password
    });

    if (adminError) {
      // 既に存在する場合はプロフィール作成
      const { data: signInAdmin } = await supabase.auth.signInWithPassword({
        email: TEST_CREDENTIALS.admin.email,
        password: TEST_CREDENTIALS.admin.password
      });

      if (signInAdmin.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: 'ADMIN',
            status: 'ACTIVE'
          })
          .eq('id', signInAdmin.user.id);

        if (!profileError) {
          console.log('✅ 管理者プロフィール作成完了:', signInAdmin.user.email);
        }
      }
    } else {
      console.log('✅ 管理者アカウント作成完了:', newAdmin.user.email);
    }
  }

  // 会員アカウント
  console.log('\n2. 会員アカウント確認中...');
  const { data: existingMember } = await supabase
    .from('profiles')
    .select('id, email, role, status')
    .eq('email', TEST_CREDENTIALS.member.email);

  if (existingMember && existingMember.length > 0) {
    console.log('✅ 会員アカウント存在:', existingMember[0].email);
  } else {
    console.log('❌ 会員アカウントなし → 作成します');
    const { data: newMember, error: memberError } = await supabase.auth.signUp({
      email: TEST_CREDENTIALS.member.email,
      password: TEST_CREDENTIALS.member.password
    });

    if (memberError) {
      // 既に存在する場合はプロフィール作成
      const { data: signInMember } = await supabase.auth.signInWithPassword({
        email: TEST_CREDENTIALS.member.email,
        password: TEST_CREDENTIALS.member.password
      });

      if (signInMember.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: 'MEMBER',
            status: 'ACTIVE'
          })
          .eq('id', signInMember.user.id);

        if (!profileError) {
          console.log('✅ 会員プロフィール作成完了:', signInMember.user.email);
        }
      }
    } else {
      console.log('✅ 会員アカウント作成完了:', newMember.user.email);
    }
  }

  console.log('\n=== テスト用認証情報 ===');
  console.log('管理者:', TEST_CREDENTIALS.admin.email, '/', TEST_CREDENTIALS.admin.password);
  console.log('会員:', TEST_CREDENTIALS.member.email, '/', TEST_CREDENTIALS.member.password);
}

checkOrCreateAccounts().catch(console.error);
