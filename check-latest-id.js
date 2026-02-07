/**
 * Get latest quotation ID
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();
      value = value.replace(/^[\"']|[\"']$/g, '');
      process.env[key] = value;
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getLatestId() {
  const { data, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, total_amount')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    const quote = data[0];
    console.log('Latest Quotation:');
    console.log('ID:', quote.id);
    console.log('Quotation Number:', quote.quotation_number);
    console.log('Total Amount:', quote.total_amount);
  }
}

getLatestId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
