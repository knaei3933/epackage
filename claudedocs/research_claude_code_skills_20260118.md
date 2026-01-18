# Claude Code Skills 완전 가이드

**연구일**: 2026-01-18
**신뢰도**: 높음 (공식 문서 기반)

---

## 요약

Claude Code Skills는 Claude의 기능을 전문화된 지식과 워크플로우로 확장하는 시스템입니다. 사용자는 간단한 마크다운 파일로 자신만의 Skill을 만들거나, 공식 마켓플레이스에서 미리 만들어진 Skills를 설치할 수 있습니다.

---

## 1. Skills란 무엇인가?

### 정의
- **모델 호출형 (Model-invoked)**: Claude가 요청을 분석하여 자동으로 관련 Skill을 적용
- 전문 지시사항, 스크립트, 리소스가 포함된 폴더 구조
- 팀 표준, 문서 생성, 데이터 분석 등 반복 작업 자동화

### 다른 커스터마이징 방식과의 차이

| 기능 | 용도 | 실행 방식 |
|------|------|-----------|
| **Skills** | 전문 지식 제공 | Claude가 자동 선택 |
| **Slash Commands** | 재사용 가능한 프롬프트 | `/command`로 직접 호출 |
| **CLAUDE.md** | 프로젝트 전체 지시사항 | 모든 대화에 로드됨 |
| **Subagents** | 독립 컨텍스트 위임 | Claude가 위임 또는 직접 호출 |
| **MCP Servers** | 외부 도구 연결 | Claude가 필요시 호출 |

---

## 2. 설치 방법

### 방법 A: 공식 마켓플레이스에서 설치

```bash
# 마켓플레이스 추가
/plugin marketplace add anthropics/skills

# 설치 가능한 Skills 목록 확인
# 1. "Browse and install plugins" 선택
# 2. "anthropic-agent-skills" 선택
# 3. "document-skills" 또는 "example-skills" 선택
# 4. "Install now" 클릭

# 직접 설치 명령어
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

### 방법 B: 수동으로 Skills 폴더에 추가

```
~/.claude/skills/my-skill/SKILL.md          # 개인용 (모든 프로젝트)
.claude/skills/my-skill/SKILL.md            # 프로젝트용 (해당 프로젝트만)
```

### 방법 C: GitHub에서 다운로드

1. [anthropics/skills](https://github.com/anthropics/skills) 저장소 방문
2. 원하는 Skill 폴더 다운로드
3. `~/.claude/skills/` 또는 `.claude/skills/`에 배치

---

## 3. 자신만의 Skill 만들기

### 기본 구조

```
my-skill/
└── SKILL.md (필수)
```

### SKILL.md 형식

```yaml
---
name: my-skill-name
description: 이 Skill이 무엇을 하고 언제 사용하는지 명확한 설명
---

# My Skill Name

## Instructions
Claude가 따를 단계별 지시사항

## Examples
- 사용 예시 1
- 사용 예시 2

## Guidelines
- 가이드라인 1
- 가이드라인 2
```

### 필수 필드

| 필드 | 설명 | 제한 |
|------|------|------|
| `name` | Skill 식별자 | 소문자, 숫자, 하이픈만 사용, 최대 64자 |
| `description` | 설명 및 사용 시기 | 최대 1024자 |

### 선택적 필드

| 필드 | 설명 |
|------|------|
| `allowed-tools` | 허용할 도구 제한 (쉼표로 구분) |
| `model` | 사용할 모델 지정 |
| `context: fork` | 독립된 서브에이전트 컨텍스트에서 실행 |
| `agent` | fork시 사용할 에이전트 유형 |
| `hooks` | Skill 라이프사이클 훅 정의 |
| `user-invocable` | 슬래시 메뉴 표시 여부 (기본값: true) |

---

## 4. 고급 기능

### 다중 파일 구조 (진보적 공개)

```
my-skill/
├── SKILL.md              # 필수 - 개요 및 탐색
├── reference.md          # 상세 API 문서 (필요시 로드)
├── examples.md           # 사용 예시 (필요시 로드)
└── scripts/
    └── helper.py         # 유틸리티 스크립트 (실행만, 로드 안함)
```

### 도구 접근 제한

```yaml
---
name: reading-files-safely
description: 읽기 전용 파일 접근
allowed-tools: Read, Grep, Glob
---
```

### 포크된 컨텍스트 실행

```yaml
---
name: code-analysis
description: 코드 품질 분석 및 상세 보고서 생성
context: fork
agent: general-purpose
---
```

### 훅 정의

```yaml
---
name: secure-operations
description: 추가 보안 검사로 작업 수행
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh $TOOL_INPUT"
          once: true
---
```

---

## 5. 배포 방법

| 방법 | 대상 | 방식 |
|------|------|------|
| **Project Skills** | 프로젝트 협력자 | `.claude/skills/`를 버전 관리에 커밋 |
| **Plugins** | 여러 저장소 | 플러그인 마켓플레이스 배포 |
| **Managed** | 조직 전체 | 관리자가 관리 설정으로 배포 |

---

## 6. 사용 예시

### 간단한 Skill

```yaml
---
name: generating-commit-messages
description: Git diff에서 명확한 커밋 메시지 생성
---

# Generating Commit Messages

## Instructions

1. `git diff --staged` 실행으로 변경사항 확인
2. 다음을 포함하는 커밋 메시지 제안:
   - 50자 이내 요약
   - 상세 설명
   - 영향받는 컴포넌트

## Best practices
- 현재시제 사용
- 어떻게가 아니라 무엇과 왜 설명
```

### 사용 방법
```
"현재 브랜치의 변경사항을 검토해줘"
```
→ Claude가 자동으로 해당 Skill을 적용

---

## 7. 문제 해결

### Skill이 트리거되지 않을 때
**원인**: description이 너무 모호함

**해결**:
```yaml
# 나쁜 예시
description: Helps with documents

# 좋은 예시
description: Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when user mentions PDFs, forms, or document extraction.
```

### Skill이 로드되지 않을 때
1. 파일 경로 확인 (`SKILL.md` 대소문자 확인)
2. YAML 문법 확인 (공백 들여쓰기, 탭 금지)
3. 디버그 모드 실행: `claude --debug`

### 플러그인 Skills가 나타나지 않을 때
```bash
rm -rf ~/.claude/plugins/cache
/plugin install plugin-name@marketplace-name
```

---

## 8. 참고 자료

### 공식 문서
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [How to create custom Skills | Claude Help Center](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Using Skills in Claude | Claude Help Center](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

### GitHub 저장소
- [anthropics/skills](https://github.com/anthropics/skills) - 공식 Skills 저장소

### 커뮤니티 가이드
- [CLAUDE.md, skills, subagents explained](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [How to Create Custom Claude Skills: A Complete Step-by-Step Guide](https://developer.tenten.co/how-to-create-custom-claude-skills-a-complete-step-by-step-guide)
- [Inside Claude Skills: Custom Modules That Extend Claude](https://www.datacamp.com/tutorial/claude-skills)

### 영상 자료
- [How to Set Up Claude Code in 2026 (Beginner Tutorial)](https://www.youtube.com/watch?v=kddjxKEeCuM)
- [How to Create Claude Code Agent Skills in 2026](https://www.youtube.com/watch?v=nbqqnl3JdR0)

---

## 9. 요약 비교

| 항목 | 설명 |
|------|------|
| **설치** | 마켓플레이스 또는 수동 폴더 배치 |
| **구조** | `SKILL.md` + 선택적 지원 파일 |
| **실행** | Claude가 자동으로 감지 및 적용 |
| **배포** | 프로젝트, 플러그인, 조직 관리 |
| **제한** | 없음 (무제한 생성 가능) |

---

*이 보고서는 Claude Code Skills 시스템의 공식 문서와 커뮤니티 리소스를 바탕으로 작성되었습니다.*
