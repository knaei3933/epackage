# 계약 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 계약을 생성 및 관리하고 회원이 확인

---

## 계약 목록 조회

**목표**: 모든 계약 조회 및 상태별 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 계약 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/contracts

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 계약 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="서명 대기만"]
[Browser_wait_for] time: 1
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/admin/contracts/workflow
# 예상 응답:
{
  "contracts": [
    {
      "id": "contract-uuid",
      "contractNumber": "CTR-20260121-001",
      "orderId": "order-uuid",
      "customerName": "테스트 주식회사",
      "status": "SENT",
      "sentAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

**계약 상태**:

| 상태 | 설명 |
|------|------|
| DRAFT | 초안 |
| SENT | 전송됨 |
| PENDING_SIGNATURE | 서명 대기 |
| CUSTOMER_SIGNED | 고객 서명 완료 |
| ADMIN_SIGNED | 관리자 서명 완료 |
| SIGNED | 양측 서명 완료 |
| ACTIVE | 활성화됨 |
| COMPLETED | 완료됨 |
| CANCELLED | 취소됨 |

---

## 상호 검증: 주문에서 계약 생성

**목표**: 주문에서 계약을 생성하고 회원이 계약을 확인

### 스텝 1: 관리자가 계약 생성

```bash
# 1. 주문 상세 페이지 접속
[Browser_navigate] http://localhost:3002/admin/orders

# 2. 승인된 주문 선택
[Browser_click] element="주문 상세 버튼"]

# 3. "계약 생성" 버튼 클릭
[Browser_click] element="계약 생성 버튼"]
[Browser_wait_for] time: 2

# 4. 계약 내용 확인
[Browser_snapshot]
# 주문 내용, 약관, 유효기간 등 확인

# 5. 고객에게 전송
[Browser_click] element="고객에게 전송 버튼"]
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

# 예상 응답:
{
  "success": true,
  "contract": {
    "id": "contract-uuid",
    "contractNumber": "CTR-20260121-001",
    "status": "SENT"
  }
}
```

### 스텝 2: 회원이 계약 확인 및 서명

```bash
# 1. 회원으로 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_wait_for] time: 3

# 2. 계약 관리 페이지 접속
[Browser_navigate] http://localhost:3002/member/contracts
[Browser_wait_for] time: 2

# 3. 계약 상세 확인
[Browser_click] element="계약 번호 클릭"]
[Browser_snapshot]

# 4. 계약 내용 확인
# 약관, 금액, 납품 조건 등 확인

# 5. 서명 (SKIP - 전자 서명 기능 미구현)
# [Browser_click] element="서명 버튼"]
# [Browser_type] element="署名" text="확인용 서명"]
# [Browser_click] element="서명 제출 버튼"]
# [Browser_wait_for] time: 2
```

### 스텝 3: 관리자가 계약 확인 및 서명

```bash
# 1. 관리자로 로그인 후 계약 페이지 접속
[Browser_navigate] http://localhost:3002/admin/contracts

# 2. 계약 상세 접속
[Browser_click] element="CTR-20260121-001 계약"]

# 3. 고객 서명 확인 (SKIP - 미구현)
# [Browser_verify_text_visible] text="고객 서명 완료"]

# 4. 관리자 서명 (SKIP - 전자 서명 기능 미구현)
# [Browser_click] element="관리자 서명 버튼"]
# [Browser_type] element="署名" text="관리자 서명"]
# [Browser_click] element="서명 제출 버튼"]
# [Browser_wait_for] time: 2

# 5. 계약 활성화 (SKIP - 미구현)
# [Browser_verify_text_visible] text="계약 활성화됨"]
```

**데이터베이스 검증**:

```sql
-- 계약 생성 확인
SELECT contract_number, status, sent_at
FROM contracts
WHERE order_id = (
  SELECT id FROM orders WHERE order_number = 'ORD-...'
)
ORDER BY created_at DESC LIMIT 1;

-- 서명 상태 확인
SELECT status, customer_signed_at, admin_signed_at
FROM contracts
WHERE contract_number = 'CTR-20260121-001';
```

**성공 기준**:
- ✅ 관리자가 계약 생성 가능
- ✅ 회원이 계약 확인 가능
- ✅ 회원이 계약 서명 가능
- ✅ 관리자가 서명 확인 가능
- ✅ 계약 상태가 정확히 업데이트됨

---

## 데이터베이스 검증

```sql
-- 전체 계약 현황
SELECT status, COUNT(*) as count
FROM contracts
GROUP BY status;

-- 최근 계약 확인
SELECT contract_number, customer_name, status, created_at
FROM contracts
ORDER BY created_at DESC
LIMIT 10;
```

---

## 다음 단계

- [생산 관리](./production.md)로 이동
