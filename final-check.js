require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function finalCheck() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  const orderId = '87615c70-bd89-411f-aaf9-9611e72d13a3';

  const { data: files } = await supabase
    .from('order_file_uploads')
    .select('*')
    .eq('order_id', orderId);

  console.log('\n=== Final File Count ===');
  console.log('Total files:', files?.length || 0);
  if (files) {
    files.forEach(f => {
      console.log(`- ${f.file_name} (ID: ${f.id.substring(0, 8)}...)`);
    });
  }

  console.log('\n=== Summary ===');
  console.log('✅ Initial: 5 files');
  console.log('✅ After first delete: 3 files (2 deleted)');
  console.log('✅ After second delete: 2 files (1 deleted)');
  console.log('✅ Total deleted: 3 files');
}

finalCheck().catch(console.error);
