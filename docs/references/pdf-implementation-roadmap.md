# PDF 생성 시스템 구현 로드맵

**버전**: 1.0
**작성일**: 2025-12-31
**예상 기간**: 5주 (40시간)
**목표**: EPACKAGE Lab 3가지 비즈니스 문서 PDF 생성 시스템 구축

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [Phase 1: 기반 구축 (Week 1-2)](#2-phase-1-기반-구축-week-1-2)
3. [Phase 2: 사양서 PDF (Week 3)](#3-phase-2-사양서-pdf-week-3)
4. [Phase 3: 계약서 및 서명 (Week 4)](#4-phase-3-계약서-및-서명-week-4)
5. [Phase 4: 최적화 및 배포 (Week 5)](#5-phase-4-최적화-및-배포-week-5)
6. [추후 확장](#6-추후-확장)
7. [위험 관리](#7-위험-관리)

---

## 1. 프로젝트 개요

### 1.1 목표

- **견적서 (Quotation)**: Excel 템플릿 기반 PDF 생성
- **사양서 (Spec Sheet)**: 기술 문서, 다중 페이지, 버전 관리
- **계약서 (Contract)**: HTML 기반, 전자 서명, 법적 효력

### 1.2 기술 스택

```yaml
Backend: Next.js 16 App Router
PDF Engine: Puppeteer + ExcelJS + xlsx-render
Storage: Supabase Storage (pdf-documents bucket)
Cache: Vercel KV (Redis)
Fonts: Noto Sans JP (Google Fonts)
Testing: Playwright (E2E), Jest (Unit)
```

### 1.3 성공 기준

- PDF 생성 시간: 5초 이내 (95백분위)
- API 응답 시간: 500ms 이내 (캐시 히트 시)
- 일본어 렌더링: 100% 완벽
- 가용성: 99.9% (월간)

---

## 2. Phase 1: 기반 구축 (Week 1-2)

### Week 1: 인프라 설정

#### Day 1-2: 라이브러리 설치 및 설정

```bash
# 설치
npm install exceljs@4.4.0 puppeteer@22.0.0 xlsx-render@1.3.0
npm install pdf-lib@1.17.1
npm install @types/puppeteer -D

# 확인
node -v  # v20+
npm ls exceljs puppeteer
```

**체크리스트**:
- [ ] package.json에 의존성 추가
- [ ] TypeScript 타입 정의 생성
- [ ] 환경 변수 설정 (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Redis (Vercel KV)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

#### Day 3-4: Supabase Storage 설정

```sql
-- 1. Bucket 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-documents', 'pdf-documents', false);

-- 2. 폴더 구조 생성
-- quotations/2025/
-- work-orders/2025/
-- contracts/drafts/, contracts/signed/

-- 3. RLS 정책
-- (상세: pdf-data-flow-and-storage.md 참조)
```

**체크리스트**:
- [ ] Bucket 생성 확인
- [ ] RLS 정책 적용
- [ ] 폴더 구조 생성
- [ ] 업로드 테스트

#### Day 5: PDF 서비스 기본 구조

```typescript
// src/lib/pdf/pdf.service.ts
export class PDFService {
  async generateQuotationPDF(id: string): Promise<string>
  async generateSpecSheetPDF(id: string): Promise<string>
  async generateContractPDF(id: string): Promise<string>
}

// src/lib/pdf/types.ts
export interface PDFGenerationOptions {
  format?: 'pdf' | 'excel';
  language?: 'ja' | 'en';
  version?: string;
}

export interface SignatureData {
  imageData: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}
```

**체크리스트**:
- [ ] PDFService 클래스 생성
- [ ] 기본 인터페이스 정의
- [ ] 공통 유틸리티 함수
- [ ] 단위 테스트 프레임워크

---

### Week 2: 견적서 PDF (Excel → PDF)

#### Day 1-2: Excel 템플릿 처리

```typescript
// src/lib/pdf/excel/quotation.service.ts

async loadTemplate(): Promise<Workbook> {
  const workbook = new Workbook();
  await workbook.xlsx.readFile('templet/quotation-epackage-lab.xlsx');
  return workbook;
}

async mapDataToTemplate(
  workbook: Workbook,
  quotation: Quotation
): Promise<void> {
  const worksheet = workbook.getWorksheet(1);

  // 매핑 (quote_data_mapping.md 참조)
  // A3:A4: 발주처 정보
  // G3:J12: 공급업체 정보
  // A14:C27: 제품 사양
  // E14:J16: 주문 상세
}
```

**데이터 매핑 구현**:

| 셀 범위 | 필드 | 데이터 소스 |
|--------|------|-----------|
| A3:A4 | 발주처 | companies 테이블 |
| G3:J12 | 공급업체 | 하드코딩 |
| A7:B12 | 지불 조건 | quotations 테이블 |
| A14:C27 | 제품 사양 | quotation_items |
| E14:J16 | 주문 내역 | 계산 |

**체크리스트**:
- [ ] Excel 템플릿 로드 함수
- [ ] 데이터 매핑 함수
- [ ] 수량/단가/합계 계산 로직
- [ ] 일본어 포맷 함수 (통화, 날짜)

#### Day 3: Excel → HTML 변환

```typescript
// src/lib/pdf/excel/excel-to-html.ts

async excelToHTML(workbook: Workbook): Promise<string> {
  // 옵션 1: xlsx-render 사용
  // 옵션 2: 직접 HTML 렌더링

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
        body { font-family: 'Noto Sans JP', sans-serif; }
        /* 스타일 */
      </style>
    </head>
    <body>
      <!-- Excel 내용 -->
    </body>
    </html>
  `;
}
```

**체크리스트**:
- [ ] Excel → HTML 변환 함수
- [ ] 일본어 폰트 임베딩
- [ ] 테이블 스타일 유지
- [ ] A4 페이지 최적화

#### Day 4: Puppeteer PDF 변환

```typescript
// src/lib/pdf/puppeteer/renderer.ts

import puppeteer from 'puppeteer';

async htmlToPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
  });

  await browser.close();
  return pdf;
}
```

**체크리스트**:
- [ ] Puppeteer 런처 설정
- [ ] HTML → PDF 변환
- [ ] 일본어 폰트 렌더링 테스트
- [ ] 성능 최적화 (병렬 처리)

#### Day 5: API 엔드포인트 구현

```typescript
// src/app/api/b2b/quotations/[id]/pdf/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. 인증 확인
  // 2. 권한 확인
  // 3. 캐시 확인
  // 4. PDF 생성 (캐시 미스 시)
  // 5. URL 반환
}
```

**체크리스트**:
- [ ] GET /api/b2b/quotations/:id/pdf 구현
- [ ] 캐싱 로직 (Redis)
- [ ] 에러 처리
- [ ] 단위 테스트 작성

**Week 2 완료 기준**:
- [ ] 견적서 PDF 생성 성공
- [ ] API 응답 시간 < 5초
- [ ] 캐시 적중률 > 50%
- [ ] 일본어 완벽 렌더링

---

## 3. Phase 2: 사양서 PDF (Week 3)

### Week 3: Spec Sheet Generation

#### Day 1-2: HTML 템플릿

```typescript
// src/lib/pdf/templates/spec-sheet.tsx

interface SpecSheetProps {
  workOrder: WorkOrder;
  specifications: Specifications;
}

export function SpecSheetTemplate({ workOrder, specifications }: SpecSheetProps) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <title>{workOrder.title}</title>
        <style>{/* CSS */}</style>
      </head>
      <body>
        <h1>製品仕様書</h1>

        <section id="basic-info">
          {/* 1. 기본 정보 */}
        </section>

        <section id="dimensions">
          {/* 2. 제품 치수 */}
        </section>

        <section id="materials">
          {/* 3. 재질 구성 */}
        </section>

        {/* ... */}
      </body>
    </html>
  );
}
```

**섹션 구조**:

| 섹션 | 내용 | 데이터 소스 |
|------|------|-----------|
| 1. 기본 정보 | 발행일, 고객명, 제품 타입 | work_orders |
| 2. 제품 치수 | 크기, 용량, 실링 폭 | specifications |
| 3. 재질 구성 | 4층 필름 구조 | specifications |
| 4. 가공 사양 | 지퍼, 노치, 모서리 | specifications |
| 5. 인쇄 사양 | 색수, 해상도, 디자인 가이드 | specifications |
| 6. 품질 기준 | 외관, 기능, 위생 | specifications |
| 7. 포장/납품 | 포장 형태, 라벨 | specifications |
| 8. 납기/발주 | 리드타임, MOQ | specifications |

**체크리스트**:
- [ ] React 컴포넌트 기반 템플릿
- [ ] final_spec_sheet.md 내용 매핑
- [ ] 테이블/도면 렌더링
- [ ] 목차, 페이지 번호

#### Day 3-4: Puppeteer 렌더링

```typescript
// src/lib/pdf/services/spec-sheet.service.ts

async generateSpecSheetPDF(workOrderId: string): Promise<string> {
  // 1. 데이터 조회
  const workOrder = await fetchWorkOrder(workOrderId);
  const specifications = workOrder.specifications;

  // 2. HTML 렌더링
  const html = renderToString(
    <SpecSheetTemplate workOrder={workOrder} specifications={specifications} />
  );

  // 3. PDF 변환
  const pdf = await htmlToPDF(html);

  // 4. Storage 업로드
  const path = `work-orders/2025/WO-${workOrder.work_order_number}-v${workOrder.version}.pdf`;
  const url = await uploadPDF(path, pdf);

  return url;
}
```

**다중 페이지 처리**:

```css
/* CSS page breaks */
.section {
  page-break-inside: avoid;
}

h1, h2, h3 {
  page-break-after: avoid;
}

.page-break {
  page-break-after: always;
}
```

**체크리스트**:
- [ ] 서버 사이드 렌더링
- [ ] 다중 페이지 처리
- [ ] 페이지 번호 자동 생성
- [ ] 목차 자동 생성

#### Day 5: Work Order API

```typescript
// src/app/api/b2b/work-orders/[id]/pdf/route.ts

// GET /api/b2b/work-orders/:id/pdf
export async function GET(request: NextRequest, { params }) {
  // 쿼리 파라미터
  const { searchParams } = new URL(request.url);
  const includeSpecs = searchParams.get('includeSpecs') === 'true';
  const includeFlow = searchParams.get('includeFlow') === 'true';
  const version = searchParams.get('version') || 'latest';

  // 버전 확인
  if (version !== 'latest') {
    // 특정 버전 로드
  }

  // PDF 생성
  const url = await pdfService.generateSpecSheetPDF(params.id);

  return NextResponse.json({ success: true, data: { url } });
}
```

**체크리스트**:
- [ ] GET /api/b2b/work-orders/:id/pdf 구현
- [ ] 버전 관리 통합
- [ ] 섹션별 필터링
- [ ] E2E 테스트

**Week 3 완료 기준**:
- [ ] 사양서 PDF 생성 성공
- [ ] 8페이지 이내 렌더링
- [ ] 모든 테이블/도면 표시
- [ ] 버전 관리 작동

---

## 4. Phase 3: 계약서 및 서명 (Week 4)

### Week 4: Contract & Signature

#### Day 1-2: 계약서 HTML

```typescript
// src/lib/pdf/templates/contract.tsx

export function ContractTemplate({ contract, signature }: ContractProps) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <title>前金契約書</title>
        <style>{/* contract_ja_kanei_trade_improved.html CSS */}</style>
      </head>
      <body>
        <div className="document">
          <div className="header">
            <h1>前 金 契 約 書</h1>
          </div>

          {/* 당사자 정보 */}
          <div className="party-section">
            {/* ... */}
          </div>

          {/* 조항 */}
          <div className="articles">
            {/* 제1조 ~ 제14조 */}
          </div>

          {/* 서명란 */}
          <div className="signature-section">
            {signature && (
              <img src={signature.imageData} alt="서명" />
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
```

**체크리스트**:
- [ ] contract_ja_kanei_trade_improved.html 변환
- [ ] React 컴포넌트화
- [ ] 동적 데이터 바인딩
- [ ] A4, 일본어 최적화

#### Day 3-4: 전자 서명

```typescript
// src/components/signature/SignatureCanvas.tsx

'use client';

import { useRef, useState } from 'react';

export function SignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getSignatureData = () => {
    const canvas = canvasRef.current;
    return canvas.toDataURL('image/png');
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      style={{ border: '1px solid #ccc' }}
    />
  );
}
```

**서명 검증**:

```typescript
// src/lib/pdf/signature/validator.ts

export function validateSignatureData(data: SignatureData): boolean {
  // 1. Base64 포맷 확인
  if (!data.imageData.startsWith('data:image/png;base64,')) {
    return false;
  }

  // 2. 타임스탬프 검증 (5분 이내)
  const timestamp = new Date(data.timestamp);
  const now = new Date();
  const diff = (now.getTime() - timestamp.getTime()) / 1000 / 60;
  if (diff > 5) {
    return false;
  }

  // 3. IP 주소 형식 확인
  if (!isValidIP(data.ipAddress)) {
    return false;
  }

  return true;
}

function isValidIP(ip: string): boolean {
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return regex.test(ip);
}
```

**체크리스트**:
- [ ] Canvas 시그니처 컴포넌트
- [ ] 지우기/재작성 기능
- [ ] 모바일 터치 지원
- [ ] 서명 데이터 검증

#### Day 5: 서명 API

```typescript
// src/app/api/b2b/contracts/[id]/sign/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { party, signatureData, acceptance, acceptedTerms } = body;

  // 1. 서명 데이터 검증
  if (!validateSignatureData(signatureData)) {
    return NextResponse.json(
      { error: 'SIGNATURE_INVALID' },
      { status: 400 }
    );
  }

  // 2. 계약서 상태 확인
  const contract = await fetchContract(params.id);
  if (contract.status !== 'SENT') {
    return NextResponse.json(
      { error: 'CONTRACT_ALREADY_SIGNED' },
      { status: 409 }
    );
  }

  // 3. 트랜잭션 시작
  await supabase.rpc('begin_transaction');

  try {
    // 4. 서명 데이터 저장
    await supabase
      .from('contracts')
      .update({
        status: party === 'customer' ? 'CUSTOMER_SIGNED' : 'ADMIN_SIGNED',
        signature_data: signatureData,
        [`${party}_signed_at`]: new Date().toISOString(),
        [`${party}_ip_address`]: signatureData.ipAddress
      })
      .eq('id', params.id);

    // 5. 서명된 PDF 생성
    const html = renderContractHTML(contract, signatureData);
    const pdf = await htmlToPDF(html);
    const path = `contracts/signed/CTR-${contract.contract_number}-SIGNED.pdf`;
    const url = await uploadPDF(path, pdf);

    // 6. PDF URL 저장
    await supabase
      .from('contracts')
      .update({ pdf_url: url })
      .eq('id', params.id);

    // 7. 감사 로그
    await logAuditEvent('contract.signed', {
      contractId: params.id,
      party,
      ipAddress: signatureData.ipAddress
    });

    // 8. 양측 서명 확인 → 자동 활성화
    const updated = await fetchContract(params.id);
    if (updated.customer_signed_at && updated.admin_signed_at) {
      await supabase
        .from('contracts')
        .update({ status: 'ACTIVE' })
        .eq('id', params.id);
    }

    await supabase.rpc('commit_transaction');

    return NextResponse.json({
      success: true,
      data: { url, status: updated.status }
    });

  } catch (error) {
    await supabase.rpc('rollback_transaction');
    throw error;
  }
}
```

**체크리스트**:
- [ ] POST /api/b2b/contracts/:id/sign 구현
- [ ] 트랜잭션 처리
- [ ] 감사 로그 기록
- [ ] PDF 병합 (pdf-lib)
- [ ] 이메일 알림 (선택)

**Week 4 완료 기준**:
- [ ] 계약서 PDF 생성 성공
- [ ] 전자 서명 기능 작동
- [ ] 서명 데이터 검증 완료
- [ ] 감사 로그 기록됨

---

## 5. Phase 4: 최적화 및 배포 (Week 5)

### Week 5: Optimization & Deployment

#### Day 1-2: 성능 최적화

```typescript
// 1. Vercel KV 캐싱
import { kv } from '@vercel/kv';

async function getCachedPDF(key: string): Promise<string | null> {
  return await kv.get(key);
}

async function setCachedPDF(key: string, url: string): Promise<void> {
  await kv.set(key, url, { ex: 86400 }); // 24시간
}

// 2. 병렬 처리
async function generateBatchPDFs(ids: string[]): Promise<string[]> {
  return await Promise.all(
    ids.map(id => pdfService.generateQuotationPDF(id))
  );
}

// 3. 메모리 최적화
// Puppeteer 브라우저 재사용
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browser;
}
```

**체크리스트**:
- [ ] Vercel KV 캐싱 구현
- [ ] 병렬 PDF 생성
- [ ] Puppeteer 브라우저 풀
- [ ] 메모리 프로파일링

#### Day 3: 테스트

```typescript
// E2E 테스트 (Playwright)
import { test, expect } from '@playwright/test';

test('should generate quotation PDF', async ({ page }) => {
  await page.goto('/b2b/quotations/qt-2025-0001');
  await page.click('[data-testid="generate-pdf-button"]');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="download-pdf-button"]');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/QT-2025-0001\.pdf/);
});

test('should sign contract', async ({ page }) => {
  await page.goto('/b2b/contracts/ctr-2025-0123/sign');

  // 서명 그리기
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 100, y: 100 } });
  await canvas.dragTo(canvas, { targetPosition: { x: 200, y: 150 } });

  // 약관 동의
  await page.check('[name="acceptance"]');

  // 제출
  await page.click('[data-testid="submit-signature-button"]');

  // 확인
  await expect(page.locator('text=署名が完了しました')).toBeVisible();
});
```

**체크리스트**:
- [ ] E2E 테스트 (3개 시나리오)
- [ ] 단위 테스트 (>80% 커버리지)
- [ ] 부하 테스트 (10 동시 요청)
- [ ] 일본어 렌더링 검증

#### Day 4-5: 배포

```bash
# 1. Vercel 배포 설정
# vercel.json

{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "build": {
    "env": {
      "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true",
      "PUPPETEER_EXECUTABLE_PATH": "/usr/bin/chromium-browser"
    }
  }
}

# 2. 배포
vercel --prod

# 3. 모니터링 대시보드 설정
# Vercel Analytics, Sentry
```

**체크리스트**:
- [ ] Vercel 배포 설정
- [ ] Puppeteer Lambda 설정
- [ ] 환경 변수 구성
- [ ] 모니터링 도구 설치
- [ ] 롤백 절차 문서화

**Week 5 완료 기준**:
- [ ] 프로덕션 배포 완료
- [ ] 모든 테스트 통과
- [ ] 모니터링 작동
- [ ] 문서 완료

---

## 6. 추후 확장

### Phase 5: 대시보드 및 분석 (Week 6-7)

```yaml
Week 6:
  - PDF 생성 통계 대시보드
  - 다운로드 추적
  - 사용자 행동 분석

Week 7:
  - 비용 분석
  - 성능 모니터링
  - 자동화된 리포트
```

### Phase 6: 고급 기능 (Week 8+)

```yaml
Batch Processing:
  - 대량 PDF 생성 (100+)
  - 비동기 작업 큐
  - 진행률 표시

Email Automation:
  - PDF 생성 이메일 발송
  - 계약서 서명 요청
  - 알림 설정

Document Comparison:
  - 버전 간 비교
  - Diff 표시
  - 변경 로그

Multi-language:
  - 영어, 한국어 지원
  - 다국어 템플릿
```

---

## 7. 위험 관리

### 7.1 기술적 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|--------|------|------|----------|
| Puppeteer 콜드 스타트 지연 | 중 | 중 | Vercel Edge Functions, 브라우저 풀 |
| 일본어 폰트 렌더링 문제 | 낮 | 높 | 로컬 폰트 임베딩, 테스트 |
| Supabase Storage 다운 | 낮 | 높 | S3 백업, 장애 조치 |
| PDF 품질 저하 | 낮 | 중 | 자동화된 테스트, 모니터링 |

### 7.2 일정 리스크

| 리스크 | 완화 전략 |
|--------|----------|
| 개발 지연 | Buffer time 20% 할당 |
| 스펙 변경 | Agile 대응, 우선순위 조정 |
| 리소스 부족 | 외부 지원, 범위 축소 |

### 7.3 비용 리스크

| 항목 | 예상 비용 | 완화 전략 |
|------|----------|----------|
| Vercel Pro | $20/월 | 프리플랜 시작 |
| Vercel KV | $5/월 | 캐시 최적화 |
| Supabase Storage | $0.02/GB | 압축, 만료 정책 |
| Puppeteer Lambda | $0 (Edge) | 서버리스 활용 |

**총 월 비용**: $25 (프로덕션)

---

## 8. 성공 측정

### 8.1 KPI (Key Performance Indicators)

```yaml
Performance:
  - PDF 생성 시간: p95 < 5s
  - API 응답: p95 < 500ms (캐시)
  - 가용성: 99.9%

Quality:
  - 일본어 렌더링: 100%
  - PDF 품질: 네이티브 수준
  - 버그 밀도: < 1/KLOC

Cost:
  - 비용/문서: < ¥10
  - Storage 비용: < ¥5,000/월
  - 대역폭 비용: < ¥10,000/월
```

### 8.2 마일스톤

| 주기 | 마일스톤 | 성공 기준 |
|------|----------|----------|
| Week 2 | 견적서 PDF | 5개 테스트 케이스 통과 |
| Week 3 | 사양서 PDF | 8페이지 완벽 렌더링 |
| Week 4 | 계약서 서명 | 전자 서명 검증 통과 |
| Week 5 | 프로덕션 배포 | 모니터링 대시보드 작동 |

---

## 9. 다음 단계

### 9.1 즉시 시작

```bash
# 1. 브랜치 생성
git checkout -b feature/pdf-generation-system

# 2. 라이브러리 설치
npm install exceljs puppeteer xlsx-render pdf-lib

# 3. Supabase Storage 설정
# Dashboard → Storage → New Bucket

# 4. 첫 번째 테스트
npm run test:pdf
```

### 9.2 문서 참조

1. `docs/pdf-system-design.md` - 전체 시스템 설계
2. `docs/pdf-tech-stack-comparison.md` - 기술 스택 분석
3. `docs/pdf-api-specification.md` - API 명세
4. `docs/pdf-data-flow-and-storage.md` - 데이터 흐름

---

**문서 끝**

**다음 단계**: Week 1 Day 1 시작 - 라이브러리 설치 및 설정
