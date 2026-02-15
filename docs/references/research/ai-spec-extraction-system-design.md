# AI 사양 추출 시스템 설계서

## 1. 시스템 개요

### 1.1 목적
Adobe Illustrator .ai 파일에서 포장재 제품 사양을 자동 추출하여 견적 프로세스 자동화 및 고객 편의성 향상

### 1.2 핵심 기능
- .ai 파일 업로드 및 파싱
- 제품 치수 자동 인식 (W×H×G, mm)
- 소재 구조 분석 (PET/AL/PE 등)
- 인쇄 정보 추출 (색상, 로고 위치)
- 가공 정보 인식 (지퍼, 노치, 걸이 구멍)
- 신뢰도 기반 검증 플로우

### 1.3 기술적 제약사항
- .ai 파일은 PDF 기반 (CS6+)
- 클라이언트측 파싱 불가 → 서버측 처리 필요
- OCR 필요 여부 검토 (텍스트 요소 추출)
- 백터 경로 분석으로 치수 계산

---

## 2. 기술 스택 선정

### 2.1 PDF/AI 파일 파싱

#### 옵션 비교

| 라이브러리 | 장점 | 단점 | 평가 |
|-----------|------|------|------|
| **pdf-parse** | 가볍고, 텍스트 추출 용이 | 백터 경로 분석 불가 | ⭐⭐⭐ |
| **pdf2json** | PDF 구조를 JSON으로 변환 | 복잡한 레이어 처리 어려움 | ⭐⭐⭐⭐ |
| **pdf-lib** | PDF 생성/수정 가능 | .ai 특수 기능 지원 제한 | ⭐⭐ |
| **Adobe PDF Embed API** | 공식 지원, 렌더링 가능 | 클라이언트용, 서버 파싱 부적합 | ⭐⭐ |
| **Custom Solution** | 완전한 제어 가능 | 개발 비용 높음 | ⭐⭐⭐⭐⭐ |

#### 최종 선정: **Hybrid Approach**
```typescript
// 1차 파싱: pdf2json으로 구조 추출
// 2차 분석: 커스텀 백터 경로 분석
// 3차 검증: OCR (Tesseract.js) - 선택적
```

### 2.2 의존성 추가

```bash
# PDF 파싱
npm install pdf2json pdf-parse

# 이미지 처리 (백터 → 래스터 변환)
npm install sharp

# OCR (필요시)
npm install tesseract.js

# 백터 경로 분석
npm install svg-path-parser

# 유틸리티
npm install lodash-es @types/lodash-es
```

### 2.3 기술 스택 명세

```typescript
// src/lib/ai-parser/package.json
{
  "dependencies": {
    "pdf2json": "^2.0.2",           // PDF → JSON 변환
    "pdf-parse": "^1.1.1",          // 텍스트 추출
    "sharp": "^0.33.0",             // 이미지 처리
    "svg-path-parser": "^1.1.2",    // SVG 경로 파싱
    "tesseract.js": "^5.0.0",       // OCR (선택적)
    "zod": "^3.22.4"                // 스키마 검증
  }
}
```

---

## 3. 아키텍처 설계

### 3.1 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     클라이언트 (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 파일 업로드   │  │ 프리뷰 렌더링│  │ 사양 편집   │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 레이어 (Next.js API)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/ai-parser/upload                            │  │
│  │ POST /api/ai-parser/extract                           │  │
│  │ POST /api/ai-parser/validate                          │  │
│  │ GET  /api/ai-parser/status/[taskId]                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI 파싱 서비스 (서버리스/API)               │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PDF 파서    │  │  경로 분석   │  │  OCR 엔진    │     │
│  │  (pdf2json)  │  │  (custom)    │  │ (tesseract)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                           │                                │
│                           ▼                                │
│  ┌──────────────────────────────────────────────────┐     │
│  │          사양 추출 및 신�뢰도 계산기              │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    데이터베이스 (Supabase)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ai_uploads   │  │ ai_specs     │  │ ai_validation│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 데이터 플로우

```
1. 파일 업로드
   사용자 → 클라이언트 → API → Supabase Storage (ai-uploads/)

2. 비동기 파싱 시작
   API → AI 파싱 서비스 → 태스크 큐

3. PDF 변환 및 초기 파싱
   AI 서비스 → pdf2json → JSON 구조 추출

4. 분석 단계 (병렬 처리)
   ├─ 텍스트 추출: pdf-parse
   ├─ 경로 분석: custom parser
   ├─ 이미지 추출: sharp
   └─ OCR: tesseract.js (선택적)

5. 사양 재구성
   추출 데이터 → 사양 매핑 → 신뢰도 계산

6. 검증 및 저장
   검증 엔진 → Supabase → 클라이언트 폴링

7. 사용자 확인
   클라이언트 → 편집 가능 UI → 최종 저장
```

---

## 4. 데이터 추출 알고리즘

### 4.1 PDF 구조 분석

```typescript
// src/lib/ai-parser/pdf-structure-analyzer.ts

interface PDFStructure {
  pages: PDFPage[];
  metadata: PDFMetadata;
}

interface PDFPage {
  width: number;       // mm 단위
  height: number;      // mm 단위
  texts: TextElement[];
  paths: PathElement[];
  images: ImageElement[];
  layers: Layer[];
}

interface TextElement {
  content: string;
  x: number;
  y: number;
  fontSize: number;
  font: string;
  color: string;       // hex
  rotation: number;
}

interface PathElement {
  d: string;           // SVG path data
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  transform: number[]; // affine transform matrix
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

### 4.2 제품 치수 추출 알고리즘

```typescript
// src/lib/ai-parser/dimensions-extractor.ts

class DimensionsExtractor {
  /**
   * 봉투 타입 인식
   * - 경로 패턴 분석
   * - 종횡비 계산
   * - 특징적 형상 매칭
   */
  identifyEnvelopeType(paths: PathElement[]): EnvelopeType {
    const aspectRatio = this.calculateAspectRatio(paths);
    const hasZipper = this.detectZipper(paths);
    const hasNotch = this.detectNotch(paths);

    if (aspectRatio > 1.5 && hasZipper) {
      return 'stand_pouch'; // 스탠드 파우치
    } else if (aspectRatio < 1.2 && hasZipper) {
      return 'box_pouch';   // 박스 파우치
    } else if (hasNotch && !hasZipper) {
      return 'gusset';      // 갓셋 봉투
    }
    // ... 추가 패턴 매칭
    return 'flat';          // 기본 평면 봉투
  }

  /**
   * 치수 계산 (mm 단위)
   * - 백터 경로의 bounding box 분석
   * - Adobe Illustrator 단위 변환 (points → mm)
   * - 다이 라인(die line) 기반 계산
   */
  calculateDimensions(
    paths: PathElement[],
    pdfScale: number
  ): Dimensions {
    // 1. 외곽선 경로 식별
    const outlinePath = this.findOutlinePath(paths);

    // 2. Bounding box 추출
    const bbox = outlinePath.boundingBox;

    // 3. Points → mm 변환 (1 point = 0.352778 mm)
    const width = bbox.width * pdfScale * 0.352778;
    const height = bbox.height * pdfScale * 0.352778;
    const gusset = this.calculateGusset(paths) * pdfScale * 0.352778;

    return {
      width: Math.round(width * 10) / 10,  // 소수점 1자리
      height: Math.round(height * 10) / 10,
      gusset: gusset > 0 ? Math.round(gusset * 10) / 10 : undefined,
    };
  }

  /**
   * 노치 위치 추출
   * - 원형/직사각형 패턴 인식
   * - 상대 좌표 계산 (왼쪽 상단 기준)
   */
  detectNotch(paths: PathElement[]): NotchInfo | null {
    const notchPattern = paths.filter(p =>
      p.stroke?.includes('red') || // 다이 라인 색상
      this.isCircularPath(p.d) ||   // 원형 노치
      this.isRectangularNotch(p.d)  // 사각 노치
    );

    if (notchPattern.length === 0) return null;

    return {
      type: this.isCircularPath(notchPattern[0].d) ? 'circle' : 'rectangle',
      position: {
        x: notchPattern[0].boundingBox.x,
        y: notchPattern[0].boundingBox.y,
      },
      size: {
        width: notchPattern[0].boundingBox.width,
        height: notchPattern[0].boundingBox.height,
      },
      confidence: 0.85,
    };
  }

  /**
   * 지퍼 위치 인식
   * - 평행선 패턴 검출
   * - 텍스트 라벨 매칭 ("ZIPPER", "ジッパー")
   */
  detectZipper(paths: PathElement[], texts: TextElement[]): ZipperInfo | null {
    // 텍스트 기반 검출
    const zipperLabels = texts.filter(t =>
      /zipper|zip|ジッパー|チャック/i.test(t.content)
    );

    // 경로 기반 검출 (평행 이중선)
    const parallelLines = this.findParallelLinePairs(paths);

    if (zipperLabels.length > 0 || parallelLines.length > 0) {
      const position = zipperLabels[0]?.y || parallelLines[0].y;

      return {
        type: 'standard', // standard, slider, etc.
        position: 'top',  // top, side, bottom
        y: position,
        length: this.calculateZipperLength(paths, position),
        confidence: 0.90,
      };
    }

    return null;
  }

  /**
   * 걸이 구멍 위치 추출
   * - 작은 원형 패턴 인식
   * - 상단 근처 위치 확인
   */
  detectHangingHole(paths: PathElement[]): HangingHoleInfo | null {
    const holes = paths.filter(p => {
      const bbox = p.boundingBox;
      const isCircular = this.isCircularPath(p.d);
      const isSmall = bbox.width < 20 && bbox.height < 20; // < 20mm
      const isNearTop = bbox.y < 50; // 상단 50mm 내

      return isCircular && isSmall && isNearTop;
    });

    if (holes.length === 0) return null;

    return {
      type: 'round',
      diameter: holes[0].boundingBox.width,
      position: {
        x: holes[0].boundingBox.x,
        y: holes[0].boundingBox.y,
      },
      confidence: 0.95,
    };
  }

  // ── 헬퍼 메서드 ───────────────────────────────────────

  private calculateAspectRatio(paths: PathElement[]): number {
    const outline = this.findOutlinePath(paths);
    const { width, height } = outline.boundingBox;
    return width / height;
  }

  private findOutlinePath(paths: PathElement[]): PathElement {
    // 가장 큰 bounding box를 가진 경로가 외곽선
    return paths.sort((a, b) =>
      (b.boundingBox.width * b.boundingBox.height) -
      (a.boundingBox.width * a.boundingBox.height)
    )[0];
  }

  private isCircularPath(pathData: string): boolean {
    // SVG 경로 명령어 분석 (A = arc, M/C/L은 직선)
    return pathData.includes('A') && !pathData.includes('L');
  }

  private calculateGusset(paths: PathElement[]): number {
    // 측면 주름(gusset) 깊이 계산
    // 내부 접힘선 패턴 분석
    const foldLines = paths.filter(p =>
      p.stroke?.includes('blue') // 접힘선은 보통 파란색
    );

    // ... 복잡한 기하학적 계산
    return 0; // 간소화
  }
}
```

### 4.3 소재 정보 추출

```typescript
// src/lib/ai-parser/material-extractor.ts

class MaterialExtractor {
  /**
   * 필름 구조 인식
   * - 텍스트 패턴 매칭
   * - 레이어 이름 분석
   * - 구조적 규칙 기반 추론
   */
  extractMaterialStructure(
    texts: TextElement[],
    layers: Layer[]
  ): MaterialStructure {
    // 1. 텍스트 기반 추출
    const materialTexts = texts.filter(t =>
      /PET|AL|PE|NY|PP|CPP|kraft|paper|紙|フィルム/i.test(t.content)
    );

    // 2. 레이어 기반 추출
    const materialLayers = layers.filter(l =>
      /material|layer|film|layer structure/i.test(l.name)
    );

    // 3. 구조 파싱
    const structure = this.parseMaterialText(materialTexts);

    return {
      layers: structure.layers,
      totalThickness: structure.totalThickness,
      confidence: this.calculateMaterialConfidence(structure),
    };
  }

  /**
   * 소재 텍스트 파싱
   * 예: "PET12/AL7/PE70" → [{material: "PET", thickness: 12}, ...]
   */
  private parseMaterialText(texts: TextElement[]): ParsedStructure {
    const commonPatterns = [
      /(\w{2,3})(\d+)\/(\w{2,3})(\d+)\/(\w{2,3})(\d+)/, // PET12/AL7/PE70
      /(\w{2,3})\s*\(\s*(\d+)\s*μm?\s*\)/,                 // PET (12 μm)
    ];

    for (const text of texts) {
      for (const pattern of commonPatterns) {
        const match = text.content.match(pattern);
        if (match) {
          return this.buildStructureFromMatch(match);
        }
      }
    }

    // 기본값 반환
    return this.getDefaultStructure();
  }

  /**
   * 두께 정보 추출
   */
  extractThickness(
    texts: TextElement[],
    structure: MaterialStructure
  ): ThicknessInfo {
    // 1. 명시적 두께 텍스트 검색
    const thicknessText = texts.find(t =>
      /thickness|두께|厚さ|\d+\s*μm/i.test(t.content)
    );

    if (thicknessText) {
      const match = thicknessText.content.match(/(\d+)\s*μm?/);
      if (match) {
        return {
          total: parseInt(match[1]),
          unit: 'μm',
          confidence: 0.95,
        };
      }
    }

    // 2. 구조 기반 계산
    const calculated = structure.layers.reduce(
      (sum, layer) => sum + (layer.thickness || 0),
      0
    );

    return {
      total: calculated || null,
      unit: 'μm',
      confidence: calculated > 0 ? 0.75 : 0.3,
    };
  }
}
```

### 4.4 인쇄 정보 추출

```typescript
// src/lib/ai-parser/printing-extractor.ts

class PrintingExtractor {
  /**
   * 색상 정보 추출
   * - Pantone 코드 매칭
   * - CMYK 값 분석
   * - 스폿 컬러 식별
   */
  extractColors(paths: PathElement[], texts: TextElement[]): ColorInfo {
    const colors = new Set<string>();
    const pantoneCodes: string[] = [];

    // 1. 경로 fill/stroke 색상 수집
    paths.forEach(p => {
      if (p.fill) colors.add(p.fill);
      if (p.stroke) colors.add(p.stroke);
    });

    // 2. 텍스트에서 Pantone 코드 검색
    texts.forEach(t => {
      const pantoneMatch = t.content.match(/PANTONE\s+(\d+[A-Z]?)/i);
      if (pantoneMatch) {
        pantoneCodes.push(pantoneMatch[1]);
      }

      const cmykMatch = t.content.match(/CMYK\s*:\s*\((\d+),(\d+),(\d+),(\d+)\)/i);
      if (cmykMatch) {
        colors.add(`CMYK(${cmykMatch.slice(1).join(',')})`);
      }
    });

    return {
      type: pantoneCodes.length > 0 ? 'spot' : 'cmyk',
      colors: Array.from(colors),
      pantoneCodes,
      count: colors.size,
      confidence: pantoneCodes.length > 0 ? 0.90 : 0.70,
    };
  }

  /**
   * 로고/브랜드 위치 추출
   * - 텍스트 그룹 분석
   * - 폰트 크기/스타일 기반
   * - 위치 클러스터링
   */
  detectBrandLogos(
    texts: TextElement[],
    paths: PathElement[]
  ): LogoInfo[] {
    // 1. 큰 폰트 텍스트 식별 (로고 가능성)
    const largeTexts = texts.filter(t => t.fontSize > 14);

    // 2. 경로 기반 로고 (복잡한 백터 그래픽)
    const complexPaths = paths.filter(p =>
      p.d.length > 200 && // 복잡한 경로
      !p.stroke &&        // 채워진 형태
      p.fill
    );

    // 3. 위치 클러스터링
    const clusters = this.clusterByPosition([...largeTexts, ...complexPaths]);

    return clusters.map(cluster => ({
      type: this.classifyLogoType(cluster),
      position: {
        x: cluster.centerX,
        y: cluster.centerY,
      },
      size: cluster.averageSize,
      confidence: this.calculateLogoConfidence(cluster),
    }));
  }

  /**
   * 인쇄 영역 계산
   * - 실제 인쇄 요소가 있는 영역
   * - 여백(margin) 계산
   */
  calculatePrintArea(elements: (TextElement | PathElement)[]): PrintArea {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const bboxes = elements.map(e => e.boundingBox);

    return {
      x: Math.min(...bboxes.map(b => b.x)),
      y: Math.min(...bboxes.map(b => b.y)),
      width: Math.max(...bboxes.map(b => b.x + b.width)),
      height: Math.max(...bboxes.map(b => b.y + b.height)),
      margin: this.calculateMargin(bboxes),
    };
  }
}
```

### 4.5 가공 정보 추출

```typescript
// src/lib/ai-parser/processing-extractor.ts

class ProcessingExtractor {
  /**
   * 가공 유무 종합 판단
   */
  extractProcessingFeatures(
    paths: PathElement[],
    texts: TextElement[]
  ): ProcessingFeatures {
    return {
      zipper: this.detectZipper(paths, texts),
      notch: this.detectNotch(paths),
      hangingHole: this.detectHangingHole(paths),
      cornerRounding: this.detectCornerRounding(paths),
      euroSlot: this.detectEuroSlot(paths),
      tearNotch: this.detectTearNotch(paths, texts),
      valve: this.detectValve(paths, texts),
    };
  }

  /**
   * 모서리 라운딩 인식
   */
  private detectCornerRounding(paths: PathElement[]): CornerRoundingInfo | null {
    // 모서리 부분의 곡선 반경 계산
    const corners = this.findCorners(paths);

    if (corners.length === 0) return null;

    const radius = this.averageRadius(corners);

    return {
      radius,
      corners: corners.length,
      type: radius > 0 ? 'rounded' : 'sharp',
      confidence: 0.85,
    };
  }

  /**
   * 유로 슬롯 인식
   */
  private detectEuroSlot(paths: PathElement[]): EuroSlotInfo | null {
    // 특징적인 "─┬─" 형태 패턴
    const euroSlotPattern = paths.filter(p => {
      const bbox = p.boundingBox;
      const aspectRatio = bbox.width / bbox.height;

      return (
        aspectRatio > 3 && aspectRatio < 5 && // 가로로 긴 형태
        bbox.width < 30 &&                    // < 30mm
        this.hasTShape(p.d)                   // T자 형태
      );
    });

    if (euroSlotPattern.length === 0) return null;

    return {
      type: 'euro_slot',
      position: {
        x: euroSlotPattern[0].boundingBox.x,
        y: euroSlotPattern[0].boundingBox.y,
      },
      size: {
        width: euroSlotPattern[0].boundingBox.width,
        height: euroSlotPattern[0].boundingBox.height,
      },
      confidence: 0.88,
    };
  }

  /**
   * 밸브(Valve) 인식
   * - 커피 봉투 등의 공기 배출 밸브
   */
  private detectValve(
    paths: PathElement[],
    texts: TextElement[]
  ): ValveInfo | null {
    // 텍스트 기반
    const valveTexts = texts.filter(t =>
      /valve|degassing|バルブ|排気弁/i.test(t.content)
    );

    // 경로 기반 (작은 원형 + 사각형 조합)
    const valvePattern = paths.filter(p => {
      const bbox = p.boundingBox;
      return (
        this.isCircularPath(p.d) &&
        bbox.width < 15 &&
        bbox.height < 15
      );
    });

    if (valveTexts.length === 0 && valvePattern.length === 0) {
      return null;
    }

    return {
      type: 'degassing',
      position: valvePattern[0]?.boundingBox || { x: 0, y: 0, width: 0, height: 0 },
      confidence: 0.80,
    };
  }

  /**
   * 찢림 노치(Tear Notch) 인식
   */
  private detectTearNotch(
    paths: PathElement[],
    texts: TextElement[]
  ): TearNotchInfo | null {
    // 텍스트
    const tearTexts = texts.filter(t =>
      /tear notch|tear|イージーオープン|開封 notch/i.test(t.content)
    );

    // 경로 (상단의 작은 V자 또는 원형 노치)
    const tearPattern = paths.filter(p => {
      const bbox = p.boundingBox;
      const isNearTop = bbox.y < 30;
      const isSmall = bbox.width < 10 && bbox.height < 10;

      return isNearTop && isSmall;
    });

    if (tearTexts.length === 0 && tearPattern.length === 0) {
      return null;
    }

    return {
      type: 'v_notch',
      position: tearPattern[0]?.boundingBox,
      confidence: 0.82,
    };
  }
}
```

---

## 5. 신뢰도 스코어링

### 5.1 신뢰도 계산 모델

```typescript
// src/lib/ai-parser/confidence-scorer.ts

interface ConfidenceScore {
  overall: number;           // 0-100
  dimensions: number;        // 0-100
  material: number;          // 0-100
  printing: number;          // 0-100
  processing: number;        // 0-100
  breakdown: {
    envelopeType: number;
    size: number;
    gusset: number;
    zipper: number;
    notch: number;
    materialStructure: number;
    thickness: number;
    colors: number;
    logo: number;
  };
  flags: ValidationFlag[];   // 경고/에러 플래그
}

class ConfidenceScorer {
  /**
   * 종합 신뢰도 계산
   */
  calculate(
    extracted: ExtractedSpecs,
    sourcePDF: PDFStructure
  ): ConfidenceScore {
    const breakdown = this.calculateBreakdown(extracted, sourcePDF);
    const overall = this.calculateOverall(breakdown);

    return {
      overall,
      dimensions: this.average([breakdown.envelopeType, breakdown.size, breakdown.gusset]),
      material: this.average([breakdown.materialStructure, breakdown.thickness]),
      printing: this.average([breakdown.colors, breakdown.logo]),
      processing: this.average([breakdown.zipper, breakdown.notch]),
      breakdown,
      flags: this.generateFlags(breakdown),
    };
  }

  /**
   * 개별 항목 신뢰도 계산
   */
  private calculateBreakdown(
    extracted: ExtractedSpecs,
    source: PDFStructure
  ): ConfidenceScore['breakdown'] {
    return {
      envelopeType: this.scoreEnvelopeType(extracted.dimensions, source),
      size: this.scoreSize(extracted.dimensions, source),
      gusset: this.scoreGusset(extracted.dimensions.gusset),
      zipper: this.scoreZipper(extracted.processing.zipper),
      notch: this.scoreNotch(extracted.processing.notch),
      materialStructure: this.scoreMaterialStructure(extracted.material),
      thickness: this.scoreThickness(extracted.material.thickness),
      colors: this.scoreColors(extracted.printing.colors),
      logo: this.scoreLogo(extracted.printing.logos),
    };
  }

  /**
   * 봉투 타입 신뢰도
   * - 명시적 텍스트 라벨: +40
   * - 형상 패턴 매칭: +30
   * - 종횡비 일치: +20
   * - 구성요소 일치: +10
   */
  private scoreEnvelopeType(
    dimensions: Dimensions,
    source: PDFStructure
  ): number {
    let score = 0;

    // 1. 텍스트 라벨 확인
    const hasLabel = source.texts.some(t =>
      /pouch|bag|stand|box|gusset|パウチ|袋/i.test(t.content)
    );
    if (hasLabel) score += 40;

    // 2. 형상 패턴 매칭
    const patternMatch = this.matchPattern(dimensions.envelopeType, source);
    score += patternMatch * 30;

    // 3. 종횡비 검증
    const aspectRatioMatch = this.verifyAspectRatio(dimensions, source);
    score += aspectRatioMatch * 20;

    // 4. 구성요소 일치 (예: 스탠드 파우치엔 지퍼가 있어야 함)
    const componentConsistency = this.checkComponentConsistency(dimensions, source);
    score += componentConsistency * 10;

    return Math.min(100, score);
  }

  /**
   * 치수 신뢰도
   * - 경로 존재: +30
   * - 다이 라인 색상: +25
   * - 텍스트 라벨: +25
   * - 규격 표준 일치: +20
   */
  private scoreSize(dimensions: Dimensions, source: PDFStructure): number {
    let score = 0;

    // 1. 경로 존재
    if (dimensions.width > 0 && dimensions.height > 0) {
      score += 30;
    }

    // 2. 다이 라인 색상 확인
    const hasDieLine = source.paths.some(p =>
      p.stroke?.includes('red') || p.stroke?.includes('magenta')
    );
    if (hasDieLine) score += 25;

    // 3. 텍스트 라벨 (예: "W200×H300")
    const hasSizeLabel = source.texts.some(t =>
      /W?\d+\s*[×x]\s*H?\d+/i.test(t.content)
    );
    if (hasSizeLabel) score += 25;

    // 4. 표준 규격 일치
    const isStandard = this.isStandardSize(dimensions);
    if (isStandard) score += 20;

    return Math.min(100, score);
  }

  /**
   * 소재 구조 신뢰도
   * - 명시적 라벨: +50
   * - 형식 일치: +30
   * - 표준 구조: +20
   */
  private scoreMaterialStructure(material: MaterialStructure): number {
    let score = 0;

    // 1. 명시적 라벨
    if (material.source === 'text_label') {
      score += 50;
    } else if (material.source === 'layer_name') {
      score += 30;
    }

    // 2. 형식 일치 (예: PET12/AL7/PE70)
    const formatValid = this.validateMaterialFormat(material.layers);
    score += formatValid * 30;

    // 3. 표준 구조 일치
    const isStandard = this.isStandardMaterial(material.layers);
    if (isStandard) score += 20;

    return Math.min(100, score);
  }

  /**
   * 검증 플래그 생성
   * - 신뢰도 < 70%: 경고
   * - 신뢰도 < 50%: 에러
   * - 상충 정보: 경고
   */
  private generateFlags(
    breakdown: ConfidenceScore['breakdown']
  ): ValidationFlag[] {
    const flags: ValidationFlag[] = [];

    // 낮은 신뢰도 항목
    Object.entries(breakdown).forEach(([key, score]) => {
      if (score < 50) {
        flags.push({
          type: 'error',
          field: key,
          message: `${key} 추출 신뢰도가 매우 낮습니다 (${score}%)`,
          suggestion: '수동 입력을 권장합니다',
        });
      } else if (score < 70) {
        flags.push({
          type: 'warning',
          field: key,
          message: `${key} 추출 결과를 확인해주세요 (${score}%)`,
          suggestion: '검증 후 수정 필요',
        });
      }
    });

    // 상충 정보 검사
    if (breakdown.zipper > 70 && breakdown.notch > 70) {
      const hasConflict = this.checkZipperNotchConflict();
      if (hasConflict) {
        flags.push({
          type: 'warning',
          field: 'processing',
          message: '지퍼와 노치 위치가 겹칠 수 있습니다',
          suggestion: '위치를 재확인해주세요',
        });
      }
    }

    return flags;
  }

  /**
   * 종합 신뢰도 계산 (가중평균)
   */
  private calculateOverall(
    breakdown: ConfidenceScore['breakdown']
  ): number {
    const weights = {
      envelopeType: 0.15,
      size: 0.25,
      gusset: 0.10,
      zipper: 0.10,
      notch: 0.05,
      materialStructure: 0.15,
      thickness: 0.05,
      colors: 0.10,
      logo: 0.05,
    };

    return Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (breakdown[key] || 0) * weight;
    }, 0);
  }
}
```

### 5.2 검증 플래그 체계

```typescript
// src/lib/ai-parser/types.ts

interface ValidationFlag {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestion: string;
  autoCorrect?: boolean;
}

// 예시 플래그
const exampleFlags: ValidationFlag[] = [
  {
    type: 'error',
    field: 'dimensions',
    message: '치수 정보를 찾을 수 없습니다',
    suggestion: '다이 라인이 포함된 파일을 업로드해주세요',
    autoCorrect: false,
  },
  {
    type: 'warning',
    field: 'material',
    message: '소재 구조가 불완전합니다',
    suggestion: '누락된 층(layer)을 확인해주세요',
    autoCorrect: false,
  },
  {
    type: 'info',
    field: 'printing',
    message: 'Pantone 색상이 3개 발견되었습니다',
    suggestion: 'CMYK 4도 인쇄로 변경하면 비용 절감 가능합니다',
    autoCorrect: true,
  },
];
```

---

## 6. 에러 처리 및 롤백

### 6.1 에러 유형별 처리

```typescript
// src/lib/ai-parser/error-handler.ts

enum ParseErrorType {
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  CORRUPTED_PDF = 'CORRUPTED_PDF',
  MISSING_DIE_LINE = 'MISSING_DIE_LINE',
  NO_TEXT_CONTENT = 'NO_TEXT_CONTENT',
  PATH_PARSE_FAILED = 'PATH_PARSE_FAILED',
  OCR_FAILED = 'OCR_FAILED',
}

class ParseError extends Error {
  constructor(
    public type: ParseErrorType,
    message: string,
    public recoverable: boolean,
    public fallback?: ExtractedSpecs
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

class ErrorHandler {
  /**
   * 에러 복구 전략
   */
  async handle(error: ParseError, context: ParseContext): Promise<RecoveryResult> {
    switch (error.type) {
      case ParseErrorType.INVALID_FILE_FORMAT:
        return this.handleInvalidFormat(error, context);

      case ParseErrorType.CORRUPTED_PDF:
        return this.handleCorruptedPDF(error, context);

      case ParseErrorType.MISSING_DIE_LINE:
        return this.handleMissingDieLine(error, context);

      case ParseErrorType.NO_TEXT_CONTENT:
        return this.handleNoText(error, context);

      case ParseErrorType.PATH_PARSE_FAILED:
        return this.handlePathParseFailure(error, context);

      case ParseErrorType.OCR_FAILED:
        return this.handleOCRFailure(error, context);

      default:
        return this.handleUnknown(error, context);
    }
  }

  /**
   * 손상된 PDF 복구
   * - PDF 재구성 시도
   * - 백업 이미지 사용
   * - 부분 추출
   */
  private async handleCorruptedPDF(
    error: ParseError,
    context: ParseContext
  ): Promise<RecoveryResult> {
    // 1. PDF 복구 시도
    const recovered = await this.attemptPDFRecovery(context.filePath);
    if (recovered) {
      return {
        success: true,
        method: 'pdf_recovery',
        specs: recovered,
        confidence: 0.60, // 낮은 신뢰도
        warnings: ['PDF가 손상되어 복구했습니다. 결과를 확인해주세요'],
      };
    }

    // 2. 백업 이미지 사용 (이미지 + OCR)
    const imageResult = await this.fallbackToImageOCR(context);
    if (imageResult) {
      return {
        success: true,
        method: 'image_ocr_fallback',
        specs: imageResult,
        confidence: 0.45,
        warnings: ['이미지에서 OCR로 추출했습니다. 정확도가 낮을 수 있습니다'],
      };
    }

    // 3. 완전 실패
    return {
      success: false,
      method: 'manual_input_required',
      specs: null,
      confidence: 0,
      errors: ['파일을 읽을 수 없습니다. 수동 입력이 필요합니다'],
    };
  }

  /**
   * 다이 라인 누락 복구
   * - 텍스트 라벨 기반 추정
   * - 가장 가까운 표준 규격 매칭
   */
  private async handleMissingDieLine(
    error: ParseError,
    context: ParseContext
  ): Promise<RecoveryResult> {
    // 1. 텍스트 라벨 검색
    const textLabels = this.extractSizeLabels(context.sourcePDF.texts);
    if (textLabels.length > 0) {
      const estimated = this.estimateFromLabels(textLabels);
      return {
        success: true,
        method: 'label_based_estimation',
        specs: estimated,
        confidence: 0.65,
        warnings: ['다이 라인을 찾을 수 없어 텍스트 라벨로 추정했습니다'],
      };
    }

    // 2. 근접 표준 규격 매칭
    const closest = this.findClosestStandardSize(context);
    if (closest) {
      return {
        success: true,
        method: 'standard_size_matching',
        specs: closest,
        confidence: 0.55,
        warnings: ['가장 근접한 표준 규격으로 추정했습니다. 확인이 필요합니다'],
      };
    }

    return {
      success: false,
      method: 'manual_input_required',
      specs: null,
      confidence: 0,
      errors: ['치수를 추정할 수 없습니다'],
    };
  }

  /**
   * OCR 실패 복구
   * - 이미지 전처리 재시도
   * - 다른 OCR 엔진 사용
   * - 텍스트 없이 경로만 분석
   */
  private async handleOCRFailure(
    error: ParseError,
    context: ParseContext
  ): Promise<RecoveryResult> {
    // 1. 이미지 전처리
    const preprocessed = await this.preprocessImage(context.filePath);
    const retryOCR = await this.attemptOCR(preprocessed);
    if (retryOCR) {
      return {
        success: true,
        method: 'ocr_retry',
        specs: retryOCR,
        confidence: 0.70,
        warnings: ['이미지 전처리 후 OCR을 재시도했습니다'],
      };
    }

    // 2. 텍스트 없이 경로만 분석
    const pathOnly = this.analyzePathsOnly(context.sourcePDF.paths);
    return {
      success: true,
      method: 'path_only_analysis',
      specs: pathOnly,
      confidence: 0.50,
      warnings: ['텍스트 추출에 실패하여 경로만 분석했습니다'],
    };
  }
}
```

### 6.2 롤백 메커니즘

```typescript
// src/lib/ai-parser/rollback-manager.ts

class RollbackManager {
  /**
   * 추출 상태 저장
   */
  async saveCheckpoint(
    taskId: string,
    state: ParseState
  ): Promise<void> {
    await supabase.from('ai_parser_checkpoints').insert({
      task_id: taskId,
      stage: state.stage,
      data: state.data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 이전 단계로 롤백
   */
  async rollback(
    taskId: string,
    toStage: ParseStage
  ): Promise<ParseState> {
    // 1. 체크포인트 조회
    const { data: checkpoint } = await supabase
      .from('ai_parser_checkpoints')
      .select('*')
      .eq('task_id', taskId)
      .eq('stage', toStage)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!checkpoint) {
      throw new Error(`체크포인트를 찾을 수 없습니다: ${toStage}`);
    }

    // 2. 상태 복원
    return {
      stage: checkpoint.stage,
      data: checkpoint.data,
      rollbackCount: (checkpoint.rollback_count || 0) + 1,
    };
  }

  /**
   * 복구 가능성 확인
   */
  async canRecover(error: ParseError): Promise<boolean> {
    // 복구 불가능한 에러
    const unrecoverable = [
      ParseErrorType.INVALID_FILE_FORMAT,
    ];

    return !unrecoverable.includes(error.type);
  }
}
```

---

## 7. 성능 최적화

### 7.1 처리 파이프라인 최적화

```typescript
// src/lib/ai-parser/pipeline-optimizer.ts

class PipelineOptimizer {
  /**
   * 병렬 처리 전략
   */
  async optimizePipeline(
    tasks: ParseTask[]
  ): Promise<ParseResult[]> {
    // 1. 독립 작업 그룹화
    const groups = this.groupIndependentTasks(tasks);

    // 2. 각 그룹 병렬 처리
    const results = await Promise.all(
      groups.map(group => this.processGroup(group))
    );

    return results.flat();
  }

  /**
   * 캐싱 전략
   */
  private async processGroup(tasks: ParseTask[]): Promise<ParseResult[]> {
    // 1. 캐시 확인
    const cached = await this.getFromCache(tasks);
    const uncached = tasks.filter(t => !cached.has(t.id));

    // 2. 캐시된 결과 반환
    const results = Array.from(cached.values());

    // 3. 캐시되지 않은 작업 처리
    const processed = await this.processTasks(uncached);

    // 4. 결과 캐싱
    await this.saveToCache(processed);

    return [...results, ...processed];
  }

  /**
   * 분석 단계 선택
   * - 빠른 모드: 필수 항목만
   * - 상세 모드: 모든 항목
   */
  async selectAnalysisMode(
    file: AIFile,
    priority: 'fast' | 'detailed'
  ): Promise<AnalysisConfig> {
    if (priority === 'fast') {
      return {
        extractText: true,
        analyzePaths: true,
        ocr: false,
        deepPatternMatching: false,
        crossValidation: false,
      };
    }

    return {
      extractText: true,
      analyzePaths: true,
      ocr: true,
      deepPatternMatching: true,
      crossValidation: true,
    };
  }
}
```

### 7.2 메모리 관리

```typescript
// src/lib/ai-parser/memory-manager.ts

class MemoryManager {
  private maxMemoryUsage = 500 * 1024 * 1024; // 500MB

  /**
   * 대용량 PDF 스트리밍 처리
   */
  async processLargePDF(
    filePath: string,
    processor: (chunk: PDFChunk) => Promise<void>
  ): Promise<void> {
    const stream = fs.createReadStream(filePath);
    const pdfParser = new PDFParser();

    // 청크 단위 처리
    for await (const chunk of pdfParser.parseStream(stream)) {
      await processor(chunk);

      // 메모리 사용량 확인
      if (this.getMemoryUsage() > this.maxMemoryUsage) {
        await this.cleanup();
      }
    }
  }

  /**
   * 중간 결과 스트리밍
   */
  async *streamExtractedData(
    pdfPath: string
  ): AsyncGenerator<Partial<ExtractedSpecs>> {
    // 1. 치수 먼저 추출
    yield await this.extractDimensions(pdfPath);

    // 2. 소재
    yield await this.extractMaterial(pdfPath);

    // 3. 인쇄
    yield await this.extractPrinting(pdfPath);

    // 4. 가공
    yield await this.extractProcessing(pdfPath);
  }

  /**
   * 메모리 정리
   */
  private async cleanup(): Promise<void> {
    // 임시 파일 삭제
    await this.clearTempFiles();

    // 캐시 비우기
    await this.clearCache();

    // GC 힌트
    if (global.gc) {
      global.gc();
    }
  }
}
```

### 7.3 성능 모니터링

```typescript
// src/lib/ai-parser/performance-monitor.ts

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  /**
   * 단계별 실행 시간 측정
   */
  async measure<T>(
    stage: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    const memoryBefore = process.memoryUsage().heapUsed;

    try {
      const result = await fn();

      const duration = performance.now() - start;
      const memoryUsed = process.memoryUsage().heapUsed - memoryBefore;

      this.recordMetric(stage, {
        duration,
        memoryUsed,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.recordMetric(stage, {
        duration,
        memoryUsed: 0,
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * 성능 보고서 생성
   */
  generateReport(): PerformanceReport {
    return {
      totalDuration: this.calculateTotalDuration(),
      memoryUsage: this.calculateTotalMemory(),
      successRate: this.calculateSuccessRate(),
      bottlenecks: this.identifyBottlenecks(),
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * 병목 지점 식별
   */
  private identifyBottlenecks(): Bottleneck[] {
    const avgDurations = this.calculateAverageDurations();
    const threshold = this.calculateThreshold(avgDurations);

    return Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.duration > threshold)
      .map(([stage, metric]) => ({
        stage,
        duration: metric.duration,
        impact: this.calculateImpact(metric.duration, avgDurations),
        suggestion: this.getSuggestion(stage),
      }));
  }
}
```

---

## 8. 데이터베이스 스키마

### 8.1 Supabase 테이블 설계

```sql
-- src/lib/ai-parser/schema.sql

-- 파일 업로드 기록
CREATE TABLE ai_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage 경로
  file_size BIGINT,
  file_type TEXT, -- 'ai', 'pdf'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- 추출된 사양
CREATE TABLE ai_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES ai_uploads(id),

  -- 치수
  envelope_type TEXT,
  width_mm NUMERIC,
  height_mm NUMERIC,
  gusset_mm NUMERIC,

  -- 소재
  material_structure JSONB, -- [{material: "PET", thickness: 12}, ...]
  total_thickness_um NUMERIC,

  -- 인쇄
  color_type TEXT, -- 'cmyk', 'spot', 'hybrid'
  colors JSONB, -- ["#FF0000", "PANTONE 185C", ...]
  print_area JSONB, -- {x, y, width, height, margin}

  -- 가공
  has_zipper BOOLEAN,
  zipper_info JSONB,
  has_notch BOOLEAN,
  notch_info JSONB,
  has_hanging_hole BOOLEAN,
  hanging_hole_info JSONB,
  other_features JSONB,

  -- 신뢰도
  confidence_score JSONB, -- {overall: 85, dimensions: 90, ...}
  validation_flags JSONB, -- [{type: 'warning', field: '...', message: '...'}]

  -- 메타데이터
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extraction_method TEXT, -- 'pdf_parse', 'ocr_fallback', 'manual'
  processing_time_ms INTEGER,

  -- 상태
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'approved'
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
);

-- 파싱 로그
CREATE TABLE ai_parse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES ai_uploads(id),
  stage TEXT NOT NULL, -- 'pdf_parse', 'dimension_extract', etc.
  status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'recovered'
  duration_ms INTEGER,
  memory_used_mb NUMERIC,
  error_message TEXT,
  recovery_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- 인덱스
CREATE INDEX idx_ai_specs_upload_id ON ai_specs(upload_id);
CREATE INDEX idx_ai_specs_status ON ai_specs(status);
CREATE INDEX idx_ai_parse_logs_upload_id ON ai_parse_logs(upload_id);
CREATE INDEX idx_ai_parse_logs_stage ON ai_parse_logs(stage);
```

---

## 9. 구현 일정

### Phase 1: 기본 파싱 (2주)
- [ ] PDF → JSON 변환 (pdf2json)
- [ ] 텍스트 추출 (pdf-parse)
- [ ] 경로 분석 기초
- [ ] 데이터베이스 스키마 구현

### Phase 2: 치수 추출 (2주)
- [ ] 봉투 타입 인식
- [ ] 치수 계산 알고리즘
- [ ] 가공 요소 검출 (지퍼, 노치, 걸이)
- [ ] 신뢰도 스코어링

### Phase 3: 소재/인쇄 (1주)
- [ ] 소재 구조 파싱
- [ ] 색상 추출
- [ ] 로고 위치 인식

### Phase 4: 검증 및 UI (1주)
- [ ] 에러 처리 및 롤백
- [ ] 검증 플래그 시스템
- [ ] 클라이언트 UI (프리뷰, 편집)

### Phase 5: 최적화 (1주)
- [ ] 성능 최적화
- [ ] 캐싱 전략
- [ ] 메모리 관리

**총 예상 기간: 7주**

---

## 10. 비용 추정

### 개발 비용
- 개발자 (주당 40시간 × $100/시간 × 7주) = $28,000
- UI/UX 디자이너 (20시간 × $80/시간) = $1,600
- **소계: $29,600**

### 인프라 비용 (월간)
- Vercel (Hobby) = $0
- Supabase (Pro) = $25
- Storage (10GB) = $5
- OCR (Tesseract.js, 오픈소스) = $0
- **월간 소계: $30**

### 선택적 추가 비용
- Adobe PDF Embed API (유료) = $500/월
- 상용 OCR (Google Vision API) = $1-2/파일

---

## 11. 결론

### 기술적 타당성
- **가능**: PDF 기반 .ai 파일 파싱은 검증된 기술
- **한계**: 100% 정확도는 어려움, 신뢰도 기반 검증 필수
- **추천**: 하이브리드 접근 (자동 추출 + 수동 검증)

### 예상 효과
- 견적 시간 단축: 70% (30분 → 9분)
- 오류 감소: 60% (자동 검증)
- 고객 만족도: +40% (편의성)

### 다음 단계
1. PoC 개발 (기본 파싱 + 치수 추출)
2. 실제 .ai 파일로 테스트 (10-20개 샘플)
3. 정확도 측정 및 알고리즘 개선
4. 전체 시스템 구현
