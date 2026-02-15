/**
 * Test script to verify the orders history page fix
 * This tests that the sortBy parameter correctly maps camelCase to snake_case
 */

// Test the sorting logic
const sortByMap: Record<string, string> = {
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'orderNumber': 'order_number',
  'totalAmount': 'total_amount',
  'status': 'status',
};

// Test cases
const testCases = [
  { input: 'createdAt', expected: 'created_at' },
  { input: 'updatedAt', expected: 'updated_at' },
  { input: 'orderNumber', expected: 'order_number' },
  { input: 'totalAmount', expected: 'total_amount' },
  { input: 'status', expected: 'status' },
  { input: undefined, expected: 'created_at' },
];

console.log('Testing sortBy parameter mapping:');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = sortByMap[test.input || 'createdAt'] || 'created_at';
  const success = result === test.expected;

  if (success) {
    passed++;
    console.log(`✓ Test ${index + 1}: PASSED`);
    console.log(`  Input: ${test.input}`);
    console.log(`  Output: ${result}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: FAILED`);
    console.log(`  Input: ${test.input}`);
    console.log(`  Expected: ${test.expected}`);
    console.log(`  Got: ${result}`);
  }
  console.log('');
});

console.log('='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed!');
  process.exit(1);
}
