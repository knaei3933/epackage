import { priceCalculator } from './pricing';
import { SimulationState, QuotationResult } from '@/types/simulation';

// Test data for performance verification
const testState: any = {
  orderType: 'new',
  contentsType: 'solid',
  bagType: 'stand_up',
  width: 200,
  height: 300,
  materialGenre: 'opp_al',
  surfaceMaterial: 'gloss_opp',
  materialComposition: 'comp_1',
  quantities: [100, 1000, 5000, 10000],
  deliveryDate: new Date(),
};

export async function testRealTimeCalculation(): Promise<{
  success: boolean;
  averageTime: number;
  results: QuotationResult[];
  message: string;
}> {
  console.log('🧪 Testing real-time price calculation...');

  const times: number[] = [];
  const iterations = 10;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      const results = await priceCalculator.calculate(testState, 100); // 100ms debounce
      const endTime = performance.now();

      times.push(endTime - startTime);

      if (i === 0) {
        console.log('📊 First calculation results:', results);
      }
    } catch (error) {
      console.error('❌ Calculation failed:', error);
      return {
        success: false,
        averageTime: 0,
        results: [],
        message: `Calculation failed: ${error}`,
      };
    }
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);

  const meetsRequirement = averageTime <= 500; // 0.5 second requirement

  console.log(`📈 Performance Results:`);
  console.log(`   Average: ${averageTime.toFixed(2)}ms`);
  console.log(`   Min: ${minTime.toFixed(2)}ms`);
  console.log(`   Max: ${maxTime.toFixed(2)}ms`);
  console.log(`   Target: <500ms ✓`);
  console.log(`   Status: ${meetsRequirement ? '✅ PASS' : '❌ FAIL'}`);

  return {
    success: meetsRequirement,
    averageTime,
    results: [], // Results already logged above
    message: meetsRequirement
      ? `✅ Performance test passed! Average: ${averageTime.toFixed(2)}ms`
      : `❌ Performance test failed. Average: ${averageTime.toFixed(2)}ms (target: <500ms)`,
  };
}

// Test immediate (synchronous) calculation
export function testSyncCalculation(): {
  success: boolean;
  time: number;
  results: QuotationResult[];
  message: string;
} {
  console.log('⚡ Testing synchronous calculation...');

  const startTime = performance.now();

  try {
    const results = priceCalculator.calculateSync(testState);
    const endTime = performance.now();

    const time = endTime - startTime;

    console.log('📊 Sync calculation results:', results);
    console.log(`⚡ Sync calculation time: ${time.toFixed(2)}ms`);

    return {
      success: true,
      time,
      results,
      message: `✅ Sync calculation completed in ${time.toFixed(2)}ms`,
    };
  } catch (error) {
    console.error('❌ Sync calculation failed:', error);
    return {
      success: false,
      time: 0,
      results: [],
      message: `❌ Sync calculation failed: ${error}`,
    };
  }
}