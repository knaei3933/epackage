# PDF 생성 시스템 설계 요약

**프로젝트**: EPACKAGE Lab PDF 문서 생성 시스템
**버전**: 1.0
**작성일**: 2025-12-31
**상태**: 설계 완료, 구현 대기

---

## 문서 목록

| 문서 | 경로 | 설명 |
|------|------|------|
| **시스템 설계** | `docs/pdf-system-design.md` | 전체 시스템 개요, 기술 스택, 아키텍처 |
| **기술 스택 비교** | `docs/pdf-tech-stack-comparison.md` | 라이브러리 비교, 벤치마크, 권장 사양 |
| **API 명세서** | `docs/pdf-api-specification.md` | 모든 API 엔드포인트, 요청/응답 형식 |
| **데이터 흐름** | `docs/pdf-data-flow-and-storage.md` | 데이터 흐름, 캐싱, Storage 구조 |
| **구현 로드맵** | `docs/pdf-implementation-roadmap.md` | 5주 구현 계획, 작업 분할 |

---

## 핵심 설계 내용

### 1. 기술 스택 (최종 권장)

```yaml
견적서 (Quotation):
  Library: ExcelJS + xlsx-render + Puppeteer
  Template: Excel (.xlsx)
  Output: PDF (A4)
  Reason: Vercel 친화적, 일본어 완벽, 비용 효율

사양서 (Spec Sheet):
  Library: Puppeteer + HTML Template
  Template: React Component
  Output: PDF (A4, multi-page)
  Reason: 완벽한 일본어 지원, 쉬운 유지보수

계약서 (Contract):
  Library: Puppeteer + Canvas Signature + pdf-lib
  Template: HTML
  Output: PDF (A4, signed)
  Reason: 완전한 제어, 법적 준수 가능

Storage:
  - Supabase Storage (pdf-documents bucket)
  - Vercel KV (Redis caching)

Fonts:
  - Noto Sans JP (Google Fonts)
  - 완벽한 일본어 렌더링
```

### 2. API 엔드포인트

```yaml
견적서:
  GET /api/b2b/quotations/:id/pdf
  GET /api/b2b/quotations/batch-pdf (일괄)

사양서:
  GET /api/b2b/work-orders/:id/pdf
  GET /api/b2b/work-orders/:id/versions

계약서:
  GET /api/b2b/contracts/:id/pdf
  POST /api/b2b/contracts/:id/sign
  GET /api/b2b/contracts/:id/verify

공통:
  GET /api/b2b/documents/:id/download
  GET /api/b2b/documents/:id/preview
  GET /api/b2b/documents/:id/download-history
```

### 3. 데이터 흐름

```
사용자 요청
  → API Routes (인증/권한)
    → 캐시 확인 (Redis)
      → PDF Service (캐시 미스 시)
        → Database (데이터 조회)
          → PDF Generation (Excel/HTML → PDF)
            → Supabase Storage (업로드)
              → 캐시 저장
                → Signed URL 반환
                  → 사용자 다운로드
```

### 4. Storage 구조

```
pdf-documents/
├── quotations/2025/
├── work-orders/2025/
├── contracts/
│   ├── drafts/
│   ├── signed/
│   └── archive/
└── temp/
```

### 5. 캐싱 전략

```yaml
Key Format: pdf:{document_type}:{id}:{version}
TTL:
  - Draft: 1 hour
  - Sent: 24 hours
  - Approved: 7 days
  - Signed: 30 days
Invalidation:
  - 문서 수정 시 자동
  - 버전 변경 시 자동
```

---

## 구현 일정

### Week 1-2: 기반 구축 + 견적서 PDF
- 라이브러리 설치
- Supabase Storage 설정
- Excel 템플릿 처리
- PDF API 구현

### Week 3: 사양서 PDF
- HTML 템플릿
- 다중 페이지 렌더링
- 버전 관리

### Week 4: 계약서 및 서명
- 계약서 HTML
- Canvas 서명
- 서명 API

### Week 5: 최적화 및 배포
- 캐싱 구현
- 테스트
- 프로덕션 배포

---

## 비용 예상

| 항목 | 프리플랜 | 프로 플랜 |
|------|---------|----------|
| Vercel Hosting | $0 | $20/월 |
| Vercel KV (Redis) | - | $5/월 |
| Supabase Storage | $0.02/GB | $0.02/GB |
| 총 비용 | **$0** | **$25/월** |

---

## 성공 기준

- PDF 생성 시간: < 5초 (95백분위)
- API 응답: < 500ms (캐시 히트 시)
- 일본어 렌더링: 100% 완벽
- 가용성: 99.9% (월간)
- 초기 비용: $0 (개발만)

---

## 참고 자료

### 문서 템플릿
- Excel 견적서: `templet/quotation-epackage-lab.xlsx`
- 데이터 매핑: `templet/quote_data_mapping.md`
- 사양서: `templet/final_spec_sheet.md`
- 계약서: `templet/contract_ja_kanei_trade_improved.html`

### 기존 코드
- Database types: `src/types/database.ts`
- API routes: `src/app/api/b2b/quotations/route.ts`
- Supabase client: `src/lib/supabase.ts`

---

## 다음 단계

### 즉시 시작 (Week 1 Day 1)

```bash
# 1. 브랜치 생성
git checkout -b feature/pdf-generation-system

# 2. 라이브러리 설치
npm install exceljs puppeteer xlsx-render pdf-lib

# 3. 개발 서버 시작
npm run dev

# 4. 첫 번째 테스트
# src/lib/pdf/__tests__/pdf.service.test.ts
```

### 문서 순서

1. **먼저 읽기**: `docs/pdf-system-design.md`
2. **기술 이해**: `docs/pdf-tech-stack-comparison.md`
3. **API 구현**: `docs/pdf-api-specification.md`
4. **데이터 설계**: `docs/pdf-data-flow-and-storage.md`
5. **구현 계획**: `docs/pdf-implementation-roadmap.md`

---

## 연락처

**개발자**: Frontend Developer Agent (Claude)
**프로젝트**: EPACKAGE Lab
**위치**: `C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1`

---

**문서 상태**: 설계 완료, 구현 승인 대기

**최종 업데이트**: 2025-12-31
