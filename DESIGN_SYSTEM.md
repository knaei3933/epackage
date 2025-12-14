# Epackage Lab Design System

Epackage Lab을 위한 현대적이고 접근성 높은 디자인 시스템입니다. Tailwind CSS 4를 기반으로 구축되었으며, 일본어와 한국어 타이포그래피에 최적화되어 있습니다.

## 특징

### 🎨 디자인 시스템
- **Tailwind CSS 4**: 최신 CSS 프레임워크 사용
- **CSS 커스텀 속성**: 유연한 테마 및 색상 시스템
- **다크 모드 지원**: 시스템 테마 자동 감지 및 수동 전환
- **일본어/한국어 최적화**: 타이포그래피 및 문자 간격 최적화
- **메탈릭 디자인**: 금속적 액센트 및 프리미엄 느낌

### 🛠️ UI 컴포넌트
- **버튼**: 다양한 스타일, 사이즈, 상태 지원
- **입력 필드**: 아이콘, 검증, 문자 카운트 기능
- **카드**: 유연한 레이아웃 및 상호작용 효과
- **배지**: 상태, 통화, 태그 등 다양한 유형
- **선택자**: 검색, 지우기 기능 지원

### 🏗️ 레이아웃 시스템
- **컨테이너**: 반응형 최대 너비 시스템
- **그리드**: 유연한 반응형 그리드 레이아웃
- **플렉스**: 다양한 플렉스박스 레이아웃 옵션

## 설치 및 설정

### 필수 의존성

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.554.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

### 테마 설정

`tailwind.config.ts` 파일에 Epackage Lab 테마 설정이 포함되어 있습니다:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brixa: {
          // 브리ixa 브랜드 컬러
        },
        bg: {
          // 배경색
        },
        text: {
          // 텍스트 색상
        },
        border: {
          // 테두리 색상
        },
      },
    },
  },
}
```

## 사용 방법

### 1. Theme Provider 설정

```tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <ThemeProvider defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2. 컴포넌트 사용

```tsx
import { Button, Input, Card } from '@/components/ui'

export default function MyComponent() {
  return (
    <Card>
      <Input
        label="이름"
        placeholder="이름을 입력하세요"
        leftIcon={<UserIcon />}
      />
      <Button variant="primary" loading={isLoading}>
        제출
      </Button>
    </Card>
  )
}
```

### 3. 레이아웃 컴포넌트

```tsx
import { Container, Grid, Flex } from '@/components/ui'

export default function LayoutExample() {
  return (
    <Container size="6xl">
      <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
        <GridItem>
          {/* 콘텐츠 */}
        </GridItem>
      </Grid>

      <Flex justify="between" align="center" gap="md">
        {/* 콘텐츠 */}
      </Flex>
    </Container>
  )
}
```

### 4. 다크 모드 토글

```tsx
import { ThemeToggle } from '@/components/theme/ThemeProvider'

export default function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  )
}
```

## 컴포넌트 API

### Button

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' |
           'destructive' | 'success' | 'warning' | 'info' | 'metallic'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  fullWidth?: boolean
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  badge?: React.ReactNode
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}
```

### Input

```tsx
interface InputProps {
  variant?: 'default' | 'error' | 'success' | 'warning' | 'ghost' | 'filled'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  labelPosition?: 'top' | 'left' | 'right'
  showCharCount?: boolean
  maxLength?: number
  loading?: boolean
}
```

### Card

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'metallic' | 'interactive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  hover?: boolean
  loading?: boolean
  overlay?: React.ReactNode
}
```

### Grid

```tsx
interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
         'auto' | 'auto-sm' | 'auto-md' | 'auto-lg' | 'none'
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 |
        'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  xs?: GridProps['cols']
  sm?: GridProps['cols']
  md?: GridProps['cols']
  lg?: GridProps['cols']
  xl?: GridProps['cols']
  '2xl'?: GridProps['cols']
}
```

## 색상 시스템

### 브랜드 컬러
- **Primary**: `brixa-50` ~ `brixa-900`
- **Metallic**: 실버, 골드, 코퍼, 블루

### 세만틱 컬러
- **Success**: 초록색 계열
- **Warning**: 노란색 계열
- **Error**: 빨간색 계열
- **Info**: 파란색 계열

### 뉴트럴 컬러
- **Gray**: `gray-50` ~ `gray-900`
- **Background**: `bg-primary`, `bg-secondary`, `bg-accent`
- **Text**: `text-primary`, `text-secondary`, `text-tertiary`

## 타이포그래피

일본어와 한국어 텍스트를 위한 최적화된 클래스:

```tsx
// 일본어 최적화
<div className="japanese-text">일본어 텍스트</div>
<div className="japanese-heading">일본어 제목</div>

// 한국어 최적화
<div className="korean-text">한국어 텍스트</div>
<div className="korean-heading">한국어 제목</div>
```

## 접근성

- WCAG 2.1 AA 준수
- 키보드 내비게이션 지원
- 스크린 리더 호환
- 충분한 색상 대비율
- 포커스 상태 시각적 표시

## 브라우저 지원

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 개발 가이드

### 컴포넌트 추가

1. 새 컴포넌트 파일 생성: `src/components/ui/ComponentName.tsx`
2. `class-variance-authority`로 변형 정의
3. TypeScript 인터페이스 정의
4. `src/components/ui/index.ts`에 export 추가

### 스타일 커스터마이징

`globals.css`의 CSS 커스텀 속성 수정:

```css
:root {
  --brixa-primary: #your-color;
  /* 다른 색상들... */
}
```

### 다크 모드 추가

새 색상에 대한 다크 모드 변수 추가:

```css
.dark {
  --your-color: #dark-mode-color;
}
```

## 데모

디자인 시스템 데모 페이지: `/design-system`

모든 컴포넌트와 기능을 실시간으로 확인할 수 있습니다.

## 라이선스

Epackage Lab 내부 사용용으로 제작되었습니다.