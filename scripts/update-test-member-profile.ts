/**
 * Update Test Member Profile Script
 * 既存テスト会員のプロフィールを更新
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTestMemberProfile() {
  const memberEmail = 'member@test.epac.co.jp';
  const memberPassword = 'Member1234!';

  console.log('テスト用会員プロフィール更新開始...');

  // 既存ユーザー確認
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', memberEmail)
    .single();

  if (checkError || !existingUser) {
    console.error('ユーザーが見つかりません:', checkError);
    return;
  }

  console.log('既存ユーザー:', existingUser.email);

  // プロフィール更新
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({
      kanji_last_name: 'テスト',
      kanji_first_name: '会員',
      kana_last_name: 'テスト',
      kana_first_name: 'カイイン',
      status: 'ACTIVE',
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
      business_type: 'CORPORATION',
      user_type: 'B2B',
    })
    .eq('email', memberEmail)
    .select()
    .single();

  if (profileError) {
    console.error('プロフィール更新エラー:', profileError);
  } else {
    console.log('✅ プロフィール更新成功');
  }

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

  console.log('\n===================================');
  console.log('ログイン情報:');
  console.log(`Email: ${memberEmail}`);
  console.log(`Password: ${memberPassword}`);
  console.log('===================================');
}

updateTestMemberProfile()
  .then(() => {
    console.log('完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
