# 리드 관리 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 영업 리드를 관리

---

## 리드 목록 조회

**목표**: 모든 영업 리드 조회 및 상태별 필터링

**전제 조건**:
- 관리자로 로그인된 상태

**테스트 단계**:

```bash
# 1. 리드 관리 페이지 접속
[Browser_navigate] http://localhost:3002/admin/leads

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 리드 목록 확인
[Browser_snapshot]

# 4. 필터 테스트
[Browser_click] element="신규만"]
[Browser_click] element="전체 보기"]
```

**API 확인**:

```bash
# GET /api/admin/leads
# 예상 응답:
{
  "leads": [
    {
      "id": "lead-uuid",
      "name": "김철수",
      "company": "테스트 주식회사",
      "email": "kim@example.com",
      "phone": "02-1234-5678",
      "status": "NEW",
      "source": "웹사이트",
      "createdAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

**리드 상태**:

| 상태 | 설명 |
|------|------|
| NEW | 신규 |
| CONTACTED | 연락 완료 |
| QUALIFIED | 확실 리드 |
| PROPOSAL | 제안 전송 |
| NEGOTIATION | 협상 중 |
| WON | 성공 |
| LOST | 실패 |

---

## 새 리드 등록

**목표**: 새로운 영업 리드 등록

**테스트 단계**:

```bash
# 1. "새 리드" 버튼 클릭
[Browser_click] element="새 리드 버튼"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1]

# 2. 리드 정보 입력 (실제 페이지 구조에 맞게 수정)
[Browser_type] element="氏名" text="홍길동"]
# 회사명 필드는 실제 페이지에 존재하지 않음 (삭제 또는 주석 처리)
[Browser_type] element="メールアドレス" text="hong@example.com"]
[Browser_type] element="会社電話番号" text="02-9876-5432"]
[Browser_click] element="리드 출처"]
[Browser_click] element="웹사이트"]

# 3. 저장
[Browser_click] element="저장 버튼"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# POST /api/admin/leads
{
  "name": "홍길동",
  "company": "홍길동 상사",
  "email": "hong@example.com",
  "phone": "02-9876-5432",
  "source": "website"
}
```

**성공 기준**:
- ✅ 리드가 등록됨
- ✅ 리드 목록에 표시됨

---

## 데이터베이스 검증

```sql
-- 리드 현황
SELECT status, COUNT(*) as count
FROM leads
GROUP BY status;

-- 최근 리드
SELECT name, company, status, source, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

---

## 다음 단계

- [쿠폰 관리](./coupons.md)로 이동
