/**
 * XServer SMTP Connection Test
 * XServer SMTP 연결 테스트 스크립트
 */

import * as nodemailer from 'nodemailer';

// XServer SMTP 설정
const XSERVER_SMTP_HOST = 'sv12515.xserver.jp';
const XSERVER_SMTP_PORT = 587;
const XSERVER_SMTP_USER = 'info@package-lab.com';
const XSERVER_SMTP_PASSWORD = 'vozlwl1109';
const FROM_EMAIL = 'info@package-lab.com';

async function testXServerSMTP() {
  console.log('=== XServer SMTP Connection Test ===\n');
  console.log('Host:', XSERVER_SMTP_HOST);
  console.log('Port:', XSERVER_SMTP_PORT);
  console.log('User:', XSERVER_SMTP_USER);
  console.log('');

  // Transporter 생성
  const transporter = nodemailer.createTransport({
    host: XSERVER_SMTP_HOST,
    port: XSERVER_SMTP_PORT,
    secure: false, // TLS
    auth: {
      user: XSERVER_SMTP_USER,
      pass: XSERVER_SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // 디버그 모드
    logger: true // 로그 활성화
  });

  console.log('Testing connection...');

  try {
    // 연결 테스트
    await transporter.verify();
    console.log('✅ SMTP Server connection successful!\n');

    // 테스트 이메일 발송
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Epackage Lab Test" <${FROM_EMAIL}>`,
      to: 'info@package-lab.com',
      subject: 'XServer SMTP Test - 테스트',
      text: 'This is a test email from XServer SMTP.\n\nXServer SMTP 테스트 이메일입니다.',
      html: `
        <h2>XServer SMTP Test</h2>
        <p>This is a test email from XServer SMTP.</p>
        <p><strong>XServer SMTP 테스트 이메일입니다.</strong></p>
        <hr>
        <p style="color: gray; font-size: 12px;">
          Sent at: ${new Date().toISOString()}<br>
          From: Epackage Lab Development Server
        </p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.command) {
      console.error('Failed Command:', error.command);
    }
    if (error.response) {
      console.error('Server Response:', error.response);
    }
  }
}

testXServerSMTP();
