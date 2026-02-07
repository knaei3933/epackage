const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAllQuotations() {
  // Get recent quotations
  const { data: quotations, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log('=== Recent Quotations ===');
  for (const q of quotations) {
    console.log(`\n${q.quotation_number} (${q.id})`);

    const { data: items } = await supabase
      .from('quotation_items')
      .select('specifications')
      .eq('quotation_id', q.id);

    if (items && items.length > 0) {
      const specs = typeof items[0].specifications === 'string'
        ? JSON.parse(items[0].specifications)
        : items[0].specifications;

      const postProcessingOptions = specs.postProcessingOptions || [];
      console.log('  postProcessingOptions:', JSON.stringify(postProcessingOptions));

      // Map to expected PDF output
      const mapping = {
        ziplock: postProcessingOptions.includes('zipper-yes'),
        notch: postProcessingOptions.includes('notch-yes'),
        hangingHole: postProcessingOptions.includes('hang-hole-6mm') || postProcessingOptions.includes('hang-hole-8mm'),
        cornerRound: postProcessingOptions.includes('corner-round'),
        gasVent: postProcessingOptions.includes('valve-yes')
      };

      console.log('  Mapping:', JSON.stringify(mapping, null, 2));
      console.log('  Expected PDF:');
      console.log('    ジッパー付き:', mapping.ziplock ? '○' : '-');
      console.log('    ノッチなし:', !mapping.notch ? '○' : '-');
      console.log('    吊り下げ穴 (6mm):', mapping.hangingHole ? '○' : '-');
      console.log('    角直角:', !mapping.cornerRound ? '○' : '-');
      console.log('    ガス抜きバルブ:', mapping.gasVent ? '○' : '-');
    }
  }
}

debugAllQuotations();
