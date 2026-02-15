import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPdfUrls() {
  // Check recent quotations for pdf_url
  const { data, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, pdf_url, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Recent Quotations PDF URL Status ===\n');
  data.forEach((q, i) => {
    console.log(`[${i+1}] ${q.quotation_number}`);
    console.log(`  ID: ${q.id}`);
    console.log(`  PDF URL: ${q.pdf_url || 'NULL (not saved)'}`);
    console.log(`  Created: ${q.created_at}`);
    console.log('');
  });
}

checkPdfUrls().then(() => process.exit(0));
