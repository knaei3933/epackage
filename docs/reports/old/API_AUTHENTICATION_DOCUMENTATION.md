# API Authentication Documentation

**작성일**: 2026-01-07
**버전**: 1.0
**목적**: url.md에 추가할 API 인증 방법 문서

---

## 개요

이 프로젝트는 **4가지 인증 방법**을 사용합니다:

1. **Cookie-based (Member)**: `@supabase/ssr`의 `createServerClient()`를 사용한 httpOnly 쿠키 기반 인증
2. **DEV_MODE Bypass**: 개발 환경에서 `x-user-id` 헤더로 인증 우회 (미들웨어에서 처리)
3. **Service Role**: 관리자 작업에 `createServiceClient()` 사용 (서비스 역할 키로 RLS 우회)
4. **Public**: 인증 불필요한 공개 API

---

## 인증 방법 상세

### 1. Cookie-based Authentication (Member)

**사용 라이브러리**: `@supabase/ssr`

**구현 방식**:
```typescript
import { createServerClient } from '@supabase/ssr';

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
    },
  }
);
```

**특징**:
- httpOnly 쿠키 사용 (`sb-access-token`, `sb-refresh-token`)
- 미들웨어에서 인증 확인 후 `x-user-id` 헤더 추가
- CSRF 보호 내장
- 세션 자동 갱신

**사용 대상**: 회원 포털 API (`/api/member/*`)

---

### 2. DEV_MODE Bypass

**목적**: 개발/테스트 환경에서 인증 우회

**구현 방식**:
```typescript
// 미들웨어 (middleware.ts)
if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', 'dev-user-id');
  requestHeaders.set('x-dev-mode', 'true');
}

// API 라우트
const userId = request.headers.get('x-user-id');
const isDevMode = request.headers.get('x-dev-mode') === 'true';

if (isDevMode && userId) {
  console.log('[API] DEV_MODE: Using x-user-id header:', userId);
  // DEV_MODE 인증 우회 로직
}
```

**특징**:
- `NEXT_PUBLIC_DEV_MODE=true` 환경변수로 활성화
- 미들웨어가 자동으로 `x-user-id` 헤더 추가
- 프로덕션에서는 반드시 비활성화

**DEV_MODE 사용자 ID**:
- 일반 작업: `00000000-0000-0000-0000-000000000000` (placeholder)
- 관리자 작업: `54fd7b31-b805-43cf-b92e-898ddd066875` (실제 admin 사용자)

**사용 대상**: 모든 회원 API (`/api/member/*`, `/api/customer/*`, `/api/b2b/*`)

---

### 3. Service Role Authentication (Admin)

**사용 함수**: `createServiceClient()`

**구현 방식**:
```typescript
import { createServiceClient } from '@/lib/supabase';

const supabase = createServiceClient();
// 서비스 역할 키 사용 → RLS 정책 우회
```

**특징**:
- `SUPABASE_SERVICE_ROLE_KEY` 환경변수 사용
- RLS(Row Level Security) 정책 우회
- 전체 데이터베이스 접근 권한
- 관리자 전용 작업

**보안 주의사항**:
- 절대 클라이언트 노출 금지
- 서버 사이드 전용
- 관리자 권한 검증 후 사용

**사용 대상**: 관리자 API (`/api/admin/*`)

---

### 4. Public APIs

**특징**:
- 인증 불필요
- 누구나 접근 가능
- Rate limiting 적용

**사용 대상**:
- 공개 카탈로그 (`/api/products`)
- 문의 제출 (`/api/contact`)
- 샘플 요청 (`/api/samples/request`)
- 인증/회원가입 (`/api/auth/*`, `/api/b2b/login`)
- 파일 다운로드 (`/api/download/templates/*`)

---

## API 엔드포인트 인증 매핑

### Public APIs (인증 불필요)

**인증**: Public

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/contact` | POST | 문의 제출 |
| `/api/samples/request` | POST | 샘플 요청 |
| `/api/products` | GET | 제품 조회 |
| `/api/products/[slug]` | GET | 제품 상세 |
| `/api/products/categories` | GET | 카테고리 |
| `/api/download/templates/*` | GET | 템플릿 다운로드 |
| `/api/ai/parse` | POST | AI 문서 파싱 |
| `/api/ai/review` | POST | AI 문서 검토 |
| `/api/analytics/vitals` | POST | 웹 바이탈 로깅 |
| `/api/errors/log` | POST | 클라이언트 에러 로깅 |
| `/api/auth/signin` | POST | 로그인 |
| `/api/auth/register` | POST | 회원가입 |
| `/api/auth/verify-email` | POST | 이메일 인증 |
| `/api/b2b/login` | POST | B2B 로그인 |
| `/api/b2b/register` | POST | B2B 회원가입 |
| `/api/b2b/verify-email` | POST | B2B 이메일 인증 |
| `/api/b2b/resend-verification` | POST | 인증 이메일 재발송 |
| `/api/b2b/invite` | POST | B2B 초대 |
| `/api/b2b/invite/accept` | POST | B2B 초대 수락 |
| `/api/premium-content/download` | POST | 프리미엄 콘텐츠 다운로드 |
| `/api/templates` | GET | 템플릿 목록 |
| `/api/files/validate` | POST | 파일 검증 |
| `/api/registry/corporate-number` | GET | 법인번호 검증 |
| `/api/registry/postal-code` | GET | 우편번호 검색 |
| `/api/download/templates/pdf` | GET | PDF 템플릿 다운로드 |
| `/api/download/templates/excel` | GET | Excel 템플릿 다운로드 |
| `/api/signature/webhook` | POST | 서명 웹훅 |

---

### Member APIs (Cookie + DEV_MODE)

**인증**: Cookie (member) + DEV_MODE bypass (`x-user-id` header)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/member/orders` | GET | 주문 목록 |
| `/api/member/orders/[id]` | GET | 주문 상세 |
| `/api/member/orders/confirm` | POST | 주문 생성 |
| `/api/member/orders/[id]/production-data` | GET | 생산 데이터 |
| `/api/member/orders/[id]/data-receipt` | POST | 데이터 접수 확인 |
| `/api/member/quotations` | GET/POST | 견적서 목록/생성 |
| `/api/member/quotations/[id]` | GET | 견적서 상세 |
| `/api/member/quotations/[id]/invoice` | GET | 인보이스 생성 |
| `/api/member/quotations/[id]/confirm-payment` | POST | 결제 확인 |
| `/api/quotations/submit` | POST | 견적 제출 |
| `/api/quotations/save` | POST | 견적 저장 |
| `/api/quotations/[id]/convert` | POST | 견적을 주문으로 변환 |
| `/api/member/samples` | GET | 샘플 요청 내역 |
| `/api/member/profile` | GET/PUT | 프로필 관리 |
| `/api/member/settings` | GET/POST | 설정 관리 |
| `/api/member/delete-account` | GET/POST | 계정 삭제 |
| `/api/member/invoices` | GET | 인보이스 목록 |
| `/api/member/invoices/[invoiceId]/download` | GET | 인보이스 다운로드 |
| `/api/member/deliveries` | GET | 배송 내역 |
| `/api/member/inquiries` | GET | 문의 내역 |
| `/api/member/addresses/delivery` | GET/POST | 배송지 목록/생성 |
| `/api/member/addresses/delivery/[id]` | PUT/DELETE | 배송지 수정/삭제 |
| `/api/member/addresses/billing` | GET/POST | 청구지 목록/생성 |
| `/api/member/addresses/billing/[id]` | PUT/DELETE | 청구지 수정/삭제 |

---

### Admin APIs (Service Role)

**인증**: Service Role (`createServiceClient()` - RLS bypass)

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/admin/dashboard/statistics` | GET | 대시보드 통계 |
| `/api/admin/orders` | GET | 주문 관리 |
| `/api/admin/orders/[id]` | PATCH | 주문 상태 변경 |
| `/api/admin/orders/statistics` | GET | 주문 통계 |
| `/api/admin/production/jobs` | GET | 생산 작업 목록 |
| `/api/admin/production/jobs` | PATCH | 생산 상태 업데이트 |
| `/api/admin/contracts/workflow` | GET | 계약 워크플로우 |
| `/api/admin/contracts/request-signature` | POST | 서명 요청 |
| `/api/admin/inventory/items` | GET | 재고 목록 |
| `/api/admin/inventory/adjust` | POST | 재고 조정 |
| `/api/admin/inventory/update` | POST | 재고 업데이트 |
| `/api/admin/approve-member` | GET/POST | 회원 승인 |
| `/api/admin/shipments` | GET | 배송 관리 |
| `/api/admin/shipments/[id]/tracking` | POST | 배송 추적 업데이트 |
| `/api/admin/convert-to-order` | POST | 견적을 주문으로 변환 |
| `/api/supabase-mcp/execute` | POST | MCP SQL 실행 |
| `/api/notes` | GET/POST | notes CRUD |
| `/api/notes/[id]` | GET/PATCH/DELETE | note CRUD |

---

### B2B APIs (Cookie + DEV_MODE)

**인증**: Cookie (B2B member) + DEV_MODE bypass

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/b2b/quotations` | GET | B2B 견적서 |
| `/api/b2b/quotations/[id]` | GET | 견적서 상세 |
| `/api/b2b/quotations/[id]/approve` | POST | 견적 승인 |
| `/api/b2b/quotations/[id]/convert` | POST | 주문 변환 |
| `/api/b2b/quotations/[id]/convert-to-order` | POST | 견적을 주문으로 변환 |
| `/api/b2b/quotations/[id]/export` | GET | 견적서 내보내기 |
| `/api/b2b/contracts` | GET | 계약 목록 |
| `/api/b2b/contracts/[id]/sign` | POST | 계약 서명 |
| `/api/b2b/dashboard/stats` | GET | B2B 대시보드 |
| `/api/b2b/orders` | GET/POST | B2B 주문 목록/생성 |
| `/api/b2b/orders/[id]/tracking` | GET | 주문 추적 |
| `/api/b2b/orders/[id]/production-logs` | GET | 생산 로그 |
| `/api/b2b/orders/confirm` | POST | 주문 확정 |
| `/api/b2b/samples` | GET/POST | 샘플 요청 |
| `/api/b2b/shipments` | GET | 배송 목록 |
| `/api/b2b/stock-in` | POST | 입고 처리 |
| `/api/b2b/work-orders` | GET/POST | 작업 지시서 |
| `/api/b2b/invoices` | GET | 인보이스 목록 |
| `/api/b2b/invoices/[id]` | GET | 인보이스 상세 |
| `/api/b2b/spec-sheets/generate` | POST | 사양서 생성 |
| `/api/b2b/spec-sheets/[id]/approve` | POST | 사양서 승인 |
| `/api/b2b/spec-sheets/[id]/reject` | POST | 사양서 거부 |
| `/api/b2b/ai-extraction/upload` | POST | AI 추적 업로드 |
| `/api/b2b/ai-extraction/status` | GET | AI 추적 상태 |
| `/api/b2b/ai-extraction/approve` | POST | AI 추적 승인 |
| `/api/b2b/files/upload` | POST | 파일 업로드 |
| `/api/b2b/korea/send-data` | POST | 한국 시스템 전송 |
| `/api/b2b/timestamp/verify` | POST | 타임스탬프 검증 |
| `/api/b2b/documents/[id]/download` | GET | 문서 다운로드 |
| `/api/b2b/admin/pending-users` | GET | 대기 사용자 목록 |
| `/api/b2b/admin/approve-user` | POST | 사용자 승인 |
| `/api/b2b/admin/reject-user` | POST | 사용자 거부 |
| `/api/b2b/certificate/generate` | POST | 인증서 생성 |
| `/api/b2b/state-machine/transition` | POST | 상태 전이 |
| `/api/b2b/korea/corrections` | GET | 한국 수정 목록 |
| `/api/b2b/korea/corrections/[id]/upload` | POST | 수정 사항 업로드 |
| `/api/b2b/hanko/upload` | POST | Hanko 업로드 |
| `/api/b2b/files/[id]/extract` | POST | 파일 추출 |

---

### Customer Portal APIs (Cookie + DEV_MODE)

**인증**: Cookie (customer) + DEV_MODE bypass

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/customer/dashboard` | GET | 포털 대시보드 |
| `/api/customer/orders` | GET | 포털 주문 목록 |
| `/api/customer/orders/[id]` | GET | 포털 주문 상세 |
| `/api/customer/profile` | GET/PATCH | 포털 프로필 |
| `/api/customer/documents` | GET | 문서 목록 |
| `/api/customer/notifications` | GET | 알림 목록 |

---

### Other APIs (혼합 인증)

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/shipments/create` | POST | 배송 생성 | Service Role |
| `/api/shipments/bulk-create` | POST | 대량 배송 생성 | Service Role |
| `/api/shipments/[id]` | GET | 배송 상세 | Cookie + DEV_MODE |
| `/api/shipments/[id]/track` | GET | 배송 추적 | Cookie + DEV_MODE |
| `/api/shipments/[id]/label` | GET | 배송 라벨 | Cookie + DEV_MODE |
| `/api/shipments/[id]/schedule-pickup` | POST | 픽업 예약 | Cookie + DEV_MODE |
| `/api/shipments/[id]/[trackingId]/update-tracking` | POST | 추적 정보 업데이트 | Cookie + DEV_MODE |
| `/api/shipments/tracking` | GET | 배송 추적 | Cookie + DEV_MODE |
| `/api/signature/send` | POST | 서명 전송 | Service Role |
| `/api/signature/status/[id]` | GET | 서명 상태 | Cookie + DEV_MODE |
| `/api/signature/cancel` | POST | 서명 취소 | Cookie + DEV_MODE |
| `/api/signature/local/save` | POST | 로컬 서명 저장 | Cookie + DEV_MODE |
| `/api/orders/create` | POST | 주문 생성 | Service Role + DEV_MODE |
| `/api/orders/update` | PATCH | 주문 업데이트 | Service Role + DEV_MODE |
| `/api/orders/reorder` | POST | 재주문 | Service Role + DEV_MODE |
| `/api/orders/receive` | POST | 주문 수신 | Cookie + DEV_MODE |
| `/api/auth/session` | GET | 세션 확인 | Cookie |
| `/api/auth/signout` | POST | 로그아웃 | Cookie |
| `/api/contract/pdf` | POST | 계약 PDF 생성 | Cookie + DEV_MODE |
| `/api/contract/timestamp` | POST | 계약 타임스탬프 | Cookie + DEV_MODE |
| `/api/contract/timestamp/validate` | POST | 타임스탬프 검증 | Cookie + DEV_MODE |
| `/api/contract/workflow/action` | POST | 계약 워크플로우 액션 | Cookie + DEV_MODE |
| `/api/quotation/pdf` | POST | 견적 PDF 생성 | Cookie + DEV_MODE |
| `/api/quotes/pdf` | POST | 견적서 PDF | Cookie + DEV_MODE |
| `/api/quotes/excel` | POST | 견적서 Excel | Cookie + DEV_MODE |
| `/api/specsheet/pdf` | POST | 사양서 PDF | Cookie + DEV_MODE |
| `/api/ai/specs` | POST | AI 사양서 생성 | Cookie + DEV_MODE |
| `/api/ai-parser/extract` | POST | AI 추출 | Cookie + DEV_MODE |
| `/api/ai-parser/approve` | POST | AI 추출 승인 | Cookie + DEV_MODE |
| `/api/ai-parser/reprocess` | POST | AI 재처리 | Cookie + DEV_MODE |
| `/api/ai-parser/validate` | POST | AI 검증 | Cookie + DEV_MODE |
| `/api/settings` | GET/POST | 설정 관리 | Cookie + DEV_MODE |
| `/api/products/filter` | POST | 제품 필터 | Public |
| `/api/products/search` | GET | 제품 검색 | Public |
| `/api/comparison/save` | POST | 비교 저장 | Cookie + DEV_MODE |
| `/api/payments/confirm` | POST | 결제 확인 | Cookie + DEV_MODE |
| `/api/debug/auth` | GET | 인증 디버그 | Cookie + DEV_MODE |
| `/api/contact` | POST | 문의 제출 | Service Role |
| `/api/analytics/vitals` | POST | 웹 바이탈 로깅 | Service Role |

---

## 인증 구현 예시

### Cookie-based 인증 (Member API)

```typescript
// src/app/api/member/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // 1. x-user-id 헤더에서 사용자 ID 가져오기 (미들웨어에서 설정)
  const userId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (!userId) {
    return NextResponse.json(
      { error: '인증되지 않았습니다.' },
      { status: 401 }
    );
  }

  console.log('[Orders API] Using x-user-id:', userId, '(DEV_MODE:', isDevMode + ')');

  // 2. Service Role 클라이언트로 데이터 조회
  const supabase = createServiceClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ orders });
}
```

### Service Role 인증 (Admin API)

```typescript
// src/app/api/admin/dashboard/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Service Role 클라이언트 → RLS 우회
  const supabase = createServiceClient();

  // 전체 통계 조회 (RLS 무시)
  const { data: stats } = await supabase
    .from('orders')
    .select('status, total_amount');

  return NextResponse.json({ stats });
}
```

### DEV_MODE 인증 우회

```typescript
// 미들웨어 (middleware.ts)
if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
  // DEV_MODE 헤더 추가
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', '00000000-0000-0000-0000-000000000000');
  requestHeaders.set('x-dev-mode', 'true');

  // 요청에 헤더 포함하여 전달
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}
```

---

## 보안 고려사항

### 1. Service Role 키 보안

- 절대 클라이언트 코드에 노출 금지
- `.env.local` 파일에만 저장
- 서버 사이드에서만 사용
- Git 커밋 제외 (`.gitignore`)

### 2. DEV_MODE 비활성화

프로덕션 배포 전 반드시 확인:
```bash
# .env.production
NEXT_PUBLIC_DEV_MODE=false  # 또는 변수 자체를 제거
```

### 3. httpOnly 쿠키

- XSS 공격 방지
- JavaScript에서 접근 불가
- HTTPS 전용 (`Secure` 플래그)
- `SameSite=Strict` CSRF 방지

### 4. CSRF 보호

미들웨어에서 검증:
```typescript
const allowedOrigins = ['https://yourdomain.com'];
const origin = request.headers.get('origin');

if (!allowedOrigins.includes(origin)) {
  return new Response('Forbidden', { status: 403 });
}
```

---

## 테스트 방법

### Cookie-based 인증 테스트

```bash
# 1. 로그인 후 쿠키 획득
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# 2. 쿠키로 API 호출
curl http://localhost:3000/api/member/orders \
  -b cookies.txt
```

### DEV_MODE 테스트

```bash
# 1. .env.local 설정
echo "NEXT_PUBLIC_DEV_MODE=true" >> .env.local

# 2. x-user-id 헤더로 API 호출
curl http://localhost:3000/api/member/orders \
  -H "x-user-id: 00000000-0000-0000-0000-000000000000" \
  -H "x-dev-mode: true"
```

### Service Role 테스트

```bash
# 서버 사이드에서만 테스트 가능
# 브라우저 개발자 도구 사용 불가
```

---

## 요약

| 인증 방법 | 사용 라이브러리/함수 | RLS | 사용 대상 |
|----------|---------------------|-----|----------|
| Cookie-based | `@supabase/ssr` `createServerClient()` | 적용 | 회원 포털 |
| DEV_MODE Bypass | `x-user-id` 헤더 | 우회 | 개발/테스트 |
| Service Role | `createServiceClient()` | 우회 | 관리자 |
| Public | 없음 | - | 공개 API |

---

**문서 버전**: 1.0
**마지막 업데이트**: 2026-01-07
**다음 리뷰**: url.md 통합 후
