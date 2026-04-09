/**
 * Update "カスタム製品" product names to meaningful names from specifications
 *
 * 既存のorder_itemsとquotation_itemテーブルの「カスタム製品」という製品名を
 * 仕様から生成した意味のある名前に更新するスクリプト
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease ensure .env.local file exists with these variables.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// Helper Functions
// =====================================================

function getBagTypeName(bagTypeId: string): string {
  const names: Record<string, string> = {
    flat_3_side: '三方シール平袋',
    stand_up: 'スタンドパウチ',
    gazette: 'ガゼットパウチ',
    roll_film: 'ロールフィルム',
    spout_pouch: 'スパウトパウチ',
    zipper_pouch: 'チャック付袋',
  };
  return names[bagTypeId] || bagTypeId || '';
}

function getMaterialName(materialId: string): string {
  const materialMap: Record<string, string> = {
    pet_al: 'PET/AL',
    pet_pe: 'PET/PE',
    cpp: 'CPP',
    lldpe: 'LLDPE',
  };
  return materialMap[materialId] || '';
}

function getSealWidthLabel(value: string): string {
  const labels: Record<string, string> = {
    '5mm': '5mm',
    '7.5mm': '7.5mm',
    '10mm': '10mm',
  };
  return labels[value] || value || '';
}

/**
 * 仕様情報から適切な商品名を生成
 */
function generateProductName(specifications: any): string {
  if (!specifications || Object.keys(specifications).length === 0) {
    return 'カスタム製品';
  }

  const parts: string[] = [];

  // タイプ（袋の種類）
  if (specifications.bagTypeId) {
    const typeMap: Record<string, string> = {
      flat_3_side: '三方シール平袋',
      stand_up: 'スタンドパウチ',
      gazette: 'ガゼットパウチ',
      roll_film: 'ロールフィルム',
      spout_pouch: 'スパウトパウチ',
      zipper_pouch: 'チャック付袋',
    };
    const bagName = typeMap[specifications.bagTypeId];
    if (bagName) parts.push(bagName);
  }

  // 素材構成
  if (specifications.materialId) {
    const materialMap: Record<string, string> = {
      pet_al: 'PET/AL',
      pet_pe: 'PET/PE',
      cpp: 'CPP',
      lldpe: 'LLDPE',
    };
    const matName = materialMap[specifications.materialId];
    if (matName) parts.push(matName);
  }

  // シール幅
  if (specifications.sealWidth) {
    parts.push(getSealWidthLabel(specifications.sealWidth));
  }

  // その他オプション
  if (specifications.doubleSided) {
    parts.push('両面印刷');
  }

  return parts.length > 0 ? parts.join('・') : 'カスタム製品';
}

// =====================================================
// Main Function
// =====================================================

async function main() {
  console.log('=== Starting product name update ===\n');

  // Update order_items
  console.log('Processing order_items...');
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select('id, product_name, specifications')
    .eq('product_name', 'カスタム製品');

  if (orderItemsError) {
    console.error('Error fetching order_items:', orderItemsError.message);
    return;
  }

  console.log(`Found ${orderItems?.length || 0} order_items with "カスタム製品"`);

  let orderUpdated = 0;
  let orderSkipped = 0;

  for (const item of orderItems || []) {
    if (!item.specifications || Object.keys(item.specifications).length === 0) {
      console.log(`  Skipping ${item.id} - no specifications`);
      orderSkipped++;
      continue;
    }

    const newName = generateProductName(item.specifications);
    if (newName === 'カスタム製品') {
      console.log(`  Skipping ${item.id} - could not generate meaningful name`);
      orderSkipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('order_items')
      .update({ product_name: newName })
      .eq('id', item.id);

    if (updateError) {
      console.error(`  Failed to update ${item.id}:`, updateError.message);
    } else {
      orderUpdated++;
      console.log(`  Updated ${item.id}: "${item.product_name}" → "${newName}"`);
    }
  }

  console.log(`\nOrder items: ${orderUpdated} updated, ${orderSkipped} skipped\n`);

  // Update quotation_items
  console.log('Processing quotation_items...');
  const { data: quoteItems, error: quoteItemsError } = await supabase
    .from('quotation_items')
    .select('id, product_name, specifications')
    .eq('product_name', 'カスタム製品');

  if (quoteItemsError) {
    console.error('Error fetching quotation_item:', quoteItemsError.message);
    return;
  }

  console.log(`Found ${quoteItems?.length || 0} quotation_item with "カスタム製品"`);

  let quoteUpdated = 0;
  let quoteSkipped = 0;

  for (const item of quoteItems || []) {
    if (!item.specifications || Object.keys(item.specifications).length === 0) {
      console.log(`  Skipping ${item.id} - no specifications`);
      quoteSkipped++;
      continue;
    }

    const newName = generateProductName(item.specifications);
    if (newName === 'カスタム製品') {
      console.log(`  Skipping ${item.id} - could not generate meaningful name`);
      quoteSkipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('quotation_items')
      .update({ product_name: newName })
      .eq('id', item.id);

    if (updateError) {
      console.error(`  Failed to update ${item.id}:`, updateError.message);
    } else {
      quoteUpdated++;
      console.log(`  Updated ${item.id}: "${item.product_name}" → "${newName}"`);
    }
  }

  console.log(`\nQuotation items: ${quoteUpdated} updated, ${quoteSkipped} skipped\n`);

  // Summary
  console.log('=== Summary ===');
  console.log(`Order items: ${orderUpdated} updated, ${orderSkipped} skipped`);
  console.log(`Quotation items: ${quoteUpdated} updated, ${quoteSkipped} skipped`);
  console.log(`Total: ${orderUpdated + quoteUpdated} records updated`);
}

main().catch(console.error);
