# 콘솔 에러 보고서 (Console Errors Report)

**작성일**: 2026-01-10
**검증 방법**: 병렬 에이전트 코드 분석
**총 에러 수**: 54개 (P0: 15개, P1: 23개, P2: 16개)

---

## 🔴 P0 에러 (치명적 - 페이지 작동 안 함)

| 페이지/파일 | 에러 메시지 | 원인 | 해결 방안 |
|-------------|-------------|------|----------|
| `src/app/api/auth/verify-email/route.ts:143` | `ReferenceError: verifyData is not defined` | 변수가 정의되기 전에 참조 | serviceClient 생성 위치 이동 |
| `src/lib/auth-helpers.ts:27-34` | `Warning: TEMPORARY TEST code active` | 하드코딩된 모크 관리자 반환 | 실제 인증 로직 구현 |
| `src/components/orders/CustomerApprovalSection.tsx:20` | `Module not found: @/components/ui/alert` | 잘못된 import 경로 | `@/components/ui/AlertComponent`로 수정 |
| `/auth/forgot-password` | `Navigation timeout` | ForgotPasswordForm 컴포넌트 누락 | 컴포넌트 구현 |
| `/auth/reset-password` | `Navigation timeout` | ResetPasswordForm 컴포넌트 누락 | 컴포넌트 구현 |
| `/member/dashboard` | `Timeout waiting for selector` | AuthContext 인증 타임아웃 | `/api/auth/session` 확인 |
| `/member/orders` | `Timeout waiting for selector` | AuthContext 인증 타임아웃 | `/api/auth/session` 확인 |
| `/member/quotations` | `Timeout waiting for selector` | AuthContext 인증 타임아웃 | `/api/auth/session` 확인 |
| `/contact` | `Form submit fails` | Alert 컴포넌트 import 오류 | import 경로 수정 |
| `/catalog` | `Filter button broken` | CartProvider context 누락 | Provider 추가 |
| `/samples` | `Form submit fails` | SampleRequestForm 누락 | 컴포넌트 구현 |
| `/quote-simulator` | `Quote calculation fails` | QuoteProvider context 누락 | Provider 추가 |
| `/smart-quote` | `Quote fails` | MultiQuantityQuoteProvider 누락 | Provider 추가 |
| `/service` | `Page render fails` | ServicePageContent 누락 | 컴포넌트 구현 |
| `npm run build` | `Module parse failed: .woff2` | webpack font loader 누락 | next.config.ts 수정 |

---

## 🟡 P1 에러 (중요 - 주요 기능 작동 안 함)

| 페이지/파일 | 에러 메시지 | 원인 | 해결 방안 |
|-------------|-------------|------|----------|
| `GET /api/member/dashboard/stats` | `Returns null in production` | RPC 함수 get_dashboard_stats 없음 | DB에 RPC 함수 생성 |
| `src/app/api/member/orders/route.ts:207-229` | `N+1 query pattern detected` | 각 주문마다 별도 조회 | 쿼리 최적화 |
| `src/app/api/member/quotations/[id]/route.ts` | `DELETE method not implemented` | 삭제 핸들러 누락 | DELETE 메서드 추가 |
| `src/app/api/member/orders/[id]/data-receipt/route.ts:284-285` | `File not cleaned up on DB failure` | Storage 파일 미삭제 | 실패 시 정리 로직 추가 |
| `src/lib/pdf-generator.ts` | `ESM packages need to be imported` | @react-pdf/renderer ESM 이슈 | import 방식 변경 |
| `src/app/admin/dashboard/statistics/route.ts:167-228` | `Type mismatch in stats response` | API/컴포넌트 타입 불일치 | 타입 정의 통일 |
| `src/app/admin/orders/page.tsx:38-56` | `Direct browser client usage` | 일관성 없는 DB 클라이언트 | 서버 컴포넌트 패턴 사용 |
| `/member/quotations` | `Delete button may fail` | API 엔드포인트 문제 | DELETE 핸들러 확인 |
| 모든 파일 업로드 API | `Missing extraction API endpoints` | AI 추출 API 미구현 | 엔드포인트 구현 |

---

## 🟢 P2 에러 (개선 필요)

| 페이지/파일 | 에러 메시지 | 원인 | 해결 방안 |
|-------------|-------------|------|----------|
| `src/app/member/quotations/page.tsx:529` | `Korean text mixed with Japanese` | 하드코딩된 "새로고침" | "更新"으로 수정 |
| `src/app/admin/dashboard/page.tsx:66-74` | `SWR deprecated usage warning` | disabled retries + manual retry | SWR 설정 수정 |
| 다수 페이지 | `Inconsistent loading states` | 각기 다른 로딩 구현 | 일관된 로딩 패턴 |
| 관리자 페이지 | `No error boundaries` | 에러 바운더리 누락 | React Error Boundary 추가 |
| `npm run lint` | Multiple lint warnings | 스크립트 파일 require() 사용 | ES6 import로 변경 |

---

## 빌드 에러 상세

### Webpack Font Loader Error
```
./node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2
Module parse failed: Unexpected character '' (1:4)
```

**위치**: `next.config.ts` - webpack configuration
**원인**: Next.js 16 + Turbopack + webpack config conflict
**해결**: Turbopack용 설정 추가 또는 --webpack 플래그 사용

### ESM Package Import Error
```
./src/lib/excel/pdfConverter.tsx
Module not found: ESM packages (@react-pdf/renderer) need to be imported
```

**위치**: `src/lib/excel/pdfConverter.tsx`
**원인**: CommonJS에서 ESM 패키지 import
**해결**: import 구문 변경

---

## ESLint 경고 (주요 항목)

| 파일 | 경고 | 원인 |
|------|------|------|
| `analyze-brixa.js` | `A require() style import is forbidden` | require() 사용 |
| `jest.config.js` | `A require() style import is forbidden` | require() 사용 |
| `next.config.ts` | `'isServer' is defined but never used` | 미사용 변수 |
| `scripts/apply-supabase-migration.ts` | `Unexpected any` | any 타입 사용 |
| `jest.setup.js` | `Using <img> could result in slower LCP` | img 대신 Image 사용 권장 |

---

## 인증 관련 에러

### AuthContext 타임아웃
```
Timeout waiting for selector (.css-selector)
```

**영향 페이지**:
- `/member/dashboard`
- `/member/orders`
- `/member/quotations`
- `/member/quotations/[id]`
- `/member/orders/[id]`
- 대부분의 회원 페이지

**원인**: `/api/auth/session` API 호출 실패 또는 타임아웃

**해결 방안**:
1. `/api/auth/session` 엔드포인트 확인
2. AuthContext 에러 핸들링 개선
3. 타임아웃 시간 조정 또는 폴백 데이터 사용

---

## 데이터베이스 관련 에러

### RPC Function Missing
```
get_dashboard_stats RPC function may not exist
```

**해결 방안**:
1. Supabase DB에 RPC 함수 존재 확인
2. RLS 정책 확인
3. 함수 권한 확인

### RLS Policy Conflicts
```
Some APIs use service client (bypasses RLS) while others use SSR client
```

**해결 방안**:
1. RLS 정책 일관성 확보
2. 서비스 롤 사용 시 명확한 사유 문서화
3. 권한 검증 로직 표준화

---

## 네트워크 에러

### API 응답 없음
```
GET /api/auth/session - No response
GET /api/member/dashboard/stats - Returns null
```

**원인**:
1. API 엔드포인트 누락
2. DB 연결 실패
3. 인증 실패

---

## 우선순위별 수정 계획

### 즉시 수정 (오늘)
1. `src/lib/auth-helpers.ts` - TEMPORARY TEST 코드 제거
2. `src/app/api/auth/verify-email/route.ts` - verifyData 버그 수정
3. `src/components/orders/CustomerApprovalSection.tsx` - Alert import 수정

### 우선 수정 (이번 주)
1. `/api/auth/session` 엔드포인트 확인 및 수정
2. 비밀번호 찾기/재설정 컴포넌트 구현
3. 누락된 컴포넌트 구현 (ServicePageContent, SampleRequestForm)
4. Context Provider 추가

### 차기 수정 (다음 주)
1. 대시보드 통계 RPC 함수 생성
2. N+1 쿼리 최적화
3. 파일 업로드 실패 시 정리 로직 추가
4. 견적 삭제 기능 추가

### 장기 개선
1. 한국어/일본어 혼용 수정
2. 로딩 상태 통일
3. 에러 바운더리 추가
4. 빌드 설정 최적화
