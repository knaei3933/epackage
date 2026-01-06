/**
 * Simple test script to check auth API endpoints
 */

async function testAuthAPI() {
  console.log('=== Testing Auth API Endpoints ===\n');

  // Test 1: Signin endpoint
  console.log('1. Testing POST /api/auth/signin');
  let cookies = '';
  try {
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'member@test.com',
        password: 'Member1234!',
      }),
    });

    console.log('   Status:', signinResponse.status);
    const signinData = await signinResponse.json();
    console.log('   Response:', JSON.stringify(signinData, null, 2));

    // Get cookies from response
    const setCookie = signinResponse.headers.get('set-cookie');
    console.log('   Set-Cookie headers:', setCookie ? 'Found' : 'None');

    if (setCookie) {
      // Parse cookies to extract the cookie values (without attributes)
      const cookieArray = setCookie.split(', ').map(header => {
        const cookieValue = header.split(';')[0];
        return cookieValue;
      });

      console.log('   Cookies extracted:', cookieArray);
      cookies = cookieArray.join('; ');
    }

    // Test 2: Session endpoint (with cookies)
    console.log('\n2. Testing GET /api/auth/session (WITH cookies)');
    console.log('   Cookie header:', cookies.substring(0, 100) + '...');

    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        'Cookie': cookies,
      },
    });

    console.log('   Status:', sessionResponse.status);
    const sessionData = await sessionResponse.json();
    console.log('   Response:', JSON.stringify(sessionData, null, 2));

    if (sessionData.session) {
      console.log('\n✅ SUCCESS: Session API returns session data');
    } else {
      console.log('\n❌ FAIL: Session API returns null session');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testAuthAPI();
