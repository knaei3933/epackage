# 회원 가입~이용 시작 플로우

**작성일**: 2026-01-21
**목적**: 신규 회원 가입부터 관리자 승인, 회원 대시보드 이용까지

---

## 2.1 회원 가입

**목표**: 신규 회원 가입

### 스텝 1: 회원 가입 (고객)

```bash
# 1. 회원 가입 페이지로 이동
[Browser_navigate] http://localhost:3002/auth/signup

# 2. 회원 정보 입력
[Browser_type] element="メールアドレス" text="newmember@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_type] element="会社名" text="테스트 주식회사"]
[Browser_type] element="担当者名" text="테스트 담당자"]
[Browser_type] element="電話番号" text="03-1234-5678"]

# 3. 이용약관 동의
[Browser_click] element="이용약관 체크박스"]

# 4. 가입
[Browser_click] element="가입 버튼"]
[Browser_wait_for] time: 3
```

**데이터베이스 검증**:

```sql
SELECT id, email, role, status, company_name
FROM profiles
WHERE email = 'newmember@test.epac.co.jp';
```

**성공 기준**:
- ✅ 가입 성공 메시지 표시
- ✅ role: 'MEMBER'
- ✅ status: 'PENDING'

---

## 2.2 관리자 승인

**목표**: 관리자가 회원 승인

### 스텝 2: 관리자 승인

```bash
# 1. 관리자 로그인 상태로 가정

# 2. 회원 관리 페이지로 이동
[Browser_navigate] http://localhost:3002/admin/approvals
[Browser_wait_for] time: 2

# 3. 필터: 승인 대기
[Browser_click] element="승인 대기 필터"]

# 4. 신규 회원 클릭
[Browser_click] element="회원 상세 버튼"]

# 5. 회원 정보 확인
[Browser_snapshot]

# 6. "승인" 버튼 클릭
[Browser_click] element="회원 승인 버튼"]
[Browser_wait_for] time: 2
```

**데이터베이스 검증**:

```sql
SELECT id, email, role, status
FROM profiles
WHERE email = 'newmember@test.epac.co.jp';
```

**데이터베이스 수정 (테스트용)**:

관리자 승인 액션이 정상 작동하지 않을 경우, 직접 데이터베이스 수정으로 테스트:

```sql
-- 회원 승인 처리 (테스트용)
UPDATE profiles
SET status = 'ACTIVE',
    updated_at = NOW()
WHERE email = 'newmember@test.epac.co.jp';
```

**성공 기준**:
- ✅ 상태가 'ACTIVE'로 변경
- ✅ 성공 메시지 표시

---

## 2.3 회원 로그인

**목표**: 승인된 회원이 로그인

### 스텝 3: 회원 로그인

```bash
# 1. 회원 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="newmember@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_wait_for] time: 3

# 2. 대시보드 표시 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/dashboard/stats
{
  "activeOrders": 0,
  "pendingQuotations": 0,
  "totalSamples": 0,
  "unreadNotifications": 1
}
```

**성공 기준**:
- ✅ 회원 대시보드 표시
- ✅ 통계 카드 표시

---

## 전체 성공 기준

- ✅ 회원 가입 정상 완료
- ✅ PENDING 상태로 생성
- ✅ 관리자가 회원 승인 가능
- ✅ ACTIVE로 변경
- ✅ 회원 로그인 가능
- ✅ 대시보드 표시

---

## 테스트 정리 (데이터베이스 수정)

테스트 종료 후 생성된 테스트 데이터 정리:

```sql
-- 테스트 회원 삭제
DELETE FROM profiles
WHERE email = 'newmember@test.epac.co.jp';

-- 관련 알림 삭제
DELETE FROM unified_notifications
WHERE recipient_id IN (
  SELECT id FROM profiles WHERE email = 'newmember@test.epac.co.jp'
);
```

---

## 다음 단계

- [주문~배송 플로우](./order-shipping-flow.md)로 이동
