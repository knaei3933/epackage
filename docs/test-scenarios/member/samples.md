# 샘플 의뢰 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 제품 샘플을 요청

---

## 샘플 의뢰

**목표**: 제품 샘플 요청

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 샘플 페이지 접속
[Browser_navigate] http://localhost:3002/samples

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 2

# 3. 샘플 유형 선택
[Browser_click] element="스탠드 파우치 샘플"]

# 3.5. 폼 표시 대기
[Browser_wait_for] time: 1

# 4. 수량 입력
[Browser_type] element="数量" text="10"]

# 5. 배송지 선택
[Browser_click] element="납품처 선택"]
[Browser_click] element="본사 창고"]

# 6. 요청 제출
[Browser_click] element="샘플 요청 버튼"]
[Browser_wait_for] time: 3
```

**API 확인**:

```bash
# POST /api/member/samples
{
  "productType": "stand_up",
  "quantity": 10,
  "deliveryAddressId": "delivery-uuid"
}
```

---

## 데이터베이스 검증

```sql
-- 샘플 요청 확인
SELECT id, product_type, quantity, status
FROM sample_requests
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;
```

---

## 다음 단계

- [문의](./inquiries.md)로 이동
