require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTotalCostBreakdown() {
  const { data: quotations, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, total_amount, total_cost_breakdown, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Latest 10 Quotations - Total Cost Breakdown ===');
  quotations.forEach((q, i) => {
    const hasCostBreakdown = q.total_cost_breakdown && Object.keys(q.total_cost_breakdown).length > 0;
    const hasValues = hasCostBreakdown && Object.values(q.total_cost_breakdown).some(v => v && v > 0);
    console.log(`${i + 1}. [${q.quotation_number}] Total: ${q.total_amount}`);
    console.log(`    Total Cost Breakdown: ${hasValues ? 'HAS VALUES' : (hasCostBreakdown ? 'ALL ZERO' : 'NO/EMPTY')}`);
    if (hasCostBreakdown) {
      console.log('    ', JSON.stringify(q.total_cost_breakdown));
    }
  });
}

checkTotalCostBreakdown().then(() => process.exit(0));
