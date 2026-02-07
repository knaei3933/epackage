/**
 * Admin Notifications API Test Script
 * 管理通知APIのテストスクリプト
 */

const BASE_URL = 'http://localhost:3001';

// Test credentials
const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASSWORD = 'Admin123!';

let cookies = '';
let testNotificationId = null;

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
    // redirect: 'manual' to get the cookies from login response
  });

  // Extract cookies from response
  const setCookieHeaders = response.headers.getSetCookie();
  console.log('Set-Cookie headers:', setCookieHeaders);

  if (setCookieHeaders && setCookieHeaders.length > 0) {
    // Extract relevant cookies (Supabase auth tokens use project-specific names)
    const extractedCookies = setCookieHeaders
      .map(header => {
        const cookieValue = header.split(';')[0];
        const name = cookieValue.split('=')[0];
        return { name, value: cookieValue };
      })
      .filter(cookie => {
        // Match Supabase auth cookies: sb-{project-ref}-auth-token, sb-{project-ref}-refresh-token
        return (cookie.name.startsWith('sb-') && (cookie.name.includes('-auth-token') || cookie.name.includes('-refresh-token'))) ||
               cookie.name.includes('dev-mock-user-id');
      });

    // Build cookie string for subsequent requests
    cookies = extractedCookies.map(c => c.value).join('; ');
    console.log('Extracted cookies:', cookies.split('; ').map(c => c.split('=')[0]));
  }

  const data = await response.json();
  return { status: response.status, data };
}

// Test login
async function testLogin() {
  console.log('\n=== Testing Login ===');
  const result = await apiRequest('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  console.log('Login Status:', result.status);
  console.log('Cookies set:', cookies ? 'Yes' : 'No');

  if (result.data.success) {
    console.log('Login successful!');
    return true;
  }

  console.log('Login failed:', result.data.error);
  return false;
}

// Test list notifications
async function testListNotifications() {
  console.log('\n=== Testing List Notifications ===');
  const result = await apiRequest('/api/admin/notifications?limit=10');

  console.log('List Status:', result.status);
  if (result.status === 200) {
    console.log('Notifications count:', result.data.data?.notifications?.length || 0);
  } else {
    console.log('Error:', result.data.error);
  }
  return result.data;
}

// Test create notification
async function testCreateNotification() {
  console.log('\n=== Testing Create Notification ===');
  const result = await apiRequest('/api/admin/notifications/create', {
    method: 'POST',
    body: JSON.stringify({
      title: 'テスト通知',
      message: 'これはテスト通知です。\n管理画面から作成されました。',
      type: 'system',
      priority: 'normal',
    }),
  });

  console.log('Create Status:', result.status);

  if (result.data.success) {
    console.log('Create successful!');
    if (result.data.data.notification) {
      testNotificationId = result.data.data.notification.id;
      console.log('Created notification ID:', testNotificationId);
    }
  } else {
    console.log('Error:', result.data.error);
  }

  return result.data;
}

// Test update notification
async function testUpdateNotification() {
  if (!testNotificationId) {
    console.log('\n=== Skipping Update Notification (no ID) ===');
    return;
  }

  console.log('\n=== Testing Update Notification ===');
  const result = await apiRequest(`/api/admin/notifications/${testNotificationId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: 'テスト通知（更新）',
      message: 'これは更新されたテスト通知です。',
      priority: 'high',
    }),
  });

  console.log('Update Status:', result.status);

  if (result.data.success) {
    console.log('Update successful!');
  } else {
    console.log('Error:', result.data.error);
  }

  return result.data;
}

// Test mark as read
async function testMarkAsRead() {
  if (!testNotificationId) {
    console.log('\n=== Skipping Mark As Read (no ID) ===');
    return;
  }

  console.log('\n=== Testing Mark As Read ===');
  const result = await apiRequest(`/api/admin/notifications/${testNotificationId}/read`, {
    method: 'PATCH',
  });

  console.log('Mark As Read Status:', result.status);

  if (result.data.success) {
    console.log('Mark as read successful!');
  } else {
    console.log('Error:', result.data.error);
  }

  return result.data;
}

// Test delete notification
async function testDeleteNotification() {
  if (!testNotificationId) {
    console.log('\n=== Skipping Delete Notification (no ID) ===');
    return;
  }

  console.log('\n=== Testing Delete Notification ===');
  const result = await apiRequest(`/api/admin/notifications/${testNotificationId}`, {
    method: 'DELETE',
  });

  console.log('Delete Status:', result.status);

  if (result.data.success) {
    console.log('Delete successful!');
  } else {
    console.log('Error:', result.data.error);
  }

  return result.data;
}

// Run all tests
async function runTests() {
  console.log('========================================');
  console.log('Admin Notifications API Test Suite');
  console.log('========================================');

  try {
    // Login first
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('\n=== Login Failed - Skipping Remaining Tests ===');
      return;
    }

    // List notifications
    await testListNotifications();

    // Create notification
    await testCreateNotification();

    // Update notification
    await testUpdateNotification();

    // Mark as read
    await testMarkAsRead();

    // List again to verify changes
    await testListNotifications();

    // Delete notification
    await testDeleteNotification();

    // Final list to verify deletion
    await testListNotifications();

    console.log('\n========================================');
    console.log('All tests completed!');
    console.log('========================================');
  } catch (error) {
    console.error('\n=== Test Error ===');
    console.error(error);
  }
}

// Run the tests
runTests();
