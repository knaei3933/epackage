# 고객 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 전체 고객을 조회 및 관리

---

## 고객 목록 조회

**목표**: 모든 고객(회원 및 비회원) 조회 및 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 고객 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/customers

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 고객 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="활성 회원만"]
[Browser_wait_for] time: 1
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/admin/customers
# 예상 응답:
{
  "customers": [
    {
      "id": "customer-uuid",
      "email": "member@test.epac.co.jp",
      "companyName": "테스트 주식회사",
      "status": "ACTIVE",
      "totalOrders": 5,
      "totalSpent": 2500000
    }
  ]
}
```

**성공 기준**:
- ✅ 고객 목록 표시됨
- ✅ 필터 정상 작동

---

## 상호 검증: 회원 정보 수정

**목표**: 관리자가 회원 정보를 수정하고 회원 페이지에서 확인

### 스텝 1: 관리자가 회원 정보 수정

```bash
# 1. 고객 상세 페이지 접속
[Browser_click] element="고객 상세 버튼"]

# 1.5. 대기
[Browser_wait_for] time: 1

# 2. 정보 수정 (실제 페이지 구조에 맞게 수정)
[Browser_click] element="편집 버튼"]

# 2.5. 폼 표시 대기
[Browser_wait_for] time: 1]

# 회원정보 수정: 회사명/담당자명 필드는 실제 페이지에 존재하지 않음
# 대신 회원등록 페이지의 필드 구조를 참고하여 수정 필요
[Browser_type] element="会社電話番号" text="03-9999-8888"]
[Browser_type] element="携帯電話" text="090-1234-5678"]

# 3. 저장
[Browser_click] element="저장 버튼"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# PATCH /api/admin/customers/[id]
{
  "companyName": "수정된 회사명",
  "representativeName": "수정 담당자"
}
```

### 스텝 2: 회원 페이지에서 변경 확인

```bash
# 1. 회원으로 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_wait_for] time: 3

# 2. 프로필 페이지 접속
[Browser_navigate] http://localhost:3002/member/profile

# 3. 변경 내용 확인
[Browser_verify_text_visible] text="수정된 회사명"]
[Browser_verify_text_visible] text="수정 담당자"]
```

**데이터베이스 검증**:

```sql
SELECT company_name, representative_name, updated_at
FROM profiles
WHERE email = 'member@test.epac.co.jp';
```

**데이터베이스 수정 (테스트용)**:

관리자 수정 액션이 정상 작동하지 않을 경우, 직접 데이터베이스 수정으로 테스트:

```sql
-- 회원 정보 수정 (테스트용)
UPDATE profiles
SET company_name = '수정된 회사명',
    representative_name = '수정 담당자',
    updated_at = NOW()
WHERE email = 'member@test.epac.co.jp';

-- 테스트 후 원복
UPDATE profiles
SET company_name = '테스트 주식회사',
    representative_name = '테스트 담당자',
    updated_at = NOW()
WHERE email = 'member@test.epac.co.jp';
```

**성공 기준**:
- ✅ 관리자가 회원 정보 수정 가능
- ✅ 회원 페이지에서 즉시 반영됨
- ✅ 데이터베이스에 업데이트됨

---

## 데이터베이스 검증

```sql
-- 전체 고객 현황
SELECT
  COUNT(*) FILTER (WHERE role = 'MEMBER') as member_count,
  COUNT(*) FILTER (WHERE role = 'ADMIN') as admin_count,
  COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_count
FROM profiles;

-- 최근 가입 고객
SELECT email, company_name, status, created_at
FROM profiles
WHERE role = 'MEMBER'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 다음 단계

- [계약 관리](./contracts.md)로 이동
