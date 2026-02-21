/**
 * Insert Mock Google Refresh Token
 *
 * 開発用モックトークンをデータベースに挿入
 * 本番環境では使用しないでください
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertMockToken() {
  const adminUserId = process.env.GOOGLE_DRIVE_ADMIN_USER_ID;

  if (!adminUserId) {
    console.error('GOOGLE_DRIVE_ADMIN_USER_ID not set');
    process.exit(1);
  }

  // 本番環境では使用しないでください
  const mockRefreshToken = 'MOCK_REFRESH_TOKEN_FOR_DEVELOPMENT_DO_NOT_USE_IN_PRODUCTION';

  console.log('Inserting mock Google refresh token...');
  console.log('Admin User ID:', adminUserId);

  const { data, error } = await supabase
    .from('user_google_tokens')
    .upsert({
      user_id: adminUserId,
      refresh_token: mockRefreshToken,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error inserting mock token:', error);
    process.exit(1);
  }

  console.log('Mock token inserted successfully!');
  console.log('NOTE: This is a mock token for development only.');
  console.log('For production, complete the Google OAuth flow to get a real refresh token.');
}

insertMockToken().catch(console.error);
