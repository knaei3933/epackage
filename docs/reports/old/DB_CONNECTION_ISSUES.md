# 데이터베이스 연결 문제 보고서 (DB Connection Issues)

**작성일**: 2026-01-10
**검증 방법**: 병렬 에이전트 코드 분석
**데이터베이스**: Supabase PostgreSQL

---

## 🔴 P0: 치명적 연결 문제

| 문제 | 현상 | 원인 | 해결 방안 |
|------|------|------|----------|
| RPC 함수 누락 | `get_dashboard_stats` null 반환 | DB에 RPC 함수 없음 | RPC 함수 생성 |
| 인증 세션 API 실패 | `/api/auth/session` 타임아웃 | AuthContext 연결 실패 | 세션 API 확인 |
| 이메일 인증 버그 | `verifyData` undefined | 비동기 플로우 오류 | 변수 순서 수정 |
| 관리자 인증 우회 | 모든 Admin API 무방비 | 하드코딩된 모크 반환 | 실제 인증 구현 |

---

## 🟡 P1: 중요 연결 문제

| 문제 | 현상 | 원인 | 해결 방안 |
|------|------|------|----------|
| RLS 정책 불일치 | 일부 API에서 데이터 없음 | Service/SSR 클라이언트 혼용 | RLS 정책 표준화 |
| N+1 쿼리 문제 | 주문 목록 느림 | 관련 데이터 별도 조회 | 쿼리 최적화 |
| 파일 정리 누락 | 실패 시 Storage 파일 남음 | 트랜잭션 불완전 | 실패 시 롤백 로직 |
| AI 추출 API 누락 | 파일 업로드 후 추출 안 됨 | API 미구현 | 엔드포인트 구현 |

---

## RLS (Row Level Security) 문제

### 정책 불일치

**문제**: 일부 API는 service client(RLS 우회), 다른 API는 SSR client(RLS 적용) 사용

**영향 받는 테이블**:
- `quotations` - 견적서
- `orders` - 주문
- `production_orders` - 생산 주문
- `korea_corrections` - 한국 교정

**해결 방안**:
1. 모든 API의 RLS 접근 방식 표준화
2. Service role 사용 시 명확한 사유 문서화
3. 각 테이블의 RLS 정책 검토

### 권한 검증 패턴

**혼합된 패턴**:
```typescript
// 패턴 1: Service client (RLS 우회)
const serviceClient = createServiceClient();
const { data } = await serviceClient.from('orders').select('*');

// 패턴 2: SSR client (RLS 적용)
const supabase = createRouteHandlerClient({ cookies });
const { data } = await supabase.from('orders').select('*');
```

**권장**: 명확한 사용 기준 정립

---

## RPC 함수 문제

### get_dashboard_stats 누락

**API**: `GET /api/member/dashboard/stats`

**현상**: null 반환

**원인**: DB에 `get_dashboard_stats()` RPC 함수 없음

**해결 방안**:
```sql
-- Supabase SQL Editor에서 실행
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  pending_orders BIGINT,
  total_quotations BIGINT,
  draft_quotations BIGINT,
  -- 기타 통계
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM orders WHERE user_id = $1),
    (SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'PENDING'),
    (SELECT COUNT(*) FROM quotations WHERE user_id = $1),
    (SELECT COUNT(*) FROM quotations WHERE user_id = $1 AND status = 'DRAFT');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## N+1 쿼리 문제

### 주문 목록 API

**위치**: `src/app/api/member/orders/route.ts:207-229`

**문제**: 각 주문마다 quotations와 items를 별도 조회

**현재 코드**:
```typescript
// 주문 목록 조회
const { data: orders } = await serviceClient
  .from('orders')
  .select('*');

// 각 주문마다 별도 조회 (N+1)
for (const order of orders) {
  const { data: quotation } = await serviceClient
    .from('quotations')
    .select('*')
    .eq('id', order.quotation_id)
    .single();

  const { data: items } = await serviceClient
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);
}
```

**해결 방안**:
```typescript
// 단일 쿼리로 조인
const { data: orders } = await serviceClient
  .from('orders')
  .select(`
    *,
    quotations (*),
    order_items (*)
  `);
```

---

## 트랜잭션 문제

### 파일 업로드 실패 시 정리 안 함

**위치**: `src/app/api/member/orders/[id]/data-receipt/route.ts:284-285`

**문제**:
1. Storage에 파일 업로드 성공
2. DB 레코드 생성 실패
3. Storage 파일 그대로 남음 (데이터 정합성 오류)

**해결 방안**:
```typescript
let uploadedFilePath: string | null = null;

try {
  // 1. 파일 업로드
  const { data, error } = await supabase.storage
    .from('order-files')
    .upload(fileName, file);

  if (error) throw error;
  uploadedFilePath = data.path;

  // 2. DB 레코드 생성
  const { error: dbError } = await serviceClient
    .from('files')
    .insert({ path: uploadedFilePath, ... });

  if (dbError) throw dbError;

} catch (error) {
  // 실패 시 업로드된 파일 삭제
  if (uploadedFilePath) {
    await supabase.storage
      .from('order-files')
      .remove([uploadedFilePath]);
  }
  throw error;
}
```

---

## 인증 관련 DB 문제

### AuthContext 연결 실패

**현상**: 모든 회원 페이지가 30초 타임아웃

**원인**: `/api/auth/session` API 실패

**확인 필요**:
1. `src/app/api/auth/session/route.ts` 존재 확인
2. Supabase auth 연결 확인
3. 쿠키 설정 확인

### 이메일 인증 버그

**위치**: `src/app/api/auth/verify-email/route.ts:143`

**버그**:
```typescript
// ❌ 잘못된 코드
const serviceClient = createServiceClient(verifyData.user.id);  // verifyData 미정의

const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({...});
```

**수정**:
```typescript
// ✅ 올바른 코드
const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({...});

if (verifyError || !verifyData.user) {
  return NextResponse.json({ error: 'Invalid verification' }, { status: 400 });
}

const serviceClient = createServiceClient(verifyData.user.id);
```

---

## 보안 문제

### 관리자 인증 우회

**위치**: `src/lib/auth-helpers.ts:27-34`

**문제**: 모든 Admin API가 하드코딩된 모크 관리자 반환

**현재 코드**:
```typescript
// TEMPORARY TEST: Always return mock admin
console.log('[verifyAdminAuth] TEMPORARY TEST: Returning mock admin');
return {
  userId: 'test-admin-user',
  role: 'ADMIN' as const,
  status: 'ACTIVE' as const,
  isDevMode: true,
};
```

**영향**:
- 모든 `/api/admin/*` 엔드포인트 무방비
- 인증 없이 관리자 기능 접근 가능

**해결**: 실제 JWT 검증 구현

---

## 연결 풀 문제

### 연결 풀 미구성

**현상**: 다수의 연결 생성

**해결 방안**: Supabase 연결 풀 설정 확인
```typescript
// lib/supabase.ts에서
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: { pooler: true }  // 연결 풀 사용
  }
);
```

---

## 데이터베이스 스키마 문제

### 외래 키 제약 조건

**확인 필요**: 관계가 올바르게 정의되었는지
- `orders.quotation_id` → `quotations.id`
- `order_items.order_id` → `orders.id`
- `quotation_items.quotation_id` → `quotations.id`
- `files.order_id` → `orders.id`

---

## 수정 우선순위

### 1단계: 보안 (즉시)
1. `src/lib/auth-helpers.ts` - 모크 인증 제거
2. 실제 관리자 인증 구현

### 2단계: 치명적 버그 (즉시)
1. `verify-email/route.ts` - 변수 순서 수정
2. `/api/auth/session` 확인

### 3단계: RPC 함수 (우선)
1. `get_dashboard_stats` 함수 생성
2. 기타 RPC 함수 확인

### 4단계: 최적화 (차기)
1. N+1 쿼리 해결
2. 파일 업로드 트랜잭션 구현
3. 연결 풀 설정

---

## 검증 방법

### API 테스트
```bash
# 각 API 엔드포인트 직접 테스트
curl http://localhost:3000/api/member/dashboard/stats
curl http://localhost:3000/api/member/orders
curl http://localhost:3000/api/auth/session
```

### DB 연결 테스트
```typescript
// 스크립트로 연결 테스트
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const { data, error } = await supabase.from('orders').select('*');
console.log('Connection test:', error ? 'Failed' : 'Success');
```

### RLS 정책 테스트
```sql
-- Supabase SQL Editor에서 RLS 테스트
SET LOCAL request.jwt.claim.sub = 'test-user-id';
SELECT * FROM orders;  -- 사용자별 데이터만 반환되어야 함
```
