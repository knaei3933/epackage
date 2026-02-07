# 프로필 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 프로필 정보 조회

---

## 프로필 조회

**목표**: 회원 프로필 정보 확인

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 프로필 페이지 접속
[Browser_navigate] http://localhost:3002/member/profile

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 2

# 3. 프로필 정보 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/profile
{
  "profile": {
    "id": "member-uuid",
    "email": "member@test.epac.co.jp",
    "companyName": "테스트 주식회사",
    "representativeName": "테스트 담당자",
    "phoneNumber": "03-1234-5678",
    "status": "ACTIVE"
  }
}
```

---

## 데이터베이스 검증

```sql
-- 프로필 확인
SELECT email, company_name, representative_name, phone_number
FROM profiles
WHERE id = 'member-uuid';
```

---

## 다음 단계

- [회원정보 편집](./edit.md)로 이동
