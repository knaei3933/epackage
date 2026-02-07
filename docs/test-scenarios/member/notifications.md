# 알림 센터 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 알림을 확인 및 관리

---

## 알림 목록

**목표**: 회원 알림 목록 조회

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 알림 페이지 접속
[Browser_navigate] http://localhost:3002/member/notifications

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 알림 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="미읽음만"]
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/member/notifications
{
  "notifications": [
    {
      "id": "notif-uuid",
      "type": "order_approved",
      "title": "주문이 승인되었습니다.",
      "message": "주문 #ORD-001이 승인되었습니다.",
      "isRead": false,
      "createdAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

---

## 알림 읽음 처리

**목표**: 알림을 읽음으로 표시

### 테스트 단계

```bash
# 1. 알림 클릭
[Browser_click] element="알림 아이템"]

# 2. 알림 상세 확인
[Browser_wait_for] time: 1

# 3. 읽음으로 표시
[Browser_click] element="읽음으로 표시 버튼"]
[Browser_wait_for] time: 1

# 4. 목록으로 복귀
# 알림이 읽음 상태로 변경됨
```

---

## 전체 읽음

**목표**: 모든 알림을 읽음으로 표시

### 테스트 단계

```bash
# 1. "모두 읽음" 버튼 클릭
[Browser_click] element="모두 읽음 버튼"]

# 2. 확인
# alert("모든 알림을 읽음으로 표시하시겠습니까?")

# 3. 미읽음 알림 수가 0이 되는지 확인
```

---

## 상호 검증: 관리자 액션 후 알림 확인

**목표**: 관리자 액션에 따라 회원에게 알림 생성 확인

### 스텝 1: 관리자가 주문 승인 (관리자)

```bash
# 1. 관리자 로그인 후 주문 승인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="admin@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Admin1234!"]
[Browser_click] element="ログイン ボタン"]
[Browser_wait_for] time: 3

# 2. 주문 승인
[Browser_navigate] http://localhost:3002/admin/orders
[Browser_click] element="주문 승인 버튼"]
[Browser_wait_for] time: 2
```

### 스텝 2: 회원이 알림 확인 (회원)

```bash
# 1. 회원으로 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="ログイン ボタン"]
[Browser_wait_for] time: 3

# 2. 알림 페이지 접속
[Browser_navigate] http://localhost:3002/member/notifications
[Browser_wait_for] time: 2

# 3. 알림 확인
[Browser_verify_text_visible] text="주문이 승인되었습니다."]

# 4. 알림 클릭하여 상세 확인
[Browser_click] element="알림 아이템"]

# 5. 읽음으로 표시
[Browser_click] element="읽음으로 표시 버튼"]
[Browser_wait_for] time: 1
```

**데이터베이스 검증**:

```sql
-- 알림 생성 확인
SELECT type, title, is_read, recipient_type
FROM unified_notifications
WHERE type = 'order_approved' AND recipient_id = 'member-uuid'
ORDER BY created_at DESC LIMIT 1;
```

**성공 기준**:
- ✅ 관리자 주문 승인 시 알림 생성됨
- ✅ 회원이 알림을 확인 가능
- ✅ 알림을 읽음으로 표시 가능
- ✅ Realtime으로 실시간 업데이트

---

## 데이터베이스 검증

```sql
-- 미읽은 알림 수
SELECT COUNT(*) as unread_count
FROM unified_notifications
WHERE recipient_id = 'member-uuid' AND recipient_type = 'member' AND is_read = false;
```

---

## 다음 단계

- [대시보드](./login-dashboard.md)로 돌아가기
