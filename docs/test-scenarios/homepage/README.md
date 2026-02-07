# 홈페이지 테스트 시나리오

**작성일**: 2026-01-21
**목적**: 게스트 사용자(비로그인)가 홈페이지를 이용하는 시나리오

---

## 시나리오 목록

| 시나리오 | 설명 | 파일 |
|---------|------|------|
| 1. 견적 생성 | 홈페이지에서 견적 시뮬레이터를 통해 견적 생성 | [guest-quotation.md](./guest-quotation.md) |
| 2. 카탈로그 둘러보기 | 제품 카탈로그 페이지에서 제품 정보 확인 | [catalog-browsing.md](./catalog-browsing.md) |
| 3. 문의하기 | 문의 양식을 통해 문의 제출 | [contact-form.md](./contact-form.md) |
| 4. 사례 보기 | 도입 사례 페이지에서 사례 확인 | [case-studies.md](./case-studies.md) |

---

## 공통 전제 조건

- **사용자**: 게스트(비로그인 상태)
- **서버**: http://localhost:3002
- **브라우저**: Playwright MCP 사용

---

## 테스트 완료 후 확인

### 데이터베이스 검증

```sql
-- 생성된 견적 확인
SELECT quotation_number, customer_name, customer_email, status, total_amount
FROM quotations
WHERE customer_email = 'guest@example.com'
ORDER BY created_at DESC;

-- 문의 내역 확인
SELECT id, name, email, inquiry_type, message, created_at
FROM inquiries
ORDER BY created_at DESC;
```

### 성공 기준

- ✅ 모든 시나리오가 정상적으로 완료됨
- ✅ 데이터베이스에 데이터가 정상적으로 저장됨
- ✅ 페이지 이동 및 버튼 클릭이 정상 작동함
