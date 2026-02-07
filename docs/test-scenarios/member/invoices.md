# 청구서 관리 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 청구서를 발행 및 관리

---

## 청구서 목록

**목표**: 발행된 청구서 목록 조회

**전제 조건**:
- 회원으로 로그인된 상태
- 완료된 주문 존재

**테스트 단계**:

```bash
# 1. 청구서 관리 페이지 접속
[Browser_navigate] http://localhost:3002/member/invoices

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 청구서 목록 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/invoices
{
  "invoices": [
    {
      "id": "invoice-uuid",
      "invoiceNumber": "INV-20260121-001",
      "orderNumber": "ORD-20260121-001",
      "amount": 629992,
      "status": "PAID",
      "issuedAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

---

## 청구서 다운로드

**목표**: 청구서 PDF 다운로드

### 테스트 단계

```bash
# 1. 청구서 상세 클릭
[Browser_click] element="청구서 번호"]

# 2. PDF 다운로드
[Browser_click] element="PDF 다운로드 버튼"]
[Browser_wait_for] time: 3
```

**성공 기준**:
- ✅ PDF 파일 다운로드됨
- ✅ 파일명: INV-YYYYMMDD-NNN.pdf

---

## 데이터베이스 검증

```sql
-- 청구서 확인
SELECT invoice_number, order_number, amount, status
FROM invoices
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;
```

---

## 다음 단계

- [샘플 의뢰](./samples.md)로 이동
