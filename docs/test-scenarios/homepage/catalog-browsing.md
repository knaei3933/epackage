# 카탈로그 및 문의 시나리오

**작성일**: 2026-01-21
**목적**: 게스트 사용자가 카탈로그를 둘러보고 문의하는 시나리오

---

## 2. 카탈로그 둘러보기

### 2.1 카탈로그 페이지 접속

**목표**: 카탈로그 페이지에서 제품 정보 확인

**전제 조건**:
- 게스트 사용자 (비로그인 상태)

**테스트 단계**:

```bash
# 1. 카탈로그 페이지 접속
[Browser_navigate] http://localhost:3002/catalog

# 2. 페이지 로딩 확인
[Browser_wait_for] time: 2

# 3. 제품 카드 확인
[Browser_snapshot]

# 4. 제품 필터 테스트
[Browser_click] element="스탠드 파우치 필터"
```

**예상 결과**:
- 카탈로그 페이지가 표시됨
- 제품 목록이 표시됨
- 필터가 정상 작동함

**API 확인**:

```bash
# GET /api/catalog?category=stand_pouch
# 예상 응답:
[
  {
    "id": "prod-001",
    "name": "スタンドパウチ",
    "slug": "stand-pouch",
    "category": "stand_pouch",
    "description": "...",
    "images": [...],
    "startingPrice": 50000
  }
]
```

**성공 기준**:
- ✅ 최소 4개 제품 카드가 표시됨
- ✅ 필터가 정상 작동함

---

### 2.2 제품 상세 보기

**목표**: 제품 상세 페이지에서 상세 정보 확인

**테스트 단계**:

```bash
# 1. 제품 카드 클릭
[Browser_click] element="제품 카드"

# 2. 제품 상세 페이지 확인
[Browser_wait_for] time: 2
[Browser_snapshot]

# 3. 스펙 탭 확인
[Browser_click] element="스펙 탭"]

# 4. 가이드 탭 확인
[Browser_click] element="가이드 탭"]
```

**예상 결과**:
- 제품 상세 정보가 표시됨
- 스펙 및 가이드 탭이 전환됨

**API 확인**:

```bash
# GET /api/catalog/[slug]
# 예상 응답:
{
  "product": {
    "id": "prod-001",
    "name": "スタンドパウチ",
    "slug": "stand-pouch",
    "specifications": {...},
    "pricingGuide": [...],
    "applications": [...]
  }
}
```

**성공 기준**:
- ✅ 제품 상세가 표시됨
- ✅ 탭 전환이 정상 작동함

---

## 3. 문의하기

### 3.1 문의 양식 작성

**목표**: 문의 양식을 통해 문의 제출

**테스트 단계**:

```bash
# 1. 문의하기 페이지 접속
[Browser_navigate] http://localhost:3002/contact

# 2. 페이지 로딩 확인
[Browser_wait_for] time: 2

# 3. 문의 유형 선택
[Browser_click] element="제품 문의"]

# 4. 이름 입력
[Browser_type] element="氏名" text="테스트 사용자"

# 5. 이메일 입력
[Browser_type] element="メールアドレス" text="test@example.com"

# 6. 회사명 입력 (선택)
[Browser_type] element="会社名" text="테스트 주식회사"

# 7. 문의 내용 입력
[Browser_type] element="お問い合わせ内容" text="견적 문의입니다. 스탠드 파우치 200x300mm 500개 견적 부탁드립니다."

# 8. 제출 버튼 클릭
[Browser_click] element="제출 버튼"]
```

**예상 결과**:
- 문의가 제출됨
- 성공 메시지가 표시됨

**API 확인**:

```bash
# POST /api/contact
{
  "name": "테스트 사용자",
  "email": "test@example.com",
  "company": "테스트 주식회사",
  "inquiryType": "product",
  "message": "견적 문의입니다..."
}

# 예상 응답:
{
  "success": true,
  "message": "문의가 접수되었습니다."
}
```

**데이터베이스 검증**:

```sql
-- 문의 내역 확인
SELECT id, name, email, inquiry_type, message, created_at
FROM inquiries
WHERE email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**성공 기준**:
- ✅ 문의가 정상 제출됨
- ✅ 성공 메시지가 표시됨
- ✅ 데이터베이스에 문의가 저장됨

---

## 4. 도입 사례

### 4.1 도입 사례 확인

**목표**: 도입 사례 페이지에서 사례 확인

**테스트 단계**:

```bash
# 1. 사례 페이지 접속
[Browser_navigate] http://localhost:3002/archives

# 2. 페이지 로딩 확인
[Browser_wait_for] time: 2

# 3. 사례 카드 확인
[Browser_snapshot]

# 4. 사례 필터 테스트
[Browser_click] element="식품 산업 필터"]
```

**예상 결과**:
- 사례 목록이 표시됨
- 사례 카드가 그리드로 표시됨
- 필터가 정상 작동함

**API 확인**:

```bash
# GET /api/archives?industry=food
# 예상 응답:
[
  {
    "id": "archive-001",
    "title": "OO식품 포장솔루션",
    "industry": "food",
    "customerName": "OO주식회사",
    "images": [...],
    "beforeAfter": [...]
  }
]
```

**성공 기준**:
- ✅ 최소 1개 이상의 사례가 표시됨
- ✅ 사례 카드의 이미지가 로딩됨
- ✅ 필터가 정상 작동함

---

### 4.2 사례 상세 보기

**목표**: 사례 상세에서 구체적인 도입 내용 확인

**테스트 단계**:

```bash
# 1. 사례 카드 클릭
[Browser_click] element="사례 카드"]

# 2. 사례 상세 확인
[Browser_wait_for] time: 2
[Browser_snapshot]

# 3. Before/After 이미지 확인
[Browser_click] element="Before 탭"]
[Browser_click] element="After 탭"]
```

**예상 결과**:
- 사례 상세가 표시됨
- Before/After 비교가 가능함

**성공 기준**:
- ✅ 사례 상세가 표시됨
- ✅ Before/After 이미지가 로딩됨

---

## 전체 성공 기준

- ✅ 카탈로그 페이지에서 제품을 확인할 수 있음
- ✅ 제품 상세 정보를 볼 수 있음
- ✅ 문의 양식을 통해 문의를 제출할 수 있음
- ✅ 도입 사례를 확인할 수 있음

---

## 데이터베이스 검증 쿼리

```sql
-- 제품 확인
SELECT id, name, category FROM products LIMIT 5;

-- 문의 내역 확인
SELECT id, name, email, inquiry_type, message, created_at
FROM inquiries
ORDER BY created_at DESC
LIMIT 5;

-- 도입 사례 확인
SELECT id, title, industry, customer_name
FROM archives
LIMIT 5;
```

---

## 다음 단계

이 시나리오 완료 후:
- [회원 가입](../member/login-dashboard.md)으로 이동
- 또는 [견적 생성](./guest-quotation.md)로 이동
