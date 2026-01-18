# Supabase MCP Tools - Complete Documentation (25개 완전 목록)

**작성일**: 2026-01-06
**프로젝트**: Epackage Lab
**Project Ref**: `ijlgpzjdfipzmjvawofp`

---

## 목차

1. [데이터베이스 코어 (5개)](#1-데이터베이스-코어-5개)
2. [성능 & 보안 (2개)](#2-성능--보안-2개)
3. [Edge Functions (4개)](#3-edge-functions-4개)
4. [프로젝트 설정 (2개)](#4-프로젝트-설정-2개)
5. [브랜치 관리 (7개)](#5-브랜치-관리-7개)
6. [문서 검색 (1개)](#6-문서-검색-1개)
7. [상세 사용법](#상세-사용법)
8. [활용 시나리오](#활용-시나리오)

---

## 1. 데이터베이스 코어 (5개)

### `mcp__supabase-epackage__execute_sql`
**설명**: SQL 직접 실행
**파라미터**:
- `query` (string, 필수): 실행할 SQL 쿼리

**사용 예시**:
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

---

### `mcp__supabase-epackage__apply_migration`
**설명**: DDL 마이그레이션 적용 (테이블/인덱스/제약조건 생성)
**파라미터**:
- `name` (string, 필수): 마이그레이션 이름 (snake_case)
- `query` (string, 필수): 실행할 DDL SQL

**사용 예시**:
```typescript
// 새로운 컬럼 추가
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

---

### `mcp__supabase-epackage__list_tables`
**설명**: 테이블 목록 조회
**파라미터**:
- `schemas` (array, 옵션): 조회할 스키마 목록 (기본값: `['public']`)

**사용 예시**:
```typescript
// public 스키마 테이블 확인
const tables = await listTables({ schemas: ['public'] });
// Returns: ['profiles', 'orders', 'quotations', 'contracts', ...]

// 여러 스키마 확인
const allTables = await listTables({
  schemas: ['public', 'auth', 'storage']
});
```

---

### `mcp__supabase-epackage__list_migrations`
**설명**: 마이그레이션 내역 확인
**파라미터**: 없음

**사용 예시**:
```typescript
// 적용된 모든 마이그레이션 표시
const migrations = await listMigrations();
// Returns: [
//   { version: '20240101_init', name: 'Initial schema', applied_at: '2024-01-01T00:00:00Z' },
//   { version: '20240102_add_users', name: 'Add users table', applied_at: '2024-01-02T00:00:00Z' },
//   ...
// ]
```

---

### `mcp__supabase-epackage__list_extensions`
**설명**: DB 확장 프로그램 목록
**파라미터**: 없음

**사용 예시**:
```typescript
// 설치된 확장 프로그램 확인
const extensions = await listExtensions();
// Returns: [
//   { name: 'uuid-ossp', version: '1.1', installed: true },
//   { name: 'pgcrypto', version: '1.3', installed: true },
//   { name: 'postgis', version: '3.3', installed: false },
//   ...
// ]
```

---

## 2. 성능 & 보안 (2개)

### `mcp__supabase-epackage__get_advisors`
**설명**: 성능/보안 권고사항 (누락된 RLS 정책, 인덱스 권고)
**파라미터**:
- `type` ('security' | 'performance', 필수): 권고 유형

**사용 예시**:
```typescript
// 보안 권고사항 확인
const securityAdvisors = await getAdvisors({ type: 'security' });
// Returns: [
//   {
//     type: 'missing_rls',
//     table: 'contracts',
//     recommendation: 'Enable RLS and add policies for user isolation'
//   },
//   ...
// ]

// 성능 권고사항 확인
const performanceAdvisors = await getAdvisors({ type: 'performance' });
// Returns: [
//   {
//     type: 'missing_index',
//     table: 'orders',
//     column: 'user_id',
//     recommendation: 'Create index on orders(user_id)'
//   },
//   ...
// ]
```

---

### `mcp__supabase-epackage__generate_typescript_types`
**설명**: DB 스키마에서 TypeScript 타입 자동 생성
**파라미터**: 없음

**사용 예시**:
```typescript
// 자동 타입 생성
const types = await generateTypescriptTypes();
// Returns: Database 타입 정의 (전체 TypeScript 코드)

// src/types/database.ts에 저장
fs.writeFileSync(
  'src/types/database.ts',
  types,
  'utf-8'
);

// 이후 Supabase 쿼리에 타입 자동 완성
const { data } = await supabase
  .from('profiles')
  .select('*')
  .single();
// data 타입: Database['public']['Tables']['profiles']['Row']
```

---

## 3. Edge Functions (4개)

### `mcp__supabase-epackage__deploy_edge_function`
**설명**: Edge Function 배포/업데이트
**파라미터**:
- `name` (string, 필수): 함수 이름
- `files` (array, 필수): 함수 파일 목록
  - `name` (string): 파일 이름
  - `content` (string): 파일 내용
- `verify_jwt` (boolean, 옵션): JWT 검증 여부 (기본값: `true`)

**사용 예시**:
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

---

### `mcp__supabase-epackage__list_edge_functions`
**설명**: 배포된 Edge Functions 목록
**파라미터**: 없음

**사용 예시**:
```typescript
// 현재 배포된 함수 확인
const functions = await listEdgeFunctions();
// Returns: [
//   { name: 'hello-world', status: 'active', domain: 'xxx.supabase.co' },
//   { name: 'get-user-stats', status: 'active', domain: 'xxx.supabase.co' },
//   ...
// ]
```

---

### `mcp__supabase-epackage__get_edge_function`
**설명**: Edge Function 소스 코드 조회
**파라미터**:
- `function_slug` (string, 필수): 함수 이름

**사용 예시**:
```typescript
// 함수 코드 읽기
const code = await getEdgeFunction({ function_slug: 'hello-world' });
// Returns: {
//   name: 'hello-world',
//   files: [
//     { name: 'index.ts', content: '...' }
//   ]
// }
```

---

### `mcp__supabase-epackage__get_logs`
**설명**: 서비스 로그 조회 (최근 24시간)
**파라미터**:
- `service` ('api' | 'postgres' | 'edge-function' | 'auth' | 'storage' | 'realtime' | 'branch-action', 필수): 서비스 유형

**사용 예시**:
```typescript
// API 로그 (에러 추적, 요청 분석)
const apiLogs = await getLogs({ service: 'api' });

// Postgres 로그 (쿼리 성능, 잠금 확인)
const dbLogs = await getLogs({ service: 'postgres' });

// Edge Function 로그 (함수 실행 로그)
const functionLogs = await getLogs({ service: 'edge-function' });

// Auth 로그 (인증 이슈 추적)
const authLogs = await getLogs({ service: 'auth' });
```

---

## 4. 프로젝트 설정 (2개)

### `mcp__supabase-epackage__get_project_url`
**설명**: 프로젝트 API URL 획득
**파라미터**: 없음

**사용 예시**:
```typescript
// 프로젝트 URL 확인
const url = await getProjectUrl();
// Returns: 'https://ijlgpzjdfipzmjvawofp.supabase.co'

// 환경 변수 설정
process.env.NEXT_PUBLIC_SUPABASE_URL = url;
```

---

### `mcp__supabase-epackage__get_publishable_keys`
**설명**: 모든 퍼블릭 API 키 획득
**파라미터**: 없음

**사용 예시**:
```typescript
// API 키 확인
const keys = await getPublishableKeys();
// Returns: [
//   {
//     name: 'anon key',
//     key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//     disabled: false
//   },
//   {
//     name: 'publishable key',
//     key: 'sb_publishable_...',
//     disabled: false
//   },
//   ...
// ]
```

---

## 5. 브랜치 관리 (7개)

### `mcp__supabase-epackage__create_branch`
**설명**: 개발 브랜치 생성 (독립된 DB 환경)
**파라미터**:
- `name` (string, 옵션): 브랜치 이름 (기본값: `develop`)
- `confirm_cost_id` (string, 필수): 비용 확인 ID

**사용 예시**:
```typescript
// 1단계: 비용 확인
const costId = await confirmCost({ /* ... */ });

// 2단계: 브랜치 생성
const branch = await createBranch({
  name: 'feature-admin-panel',
  confirm_cost_id: costId
});
// Returns: {
//   id: 'branch-xxx',
//   name: 'feature-admin-panel',
//   project_ref: 'ijlgpzjdfipzmjvawofp',
//   status: 'created'
// }
```

---

### `mcp__supabase-epackage__list_branches`
**설명**: 모든 브랜치 목록 조회
**파라미터**: 없음

**사용 예시**:
```typescript
// 브랜치 상태/ID 확인
const branches = await listBranches();
// Returns: [
//   { id: 'branch-1', name: 'develop', status: 'active' },
//   { id: 'branch-2', name: 'feature-x', status: 'active' },
//   ...
// ]
```

---

### `mcp__supabase-epackage__merge_branch`
**설명**: 브랜치를 프로덕션에 병합
**파라미터**:
- `branch_id` (string, 필수): 브랜치 ID

**사용 예시**:
```typescript
// 개발 완료 후 배포
await mergeBranch({ branch_id: 'branch-xxx' });
// Returns: { status: 'merged', message: 'Branch successfully merged' }
```

---

### `mcp__supabase-epackage__reset_branch`
**설명**: 브랜치를 특정 마이그레이션으로 리셋
**파라미터**:
- `branch_id` (string, 필수): 브랜치 ID
- `migration_version` (string, 옵션): 리셋할 마이그레이션 버전

**사용 예시**:
```typescript
// 작업 내역 초기화
await resetBranch({
  branch_id: 'branch-xxx',
  migration_version: '20240101_init'
});
// Returns: { status: 'reset', message: 'Branch reset to migration version' }
```

---

### `mcp__supabase-epackage__delete_branch`
**설명**: 개발 브랜치 삭제
**파라미터**:
- `branch_id` (string, 필수): 브랜치 ID

**사용 예시**:
```typescript
// 정리 후 삭제
await deleteBranch({ branch_id: 'branch-xxx' });
// Returns: { status: 'deleted', message: 'Branch successfully deleted' }
```

---

### `mcp__supabase-epackage__rebase_branch`
**설명**: 프로덕션 기준 브랜치 리베이스 (최신 프로덕션 변경사항 반영)
**파라미터**:
- `branch_id` (string, 필수): 브랜치 ID

**사용 예시**:
```typescript
// 최신 프로덕션 변경사항 반영
await rebaseBranch({ branch_id: 'branch-xxx' });
// Returns: { status: 'rebased', message: 'Branch successfully rebased' }
```

---

## 6. 문서 검색 (1개)

### `mcp__supabase-epackage__search_docs`
**설명**: Supabase 공식 문서 GraphQL 검색 (RLS, Auth, Storage 등 공식 가이드)
**파라미터**:
- `graphql_query` (string, 필수): GraphQL 쿼리

**사용 예시**:
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

// 특정 주제 검색
const storageDocs = await searchDocs({
  graphql_query: `
    query {
      searchDocs(query: "storage bucket policy", limit: 3) {
        nodes {
          title
          href
          content
        }
      }
    }
  `
});
```

---

## 상세 사용법

### 시나리오 1: 콘솔 에러 해결

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

---

### 시나리오 2: 신규 기능 배포

```typescript
// 1. 개발 브랜치 생성
const costId = await confirmCost({ /* ... */ });
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

// 4. 테스트 후 프로덕션에 병합
await mergeBranch({ branch_id: branch.id });
```

---

### 시나리오 3: 성능 최적화

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

// 3. 쿼리 로그 확인 (느린 쿼리 분석 후 최적화)
const slowQueries = await getLogs({ service: 'postgres' });

// 4. TypeScript 타입 업데이트
const types = await generateTypescriptTypes();
fs.writeFileSync('src/types/database.ts', types, 'utf-8');
```

---

## 활용 시나리오

### 1. 데이터베이스 스키마 감사

```typescript
async function auditDatabase() {
  // 모든 테이블 확인
  const tables = await listTables({ schemas: ['public'] });

  // 각 테이블의 RLS 상태 확인
  for (const table of tables) {
    const rlsStatus = await executeSQL(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = '${table}'
    `);

    if (!rlsStatus.relrowsecurity) {
      console.warn(`⚠️ Table ${table} does not have RLS enabled`);
    }
  }

  // 보안 권고사항 확인
  const advisors = await getAdvisors({ type: 'security' });
  console.log('Security Recommendations:', advisors);
}
```

---

### 2. 마이그레이션 관리

```typescript
async function manageMigrations() {
  // 적용된 마이그레이션 확인
  const migrations = await listMigrations();
  console.log('Applied migrations:', migrations.map(m => m.version));

  // 새로운 마이그레이션 적용
  await applyMigration({
    name: 'add_index_orders_user_id',
    query: `
      CREATE INDEX IF NOT EXISTS idx_orders_user_id_created
      ON orders(user_id, created_at DESC);
    `
  });
}
```

---

### 3. 개발 브랜치 워크플로우

```typescript
async function featureBranchWorkflow() {
  // 1. 브랜치 생성
  const branch = await createBranch({
    name: 'feature-x',
    confirm_cost_id: costId
  });

  // 2. 작업 수행
  await executeSQL(`
    CREATE TABLE feature_x_table (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL
    );
  `, { branchId: branch.id });

  // 3. 테스트
  await deployEdgeFunction({
    name: 'test-feature-x',
    verify_jwt: false,
    files: [{ /* ... */ }]
  }, { branchId: branch.id });

  // 4. 리뷰 후 병합 또는 삭제
  const shouldMerge = await reviewBranch(branch.id);
  if (shouldMerge) {
    await mergeBranch({ branch_id: branch.id });
  } else {
    await deleteBranch({ branch_id: branch.id });
  }
}
```

---

## 요약 표

| 도구 | 카테고리 | 주요 용도 |
|-----|---------|----------|
| `execute_sql` | DB 코어 | SQL 직접 실행 |
| `apply_migration` | DB 코어 | DDL 마이그레이션 |
| `list_tables` | DB 코어 | 테이블 목록 조회 |
| `list_migrations` | DB 코어 | 마이그레이션 내역 |
| `list_extensions` | DB 코어 | 확장 프로그램 확인 |
| `get_advisors` | 성능/보안 | 권고사항 조회 |
| `generate_typescript_types` | 성능/보안 | TypeScript 타입 생성 |
| `deploy_edge_function` | Edge Functions | 함수 배포 |
| `list_edge_functions` | Edge Functions | 함수 목록 |
| `get_edge_function` | Edge Functions | 함수 코드 조회 |
| `get_logs` | Edge Functions | 로그 조회 |
| `get_project_url` | 프로젝트 | API URL 획득 |
| `get_publishable_keys` | 프로젝트 | API 키 획득 |
| `create_branch` | 브랜치 | 브랜치 생성 |
| `list_branches` | 브랜치 | 브랜치 목록 |
| `merge_branch` | 브랜치 | 브랜치 병합 |
| `reset_branch` | 브랜치 | 브랜치 리셋 |
| `delete_branch` | 브랜치 | 브랜치 삭제 |
| `rebase_branch` | 브랜치 | 브랜치 리베이스 |
| `search_docs` | 문서 | 공식 문서 검색 |

---

**문서 버전**: 1.0
**마지막 업데이트**: 2026-01-06
**다음 리뷰**: Supabase MCP 업데이트 시
