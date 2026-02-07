/**
 * Create Admin Account Script
 * 管理者アカウント作成スクリプト
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminAccount() {
  const adminEmail = 'admin@epackage-lab.com';
  const adminPassword = 'Admin123!';

  console.log('管理者アカウント作成開始...');

  // 既存ユーザー確認
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', adminEmail)
    .single();

  if (existingUser) {
    console.log('管理者アカウントは既に存在します:', existingUser);

    // パスワードリセット
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: adminPassword }
    );

    if (resetError) {
      console.error('パスワードリセットエラー:', resetError);
    } else {
      console.log('パスワードをリセットしました');
    }
    return;
  }

  // 管理者アカウント作成
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      name_kanji: '管理者',
      name_kana: 'カンリシャ',
    },
  });

  if (userError) {
    console.error('ユーザー作成エラー:', userError);
    return;
  }

  console.log('ユーザー作成成功:', userData);

  // プロフィール作成
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userData.user.id,
      email: adminEmail,
      name_kanji: '管理者',
      name_kana: 'カンリシャ',
      role: 'ADMIN',
      status: 'ACTIVE',
      user_type: 'B2B',
      business_type: 'CORPORATION',
    })
    .select()
    .single();

  if (profileError) {
    console.error('プロフィール作成エラー:', profileError);
  } else {
    console.log('プロフィール作成成功:', profileData);
  }
}

createAdminAccount()
  .then(() => {
    console.log('完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
