require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkQuotation() {
  // Check items for quotations that have cost_breakdown
  const { data: items, error } = await supabase
    .from('quotation_items')
    .select('id, quotation_id, product_name, cost_breakdown, specifications, quantity, unit_price')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Latest 20 Quotation Items ===');
  items.forEach((item, i) => {
    const hasCostBreakdown = item.cost_breakdown && Object.keys(item.cost_breakdown).length > 0;
    const hasValues = hasCostBreakdown && Object.values(item.cost_breakdown).some(v => v && v > 0);
    console.log(`${i + 1}. [${item.product_name}] Qty: ${item.quantity} Price: ${item.unit_price}`);
    console.log(`    Cost Breakdown: ${hasValues ? 'HAS VALUES' : (hasCostBreakdown ? 'ALL ZERO' : 'NO/EMPTY')}`);
    if (hasCostBreakdown) {
      console.log('    ', JSON.stringify(item.cost_breakdown));
    }
    // Show specifications
    if (item.specifications) {
      const specs = JSON.stringify(item.specifications);
      console.log(`    Specs: ${specs.substring(0, 100)}...`);
    }
  });
}

checkQuotation().then(() => process.exit(0));
