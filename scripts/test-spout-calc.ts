// スパウト加工費計算テスト
const spoutSize = 15; // 15mm
const quantity = 5000;
const SPOUT_PRICES = {
  9: 70,
  15: 80,
  18: 110,
  22: 130,
  28: 200
};
const ROUND_TRIP_SHIPPING = 150000;

const spoutPrice = SPOUT_PRICES[spoutSize] || 110;
const spoutCost = spoutPrice * quantity;
const spoutProcessingCostKRW = spoutCost + ROUND_TRIP_SHIPPING;
const spoutProcessingCostJPY = spoutProcessingCostKRW * 0.12;

console.log('=== スパウト加工費計算 ===');
console.log('スパウトサイズ:', spoutSize, 'mm');
console.log('スパウト単価:', spoutPrice, 'ウォン');
console.log('数量:', quantity);
console.log('スパウトコスト:', spoutCost, 'ウォン');
console.log('往復配送料:', ROUND_TRIP_SHIPPING, 'ウォン');
console.log('スパウト加工費（KRW）:', spoutProcessingCostKRW, 'ウォン');
console.log('スパウト加工費（JPY）:', spoutProcessingCostJPY, '円');
console.log('');
console.log('期待値: 550,000ウォン (66,000円)');
