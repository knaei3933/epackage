const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMapping() {
  const { data, error } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260203-2231')
    .single();

  if (error) {
    console.log('Error:', error);
    return;
  }

  const { data: items } = await supabase
    .from('quotation_items')
    .select('specifications')
    .eq('quotation_id', data.id)
    .single();

  const specs = typeof items.specifications === 'string'
    ? JSON.parse(items.specifications)
    : items.specifications;

  console.log('=== postProcessingOptions ===');
  console.log(JSON.stringify(specs.postProcessingOptions, null, 2));

  // Test the mapping logic
  const result = {
    ziplock: false,
    notch: false,
    hangingHole: false,
    cornerRound: false,
    gasVent: false,
    easyCut: false,
    embossing: false
  };

  const postProcessingOptions = specs.postProcessingOptions || [];

  console.log('\n=== Mapping Process ===');
  for (const optionId of postProcessingOptions) {
    console.log('Processing:', optionId);

    if (optionId === 'zipper-yes') {
      result.ziplock = true;
      console.log('  -> ziplock = true');
    } else if (optionId === 'notch-yes') {
      result.notch = true;
      console.log('  -> notch = true');
    } else if (optionId === 'hang-hole-6mm' || optionId === 'hang-hole-8mm') {
      if (!optionId.includes('hang-hole-no')) {
        result.hangingHole = true;
        console.log('  -> hangingHole = true');
      }
    } else if (optionId === 'corner-round') {
      result.cornerRound = true;
      console.log('  -> cornerRound = true');
    } else if (optionId === 'valve-yes') {
      if (!optionId.includes('valve-no')) {
        result.gasVent = true;
        console.log('  -> gasVent = true');
      }
    }
  }

  console.log('\n=== Final Result ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n=== Expected PDF Display ===');
  console.log('ジッパー付き:', result.ziplock ? '○' : '-');
  console.log('ノッチなし:', !result.notch ? '○' : '-');
  console.log('吊り下げ穴 (6mm):', result.hangingHole ? '○' : '-');
  console.log('角直角:', !result.cornerRound ? '○' : '-');
  console.log('ガス抜きバルブ:', result.gasVent ? '○' : '-');
}

testMapping();
