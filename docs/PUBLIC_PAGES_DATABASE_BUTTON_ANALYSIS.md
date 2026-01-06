# 공개 페이지 데이터베이스 및 버튼 로직 분석 보고서

**분석 일자**: 2026-01-05
**프로젝트**: Epackage Lab B2B 패키징 시스템
**대상**: 37개 공개 페이지

---

## 분석 개요

본 보고서는 Epackage Lab 웹사이트의 37개 공개 페이지에서 사용되는 데이터베이스 연결, API 엔드포인트, 버튼 로직, 상태 관리, 폼 처리 방식을 체계적으로 분석한 결과입니다.

---

## 1. 홈페이지 & 핵심 페이지 (8개)

### `/` - 홈페이지

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA 버튼 → `/contact`로 이동
- CTA 버튼 → `/quote-simulator`로 이동
- 카탈로그 버튼 → `/catalog`로 이동
- 제품 상세 버튼 → `/catalog/[slug]`로 이동

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/about` - 회사 소개

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [お問い合わせ] 버튼 → `/contact`로 라우팅
- [見積もる] 버튼 → `/quote-simulator`로 라우팅

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/contact` - 문의하기

**데이터베이스 테이블:**
- `inquiries` - 문의 사항 저장
  - `user_id`: UUID (nullable)
  - `inquiry_number`: TEXT (Primary identifier)
  - `request_number`: TEXT (Human-readable)
  - `type`: TEXT (inquiry type)
  - `customer_name`: TEXT
  - `customer_name_kana`: TEXT
  - `company_name`: TEXT (nullable)
  - `email`: TEXT
  - `phone`: TEXT
  - `postal_code`, `prefecture`, `city`, `street`: TEXT (nullable)
  - `subject`, `message`: TEXT
  - `urgency`: TEXT ('low', 'normal', 'high', 'urgent')
  - `status`: TEXT ('pending', 'in_progress', 'resolved', 'closed')
  - `privacy_consent`: BOOLEAN
  - `responded_at`: TIMESTAMP (nullable)

**API 엔드포인트:**
- `POST /api/contact` - 문의 제출
  - Zod validation (Japanese rules)
  - Rate limiting: 10 requests/15 minutes
  - SendGrid email 발송 (고객 + 관리자)
  - DB 저장 후 이메일 발송
  - 응답: `{ success, message, data: { requestId, inquiryId, emailSent, messageIds } }`

**버튼/액션 로직:**
- [送信する] 버튼 → `POST /api/contact` 호출
  - 폼 검증 (React Hook Form + Zod)
  - 로딩 상태 표시
  - 성공 시 `/contact/thank-you`로 리다이렉트
  - 실패 시 에러 메시지 표시

**상태 관리:**
- React Hook Form (폼 상태)
- Local state (로딩, 에러, 성공 상태)

**폼 처리:**
- **폼명**: ContactForm
- **검증**: Zod schema
  - 일본어 이름 (한자, 카타카나)
  - 이메일 형식
  - 전화번호 형식
  - 문의 유형 (enum)
  - 프라이버시 동의 (required)
- **제출 로직**:
  1. Zod validation
  2. DB 저장 (inquiries 테이블)
  3. SendGrid 이메일 발송
  4. 성공/실패 응답

---

### `/service` - 서비스 안내

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [お問い合わせ] → `/contact`
- [見積もり] → `/quote-simulator`
- [サンプル依頼] → `/samples`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/privacy` - 개인정보 처리방침

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 없음

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/terms` - 이용약관

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 없음

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/legal` - 법적 정보

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 없음

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/csr` - CSR 활동

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA 버튼 → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

## 2. 제품 카탈로그 (7개)

### `/catalog` - 제품 카탈로그 메인

**데이터베이스 테이블:**
- `products` - 제품 정보
  - `id`, `name_ja`, `name_en`, `category`
  - `description_ja`, `description_en`
  - `specifications`: JSONB
  - `is_active`: BOOLEAN
  - `sort_order`: INTEGER

**API 엔드포인트:**
- `GET /api/products` - 제품 목록 조회
  - Query params: `category`, `locale`, `limit`, `activeOnly`
  - Fallback to static data if DB unavailable
- `GET /api/products/categories` - 카테고리 목록

**버튼/액션 로직:**
- [詳細を見る] → `/catalog/[slug]` (제품 상세)
- [見積もりに追加] → 카트에 추가 (CartContext)
- [比較に追加] → 비교에 추가 (ComparisonContext)

**상태 관리:**
- `CartProvider` - 장바구니 상태
- `ComparisonProvider` - 제품 비교 상태

**폼 처리:**
- 필터 폼 (AdvancedFilters 컴포넌트)
  - 카테고리 필터
  - 사이즈 필터
  - 재질 필터
  - 검색어 입력

---

### `/catalog/[slug]` - 개별 제품 상세

**데이터베이스 테이블:**
- `products` - 제품 정보 (단일 조회)

**API 엔드포인트:**
- `GET /api/products` (with category filter)
- Static fallback data 사용 (generateStaticParams)

**버튼/액션 로직:**
- [カートに追加] → CartContext.addItem()
- [見積もりを作成] → `/smart-quote` (with product pre-selected)
- [比較に追加] → ComparisonContext.addItem()
- [サンプル依頼] → `/samples` (with product pre-selected)

**상태 관리:**
- `CartContext`
- `ComparisonContext`
- Local state (quantity, specifications)

**폼 처리:**
- 수량 선택 폼
- 사양 선택 폼 (옵션별)

---

### `/guide` - 가이드 메인

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [デザイン相談] → `/contact`
- [テンプレート] → `/samples` (또는 `/data-templates`)

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/guide/color` - 색상 가이드

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/guide/size` - 사이즈 가이드

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/guide/image` - 이미지 가이드

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/guide/shirohan` - 백색 가이드

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/guide/environmentaldisplay` - 환경 표시 가이드

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

## 3. 산업별 솔루션 (4개)

### `/industry/cosmetics` - 화장품 포장재

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [お問い合わせ] → `/contact` (with pre-filled inquiry type)
- [見積もり] → `/quote-simulator`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/industry/electronics` - 전자제품 포장재

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [お問い合わせ] → `/contact`
- [見積もり] → `/quote-simulator`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/industry/food-manufacturing` - 식품 제조 포장재

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [お問い合わせ] → `/contact`
- [見積もり] → `/quote-simulator`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/industry/pharmaceutical` - 제약 포장재

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [お問い合わせ] → `/contact`
- [見積もり] → `/quote-simulator`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

## 4. 견적 & 도구 (6개)

### `/pricing` - 가격 정보

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 자동 리다이렉트 → `/roi-calculator`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/smart-quote` - 스마트 견적 시스템

**데이터베이스 테이블:**
- `quotations` - 견적 저장 (제출 시)
  - `user_id`: UUID
  - `quotation_number`: TEXT (format: QT-YYYY-NNNN)
  - `status`: TEXT ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED')
  - `customer_name`, `customer_email`, `customer_phone`
  - `subtotal_amount`, `tax_amount`, `total_amount`: NUMERIC
  - `valid_until`: TIMESTAMP
  - `notes`: TEXT
- `quotation_items` - 견적 품목
  - `quotation_id`: UUID (FK)
  - `product_name`, `product_code`, `category`
  - `quantity`, `unit_price`, `total_price`: NUMERIC
  - `specifications`: JSONB
  - `notes`: TEXT

**API 엔드포인트:**
- `POST /api/quotations/submit` - 견적 제출
  - Supabase SQL execution 사용
  - 인증 필요 (Bearer token)
  - 자동 견적번호 생성 (QT-YYYY-NNNN)
  - 소비세 자동 계산 (10%)
  - 유효기간 30일 설정

**버튼/액션 로직:**
- [次へ] → 다음 스텝 이동 (ImprovedQuotingWizard)
- [前へ] → 이전 스텝 이동
- [見積を提出] → `POST /api/quotations/submit`
  - 폼 검증
  - API 호출
  - 성공 시 `/member/quotations`로 이동
- [PDFをダウンロード] → `GET /api/quotes/pdf` (제출 후)
- [Excelをダウンロード] → `GET /api/quotes/excel` (제출 후)

**상태 관리:**
- `QuoteProvider` - 견적 기본 정보
- `MultiQuantityQuoteProvider` - 복수 수량 견적
- Local state (현재 스텝, 선택사항)

**폼 처리:**
- **폼명**: ImprovedQuotingWizard
- **검증**: React Hook Form + Zod
- **스텝**: 5단계
  1. 제품 선택
  2. 수량 및 사양
  3. 인쇄 옵션
  4. 배송 정보
  5. 확인 및 제출
- **제출 로직**:
  1. 인증 체크
  2. 사용자 프로필 조회
  3. 견적번호 생성
  4. quotations 테이블에 저장
  5. quotation_items 테이블에 품목 저장
  6. PDF 생성 (백그라운드)

---

### `/quote-simulator` - 견적 시뮬레이터

**데이터베이스 테이블:**
- `quotations` (제출 시, 위와 동일)

**API 엔드포인트:**
- `POST /api/quotations/submit` (위와 동일)
- `GET /api/products` - 제품 정보 조회

**버튼/액션 로직:**
- [統合見積もりツール] → 현재 페이지 (self)
- [詳細見積もり] → `/contact`
- [即時相談] → `tel:+81-80-6942-7235`

**상태 관리:**
- `QuoteProvider`
- `MultiQuantityQuoteProvider`

**폼 처리:**
- ImprovedQuotingWizard (위와 동일)

---

### `/simulation` - 제품 시뮬레이션

**데이터베이스 테이블:**
- 없음 (클라이언트 사이드 시뮬레이션)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 시뮬레이션 컨트롤 (제품 회전, 줌, 색상 변경)
- [見積もりを作成] → `/smart-quote` (with simulation data)

**상태 관리:**
- `SimulationProvider` - 시뮬레이션 상태
  - selectedProduct
  - configuration (size, color, material)
  - viewMode (3D, 2D)

**폼 처리:**
- 시뮬레이션 설정 폼
  - 제품 선택
  - 사이즈 선택
  - 색상 선택
  - 재질 선택

---

### `/roi-calculator` - ROI 계산기

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 자동 리다이렉트 → `/quote-simulator`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

## 5. 샘플 요청 (2개)

### `/samples` - 샘플 요청

**데이터베이스 테이블:**
- `sample_requests` - 샘플 요청
  - `id`: UUID
  - `user_id`: UUID (nullable, 게스트 가능)
  - `request_number`: TEXT (format: SMP-YYYY-NNNN)
  - `status`: TEXT ('received', 'processing', 'shipped', 'completed')
  - `delivery_address_id`: UUID (nullable)
  - `tracking_number`: TEXT (nullable)
  - `notes`: TEXT (JSONB, 배송 정보 포함)
  - `shipped_at`: TIMESTAMP (nullable)
- `sample_items` - 샘플 품목
  - `sample_request_id`: UUID (FK)
  - `product_id`: UUID (nullable)
  - `product_name`, `category`: TEXT
  - `quantity`: INTEGER (1-10)
- `admin_notifications` - 관리자 알림
  - 자동 생성됨

**API 엔드포인트:**
- `POST /api/samples/request` - 샘플 요청 제출
  - 인증 사용자 + 비인증 게스트 지원
  - 1-5개 샘플 제한
  - 최대 5개 배송지
  - 관리자 알림 자동 생성
  - SendGrid 이메일 발송

**버튼/액션 로직:**
- [サンプルを追加] → 샘플 리스트에 추가 (최대 5개)
- [削除] → 샘플 제거
- [配送先を追加] → 배송지 추가 (최대 5개)
- [送信する] → `POST /api/samples/request`
  - 폼 검증
  - API 호출
  - 성공 시 `/samples/thank-you`로 이동

**상태 관리:**
- Local state (샘플 리스트, 배송지 리스트, 폼 데이터)
- 로딩/에러 상태

**폼 처리:**
- **폼명**: SampleRequestForm
- **검증**: Zod schema
  - 고객 정보 (비인증 시): 회사명, 담당자, 이메일, 전화번호
  - 배송 정보: 배송 유형 (normal/other), 배송지 (1-5개)
  - 샘플 품목 (1-5개): 제품명, 카테고리, 수량 (1-10)
  - 메시지 (선택, 최대 2000자)
  - 긴급도 (선택)
  - 프라이버시 동의 (required)
- **제출 로직**:
  1. 인증 체크 (선택사항)
  2. Zod validation
  3. sample_requests 생성
  4. sample_items 생성 (루프)
  5. 배송 정보를 notes에 JSONB로 저장
  6. admin_notifications 생성
  7. SendGrid 이메일 발송

---

### `/samples/thank-you` - 샘플 요청 확인 페이지

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- [ホームに戻る] → `/`
- [お問い合わせ] → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

## 6. 기타 서비스 (9개)

### `/archives` - 프로젝트 아카이브

**데이터베이스 테이블:**
- 없음 (정적 페이지)

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 프로젝트 상세 보기

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/compare` - 제품 비교

**데이터베이스 테이블:**
- 없음 (클라이언트 상태 사용)

**API 엔드포인트:**
- `GET /api/products` - 제품 데이터

**버튼/액션 로직:**
- [比較に追加] → ComparisonContext.addProduct()
- [削除] → ComparisonContext.removeProduct()
- [クリア] → ComparisonContext.clear()
- [共有リンクをコピー] → URL 생성 및 복사

**상태 관리:**
- `ComparisonProvider` - 비교 상태
  - products: Array (최대 4개)
  - criteria: Object (가격, 사이즈, 재질 등)

**폼 처리:**
- 비교 기준 설정 폼
- 공유 링크 생성

---

### `/compare/shared` - 공유된 비교

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- `POST /api/comparison/save` - 비교 저장 (선택사항)

**버튼/액션 로직:**
- URL에서 비교 데이터 복원
- [自分の比較に追加] → 현재 비교에 병합

**상태 관리:**
- `ComparisonProvider`

**폼 처리:**
- 없음

---

### `/data-templates` - 데이터 템플릿

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- `GET /api/download/templates/[category]` - 템플릿 다운로드

**버튼/액션 로직:**
- [Excelをダウンロード] → Excel 템플릿 다운로드
- [PDFをダウンロード] → PDF 템플릿 다운로드

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/flow` - 비즈니스 프로세스

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 프로세스 단계별 상세 보기
- CTA → `/contact`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/inquiry/detailed` - 상세 문의

**데이터베이스 테이블:**
- `inquiries` (위와 동일)

**API 엔드포인트:**
- `POST /api/contact` (위와 동일)

**버튼/액션 로직:**
- [送信する] → 문의 제출

**상태 관리:**
- React Hook Form

**폼 처리:**
- 상세 문의 폼
- 추가 필드: 예산, 시기, 상세 요구사항

---

### `/premium-content` - 프리미엄 콘텐츠

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- CTA → 회원가입 또는 문의

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/print` - 인쇄용 정보

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 인쇄 버튼 → `window.print()`

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/news` - 뉴스/공지사항

**데이터베이스 테이블:**
- `news` (존재할 가능성, 현재 코드에는 없음)

**API 엔드포인트:**
- 없음 (정적 페이지)

**버튼/액션 로직:**
- 뉴스 항목 선택

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

### `/design-system` - 디자인 시스템 문서

**데이터베이스 테이블:**
- 없음

**API 엔드포인트:**
- 없음

**버튼/액션 로직:**
- 없음

**상태 관리:**
- 사용하지 않음

**폼 처리:**
- 없음

---

## 7. B2B 등록 (1개)

### `/b2b/register` - B2B 회원가입

**데이터베이스 테이블:**
- `profiles` - 사용자 프로필
  - `id`: UUID (PK)
  - `email`: TEXT (unique)
  - `user_type`: TEXT ('B2B')
  - `business_type`: TEXT ('CORPORATION', 'SOLE_PROPRIETOR')
  - `company_name`: TEXT
  - `corporate_number`: TEXT (nullable)
  - `founded_year`, `capital`, `representative_name`: TEXT (nullable)
  - `kanji_last_name`, `kanji_first_name`: TEXT
  - `kana_last_name`, `kana_first_name`: TEXT
  - `corporate_phone`: TEXT
  - `postal_code`, `prefecture`, `city`, `street`, `building`: TEXT
  - `role`: TEXT ('MEMBER', default)
  - `status`: TEXT ('PENDING', 관리자 승인 필요)
  - `business_document_path`: TEXT (nullable)
  - `verification_token`: TEXT (nullable)
  - `verification_expires_at`: TIMESTAMP (nullable)
- Supabase Storage: `b2b-documents` bucket
  - 사업자등록증 저장

**API 엔드포인트:**
- `POST /api/b2b/register` - B2B 회원가입
  - FormData multipart 처리
  - Zod validation
  - Supabase Auth 사용자 생성
  - 프로필 생성
  - 이메일 인증 토큰 생성
  - Resend 이메일 발송 (개발모크 지원)
  - 사업자등록증 업로드 (선택사항)

**버튼/액션 로직:**
- 4단계 스텝 폼
  - [次へ] → 다음 스텝 (필드 검증)
  - [前へ] → 이전 스텝
  - [登録する] → `POST /api/b2b/register`
    - 성공 시 `/b2b/register/sent`로 이동
    - 실패 시 에러 메시지 표시
- [ファイル選択] → 사업자등록증 업로드
  - 10MB 제한
  - PDF, JPG, PNG만 허용

**상태 관리:**
- React Hook Form (다단계 폼)
- Local state (currentStep, businessFile, fileError, serverError)

**폼 처리:**
- **폼명**: B2BRegistrationForm
- **검증**: Zod schema (4단계)
  - Step 1: 법인 정보 (businessType, companyName, corporateNumber, foundedYear, capital, representativeName)
  - Step 2: 담당자 정보 (kanjiLastName/FirstName, kanaLastName/FirstName, email, corporatePhone)
  - Step 3: 주소 정보 (postalCode, prefecture, city, street, building)
  - Step 4: 비밀번호 (password, confirmPassword) + 문서 업로드
- **제출 로직**:
  1. Zod validation
  2. FormData 생성
  3. 사업자등록증 첨부
  4. API 호출
  5. 응답 처리

---

## 요약 통계

### 데이터베이스 테이블 사용 현황

**자주 사용되는 테이블:**
1. `inquiries` - 문의 사항 (/contact)
2. `sample_requests`, `sample_items` - 샘플 요청 (/samples)
3. `quotations`, `quotation_items` - 견적 (/smart-quote, /quote-simulator)
4. `products` - 제품 정보 (/catalog, /catalog/[slug])
5. `profiles` - 사용자 프로필 (/b2b/register)
6. `admin_notifications` - 관리자 알림 (자동 생성)

### API 엔드포인트 사용 현황

**주요 API:**
1. `POST /api/contact` - 문의 제출
2. `POST /api/samples/request` - 샘플 요청
3. `POST /api/quotations/submit` - 견적 제출
4. `POST /api/b2b/register` - B2B 회원가입
5. `GET /api/products` - 제품 조회
6. `GET /api/download/templates/*` - 템플릿 다운로드

### 상태 관리 사용 현황

**React Context:**
1. `CartProvider` - 장바구니 (/catalog)
2. `ComparisonProvider` - 제품 비교 (/compare)
3. `QuoteProvider` - 견적 기본 정보 (/smart-quote, /quote-simulator)
4. `MultiQuantityQuoteProvider` - 복수 수량 견적 (/smart-quote, /quote-simulator)
5. `SimulationProvider` - 제품 시뮬레이션 (/simulation)

**Local State:**
- 대부분의 폼 페이지
- 로딩/에러 상태
- 스텝 트래커

### 폼 처리 패턴

**공통 패턴:**
1. **검증**: React Hook Form + Zod
2. **일본어 규칙**:
   - 이름 (한자, 카타카나)
   - 우편번호 (〒XXX-XXXX)
   - 전화번호
3. **API 호출**: fetch 또는 Supabase client
4. **이메일**: SendGrid (고객 + 관리자)
5. **에러 처리**: Zod validation errors + Generic errors
6. **성공 처리**: 리다이렉션 또는 성공 메시지

---

## 기술 스택 요약

### 프론트엔드
- **프레임워크**: Next.js 16 (App Router)
- **상태 관리**: React Context API
- **폼 관리**: React Hook Form + Zod
- **스타일링**: Tailwind CSS 4

### 백엔드
- **API**: Next.js API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **파일 저장**: Supabase Storage
- **이메일**: SendGrid
- **레이트 리미팅**: Custom rate limiter

### 보안
- **파일 검증**: Magic number validation (src/lib/file-validator)
- **파일 크기 제한**: 10MB
- **SQL 인젝션 방지**: Supabase SQL execution (prepared statements)
- **Rate Limiting**: API 별 제한 (예: contact API 10req/15min)

---

## 개선 제안

### 1. 데이터베이스
- [ ] `news` 테이블 추가 (/news 페이지용)
- [ ] `product_comparisons` 테이블 추가 (공유 비교 저장용)
- [ ] `inquiries` 테이블 인덱스 추가 (status, created_at)

### 2. API
- [ ] `/api/comparison/save` 완전 구현
- [ ] `/api/news` 뉴스 조회 엔드포인트 추가
- [ ] Rate limiting 일관성 적용

### 3. 폼
- [ ] 폼 제출 후 자동 스크롤 최상단 이동
- [ ] 폼 진행률 표시 개선
- [ ] 일본어 에러 메시지 표준화

### 4. UX
- [ ] 로딩 스피너 통일
- [ ] 에러 메시지 표준화
- [ ] 성공 메시지 표준화
- [ ] 모바일 반응형 개선

---

**문서 끝**
