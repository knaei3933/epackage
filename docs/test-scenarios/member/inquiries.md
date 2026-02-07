# 문의 시나리오

**작성일**: 2026-01-21
**목적**: 회원이 문의 내역 확인

---

## 문의 목록

**목표**: 회원이 자신의 문의 내역 조회

**전제 조건**:
- 회원으로 로그인된 상태

**테스트 단계**:

```bash
# 1. 문의 페이지 접속
[Browser_navigate] http://localhost:3002/member/inquiries

# 2. 페이지 로딩 대기
[Browser_wait_for] time: 3

# 3. 문의 목록 확인
[Browser_snapshot]
```

**API 확인**:

```bash
# GET /api/member/inquiries
{
  "inquiries": [
    {
      "id": "inquiry-uuid",
      "type": "제품 문의",
      "title": "스탠드 파우치 문의",
      "status": "ANSWERED",
      "createdAt": "2026-01-21T10:00:00Z"
    }
  ]
}
```

---

## 새 문의 작성

**목표**: 새로운 문의 제출

**테스트 단계**:

```bash
# 1. "새 문의" 버튼 클릭
[Browser_click] element="새 문의 버튼"]

# 1.5. 폼 표시 대기
[Browser_wait_for] time: 1

# 2. 문의 유형 선택
[Browser_click] element="제품 문의"]

# 2.5. 대기
[Browser_wait_for] time: 1

# 3. 제목 입력
[Browser_type] element="件名" text="대량 주문 문의"]

# 4. 내용 입력
[Browser_type] element="内容" text="1000개 단위 주문 가능한지 문의드립니다."]

# 5. 제출
[Browser_click] element="제출 버튼"]
[Browser_wait_for] time: 2
```

**API 확인**:

```bash
# POST /api/member/inquiries
{
  "type": "product",
  "title": "대량 주문 문의",
  "message": "1000개 단위 주문 가능한지 문의드립니다."
}
```

---

## 데이터베이스 검증

```sql
-- 문의 확인
SELECT type, title, status, created_at
FROM inquiries
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;
```

---

## 다음 단계

- [프로필](./profile.md)로 이동
