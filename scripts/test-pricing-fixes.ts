/**
 * Test pricing fixes for pouch calculation
 */

import { UnifiedPricingEngine } from '../src/lib/unified-pricing-engine';

async function runTests() {
  const engine = new UnifiedPricingEngine();

  console.log('='.repeat(70));
  console.log('파우치 견적 시스템 수정 사항 검증 테스트');
  console.log('='.repeat(70));

  // Test Case 1: 100×120mm, 500개 (590mm 원단)
  console.log('\n' + '='.repeat(70));
  console.log('Test Case 1: 파우치 100×120mm, 500개');
  console.log('='.repeat(70));
  console.log('예상: 590mm 원단 사용 (폭 100mm ≤ 570mm)');

  const test1Params = {
    bagTypeId: 'flat_3_side' as const,
    materialId: 'PET_AL',
    width: 100,
    height: 120,
    depth: 0,
    quantity: 500,
    thicknessSelection: 'medium' as const,
    postProcessingOptions: [],
    skuQuantities: [500],
    useSKUCalculation: true
  };

  try {
    const result1 = await engine.calculateQuote(test1Params);
    console.log('\n결과:');
    console.log(`  총 가격: ¥${result1.totalPrice.toLocaleString()}`);
    console.log(`  단가: ¥${result1.unitPrice.toLocaleString()}/개`);
    console.log(`  리드타임: ${result1.leadTimeDays}일`);
    console.log('\n상세 내역:');
    console.log(`  재료비: ¥${result1.breakdown.material.toLocaleString()}`);
    console.log(`  인쇄비: ¥${result1.breakdown.printing.toLocaleString()}`);
    console.log(`  가공비: ¥${result1.breakdown.pouchProcessingCost.toLocaleString()}`);
    console.log(`  기본 원가: ¥${result1.breakdown.baseCost.toLocaleString()}`);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
  }

  // Test Case 2: 600×120mm, 500개 (760mm 원단)
  console.log('\n' + '='.repeat(70));
  console.log('Test Case 2: 파우치 600×120mm, 500개');
  console.log('='.repeat(70));
  console.log('예상: 760mm 원단 사용 (폭 600mm > 570mm, ≤ 740mm)');

  const test2Params = {
    ...test1Params,
    width: 600,
  };

  try {
    const result2 = await engine.calculateQuote(test2Params);
    console.log('\n결과:');
    console.log(`  총 가격: ¥${result2.totalPrice.toLocaleString()}`);
    console.log(`  단가: ¥${result2.unitPrice.toLocaleString()}/개`);
    console.log('\n상세 내역:');
    console.log(`  재료비: ¥${result2.breakdown.material.toLocaleString()}`);
    console.log(`  인쇄비: ¥${result2.breakdown.printing.toLocaleString()}`);
    console.log(`  가공비: ¥${result2.breakdown.pouchProcessingCost.toLocaleString()}`);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
  }

  // Test Case 3: 롤 필름 (마진율 20% 테스트)
  console.log('\n' + '='.repeat(70));
  console.log('Test Case 3: 롤 필름 476mm×500m (마진율 20%)');
  console.log('='.repeat(70));
  console.log('예상: 590mm 원단 사용, 20% 마진율 적용');

  const test3Params = {
    bagTypeId: 'roll_film' as const,
    materialId: 'PET_AL',
    width: 476,
    height: 0,
    depth: 0,
    quantity: 500,
    thicknessSelection: 'medium' as const,
    postProcessingOptions: [],
  };

  try {
    const result3 = await engine.calculateQuote(test3Params);
    console.log('\n결과:');
    console.log(`  총 가격: ¥${result3.totalPrice.toLocaleString()}`);
    console.log(`  단가: ¥${result3.unitPrice.toLocaleString()}/m`);
    console.log('\n상세 내역:');
    console.log(`  재료비: ¥${result3.breakdown.material?.toLocaleString() || 'N/A'}`);
    console.log(`  인쇄비: ¥${result3.breakdown.printing?.toLocaleString() || 'N/A'}`);
    console.log(`  가공비: ¥${result3.breakdown.processing?.toLocaleString() || 'N/A'}`);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
  }

  console.log('\n' + '='.repeat(70));
  console.log('테스트 완료');
  console.log('='.repeat(70));
}

runTests().catch(console.error);
