# 코드 리뷰 문서 구조

## 📁 전체 구조

```
docs/code-review-2025-01-18/
├── README.md                      # 이 문서 (전체 지도)
├── pages/                        # 페이지 분석
│   └── structure.md
├── api/                         # API 라우트 분석
│   └── routes-categorized.md
├── components/                  # 컴포넌트 분석
│   └── structure.md
├── database/                    # 데이터베이스 분석
│   └── supabase-analysis.md
├── security/                    # 보안 리뷰
│   └── security-review.md
├── findings/                    # 발견사항 및 권장사항
│   └── gaps-and-recommendations.md
├── verification/                # 검증 결과 (신규)
│   └── (스킬 기반 검증 결과)
└── SUMMARY.md                   # 전체 요약
```

## 📖 문서 가이드

### 1. 전체 개요 보기
**파일**: `SUMMARY.md`
- 프로젝트 규모, 아키텍처, 주요 발견사항
- 우선순위별 조치 계획
- **처음에 읽을 문서**

### 2. 페이지 구조 분석
**폴더**: `pages/`
- **파일**: `structure.md`
- **내용**: 93개 페이지의 카테고리별 분류
  - 공개 페이지 (37개)
  - 인증 페이지 (8개)
  - 회원 페이지 (23개)
  - 관리자 페이지 (25개)

### 3. API 라우트 분석
**폴더**: `api/`
- **파일**: `routes-categorized.md`
- **내용**: 191개 API 라우트의 기능별 분류
  - 인증 API (7개)
  - 주문 API (21개)
  - 견적 API (15개)
  - 관리자 API (51개)
  - 회원 기능 API (44개)
  - 기타 (53개)

### 4. 컴포넌트 구조
**폴더**: `components/`
- **파일**: `structure.md`
- **내용**: 305개 컴포넌트의 카테고리별 분류
  - 관리자 (30+)
  - 인증 (7)
  - B2B (8+)
  - UI 컴포넌트 (15+)
  - 기타 (200+)

### 5. 데이터베이스 연결 분석
**폴더**: `database/`
- **파일**: `supabase-analysis.md`
- **내용**: Supabase 연결 방식별 상세 분석
  - 브라우저 클라이언트
  - 서비스 클라이언트
  - 쿠키 기반 클라이언트
  - MCP 래퍼
  - 인증 시스템

### 6. 보안 리뷰
**폴더**: `security/`
- **파일**: `security-review.md`
- **내용**: 보안 취약점 분석 및 권장사항
  - 🔴 치명적 문제 (SQL 인젝션, MCP API, 서비스 키)
  - 🟡 경고 (에러 메시지, 레이트 리밋, 타입 단언)
  - 🟢 권장사항 (환경 변수, CSRF, 헤더)

### 7. 기능 격차 및 권장사항
**폴더**: `findings/`
- **파일**: `gaps-and-recommendations.md`
- **내용**: 미구현 기능 및 개선 권장사항
  - MCP 통합 미완성
  - API 인증 미들웨어
  - 에러 핸들링 표준화
  - 페이지네이션, 캐시, 타입 정의

## 🎯 빠른 링크

### 주요 문서로 바로가기
| 관심사 | 문서 | 경로 |
|--------|------|------|
| 전체 개요 | `SUMMARY.md` | [링크](../SUMMARY.md) |
| SQL 인젝션 취약점 | `security/security-review.md` | [링크](../security/security-review.md#sql-인젝션) |
| MCP API 무방비 | `security/security-review.md` | [링크](../security/security-review.md#mcp-api) |
| Supabase 연결 | `database/supabase-analysis.md` | [링크](../database/supabase-analysis.md) |
| API 라우트 목록 | `api/routes-categorized.md` | [링크](../api/routes-categorized.md) |
| 컴포넌트 목록 | `components/structure.md` | [링크](../components/structure.md) |

## 🔄 최신 업데이트

- **생성일**: 2025-01-18
- **분석 범위**: 전체 소스 코드 (816파일)
- **분석 도구**: Claude Code Reviewer

## 📊 통계

### 코드베이스 규모
- **총 파일**: 816개 (TS/TSX)
- **코드 라인**: ~50,000+ 라인 (추정)
- **페이지**: 93개
- **API 라우트**: 191개
- **컴포넌트**: 305개
- **DB 테이블**: 30+개

### 보안 문제
- **치명적**: 4건
- **높은 우선순위**: 4건
- **권장사항**: 10+건
