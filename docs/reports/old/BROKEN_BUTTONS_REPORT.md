# 작동하지 않는 버튼 보고서 (Broken Buttons Report)

**작성일**: 2026-01-10
**검증 방법**: 병렬 에이전트 코드 분석
**총 버튼 수**: 확인 불가 (전체 페이지 검증 필요)

---

## 🔴 P0: 버튼이 전혀 작동하지 않음

| 페이지 | 버튼/액션 | 현상 | 원인 | 파일 위치 |
|--------|-----------|------|------|----------|
| `/member/quotations` | 견적 삭제 버튼 | 클릭해도 반응 없음 | DELETE API 핸들러 누락 | `src/app/api/member/quotations/[id]/route.ts` |
| `/contact` | 문의 폼 제출 버튼 | 제출 실패 | Alert 컴포넌트 import 오류 | `src/app/contact/page.tsx` |
| `/samples` | 샘플 요청 제출 버튼 | 제출 실패 | SampleRequestForm 누락 | `src/app/samples/page.tsx` |
| `/catalog` | 필터 버튼 | 작동 안 함 | CartProvider context 누락 | `src/app/catalog/page.tsx` |
| `/catalog` | 장바구니 추가 버튼 | 작동 안 함 | CartProvider context 누락 | `src/app/catalog/CatalogClient.tsx` |
| `/quote-simulator` | 견적 계산 버튼 | 작동 안 함 | QuoteProvider context 누락 | `src/app/quote-simulator/page.tsx` |
| `/quote-simulator` | 견적 저장 버튼 | 작동 안 함 | QuoteProvider context 누락 | `src/components/quote/ImprovedQuotingWizard.tsx` |
| `/smart-quote` | 견적 생성 버튼 | 작동 안 함 | MultiQuantityQuoteProvider 누락 | `src/app/smart-quote/page.tsx` |

---

## 🟡 P1: 버튼은 작동하지만 에러 발생

| 페이지 | 버튼/액션 | 현상 | 원인 | 파일 위치 |
|--------|-----------|------|------|----------|
| `/member/orders/[id]/data-receipt` | 파일 업로드 버튼 | 업로드 후 DB 실패 시 파일 미삭제 | 실패 시 정리 로직 누락 | `src/app/api/member/orders/[id]/data-receipt/route.ts:284` |
| `/member/quotations/[id]` | 승인 버튼 | 권한 없어도 클릭 가능 | 권한 검증 부족 | `src/app/api/member/quotations/[id]/approve/route.ts` |
| `/admin/orders` | 주문 상태 변경 버튼 | 타입 불일치 경고 | API/컴포넌트 타입 mismatch | `src/app/admin/orders/page.tsx` |
| 모든 PDF 다운로드 | PDF 생성 버튼 | jsPDF 의존성 에러 | SSR 이슈 | `src/lib/pdf-generator.ts` |

---

## 🟢 P2: 버튼 작동하지만 UX 개선 필요

| 페이지 | 버튼/액션 | 현상 | 개선 사항 |
|--------|-----------|------|----------|
| `/member/quotations` | 새로고침 버튼 | 한국어 표시 "새로고침" | 일본어 "更新"로 변경 |
| 다수 페이지 | 로딩 중 버튼 | 로딩 표시 없음 | 로딩 스피너 추가 |
| `/admin/dashboard` | 재시도 버튼 | SWR 경고 발생 | SWR 설정 수정 |

---

## Context Provider 관련 버튼

### CartProvider (장바구니)
**영향 받는 버튼**:
- 카탈로그에서 "장바구니 추가" 버튼
- 장바구니 페이지 수량 변경 버튼
- 장바구니 항목 삭제 버튼

**해결**: `src/app/catalog/page.tsx` 등에서 CartProvider context 추가 필요

### QuoteProvider (견적)
**영향 받는 버튼**:
- 견적 시뮬레이터 "계산" 버튼
- 견적 "저장" 버튼
- 견적 "제출" 버튼
- 견적 항목 추가/삭제 버튼

**해결**: `src/app/quote-simulator/page.tsx` 등에서 QuoteProvider context 추가 필요

### MultiQuantityQuoteProvider (다량 견적)
**영향 받는 버튼**:
- 스마트 견적 버튼들
- 수량 입력 및 계산 버튼

**해결**: `src/app/smart-quote/page.tsx` 등에서 MultiQuantityQuoteProvider context 추가 필요

---

## API 핸들러 누락으로 인한 버튼 오동작

### DELETE 메서드 누락

**영향 받는 버튼**:
- 견적 삭제 버튼 (`/member/quotations/[id]`)
- 주문 취소 버튼 (`/member/orders/[id]`)
- 기타 삭제 버튼들

**해결 방안**:
```typescript
// src/app/api/member/quotations/[id]/route.ts에 추가
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 삭제 로직 구현
}
```

---

## 권한 검증 부족

### 관리자 승인 버튼
**위치**: `/api/member/quotations/[id]/approve`

**문제**: 일반 회원도 승인 버튼 클릭 가능

**해결**: 권한 검증 로직 강화
```typescript
// 승인 전 관리자 권한 확인
if (userRole !== 'ADMIN') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 버튼 상태 관리 문제

### 로딩 상태 미구현
**문제**: 버튼 클릭 후 로딩 표시 없음

**해결**: 모든 버튼에 로딩 상태 추가
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleClick = async () => {
  setIsLoading(true);
  try {
    await action();
  } finally {
    setIsLoading(false);
  }
};

<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : '제출'}
</Button>
```

---

## 에러 핸들링 부족

### 폼 제출 버튼
**문제**: 제출 실패 시 사용자 피드백 없음

**해결**: 에러 메시지 표시 추가
```typescript
const [error, setError] = useState<string>();

const handleSubmit = async () => {
  try {
    await submitForm();
  } catch (err) {
    setError(err.message);
    // Alert 컴포넌트로 표시
  }
};
```

---

## 수정 우선순위

### 1단계: Context Provider 추가
- CartProvider 추가 (장바구니 기능)
- QuoteProvider 추가 (견적 기능)
- MultiQuantityQuoteProvider 추가 (다량 견적)

### 2단계: API 핸들러 구현
- DELETE 메서드 추가 (견적 삭제)
- 파일 업로드 실패 시 정리 로직
- 권한 검증 강화

### 3단계: UI/UX 개선
- 로딩 상태 추가
- 에러 메시지 표시
- 한국어/일본어 수정

### 4단계: PDF 문제 해결
- jsPDF SSR 이슈 해결
- 또는 서버 측 PDF 생성으로 변경

---

## 테스트 계획

### 수동 테스트 필요한 버튼
1. 모든 삭제 버튼
2. 모든 제출 버튼
3. 모든 필터 버튼
4. 모든 장바구니 관련 버튼
5. 모든 견적 관련 버튼

### E2E 테스트 필요한 기능
1. 장바구니 담기 흐름
2. 견적 생성 흐름
3. 주문 생성 흐름
4. 파일 업로드 흐름
