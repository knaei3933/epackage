const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

// 製品情報の更新
const productUpdates = [
  {
    // 平袋 - Flat Pouch
    name_ja: '平袋',
    updates: {
      min_order_quantity: null,
      lead_time_days: 21
    }
  },
  {
    // スタンドパウチ - Stand Pouch
    name_ja: 'スタンドパウチ',
    updates: {
      min_order_quantity: null,
      lead_time_days: 21
    }
  },
  {
    // スパウトパウチ - Spout Pouch
    name_ja: 'スパウトパウチ',
    updates: {
      min_order_quantity: 5000,
      lead_time_days: 28
    }
  },
  {
    // ロールフィルム - Roll Film
    name_ja: 'ロールフィルム',
    updates: {
      min_order_quantity: 500,
      lead_time_days: 21
    }
  }
];

async function updateProducts() {
  console.log('製品情報を更新...\n');

  for (const product of productUpdates) {
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name_ja, min_order_quantity, lead_time_days')
      .eq('name_ja', product.name_ja);

    if (fetchError) {
      console.log(`❌ Fetch error:`, fetchError.message);
      continue;
    }

    if (!products || products.length === 0) {
      console.log(`⚠️  製品が見つかりません: ${product.name_ja}`);
      continue;
    }

    for (const prod of products) {
      const { data, error } = await supabase
        .from('products')
        .update(product.updates)
        .eq('id', prod.id)
        .select();

      if (error) {
        console.log(`❌ Update error for ${prod.name_ja}:`, error.message);
      } else {
        console.log(`✅ ${prod.name_ja}`);
        console.log(`   MOQ: ${prod.min_order_quantity} → ${data[0].min_order_quantity}`);
        console.log(`   Lead: ${prod.lead_time_days}日 → ${data[0].lead_time_days}日`);
        console.log('');
      }
    }
  }

  console.log('\n全製品の更新結果:\n');

  const { data: allProducts } = await supabase
    .from('products')
    .select('name_ja, min_order_quantity, lead_time_days')
    .order('sort_order');

  allProducts.forEach(p => {
    const moq = p.min_order_quantity ? `${p.min_order_quantity}` : '指定なし';
    console.log(`${p.name_ja}: MOQ ${moq}, 納期 ${p.lead_time_days}日`);
  });
}

updateProducts();
