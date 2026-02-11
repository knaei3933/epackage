/**
 * Add Gassho Bag (合掌袋) to Products
 * 合掌袋を製品データベースに追加するスクリプト
 */

const BASE_URL = 'http://localhost:3001';

async function addGasshoBag() {
  console.log('========================================');
  console.log('合掌袋を製品に追加');
  console.log('========================================\n');

  const gasshoBagData = {
    name: '合掌袋',
    name_ja: '合掌袋',
    name_ko: '합장袋子',
    slug: 'gassho-pouch',
    category: 'pouch',
    description: '底部が三角形の特徴的な形状を持つ合掌袋。ガムキャンディや少量の食品包装に最適です。',
    description_ja: '底部が三角形の特徴的な形状を持つ合掌袋。ガムキャンディや少量の食品包装に最適です。',
    description_ko: '바닥이 삼각형 모양의 특징적인 형태를 가진 합장자. 껌이나 캔디, 소량의 식품 포장에 최적입니다.',
    features: [
      '三角形の底部で自立可能',
      'ガム・キャンディ包装に最適',
      'コンパクトで省スペース',
      '鮮明な印刷対応',
      '各種材質・サイズ対応'
    ],
    features_ja: [
      '三角形の底部で自立可能',
      'ガム・キャンディ包装に最適',
      'コンパクトで省スペース',
      '鮮明な印刷対応',
      '各種材質・サイズ対応'
    ],
    features_ko: [
      '삼각형 바닥으로 자립 가능',
      '껌·캔디 포장에 최적',
      '컴팩트하여 공간 절약',
      '선명한 인쇄 대응',
      '각종 재질·사이즈 대응'
    ],
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
    },
    applications: [
      'ガム・キャンディ',
      '小分け包装',
      '試供品',
      'サンプル品',
      '健康食品'
    ],
    applications_ja: [
      'ガム・キャンディ',
      '小分け包装',
      '試供品',
      'サンプル品',
      '健康食品'
    ],
    applications_ko: [
      '껌·캔디',
      '소분 포장',
      '시험 제품',
      '샘플 제품',
      '건강 식품'
    ]
  };

  try {
    // Direct SQL insert via Supabase
    const { createClient } = require('@supabase/supabase-js');

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseKey || supabaseKey.includes('your-project')) {
      console.log('❌ Supabase credentials not configured in environment variables.');
      console.log('\nPlease set:');
      console.log('  NEXT_PUBLIC_SUPABASE_URL');
      console.log('  SUPABASE_SERVICE_ROLE_KEY');
      console.log('\nOr manually insert this SQL into Supabase SQL Editor:\n');
      console.log('-- SQL to insert Gassho Bag');
      console.log(`INSERT INTO products (
  name, name_ja, name_ko,
  slug, category,
  description, description_ja, description_ko,
  features, features_ja, features_ko,
  applications, applications_ja, applications_ko,
  image_url,
  sort_order,
  is_active, is_featured,
  min_order_quantity,
  specifications
) VALUES (
  '${gasshoBagData.name}', '${gasshoBagData.name_ja}', '${gasshoBagData.name_ko}',
  '${gasshoBagData.slug}', '${gasshoBagData.category}',
  '${gasshoBagData.description.replace(/'/g, "''")}', '${gasshoBagData.description_ja.replace(/'/g, "''")}', '${gasshoBagData.description_ko.replace(/'/g, "''")}',
  '${JSON.stringify(gasshoBagData.features).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(gasshoBagData.features_ja).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(gasshoBagData.features_ko).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(gasshoBagData.applications).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(gasshoBagData.applications_ja).replace(/'/g, "''")}'::jsonb,
  '${JSON.stringify(gasshoBagData.applications_ko).replace(/'/g, "''")}'::jsonb,
  '${gasshoBagData.image_url}',
  ${gasshoBagData.sort_order},
  ${gasshoBagData.is_active}, ${gasshoBagData.is_featured},
  ${gasshoBagData.min_order_quantity},
  '${JSON.stringify(gasshoBagData.specifications).replace(/'/g, "''")}'::jsonb
);`);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('products')
      .insert(gasshoBagData)
      .select();

    if (error) {
      console.log('❌ Error inserting Gassho Bag:', error.message);
      console.log('\nYou can manually insert this data via Supabase SQL Editor.');
      return;
    }

    console.log('✅ Gassho Bag added successfully!');
    console.log('Product ID:', data[0].id);
    console.log('Product Name:', data[0].name_ja);
    console.log('\n📍 Visit: http://localhost:3001 to see the product on homepage.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

addGasshoBag();
