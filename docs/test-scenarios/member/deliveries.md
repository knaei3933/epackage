# 납품처 관리 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 납품처 정보를 관리

---

## 납품처 목록

**목표**: 등록된 납품처 목록 조회

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 납품처 관리 페이지 접속
[Browser_navigate] http://localhost:3002/member/deliveries

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 납품처 목록 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/deliveries
{
  "deliveries": [
    {
      "id": "delivery-uuid",
      "name": "본사 창고",
      "postalCode": "100-0001",
      "prefecture": "東京都",
      "city": "千代田区",
      "street": "テスト1-2-3",
      "building": "テストビル",
      "phone": "03-1234-5678",
      "isDefault": true
    }
  ]
}
```

---

## 새 납품처 등록

**목표**: 새로운 납품처 정보 등록

**테스트 단계**:

```bash
# 1. "새 납품처" 버튼 클릭
[Browser_click] element="새 납품처 버튼"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 2

# 2. 납품처 정보 입력 (일본 주소 형식으로 수정)
[Browser_type] element="納入先名" text="서울 지사"]
[Browser_type] element="連絡先" text="02-5555-6666"]
[Browser_type] element="郵便番号" text="134-857"

# 3. 주소 입력 (일본 주소 형식: 都道府県, 市区町村, 番地・建物名)
[Browser_type] element="都道府県" text="서울특별시"]
[Browser_type] element="市区町村" text="강남구"]
[Browser_type] element="番地・建物名" text="테헌로 123"]

# 4. 기본 납품처로 설정
[Browser_click] element="기본 납품처"]

# 5. 저장
[Browser_click] element="저장 버튼"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# POST /api/member/deliveries
{
  "name": "서울 지사",
  "phone": "02-5555-6666",
  "postalCode": "134-857",
  "prefecture": "서울특별시",
  "city": "강남구",
  "street": "테헌로 123",
  "isDefault": true
}
```

---

## 데이터베이스 검증

```sql
-- 납품처 확인
SELECT name, postal_code, prefecture, city, is_default
FROM delivery_addresses
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;
```

---

## 다음 단계

- [청구서 관리](./invoices.md)로 이동
