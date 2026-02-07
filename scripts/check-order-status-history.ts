/**
 * Check Order Status History
 *
 * 특정 주문의 스테이터스 이력을 확인하는 스크립트
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkOrderStatusHistory(orderId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`\n==================================================`);
  console.log(`주문 ID: ${orderId}`);
  console.log(`==================================================\n`);

  // 1. 주문 기본 정보 확인
  console.log('[1] 주문 기본 정보:');
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) {
    console.error('  ❌ 주문 조회 실패:', orderError);
  } else {
    console.log(`  ✓ 주문 번호: ${order.order_number}`);
    console.log(`  ✓ 현재 스테이터스: ${order.status}`);
    console.log(`  ✓ 생성일: ${order.created_at}`);
    console.log(`  ✓ 수정일: ${order.updated_at}`);
  }

  // 2. 스테이터스 이력 확인
  console.log('\n[2] 스테이터스 이력 (order_status_history):');
  const { data: history, error: historyError } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('changed_at', { ascending: true });

  if (historyError) {
    console.error('  ❌ 이력 조회 실패:', historyError);
  } else if (!history || history.length === 0) {
    console.log('  ⚠️  이력이 없습니다 (0건)');
  } else {
    console.log(`  ✓ 총 ${history.length}건의 이력이 있습니다:\n`);
    history.forEach((h, index) => {
      console.log(`  [${index + 1}] ${h.old_status || '없음'} → ${h.new_status}`);
      console.log(`      변경자: ${h.changed_by}`);
      console.log(`      변경일: ${h.changed_at}`);
      if (h.notes) console.log(`      메모: ${h.notes}`);
      console.log('');
    });
  }

  // 3. 테이블 존재 확인
  console.log('\n[3] 테이블 존재 확인:');
  const { data: tables, error: tablesError } = await supabase
    .from('order_status_history')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('  ❌ order_status_history 테이블이 없습니다:', tablesError);
  } else {
    console.log('  ✓ order_status_history 테이블이 존재합니다');
  }

  // 4. 모든 주문의 이력 개수 확인
  console.log('\n[4] 모든 주문의 이력 개수:');
  const { data: allHistory, error: allHistoryError } = await supabase
    .from('order_status_history')
    .select('order_id');

  if (allHistoryError) {
    console.error('  ❌ 조회 실패:', allHistoryError);
  } else {
    const orderCounts = allHistory?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.order_id] = (acc[curr.order_id] || 0) + 1;
      return acc;
    }, {}) || {};

    console.log(`  ✓ 전체 ${Object.keys(orderCounts).length}개 주문에 이력이 있습니다`);
    console.log('  주문별 이력 수:');
    Object.entries(orderCounts).forEach(([oid, count]) => {
      const orderNum = order?.id === oid ? order.order_number : oid;
      console.log(`    - ${orderNum}: ${count}건`);
    });
  }

  console.log('\n==================================================\n');
}

// 실행
const orderId = process.argv[2];
if (!orderId) {
  console.error('사용법: npx tsx scripts/check-order-status-history.ts <order_id>');
  console.error('예시: npx tsx scripts/check-order-status-history.ts 06eb05e8-f205-4771-a13e-ba746dacaab4');
  process.exit(1);
}

checkOrderStatusHistory(orderId).catch(console.error);
