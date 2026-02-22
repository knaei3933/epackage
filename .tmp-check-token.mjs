import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient('https://ijlgpzjdfipzmjvawofp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58');

const testToken = crypto.randomBytes(32).toString('base64url').substring(0, 43);
const tokenHash = crypto.createHash('sha256').update(testToken).digest('hex');
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const result = await supabase
  .from('designer_task_assignments')
  .update({
    access_token_hash: tokenHash,
    access_token_expires_at: expiresAt.toISOString(),
  })
  .eq('order_id', '009b31e0-6014-40c7-8025-bc2b049169d0')
  .select('id')
  .single();

console.log('================================================');
console.log('TEST URL FOR DESIGNER ORDER PAGE');
console.log('================================================');
console.log('');
console.log('http://localhost:3008/designer-order/' + testToken);
console.log('');
console.log('This URL will display:');
console.log('✓ Korean: \"주문 상세 | 디자이너 포털\"');
console.log('✓ Order details: ORD-2026-MLWE7ZLV');
console.log('✓ Customer info and files');
console.log('✓ No authentication required');
console.log('');
console.log('Expires:', expiresAt.toISOString());
