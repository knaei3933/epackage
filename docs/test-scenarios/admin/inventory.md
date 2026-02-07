# 재고 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 재고를 관리

---

## 재고 현황

**목표**: 모든 재료 재고 현황 확인

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 재고 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/inventory

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 재고 목록 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/admin/inventory/items
{
  "items": [
    {
      "id": "material-uuid",
      "name": "PET 필름",
      "currentStock": 5000,
      "unit": "kg",
      "minStock": 1000,
      "reorderLevel": 2000
    }
  ]
}
```

---

## 입고 처리

**목표**: 재료 입고 등록

**테스트 단계**:

```bash
# 1. 재고 항목 선택
[Browser_click] element="PET 필름"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1]

# 2. 입고 수량 입력
[Browser_type] element="入庫数量" text="1000"]

# 3. 입고 버튼 클릭
[Browser_click] element="입고 버튼"]
[Browser_wait_for] time: 2
```

---

## 데이터베이스 검증

```sql
-- 재고 확인
SELECT name, current_stock, unit, min_stock
FROM inventory_items
ORDER BY current_stock ASC;
```

---

## 다음 단계

- [배송 관리](./shipments.md)로 이동
