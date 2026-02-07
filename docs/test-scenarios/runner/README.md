# EPAC 테스트 러너

Playwright MCP 기반 테스트 자동화 도구입니다.

## 🚨 중요: 실전 모드 테스트

이 테스트 러너는 **실전 환경(Production Mode)**에서 동작합니다.

- ❌ **DEV_MODE 사용하지 않음**
- ❌ **모 데이터(Mock Data) 사용하지 않음**
- ❌ **가상 인증 사용하지 않음**
- ✅ **실제 Supabase 데이터베이스 연결**
- ✅ **실제 인증 시스템 사용**
- ✅ **실제 API 호출 테스트**

테스트는 운영 환경과 동일하게 동작하며, 모든 기능이 실제로 작동하는지 검증합니다.

## 시작하기 전에

**중요**: 테스트를 실행하기 전에 [설정 가이드](SETUP.md)를 확인하여 환경 변수를 설정하세요.

```bash
# 1. .env 파일 생성
cp .env.example .env

# 2. Supabase 설정 추가
# .env 파일에 SUPABASE_URL, SUPABASE_SERVICE_KEY 등을 설정
```

## 구조

```
runner/
├── config/
│   └── test-config.ts       # 테스트 설정 (URL, 계정, 타임아웃)
├── reporters/
│   ├── markdown.ts          # 마크다운 리포터
│   └── summary.ts           # JSON/CSV/JUnit 리포터
├── database-verifier.ts     # 데이터베이스 검증기
├── playwright-executor.ts   # Playwright 명령 실행기
├── scenario-parser.ts       # 시나리오 파일 파서
├── index.ts                 # 메인 실행 스크립트
├── package.json
└── tsconfig.json
```

## 설치

```bash
cd runner
npm install
```

## 실행 방법

### 모든 시나리오 실행

```bash
npm test
# 또는
npm run test
```

### 카테고리별 실행

```bash
# 홈페이지 시나리오만
npm run test:homepage

# 회원 페이지 시나리오만
npm run test:member

# 관리자 페이지 시나리오만
npm run test:admin

# 통합 시나리오만
npm run test:integration
```

### 옵션

```bash
# 데이터베이스 검증 건너뛰기
npm run test:skip-db

# 스크린샷 캡처 건너뛰기
npm run test:no-screenshots
```

## 결과

테스트 결과는 `results/` 폴더에 저장됩니다:

- `SUMMARY.md` - 전체 요약 (마크다운)
- `summary.json` - 전체 요약 (JSON)
- `results.csv` - 결과 CSV
- `junit.xml` - JUnit 형식 (CI/CD 연동용)
- `{시나리오-key}.md` - 개별 시나리오 상세 리포트

## 설정

`config/test-config.ts`에서 설정을 수정하세요:

```typescript
export const config: TestConfig = {
  baseUrl: 'http://localhost:3006',      // 테스트 대상 URL
  screenshots: true,                      // 스크린샷 캡처 여부
  screenshotDir: './results/screenshots',
  accounts: {
    admin: {
      email: 'admin@example.com',        // 관리자 계정
      password: 'TestAdmin123!'
    },
    member: {
      email: 'member@test.com',          // 회원 계정
      password: 'Test1234!'
    }
  },
  timeouts: {
    navigation: 3000,                    // 내비게이션 대기 시간 (ms)
    action: 2000,                        // 액션 대기 시간 (ms)
    dbVerification: 1000                 // DB 검증 대기 시간 (ms)
  }
};
```

## 시나리오 작성

`.md` 파일에 시나리오를 작성하면 자동으로 파싱됩니다:

```markdown
# 시나리오 제목

**목표**: 테스트 목표 설명

**전제 조건**:
- 조건 1
- 조건 2

**테스트 단계**:

```bash
# 1. 페이지 이동
[Browser_navigate] http://localhost:3006/page

# 2. 클릭
[Browser_click] element="버튼 이름"

# 3. 입력
[Browser_type] element="입력란" text="입력값"

# 4. 대기
[Browser_wait_for] time: 3

# 5. 스크린샷
[Browser_snapshot]
```

**데이터베이스 검증**:

```sql
SELECT COUNT(*) FROM table_name WHERE condition = 'value';
```
```

## 데이터베이스 검증

테스트 러너는 시나리오에 포함된 SQL 쿼리를 실행하여 데이터베이스 상태를 검증합니다.

### 지원하는 검증 방법

1. **Supabase 클라이언트 메서드** (기본)
   - 간단한 SELECT, COUNT 쿼리
   - `client.from(table).select('*').eq('column', 'value')`

2. **SQL 자동 파싱** (Fallback)
   - 시나리오 SQL을 자동으로 클라이언트 메서드로 변환
   - `SELECT COUNT(*) FROM table` → `client.from(table).select('*', { count: 'exact' })`

3. **PostgreSQL 함수** (선택사항)
   - 복잡한 SQL 실행용
   - `execute_sql` 함수가 필요 (자세한 내용은 [SETUP.md](SETUP.md) 참조)

### 데이터베이스 검증 예시

```sql
-- 테이블 카운트
SELECT COUNT(*) FROM quotations;

-- 특정 레코드 조회
SELECT * FROM profiles WHERE email = 'test@example.com';

-- 상태별 카운트
SELECT status, COUNT(*) FROM quotations GROUP BY status;
```

## 지원하는 Playwright MCP 명령어

| 명령어 | 형식 | 설명 |
|--------|------|------|
| `Browser_navigate` | `[Browser_navigate] URL` | 페이지 이동 |
| `Browser_click` | `[Browser_click] element="이름"` | 요소 클릭 |
| `Browser_type` | `[Browser_type] element="이름" text="값"` | 텍스트 입력 |
| `Browser_wait_for` | `[Browser_wait_for] time: 초` | 대기 |
| `Browser_snapshot` | `[Browser_snapshot]` | 스크린샷 캡처 |
| `Browser_verify_text_visible` | `[Browser_verify_text_visible] text="값"` | 텍스트 확인 |

## 데이터베이스 조작 기능

테스트 러너는 데이터베이스 조회뿐만 아니라 **데이터 수정(INSERT/UPDATE/DELETE)**도 지원합니다.

### 지원하는 SQL 명령어

| 명령어 | 용도 | 예시 |
|--------|------|------|
| `SELECT` | 데이터 조회 | `SELECT COUNT(*) FROM quotations;` |
| `INSERT` | 데이터 생성 | `INSERT INTO profiles (...) VALUES (...);` |
| `UPDATE` | 데이터 수정 | `UPDATE profiles SET status = 'ACTIVE' WHERE ...;` |
| `DELETE` | 데이터 삭제 | `DELETE FROM profiles WHERE email = 'test@example.com';` |

### 데이터베이스 수정 예시

```markdown
# 시나리오 파일에서

**데이터베이스 수정 (테스트용)**:

```sql
-- 회원 승인 처리
UPDATE profiles
SET status = 'ACTIVE',
    updated_at = NOW()
WHERE email = 'newmember@test.com';
```

**테스트 정리**:

```sql
-- 테스트 데이터 삭제
DELETE FROM profiles
WHERE email = 'newmember@test.com';
```
```

### SQL 파싱 규칙

테스트 러너는 다음과 같은 간단한 SQL 문법을 자동으로 Supabase 클라이언트 메서드로 변환합니다:

**INSERT**:
```sql
-- SQL
INSERT INTO profiles (email, status) VALUES ('test@test.com', 'ACTIVE');

-- 자동 변환됨
client.from('profiles').insert({ email: 'test@test.com', status: 'ACTIVE' })
```

**UPDATE**:
```sql
-- SQL
UPDATE profiles SET status = 'ACTIVE' WHERE email = 'test@test.com';

-- 자동 변환됨
client.from('profiles').update({ status: 'ACTIVE' }).eq('email', 'test@test.com')
```

**DELETE**:
```sql
-- SQL
DELETE FROM profiles WHERE email = 'test@test.com';

-- 자동 변환됨
client.from('profiles').delete().eq('email', 'test@test.com')
```

> **주의**: 복잡한 SQL(JOIN, 서브쿼리 등)은 PostgreSQL 함수(`execute_sql`)가 필요합니다.

## 상호 검증

관리자 액션 → 회원 페이지 반영을 검증하려면:

**admin/coupons.md**:
```markdown
### 스텝 1: 관리자가 쿠폰 생성
[Browser_navigate] http://localhost:3006/admin/coupons
[Browser_type] element="쿠폰 코드" text="SALE2025"]
[Browser_click] element="저장 버튼"]
```

**member/profile.md**:
```markdown
### 스텝 2: 회원이 쿠폰 확인
[Browser_navigate] http://localhost:3006/member/profile
[Browser_verify_text_visible] text="SALE2025"]
```
