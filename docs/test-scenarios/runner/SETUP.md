# 테스트 러너 설정 가이드

## 🚨 실전 모드 테스트

이 테스트 러너는 **실전 환경(Production Mode)**에서만 동작합니다.

### 실전 모드 특징

| 항목 | 실전 모드 | 개발 모드 (사용 안 함) |
|------|---------|---------------------|
| 인증 | 실제 Supabase Auth | 가상 인증 ❌ |
| 데이터베이스 | 실제 Supabase DB | 모 데이터 ❌ |
| API | 실제 API 호출 | 목업 ❌ |
| 환경 변수 | 필수 설정 | 선택적 ❌ |

### 테스트 전 필수 확인사항

- [ ] `.env` 파일에 실제 Supabase 연결 정보 설정
- [ ] 테스트 계정이 데이터베이스에 존재 (admin@example.com, member@test.com)
- [ ] 로컬 개발 서버 실행 중 (`npm run dev`)
- [ ] Supabase 프로젝트 활성화

---

## 환경 변수 설정

테스트 러너를 실행하기 전에 `.env` 파일에 다음 환경 변수를 설정해야 합니다.

```bash
# Supabase 설정
SUPABASE_URL=https://ijlgpzjdfipzmjvawofp.supabase.co
SUPABASE_PROJECT_ID=ijlgpzjdfipzmjvawofp
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

### 환경 변수 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard

2. **프로젝트 선택**
   - EPAC Homepage 프로젝트

3. **Settings → API**
   - Project URL → `SUPABASE_URL`
   - Project Reference → `SUPABASE_PROJECT_ID`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY` (권한 필요!)

4. **.env 파일 생성**
   ```bash
   cd docs/test-scenarios/runner
   cp .env.example .env
   # .env 파일에 위에서 복사한 값들 붙여넣기
   ```

## Supabase MCP 설정 (선택사항)

Supabase MCP 도구를 직접 사용하려면 Claude 설정에 MCP 서버를 추가해야 합니다.

**Claude Desktop 설정 파일 (`claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-supabase-access-token"
      }
    }
  }
}
```

### Supabase Access Token 가져오기

1. Supabase 대시보드에서 **Account Settings** → **Access Tokens**
2. 새 토큰 생성
3. 토큰을 복사하여 MCP 설정에 추가

## 테스트 계정 설정

`config/test-config.ts`에 정의된 테스트 계정이 데이터베이스에 존재해야 합니다.

### 테스트용 관리자 계정 생성

```sql
-- profiles 테이블에 관리자 계정 삽입
INSERT INTO profiles (id, email, role, status, company_name, created_at, updated_at)
VALUES (
  'admin-test-uuid',
  'admin@example.com',
  'ADMIN',
  'ACTIVE',
  'EPAC Test Admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

### 테스트용 회원 계정 생성

```sql
-- profiles 테이블에 회원 계정 삽입
INSERT INTO profiles (id, email, role, status, company_name, representative_name, phone_number, created_at, updated_at)
VALUES (
  'member-test-uuid',
  'member@test.com',
  'MEMBER',
  'ACTIVE',
  '테스트 주식회사',
  '테스트 담당자',
  '03-1234-5678',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

## 데이터베이스 검증 방법

테스트 러너는 3가지 방법으로 데이터베이스를 검증합니다:

### 1. Supabase 클라이언트 메서드 (기본)

간단한 조회에 사용됩니다:

```typescript
// 테이블 카운트
await client.from('quotations').select('*', { count: 'exact', head: true });

// 특정 레코드 조회
await client.from('profiles').select('*').eq('email', 'test@example.com').single();
```

### 2. SQL 파싱 (Fallback)

시나리오 파일의 SQL 쿼리를 자동으로 Supabase 클라이언트 메서드로 변환:

```sql
-- 시나리오 SQL
SELECT COUNT(*) FROM quotations;

-- 자동 변환됨
client.from('quotations').select('*', { count: 'exact', head: true });
```

### 3. REST API 직접 호출 (복잡한 쿼리)

PostgreSQL 함수를 통한 SQL 실행 (별도 설정 필요):

```typescript
POST https://ijlgpzjdfipzmjvawofp.supabase.co/rest/v1/rpc/execute_sql
{
  "query": "SELECT * FROM quotations WHERE status = 'approved'"
}
```

## PostgreSQL 함수 설정 (선택사항)

복잡한 SQL 쿼리를 실행하려면 PostgreSQL 함수를 미리 생성해야 합니다:

```sql
-- 임의 SQL 실행 함수 (관리자 전용)
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS SETOF record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query_text;
END;
$$;

-- 권한 설정
GRANT EXECUTE ON FUNCTION execute_sql TO postgres;
GRANT EXECUTE ON FUNCTION execute_sql TO service_role;
```

**함수 생성 방법:**

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref ijlgpzjdfipzmjvawofp

# 함수 생성 스크립트 실행
supabase db push scripts/create-sql-function.sql
```

## 테스트 실행 전 확인사항

- [ ] `.env` 파일에 Supabase 환경 변수 설정
- [ ] `SUPABASE_SERVICE_KEY`가 올바른지 확인
- [ ] 테스트 계정 (admin/member)이 데이터베이스에 존재
- [ ] 필요한 PostgreSQL 함수가 생성되어 있음 (선택)
- [ ] 로컬 개발 서버가 실행 중 (`npm run dev`)
