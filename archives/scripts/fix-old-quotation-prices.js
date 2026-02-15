/**
 * Fix old quotation prices to 100-yen rounding
 *
 * This script updates quotations that were saved with 10-yen rounding
 * to use 100-yen rounding instead.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local file
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('Loading env from:', envLocalPath);
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    // Skip empty lines and comments
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      // Remove quotes if present
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
      // Debug logging
      if (key === 'NEXT_PUBLIC_SUPABASE_URL' || key === 'SUPABASE_SERVICE_ROLE_KEY') {
        console.log(`  ${key} = ${value.substring(0, 20)}...`);
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'missing');
  process.exit(1);
}

console.log('Environment loaded successfully');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixQuotationPrices() {
  console.log('========================================');
  console.log('Old Quotation Price Fix (100-yen rounding)');
  console.log('========================================\n');

  // Step 1: Fix quotation_items (unit_price)
  console.log('Step 1: Fixing quotation_items unit_price...\n');
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('id, unit_price')
    .order('created_at', { ascending: false })
    .limit(100);

  if (itemsError) {
    console.error('Error fetching quotation_items:', itemsError);
    return;
  }

  let itemsFixedCount = 0;
  let itemsSkippedCount = 0;

  for (const item of items || []) {
    const currentUnitPrice = Number(item.unit_price);
    const roundedUnitPrice = Math.round(currentUnitPrice / 100) * 100;

    if (currentUnitPrice !== roundedUnitPrice) {
      const { error: updateError } = await supabase
        .from('quotation_items')
        .update({ unit_price: roundedUnitPrice })
        .eq('id', item.id);

      if (!updateError) {
        itemsFixedCount++;
      }
    } else {
      itemsSkippedCount++;
    }
  }

  console.log(`  Fixed: ${itemsFixedCount} items`);
  console.log(`  Skipped: ${itemsSkippedCount} items\n`);

  // Step 2: Fix quotations (totals)
  console.log('Step 2: Fixing quotations totals...\n');
  const { data: quotations, error: fetchError } = await supabase
    .from('quotations')
    .select('id, quotation_number, subtotal_amount, tax_amount, total_amount')
    .order('created_at', { ascending: false })
    .limit(50);

  if (fetchError) {
    console.error('Error fetching quotations:', fetchError);
    return;
  }

  console.log(`Found ${quotations?.length || 0} quotations\n`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const quote of quotations || []) {
    const currentSubtotal = Number(quote.subtotal_amount);
    const currentTax = Number(quote.tax_amount);
    const currentTotal = Number(quote.total_amount);

    // Check if values need rounding to 100-yen units
    const roundedSubtotal = Math.round(currentSubtotal / 100) * 100;
    const roundedTax = Math.round(currentTax); // Tax to nearest yen
    const roundedTotal = Math.round((roundedSubtotal + roundedTax) / 100) * 100;

    const needsFix =
      currentSubtotal !== roundedSubtotal ||
      currentTax !== roundedTax ||
      currentTotal !== roundedTotal;

    if (needsFix) {
      console.log(`Fixing ${quote.quotation_number}:`);
      console.log(`  Before: subtotal=${currentSubtotal}, tax=${currentTax}, total=${currentTotal}`);
      console.log(`  After:  subtotal=${roundedSubtotal}, tax=${roundedTax}, total=${roundedTotal}`);

      const { error: updateError } = await supabase
        .from('quotations')
        .update({
          subtotal_amount: roundedSubtotal,
          tax_amount: roundedTax,
          total_amount: roundedTotal,
        })
        .eq('id', quote.id);

      if (updateError) {
        console.error(`  ❌ Error: ${updateError.message}`);
      } else {
        console.log(`  ✅ Fixed!`);
        fixedCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Summary:`);
  console.log(`  Items fixed: ${itemsFixedCount}`);
  console.log(`  Quotations fixed: ${fixedCount}`);
  console.log(`  Quotations skipped: ${skippedCount} (already correct)`);
  console.log('========================================');
}

fixQuotationPrices()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
