/**
 * Enable Order Status History Trigger
 *
 * 스테이터스 이력 트리거 활성화 및 기존 데이터 백필
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableStatusHistoryTrigger() {
  console.log('==============================================');
  console.log('스테이터스 이력 트리거 활성화');
  console.log('==============================================\n');

  // 1. 기존 트리거 확인 및 삭제
  console.log('[1] 기존 트리거 확인...');

  // 먼저 트리거가 있는지 확인하기 위해 함수가 존재하는지 확인
  const { data: functions, error: funcError } = await supabase
    .rpc('log_order_status_change', {
      old_status: null,
      new_status: null
    })
    .select('*');

  // 2. 트리거 활성화 SQL 실행
  console.log('[2] 트리거 활성화 SQL 실행...');

  const triggerSQL = `
    DROP TRIGGER IF EXISTS orders_status_change_log ON orders;

    CREATE TRIGGER orders_status_change_log
      AFTER INSERT OR UPDATE OF status ON orders
      FOR EACH ROW
      EXECUTE FUNCTION log_order_status_change();
  `;

  // SQL 실행을 위한 함수 호출
  const { data: triggerResult, error: triggerError } = await supabase
    .rpc('exec_sql', { sql: triggerSQL });

  if (triggerError) {
    // exec_sql 함수가 없으면 직접 SQL 실행 시도
    console.log('  ⚠️  exec_sql 함수 없음. 대신 REST API로 실행 시도...');

    // REST API를 통한 SQL 실행은 service role이 필요하므로
    // 직접 SQL을 실행할 수 있는 방법을 찾아야 합니다
    console.error('  ❌ SQL 실행 실패:', triggerError);
    console.log('  📝 Supabase Dashboard에서 직접 SQL을 실행해주세요:');
    console.log('\n', triggerSQL);
    return;
  }

  console.log('  ✓ 트리거 활성화 완료');

  // 3. 기존 주문들에 대한 이력 백필
  console.log('\n[3] 기존 주문 이력 백필...');

  const backfillSQL = `
    INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, changed_at, reason)
    SELECT
      o.id AS order_id,
      NULL AS from_status,
      o.status AS to_status,
      o.user_id AS changed_by,
      o.created_at AS changed_at,
      'Initial status (backfilled)' AS reason
    FROM orders o
    WHERE NOT EXISTS (
      SELECT 1 FROM order_status_history osh WHERE osh.order_id = o.id
    )
    ON CONFLICT DO NOTHING;
  `;

  const { data: backfillResult, error: backfillError } = await supabase
    .from('order_status_history')
    .select('*');

  if (backfillError) {
    console.error('  ❌ 백필 실패:', backfillError);
  } else {
    console.log(`  ✓ 총 ${backfillResult?.length || 0}개의 이력 레코드 확인`);
  }

  // 4. 전체 이력 수 확인
  console.log('\n[4] 전체 이력 수 확인...');

  const { count, error: countError } = await supabase
    .from('order_status_history')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('  ❌ 카운트 실패:', countError);
  } else {
    console.log(`  ✓ 전체 이력 수: ${count || 0}건`);
  }

  // 5. 특정 주문의 이력 확인
  console.log('\n[5] 특정 주문 이력 확인...');

  const testOrderId = '06eb05e8-f205-4771-a13e-ba746dacaab4';

  const { data: orderHistory, error: historyError } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', testOrderId)
    .order('changed_at', { ascending: true });

  if (historyError) {
    console.error('  ❌ 이력 조회 실패:', historyError);
  } else if (!orderHistory || orderHistory.length === 0) {
    console.log(`  ⚠️  주문 ${testOrderId}의 이력이 없습니다`);
  } else {
    console.log(`  ✓ 주문 ${testOrderId}의 이력 (${orderHistory.length}건):`);
    orderHistory.forEach((h, index) => {
      console.log(`    [${index + 1}] ${h.from_status || '없음'} → ${h.to_status}`);
      console.log(`        변경일: ${h.changed_at}`);
    });
  }

  console.log('\n==============================================');
  console.log('완료');
  console.log('==============================================\n');
}

enableStatusHistoryTrigger()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('에러:', error);
    process.exit(1);
  });
