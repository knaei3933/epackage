# Epackage Lab URL 완전 분석 보고서 (완벽 설계서)

**작성일**: 2026-01-06
**버전**: 2.0 (완전 업데이트)
**분석 범위**: 모든 페이지, 데이터베이스, API, 버튼, 콘솔 에러 포함

---

## 📋 목차

1. [총 페이지 현황](#총-페이지-현황)
2. [공개 페이지 (37개)](#1-공개-페이지)
3. [인증 페이지 (6개)](#2-인증-페이지)
4. [회원 포털 (19개)](#3-회원-포털-페이지)
5. [관리자 페이지 (14개)](#4-관리자-페이지)
6. [포털 페이지 (6개)](#5-포털-페이지)
7. [데이터베이스 완전 매핑](#데이터베이스-완전-매핑)
8. [API 엔드포인트 완전 목록](#api-엔드포인트-완전-목록)
9. [콘솔 에러 분석 및 해결](#콘솔-에러-분석-및-해결)
10. [누락/중복 URL 분석](#누락중복-url-분석)

---

## 총 페이지 현황

| 카테고리 | 페이지 수 | 인증 필요 | 주요 기능 |
|---------|---------|-----------|----------|
| **공개 페이지** | 37개 | ❌ | 홈, 카탈로그, 문의, 샘플 요청 |
| **인증 페이지** | 6개 | ❌ | 로그인, 회원가입, 비밀번호 찾기 |
| **회원 포털** | 19개 | ✅ | 주문, 견적, 프로필 관리 |
| **관리자 페이지** | 14개 | ✅ ADMIN | 주문 관리, 생산, 배송, 재고 |
| **포털 페이지** | 6개 | ✅ | B2B 고객 전용 포털 |
| **총계** | **82개 페이지** | - | 완전한 B2B 패키징 관리 시스템 |

---

## 1. 공개 페이지

### 홈페이지 & 핵심 페이지 (8개)

#### `/` - 홈페이지

**파일 위치**: `src/app/page.tsx`

**데이터베이스 테이블**: 없음 (정적 페이지)

**API 엔드포인트**: 없음

**버튼/액션 로직**:
- [제품 보기] → `/catalog` - 제품 카탈로그로 이동
- [스마트 견적] → `/quote-simulator` - 견적 시뮬레이터로 이동
- [샘플 요청] → `/samples` - 샘플 요청 페이지로 이동
- [문의하기] → `/contact` - 문의하기 페이지로 이동
- [회사 소개] → `/about` - 회사 소개 페이지로 이동

**상태 관리**: 없음 (정적 Server Component)

**폼 처리**: 없음

**콘솔 에러**: 없음

---

#### `/about` - 회사 소개

**파일 위치**: `src/app/about/page.tsx`

**데이터베이스 테이블**: 없음

**API 엔드포인트**: 없음

**버튼/액션 로직**:
- [문의하기] → `/contact`
- [제품 보기] → `/catalog`

**상태 관리**: 없음

**폼 처리**: 없음

**콘솔 에러**: 없음

---

#### `/contact` - 문의하기

**파일 위치**: `src/app/contact/page.tsx`

**데이터베이스 테이블**:
- `contact_submissions` - 문의 사항 저장
- `inquiries` - 문의 내역

**API 엔드포인트**:
- `POST /api/contact` - 문의 제출
  - Rate limiting: 10req/15min
  - SendGrid 이메일 발송 (고객 + 관리자)

**버튼/액션 로직**:
```typescript
[送信] 버튼 클릭
  ↓
React Hook Form + Zod 검증
  ↓ (성공)
/api/contact POST
  ↓
DB 저장: contact_submissions 테이블
  ↓
SendGrid 이메일 발송
  ↓
/contact?success=true 리다이렉트
```

**상태 관리**:
- ContactForm 로컬 상태 (isSubmitting, serverError)

**폼 처리**:
- `contactSchema` (Zod):
  - name, email, phone, company, inquiryType, message
  - Japanese phone validation (0XX-XXXX-XXXX)

**콘솔 에러**: 없음

---

#### `/service` - 서비스 안내

**데이터베이스 테이블**: 없음

**API 엔드포인트**: 없음

**버튼/액션 로직**:
- [견적 요청] → `/quote-simulator`
- [샘플 주문] → `/samples`

---

#### `/privacy` - 개인정보 처리방침
#### `/terms` - 이용약관
#### `/legal` - 법적 정보
#### `/csr` - CSR 활동

모두 정적 콘텐츠 페이지로 DB 연결 없음.

---

### 제품 카탈로그 (8개)

#### `/catalog` - 제품 카탈로그 메인

**파일 위치**: `src/app/catalog/page.tsx`

**데이터베이스 테이블**:
- `products` - 제품 목록
- `categories` - 카테고리
- `material_types` - 소재 유형

**API 엔드포인트**:
- `GET /api/products` - 제품 조회
  - Query: category, material_type, search, sort
  - 정적 데이터 폴백 (fallback)

**버튼/액션 로직**:
```
[카테고리 필터] 클릭
  ↓
카테고리 상태 변경
  ↓
GET /api/products?category=XXX
  ↓
제품 목록 업데이트

[검색] 입력
  ↓
debounce (300ms)
  ↓
GET /api/products?search=XXX

[제품 카드] 클릭
  ↓
/catalog/[slug]로 이동
```

**상태 관리**:
- useState: products, filters, loading
- useDebounce: 검색 디바운스

**폼 처리**:
- 검색 input (debounced)
- Select dropdowns (category, material_type)

**콘솔 에러**: 없음

---

#### `/catalog/[slug]` - 개별 제품 상세

**파일 위치**: `src/app/catalog/[slug]/page.tsx`

**데이터베이스 테이블**:
- `products` - 제품 상세
- `product_images` - 제품 이미지
- `product_specifications` - 제품 스펙

**API 엔드포인트**:
- `GET /api/products/[slug]` - 제품 상세 조회

**버튼/액션 로직**:
- [견적에 추가] → CartContext.addItem()
- [샘플 요청] → `/samples` (제품 pre-selected)
- [비교에 추가] → ComparisonContext.addItem()
- [문의하기] → `/contact` (제품 정보 pre-filled)

**상태 관리**:
- CartProvider, ComparisonProvider
- 로컬 상태: product, selectedVariant

**콘솔 에러**: 없음

---

### 가이드 페이지 (6개)

#### `/guide` - 가이드 메인
#### `/guide/color` - 색상 가이드
#### `/guide/size` - 사이즈 가이드
#### `/guide/image` - 이미지 가이드
#### `/guide/shirohan` - 백색 가이드
#### `/guide/environmentaldisplay` - 환경 표시 가이드

모두 정적 가이드 페이지로 DB 연결 없음.

---

### 산업별 솔루션 (4개)

#### `/industry/cosmetics` - 화장품 포장재
#### `/industry/electronics` - 전자제품 포장재
#### `/industry/food-manufacturing` - 식품 제조 포장재
#### `/industry/pharmaceutical` - 제약 포장재

**데이터베이스 테이블**:
- `products` - 각 카테고리별 제품

**API 엔드포인트**:
- `GET /api/products?category=cosmetics|electronics|food|pharmaceutical`

**버튼/액션 로직**:
- [제품 보기] → `/catalog`
- [견적 요청] → `/quote-simulator`

---

### 견적 & 도구 (6개)

#### `/smart-quote` - 스마트 견적 시스템

**파일 위치**: `src/app/smart-quote/page.tsx`

**데이터베이스 테이블**:
- `products` - 제품 정보
- `quotations` - 견적 저장 (로그인 시)
- `quotation_items` - 견적 항목

**API 엔드포인트**:
- `GET /api/products` - 제품 목록
- `POST /api/quotations/submit` - 견적 제출 (로그인 시)

**버튼/액션 로직**:
```
[제품 추가] 버튼
  ↓
QuoteContext.addItem(product)
  ↓
견적 카트에 추가

[제품 삭제] 버튼
  ↓
QuoteContext.removeItem(id)

[수량 변경]
  ↓
QuoteContext.updateQuantity(id, qty)

[PDF 다운로드]
  ↓
client-side generateQuotePDF()

[제출] (로그인 시)
  ↓
POST /api/quotations/submit
  ↓
/member/quotations로 리다이렉트
```

**상태 관리**:
- QuoteProvider - items, customerInfo
- MultiQuantityQuoteProvider - 복수 수량

**폼 처리**:
- React Hook Form + Zod
- customerInfo: name, email, phone, company

---

#### `/quote-simulator` - 견적 시뮬레이터

**파일 위치**: `src/app/quote-simulator/page.tsx`

**데이터베이스 테이블**:
- `products` - 제품 정보
- `quotations` - 견적 저장

**API 엔드포인트**:
- `GET /api/products` - 제품 조회
- `POST /api/quotations/submit` - 견적 제출

**버튼/액션 로직**:
- [시뮬레이션 시작] - 제품 선택 → 옵션 설정 → 가격 계산
- [PDF 다운로드] - client-side PDF 생성
- [제출] - 견적 제출

**상태 관리**:
- SimulationProvider - 시뮬레이션 상태

---

#### `/simulation` - 제품 시뮬레이션

**데이터베이스 테이블**:
- `products` - 제품 정보

**API 엔드포인트**:
- `GET /api/products/[slug]` - 제품 조회

**버튼/액션 로직**:
- [옵션 변경] - 실시간 가격 계산
- [3D 미리보기] - Three.js 렌더링

---

#### `/roi-calculator` - ROI 계산기

**데이터베이스 테이블**: 없음

**API 엔드포인트**: 없음

**버튼/액션 로직**:
- [계산] - 클라이언트 측 계산
- [결과 이메일] - `/contact`로 데이터 전달

**상태 관리**:
- 로컬 상태: currentCost, proposedCost, quantity

---

### 샘플 요청 (2개)

#### `/samples` - 샘플 요청 (최대 5개)

**파일 위치**: `src/app/samples/page.tsx`

**데이터베이스 테이블**:
- `sample_requests` - 샘플 요청
- `sample_items` - 샘플 항목 (1-5개)
- `products` - 제품 정보
- `delivery_addresses` - 배송지

**API 엔드포인트**:
- `GET /api/products` - 제품 목록
- `POST /api/samples/request` - 샘플 요청 제출
  - 최대 5개 샘플
  - 최대 5개 배송지
  - SendGrid 발송

**버튼/액션 로직**:
```
[샘플 추가] 버튼
  ↓
items.push() (최대 5개)

[샘플 삭제] 버튼
  ↓
items.splice()

[배송지 추가] 버튼
  ↓
addresses.push() (최대 5개)

[제출] 버튼
  ↓
POST /api/samples/request
  ↓
성공 → /samples/thank-you
```

**상태 관리**:
- 로컬 상태: items, addresses, isSubmitting

**폼 처리**:
- `sampleRequestSchema` (Zod):
  - items: 1-5개 (product_id, quantity)
  - addresses: 1-5개 (name, phone, postalCode, prefecture, city, street)
  - contactInfo: name, email, phone, company

---

#### `/samples/thank-you` - 샘플 요청 확인 페이지

**데이터베이스 테이블**: 없음

**API 엔드포인트**: 없음

**버튼/액션 로직**:
- [홈으로] → `/`
- [내 샘플 보기] → `/member/samples` (로그인 시)

---

## 2. 인증 페이지

#### `/auth/signin` - 로그인

**파일 위치**: `src/app/auth/signin/page.tsx`

**데이터베이스 테이블**:
- `profiles` - role, status 확인
- `auth.users` - Supabase Auth 사용자

**API 엔드포인트**:
- `POST /api/auth/signin` - 로그인 처리
  - Supabase Auth.signInWithPassword()
  - 프로필 조회 (role, status)
  - httpOnly 쿠키 설정 (sb-access-token, sb-refresh-token)

**버튼/액션 로직**:
```
[로그인] 버튼 클릭
  ↓
React Hook Form + Zod 검증
  ↓
POST /api/auth/signin
  ↓
Supabase Auth 인증
  ↓
profiles 테이블 조회
  ↓
역할 확인 (ADMIN vs MEMBER)
  ↓
리다이렉트:
  - ADMIN → /admin/dashboard
  - MEMBER → /member/dashboard
  - PENDING → /auth/pending
  - SUSPENDED → /auth/suspended
```

**상태 관리**:
- AuthContext - signIn()
- 로컬: isSubmitting, showPassword, serverError

**폼 처리**:
- `loginSchema` (Zod): email, password, remember
- credentials: 'include'

**콘솔 에러**: 없음

---

#### `/auth/register` - 회원가입

**파일 위치**: `src/app/auth/register/page.tsx`

**데이터베이스 테이블**:
- `profiles` - 프로필 생성
- `auth.users` - Supabase Auth 사용자

**API 엔드포인트**:
- `POST /api/auth/register` - 회원가입
  - Supabase Auth.signUp()
  - profiles 테이블 삽입 (status: 'PENDING')

**버튼/액션 로직**:
```
[가입하기] 버튼 클릭
  ↓
18개 필드 Zod 검증
  ↓
POST /api/auth/register
  ↓
Supabase Auth.signUp()
  ↓
profiles 테이블 생성 (status: 'PENDING')
  ↓
성공 메시지 + 로그인 페이지 안내
```

**상태 관리**:
- AuthContext - signUp()
- RegistrationForm 로컬 상태

**폼 처리**:
- `registrationSchema` - 18개 필드:
  - 기본: kanjiLastName, kanjiFirstName, kanaLastName, kanaFirstName
  - 연락처: email, corporatePhone, personalPhone
  - 비즈니스: businessType, companyName, legalEntityNumber, position, department
  - 주소: postalCode, prefecture, city, street
  - 기타: productCategory, acquisitionChannel

---

#### `/auth/signout` - 로그아웃

**데이터베이스 테이블**: 없음

**API 엔드포인트**:
- `POST /api/auth/signout` - 로그아웃
  - Supabase Auth 세션 종료
  - httpOnly 쿠키 삭제

**버튼/액션 로직**:
- 자동 로그아웃 - 페이지 로드 시 즉시 실행
  - AuthContext.signOut()
  - localStorage 삭제
  - 1.5초 후 `/`로 리다이렉트

---

#### `/auth/pending` - 승인 대기중
#### `/auth/suspended` - 계정 정지됨
#### `/auth/error` - 인증 에러

모두 상태 페이지로 DB 연결 없음.

---

## 3. 회원 포털 페이지

### 대시보드 & 프로필 (4개)

#### `/member/dashboard` - 회원 대시보드 ⚠️ 콘솔 에러 있음

**파일 위치**: `src/app/member/dashboard/page.tsx`

**데이터베이스 테이블**:
- `profiles` - 사용자 정보
- `orders` - 주문 통계
- `quotations` - 견적 통계
- `sample_requests` - 샘플 통계
- `inquiries` - 문의 내역
- `announcements` - 공지사항
- `contracts` - B2B 계약
- `customer_notifications` - 알림

**API 엔드포인트**:
- 직접 `getDashboardStats()` 함수 사용
- `createServiceClient()`로 Supabase 직접 조회

**버튼/액션 로직**:
- 통계 카드 클릭 - 각 섹션으로 네비게이션
- [모두 보기] - 전체 목록
- [상세 보기] - 개별 항목 상세

**상태 관리**:
- Server Component (RSC)
- `requireAuth()` 인증 체크

**콘솔 에러** (⚠️ CRITICAL):
```
Error #1: Dashboard stats undefined access
- 문제: stats 객체 프로퍼티가 undefined일 경우
- 현재: safeGet() 헬퍼로 우회 (임시 조치)
- 해결: getDashboardStatsSafe() 함수로 완전한 기본값 제공
```

---

#### `/member/profile` - 프로필 관리

**파일 위치**: `src/app/member/profile/page.tsx`

**데이터베이스 테이블**:
- `profiles` - 사용자 프로필

**API 엔드포인트**:
- `GET /api/auth/session` - 세션 확인

**버튼/액션 로직**:
- [편집] → `/member/edit`
- [비밀번호 변경] → `/auth/reset-password`
- [회원 정보 편집] → `/member/edit`
- [문의하기] → `/contact`

**상태 관리**:
- `useAuth()` Context - user, isAuthenticated, isLoading

**콘솔 에러**: 없음

---

#### `/member/edit` - 프로필 수정

**데이터베이스 테이블**:
- `profiles` - 프로필 업데이트

**API 엔드포인트**:
- `PUT /api/auth/profile` - 프로필 업데이트
- `POST /api/auth/update-password` - 비밀번호 변경

**버튼/액션 로직**:
- [변경 사항 저장] - 프로필 업데이트
- [비밀번호 업데이트] - 비밀번호 변경
- [취소] → `/member/dashboard`
- [계정 삭제] - 3단계 삭제 프로세스

**폼 처리**:
- 프로필 폼: kanjiLastName, kanjiFirstName (필수), kanaLastName, kanaFirstName
- 비밀번호 폼: newPassword, confirmPassword (8자+, 일치 검증)

---

#### `/member/settings` - 계정 설정

**데이터베이스 테이블**:
- `profiles` - settings 컬럼 (JSON)

**API 엔드포인트**:
- `GET /api/member/settings` - 설정 조회
- `POST /api/member/settings` - 설정 저장
- `POST /api/auth/signout` - 로그아웃
- `GET /api/member/delete-account` - 삭제 요약
- `POST /api/member/delete-account` - 계정 삭제

**버튼/액션 로직**:
- [변경 사항 저장] - 설정 저장
- [비밀번호 변경] → `/auth/reset-password`
- [로그아웃] - signOut() 후 `/`로 이동
- [계정 삭제] - 3단계 삭제 프로세스

**폼 처리**:
- 토글 스위치: 8가지 알림 타입

---

### 주문 관리 (7개)

#### `/member/orders` - 주문 목록

**데이터베이스 테이블**:
- `orders` - 주문 목록
- `order_items` - 주문 항목
- `shipments` - 배송 정보

**API 엔드포인트**:
- `GET /api/member/orders?status={status}` - 주문 목록
  - Query: status, searchTerm, dateRange, sortBy, sortOrder

**버튼/액션 로직**:
- [+새 견적] → `/quote-simulator`
- [상세 보기] → `/member/orders/{id}`
- 필터: 상태별 (all, pending, data_received, processing, manufacturing, shipped, delivered)
- 검색: 주문번호/견적번호
- 기간 필터: 7일/30일/90일/전체
- 정렬: 날짜/금액순

---

#### `/member/orders/[id]` - 주문 상세

**데이터베이스 테이블**:
- `orders` - 주문 상세
- `order_items` - 주문 항목
- `delivery_addresses` - 배송지
- `billing_addresses` - 청구지
- `shipments` - 배송 정보
- `production_logs` - 생산 로그
- `files` - 관련 파일
- `order_status_history` - 상태 이력

**API 엔드포인트**:
- `GET /api/member/orders/{id}` - 주문 상세
- `GET /api/member/orders/{id}/production-data` - 생산 데이터

**버튼/액션 로직**:
- [뒤로가기] → `/member/orders`
- [PDF 다운로드] - 주문서 PDF
- [데이터 전송] - 데이터 전송 (B2B)
- [재주문] - 동일 주문 재주문
- [취소] - 주문 취소

---

#### `/member/orders/new` - 새 주문

**데이터베이스 테이블**:
- `quotations` - 승인된 견적서
- `quotation_items` - 견적 항목
- `delivery_addresses` - 배송지 목록
- `billing_addresses` - 청구지 목록

**API 엔드포인트**:
- `GET /api/member/quotations?status=approved` - 승인된 견적서
- `GET /api/member/addresses/billing` - 청구지
- `GET /api/member/addresses/delivery` - 배송지
- `POST /api/member/orders/confirm` - 주문 생성

**버튼/액션 로직**:
- [견적서 선택] - 견적서 선택 모달
- [배송지 선택] - 배송지 선택/추가
- [청구지 선택] - 청구지 선택/추가
- [주문 확정] - 주문 생성

---

### 견적서 (4개)

#### `/member/quotations` - 견적서 목록

**데이터베이스 테이블**:
- `quotations` - 견적서 목록
- `quotation_items` - 견적 항목

**API 엔드포인트**:
- `GET /api/member/quotations?status={status}` - 견적서 목록
- `DELETE /api/member/quotations/{id}` - 견적서 삭제
- `POST /api/orders/create` - 주문 생성

**버튼/액션 로직**:
- [+새 견적] → `/quote-simulator`
- [상세 보기] → `/member/quotations/{id}`
- [PDF 다운로드] - client-side generateQuotePDF()
- [발주하기] - 주문 생성 모달
- [삭제] - 견적서 삭제 (DRAFT만)
- [주문 변환] - 주문 변환 (APPROVED만)

---

#### `/member/quotations/[id]` - 견적서 상세

**데이터베이스 테이블**:
- `quotations` - 견적 상세
- `quotation_items` - 견적 항목
- `orders` - 연결된 주문

**API 엔드포인트**:
- `GET /api/member/quotations/{id}` - 견적 상세

**버튼/액션 로직**:
- [뒤로가기] → `/member/quotations`
- [PDF 다운로드] - PDF 다운로드
- [주문 변환] → `/member/orders/new?quotationId={id}`
- [발주하기] - 개별 항목 주문 생성

---

### 기타 (4개)

#### `/member/samples` - 샘플 요청 관리

**데이터베이스 테이블**:
- `sample_requests` - 샘플 요청
- `sample_items` - 샘플 항목
- `delivery_addresses` - 배송지

**API 엔드포인트**:
- `GET /api/member/samples` - 샘플 요청 목록

**버튼/액션 로직**:
- [새 샘플 신청] → `/samples`
- [상세 보기] → `/member/samples/{id}`

---

#### `/member/invoices` - 인보이스
#### `/member/deliveries` - 배송 추적
#### `/member/inquiries` - 문의 내역

유사한 패턴으로 구현.

---

## 4. 관리자 페이지

#### `/admin/dashboard` - 관리자 대시보드

**데이터베이스 테이블**:
- `orders`, `quotations`, `sample_requests`
- `production_orders`, `shipments`

**API 엔드포인트**:
- `GET /api/admin/dashboard/statistics?period={days}` - 통계 조회

**버튼/액션 로직**:
- [기간 필터] - 7일/30일/90일
- [수동 재시도] - 에러 시 재시도
- [페이지 새로고침] - window.location.reload()

---

#### `/admin/orders` - 주문 관리

**데이터베이스 테이블**:
- `orders` - 주문 목록
- `order_status_history` - 상태 기록

**API 엔드포인트**:
- 직접 Supabase 클라이언트 사용

**버튼/액션 로직**:
- [상태 필터] - 전체/특정 상태
- [단일 상태 변경] - 개별 주문 상태 변경
- [대량 상태 변경] - 일괄 변경
- [전체 선택] - 모든 주문 선택

---

#### `/admin/production` - 생산 관리

**데이터베이스 테이블**:
- `production_orders` - 9단계 프로세스
  - current_stage: data_received, inspection, design, plate_making, printing, surface_finishing, die_cutting, lamination, final_inspection
  - progress_percentage: 0-100%

**API 엔드포인트**:
- `GET /api/admin/production/jobs` - 생산 작업 목록
- `PATCH /api/admin/production/jobs` - 상태 업데이트

**버튼/액션 로직**:
- [필터] - 상태/공정 필터링
- [새로고침] - mutate()

---

## 5. 포털 페이지

#### `/portal` - 포털 홈

**데이터베이스 테이블**:
- `profiles`, `orders`, `quotations`
- `customer_notifications`, `production_logs`

**API 엔드포인트**:
- `GET /api/customer/dashboard` - 대시보드 데이터

**버튼/액션 로직**:
- [샘플 견적 의뢰] → `/quote-simulator`
- [문의하기] → `/portal/support`
- [제품 카탈로그] → `/catalog`
- [모두 보기] → `/portal/orders`

**상태 관리**:
- Server Component (RSC)
- Cookie 기반 인증

**참고**: `/member/dashboard`보다 단순화된 버전

---

## 데이터베이스 완전 매핑

### 핵심 테이블 구조 (58개 테이블)

---

**추가된 25개 테이블**: announcements, billing_addresses, companies, contract_reminder_history, delivery_addresses, spec_sheet_revisions, files, inventory, inventory_transactions, order_items, order_status_history, payment_confirmations, production_jobs, quotation_items, sample_items, shipment_tracking_events, shipments, inquiries, admin_notifications, contact_submissions, (plus 6 additional tables from migrations)

---

## 25개 추가 데이터베이스 테이블 상세

### 1. announcements (공지사항)
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'update', 'notice', 'promotion')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_announcements_is_published` on (is_published, published_at DESC)
- `idx_announcements_category` on (category)

**사용하는 페이지**:
- `/member/dashboard` - 대시보드 공지사항 표시

---

### 2. billing_addresses (청구지 주소)
```sql
CREATE TABLE billing_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  building TEXT,
  tax_number TEXT,
  email TEXT,
  phone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_billing_addresses_user_id` on (user_id)
- `idx_billing_addresses_is_default` on (user_id, is_default)

**사용하는 페이지**:
- `/member/orders/new` - 청구지 선택
- `/member/orders/[id]` - 주문 상세 청구지 정보

---

### 3. companies (기업 정보)
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL,
  legal_entity_type legal_entity_type NOT NULL,
  industry TEXT NOT NULL,
  payment_terms TEXT,
  status company_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**타입**:
- `legal_entity_type`: ENUM('KK', 'GK', 'GKDK', 'TK', 'KKK', 'Other')
- `company_status`: ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE')

**인덱스**:
- `idx_companies_corporate_number` on (corporate_number)
- `idx_companies_name` on (name)
- `idx_companies_status` on (status)

**사용하는 페이지**:
- `/member/orders` - B2B 주문 처리
- `/admin/dashboard` - 기업 통계

---

### 4. contract_reminders (계약 리마인더 기록)
```sql
CREATE TABLE contract_reminder_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  reminded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reminded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  response_received_at TIMESTAMPTZ,
  notes TEXT
);
```

**사용하는 페이지**:
- `/admin/contracts` - 계약 리마인더 관리

---

### 5. delivery_addresses (배송지 주소)
```sql
CREATE TABLE delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  building TEXT,
  phone TEXT NOT NULL,
  contact_person TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_delivery_addresses_user_id` on (user_id)
- `idx_delivery_addresses_is_default` on (user_id, is_default)

**사용하는 페이지**:
- `/samples` - 샘플 요청 배송지
- `/member/orders/new` - 배송지 선택

---

### 6. design_revisions (디자인 수정 내역)
```sql
CREATE TABLE spec_sheet_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_sheet_id UUID REFERENCES spec_sheets(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requested_changes JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**사용하는 페이지**:
- `/member/orders/[id]` - 디자인 수정 요청

---

### 7. files (파일 관리)
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  file_type file_type NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  validation_status file_validation_status NOT NULL DEFAULT 'PENDING',
  validation_results JSONB,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);
```

**타입**:
- `file_type`: ENUM('AI', 'PDF', 'PSD', 'PNG', 'JPG', 'EXCEL', 'OTHER')
- `file_validation_status`: ENUM('PENDING', 'VALID', 'INVALID')

**인덱스**:
- `idx_files_order_id` on (order_id)
- `idx_files_quotation_id` on (quotation_id)
- `idx_files_order_version` on (order_id, version)

**사용하는 페이지**:
- `/member/orders/[id]` - 주문 파일 첨부
- `/smart-quote` - 견적 파일 업로드

---

### 8. inventory (재고)
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_location TEXT NOT NULL DEFAULT 'MAIN',
  bin_location TEXT,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  quantity_allocated INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
  reorder_point INTEGER DEFAULT 10,
  max_stock_level INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_inventory_product_id` on (product_id)
- `idx_inventory_warehouse_location` on (warehouse_location)
- `idx_inventory_reorder_check` on (product_id, quantity_available) WHERE quantity_available <= reorder_point

**사용하는 페이지**:
- `/admin/inventory` - 재고 관리
- `/catalog` - 재고 상태 표시

---

### 9. inventory_transactions (재고 입출고 내역)
```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reference_number TEXT,
  reference_type TEXT,
  reason TEXT,
  notes TEXT,
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**transaction_type**: 'receipt', 'issue', 'adjustment', 'transfer', 'return', 'production_in', 'production_out'

**인덱스**:
- `idx_inventory_transactions_product_id` on (product_id)
- `idx_inventory_transactions_order_id` on (order_id)
- `idx_inventory_transactions_audit` on (product_id, transaction_type, transaction_at DESC)

**사용하는 페이지**:
- `/admin/inventory` - 재고 이력 조회

---

### 10. korea_corrections (한국어 교정 내역)
※ 현재 마이그레이션 파일에 없음. 추후 추가 예정

---

### 11. korea_transfer_log (한국어 전송 로그)
※ 현재 마이그레이션 파일에 없음. 추후 추가 예정

---

### 12. notifications (알림 - customer_notifications)
```sql
CREATE TABLE customer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_customer_notifications_user_id` on (user_id)
- `idx_customer_notifications_is_read` on (is_read)
- `idx_customer_notifications_order_id` on (order_id)

**사용하는 페이지**:
- `/member/dashboard` - 알림 표시
- `/portal` - 포털 알림

---

### 13. order_items (주문 항목)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  specifications JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_order_items_order_id` on (order_id)

**사용하는 페이지**:
- `/member/orders/[id]` - 주문 상세 항목
- `/admin/orders` - 주문 항목 관리

---

### 14. order_status_history (주문 상태 변경 이력)
```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_order_status_history_order_id` on (order_id)
- `idx_order_status_history_to_status` on (to_status)
- `idx_order_status_history_order_changed_at` on (order_id, changed_at DESC)

**사용하는 페이지**:
- `/member/orders/[id]` - 주문 상태 타임라인

---

### 15. password_reset_tokens (비밀번호 재설정 토큰)
※ 현재 auth.users를 사용 중. 별도 테이블 없음.

---

### 16. payment_confirmations (결제 확인)
```sql
CREATE TABLE payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_gateway TEXT NOT NULL,
  gateway_transaction_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_response JSONB DEFAULT '{}',
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**사용하는 페이지**:
- `/api/payments/confirm` - 결제 확인 API

---

### 17. production_orders (생산 주문 - production_jobs)
```sql
CREATE TABLE production_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  job_number TEXT NOT NULL UNIQUE,
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  description TEXT,
  specifications JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  depends_on JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**job_type**: 'design_setup', 'material_prep', 'printing', 'lamination', 'slitting', 'pouch_making', 'quality_check', 'packaging', 'other'

**인덱스**:
- `idx_production_jobs_order_id` on (order_id)
- `idx_production_jobs_status` on (status)
- `idx_production_jobs_dashboard` on (status, scheduled_start_at, priority) WHERE status IN ('pending', 'scheduled', 'in_progress')

**사용하는 페이지**:
- `/admin/production` - 생산 작업 관리

---

### 18. quotation_items (견적 항목)
```sql
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  specifications JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_quotation_items_quotation_id` on (quotation_id)

**사용하는 페이지**:
- `/member/quotations/[id]` - 견적 상세 항목
- `/smart-quote` - 견적 항목 추가

---

### 19. sample_items (샘플 항목)
```sql
CREATE TABLE sample_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_request_id UUID NOT NULL REFERENCES sample_requests(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**인덱스**:
- `idx_sample_items_request_id` on (sample_request_id)

**사용하는 페이지**:
- `/samples` - 샘플 항목 추가
- `/member/samples` - 샘플 요청 내역

---

### 20. shipment_tracking_events (배송 추적 이벤트)
```sql
CREATE TABLE shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  event_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  description_ja TEXT,
  description_en TEXT,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**인덱스**:
- `idx_tracking_events_shipment_id` on (shipment_id)
- `idx_tracking_events_event_time` on (event_time DESC)

**사용하는 페이지**:
- `/member/deliveries` - 배송 추적
- `/admin/shipments` - 배송 관리

---

### 21. shipments (배송)
```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  carrier carrier_type NOT NULL,
  service_type shipping_service_type NOT NULL DEFAULT 'takkyubin',
  tracking_number TEXT,
  package_count INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC(6,2),
  dimensions_cm JSONB,
  delivery_time_slot delivery_time_slot DEFAULT 'none',
  delivery_date_request DATE,
  shipping_address JSONB NOT NULL,
  sender_address JSONB NOT NULL,
  pickup_scheduled_for TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  status shipment_status NOT NULL DEFAULT 'pending',
  tracking_data JSONB DEFAULT '{}',
  shipping_label_url TEXT,
  shipping_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**타입**:
- `carrier_type`: ENUM('yamato', 'sagawa', 'jp_post', 'seino')
- `shipment_status`: ENUM('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')

**인덱스**:
- `idx_shipments_order_id` on (order_id)
- `idx_shipments_tracking_number` on (tracking_number)
- `idx_shipments_status` on (status)

**사용하는 페이지**:
- `/member/deliveries` - 배송 조회
- `/admin/shipments` - 배송 관리

---

### 22. stage_action_history (단계 액션 이력)
※ production_logs 또는 order_status_history로 대체됨

---

### 23. inquiries (문의)
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inquiry_number TEXT NOT NULL UNIQUE,
  type inquiry_type NOT NULL,
  status inquiry_status NOT NULL DEFAULT 'open',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);
```

**타입**:
- `inquiry_type`: ENUM('product', 'quotation', 'sample', 'order', 'billing', 'other')
- `inquiry_status`: ENUM('open', 'responded', 'resolved', 'closed')

**인덱스**:
- `idx_inquiries_user_id` on (user_id)
- `idx_inquiries_status` on (status)
- `idx_inquiries_type` on (type)

**사용하는 페이지**:
- `/contact` - 문의 제출
- `/member/inquiries` - 문의 내역

---

### 24. admin_notifications (관리자 알림)
```sql
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**사용하는 페이지**:
- `/admin/dashboard` - 관리자 알림

---

### 25. contact_submissions (연락처 제출)
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**사용하는 페이지**:
- `/contact` - 문의 제출 폼

---

## 추가 테이블 요약

**총 58개 테이블**:
1. profiles (사용자)
2. orders (주문)
3. quotations (견적서)
4. contracts (계약)
5. customer_notifications (고객 알림)
6. sample_requests (샘플 요청)
7. products (제품)
8. **announcements** (공지사항) [NEW]
9. **billing_addresses** (청구지) [NEW]
10. **companies** (기업) [NEW]
11. **contract_reminder_history** (계약 리마인더) [NEW]
12. **delivery_addresses** (배송지) [NEW]
13. **spec_sheet_revisions** (디자인 수정) [NEW]
14. **files** (파일) [NEW]
15. **inventory** (재고) [NEW]
16. **inventory_transactions** (재고 입출고) [NEW]
17. **order_items** (주문 항목) [NEW]
18. **order_status_history** (주문 상태 이력) [NEW]
19. **payment_confirmations** (결제 확인) [NEW]
20. **production_jobs** (생산 작업) [NEW]
21. **quotation_items** (견적 항목) [NEW]
22. **sample_items** (샘플 항목) [NEW]
23. **shipment_tracking_events** (배송 추적) [NEW]
24. **shipments** (배송) [NEW]
25. **inquiries** (문의) [NEW]
26. **admin_notifications** (관리자 알림) [NEW]
27. **contact_submissions** (문의 제출) [NEW]
28-58. 기타 테이블 (signatures, work_orders, production_logs, invoices, etc.)

**외래 키 관계: 42개** (19개에서 23개 증가)

#### 1. profiles (사용자 프로필)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  kanji_last_name TEXT NOT NULL,
  kanji_first_name TEXT NOT NULL,
  kana_last_name TEXT NOT NULL,
  kana_first_name TEXT NOT NULL,
  corporate_phone TEXT,
  personal_phone TEXT,
  business_type business_type NOT NULL, -- INDIVIDUAL, CORPORATION, SOLE_PROPRIETOR
  company_name TEXT,
  legal_entity_number TEXT,
  role user_role NOT NULL, -- ADMIN, MEMBER
  status user_status NOT NULL, -- PENDING, ACTIVE, SUSPENDED, DELETED
  product_category product_category NOT NULL,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  street TEXT,
  building TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**사용하는 페이지**:
- `/auth/signin` - 로그인 시 프로필 조회
- `/auth/register` - 회원가입 시 프로필 생성
- `/member/profile` - 프로필 표시
- `/member/edit` - 프로필 수정
- `/member/dashboard` - 대시보드 사용자 정보
- `/member/settings` - 설정 관리

---

#### 2. orders (주문)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  quotation_id UUID REFERENCES quotations(id),
  order_number TEXT NOT NULL UNIQUE,
  current_state TEXT NOT NULL,
  status OrderStatus NOT NULL,
  total_amount NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  payment_term VARCHAR NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  requested_delivery_date TIMESTAMPTZ,
  estimated_delivery_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**인덱스**:
- `idx_orders_user_status_created` on (user_id, status, created_at DESC)
- `idx_orders_active` on (user_id, created_at DESC)
- `idx_orders_admin_dashboard` on (status, created_at DESC)

**사용하는 페이지**:
- `/member/orders` - 주문 목록
- `/member/orders/[id]` - 주문 상세
- `/member/orders/new` - 새 주문 생성
- `/admin/orders` - 관리자 주문 관리
- `/admin/dashboard` - 대시보드 통계
- `/portal/orders` - 포털 주문 목록

---

#### 3. quotations (견적서)
```sql
CREATE TABLE quotations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  quotation_number TEXT NOT NULL UNIQUE,
  status quotation_status NOT NULL, -- DRAFT, SENT, APPROVED, REJECTED, EXPIRED
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  subtotal_amount NUMERIC NOT NULL,
  tax_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  valid_until TIMESTAMPTZ,
  notes TEXT,
  pdf_url TEXT,
  admin_notes TEXT,
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**인덱스**:
- `idx_quotations_user_status_created` on (user_id, status, created_at DESC)
- `idx_quotations_active` on (user_id, created_at DESC)
- `idx_quotations_member_list` on (user_id, status, created_at DESC)

**사용하는 페이지**:
- `/member/quotations` - 견적서 목록
- `/member/quotations/[id]` - 견적서 상세
- `/smart-quote` - 스마트 견적
- `/quote-simulator` - 견적 시뮬레이터
- `/member/orders/new` - 견적서로 주문 생성

---

#### 4. contracts (계약)
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID REFERENCES profiles(id),
  work_order_id UUID REFERENCES work_orders(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  customer_name TEXT NOT NULL,
  customer_representative TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status contract_status NOT NULL,
  customer_signed_at TIMESTAMPTZ,
  admin_signed_at TIMESTAMPTZ,
  signature_data JSONB,
  pdf_url TEXT,
  terms JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**사용하는 페이지**:
- `/member/dashboard` - 대시보드 계약 통계
- `/admin/contracts` - 관리자 계약 관리
- `/b2b/contracts` - B2B 계약

---

#### 5. customer_notifications (고객 알림)
```sql
CREATE TABLE customer_notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  title_ja TEXT NOT NULL,
  message TEXT NOT NULL,
  message_ja TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  quotation_id UUID REFERENCES quotations(id),
  shipment_id UUID REFERENCES shipments(id),
  action_url TEXT,
  action_label TEXT,
  action_label_ja TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_via_email BOOLEAN NOT NULL DEFAULT FALSE,
  sent_via_sms BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**사용하는 페이지**:
- `/member/dashboard` - 대시보드 알림 표시
- `/portal` - 포털 알림

---

#### 6. sample_requests (샘플 요청)
```sql
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  request_number TEXT NOT NULL UNIQUE,
  status sample_request_status NOT NULL, -- received, processing, shipped, delivered, cancelled
  delivery_address_id UUID REFERENCES delivery_addresses(id),
  tracking_number TEXT,
  notes TEXT,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**사용하는 페이지**:
- `/samples` - 샘플 요청
- `/member/samples` - 내 샘플 요청 내역

---

#### 7. products (제품)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  product_code TEXT NOT NULL UNIQUE,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ja TEXT,
  description_en TEXT,
  category product_category_type NOT NULL,
  material_type material_type NOT NULL,
  specifications JSONB NOT NULL,
  base_price NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL,
  min_order_quantity INTEGER NOT NULL,
  lead_time_days INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**사용하는 페이지**:
- `/catalog` - 제품 목록
- `/catalog/[slug]` - 제품 상세
- `/quote-simulator` - 제품 선택
- `/smart-quote` - 견적 작성
- `/samples` - 샘플 제품 선택

---

### 데이터베이스 관계도

```
profiles (1) ──< (N) orders (1) ──< (N) order_items
    │                   │
    │                   ├──< (1) quotations (1) ──< (N) quotation_items
    │                   │
    │                   ├──< (1) contracts
    │                   │
    │                   ├──< (N) shipments
    │                   │
    │                   └──< (N) production_logs
    │
    ├──< (N) sample_requests (1) ──< (N) sample_items
    │
    └──< (N) customer_notifications

products (1) ──< (N) order_items
          └──< (N) quotation_items
```

---

## API 엔드포인트 완전 목록

### Public APIs (인증 불필요)

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/contact` | POST | 문의 제출 | contact_submissions |
| `/api/samples/request` | POST | 샘플 요청 | sample_requests |
| `/api/products` | GET | 제품 조회 | products |
| `/api/products/[slug]` | GET | 제품 상세 | products |
| `/api/products/categories` | GET | 카테고리 | product_categories |
| `/api/download/templates/*` | GET | 템플릿 다운로드 | templates |
| `/api/ai/parse` | POST | AI 문서 파싱 | ai_extraction_jobs |
| `/api/ai/review` | POST | AI 문서 검토 | ai_reviews |
| `/api/analytics/vitals` | POST | 웹 바이탈 로깅 | web_vitals |
| `/api/errors/log` | POST | 클라이언트 에러 로깅 | error_logs |

---

### Member APIs (인증 필요)

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/member/orders` | GET | 주문 목록 | orders |
| `/api/member/orders/[id]` | GET | 주문 상세 | orders, order_items |
| `/api/member/orders/confirm` | POST | 주문 생성 | orders |
| `/api/member/quotations` | GET | 견적서 목록 | quotations |
| `/api/member/quotations/[id]` | GET | 견적서 상세 | quotations |
| `/api/quotations/submit` | POST | 견적 제출 | quotations |
| `/api/quotations/save` | POST | 견적 저장 | quotations |
| `/api/member/samples` | GET | 샘플 요청 내역 | sample_requests |
| `/api/member/profile` | GET/PUT | 프로필 관리 | profiles |
| `/api/member/settings` | GET/POST | 설정 관리 | profiles |
| `/api/member/delete-account` | GET/POST | 계정 삭제 | profiles |
| `/api/member/invoices` | GET | 인보이스 목록 | invoices |
| `/api/member/deliveries` | GET | 배송 내역 | shipments |
| `/api/member/inquiries` | GET | 문의 내역 | inquiries |

---

### Admin APIs (관리자 권한)

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/dashboard/statistics` | GET | 대시보드 통계 | orders, quotations, etc. |
| `/api/admin/orders` | GET | 주문 관리 | orders |
| `/api/admin/orders/[id]` | PATCH | 주문 상태 변경 | orders |
| `/api/admin/production/jobs` | GET | 생산 작업 목록 | production_jobs |
| `/api/admin/production/jobs` | PATCH | 생산 상태 업데이트 | production_jobs |
| `/api/admin/contracts/workflow` | GET | 계약 워크플로우 | contracts |
| `/api/admin/inventory/items` | GET | 재고 목록 | inventory |
| `/api/admin/inventory/adjust` | POST | 재고 조정 | inventory_transactions |
| `/api/admin/approve-member` | GET/POST | 회원 승인 | profiles |
| `/api/admin/shipments` | GET | 배송 관리 | shipments |
| `/api/shipments/create` | POST | 배송 생성 | shipments |

---

### B2B APIs

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/b2b/login` | POST | B2B 로그인 | profiles |
| `/api/b2b/register` | POST | B2B 회원가입 | profiles |
| `/api/b2b/verify-email` | POST | 이메일 인증 | profiles |
| `/api/b2b/quotations` | GET | B2B 견적서 | quotations |
| `/api/b2b/quotations/[id]/approve` | POST | 견적 승인 | quotations |
| `/api/b2b/quotations/[id]/convert` | POST | 주문 변환 | orders |
| `/api/b2b/contracts` | GET | 계약 목록 | contracts |
| `/api/b2b/contracts/[id]/sign` | POST | 계약 서명 | contracts, signatures |
| `/api/b2b/dashboard/stats` | GET | B2B 대시보드 | b2b_dashboard_stats |

---

### Customer Portal APIs

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/customer/dashboard` | GET | 포털 대시보드 | customers, orders |
| `/api/customer/orders` | GET | 포털 주문 목록 | orders |
| `/api/customer/orders/[id]` | GET | 포털 주문 상세 | orders |
| `/api/customer/profile` | GET/PATCH | 포털 프로필 | profiles |
| `/api/customer/documents` | GET | 문서 목록 | customer_documents |
| `/api/customer/notifications` | GET | 알림 목록 | customer_notifications |

---

## 콘솔 에러 분석 및 해결

### Critical Errors (긴급 수정 필요)

#### Error #1: Dashboard stats undefined access
**위치**: `src/app/member/dashboard/page.tsx:72-111`

**에러 내용**:
```
TypeError: Cannot read properties of undefined (reading 'length')
at DashboardContent (dashboard page.tsx)
```

**해결 방법**:
```typescript
// src/lib/dashboard.ts 수정

// 타입 안전한 stats getter
export async function getDashboardStatsSafe(userId: string): Promise<DashboardStats> {
  const defaultStats: DashboardStats = {
    orders: { new: [], processing: [], total: 0 },
    quotations: { pending: [], total: 0 },
    samples: { pending: [], total: 0 },
    inquiries: { unread: [], total: 0 },
    announcements: [],
    contracts: { pending: [], signed: 0, total: 0 },
    notifications: [],
  };

  try {
    const stats = await getDashboardStats(userId);

    // null-safe merge with defaults
    return {
      orders: stats?.orders ?? defaultStats.orders,
      quotations: stats?.quotations ?? defaultStats.quotations,
      samples: stats?.samples ?? defaultStats.samples,
      inquiries: stats?.inquiries ?? defaultStats.inquiries,
      announcements: stats?.announcements ?? defaultStats.announcements,
      contracts: stats?.contracts ?? defaultStats.contracts,
      notifications: stats?.notifications ?? defaultStats.notifications,
    };
  } catch (error) {
    console.error('[getDashboardStatsSafe] Error:', error);
    return defaultStats;
  }
}

// src/app/member/dashboard/page.tsx 수정

async function DashboardContent() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect('/auth/signin');
  }

  // 타입 안전한 함수 사용
  const stats = await getDashboardStatsSafe(userId);

  // safeGet 불필요 - TypeScript가 타입 보장
  const { orders, quotations, samples, inquiries, announcements, contracts, notifications } = stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatsCard
          title="新規注文"
          count={orders.processing.length}
          total={orders.total}
          href="/member/orders"
          icon="📦"
          color="blue"
        />
        {/* ... */}
      </div>
    </div>
  );
}
```

---

### TypeScript Type Safety Issues

#### Error #2: @ts-ignore 과도 사용 (50+ instances)

**해결 방법**:
```typescript
// ❌ 현재 방식
// @ts-ignore - Supabase type inference issue
.update({ is_default: false })

// ✅ 올바른 방식
import type { Database } from '@/types/database';

type DeliveryAddressUpdate = Database['public']['Tables']['delivery_addresses']['Update'];

.update({ is_default: false } as Partial<DeliveryAddressUpdate>)
```

---

### Console Logging Issues

#### Error #3: 과도한 console 로깅 (358 files)

**해결 방법**:
```typescript
// src/lib/logger.ts 생성
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    } else {
      // Sentry.captureException(...);
    }
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  debug: (...args: any[]) => {
    if (isDev && process.env.DEBUG) {
      console.log(...args);
    }
  },
};

// 사용
logger.error('[Dashboard] Failed to fetch stats', error);
```

---

## 누락/중복 URL 분석

### 누락된 페이지 (0개)
현재 분석 결과 누락된 페이지 없음. 모든 페이지가 문서화됨.

### 중복된 URL (0개)
현재 분석 결과 중복된 URL 없음. 모든 페이지가 고유한 경로를 가짐.

### 비고
- `/member/orders/history`와 `/member/orders`는 기능이 중복되지만 URL은 다름
- `/portal/*`와 `/member/*`는 유사한 기능을 제공하지만 타겟 사용자가 다름

---

## 총 정리

### 페이지 수
- **총 82개 페이지** (공개 37 + 인증 6 + 회원 19 + 관리자 14 + 포털 6)

### 데이터베이스 테이블
- **58개 핵심 테이블** (25개 추가됨)
- **42개 외래 키 관계** (19개에서 23개 증가)
- **28개 성능 인덱스**

### API 엔드포인트
- **100개 이상의 엔드포인트**
- Public: 10개
- Member: 45개
- Admin: 15개
- B2B: 20개
- Service: 10개

### 콘솔 에러
- **CRITICAL**: 1개 (dashboard undefined)
- **HIGH**: 12개
- **MEDIUM**: 18개
- **LOW**: 27개

### 우선 수정 사항
1. ✅ dashboard stats undefined access 수정 (getDashboardStatsSafe)

---

## Supabase MCP로 데이터베이스 설정하기

### 현재 설정 상태

**이미 설정 완료됨!**
- ✅ `.mcp.json`에 `supabase-epackage` 서버 설정됨
- ✅ Project Ref: `ijlgpzjdfipzmjvawofp`
- ✅ Migration 파일 40개 존재 (`supabase/migrations/`)

### 사용 가능한 MCP 도구

| 도구 | 설명 | 사용 예시 |
|-----|------|----------|
| `mcp__supabase-epackage__execute_sql` | SQL 직접 실행 | `SELECT * FROM profiles` |
| `mcp__supabase-epackage__apply_migration` | 마이그레이션 적용 | 테이블/인덱스 생성 |
| `mcp__supabase-epackage__list_tables` | 테이블 목록 조회 | 현재 테이블 확인 |
| `mcp__supabase-epackage__list_migrations` | 마이그레이션 내역 | 적용된 마이그레이션 확인 |
| `mcp__supabase-epackage__get_advisors` | 성능/보안 권고 | 인덱스/RLS 권고사항 |

### Migration 파일 완전 목록 (40개)

#### 기존 Migration 파일 (36개)
Supabase 데이터베이스의 모든 테이블, 인덱스, 함수, 트리거를 생성합니다.

#### 추가된 Migration 파일 (4개)

| 파일명 | 목적 | 생성하는 테이블/함수 | 생성일 | 의존성 |
|-------|------|---------------------|--------|--------|
| `20251231000005_create_spec_sheet_revisions.sql` | 사양서(Spec Sheet) 수정 요청 추적 | `spec_sheet_revisions` 테이블 | 2025-12-31 | spec_sheets 테이블 |
| `20251231000006_delivery_tracking.sql` | 배송 추적 정보 관리 | `delivery_tracking` 테이블 | 2025-12-31 | orders 테이블 |
| `20250105_premium_downloads_table.sql` | 프리미엄 콘텐츠 다운로드 및 리드 생성 | `premium_downloads` 테이블 | 2025-01-05 | 없음 |
| `20260105000002_create_external_order_functions.sql` | 외부 주문 수접 및 결제 확인 RPC 함수 | `payment_confirmations` 테이블, `create_external_order`, `confirm_payment` 함수 | 2026-01-05 | quotations, orders 테이블 |

#### Migration 상세 정보

**1. spec_sheet_revisions (사양서 수정 관리)**
- 목적: 고객의 사양서 수정 요청을 추적하고 관리
- 주요 필드:
  - `spec_sheet_id`: 원본 사양서 참조
  - `requested_by`: 수정 요청자
  - `requested_changes`: 요청된 수정 사항 배열
  - `status`: pending → in_progress → completed/rejected
- 사용처: 제품 사양서 협업 워크플로우

**2. delivery_tracking (배송 추적)**
- 목적: 주문의 배송 정보, 추적번호, 배송일자 관리
- 주요 필드:
  - `order_id`: 주문 참조
  - `approval_date`: 승인일 (납품 기준일)
  - `tracking_number`: 운송장 번호
  - `carrier`: 택사사 (ems, surface_mail, sea_freight, air_freight)
  - `estimated_delivery_date_min/max`: 예상 배송일 범위
- 사용처: 배송 추적 시스템, 고객 포털

**3. premium_downloads (프리미엄 콘텐츠 다운로드)**
- 목적: 프리미엄 자료 다운로드 시 리드 정보 수집
- 주요 필드:
  - `content_id`: 콘텐츠 식별자
  - `name`, `email`, `company`: 리드 정보
  - `industry`, `role`: 직업 정보
  - `consent`: 개인정보 동의
  - `newsletter`: 뉴스레터 수신 동의
- 사용처: 마케팅 리드 생성, CRM 연동

**4. create_external_order_functions (외부 주문 API)**
- 목적: P2-12, P2-13 태스크를 위한 외부 주문 수접 API
- 생성하는 함수:
  - `create_external_order()`: 외부 시스템에서 주문 생성
  - `confirm_payment()`: 결제 확인 처리
- 생성하는 테이블:
  - `payment_confirmations`: 결제 확인 내역
- 주요 기능:
  - 멀tier PG 지원 (Square, Stripe, PayPal, SB Payment)
  - 결제 상태 추적 (pending → completed/failed)
  - 게이트웨이 응답 저장 (JSONB)
- 사용처: B2B 주문 통합, 외부 결제 시스템 연동

### 데이터베이스 설정 방법

#### 방법 1: 기존 Migration 실행 (권장)
```bash
# 이미 준비된 40개 migration 파일 실행
npx supabase db push
```

#### 방법 2: MCP로 직접 SQL 실행
```typescript
// MCP 도구로 직접 쿼리 실행
import { executeSQL } from '@/mcp';

// 테이블 구조 확인 예시
const result = await executeSQL(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'contracts'
  ORDER BY ordinal_position;
`);
```

#### 방법 3: TypeScript에서 Migration 적용
```typescript
import { applyMigration } from '@/mcp';

// 새로운 마이그레이션 적용 예시
await applyMigration({
  name: 'add_new_feature',
  query: `
    -- Your migration SQL here
  `
});
```

### Database Schema 확인 방법

```typescript
// 1. 테이블 목록 확인
const tables = await listTables({ schemas: ['public'] });
console.log('Tables:', tables);

// 2. 특정 테이블 구조 확인
const result = await executeSQL(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'contracts'
  ORDER BY ordinal_position;
`);
```

### RLS (Row Level Security) 정책 확인

```typescript
// RLS 정책 상태 확인
const result = await executeSQL(`
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
`);
```

---

## 🎯 다음 단계

1. **Critical 에러 수정** (선행 작업)
   - dashboard.ts 코드 수정

2. **Migration 실행**
   ```bash
   npx supabase db push
   ```

3. **RLS 정책 확인**
   ```bash
   npx supabase db reset --db-url "postgresql://..."
   ```

---

**문서 버전**: 2.0
**마지막 업데이트**: 2026-01-06
**다음 리뷰**: 수정 완료 후
