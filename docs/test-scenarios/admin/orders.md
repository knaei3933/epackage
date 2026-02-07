# 주문 & 생산 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 주문을 승인하고 생산을 관리하는 시나리오

---

## 5.1 주문 목록 조회

**목표**: 모든 주문 조회 및 상태별 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 주문 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/orders

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 주문 목록 확인
[Browser_snapshot]

# 4. 상태 필터
[Browser_click] element="대기 주문 필터"]
```

**API 확인**:

```bash
# GET /api/admin/orders
# 예상 응답:
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid",
      "order_number": "ORD-20260121-001",
      "customer_name": "테스트 고객",
      "total_amount": 629992,
      "status": "pending",
      "created_at": "2026-01-21T10:00:00Z"
    }
  ]
}
```

**주문 상태**:

| 상태 | 설명 | 다음 단계 |
|------|------|-----------|
| pending | 대기 중 | 승인 필요 |
| approved | 승인됨 | 생산 할당 |
| in_production | 생산 중 | 완료 대기 |
| shipped | 출하됨 | 배송 중 |
| delivered | 배송 완료 | - |
| cancelled | 취소됨 | - |

**성공 기준**:
- ✅ 주문 목록이 표시됨
- ✅ 필터가 정상 작동함

---

## 5.2 주문 상세 보기

**목표**: 주문 상세 정보 및 배송 추적

**테스트 단계**:

```bash
# 1. 주문 상세 페이지 접속
[Browser_navigate] http://localhost:3002/admin/orders/[id]

# 2. 주문 정보 확인
[Browser_snapshot]

# 3. 배송 추적
[Browser_click] element="배송 추적 버튼"]
```

**성공 기준**:
- ✅ 주문 상세가 정확히 표시됨
- ✅ 배송 추적 정보가 표시됨

---

## 5.3 주문 승인

**목표**: 대기 중인 주문을 승인

**테스트 단계**:

```bash
# 1. 승인할 주문 선택
[Browser_click] element="주문 아이템"]

# 2. "승인" 버튼 클릭
[Browser_click] element="주문 승인 버튼"]

# 3. 확인
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# PATCH /api/admin/orders/[id]/approve
# 예상 응답:
{
  "success": true,
  "order": {
    "status": "approved"
  },
  "message": "주문이 승인되었습니다."
}
```

**성공 기준**:
- ✅ 주문 상태가 'pending' → 'approved'로 변경됨
- ✅ 생산 작업이 자동 생성됨
- ✅ 회원에게 알림이 생성됨

---

## 6.1 생산 작업 할당

**목표**: 주문을 생산 라인에 할당

**테스트 단계**:

```bash
# 1. 생산 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/production

# 2. 할당 가능한 주문 목록 확인

# 3. 주문 선택
[Browser_click] element="할당할 주문"]

# 4. 생산 라인 선택
[Browser_click] element="생산 라인 1"]

# 5. 담당자 선택
[Browser_click] element="담당자 선택"]

# 6. 할당 버튼 클릭
[Browser_click] element="생산 할당 버튼"]
```

**API 확인**:

```bash
# POST /api/admin/production/jobs
{
  "orderId": "order-uuid",
  "productionLine": 1,
  "assignedTo": "operator-uuid"
}

# 예상 응답:
{
  "success": true,
  "job": {
    "job_number": "JOB-20260121-001",
    "status": "assigned"
  }
}
```

**성공 기준**:
- ✅ 주문이 생산 라인에 할당됨
- ✅ 생산 작업이 생성됨
- ✅ 작업자에게 알림이 발송됨

---

## 6.2 생산 진척 관리

**목표**: 생산 진척률 업데이트

**테스트 단계**:

```bash
# 1. 생산 작업 선택
[Browser_click] element="생산 작업"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1]

# 2. 진척률 입력
[Browser_type] element="進捗率" text="25"]

# 3. 메모 입력
[Browser_type] element="作業メモ" text="재료 절단 완료"]

# 4. 업데이트 버튼 클릭
[Browser_click] element="진척 업데이트 버튼"]
```

**API 확인**:

```bash
# PATCH /api/admin/production/[id]/progress
{
  "progressPercentage": 25,
  "notes": "재료 절단 완료"
}

# 예상 응답:
{
  "success": true,
  "job": {
    "status": "in_progress",
    "progress_percentage": 25
  }
}
```

**성공 기준**:
- ✅ 진척률이 업데이트됨
- ✅ 회원에게 진척 알림이 생성됨

---

## 데이터베이스 검증

```sql
-- 주문 승인 확인
SELECT order_number, status, approved_at
FROM orders
WHERE status = 'approved'
ORDER BY approved_at DESC;

-- 생산 작업 확인
SELECT job_number, status, progress_percentage
FROM production_jobs
ORDER BY created_at DESC;
```

---

## 다음 단계

이 시나리오 완료 후:
- [재고 & 배송](./inventory-shipping.md)으로 이동
- [회원 주문 추적](../member/order-management.md)으로 이동
