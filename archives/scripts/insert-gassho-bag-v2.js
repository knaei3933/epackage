const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const gasshoBag = {
  name_ja: '合掌袋',
  name_en: 'Gassho Bag',
  name_ko: '합장袋子',
  category: 'pouch',
  description_ja: '底部が三角形の特徴的な形状を持つ合掌袋。ガムキャンディや少量の食品包装に最適です。',
  description_en: 'Gassho bag with distinctive triangular bottom shape. Ideal for gum, candy, and small food packaging.',
  description_ko: '바닥이 삼각형 모양의 특징적인 형태를 가진 합장자. 껌이나 캔디, 소량의 식품 포장에 최적입니다.',
  features: [
    '三角形の底部で自立可能',
    'ガム・キャンディ包装に最適',
    'コンパクトで省スペース',
    '鮮明な印刷対応',
    '各種材質・サイズ対応'
  ],
  applications: [
    'ガム・キャンディ',
    '小分け包装',
    '試供品',
    'サンプル品',
    '健康食品'
  ],
  image: '/images/products/gassho-bag.png',
  sort_order: 7,
  is_active: true,
  min_order_quantity: 1000,
  lead_time_days: 21,
  pricing_formula: 'standard',
  specifications: {
    bag_type: 'gassho',
    available_materials: ['PET', 'NY', 'CPP', 'LLDPE', 'AL'],
    available_features: ['zipper', 'valve', 'hang_hole'],
    size_range: {
      width: { min: 50, max: 200 },
      length: { min: 50, max: 300 },
      gusset: { min: 0, max: 0 }
    }
  },
  materials: ['PET', 'NY', 'CPP', 'LLDPE'],
  tags: ['合掌袋', '小包装', 'キャンディ']
};

async function insertProduct() {
  console.log('合掌袋をデータベースに追加...\n');

  const { data, error } = await supabase
    .from('products')
    .insert(gasshoBag)
    .select();

  if (error) {
    console.log('Error:', error.message);
    console.log('Details:', error);
    return;
  }

  console.log('✅ 合掌袋を追加しました！');
  console.log('Product ID:', data[0].id);
  console.log('Product Name:', data[0].name_ja);
  console.log('\n📍 http://localhost:3001 でホームページを確認してください。');
}

insertProduct();
