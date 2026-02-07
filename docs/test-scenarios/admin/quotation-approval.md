# 견적 승인 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 견적을 승인/거절하는 시나리오

---

## 3.1 견적 목록 조회 및 필터링

**목표**: 모든 견적을 조회하고 상태별 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 견적 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/quotations

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 견적 목록 확인
# - 20건의 견적이 표시되는지 확인

# 4. 상태 필터 테스트
[Browser_click] element="드래프 필터"]  # 드래프만 표시
[Browser_wait_for] time: 1
[Browser_click] element="전체 보기"]  # 전체 다시 표시
```

**API 확인**:

```bash
# GET /api/admin/quotations
# 예상 응답:
{
  "success": true,
  "quotations": [
    {
      "id": "9a0bd2f4-fc99-4ed5-af78-7555f68bb85f",
      "quotation_number": "QT-1768962470825",
      "customer_name": "ゲスト",
      "customer_email": "guest@example.com",
      "status": "draft",
      "total_amount": 629992,
      "created_at": "2026-01-21T02:27:55Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 20
  }
}
```

**성공 기준**:
- ✅ 견적 목록이 표시됨
- ✅ 필터가 정상 작동함
- ✅ 페이지네이션이 정상 작동함

---

## 3.2 견적 상세 보기

**목표**: 특정 견적의 상세 정보 확인

**테스트 단계**:

```bash
# 1. 견적 아이템 클릭
[Browser_click] element="QT-1768962470825 견적 아이템"]

# 2. 견적 상세 패널 표시 확인
# - 견적 번호
# - 고객 정보
# - 금액
# - 상태
# - 제품 사양 (notes JSON에서 파싱)

# 3. 세부 정보 확인
[Browser_snapshot]
```

**데이터베이스 검증**:

```sql
-- 견적 상세 확인
SELECT
  quotation_number,
  customer_name,
  customer_email,
  status,
  total_amount,
  notes,
  created_at
FROM quotations
WHERE quotation_number = 'QT-1768962470825';
```

**성공 기준**:
- ✅ 견적 상세가 정확히 표시됨
- ✅ notes JSON이 제대로 파싱되어 제품 정보가 보임
- ✅ 고객 정보가 정확함

---

## 3.3 견적 승인

**목표**: 드래프 상태의 견적을 승인으로 변경

**테스트 단계**:

```bash
# 1. 드래프 상태의 견적 선택
# 이미 QT-1768962470825 선택되어 있다고 가정

# 2. 견적 상세 패널에서 "승인" 버튼 클릭
[Browser_click] element="승인 버튼"]

# 3. 확인 대기 상자가 있으면 확인 클릭
# alert("견적을 승인하시겠습니까?")

# 4. 상태 변경 확인
# 상태가 "드래프" → "승인됨"으로 변경됨
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# PATCH /api/admin/quotations?id={quotationId}
{
  "status": "APPROVED"
}

# 예상 응답:
{
  "success": true,
  "quotation": {
    "status": "approved"
  },
  "message": "견적이 승인되었습니다."
}
```

**데이터베이스 검증**:

```sql
-- 상태 변경 확인
SELECT status, approved_at
FROM quotations
WHERE id = '9a0bd2f4-fc99-4ed5-af78-7555f68bb85f';
```

**성공 기준**:
- ✅ 견적 상태가 'draft' → 'approved'로 변경됨
- ✅ 성공 메시지가 표시됨
- ✅ 견적 목록에서 상태가 업데이트됨
- ✅ 회원에게 알림이 생성됨

---

## 3.4 견적 거부

**목표**: 드래프 상태의 견적을 거부

**테스트 단계**:

```bash
# 1. 거부할 견적 선택
[Browser_click] element="거부할 견적 아이템"]

# 2. "거부" 버튼 클릭
[Browser_click] element="거부 버튼"]

# 3. 거부 사유 입력 (SKIP - 거부 사유 입력 필드 미구현)
# [Browser_type] element="拒否理由" text="고객 요청으로 거부"]

# 4. 확인
[Browser_click] element="확인 버튼"]
```

**API 확인**:

```bash
# PATCH /api/admin/quotations?id={quotationId}
{
  "status": "REJECTED",
  "rejectionReason": "고객 요청으로 거부"
}

# 예상 응답:
{
  "success": true,
  "quotation": {
    "status": "rejected"
  },
  "message": "견적이 거부되었습니다."
}
```

**성공 기준**:
- ✅ 견적 상태가 'draft' → 'rejected'로 변경됨
- ✅ 거부 사유가 저장됨
- ✅ 성공 메시지가 표시됨
- ✅ 회원에게 알림이 생성됨

---

## 견적 상태 흐름

```
draft → approved → converted
  ↓         ↓
rejected  expired
```

---

## 데이터베이스 검증

```sql
-- 승인된 견적 확인
SELECT quotation_number, status, approved_at
FROM quotations
WHERE status = 'approved'
ORDER BY approved_at DESC;

-- 거부된 견적 확인
SELECT quotation_number, status, rejection_reason
FROM quotations
WHERE status = 'rejected'
ORDER BY updated_at DESC;
```

---

## 다음 단계

이 시나리오 완료 후:
- [회원 관리](./member-management.md)로 이동
- [회원 견적 확인](../member/quotation-management.md)으로 이동
