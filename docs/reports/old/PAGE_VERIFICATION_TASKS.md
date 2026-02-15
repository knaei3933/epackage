# 페이지 검증 작업 목록 (Page Verification Tasks)

**작성일**: 2026-01-10
**검증 범위**: 전체 78페이지
**검증 방법**: 병렬 에이전트 코드 분석 + 정적 분석

---

## 요약

| 카테고리 | 전체 | 정상 | 문제있음 | 완성도 |
|----------|------|------|----------|--------|
| 공개 페이지 (Public) | 37 | 8 | 29 | 22% |
| 인증 페이지 (Auth) | 6 | 3 | 3 | 50% |
| 회원 페이지 (Member) | 21 | 3 | 18 | 14% |
| 관리자 페이지 (Admin) | 14 | 10 | 4 | 71% |
| **합계** | **78** | **24** | **54** | **31%** |

**전체 완성도: 31%** (사용자가 지적한 대로 "겉만 번지르르한" 상태)

---

## 🔴 P0: 치명적 문제 (즉시 수정 필요)

### 1. 인증 우회 - 모든 Admin API 무방비
- **위치**: `src/lib/auth-helpers.ts:27-34`
- **문제**: 모든 Admin API가 하드코딩된 모크 관리자 인증 사용
- **영향**: 모든 관리자 기능이 인증 없이 접근 가능 (심각한 보안 문제)
```typescript
// TEMPORARY TEST: Always return admin user
console.log('[verifyAdminAuth] TEMPORARY TEST: Returning mock admin');
return {
  userId: 'test-admin-user',
  role: 'ADMIN' as const,
  status: 'ACTIVE' as const,
  isDevMode: true,
};
```

### 2. 모든 회원 페이지 로딩 실패
- **위치**: `src/middleware.ts` + `src/contexts/AuthContext.tsx`
- **문제**: 인증 플로우 실패로 모든 회원 페이지가 30초 타임아웃
- **영향**: `/member/*` 전체 페이지 접근 불가

### 3. 이메일 인증 API 버그
- **위치**: `src/app/api/auth/verify-email/route.ts:143`
- **문제**: `verifyData` 변수가 정의되기 전에 참조되어 런타임 에러
```typescript
const serviceClient = createServiceClient(verifyData.user.id)  // ❌ verifyData not defined yet!
```

### 4. 비밀번호 찾기/재설정 페이지 누락
- **위치**: `src/components/auth/ForgotPasswordForm.tsx`, `src/components/auth/ResetPasswordForm.tsx`
- **문제**: 폼 컴포넌트가 존재하지 않거나 렌더링 실패

### 5. Alert 컴포넌트 import 오류
- **위치**: `src/components/orders/CustomerApprovalSection.tsx:20` 및 다수 파일
- **문제**: 잘못된 import 경로로 빌드 실패
- **수정**: `@/components/ui/alert` → `@/components/ui/AlertComponent`

### 6. 공개 페이지 기능 작동 안 함
- **페이지**: `/contact`, `/catalog`, `/samples`, `/quote-simulator`, `/smart-quote`, `/service`
- **문제**: Context Provider 누락으로 폼 제출/필터링/계산 실패

---

## 🟡 P1: 중요 문제 (우선 수정 필요)

### 1. 대시보드 통계 API null 반환
- **API**: `GET /api/member/dashboard/stats`
- **문제**: RPC 함수 `get_dashboard_stats`가 존재하지 않거나 RLS 잘못됨

### 2. 주문 목록 N+1 쿼리 문제
- **위치**: `src/app/api/member/orders/route.ts:207-229`
- **문제**: 각 주문마다 quotations와 items를 별도 조회

### 3. 견적 삭제 기능 누락
- **위치**: `src/app/api/member/quotations/[id]/route.ts`
- **문제**: DELETE 메서드 핸들러 누락

### 4. 파일 업로드 실패 시 정리 안 함
- **위치**: `src/app/api/member/orders/[id]/data-receipt/route.ts:284-285`
- **문제**: DB 실패 시 Storage 파일 미삭제

### 5. PDF 생성 의존성 문제
- **위치**: `src/lib/pdf-generator.ts`
- **문제**: jsPDF/html2canvas SSR 이슈

### 6. AI 추출 API 엔드포인트 누락
- **문제**: AI 추출 관련 API 엔드포인트 미구현

---

## 🟢 P2: 개선 필요 (차기 수정)

### 1. 한국어/일본어 혼용
- **위치**: `src/app/member/quotations/page.tsx:529`
- **문제**: "새로고침" (한국어) → "更新" (일본어) 필요

### 2. 로딩 상태 불일치
- **문제**: 페이지마다 다른 로딩 구현

### 3. 에러 바운더리 누락
- **문제**: React Error Boundary 미구현

### 4. 콘솔 경고
- **위치**: `src/app/admin/dashboard/page.tsx:66-74`
- **문제**: SWR 설정으로 인한 경고

---

## 카테고리별 상세

### 공개 페이지 (Public) - 37페이지

| 페이지 | 상태 | 문제 |
|--------|------|------|
| `/` | ✅ | 정상 |
| `/about` | ✅ | 정상 |
| `/guide` | ✅ | 정상 |
| `/guide/*` | ✅ | 정상 |
| `/terms` | ✅ | 정상 |
| `/privacy` | ✅ | 정상 |
| `/contact` | 🔴 P0 | Alert import 오류 |
| `/catalog` | 🔴 P0 | Context Provider 누락 |
| `/samples` | 🔴 P0 | SampleRequestForm 누락 |
| `/quote-simulator` | 🔴 P0 | Context Provider 누락 |
| `/smart-quote` | 🔴 P0 | Context Provider 누락 |
| `/service` | 🔴 P0 | ServicePageContent 누락 |
| `/cart` | 🟡 P1 | CartProvider 누락 |
| 기타 공개 페이지 | ⚠️ | 확인 필요 |

### 인증 페이지 (Auth) - 6페이지

| 페이지 | 상태 | 문제 |
|--------|------|------|
| `/signin` | ✅ | 정상 |
| `/register` | ✅ | 정상 |
| `/pending` | ✅ | 정상 |
| `/auth/error` | ✅ | 정상 |
| `/auth/forgot-password` | 🔴 P0 | 컴포넌트 누락 |
| `/auth/reset-password` | 🔴 P0 | 컴포넌트 누락 |
| `/auth/verify-email` | 🔴 P0 | undefined 변수 버그 |

### 회원 페이지 (Member) - 21페이지

| 페이지 | 상태 | 문제 |
|--------|------|------|
| `/member/dashboard` | 🔴 P0 | 인증 타임아웃 |
| `/member/orders` | 🔴 P0 | 인증 타임아웃 |
| `/member/quotations` | 🔴 P0 | 인증 타임아웃 |
| `/member/quotations/[id]` | 🔴 P0 | 인증 타임아웃 + 삭제 버튼 |
| `/member/orders/[id]` | 🔴 P0 | 인증 타임아웃 |
| `/member/orders/[id]/data-receipt` | ✅ | 정상 |
| `/member/profile` | ✅ | 정상 |
| `/member/layout.tsx` | ✅ | 정상 |
| 기타 회원 페이지 | 🔴 P0 | 대부분 인증 타임아웃 |

### 관리자 페이지 (Admin) - 14페이지

| 페이지 | 상태 | 문제 |
|--------|------|------|
| `/admin/dashboard` | ✅ | 통계 타입 불일치 (P1) |
| `/admin/orders` | ✅ | 정상 |
| `/admin/orders/[id]` | ✅ | 정상 |
| `/admin/production` | ✅ | 정상 |
| `/admin/shipments` | ✅ | 정상 |
| `/admin/approvals` | ✅ | 정상 |
| `/admin/contracts` | ✅ | 정상 |
| `/admin/inventory` | ✅ | 정상 |
| `/admin/leads` | ✅ | 정상 |
| `/admin/users` | ✅ | 정상 |
| 모든 Admin API | 🔴 P0 | 인증 우회 (하드코딩) |

---

## 수정 순서

### 1단계: 치명적 보안 문제 (즉시)
1. `src/lib/auth-helpers.ts:27-34` - TEMPORARY TEST 코드 제거
2. `src/app/api/auth/verify-email/route.ts:143` - verifyData 버그 수정

### 2단계: 빌드 오류 수정 (즉시)
1. `src/components/orders/CustomerApprovalSection.tsx` - Alert import 수정
2. 누락된 컴포넌트 구현 (ServicePageContent, SampleRequestForm)
3. Context Provider 추가 (CartProvider, QuoteProvider)

### 3단계: 인증 플로우 수정 (우선)
1. `/api/auth/session` 엔드포인트 확인 및 수정
2. AuthContext 타임아웃 문제 해결
3. 비밀번호 찾기/재설정 컴포넌트 구현

### 4단계: 기능 수정 (차기)
1. 대시보드 통계 RPC 함수 확인
2. N+1 쿼리 최적화
3. 파일 업로드 실패 시 정리 로직 추가
4. 견적 삭제 기능 추가

### 5단계: 개선 (장기)
1. 한국어/일본어 혼용 수정
2. 로딩 상태 통일
3. 에러 바운더리 추가
4. 콘솔 경고 제거

---

## 참고

**검증 방법**:
- 병렬 에이전트 5개 사용
- 코드 정적 분석
- 실제 파일 확인

**검증 도구**:
- Glob: 파일 패턴 검색
- Grep: 코드 검색
- Read: 파일 내용 확인

**다음 단계**:
발견된 모든 문제를 수정한 후 재검증 필요
