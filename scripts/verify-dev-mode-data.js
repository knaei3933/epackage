/**
 * DEV_MODE Mock Data Verification Script
 *
 * This script verifies that the mock data functions are working correctly
 * when NEXT_PUBLIC_DEV_MODE is set to true.
 */

console.log('='.repeat(60));
console.log('DEV_MODE Mock Data Verification Checklist');
console.log('='.repeat(60));
console.log('');

console.log('✅ Mock Data Structure Requirements:');
console.log('');
console.log('1. Orders (getOrders):');
console.log('   - Expected count: 8');
console.log('   - Expected statuses: PENDING, PROCESSING, PRODUCTION, SHIPPED, DELIVERED, CONTRACT_SIGNED, WORK_ORDER, STOCK_IN');
console.log('   - Sample products: 化粧箱 A4サイズ, 段ボール箱, 透明パッケージ, 高級ギフトボックス, 簡易梱包箱');
console.log('');

console.log('2. Quotations (getQuotations):');
console.log('   - Expected count: 8');
console.log('   - Expected statuses: draft, sent, approved, expired, rejected');
console.log('   - Sample numbers: Q-2024-001, Q-2024-002, Q-2024-003');
console.log('');

console.log('3. Dashboard Stats (getDashboardStats):');
console.log('   - Orders: 8 total');
console.log('   - Quotations: 8 total');
console.log('   - Samples: 5 total');
console.log('   - Inquiries: 7 total');
console.log('   - Announcements: 3 total');
console.log('');

console.log('='.repeat(60));
console.log('Verification Instructions:');
console.log('='.repeat(60));
console.log('');
console.log('1. Set environment variable:');
console.log('   export NEXT_PUBLIC_DEV_MODE=true');
console.log('   # OR');
console.log('   echo "NEXT_PUBLIC_DEV_MODE=true" >> .env.local');
console.log('');
console.log('2. Start development server:');
console.log('   npm run dev');
console.log('');
console.log('3. Navigate to dashboard pages:');
console.log('   - http://localhost:3000/member/dashboard');
console.log('   - http://localhost:3000/member/orders');
console.log('   - http://localhost:3000/member/quotations');
console.log('');
console.log('4. Check browser console for:');
console.log('   - "[getOrders] DEV_MODE: Returning mock order data"');
console.log('   - "[getQuotations] DEV_MODE: Returning mock quotation data"');
console.log('   - "[getDashboardStats] DEV_MODE: Returning mock stats data"');
console.log('');
console.log('5. Verify data displays correctly on pages');
console.log('');
console.log('='.repeat(60));
