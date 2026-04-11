require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

async function createCorrectToken() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  const orderId = '87615c70-bd89-411f-aaf9-9611e72d13a3';

  // Generate 43 character token matching /^[A-Za-z0-9_-]{43}$/
  // Use base64url encoding: base64 without padding, replace + with -, / with _
  const token = crypto.randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 43);

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data, error } = await supabase
    .from('designer_task_assignments')
    .update({
      access_token_hash: tokenHash,
      access_token_expires_at: expiresAt.toISOString(),
      last_accessed_at: new Date().toISOString()
    })
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating token:', error);
    process.exit(1);
  }

  console.log('\n=== Correct Token Created ===');
  console.log('Order ID:', orderId);
  console.log('Token:', token);
  console.log('Token Length:', token.length);
  console.log('Token Hash:', tokenHash);
  console.log('Expires:', expiresAt.toISOString());
  console.log('\nDesigner URL:');
  console.log(`http://localhost:3000/designer-order/${token}`);
  console.log('\nFiles in this order:');
  
  const { data: files } = await supabase
    .from('order_file_uploads')
    .select('*')
    .eq('order_id', orderId);
    
  if (files) {
    files.forEach(f => {
      console.log(`- ${f.file_name} (ID: ${f.id.substring(0, 8)}...)`);
    });
  }
}

createCorrectToken().catch(console.error);
