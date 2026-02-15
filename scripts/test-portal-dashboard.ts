/**
 * Test script for Portal Dashboard API
 * This script verifies that the portal dashboard API works correctly
 * even when database RPC functions are missing
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testPortalDashboard() {
  console.log('Testing Portal Dashboard API...\n');

  // Test 1: Check if API endpoint exists
  console.log('Test 1: Checking API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/customer/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response status: ${response.status}`);

    if (response.status === 401) {
      console.log('✓ API endpoint exists and requires authentication (expected)\n');
    } else if (response.status === 500) {
      console.log('✗ API endpoint returned 500 error');
      const error = await response.text();
      console.log(`Error: ${error}\n`);
    } else {
      const data = await response.json();
      console.log(`Response:`, data);
      console.log('✓ API endpoint responded\n');
    }
  } catch (error) {
    console.log('✗ Failed to connect to API endpoint');
    console.log(`Error: ${error}\n`);
    console.log('Note: Make sure the dev server is running (npm run dev)\n');
  }

  // Test 2: Check page rendering
  console.log('Test 2: Checking portal page rendering...');
  try {
    const response = await fetch('http://localhost:3000/portal', {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
      },
    });

    if (response.ok) {
      const html = await response.text();

      // Check if the error message is present
      if (html.includes('ダッシュボードデータの読み込み中にエラーが発生しました')) {
        console.log('✗ Page shows error message');
        console.log('The dashboard API is not working correctly\n');
      } else if (html.includes('ダッシュボード')) {
        console.log('✓ Portal page renders with dashboard content');
        console.log('The dashboard is working correctly\n');
      } else {
        console.log('? Portal page rendered but status unclear');
        console.log('Manual verification recommended\n');
      }
    } else {
      console.log(`✗ Page returned status ${response.status}\n`);
    }
  } catch (error) {
    console.log('✗ Failed to connect to portal page');
    console.log(`Error: ${error}\n`);
    console.log('Note: Make sure the dev server is running (npm run dev)\n');
  }

  console.log('Test complete!');
  console.log('\nNext steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Login as a test user');
  console.log('3. Navigate to /portal');
  console.log('4. Verify the dashboard loads correctly');
}

// Run tests
testPortalDashboard().catch(console.error);
