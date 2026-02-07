#!/usr/bin/env node

/**
 * 登録フローテストスクリプト
 *
 * 1. 新しいメールで登録
 * 2. pending ページにリダイレクト確認
 * 3. status APIで状態確認
 */

const TEST_EMAIL = `test-register-${Date.now()}@example.com`;
const BASE_URL = 'http://localhost:3005';

async function testRegistration() {
  console.log('==========================================');
  console.log('登録フローテスト');
  console.log('==========================================');
  console.log(`テストメール: ${TEST_EMAIL}`);
  console.log('');

  // =====================================================
  // Step 1: 登録API呼び出し
  // =====================================================
  console.log('Step 1: 登録API呼び出し...');

  const registrationData = {
    email: TEST_EMAIL,
    password: 'TestPass123',
    passwordConfirm: 'TestPass123',
    kanjiLastName: '山田',
    kanjiFirstName: '太郎',
    kanaLastName: 'やまだ',
    kanaFirstName: 'たろう',
    businessType: 'INDIVIDUAL',
    productCategory: 'OTHER',
    postalCode: '123-4567',
    prefecture: '東京都',
    city: '渋谷区',
    street: '1-2-3',
    privacyConsent: true
  };

  try {
    const response = await fetch(`${BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const result = await response.json();
    console.log('レスポンス:', JSON.stringify(result, null, 2));

    if (result.requiresEmailConfirmation) {
      console.log('✅ メール認証が必要です（正しい動作）');
    } else {
      console.log('⚠️  メール認証フラグがありません');
    }
  } catch (error) {
    console.error('❌ 登録APIエラー:', error.message);
    return;
  }

  // =====================================================
  // Step 2: pendingページHTML確認
  // =====================================================
  console.log('');
  console.log('Step 2: pendingページ確認...');

  try {
    const pendingResponse = await fetch(`${BASE_URL}/auth/pending?email=${encodeURIComponent(TEST_EMAIL)}`);
    console.log(`ステータスコード: ${pendingResponse.status}`);

    if (pendingResponse.ok) {
      const html = await pendingResponse.text();
      console.log('✅ pendingページ取得成功');

      // HTMLキーワード確認
      if (html.includes('メール認証が必要です') || html.includes('承認待ち')) {
        console.log('✅ pendingページに認証待ちメッセージがあります');
      } else {
        console.log('⚠️  pendingページのメッセージを確認できません');
      }
    } else {
      console.log('❌ pendingページ取得失敗');
    }
  } catch (error) {
    console.error('❌ pendingページエラー:', error.message);
  }

  // =====================================================
  // Step 3: status API確認
  // =====================================================
  console.log('');
  console.log('Step 3: status API確認...');

  try {
    const statusResponse = await fetch(`${BASE_URL}/api/member/status?email=${encodeURIComponent(TEST_EMAIL)}`);
    const statusData = await statusResponse.json();
    console.log('ステータス:', JSON.stringify(statusData, null, 2));

    if (statusData.requiresEmailConfirmation) {
      console.log('✅ メール認証が必要です（正しい動作）');
    } else if (statusData.isPending) {
      console.log('✅ 管理者承認待ちです');
    } else if (statusData.isConfirmed) {
      console.log('✅ 承認完了済みです');
    } else {
      console.log('⚠️  不明なステータス');
    }
  } catch (error) {
    console.error('❌ status APIエラー:', error.message);
  }

  console.log('');
  console.log('==========================================');
  console.log('テスト完了');
  console.log('==========================================');
}

// 実行
testRegistration().catch(console.error);
