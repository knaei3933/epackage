/**
 * Create Test Member Account Script v2
 * 新しいテスト用会員アカウントを作成
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestMemberAccount() {
  const memberEmail = 'test@epac.co.jp';
  const memberPassword = 'Test1234!';

  console.log('=================================');
  console.log('テスト用会員アカウント作成 v2');
  console.log('=================================\n');

  // 既存プロフィール確認
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id, email, role, status')
    .eq('email', memberEmail)
    .maybeSingle();

  if (existingProfile) {
    console.log('⚠️ プロフィールは既に存在します');
    console.log('Email:', existingProfile.email);
    console.log('Role:', existingProfile.role);
    console.log('Status:', existingProfile.status);

    // パスワードリセット
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      existingProfile.id,
      { password: memberPassword, email_confirm: true }
    );

    if (resetError) {
      console.error('パスワードリセットエラー:', resetError);
    } else {
      console.log('✅ パスワードをリセットしました');
    }

    // ACTIVEに設定
    await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', existingProfile.id);

    console.log('\n=================================');
    console.log('ログイン情報:');
    console.log(`Email: ${memberEmail}`);
    console.log(`Password: ${memberPassword}`);
    console.log('=================================');
    return;
  }

  // 認証ユーザーを確認（プロフィールがない場合）
  console.log('プロフィールが存在しないため、認証ユーザーを確認...');

  // auth.usersに直接問い合わせはできないので、admin.listUsers()を使用
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('ユーザーリスト取得エラー:', listError);
  }

  const existingAuthUser = users?.find(u => u.email === memberEmail);

  let userId: string;

  if (existingAuthUser) {
    console.log('✅ 認証ユーザーが見つかりました:', existingAuthUser.id);
    userId = existingAuthUser.id;

    // パスワードリセット
    await supabase.auth.admin.updateUserById(userId, {
      password: memberPassword,
      email_confirm: true
    });
    console.log('✅ パスワードをリセットしました');
  } else {
    console.log('1. 認証ユーザー作成中...');

    // 認証ユーザー作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: memberEmail,
      password: memberPassword,
      email_confirm: true,
      user_metadata: {
        name_kanji: '山田太郎',
        name_kana: 'やまだたろう',
      },
    });

    if (authError) {
      console.error('❌ 認証ユーザー作成エラー:', authError.message);
      return;
    }

    console.log('✅ 認証ユーザー作成成功');
    userId = authData.user!.id;
  }

  console.log('User ID:', userId);

  console.log('\n2. プロフィール作成中...');

  // プロフィール作成
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: memberEmail,
      kanji_last_name: '山田',
      kanji_first_name: '太郎',
      kana_last_name: 'やまだ',
      kana_first_name: 'たろう',
      role: 'MEMBER',
      status: 'ACTIVE',
      user_type: 'B2B',
      business_type: 'CORPORATION',
      company_name: 'テスト株式会社',
      postal_code: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '丸の内1-1-1',
      building: 'テストビル10F',
      corporate_phone: '03-1234-5678',
      personal_phone: '090-1234-5678',
      position: 'テスト担当',
      department: '技術部',
      product_category: 'COSMETICS',
      acquisition_channel: 'Web',
    })
    .select('id, email, role, status')
    .single();

  if (profileError) {
    console.error('❌ プロフィール作成エラー:', profileError);
    console.error('Details:', profileError.details);
  } else {
    console.log('✅ プロフィール作成成功');
    console.log('Profile:', profileData);
  }

  console.log('\n=================================');
  console.log('ログイン情報:');
  console.log(`Email: ${memberEmail}`);
  console.log(`Password: ${memberPassword}`);
  console.log('=================================');
  console.log('\n管理者用:');
  console.log('Email: admin@epackage-lab.com');
  console.log('Password: Admin123!');
  console.log('=================================');
}

createTestMemberAccount()
  .then(() => {
    console.log('\n完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
