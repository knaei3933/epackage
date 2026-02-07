/**
 * Check latest quotation data in database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLatestQuotation() {
  console.log('Fetching latest quotation...\n');

  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No quotations found');
    return;
  }

  const quote = data[0];
  console.log('=== Latest Quotation ===');
  console.log('Quotation Number:', quote.quotation_number);
  console.log('Subtotal Amount:', quote.subtotal_amount);
  console.log('Tax Amount:', quote.tax_amount);
  console.log('Total Amount:', quote.total_amount);
  console.log('Created At:', quote.created_at);

  // Check items
  console.log('\n=== Quotation Items ===');
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  } else {
    items.forEach((item, index) => {
      console.log(`Item ${index + 1}:`);
      console.log('  Product Name:', item.product_name);
      console.log('  Quantity:', item.quantity);
      console.log('  Unit Price:', item.unit_price);
    });
  }
}

checkLatestQuotation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
