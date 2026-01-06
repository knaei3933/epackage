// Admin creation script - run with: node scripts/create-admin.js

const http = require('http');

const data = JSON.stringify({
  email: 'admin@epackage-lab.com',
  password: 'Admin1234',
  kanjiLastName: '管理',
  kanjiFirstName: '者',
  kanaLastName: 'かんり',
  kanaFirstName: 'しゃ',
  businessType: 'CORPORATION',
  productCategory: 'OTHER'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Creating admin account...');

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', body);
    if (res.statusCode === 201) {
      console.log('\n✅ Admin account created!');
      console.log('📧 Email: admin@epackage-lab.com');
      console.log('🔑 Password: Admin1234');
      console.log('\n⚠️  Run this SQL in Supabase Dashboard > SQL Editor:');
      console.log("UPDATE profiles SET role = 'ADMIN', status = 'ACTIVE' WHERE email = 'admin@epackage-lab.com';");
      console.log('\nThen login at: http://localhost:3000/signin');
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
