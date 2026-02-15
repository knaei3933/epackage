# EPackage Lab 디자인 시스템 가이드라인
> BRIXA 스타일 기반 B2B 포장 전문 기업 홈페이지

## 🎯 개요

이 가이드라인은 BRIXA(brixa.jp)의 "단순함 속에 숨겨진 전문성" 디자인 철학을 기반으로 EPackage Lab의 B2B 포장 전문 홈페이지를 위한 디자인 시스템을 정의합니다. 한국 제조의 기술적 우위를 강조하면서도 전문적이면서도 깔끔한 디자인을 구현하는 것을 목표로 합니다.

---

## 🎨 BRIXA 디자인 분석 결과

### 핵심 디자인 철학
1. **미니멀리즘과 기능성**: 불필요한 장식을 최소화하고 핵심 정보에 집중
2. **기술 전문성 강조**: 직관적인 UI를 통해 복잡한 제조 공정을 쉽게 이해
3. **신뢰도 구축**: 깔끔한 레이아웃과 일관된 비주얼 시스템
4. **B2B 전문성**: 전문가용 기능과 정보 구조

### 레이아웃 특징
- **넓은 여백**: 콘텐츠 간 충분한 공간 확보
- **그리드 시스템**: 정렬된 6-8열 그리드 기반 구조
- **카드 기반 디자인**: 정보의 계층적 표현
- **플랫 디자인**: 입체감보다는 평면적인 요소 활용

### 색상 시스템
- **기본**: 화이트 배경(#FFFFFF)
- **포인트**: 제한된 블루 계열 (#0066CC)
- **텍스트**: 다크 그레이 (#333333)
- **보조**: 라이트 그레이 (#F5F5F5)

---

## 🎨 EPackage Lab 디자인 시스템

### 1. 색상 팔레트 (Color Palette)

#### 브랜드 컬러
```css
/* Primary Colors */
--epac-primary-blue: #0052CC;      /* 주요 브랜드 컬러 */
--epac-primary-dark: #003D99;      /* 다크 버전 */
--epac-primary-light: #E6F0FF;     /* 라이트 버전 */

/* Accent Colors */
--epac-accent-green: #00A878;      /* 성공, 성장, 환경 친화 */
--epac-accent-orange: #FF6B35;     /* 주의, CTA, 강조 */
--epac-accent-purple: #6B46C1;     /* 혁신, 기술 */

/* Neutral Colors */
--epac-neutral-900: #1A202C;       /* 헤딩 텍스트 */
--epac-neutral-800: #2D3748;       /* 바디 텍스트 */
--epac-neutral-700: #4A5568;       /* 서브 텍스트 */
--epac-neutral-600: #718096;       /* 보조 텍스트 */
--epac-neutral-400: #CBD5E0;       /* 비활성, 구분선 */
--epac-neutral-200: #E2E8F0;       /* 배경 */
--epac-neutral-100: #F7FAFC;       /* 라이트 배경 */
--epac-neutral-50: #FAFBFC;        /* 매우 라이트 배경 */
--epac-white: #FFFFFF;             /* 순수 화이트 */

/* Semantic Colors */
--epac-success: #10B981;           /* 성공, 완료 */
--epac-warning: #F59E0B;           /* 경고, 주의 */
--epac-error: #EF4444;             /* 에러, 실패 */
--epac-info: #3B82F6;              /* 정보, 안내 */
```

#### 색상 사용 규칙
- **Primary Blue**: 주요 CTA, 내비게이션, 브랜드 요소
- **Accent Green**: 한국 제조의 기술적 우위, 성공 사례
- **Accent Orange**: 중요 CTA, 긴급성 강조
- **Neutral**: 배경, 텍스트, 정보 전달

### 2. 타이포그래피 시스템 (Typography)

#### 폰트 패밀리
```css
/* Primary Font Stack */
--font-primary: 'Noto Sans KR', 'Noto Sans CJK JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;

/* Secondary Font Stack (영문/숫자) */
--font-secondary: 'Inter', 'Helvetica Neue', Arial, sans-serif;

/* Monospace Font (코드/데이터) */
--font-mono: 'JetBrains Mono', 'Consolas', monospace;
```

#### 타이포그래피 스케일
```css
/* 텍스트 크기 (rem 기준) */
--text-xs: 0.75rem;    /* 12px - 작은 주석 */
--text-sm: 0.875rem;   /* 14px - 바디 텍스트 */
--text-base: 1rem;     /* 16px - 기본 텍스트 */
--text-lg: 1.125rem;   /* 18px - 중간 텍스트 */
--text-xl: 1.25rem;    /* 20px - 서브 헤딩 */
--text-2xl: 1.5rem;    /* 24px - 소제목 */
--text-3xl: 1.875rem;  /* 30px - 중간 헤딩 */
--text-4xl: 2.25rem;   /* 36px - 헤딩 */
--text-5xl: 3rem;      /* 48px - 큰 헤딩 */

/* 라인 하이트 */
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

#### 헤딩 시스템
```css
/* H1 - 메인 타이틀 */
h1 {
  font-size: var(--text-4xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  color: var(--epac-neutral-900);
  margin-bottom: 1.5rem;
}

/* H2 - 섹션 타이틀 */
h2 {
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  color: var(--epac-neutral-900);
  margin-bottom: 1.25rem;
}

/* H3 - 서브섹션 타이틀 */
h3 {
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  color: var(--epac-neutral-800);
  margin-bottom: 1rem;
}

/* H4 - 카드/소제목 타이틀 */
h4 {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: var(--leading-normal);
  color: var(--epac-neutral-800);
  margin-bottom: 0.75rem;
}
```

### 3. 레이아웃 그리드 시스템

#### 컨테이너 시스템
```css
/* 최대 너비 컨테이너 */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 반응형 패딩 */
@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}
@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

#### 그리드 시스템 (12열 기준)
```css
/* 기본 그리드 */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }

/* 반응형 그리드 */
.grid-cols-responsive {
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .grid-cols-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .grid-cols-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### 섹션 간격
```css
/* 수직 간격 시스템 */
.section-spacing-sm { padding: 3rem 0; }    /* 작은 섹션 */
.section-spacing-md { padding: 4rem 0; }    /* 중간 섹션 */
.section-spacing-lg { padding: 6rem 0; }    /* 큰 섹션 */
.section-spacing-xl { padding: 8rem 0; }    /* 매우 큰 섹션 */

/* 요소 간 간격 */
.space-y-1 > * + * { margin-top: 0.25rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }
```

### 4. 컴포넌트 디자인 시스템

#### 버튼 시스템
```css
/* Primary Button */
.btn-primary {
  background-color: var(--epac-primary-blue);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--epac-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 82, 204, 0.15);
}

/* Secondary Button */
.btn-secondary {
  background-color: transparent;
  color: var(--epac-primary-blue);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: var(--text-base);
  border: 2px solid var(--epac-primary-blue);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: var(--epac-primary-blue);
  color: white;
}

/* Accent Button */
.btn-accent {
  background-color: var(--epac-accent-green);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-accent:hover {
  background-color: #008F64;
  transform: translateY(-1px);
}
```

#### 카드 시스템
```css
/* 기본 카드 */
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid var(--epac-neutral-200);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 카드 헤더 */
.card-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--epac-neutral-200);
}

/* 카드 푸터 */
.card-footer {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--epac-neutral-200);
}
```

#### 폼 시스템
```css
/* 입력 필드 */
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--epac-neutral-200);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--epac-primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
}

.form-input:invalid {
  border-color: var(--epac-error);
}

/* 레이블 */
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--epac-neutral-700);
  margin-bottom: 0.5rem;
}
```

---

## 🎯 레이아웃 템플릿 가이드

### 1. 헤더 레이아웃
```
┌─────────────────────────────────────────────────────┐
│ LOGO           NAVIGATION           CTA BUTTONS     │
│ EPackage Lab    [소개][제품][실적] [문의][샘플][견적]    │
├─────────────────────────────────────────────────────┤
│                QUICK CATEGORY NAV                     │
│ [평백] [지퍼백] [스탠드백] [박스형] [가제트백] [합장백]    │
└─────────────────────────────────────────────────────┘
```

### 2. 히어로 섹션
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│             "한국 제조 기술력으로                     │
│              일본의 것づくり를 지원합니다"              │
│                                                     │
│           [무료 샘플 신청] [상담 문의] [제품 카탈로그]     │
│                                                     │
│                (고품질 패키지 배경 이미지)              │
└─────────────────────────────────────────────────────┘
```

### 3. 서비스 소개 섹션
```
┌─────────────────────────────────────────────────────┐
│                  "왜 EPackage Lab인가"                │
├─────────────┬─────────────┬─────────────┬─────────────┤
│    💪       │     ⚡️     │    🏭       │    🌱       │
│  100개부터   │   최단 10일   │ 한국 제조업의   │  환경 친화적   │
│  생산 가능    │   단기 납품    │   고품질을    │    제조 공정    │
│             │             │             │             │
│  [더 알아보기] │  [더 알아보기] │  [더 알아보기] │  [더 알아보기] │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 4. 제품 카탈로그 섹션
```
┌─────────────────────────────────────────────────────┐
│                   "제품 카탈로그"                      │
├─────────────┬─────────────┬─────────────┬─────────────┤
│              │              │              │              │
│   평백       │  지퍼백     │ 스탠드백     │   박스형     │
│ (3방향 밀봉)  │              │              │              │
│              │              │              │              │
│ 뛰어난 밀봉성  │ 높은 범용성   │ 높은 범용성   │ 넓은 내부 공간 │
│ 화장품, 건강  │ 식품, 화장품  │ 식품, 화장품  │ 대용량 포장   │
│  식품에 최적  │  일용품 등    │  일용품 등    │    최적       │
│              │              │              │              │
│  [상세 보기]  │  [상세 보기]  │  [상세 보기]  │  [상세 보기]  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🎨 반응형 디자인 전략

### 브레이크포인트 시스템
```css
/* 모바일 퍼스트 접근 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 모바일 최적화 가이드
- **내비게이션**: 햄버거 메뉴로 변환
- **카드 그리드**: 1열 → 2열 → 3열로 확장
- **폰트 크기**: 모바일에서는 1단계 축소
- **터치 영역**: 최소 44px 확보
- **간격**: 모바일에서는 간격 축소

---

## 🎯 애니메이션 및 인터랙션

### 애니메이션 원칙
1. **목적 지향성**: 사용성 개선을 위한 최소한의 애니메이션
2. **자연스러움**: 물리적인 움직임 기반
3. **일관성**: 전체 사이트에서 통일된 애니메이션 스타일
4. **성능**: 60fps 유지

### 주요 애니메이션
```css
/* 페이드인 애니메이션 */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.6s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 카드 호버 효과 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

---

## 🔧 기술 구현 가이드라인

### Tailwind CSS 커스텀 설정
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        epac: {
          'primary-blue': '#0052CC',
          'primary-dark': '#003D99',
          'primary-light': '#E6F0FF',
          'accent-green': '#00A878',
          'accent-orange': '#FF6B35',
          'accent-purple': '#6B46C1',
        }
      },
      fontFamily: {
        'korean': ['Noto Sans KR', 'Noto Sans CJK JP', 'sans-serif'],
        'display': ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  }
}
```

---

## 📱 접근성 가이드라인

### WCAG 2.0 AA 준수
- **색상 대비**: 텍스트와 배경 간 4.5:1 이상
- **키보드 내비게이션**: 모든 인터랙티브 요소 접근 가능
- **스크린 리더**: 적절한 ARIA 라벨과 시맨틱 마크업
- **포커스 관리**: 명확한 포커스 표시와 논리적 탭 순서

### 폰트 크기 유연성
- **기본**: 16px (100%)
- **확대**: 200%까지 레이아웃 유지
- **축소**: 80%까지 가독성 유지

---

## 🎯 브랜드 가이드라인

### 톤 앤 매너
- **전문적**: B2B 기업으로서의 신뢰감
- **기술 중심**: 제조 기술력 강조
- **친근함**: 일본 비즈니스 문화 이해
- **혁신적**: 한국 제조의 기술적 우위

### 비주얼 스타일
- **미니멀**: 불필요한 장식 제거
- **깔끔함**: 정돈된 정보 구조
- **전문성**: 고품질 이미지와 타이포그래피
- **일관성**: 모든 페이지에서 통일된 스타일

---

## 📋 구현 체크리스트

### 디자인 시스템 구현
- [ ] 색상 팔레트 CSS 변수 설정
- [ ] 타이포그래피 시스템 적용
- [ ] 그리드 시스템 구축
- [ ] 컴포넌트 라이브러리 제작
- [ ] 반응형 레이아웃 적용

### 기술 구현
- [ ] Next.js 프로젝트 설정
- [ ] Tailwind CSS 커스텀 설정
- [ ] 컴포넌트 기반 아키텍처
- [ ] TypeScript 타입 정의
- [ ] 성능 최적화 설정

### 품질 보증
- [ ] 접근성 테스트 (WCAG 2.0 AA)
- [ ] 크로스 브라우저 호환성 테스트
- [ ] 모바일 반응성 테스트
- [ ] 성능 테스트 (Core Web Vitals)
- [ ] 사용성 테스트

이 디자인 시스템 가이드라인을 통해 EPackage Lab의 전문성과 한국 제조의 기술적 우위를 효과적으로 전달하는 B2B 홈페이지를 구현할 수 있습니다.