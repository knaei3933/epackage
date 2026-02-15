# EPACKAGE Lab AI 데이터 추출 시스템 - 구현 요약

## 개요

이 문서는 Adobe Illustrator .ai 파일에서 제품 사양 정보를 자동 추출하는 AI 시스템의 구현 내용을 요약합니다.

---

## 1. 생성된 파일

### 1.1 설계 문서
- **경로:** `docs/ai-extraction-system-design.md`
- **내용:** 전체 시스템 설계, 기술 솔루션 비교, 아키텍처, API 명세, 데이터 모델

### 1.2 TypeScript 타입 정의
- **경로:** `src/types/ai-extraction.ts`
- **내용:** 추출 데이터, 검증 결과, API 요청/응답 타입 (전체 ~500줄)

### 1.3 AI 추출 코어 라이브러리
- **경로:** `src/lib/ai-parser/core.ts`
- **내용:** AIExtractionEngine 클래스, AI 모델 연동, 데이터 검증

### 1.4 API 라우트
- **경로:** `src/app/api/ai-parser/`
- **파일들:**
  - `extract/route.ts` - 파일 업로드 및 추출
  - `validate/route.ts` - 데이터 검증
  - `approve/route.ts` - 최종 승인
  - `reprocess/route.ts` - 일괄 재처리

---

## 2. 기술 스택

```yaml
Backend:
  - Next.js 16 (App Router)
  - TypeScript 5
  - Supabase (Database + Storage)

AI/ML:
  - OpenAI GPT-4 Vision API (1차 모델)
  - Anthropic Claude 3.5 Sonnet (2차 모델/폴백)
  - LangChain (향상된 오케스트레이션)

Frontend:
  - React 19
  - React Hook Form
  - Tailwind CSS
```

---

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    관리자    │  │  파일 업로드 │  │  데이터 검증 │          │
│  │   대시보드   │  │      UI      │  │      UI      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Layer                              │
│  POST /api/ai-parser/extract  │  GET /api/ai-parser/status/:id  │
│  POST /api/ai-parser/validate │ POST /api/ai-parser/approve     │
│  POST /api/ai-parser/reprocess │                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Processing Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   File       │  │     AI       │  │   Data       │          │
│  │   Converter  │─▶│   Vision     │─▶│   Validator  │          │
│  │              │  │   Analyzer   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Storage & Database                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Supabase    │  │   files      │  │  production  │          │
│  │  Storage     │  │   테이블     │  │  _data       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Cloud      │  │    OpenAI    │  │  Anthropic   │          │
│  │  Convert     │  │   GPT-4V     │  │   Claude     │          │
│  │   API        │  │    API       │  │    API       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 추출 데이터 구조

### 4.1 ExtractedProductData

```typescript
interface ExtractedProductData {
  dimensions: {
    width_mm: number;        // 30-500mm
    height_mm: number;       // 30-500mm
    gusset_mm?: number;      // 0-200mm (optional)
  };
  materials: {
    raw: string;             // "PET12μ+AL7μ+PET12μ+LLDPE60μ"
    layers: MaterialLayer[];
    total_thickness_microns: number;
  };
  options: {
    zipper: boolean;
    zipper_type?: 'standard' | 'rezip' | 'child_resistant';
    notch: 'V' | 'U' | 'round' | 'none';
    corner_round: `R${number}` | 'none';
    hang_hole: boolean;
    hang_hole_type?: 'round' | 'oval' | 'euro';
    valve?: boolean;
  };
  colors: {
    mode: 'CMYK' | 'PANTONE' | 'SPOT_COLOR' | 'HYBRID';
    front_colors: ColorSpec[];
    back_colors?: ColorSpec[];
    color_stations: number;
    varnish?: {
      type: 'matte' | 'gloss' | 'spot_uv' | 'soft_touch';
      location: 'full' | 'partial' | 'none';
    };
  };
  design_elements: {
    logos: LogoElement[];
    text: TextElement[];
    graphics: GraphicElement[];
  };
  print_specifications: {
    resolution_dpi: number;  // 150-600
    color_mode: ColorMode;
    bleed_mm: number;        // 0-10
    print_type: 'flexographic' | 'rotogravure' | 'digital';
  };
  notes?: string;
}
```

---

## 5. API 엔드포인트

### 5.1 파일 업로드 및 추출

```http
POST /api/ai-parser/extract
Content-Type: multipart/form-data

FormData:
  file: File (.ai, .pdf, .psd)
  order_id: string
  data_type?: string
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid",
    "status": "processing",
    "uploaded_at": "2025-12-31T10:00:00Z",
    "estimated_completion": "2025-12-31T10:03:00Z"
  }
}
```

### 5.2 상태 확인

```http
GET /api/ai-parser/extract/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "uuid",
    "status": "completed",
    "progress": 100,
    "extracted_data": { ... },
    "validation_errors": []
  }
}
```

### 5.3 검증

```http
POST /api/ai-parser/validate
Content-Type: application/json

{
  "file_id": "uuid",
  "manual_data": { ... },
  "corrections": [ ... ]
}
```

### 5.4 승인

```http
POST /api/ai-parser/approve
Content-Type: application/json

{
  "file_id": "uuid",
  "approved_data": { ... },
  "create_work_order": true,
  "notes": "확인 완료"
}
```

### 5.5 재처리

```http
POST /api/ai-parser/reprocess
Content-Type: application/json

{
  "file_ids": ["uuid1", "uuid2"],
  "reason": "AI 모델 업데이트",
  "force_reextract": true
}
```

---

## 6. 구현 단계

### Phase 1: MVP (2-3주)

- [x] 타입 정의 완료
- [x] AI 추출 엔진 코어 구현
- [x] API 엔드포인트 구현
- [ ] 파일 변환 기능 (.ai → PDF → 이미지)
- [ ] 관리자 UI 개발
- [ ] 통합 테스트

### Phase 2: Hybrid (6-8주)

- [ ] 멀티 모달 AI 앙상블
- [ ] 고급 검증 엔진
- [ ] 워크플로우 자동화
- [ ] 대기열 시스템

### Phase 3: Adobe API (4-6주)

- [ ] Adobe Illustrator API 연동
- [ ] 벡터 데이터 직접 추출
- [ ] 완전 자동화

---

## 7. 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# OpenAI API (GPT-4 Vision)
OPENAI_API_KEY=sk-...

# Anthropic API (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# CloudConvert API (可选)
CLOUDCONVERT_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 8. 데이터베이스 마이그레이션

```sql
-- files 테이블 확장
ALTER TABLE files
ADD COLUMN ai_extraction_status VARCHAR(20)
  CHECK (ai_extraction_status IN ('pending', 'processing', 'completed', 'failed', 'needs_revision'));

ALTER TABLE files
ADD COLUMN ai_extraction_data JSONB;

ALTER TABLE files
ADD COLUMN ai_confidence_score DECIMAL(3,2);

ALTER TABLE files
ADD COLUMN ai_extraction_method VARCHAR(50);

ALTER TABLE files
ADD COLUMN ai_extracted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE files
ADD COLUMN ai_validation_errors JSONB;

ALTER TABLE files
ADD COLUMN metadata JSONB;

-- 인덱스
CREATE INDEX idx_files_ai_extraction_status ON files(ai_extraction_status);
CREATE INDEX idx_files_ai_confidence_score ON files(ai_confidence_score);

-- production_data 테이블 관계
ALTER TABLE production_data
ADD COLUMN ai_extraction_id UUID REFERENCES files(id);
```

---

## 9. 비용 분석

### Phase 1 (월 기준)

| 항목 | 비용 |
|------|------|
| OpenAI GPT-4 Vision | $30-50 |
| CloudConvert | $2 |
| Supabase Storage | ~$0 |
| **합계** | **¥5,000-10,000** |

### 개발 비용

- Phase 1: ¥1,200,000 - ¥1,800,000
- Phase 2: ¥3,000,000 - ¥4,200,000
- Phase 3: ¥2,400,000 - ¥3,600,000

---

## 10. 다음 단계

1. **Supabase Storage 버킷 생성**
   ```bash
   버킷명: design-files
   액세스: 공개 (public URL 가능)
   ```

2. **환경 변수 설정**
   - `.env.local`에 API 키 추가

3. **데이터베이스 마이그레이션 실행**
   ```sql
   -- Supabase SQL Editor에서 실행
   ```

4. **관리자 UI 개발**
   - 파일 업로드 컴포넌트
   - 추출 결과 표시
   - 검증/수정 UI

5. **테스트**
   - 샘플 .ai 파일로 테스트
   - 정확도 검증

---

## 11. 참고 자료

- [OpenAI GPT-4 Vision Documentation](https://platform.openai.com/docs/guides/vision)
- [Anthropic Claude 3.5 Sonnet](https://docs.anthropic.com/claude/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [CloudConvert API](https://cloudconvert.com/api/v2)

---

**문서 버전:** 1.0
**작성일:** 2025-12-31
**상태:** 구현 완료 (Phase 1 기본 기능)
