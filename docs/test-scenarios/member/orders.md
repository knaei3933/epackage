# 주문 관리 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 주문을 생성하고 관리하는 시나리오

---

## 3.1 새 주문 생성

**목표**: 견적을 바탕으로 새 주문 생성

**전제 조건**:
- 로그인된 회원
- 승인된 견적이 존재

**테스트 단계**:

```bash
# 1. 주문 관리 페이지 접속
[Browser_navigate] http://localhost:3002/member/orders

# 2. "새 주문" 버튼 클릭
[Browser_click] element="새 주문 버튼"]

# 2.5. 대기
[Browser_wait_for] time: 1

# 3. 견적에서 주문 생성 선택
[Browser_click] element="견적에서 주문 생성 버튼"]

# 3.5. 대기
[Browser_wait_for] time: 1

# 4. 견적 목록에서 선택
[Browser_click] element="견적 선택"]

# 4.5. 배송지 폼 표시 대기
[Browser_wait_for] time: 2

# 5. 배송지 정보 입력 (실제 페이지 구조에 맞게 수정)
[Browser_type] element="郵便番号" text="100-0001"
[Browser_type] element="都道府県" text="東京都"
[Browser_type] element="市区町村" text="千代田区"
[Browser_type] element="番地・建物名" text="テスト1-2-3 テストビル"

# 6. 희망 납입일 지정
[Browser_type] element="希望納入日" text="2026-02-28"

# 7. 주문 확인
[Browser_click] element="주문 확인 버튼"]
[Browser_wait_for] time: 2

# 8. 주문 제출
[Browser_click] element="주문 제출 버튼"]
```

**API 확인**:

```bash
# POST /api/member/orders/create
{
  "quotationId": "quotation-uuid",
  "deliveryAddress": {
    "postalCode": "100-0001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "テスト1-2-3",
    "building": "テストビル"
  },
  "requestedDeliveryDate": "2026-02-28"
}

# 예상 응답:
{
  "orderId": "order-uuid",
  "orderNumber": "ORD-20260121-001",
  "status": "pending"
}
```

**데이터베이스 검증**:

```sql
-- 생성된 주문 확인
SELECT
  order_number,
  user_id,
  status,
  total_amount,
  requested_delivery_date
FROM orders
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC
LIMIT 1;

-- 견적 상태 변경 확인
SELECT status
FROM quotations
WHERE id = 'quotation-uuid';
-- 예상: 'CONVERTED'
```

**예상 결과**:
- 주문이 생성됨
- 주문 번호가 부여됨
- 주문 상태: 'pending'
- 견적 상태: 'CONVERTED'

**성공 기준**:
- ✅ 주문이 정상적으로 생성됨
- ✅ 주문 번호가 정상 부여됨
- ✅ 견적 상태가 CONVERTED로 변경됨

---

## 3.2 주문 내역 조회

**목표**: 주문 내역에서 주문 상세 확인

**테스트 단계**:

```bash
# 1. 주문 내역 페이지 접속
[Browser_navigate] http://localhost:3002/member/orders

# 2. 주문 목록 확인
[Browser_wait_for] time: 2

# 3. 주문 클릭
[Browser_click] element="주문 번호 클릭"]

# 4. 주문 상세 페이지
# 주문 정보, 배송 정보, 생산 상태 등 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/orders
# 예상 응답:
[
  {
    "id": "order-uuid",
    "orderNumber": "ORD-20260121-001",
    "status": "pending",
    "totalAmount": 629992,
    "createdAt": "2026-01-21T..."
  }
]

# GET /api/member/orders/[id]
{
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-20260121-001",
    "status": "pending",
    "items": [...],
    "shippingAddress": {...},
    "productionStatus": "pending"
  }
}
```

**예상 결과**:
- 주문 상세가 표시됨
- 주문 상태, 배송 추적 정보가 보임

**성공 기준**:
- ✅ 주문 상세가 정확히 표시됨
- ✅ 배송 추적 정보가 있음

---

## 3.3 주문 추적

**목표**: 주문 배송 상태 추적

**테스트 단계**:

```bash
# 1. 주문 상세 페이지에서 "배송 추적" 클릭
[Browser_click] element="배송 추적 버튼"]

# 2. 추적 정보 확인
# 운송장 정보, 배송 상태 등 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/orders/[id]/tracking
# 예상 응답:
{
  "trackingNumber": "JP-1234567890",
  "status": "in_transit",
  "carrier": "佐川急便",
  "estimatedDelivery": "2026-02-15",
  "history": [
    {
      "status": "picked_up",
      "location": "도쿄",
      "timestamp": "2026-01-21T10:00:00Z"
    },
    {
      "status": "in_transit",
      "location": "배송 중",
      "timestamp": "2026-01-22T08:00:00Z"
    }
  ]
}
```

**배송 상태값**:

| 상태 | 설명 |
|------|------|
| pending | 출류 대기 |
| picked_up | 품집 완료 |
| in_transit | 배송 중 |
| out_for_delivery | 배송 예정 |
| delivered | 배송 완료 |

**성공 기준**:
- ✅ 추적 번호가 표시됨
- ✅ 배송 상태가 정확함
- ✅ 배송 이력이 표시됨

---

## 주문 상태 흐름

```
pending → approved → in_production → shipped → delivered
   ↓         ↓           ↓            ↓
  취소     취소        취소         반송
```

---

## 오류 처리

**문제**: 주문 생성 실패
**해결**:
1. 견적 승인 상태 확인
2. 배송지 정보 유효성 확인
3. API 응답 메시지 확인

**문제**: 추적 정보 없음
**해결**:
1. 배송 시작 여부 확인
2. 운송장 번호 등록 여부 확인

---

## 다음 단계

이 시나리오 완료 후:
- [관리자 주문 승인](../admin/order-production.md)으로 이동
- [프로필 관리](./profile-notifications.md)로 이동
