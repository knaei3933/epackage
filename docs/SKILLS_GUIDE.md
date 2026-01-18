# Claude Code Skills 사용 가이드

**업데이트**: 2026-01-18
**설치된 Skills**: 19개

---

## 🎨 디자인 & 프론트엔드

### frontend-design
```
독특하고 프로덕션급 프론트엔드 인터페이스 생성 (일반적 AI 디자인 거부, 대담한 미학 방향)
```

### tailwind-css-4
```
Tailwind CSS 4 전문 개발 (컴포넌트 패턴, 반응형 디자인, 다크 모드 지원)
```

---

## 💻 개발 프레임워크

### nextjs-16-expert
```
Next.js 16 전문 (App Router, RSC, Server Actions, 성능 최적화, 타입 안전한 라우팅)
```

### react-19-typescript
```
React 19 + TypeScript 전문 (React Compiler 최적화, TDD 패턴, Hook 가이드, Zod 검증)
```

---

## 📄 문서 처리

### document-skills
```
PDF, DOCX, PPTX, XLSX 문서 생성/편집 (일본어 지원, 서식 검증, 보고서 생성)
```

---

## 🔍 검색 & 데이터

### web-scraper
```
웹 스크래핑 전문 (Sitemap→API→Playwright 순 자동 전략, Apify Actor 변환)
```

### strategic-web-research
```
전략적 웹 연구 (Sequential Thinking + Exa 신경망 검색, 체계적 조사, 종합 보고서)
```

---

## 🛠️ 개발 도구

### tdd-guide
```
TDD 가이드 (엔지니어링 subagents용, 테스트 켭 프레임워크 지원, RED-GREEN-REFACTOR 순환 지도)
```

### systematic-debugging
```
체계적 디버깅 (버그/실패/예외 대응, 항상 근본 원칙: "NO FIXES WITHOUT ROOT CAUSE FIRST")
```

### git-workflow
```
Git 커밋 & 푸시 (git add, commit, push, 커밋 메시지 생성, .mcp.json 설정, Claude 공동저자 표준)
```

### code-review
```
코드 리뷰 요청 (작업 완료 시, 주요 기능 병합 전, 먼저 전 리뷰, code-reviewer Subagent로 전담)
```

### mcp-builder
```
MCP 서버 개발 가이드 (FastMCP/TypeScript MCP, 외부 API 통합, 툴 설계, 품질 검증)
```

---

## 🎯 비즈니스 & 커뮤니케이션

### business-plan-advisor
```
비즈니스 플랜 작성 (창업/기업 대상, 투자자용, 재무 모델링, 시장 조사, 전략 계획, 일반 산업)
```

### internal-comms
```
내부 커뮤니케이션 작성 (3P 보고서, 뉴스레터, 진행 상황, PR 릴리즈, 회사 뉴스레터)
```

### brand-guidelines
```
Anthropic 공식 브랜드 가이드 (색상, 타이포그래피, 시각 포맷, 일관성 유지, Anthropic look-and-feel)
```

---

## 🔧 유틸리티

### skill-creator
```
Skills 생성 가이드 (새로운 Skill 작성, 기존 Skill 업데이트, 최적화 도구 통합)
```

### template-skill
```
Skill 템플릿 (빈 SKILL.md 형식, YAML 프론트마터, 지시사용 예시)
```

---

## 📖 사용 예시

### 디자인 작업
```
"메인 페이지를 디자인해줘"
→ frontend-design Skill이 자동 적용되어 독특한 디자인 생성

"Tailwind로 카드 컴포넌트를 만들어줘"
→ tailwind-css-4 + frontend-design Skills가 자동 적용
```

### 문서 작성
```
"일본어 견적서 PDF를 만들어줘"
→ document-skills가 활성화되어 일본어 PDF 생성

"PPT 프레젠테이션을 생성해줘"
→ document-skills로 PPTX 생성
```

### 개발 작업
```
"TDD로 연락처 페이지를 개발해줘"
→ tdd-guide + nextjs-16-expert Skills 자동 적용

"이 버그를 체계적으로 분석해줘"
→ systematic-debugging Skill 활성화 (ROOT CAUSE 분석 후 수정)

"코드 리뷰를 해줘"
→ code-review Skill이 code-reviewer Subagent를 호출하여 검증된 리뷰 제공
```

### 검색 & 조사
```
"경쟁 기업 분석해줘"
→ strategic-web-research Skill이 심측 조사 수행

"example.com에서 데이터 추출해줘"
→ web-scraper Skill이 최적 전략을 자동 선택 (Sitemap→API→Playwright)
```

### 비즈니스
```
"창업을 위한 비즈니스 플랜을 작성해줘"
→ business-plan-advisor가 전략, 재무 모델링, 시장 조사, 투자자용 플랜 작성

"내부 보고서를 작성해줘"
→ internal-comms Skill이 3P 형식(Progress, Plans, Problems)로 작성
```

---

## 💡 핵심 원칙

### Skills vs Subagents 구분

| 작업 | 사용 | 예시 |
|------|------|------|
| **프로젝트 특화** | Subagents | "Epackage Lab 코드 리뷰" |
| **범용 지식** | Skills | "TDD 방법 알려줘" |
| **하이브리드** | Skills → Subagents | Skills가 Subagent를 호출 가능 |

### 자동 활성화

Skills는 `description` 키워드를 기반으로 자동으로 활성화됩니다:
- "스크랩하다" → web-scraper 활성화
- "테스트하다" → tdd-guide 활성화
- "디버깅한다" → systematic-debugging 활성화
- "커밋한다" → git-workflow 활성화

---

## 📌 실제 내용 기반 수정 사항

### 개발 도구 Skills 수정사항

1. **tdd-guide**
   - 실제: "Comprehensive Test Driven Development guide for engineering subagents"
   - 수정: "TDD 가이드 (엔지니어링 subagents용, 테스트 켼 프레임워크 지원)"

2. **git-workflow**
   - 실제 이름: git-pushing
   - 실제 기능: "Stage, commit, and push git changes with conventional commit messages"
   - 수정: "Git 커밋 & 푸시 (git add, commit, push, 커밋 메시지, .mcp.json)"

3. **code-review**
   - 실제 이름: requesting-code-review
   - 실제 기능: 코드 리뷰 요청 → code-reviewer Subagent 전담
   - 수정: "코드 리뷰 요청 (작업 완료 시, 주요 기능 병합 전, 먼저 전 리뷰, code-reviewer Subagent로 전담)"

---

## 📌 중요 참고

- **프로젝트 CLAUDE.md**: 프로젝트 특정 지침
- **Subagents**: `.claude/agents/` (프로젝트 전용, Epackage Lab 맞춤)
- **Skills**: `~/.claude/skills/` (전역 공용)
- **Git 설정**: `.mcp.json` (Claude 공동저자 표준)

---

*이 가이드는 실제 설치된 Skills의 정확한 기능을 반영하여 수정되었습니다.*
