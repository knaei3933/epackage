const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function updateProducts() {
  console.log('製品情報を更新...\n');

  // 平袋
  const { data: p1 } = await supabase
    .from('products')
    .update({ min_order_quantity: 0, lead_time_days: 21 })
    .eq('name_ja', '平袋')
    .select();
  console.log(`✅ 平袋: MOQ=0, Lead=21日`);

  // スタンドパウチ
  const { data: p2 } = await supabase
    .from('products')
    .update({ min_order_quantity: 0, lead_time_days: 21 })
    .eq('name_ja', 'スタンドパウチ')
    .select();
  console.log(`✅ スタンドパウチ: MOQ=0, Lead=21日`);

  console.log('\n全製品の更新結果:\n');

  const { data: allProducts } = await supabase
    .from('products')
    .select('name_ja, min_order_quantity, lead_time_days')
    .order('sort_order');

  allProducts.forEach(p => {
    const moq = p.min_order_quantity === 0 ? '指定なし' : p.min_order_quantity;
    console.log(`${p.name_ja}: MOQ ${moq}, 納期 ${p.lead_time_days}日`);
  });

  console.log('\n✅ 更新完了！');
}

updateProducts();
