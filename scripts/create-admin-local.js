/**
 * Admin Creation via Local API
 * Run: node scripts/create-admin-local.js
 */

const http = require('http');
const https = require('https');

const adminData = {
  email: 'admin@epackage-lab.com',
  password: 'Admin1234',
  kanjiLastName: '管理',
  kanjiFirstName: '者',
  kanaLastName: 'かんり',
  kanaFirstName: 'しゃ',
  businessType: 'CORPORATION',
  productCategory: 'OTHER'
};

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      rejectUnauthorized: false
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('\n🔐 Creating Admin Account via Local API\n');

  try {
    // Step 1: Register user
    console.log('1. Registering user...');
    const registerResult = await makeRequest('POST', '/api/auth/register', adminData);

    if (registerResult.status === 201 || registerResult.status === 409) {
      console.log('✅ User registered (or already exists)\n');
    } else {
      console.log('❌ Registration failed:', registerResult.data);
      return;
    }

    console.log('─────────────────────────────────────────────');
    console.log('✅ Account created!\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('─────────────────────────────────────────────\n');
    console.log('⚠️  Run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(`UPDATE profiles`);
    console.log(`SET role = 'ADMIN', status = 'ACTIVE'`);
    console.log(`WHERE email = '${adminData.email}';\n`);
    console.log('Then login at: http://localhost:3000/signin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
