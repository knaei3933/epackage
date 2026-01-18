# 치명적 오류 수정 가이드
**Critical Issues Fix Guide**

생성일: 2026-01-13
우선순위: P0 (치명적)

---

## 🚨 P0: 치명적 오류 수정 (Critical Fixes)

### 1. 회원가입 API 수정 (User Registration API Fix)

#### 문제 분석
**에러**: POST /api/auth/register - 201 응답 실패
**영향**: 신규 회원가입 불가

#### 수정 파일
```
src/app/api/auth/register/route.ts
```

#### 수정 단계

**Step 1: 현재 코드 분석**
```bash
# 현재 API 엔드포인트 확인
cat src/app/api/auth/register/route.ts
```

**Step 2: Supabase 설정 확인**
```bash
# .env.local 파일 확인
cat .env.local | grep SUPABASE
```

필환 환경 변수:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

**Step 3: Supabase Auth 구성 확인**

Supabase Dashboard에서 확인:
1. Authentication → Settings → Email Templates
2. Confirm signup template 활성화
3. Email redirect URL 설정: `http://localhost:3000/auth/verify`

**Step 4: API 코드 수정**

현재 코드에서 다음을 확인:
- Supabase 클라이언트 생성 방식
- 에러 핸들링 로직
- 이메일 전송 확인

**Step 5: RLS 정책 확인**

```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

profiles 테이블에 INSERT 권한이 있는지 확인.

**Step 6: 테스트**

```bash
# 회원가입 테스트
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "company": "Test Company"
  }'
```

예상 응답:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다. 이메일을 확인해주세요."
}
```

---

### 2. 견적 계산 엔진 수정 (Quotation Engine Fix)

#### 문제 분석
**에러**: POST /api/quotation - 계산 실패
**영향**: 견적 기능 작동 불가

#### 수정 파일
```
src/app/api/quotation/route.ts
src/lib/pricing/
```

#### 수정 단계

**Step 1: 현재 API 로그 확인**

```typescript
// src/app/api/quotation/route.ts에 로깅 추가
console.log('[QUOTATION] Request body:', JSON.stringify(body, null, 2));
console.log('[QUOTATION] Calculation start:', new Date().toISOString());
```

**Step 2: 가격 엔진 확인**

```bash
# 가격 엔진 파일들 확인
ls -la src/lib/pricing/
```

필수 파일:
- index.ts (메인 엔진)
- film-cost-calculator.ts
- roll-film-utils.ts
- unified-pricing-engine.ts

**Step 3: 제품 데이터 확인**

```sql
-- products 테이블 확인
SELECT * FROM products LIMIT 5;

-- 제품 카테고리 확인
SELECT DISTINCT category FROM products;
```

**Step 4: 계산 로직 수정**

견적 계산 파라미터 확인:
- [ ] product_id (유효한 제품 ID)
- [ ] width (mm)
- [ ] length (mm)
- [ ] quantity (수량)
- [ ] printing_options (인쇄 옵션)
- [ ] post_processing (후가공)

**Step 5: 에러 핸들링 개선**

```typescript
// src/app/api/quotation/route.ts
try {
  const result = await calculateQuotation(params);

  if (!result || !result.totalPrice) {
    throw new Error('Invalid calculation result');
  }

  return NextResponse.json({
    success: true,
    data: result
  });
} catch (error) {
  console.error('[QUOTATION] Calculation error:', error);
  return NextResponse.json({
    success: false,
    error: error instanceof Error ? error.message : '계산 실패'
  }, { status: 500 });
}
```

**Step 6: 테스트**

```bash
curl -X POST http://localhost:3000/api/quotation \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "uuid-here",
    "specifications": {
      "width": 200,
      "length": 300,
      "thickness": 0.05
    },
    "quantity": 1000,
    "printing": {
      "colors": 4,
      "sides": 2
    }
  }'
```

---

### 3. 멀티 수량 비교 시스템 수정 (Multi-Quantity Comparison Fix)

#### 문제 분석
**에러**: 모든 multi-quantity-comparison 테스트 실패 (15개)
**영향**: 다량 주문 비교 기능 사용 불가

#### 수정 파일
```
src/app/multi-quantity-comparison/page.tsx
src/contexts/MultiQuantityQuoteContext.tsx
```

#### 수정 단계

**Step 1: 페이지 렌더링 확인**

```typescript
// src/app/multi-quantity-comparison/page.tsx
export default function MultiQuantityComparisonPage() {
  return (
    <MultiQuantityQuoteProvider>
      <MultiQuantityComparisonClient />
    </MultiQuantityQuoteProvider>
  );
}
```

**Step 2: 컨텍스트 확인**

```bash
# 컨텍스트 파일 확인
cat src/contexts/MultiQuantityQuoteContext.tsx
```

필수 기능:
- [ ] 상태 관리 (useState)
- [ ] 수량 추가/제거
- [ ] 가격 계산
- [ ] 비교 결과 표시

**Step 3: 컴포넌트 계층 구조 확인**

```
MultiQuantityComparisonPage
├── MultiQuantityQuoteProvider (Context)
└── MultiQuantityComparisonClient
    ├── SpecificationForm
    ├── QuantitySelector
    ├── ComparisonResults
    └── ActionButtons
```

**Step 4: 상태 관리 수정**

```typescript
// src/contexts/MultiQuantityQuoteContext.tsx
interface MultiQuantityQuoteState {
  specifications: ProductSpecification;
  quantities: number[];
  results: ComparisonResult[];
  loading: boolean;
  error: string | null;
}

export const MultiQuantityQuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MultiQuantityQuoteState>({
    specifications: {},
    quantities: [1000, 5000, 10000],
    results: [],
    loading: false,
    error: null
  });

  // ... 구현
};
```

**Step 5: API 연결 확인**

```bash
# API 엔드포인트 확인
curl -X POST http://localhost:3000/api/quotes/compare \
  -H "Content-Type: application/json" \
  -d '{
    "specifications": {...},
    "quantities": [1000, 5000, 10000]
  }'
```

**Step 6: E2E 테스트 실행**

```bash
# 특정 테스트 파일 실행
npx playwright test tests/e2e/multi-quantity-comparison.spec.ts --headed
```

---

### 4. 회원 수명주기 플로우 수정 (Member Lifecycle Flow Fix)

#### 문제 분석
**에러**: 등록 → 인증 → 승인 → 로그인 플로우 실패
**영향**: 신규 회원 온보딩 불가

#### 수정 단계

**Step 1: 이메일 인증 확인**

Supabase Dashboard:
1. Authentication → Settings
2. Enable email confirmation: ON
3. Email template 확인

**Step 2: 회원 승인 워크플로우 확인**

```sql
-- profiles 테이블 구조 확인
\d profiles

-- role 컬럼 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles';
```

**Step 3: 관리자 승인 API 확인**

```bash
# 승인 API 테스트
curl -X PUT http://localhost:3000/api/admin/users/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "user-uuid-here",
    "role": "MEMBER"
  }'
```

**Step 4: 로그인 플로우 확인**

```typescript
// src/app/api/auth/signin/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // 1. Supabase 인증
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // 2. 프로필 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  // 3. 승인 상태 확인
  if (profile.role === 'PENDING') {
    return NextResponse.json({
      error: '관리자 승인이 필요합니다.'
    }, { status: 403 });
  }

  // 4. 세션 설정
  return NextResponse.json({
    success: true,
    user: profile
  });
}
```

**Step 5: E2E 테스트**

```bash
# 회원 수명주기 테스트 실행
npx playwright test tests/e2e/member-flow-enhanced.spec.ts -g "완전한 회원 수명주기"
```

---

## 📋 수정 체크리스트 (Fix Checklist)

### P0 치명적 오류

- [ ] **회원가입 API**
  - [ ] Supabase 설정 확인
  - [ ] 이메일 템플릿 확인
  - [ ] RLS 정책 확인
  - [ ] API 로직 수정
  - [ ] 테스트 통과 확인

- [ ] **견적 계산 엔진**
  - [ ] 가격 엔진 로직 확인
  - [ ] 제품 데이터 확인
  - [ ] 계산 파라미터 검증
  - [ ] 에러 핸들링 추가
  - [ ] 테스트 통과 확인

- [ ] **멀티 수량 비교**
  - [ ] 페이지 렌더링 수정
  - [ ] 컨텍스트 상태 관리 수정
  - [ ] API 연결 확인
  - [ ] E2E 테스트 통과

- [ ] **회원 수명주기**
  - [ ] 이메일 인증 확인
  - [ ] 승인 워크플로우 확인
  - [ ] 로그인 플로우 수정
  - [ ] E2E 테스트 통과

---

## 🧪 테스트 명령어 (Test Commands)

### 단위 테스트
```bash
# 전체 테스트
npm test

# 특정 파일 테스트
npm test src/lib/pricing/__tests__/pricing-engine.test.ts
```

### E2E 테스트
```bash
# 전체 E2E
npm run test:e2e

# 특정 테스트 파일
npx playwright test tests/e2e/member-flow-enhanced.spec.ts

# 헤드드 모드
npx playwright test --headed

# 디버그 모드
npx playwright test --debug
```

### API 테스트
```bash
# 회원가입
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d @test-payloads/register.json

# 견적 계산
curl -X POST http://localhost:3000/api/quotation \
  -H "Content-Type: application/json" \
  -d @test-payloads/quotation.json
```

---

## 📞 문제 해결 지원 (Troubleshooting Support)

### 일반적인 문제

**1. Supabase 연결 실패**
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 연결 테스트
curl -I $NEXT_PUBLIC_SUPABASE_URL
```

**2. 이메일 전송 실패**
```bash
# SendGrid 설정 확인
echo $SENDGRID_API_KEY

# 테스트 이메일 발송
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY"
```

**3. 데이터베이스 RLS 오류**
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 정책 수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

---

## ✅ 수정 완료 후 확인 (Post-Fix Verification)

### 1. 빌드 확인
```bash
npm run build
```

### 2. 전체 테스트 실행
```bash
npm run test:e2e
```

### 3. 콘솔 에러 확인
```bash
npm run dev
# 브라우저 개발자 도구에서 콘솔 확인
```

### 4. API 응답 확인
```bash
# 모든 주요 API 엔드포인트 테스트
for endpoint in \
  "http://localhost:3000/api/auth/register" \
  "http://localhost:3000/api/quotation" \
  "http://localhost:3000/api/samples"; do
  curl -I $endpoint
done
```

---

**마지막 업데이트**: 2026-01-13
**다음 검토**: P0 수정 완료 후
