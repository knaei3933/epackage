# 계약 관리 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 계약을 확인 및 서명

---

## 계약 목록 조회

**목표**: 회원이 자신의 계약 목록 조회

**전제 조건**:
- 회원으로 로그인된 상태
- 관리자가 계약을 생성한 상태

**테스트 단계**:

```bash
# 1. 계약 관리 페이지 접속
[Browser_navigate] http://localhost:3002/member/contracts

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 계약 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="서명 대기만"]
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/member/contracts
# 예상 응답:
{
  "contracts": [
    {
      "id": "contract-uuid",
      "contractNumber": "CTR-20260121-001",
      "orderNumber": "ORD-20260121-001",
      "status": "SENT",
      "createdAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

---

## 상호 검증: 관리자 계약 생성 → 회원 확인

### 스텝 1: 관리자가 계약 생성 (관리자)

```bash
# 1. 관리자 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="admin@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Admin1234!"]
[Browser_click] element="ログイン ボタン"]
[Browser_wait_for] time: 3

# 2. 주문 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/orders

# 3. 승인된 주문 선택 후 계약 생성
[Browser_click] element="주문 상세"]
[Browser_click] element="계약 생성 버튼"]
[Browser_wait_for] time: 2

# 4. 고객에게 전송
[Browser_click] element="고객에게 전송"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# POST /api/admin/contracts/create
{
  "orderId": "order-uuid",
  "terms": "계약 약관...",
  "validFrom": "2026-01-21",
  "validUntil": "2027-01-21"
}
```

### 스텝 2: 회원이 계약 확인 (회원)

```bash
# 1. 회원 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="ログイン ボタン"]
[Browser_wait_for] time: 3

# 2. 알림 확인
# "새 계약이 도착했습니다" 알림 표시 확인

# 3. 계약 페이지 접속
[Browser_navigate] http://localhost:3002/member/contracts
[Browser_wait_for] time: 3

# 4. 계약 확인
[Browser_verify_text_visible] text="CTR-20260121-001"]
[Browser_click] element="계약 상세 버튼"]
```

---

## 계약 서명

**목표**: 회원이 계약에 서명

> **⚠️ SKIP: 전자 서명 기능은 아직 구현되지 않았습니다.**
> **未実装**: 電子署名機能はまだ実装されていません。

### 테스트 단계 (SKIP - 未実装)

```bash
# SKIP: 전자 서명 기능 미구현으로 테스트 건너뜀
# 1. 계약 상세에서 계약 내용 확인
[Browser_snapshot]
# 약관, 금액, 납품 조건 등 확인

# 2. 서명 입력 (SKIP)
# [Browser_click] element="서명 버튼"]
# [Browser_type] element="署名" text="확인용 서명입니다"]

# 3. 서명 제출 (SKIP)
# [Browser_click] element="서명 제출 버튼"]
# [Browser_wait_for] time: 3

# 4. 서명 완료 확인 (SKIP)
# [Browser_verify_text_visible] text="서명이 완료되었습니다"]
```

**API 확인 (SKIP)**:

```bash
# SKIP: POST /api/member/contracts/[id]/sign
```

**데이터베이스 검증 (SKIP)**:

```sql
-- SKIP: 계약 서명 확인
```

---

## 데이터베이스 검증

```sql
-- 회원 계약 확인
SELECT contract_number, status, created_at
FROM contracts
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;
```

---

## 다음 단계

- [청구서 관리](./invoices.md)로 이동
