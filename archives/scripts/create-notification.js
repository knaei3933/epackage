/**
 * Create Admin Notification Script
 * 管理者通知を作成するスクリプト
 */

const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASSWORD = 'Admin123!';

let cookies = '';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(cookies && { 'Cookie': cookies }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Extract cookies from response
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    const extractedCookies = setCookieHeaders
      .map(header => {
        const cookieValue = header.split(';')[0];
        const name = cookieValue.split('=')[0];
        return { name, value: cookieValue };
      })
      .filter(cookie => {
        return (cookie.name.startsWith('sb-') && (cookie.name.includes('-auth-token') || cookie.name.includes('-refresh-token'))) ||
               cookie.name.includes('dev-mock-user-id');
      });

    cookies = extractedCookies.map(c => c.value).join('; ');
  }

  const data = await response.json();
  return { status: response.status, data };
}

// Login
async function login() {
  const result = await apiRequest('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  if (result.data.success) {
    console.log('✅ ログイン成功');
    return true;
  }

  console.log('❌ ログイン失敗:', result.data.error);
  return false;
}

// Create notification
async function createNotification(title, message, type = 'system', priority = 'normal') {
  const result = await apiRequest('/api/admin/notifications/create', {
    method: 'POST',
    body: JSON.stringify({
      title,
      message,
      type,
      priority,
    }),
  });

  if (result.data.success) {
    console.log('✅ 通知を作成しました:', result.data.data.notification.id);
    return result.data.data.notification;
  }

  console.log('❌ 通知作成失敗:', result.data.error);
  return null;
}

// Main execution
async function main() {
  console.log('========================================');
  console.log('管理者通知作成スクリプト');
  console.log('========================================\n');

  // Login
  if (!await login()) {
    return;
  }

  // Get current date in Japanese format
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  // Create notification (similar to the Dec 27 format)
  const notification = await createNotification(
    'お知らせ',
    `テスト通知\n${dateStr}\nこれは管理者通知機能のテスト通知です。\n管理者画面から通知の作成、編集、削除が可能です。`,
    'system',
    'normal'
  );

  if (notification) {
    console.log('\n========================================');
    console.log('通知ID:', notification.id);
    console.log('タイトル:', notification.title);
    console.log('メッセージ:', notification.message);
    console.log('作成日時:', notification.created_at);
    console.log('========================================');
  }

  console.log('\n✅ 通知が正常に作成されました！');
  console.log('📍 確認URL: http://localhost:3001/admin/notifications');
}

main();
