require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixFileType() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  const orderId = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';

  // Update the test file to have correct file_type
  const { data, error } = await supabase
    .from('order_file_uploads')
    .update({ file_type: 'upload' })
    .eq('order_id', orderId)
    .eq('file_name', 'test-delete-file.pdf')
    .select();

  if (error) {
    console.error('Error updating file:', error);
  } else {
    console.log('\n=== File Type Fixed ===');
    console.log('Updated files:', data?.length || 0);
    if (data) {
      data.forEach(f => {
        console.log(`- ${f.file_name} (type: ${f.file_type})`);
      });
    }
  }

  // Verify the update
  const { data: files } = await supabase
    .from('order_file_uploads')
    .select('*')
    .eq('order_id', orderId)
    .eq('file_type', 'upload');

  console.log('\n=== Files with file_type=upload ===');
  console.log('Total:', files?.length || 0);
}

fixFileType().catch(console.error);
