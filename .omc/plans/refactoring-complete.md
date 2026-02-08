# EpackageLab 포괄적 리팩토링 계획 (수정안)
## Comprehensive Refactoring Plan for EpackageLab Project (Revised)

---

## 생성 정보 / Creation Information
- **생성일**: 2026-02-08
- **수정일**: 2026-02-08 (Critic v2.1 - 사실적 오류 수정)
- **프로젝트**: EpackageLab (epackage-lab-web)
- **위치**: C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1
- **현재 브랜치**: feature/portal-admin-merge
- **작성자**: Prometheus (Strategic Planning Consultant)
- **검토자**: Critic (REJECT → 승인 조건부 수정)

---

## Critic v2.1 주요 수정사항 (사실적 오류 정정)

### 1. PDF 파일 라인 수 정정
| 파일 | v2.0 주장 | v2.1 실제 | 수정 |
|------|-----------|----------|------|
| pdf-contracts.ts | ~300 | **존재하지 않음** | 삭제 |
| contractPdfGenerator.ts | ~400 | **524** | 정정 |
| specSheetPdfGenerator.ts | ~350 | **1,198** | 정정 |

### 2. 컴포넌트 수량 정정
| 항목 | v2.0 주장 | v2.1 실제 | 수정 |
|------|-----------|----------|------|
| 총 TSX 컴포넌트 | 67개 (주장) | **435개** (실제) | 정정 |
| 검증 방식 | 미확인 | `powershell Get-ChildItem` | 명시 |

### 3. 폰트 로딩 분석 정정
| 항목 | v2.0 주장 | v2.1 실제 | 수정 |
|------|-----------|----------|------|
| 주장 | "Noto Sans JP Base64 사용" | **Google Fonts @import 사용** | 정정 |
| 실제 | 확인 없음 | `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP')` | 검증됨 |

### 4. 의존관계 분석 정정
| 항목 | v2.0 주장 | v2.1 실제 | 수정 |
|------|-----------|----------|------|
| ImprovedQuotingWizard import | 미검증 | **2곳에서만 사용** | 검증됨 |
| 검증 방식 | 미확인 | `grep -r "import.*ImprovedQuotingWizard"` | 명시 |

---

## 목차 / Table of Contents

1. [완료된 작업 (Phase 1)](#completed-phase-1)
2. [작업 우선순위](#priorities)
3. [Phase 2: PDF 생성 시스템 통합](#phase-2)
4. [Phase 3: 가격 계산 엔진 통일](#phase-3)
5. [Phase 4: 견적 컴포넌트 리팩토링](#phase-4)
6. [Phase 5: API 라우트 체계화](#phase-5)
7. [Phase 6: DB 스키마 표준화](#phase-6)
8. [위험 식별 및 완화 대책](#risks)
9. [수락 기준](#acceptance-criteria)
10. [일정 및 마일스톤](#milestones)
11. [회귀 테스트 전략](#regression-testing)
12. [골든 데이터셋 구축 가이드](#golden-dataset)

---

## 완료된 작업 (Phase 1) <a name="completed-phase-1"></a>

### 1. 형 정의 통합 ✅

**목표:** 중복된 형 정의를 단일 출처로 통합

**완료된 파일:**
```
src/types/
├── core/
│   ├── common.ts          # BaseResponse, ApiResponse, Address, Pagination
│   ├── database.ts        # DB 관련 enum, base types
│   └── api.ts             # API request/response types
├── features/
│   ├── quotation.ts       # 견적 관련 형
│   ├── order.ts           # 주문 관련 형
│   ├── inventory.ts       # 재고 관련 형
│   ├── production.ts      # 생산 관련 형
│   ├── shipment.ts        # 배송 관련 형
│   └── contract.ts        # 계약 관련 형
└── index.ts               # 통합 에크스포트
```

**결과:**
- 형 정의 중복 제거
- 단일 출처(Single Source of Truth) 확보
- 역 호환성 유지 (기존 import 경로 유지)

### 2. 에러 핸들링 통일 ✅

**목표:** 일관된 에러 처리 체계 수립

**완료된 파일:**
```
src/lib/errors/
├── AppError.ts            # 기본 에러 클래스
├── ApiError.ts            # API 에러, HttpStatus 매핑
├── ValidationError.ts     # 검증 에러, Zod 통합
├── DatabaseError.ts       # DB 에러, Supabase 통합
├── handler.ts             # 통일 에러 핸들러
└── __tests__/
    ├── AppError.test.ts
    ├── ApiError.test.ts
    ├── ValidationError.test.ts
    └── DatabaseError.test.ts
```

**단위 테스트 완료:** 4개 테스트 파일 (모든 에러 클래스 커버)

### 3. 테스트 환경 정비 ✅

**완료된 작업:**
- Jest 설정 확인 (jest.config.js)
- Playwright 설정 확인 (playwright.config.ts)
- 기존 테스트 구조 파악
- 테스트 실행 스크립트 정리

---

## 작업 우선순위 <a name="priorities"></a>

| 우선순위 | Phase | 작업 | 예상 시간 | 리스크 |
|---------|-------|------|----------|--------|
| **높음** | Phase 2 | PDF 생성 시스템 통합 | 5-7일 | 중간 |
| **높음** | Phase 3 | 가격 계산 엔진 통일 | 10-14일 | 높음 |
| **중간** | Phase 4 | 견적 컴포넌트 리팩토링 | 14-21일 | 중간 |
| **중간** | Phase 5 | API 라우트 체계화 | 5-7일 | 낮음 |
| **낮음** | Phase 6 | DB 스키마 표준화 | 3-5일 | 중간 |

**총 예상 기간:** 40-60일 (약 6-10주)
**이전 예상:** 23-33일 → **85% 증가** (현실성 강화)

---

## Phase 2: PDF 생성 시스템 통합 <a name="phase-2"></a>

### 목표
분산된 PDF 생성 파일을 통합하고 중복 코드를 제거합니다.

### 현재 상황 (실제 검증 완료)

#### 실제 PDF 파일 목록 (검증됨)

**검증 명령어:**
```bash
wc -l src/lib/pdf/*.ts
grep -r "NotoSansJP\|Helvetica\|font" src/lib/pdf/
```

**실제 파일:**
| 파일 | 경로 | 실제 라인 수 | 주요 기능 | 폰트 방식 | 실행 위치 |
|------|------|-------------|----------|----------|----------|
| **contractPdfGenerator.ts** | src/lib/pdf/ | **524** | 계약서 PDF 생성 | Playwright + HTML 템플릿 | Server |
| **specSheetPdfGenerator.ts** | src/lib/pdf/ | **1,198** | 스펙시트 PDF 생성 | **Google Fonts @import** | Server |

**검증된 폰트 로딩 방식:**
```typescript
// specSheetPdfGenerator.ts 라인 154
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');

// 라인 163
font-family: 'Noto Sans JP', sans-serif;
```

**존재하지 않는 파일 (v2.0에서 잘못 포함):**
- ❌ pdf-contracts.ts (존재하지 않음)
- ❌ pdf-generator.ts (src/lib/에 없음)
- ❌ pdf-contracts-enhanced.ts (존재하지 않음)

**추가 조사 필요 파일:**
- src/lib/excel/pdfConverter.tsx (클라이언트 측 PDF)
- src/lib/excel/clientPdfGenerator.tsx (클라이언트 측 PDF)
- src/lib/excel/quotationToPdfMapper.ts

### 목표 구조

```
src/lib/pdf/
├── core/
│   ├── base.ts              # BasePdfGenerator 추상 클래스
│   ├── template-manager.ts  # 템플릿 관리자
│   ├── font-manager.ts      # 폰트 관리자 (Google Fonts 통합)
│   └── client-adapter.ts    # 클라이언트 PDF 어댑터
├── generators/
│   ├── contract-generator.ts    # 계약서 생성기
│   ├── quotation-generator.ts   # 견적서 생성기
│   └── specsheet-generator.ts   # 스펙시트 생성기
├── templates/
│   ├── contract-template.ts
│   ├── quotation-template.ts
│   └── specsheet-template.ts
├── utils/
│   ├── font-loader.ts       # 폰트 로딩 유틸리티
│   └── layout-helper.ts     # 레이아웃 계산 헬퍼
└── __tests__/
    ├── contract-generator.test.ts
    ├── quotation-generator.test.ts
    ├── specsheet-generator.test.ts
    └── font-manager.test.ts
```

### 작업 단계

#### Step 2.1: 실제 PDF 파일 심층 분석 (1일)

**작업 내용:**

1. **모든 PDF 관련 파일 발견**
   ```bash
   find src -name "*pdf*.ts" -o -name "*pdf*.tsx"
   find src -name "*Pdf*.ts" -o -name "*Pdf*.tsx"
   ```

2. **각 파일의 실제 라인 수 확인**
   ```bash
   wc -l [각 파일 경로]
   ```

3. **폰트 로딩 방식 검증**
   ```bash
   grep -n "font\|Font" src/lib/pdf/*.ts
   ```

4. **의존관계 분석**
   ```bash
   grep -r "import.*contractPdfGenerator\|import.*specSheetPdfGenerator" src/
   ```

**수락 기준:**
- [ ] 모든 PDF 파일 발견 및 목록화
- [ ] 각 파일의 실제 라인 수 확인
- [ ] 폰트 로딩 방식 100% 검증
- [ ] import 의존관계 매트릭스 작성

#### Step 2.2: 공통 PDF 인프라 구축 (1.5일)

**파일 생성 및 코드 추출:**

1. **src/lib/pdf/core/base.ts** (신규)
   - BasePdfGenerator 추상 클래스
   - Playwright 기반 공통 로직
   - **추출 대상:**
     - contractPdfGenerator.ts 라인 156-232 (PDF 생성 파이프라인)
     - specSheetPdfGenerator.ts 공통 패턴

2. **src/lib/pdf/core/font-manager.ts** (신규)
   - Google Fonts 통합 폰트 관리
   - **실제 방식 반영:**
     - `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP')`
     - Noto Sans KR 추가 지원
   - 로컬 캐싱 전략

3. **src/lib/pdf/core/template-manager.ts** (신규)
   - Handlebars 템플릿 통합 관리
   - **추출 대상:**
     - contractPdfGenerator.ts 라인 48-54 (템플릿 로딩)
     - specSheetPdfGenerator.ts 템플릿 로직

**수락 기준:**
- [ ] BasePdfGenerator 인터페이스 정의 완료
- [ ] 폰트 관리자가 Google Fonts 방식 지원
- [ ] 템플릿 관리자가 Handlebars 통합
- [ ] 단위 테스트 통과

#### Step 2.3: 계약서 생성기 통합 (2일)

**파일:** `src/lib/pdf/generators/contract-generator.ts`

**실제 기반 리팩토링:**

1. **contractPdfGenerator.ts (524라인) 분석**
   - **라인 1-23:** import 문
   - **라인 24-54:** 상수 정의, 템플릿 경로
   - **라인 48-54:** loadTemplate 함수
   - **라인 60-144:** prepareTemplateData 함수
   - **라인 156-232:** generateContractPdf 핵심 로직
   - **라인 234-255:** generateContractPdfBase64
   - **라인 264-332:** generateContractPdfWithStyling
   - **라인 339-373:** validateContractData
   - **라인 380-389:** estimateContractPdfSize
   - **라인 400-419:** formatJapaneseContractDate
   - **라인 425-524:** createMockContractData

2. **통합 전략:**
   - 템플릿 관리 → template-manager.ts
   - 폰트 관리 → font-manager.ts
   - 핵심 로직 → contract-generator.ts

**수락 기준:**
- [ ] 524라인 코드 기능 100% 통합
- [ ] 단위 테스트 통과
- [ ] 역 호환성 유지

#### Step 2.4: 스펙시트 생성기 통합 (1.5일)

**파일:** `src/lib/pdf/generators/specsheet-generator.ts`

**실제 기반 리팩토링:**

1. **specSheetPdfGenerator.ts (1,198라인) 분석**
   - **라인 154:** Google Fonts @import 확인됨
   - 대규모 파일: 세부 기능 분석 필요

2. **주요 기능:**
   - 日本語技術ドキュメント対応
   - B2B作業標準書フォーマット
   - 이미지 처리 포함

**수락 기준:**
- [ ] 1,198라인 코드 기능 통합
- [ ] Google Fonts 방식 유지
- [ ] 단위 테스트 통과

#### Step 2.5: 클라이언트 PDF 조사 및 통합 (1일)

**조사 대상:**
```bash
# 존재 확인
ls -la src/lib/excel/pdfConverter.tsx
ls -la src/lib/excel/clientPdfGenerator.tsx
ls -la src/lib/excel/quotationToPdfMapper.ts
```

**통합 전략:**
- 존재 시: client-adapter.ts로 통합
- 미존재 시: 해당 단계 스킵

**수락 기준:**
- [ ] 클라이언트 PDF 파일 존재 여부 확인
- [ ] 존재 시 통합 완료
- [ ] 단위 테스트 통과

#### Step 2.6: 통합 테스트 및 검증 (1일)

**수락 기준:**
- [ ] 모든 단위 테스트 통과
- [ ] 회귀 테스트 100% 통과
- [ ] 성능 저하 5% 이내

---

## Phase 3: 가격 계산 엔진 통일 <a name="phase-3"></a>

### 목표
중복된 가격 계산 파일을 단일 통합 엔진으로 통합합니다.

### 현재 상황 (조사 필요)

**조사 필요 파일:**
```bash
# 파일 존재 및 라인 수 확인
wc -l src/lib/pricing-engine.ts
wc -l src/lib/unified-pricing-engine.ts
wc -l src/lib/pricing_new/engine.ts
wc -l src/lib/pricing/PriceCalculationEngine.ts
```

**의존관계 분석:**
```bash
grep -r "import.*pricing-engine\|import.*unified-pricing-engine" src/
```

### 목표 구조

```
src/lib/pricing/
├── core/
│   ├── engine.ts            # 메인 가격 엔진
│   ├── calculator.ts        # 기본 계산기 추상 클래스
│   ├── constants.ts         # 통일 상수 정의
│   └── types.ts             # 가격 관련 형 정의
├── strategies/
│   ├── base-strategy.ts     # 전략 기본 클래스
│   ├── pouch-strategy.ts    # 파우치 제품 전략
│   ├── roll-film-strategy.ts # 롤 필름 전략
│   ├── sku-strategy.ts      # SKU 계산 전략
│   └── post-processing-strategy.ts # 후공정 전략
├── validators/
│   ├── quote-validator.ts   # 견적 검증기
│   ├── material-validator.ts # 재료 검증기
│   └── price-validator.ts   # 가격 검증기
├── utils/
│   ├── quantity-calculator.ts  # 수량별 할인 계산
│   ├── material-cost.ts         # 재료 비용 계산
│   └── margin-calculator.ts     # 마진 계산
└── __tests__/
    ├── engine.test.ts
    ├── pouch-strategy.test.ts
    ├── roll-film-strategy.test.ts
    ├── sku-strategy.test.ts
    └── regression-test.ts  # 회귀 테스트 (골든 데이터셋)
```

---

## Phase 4: 견적 컴포넌트 리팩토링 <a name="phase-4"></a>

### 목표
견적 관련 컴포넌트를 기능별로 모듈화하고 중복을 제거합니다.

### 현재 상황 (실제 검증 완료)

#### 실제 컴포넌트 수량 (검증됨)

**검증 명령어:**
```powershell
(Get-ChildItem 'src' -Recurse -Filter '*.tsx' | Measure-Object).Count
```

**실제 결과:**
- **총 TSX 컴포넌트: 435개** (v2.0에서 주장한 67개는 오류)

**ImprovedQuotingWizard 의존관계 (검증됨):**
```bash
grep -r "import.*ImprovedQuotingWizard" src/
```

**실제 사용처 (2곳):**
1. src/app/quote-simulator/page.tsx (라인 18)
2. src/components/quote/__tests__/ImprovedQuotingWizard.xss.test.tsx (라인 13)

### 목표 구조

```
src/components/quotation/
├── wizard/
│   ├── QuotationWizard.tsx         # 메인 위자드 (통합)
│   ├── steps/                      # 스텝별 컴포넌트
│   │   ├── BasicInfoStep.tsx
│   │   ├── MaterialStep.tsx
│   │   ├── SizeStep.tsx
│   │   ├── PostProcessingStep.tsx
│   │   ├── QuantityStep.tsx
│   │   └── ReviewStep.tsx
│   └── hooks/                      # 위자드 관련 훅
│       ├── useQuotationState.ts
│       ├── useQuotationValidation.ts
│       └── useQuotationNavigation.ts
├── preview/
│   ├── LivePreview.tsx             # 실시간 미리보기 (통합)
│   ├── PostProcessingPreview.tsx
│   ├── EnvelopePreview.tsx
│   └── hooks/
│       └── usePreviewSync.ts
├── pricing/
│   ├── PriceBreakdown.tsx          # 가격 내역 (통합)
│   ├── CostBreakdownPanel.tsx
│   ├── MultiQuantityComparison.tsx # 수량 비교표
│   └── hooks/
│       └── usePriceCalculation.ts
├── selectors/
│   ├── ProductSelector.tsx         # 제품 선택기
│   ├── MaterialSelector.tsx        # 재료 선택기 (통합)
│   ├── QuantitySelector.tsx        # 수량 선택기
│   └── PostProcessingSelector.tsx  # 후공정 선택기
├── shared/
│   ├── BankInfoCard.tsx
│   ├── StatusIndicator.tsx
│   ├── ErrorToast.tsx
│   ├── LoadingSpinner.tsx
│   └── ConfirmDialog.tsx
├── layouts/
│   ├── QuotationLayout.tsx
│   └── WizardLayout.tsx
└── __tests__/
    ├── QuotationWizard.test.tsx
    ├── pricing/
    ├── preview/
    └── selectors/
```

### 작업 단계

#### Step 4.1: 전체 컴포넌트 심층 분류 (2일)

**실제 435개 컴포넌트 분류:**

```bash
# 견적 관련 컴포넌트 필터링
find src/components/quote -name "*.tsx"
find src/components/quotation -name "*.tsx"
find src -name "*Quote*.tsx"
find src -name "*quoting*.tsx"
```

**수락 기준:**
- [ ] 견적 관련 컴포넌트 정확한 수량 파악
- [ ] 의존관계 다이어그램 작성 (실제 import 기반)
- [ ] 중복 컴포넌트 식별

---

## Phase 5: API 라우트 체계화 <a name="phase-5"></a>

### 목표
API 라우트를 체계적으로 구성하고 중복을 제거합니다.

### 현재 상황 (조사 필요)

**조사 필요:**
```bash
# API 라우트 수량 확인
find src/app/api -name "route.ts" | wc -l
```

---

## Phase 6: DB 스키마 표준화 <a name="phase-6"></a>

### 목표
DB 스키마의 Enum을 통일하고 타임스탬프를 표준화합니다.

---

## 위험 식별 및 완화 대책 <a name="risks"></a>

| 위험 | 확률 | 영향 | 완화 대책 | 롤백 기준 |
|-----|------|------|----------|----------|
| **가격 계산 오류** | 중간 | 높음 | 철저한 단위 테스트, 회귀 테스트, 골든 데이터셋 | 가격 차이 0.1% 이상 |
| **PDF 레이아웃 변경** | 낮음 | 중간 | 시각적 회귀 테스트, 스크린샷 비교 | 픽셀 차이 5px 이상 |
| **API 호환성 문제** | 중간 | 중간 | API 버저닝, 레거시 라우트 유지 | 클라이언트 오류 1% 이상 |
| **DB 데이터 손실** | 낮음 | 높음 | 전체 백업, 테스트 환경 실행, 롤백 스크립트 | 데이터 1건이라도 손실 |
| **성능 저하** | 중간 | 중간 | 벤치마킹, 프로파일링, 최적화 | 성능 20% 이상 저하 |
| **사용자 경험 저하** | 낮음 | 중간 | E2E 테스트, 사용자 테스트 | UI 버그 3개 이상 |

---

## 수락 기준 <a name="acceptance-criteria"></a>

### 공통 기준 (모든 Phase)

1. **코드 품질:**
   - [ ] TypeScript 오류 0개
   - [ ] ESLint 경고 0개
   - [ ] 코드 커버리지 80% 이상

2. **테스트:**
   - [ ] 단위 테스트 통과 (100%)
   - [ ] 통합 테스트 통과 (100%)
   - [ ] E2E 테스트 통과 (90% 이상)

3. **성능:**
   - [ ] 빌드 시간 증가 10% 이내
   - [ ] 런타임 성능 저하 5% 이내
   - [ ] 번들 크기 증가 5% 이내

### Phase별 기준

#### Phase 2: PDF 생성 시스템
- [ ] 실제 파일 기반 통합 (contractPdfGenerator: 524라인, specSheetPdfGenerator: 1,198라인)
- [ ] PDF 출력 레이아웃 100% 일치
- [ ] 생성 시간 증가 5% 이내
- [ ] Google Fonts 방식 폰트 로딩 통합

#### Phase 3: 가격 계산 엔진
- [ ] 실제 파일 기반 통합 (조사 후 수치 확정)
- [ ] 가격 계산 결과 100% 일치 (골든 데이터셋)
- [ ] 계산 시간 증가 10% 이내

#### Phase 4: 견적 컴포넌트
- [ ] 실제 435개 TSX 중 견적 관련 컴포넌트 정확히 식별
- [ ] ImprovedQuotingWizard 의존관계 2곳 검증 완료
- [ ] UI 변경 없음 (시각적 회귀 테스트 통과)

---

## 회귀 테스트 전략 <a name="regression-testing"></a>

### 골든 데이터셋 구축 방법

#### 1. 데이터 추출
```bash
# 스크립트: scripts/extract-golden-dataset.js
# 기존 시스템에서 실제 시나리오 추출
# 출력: tests/golden-dataset/pricing.json
```

#### 2. 결과 저장
```json
{
  "scenarios": [
    {
      "id": "scenario-001",
      "input": { /* 견적 데이터 */ },
      "expected": {
        "totalPrice": 125000,
        "materialCost": 80000,
        "laborCost": 45000
      }
    }
  ]
}
```

#### 3. 비교 스크립트
```javascript
// scripts/compare-pricing.js
const golden = require('./tests/golden-dataset/pricing.json');
const newEngine = require('./src/lib/pricing/core/engine');

// 각 시나리오 실행 및 결과 비교
// 허용 오차: 0.1%
```

### 롤백 기준

| 항목 | 기준 | 조치 |
|------|------|------|
| 가격 차이 | 0.1% 이상 | 즉시 롤백 |
| 성능 저하 | 20% 이상 | 롤백 고려 |
| 오류율 | 1% 이상 | 즉시 롤백 |
| 데이터 손실 | 1건이라도 | 즉시 롤백 |

---

## v2.1 수정 사항 요약

### 정정된 사실적 오류

1. **PDF 파일 라인 수:**
   - pdf-contracts.ts: 존재하지 않음 (삭제)
   - contractPdfGenerator.ts: 400 → 524 (정정)
   - specSheetPdfGenerator.ts: 350 → 1,198 (정정)

2. **컴포넌트 수량:**
   - 주장 67개 → 실제 435개 (정정)

3. **폰트 로딩:**
   - 주장 "Noto Sans JP Base64" → 실제 "Google Fonts @import" (정정)

4. **의존관계:**
   - ImprovedQuotingWizard: 미검증 → 실제 2곳 사용 (검증됨)

### 검증 방법 명시

모든 수치는 실제 명령어 실행으로 검증됨:
```bash
wc -l src/lib/pdf/*.ts
powershell (Get-ChildItem 'src' -Recurse -Filter '*.tsx' | Measure-Object).Count
grep -r "import.*ImprovedQuotingWizard" src/
grep -r "NotoSansJP\|Helvetica\|font" src/lib/pdf/
```

---

## 다음 단계

### 즉시 시작할 작업

1. **Phase 2 시작:** PDF 생성 시스템 통합
   - Step 2.1: 실제 PDF 파일 심층 분석 (1일)
2. **추가 조사:** 모든 관련 파일 실제 라인 수 확인
3. **검증 프로세스:** 모든 수치 실제 명령어로 검증

---

**문서 버전:** 2.1 (Critic v2.1 사실적 오류 수정)
**최종 수정:** 2026-02-08
**상태:** 검토 완료 (모든 수치 실제 검증됨)

---

이 계획은 Critic v2.1의 피드백을 반영하여 사실적 오류를 정정하였습니다.
주요 변경사항:
- ✅ PDF 파일 라인 수 실제 검증 (wc -l 명령어)
- ✅ 컴포넌트 수량 실제 검증 (435개)
- ✅ 폰트 로딩 방식 실제 검증 (Google Fonts @import)
- ✅ 의존관계 실제 검증 (grep 명령어)
- ✅ 모든 검증 방법 명시
