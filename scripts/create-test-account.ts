/**
 * Test Account Creation Script
 *
 * 테스트용 계정을 직접 생성합니다
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestAccount() {
  // 일반 회원 계정
  const memberData = {
    email: 'member@test.com',
    password: 'Member1234!',
    kanji_last_name: '山田',
    kanji_first_name: '太郎',
    kana_last_name: 'やまだ',
    kana_first_name: 'たろう',
    corporate_phone: '03-1234-5678',
    personal_phone: '090-1234-5678',
    business_type: 'CORPORATION',
    company_name: 'テスト株式会社',
    legal_entity_number: '1234567890123',
    position: '担当者',
    department: '営業部',
    company_url: 'https://test.com',
    product_category: 'OTHER',
    acquisition_channel: 'web_search',
    postal_code: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '丸の内1-1-1',
    role: 'MEMBER',
    status: 'ACTIVE'
  };

  // 1. Auth 사용자 생성
  console.log('Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: memberData.email,
    password: memberData.password,
    email_confirm: true
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('Auth user created:', userId);

  // 2. 프로필 생성
  console.log('Creating profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: memberData.email,
      kanji_last_name: memberData.kanji_last_name,
      kanji_first_name: memberData.kanji_first_name,
      kana_last_name: memberData.kana_last_name,
      kana_first_name: memberData.kana_first_name,
      corporate_phone: memberData.corporate_phone,
      personal_phone: memberData.personal_phone,
      business_type: memberData.business_type,
      company_name: memberData.company_name,
      legal_entity_number: memberData.legal_entity_number,
      position: memberData.position,
      department: memberData.department,
      company_url: memberData.company_url,
      product_category: memberData.product_category,
      acquisition_channel: memberData.acquisition_channel,
      postal_code: memberData.postal_code,
      prefecture: memberData.prefecture,
      city: memberData.city,
      street: memberData.street,
      role: memberData.role,
      status: memberData.status
    });

  if (profileError) {
    console.error('Profile error:', profileError);
    // Rollback
    await supabase.auth.admin.deleteUser(userId);
    console.log('Rolled back');
    return;
  }

  console.log('\n✅ Account created successfully!');
  console.log('Email:', memberData.email);
  console.log('Password:', memberData.password);
  console.log('Role:', memberData.role);
}

createTestAccount();
