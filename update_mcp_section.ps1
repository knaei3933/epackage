# PowerShell script to update MCP tools section in url.md

$filePath = "c:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\docs\reports\url.md"
$content = Get-Content $filePath -Raw

# Define the old section (what we're replacing)
$oldSection = @'
### 사용 가능한 MCP 도구

| 도구 | 설명 | 사용 예시 |
|-----|------|----------|
| `mcp__supabase-epackage__execute_sql` | SQL 직접 실행 | `SELECT * FROM profiles` |
| `mcp__supabase-epackage__apply_migration` | 마이그레이션 적용 | 테이블/인덱스 생성 |
| `mcp__supabase-epackage__list_tables` | 테이블 목록 조회 | 현재 테이블 확인 |
| `mcp__supabase-epackage__list_migrations` | 마이그레이션 내역 | 적용된 마이그레이션 확인 |
| `mcp__supabase-epackage__get_advisors` | 성능/보안 권고 | 인덱스/RLS 권고사항 |

### 데이터베이스 설정 방법
'@

# Define the new section (with complete MCP tools documentation)
$newSection = @'
### 사용 가능한 MCP 도구 (25개 완전 목록)

#### 🗄️ 데이터베이스 코어 (5개)

| 도구 | 설명 | 파라미터 | 사용 예시 |
|-----|------|---------|----------|
| `mcp__supabase-epackage__execute_sql` | SQL 직접 실행 | `query` (string) | `SELECT * FROM profiles WHERE status = 'ACTIVE'` |
| `mcp__supabase-epackage__apply_migration` | DDL 마이그레이션 적용 | `name`, `query` | 테이블/인덱스/제약조건 생성 |
| `mcp__supabase-epackage__list_tables` | 테이블 목록 조회 | `schemas` (array) | `['public']` 스키마 테이블 확인 |
| `mcp__supabase-epackage__list_migrations` | 마이그레이션 내역 확인 | 없음 | 적용된 모든 마이그레이션 표시 |
| `mcp__supabase-epackage__list_extensions` | DB 확장 프로그램 목록 | 없음 | `uuid-ossp`, `pgcrypto` 등 확인 |

#### 🔍 성능 & 보안 (2개)

| 도구 | 설명 | 파라미터 | 사용 예시 |
|-----|------|---------|----------|
| `mcp__supabase-epackage__get_advisors` | 성능/보안 권고사항 | `type` ('security'\|'performance') | 누락된 RLS 정책, 인덱스 권고 |
| `mcp__supabase-epackage__generate_typescript_types` | DB 스키마에서 TypeScript 타입 생성 | 없음 | `types/database.ts` 자동 생성 |

#### ⚡ Edge Functions (4개)

| 도구 | 설명 | 파라미터 | 사용 예시 |
|-----|------|---------|----------|
| `mcp__supabase-epackage__deploy_edge_function` | Edge Function 배포/업데이트 | `name`, `files`, `verify_jwt` | Deno 서버리스 함수 배포 |
| `mcp__supabase-epackage__list_edge_functions` | 배포된 Edge Functions 목록 | 없음 | 현재 배포된 함수 확인 |
| `mcp__supabase-epackage__get_edge_function` | Edge Function 소스 코드 조회 | `function_slug` | 함수 코드 읽기 |
| `mcp__supabase-epackage__get_logs` | 서비스 로그 조회 | `service` ('api'\|'postgres'\|'edge-function' 등) | 최근 24시간 로그 확인 |

#### 🔑 프로젝트 설정 (2개)

| 도구 | 설명 | 파라미터 | 사용 예시 |
|-----|------|---------|----------|
| `mcp__supabase-epackage__get_project_url` | 프로젝트 API URL 획득 | 없음 | `https://ijlgpzjdfipzmjvawofp.supabase.co` |
| `mcp__supabase-epackage__get_publishable_keys` | 모든 퍼블릭 API 키 획득 | 없음 | anon key, publishable key 확인 |

#### 🌿 브랜치 관리 (7개)

| 도구 | 설명 | 파라미터 | 사용 예시 |
|-----|------|---------|----------|
| `mcp__supabase-epackage__create_branch` | 개발 브랜치 생성 | `name`, `confirm_cost_id` | `develop` 브랜치 생성 (비용 확인 필요) |
| `mcp__supabase-epackage__list_branches` | 모든 브랜치 목록 조회 | 없음 | 브랜치 상태/ID 확인 |
| `mcp__supabase-epackage__merge_branch` | 브랜치를 프로덕션에 병합 | `branch_id` | 개발 완료 후 배포 |
| `mcp__supabase-epackage__reset_branch` | 브랜치를 특정 마이그레이션으로 리셋 | `branch_id`, `migration_version` | 작업 내역 초기화 |
| `mcp__supabase-epackage__delete_branch` | 개발 브랜치 삭제 | `branch_id` | 정리 후 삭제 |
| `mcp__supabase-epackage__rebase_branch` | 프로덕션 기준 브랜치 리베이스 | `branch_id` | 최신 프로덕션 변경사항 반영 |

#### 📚 문서 검색 (1개)

| 도구 | 설명 | 파라미터 | 사용 예시 |
|-----|------|---------|----------|
| `mcp__supabase-epackage__search_docs` | Supabase 공식 문서 GraphQL 검색 | `graphql_query` | RLS, Auth, Storage 등 공식 가이드 검색 |

---

### MCP 도구별 상세 사용법

#### 1. SQL 직접 실행 (execute_sql)
```typescript
// 간단한 SELECT
const result = await executeSQL(`
  SELECT id, email, role, status
  FROM profiles
  WHERE status = 'ACTIVE'
  LIMIT 10
`);

// 데이터 수정
await executeSQL(`
  UPDATE profiles
  SET status = 'SUSPENDED'
  WHERE id = 'user-uuid'
`);

// 복잡한 JOIN
const stats = await executeSQL(`
  SELECT
    o.status,
    COUNT(*) as count,
    SUM(o.total_amount) as total
  FROM orders o
  JOIN profiles p ON o.user_id = p.id
  WHERE p.status = 'ACTIVE'
  GROUP BY o.status
`);
```

#### 2. 마이그레이션 적용 (apply_migration)
```typescript
// 새로운 테이블 생성
await applyMigration({
  name: 'add_user_id_to_contracts',
  query: `
    ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);

    CREATE INDEX IF NOT EXISTS idx_contracts_user_id
    ON contracts(user_id);

    COMMENT ON COLUMN contracts.user_id IS 'User ID who owns the contract';
  `
});

// RLS 정책 추가
await applyMigration({
  name: 'add_contracts_rls',
  query: `
    ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own contracts"
    ON contracts FOR SELECT
    USING (user_id = auth.uid());

    CREATE POLICY "Admins can view all contracts"
    ON contracts FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
      )
    );
  `
});
```

#### 3. 테이블 목록 조회 (list_tables)
```typescript
// public 스키마 테이블 확인
const tables = await listTables({ schemas: ['public'] });
// Returns: ['profiles', 'orders', 'quotations', 'contracts', ...]

// 여러 스키마 확인
const allTables = await listTables({
  schemas: ['public', 'auth', 'storage']
});
```

#### 4. Edge Function 배포 (deploy_edge_function)
```typescript
// 간단한 Edge Function
await deployEdgeFunction({
  name: 'hello-world',
  verify_jwt: true,
  files: [{
    name: 'index.ts',
    content: `
      import "jsr:@supabase/functions-js/edge-runtime.d.ts";

      Deno.serve(async (req: Request) => {
        const data = { message: "Hello from Epackage!" };
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
      });
    `
  }]
});

// 데이터베이스 연결 Function
await deployEdgeFunction({
  name: 'get-user-stats',
  verify_jwt: true,
  files: [{
    name: 'index.ts',
    content: `
      import { createClient } from 'jsr:@supabase/supabase-js@2';
      import "jsr:@supabase/functions-js/edge-runtime.d.ts";

      Deno.serve(async (req: Request) => {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!
        );

        const { data: { user } } = await supabase.auth.getUser();

        const { data } = await supabase
          .from('orders')
          .select('count')
          .eq('user_id', user.id);

        return Response.json({ count: data });
      });
    `
  }]
});
```

#### 5. 로그 조회 (get_logs)
```typescript
// API 로그 (최근 24시간)
const apiLogs = await getLogs({ service: 'api' });
// 에러 추적, 요청 분석

// Postgres 로그
const dbLogs = await getLogs({ service: 'postgres' });
// 쿼리 성능, 잠금 확인

// Edge Function 로그
const functionLogs = await getLogs({ service: 'edge-function' });
// 함수 실행 로그
```

#### 6. 개발 브랜치 생성 (create_branch)
```typescript
// 1단계: 비용 확인
const costId = await confirmCost({ /* ... */ });

// 2단계: 브랜치 생성
const branch = await createBranch({
  name: 'feature-admin-panel',
  confirm_cost_id: costId
});
// Returns: branch_id, project_ref (독립된 DB 환경)

// 3단계: 브랜치에서 작업
await executeSQL(`
  INSERT INTO profiles (id, email, role)
  VALUES ('test-uuid', 'test@example.com', 'ADMIN');
`, { branchId: branch.id });

// 4단계: 완료 후 병합 또는 삭제
await mergeBranch({ branch_id: branch.id });
// 또는
await deleteBranch({ branch_id: branch.id });
```

#### 7. TypeScript 타입 생성 (generate_typescript_types)
```typescript
// 자동 타입 생성
const types = await generateTypescriptTypes();
// Returns: Database 타입 정의

// src/types/database.ts에 저장
// 이후 Supabase 쿼리에 타입 자동 완성
const { data } = await supabase
  .from('profiles')
  .select('*')
  .single();
// data 타입: Database['public']['Tables']['profiles']['Row']
```

#### 8. 문서 검색 (search_docs)
```typescript
// RLS 관련 공식 문서 검색
const rlsDocs = await searchDocs({
  graphql_query: `
    query {
      searchDocs(query: "Row Level Security", limit: 5) {
        nodes {
          title
          href
          content
        }
      }
    }
  `
});

// Auth 가이드 검색
const authDocs = await searchDocs({
  graphql_query: `
    query {
      searchDocs(query: "authentication nextjs", limit: 10) {
        nodes {
          title
          href
          subsections {
            nodes {
              title
              href
            }
          }
        }
      }
    }
  `
});
```

---

### MCP 도구 활용 시나리오

#### 시나리오 1: 콘솔 에러 해결
```typescript
// 1. 현재 스키마 확인
const tables = await listTables({ schemas: ['public'] });
console.log('Tables:', tables);

// 2. contracts 테이블 구조 확인
const structure = await executeSQL(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'contracts'
`);

// 3. 누락된 컬럼 추가
if (!structure.find(c => c.column_name === 'user_id')) {
  await applyMigration({
    name: 'fix_contracts_user_id',
    query: `
      ALTER TABLE contracts
      ADD COLUMN user_id UUID REFERENCES profiles(id);

      CREATE INDEX idx_contracts_user_id ON contracts(user_id);
    `
  });
}

// 4. RLS 정책 확인
const advisors = await getAdvisors({ type: 'security' });
console.log('Security recommendations:', advisors);
```

#### 시나리오 2: 신규 기능 배포
```typescript
// 1. 개발 브랜치 생성
const branch = await createBranch({
  name: 'feature-notification-system',
  confirm_cost_id: costId
});

// 2. 새로운 테이블 생성
await applyMigration({
  name: 'create_notifications_table',
  query: `
    CREATE TABLE notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES profiles(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
  `
}, { branchId: branch.id });

// 3. Edge Function 배포
await deployEdgeFunction({
  name: 'send-notification',
  verify_jwt: true,
  files: [{
    name: 'index.ts',
    content: notificationFunctionCode
  }]
}, { branchId: branch.id });

// 4. 프로덕션에 병합
await mergeBranch({ branch_id: branch.id });
```

#### 시나리오 3: 성능 최적화
```typescript
// 1. 성능 권고사항 확인
const advisors = await getAdvisors({ type: 'performance' });

// 2. 누락된 인덱스 추가
for (const advisor of advisors) {
  if (advisor.type === 'missing_index') {
    await applyMigration({
      name: `add_index_${advisor.table}_${advisor.column}`,
      query: `
        CREATE INDEX IF NOT EXISTS idx_${advisor.table}_${advisor.column}
        ON ${advisor.table}(${advisor.column});
      `
    });
  }
}

// 3. 쿼리 로그 확인
const slowQueries = await getLogs({ service: 'postgres' });
// 느린 쿼리 분석 후 최적화
```

---

### 데이터베이스 설정 방법
'@

# Replace old section with new section
$updatedContent = $content -replace [regex]::Escape($oldSection), $newSection

# Write updated content back to file
$updatedContent | Set-Content $filePath -NoNewline -Encoding UTF8

Write-Host "Successfully updated MCP tools section in url.md"
