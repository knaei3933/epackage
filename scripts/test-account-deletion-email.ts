/**
 * Test script for account deletion email
 *
 * アカウント削除メールのテストスクリプト
 */

import { sendAccountDeletionEmail } from '../src/lib/email/account-deleted'

async function testAccountDeletionEmail() {
  console.log('Testing account deletion email...\n')

  // Test 1: Basic email without deleted counts
  console.log('Test 1: Basic email without deleted counts')
  const result1 = await sendAccountDeletionEmail(
    'test@example.com',
    'user-123',
    new Date()
  )
  console.log('Result:', result1)
  console.log('\n' + '='.repeat(60) + '\n')

  // Test 2: Email with deleted counts
  console.log('Test 2: Email with deleted counts')
  const result2 = await sendAccountDeletionEmail(
    'test@example.com',
    'user-456',
    new Date(),
    {
      profile: 1,
      sampleRequests: 5,
      quotations: 3,
      orders: 2,
      deliveryAddresses: 2,
      billingAddresses: 1,
      inquiries: 10,
      notifications: 25
    }
  )
  console.log('Result:', result2)
  console.log('\n' + '='.repeat(60) + '\n')

  // Test 3: Email with minimal data
  console.log('Test 3: Email with minimal deleted data')
  const result3 = await sendAccountDeletionEmail(
    'minimal@example.com',
    'user-789',
    undefined,
    {
      profile: 1
    }
  )
  console.log('Result:', result3)
}

// Run tests
testAccountDeletionEmail()
  .then(() => {
    console.log('\nAll tests completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed:', error)
    process.exit(1)
  })
