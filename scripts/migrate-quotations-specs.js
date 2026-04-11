/**
 * Quotation Specifications Migration Script
 *
 * 古い見積もりデータの specifications に欠けているフィールドを補完します
 * - printingType → printing_display
 * - colors (printingColors)
 * - zipper (postProcessingOptions から判定)
 * - weight_range (MATERIAL_THICKNESS_OPTIONS から取得)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Supabase credentials not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 材料厚さオプション（unified-pricing-engine からインポート）
const MATERIAL_THICKNESS_OPTIONS = {
  'ny_lldpe': [
    { id: 'ny15_lldpe70', name: '標準', thickness: 'NY 15μ + LLDPE 70μ', weightRange: '90～100g/m²' },
  ],
  'pet_ldpe': [
    { id: 'pet12_ldpe70', name: '標準', thickness: 'PET 12μ + LLDPE 70μ', weightRange: '85～95g/m²' },
  ],
  'pet_al': [
    { id: 'pet12_al7_pet12_ldpe70', name: '標準', thickness: 'PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ', weightRange: '105～115g/m²' },
  ],
  'pet_vmpet': [
    { id: 'pet12_vmpet12_pet12_ldpe90', name: '標準', thickness: 'PET 12μ + VMPET 12μ + PET 12μ + LLDPE 90μ', weightRange: '100～110g/m²' },
  ],
  'pet_ny_al': [
    { id: 'pet12_ny16_al7_ldpe90', name: '標準', thickness: 'PET 12μ + NY 16μ + AL 7μ + LLDPE 90μ', weightRange: '110～120g/m²' },
  ],
  'kraft_vmpet_lldpe': [
    { id: 'kraft50_vmpet12_lldpe90', name: '標準', thickness: 'Kraft 50g/m² + VMPET 12μ + LLDPE 90μ', weightRange: '130～140g/m²' },
  ],
  'kraft_pet_lldpe': [
    { id: 'kraft50_pet12_lldpe70', name: '標準', thickness: 'Kraft 50g/m² + PET 12μ + LLDPE 70μ', weightRange: '120～130g/m²' },
  ],
};

async function migrateQuotations() {
  console.log('='.repeat(60));
  console.log('Quotation Specifications Migration');
  console.log('='.repeat(60));
  console.log('');

  // すべての見積もりを取得
  console.log('1. Fetching quotations...');
  const { data: quotations, error: fetchError } = await supabase
    .from('quotation_items')
    .select('id, quotation_id, specifications')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('ERROR: Failed to fetch quotations:', fetchError.message);
    process.exit(1);
  }

  console.log(`   Found ${quotations.length} quotation items`);
  console.log('');

  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of quotations) {
    const specs = item.specifications || item.breakdown?.specifications;
    if (!specs) {
      skippedCount++;
      continue;
    }

    // 更新が必要かチェック
    const needsUpdate =
      !specs.printing_display ||
      !specs.colors ||
      specs.zipper === undefined ||
      !specs.weight_range;

    if (!needsUpdate) {
      skippedCount++;
      continue;
    }

    // 新しいフィールドを構築
    const updates = {};

    // printing_display
    if (!specs.printing_display && specs.printingType) {
      updates.printing_display = specs.printingType === 'digital'
        ? 'デジタル印刷'
        : specs.printingType === 'gravure'
          ? 'グラビア印刷'
          : specs.printingType === 'uv'
            ? 'UV印刷'
            : undefined;
    }

    // colors
    if (!specs.colors && specs.printingColors !== undefined) {
      updates.colors = specs.printingColors ? 'フルカラー' : undefined;
    }

    // zipper
    if (specs.zipper === undefined && specs.postProcessingOptions) {
      updates.zipper = specs.postProcessingOptions.some(opt =>
        opt.includes('zipper-yes') || opt.includes('zipper')
      );
    }

    // weight_range
    if (!specs.weight_range && specs.materialId && specs.thicknessSelection) {
      const options = MATERIAL_THICKNESS_OPTIONS[specs.materialId];
      const option = options?.find(opt => opt.id === specs.thicknessSelection);
      if (option?.weightRange) {
        updates.weight_range = option.weightRange;
      }
    }

    if (Object.keys(updates).length === 0) {
      skippedCount++;
      continue;
    }

    // specifications を更新
    const newSpecs = { ...specs, ...updates };

    // データベースを更新
    const { error: updateError } = await supabase
      .from('quotation_items')
      .update({ specifications: newSpecs })
      .eq('id', item.id);

    if (updateError) {
      console.error(`   ERROR: Failed to update item ${item.id}:`, updateError.message);
    } else {
      console.log(`   Updated item ${item.id} (${item.quotation_id})`);
      updatedCount++;
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Updated: ${updatedCount} items`);
  console.log(`Skipped: ${skippedCount} items`);
  console.log('');
  console.log('Migration completed successfully!');
  console.log('='.repeat(60));
}

// 実行
migrateQuotations().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
