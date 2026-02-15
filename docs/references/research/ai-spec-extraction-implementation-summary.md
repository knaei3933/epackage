# AI 사양 추출 시스템 - 구현 요약

## 개요

Adobe Illustrator .ai 파일에서 포장재 제품 사양을 자동 추출하는 시스템의 설계 및 기본 구현을 완료했습니다.

## 구현된 파일

### 1. 설계 문서
- **경로**: `docs/ai-spec-extraction-system-design.md`
- **내용**: 전체 시스템 아키텍처, 알고리즘, 성능 최적화 방안

### 2. 타입 정의
- **경로**: `src/lib/ai-parser/types.ts`
- **내용**: 모든 모듈에서 사용하는 타입 정의 (50+ 인터페이스)

### 3. 치수 추출 모듈
- **경로**: `src/lib/ai-parser/dimensions-extractor.ts`
- **기능**:
  - 봉투 타입 식별 (스탠드, 박스, 갓셋 등)
  - 치수 계산 (W×H×G, mm 단위)
  - 노치, 지퍼, 걸이 구멍 위치 추출
  - 다이 라인 감지

### 4. 신뢰도 스코어링
- **경로**: `src/lib/ai-parser/confidence-scorer.ts`
- **기능**:
  - 추출 항목별 신뢰도 계산 (0-100%)
  - 검증 플래그 생성 (error/warning/info)
  - 비용 최적화 제안

### 5. API 엔드포인트
- **경로**: `src/app/api/ai-parser/upload/route.ts`
- **기능**: .ai 파일 업로드 처리
- **지원**: 최대 50MB, .ai/.pdf 파일

### 6. 데이터베이스 스키마
- **경로**: `supabase/migrations/20250101_create_ai_parser_tables.sql`
- **테이블**:
  - `ai_uploads`: 파일 업로드 기록
  - `ai_specs`: 추출된 사양
  - `ai_parse_logs`: 파싱 로그
  - `ai_parser_checkpoints`: 롤백 지원
  - `ai_performance_metrics`: 성능 모니터링

## 시스템 아키텍처

```
클라이언트 (Next.js)
    ↓
API 레이어 (/api/ai-parser/*)
    ↓
AI 파싱 서비스 (추가 구현 필요)
    ├─ PDF 파서 (pdf2json)
    ├─ 경로 분석기 (dimensions-extractor)
    ├─ 신뢰도 계산기 (confidence-scorer)
    └─ OCR 엔진 (tesseract.js, 선택적)
    ↓
Supabase (데이터 저장)
```

## 핵심 기능

### 1. 치수 추출
- **봉투 타입**: 6개 유형 식별 (스탠드, 박스, 평면, 갓셋, 지퍼백, 3면 시일)
- **치수 계산**: 백터 경로의 bounding box 분석
- **단위 변환**: Adobe Illustrator points → mm (1pt = 0.352778mm)

### 2. 가공 정보 추출
- **지퍼**: 텍스트 라벨 + 평행선 패턴 매칭
- **노치**: 작은 원형/사각형 패턴 인식
- **걸이 구멍**: 상단 작은 원형 / 유로 슬롯(T자형)

### 3. 신뢰도 기반 검증
- **점수화**: 0-100% 스코어
- **플래그**: error (<50%), warning (<70%), info
- **자동 교정 제안**: 예) CMYK로 변경하여 비용 절감

## 기술 스택

### 현재 구현
- TypeScript, Next.js 16
- Supabase (데이터베이스)
- Zod (스키마 검증)

### 추가 필요 패키지
```bash
npm install pdf2json pdf-parse sharp svg-path-parser
npm install tesseract.js  # OCR (선택적)
```

## 다음 단계

### Phase 1: PDF 파싱 (미구현)
- [ ] pdf2json 연동
- [ ] PDF → JSON 변환
- [ ] 텍스트/경로/이미지 추출

### Phase 2: 소재/인쇄 추출 (미구현)
- [ ] MaterialExtractor 클래스
- [ ] PrintingExtractor 클래스
- [ ] ProcessingExtractor 클래스

### Phase 3: 클라이언트 UI (미구현)
- [ ] 파일 업로드 컴포넌트
- [ ] 추출 결과 프리뷰
- [ ] 수동 수정 UI
- [ ] 진행 상태 표시

### Phase 4: 파싱 파이프라인 (미구현)
- [ ] 메인 파서 클래스
- [ ] 에러 처리 및 롤백
- [ ] 비동기 작업 큐

## 사용 예시

```typescript
// 1. 파일 업로드
const formData = new FormData();
formData.append('file', aiFile);
formData.append('priority', 'detailed');

const response = await fetch('/api/ai-parser/upload', {
  method: 'POST',
  body: formData,
});

const { uploadId, estimatedTime } = await response.json();

// 2. 상태 폴링
const status = await fetch(`/api/ai-parser/status/${uploadId}`);
const result = await status.json();

// 3. 결과 확인
if (result.specs) {
  console.log('봉투 타입:', result.specs.dimensions.envelopeType);
  console.log('치수:', result.specs.dimensions.width, 'x', result.specs.dimensions.height);
  console.log('신뢰도:', result.specs.confidence.overall, '%');
}
```

## 성능 목표

| 항목 | 목표 | 현재 |
|------|------|------|
| 파일 파싱 시간 | < 30초 | - |
| 신뢰도 평균 | > 80% | - |
| 치수 정확도 | > 90% | - |
| 소재 식별률 | > 70% | - |

## 제한사항

1. **PDF 기반 .ai 파일만 지원**: CS6 이상에서 저장한 파일만 가능
2. **완벽한 정확도 불가**: 항상 수동 검증 필요
3. **복잡한 디자인**: 레이어가 많거나 효과가 많은 파일은 신뢰도 낮음
4. **OCR 선택적**: 텍스트 추출 실패 시 OCR 사용 (성능 저하)

## 비용 추정

### 개발
- 총 7주 예상
- 개발 비용: ~$30,000

### 인프라 (월간)
- Vercel: $0 (Hobby)
- Supabase: $25/월
- Storage: $5/월
- **월간 소계**: ~$30

## 결론

기본 설계와 핵심 모듈의 구조를 완성했습니다. 다음 단계로:

1. **PoC 개발**: 간단한 .ai 파일로 테스트
2. **PDF 파싱 연동**: pdf2json 통합
3. **UI 개발**: 업로드 및 프리뷰 컴포넌트
4. **테스트 및 개선**: 실제 파일로 정확도 측정

시스템은 확장 가능하도록 설계되었으며, 점진적 구현이 가능합니다.
