/**
 * Create Test Addresses Script
 *
 * テスト用の納品先・請求先住所を作成するスクリプト
 *
 * 使い方:
 * npx tsx scripts/create-test-addresses.ts <user_id>
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// .env.localファイルを読み込み
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAddresses(userId: string) {
  console.log(`[Create Test Addresses] Creating addresses for user: ${userId}`);

  // 1. 既存の住所を確認
  const { data: existingDelivery } = await supabase
    .from('delivery_addresses')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: existingBilling } = await supabase
    .from('billing_addresses')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  console.log('[Create Test Addresses] Existing addresses:', {
    deliveryAddressId: existingDelivery?.id,
    billingAddressId: existingBilling?.id,
  });

  let deliveryAddressId = existingDelivery?.id;
  let billingAddressId = existingBilling?.id;

  // 2. 納品先住所を作成（存在しない場合）
  if (!deliveryAddressId) {
    const { data: newDelivery, error: deliveryError } = await supabase
      .from('delivery_addresses')
      .insert({
        user_id: userId,
        name: 'テスト株式会社A',
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '丸の内1-1-1',
        building: 'テストビル10階',
        phone: '03-1234-5678',
        contact_person: 'テスト担当者',
        is_default: true,
      })
      .select()
      .single();

    if (deliveryError) {
      console.error('[Create Test Addresses] Failed to create delivery address:', deliveryError);
    } else {
      deliveryAddressId = newDelivery.id;
      console.log('[Create Test Addresses] Delivery address created:', deliveryAddressId);
    }
  }

  // 3. 請求先住所を作成（存在しない場合）
  if (!billingAddressId) {
    const { data: newBilling, error: billingError } = await supabase
      .from('billing_addresses')
      .insert({
        user_id: userId,
        company_name: 'テスト株式会社A',
        postal_code: '100-0002',
        prefecture: '東京都',
        city: '千代田区',
        address: '丸の内2-2-2',
        building: 'テストビル5階',
        email: 'billing@test.example.com',
        phone: '03-9876-5432',
        tax_number: '1234567890123',
        is_default: true,
      })
      .select()
      .single();

    if (billingError) {
      console.error('[Create Test Addresses] Failed to create billing address:', billingError);
    } else {
      billingAddressId = newBilling.id;
      console.log('[Create Test Addresses] Billing address created:', billingAddressId);
    }
  }

  console.log('[Create Test Addresses] Done:', {
    deliveryAddressId,
    billingAddressId,
  });

  return { deliveryAddressId, billingAddressId };
}

// メイン処理
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: npx tsx scripts/create-test-addresses.ts <user_id>');
  process.exit(1);
}

createTestAddresses(userId)
  .then(() => {
    console.log('[Create Test Addresses] Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Create Test Addresses] Error:', error);
    process.exit(1);
  });
