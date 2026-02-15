require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

const userId = 'cb2db082-cbb3-4a45-b413-01169f299bb4'; // test.feb.2026@gmail.com

(async () => {
  try {
    // 1. Update user email confirmation
    const { data: updateUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true,
        user_metadata: {
          // Keep existing metadata
          acquisition_channel: "web_search",
          business_type: "INDIVIDUAL",
          city: "千代田区千代田",
          corporate_phone: "03-1234-5678",
          email: "test.feb.2026@gmail.com",
          kana_first_name: "たろう",
          kana_last_name: "やまだ",
          kanji_first_name: "太郎",
          kanji_last_name: "山田",
          personal_phone: "090-1234-5678",
          postal_code: "1000001",
          prefecture: "東京都",
          product_category: "OTHER",
          street: "1-2-3",
        }
      }
    );

    if (updateError) {
      console.log('Error updating user:', updateError.message);
      return;
    }

    console.log('=== Email Confirmed ===');
    console.log('User ID:', userId);
    console.log('Email Confirmed At:', updateUser.user.email_confirmed_at);

    // 2. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('Error checking profile:', profileError.message);
    } else if (profile) {
      console.log('\n=== Profile Already Exists ===');
      console.log('Status:', profile.status);
      console.log('User Type:', profile.user_type);
    } else {
      console.log('\n=== Profile Not Found (Expected - will be created on email verification) ===');
    }

    console.log('\n=== Next Step ===');
    console.log('1. Visit http://localhost:3000/auth/signin');
    console.log('2. Login with test.feb.2026@gmail.com / Test1234!');
    console.log('3. Profile should be created automatically');

  } catch (e) {
    console.log('Exception:', e.message);
  }
})();
