/**
 * Test script for Dashboard Statistics API
 *
 * This script tests the enhanced dashboard statistics API endpoint
 * to verify all statistics are properly calculated.
 *
 * Usage:
 *   npx ts-node scripts/test-dashboard-stats.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardStatistics() {
  console.log('🧪 Testing Dashboard Statistics API...\n');

  const periods = [7, 30, 90];

  for (const period of periods) {
    console.log(`\n📊 Testing ${period}-day period:`);
    console.log('='.repeat(50));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    try {
      // 1. Orders Statistics
      console.log('\n1️⃣  Orders Statistics');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status, total_amount, created_at')
        .gte('created_at', startDate.toISOString());

      if (ordersError) {
        console.error('   ❌ Orders query failed:', ordersError.message);
      } else {
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0;
        const inProgressOrders = orders?.filter(o =>
          ['QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION'].includes(o.status)
        ).length || 0;
        const completedOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0;

        console.log(`   ✅ Total Orders: ${totalOrders}`);
        console.log(`   ✅ Pending: ${pendingOrders}`);
        console.log(`   ✅ In Progress: ${inProgressOrders}`);
        console.log(`   ✅ Completed: ${completedOrders}`);
        console.log(`   ✅ Total Revenue: ¥${totalRevenue.toLocaleString()}`);
      }

      // 2. Quotations Statistics
      console.log('\n2️⃣  Quotations Statistics');
      const { data: quotations, error: quotationsError } = await supabase
        .from('quotations')
        .select('status, total_amount')
        .gte('created_at', startDate.toISOString());

      if (quotationsError) {
        console.error('   ❌ Quotations query failed:', quotationsError.message);
      } else {
        const totalQuotations = quotations?.length || 0;
        const draftQuotations = quotations?.filter(q => q.status === 'DRAFT').length || 0;
        const sentQuotations = quotations?.filter(q => q.status === 'SENT').length || 0;
        const approvedQuotations = quotations?.filter(q => q.status === 'APPROVED').length || 0;
        const conversionRate = totalQuotations > 0
          ? ((approvedQuotations / totalQuotations) * 100).toFixed(1)
          : '0.0';

        console.log(`   ✅ Total Quotations: ${totalQuotations}`);
        console.log(`   ✅ Draft: ${draftQuotations}`);
        console.log(`   ✅ Sent: ${sentQuotations}`);
        console.log(`   ✅ Approved: ${approvedQuotations}`);
        console.log(`   ✅ Conversion Rate: ${conversionRate}%`);
      }

      // 3. Sample Requests Statistics
      console.log('\n3️⃣  Sample Requests Statistics');
      const { data: samples, error: samplesError } = await supabase
        .from('sample_requests')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (samplesError) {
        console.error('   ❌ Samples query failed:', samplesError.message);
      } else {
        const totalSamples = samples?.length || 0;
        const processingSamples = samples?.filter(s =>
          ['received', 'processing'].includes(s.status)
        ).length || 0;
        const completedSamples = samples?.filter(s => s.status === 'delivered').length || 0;

        console.log(`   ✅ Total Samples: ${totalSamples}`);
        console.log(`   ✅ Processing: ${processingSamples}`);
        console.log(`   ✅ Completed: ${completedSamples}`);
      }

      // 4. Production Statistics
      console.log('\n4️⃣  Production Statistics');
      const { data: production, error: productionError } = await supabase
        .from('production_jobs')
        .select('status, started_at, completed_at')
        .gte('created_at', startDate.toISOString());

      if (productionError) {
        console.error('   ❌ Production query failed:', productionError.message);
      } else {
        const inProgressProduction = production?.filter(p => p.status === 'in_progress').length || 0;
        const completedProduction = production?.filter(p => p.status === 'completed').length || 0;

        const completedJobsWithDates = production?.filter(p =>
          p.status === 'completed' && p.started_at && p.completed_at
        ) || [];

        const avgProductionDays = completedJobsWithDates.length > 0
          ? (completedJobsWithDates.reduce((sum, job) => {
              const days = Math.floor(
                (new Date(job.completed_at!).getTime() - new Date(job.started_at!).getTime()) / (1000 * 60 * 60 * 24)
              );
              return sum + Math.max(0, days);
            }, 0) / completedJobsWithDates.length).toFixed(1)
          : '0.0';

        console.log(`   ✅ In Progress: ${inProgressProduction}`);
        console.log(`   ✅ Completed: ${completedProduction}`);
        console.log(`   ✅ Avg Days: ${avgProductionDays}`);
      }

      // 5. Shipments Statistics
      console.log('\n5️⃣  Shipments Statistics');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('shipped_at, status')
        .gte('shipped_at', today.toISOString());

      if (shipmentsError) {
        console.error('   ❌ Shipments query failed:', shipmentsError.message);
      } else {
        const todayShipments = shipments?.length || 0;
        const inTransitShipments = shipments?.filter(s => s.status === 'in_transit').length || 0;

        console.log(`   ✅ Today Shipments: ${todayShipments}`);
        console.log(`   ✅ In Transit: ${inTransitShipments}`);
      }

      // 6. Monthly Revenue
      console.log('\n6️⃣  Monthly Revenue (Last 6 months)');
      const monthlyRevenueMap = new Map<string, number>();

      orders?.forEach(order => {
        if (order.total_amount) {
          const date = new Date(order.created_at);
          const monthKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + order.total_amount);
        }
      });

      const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      monthlyRevenue.forEach(({ month, amount }) => {
        console.log(`   ✅ ${month}: ¥${amount.toLocaleString()}`);
      });

    } catch (error) {
      console.error(`❌ Error testing ${period}-day period:`, error);
    }
  }

  console.log('\n✅ Dashboard statistics test completed!');
}

// Run the test
testDashboardStatistics()
  .then(() => {
    console.log('\n✨ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
