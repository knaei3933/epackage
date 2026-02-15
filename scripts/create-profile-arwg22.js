require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

const userId = 'd735b059-7395-4190-88d6-e0b32aa3f6f6';

(async () => {
  try {
    // Get user info
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('=== Creating profile for arwg22@gmail.com ===');

    const metadata = user.user_metadata || {};
    const businessType = metadata.business_type || 'INDIVIDUAL';
    const userType = businessType === 'CORPORATION' ? 'B2B' : 'B2C';

    // Create profile
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email,
        kanji_last_name: metadata.kanji_last_name || '',
        kanji_first_name: metadata.kanji_first_name || '',
        kana_last_name: metadata.kana_last_name || '',
        kana_first_name: metadata.kana_first_name || '',
        corporate_phone: metadata.corporate_phone || null,
        personal_phone: metadata.personal_phone || null,
        business_type: businessType,
        user_type: userType,
        company_name: metadata.company_name || null,
        legal_entity_number: metadata.legal_entity_number || null,
        position: metadata.position || null,
        department: metadata.department || null,
        company_url: metadata.company_url || null,
        product_category: metadata.product_category || null,
        acquisition_channel: metadata.acquisition_channel || null,
        postal_code: metadata.postal_code || null,
        prefecture: metadata.prefecture || null,
        city: metadata.city || null,
        street: metadata.street || null,
        role: 'MEMBER',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.log('Insert Error:', insertError.message);
      console.log('Details:', insertError);
      return;
    }

    console.log('\n=== Profile Created Successfully ===');
    console.log('ID:', profile.id);
    console.log('Name:', profile.kanji_last_name, profile.kanji_first_name);
    console.log('Email:', profile.email);
    console.log('Status:', profile.status);
    console.log('User Type:', profile.user_type);

    // Create delivery address
    const fullName = `${metadata.kanji_last_name || ''} ${metadata.kanji_first_name || ''}`.trim();
    const { error: deliveryError } = await supabase
      .from('delivery_addresses')
      .insert({
        user_id: userId,
        name: fullName,
        postal_code: metadata.postal_code || '',
        prefecture: metadata.prefecture || '',
        city: metadata.city || '',
        address: metadata.street || '',
        building: '',
        phone: metadata.corporate_phone || metadata.personal_phone || '',
        is_default: true,
      });

    if (deliveryError) {
      console.log('\nDelivery address error:', deliveryError.message);
    } else {
      console.log('\n✅ Delivery address created');
    }

    // Create billing address
    const { error: billingError } = await supabase
      .from('billing_addresses')
      .insert({
        user_id: userId,
        company_name: fullName,
        postal_code: metadata.postal_code || '',
        prefecture: metadata.prefecture || '',
        city: metadata.city || '',
        address: metadata.street || '',
        building: '',
        email: user.email,
        is_default: true,
      });

    if (billingError) {
      console.log('Billing address error:', billingError.message);
    } else {
      console.log('✅ Billing address created');
    }

    console.log('\n=== All Done! ===');
    console.log('User can now see their profile in admin approval list');

  } catch (e) {
    console.log('Exception:', e.message);
  }
})();
