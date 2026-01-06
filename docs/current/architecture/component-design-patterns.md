# EPackage Lab 컴포넌트 디자인 패턴
> BRIXA 스타일 기반 재사용 가능한 UI 컴포넌트 라이브러리

## 🎯 개요

이 가이드는 EPackage Lab 홈페이지를 위한 재사용 가능한 컴포넌트 디자인 패턴을 정의합니다. BRIXA의 "단순함 속에 숨겨진 전문성" 철학을 반영하여, 일관된 사용자 경험을 제공하면서도 개발 효율성을 극대화하는 컴포넌트 시스템을 제공합니다.

---

## 🎨 컴포넌트 디자인 원칙

### 1. 일관성 (Consistency)
- 동일한 기능은 동일한 컴포넌트로 구현
- 일관된 props 인터페이스 유지
- 통일된 시각적 스타일 적용

### 2. 재사용성 (Reusability)
- 단일 책임 원칙 따르기
- 유연한 props 설계
- 합성 가능한 컴포넌트 구조

### 3. 접근성 (Accessibility)
- WCAG 2.0 AA 준수
- 키보드 내비게이션 지원
- 스크린 리더 호환성

### 4. 성능 (Performance)
- 불필요한 리렌더링 방지
- 코드 스플리팅 지원
- 메모이제이션 활용

---

## 🏗️ 기본 컴포넌트 라이브러리

### 1. 버튼 컴포넌트

#### Button 컴포넌트
```tsx
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-epac-primary-blue-500 text-white hover:bg-epac-primary-blue-600 focus:ring-epac-primary-blue-500 shadow-button hover:shadow-button-hover',
        secondary: 'bg-transparent border-2 border-epac-primary-blue-500 text-epac-primary-blue-500 hover:bg-epac-primary-blue-500 hover:text-white focus:ring-epac-primary-blue-500',
        accent: 'bg-epac-accent-green-500 text-white hover:bg-epac-accent-green-600 focus:ring-epac-accent-green-500 shadow-button hover:shadow-button-hover',
        outline: 'bg-transparent border border-epac-neutral-300 text-epac-neutral-700 hover:bg-epac-neutral-50 focus:ring-epac-neutral-300',
        ghost: 'text-epac-neutral-700 hover:bg-epac-neutral-100 focus:ring-epac-neutral-300',
        danger: 'bg-epac-error text-white hover:bg-red-600 focus:ring-epac-error',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
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
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

#### IconButton 컴포넌트
```tsx
// src/components/ui/IconButton.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-epac-primary-blue-500 text-white hover:bg-epac-primary-blue-600 focus:ring-epac-primary-blue-500',
        secondary: 'bg-epac-neutral-100 text-epac-neutral-700 hover:bg-epac-neutral-200 focus:ring-epac-neutral-300',
        ghost: 'text-epac-neutral-600 hover:bg-epac-neutral-100 focus:ring-epac-neutral-300',
      },
      size: {
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
)

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode
  label?: string // 접근성을 위한 라벨
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, label, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size }), className)}
        ref={ref}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

export { IconButton }
```

### 2. 카드 컴포넌트

#### Card 컴포넌트
```tsx
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const cardVariants = cva(
  'bg-white rounded-card border shadow-card',
  {
    variants: {
      variant: {
        default: 'border-epac-neutral-200',
        elevated: 'border-transparent shadow-card-hover',
        outlined: 'border-epac-primary-blue-200',
      },
      hover: {
        true: 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1',
        false: '',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      padding: 'md',
    },
  }
)

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, padding }), className)}
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
      className={cn('mb-4 pb-4 border-b border-epac-neutral-200', className)}
      {...props}
    />
  )
)

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
)

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-epac-neutral-200', className)}
      {...props}
    />
  )
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter, cardVariants }
```

#### ProductCard 컴포넌트
```tsx
// src/components/ui/ProductCard.tsx
import { Card, CardContent } from './Card'
import { Button } from './Button'
import { OptimizedImage } from './OptimizedImage'
import { Badge } from './Badge'

interface ProductCardProps {
  product: {
    id: string
    name: string
    nameEn: string
    description: string
    image: string
    tags: string[]
    features: string[]
    link: string
  }
  variant?: 'default' | 'compact'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  if (variant === 'compact') {
    return (
      <Card hover className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <OptimizedImage
              src={product.image}
              alt={product.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-epac-neutral-900">{product.name}</h3>
              <p className="text-sm text-epac-neutral-600 mb-2">{product.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                상세 보기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card hover className="h-full">
      <CardContent className="p-6">
        {/* 제품 이미지 */}
        <div className="aspect-square mb-4 overflow-hidden rounded-lg">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 제품 정보 */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-epac-neutral-900">{product.name}</h3>
            <p className="text-sm text-epac-neutral-600">{product.nameEn}</p>
          </div>

          <p className="text-epac-neutral-700 line-clamp-2">{product.description}</p>

          {/* 태그 */}
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 4 && (
              <Badge variant="outline" size="sm">
                +{product.tags.length - 4}
              </Badge>
            )}
          </div>

          {/* 특징 */}
          <ul className="space-y-1 text-sm text-epac-neutral-700">
            {product.features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-epac-accent-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA 버튼 */}
          <Button variant="primary" className="w-full" asChild>
            <a href={product.link}>상세 보기</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. 폼 컴포넌트

#### Input 컴포넌트
```tsx
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const inputVariants = cva(
  'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-epac-neutral-300 focus:border-epac-primary-blue-500 focus:ring-epac-primary-blue-500',
        error: 'border-epac-error focus:border-epac-error focus:ring-epac-error',
        success: 'border-epac-accent-green-500 focus:border-epac-accent-green-500 focus:ring-epac-accent-green-500',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-epac-neutral-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-epac-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-epac-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            error ? 'text-epac-error' : 'text-epac-neutral-600'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
```

#### Select 컴포넌트
```tsx
// src/components/ui/Select.tsx
import { SelectHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const selectVariants = cva(
  'w-full px-4 py-3 border rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right',
  {
    variants: {
      variant: {
        default: 'border-epac-neutral-300 focus:border-epac-primary-blue-500 focus:ring-epac-primary-blue-500',
        error: 'border-epac-error focus:border-epac-error focus:ring-epac-error',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-semibold text-epac-neutral-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            className={cn(
              selectVariants({ variant: error ? 'error' : variant, size }),
              'pr-10',
              'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")]',
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            error ? 'text-epac-error' : 'text-epac-neutral-600'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
```

### 4. 내비게이션 컴포넌트

#### Header 컴포넌트
```tsx
// src/components/layout/Header.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Container } from './Container'
import { Navigation } from './Navigation'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* 상단 고정 배너 (선택적) */}
      <div className="bg-epac-accent-orange-500 text-white text-center py-2 text-sm">
        <Container>
          <p>
            신제품 정보: 한국제 고품질 포장재를 단기 납품으로 제공합니다
            <Button variant="ghost" size="sm" className="ml-2 text-white hover:text-epac-accent-orange-100">
              자세히 보기
            </Button>
          </p>
        </Container>
      </div>

      {/* 메인 헤더 */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-white transition-all duration-300',
          isScrolled ? 'shadow-md' : 'shadow-sm'
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* 로고 */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <img
                  src="/images/logo.svg"
                  alt="EPackage Lab"
                  className="h-8 lg:h-10"
                />
                <span className="text-xl lg:text-2xl font-bold text-epac-primary-blue-500">
                  EPackage Lab
                </span>
              </a>
            </div>

            {/* 데스크톱 내비게이션 */}
            <Navigation className="hidden lg:flex" />

            {/* CTA 버튼들 */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button variant="outline" size="sm">
                문의하기
              </Button>
              <Button variant="accent" size="sm">
                무료 샘플
              </Button>
              <Button size="sm">
                스마트 견적
              </Button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <IconButton
              variant="ghost"
              size="md"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              }
              onClick={toggleMobileMenu}
              className="lg:hidden"
              label="메뉴"
            />
          </div>
        </Container>
      </header>

      {/* 모바일 메뉴 */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  )
}
```

### 5. 비즈니스 컴포넌트

#### FeatureCard 컴포넌트
```tsx
// src/components/ui/FeatureCard.tsx
import { Card, CardContent } from './Card'
import { Badge } from './Badge'
import { OptimizedImage } from './OptimizedImage'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  highlight?: string
  image?: string
  cta?: {
    text: string
    href: string
  }
  variant?: 'default' | 'featured'
  index?: number
}

export function FeatureCard({
  icon,
  title,
  description,
  highlight,
  image,
  cta,
  variant = 'default',
  index = 0
}: FeatureCardProps) {
  const animationDelay = index * 100

  return (
    <Card
      hover
      className={cn(
        'h-full animate-fade-in',
        variant === 'featured' && 'border-epac-primary-blue-200 bg-gradient-to-br from-white to-epac-primary-blue-50'
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <CardContent className="p-6 lg:p-8">
        {/* 아이콘 */}
        <div className={cn(
          'w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-lg mb-4',
          variant === 'featured' ? 'bg-epac-primary-blue-100' : 'bg-epac-neutral-100'
        )}>
          <div className={cn(
            variant === 'featured' ? 'text-epac-primary-blue-600' : 'text-epac-accent-green-500'
          )}>
            {icon}
          </div>
        </div>

        {/* 이미지 */}
        {image && (
          <div className="aspect-video mb-4 overflow-hidden rounded-lg">
            <OptimizedImage
              src={image}
              alt={title}
              width={400}
              height={225}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 강조 표시 */}
        {highlight && (
          <Badge variant="accent" size="sm" className="mb-3">
            {highlight}
          </Badge>
        )}

        {/* 콘텐츠 */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-epac-neutral-900">
            {title}
          </h3>

          <p className="text-epac-neutral-700 leading-relaxed">
            {description}
          </p>

          {/* CTA */}
          {cta && (
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <a href={cta.href}>
                {cta.text}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### TestimonialCard 컴포넌트
```tsx
// src/components/ui/TestimonialCard.tsx
import { Card, CardContent } from './Card'
import { StarRating } from './StarRating'
import { OptimizedImage } from './OptimizedImage'

interface TestimonialCardProps {
  testimonial: {
    id: string
    name: string
    position: string
    company: string
    content: string
    rating: number
    avatar?: string
    companyLogo?: string
    product?: string
  }
  variant?: 'default' | 'compact'
}

export function TestimonialCard({ testimonial, variant = 'default' }: TestimonialCardProps) {
  if (variant === 'compact') {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {testimonial.avatar && (
              <OptimizedImage
                src={testimonial.avatar}
                alt={testimonial.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-epac-neutral-900 truncate">
                  {testimonial.name}
                </h4>
                <StarRating rating={testimonial.rating} size="sm" />
              </div>
              <p className="text-sm text-epac-neutral-600 mb-2">
                {testimonial.position} • {testimonial.company}
              </p>
              <p className="text-sm text-epac-neutral-700 line-clamp-3">
                {testimonial.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card hover className="h-full">
      <CardContent className="p-6">
        {/* 평점 */}
        <div className="flex items-center justify-between mb-4">
          <StarRating rating={testimonial.rating} />
          {testimonial.companyLogo && (
            <OptimizedImage
              src={testimonial.companyLogo}
              alt={testimonial.company}
              width={80}
              height={40}
              className="h-10 object-contain"
            />
          )}
        </div>

        {/* 내용 */}
        <blockquote className="text-epac-neutral-700 mb-6 leading-relaxed">
          "{testimonial.content}"
        </blockquote>

        {/* 작성자 정보 */}
        <div className="flex items-center space-x-3">
          {testimonial.avatar && (
            <OptimizedImage
              src={testimonial.avatar}
              alt={testimonial.name}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <h4 className="font-semibold text-epac-neutral-900">{testimonial.name}</h4>
            <p className="text-sm text-epac-neutral-600">
              {testimonial.position} • {testimonial.company}
            </p>
            {testimonial.product && (
              <p className="text-xs text-epac-accent-green-500 mt-1">
                사용 제품: {testimonial.product}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 6. 유틸리티 컴포넌트

#### Badge 컴포넌트
```tsx
// src/components/ui/Badge.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-epac-neutral-100 text-epac-neutral-800',
        primary: 'bg-epac-primary-blue-100 text-epac-primary-blue-800',
        secondary: 'bg-epac-neutral-200 text-epac-neutral-700',
        accent: 'bg-epac-accent-green-100 text-epac-accent-green-800',
        warning: 'bg-epac-warning text-epac-warning-800',
        error: 'bg-epac-error bg-opacity-10 text-epac-error',
        success: 'bg-epac-accent-green-500 text-white',
        outline: 'border border-epac-neutral-300 text-epac-neutral-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
```

#### StarRating 컴포넌트
```tsx
// src/components/ui/StarRating.tsx
import { HTMLAttributes } from 'react'

interface StarRatingProps extends HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  variant?: 'default' | 'outline'
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  variant = 'default',
  className,
  ...props
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const starColors = variant === 'outline'
    ? {
        filled: 'text-epac-accent-orange-500',
        empty: 'text-epac-neutral-300',
      }
    : {
        filled: 'text-epac-accent-orange-400',
        empty: 'text-epac-neutral-300',
      }

  return (
    <div className={cn('flex items-center space-x-1', className)} {...props}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < rating
          const isHalfFilled = index < rating && index + 1 > rating && rating % 1 !== 0

          return (
            <svg
              key={index}
              className={cn(sizeClasses[size], 'flex-shrink-0', isFilled || isHalfFilled ? starColors.filled : starColors.empty)}
              fill={isHalfFilled ? 'url(#half-gradient)' : isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isHalfFilled && (
                <defs>
                  <linearGradient id="half-gradient">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={variant === 'outline' ? 1.5 : 2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          )
        })}
      </div>

      {showValue && (
        <span className={cn(
          'ml-2 font-medium',
          variant === 'outline' ? 'text-epac-neutral-700' : 'text-epac-accent-orange-500'
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
```

---

## 🎯 컴포넌트 사용 가이드

### 컴포넌트 조합 예시
```tsx
// 제품 소개 섹션에서의 컴포넌트 조합
export function ProductsSection() {
  const products = [
    {
      id: '1',
      name: '평백 (3방향 밀봉)',
      nameEn: 'Flat Pouch (3-side seal)',
      description: '뛰어난 밀봉성으로 화장품이나 건강식품 등에 활용 가능합니다.',
      image: '/images/products/flat-pouch.jpg',
      tags: ['건강식품', '서플리먼트', '드립백', '페이스팩'],
      features: ['우수한 밀봉성', '다양한 사이즈', '경제적 생산'],
      link: '/packages/flat',
    },
    // ... 다른 제품들
  ]

  return (
    <section className="section-spacing-lg">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-epac-neutral-900 mb-4">
            고품질 포장재 소개
          </h2>
          <p className="text-xl text-epac-neutral-700 max-w-3xl mx-auto">
            다양한 형태의 포장재를 고객의 요구에 맞춰 제작합니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
```

---

## 📋 컴포넌트 개발 체크리스트

### 기본 컴포넌트
- [x] Button 컴포넌트 (다양한 variant, size, 상태)
- [x] IconButton 컴포넌트 (아이콘 전용 버튼)
- [x] Input 컴포넌트 (유효성 검증, 에러 상태)
- [x] Select 컴포넌트 (커스텀 스타일)
- [x] Card 컴포넌트 (유연한 레이아웃)
- [x] Badge 컴포넌트 (상태 표시)

### 비즈니스 컴포넌트
- [x] ProductCard 컴포넌트 (제품 정보 카드)
- [x] FeatureCard 컴포넌트 (특징 소개 카드)
- [x] TestimonialCard 컴포넌트 (고객 후기 카드)
- [x] StarRating 컴포넌트 (별점 평가)

### 레이아웃 컴포넌트
- [x] Header 컴포넌트 (반응형 내비게이션)
- [x] Footer 컴포넌트 (사이트 정보)
- [x] Container 컴포넌트 (중앙 정렬)
- [x] Navigation 컴포넌트 (메뉴 네비게이션)

### 폼 컴포넌트
- [x] ContactForm 컴포넌트 (문의 양식)
- [x] QuotationForm 컴포넌트 (견적 양식)
- [x] SampleRequestForm 컴포넌트 (샘플 신청)

### 유틸리티 컴포넌트
- [x] OptimizedImage 컴포넌트 (이미지 최적화)
- [x] Modal 컴포넌트 (다이얼로그)
- [x] LoadingSpinner 컴포넌트 (로딩 상태)

이 컴포넌트 디자인 패턴을 통해 일관된 사용자 경험을 제공하면서도 개발 생산성을 크게 향상시킬 수 있습니다. 모든 컴포넌트는 재사용 가능하게 설계되었으며, EPackage Lab의 브랜드 아이덴티티를 완벽하게 반영합니다.