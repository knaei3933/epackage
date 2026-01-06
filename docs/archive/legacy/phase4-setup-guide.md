# Phase 4 설정 가이드 - SendGrid 및 데이터베이스 연동

## 개요
이 가이드는 Phase 4 완료를 위해 필요한 설정을 다룹니다: Epackage Lab을 위한 데이터베이스 연동 및 이메일 시스템.

## 사전 요구사항

### 1. SendGrid 계정 설정
SendGrid는 트랜잭션 이메일 전송(문의 확인, 샘플 요청 알림)에 사용됩니다.

#### 1단계: SendGrid 계정 생성
1. 방문: https://sendgrid.com/
2. 무료 계정 가입 (하루 최대 100통)
3. 이메일 주소 인증

#### 2단계: API 키 생성
1. SendGrid 대시보드에 로그인
2. **Settings** → **API Keys**로 이동
3. **Create API Key** 클릭
4. 권한 설정:
   - **Mail Send**: Full Access
   - **Template Engine**: Read Access
5. 생성된 API 키 복사 (`SG.`로 시작)
6. **중요**: 이 키를 안전하게 저장하세요 - 다시 볼 수 없습니다!

#### 3단계: 발신자 도메인 인증
1. SendGrid 대시보드에서 **Settings** → **Sender Authentication**로 이동
2. **Get Started** → **Verify Your Domain** 클릭
3. 도메인 입력: `epackage-lab.com`
4. **DNS** (권장) 또는 **Automated Security** 선택
5. 도메인 DNS 공급자에 DNS 레코드 추가:
   ```
   Type: CNAME
   Host: em1234.epackage-lab.com  (예시)
   Value: u12345.wl.sendgrid.net  (예시)

   Type: TXT
   Host: em1234.epackage-lab.com
   Value: v=spf1 include:sendgrid.net ~all
   ```
6. DNS 전파 대기 (최대 48시간 소요, 보통 1시간 이내)
7. SendGrid 대시보드에서 **Verify** 클릭
8. 상태가 **"Verified"** ✓로 표시되어야 합니다

### 2. Supabase 서비스 역할 키 설정

#### 1단계: 서비스 역할 키 가져오기
1. Supabase 대시보드에 로그인: https://supabase.com/dashboard
2. 프로젝트 선택: `ijlgpzjdfipzmjvawofp`
3. **Project Settings** → **API**로 이동
4. **Project API keys** 섹션 찾기
5. **service_role** 키 복사 (anon 키가 아님!)
   - 이 키는 RLS 정책을 우회합니다
   - 서버 측에서만 사용하세요
   - 클라이언트 코드에 절대 노출하지 마세요

#### 2단계: .env.local 업데이트
`.env.local`에 다음 변수를 추가/업데이트하세요:

```env
# SendGrid 설정
SENDGRID_API_KEY=SG.실제-api-키-여기
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase 서비스 역할 키 (플레이스홀더 교체)
SUPABASE_SERVICE_ROLE_KEY=실제-서비스-역할-키-여기
```

## 구현 상태

### ✅ 완료된 파일

1. **`src/lib/email.ts`** - 이메일 유틸리티 라이브러리
   - `sendContactEmail()` - 문의 폼 이메일
   - `sendSampleRequestEmail()` - 샘플 요청 이메일
   - 이메일 템플릿 (HTML + Text)
   - DEV_MODE 폴백 지원

2. **`src/app/api/contact/route.ts`** - 문의 API 경로 (새로운 파일)
   - POST: 문의 폼 제출 처리
   - Zod로 검증
   - `inquiries` 테이블에 저장
   - 확인 이메일 전송

3. **`src/app/api/samples/route.ts`** - 샘플 API 경로 (업데이트됨)
   - POST: 샘플 요청 처리
   - `sample_requests` + `sample_items` 테이블에 저장
   - 확인 이메일 전송
   - TODO 주석 제거됨

4. **`src/types/database.ts`** - 데이터베이스 타입 (업데이트됨)
   - `inquiries` 테이블 스키마 확장
   - 문의 폼의 모든 필드 추가됨

### ⏳ 대기 중인 작업

#### 작업 #48: SendGrid API 키 설정 (현재)
- [x] 이메일 인프라 생성됨
- [ ] SendGrid 계정 생성
- [ ] API 키 생성
- [ ] 발신자 도메인 인증
- [ ] 실제 키로 `.env.local` 업데이트

#### 작업 #49: Supabase 서비스 역할 키
- [ ] Supabase에서 서비스 역할 키 획득
- [ ] `.env.local` 업데이트
- [ ] `createServiceClient()` 함수 테스트

#### 작업 #50: SendGrid 이메일 템플릿
- [ ] `email.ts`의 HTML 이메일 템플릿 검토
- [ ] 다양한 클라이언트에서 이메일 렌더링 테스트
- [ ] 필요시 템플릿 사용자 정의

#### 작업 #51: /api/contact 경로 테스트
- [ ] 유효한 데이터로 POST 엔드포인트 테스트
- [ ] 검증 오류 테스트
- [ ] DB 저장 확인
- [ ] 이메일 전송 확인

#### 작업 #52: /api/samples 경로 테스트
- [ ] 샘플 요청으로 POST 엔드포인트 테스트
- [ ] sample_requests + sample_items 저장 확인
- [ ] 이메일 전송 확인

#### 작업 #53-57: 멤버 페이지 및 E2E 테스트
- [ ] 배송/청구지 주소 페이지 확인
- [ ] 전체 사용자 플로우 테스트 실행

## 테스트 절차

### 1. 문의 폼 API 테스트

```bash
# 개발 서버 시작
npm run dev

# 문의 폼 제출 테스트 (curl 또는 Postman 사용)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "kanjiLastName": "テスト",
    "kanjiFirstName": "ユーザー",
    "kanaLastName": "テスト",
    "kanaFirstName": "ユーザー",
    "email": "test@example.com",
    "phone": "03-1234-5678",
    "company": "テスト株式会社",
    "inquiryType": "product",
    "subject": "製品についてのお問い合わせ",
    "message": "こちらの製品について詳しく教えてください。よろしくお願いいたします。",
    "urgency": "normal",
    "preferredContact": "email",
    "privacyConsent": true
  }'
```

예상 응답:
```json
{
  "success": true,
  "message": "お問い合わせを受け付けました。確認メールをお送りしました。",
  "data": {
    "requestId": "CTC-1234567890-abc123",
    "inquiryId": "...",
    "emailSent": true
  }
}
```

### 2. 샘플 요청 API 테스트

```bash
curl -X POST http://localhost:3000/api/samples \
  -H "Content-Type: application/json" \
  -d '{
    "kanjiLastName": "テスト",
    "kanjiFirstName": "ユーザー",
    "kanaLastName": "テスト",
    "kanaFirstName": "ユーザー",
    "email": "test@example.com",
    "phone": "03-1234-5678",
    "deliveryType": "normal",
    "deliveryDestinations": [
      {
        "id": "dest-1",
        "contactPerson": "テスト担当者",
        "phone": "03-9876-5432",
        "address": "東京都渋谷区1-2-3"
      }
    ],
    "sampleItems": [
      {
        "productName": "スタンドアップパウチ",
        "productCategory": "stand_up",
        "quantity": 2
      }
    ],
    "message": "サンプルをお願いします。",
    "agreement": true
  }'
```

예상 응답:
```json
{
  "success": true,
  "message": "サンプルリクエストを受け付けました。確認メールをお送りしました。",
  "data": {
    "requestId": "SMP-XYZ123-ABC4",
    "sampleRequestId": "...",
    "sampleItemsCount": 1,
    "emailSent": true
  }
}
```

### 3. DEV_MODE 테스트
실제 API 키 없이 시스템은 대신 콘솔에 기록합니다:

```javascript
// DEV_MODE의 콘솔 출력:
[Email] DEV_MODE: Email would be sent: {
  to: 'test@example.com',
  subject: '【Epackage Lab】お問い合わせありがとうございます',
  ...
}
```

## 데이터베이스 스키마

### inquiries 테이블
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  request_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_name_kana TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  fax TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  street TEXT,
  inquiry_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal',
  preferred_contact TEXT,
  privacy_consent BOOLEAN NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);
```

### sample_requests 테이블
```sql
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  request_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'received',
  delivery_address_id UUID REFERENCES delivery_addresses(id),
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_at TIMESTAMP WITH TIME ZONE
);
```

### sample_items 테이블
```sql
CREATE TABLE sample_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sample_request_id UUID REFERENCES sample_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 문제 해결

### 문제: "데이터베이스가 구성되지 않음"
**원인**: SUPABASE_SERVICE_ROLE_KEY가 플레이스홀더임
**해결책**: Supabase 대시보드의 실제 키로 `.env.local` 업데이트

### 문제: "SendGrid가 구성되지 않음"
**원인**: SENDGRID_API_KEY가 플레이스홀더임
**해결책**: SendGrid 대시보드의 실제 키로 `.env.local` 업데이트

### 문제: 이메일이 전송되지 않지만 오류가 없음
**원인**: 발신자 도메인이 인증되지 않음
**해결책**: SendGrid 발신자 인증에서 DNS 설정 완료

### 문제: "잘못된 API 키" 오류
**원인**: API 키가 잘못 복사되었거나 여분의 공백이 있음
**해결책**: 키를 다시 복사하고 공백이 없는지 확인

### 문제: 데이터베이스 삽입 실패
**원인**: 테이블이 존재하지 않거나 RLS 정책이 차단함
**해결책**: Supabase SQL 에디터에서 마이그레이션 실행, RLS 정책 확인

## 다음 단계

1. **즉시**: SendGrid API 키를 가져와 도메인 인증
2. **Supabase 서비스 역할 키 가져오기** 및 `.env.local` 업데이트
3. **API 엔드포인트 테스트** (curl 또는 Postman 사용)
4. **데이터베이스 레코드 확인** (Supabase 대시보드)
5. **이메일 전송 확인** (SendGrid 대시보드 활동)
6. **멤버 페이지 검증** 진행

## 지원 리소스

- SendGrid 문서: https://docs.sendgrid.com/
- Supabase 문서: https://supabase.com/docs
- Next.js API 경로: https://nextjs.org/docs/api-routes/introduction
