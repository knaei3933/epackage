# 회원 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 회원을 승인/관리하는 시나리오

---

## 4.1 대기 회원 목록 조회

**목표**: 승인 대기 중인 회원 목록 확인

**전제 조건**:
- 관리자로 로그인된 상태
- 승인 대기 중인 회원 존재

**테스트 단계**:

```bash
# 1. 회원 승인 페이지 접속
[Browser_navigate] http://localhost:3002/admin/approvals

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 대기 회원 목록 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/admin/users/pending
# 예상 응답:
[
  {
    "id": "user-uuid",
    "email": "pending@example.com",
    "full_name": "홍길동",
    "company_name": "테스트 주식회사",
    "status": "PENDING",
    "created_at": "2026-01-21T10:00:00Z"
  }
]
```

**데이터베이스 전제 조건**:

```sql
-- 대기 회원 생성 (테스트용)
INSERT INTO profiles (id, email, full_name, status)
VALUES (
  gen_random_uuid(),
  'pending-approval@example.com',
  '대기승인',
  'PENDING'
);
```

**성공 기준**:
- ✅ 대기 회원 목록이 표시됨
- ✅ 회원 정보가 정확히 표시됨

---

## 4.2 회원 승인

**목표**: 대기 중인 회원을 승인

**테스트 단계**:

```bash
# 1. 승인할 회원 선택
[Browser_click] element="회원 아이템"]

# 2. "승인" 버튼 클릭
[Browser_click] element="승인 버튼"]

# 3. 승인 완료 확인
# 상태가 "PENDING" → "ACTIVE"로 변경
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# POST /api/admin/users/approve
{
  "userId": "user-uuid"
}

# 또는

# PATCH /api/admin/users/[id]/approve
# 예상 응답:
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "status": "ACTIVE"
  },
  "message": "회원이 승인되었습니다."
}
```

**데이터베이스 검증**:

```sql
-- 회원 승인 확인
SELECT id, email, status, updated_at
FROM profiles
WHERE id = 'user-uuid';
```

**성공 기준**:
- ✅ 회원 상태가 'PENDING' → 'ACTIVE'로 변경됨
- ✅ 성공 메시지가 표시됨
- ✅ 회원에게 승인 알림이 생성됨
- ✅ 회원이 로그인 가능해짐

---

## 4.3 회원 거부

**목표**: 대기 중인 회원을 거부

**테스트 단계**:

```bash
# 1. 거부할 회원 선택
[Browser_click] element="거부할 회원 아이템"]

# 2. "거부" 버튼 클릭
[Browser_click] element="거부 버튼"]

# 3. 거부 사유 입력 (SKIP - 거부 사유 입력 필드 미구현)
# [Browser_type] element="拒否理由" text="정보 불충분"]

# 4. 확인
[Browser_click] element="확인 버튼"]
```

**API 확인**:

```bash
# PATCH /api/admin/users/[id]/reject
{
  "rejectionReason": "정보 불충분"
}

# 예상 응답:
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "status": "REJECTED"
  }
}
```

**성공 기준**:
- ✅ 회원 상태가 'PENDING' → 'REJECTED'로 변경됨
- ✅ 거부 사유가 저장됨

---

## 회원 상태

| 상태 | 설명 | 관리자 작업 |
|------|------|-------------|
| PENDING | 승인 대기 | 승인/거부 필요 |
| ACTIVE | 활성화 | 정상 이용 가능 |
| SUSPENDED | 정지 | 활동 제한 |
| DELETED | 삭제 | 복구 불가 |

---

## 데이터베이스 검증

```sql
-- 회원 상태별 확인
SELECT status, COUNT(*) as count
FROM profiles
WHERE role = 'MEMBER'
GROUP BY status;

-- 최근 승인 회원
SELECT email, status, updated_at
FROM profiles
WHERE status = 'ACTIVE' AND role = 'MEMBER'
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 다음 단계

이 시나리오 완료 후:
- [주문 관리](./order-production.md)로 이동
- [회원 로그인](../member/login-dashboard.md) 확인

---

## 테스트 정리 (데이터베이스 수정)

테스트 종료 후 생성된 테스트 데이터 정리:

```sql
-- 테스트 회원 삭제
DELETE FROM profiles
WHERE email = 'pending-approval@example.com';

-- 관련 알림 삭제
DELETE FROM unified_notifications
WHERE recipient_id IN (
  SELECT id FROM profiles WHERE email = 'pending-approval@example.com'
);

-- 테스트용 임시 회원 전체 삭제 (선택사항)
DELETE FROM profiles
WHERE email LIKE '%test%' OR email LIKE '%@example.com'
AND id NOT IN (
  -- 테스트 계정은 제외
  SELECT id FROM profiles WHERE email IN ('member@test.epac.co.jp', 'admin@test.epac.co.jp')
);
```
