<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 -->

# Test Scenarios Documentation

## Purpose
Playwright MCP를 사용한 통합 테스트 시나리오 문서입니다. 홈페이지(게스트), 회원 페이지, 관리자 페이지, 그리고 통합 E2E 테스트 시나리오를 포함합니다.

## Key Files

| File | Description |
|------|-------------|
| `README.md` | 테스트 시나리오 개요 및 실행 방법 |
| `runner/README.md` | 테스트 러너 사용 가이드 |
| `runner/SETUP.md` | 테스트 러너 설정 가이드 |
| `runner/index.ts` | 테스트 러너 메인 실행 스크립트 |
| `runner/config/test-config.ts` | 테스트 설정 (URL, 계정, 타임아웃) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `homepage/` | 홈페이지(게스트 사용자) 테스트 시나리오 |
| `member/` | 회원 페이지 테스트 시나리오 |
| `admin/` | 관리자 페이지 테스트 시나리오 |
| `integration/` | 통합 E2E 테스트 시나리오 |
| `runner/` | Playwright MCP 기반 테스트 러너 |
| `runner/config/` | 테스트 설정 파일 |
| `runner/reporters/` | 테스트 결과 리포터 (Markdown, JSON/CSV/JUnit) |
| `runner/results/` | 테스트 실행 결과 저장소 |

## For AI Agents

### Working In This Directory

**테스트 시나리오 작성 시 유의사항:**
- 시나리오 파일은 `.md` 형식으로 작성합니다
- Playwright MCP 명령어를 사용하여 브라우저 조작을 기술합니다
- 데이터베이스 검증 SQL을 포함할 수 있습니다
- 각 시나리오는 목표, 전제 조건, 테스트 단계, 성공 기준을 포함해야 합니다

**테스트 러너 실행:**
```bash
# 모든 시나리오 실행
cd runner && npm test

# 카테고리별 실행
npm run test:homepage    # 홈페이지 시나리오만
npm run test:member      # 회원 페이지 시나리오만
npm run test:admin       # 관리자 페이지 시나리오만
npm run test:integration # 통합 시나리오만
```

### Test Scenario Structure

```markdown
# 시나리오 제목

**목표**: 테스트 목표 설명

**전제 조건**:
- 조건 1
- 조건 2

**테스트 단계**:

```bash
# Playwright MCP 명령어
[Browser_navigate] URL
[Browser_click] element="이름"
[Browser_type] element="이름" text="값"
[Browser_wait_for] time: 초
[Browser_snapshot]
```

**데이터베이스 검증**:

```sql
SELECT COUNT(*) FROM table_name WHERE condition = 'value';
```

**성공 기준**:
- 기준 1
- 기준 2
```

### Supported Playwright MCP Commands

| Command | Format | Description |
|---------|--------|-------------|
| `Browser_navigate` | `[Browser_navigate] URL` | 페이지 이동 |
| `Browser_click` | `[Browser_click] element="이름"` | 요소 클릭 |
| `Browser_type` | `[Browser_type] element="이름" text="값"` | 텍스트 입력 |
| `Browser_wait_for` | `[Browser_wait_for] time: 초` | 대기 |
| `Browser_snapshot` | `[Browser_snapshot]` | 스크린샷 캡처 |
| `Browser_verify_text_visible` | `[Browser_verify_text_visible] text="값"` | 텍스트 확인 |

### Database Verification

테스트 러너는 다음 SQL 명령어를 지원합니다:
- `SELECT` - 데이터 조회
- `INSERT` - 데이터 생성 (테스트용)
- `UPDATE` - 데이터 수정 (테스트용)
- `DELETE` - 데이터 삭제 (테스트 정리용)

간단한 SQL 문법은 자동으로 Supabase 클라이언트 메서드로 변환됩니다.

### Test Environment

**실전 모드 테스트:**
- ✅ 실제 Supabase 데이터베이스 연결
- ✅ 실제 인증 시스템 사용
- ✅ 실제 API 호출 테스트
- ❌ DEV_MODE 사용하지 않음
- ❌ 모 데이터(Mock Data) 사용하지 않음

**테스트 계정:**
- 관리자: admin@example.com / TestAdmin123!
- 회원: member@test.com / Test1234!

## Dependencies

### External

- **Playwright** - E2E 테스트 프레임워크
- **Supabase JS** - 데이터베이스 클라이언트
- **TypeScript** - 타입 안전성
- **tsx** - TypeScript 실행기

### Internal Architecture

- `runner/scenario-parser.ts` - 시나리오 파일 파서
- `runner/playwright-executor.ts` - Playwright 명령 실행기
- `runner/database-verifier.ts` - 데이터베이스 검증기
- `runner/reporters/markdown.ts` - 마크다운 리포터
- `runner/reporters/summary.ts` - JSON/CSV/JUnit 리포터

### Related Files

- `playwright.config.ts` - 프로젝트 루트 Playwright 설정
- `tests/e2e/` - TypeScript 기반 E2E 테스트
- `src/lib/supabase.ts` - Supabase 클라이언트 설정
- `types/database.ts` - 데이터베이스 타입 정의

<!-- MANUAL: 테스트 시나리오 추가 및 수정 시 이 섹션을 업데이트하세요 -->
