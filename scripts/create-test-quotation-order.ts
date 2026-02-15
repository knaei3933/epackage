/**
 * Create Test Quotation and Order Script
 * テスト用見積と注文データを作成
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestQuotationAndOrder() {
  console.log('=================================');
  console.log('テスト用見積・注文データ作成');
  console.log('=================================\n');

  // テストユーザーのIDを取得
  const { data: memberProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'member@test.com')
    .maybeSingle();

  if (!memberProfile) {
    console.error('❌ テストユーザーが見つかりません。先に create-test-member-v2.ts を実行してください。');
    return;
  }

  const userId = memberProfile.id;
  console.log('✅ テストユーザーID:', userId);

  // 既存の見積を確認
  const { data: existingQuotations } = await supabase
    .from('quotations')
    .select('id, quotation_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log(`📊 既存の見積数: ${existingQuotations?.length || 0}`);

  // テスト用見積データを作成
  const quotationNumber = `QT-TEST-${Date.now()}`;
  const totalCostBreakdown = {
    duty: 0,
    delivery: 0,
    totalCost: 150000,
    slitterCost: 10000,
    materialCost: 100000,
    printingCost: 30000,
    laminationCost: 5000,
    pouchProcessingCost: 5000
  };

  console.log('\n1. 見積作成中...');

  const { data: quotationData, error: quotationError } = await supabase
    .from('quotations')
    .insert({
      user_id: userId,
      quotation_number: quotationNumber,
      total_amount: 176910,
      subtotal_amount: 160827,
      tax_amount: 16083,
      subtotal: 160827,
      status: 'approved',
      sku_count: 1,
      total_meters: 1500,
      loss_meters: 400,
      total_cost_breakdown: totalCostBreakdown,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      customer_name: 'テスト株式会社 山田太郎',
      customer_email: 'member@test.com',
    })
    .select('id')
    .single();

  if (quotationError) {
    console.error('❌ 見積作成エラー:', quotationError);
    return;
  }

  console.log('✅ 見積作成成功');
  console.log('見積ID:', quotationData.id);
  console.log('見積番号:', quotationNumber);

  // 注文データを作成
  console.log('\n2. 注文作成中...');

  const orderNumber = `ORD-TEST-${Date.now()}`;

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      quotation_id: quotationData.id,
      status: 'processing', // 処理中（仕様変更可能）
      total_amount: 176910,
      subtotal: 160827,
      tax_amount: 16083,
      customer_name: '山田太郎',
      customer_email: 'member@test.com',
      customer_phone: '090-1234-5678',
      delivery_address: {
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '丸の内1-1-1',
        building: 'テストビル10F'
      },
      billing_address: {
        postal_code: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        street: '丸の内1-1-1',
        building: 'テストビル10F'
      }
    })
    .select('id')
    .single();

  if (orderError) {
    console.error('❌ 注文作成エラー:', orderError);
    return;
  }

  console.log('✅ 注文作成成功');
  console.log('注文ID:', orderData.id);
  console.log('注文番号:', orderNumber);
  console.log('ステータス: processing（処理中）');

  console.log('\n=================================');
  console.log('作成完了:');
  console.log(`見積番号: ${quotationNumber}`);
  console.log(`注文番号: ${orderNumber}`);
  console.log(`ステータス: processing（仕様変更可能）`);
  console.log('=================================\n');

  console.log('これでE2Eテストを実行できるようになりました。');
}

createTestQuotationAndOrder()
  .then(() => {
    console.log('\n完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
