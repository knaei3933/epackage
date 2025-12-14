# Interactive Quote System - 통합 견적 시스템

## 개요

InteractiveQuoteSystem은 기존의 분리된 Step 1 견적 프로세스를 단일 인터랙티브 인터페이스로 통합한 혁신적인 솔루션입니다. 사용자는 제품 타입, 사이즈, 소재, 두께를 한 화면에서 선택하고 실시간으로 가격을 확인할 수 있습니다.

## 주요 기능

### 1. 통합된 인터페이스
- **단일 화면**: 제품 타입, 사이즈, 소재, 두께 선택을 하나의 화면에서 통합 관리
- **직관적인 흐름**: 논리적인 순서로 배열된 선택 항목
- **실시간 피드백**: 선택 즉시 유효성 검사 및 시각적 상태 표시

### 2. 제품 타입 선택
- 5가지 기본 제품 타입 (三方シール平袋, スタンドパウチ, BOX型パウチ, スパウトパウチ, ロールフィルム)
- 시각적 아이콘과 상세 설명 제공
- 인기 제품 뱃지 표시
- 호버 효과 및 선택 상태 시각화

### 3. 사이즈 설정
- **수동 입력**: 최소 50mm부터 자유로운 크기 입력
- **프리셋 옵션**: 소/중/대 사이즈 빠른 선택
- **실시간 유효성 검사**: 최소 크기 미만 입력 시 즉각적인 피드백
- **면실시간 계산**: 선택된 크기의 면적(mm²) 즉시 표시

### 4. 소재 선택
- 4가지 고급 소재 옵션 (PET + 알루미늄박, PET + 알루미늄증착, PET + LLDPE, PET + 나일론 + 알루미늄박)
- **상세 정보**: 각 소재의 특성과 배율(multiplier) 정보
- **인기 소재 표시**: 사용자 선호도 기반 추천
- **피쳐 뱃지**: 주요 특징 간결하게 표시

### 5. 두께 선택 (동적)
- **소재 종속**: 선택된 소재에 따라 동적으로 표시
- **4가지 등급**: 경량/표준/고내구/초내구 타입
- **상세 사양**: 정확한 필름 구성 표시 (예: PET12μ+AL７μ+PET12μ+LLDPE60μ)
- **비용 표시자**: 코스트다운/표준/고내구 등급 표시

### 6. 수량 설정
- **복수 수량 패턴**: 여러 수량 동시 비교 가능 (최소 500개)
- **빠른 프리셋**: 500, 1k, 2k, 5k, 10k, 20k 버튼
- **동적 추가**: 필요시 새로운 수량 필드 추가
- **삭제 기능**: 불필요한 수량 필드 제거

### 7. 실시간 가격 계산
- **즉시 계산**: 모든 선택이 완료되면 실시간으로 가격 계산
- **수량별 비교**: 최대 3개 수량 패턴의 단가 표시
- **할인율 표시**: 수량에 따른 할인율 자동 계산
- **시각적 프리뷰**: 카드 형태의 가격 정보 표시

## 기술적 특징

### 상태 관리
```typescript
interface FormData {
  productType: string
  size: { width: number; height: number }
  material: string
  thickness?: string
  quantities: number[]
}
```

### 실시간 유효성 검사
```typescript
interface ValidationState {
  productType: boolean
  size: boolean
  material: boolean
  thickness: boolean
  quantity: boolean
  isValid: boolean
}
```

### 가격 계산 로직
- 기본 가격 × 사이즈 배율 × 소재 배율 × 두께 배율 × (1 - 할인율)
- 수량에 따른 동적 할인율 적용
- 실시간 업데이트

### 사용자 경험 개선
1. **프로그레스 트래커**: 현재 선택 상태 시각적 표시
2. **호버 효과**: 인터랙티브한 UI 피드백
3. **애니메이션**: 부드러운 전환 효과
4. **반응형 디자인**: 모바일/태블릿/데스크탑 지원
5. **접근성**: 키보드 내비게이션 및 스크린 리더 지원

## 통합 방식

### 기존 시스템
```
Step 1: 제품 타입 → Step 2: 사이즈/수량 → Step 3: 소재/두께
```

### 새로운 시스템
```
통합된 Step 1: 모든 사양을 한 화면에서 선택 → Step 2: 상세 설정 → Step 3: 결과
```

## 파일 구조

```
src/components/quote/
├── InteractiveQuoteSystem.tsx     # 새로운 통합 컴포넌트
├── UnifiedQuoteSystem.tsx         # 기존 시스템 (업데이트됨)
└── README_InteractiveQuoteSystem.md  # 이 문서
```

## 사용 예시

### 컴포넌트 임포트
```typescript
import { InteractiveQuoteSystem } from '@/components/quote/InteractiveQuoteSystem'

function QuotePage() {
  const handleStepComplete = (data) => {
    console.log('Step 1 completed:', data)
    // 다음 단계로 이동
  }

  return (
    <InteractiveQuoteSystem
      onStepComplete={handleStepComplete}
      initialData={{
        productType: 'stand_up',
        size: { width: 120, height: 160 },
        material: 'pet_al',
        thickness: 'medium',
        quantities: [1000, 2000]
      }}
    />
  )
}
```

### UnifiedQuoteSystem 통합
```typescript
// UnifiedQuoteSystem.tsx에서
const handleStep1Complete = (data) => {
  setStep1Data(data)
  setFormData(prev => ({
    ...prev,
    ...data
  }))
  setCurrentStep(2)
}

// Step 1 부분
{currentStep === 1 && (
  <InteractiveQuoteSystem
    onStepComplete={handleStep1Complete}
    initialData={step1Data || undefined}
  />
)}
```

## 브라우저 지원

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- 모바일 브라우저 (iOS Safari, Android Chrome)

## 성능 최적화

1. **메모이제이션**: useMemo를 사용한 계산 최적화
2. **디바운싱**: 가격 계산 디바운싱 (필요시 추가 가능)
3. **이미지 최적화**: Next.js Image 컴포넌트 사용
4. **번들 사이즈**: 코드 스플리팅으로 초기 로딩 최적화

## 향후 개선 사항

1. **저장 기능**: 사용자 선택 로컬 저장
2. **비교 기능**: 여러 설정 동시 비교
3. **견적서 내보내기**: PDF 생성 기능 연동
4. **재고 확인**: 실시간 재고 연동
5. **AI 추천**: 사용자 패턴 기반 추천 시스템

## 결론

InteractiveQuoteSystem은 사용자 경험을 극대화하면서도 개발자에게는 유지보수가 용이한 구조를 제공합니다. 단일 인터랙티브 화면을 통해 견적 프로세스를 혁신적으로 개선했으며, 실시간 피드백과 직관적인 UI로 전환율 향상에 기여할 것입니다.