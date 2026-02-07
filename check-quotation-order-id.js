require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const quotationId = 'bffdc241-df47-4592-8cd2-5951b5a05a52';
  
  const { data: quotation } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', quotationId)
    .single();
  
  console.log('Quotation order_id:', quotation?.order_id);
  console.log('Quotation keys:', Object.keys(quotation || {}));
}

check().then(() => process.exit(0));
