# SEO 배포 가이드

## 📅 작성일자
2026-02-08

## 🎯 목적
Epackage Lab 홈페이지의 Vercel 배포 전 검색엔진 최적화(SEO) 점검 및 대책

---

## 📊 현재 SEO 구현 현황

### ✅ 잘 구현된 항목

#### 1. 메타데이터 구성 (EXCELLENT)
- **파일:** `src/app/layout.tsx`
- 완전한 메타데이터 구현
- 50개 이상의 일본어 키워드
- Open Graph 및 Twitter Card 완전 구현
- robots 메타 설정 (GoogleBot 특정 설정 포함)

#### 2. 사이트맵 (GOOD)
- **파일:** `src/app/sitemap.ts`
- 동적 사이트맵 생성
- 46개의 정적 경로 포함
- 제품 페이지 동적 생성
- 적절한 우선순위 및 변경 빈도 설정

#### 3. Robots.txt (EXCELLENT)
- **파일:** `src/app/robots.ts`
- 관리자 영역 차단 (`/admin/`, `/auth/`, `/member/`)
- API 경로 차단 (`/api/`)
- 임시 페이지 차단 (`/cart`, `/checkout`, `/quote-simulator`)
- 사이트맵 참조 포함

#### 4. 구조화된 데이터 (EXCELLENT)
- **파일:** `src/components/seo/StructuredData.tsx`
- Organization, LocalBusiness, Product, FAQPage, HowTo 스키마 구현
- BreadcrumbList 자동 생성

#### 5. 이미지 최적화 (EXCELLENT)
- **파일:** `src/components/ui/OptimizedImage.tsx`
- WebP/AVIF 프로그레시브 Enhancement
- 지연 로딩 (Lazy Loading)
- 반응형 이미지 지원

---

## 🚨 프로덕션 배포 전 필수 수정 사항

### 1. 검색엔진 검증 코드 교체

#### 대상 파일: `src/app/layout.tsx`

**현재 문제:**
```typescript
verification: {
  google: 'your-google-verification-code', // ❌ 플레이스홀더
  yandex: 'your-yandex-verification-code', // ❌ 플레이스홀더
}
```

**해결 방법:**

1. **Google Search Console 검증 코드 획득**
   - https://search.google.com/search-console 접속
   - 속성 추가 → URL 접두어 선택
   - HTML 태그 방식으로 검증
   - 제공된 `content` 값으로 교체

```typescript
verification: {
  google: '실제_검증_코드_여기에_입력',
  yandex: null, // 사용하지 않으면 null 또는 삭제
}
```

2. **배포 후 검증**
   - Google Search Console에서 소유권 확인
   - `robots.txt` 확인
   - `sitemap.xml` 제출

---

### 2. Open Graph 이미지 추가

#### 누락된 이미지 생성

**필요한 이미지:**
- `/public/images/og-catalog.jpg` (카탈로그 페이지용)

**이미지规格:**
- 권장 크기: 1200 x 630 px (최소 600x315 px)
- 형식: JPG 또는 PNG
- 파일 크기: 8MB 이하 (권장 1MB 이하)

**생성 방법:**

```bash
# 1. 디자인 툴(Figma, Canva 등)에서 OG 이미지 제작
# 2. /public/images/ 폴더에 저장

# 또는 기존 OG 이미지 복사
cp public/images/og-image.jpg public/images/og-catalog.jpg
```

**페이지별 OG 이미지 확인:**
- ✅ 홈페이지: `/images/og-image.jpg` (존재)
- ❌ 카탈로그: `/images/og-catalog.jpg` (누락)
- ❌ 회사 소개: OG 이미지 미지정
- ❌ 연락처: OG 이미지 미지정

---

### 3. Hreflang 구현 수정

#### 대상 파일: `src/app/sitemap.ts`

**현재 문제:**
```typescript
// 영어와 한국어 경로가 존재하지 않음
['ja', '/catalog'],  // 일본어 (홈)
['en', '/en/catalog'], // ❌ /en 경로 없음
['ko', '/ko/catalog'], // ❌ /ko 경로 없음
```

**해결 방법 1: 다국어 지원 계획 없는 경우**
```typescript
// 일본어만 유지
{ lang: 'ja', url: `${baseUrl}/catalog` }
```

**해결 방법 2: 다국어 지원 구현 시**
```typescript
// Next.js i18n 라우팅 구현 필요
// /app/[lang]/catalog/page.tsx 구조
```

**권장:** 현재는 일본어만 노출하도록 수정

---

### 4. 구조화된 데이터 실제 정보로 업데이트

#### 대상 파일: `src/components/seo/StructuredData.tsx`

**현재 문제:**
더미 데이터가 포함되어 있을 가능성

**확인 및 수정 항목:**

1. **Organization Schema**
```typescript
{
  "@type": "Organization",
  "name": "Epackage Lab",
  "url": "https://package-lab.com",
  "logo": "https://package-lab.com/logo.png",
  "address": { // ✅ 실제 주소 확인
    "@type": "PostalAddress",
    "streetAddress": "실제_주소",
    "addressLocality": "도시",
    "postalCode": "우편번호",
    "addressCountry": "JP"
  },
  "contactPoint": { // ✅ 실제 연락처 확인
    "@type": "ContactPoint",
    "telephone": "+81-XX-XXXX-XXXX",
    "contactType": "customer service"
  }
}
```

2. **LocalBusiness Schema**
```typescript
{
  "geo": { // ✅ 실제 좌표 확인
    "@type": "GeoCoordinates",
    "latitude": 35.XXXX,
    "longitude": 139.XXXX
  },
  "openingHoursSpecification": [ // ✅ 실제 영업시간 확인
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
}
```

3. **인증 정보 확인**
```typescript
"certification": [
  "ISO 9001", // ✅ 실제 보유 인증만 유지
  "JIS規格", // ✅ 실제 보유 인증만 유지
  "食品衛生法", // ✅ 실제 보유 인증만 유지
  "薬機法" // ✅ 실제 보유 인증만 유지
]
```

---

### 5. 소셜 미디어 링크 추가

#### 대상 파일: `src/app/layout.tsx`

**현재 문제:**
소셜 미디어 링크가 누락되어 있을 수 있음

**해결 방법:**

```typescript
export const metadata: Metadata = {
  // ... 기존 메타데이터

  // 소셜 미디어 추가
  other: {
    'fb:app_id': 'facebook-app-id', // 있는 경우
    'twitter:site': '@epackage_lab', // 트위터 계정
  },
}
```

**구조화된 데이터에도 추가:**
```typescript
"sameAs": [
  "https://www.facebook.com/epackagelab", // 있는 경우
  "https://twitter.com/epackage_lab", // 있는 경우
  "https://www.linkedin.com/company/epackagelab" // 있는 경우
]
```

---

## 🔍 배포 전 SEO 체크리스트

### 필수 항목 (MUST)

- [ ] **Google Search Console 검증 코드 교체**
  - [ ] `src/app/layout.tsx`에서 플레이스홀더 값 제거
  - [ ] 실제 검증 코드로 교체
  - [ ] 배포 후 검증 완료 확인

- [ ] **누락된 OG 이미지 생성**
  - [ ] `/public/images/og-catalog.jpg` 생성
  - [ ] 권장规格: 1200 x 630 px
  - [ ] 파일 크기 1MB 이하

- [ ] **Hreflang 수정**
  - [ ] 존재하지 않는 언어 경로(`/en`, `/ko`) 제거
  - [ ] 일본어만 유지하거나 다국어 구현

- [ ] **구조화된 데이터 실제 정보 업데이트**
  - [ ] 회사 주소 확인 및 수정
  - [ ] 연락처(전화번호, 이메일) 확인
  - [ ] 지리적 좌표 확인
  - [ ] 영업시간 확인
  - [ ] 인증 정보 실제 보유 내용으로 수정

### 권장 항목 (SHOULD)

- [ ] **소셜 미디어 링크 추가**
  - [ ] Facebook 페이지 링크 (있는 경우)
  - [ ] Twitter/X 계정 링크 (있는 경우)
  - [ ] LinkedIn 페이지 링크 (있는 경우)

- [ ] **각 페이지 OG 이미지 추가**
  - [ ] 회사 소개 페이지 OG 이미지
  - [ ] 연락처 페이지 OG 이미지

- [ ] **추가 구조화된 데이터**
  - [ ] 블로그/뉴스 섹션이 있다면 Article 스키마
  - [ ] 리뷰가 있다면 Review 스키마
  - [ ] 이벤트가 있다면 Event 스키마

---

## 🧪 배포 후 검증 도구

### 1. Google 도구

**Rich Results Test**
- URL: https://search.google.com/test/rich-results
- 확인 항목: 구조화된 데이터, 상품 정보, FAQ

**PageSpeed Insights**
- URL: https://pagespeed.web.dev/
- 확인 항목: Core Web Vitals, LCP, FID, CLS

**Search Console**
- URL: https://search.google.com/search-console
- 확인 항목: 색인 생성 상태, 검색 성능, 모바일 사용성

### 2. 소셜 미디어 도구

**Facebook Sharing Debugger**
- URL: https://developers.facebook.com/tools/debug/
- 확인 항목: Open Graph 태그, 이미지, 제목, 설명

**Twitter Card Validator**
- URL: https://cards-dev.twitter.com/validator
- 확인 항목: Twitter Card 태그, 이미지, 제목

### 3. Schema.org 검증

**Schema Markup Validator**
- URL: https://validator.schema.org/
- 확인 항목: JSON-LD 구문, 필수 속성, 권장 속성

---

## 📈 SEO 모니터링 항목

### 배포 후 1주일 이내 점검

1. **Google 색인 생성 확인**
   - `site:package-lab.com` 검색
   - 주요 페이지 색인 여부 확인
   - robots.txt 접근 가능 확인
   - sitemap.xml 제출 및 확인

2. **Core Web Vitals 확인**
   - 모바일: LCP < 2.5s, FID < 100ms, CLS < 0.1
   - 데스크톱: LCP < 2.5s, FID < 100ms, CLS < 0.1

3. **구조화된 데이터 정상 작동**
   - Rich Results Test로 리치 결과 확인
   - 별점, 리뷰, FAQ 등이 검색 결과에 표시되는지 확인

### 지속 모니터링

1. **월간 검색 노출 현황**
   - Search Console의 검색 성과 보고서
   - 상위 노출 키워드 확인
   - CTR(클릭률) 모니터링

2. **기술적 SEO 점검**
   - 404 에러 페이지 확인
   - 리디렉션 정상 작동 확인
   - 로딩 속도 모니터링

---

## 🎯 SEO 성과 지표 (KPI)

### 초기 목표 (배포 후 3개월)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| **색인된 페이지** | 50개 이상 | `site:` 검색 |
| **모바일 점수** | 90점 이상 | PageSpeed Insights |
| **데스크톱 점수** | 95점 이상 | PageSpeed Insights |
| **Core Web Vitals** | 통과 | Search Console |
| **구조화된 데이터** | 정상 작동 | Rich Results Test |

### 중기 목표 (배포 후 6개월)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| **유기 검색 트래픽** | 월 1,000방문자 이상 | Google Analytics |
| **상위 노출 키워드** | 상위 10위 20개 이상 | Search Console |
| **리치 결과 노출** | FAQ, 상품 정보 표시 | 검색 결과 확인 |

---

## 📚 참고 자료

### 공식 문서
- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

### SEO 도구
- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

## 🔧 빠른 수정 명령어

```bash
# 1. OG 이미지 생성 (기존 이미지 복사)
cp public/images/og-image.jpg public/images/og-catalog.jpg

# 2. sitemap.ts에서 hreflang 수정 (편집기에서 수행)
# 영어/한국어 경로 제거 또는 실제 구현

# 3. 구조화된 데이터 실제 정보로 수정 (편집기에서 수행)
# src/components/seo/StructuredData.tsx

# 4. 검증 코드 교체 (편집기에서 수행)
# src/app/layout.tsx
```

---

*작성일: 2026-02-08*
*작성자: Claude Code Assistant*
*버전: 1.0*
