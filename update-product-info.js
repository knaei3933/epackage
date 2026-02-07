const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

// 製品情報の更新
const productUpdates = [
  {
    // 平袋 - Flat Pouch
    category: 'flat',
    updates: {
      min_order_quantity: null, // 指定なし
      lead_time_days: 21
    }
  },
  {
    // スタンドパウチ - Stand Pouch
    category: 'stand',
    updates: {
      min_order_quantity: null, // 指定なし
      lead_time_days: 21
    }
  },
  {
    // 박스형 파ウ치 - Box Pouch
    category: 'box',
    updates: {
      min_order_quantity: 10000,
      lead_time_days: 28
    }
  },
  {
    // スパウトパウチ - Spout Pouch
    category: 'spout',
    updates: {
      min_order_quantity: 5000,
      lead_time_days: 28
    }
  },
  {
    // 롤 필름 - Roll Film
    category: 'roll-film',
    updates: {
      min_order_quantity: 500,
      lead_time_days: 21
    }
  },
  {
    // 合掌袋 - Gassho Bag
    name_ja: '合掌袋',
    updates: {
      min_order_quantity: 10000,
      lead_time_days: 28
    }
  }
];

async function updateProducts() {
  console.log('製品情報を更新...\n');

  for (const product of productUpdates) {
    let query;

    if (product.name_ja) {
      // 名前で検索
      query = supabase
        .from('products')
        .select('id, name_ja, min_order_quantity, lead_time_days')
        .eq('name_ja', product.name_ja);
    } else {
      // カテゴリで検索
      query = supabase
        .from('products')
        .select('id, name_ja, category, min_order_quantity, lead_time_days')
        .eq('category', product.category);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      console.log(`❌ Fetch error for ${product.category || product.name_ja}:`, fetchError.message);
      continue;
    }

    if (!products || products.length === 0) {
      console.log(`⚠️  製品が見つかりません: ${product.category || product.name_ja}`);
      continue;
    }

    // 各製品を更新
    for (const prod of products) {
      const { data, error } = await supabase
        .from('products')
        .update(product.updates)
        .eq('id', prod.id)
        .select();

      if (error) {
        console.log(`❌ Update error for ${prod.name_ja}:`, error.message);
      } else {
        console.log(`✅ ${prod.name_ja} (${prod.category || 'N/A'})`);
        console.log(`   MOQ: ${prod.min_order_quantity} → ${data[0].min_order_quantity}`);
        console.log(`   Lead: ${prod.lead_time_days}日 → ${data[0].lead_time_days}日`);
      }
    }
  }

  console.log('\n✅ 製品情報の更新が完了しました！');
}

updateProducts();
