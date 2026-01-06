/**
 * Test Admin Notifications System
 *
 * This script tests the admin notification system by creating
 * sample notifications of each type.
 *
 * Usage:
 *   tsx scripts/test-admin-notifications.ts
 *
 * @module scripts/test-admin-notifications
 */

import {
  notifyNewOrder,
  notifyQuotationRequest,
  notifySampleRequest,
  notifyRegistrationRequest,
  notifyProductionComplete,
  notifyShipmentComplete,
  notifyContractSignature,
  notifySystemError,
  getAdminNotifications,
  getUnreadAdminNotificationCount,
} from '../src/lib/admin-notifications'

async function runTests() {
  console.log('🧪 Testing Admin Notifications System...\n')

  let passedTests = 0
  let failedTests = 0

  // Test 1: New Order Notification
  try {
    console.log('📦 Test 1: New Order Notification')
    const result = await notifyNewOrder(
      'test-order-id-1',
      'ORD-2026-001',
      'テスト顧客',
      100000
    )
    if (result) {
      console.log('✅ New order notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create new order notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in new order notification:', error)
    failedTests++
  }
  console.log('')

  // Test 2: Quotation Request Notification
  try {
    console.log('💰 Test 2: Quotation Request Notification')
    const result = await notifyQuotationRequest(
      'test-quotation-id-1',
      'QT-2026-001',
      'テスト顧客'
    )
    if (result) {
      console.log('✅ Quotation request notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create quotation request notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in quotation request notification:', error)
    failedTests++
  }
  console.log('')

  // Test 3: Sample Request Notification
  try {
    console.log('📋 Test 3: Sample Request Notification')
    const result = await notifySampleRequest(
      'test-sample-id-1',
      'テスト顧客',
      3
    )
    if (result) {
      console.log('✅ Sample request notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create sample request notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in sample request notification:', error)
    failedTests++
  }
  console.log('')

  // Test 4: Registration Request Notification
  try {
    console.log('👤 Test 4: Registration Request Notification')
    const result = await notifyRegistrationRequest(
      'test-user-id-1',
      'テストユーザー',
      'test@example.com'
    )
    if (result) {
      console.log('✅ Registration request notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create registration request notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in registration request notification:', error)
    failedTests++
  }
  console.log('')

  // Test 5: Production Complete Notification
  try {
    console.log('🏭 Test 5: Production Complete Notification')
    const result = await notifyProductionComplete(
      'test-order-id-2',
      'ORD-2026-002'
    )
    if (result) {
      console.log('✅ Production complete notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create production complete notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in production complete notification:', error)
    failedTests++
  }
  console.log('')

  // Test 6: Shipment Complete Notification
  try {
    console.log('🚚 Test 6: Shipment Complete Notification')
    const result = await notifyShipmentComplete(
      'test-shipment-id-1',
      'ORD-2026-003'
    )
    if (result) {
      console.log('✅ Shipment complete notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create shipment complete notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in shipment complete notification:', error)
    failedTests++
  }
  console.log('')

  // Test 7: Contract Signature Notification
  try {
    console.log('✍️ Test 7: Contract Signature Notification')
    const result = await notifyContractSignature(
      'test-contract-id-1',
      'ORD-2026-004'
    )
    if (result) {
      console.log('✅ Contract signature notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create contract signature notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in contract signature notification:', error)
    failedTests++
  }
  console.log('')

  // Test 8: System Error Notification
  try {
    console.log('🚨 Test 8: System Error Notification')
    const result = await notifySystemError(
      'test_error',
      'This is a test error message',
      { test_data: 'sample' }
    )
    if (result) {
      console.log('✅ System error notification created:', result.id)
      passedTests++
    } else {
      console.log('❌ Failed to create system error notification')
      failedTests++
    }
  } catch (error) {
    console.log('❌ Error in system error notification:', error)
    failedTests++
  }
  console.log('')

  // Test 9: Get Notifications
  try {
    console.log('📝 Test 9: Get Notifications')
    const { notifications, total } = await getAdminNotifications({
      limit: 10,
    })
    console.log(`✅ Retrieved ${notifications.length} of ${total} notifications`)
    passedTests++
  } catch (error) {
    console.log('❌ Error getting notifications:', error)
    failedTests++
  }
  console.log('')

  // Test 10: Get Unread Count
  try {
    console.log('🔢 Test 10: Get Unread Count')
    const unreadCount = await getUnreadAdminNotificationCount()
    console.log(`✅ Unread notification count: ${unreadCount}`)
    passedTests++
  } catch (error) {
    console.log('❌ Error getting unread count:', error)
    failedTests++
  }
  console.log('')

  // Summary
  console.log('═══════════════════════════════════════════════════════')
  console.log('📊 Test Summary')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`)
  console.log('═══════════════════════════════════════════════════════')

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.')
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('\n✅ Test execution completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  })
