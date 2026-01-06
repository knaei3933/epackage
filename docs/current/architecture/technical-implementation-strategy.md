# EPackage Lab 기술 구현 전략
> BRIXA 스타일 기반 Next.js, React, Tailwind CSS 활용 가이드

## 🎯 개요

이 문서는 BRIXA 스타일의 미니멀하고 전문적인 B2B 홈페이지를 Next.js, React, Tailwind CSS를 활용하여 구현하기 위한 상세 기술 전략을 정의합니다. 한국 제조 EPackage Lab의 기술적 우위를 효과적으로 전달하면서도 성능, 접근성, 유지보수성을 모두 만족하는 기술 아키텍처를 제시합니다.

---

## 🏗️ 기술 스택 선택 근거

### 프론트엔드 프레임워크
**Next.js 16 + React 19**
- **SEO 최적화**: SSG/ISR을 통한 검색 엔진 최적화
- **성능**: 코드 스플리팅, 자동 이미지 최적화
- **개발 경험**: Fast Refresh, TypeScript 지원
- **B2B 요구사항**: 정적 사이트 생성으로 높은 보안성

### 스타일링 프레임워크
**Tailwind CSS 3.x + Headless UI**
- **디자인 시스템**: 유틸리티 기반의 일관된 디자인
- **성능**: PurgeCSS로 사용하지 않는 CSS 제거
- **반응형**: 모바일 퍼스트 접근 용이
- **유지보수**: 컴포넌트 중심의 스타일 관리

### 상태 관리
**Zustand + React Query (TanStack Query)**
- **경량성**: Zustand의 단순한 상태 관리
- **서버 상태**: React Query를 통한 데이터 패칭 및 캐싱
- **타입스크립트**: 완벽한 타입 지원

### 타입 시스템
**TypeScript 5.x**
- **안정성**: 컴파일 타임 에러 검출
- **생산성**: IDE 자동완성 및 리팩토링 지원
- **협업**: 코드 계약서 역할

---

## 🎨 Tailwind CSS 커스텀 설정

### 기본 설정 파일
```javascript
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // EPackage Lab 브랜드 색상
      colors: {
        epac: {
          'primary-blue': {
            50: '#E6F0FF',
            100: '#CCDBFF',
            200: '#99B8FF',
            300: '#6694FF',
            400: '#3370FF',
            500: '#0052CC', // Primary
            600: '#003D99',
            700: '#002966',
            800: '#001433',
            900: '#000A1A',
          },
          'accent-green': {
            50: '#E6FFF9',
            100: '#CCFFF2',
            200: '#99FFE5',
            300: '#66FFCC',
            400: '#33FFB3',
            500: '#00A878', // Accent
            600: '#008A62',
            700: '#006C4C',
            800: '#004E36',
            900: '#003020',
          },
          'accent-orange': {
            50: '#FFF5F0',
            100: '#FFE6DB',
            200: '#FFCCB6',
            300: '#FFB399',
            400: '#FF997C',
            500: '#FF6B35', // Accent
            600: '#E55A2B',
            700: '#CC4922',
            800: '#B23819',
            900: '#992711',
          },
          'neutral': {
            50: '#FAFBFC',
            100: '#F7FAFC',
            200: '#E2E8F0',
            300: '#CBD5E0',
            400: '#A0B3C7',
            500: '#718096',
            600: '#4A5568',
            700: '#2D3748',
            800: '#1A202C',
            900: '#0F1419',
          }
        }
      },

      // 한글/일본어 폰트 패밀리
      fontFamily: {
        sans: [
          'Noto Sans KR',
          'Noto Sans CJK JP',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          ...defaultTheme.fontFamily.sans,
        ],
        korean: ['Noto Sans KR', 'Noto Sans CJK JP', 'sans-serif'],
        display: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },

      // 커스텀 폰트 크기 (타이포그래피 스케일)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
      },

      // 커스텀 스페이싱
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // 커스텀 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-in': 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // 커스텀 keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },

      // 커스텀 섀도우
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'button': '0 4px 12px rgba(0, 82, 204, 0.15)',
        'button-hover': '0 6px 20px rgba(0, 82, 204, 0.25)',
      },

      // 커스텀 보더 라디우스
      borderRadius: {
        'card': '1rem',
        'button': '0.5rem',
        'input': '0.5rem',
      }
    },
  },

  // 플러그인 설정
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],

  // 다크 모드 설정 (선택적)
  darkMode: 'class',
}
```

---

## 🏗️ 컴포넌트 아키텍처

### 파일 구조
```
src/
├── components/
│   ├── ui/                    # 재사용 가능한 기본 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/                # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── Container.tsx
│   ├── sections/              # 페이지 섹션 컴포넌트
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Products.tsx
│   │   └── Testimonials.tsx
│   └── forms/                 # 폼 컴포넌트
│       ├── ContactForm.tsx
│       ├── QuotationForm.tsx
│       └── SampleRequestForm.tsx
├── hooks/                     # 커스텀 훅
│   ├── useQuotation.ts
│   ├── useAnalytics.ts
│   └── useContact.ts
├── store/                     # 상태 관리
│   ├── quotationStore.ts
│   └── contactStore.ts
├── types/                     # 타입 정의
│   ├── quotation.ts
│   ├── product.ts
│   └── contact.ts
├── utils/                     # 유틸리티 함수
│   ├── validation.ts
│   ├── formatting.ts
│   └── constants.ts
└── styles/                    # 글로벌 스타일
    ├── globals.css
    └── components.css
```

### 기본 UI 컴포넌트 예시

#### Button 컴포넌트
```tsx
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-epac-primary-blue-500 text-white hover:bg-epac-primary-blue-600 focus:ring-epac-primary-blue-500 shadow-button hover:shadow-button-hover',
      secondary: 'bg-transparent border-2 border-epac-primary-blue-500 text-epac-primary-blue-500 hover:bg-epac-primary-blue-500 hover:text-white focus:ring-epac-primary-blue-500',
      accent: 'bg-epac-accent-green-500 text-white hover:bg-epac-accent-green-600 focus:ring-epac-accent-green-500 shadow-button hover:shadow-button-hover',
      outline: 'bg-transparent border border-epac-neutral-300 text-epac-neutral-700 hover:bg-epac-neutral-50 focus:ring-epac-neutral-300',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

#### Card 컴포넌트
```tsx
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-card shadow-card border border-epac-neutral-200',
          hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pb-4 border-b border-epac-neutral-200', className)}
      {...props}
    />
  )
)

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
)

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-4 border-t border-epac-neutral-200', className)}
      {...props}
    />
  )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
```

---

## 🎯 페이지 구현 전략

### 메인 페이지 구조
```tsx
// src/app/page.tsx
import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Products } from '@/components/sections/Products'
import { Testimonials } from '@/components/sections/Testimonials'
import { CallToAction } from '@/components/sections/CallToAction'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-epac-neutral-50">
      <Hero />
      <Features />
      <Products />
      <Testimonials />
      <CallToAction />
    </main>
  )
}
```

### Hero 섹션 컴포넌트
```tsx
// src/components/sections/Hero.tsx
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-white to-epac-neutral-50 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* 텍스트 콘텐츠 */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-epac-neutral-900 leading-tight">
              한국 제조 기술력으로
              <br />
              <span className="text-epac-primary-blue-500">
                일본의 것づくり를 지원합니다
              </span>
            </h1>

            <p className="text-xl text-epac-neutral-700 leading-relaxed">
              100개부터 가능한 소량 생업, 최단 10일 납품,
              한국 제조업의 고품질로 일본 비즈니스를 혁신합니다.
            </p>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1">
                무료 샘플 신청
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                상담 문의
              </Button>
            </div>
          </div>

          {/* 비주얼 콘텐츠 */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/images/hero-packaging.jpg"
                alt="고품질 패키징 제품"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            {/* 배경 장식 요소 */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-epac-primary-blue-100 rounded-full opacity-50 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-epac-accent-green-100 rounded-full opacity-50 blur-3xl" />
          </div>
        </div>
      </Container>
    </section>
  )
}
```

---

## 🔄 상태 관리 구현

### Zustand를 활용한 견적 시스템 상태 관리
```typescript
// src/store/quotationStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface QuotationState {
  // 기본 정보
  orderType: 'new' | 'repeat'
  contentsType: 'solid' | 'liquid' | 'powder'
  bagType: string
  width: number
  height: number

  // 재료 정보
  materialGenre: string
  surfaceMaterial: string
  materialComposition: string

  // 수량 정보
  quantities: number[]
  deliveryDate: Date | null

  // 계산 결과
  results: QuotationResult[]

  // 액션
  updateBasicInfo: (info: Partial<QuotationState>) => void
  updateMaterialInfo: (info: Partial<QuotationState>) => void
  updateQuantities: (quantities: number[]) => void
  calculateQuotation: () => void
  resetQuotation: () => void
}

interface QuotationResult {
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveryDays: number
}

export const useQuotationStore = create<QuotationState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        orderType: 'new',
        contentsType: 'solid',
        bagType: 'flat_3_side',
        width: 100,
        height: 200,
        materialGenre: 'opp_al',
        surfaceMaterial: 'gloss_opp',
        materialComposition: 'comp_1',
        quantities: [1000],
        deliveryDate: null,
        results: [],

        // 액션 구현
        updateBasicInfo: (info) => set((state) => ({ ...state, ...info })),

        updateMaterialInfo: (info) => set((state) => ({ ...state, ...info })),

        updateQuantities: (quantities) => {
          set({ quantities })
          get().calculateQuotation()
        },

        calculateQuotation: () => {
          const state = get()
          const results = state.quantities.map(quantity => {
            const area = state.width * state.height
            const materialCost = area * getMaterialPrice(state.materialGenre) * 0.01
            const processingCost = getProcessingPrice(state.bagType)
            const baseCost = 50000 // 기본 비용

            const totalMaterialCost = materialCost * quantity
            const totalProcessingCost = processingCost * quantity
            const subtotal = totalMaterialCost + totalProcessingCost + baseCost

            // 수량 할인
            const discount = quantity >= 10000 ? 0.2 : quantity >= 5000 ? 0.1 : 0
            const totalCost = subtotal * (1 - discount)

            return {
              quantity,
              unitPrice: Math.round(totalCost / quantity),
              totalPrice: Math.round(totalCost),
              deliveryDays: getDeliveryDays(quantity, state.orderType),
            }
          })

          set({ results })
        },

        resetQuotation: () => set({
          orderType: 'new',
          contentsType: 'solid',
          bagType: 'flat_3_side',
          width: 100,
          height: 200,
          materialGenre: 'opp_al',
          surfaceMaterial: 'gloss_opp',
          materialComposition: 'comp_1',
          quantities: [1000],
          deliveryDate: null,
          results: [],
        }),
      }),
      {
        name: 'quotation-storage',
      }
    )
  )
)

// 헬퍼 함수
function getMaterialPrice(genre: string): number {
  const prices = {
    'opp_al': 0.05,
    'pet_al': 0.06,
    'nylon_al': 0.07,
  }
  return prices[genre as keyof typeof prices] || 0.05
}

function getProcessingPrice(bagType: string): number {
  const prices = {
    'flat_3_side': 5,
    'stand_up': 8,
    'gusset': 10,
    'box': 12,
  }
  return prices[bagType as keyof typeof prices] || 5
}

function getDeliveryDays(quantity: number, orderType: string): number {
  const baseDays = orderType === 'repeat' ? 10 : 15
  const additionalDays = quantity >= 10000 ? 5 : quantity >= 5000 ? 3 : 0
  return baseDays + additionalDays
}
```

---

## 🎯 폼 유효성 검증 시스템

### React Hook Form + Zod 활용
```typescript
// src/components/forms/ContactForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Zod 스키마 정의
const contactSchema = z.object({
  companyName: z.string().min(1, '회사명을 입력해주세요'),
  department: z.string().optional(),
  name: z.string().min(1, '담당자명을 입력해주세요'),
  position: z.string().optional(),
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  phone: z.string().regex(/^0\d{9,10}$/, '유효한 전화번호를 입력해주세요'),
  inquiryType: z.enum(['general', 'product', 'sample', 'consulting', 'other']),
  interestedProducts: z.string().optional(),
  quantity: z.string().optional(),
  budget: z.string().optional(),
  deliveryDate: z.string().optional(),
  message: z.string().min(10, '문의 내용을 10자 이상 입력해주세요'),
  privacyAgreed: z.boolean().refine(val => val === true, '개인정보 처리방침에 동의해주세요'),
  newsletterAgreed: z.boolean().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      // API 호출
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // 성공 처리
        reset()
        alert('문의가 접수되었습니다.')
      } else {
        throw new Error('문의 접수에 실패했습니다.')
      }
    } catch (error) {
      alert('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
            회사명 *
          </label>
          <Input
            {...register('companyName')}
            error={errors.companyName?.message}
            placeholder="예) 주식회사 OO"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
            부서명
          </label>
          <Input
            {...register('department')}
            placeholder="예) 영업팀"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
            담당자명 *
          </label>
          <Input
            {...register('name')}
            error={errors.name?.message}
            placeholder="예) 김철수"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
            직책
          </label>
          <Input
            {...register('position')}
            placeholder="예) 팀장"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
            이메일 *
          </label>
          <Input
            {...register('email')}
            type="email"
            error={errors.email?.message}
            placeholder="예) company@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
            전화번호 *
          </label>
          <Input
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="예) 0312345678"
          />
        </div>
      </div>

      {/* 문의 유형 */}
      <div>
        <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
          문의 유형 *
        </label>
        <select
          {...register('inquiryType')}
          className="w-full px-4 py-3 border border-epac-neutral-200 rounded-lg focus:ring-2 focus:ring-epac-primary-blue-500 focus:border-epac-primary-blue-500"
        >
          <option value="general">일반 문의</option>
          <option value="product">제품 문의</option>
          <option value="sample">샘플 신청</option>
          <option value="consulting">상담 문의</option>
          <option value="other">기타</option>
        </select>
        {errors.inquiryType && (
          <p className="mt-1 text-sm text-epac-error">{errors.inquiryType.message}</p>
        )}
      </div>

      {/* 문의 내용 */}
      <div>
        <label className="block text-sm font-semibold text-epac-neutral-700 mb-2">
          문의 내용 *
        </label>
        <textarea
          {...register('message')}
          rows={6}
          className="w-full px-4 py-3 border border-epac-neutral-200 rounded-lg focus:ring-2 focus:ring-epac-primary-blue-500 focus:border-epac-primary-blue-500"
          placeholder="문의하실 내용을 상세하게 작성해주세요."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-epac-error">{errors.message.message}</p>
        )}
      </div>

      {/* 동의 항목 */}
      <div className="space-y-4">
        <label className="flex items-start space-x-3">
          <input
            {...register('privacyAgreed')}
            type="checkbox"
            className="mt-1 w-4 h-4 text-epac-primary-blue-500 border-epac-neutral-300 rounded focus:ring-epac-primary-blue-500"
          />
          <span className="text-sm text-epac-neutral-700">
            개인정보 처리방침에 동의합니다. *
          </span>
        </label>
        {errors.privacyAgreed && (
          <p className="text-sm text-epac-error">{errors.privacyAgreed.message}</p>
        )}

        <label className="flex items-start space-x-3">
          <input
            {...register('newsletterAgreed')}
            type="checkbox"
            className="mt-1 w-4 h-4 text-epac-primary-blue-500 border-epac-neutral-300 rounded focus:ring-epac-primary-blue-500"
          />
          <span className="text-sm text-epac-neutral-700">
            뉴스레터 수신에 동의합니다.
          </span>
        </label>
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? '전송 중...' : '문의 제출하기'}
      </Button>
    </form>
  )
}
```

---

## 📱 성능 최적화 전략

### Next.js 최적화 설정
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    domains: ['example.com'], // 외부 이미지 도메인
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 컴파일 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // SWC 압축
  swcMinify: true,

  // 헤드 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // 리디렉션 설정
  async redirects() {
    return [
      // 예: 구 페이지에서 새 페이지로 리디렉션
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ]
  },

  // 웹팩 설정
  webpack: (config, { isServer }) => {
    // SVG 파일 처리
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

module.exports = nextConfig
```

### 이미지 최적화 컴포넌트
```tsx
// src/components/ui/OptimizedImage.tsx
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
  className,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    setImageError(true)
  }

  if (imageError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        {...props}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL={blurDataURL}
      onError={handleError}
      className={`transition-opacity duration-300 ${className}`}
      {...props}
    />
  )
}
```

---

## 🎯 SEO 최적화 전략

### 메타 데이터 설정
```tsx
// src/app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'EPackage Lab - 한국 제조 유연인쇄 포장재 전문',
    template: '%s | EPackage Lab',
  },
  description: '한국 제조 기술력으로 일본의 것づくり를 지원합니다. 100개부터 가능한 소량 생산, 최단 10일 납품. 고품질 유연인쇄 포장재를 합리적인 가격으로 제공합니다.',
  keywords: [
    '유연인쇄 포장재',
    '플렉시블 패키징',
    '소량 생산',
    '단기 납품',
    '한국 제조',
    '패키지 디자인',
    '식품 포장',
    '화장품 포장',
  ],
  authors: [{ name: 'EPackage Lab' }],
  creator: 'EPackage Lab',
  publisher: 'EPackage Lab',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('https://epackage-lab.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ja-JP': '/ja',
      'ko-KR': '/ko',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://epackage-lab.com',
    title: 'EPackage Lab - 한국 제조 유연인쇄 포장재 전문',
    description: '한국 제조 기술력으로 일본의 것づ럴르 지원합니다. 100개부터 가능한 소량 생산, 최단 10일 납품.',
    siteName: 'EPackage Lab',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EPackage Lab 고품질 포장재',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPackage Lab - 한국 제조 유연인쇄 포장재 전문',
    description: '한국 제조 기술력으로 일본의 것づ럴르 지원합니다. 100개부터 가능한 소량 생산, 최단 10일 납품.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}
```

### 구조화 데이터
```tsx
// src/components/SEO/StructuredData.tsx
import Head from 'next/head'

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'Service' | 'Article'
  data: Record<string, any>
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

// 조직 정보 구조화 데이터
export function OrganizationStructuredData() {
  const organizationData = {
    name: 'EPackage Lab',
    alternateName: '이패키지랩',
    url: 'https://epackage-lab.com',
    logo: 'https://epackage-lab.com/images/logo.svg',
    description: '한국 제조 유연인쇄 포장재 전문 기업',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Korean', 'Japanese'],
    },
    sameAs: [
      'https://instagram.com/epackage_lab',
    ],
  }

  return <StructuredData type="Organization" data={organizationData} />
}
```

---

## 🔧 배포 및 운영 전략

### Vercel 배포 설정
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hnd1"], // 일본 (도쿄) 리전
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://epackage-lab.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=123456

# API Keys (서버 전용)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@epackage-lab.com
SMTP_PASS=password
RECAPTCHA_SECRET_KEY=your-recaptcha-secret

# 데이터베이스
DATABASE_URL=postgresql://username:password@localhost:5432/epackage_lab
```

---

## 📋 구현 체크리스트

### 기본 설정
- [x] Next.js 16 프로젝트 생성
- [x] TypeScript 설정
- [x] Tailwind CSS 3.x 설정 및 커스텀 테마
- [x] ESLint + Prettier 설정
- [x] 절대 경로 설정

### 컴포넌트 개발
- [x] 기본 UI 컴포넌트 (Button, Card, Input 등)
- [x] 레이아웃 컴포넌트 (Header, Footer, Container)
- [x] 섹션 컴포넌트 (Hero, Features, Products 등)
- [x] 폼 컴포넌트 (Contact, Quotation, SampleRequest)

### 기능 구현
- [x] 상태 관리 (Zustand)
- [x] 폼 유효성 검증 (React Hook Form + Zod)
- [x] 이미지 최적화 (Next.js Image)
- [x] SEO 최적화 (메타 데이터, 구조화 데이터)

### 성능 및 보안
- [x] 코드 스플리팅 및 레이지 로딩
- [x] 이미지 최적화 및 WebP 변환
- [x] CSP 헤더 설정
- [x] XSS 방지 설정

### 배포 및 운영
- [x] Vercel 배포 설정
- [x] 환경 변수 설정
- [x] 도메인 및 SSL 설정
- [x] 성능 모니터링 설정

이 기술 구현 전략을 통해 BRIXA 스타일의 미니멀하고 전문적인 B2B 홈페이지를 성공적으로 구현할 수 있습니다. 모든 컴포넌트는 재사용 가능하게 설계되었으며, 성능과 접근성을 모두 고려한 아키텍처를 제공합니다.