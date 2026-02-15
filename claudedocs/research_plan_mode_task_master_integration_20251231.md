# Claude Code Plan Mode와 Task Master AI를 활용한 PRD 기반 작업 관리 가이드

**연구 날짜:** 2025-12-31
**주제:** Claude Code의 Plan Mode를 사용하여 Task Master AI처럼 PRD를 파싱하고 작업(Task)을 효율적으로 관리하는 방법

---

## 요약 (Executive Summary)

이 가이드는 **Claude Code의 Plan Mode**와 **Task Master AI**의 PRD 파싱 기능을 결합하여 효율적인 작업 관리 워크플로우를 구축하는 방법을 설명합니다. 두 도구는 각각 고유한 강점을 가지고 있으며, 이를 통합하면 PRD에서 시작하여 구현까지의 전체 개발 프로세스를 자동화할 수 있습니다.

### 핵심 발견
1. **Task Master AI**는 PRD를 자동으로 파싱하여 구조화된 작업(JSON 형식)으로 변환하는 MCP 서버
2. **Claude Code Plan Mode**는 연구 및 구현 계획을 위한 읽기 전용 탐색 모드
3. 두 도구를 통합하면 PRD → 작업 분해 → 계획 수립 → 구현 실행의 완전한 워크플로우 가능

---

## 목차 (Table of Contents)

1. [도구 개요](#1-도구-개요)
2. [Task Master AI 상세 분석](#2-task-master-ai-상세-분석)
3. [Claude Code Plan Mode 상세 분석](#3-claude-code-plan-mode-상세-분석)
4. [PRD 작성 가이드라인](#4-prd-작성-가이드라인)
5. [통합 워크플로우](#5-통합-워크플로우)
6. [실전 예시](#6-실전-예시)
7. [모범 사례](#7-모범-사례)
8. [참고 자료](#8-참고-자료)

---

## 1. 도구 개요

### 1.1 Task Master AI

**정의:** AI 기반 작업 관리 시스템으로, MCP(Model Context Protocol) 서버로 구동되며 PRD를 자동으로 구조화된 작업으로 변환합니다.

**핵심 기능:**
- PRD 파싱 및 자동 작업 분해
- 작업 간 의존성 관리
- 하위 작업(Subtask) 생성
- 프로젝트 복잡도 분석
- 진행 상태 추적

**지원 도구:**
| 도구 이름 | 기능 |
|----------|------|
| `parse_prd` | PRD 파일을 파싱하여 tasks.json 생성 |
| `add_task` | 새 작업 추가 |
| `expand_task` | 개별 작업을 하위 작업으로 확장 |
| `expand_all` | 모든 작업 확장 |
| `update_task` | 기존 작업 업데이트 |
| `analyze_project_complexity` | 프로젝트 복잡도 분석 |
| `set_task_status` | 작업 상태 변경 (pending/in-progress/done) |
| `next_task` | 다음 작업 제안 |

### 1.2 Claude Code Plan Mode

**정의:** Claude Code의 기본 기능으로, 코드베이스를 읽기 전용으로 탐색하고 구현 계획을 수립하는 모드입니다.

**핵심 기능:**
- 읽기 전용 코드베이스 탐색
- 구현 전 계획 수립
- 마크다운 형식 계획 파일 저장
- 사용자 승인 후 구현 단계 진행

**활성화 방법:**
- 단축키: `Shift + Tab` 두 번
- 설정: `/config`에서 기본 모드로 설정
- 프로그래밍 방식: `EnterPlanMode` 도구 호출

---

## 2. Task Master AI 상세 분석

### 2.1 설치 및 설정

```bash
# MCP 서버 설치
npm install -g @eyaltoledano/task-master-ai

# 또는 프로젝트 로컬 설치
npm install --save-dev @eyaltoledano/task-master-ai
```

**MCP 설정 (.mcp.json):**
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "@eyaltoledano/task-master-ai"]
    }
  }
}
```

### 2.2 PRD 파일 구조

**기본 위치:**
- 새 프로젝트: `.taskmaster/docs/prd.txt`
- 기존 프로젝트: `scripts/prd.txt` 또는 `docs/prd.txt`

**PRD 형식 가이드라인:**
```markdown
# 프로젝트 제목

## 개요
프로젝트의 목적과 범위에 대한 간단한 설명

## 기능 요구사항
1. 기능 A에 대한 설명
2. 기능 B에 대한 설명
3. 기능 C에 대한 설명

## 기술 요구사항
- 사용할 기술 스택
- 성능 요구사항
- 보안 요구사항

## 우선순위
1. 높음: 필수 기능
2. 중간: 중요한 기능
3. 낮음: 선택적 기능
```

### 2.3 핵심 MCP 도구 상세

#### `parse_prd`
```typescript
// PRD 파싱 명령
parse_prd(
  input: string = ".taskmaster/docs/prd.txt",
  projectRoot: string = "<프로젝트 경로>",
  output: string = ".taskmaster/tasks/tasks.json",
  numTasks: string = "auto",  // 또는 숫자 (예: "10")
  force: boolean = false,
  research: boolean = false,
  tag: string = "default"
)
```

**파라미터 설명:**
- `input`: PRD 파일 경로
- `projectRoot`: 프로젝트 루트 경로
- `output`: 생성될 tasks.json 경로
- `numTasks`: 생성할 작업 수 ("auto"는 AI가 결정)
- `force`: 기존 작업 덮어쓰기 여부
- `research`: 웹 검색을 통한 추가 연구 수행 여부
- `tag`: 작업 그룹 태그

#### `expand_task`
```typescript
// 단일 작업 확장
expand_task(
  id: string,           // 작업 ID
  num: string = "3",    // 생성할 하위 작업 수
  research: boolean = false,
  prompt: string = "",  // 추가 지시사항
  force: boolean = false,
  projectRoot: string = "<프로젝트 경로>",
  tag: string = "default"
)
```

#### `get_tasks`
```typescript
// 작업 목록 조회
get_tasks(
  projectRoot: string = "<프로젝트 경로>",
  status?: "pending" | "in-progress" | "done" | "all",
  withSubtasks: boolean = false,
  tag: string = "default"
)
```

### 2.4 Tasks.json 구조

```json
{
  "version": "2.0",
  "project": {
    "name": "프로젝트 이름",
    "description": "프로젝트 설명",
    "created": "2025-12-31T00:00:00Z"
  },
  "tags": {
    "default": {
      "name": "default",
      "description": "기본 작업 그룹",
      "tasks": [
        {
          "id": "1",
          "title": "사용자 인증 시스템 구현",
          "description": "로그인, 로그아웃, 세션 관리",
          "status": "pending",
          "priority": "high",
          "dependencies": [],
          "subtasks": [
            {
              "id": "1-1",
              "title": "로그인 API 설계",
              "description": "REST API 엔드포인트 설계",
              "status": "pending"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 3. Claude Code Plan Mode 상세 분석

### 3.1 Plan Mode 작동 원리

**개념적 이해:**
- Plan은 Claude의 계획 폴더에 저장되는 마크다운 파일
- 읽기 전용 도구(Glob, Grep, Read)만 사용하여 코드베이스 탐색
- 계획 완료 후 `ExitPlanMode` 도구로 종료 및 사용자 승인 요청

**시스템 프롬프트:**
```
When to Use This Tool:
- New Feature Implementation: Adding meaningful new functionality
- Multiple Valid Approaches: The task can be solved in several different ways
- Code Modifications: Changes that affect existing behavior or structure
- Architectural Decisions: The task requires choosing between patterns or technologies
- Multi-File Changes: The task will likely touch more than 2-3 files
```

### 3.2 Plan Mode 진행 단계

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. 진입 (Enter)                             │
│  - 사용자 요청                                                 │
│  - EnterPlanMode 도구 자동 호출                                 │
│  - 사용자 승인 (대화형)                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  2. 탐색 및 계획 (Explore & Plan)                │
│  - Glob/Grep/Read 도구로 코드베이스 탐색                         │
│  - 기존 패턴 및 아키텍처 분석                                   │
│  - 구현 접근 방식 설계                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  3. 계획 작성 (Write Plan)                       │
│  - plans/ 디렉토리에 .md 파일 저장                             │
│  - 파일명: YYYYMMDD-<기능이름>.md                              │
│  - 계획 내용: 단계별 구현 절차                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   4. 종료 및 승인 (Exit)                        │
│  - ExitPlanMode 도구 호출                                       │
│  - 계획 제시 및 사용자 승인 요청                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    5. 실행 (Execute)                            │
│  - 승인 시: 계획에 따라 구현 시작                               │
│  - 거부 시: 계획 수정 또는 재탐색                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 계획 파일 형식

**파일 위치:** `plans/YYYYMMDD-feature-name.md`

```markdown
# 기능 이름: 계획

**작성일:** 2025-12-31
**상태:** 승인 대기 중

## 배경
이 기능이 필요한 이유와 문제 맥락

## 구현 접근 방식

### 단계 1: 데이터 모델 설계
- [ ] User 테이블 스키마 정의
- [ ] Session 테이블 스키마 정의

### 단계 2: API 엔드포인트 구현
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] GET /api/auth/me

### 단계 3: 프론트엔드 컴포넌트
- [ ] LoginForm 컴포넌트
- [ ] AuthProvider 컨텍스트

## 고려사항
- 보안: JWT 토큰 유효성 검사
- 성능: 세션 캐싱 전략
- 테스트: E2E 테스트 커버리지

## 예상 결과
- 사용자가 이메일/비밀번호로 로그인 가능
- 세션 유지 및 자동 로그아웃
```

### 3.4 Plan Mode 사용 시점

**✅ Plan Mode를 사용해야 하는 경우:**
- 새로운 주요 기능 구현
- 여러 유효한 접근 방식이 존재할 때
- 기존 동작에 영향을 주는 코드 수정
- 아키텍처 결정이 필요할 때
- 3개 이상의 파일을 수정해야 할 때

**❌ Plan Mode를 사용하지 않아도 되는 경우:**
- 단순 버그 수정 (명백한 수정 사항)
- 단일 함수 추가
- 명확하고 상세한 지시사항이 있는 경우
- 순수 연구/탐색 작업 (Explore agent 사용)

---

## 4. PRD 작성 가이드라인

### 4.1 효과적인 PRD 구조

```markdown
# [프로젝트/기능 이름]

## 📋 개요 (Overview)
**목적:** 2-3문단으로 프로젝트의 핵심 목적 설명
**범위:** 어떤 것을 포함하고, 어떤 것을 포함하지 않는지 명시
**대상:** 주요 사용자 및 이해관계자

## 🎯 핵심 목표 (Core Objectives)
1. [SMART 형식의 구체적 목표 1]
2. [SMART 형식의 구체적 목표 2]
3. [SMART 형식의 구체적 목표 3]

## 📱 기능 요구사항 (Feature Requirements)

### 필수 기능 (Must Have)
| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-001 | 기능 A | 설명 | P0 |
| F-002 | 기능 B | 설명 | P0 |

### 중요 기능 (Should Have)
| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-101 | 기능 C | 설명 | P1 |

### 추가 기능 (Nice to Have)
| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| F-201 | 기능 D | 설명 | P2 |

## 🔧 기술 요구사항 (Technical Requirements)
- **프레임워크:** Next.js 16, React 19
- **언어:** TypeScript
- **스타일링:** Tailwind CSS
- **상태 관리:** React Context / Zustand
- **데이터베이스:** Supabase (PostgreSQL)
- **성능:** LCP < 2.5s, FID < 100ms

## 🚨 비기능 요구사항 (Non-Functional Requirements)
- **보안:** 인증, 암호화, 취약성 없어야 함
- **접근성:** WCAG 2.1 AA 준수
- **SEO:** 일본 시장 최적화
- **모바일:** 반응형 디자인

## 📊 성공 지표 (Success Metrics)
- 사용자 참여률 20% 증가
- 페이지 로드 시간 30% 단축
- 전환율 15% 개선

## ⚠️ 제약사항 (Constraints)
- 예산: 제한 없음
- 일정: 8주 내 완료
- 리소스: 1명 풀스택 개발자
- 기술: 기존 기술 스택 유지

## 🔄 워크플로우/유저 시나리오 (User Scenarios)

### 시나리오 1: 사용자 로그인
1. 사용자가 로그인 페이지 방문
2. 이메일과 비밀번호 입력
3. 로그인 버튼 클릭
4. 인증 성공 시 대시보드로 이동

## 📝 참고 자료 (References)
- Figma 디자인: [링크]
- API 문서: [링크]
- 관련 이슈: [링크]
```

### 4.2 Task Master AI를 위한 PRD 최적화 팁

**1. 명확한 구조 사용:**
- 마크다운 헤더(#, ##, ###)를 계층적으로 사용
- 목록(순서형/비순서형)으로 구조화
- 표(|)로 복잡한 정보 요약

**2. 구체적인 기술 사양:**
```markdown
## 기술 스택
- 프론트엔드: React 19, TypeScript
- 백엔드: Next.js 16 API Routes
- 데이터베이스: Supabase
- 스타일: Tailwind CSS
```

**3. 의존성 명시:**
```markdown
## 선행 조건
- [ ] 기존 사용자 데이터베이스 스키마
- [ ] 인증 API 이미 구현됨
- [ ] 디자인 시스템 확보
```

**4. 수용 기준 정의:**
```markdown
## 완료 기준 (Definition of Done)
- [ ] 모든 P0 기능 구현
- [ ] 단위 테스트 80% 이상 커버리지
- [ ] E2E 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 배포 준비 완료
```

---

## 5. 통합 워크플로우

### 5.1 완전한 PRD → 구현 파이프라인

```
┌─────────────────────────────────────────────────────────────────┐
│                      1단계: PRD 작성                             │
│                                                                  │
│  • .taskmaster/docs/prd.txt에 PRD 작성                          │
│  • 기능 요구사항, 기술 요구사항, 우선순위 명시                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    2단계: PRD 파싱 (Task Master)                 │
│                                                                  │
│  • parse_prd MCP 도구 호출                                      │
│  • PRD 분석 및 tasks.json 생성                                  │
│  • 작업 간 의존성 자동 설정                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  3단계: 작업 확장 (Task Master)                  │
│                                                                  │
│  • expand_task으로 복잡한 작업 세부화                           │
│  • 하위 작업(Subtasks) 자동 생성                                │
│  • 작업별 구체적 구현 단계 정의                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                4단계: 다음 작업 선택 (Task Master)               │
│                                                                  │
│  • next_task으로 의존성 충족된 작업 확인                        │
│  • 작업 순서 및 우선순위 제안                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              5단계: Plan Mode 진입 (Claude Code)                 │
│                                                                  │
│  • 선택된 작업에 대해 EnterPlanMode 호출                         │
│  • 사용자 승인 후 계획 모드 시작                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              6단계: 계획 수립 (Claude Code)                      │
│                                                                  │
│  • 코드베이스 탐색 (Glob, Grep, Read)                           │
│  • 기존 패턴 및 아키텍처 분석                                   │
│  • 구현 계획 작성 (plans/ 디렉토리)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│             7단계: 계획 승인 및 실행 (Claude Code)               │
│                                                                  │
│  • ExitPlanMode로 계획 제시                                     │
│  • 사용자 승인 후 구현 시작                                     │
│  • 작업 상태를 in-progress로 변경                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               8단계: 작업 완료 및 검증                           │
│                                                                  │
│  • 구현 완료 후 테스트 실행                                     │
│  • 작업 상태를 done으로 변경                                    │
│  • 다음 작업으로 이동 (4단계로 복귀)                            │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 대화형 워크플로우 예시

**사용자:**
```
내 PRD를 파싱해서 작업 목록을 만들어줘.
```

**Claude (Task Master AI 사용):**
```
PRD를 파싱하겠습니다.

parse_prd 도구를 호출 중...
✓ PRD 분석 완료
✓ 12개의 작업 생성
✓ 의존성 설정 완료

생성된 작업:
1. [P0] 사용자 인증 시스템 구현
2. [P0] 데이터베이스 스키마 설계 (1에 의존)
3. [P1] 대시보드 UI 구현 (1에 의존)
...
```

**사용자:**
```
1번 작업을 확장해줘.
```

**Claude (Task Master AI 사용):**
```
expand_task 도구로 작업 1을 확장하겠습니다.

✓ 4개의 하위 작업 생성:

1-1: 로그인 API 설계
1-2: JWT 토큰 관리 구현
1-3: 세션 저장소 구현
1-4: 로그아웃 기능 구현
```

**사용자:**
```
이제 1번 작업을 구현할 계획을 세워줘.
```

**Claude (Plan Mode 진입):**
```
EnterPlanMode를 호출하여 계획 모드를 시작하겠습니다.

🔍 Plan Mode 진입
코드베이스를 탐색하고 구현 계획을 수립합니다...

[계획 모드 내에서]
- Glob: **/*auth* 파일 검색
- Grep: "jwt", "session" 패턴 검색
- Read: 기존 인증 관련 코드 분석

계획을 작성했습니다: plans/20251231-user-auth-system.md
```

**사용자:**
```
승인해. 구현해줘.
```

**Claude:**
```
ExitPlanMode를 호출하고 구현을 시작합니다.

✓ 계획 승인됨
✓ 작업 상태: in-progress

구현 시작:
- JWT 라이브러리 설치...
- API 라우트 생성...
- 테스트 작성...
```

### 5.3 CLAUDE.md 파일과의 통합

**프로젝트 루트 CLAUDE.md:**
```markdown
# 프로젝트 설정

## Task Master AI
- PRD 위치: `.taskmaster/docs/prd.txt`
- 작업 파일: `.taskmaster/tasks/tasks.json`
- MCP 서버: task-master-ai

## Plan Mode
- 계획 디렉토리: `plans/`
- 계획 형식: 마크다운 (.md)
- 단축키: Shift+Tab 두 번

## 워크플로우
1. PRD 작성/업데이트
2. `parse_prd`로 작업 생성
3. `expand_task`로 세부화
4. `next_task`로 다음 작업 확인
5. Plan Mode로 구현 계획 수립
6. 승인 후 구현

## 기술 스택
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
```

---

## 6. 실전 예시

### 6.1 전자상거래 장바구니 기능 PRD

```markdown
# 장바구니 기능 구현

## 개요
사용자가 제품을 장바구니에 담고, 수량을 조정하고, 결제할 수 있는 기능

## 핵심 기능
1. 장바구니에 제품 추가
2. 장바구니 내 제품 수량 수정
3. 장바구니에서 제품 삭제
4. 장바구니 목록 조회
5. 장바구니 전체 가격 계산

## 기술 요구사항
- 상태 관리: Zustand
- 데이터 지속성: localStorage + 서버 동기화
- API: REST /api/cart

## UI 요구사항
- 반응형 디자인
- 제품 이미지, 이름, 가격 표시
- 수량 조정 버튼 (+/-)
- 전체 가격 실시간 계산

## 비기능 요구사항
- 장바구니 데이터 로컬 캐싱
- 로그인 사용자는 서버와 동기화
- 게스트 사용자는 로컬에만 저장
```

**Task Master로 파싱 후 생성된 작업:**

```json
{
  "tasks": [
    {
      "id": "1",
      "title": "장바구니 상태 관리 구현",
      "description": "Zustand 스토어 생성 및 액션 정의",
      "status": "pending",
      "priority": "P0",
      "dependencies": []
    },
    {
      "id": "2",
      "title": "장바구니 API 엔드포인트 구현",
      "description": "/api/cart CRUD 구현",
      "status": "pending",
      "priority": "P0",
      "dependencies": ["1"]
    },
    {
      "id": "3",
      "title": "장바구니 UI 컴포넌트 개발",
      "description": "CartPage, CartItem 컴포넌트",
      "status": "pending",
      "priority": "P1",
      "dependencies": ["1", "2"]
    },
    {
      "id": "4",
      "title": "localStorage 통합",
      "description": "게스트 사용자를 위한 로컬 저장",
      "status": "pending",
      "priority": "P1",
      "dependencies": ["1"]
    },
    {
      "id": "5",
      "title": "장바구니 E2E 테스트",
      "description": "Playwright 테스트 작성",
      "status": "pending",
      "priority": "P2",
      "dependencies": ["3"]
    }
  ]
}
```

**Plan Mode로 작업 1 계획:**

```markdown
# 작업 1: 장바구니 상태 관리 구현 계획

## 배경
장바구니 기능의 핵심이 되는 상태 관리 시스템이 필요합니다.
Zustand를 사용하여 간단하고 효율적인 상태 관리를 구현합니다.

## 접근 방식

### 단계 1: Zustand 스토어 생성
- [ ] `src/stores/cartStore.ts` 파일 생성
- [ ] CartItem 타입 정의
- [ ] CartState 인터페이스 정의

### 단계 2: 스토어 액션 구현
- [ ] addItem(product): 제품 추가
- [ ] removeItem(productId): 제품 삭제
- [ ] updateQuantity(productId, quantity): 수량 수정
- [ ] clearCart(): 장바구니 비우기
- [ ] getTotalPrice(): 총 가격 계산

### 단계 3: 테스트 작성
- [ ] 단위 테스트 작성
- [ ] 각 액션 동작 검증

## 코드 구조
```typescript
// src/stores/cartStore.ts
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  // ...
}
```

## 고려사항
- Zustand의 persist 미들웨어로 localStorage 자동 저장
- 서버 동기화는 별도 작업(작업 2)에서 처리
- 타입 안전성 보장

## 예상 결과
- 완전한 장바구니 상태 관리
- 모든 액션에 대한 단위 테스트
- localStorage 자동 지속성
```

### 6.2 대화형 예시: 전체 워크플로우

```
사용자: 장바구니 기능을 개발해야 해. PRD를 작성했어.

Claude: PRD를 확인하고 Task Master로 파싱하겠습니다.
📁 .taskmaster/docs/prd.txt 읽기 중...
🔧 parse_prd 호출:
  - 5개 작업 생성
  - 의존성 설정 완료
  - 우선순위: P0(2), P1(2), P2(1)

생성된 작업 목록:
┌─── [1] 장바구니 상태 관리 구현 (P0)
│
├─── [2] 장바구니 API 엔드포인트 구현 (P0)
│   └── 의존: [1]
│
├─── [3] 장바구니 UI 컴포넌트 개발 (P1)
│   └── 의존: [1, 2]
│
├─── [4] localStorage 통합 (P1)
│   └── 의존: [1]
│
└─── [5] 장바구니 E2E 테스트 (P2)
    └── 의존: [3]

어떤 작업부터 시작할까요?

사용자: 1번을 4개의 하위 작업으로 확장해줘.

Claude: expand_task 호출:
  작업 ID: 1
  하위 작업 수: 4

✓ 하위 작업 생성 완료:

[1-1] Zustand 스토어 생성 및 타입 정의
[1-2] 제품 추가 액션 구현
[1-3] 제품 삭제 및 수량 수정 액션 구현
[1-4] 총 가격 계산 로직 구현

사용자: 1번 작업을 Plan Mode로 계획해줘.

Claude: EnterPlanMode 호출 중...

🔍 Plan Mode 진입
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

코드베이스 탐색 중:
• Glob: **/*store*.ts 검색 중...
  → src/stores/authStore.ts 발견
• Grep: "zustand" 패턴 검색 중...
  → 5개 파일에서 사용 중
• Read: src/stores/authStore.ts 분석 완료

기존 패턴 확인:
- authStore.ts에서 Zustand v4 사용
- persist 미들웨어 활용
- 타입: TypeScript interface

계획 작성 중: plans/20251231-cart-state-management.md

✓ 계획 완료

ExitPlanMode 호출:
계획을 제시합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 작업 1: 장바구니 상태 관리 구현 계획

1단계: Zustand 스토어 생성
   - src/stores/cartStore.ts 생성
   - CartItem, CartState 인터페이스 정의

2단계: 스토어 액션 구현
   - addItem, removeItem, updateQuantity
   - clearCart, getTotalPrice

3단계: persist 미들웨어 통합
   - localStorage 자동 저장
   - authStore 패턴 따르기

4단계: 단위 테스트 작성
   - 각 액션 테스트

승인하시겠습니까? (y/n)

사용자: y

Claude: 계획 승인됨. 구현을 시작합니다.

🔧 작업 상태 변경: in-progress

구현 중:
✓ src/stores/cartStore.ts 생성
✓ CartItem 인터페이스 정의
✓ create 스토어 구현
✓ addItem 액션 구현
✓ removeItem 액션 구현
✓ updateQuantity 액션 구현
✓ persist 미들웨어 추가
✓ 단위 테스트 작성

✅ 작업 1 완료

작업 상태: done

다음 작업으로 넘어갈까요?
- [4] localStorage 통합 (의존성 충족)
- [2] API 엔드포인트 구현 (의존성 충족)

사용자: 2번도 계획해줘.

Claude: EnterPlanMode 호출...

[계속해서 작업 2에 대한 계획 수립 및 구현]
```

---

## 7. 모범 사례

### 7.1 PRD 작성 모범 사례

**✅ 좋은 PRD:**
```markdown
# 사용자 인증 시스템

## 목표
사용자가 이메일과 비밀번호로 가입하고 로그인할 수 있는 시스템

## 기능 요구사항
1. 회원가입: 이메일 인증 필수
2. 로그인: JWT 토큰 기반
3. 비밀번호 찾기: 이메일로 재설정 링크 전송
4. 세션 관리: 7일간 유지

## 기술 스택
- 인증: NextAuth.js v5
- 데이터베이스: Supabase (PostgreSQL)
- 토큰: JWT (HS256)

## API 엔드포인트
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

## 보안 요구사항
- 비밀번호: bcrypt로 해싱 (라운드 10)
- JWT: 환경 변수로 시크릿 키 관리
- Rate Limiting: 분당 5회 요청 제한

## 완료 기준
- [ ] 모든 API 엔드포인트 구현
- [ ] 단위 테스트 통과 (커버리지 > 80%)
- [ ] E2E 테스트 통과
- [ ] 보안 감사 통과
```

**❌ 나쁜 PRD:**
```markdown
# 인증 기능

사용자 로그인을 만들어야 함.

- 이메일 로그인
- 비밀번호 찾기
- 회원가입

기술은 자유롭게 선택.
```

### 7.2 Task Master 사용 모범 사례

**1. PRD를 먼저 완성하세요.**
- PRD의 품질이 작업 분해의 품질을 결정합니다.
- 모호한 PRD는 모호한 작업을 생성합니다.

**2. 작업을 점진적으로 확장하세요.**
```bash
# 처음에는 높은 수준의 작업으로 시작
parse_prd

# 중요한 작업만 먼저 확장
expand_task id=1 num=3

# 구현할 때 나머지 확장
expand_task id=2 num=5
```

**3. 의존성을 활용하세요.**
- Task Master가 자동으로 의존성을 설정합니다
- `next_task`로 올바른 순서로 작업을 진행하세요

**4. 작업 상태를 업데이트하세요.**
```typescript
// 작업 시작 전
set_task_status id="1" status="in-progress"

// 작업 완료 후
set_task_status id="1" status="done"
```

**5. PRD 변경 시 재파싱을 고려하세요.**
```typescript
// 큰 변경이 있는 경우
parse_prd force=true

// 작은 변경은 수동 업데이트
update_task id="1" prompt="새 요구사항 추가"
```

### 7.3 Plan Mode 사용 모범 사례

**1. 복잡한 작업에만 Plan Mode 사용하세요.**
- 단순 버그 수정에는 과도함
- 새로운 기능, 리팩토링, 아키텍처 변경에 적합

**2. 계획 파일을 버전 관리하세요.**
```bash
# plans/ 디렉토리를 git에 커밋
git add plans/
git commit -m "Add plan for user authentication"
```

**3. 계획을 간결하게 유지하세요.**
```markdown
# ✅ 좋은 계획
## 구현 단계
1. 데이터베이스 스키마 설계
2. API 엔드포인트 구현
3. 프론트엔드 컴포넌트 개발

# ❌ 나쁜 계획
## 구현 단계
1. 먼저 데이터베이스 스키마를 설계할 것이다.
   Users 테이블을 만들고, 그 안에 id, email, password 컬럼을 추가한다.
   컬럼 타입은 각각 uuid, varchar, varchar로...
   (너무 상세함)
```

**4. 계획 후 바로 구현하지 마세요.**
- 계획을 검토하세요
- 필요하다면 수정을 요청하세요
- 승인 후 구현을 진행하세요

### 7.4 통합 워크플로우 모범 사례

**1. PRD → Task Master → Plan Mode 순서를 준수하세요.**
```
PRD 작성 → Task Master로 파싱 → 작업 확장 → Plan Mode 계획 → 구현
```

**2. CLAUDE.md로 워크플로우를 문서화하세요.**
```markdown
# 프로젝트 워크플로우

## 1. PRD 관리
- 위치: `.taskmaster/docs/prd.txt`
- 업데이트 시 parse_prd 재실행

## 2. 작업 관리
- 파일: `.taskmaster/tasks/tasks.json`
- 명령어:
  - `parse_prd`: PRD 파싱
  - `expand_task id=X`: 작업 확장
  - `next_task`: 다음 작업 확인
  - `set_task_status id=X status=done`: 상태 변경

## 3. Plan Mode
- 계획 디렉토리: `plans/`
- 단축키: Shift+Tab 두 번
- 워크플로우: 계획 → 승인 → 구현
```

**3. 정기적으로 진행 상황을 검토하세요.**
```bash
# 작업 목록 확인
get_tasks status="all"

# 완료된 작업 확인
get_tasks status="done"

# 진행 중인 작업 확인
get_tasks status="in-progress"
```

**4. 완료 기준(Definition of Done)을 정의하세요.**
```markdown
## 작업 완료 기준
- [ ] 기능 구현 완료
- [ ] 단위 테스트 통과
- [ ] E2E 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서화 완료
- [ ] 작업 상태: done
```

---

## 8. 참고 자료

### 8.1 공식 문서

| 리소스 | URL |
|--------|-----|
| Claude Code 공식 문서 | https://code.claude.com/docs/en/common-workflows |
| Claude Code Best Practices | https://www.anthropic.com/engineering/claude-code-best-practices |
| Claude Agent SDK | https://platform.claude.com/docs/en/agent-sdk/hosting |
| Task Master GitHub | https://github.com/eyaltoledano/claude-task-master |
| Task Master 공식 문서 | https://docs.task-master.dev/ |

### 8.2 튜토리얼 및 가이드

| 리소스 | URL |
|--------|-----|
| Task Master 튜토리얼 | https://github.com/eyaltoledano/claude-task-master/blob/main/docs/tutorial.md |
| Plan Mode 심층 분석 | https://lucumr.pocoo.org/2025/12/17/what-is-plan-mode/ |
| PRD for Claude Code | https://www.chatprd.ai/resources/PRD-for-Claude-Code |
| Explore-Plan-Execute 방법론 | https://devcenter.upsun.com/posts/explore-plan-execute-methodology/ |

### 8.3 동영상 자료

| 리소스 | URL |
|--------|-----|
| Task Master AI 소개 | https://www.youtube.com/watch?v=1I73OFAnvdg |
| Plan Mode 사용법 | https://www.youtube.com/watch?v=a0HQB6bEgzI |

### 8.4 블로그 및 아티클

| 리소스 | URL |
|--------|-----|
| Plan Mode 혁신 | https://medium.com/@kuntal-c/claude-code-plan-mode-revolutionizing-the-senior-engineers-workflow-21d054ee3420 |
| Task Master AI 워크플로우 | https://medium.com/@abhishek.bhattacharya04/from-requirement-to-reality-how-claude-task-master-cursor-transformed-a-complex-feature-request-c8ec735d6096 |
| Agentic 프롬프트 엔지니어링 | https://medium.com/@thelazyindiantechie/the-ultimate-agentic-prompt-engineering-workflow-5f3c51d958e0 |
| Task Master MCP 서버 가이드 | https://skywork.ai/skypage/en/task-master-mcp-server-ai-engineers/1977587123365548032 |

### 8.5 커뮤니티 리소스

| 리소스 | URL |
|--------|-----|
| Reddit r/ClaudeAI | https://www.reddit.com/r/ClaudeAI/ |
| Reddit r/ClaudeCode | https://www.reddit.com/r/ClaudeCode/ |
| Cursor 포럼 | https://forum.cursor.com/ |

---

## 부록 A: 빠른 참조 (Quick Reference)

### Task Master MCP 도구 요약

| 도구 | 설명 | 사용 예시 |
|------|------|----------|
| `parse_prd` | PRD를 작업으로 변환 | `parse_prd input="docs/prd.txt"` |
| `add_task` | 새 작업 추가 | `add_task title="기능 구현"` |
| `expand_task` | 작업을 하위 작업으로 확장 | `expand_task id="1" num="5"` |
| `expand_all` | 모든 작업 확장 | `expand_all` |
| `get_tasks` | 작업 목록 조회 | `get_tasks status="pending"` |
| `get_task` | 단일 작업 조회 | `get_task id="1"` |
| `update_task` | 작업 업데이트 | `update_task id="1" prompt="추가 요구사항"` |
| `set_task_status` | 작업 상태 변경 | `set_task_status id="1" status="done"` |
| `next_task` | 다음 작업 제안 | `next_task` |
| `remove_task` | 작업 삭제 | `remove_task id="1"` |

### Claude Code Plan Mode 단축키

| 단축키 | 기능 |
|--------|------|
| `Shift + Tab` 두 번 | Plan Mode 진입 |
| `/config` | 설정 열기 |
| `Ctrl + C` | 작업 중단 |

### 작업 상태 (Status Values)

| 상태 | 설명 | 사용 시점 |
|------|------|----------|
| `pending` | 대기 중 | 작업 생성 후 |
| `in-progress` | 진행 중 | 작업 시작 시 |
| `done` | 완료 | 작업 완료 후 |
| `blocked` | 차단됨 | 의존성 미충족 시 |
| `deferred` | 연기됨 | 나중에 처리할 때 |
| `cancelled` | 취소됨 | 더 이상 필요 없음 |

### 우선순위 (Priority Levels)

| 우선순위 | 설명 | 예시 |
|----------|------|------|
| `P0` | 필수 (Must Have) | 핵심 기능, 보안 |
| `P1` | 중요 (Should Have) | 주요 개선사항 |
| `P2` | 선택적 (Nice to Have) | 부가 기능 |

---

## 부록 B: 문제 해결 (Troubleshooting)

### 문제 1: PRD 파싱 실패

**증상:**
```
parse_prd 도구 실행 후 "Failed to parse PRD" 오류

**원인:**
- PRD 파일 형식이 올바르지 않음
- 파일 경로가 틀림
- 파일 인코딩 문제

**해결 방법:**
1. PRD 파일이 마크다운 형식인지 확인
2. 파일 경로가 정확한지 확인 (.taskmaster/docs/prd.txt)
3. UTF-8 인코딩인지 확인

### 문제 2: Plan Mode가 자동으로 실행됨

**증상:**
```
Plan Mode를 요청하지 않았는데 자동으로 진입함

**원인:**
- 복잡한 작업으로 인해 Claude가 Plan Mode 필요하다고 판단
- .mcp.json 설정에서 autoPlanMode가 true로 설정됨

**해결 방법:**
1. /config에서 autoPlanMode 설정 확인
2. 작업을 더 작은 단위로 분할
3. 명시적으로 Plan Mode 진입을 거부

### 문제 3: 작업 의존성 오류

**증상:**
```
Circular dependency detected: Task 1 -> Task 2 -> Task 1

**원인:**
- 작업 간 순환 의존성이 존재

**해결 방법:**
1. 작업 간 의존성 재검토
2. 순환 참조 제거
3. 작업을 더 작은 단위로 분할

### 문제 4: Plan Mode 후 계획이 사라짐

**증상:**
```
Plan Mode에서 작성한 계획이 ExitPlanMode 후 사라짐

**원인:**
- 계획 파일이 저장되지 않음
- plans/ 디렉토리가 없음

**해결 방법:**
1. plans/ 디렉토리 생성
2. CLAUDE.md에 계획 파일 위치 명시
3. git에 plans/ 디렉토리 커밋

---

## 결론

Claude Code의 Plan Mode와 Task Master AI를 결합하면 PRD에서 시작하여 구현까지의 전체 개발 프로세스를 자동화하고 체계적으로 관리할 수 있습니다.

### 핵심 요약

1. **Task Master AI**는 PRD를 자동으로 구조화된 작업으로 변환합니다
2. **Claude Code Plan Mode**는 작업에 대한 구현 계획을 안전하게 수립합니다
3. 두 도구를 통합하면 효율적인 PRD → 구현 파이프라인을 구축할 수 있습니다

### 다음 단계

1. 프로젝트에 Task Master AI MCP 서버 설치
2. 첫 번째 PRD 작성
3. `parse_prd`로 작업 분해
4. `expand_task`로 작업 세부화
5. Plan Mode로 구현 계획 수립
6. 승인 후 구현 진행

---

*이 문서는 2025년 12월 31일에 작성되었습니다. 최신 정보는 공식 문서를 참조하세요.*
