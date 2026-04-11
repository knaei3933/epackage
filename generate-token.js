require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

async function generateToken() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(url, key);

  // Generate a random token
  const token = crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '').substring(0, 40);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Set expiry to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Use the first order with files
  const orderId = '87615c70-bd89-411f-aaf9-9611e72d13a3';

  // Update or insert token
  const { data, error } = await supabase
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

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('\n=== Token Generated Successfully ===');
  console.log('Order ID:', orderId);
  console.log('Token:', token);
  console.log('Expires:', expiresAt.toISOString());
  console.log('\nDesigner URL:');
  console.log(`http://localhost:3000/designer-order/${token}`);
}

generateToken().catch(console.error);
