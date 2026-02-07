# 이미지 배경 제거 기술 조사 보고서

**조사일**: 2026년 1월 31일
**주제**: 이미지 배경 제거를 위한 MCP 서버, 라이브러리, API

---

## 📋 Executive Summary

이미지 배경 제거를 위해 **MCP 서버 7개**, **오픈소스 라이브러리 3개**, **상용 API 6개**를 발견했습니다.

**최고 추천**: **ImageSorcery MCP** - 로컬 설치, 다양한 이미지 처리 기능 지원

---

## 🚀 MCP 서버 (Claude Desktop/Cursor/Claude Code에서 직접 사용 가능)

### 1. ImageSorcery MCP ⭐ 추천

**GitHub**: [sunriseapps/imagesorcery-mcp](https://github.com/sunriseapps/imagesorcery-mcp)
**웹사이트**: [imagesorcery.net](https://imagesorcery.net/)

**기능**:
- 배경 제거
- 객체 감지 및 자르기
- 이미지 처리 및 향상
- 컴퓨터 비전 작업

**설치 방법**:
```bash
pipx install imagesorcery-mcp
imagesorcery-mcp --post-install  # 모델 다운로드
```

**Claude Desktop 설정**:
`claude_desktop_config.json`에 ImageSorcery 서버 추가

---

### 2. Rembg MCP Server

**LobeHub**: [Rembg MCP](https://lobehub.com/zh/mcp/croef-rembg-mcp)
**GitHub**: [adamryczkowski/MCP-remove-background](https://github.com/adamryczkowski/MCP-remove-background)

**기능**:
- AI 기반 배경 제거
- 다양한 이미지 유형에 최적화된 모델 옵션
- Claude Desktop, Claude Code, Cursor 호환

---

### 3. FAL AI Image Generation MCP

**링크**: [FAL AI MCP](https://mcp.aibase.cn/server/1916341322178600961)

**기능**:
- 이미지 생성
- 배경 제거
- 이미지 스케일링
- 텍스트 프롬프트에서 로고 생성

---

### 4. AI Image Background Remover (Apify)

**링크**: [Apify MCP](https://apify.com/nawaz0x1/ai-image-background-remover/api/mcp)

**기능**:
- 고품질 투명 PNG 출력
- 고급 AI 기반 배경 제거

---

### 5. Remove.bg MCP Integration

**Pipedream**: [mcp.pipedream.com](https://mcp.pipedream.com/app/remove_bg)
**Zapier**: [zapier.com](https://zapier.com/mcp/removebg)

**기능**:
- Remove.bg 서비스 연동
- Cursor, Claude, Windsurf 호환

---

### 6. n8n Background Removal API MCP

**링크**: [n8n workflow](https://n8n.io/workflows/5640-background-removal-api-mcp-server/)

**기능**:
- Background Removal API를 MCP 호환 인터페이스로 변환
- 워크플로우 템플릿 제공

---

### 7. Rembg MCP (mcpmarket)

**링크**: [mcpmarket.com](https://mcpmarket.com/zh/server/rembg-1)

**기능**:
- 번개 같은 AI 배경 제거
- 다중 모델 옵션

---

## 🐍 오픈소스 Python 라이브러리

### 1. Rembg ⭐ 가장 인기

**GitHub**: [danielgatis/rembg](https://github.com/danielgatis/rembg)
**웹사이트**: [rembg.com](https://www.rembg.com/en)

**기능**:
- CLI 도구
- Python 라이브러리
- HTTP 서버
- Docker 컨테이너

**설치**:
```bash
pip install rembg
```

**Python 버전 호환성**:
- ✅ Python 3.10, 3.11, 3.12, 3.13
- ❌ Python 3.14+ (ONNX Runtime 의존성 제한)

---

### 2. withoutBG

**웹사이트**: [withoutbg.com](https://withoutbg.com/)

**기능**:
- 무료 오픈소스 배경 제거 모델
- Pro API 제공
- Python 통합
- Docker 지원
- 프라이버시 중심

---

### 3. BackgroundRemover

**PyPI**: [backgroundremover](https://pypi.org/project/backgroundremover/)

**기능**:
- CLI 도구
- AI 기반
- 이미지 및 비디오 지원
- Python 기반

---

## 💰 상용 API 서비스

### 1. PhotoRoom API
- **최고 품질** 배경 제거
- 무료 200 크레딧
- 워터마크 옵션으로 무제한 사용

### 2. Claid Background Removal API
- 대량 배경 제거 워크플로우 최적화
- 이커머스 및 배치 처리 중심

### 3. I Hate Background API
- 빠르고 신뢰할 수 있는 배경 제거
- 최신 딥러닝 모델 기반
- 모든 크기/유형의 이미지 지원

### 4. Erase.bg
- Pixelbin.io 생태계的一部分
- 웹 도구 및 API 제공

### 5. Removal.AI
- 무료 체험 (가입 불필요)
- 몇 초 만에 배경 제거
- API 서비스 제공

### 6. Adobe Express Background Remover
- 엔터프라이즈급 솔루션
- Adobe 종합 툴 스위트的一部分

---

## 📊 비교표

| 도구 | 유형 | 비용 | 설치 난이도 | 품질 |
|------|------|------|------------|------|
| **ImageSorcery MCP** | MCP | 무료 | 중간 | 높음 |
| **Rembg MCP** | MCP | 무료 | 쉬움 | 높음 |
| **Rembg** | Python | 무료 | 쉬움 | 높음 |
| **withoutBG** | Python/API | 무료/유료 | 쉬움 | 높음 |
| **PhotoRoom API** | API | 유료(무료티어) | 쉬움 | 최고 |
| **Remove.bg** | API/MCP | 유료 | 쉬움 | 최고 |

---

## 🎯 추천사항

### Claude Desktop 사용자
**ImageSorcery MCP** 또는 **Rembg MCP** 설치 권장

### Python 개발자
**Rembg** 라이브러리 직접 사용 권장

### 빠른 통합 필요
**PhotoRoom API** 또는 **withoutBG API** 권장

### 대량 처리 필요
**Claid API** 또는 **Rembg HTTP 서버 모드** 권장

---

## 📚 참고자료

### MCP 설정 가이드
- [Cursor MCP Setup Guide 2026](https://claudefa.st/blog/tools/mcp-extensions/cursor-mcp-setup)
- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)
- [MCP Settings Tutorial](https://kento-yamazaki.medium.com/mcp-settings-tutorial-for-cursor-claude-31e5afbf97bc)

### 비디오 튜토리얼
- [Cursor+MCP 완벽 가이드 (Bilibili)](https://www.bilibili.com/video/BV1mr2MBnEp8/)
- [MCP Servers Changed Everything (YouTube)](https://www.youtube.com/watch?v=T6D27WCx1MU)

---

## ✅ 결론

이미지 배경 제거를 위한 **MCP 서버**가 이미 존재하며, Claude Code/Cursor에서 직접 사용할 수 있습니다.

**가장 추천하는 솔루션**: **ImageSorcery MCP**
- 로컬 설치로 API 비용 없음
- 다양한 이미지 처리 기능 제공
- Claude Desktop 및 Cursor와 완벽 통합
