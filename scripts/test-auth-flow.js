#!/usr/bin/env node

/**
 * Simple test script to verify authentication flow
 * Tests the signin API endpoint directly
 */

const TEST_EMAIL = 'member@test.com';
const TEST_PASSWORD = 'Member1234!';
const API_URL = 'http://localhost:3000';

async function testSignin() {
  console.log('=== Testing Signin API ===');
  console.log('Email:', TEST_EMAIL);
  console.log('API URL:', `${API_URL}/api/auth/signin/`);

  try {
    const response = await fetch(`${API_URL}/api/auth/signin/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('set-')) {
        console.log(`  ${key}: ${value}`);
      }
    });

    const data = await response.json();
    console.log('\nResponse body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('User ID:', data.user?.id);
      console.log('Profile role:', data.profile?.role);
      console.log('Profile status:', data.profile?.status);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.error);
    }

    // Get all cookies from response
    const setCookieHeaders = response.headers.getSetCookie();
    console.log('\nSet-Cookie headers:', setCookieHeaders.length);
    setCookieHeaders.forEach(header => {
      console.log('  ', header);
    });

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

async function testSession() {
  console.log('\n\n=== Testing Session API ===');
  console.log('API URL:', `${API_URL}/api/auth/session/`);

  try {
    const response = await fetch(`${API_URL}/api/auth/session/`, {
      method: 'GET',
      credentials: 'include',
    });

    console.log('\nResponse status:', response.status);

    const data = await response.json();
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (data.session?.user) {
      console.log('\n✅ Session valid!');
      console.log('User ID:', data.session.user.id);
      console.log('Email:', data.session.user.email);
      console.log('Profile role:', data.profile?.role);
    } else {
      console.log('\n❌ No valid session');
    }
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run tests
async function main() {
  await testSignin();
  await testSession();
}

main().catch(console.error);
