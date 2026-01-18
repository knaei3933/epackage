# 홈페이지 개발용 추천 Claude Code Skills

**연구일**: 2026-01-18
**신뢰도**: 높음 (공식 문서 + 커뮤니티 리소스 기반)

---

## 요약

홈페이지/프론트엔드 개발에 추천되는 Claude Code Skills를 공식/커뮤니티 소스에서 조사했습니다. **프론트엔드 디자인**, **React/Next.js**, **TypeScript** 중심의 Skills가 가장 높은 추천도를 보였습니다.

---

## 1. 공식 Anthropic Skills

### 🔥 frontend-design (이미 설치됨)
- **출처**: [anthropics/claude-code](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design/skills/frontend-design)
- **용도**: 독특하고 프로덕션급 프론트엔드 인터페이스 생성
- **특징**:
  - 일반적 AI 디자인 거부 (Inter, Roboto, Arial 지양)
  - 대담한 미학 방향: brutal minimal, maximalist, retro-futuristic 등
  - 독창적인 타이포그래피, 컬러, 모션, 공간 구성
- **사용 시기**: 웹 컴포넌트, 페이지, 애플리케이션 개발 시 자동 적용

### document-skills
- **출처**: [anthropics/skills](https://github.com/anthropics/skills)
- **기능**:
  - PDF 처리: 텍스트 추출, 폼 작성, 문서 병합
  - DOCX: 문서 생성 및 편집
  - PPTX: 프레젠테이션 생성
  - XLSX: 엑셀 처리
- **사용 시기**: 문서 생성/편집 기능이 필요한 홈페이지

### example-skills
- **출처**: [anthropics/skills](https://github.com/anthropics/skills)
- **포함 Skills**:
  - 창의적 응용 (art, music, design)
  - 기술 작업 (testing web apps, MCP server generation)
  - 엔터프라이즈 워크플로우 (communications, branding)

---

## 2. 프레임워크 전문 Skills

### React TypeScript Development
- **링크**: [mcpmarket - React TypeScript Development](https://mcpmarket.com/zh/tools/skills/react-typescript-development)
- **특징**:
  - React 19 패턴 마스터
  - Server Components 지원
  - Generic TypeScript hooks
  - 타입 안전한 코딩

### React Best Practices
- **링크**: [aitmpl - React Best Practices](https://www.aitmpl.com/component/skill/react-best-practices)
- **특징**:
  - 40+ 규칙 포함
  - 워터폴 제거
  - 번들 최적화
  - 렌더링 성능 개선

### Next.js Developer
- **링크**: [FastMCP - Next.js Developer](https://fastmcp.me/Skills/Details/341/nextjs-developer)
- **전문 분야**:
  - Server Components
  - Server Actions
  - 성능 최적화
  - 프로덕션 배포
  - SEO 친화적 애플리케이션

### Frontend Development Guidelines
- **링크**: [mcpmarket - Frontend Guidelines](https://mcpmarket.com/zh/tools/skills/frontend-development-guidelines)
- **특징**:
  - React/Next.js 프로젝트 최적화
  - 엔터프라이즈 패턴 강제
  - TypeScript 적용
  - 성능 베스트 프랙티스

---

## 3. 커뮤니티 추천 컬렉션

### awesome-claude-skills (다양 버전)

| 저장소 | 링크 | 특징 |
|--------|------|------|
| **travisvn** | [GitHub](https://github.com/travisvn/awesome-claude-skills) | Claude Code용 커레이티드 리스트 |
| **ComposioHQ** | [GitHub](https://github.com/ComposioHQ/awesome-claude-skills) | 실용적 Skills 중심 |
| **VoltAgent** | [GitHub](https://github.com/VoltAgent/awesome-claude-skills) | 실행 가능한 코드 포함 |
| **karanb192** | [GitHub](https://github.com/karanb192/awesome-claude-skills) | 50+ Skills 컬렉션 |
| **sickn33** | [GitHub](https://github.com/sickn33/antigravity-awesome-skills) | 131개 고성능 Skills |

### alirezarezani/claude-skills
- **링크**: [GitHub](https://github.com/alirezarezvani/claude-skills)
- **특징**:
  - Component Generator 포함
  - React + TypeScript 스캐폴딩
  - 프론트엔드 개발 중심

---

## 4. 홈페이지 개발용 추천 조합

### 🔥 핵심 3가지 (필수)

```
1. frontend-design        (이미 설치됨) - 디자인 품질
2. React Best Practices    - 성능 최적화
3. Next.js Developer       - 프레임워크 전문성
```

### 🔧 추가 추천

| 목적 | 추천 Skill |
|------|-----------|
| **타입 안전성** | React TypeScript Development |
| **엔터프라이즈 패턴** | Frontend Development Guidelines |
| **문서 처리** | document-skills |
| **컴포넌트 생성** | alirezarezani/claude-skills |

---

## 5. 설치 우선순위

### 단계 1: 핵심 (즉시 설치)

```bash
# 이미 설치됨
✓ frontend-design

# 추가 설치 권장
1. React Best Practices
2. Next.js Developer
```

### 단계 2: 프레임워크 특화

```bash
3. React TypeScript Development
4. Frontend Development Guidelines
```

### 단계 3: 유틸리티

```bash
5. document-skills
6. alirezarezani/claude-skills (컴포넌트 생성)
```

---

## 6. 설치 방법

### 공식 마켓플레이스

```bash
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

### 수동 설치

```bash
# Skills 폴더 생성
mkdir -p ~/.claude/skills/react-best-practices

# SKILL.md 다운로드
curl -L [SKILL_URL] -o ~/.claude/skills/react-best-practices/SKILL.md
```

### 플러그인 설치

```bash
/plugin install plugin-name@marketplace-name
```

---

## 7. 사용 예시

### 프론트엔드 디자인
```
"메인 페이지를 디자인해줘"
"랜딩 페이지를 만들어줘"
```
→ `frontend-design` Skill이 자동으로 적용되어 독특한 디자인 생성

### React + Next.js
```
"Next.js로 블로그 페이지를 만들어줘"
"Server Actions로 폼을 처리해줘"
```
→ `Next.js Developer` + `React Best Practices`가 자동 적용

### TypeScript
```
"타입 안전한 컴포넌트를 만들어줘"
"Generic hooks를 작성해줘"
```
→ `React TypeScript Development`가 자동 적용

---

## 8. 참고 자료

### 공식 문서
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Building Skills for Claude Code](https://claude.com/blog/building-skills-for-claude-code)
- [Improving Frontend Design Through Skills](https://claude.com/blog/improving-frontend-design-through-skills)

### GitHub 저장소
- [anthropics/claude-code](https://github.com/anthropics/claude-code) - 공식 플러그인
- [anthropics/skills](https://github.com/anthropics/skills) - 공식 Skills
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) - 커뮤니티 큐레이션

### 기사 & 가이드
- [Top 10 Claude Code Skills You Need to Know](https://apidog.com/blog/top-10-claude-code-skills/)
- [Supercharging Front-End Development with Claude Skills](https://dev.to/rio14/supercharging-front-end-development-with-claude-skills-22bj)
- [The Claude Code Plugin Starter Stack for Web Developers](https://jpcaparas.medium.com/the-claude-code-plugin-starter-stack-for-web-developers-f2d85b0335fa)

### 영상
- [How to Create Claude Code Agent Skills in 2026](https://www.youtube.com/watch?v=nbqqnl3JdR0)
- [These 5 Claude Code Skills Are Your New Unfair Advantage](https://www.youtube.com/watch?v=901VMcZq8X4)
- [These Claude Code Skills Will Help Your App Stand Out](https://www.youtube.com/watch?v=Xzivyr5wXQc)

---

## 9. 요약 비교

| Skill | 용도 | 추천도 | 설치 방법 |
|-------|------|--------|----------|
| **frontend-design** | 디자인 품질 | ⭐⭐⭐⭐⭐ | ✅ 이미 설치됨 |
| **React Best Practices** | 성능 최적화 | ⭐⭐⭐⭐⭐ | aitmpl.com |
| **Next.js Developer** | 프레임워크 | ⭐⭐⭐⭐⭐ | fastmcp.me |
| **React TypeScript** | 타입 안전성 | ⭐⭐⭐⭐ | mcpmarket.com |
| **document-skills** | 문서 처리 | ⭐⭐⭐ | 공식 마켓플레이스 |
| **Frontend Guidelines** | 엔터프라이즈 | ⭐⭐⭐⭐ | mcpmarket.com |

---

## 10. 다음 단계

### 즉시 실행
1. **세션 재시작**: `frontend-design` Skill 활성화
2. **React Best Practices** 설치: 성능 최적화
3. **Next.js Developer** 설치: 프레임워크 전문성

### 추가 작업
- 필요에 따라 다른 Skills 추가 설치
- 프로젝트별 커스텀 Skill 생성 고려

---

*이 보고서는 Claude Code 공식 문서와 커뮤니티 리소스를 바탕으로 작성되었습니다.*
