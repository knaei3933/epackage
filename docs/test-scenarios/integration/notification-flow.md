# 알림 연동 플로우

**작성일**: 2026-01-21
**목적**: 크로스 시스템 알림 검증

---

## 4.1 견적 관련 알림

### 시나리오 A: 새 견적 알림

```bash
# 1. 게스트 견적 생성
# (guest-quotation-flow.md 참조)

# 2. 관리자 알림 확인
[Browser_navigate] http://localhost:3002/admin/dashboard
[Browser_wait_for] time: 2

# 3. 알림 배지 확인
# 미읽은 알림 수 증가 확인
```

**데이터베이스 검증**:

```sql
SELECT type, title, message, recipient_type
FROM unified_notifications
WHERE type = 'quotation_created'
ORDER BY created_at DESC LIMIT 1;
```

**성공 기준**:
- ✅ recipient_type: 'admin'
- ✅ type: 'quotation_created'

---

### 시나리오 B: 견적 승인 알림

```bash
# 1. 관리자가 견적 승인
# (guest-quotation-flow.md 참조)

# 2. 회원 알림 확인
# 회원으로 로그인 후
[Browser_navigate] http://localhost:3002/member/notifications
[Browser_wait_for] time: 2
```

**성공 기준**:
- ✅ recipient_type: 'member'
- ✅ type: 'quotation_approved'

---

## 4.2 주문 관련 알림

### 시나리오 C: 주문 생성 알림

```bash
# 1. 회원 주문 생성
# (order-shipping-flow.md 참조)

# 2. 관리자 알림 확인
```

**데이터베이스 검증**:

```sql
SELECT type, title, message, recipient_type
FROM unified_notifications
WHERE type = 'order_created'
ORDER BY created_at DESC LIMIT 1;
```

**성공 기준**:
- ✅ recipient_type: 'admin'

---

### 시나리오 D: 주문 승인 알림

```bash
# 1. 관리자가 주문 승인
# (order-shipping-flow.md 참조)

# 2. 회원 알림 확인
```

**성공 기준**:
- ✅ recipient_type: 'member'
- ✅ type: 'order_approved'

---

## 4.3 배송 관련 알림

### 시나리오 E: 배송 시작 알림

```bash
# 1. 관리자가 출하 처리
# (order-shipping-flow.md 참조)

# 2. 회원 알림 확인
```

**데이터베이스 검증**:

```sql
SELECT type, title, message, recipient_type
FROM unified_notifications
WHERE type = 'order_shipped'
ORDER BY created_at DESC LIMIT 1;
```

**성공 기준**:
- ✅ recipient_type: 'member'
- ✅ type: 'order_shipped'

---

## 4.4 회원 가입 알림

### 시나리오 F: 신규 회원 알림

```bash
# 1. 신규 회원 가입
# (member-registration-flow.md 참조)

# 2. 관리자 알림 확인
```

**데이터베이스 검증**:

```sql
SELECT type, title, message, recipient_type
FROM unified_notifications
WHERE type = 'user_registered'
ORDER BY created_at DESC LIMIT 1;
```

**성공 기준**:
- ✅ recipient_type: 'admin'
- ✅ type: 'user_registered'

---

## 전체 성공 기준

- ✅ 견적 생성 시 관리자 알림 생성
- ✅ 견적 승인 시 회원 알림 생성
- ✅ 주문 생성 시 관리자 알림 생성
- ✅ 주문 승인 시 회원 알림 생성
- ✅ 배송 시작 시 회원 알림 생성
- ✅ 회원 가입 시 관리자 알림 생성

---

## 다음 단계

- [실시간 업데이트](./realtime-updates.md)로 이동
