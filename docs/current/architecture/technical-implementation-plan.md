# 견적 시뮬레이터 기술 구현 계획

## 1. 통합 컴포넌트 아키텍처 설계

### 1.1 핵심 아키텍처 원칙

#### Server/Client Component 분리 전략
```typescript
// Server Components (데이터 페칭, 정적 렌더링)
- QuoteWizardLayout (서버 사이드 렌더링)
- ProductCatalogServer (제품 데이터 서버 페칭)
- PricingEngineServer (가격 계산 로직)

// Client Components (인터랙티브 기능)
- QuoteWizardClient ('use client' 지시어)
- InteractiveStepComponents (사용자 입력 처리)
- RealTimePriceCalculator (실시간 가격 업데이트)
```

#### 상태 관리 계층화
```typescript
// 1. Global State (Zustand 또는 React 19 Context)
interface QuoteWizardState {
  expertiseLevel: 'beginner' | 'expert'
  currentStep: number
  quoteData: UnifiedQuoteData
  isLoading: boolean
  errors: QuoteError[]
}

// 2. Form State (React Hook Form + Zod)
const unifiedQuoteSchema = z.object({
  productType: z.enum(['stand_up', 'flat_3_side', 'box', 'spout_pouch', 'roll_film']),
  specifications: z.object({
    size: z.object({ width: z.number(), height: z.number(), depth: z.number() }),
    material: z.string(),
    thickness: z.number(),
    quantity: z.number()
  }),
  postProcessing: z.array(z.string()).optional()
})

// 3. UI State (useOptimistic)
const [optimisticQuote, updateQuote] = useOptimistic(
  currentQuote,
  (state, update) => ({ ...state, ...update })
)
```

### 1.2 통합 컴포넌트 구조

```typescript
// src/components/quote-system/UnifiedQuotingWizard.tsx
'use client'

import { useQuoteWizard } from '@/hooks/use-quote-wizard'
import { QuoteWizardLayout } from './QuoteWizardLayout'
import { StepNavigation } from './StepNavigation'
import { RealTimePriceDisplay } from './RealTimePriceDisplay'
import { ProgressBar } from './ProgressBar'

export function UnifiedQuotingWizard() {
  const {
    state,
    actions,
    currentStep,
    isStepComplete,
    quoteResult
  } = useQuoteWizard()

  return (
    <QuoteWizardLayout>
      {/* 고정된 상단 가격 표시 */}
      <RealTimePriceDisplay quote={quoteResult} />

      {/* 진행 상태 표시 */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={state.totalSteps}
        completedSteps={state.completedSteps}
      />

      {/* 동적 스텝 컨텐츠 */}
      <StepContent step={currentStep} />

      {/* 하단 중앙 견적 옵션 */}
      <QuoteActionPanel />
    </QuoteWizardLayout>
  )
}
```

## 2. 스텝 1 통합 구현 기술 설계

### 2.1 AI 추천 시스템 아키텍처

```typescript
// src/lib/ai-recommendation-engine.ts
export class AIRecommendationEngine {
  private productDatabase: ProductDatabase
  private userBehaviorAnalyzer: UserBehaviorAnalyzer

  async recommendProduct(input: UserInput): Promise<ProductRecommendation[]> {
    // 1. 사용자 입력 분석
    const analysis = await this.analyzeUserInput(input)

    // 2. 제품 필터링 및 점수화
    const candidates = await this.productDatabase.getCandidates(analysis)
    const scored = await this.scoreProducts(candidates, analysis)

    // 3. AI 기반 추천 순위화
    return this.rankRecommendations(scored)
  }

  private async analyzeUserInput(input: UserInput): Promise<UserIntent> {
    // 자연어 처리 및 패턴 인식
    return {
      category: this.detectCategory(input.description),
      useCase: this.detectUseCase(input.keywords),
      constraints: this.extractConstraints(input)
    }
  }
}
```

### 2.2 통합된 입력 컴포넌트

```typescript
// src/components/quote-system/steps/IntegratedProductSelectionStep.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { ProductTypeSelector } from './ProductTypeSelector'
import { AIDesignAssistant } from './AIDesignAssistant'
import { RealTimePricePreview } from './RealTimePricePreview'

export function IntegratedProductSelectionStep() {
  const { control, watch, setValue } = useForm<UnifiedQuoteData>()

  const watchedValues = watch()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 왼쪽: 제품 선택 */}
      <div className="space-y-6">
        <Controller
          name="productType"
          control={control}
          render={({ field }) => (
            <ProductTypeSelector
              value={field.value}
              onChange={field.onChange}
              aiRecommendations={getAIRecommendations(watchedValues)}
            />
          )}
        />

        <Controller
          name="material"
          control={control}
          render={({ field }) => (
            <MaterialSelector
              productType={watchedValues.productType}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* 오른쪽: 사이즈 및 두께 */}
      <div className="space-y-6">
        <SizeSelector />
        <ThicknessSelector />

        {/* AI 도우미 */}
        <AIDesignAssistant
          currentSelection={watchedValues}
          onSuggestion={(suggestion) =>
            setValue('specifications', suggestion)
          }
        />
      </div>
    </div>
  )
}
```

## 3. 견적 상단 박스 재설계

### 3.1 고정형 실시간 가격 표시

```typescript
// src/components/quote-system/RealTimePriceDisplay.tsx
'use client'

import { useOptimistic } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuoteCalculation } from '@/hooks/use-quote-calculation'

export function RealTimePriceDisplay({
  quoteData,
  isLoading
}: RealTimePriceDisplayProps) {
  const [optimisticQuote, updateQuote] = useOptimistic(
    quoteData,
    (state, update) => ({ ...state, ...update })
  )

  const { calculatePrice } = useQuoteCalculation()

  return (
    <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 실시간 가격 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={optimisticQuote.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center space-x-4"
            >
              <div className="text-sm text-gray-600">예상 가격</div>
              <div className="text-2xl font-bold text-navy-700">
                ¥{optimisticQuote.totalPrice.toLocaleString()}
              </div>
              {optimisticQuote.unitPrice && (
                <div className="text-sm text-gray-500">
                  단가: ¥{optimisticQuote.unitPrice.toLocaleString()}/개
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 견적 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            <QuickConsultationButton />
            <DetailedQuoteButton />
            <ComprehensiveQuoteButton />
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3.2 진행 상황 시각화 컴포넌트

```typescript
// src/components/quote-system/ProgressIndicator.tsx
'use client'

import { useQuoteWizard } from '@/hooks/use-quote-wizard'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

export function ProgressIndicator() {
  const { state, currentStep } = useQuoteWizard()

  const steps = [
    { id: 'product', title: '제품 선택', icon: Package },
    { id: 'specifications', title: '사양 설정', icon: Settings },
    { id: 'post-processing', title: '후가공', icon: Wrench },
    { id: 'quantity', title: '수량', icon: Calculator },
    { id: 'result', title: '견적 결과', icon: FileText }
  ]

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const isPending = index > currentStep

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isActive ? 'bg-blue-500 text-white' : ''}
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isPending ? 'bg-gray-200 text-gray-400' : ''}
              `}>
                {isActive && <Loader2 className="w-5 h-5 animate-spin" />}
                {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                {isPending && <Circle className="w-5 h-5" />}
              </div>
              <span className="text-xs mt-2 text-gray-600">{step.title}</span>
            </div>

            {index < steps.length - 1 && (
              <div className={`
                w-16 h-1
                ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
              `} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
```

## 4. 후가공 UI/UX 개선

### 4.1 카테고리별 옵션 그룹화

```typescript
// src/components/quote-system/post-processing/CategoryGroupedOptions.tsx
'use client'

export function CategoryGroupedOptions() {
  const postProcessingCategories = [
    {
      id: 'sealing',
      name: '밀봉 옵션',
      icon: Lock,
      options: [
        { id: 'zip_lock', name: '지퍼', price: 15000 },
        { id: 'velcro', name: '벨크로', price: 8000 },
        { id: 'adhesive', name: '점착식', price: 5000 }
      ]
    },
    {
      id: 'convenience',
      name: '편의 기능',
      icon: Zap,
      options: [
        { id: 'valve', name: '공기밸브', price: 12000 },
        { id: 'tear_notch', name: '찢음 notch', price: 3000 },
        { id: 'hang_hole', name: '걸이구멍', price: 2000 }
      ]
    },
    {
      id: 'display',
      name: '디스플레이',
      icon: Eye,
      options: [
        { id: 'transparent_window', name: '투명창', price: 10000 },
        { id: 'metallic_finish', name: '메탈릭 마감', price: 20000 },
        { id: 'matte_finish', name: '무광 마감', price: 15000 }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {postProcessingCategories.map((category) => (
        <OptionCategory key={category.id} category={category} />
      ))}
    </div>
  )
}

function OptionCategory({ category }: { category: PostProcessingCategory }) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const Icon = category.icon

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Icon className="w-5 h-5 mr-2 text-navy-600" />
        <h3 className="text-lg font-semibold">{category.name}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {category.options.map((option) => (
          <InteractiveOptionCard
            key={option.id}
            option={option}
            isSelected={selectedOptions.includes(option.id)}
            onToggle={() => toggleOption(option.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

### 4.2 상호작용형 옵션 카드

```typescript
// src/components/quote-system/post-processing/InteractiveOptionCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

interface InteractiveOptionCardProps {
  option: PostProcessingOption
  isSelected: boolean
  onToggle: () => void
  minPriceGuarantee?: number
}

export function InteractiveOptionCard({
  option,
  isSelected,
  onToggle,
  minPriceGuarantee = 160000
}: InteractiveOptionCardProps) {
  const handleToggle = () => {
    // 최소 비용 정책 체크
    if (!isSelected && option.price < minPriceGuarantee) {
      // 경고 또는 자동 조정 로직
      console.warn('옵션이 최소 비용 정책을 충족하지 않습니다')
    }
    onToggle()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleToggle}
      className={`
        relative p-4 border-2 rounded-lg cursor-pointer transition-all
        ${isSelected
          ? 'border-green-500 bg-green-50 shadow-lg'
          : 'border-gray-200 hover:border-navy-300 hover:shadow-md'
        }
      `}
    >
      {/* 선택 상태 표시 */}
      <div className="absolute top-2 right-2">
        {isSelected ? (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        )}
      </div>

      {/* 옵션 정보 */}
      <div className="pr-8">
        <h4 className="font-semibold text-gray-900 mb-2">{option.name}</h4>
        <p className="text-sm text-gray-600 mb-3">{option.description}</p>

        {/* 가격 정보 */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-navy-700">
            +¥{option.price.toLocaleString()}
          </span>
          {option.price < minPriceGuarantee && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              최소 비용 적용
            </span>
          )}
        </div>
      </div>

      {/* 시각적 미리보기 */}
      {option.previewImage && (
        <div className="mt-3 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={option.previewImage}
            alt={option.name}
            className="w-full h-24 object-cover"
          />
        </div>
      )}
    </motion.div>
  )
}
```

## 5. 성능 최적화 전략

### 5.1 React 19 최적화 활용

```typescript
// src/hooks/use-optimized-quote-calculation.ts
'use client'

import { useOptimistic, useTransition } from 'react'
import { debounce } from 'lodash'

export function useOptimizedQuoteCalculation(quoteData: QuoteData) {
  const [isPending, startTransition] = useTransition()

  const [optimisticResult, updateQuote] = useOptimistic(
    quoteData.currentResult,
    (state, update: QuoteUpdate) => {
      // 즉각적인 UI 업데이트
      return calculateOptimisticQuote(state, update)
    }
  )

  // 디바운스된 가격 계산
  const debouncedCalculation = debounce(
    async (data: QuoteData) => {
      startTransition(async () => {
        const result = await calculateQuotePrice(data)
        updateQuote({ type: 'CALCULATION_COMPLETE', payload: result })
      })
    },
    300 // 300ms 디바운스
  )

  // 실시간 계산 트리거
  const triggerCalculation = (newData: Partial<QuoteData>) => {
    // 즉각적인 optimistic 업데이트
    updateQuote({ type: 'QUICK_UPDATE', payload: newData })

    // 실제 계산은 트랜지션으로
    debouncedCalculation({ ...quoteData, ...newData })
  }

  return {
    result: optimisticResult,
    isPending,
    triggerCalculation
  }
}
```

### 5.2 코드 스플리팅 및 지연 로딩

```typescript
// src/components/quote-system/QuotingWizard.tsx
'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 무거운 컴포넌트들 동적 임포트
const ProductCatalog = dynamic(
  () => import('./ProductCatalog').then(mod => mod.ProductCatalog),
  {
    loading: () => <ProductCatalogSkeleton />,
    ssr: false // 클라이언트 사이드에서만 로드
  }
)

const AIRecommendationEngine = dynamic(
  () => import('./AIRecommendationEngine'),
  { loading: () => <div className="animate-pulse h-32 bg-gray-200 rounded" /> }
)

// Preloading 전략
const preloadHeavyComponents = () => {
  import('./ProductCatalog')
  import('./AdvancedVisualization')
}

export function QuotingWizard() {
  useEffect(() => {
    // 유휴 시간에 무거운 컴포넌트 프리로드
    const timer = setTimeout(preloadHeavyComponents, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <Suspense fallback={<QuoteWizardSkeleton />}>
        <ProductCatalog />
      </Suspense>

      <Suspense fallback={<div>Loading recommendations...</div>}>
        <AIRecommendationEngine />
      </Suspense>
    </div>
  )
}
```

### 5.3 Next.js 16 Partial Prerendering

```typescript
// src/app/quote/loading.tsx
export default function QuoteLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-1/3" />
      <div className="h-64 bg-gray-200 rounded mb-4" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  )
}

// src/app/quote/page.tsx
import { QuoteWizard } from '@/components/quote-system/QuoteWizard'
import { getProductData } from '@/lib/products'

// Partial Prerendering 설정
export const experimental_ppr = true

export default async function QuotePage() {
  // 초기 데이터 서버 사이드 페칭
  const initialProductData = await getProductData()

  return (
    <div>
      <QuoteWizard initialData={initialProductData} />
    </div>
  )
}
```

## 6. 실시간 피드백 시스템

### 6.1 사용자 입력에 따른 즉각적 UI 업데이트

```typescript
// src/hooks/use-realtime-feedback.ts
'use client'

import { useCallback, useEffect } from 'react'
import { useOptimistic } from 'react'

export function useRealtimeFeedback(
  initialData: QuoteData,
  onValidationChange: (isValid: boolean, errors: ValidationError[]) => void
) {
  const [optimisticData, updateData] = useOptimistic(
    initialData,
    (state, update: Partial<QuoteData>) => ({
      ...state,
      ...update,
      lastUpdated: Date.now()
    })
  )

  // 실시간 유효성 검사
  const validateInput = useCallback((data: QuoteData) => {
    const errors: ValidationError[] = []

    // 제품 타입 검증
    if (!data.productType) {
      errors.push({ field: 'productType', message: '제품 타입을 선택해주세요' })
    }

    // 사이즈 검증
    if (data.specifications?.size) {
      const { width, height, depth } = data.specifications.size
      if (width < 10 || height < 10) {
        errors.push({
          field: 'size',
          message: '최소 크기는 10mm입니다'
        })
      }
    }

    // 최소 주문 수량 검증
    if (data.specifications?.quantity < 100) {
      errors.push({
        field: 'quantity',
        message: '최소 주문 수량은 100개입니다'
      })
    }

    const isValid = errors.length === 0
    onValidationChange(isValid, errors)

    return { isValid, errors }
  }, [onValidationChange])

  // 데이터 변경 시 자동 유효성 검사
  useEffect(() => {
    validateInput(optimisticData)
  }, [optimisticData, validateInput])

  const updateField = useCallback((
    field: keyof QuoteData,
    value: any
  ) => {
    updateData({ [field]: value })
  }, [updateData])

  return {
    data: optimisticData,
    updateField,
    validate: validateInput
  }
}
```

### 6.2 가격 변동 시각화 컴포넌트

```typescript
// src/components/quote-system/PriceChangeVisualization.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PriceChange {
  field: string
  oldValue: number
  newValue: number
  timestamp: number
}

export function PriceChangeVisualization({
  priceChanges
}: PriceChangeVisualizationProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {priceChanges.map((change, index) => (
          <motion.div
            key={`${change.timestamp}-${index}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]"
          >
            <div className="flex items-center space-x-2">
              <PriceChangeIcon change={change} />
              <div className="flex-1">
                <div className="text-sm font-medium">{change.field}</div>
                <div className="text-xs text-gray-600">
                  ¥{change.oldValue.toLocaleString()} → ¥{change.newValue.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function PriceChangeIcon({ change }: { change: PriceChange }) {
  const diff = change.newValue - change.oldValue

  if (diff > 0) {
    return <TrendingUp className="w-4 h-4 text-red-500" />
  } else if (diff < 0) {
    return <TrendingDown className="w-4 h-4 text-green-500" />
  } else {
    return <Minus className="w-4 h-4 text-gray-400" />
  }
}
```

### 6.3 로딩 상태 및 에러 처리 개선

```typescript
// src/components/quote-system/EnhancedLoadingStates.tsx
'use client'

import { motion } from 'framer-motion'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

interface LoadingStep {
  id: string
  title: string
  status: 'pending' | 'loading' | 'complete' | 'error'
  error?: string
}

export function EnhancedLoadingStates({ steps }: { steps: LoadingStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <StepIcon status={step.status} />

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {step.title}
            </div>
            {step.error && (
              <div className="text-xs text-red-600 mt-1">
                {step.error}
              </div>
            )}
          </div>

          {step.status === 'loading' && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          )}
        </motion.div>
      ))}
    </div>
  )
}

function StepIcon({ status }: { status: LoadingStep['status'] }) {
  switch (status) {
    case 'pending':
      return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    case 'loading':
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    case 'complete':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-500" />
  }
}
```

## 7. 타입스크립트 엄격 타입 검증

### 7.1 통합 타입 정의

```typescript
// src/types/quote-system.ts
export interface UnifiedQuoteData {
  id: string
  expertiseLevel: 'beginner' | 'expert'
  productType: ProductType
  specifications: ProductSpecifications
  postProcessing: PostProcessingOption[]
  quantity: number
  delivery: DeliveryOptions
  pricing: PricingInfo
  metadata: QuoteMetadata
}

export interface ProductType {
  id: string
  name: string
  nameJa: string
  category: ProductCategory
  basePrice: number
  imageUrls: string[]
  specifications: ProductSpecificationTemplate
}

export interface ProductSpecifications {
  size: {
    width: number
    height: number
    depth: number
    unit: 'mm' | 'cm'
  }
  material: Material
  thickness: Thickness
  printing?: PrintingOptions
  finish?: FinishOptions
}

// Zod 스키마
export const unifiedQuoteSchema = z.object({
  expertiseLevel: z.enum(['beginner', 'expert']),
  productType: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string()
  }),
  specifications: z.object({
    size: z.object({
      width: z.number().min(10),
      height: z.number().min(10),
      depth: z.number().min(0),
      unit: z.enum(['mm', 'cm'])
    }),
    material: z.string().min(1),
    thickness: z.number().min(0.1),
    quantity: z.number().min(100)
  }),
  postProcessing: z.array(z.string()).optional(),
  quantity: z.number().min(100)
})

export type UnifiedQuoteFormData = z.infer<typeof unifiedQuoteSchema>
```

### 7.2 엄격한 타입 검증 미들웨어

```typescript
// src/lib/type-guards.ts
export function isValidProductType(value: unknown): value is ProductType {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'category' in value && typeof value.category === 'string'
  )
}

export function validateQuoteData(data: unknown): data is UnifiedQuoteData {
  try {
    return unifiedQuoteSchema.parse(data)
  } catch (error) {
    console.error('Quote data validation failed:', error)
    return false
  }
}

// 런타임 타입 체크 훅
export function useTypeSafeQuoteData(initialData: unknown) {
  const [data, setData] = useState<UnifiedQuoteData | null>(
    validateQuoteData(initialData) ? initialData : null
  )

  const updateData = useCallback((newData: unknown) => {
    if (validateQuoteData(newData)) {
      setData(newData)
    } else {
      console.error('Invalid quote data provided:', newData)
      // 에러 처리 로직
    }
  }, [])

  return { data, updateData }
}
```

## 8. 접근성(WCAG 2.1 AA) 준수

### 8.1 키보드 네비게이션 및 포커스 관리

```typescript
// src/hooks/use-accessible-navigation.ts
'use client'

import { useCallback, useEffect } from 'react'

export function useAccessibleNavigation() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Escape 키로 현재 모달/드롭다운 닫기
    if (event.key === 'Escape') {
      const activeElement = document.activeElement
      const closestModal = activeElement?.closest('[role="dialog"]')

      if (closestModal) {
        const closeButton = closestModal.querySelector('[data-close]')
        if (closeButton instanceof HTMLElement) {
          closeButton.click()
        }
      }
    }

    // Tab 키 포커스 트래핑
    if (event.key === 'Tab') {
      const activeElement = document.activeElement
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    trapFocus: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }
    },
    restoreFocus: (element: HTMLElement) => {
      element.focus()
    }
  }
}
```

### 8.2 스크린 리더 최적화

```typescript
// src/components/quote-system/AccessibleStepNavigation.tsx
'use client'

export function AccessibleStepNavigation({
  currentStep,
  totalSteps,
  steps
}: AccessibleStepNavigationProps) {
  return (
    <nav
      aria-label="견적 단계 네비게이션"
      role="navigation"
      className="flex items-center justify-center space-x-4"
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => /* 단계 이동 로직 */}
              disabled={!isCompleted}
              aria-current={isActive ? 'step' : undefined}
              aria-describedby={`${step.id}-description`}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isActive ? 'bg-blue-500 text-white' : ''}
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              <span className="sr-only">
                {isCompleted ? '완료된' : ''} {step.title} {isActive ? '(현재 단계)' : ''}
              </span>
              {isCompleted ? (
                <CheckIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{index + 1}</span>
              )}
            </button>

            <div id={`${step.id}-description`} className="sr-only">
              {step.description}
            </div>

            {index < steps.length - 1 && (
              <div
                className="w-16 h-1 bg-gray-300 mx-2"
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

## 9. 모바일 우선 반응형 디자인

### 9.1 반응형 그리드 시스템

```typescript
// src/components/quote-system/ResponsiveQuoteGrid.tsx
'use client'

import { useBreakpoint } from '@/hooks/use-breakpoint'

export function ResponsiveQuoteGrid({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint()

  const gridClasses = {
    mobile: 'grid-cols-1 gap-4',
    tablet: 'grid-cols-2 gap-6',
    desktop: 'grid-cols-3 gap-8',
    wide: 'grid-cols-4 gap-8'
  }

  return (
    <div className={`grid ${gridClasses[breakpoint]}`}>
      {children}
    </div>
  )
}

// 반응형 훅
function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('mobile')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) setBreakpoint('mobile')
      else if (width < 1024) setBreakpoint('tablet')
      else if (width < 1280) setBreakpoint('desktop')
      else setBreakpoint('wide')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}
```

### 9.2 모바일 최적화 터치 인터랙션

```typescript
// src/components/quote-system/MobileOptimizedControls.tsx
'use client'

export function MobileOptimizedControls() {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      // 다음 단계로
    } else if (isRightSwipe) {
      // 이전 단계로
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="touch-pan-y"
    >
      {/* 컨텐츠 */}
    </div>
  )
}
```

## 10. 구현 우선순위 및 단계별 계획

### Phase 1: 핵심 아키텍처 통합 (1-2주)
1. **통합 상태 관리 시스템 구현**
   - Zustand 기반 글로벌 상태 관리
   - React Hook Form + Zod 유효성 검사
   - useOptimistic 최적화 적용

2. **기본 컴포넌트 구조 개편**
   - Server/Client Component 분리
   - 통합된 QuoteWizard 컴포넌트
   - 기본 스텝 네비게이션

### Phase 2: 스텝 1 통합 및 AI 추천 (2-3주)
1. **통합된 제품 선택 단계**
   - 제품 타입, 사이즈, 소재, 두께 단일 단계 통합
   - AI 추천 시스템 기본 구현
   - 실시간 가격 계산 기능

2. **견적 상단 박스 재설계**
   - 고정형 실시간 가격 표시
   - 진행 상황 시각화 컴포넌트
   - 하단 중앙 액션 버튼 배치

### Phase 3: 후가공 및 UI/UX 개선 (2주)
1. **후가공 옵션 재설계**
   - 카테고리별 그룹화
   - 상호작용형 옵션 카드
   - 최소 비용 정책 구현

2. **실시간 피드백 시스템**
   - 즉각적 UI 업데이트
   - 가격 변동 시각화
   - 향상된 로딩 상태

### Phase 4: 성능 최적화 및 접근성 (1주)
1. **최적화 구현**
   - 코드 스플리팅 및 지연 로딩
   - Partial Prerendering 적용
   - React 19 최적화 활용

2. **접근성 및 모바일 최적화**
   - WCAG 2.1 AA 준수
   - 모바일 우선 반응형 디자인
   - 키보드 네비게이션 개선

이 구현 계획은 현재 코드베이스를 체계적으로 개선하면서 사용자 경험을 크게 향상시킬 수 있는 실현 가능한 로드맵을 제공합니다.