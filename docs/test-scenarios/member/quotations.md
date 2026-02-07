# 견적 관리 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 견적을 관리하는 시나리오

---

## 4.1 견적 목록 조회

**목표**: 회원이 자신의 견적 내역 조회

**전제 조건**:
- 로그인된 회원

**테스트 단계**:

```bash
# 1. 견적 관리 페이지 접속
[Browser_navigate] http://localhost:3002/member/quotations

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 2

# 3. 견적 목록 확인
[Browser_snapshot]

# 4. 필터 테스트 - 드래프만
[Browser_click] element="드래프 필터"]

# 5. 필터 테스트 - 전체 보기
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/member/quotations
# 예상 응답:
[
  {
    "id": "quotation-uuid",
    "quotation_number": "QT-20260121-001",
    "status": "draft",
    "total_amount": 629992,
    "created_at": "2026-01-21T02:27:55Z",
    "valid_until": "2026-02-20T02:27:55Z"
  },
  {
    "id": "quotation-uuid-2",
    "quotation_number": "QT-20260120-001",
    "status": "approved",
    "total_amount": 450000,
    "created_at": "2026-01-20T10:00:00Z"
  }
]

# GET /api/member/quotations?status=draft
# 상태별 필터링
```

**견적 상태값**:

| 상태 | 설명 | 다음 단계 |
|------|------|-----------|
| draft | 드래프(관리자 승인 대기) | 승인/거절 대기 |
| sent | 고객에게 전송됨 | 승인 대기 |
| approved | 승인됨 | 주문 가능 |
| rejected | 거절됨 | 재견적 필요 |
| expired | 유효기간 경과 | 재견적 필요 |
| converted | 주문으로 변환됨 | 주문 페이지로 |

**예상 결과**:
- 견적 목록이 표시됨
- 필터가 정상 작동함

**성공 기준**:
- ✅ 견적 목록이 표시됨
- ✅ 필터가 정상 작동함
- ✅ 상태별로 정확히 분류됨

---

## 4.2 견적 상세 보기

**목표**: 견적 상세 정보 확인

**테스트 단계**:

```bash
# 1. 견적 상세 페이지 접속
[Browser_navigate] http://localhost:3002/member/quotations/[id]

# 2. 견적 정보 확인
[Browser_wait_for] time: 2
[Browser_snapshot]

# 3. 견적 상태 확인
# - 상태, 금액, 유효기간 등

# 4. 제품 사양 확인
# - 재질, 크기, 인쇄 등

# 5. "주문으로 변환" 버튼 확인
# (승인된 견적인 경우)
```

**API 확인**:

```bash
# GET /api/member/quotations/[id]
{
  "quotation": {
    "id": "quotation-uuid",
    "quotation_number": "QT-20260121-001",
    "status": "approved",
    "total_amount": 629992,
    "specification": {
      "productType": "stand_pouch",
      "material": "PET_AL",
      "width": 200,
      "height": 300,
      "quantity": 500
    },
    "valid_until": "2026-02-20",
    "can_convert_to_order": true
  }
}
```

**예상 결과**:
- 견적 상세가 표시됨
- 모든 사양 정보가 보임
- 주문 변환 가능 여부가 표시됨

**성공 기준**:
- ✅ 견적 상세가 정확히 표시됨
- ✅ 제품 사양이 모두 보임
- ✅ 유효기간이 표시됨

---

## 4.3 견적 승인 대기

**목표**: 제출한 견적의 승인 상태 확인

**테스트 단계**:

```bash
# 1. 드래프 상태 견적 상세 페이지 접속
[Browser_navigate] http://localhost:3002/member/quotations/[draft-id]

# 2. "관리자 승인 대기 중" 메시지 확인
[Browser_verify_text_visible] text="승인 대기 중"]
```

**예상 결과**:
- 견적 상세가 표시됨
- 상태: 'draft'
- 관리자 승인을 기다림 안내

**성공 기준**:
- ✅ 견적 상세가 정확히 표시됨
- ✅ 승인 대기 상태가 명확함
- ✅ 승인 대기 예상 시간이 표시됨(있는 경우)

---

## 4.4 견적에서 주문 생성

**목표**: 승인된 견적에서 주문 생성

**전제 조건**:
- 견적 상태가 'approved' 또는 'sent'

**테스트 단계**:

```bash
# 1. 승인된 견적 상세 페이지 접속
[Browser_navigate] http://localhost:3002/member/quotations/[approved-id]

# 2. "주문으로 변환" 버튼 클릭
[Browser_click] element="주문으로 변환 버튼"]

# 3. 주문 생성 페이지로 이동
# (이후 주문 관리 시나리오 참조)
```

**API 확인**:

```bash
# POST /api/member/orders/create
{
  "quotationId": "quotation-uuid",
  "deliveryAddress": {...},
  "requestedDeliveryDate": "2026-02-28"
}
```

**성공 기준**:
- ✅ "주문으로 변환" 버튼이 표시됨
- ✅ 클릭 시 주문 생성 페이지로 이동함

---

## 데이터베이스 검증

```sql
-- 견적 목록 확인
SELECT
  quotation_number,
  status,
  total_amount,
  valid_until,
  created_at
FROM quotations
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;

-- 견적 상태별 개수
SELECT status, COUNT(*) as count
FROM quotations
WHERE user_id = 'member-uuid'
GROUP BY status;
```

---

## 다음 단계

이 시나리오 완료 후:
- [주문 생성](./order-management.md)으로 이동
- [관리자 견적 승인](../admin/quotation-approval.md)으로 이동
