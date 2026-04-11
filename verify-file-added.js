require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function verifyFile() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  const orderId = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';

  const { data: files } = await supabase
    .from('order_file_uploads')
    .select('*')
    .eq('order_id', orderId);

  console.log('\n=== Files in Order ===');
  console.log('Total files:', files?.length || 0);
  if (files) {
    files.forEach(f => {
      console.log(`- ${f.file_name} (ID: ${f.id.substring(0, 8)}...)`);
    });
  }

  // Check files table as well
  const { data: mainFiles } = await supabase
    .from('files')
    .select('*')
    .eq('order_id', orderId);

  console.log('\n=== Files in files table ===');
  console.log('Total files:', mainFiles?.length || 0);
}

verifyFile().catch(console.error);
