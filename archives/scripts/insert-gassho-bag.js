const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', url ? 'Found' : 'Not found');
console.log('Key:', key ? 'Found' : 'Not found');

if (!url || !key) {
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(url, key);

const gasshoBag = {
  name: '合掌袋',
  name_ja: '合掌袋',
  name_ko: '합장袋子',
  slug: 'gassho-pouch',
  category: 'pouch',
  description: '底部が三角形の特徴的な形状を持つ合掌袋。ガムキャンディや少量の食品包装に最適です。',
  description_ja: '底部が三角形の特徴的な形状を持つ合掌袋。ガムキャンディや少量の食品包装に最適です。',
  description_ko: '바닥이 삼각형 모양의 특징적인 형태를 가진 합장자. 껌이나 캔디, 소량의 식품 포장에 최적입니다.',
  features: ['三角形の底部で自立可能', 'ガム・キャンディ包装に最適', 'コンパクトで省スペース', '鮮明な印刷対応', '各種材質・サイズ対応'],
  features_ja: ['三角形の底部で自立可能', 'ガム・キャンディ包装に最適', 'コンパクトで省スペース', '鮮明な印刷対応', '各種材質・サイズ対応'],
  features_ko: ['삼각형 바닥으로 자립 가능', '껌·캔디 포장에 최적', '컴팩트하여 공간 절약', '선명한 인쇄 대응', '각종 재질·사이즈 대응'],
  applications: ['ガム・キャンディ', '小分け包装', '試供品', 'サンプル品', '健康食品'],
  applications_ja: ['ガム・キャンディ', '小分け包装', '試供品', 'サンプル品', '健康食品'],
  applications_ko: ['껌·캔디', '소분 포장', '시험 제품', '샘플 제품', '건강 식품'],
  image_url: '/images/products/gassho-bag.png',
  sort_order: 7,
  is_active: true,
  is_featured: true,
  min_order_quantity: 1000,
  specifications: {
    bag_type: 'gassho',
    available_materials: ['PET', 'NY', 'CPP', 'LLDPE', 'AL'],
    available_features: ['zipper', 'valve', 'hang_hole'],
    size_range: {
      width: { min: 50, max: 200 },
      length: { min: 50, max: 300 },
      gusset: { min: 0, max: 0 }
    }
  }
};

async function insertProduct() {
  const { data, error } = await supabase
    .from('products')
    .insert(gasshoBag)
    .select();

  if (error) {
    console.log('Error:', error.message);
    console.log('Details:', error);
  } else {
    console.log('Success! Product ID:', data[0].id);
    console.log('Product:', data[0].name_ja);
  }
}

insertProduct();
