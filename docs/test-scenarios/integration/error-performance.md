# 오류 처리 & 성능 검증

**작성일**: 2026-01-21
**목적**: 에러 핸들링, 성능, 보안 검증

---

## 6. 오류 처리

### 6.1 권한 에러

**목표**: 적절한 권한이 없는 경우 액세스 거부 확인

#### 테스트 A: 회원이 관리자 페이지 액세스

```bash
# 1. 회원으로 로그인
[Browser_navigate] http://localhost:3002/auth/signin
[Browser_type] element="メールアドレス" text="member@test.epac.co.jp"]
[Browser_type] element="パスワード" text="Member1234!"]
[Browser_click] element="로그인 버튼"]
[Browser_wait_for] time: 3

# 2. 관리자 페이지에 직접 액세스
[Browser_navigate] http://localhost:3002/admin/dashboard
[Browser_wait_for] time: 2
```

**예상 결과**:
- 403 Forbidden 에러
- 또는 대시보드로 리다이렉트

**성공 기준**:
- ✅ 액세스 거부됨
- ✅ 적절한 에러 메시지 표시

---

#### 테스트 B: 비로그인 사용자가 회원 페이지 액세스

```bash
# 1. 로그아웃 상태에서 회원 페이지 액세스
[Browser_navigate] http://localhost:3002/member/dashboard
[Browser_wait_for] time: 2
```

**예상 결과**:
- 로그인 페이지로 리다이렉트

**성공 기준**:
- ✅ 로그인 페이지로 리다이렉트됨

---

### 6.2 데이터 에러

**목표**: 무효 데이터 입력 시 적절한 에러 처리

#### 테스트 C: 무효 견적 ID

```bash
# 1. 존재하지 않는 견적 ID로 액세스
[Browser_navigate] http://localhost:3002/admin/quotations/invalid-uuid
[Browser_wait_for] time: 2
```

**예상 결과**:
- 404 Not Found
- 또는 견적 목록으로 리다이렉트

**성공 기준**:
- ✅ 적절한 에러 처리
- ✅ 사용자 친화적 메시지

---

## 7. 성능 검증

### 7.1 페이지 로드 시간

**목표**: 대량 데이터 시 페이지 로드 성능 확인

#### 사전 데이터 생성

```sql
-- 테스트 데이터 생성 (100건 견적)
INSERT INTO quotations (user_id, quotation_number, customer_name, customer_email, status, total_amount, created_at)
SELECT
  NULL,
  'QT-' || (EXTRACT(EPOCH FROM NOW()) * 1000 + generate_series)::bigint,
  'テスト顧客' || generate_series,
  'guest' || generate_series || '@example.com',
  (ARRAY['draft', 'sent', 'approved'])[floor(random() * 3 + 1)],
  floor(random() * 1000000),
  NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 100);
```

#### 테스트

```bash
# 1. 관리자 견적 페이지 액세스
[Browser_navigate] http://localhost:3002/admin/quotations

# 2. 페이지 로드 시간 측정
# 브라우저 개발자 도구 Network 탭에서 확인
[Browser_wait_for] time: 5
```

**성공 기준**:
- ✅ 페이지 로드 시간: 3초 이내
- ✅ API 응답 시간: 1초 이내

---

### 7.2 API 응답 시간

| 엔드포인트 | 목표 시간 | 측정 방법 |
|-----------|----------|----------|
| GET /api/admin/quotations | < 1초 | Network 탭 |
| GET /api/member/dashboard/stats | < 500ms | Network 탭 |
| PATCH /api/admin/quotations/[id] | < 500ms | Network 탭 |

---

## 8. 보안 검증

### 8.1 SQL 인젝션 방지

**목표**: SQL 인젝션 공격 방지 확인

```bash
# 1. 견적 검색에서 악의적 입력 시도
[Browser_navigate] http://localhost:3002/admin/quotations
[Browser_type] element="검색" text="'; DROP TABLE quotations; --"]
[Browser_click] element="검색 버튼"]
[Browser_wait_for] time: 2
```

**성공 기준**:
- ✅ 에러 반환 또는 결과 0건
- ✅ 테이블 삭제 안 됨

---

### 8.2 CSRF 보호

**목표**: CSRF 토큰 검증 확인

```bash
# curl로 CSRF 토큰 없이 요청
curl -X POST http://localhost:3002/api/admin/quotations/123/approve \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

**성공 기준**:
- ✅ 403 Forbidden 또는 CSRF 에러

---

## 전체 성공 기준

### ✅ 오류 처리
- 권한 에러 정상 처리
- 데이터 에러 정상 처리
- 사용자 친화적 에러 메시지

### ✅ 성능
- 페이지 로드 3초 이내
- API 응답 1초 이내
- 대량 데이터 처리 가능

### ✅ 보안
- SQL 인젝션 방지
- CSRF 보호
- 권한 제어 작동

---

## 데이터베이스 정리

```sql
-- 테스트 데이터 삭제
DELETE FROM quotations
WHERE customer_email LIKE 'guest%@example.com';
```

---

## 다음 단계

모든 통합 테스트 완료 후:
- 각 시나리오 파일 검토
- 전체 시스템 검증 완료 확인
