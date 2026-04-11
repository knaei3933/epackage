/**
 * Pricing Settings Initializer
 *
 * system_settingsテーブルにpricingカテゴリの設定を追加
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/\s/g, '');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PRICING_SETTINGS = [
  {
    category: 'pricing',
    key: 'manufacturer_margin',
    value: 0.3,
    value_type: 'number',
    description: '製造者マージン率（デフォルト30%）',
    unit: 'ratio'
  },
  {
    category: 'pricing',
    key: 'default_markup_rate',
    value: 0.2,
    value_type: 'number',
    description: '販売マージン率（デフォルト20%）',
    unit: 'ratio'
  }
];

async function addPricingSettings() {
  for (const setting of PRICING_SETTINGS) {
    // 既存の設定を確認
    const { data: existing, error: checkError } = await supabase
      .from('system_settings')
      .select('id, value')
      .eq('category', setting.category)
      .eq('key', setting.key)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`❌ Error checking ${setting.key}:`, checkError);
      continue;
    }

    if (existing) {
      console.log(`✅ ${setting.category}.${setting.key} already exists: ${existing.value}`);
      continue;
    }

    // 新規設定を挿入
    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        category: setting.category,
        key: setting.key,
        value: setting.value,
        value_type: setting.value_type,
        description: setting.description,
        unit: setting.unit,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to insert ${setting.key}:`, error);
    } else {
      console.log(`✅ Inserted ${setting.category}.${setting.key}:`, data.value);
    }
  }

  console.log('\n🎉 Pricing settings initialization complete!');
  process.exit(0);
}

addPricingSettings().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
