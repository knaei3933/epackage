# Claude Code Plan Mode 효과적인 사용을 위한 설정 가이드

**작성일:** 2025-12-31
**주제:** Plan Mode를 최대한 활용하기 위한 설정, 팁, 베스트 프랙티스

---

## 요약 (Executive Summary)

이 가이드는 Claude Code의 **Plan Mode**를 효과적으로 사용하기 위한 설정 방법, 단축키, 워크플로우 최적화 팁을 정리한 것입니다. Plan Mode는 복잡한 작업을 수행하기 전에 코드베이스를 안전하게 분석하고 계획을 수립하는 데 도움을 주는 핵심 기능입니다.

### 핵심 발견
1. **단축키:** `Shift+Tab` 두 번으로 Plan Mode 진입
2. **설정 파일:** `.claude/settings.json`으로 프로젝트별 설정 관리
3. **CLAUDE.md:** 프로젝트 규칙과 컨텍스트를 문서화
4. **사용 시점:** 3개 이상 파일을 수정하거나 아키텍처 결정이 필요한 때

---

## 목차 (Table of Contents)

1. [Plan Mode 기초](#1-plan-mode-기초)
2. [설정 파일 구조](#2-설정-파일-구조)
3. [효과적인 단축키 사용](#3-효과적인-단축키-사용)
4. [CLAUDE.md 활용](#4-claudemd-활용)
5. [Hooks 설정](#5-hooks-설정)
6. [사용 시점 결정](#6-사용-시점-결정)
7. [효과적인 워크플로우](#7-효과적인-워크플로우)
8. [고급 팁](#8-고급-팁)
9. [문제 해결](#9-문제-해결)
10. [참고 자료](#10-참고-자료)

---

## 1. Plan Mode 기초

### 1.1 Plan Mode란?

**정의:** 코드베이스를 **읽기 전용**으로 탐색하고 구현 계획을 수립하는 Claude Code의 핵심 모드

**핵심 특징:**
- ✅ 읽기 전용 도구만 사용 (Glob, Grep, Read)
- ✅ 안전한 코드베이스 탐색
- ✅ 마크다운 계획 파일 자동 생성
- ✅ 사용자 승인 후 구현 진행

### 1.2 활성화 방법

| 방법 | 설명 |
|------|------|
| **단축키** | `Shift + Tab` 두 번 (Mac/Windows 공통) |
| **모드 전환** | 반복해서 누르면: Normal → Auto-accept → Plan Mode |
| **설정 기본값** | `/config`에서 기본 모드로 설정 가능 |
| **프로그래밍** | `EnterPlanMode` 도구 호출 (자동) |

### 1.3 Plan Mode 작동 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    1. 진입 (Enter)                          │
│   Shift+Tab 두 번 또는 EnterPlanMode 자동 호출              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              2. 탐색 및 분석 (Explore)                       │
│   • Glob: 파일 패턴 검색                                    │
│   • Grep: 코드 패턴 검색                                    │
│   • Read: 파일 내용 분석                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              3. 계획 작성 (Plan)                            │
│   • plans/ 디렉토리에 .md 파일 저장                        │
│   • 단계별 구현 절차 작성                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              4. 종료 및 승인 (Exit)                         │
│   ExitPlanMode로 계획 제시                                 │
│   사용자 승인/거부 선택                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              5. 실행 (Execute)                              │
│   승인 시: 계획에 따라 구현 시작                           │
│   거부 시: 계획 수정 또는 재탐색                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 설정 파일 구조

### 2.1 설정 파일 위치 및 우선순위

Claude Code는 **계층적 설정 시스템**을 사용합니다:

```
1. 전역 설정 (Global)
   ~/.claude/settings.json
   └─ 모든 프로젝트에 적용

2. 프로젝트 설정 (Project)
   .claude/settings.json
   └─ 현재 프로젝트에만 적용 (우선순위 높음)

3. 설정 명령어
   /config
   └─ 대화형 설정 인터페이스
```

### 2.2 기본 settings.json 구조

```json
{
  // Plan Mode 기본 설정
  "defaultMode": "edit",
  "autoPlanMode": false,

  // 권한 설정
  "permissions": {
    "allowWrite": true,
    "allowBash": true,
    "allowMCP": true
  },

  // MCP 서버 설정
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    }
  },

  // Hooks 설정
  "hooks": {
    "preEdit": null,
    "postEdit": null,
    "prePlan": null,
    "postPlan": null
  },

  // UI 설정
  "theme": "dark",
  "editor": "vscode"
}
```

### 2.3 프로젝트별 설정 예시

**`.claude/settings.json`**

```json
{
  // 이 프로젝트는 항상 Plan Mode로 시작
  "defaultMode": "plan",

  // MCP 서버 (프로젝트 전용)
  "mcpServers": {
    "project-context": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-docs", "./docs"]
    }
  },

  // 권한 (안전한 설정)
  "permissions": {
    "allowWrite": true,
    "allowBash": "safe",  // 안전한 명령어만 허용
    "allowMCP": true
  },

  // Hooks
  "hooks": {
    "prePlan": "echo 'Plan Mode 시작'",
    "postPlan": "echo '계획 완료: {plan_file}'"
  }
}
```

### 2.4 전역 설정 예시

**`~/.claude/settings.json`**

```json
{
  // 기본 모드
  "defaultMode": "edit",
  "autoPlanMode": false,

  // 모든 MCP 서버 (공통)
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"]
    }
  },

  // 허용된 명령어 (보안)
  "allowedCommands": [
    "git status",
    "git diff",
    "git log",
    "npm test",
    "npm run lint",
    "npm run build"
  ],

  // UI
  "theme": "dark",
  "confirmBeforeRun": true
}
```

---

## 3. 효과적인 단축키 사용

### 3.1 기본 단축키

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Shift + Tab` (2회) | Plan Mode 진입 | Mac/Windows 공통 |
| `Alt + M` | 모드 전환 (Windows) | Normal → Auto → Plan |
| `/config` | 설정 열기 | 대화형 설정 인터페이스 |
| `Ctrl + C` | 작업 중단 | 진행 중인 작업 취소 |

### 3.2 모드 전환 패턴

```
┌─────────────────────────────────────────────────────────────┐
│                    모드 전환 순환                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Shift+Tab 한 번:  Edit Mode → Auto-accept Mode             │
│  Shift+Tab 두 번:  Edit Mode → Plan Mode                    │
│  계속 누르면:       Edit → Auto → Plan → Edit → ...         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 커스텀 단축키 설정 (미지원)

현재 Claude Code는 **단축키 커스터마이징을 지원하지 않습니다.**

GitHub Issue [#5885](https://github.com/anthropics/claude-code/issues/5885)에서 커스터마이징 요청이 논의 중입니다.

**현재 해결 방법:**
- OS 단축키 설정 도구 사용
- Claude Code 기본 단축키에 익숙해지기

### 3.4 효율적인 단축키 사용 팁

**1. Plan Mode를 기본으로 설정**
```json
// .claude/settings.json
{
  "defaultMode": "plan"
}
```

**2. 모드 상태 확인**
- 우측 상단에 현재 모드 표시됨
- **Edit**: 일반 모드
- **Auto**: 자동 승인 모드
- **Plan**: 계획 모드

**3. 빠른 모드 전환**
```
Plan Mode로 작업 중 즉시 구현 필요 시:
1. Esc로 Plan Mode 종료
2. Shift+Tab으로 Edit Mode로 전환
3. 즉시 구현 시작
```

---

## 4. CLAUDE.md 활용

### 4.1 CLAUDE.md란?

**정의:** 프로젝트의 규칙, 컨텍스트, 패턴을 Claude에게 전달하는 **영구적 메모리**

**핵심 역할:**
- 프로젝트 구조 설명
- 코딩 규칙 및 스타일 가이드
- 아키텍처 패턴
- 워크플로우 지침

### 4.2 CLAUDE.md 계층 구조

Claude Code는 **중첩된 CLAUDE.md 파일**을 지원합니다:

```
project/
├── CLAUDE.md                    # 프로젝트 전체 규칙
├── src/
│   ├── CLAUDE.md                # src 폴더 규칙 (우선순위 높음)
│   ├── components/
│   │   ├── CLAUDE.md            # components 규칙 (더 높음)
│   │   └── Button.tsx
│   └── lib/
│       └── utils.ts
└── docs/
    └── CLAUDE.md                # docs 규칙
```

**우선순위:** 더 구체적인 위치의 CLAUDE.md가 우선

### 4.3 효과적인 CLAUDE.md 구조

**프로젝트 루트 CLAUDE.md:**

```markdown
# 프로젝트 설정

## 프로젝트 개요
Next.js 16 기반 일본 시장을 위한 전자상거래 사이트

## 기술 스택
- 프레임워크: Next.js 16 (App Router)
- UI: React 19, TypeScript, Tailwind CSS 4
- 상태 관리: Zustand
- 데이터베이스: Supabase

## 코딩 규칙

### 파일 명명
- 컴포넌트: PascalCase (Button.tsx)
- 유틸리티: camelCase (useAuth.ts)
- 상수: UPPER_SNAKE_CASE (API_ENDPOINTS.ts)

### 컴포넌트 구조
```tsx
// 1. Imports
// 2. Types
// 3. Component function
// 4. Hooks
// 5. Event handlers
// 6. Render
```

### 스타일 가이드
- Tailwind CSS 클래스 사용
- 컴포넌트별 styles 폴더 금지
- 다크 모드 지원 필수

## Plan Mode 사용 지침

### Plan Mode를 사용해야 하는 경우
- 새로운 페이지 추가 (3개 이상 파일)
- 데이터베이스 스키마 변경
- 인증 시스템 수정

### Plan Mode 불필요
- 단순 버그 수정
- 스타일 조정
- 텍스트 변경

## 주요 패턴

### 데이터 가져오기
```typescript
// 서버 컴포넌트에서
async function getData() {
  const supabase = createClient()
  const { data } = await supabase.from('table').select()
  return data
}
```

### 에러 처리
```typescript
// try-catch와 사용자 피드백
try {
  // API 호출
} catch (error) {
  toast.error('오류가 발생했습니다')
}
```

## 테스트
- E2E: Playwright
- 단위 테스트: 우선순위 P0 기능만

## 배포 전 체크리스트
- [ ] Lighthouse 점수 90+
- [ ] E2E 테스트 통과
- [ ] TypeScript 에러 없음
```

### 4.4 하위 CLAUDE.md 예시

**`src/components/CLAUDE.md`:**

```markdown
# 컴포넌트 규칙

## 공통 패턴

### 버튼 컴포넌트
```tsx
import { Button } from '@/components/ui/button'

// 기본
<Button>클릭</Button>

// 변형
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
```

### 폼 컴포넌트
- React Hook Form 사용
- Zod로 스키마 검증
- 에러 메시지는 한국어

## 파일 구조
```
components/
├── ui/              # 재사용 가능한 기본 컴포넌트
├── forms/           # 폼 컴포넌트
└── features/        # 기능별 컴포넌트
```
```

### 4.5 CLAUDE.md 베스트 프랙티스

**✅ 좋은 CLAUDE.md:**
1. **구체적:** "TypeScript를 쓰세요" → "함수는 모두 TypeScript로 작성"
2. **예시 포함:** 코드 예시로 패턴 명확히
3. **계층적:** 루트 + 하위 폴더별 규칙
4. **간결:** 핵심 규칙만 포함 (5분 내 읽기 가능)

**❌ 나쁜 CLAUDE.md:**
1. **모호:** "좋은 코드를 작성하세요"
2. **너무 길:** 50페이지 분량의 문서
3. **예시 없음:** 텍스트 설명만
4. **불필요한 내용:** "회사 역사", "팀 소개"

---

## 5. Hooks 설정

### 5.1 Hooks란?

**정의:** 특정 이벤트 전후에 자동으로 실행되는 스크립트

**지원되는 Hooks:**
- `preEdit`: 코드 수정 전
- `postEdit`: 코드 수정 후
- `prePlan`: Plan Mode 진입 전
- `postPlan`: Plan Mode 종료 후
- `preBash`: Bash 명령 실행 전
- `postBash`: Bash 명령 실행 후

### 5.2 Hooks 설정 예시

**`.claude/settings.json`:**

```json
{
  "hooks": {
    // Plan Mode 진입 전
    "prePlan": "git status --short",

    // Plan Mode 종료 후
    "postPlan": "echo 'Plan saved to: {plan_file}'",

    // 코드 수정 전
    "preEdit": "git diff --name-only",

    // 코드 수정 후
    "postEdit": "npm run lint -- --fix"
  }
}
```

### 5.3 실용적인 Hooks 사용 사례

**1. Plan Mode 전 현재 상태 확인:**
```json
{
  "hooks": {
    "prePlan": "git status && git log -1 --oneline"
  }
}
```

**2. Plan Mode 후 계획 자동 커밋:**
```json
{
  "hooks": {
    "postPlan": "git add plans/ && git commit -m 'Add implementation plan'"
  }
}
```

**3. 코드 수정 후 자동 포맷팅:**
```json
{
  "hooks": {
    "postEdit": "npx prettier --write **/*.{ts,tsx}"
  }
}
```

**4. Bash 명령 실행 전 확인:**
```json
{
  "hooks": {
    "preBash": "echo 'Running: {command}'"
  }
}
```

### 5.4 Hooks 제한 사항

**현재 제한:**
- Hooks는 **settings.json에만 배치 가능**
- MCP 서버 내에서는 사용 불가 (GitHub Issue [#6981](https://github.com/anthropics/claude-code/issues/6981))
- 변수 치환은 제한적 (`{plan_file}`, `{command}` 등만 지원)

---

## 6. 사용 시점 결정

### 6.1 Plan Mode 사용 의사결정 트리

```
┌─────────────────────────────────────────────────────────────┐
│                  작업 복잡도 평가                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
                ┌─────────────────────────┐
                │  파일 수정 수가 3개 이상?  │
                └─────────────────────────┘
                      │              │
                     NO             YES
                      │              │
                      ↓              ↓
            ┌────────────────┐   ┌─────────────────┐
            │단일 파일 수정인가?│   │여러 접근 방식 존재?│
            └────────────────┘   └─────────────────┘
                 │       │            │        │
                YES      NO          YES      NO
                 │       │            │        │
                 ↓       ↓            ↓        ↓
              바로    Plan Mode    Plan Mode  아키텍처
              구현    사용 권장    사용      결정 필요?
                                            │       │
                                           YES      NO
                                            │       │
                                            ↓       ↓
                                        Plan Mode  복잡한가?
                                        사용 권장    │       │
                                                   YES      NO
                                                    │       │
                                                    ↓       ↓
                                                Plan Mode  바로
                                                사용 권장  구현
```

### 6.2 Plan Mode를 사용해야 하는 경우 ✅

| 상황 | 이유 | 예시 |
|------|------|------|
| **새로운 기능 구현** | 아키텍처 설계 필요 | "사용자 알림 시스템 추가" |
| **3개 이상 파일 수정** | 영향도 분석 필요 | "인증 로직 전체 개편" |
| **여러 유효한 접근 방식** | 최적 방식 선택 필요 | "상태 관리: Zustand vs Redux" |
| **복잡한 리팩토링** | 순서와 의존성 중요 | "클래스 → 함수형 컴포넌트 전환" |
| **데이터베이스 스키마 변경** | 마이그레이션 계획 필요 | "사용자 테이블 구조 변경" |

### 6.3 Plan Mode가 불필요한 경우 ❌

| 상황 | 이유 | 예시 |
|------|------|------|
| **단순 버그 수정** | 명백한 수정 사항 | `count + 1 → count + 2` |
| **단일 파일 변경** | 영향 범위 작음 | "버튼 색상 변경" |
| **스타일 조정** | CSS만 수정 | "패딩 10px → 20px" |
| **텍스트 수정** | 내용만 변경 | "에러 메시지 수정" |
| **순수 탐색** | 정보만 필요 | "이 프로젝트의 인증 방식은?" |

### 6.4 Plan Mode 사용 빈도

**실용적인 가이드라인:**

```
┌─────────────────────────────────────────────────────────────┐
│                   Plan Mode 사용 빈도                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  대형 프로젝트 (새 기능):   30-50% 작업에서 Plan Mode        │
│  중형 프로젝트 (유지보수):  10-20% 작업에서 Plan Mode        │
│  소형 프로젝트 (버그 수정):   5-10% 작업에서 Plan Mode       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**핵심:** Plan Mode를 모든 작업에 사용하면 **너무 느려집니다.** 복잡한 작업에만 선택적으로 사용하세요.

---

## 7. 효과적인 워크플로우

### 7.1 기본 Plan Mode 워크플로우

```
┌─────────────────────────────────────────────────────────────┐
│              1. 작업 정의                                    │
│   "사용자 프로필 페이지에 다크 모드를 추가해줘"              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              2. Plan Mode 진입                               │
│   Shift+Tab 두 번 또는 "계획을 세워줘"라고 요청             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              3. 코드베이스 탐색                              │
│   • Glob: **/*profile* 검색                                 │
│   • Grep: "theme", "dark" 패턴 검색                         │
│   • Read: 기존 테마 구조 분석                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              4. 계획 수립                                    │
│   plans/20251231-dark-mode-profile.md 생성                  │
│   - 1단계: 테마 컨텍스트 확장                               │
│   - 2단계: 프로필 페이지 다크 모드 스타일                    │
│   - 3단계: 토글 버튼 추가                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              5. 계획 검토 및 승인                            │
│   • 계획 내용 확인                                           │
│   • 수정 필요 시 피드백                                     │
│   • 승인 시 "진행해줘"                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              6. 구현 실행                                    │
│   • 계획에 따라 단계별 구현                                 │
│   • 각 단계 완료 후 검증                                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 프로젝트별 Plan Mode 워크플로우

```
큰 기능 작업
    ↓
Plan Mode 진입 (접근 방식 탐색)
    ↓
계획 승인 후 구현
    ↓
단계별 검증

작은 수정 작업
    ↓
바로 Edit Mode로 구현
```

### 7.3 팀 협업 워크플로우

```
┌─────────────────────────────────────────────────────────────┐
│                 1. PRD 공유 (Slack/Notion)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              2. Plan Mode로 계획 수립                        │
│   plans/feature-name.md (Git 커밋)                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              3. 팀 리뷰 (Pull Request)                       │
│   • 계획 검토                                                │
│   • 피드백 및 수정                                          │
│   • 승인                                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              4. 구현 및 테스트                                │
│   • 계획에 따라 구현                                         │
│   • 코드 리뷰                                                │
│   • 병합                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 고급 팁

### 8.1 Plan Mode 성능 최적화

**1. 불필요한 탐색 제한**
```markdown
# CLAUDE.md에 추가

## Plan Mode 탐색 범위
- node/ 폴더 제외
- .next/ 폴더 제외
- 테스트 파일은 tests/ 폴더만 탐색
```

**2. 계획 파일 관리**
```bash
# 정기적으로 오래된 계획 정리
find plans/ -name "*.md" -mtime +30 -delete

# 완료된 계획 보관
mkdir -p plans/archive
mv plans/2025-*.md plans/archive/
```

**3. 계획 파일을 Git에 커밋**
```bash
# .gitignore에 plans/ 제외하지 않기
# 계획은 문서로서 가치 있음

git add plans/
git commit -m "Add plan for user authentication"
```

### 8.2 Plan Mode와 Subagent 결합

**Explore Agent와 함께 사용:**
```
사용자: "이 프로젝트의 인증 구조를 파악해서 계획을 세워줘"

Claude:
1. Explore Agent 실행 → 전체 코드베이스 구조 파악
2. Plan Mode 진입 → 인증 시스템 계획 수립
3. 계획 기반으로 구현
```

### 8.3 계획 파일 템플릿

**`plan-template.md`:**

```markdown
# [기능 이름] 구현 계획

**작성일:** YYYY-MM-DD
**상태:** Draft

## 배경
이 기능이 필요한 이유와 문제 맥락

## 접근 방식

### 단계 1: [단계 이름]
- [ ] 하위 작업 1
- [ ] 하위 작업 2

### 단계 2: [단계 이름]
- [ ] 하위 작업 1
- [ ] 하위 작업 2

## 고려사항
- 보안:
- 성능:
- 접근성:

## 예상 결과
- 기능 동작:
- 테스트:

## 참고 자료
- 관련 문서:
- 유사 구현:
```

### 8.4 Plan Mode 자동화

**1. 복잡한 작업 자동 감지:**
```json
// .claude/settings.json
{
  "autoPlanMode": true,  // 복잡한 작업 자동 감지
  "planModeThreshold": {
    "fileCount": 3,
    "complexity": "medium"
  }
}
```

**2. 문서 변경 감지:**
```bash
# 문서 파일 변경 감지 시 자동 Plan Mode 진입
fswatch -o docs/requirements.md | xargs -n1 echo "Requirements changed - consider Plan Mode"
```

### 8.5 Plan Mode 출력 커스터마이징

**계획 형식 가이드:**

```markdown
# CLAUDE.md에 추가

## Plan Mode 계획 형식

계획은 다음 섹션을 포함해야 함:

1. **개요:** 2-3문단으로 작업 목적 설명
2. **접근 방식:** 단계별 구현 계획 (체크리스트)
3. **파일 목록:** 수정/생성할 파일 목록
4. **의존성:** 필요한 의존성 및 설치 명령어
5. **테스트:** 테스트 계획
6. **롤백:** 문제 발생 시 롤백 계획

계획은 간결해야 함 (500단어 이하 권장)
```

---

## 9. 문제 해결

### 9.1 Plan Mode가 자동으로 실행됨

**증상:**
```
Plan Mode를 요청하지 않았는데 자동으로 진입함
```

**원인:**
- 작업이 복잡하다고 Claude가 판단
- `autoPlanMode: true` 설정

**해결 방법:**
1. `.claude/settings.json` 확인:
```json
{
  "autoPlanMode": false  // 자동 진입 비활성화
}
```

2. 작업을 더 작게 분할

### 9.2 계획 파일이 저장되지 않음

**증상:**
```
Plan Mode에서 계획을 작성했는데 파일이 없음
```

**원인:**
- `plans/` 디렉토리가 없음
- 쓰기 권한 문제

**해결 방법:**
```bash
# plans 디렉토리 생성
mkdir -p plans/

# Git 추적 설정
git add plans/
git commit -m "Add plans directory"

# CLAUDE.md에 경로 명시
# Plan Mode 계획은 plans/ 디렉토리에 저장됨
```

### 9.3 Plan Mode 후 즉시 실행됨

**증상:**
```
계획을 검토할 기회 없이 바로 구현됨
```

**원인:**
- ExitPlanMode 동작 방식
- GitHub Issue [#6109](https://github.com/anthropics/claude-code/issues/6109)

**해결 방법:**
1. CLAUDE.md에 명시적 지시사항 추가:
```markdown
## Plan Mode 동작
- 계획 작성 후 반드시 사용자 승인을 기다릴 것
- "승인" 또는 "진행"이라는 확답이 있을 때만 구현 시작
```

2. 계획 요청 시 명확히 지시:
```
"계획만 세워줘. 구현은 하지 말고 승인을 기다려줘."
```

### 9.4 Plan Mode가 너무 느림

**증상:**
```
Plan Mode에서 코드베이스 탐색에 시간이 너무 오래 걸림
```

**원인:**
- 너무 큰 코드베이스
- 불필요한 폴더 탐색
- 과도한 세부 분석

**해결 방법:**

1. **탐색 범위 제한:**
```markdown
# CLAUDE.md

## Plan Mode 탐색 범위
- node/ 제외
- .next/ 제외
- dist/ 제외
- build/ 제외
- src/ 폴더에 집중
```

2. **초점 범위 지정:**
```
"src/auth/ 폴더에서만 계획을 세워줘"
```

3. **Glob 패턴 활용:**
```
"**/*auth*.ts 파일만 검색해서 계획을 세워줘"
```

---

## 10. 참고 자료

### 10.1 공식 문서

| 리소스 | URL |
|--------|-----|
| Claude Code 공식 문서 | https://code.claude.com/docs/en/common-workflows |
| Claude Code Settings | https://code.claude.com/docs/en/settings |
| Best Practices (Anthropic) | https://www.anthropic.com/engineering/claude-code-best-practices |

### 10.2 튜토리얼 및 가이드

| 리소스 | URL |
|--------|-----|
| Plan Mode 심층 분석 | https://lucumr.pocoo.org/2025/12/17/what-is-plan-mode/ |
| Mastering Plan Mode | https://tomas-svojanovsky.medium.com/mastering-plan-mode-in-claude-code-the-ai-workflow-every-developer-should-use-879a12998865 |
| 33 Claude Code Setup Tips | https://pageai.pro/blog/31-claude-code-setup-tips |
| 20 Tips to Master Claude Code | https://creatoreconomy.so/p/20-tips-to-master-claude-code-in-35-min-build-an-app |

### 10.3 동영상

| 리소스 | URL |
|--------|-----|
| Plan Mode 사용법 | https://www.youtube.com/watch?v=rwW1NtdZogw |
| 47 Pro Tips in 9 Minutes | https://www.youtube.com/watch?v=TiNpzxoBPz0 |
| Real Engineering Workflow | https://www.youtube.com/watch?v=kZ-zzHVUrO4 |

### 10.4 커뮤니티

| 리소스 | URL |
|--------|-----|
| Reddit r/ClaudeAI | https://www.reddit.com/r/ClaudeAI/ |
| Reddit r/ClaudeCode | https://www.reddit.com/r/ClaudeCode/ |
| GitHub Awesome Claude Code | https://github.com/hesreallyhim/awesome-claude-code |

### 10.5 GitHub Issues

| 이슈 | 내용 |
|------|------|
| [#5885](https://github.com/anthropics/claude-code/issues/5885) | 단축키 커스터마이징 요청 |
| [#6109](https://github.com/anthropics/claude-code/issues/6109) | ExitPlanMode 동작 논의 |
| [#6981](https://github.com/anthropics/claude-code/issues/6981) | MCP 서버에서 Hooks 허용 요청 |

---

## 부록: 빠른 참조

### A. 단축키 요약

| 단축키 | 기능 |
|--------|------|
| `Shift+Tab` (2회) | Plan Mode 진입 |
| `/config` | 설정 열기 |
| `Ctrl+C` | 작업 중단 |
| `Esc` | Plan Mode 종료 |

### B. 설정 파일 위치

| 파일 | 위치 | 범위 |
|------|------|------|
| 전역 설정 | `~/.claude/settings.json` | 모든 프로젝트 |
| 프로젝트 설정 | `.claude/settings.json` | 현재 프로젝트 |
| 프로젝트 규칙 | `CLAUDE.md` | 현재 프로젝트 및 하위 폴더 |

### C. Plan Mode 사용 체크리스트

작업 시작 전 다음을 확인하세요:

- [ ] 3개 이상 파일을 수정하나요?
- [ ] 아키텍처 결정이 필요한가요?
- [ ] 여러 유효한 접근 방식이 있나요?
- [ ] 복잡한 리팩토링인가요?

**3개 이상 YES면 Plan Mode 사용을 고려하세요.**

### D. 모드 비교

| 모드 | 특징 | 사용 시점 |
|------|------|----------|
| **Edit Mode** | 일반 편집, 승인 필요 | 대부분의 작업 |
| **Auto-accept Mode** | 자동 승인, 빠름 | 신뢰할 수 있는 작업 |
| **Plan Mode** | 읽기 전용, 계획 수립 | 복잡한 작업 |

---

*이 문서는 2025년 12월 31일에 작성되었습니다. 최신 정보는 공식 문서를 참조하세요.*
