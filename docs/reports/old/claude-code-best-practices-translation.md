# Claude Code 모범 사례 번역

**원작자**: Boris Cherny (@bcherny)
**원본 날짜**: 2025년 1월 3일

---

## 1. 병렬 Claude 세션 운영

터미널에서 5개의 Claude를 병렬로 실행합니다. 탭을 1-5번으로 번호를 매기고, Claude가 입력을 필요로 할 때 시스템 알림을 사용하여 알 수 있습니다.

---

## 2. 로컬 및 웬 Claude 병행 사용

claude.ai/code에서도 5-10개의 Claude를 병렬로 실행하며, 로컬 Claude와 함께 사용합니다. 터미널에서 코딩하면서 로컬 세션을 웹으로 넘기기도 하고(& 사용), Chrome에서 수동으로 세션을 시작하기도 하며, 때로는 앞뒤로 전환하기도 합니다(--teleport).

---

## 3. 모델 선택: Opus 4.5와 Thinking

모든 것에 Opus 4.5와 thinking을 사용합니다. 이것은 내가 사용한 최고의 코딩 모델입니다. Sonnet보다 크고 느리지만, 조정할 필요가 적고 도구 사용에 더 능숙하기 때문에 결국 더 작은 모델을 사용하는 것보다 거의 항상 더 빠릅니다.

---

## 4. 팀 CLAUDE.md 공유

팀은 Claude Code 저장소용 단일 CLAUDE.md를 공유합니다. 이를 git에 체크인하고, 전체 팀이 일주일에 여러 번 기여합니다. Claude가 무언가를 잘못할 때마다 CLAUDE.md에 추가하여 Claude가 다음번에는 그렇게 하지 않도록 합니다.

### CLAUDE.md 예시

```bash
# 개발 워크플로우

**항상 `bun`을 사용하세요, `npm`이 아닙니다.**

```sh
# 1. 변경사항 적용

# 2. 타입 체크 (빠름)
bun run typecheck

# 3. 테스트 실행
bun run test -- -t "test name"    # 단일 테스트 스위트
bun run test:file -- "glob"      # 특정 파일

# 4. 커밋 전 린트
bun run lint:file -- "file1.ts"   # 특정 파일
bun run lint                      # 모든 파일

# 5. PR 생성 전
bun run lint:claude && bun run test
```
```

---

## 5. 코드 리뷰 중 CLAUDE.md 업데이트

코드 리뷰 중에 동료들의 PR에서 @claude를 태그하여 PR의 일부로 CLAUDE.md에 내용을 추가하도록 자주 합니다. 이를 위해 Claude Code Github 액션(/install-github-action)을 사용합니다. 이것은 @danshipper의 Compounding Engineering의 우리 버전입니다.

### 예시 대화

```
bcherny 3일 전
nit: 문자열 리터럴을 사용하세요, ts enum은 아니요

@claude CLAUDE.md에 추가 - enum을 사용하지 말고 항상 리터럴 유니온을 선호하세요

claude bot 3일 전 · 편집됨
Claude가 @bcherny의 작업을 39초 만에 완료했습니다 — 작업 보기

CLAUDE.md에 enum 가이드라인 추가
- 현재 CLAUDE.md를 읽어 기존 가이드라인 이해
- "enum 사용 안 함" 가이드라인 강화를 위해 CLAUDE.md 업데이트
- 변경사항 커밋

CLAUDE.md 36번째 줄을 다음에서 업데이트:
- Prefer 'type' over 'interface'; avoid 'enum' (use string unions)
다음으로:
- Prefer 'type' over 'interface'; **never** use 'enum' (use string literal unions instead)

커밋: 356a458
```

---

## 6. Plan Mode 활용

대부분의 세션은 Plan 모드(shift+tab 두 번)로 시작합니다. 제 목표가 Pull Request를 작성하는 것이라면 Plan 모드를 사용하고, Claude의 계획이 마음에 들 때까지 계속 진행합니다. 그 후 자동 수락 편집 모드로 전환하면 Claude가 보통 한 번에 완료할 수 있습니다. 좋은 계획이 정말 중요합니다.

---

## 7. 슬래시 명령어 사용

하루에 여러 번 하게 되는 모든 "내부 루프" 워크플로우에 슬래시 명령어를 사용합니다. 이것은 반복적인 프롬프트를 피하게 해주고, Claude도 이 워크플로우를 사용할 수 있게 합니다. 명령어는 git에 체크인되고 .claude/commands에 있습니다.

### 예시: /commit-push-pr

Claude와 저는 매일 /commit-push-pr 슬래시 명령어를 수십 번 사용합니다. 이 명령어는 인라인 bash를 사용하여 git 상태와 기타 몇 가지 정보를 미리 계산하여 명령어를 빠르게 실행하고 모델과의 왕복을 피합니다.

```bash
> /commit-push-pr
/commit-push-pr  Commit, push, and open a PR
```

---

## 8. 서브에이전트 활용

정기적으로 몇 개의 서브에이전트를 사용합니다. code-simplifier는 Claude 작업 완료 후 코드를 단순화하고, verify-app은 Claude Code를 엔드 투 엔드로 테스트하는 상세한 지침을 가지고 있으며, 그 외에도 다양한 에이전트가 있습니다. 슬래시 명령어와 마찬가지로, 서브에이전트는 대부분의 PR에 대해 수행하는 가장 일반적인 워크플로우를 자동화하는 것으로 생각합니다.

### 서브에이전트 예시

```
▾ .claude
▾ agents
  ▾ build-validator.md
  ▾ code-architect.md
  ▾ code-simplifier.md
  ▾ oncall-guide.md
  ▾ verify-app.md
```

---

## 9. PostToolUse Hook으로 코드 포맷팅

PostToolUse 훅을 사용하여 Claude의 코드를 포맷팅합니다. Claude는 보통 잘 포맷팅된 코드를 생성하지만, 훅은 나중에 CI에서 포맷팅 오류를 피하기 위해 마지막 10%를 처리합니다.

### 설정 예시

```json
"PostToolUse": [
  {
    "matcher": "Write|Edit",
    "hooks": [
      {
        "type": "command",
        "command": "bun run format || true"
      }
    ]
  }
]
```

---

## 10. 권한 사전 허용

--dangerously-skip-permissions를 사용하지 않습니다. 대신 /permissions를 사용하여 내 환경에서 안전하다고 알고 있는 일반적인 bash 명령어를 미리 허용하여 불필요한 권한 프롬프트를 피합니다. 대부분은 .claude/settings.json에 체크인되어 팀과 공유됩니다.

### 권한 설정 예시

```
> /permissions
Permissions: Allow Ask Deny Workspace (<//>)

Claude Code won't ask before using allowed tools.

Search...

↑ 12. Bash(bq query:*)
13. Bash(bun run build:*)
14. Bash(bun run lint:file:*)
15. Bash(bun run test:*)
16. Bash(bun run test:file:*)
17. Bash(bun run typecheck:*)
18. Bash(bun test:*)
19. Bash(cc:*)
20. Bash(comm:*)
> 21. Bash(find:*)
```

---

## 11. MCP 서버로 도구 확장

Claude Code는 제 모든 도구를 사용합니다. 종종 Slack을 검색하고 게시하며(MCP 서버 통해), BigQuery 쿼리를 실행하여 분석 질문에 답하고(bq CLI 사용), Sentry에서 오류 로그를 가져옵니다. Slack MCP 구성은 우리의 .mcp.json에 체크인되어 팀과 공유됩니다.

### .mcp.json 예시

```json
{
  "mcpServers": {
    "slack": {
      "type": "http",
      "url": "https://slack.mcp.anthropic.com/mcp"
    }
  }
}
```

---

## 12. 장기 실행 작업 처리

매우 오래 실행되는 작업의 경우 (a) 완료되면 백그라운드 에이전트로 작업을 확인하도록 Claude에 프롬프트하거나, (b) 에이전트 Stop 훅을 사용하여 더 결정론적으로 수행하거나, (c) ralph-wiggum 플러그인(원래 @GeoffreyHuntley가 고안)을 사용합니다. 또한 세션에 대한 권한 프롬프트를 피하기 위해 --permission-mode=dont-ask 또는 샌드박스에서 --dangerously-skip-permissions를 사용하여 Claude가 차단되지 않고 작업할 수 있게 합니다.

### 장기 작업 예시

```
* Reticulating... (1d 2h 47m · ↓ 2.4m tokens · thinking)
```

---

## 13. 검증 피드백 루프 구성 (가장 중요!)

Claude Code에서 훌륭한 결과를 얻기 위해 가장 중요한 것 - Claude가 작업을 검증할 수 있는 방법을 제공하세요. Claude가 이 피드백 루프를 가지고 있다면 최종 결과의 품질이 2-3배 향상됩니다.

Claude는 Claude Chrome 확장 프로그램을 사용하여 claude.ai/code에 적용하는 모든 변경 사항을 테스트합니다. 브라우저를 열고 UI를 테스트하며 코드가 작동하고 UX가 좋아질 때까지 반복합니다.

검증은 각 도메인마다 다르게 보입니다. bash 명령을 실행하거나, 테스트 스위트를 실행하거나, 브라우저나 폰 시뮬레이터에서 앱을 테스트하는 것만큼 간단할 수 있습니다. 이것을 견고하게 만드는 데 투자하세요.
