/**
 * Check quotation by number
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
      value = value.replace(/^[\"']|[\"']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkQuotation() {
  // Get latest quotation
  const { data: quote, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Latest Quotation ===');
  console.log('ID:', quote.id);
  console.log('Quotation Number:', quote.quotation_number);
  console.log('Subtotal Amount:', quote.subtotal_amount);
  console.log('Tax Amount:', quote.tax_amount);
  console.log('Total Amount:', quote.total_amount);
  console.log('Created At:', quote.created_at);

  // Get items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  console.log('\n=== Quotation Items ===');
  if (items) {
    items.forEach((item, i) => {
      console.log('Item ' + (i+1) + ':');
      console.log('  Product Name:', item.product_name);
      console.log('  Quantity:', item.quantity);
      console.log('  Unit Price:', item.unit_price);
      console.log('  Specifications:', JSON.stringify(item.specifications, null, 2));
    });
  }
}

checkQuotation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
