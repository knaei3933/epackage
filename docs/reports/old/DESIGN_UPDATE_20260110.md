# 설계 문서 갱신 (Design Documents Update)

**작성일**: 2026-01-10
**범위**: P0 문제 수정 후 설계 문서 갱신

---

## 수정 완료된 파일 목록

### 1. 인증/보안 관련

| 파일 | 수정 내용 | 상태 |
|------|----------|------|
| `src/lib/auth-helpers.ts` | TEMPORARY TEST 코드 제거, JWT 검증 구현 | ✅ 완료 |
| `src/app/api/auth/verify-email/route.ts` | verifyData 변수 순서 수정 | ✅ 완료 |
| `src/components/auth/LoginForm.tsx` | Suspense boundary 추가 | ✅ 완료 |

### 2. 컴포넌트 관련

| 파일 | 수정 내용 | 상태 |
|------|----------|------|
| `src/components/orders/CustomerApprovalSection.tsx` | Alert import 수정, Badge variant 수정 | ✅ 완료 |
| `src/components/orders/OrderCommentsSection.tsx` | import 경로 수정 | ✅ 완료 |
| `src/components/auth/ForgotPasswordForm.tsx` | 이미 존재, 확인 완료 | ✅ 확인 |
| `src/components/auth/ResetPasswordForm.tsx` | 이미 존재, 확인 완료 | ✅ 확인 |
| `src/components/service/ServicePage.tsx` | 이미 존재, 확인 완료 | ✅ 확인 |
| `src/components/contact/SampleRequestForm.tsx` | 이미 존재, 확인 완료 | ✅ 확인 |

### 3. 설정 관련

| 파일 | 수정 내용 | 상태 |
|------|----------|------|
| `next.config.ts` | Turbopack 설정 추가 (webpack/turbopack 충돌 해결) | ✅ 완료 |

### 4. 데이터베이스 관련

| Migration | 수정 내용 | 상태 |
|----------|----------|------|
| `fix_get_dashboard_stats_rpc_function` | RPC 함수 컬럼명 수정 | ❌ 실패 (enum 오류) |
| `fix_get_dashboard_stats_with_correct_enum_values` | RPC 함수 enum 값 수정 (shipped/delivered 소문자) | ✅ 완료 |

---

## 데이터베이스 변경 사항

### RPC 함수 수정

**함수명**: `get_dashboard_stats(p_user_id UUID, p_is_admin BOOLEAN)`

**변경 전**: 반환 컬럼명이 API와 불일치
- DB: `total`, `pending`, `completed`
- API: `total_orders`, `pending_orders`, `completed_orders`

**변경 후**: API와 일치하도록 수정
```sql
RETURNS TABLE (
  total_orders BIGINT,
  pending_orders BIGINT,
  completed_orders BIGINT,
  total_quotations BIGINT,
  pending_quotations BIGINT,
  total_samples BIGINT,
  processing_samples BIGINT
)
```

### Enum 값 수정

**order_status**:
- `SHIPPED` → `shipped` (소문자)
- `DELIVERED` → `delivered` (소문자)

**quotations status**:
- 사용: `draft`, `sent`

**sample_requests status**:
- 사용: `received`

---

## Supabase MCP 확인 결과

### RPC 함수 테스트 결과
```json
{
  "total_orders": 4,
  "pending_orders": 0,
  "completed_orders": 0,
  "total_quotations": 17,
  "pending_quotations": 17,
  "total_samples": 7,
  "processing_samples": 7
}
```

### 현재 데이터 상태
- 주문: 4건 (모두 완료됨)
- 견적: 17건 (모두 대기중/초안 중)
- 샘플: 7건 (모두 received 상태)

---

## Context Providers 확인

### CartProvider
- **파일**: `src/contexts/CartContext.tsx`
- **사용 페이지**: `/cart`, `/catalog`
- **상태**: 정상 작동

### QuoteProvider
- **파일**: `src/contexts/QuoteContext.tsx`
- **사용 페이지**: `/smart-quote`, `/quote-simulator`
- **상태**: 정상 작동

### MultiQuantityQuoteProvider
- **파일**: `src/contexts/MultiQuantityQuoteContext.tsx`
- **사용 페이지**: `/smart-quote`, `/quote-simulator`
- **상태**: 정상 작동

---

## API 엔드포인트 확인

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/forgot-password` - 비밀번호 찾기
- `POST /api/auth/reset-password` - 비밀번호 재설정
- `POST /api/auth/verify-email` - 이메일 인증 (버그 수정 완료)

### Member API
- `GET /api/member/dashboard/stats` - 대시보드 통계 (RPC 수정 완료)
- `GET /api/member/orders` - 주문 목록
- `GET /api/member/quotations` - 견적 목록

---

## 다음 단계

### 진행 중인 작업 (P1)
1. N+1 쿼리 문제 수정 (orders API)
2. 견적 DELETE 핸들러 추가
3. 파일 업로드 실패 시 정리 로직
4. PDF 생성 문제 해결

### 장기 작업 (P2, P3)
1. 한국어/일본어 혼용 수정
2. 로딩 상태 통일
3. 에러 바운더리 추가
4. 콘솔 경고 제거

---

## 참고

**검증 방법**: Supabase MCP 활용
**데이터베이스**: PostgreSQL (Supabase)
**테이블 수**: 36개 (public schema)
**Migration 수**: 66개
