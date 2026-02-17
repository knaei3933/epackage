const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMarkup() {
  // kim@kanei-trade.co.jpのmarkup_rateを0.0に修正
  const { data, error } = await supabase
    .from('profiles')
    .update({ markup_rate: 0.0, markup_rate_note: null })
    .eq('email', 'kim@kanei-trade.co.jp')
    .select();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Updated kim@kanei-trade.co.jp markup_rate to 0.0');
    console.log('Data:', data);
  }

  // arwg22@gmail.comの確認
  const { data: arwg } = await supabase
    .from('profiles')
    .select('email, markup_rate, markup_rate_note')
    .eq('email', 'arwg22@gmail.com')
    .maybeSingle();
  
  if (arwg) {
    console.log('\narwg22@gmail.com:');
    console.log('- markup_rate:', arwg.markup_rate);
    console.log('- markup_rate_note:', arwg.markup_rate_note);
  }
}

fixMarkup();
