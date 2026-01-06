/**
 * Simple script to test registration API directly
 */

async function testRegistration() {
  const apiUrl = 'http://localhost:3000/api/auth/register';

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    passwordConfirm: 'TestPassword123!',
    kanjiLastName: '山田',     // Kanji (한자)
    kanjiFirstName: '太郎',    // Kanji (한자)
    kanaLastName: 'やまだ',    // Hiragana (히라가나)
    kanaFirstName: 'たろう',   // Hiragana (히라가나)
    corporatePhone: '',
    personalPhone: '',
    businessType: 'INDIVIDUAL',
    companyName: '',
    legalEntityNumber: '',
    position: '',
    department: '',
    companyUrl: '',
    productCategory: 'OTHER',
    acquisitionChannel: '',
    postalCode: '',
    prefecture: '',
    city: '',
    street: '',
    privacyConsent: true,
  };

  console.log('Testing registration with data:', JSON.stringify(testUser, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response as text first
    const text = await response.text();
    console.log('Response text:', text);

    if (text) {
      try {
        const result = JSON.parse(text);
        console.log('Parsed JSON:', JSON.stringify(result, null, 2));

        if (response.ok) {
          console.log('✅ Registration successful!');
        } else {
          console.log('❌ Registration failed!');
          if (result.details) {
            console.log('Validation errors:', result.details);
          }
        }
      } catch (e) {
        console.log('Response is not JSON:', text);
      }
    } else {
      console.log('Empty response body');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Wait for server to be ready then test
setTimeout(async () => {
  console.log('Testing registration API...');

  // First check if server is responding
  try {
    const healthCheck = await fetch('http://localhost:3000');
    console.log('Server health check status:', healthCheck.status);
  } catch (e) {
    console.log('Server not reachable:', e);
  }

  await testRegistration();
}, 3000);
