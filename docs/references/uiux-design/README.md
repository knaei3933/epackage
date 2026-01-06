# EPACKAGE B2B 워크플로우 UI/UX 설계 - 개요

## 문서 구조

이 설계 문서는 다음 4개의 문서로 구성됩니다:

1. **[b2b-workflow-design.md](./b2b-workflow-design.md)** - 메인 설계 문서
2. **[component-specifications.md](./component-specifications.md)** - UI 컴포넌트 상세 명세
3. **[user-journey-map.md](./user-journey-map.md)** - 사용자 여정 맵
4. **README.md** (이 문서) - 개요 및 시작 가이드

---

## 빠른 시작

### 1. 전체 구조 파악 (10분)

**[b2b-workflow-design.md](./b2b-workflow-design.md)**을 먼저 읽으세요.

- **섹션 1-2**: 사이트맵 및 와이어프레임 - 전체 페이지 구조 이해
- **섹션 3**: 핵심 페이지 목업 - 주요 페이지 레이아웃 파악
- **섹션 4**: UI 컴포넌트 개요 - 어떤 컴포넌트가 필요한지 확인
- **섹션 6**: 상태 관리 설계 - 주문 상태 기계 이해

### 2. 컴포넌트 개발 (개발자)

**[component-specifications.md](./component-specifications.md)**을 참조하여 컴포넌트를 구현하세요.

**구현 우선순서:**
1. **WorkflowTimeline** (P0) - 모든 페이지의 핵심
2. **WorkflowStatusBadge** (P0) - 상태 표시
3. **DocumentViewer** (P1) - PDF 뷰어
4. **FileUploader** (P1) - 파일 업로드
5. **SignatureCanvas** (P2) - 전자 서명
6. **ProductionTimeline** (P2) - 생산 진척
7. **ShipmentTracker** (P3) - 배송 추적

각 컴포넌트의 명세서에는 다음이 포함됩니다:
- TypeScript 인터페이스 정의
- CSS 스타일 명세
- 사용 예시 코드
- 테스트 전략

### 3. 사용자 경험 이해 (디자이너/PM)

**[user-journey-map.md](./user-journey-map.md)**을 참조하여 사용자 경험을 이해하세요.

**핵심 섹션:**
- **섹션 1**: 사용자 페르소나 - 타겟 고객 이해
- **섹션 2**: 시나리오별 여정 - 단계별 사용자 행동
- **섹션 3**: 감정 커브 - 사용자 감정 변화 파악
- **섹션 5**: 페인 포인트 - 해결해야 할 문제점

---

## 10단계 워크플로우 개요

### 단계 요약

| 단계 | 페이지 | 주요 액션 | 컴포넌트 |
|------|--------|----------|----------|
| **1. 회원가입** | `/member/registration` | 기업 정보 입력 | Form, Validation |
| **2. 견적요청** | `/member/quotations/request` | 제품 선택, 사양 입력 | ProductSelector, QuoteWizard |
| **3. 주문** | `/member/orders/[id]` | 견적 승인, 주문 확정 | DocumentViewer, ConfirmButton |
| **4. 데이터입고** | `/member/orders/[id]/data-upload` | .ai/PDF 파일 업로드 | FileUploader, AIExtractor |
| **5. 작업표준서** | `/member/orders/[id]/work-order` | 사양서 확인, 승인 | DocumentViewer |
| **6. 계약서송부** | `/admin/orders/[id]/contract` | 계약서 발송 | ContractSender |
| **7. 계약서반송** | `/member/orders/[id]/contract` | 전자 서명 | SignatureCanvas, DocumentViewer |
| **8. 생산** | `/member/orders/[id]/production` | 생산 진척 확인 | ProductionTimeline, PhotoGallery |
| **9. 입고** | `/admin/orders/[id]/stock` | 재고 등록 | StockManager |
| **10. 출하** | `/member/orders/[id]/shipment` | 배송 추적, 수령 | ShipmentTracker |

### 주요 상태 전이

```
회원가입 → 견적요청 → 견적대기 → 견적승인 → 주문확정
    ↓
데이터입고대기 → 데이터입고 → 데이터가공중
    ↓
작업표준서대기 → 작업표준서승인
    ↓
계약서대기 → 계약서서명 → 계약완료
    ↓
생산대기 → 생산중 → 품질검사 → 입고완료
    ↓
출하대기 → 배송중 → 배송완료
```

---

## 기술 스택

### 프론트엔드
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript + Tailwind CSS 4
- **상태 관리**: React Context + Zustand
- **폼**: React Hook Form + Zod
- **아이콘**: Lucide React

### PDF 및 문서
- **PDF 뷰어**: PDF.js
- **PDF 생성**: jsPDF
- **전자 서명**: React-Signature-Canvas

### 파일 업로드
- **드롭존**: React Dropzone
- **스토리지**: Supabase Storage

---

## 폴더 구조

```
src/
├── app/
│   ├── member/
│   │   ├── registration/
│   │   │   └── page.tsx                    # 회원가입
│   │   ├── quotations/
│   │   │   ├── page.tsx                    # 견적 목록
│   │   │   └── request/
│   │   │       └── page.tsx                # 견적 요청
│   │   └── orders/
│   │       ├── page.tsx                    # 주문 목록
│   │       └── [id]/
│   │           ├── page.tsx                # 주문 상세
│   │           ├── data-upload/
│   │           │   └── page.tsx            # 데이터 업로드
│   │           ├── work-order/
│   │           │   └── page.tsx            # 작업표준서
│   │           ├── contract/
│   │           │   └── page.tsx            # 계약서 서명
│   │           ├── production/
│   │           │   └── page.tsx            # 생산 진척
│   │           └── shipment/
│   │               └── page.tsx            # 배송 추적
│   └── admin/
│       ├── dashboard/
│       │   └── page.tsx                    # 관리자 대시보드
│       ├── quotations/
│       │   └── page.tsx                    # 견적 관리
│       ├── orders/
│       │   ├── page.tsx                    # 주문 관리
│       │   └── [id]/
│       │       └── page.tsx                # 주문 상세
│       ├── production/
│       │   └── page.tsx                    # 생산 관리
│       └── contracts/
│           └── page.tsx                    # 계약 관리
│
├── components/
│   ├── workflow/                           # 워크플로우 전용 컴포넌트
│   │   ├── WorkflowTimeline.tsx            # P0 - 10단계 타임라인
│   │   ├── WorkflowStatusBadge.tsx         # P0 - 상태 배지
│   │   ├── DocumentViewer.tsx              # P1 - PDF 뷰어
│   │   ├── FileUploader.tsx                # P1 - 파일 업로드
│   │   ├── SignatureCanvas.tsx             # P2 - 전자 서명
│   │   ├── ProductionTimeline.tsx          # P2 - 생산 타임라인
│   │   └── ShipmentTracker.tsx             # P3 - 배송 추적
│   │
│   └── ui/                                 # 기존 UI 컴포넌트
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── ...
│
├── contexts/
│   ├── OrderContext.tsx                    # 주문 상태 관리
│   └── WorkflowContext.tsx                 # 워크플로우 상태
│
├── hooks/
│   ├── useOrder.ts                         # 주문 정보 조회
│   ├── useWorkflow.ts                      # 워크플로우 상태
│   └── useFileUpload.ts                    # 파일 업로드
│
├── lib/
│   ├── workflow/
│   │   ├── transitions.ts                  # 상태 전이 로직
│   │   ├── validators.ts                   # 밸리데이터
│   │   └── calculators.ts                  # 가격/납기 계산
│   └── ...
│
└── types/
    ├── workflow.ts                         # 워크플로우 타입
    ├── order.ts                            # 주문 타입
    └── document.ts                         # 문서 타입
```

---

## 구현 로드맵

### Phase 1: 기본 인프라 (Week 1-2)

**목표:** 핵심 컴포넌트 및 레이아웃 구현

- [ ] 라우팅 구조 설정
- [ ] 레이아웃 컴포넌트 (사이드바, 헤더)
- [ ] `WorkflowTimeline` 컴포넌트 (P0)
- [ ] `WorkflowStatusBadge` 컴포넌트 (P0)
- [ ] 주문 상태 기계 구현
- [ ] 기본 테스트 작성

**산출물:**
- 타임라인이 표시되는 주문 상세 페이지
- 상태별 배지 스타일

### Phase 2: 핵심 페이지 (Week 3-4)

**목표:** 회원가입, 견적, 주문 기본 흐름 구현

- [ ] 회원가입 페이지
- [ ] 견적 요청 페이지 (기존 것 활용)
- [ ] 주문 상세 페이지
- [ ] `FileUploader` 컴포넌트 (P1)
- [ ] 파일 업로드 API
- [ ] AI 데이터 추출 기본 구조

**산출물:**
- 회원가입 ~ 주문까지 기본 흐름
- 파일 업로드 기능

### Phase 3: 문서 관리 (Week 5-6)

**목표:** PDF 뷰어 및 계약서 서명 구현

- [ ] `DocumentViewer` 컴포넌트 (P1)
- [ ] 작업표준서 확인 페이지
- [ ] `SignatureCanvas` 컴포넌트 (P2)
- [ ] 계약서 서명 페이지
- [ ] PDF 생성/저장 API
- [ ] 서명 데이터 저장 API

**산출물:**
- PDF 문서 확인 기능
- 전자 서명 기능

### Phase 4: 생산 및 배송 (Week 7-8)

**목표:** 생산 진척 및 배송 추적 구현

- [ ] `ProductionTimeline` 컴포넌트 (P2)
- [ ] 생산 진척 페이지
- [ ] `ShipmentTracker` 컴포넌트 (P3)
- [ ] 배송 추적 페이지
- [ ] 배송 조회 API 연동
- [ ] 실시간 알림 시스템

**산출물:**
- 생산 진척 모니터링
- 배송 추적 기능

### Phase 5: 관리자 포털 (Week 9-10)

**목표:** 관리자용 기능 구현

- [ ] 관리자 대시보드
- [ ] 견적 관리 페이지
- [ ] 주문 관리 페이지
- [ ] 생산 관리 페이지
- [ ] 계약 관리 페이지
- [ ] 관리자 권한 시스템

**산출물:**
- 완전한 관리자 포털

---

## 디자인 원칙

### 1. 사용자 중심 (User-Centered)

- **명확성**: 다음 단계가 항상 명확해야 함
- **피드백**: 모든 액션에 즉각적인 피드백 제공
- **제어**: 사용자가 프로세스를 제어할 수 있어야 함
- **일관성**: 전체 경험에 일관된 디자인

### 2. 투명성 (Transparency)

- **진척도**: 현재 상태를 항상 표시
- **예상 시간**: 각 단계의 예상 소요 시간 제공
- **업데이트**: 상태 변경 시 즉시 알림
- **히스토리**: 전체 히스토리 제공

### 3. 효율성 (Efficiency)

- **자동화**: 반복 작업 자동화
- **단축키**: 자주 사용하는 기능에 빠른 접근
- **템플릿**: 이전 주문 템플릿 제공
- **AI 활용**: 스마트 추천 및 자동 완성

### 4. 접근성 (Accessibility)

- **키보드 내비게이션**: 모든 기능을 키보드로 조작
- **스크린 리더**: 적절한 ARIA 라벨
- **색상 대비**: WCAG AA 준수
- **반응형**: 모든 기기 지원

---

## 성공 지표

### 고객 경험 지표

| 지표 | 기준값 | 목표값 |
|------|--------|--------|
| 가입 완료율 | 60% | 80% |
| 견적 요청 완료율 | 70% | 90% |
| 주문 전환율 | 50% | 70% |
| 평균 주문 시간 | 2주 | 1.5주 |
| 고객 만족도 | 4.0/5.0 | 4.5/5.0 |
| 재구매율 | 30% | 50% |

### 프로세스 효율성 지표

| 지표 | 기준값 | 목표값 |
|------|--------|--------|
| 견적 처리 시간 | 2일 | 1일 |
| 데이터 처리 시간 | 4시간 | 2시간 |
| 서명 완료율 | 80% | 95% |
| 생산 기간 준수율 | 85% | 95% |

---

## 다음 단계

### 개발팀

1. **[component-specifications.md](./component-specifications.md)** 확인
2. Phase 1 구현 시작 (WorkflowTimeline, StatusBadge)
3. 기존 UI 컴포넌트와 통합 테스트

### 디자인팀

1. **[b2b-workflow-design.md](./b2b-workflow-design.md)** 섹션 3 참조
2. Figma에서 하이파이 프로토타이프 제작
3. 디자인 시스템 업데이트

### 기획팀

1. **[user-journey-map.md](./user-journey-map.md)** 확인
2. 구현 로드맵 구체화
3. 이해관계자 리뷰

---

## 참고 자료

### 내부 문서

- `/docs/api/` - API 문서
- `/docs/database/` - 데이터베이스 스키마
- `/src/types/` - TypeScript 타입 정의

### 외부 리소스

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [PDF.js](https://mozilla.github.io/pdf.js/)

---

## 문서 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2024-12-31 | 최초 작성 | Claude AI |

---

_문서 버전: 1.0_
_작성일: 2024-12-31_
_마지막 수정: 2024-12-31_
