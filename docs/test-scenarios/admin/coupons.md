# 쿠폰 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 쿠폰을 생성 및 관리

---

## 쿠폰 목록 조회

**목표**: 모든 쿠폰 조회 및 상태별 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 쿠폰 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/coupons

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 쿠폰 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="활성만"]
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/admin/coupons
# 예상 응답:
{
  "coupons": [
    {
      "id": "coupon-uuid",
      "code": "WELCOME10",
      "discountType": "PERCENTAGE",
      "discountValue": 10,
      "minPurchase": 10000,
      "maxDiscount": 5000,
      "isActive": true,
      "validFrom": "2026-01-01",
      "validUntil": "2026-12-31"
    }
  ]
}
```

---

## 상호 검증: 쿠폰 생성 및 회원 사용

**목표**: 관리자가 쿠폰을 생성하고 회원이 사용 가능

### 스텝 1: 관리자가 쿠폰 생성

```bash
# 1. "새 쿠폰" 버튼 클릭
[Browser_click] element="새 쿠폰 버튼"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 2

# 2. 쿠폰 정보 입력
[Browser_type] element="クーポンコード" text="SALE2025"]
[Browser_click] element="할인 유형"]
[Browser_click] element="퍼센트age"]
[Browser_type] element="割引額" text="15"]
[Browser_type] element="最小購入額" text="50000"]
[Browser_type] element="最大割引" text="10000"]
[Browser_type] element="有効期間開始" text="2026-01-21"]
[Browser_type] element="有効期間終了" text="2026-12-31"]
[Browser_click] element="활성화"]

# 3. 저장
[Browser_click] element="저장 버튼"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# POST /api/admin/coupons
{
  "code": "SALE2025",
  "discountType": "PERCENTAGE",
  "discountValue": 15,
  "minPurchase": 50000,
  "maxDiscount": 10000,
  "validFrom": "2026-01-21",
  "validUntil": "2026-12-31",
  "isActive": true
}

# 예상 응답:
{
  "success": true,
  "coupon": {
    "id": "coupon-uuid",
    "code": "SALE2025"
  }
}
```

### 스텝 2: 회원이 쿠폰 사용

```bash
# 1. 회원으로 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.com"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="ログインボタン"]
[Browser_wait_for] time: 3

# 2. 대시보드 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# POST /api/member/quotations/apply-coupon
{
  "couponCode": "SALE2025",
  "quotationData": {...}
}

# 예상 응답:
{
  "success": true,
  "discountedAmount": 9000,
  "newTotal": 51000
}
```

**데이터베이스 검증**:

```sql
-- 쿠폰 생성 확인
SELECT code, discount_type, discount_value, is_active
FROM coupons
WHERE code = 'SALE2025';

-- 쿠폰 사용 확인
SELECT coupon_id, used_at, user_id
FROM coupon_usage
WHERE coupon_id = (
  SELECT id FROM coupons WHERE code = 'SALE2025'
);
```

**성공 기준**:
- ✅ 관리자가 쿠폰 생성 가능
- ✅ 회원이 쿠폰 사용 가능
- ✅ 할인이 정확히 적용됨
- ✅ 쿠폰 사용 기록이 저장됨

---

## 데이터베이스 검증

```sql
-- 전체 쿠폰 현황
SELECT
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_count
FROM coupons;

-- 쿠폰별 사용 현황
SELECT
  c.code,
  COUNT(cu.id) as usage_count,
  SUM(cu.discount_amount) as total_discount
FROM coupons c
LEFT JOIN coupon_usage cu ON cu.coupon_id = c.id
GROUP BY c.code, c.id;
```

---

## 다음 단계

- [시스템 관리](./settings.md)로 이동
