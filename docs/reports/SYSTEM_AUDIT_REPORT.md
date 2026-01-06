# Epackage Lab 시스템 전체 검토 보고서

**검토 일자**: 2026-01-03
**검토 범위**: 데이터베이스, API, 인증, 프론트엔드 연결
**검토 방법**: 전문가 에이전트 3개 병렬 실행

---

## 📊 실행 요약

### ✅ 완료된 작업
1. **관리자 대시보드에 견적 현황 추가**
   - `/api/admin/dashboard/statistics` API 생성
   - 최근 견적 요청 목록 표시 위젯 추가
   - 견적 통계 (초안/발송/승인) 카운트 추가

2. **전체 시스템 검토**
   - 데이터베이스 스키마 및 RLS 검토
   - API 연결 상태 검토
   - 인증 및 권한 시스템 검토

---

## 🔴 Critical: 즉시 수정 필요 (24시간 이내)

### ✅ 1. RLS (Row Level Security) 누락 - **해결 완료**

**영향 테이블 (2개)**:
- `companies` - 회사 정보 테이블
- `shipment_tracking_events` - 배송 추적 이벤트

**위험도**: 인증되지 않은 사용자가 모든 데이터 접근 가능

**수정 사항**:
```sql
-- 실행 완료
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS 정책 추가 완료
-- companies: 인증 사용자 조회 + 관리자 전체 CRUD
-- shipment_tracking_events: 인증 사용자 조회 + 관리자 CRUD
```

---

### ✅ 2. SECURITY DEFINER 뷰 (권한 상승 위험) - **해결 완료**

**영향 뷰 (2개)**:
- `shipments_with_recent_tracking`
- `shipments_with_order_details`

**위험도**: 뷰 생성자 권한으로 실행되어 권한 상승 가능

**수정 사항**:
```sql
-- 두 뷰 모두 SECURITY_INVOKER로 재생성 완료
CREATE OR REPLACE VIEW public.shipments_with_order_details
WITH (security_invoker = true) AS ...;

CREATE OR REPLACE VIEW public.shipments_with_recent_tracking
WITH (security_invoker = true) AS ...;
```

---

### ✅ 3. API 스키마와 DB 스키마 불일치 - **해결 완료**

**문제 파일**: `/api/quotations/route.ts`

**API에서 사용하는 컬럼 (존재하지 않음)**:
```
project_name, product_category, box_type, material, printing, coating,
unit_price, subtotal, tax, grand_total
```

**실제 DB 컬럼**:
```
customer_name, customer_email, customer_phone,
subtotal_amount, tax_amount, total_amount, pdf_url, admin_notes
```

**수정 사항**:
- API 요청 스키마를 실제 DB 컬럼과 일치하도록 수정 완료
- 상태값을 소문자로 통일 (`'DRAFT'` → `'draft'`)

---

### ✅ 4. quotations 테이블 RLS 정책 없음 - **해결 완료**

**위험도**: RLS가 활성화되어 있지만 정책이 없어 아무도 접근 불가

**수정 사항**:
```sql
-- Admin 정책 추가 완료
CREATE POLICY "Admins can view all quotations"
ON quotations FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update all quotations"
ON quotations FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can delete quotations"
ON quotations FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN');
```

---

### ⚠️ 5. DEV_MODE 인증 우회 - **부분 완료**

**문제 파일**: `src/lib/supabase.ts`

```typescript
if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return null; // 모든 인증 우회
}
```

**위험도**: 개발 모드에서 localStorage만으로 모든 사용자가 ADMIN 권한 획득 가능

**해결 방법**:
1. `.env.local`에서 `NEXT_PUBLIC_DEV_MODE=false`로 설정
2. 또는 프로덕션 환경과 동일한 인증 흐름 사용

---

## 🟡 High: 중기 조치 필요 (1주 이내)

### 6. Supabase 클라이언트 패턴 불일치

**현재 3가지 패턴이 혼재**:

| 패턴 | 사용 위치 | 문제 |
|-----|----------|------|
| `createServiceClient()` | `contact`, `samples` | ✅ 올바름 |
| `createRouteHandlerClient()` | `approve-member` | ⚠️ 권장되지 않음 |
| `createClient()` 직접 생성 | `quotations` | ❌ 잘못됨 |

**해결 방법**: 모든 API에서 `createServiceClient()` 사용

---

### 7. 관리자 페이지 클라이언트 사이드 렌더링

**문제**: `/admin/*` 페이지가 `'use client'`로 선언되어 있음

**위험도**:
- 서버 환경변수(`SUPABASE_SERVICE_ROLE_KEY`) 노출 위험
- SEO 저하
- 초기 로딩 성능 저하

**해결 방법**: Server Component로 전환

---

### ✅ 8. API 인증 검증 누락 - **해결 완료**

**문제 API**:
- `GET /api/admin/dashboard/statistics`
- `GET /api/admin/orders/statistics`
- 기타 admin API

**수정 사항**:
- `src/lib/auth-helpers.ts` 공통 인증 헬퍼 생성
- `/api/admin/dashboard/statistics` 인증 추가 완료
- `/api/admin/orders/statistics` 인증 추가 완료
- `/api/admin/convert-to-order` 이미 인증 있음 ✅

---

### ✅ 9. 상태값 대소문자 불일치 - **해결 완료**

**문제**:
```typescript
// API: 'DRAFT', 'SENT', 'APPROVED'
// DB: 'draft', 'sent', 'approved'
```

**수정 사항**:
- `/api/quotations/route.ts`에서 상태값을 소문자로 통일 완료
- `'DRAFT'` → `'draft'`

---

## ✅ 수정 완료 요약

### 완료된 Critical 문제 (4개)
1. ✅ RLS 활성화 (companies, shipment_tracking_events)
2. ✅ RLS 정책 추가 (companies, shipment_tracking_events, quotations, shipments)
3. ✅ SECURITY DEFINER 뷰 → SECURITY INVOKER로 변경
4. ✅ API 스키마와 DB 스키마 동기화

### 완료된 High 문제 (2개)
1. ✅ API 인증 검증 강화 (auth-helpers.ts 생성)
2. ✅ 상태값 소문자로 통일

### 생성된 파일
1. `src/lib/auth-helpers.ts` - 공통 인증 헬퍼

### 수정된 파일
1. `src/app/api/quotations/route.ts` - 스키마 수정, 상태값 소문자화
2. `src/app/api/admin/dashboard/statistics/route.ts` - 인증 추가
3. `src/app/api/admin/orders/statistics/route.ts` - 인증 추가, 클라이언트 변경

### 데이터베이스 변경
1. RLS 활성화: 2개 테이블
2. RLS 정책 추가: 4개 테이블 (companies, shipment_tracking_events, quotations, shipments)
3. 뷰 보안 변경: 2개 뷰 (SECURITY_INVOKER로 설정)

---

### 10. 함수 search_path 미설정 (13개 함수)

**영향 함수**: `calculate_production_progress`, `log_stage_action` 등

**위험도**: SQL injection 공격에 취약

**해결 방법**:
```sql
CREATE OR REPLACE FUNCTION ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
...
```

---

## 🟢 Medium: 개선 권장사항 (1개월 이내)

### 11. 타입 안전성 강화
- `@ts-ignore` 제거
- `any` 타입 사용 줄이기
- 제네릭 타입 활용

### 12. 중복 코드 제거
- 쿠키 처리 로직 중앙화
- 인증 확인 코드 통합

### 13. 에러 처리 표준화
- 일관된 에러 형식
- 상태 코드 표준화

---

## 📈 데이터베이스 현재 상태

### 주요 테이블 현황

| 테이블 | 행 수 | RLS | 상태 |
|--------|------|-----|------|
| quotations | 12 | ✅ | ⚠️ 정책 없음 |
| quotation_items | 15 | ✅ | 정상 |
| profiles | 3 | ✅ | 정상 |
| sample_requests | 1 | ✅ | 정상 |
| companies | 0 | ❌ | **RLS 비활성** |
| shipments | 0 | ✅ | ⚠️ **정책 없음** |
| orders | 0 | ✅ | 정상 |
| production_orders | 0 | ✅ | 정상 |

---

## 🎯 우선순위별 조치 계획

### Phase 1: 즉시 수정 (24시간 이내)
1. ✅ 관리자 대시보드에 견적 현황 추가 (완료)
2. ⚠️ RLS 활성화 (`companies`, `shipment_tracking_events`)
3. ⚠️ quotations 테이블 RLS 정책 추가
4. ⚠️ DEV_MODE 설정 확인

### Phase 2: 주요 수정 (1주 이내)
5. API 스키마와 DB 스키마 동기화
6. Supabase 클라이언트 패턴 통일
7. API 인증 검증 추가
8. 상태값 소문자로 통일

### Phase 3: 장기 개선 (1개월 이내)
9. 함수 search_path 설정
10. 타입 안전성 강화
11. Server Component 전환
12. 중복 코드 제거

---

## 💡 권장사항

### 1. 통합 테스트 작성
```
견적 요청 → DB 저장 → 관리자 확인 → 승인 → 주문 변환
```
전체 흐름을 검증하는 E2E 테스트 작성

### 2. API 문서화
- 각 API 엔드포인트의 요청/응답 형식 문서화
- Swagger/OpenAPI 스펙 자동 생성

### 3. 모니터링 강화
- API 오류 로그 수집
- DB 쿼리 성능 모니터링
- 사용자 행동 추적

---

## 📋 점검 목록

### 보안
- [ ] RLS 활성화 (companies, shipment_tracking_events)
- [ ] quotations 테이블 RLS 정책 추가
- [ ] shipments 테이블 RLS 정책 추가
- [ ] SECURITY DEFINER 뷰 제거/수정
- [ ] 함수 search_path 설정

### 인증
- [ ] DEV_MODE 설정 확인
- [ ] API 인증 검증 추가
- [ ] 관리자 페이지 Server Component 전환

### 데이터
- [ ] API 스키마와 DB 스키마 동기화
- [ ] 상태값 소문자로 통일
- [ ] Supabase 클라이언트 패턴 통일

### 코드 품질
- [ ] 타입 안전성 강화
- [ ] 중복 코드 제거
- [ ] 에러 처리 표준화

---

## 📞 지원이 필요한 경우

발견된 문제 중 해결이 필요한 사항은 다음 순서로 진행하시길 권장합니다:

1. **가장 시급**: RLS 활성화 및 정책 추가 (보안)
2. **중요**: API 스키마 수정 (기능 동작)
3. **개선**: 코드 품질 향상 (유지보수)

각 문제에 대한 상세 해결 방법은 이 보고서의 해당 섹션을 참조해주세요.
