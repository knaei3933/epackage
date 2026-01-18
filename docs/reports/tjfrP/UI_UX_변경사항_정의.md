# UI/UX 변경사항 정의 - 병렬 생산 가격 제안

> **작성일**: 2026-01-17
> **목적**: 병렬 생산 가격 제안을 UI에 반영하기 위한 구체적인 변경사항 정의

---

## 1. 현재 UI 상태 분석

### 1-1. 기존 견적 시스템 UI

```
현재: UnifiedSKUQuantityStep.tsx

┌─────────────────────────────────────────────────────────────┐
│  数量設定                                                   │
├─────────────────────────────────────────────────────────────┤
│  SKU数: [1▼]                                              │
│                                                             │
│  SKU 1                                                      │
│  数量: [500]개                                              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐    │
│  │ 単価計算中...                                           │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                             │
│  総額: ¥150,000                                            │
└─────────────────────────────────────────────────────────────┘
```

### 1-2. 문제점

```
【현재 UI의 문제점】

1. 병렬 생산 옵션이 표시되지 않음
2. 고객이 병렬 생산의 혜택을 알 수 없음
3. 2열 생산 가능 여부를 알 수 없음
4. 최적 주문 수량 제안이 없음
```

---

## 2. 롤 필름 병렬 생산 UI 설계

### 2-1. 롤 필름 견적 UI 변경 전/후

**변경 전**:
```
롤 필름 200mm × 500m

수량: [500]m

計算中...
総額: ¥100,000

[見積もる]
```

**변경 후**:
```
┌─────────────────────────────────────────────────────────────┐
│  ロールフィルム 200mm × 500m                               │
├─────────────────────────────────────────────────────────────┤
│  💡 お得なご提案                                           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⭐ 推奨: 3本セット                                 │  │
│  │                                                      │  │
│  │  760mm原反で3本同時生産                                 │  │
│  │  フィルム効率: 83%                                    │  │
│  │                                                      │  │
│  │  【価格比較】                                         │  │
│  │  • 1本注文: ¥100,000                               │  │
│  │  • 3本注文: ¥210,000（1本あたり¥70,000）           │  │
│  │                                                      │  │
│  │  通常価格: ¥300,000                                   │  │
│  │  お得額: -¥90,000（30% OFF）                        │  │
│  │                                                      │  │
│  │  [3本セットで見積もる] ボタン ⭐                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  その他のオプション                                         │
│  • 2本セット: ¥160,000（20% OFF、1本あたり¥80,000）     │
│  • 1本のみ: ¥100,000                                     │
│                                                             │
│  ※ 760mm原反で最大3本同時生産可能                          │
└─────────────────────────────────────────────────────────────┘
```

### 2-2. UI 컴포넌트 구조

```tsx
// src/components/quote/RollFilmParallelProduction.tsx (신규)

interface RollFilmParallelProductionProps {
  filmWidth: number;
  requestedLength: number;
  onSelectOption: (option: ParallelProductionOption) => void;
}

export function RollFilmParallelProduction({
  filmWidth,
  requestedLength,
  onSelectOption
}: RollFilmParallelProductionProps) {

  // 옵션 생성
  const proposals = useMemo(() =>
    generateParallelProductionOptions(filmWidth, requestedLength),
    [filmWidth, requestedLength]
  );

  const recommended = proposals.find(p => p.recommended) || proposals[0];

  return (
    <div className="space-y-6">
      {/* 추천 제안 카드 */}
      <Card className="border-2 border-green-500 bg-green-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="text-green-600" />
          <h3 className="text-lg font-bold">推奨: {recommended.orderCount}本セット</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>注文内容:</span>
            <span className="font-medium">
              {filmWidth}mm × {requestedLength}m × {recommended.orderCount}本
            </span>
          </div>

          <div className="flex justify-between">
            <span>フィルム効率:</span>
            <span className="font-bold">{(recommended.efficiency * 100).toFixed(0)}%</span>
          </div>

          <hr />

          <div className="flex justify-between">
            <span>通常価格:</span>
            <span className="line-through text-gray-500">
              ¥{recommended.originalPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>お得価格:</span>
            <span className="text-lg font-bold text-green-600">
              ¥{recommended.discountedPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-green-600">
            <span>お得額:</span>
            <span className="font-bold">
              -¥{(recommended.originalPrice - recommended.discountedPrice).toLocaleString()} ({recommended.discount * 100}% OFF)
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>1本あたり:</span>
            <span>
              ¥{(recommended.discountedPrice / recommended.orderCount).toLocaleString()}（通常
              ¥{(recommended.originalPrice / recommended.orderCount).toLocaleString()}）
            </span>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => onSelectOption(recommended)}
        >
          {recommended.orderCount}本セットで見積もる
        </Button>
      </Card>

      {/* 다른 옵션들 */}
      <div className="space-y-3">
        <h4 className="font-medium">その他のオプション</h4>

        {proposals.filter(p => !p.recommended).map((option) => (
          <Card key={option.orderCount} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{option.orderCount}本セット</span>
              <Badge variant="outline">{option.discount * 100}% OFF</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>総額:</span>
              <span>¥{option.discountedPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>1本あたり:</span>
              <span>¥{(option.discountedPrice / option.orderCount).toLocaleString()}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. 평Bag/스탠드업 2열 생산 UI 설계

### 3-1. 2열 생산 가능 여부 표시

**조건: 80mm × 120mm × 10,000개**

```
┌─────────────────────────────────────────────────────────────┐
│  平袋 80mm × 120mm × 10,000個                             │
├─────────────────────────────────────────────────────────────┤
│  📊 生産方式の選択                                           │
│                                                             │
│  【1列生産】⭐                                             │
│  • 総額: ¥158,270（単価¥15.83/個）                     │
│  • フィルム使用量: 1,350m                                 │
│  • 特徴: 小ロットや試作に最適                                │
│  • 推奨: 初回注文、10,000個未満の少量注文                 │
│                                                             │
│  【2列生産】                                                 │
│  • 総額: ¥110,315（単価¥11.03/個）                     │
│  • フィルム使用量: 900m（33%節減）                      │
│  • 特徴: 20,000個以上の大量注文に最適                        │
│  • 推奨: 再注文、継続的な大量注文                             │
│                                                             │
│  <注意> 10,000個単品注文の場合、1列生産が¥26,549お得      │
│  ただし、20,000個以上の同時注文の場合、2列生産が圧倒的にお得   │
└─────────────────────────────────────────────────────────────┘
```

### 3-2. 2열 생산 제안 UI

```tsx
// src/components/quote/TwoColumnProductionProposal.tsx (신규)

export function TwoColumnProductionProposal({
  pouchType,
  dimensions,
  quantity
}: Props) {

  // 2열 생산 가능 여부 분석
  const analysis = analyzeTwoColumnFeasibility(pouchType, dimensions, quantity);

  if (!analysis.available) {
    return (
      <Alert variant="info">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>2列生産対象外</AlertTitle>
        <AlertDescription>
          このサイズは2列生産に対応しておりません。
          標準生産（1列）でのお見積もりとなります。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-500 bg-blue-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-blue-600" />
          <h3 className="text-lg font-bold">2列生産がお得！</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>フィルム効率:</span>
            <span className="font-bold">{(analysis.efficiency * 100).toFixed(0)}%</span>
          </div>

          <div className="flex justify-between">
            <span>推奨最小数量:</span>
            <span className="font-bold">{analysis.recommendedQuantity.toLocaleString()}個以上</span>
          </div>

          <hr />

          <div className="flex justify-between">
            <span>割引率:</span>
            <span className="text-lg font-bold text-blue-600">
              {analysis.discount * 100}% OFF
            </span>
          </div>

          <div className="bg-blue-100 p-4 rounded">
            <p className="text-sm">
              <strong>おすすめ理由:</strong><br/>
              {quantity >= analysis.recommendedQuantity
                ? `${quantity.toLocaleString()}個は2列生産の推奨数量を満たしています！`
                : `現在${quantity.toLocaleString()}個です。2列生産のお得を最大に活用するには、
                   ${(analysis.recommendedQuantity - quantity).toLocaleString()}個追加をご検討ください。`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* 1열 생산 비교 */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-medium mb-2">標準生産（1列）との比較</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>1列生産総額:</span>
            <span>¥{analysis.oneRowTotalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>2列生産総額:</span>
            <span className="font-bold text-blue-600">
              ¥{analysis.twoRowTotalPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>お得額:</span>
            <span className="text-green-600 font-bold">
              ¥{(analysis.oneRowTotalPrice - analysis.twoRowTotalPrice).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

---

## 4. 합장박스/박스파우치 병렬 생산 UI 설계

### 4-1. 병렬 생산 옵션 선택 UI

```
┌─────────────────────────────────────────────────────────────┐
│  合掌袋 100mm × 180mm × 5,000個                             │
├─────────────────────────────────────────────────────────────┤
│  💡 お得なご提案                                           │
│                                                             │
│  【並列生産オプション】                                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⭐ 推奨: 3個セット                                 │  │
│  │                                                      │  │
│  │  590mm原反で3個同時生産                                 │  │
│  │  フィルム効率: 100% ⭐                               │  │
│  │                                                      │  │
│  │  【価格比較】                                         │  │
│  │  • 1個注文: ¥500,000                               │  │
│  │  • 3個注文: ¥1,050,000（1個あたり¥350,000）          │  │
│  │                                                      │  │
│  │  通常価格: ¥1,500,000                                 │  │
│  │  お得額: -¥450,000（30% OFF）                        │  │
│  │                                                      │  │
│  │  [3個セットで見積もる] ボタン ⭐                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  その他のオプション                                         │
│  • 2個セット: ¥850,000（15% OFF、1個あたり¥425,000）     │
│  • 1個のみ: ¥500,000                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. UI 변경사항 총괄

### 5-1. 견적 위저드 변경사항

| 화면 | 변경사항 | 우선순위 |
|------|----------|----------|
| `/quote-simulator` | 롤 필름 병렬 생산 제안 추가 | 🔥 높음 |
| `/quote-simulator` | 2열 생산 가능 여부 표시 추가 | ⚡ 중간 |
| `/quote-simulator` | 병렬 생산 옵션 선택 UI 추가 | ⚡ 중간 |

### 5-2. UnifiedSKUQuantityStep.tsx 변경사항

**변경 전**:
```tsx
// 현재
<UnifiedSKUQuantityStep
  skuQuantities={skuQuantities}
  onUpdate={handleUpdate}
/>
```

**변경 후**:
```tsx
<UnifiedSKUQuantityStep
  skuQuantities={skuQuantities}
  onUpdate={handleUpdate}
  showParallelProductionProposal={true}
  pouchType={pouchType}
  dimensions={dimensions}
/>
```

### 5-3. 제안 메시지 디자인

```
【추천 제안 메시지 템플릿】

1. 롤 필름:
   "760mm原反で{orderCount}本同時生産！フィルム効率{efficiency}%で{discount}% OFF"

2. 평Bag/스탠드업 (2열 생산 가능):
   "2列生産で単価{discount1}% OFF！{quantity}個以上で対象"

3. 합장박스/박스파우치 (병렬 생산 가능):
   "{orderCount}個セットで単価{discount1}% OFF！フィルム効率{efficiency}%"

4. 조건부 불가시:
   "このサイズは1列生産が推奨されます（{reason}）"
```

---

## 6. 사용자 인터랙션 설계

### 6-1. 가격 제안 표시 타이밍

```
【즉시 표시】
견적 시스템에서 병렬 생산이 가능한 경우,
즉시 추천 제안을 표시

【사용자 선택 후】
사용자가 제안을 선택하면, 해당 옵션으로 견적이 재계산

【최종 확인】
선택한 제안으로 최종 가격 확정 후 견적 완료
```

### 6-2. 툴질 개선

```
【명확성】
- "2列生産で30% OFF" → "フィルム効率{XX}%で2列生産！30% OFF"

【신뢰성】
- 조건에 따른 동적 메시지
- 예: "現在10,000個ですが、20,000個でさらに30% OFF!"

【비교 표시】
- 1열 vs 2열 생산 가격 명확 비교
- 전체 비용 혜택을 눈으로 보여줌
```

---

## 7. 반응형 UI 설계

### 7-1. SKU 수량 변경 시 동적 업데이트

```
사용자가 SKU 수량을 입력할 때마다:

1. SKU 수량 감지
2. 병렬 생산 가능 여부 실시 계산
3. 최적 제안 자동 생성
4. UI에 제안 메시지 업데이트

[시나리오]
사용자: SKU 1 수량을 10,000개로 변경

시스템:
  - SKU 수량 변경 감지
  - 2열 생산 가능 여부 재계산
  - "2列生産可能！30% OFF" 메시지 표시
  - 제안 버튼 활성화
```

### 7-2. 툴질에 따른 제안 변경

```
【수량에 따른 제안 변경】

10,000개:
  • 1열 생산 추천
  • 메시지: "この数量では1列生産が¥26,549お得"

20,000개:
  • 2열 생산 추천
  • 메시지: "2列生産で¥XXXお得！"

50,000개:
  • 2열 생산 강력 추천
  • 메시지: "2列生産で最大¥XXXお得！"
```

---

## 8. 접근성 개선

### 8-1. 모바일 고려

```
【작은 화면（768px 이하）】
- 카드 레이아웃로 표시
- 핵심 정보만 표시
- "詳細を見る" 버튼으로 전체 표시

【큰 화면（769px 이상）】
- 모든 정보를 한 화면에 표시
- 비교 표, 상세 내역 표시
```

### 8-2. 로딩 상태

```
【로딩 시】
- "提案を計算中..." 메시지
- 스켈레톤 아이콘

【계산 완료 시】
- 추천 제안 즉시 표시
- 애니메이션과 함께 표시
```

---

## 9. 마무라이어 및 톤앤

### 9-1. 색상 사용

```
추천 제안 카드:
- border: 2px solid green-500
- bg-green-50
- Star 아이콘과 함께 표시

일반 제안:
- border: 1px solid gray-200
- bg-white
- 배지색 없음
```

### 9-2 아이콘 사용

```
추천 표시:
- Star (Lucide React)
- TrendingUp (Lucide React)
- ArrowRight (Lucide React)

효율 표시:
- Chart bar로 효율 퍼센티브 그래프
- 색상: 효율 90% 이상 = green, 80-89% = blue, 70-79% = yellow
```

---

## 10. 구현 우선순위

### 10-1 Phase 1: 롤 필름 (1-2주)

- [ ] RollFilmPricingProposal 컴포넌트 구현
- [ ] 가격 계산 로직 구현
- [ ] 제안 메시지 UI 적용
- [ ] 반응형 SKU 수량 변경 기능

### 10-2 Phase 2: 평Bag/스탠드업 (2-3주)

- [ ] TwoColumnProductionProposal 컴포넌트 구현
- [ ] 2열 생산 가능 여부 분석 로직
- [ ] 조건별 제안 메시지 템플릿

### 10-3 Phase 3: 합장박스/박스파우치 (3-4주)

- [ ] ParallelProductionOptions 컴포넌트 구현
- [ ] 병렬 생산 옵션 선택 UI
- [ ] 가격 비교 테이블 표시

---

## 11. 검증 checklist

### 11-1. UI 검증

- [ ] 모바일 768px에서 레이아웃 테스트
- [ ] 모바일 769px에서 전체 정보 표시 테스트
- [ ] 제안 버튼 클릭 시 반응 확인
- [ ] 조건 변경 시 동적 업데이트 확인

### 11-2UX 검증

- [ ] 고객이 제안 메시지를 이해하는지 테스트
- [ ] 할인율이 명확하게 표시되는지 확인
- [ ] 1열/2열/병렬 생산 비교가 명확한지 확인

### 11-3 기능 검증

- [ ] 병렬 생산 가능 여부 판정 로직 정확성
- [ ] 가격 계산 정확성 검증
- [ ] 마진율 20% 유지 확인

---

**작성일**: 2026-01-17
**버전**: 1.0
**상태**: UI/UX 설계 완료
