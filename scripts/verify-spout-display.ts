import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySpoutDisplay() {
  console.log('=== スパウト表示検証 ===\n');

  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (!quote) {
    console.log('❌ 見積もりが見つかりません');
    return;
  }

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications as Record<string, unknown>;

    console.log('【データベースの状態】');
    console.log('✓ bagTypeId:', specs.bagTypeId);
    console.log('✓ spoutSize:', specs.spoutSize);
    console.log('✓ spoutPosition:', specs.spoutPosition);
    console.log('✓ pouchProcessingCost:', item.cost_breakdown?.pouchProcessingCost, 'JPY');
    console.log('');

    console.log('【表示条件チェック】');
    const condition1 = specs.bagTypeId === 'spout_pouch';
    const condition2 = specs.spoutSize;
    const condition3 = specs.spoutPosition;
    const shouldDisplay = condition1 || condition2 || condition3;

    console.log('  bagTypeId === "spout_pouch":', condition1);
    console.log('  spoutSizeが存在:', condition2);
    console.log('  spoutPositionが存在:', condition3);
    console.log('  → スパウトセクションが表示されるべき:', shouldDisplay ? '✓ YES' : '✗ NO');
    console.log('');

    console.log('【期待される表示】');
    if (shouldDisplay) {
      console.log('  📦 スパウト仕様（見出し）');
      console.log('  📏 スパウトサイズ: ' + specs.spoutSize + 'mm');
      console.log('  📍 スパウト位置: ' + (specs.spoutPosition === 'top-center' ? '上部中央' : specs.spoutPosition));
      console.log('  💰 スパウト加工費: ¥' + item.cost_breakdown?.pouchProcessingCost?.toLocaleString());
    }
    console.log('');

    console.log('【ブラウザで確認する手順】');
    console.log('  1. http://localhost:3000/admin/quotations を開く');
    console.log('  2. QT20260401-1568 をクリック');
    console.log('  3. Ctrl+Shift+R でハードリフレッシュ');
    console.log('  4. スパウト仕様が表示されることを確認');
  }
}

verifySpoutDisplay().catch(console.error);
