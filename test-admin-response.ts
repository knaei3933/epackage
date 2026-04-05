import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAdminAPI() {
  console.log('=== Admin API Test for QT20260401-1568 ===\n');

  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (!quote) {
    console.log('Quote not found');
    return;
  }

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications;

    console.log('【Database Confirmed Data】');
    console.log('  bagTypeId:', specs.bagTypeId);
    console.log('  spoutSize:', specs.spoutSize, typeof specs.spoutSize);
    console.log('  spoutPosition:', specs.spoutPosition);
    console.log('');
    console.log('【Expected Display】');
    console.log('  ✓ スパウト仕様 (見出し)');
    console.log('  ✓ スパウトサイズ: ' + specs.spoutSize + 'mm');
    console.log('  ✓ スパウト位置: 上部中央');
    console.log('');
    console.log('【AdminQuotationsClient.tsx Code】');
    console.log('  const specs = item.specifications || breakdown?.specifications || {}');
    console.log('  This ensures item.specifications is prioritized');
    console.log('');
    console.log('【Next Steps】');
    console.log('  1. Open browser: http://localhost:3000/admin/quotations');
    console.log('  2. Login with admin@epackage-lab.com / Admin123!');
    console.log('  3. Click QT20260401-1568');
    console.log('  4. Verify spout specs are displayed');
  }
}

testAdminAPI().catch(console.error);
