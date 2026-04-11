require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function addTestFile() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  const orderId = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';

  // Add a test file
  const { data: newFile, error } = await supabase
    .from('order_file_uploads')
    .insert({
      order_id: orderId,
      file_name: 'test-delete-file.pdf',
      file_type: 'application/pdf',
      drive_file_id: 'test-drive-id',
      drive_view_link: 'https://drive.google.com/test',
      drive_content_link: 'https://drive.google.com/test-content',
      uploaded_at: new Date().toISOString(),
      uploaded_by: 'test-user'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding file:', error);
  } else {
    console.log('\n=== Test File Added ===');
    console.log('File ID:', newFile.id);
    console.log('File Name:', newFile.file_name);
    console.log('Order ID:', newFile.order_id);
  }
}

addTestFile().catch(console.error);
