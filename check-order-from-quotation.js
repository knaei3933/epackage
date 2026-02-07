require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrder() {
  const quotationId = 'bffdc241-df47-4592-8cd2-5951b5a05a52';
  
  console.log('Checking orders for quotation:', quotationId);
  
  // Check orders table
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('quotation_id', quotationId);
  
  console.log('Orders found:', orders?.length || 0);
  if (orders && orders.length > 0) {
    console.log('Order:', orders[0].order_number, 'ID:', orders[0].id);
    console.log('Status:', orders[0].status);
    
    // Check order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orders[0].id);
    
    console.log('Order items:', orderItems?.length || 0);
  }
  console.log('Error:', error);
}

checkOrder().then(() => process.exit(0));
