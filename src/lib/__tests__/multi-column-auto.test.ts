import {
  determineAutoMultiColumnCount,
  calculateOneColumnProductionMeters,
} from '../multi-column-auto'

// 基準パウチ: flat_3_side, H=200, W=130
//   - ピッチ = width = 130mm（flat_3_side/stand_up は width）
//   - 1列幅 = H×2+41 = 441mm → floor(1100/441)=2 → availableCounts=[2]（パウチ袋2列上限）

describe('calculateOneColumnProductionMeters', () => {
  it('flat_3_side は width をピッチとして製作長を計算する（1万個×130mm=1300m）', () => {
    expect(calculateOneColumnProductionMeters('flat_3_side', 200, 130, 10000)).toBe(1300)
  })

  it('t_shape は height をピッチとして計算する', () => {
    // height=130mm, 1万個 → 1300m
    expect(calculateOneColumnProductionMeters('t_shape', 130, 200, 10000)).toBe(1300)
  })

  it('数量0 は 0m', () => {
    expect(calculateOneColumnProductionMeters('flat_3_side', 200, 130, 0)).toBe(0)
  })
})

describe('determineAutoMultiColumnCount', () => {
  it('1列基準製作長が1000m超 → 最大列数(2)を自動選択', () => {
    // 1万個×130mm=1300m > 1000m → 2列
    expect(determineAutoMultiColumnCount('flat_3_side', 200, 130, 10000)).toBe(2)
  })

  it('1列基準製作長が1000m以下 → 1列', () => {
    // 7000個×130mm=910m ≤ 1000m → 1列
    expect(determineAutoMultiColumnCount('flat_3_side', 200, 130, 7000)).toBe(1)
  })

  it('境界: 製作長1000m未満(999.96m) → 1列', () => {
    // 7692個×130mm=999.96m
    expect(determineAutoMultiColumnCount('flat_3_side', 200, 130, 7692)).toBe(1)
  })

  it('境界: 製作長1000m超(1000.09m) → 2列', () => {
    // 7693個×130mm=1000.09m
    expect(determineAutoMultiColumnCount('flat_3_side', 200, 130, 7693)).toBe(2)
  })

  it('2列が物理不可(1列幅が大きい) → 1000m超でも1列', () => {
    // H=600 → 1列幅=1241mm > 1100 → availableCounts=[] → 1列
    expect(determineAutoMultiColumnCount('flat_3_side', 600, 130, 10000)).toBe(1)
  })

  it('カスタム閾値を指定可能（500m超で多列化）', () => {
    // 4000個×130mm=520m > 500m → 2列
    expect(determineAutoMultiColumnCount('flat_3_side', 200, 130, 4000, 500)).toBe(2)
  })

  it('stand_up も width ピッチで判定（1万個×130mm=1300m → 2列）', () => {
    expect(determineAutoMultiColumnCount('stand_up', 200, 130, 10000)).toBe(2)
  })

  it('ユーザー仕様の具体例: 1万個・1300m → 2列', () => {
    // ユーザー例「1万個で1300m、2列可能なら2列」
    expect(determineAutoMultiColumnCount('flat_3_side', 200, 130, 10000)).toBe(2)
  })
})
