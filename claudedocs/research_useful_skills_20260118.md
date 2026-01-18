# 유용한 Claude Code Skills 추천 - 코딩, PDF, 유틸리티

**연구일**: 2026-01-18
**신뢰도**: 높음 (공식 문서 + 커뮤니티 리소스 기반)

---

## 요약

코딩, PDF 처리, 개발 워크플로우 자동화에 추천되는 Claude Code Skills를 종합적으로 조사했습니다.

---

## 1. 코딩 & 개발 관련 Skills

### 🔥 추천 Top 5

| Skill | 용도 | 출처 | 추천도 |
|--------|------|------|--------|
| **TDD Skill** | 테스트 주도 개발 | karanb192 | ⭐⭐⭐⭐⭐ |
| **Systematic Debugging** | 체계적 디버깅 | VoltAgent | ⭐⭐⭐⭐⭐ |
| **Code Review** | PR 리뷰 자동화 | Anthropic | ⭐⭐⭐⭐⭐ |
| **Git Workflows** | 커밋 메시지 자동화 | 다양 | ⭐⭐⭐⭐⭐ |
| **MCP Builder** | MCP 서버 생성 | Anthropic | ⭐⭐⭐⭐ |

### 상세 설명

#### TDD (Test-Driven Development)
- **특징**: 테스트가 작성되지 않은 코드는 자동 삭제
- **기능**: RED-GREEN-REFACTOR 순환 자동화
- **장점**: 밤새 자동으로 테스트와 코드 생성
- **출처**: [karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills)

#### Systematic Debugging
- **특징**: 근본 원인 분석 후 수정 제안
- **기능**: 로그 분석, 스택 트레이스 분석
- **장점**: 자율적 버그 수정
- **출처**: [VoltAgent/awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills)

#### Code Review
- **특징**: 팀 표준에 맞는 PR 리뷰
- **기능**: 자동화된 코드 리뷰
- **장점**: 일관된 피드백
- **출처**: Anthropic 공식 Skills

#### Git Workflows
- **특징**: 커밋 메시지 자동 생성
- **기능**: Git hooks 연동
- **장점**: 팀 규칙 자동 강제
- **다양한 출처**: 커뮤니티 Skills

---

## 2. PDF & 문서 처리 Skills

### 🔥 추천 Top 3

| Skill | 포맷 | 출처 | 추천도 |
|--------|------|------|--------|
| **document-skills** | PDF, DOCX, PPTX, XLSX | Anthropic 공식 | ⭐⭐⭐⭐⭐ |
| **claude-office-skills** | PDF, DOCX, PPTX, XLSX | tfriedel | ⭐⭐⭐⭐⭐ |
| **pdf-processing** | PDF 전문 | 다양 | ⭐⭐⭐⭐ |

### Anthropic 공식 document-skills

**설치 방법**:
```bash
/plugin marketplace add anthropics/skills
# Browse → Install Plugins → anthroic-agent-skills
# → document-skills 또는 example-skills
```

**지원 포맷**:
- **PDF**: 텍스트 추출, 폼 작성, 문서 병합
- **DOCX**: Word 문서 생성/편집
- **PPTX**: 프레젠테이션 생성
- **XLSX**: 엑셀 처리

### tfriedel/claude-office-skills

**특징**:
- Claude Desktop에서 사용하는 것과 동일한 Office 문서 Skills
- Claude Code CLI용으로 패키징
- PDF, DOCX, PPTX, XLSX 지원

**출처**: [tfriedel/claude-office-skills](https://github.com/tfriedel/claude-office-skills)

### PDF 처리 기능

**주요 기능**:
- 텍스트 추출 및 분석
- 지능형 폼 인식/작성
- 픽셀级 좌표 정밀 조작
- 문서 처리 자동화

**관련 자료**:
- [Claude Skills 硬核技巧：PDF-Skill](https://www.bilibili.com/read/cv43764480/)
- [How to automate PDF parsing with Claude skills](https://www.linkedin.com/posts/jerry-liu-64390071_claude-skills-give-coding-agents-the-ability-activity-7385106676145827842--hFv)

---

## 3. 유틸리티 & 생산성 Skills

### 🔥 추천 Top 7

| Skill | 용도 | 출처 | 추천도 |
|--------|------|------|--------|
| **frontend-design** | 독특한 디자인 | Anthropic | ⭐⭐⭐⭐⭐ |
| **skill-creator** | Skill 생성 | Anthropic | ⭐⭐⭐⭐⭐ |
| **mcp-builder** | MCP 서버 | Anthropic | ⭐⭐⭐⭐⭐ |
| **brand-guidelines** | 브랜드 가이드 | Anthropic | ⭐⭐⭐⭐ |
| **internal-comms** | 내부 커뮤니케이션 | Anthropic | ⭐⭐⭐⭐ |
| **business-plan-advisor** | 비즈니스 플랜 | Anthropic | ⭐⭐⭐⭐ |
| **strategic-web-research** | 웹 연구 | Anthropic | ⭐⭐⭐⭐ |

### 상세 설명

#### skill-creator
- **용도**: 다른 Skill 생성
- **기능**: 문서를 Skill로 자동 변환
- **특징**: GitHub 저장소, PDF에서도 Skill 생성

#### mcp-builder
- **용도**: MCP 서버 생성 가이드
- **기능**: FastMCP, TypeScript MCP 지원
- **특징**: 커스텀 도구 생성

#### brand-guidelines
- **용도**: 브랜드 색상, 타이포그래피 적용
- **기능**: 일관된 브랜드 아이덴티티

#### internal-comms
- **용도**: 내부 커뮤니케이션 생성
- **기능**: 상태 보고, 리더싱 업데이트

#### business-plan-advisor
- **용도**: 비즈니스 플랜 작성
- **기능**: 투자자용 비즈니스 플랜

#### strategic-web-research
- **용도**: 웹 연구 수행
- **기능**: 시장 조사, 경쟁 분석

---

## 4. 추천 조합 (사용 시나리오별)

### 시나리오 1: 풀스택 개발자
```
✓ frontend-design        # 프론트엔드 디자인
✓ nextjs-16-expert        # Next.js 전문
✓ react-19-typescript     # React + TypeScript
✓ tailwind-css-4          # 스타일링
✓ document-skills         # 문서 처리
✓ mcp-builder             # MCP 서버
```

### 시나리오 2: 데이터 분석가
```
✓ document-skills         # PDF, Excel 처리
✓ strategic-web-research   # 웹 연구
✓ skill-creator           # 자동화
```

### 시나리오 3: 문서 처리 전문가
```
✓ claude-office-skills    # Office 문서
✓ document-skills         # PDF 처리
✓ internal-comms          # 보고서 작성
```

### 시나리오 4: 스타트업 창업가
```
✓ business-plan-advisor   # 비즈니스 플랜
✓ brand-guidelines        # 브랜딩
✓ strategic-web-research   # 시장 조사
✓ frontend-design         # 프로토타이입
```

### 시나리오 5: 품질 엔지니어
```
✓ TDD                     # 테스트 주도 개발
✓ Systematic Debugging    # 디버깅
✓ Code Review             # 코드 리뷰
```

---

## 5. 설치 방법

### 공식 Anthropic Skills

```bash
# 마켓플레이스 추가
/plugin marketplace add anthropics/skills

# 설치 가능한 Skills 목록
# 1. "Browse and install plugins" 선택
# 2. "anthropic-agent-skills" 선택
# 3. Skills 선택:
#    - document-skills
#    - example-skills
# 4. "Install now" 클릭

# 또는 직접 설치
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```

### 커뮤니티 Skills

```bash
# GitHub에서 다운로드
git clone https://github.com/tfriedel/claude-office-skills.git

# 또는 curl로 직접 다운로드
curl -L https://raw.githubusercontent.com/[repo]/main/SKILL.md -o ~/.claude/skills/[skill-name]/SKILL.md
```

### 이미 설치된 Skills 확인

```bash
ls -la ~/.claude/skills/
```

---

## 6. 참고 자료

### 공식 문서
- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Building Skills for Claude Code](https://claude.com/blog/building-skills-for-claude-code)
- [Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

### GitHub 저장소
- [anthropics/skills](https://github.com/anthropics/skills) - 공식 Skills
- [tfriedel/claude-office-skills](https://github.com/tfriedel/claude-office-skills) - Office 문서
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) - 커레이션
- [VoltAgent/awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills) - 커레이션
- [karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills) - 50+ Skills

### 기사 & 가이드
- [Awesome Claude Code Skills for Document Processing](https://apidog.com/blog/claude-skills-for-document-processing/)
- [Complete Guide to Claude Skills — 10 Essential Skills](https://medium.com/@hunterzhang86/complete-guide-to-claude-skills-10-essential-skills-explained-c556c9e1e80a)
- [Claude Code Must-Haves 2026](https://blog.mayflower.de/25215-claude-code-must-haves-2026.html)
- [My LLM coding workflow going into 2026](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)

### 커뮤니티
- [Reddit: I tested 30+ community Claude Skills](https://www.reddit.com/r/ClaudeAI/comments/1ok9v3d/i_tested_30_community_claude_skills_for_a_week/)
- [Reddit: Must-have skills?](https://www.reddit.com/r/ClaudeCode/comments/1q0n9jo/musthave_skills/)

---

## 7. 요약 비교

### 카테고리별 Best

| 카테고리 | 추천 Skill | 설치 방법 |
|----------|-----------|----------|
| **코딩** | TDD, Systematic Debugging | GitHub 커뮤니티 |
| **PDF** | document-skills | 공식 마켓플레이스 |
| **Office** | claude-office-skills | GitHub |
| **프론트엔드** | frontend-design | 이미 설치됨 |
| **생산성** | skill-creator, mcp-builder | 공식 마켓플레이스 |
| **비즈니스** | business-plan-advisor | 이미 설치됨 |

---

## 8. 다음 단계

### 즉시 추천
1. **document-skills** 설치 (공식 마켓플레이스)
2. **claude-office-skills** 설치 (GitHub)
3. 필요에 따라 TDD, Debugging Skills 추가

### 선택적 설치
- 개발 스타일에 맞는 Skills 선택
- 프로젝트 요구사항에 맞는 조합
- 팀 워크플로우에 맞는 커스텀 Skills

---

*이 보고서는 Claude Code 공식 문서와 커뮤니티 리소스를 바탕으로 작성되었습니다.*
