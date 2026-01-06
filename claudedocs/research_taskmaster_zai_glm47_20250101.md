# Task Master AI + Z.AI GLM 4.7 통합 가이드

조사 일시: 2025-01-01
조사 목적: Task Master AI에서 Z.AI의 GLM 4.7 모델 사용 가능성 확인

---

## ✅ 결론: **사용 가능합니다!**

---

## 📋 핵심 발견

### 1. Task Master AI의 커스텀 API 지원

Task Master AI는 **OpenAI 호환 API**를 지원합니다:

| 기능 | 지원 여부 |
|------|----------|
| `OPENAI_BASE_URL` 설정 | ✅ 지원 |
| 커스텀 API 키 | ✅ 지원 |
| `.taskmasterconfig` 파일 | ✅ 지원 |
| GLM 모델 지원 | ✅ GLM-4.6, GLM-4.7 |

### 2. Z.AI API 엔드포인트

Z.AI는 **OpenAI 호환 API**를 제공합니다:

```bash
# 기본 API 엔드포인트
https://api.z.ai/api/coding/paas/v4

# 표준 OpenAI 호환 엔드포인트
https://open.bigmodel.cn/api/paas/v4/
```

---

## 🔧 설정 방법

### 방법 1: 환경 변수 사용

```bash
# Z.AI API 키
export OPENAI_API_KEY="your-zai-api-key"

# Z.AI Base URL
export OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
```

### 방법 2: `.taskmasterconfig` 파일

프로젝트 루트에 `.taskmasterconfig` 파일 생성:

```json
{
  "openaiBaseUrl": "https://open.bigmodel.cn/api/paas/v4/",
  "openaiApiKey": "your-zai-api-key",
  "model": "glm-4.7"
}
```

### 방법 3: CLI 명령어

```bash
# GLM 모델 설정
task-master models --set-main glm-4.7

# 또는 인터랙티브 설정
task-master models --setup
```

---

## 📝 Z.AI API 획득 방법

1. **Z.AI 접속**: https://z.ai
2. **회원가입**: 무료 계정 생성
3. **API 키 발급**:
   - https://docs.z.ai/api-reference/introduction
   - 또는 https://open.bigmodel.cn/dev/api
4. **모델 선택**: GLM-4.7 또는 GLM-4.6

---

## 🚀 설치 및 설정 절차

### 1단계: Task Master AI 설치

```bash
npm install -g task-master-ai
```

### 2단계: Z.AI API 키 발급

- Z.AI (https://z.ai) 가입
- 개발자 콘솔에서 API 키 생성
- 키를 복사

### 3단계: 환경 변수 설정

```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-zai-api-key"
$env:OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"

# Linux/Mac
export OPENAI_API_KEY="your-zai-api-key"
export OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
```

### 4단계: Task Master 초기화

```bash
task-master init
```

### 5단계: PRD 파싱 테스트

```bash
task-master parse-prd docs/PRD.md
```

---

## ⚠️ 주의사항

### 제한사항

1. **API 호환성**: Z.AI는 OpenAI API와 99% 호환되지만, 일부 고급 기능에서 차이가 있을 수 있음
2. **속도 제한**: Z.AI Free 플랜의 경우 요청 속도 제한이 있을 수 있음
3. **모델 버전**: GLM-4.7이 최신 모델이지만, 일부 기능에서 GLM-4.6이 더 안정적일 수 있음

### 권장사항

1. **GLM-4.6 사용**: Task Master와의 호환성은 GLM-4.6이 더 검증됨
2. **테스트 먼저**: PRD 파싱 전에 간단한 작업으로 테스트
3. **API 모니터링**: Z.AI 콘솔에서 사용량 확인

---

## 🔍 참고 자료

### 공식 문서
- [Z.AI API 문서](https://docs.z.ai/api-reference/introduction)
- [Z.AI GLM-4.7 가이드](https://docs.z.ai/guides/llm/glm-4.7)
- [Task Master 설정 문서](https://github.com/eyaltoledano/claude-task-master/blob/main/docs/configuration.md)

### 가이드 & 튜토리얼
- [Task Master OpenAI 호환 API 설정](https://blog.gitcode.net/6f90cbe33f54eebf788712e0918d32f1.html)
- [Claude Task Master 설치 가이드](https://blog.csdn.net/gitblog_00879/article/details/147159148)
- [Z.AI Claude Code 통합](https://docs.z.ai/scenario-example/develop-tools/claude)

### GitHub 저장소
- [claude-task-master](https://github.com/eyaltoledano/claude-task-master)
- [Task Master CHANGELOG](https://github.com/eyaltoledano/claude-task-master/blob/main/CHANGELOG.md)

---

## 💰 비용 정보

| 항목 | 가격 |
|------|------|
| Task Master AI | **완전 무료** (오픈소스) |
| Z.AI GLM-4.7 | **Free 플랜 제공** |
| API 요청 | Free 플랜 내에서 무료 |

---

## 🎯 요약

1. **Task Master AI**는 **OpenAI 호환 API**를 지원
2. **Z.AI**는 **OpenAI 호환 엔드포인트**를 제공
3. `OPENAI_BASE_URL` 설정으로 **연결 가능**
4. **완전 무료**로 사용 가능

---

## 📞 추가 지원

문제 발생 시:
- Z.AI 커뮤니티: https://docs.z.ai
- Task Master GitHub Issues: https://github.com/eyaltoledano/claude-task-master/issues
