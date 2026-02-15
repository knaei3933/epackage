/**
 * Create Test Member Account Script
 * テスト用会員アカウント作成スクリプト
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
  const memberEmail = 'member@test.epac.co.jp';
  const memberPassword = 'Member1234!';

  console.log('テスト用会員アカウント作成開始...');

  // 既存ユーザー確認
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', memberEmail)
    .single();

  if (existingUser) {
    console.log('会員アカウントは既に存在します:', existingUser.email);

    // パスワードリセット
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { password: memberPassword }
    );

    if (resetError) {
      console.error('パスワードリセットエラー:', resetError);
    } else {
      console.log('✅ パスワードをリセットしました');
    }

    // ステータスをACTIVEに更新
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('email', memberEmail);

    if (updateError) {
      console.error('ステータス更新エラー:', updateError);
    } else {
      console.log('✅ ステータスをACTIVEに更新しました');
    }
    return;
  }

  // 会員アカウント作成
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: memberEmail,
    password: memberPassword,
    email_confirm: true,
    user_metadata: {
      name_kanji: 'テスト会員',
      name_kana: 'テストカイイン',
    },
  });

  if (userError) {
    console.error('ユーザー作成エラー:', userError);
    return;
  }

  console.log('✅ ユーザー作成成功:', userData.user?.email);

  // プロフィール作成
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userData.user?.id,
      email: memberEmail,
      kanji_last_name: 'テスト',
      kanji_first_name: '会員',
      kana_last_name: 'テスト',
      kana_first_name: 'カイイン',
      role: 'MEMBER',
      status: 'ACTIVE',
      user_type: 'B2B',
      business_type: 'CORPORATION',
      company_name: 'テスト株式会社',
      postal_code: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '丸の内1-1-1',
      corporate_phone: '03-1234-5678',
      personal_phone: '090-1234-5678',
      position: 'テスト担当',
      department: '技術部',
      product_category: 'COSMETICS',
      acquisition_channel: 'Web',
    })
    .select()
    .single();

  if (profileError) {
    console.error('プロフィール作成エラー:', profileError);
  } else {
    console.log('✅ プロフィール作成成功');
  }

  console.log('\n===================================');
  console.log('ログイン情報:');
  console.log(`Email: ${memberEmail}`);
  console.log(`Password: ${memberPassword}`);
  console.log('===================================');
}

createTestMemberAccount()
  .then(() => {
    console.log('完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
