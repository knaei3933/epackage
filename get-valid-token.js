require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function getValidToken() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  // Get token for order with files
  const orderId = '87615c70-bd89-411f-aaf9-9611e72d13a3';

  const { data, error } = await supabase
    .from('designer_task_assignments')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error || !data) {
    console.log('No existing token found. Creating new one...');
    
    // Need to use the format from email - use hex format
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex'); // 40 character hex string
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data: newData, error: newError } = await supabase
      .from('designer_task_assignments')
      .upsert({
        order_id: orderId,
        access_token_hash: tokenHash,
        access_token_expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
        status: 'in_progress'
      })
      .select()
      .single();

    if (newError) {
      console.error('Error creating token:', newError);
      process.exit(1);
    }

    console.log('\n=== New Token Created ===');
    console.log('Order ID:', orderId);
    console.log('Token:', token);
    console.log('Expires:', expiresAt.toISOString());
    console.log('\nDesigner URL:');
    console.log(`http://localhost:3000/designer-order/${token}`);
  } else {
    console.log('\n=== Existing Token Found ===');
    console.log('Order ID:', data.order_id);
    console.log('Token Hash:', data.access_token_hash);
    console.log('Expires:', data.access_token_expires_at);
    console.log('\nNote: Actual token is not stored in DB, only hash');
    console.log('Need to generate a new token');
  }
}

getValidToken().catch(console.error);
