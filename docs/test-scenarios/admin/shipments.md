# 배송 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 배송을 관리

---

## 배송 현황

**목표**: 모든 배송 현황 파악

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 배송 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/shipments

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 배송 목록 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/admin/shipments
{
  "shipments": [
    {
      "id": "shipment-uuid",
      "orderNumber": "ORD-20260121-001",
      "trackingNumber": "JP-1234567890",
      "carrier": "佐川急便",
      "status": "shipped"
    }
  ]
}
```

---

## 운송장 등록

**목표**: 출하 시 운송장 번호 등록

**테스트 단계**:

```bash
# 1. 운송장 등록 버튼 클릭
[Browser_click] element="운송장 등록 버튼"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1]

# 2. 정보 입력
[Browser_type] element="送り状番号" text="JP-9876543210"]
[Browser_click] element="배송업체"]
[Browser_click] element="佐川急便"]

# 3. 등록
[Browser_click] element="등록 버튼"]
[Browser_wait_for] time: 2
```

---

## 데이터베이스 검증

```sql
-- 배송 확인
SELECT tracking_number, carrier, status
FROM shipments
ORDER BY created_at DESC;
```

---

## 다음 단계

- [리드 관리](./leads.md)로 이동
