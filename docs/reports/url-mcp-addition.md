# MCP 도구 섹션 추가를 위한 텍스트

## url.md 파일에 추가할 내용

```
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

**📖 상세 문서**: [`SUPABASE_MCP_TOOLS_COMPLETE.md`](./SUPABASE_MCP_TOOLS_COMPLETE.md)에서 모든 도구의 상세 사용법과 예제를 확인하세요.
```

---

## 추가 방법

### 방법 1: 수동으로 url.md에 복사/붙여넣기

1. `url.md` 파일 열기
2. "### 사용 가능한 MCP 도구" 섹션 찾기
3. 기존 5개 도구 표를 위의 완전 목록으로 교체
4. "### 데이터베이스 설정 방법" 섹션 바로 위에 추가

### 방법 2: PowerShell 스크립트 사용

이미 생성된 `update_mcp_section.ps1` 스크립트를 실행하면 자동으로 업데이트됩니다.

### 방법 3: VS Code에서 수동 편집

1. VS Code로 url.md 열기
2. Ctrl+F (또는 Cmd+F)로 "### 사용 가능한 MCP 도구" 검색
3. 해당 섹션의 표를 위의 완전 목록으로 교체
4. 저장

---

## 참고

- 원본 파일: `docs/reports/url.md`
- 백업 파일: `docs/reports/url.md.backup`
- 상세 문서: `docs/reports/SUPABASE_MCP_TOOLS_COMPLETE.md`
- 업데이트 스크립트: `update_mcp_section.ps1`
