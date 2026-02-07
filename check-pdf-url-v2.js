const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase
    .from('quotations')
    .select('quotation_number, pdf_url, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('=== Recent Quotations PDF URL Status ===\n');
    data.forEach((q, i) => {
      console.log(`[${i+1}] ${q.quotation_number}`);
      console.log(`  PDF URL: ${q.pdf_url || 'NULL (not saved)'}`);
      console.log(`  Created: ${q.created_at}`);
      console.log('');
    });
  }
  process.exit(0);
})();
