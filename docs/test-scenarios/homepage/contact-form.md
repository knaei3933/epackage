# 문의하기 시나리오

**작성일**: 2026-01-21
**목적**: 게스트 사용자가 문의 양식을 통해 문의 제출

---

## 문의 양식 작성

**목표**: 문의 양식을 통해 문의 제출

**전제 조건**:
- 게스트 사용자 (비로그인 상태)

**테스트 단계**:

```bash
# 1. 문의하기 페이지 접속
[Browser_navigate] http://localhost:3002/contact

# 2. 페이지 로딩 확인
[Browser_wait_for] time: 2

# 3. 문의 유형 선택
[Browser_click] element="제품 문의"]

# 4. 이름 입력
[Browser_type] element="氏名" text="테스트 사용자"

# 5. 이메일 입력
[Browser_type] element="メールアドレス" text="test@example.com"

# 6. 회사명 입력 (선택)
[Browser_type] element="会社名" text="테스트 주식회사"

# 7. 문의 내용 입력
[Browser_type] element="お問い合わせ内容" text="견적 문의입니다. 스탠드 파우치 200x300mm 500개 견적 부탁드립니다."

# 8. 제출 버튼 클릭
[Browser_click] element="제출 버튼"]
```

**API 확인**:

```bash
# POST /api/contact
{
  "name": "테스트 사용자",
  "email": "test@example.com",
  "company": "테스트 주식회사",
  "inquiryType": "product",
  "message": "견적 문의입니다..."
}
```

**데이터베이스 검증**:

```sql
SELECT id, name, email, inquiry_type, message, created_at
FROM inquiries
WHERE email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**성공 기준**:
- ✅ 문의가 정상 제출됨
- ✅ 성공 메시지가 표시됨

---

*이 시나리오는 [카탈로그 둘러보기](./catalog-browsing.md#3-문의하기)에 포함되어 있습니다.*
