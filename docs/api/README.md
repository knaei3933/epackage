# EPACKAGE Lab B2B API Documentation Index

## 문서 목차 (Document Index)

| 문서 | 설명 | 용도 |
|------|------|------|
| [API_DESIGN_SUMMARY.md](./API_DESIGN_SUMMARY.md) | API 설계 요약 | 전체 개요, 빠른 참조 |
| [B2B_WORKFLOW_API_SPECIFICATION.md](./B2B_WORKFLOW_API_SPECIFICATION.md) | 상세 API 명세서 | 엔드포인트, 요청/응답, 검증 규칙 |
| [openapi-b2b-workflow.yaml](./openapi-b2b-workflow.yaml) | OpenAPI 3.0 사양 | Swagger UI, 코드 생성 |
| [B2B_DATABASE_ERD.md](./B2B_DATABASE_ERD.md) | 데이터베이스 ERD | 테이블 관계, 스키마, 인덱스 |

---

## 빠른 참조 (Quick Reference)

### 10단계 워크플로우

```
1. Registration (회원가입)      POST /api/v1/auth/register
       |
2. Quotation (견적)            POST /api/v1/quotations
       |
3. Order (주문)                POST /api/v1/orders
       |
4. Data Entry (데이터입고)     POST /api/v1/orders/:id/files
       |
5. Work Order (작업표준서)     POST /api/v1/work-orders
       |
6. Contract (계약서)           POST /api/v1/contracts
       |
7. Signing (전자서명)          POST /api/v1/contracts/:id/sign
       |
8. Production (생산)           POST /api/v1/orders/:id/production/logs
       |
9. Stock In (입고)             POST /api/v1/orders/:id/stock-in
       |
10. Shipment (출하)            POST /api/v1/orders/:id/shipment
```

### 주요 상태 값

| 상태 | 설명 | 다음 상태 |
|------|------|-----------|
| PENDING | 회원가입 완료, 승인 대기 | QUOTATION |
| QUOTATION | 견적 단계 | DATA_RECEIVED, CANCELLED |
| DATA_RECEIVED | 데이터 입고 완료 | WORK_ORDER |
| WORK_ORDER | 작업표준서 생성 | CONTRACT_SENT |
| CONTRACT_SENT | 계약서 발송 | CONTRACT_SIGNED, CANCELLED |
| CONTRACT_SIGNED | 고객 서명 완료 | PRODUCTION |
| PRODUCTION | 생산 중 (9단계) | STOCK_IN |
| STOCK_IN | 입고 완료 | SHIPPED |
| SHIPPED | 출하 완료 | DELIVERED |
| DELIVERED | 배송 완료 | - |

---

## API 엔드포인트 찾기 (Find Endpoints)

### 단계별 검색

1단계: **회원가입**
```
POST   /api/v1/auth/register
GET    /api/v1/auth/verify-email
POST   /api/v1/auth/approve-user
```

2단계: **견적**
```
POST   /api/v1/quotations
GET    /api/v1/quotations
GET    /api/v1/quotations/:id
POST   /api/v1/quotations/:id/calculate
POST   /api/v1/quotations/:id/approve
GET    /api/v1/quotations/:id/pdf
```

3단계: **주문**
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/:id
PATCH  /api/v1/orders/:id/status
GET    /api/v1/orders/:id/timeline
```

4단계: **데이터입고**
```
POST   /api/v1/orders/:id/files
POST   /api/v1/orders/:id/files/extract
POST   /api/v1/orders/:id/files/validate
GET    /api/v1/orders/:id/files
```

5단계: **작업표준서**
```
POST   /api/v1/work-orders
GET    /api/v1/work-orders/:id
GET    /api/v1/work-orders/:id/pdf
POST   /api/v1/work-orders/:id/approve
```

6-7단계: **계약서 & 서명**
```
POST   /api/v1/contracts
GET    /api/v1/contracts/:id
POST   /api/v1/contracts/:id/sign
GET    /api/v1/contracts/:id/pdf
GET    /api/v1/contracts/:id/verify
```

8단계: **생산**
```
GET    /api/v1/orders/:id/production
POST   /api/v1/orders/:id/production/logs
POST   /api/v1/orders/:id/production/photos
```

9단계: **입고**
```
POST   /api/v1/orders/:id/stock-in
GET    /api/v1/inventory
POST   /api/v1/inventory/adjust
```

10단계: **출하**
```
POST   /api/v1/orders/:id/shipment
POST   /api/v1/shipments/:id/tracking
GET    /api/v1/shipments/:id/tracking
```

### 관리자
```
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/approvals
```

---

## 데이터베이스 테이블 찾기 (Find Tables)

### 사용자 및 기업
- `profiles` - 사용자 프로필
- `companies` - 기업 정보

### 견적 및 주문
- `quotations` - 견적
- `quotation_items` - 견적 항목
- `orders` - 주문
- `order_items` - 주문 항목
- `order_status_history` - 주문 상태 변경 이력

### 주소
- `delivery_addresses` - 배송지
- `billing_addresses` - 청구지

### 작업표준서 및 생산
- `work_orders` - 작업표준서
- `production_logs` - 생산 진척 로그
- `production_jobs` - 생산 작업
- `production_data` - 생산 데이터
- `spec_sheets` - 사양서
- `spec_sections` - 사양서 섹션

### 계약서
- `contracts` - 계약서

### 파일
- `files` - 파일 관리

### 재고
- `products` - 제품 마스터
- `inventory` - 재고
- `inventory_transactions` - 재고 이동 내역

### 출하
- `shipments` - 출하
- `shipment_tracking` - 배송 추적

### 감사
- `order_audit_log` - 감사 로그

---

## 인증 및 권한 (Authentication & Authorization)

### JWT 토큰 구조
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "sub": "user_id",
  "email": "user@example.com",
  "role": "ADMIN" | "MEMBER",
  "company_id": "optional",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authorization Header
```
Authorization: Bearer <token>
```

---

## 에러 코드 (Error Codes)

| HTTP 상태 | 에러 코드 | 설명 |
|----------|----------|------|
| 400 | VALIDATION_ERROR | 입력 데이터 검증 실패 |
| 401 | UNAUTHORIZED | 인증되지 않음 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스 없음 |
| 409 | DUPLICATE_RESOURCE | 중복 리소스 |
| 422 | BUSINESS_RULE_ERROR | 비즈니스 규칙 위배 |
| 429 | RATE_LIMIT_EXCEEDED | Rate limit 초과 |
| 500 | INTERNAL_ERROR | 서버 내부 에러 |

---

## 예제 코드 (Example Code)

### 회원가입 요청
```bash
curl -X POST https://api.epackage-lab.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "kanji_last_name": "山田",
    "kanji_first_name": "太郎",
    "kana_last_name": "ヤマダ",
    "kana_first_name": "タロウ",
    "business_type": "CORPORATION",
    "company_name": "Example Inc.",
    "legal_entity_number": "1234567890123",
    "product_category": "COSMETICS",
    "postal_code": "1000001",
    "prefecture": "東京都",
    "city": "千代田区",
    "street": "千代田1-1"
  }'
```

### 견적 생성 요청
```bash
curl -X POST https://api.epackage-lab.com/api/v1/quotations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Example Customer",
    "customer_email": "customer@example.com",
    "items": [
      {
        "product_name": "スタンドアップパウチ",
        "quantity": 1000,
        "unit_price": 150,
        "specifications": {
          "size": "150x200mm",
          "material": "PET/AL/PE"
        }
      }
    ],
    "valid_days": 30
  }'
```

### 주문 상태 조회
```bash
curl -X GET https://api.epackage-lab.com/api/v1/orders/{id} \
  -H "Authorization: Bearer <token>"
```

---

## Swagger UI

Swagger UI에서 API를 테스트하려면:

1. [Swagger Editor](https://editor.swagger.io/) 열기
2. `openapi-b2b-workflow.yaml` 파일 내용 붙여넣기
3. 또는 로컬에서:
```bash
docker run -p 8080:8080 \
  -v $PWD/openapi-b2b-workflow.yaml:/usr/share/nginx/html/openapi.yaml \
  swaggerapi/swagger-ui
```

---

## 구현 가이드 (Implementation Guide)

### Next.js 16 App Router 구조

```
src/app/api/v1/
├── auth/
│   ├── register/
│   │   └── route.ts
│   ├── verify-email/
│   │   └── route.ts
│   └── approve-user/
│       └── route.ts
├── quotations/
│   ├── route.ts
│   ├── [id]/
│   │   ├── route.ts
│   │   ├── calculate/
│   │   │   └── route.ts
│   │   ├── approve/
│   │   │   └── route.ts
│   │   └── pdf/
│   │       └── route.ts
├── orders/
│   ├── route.ts
│   ├── [id]/
│   │   ├── route.ts
│   │   ├── status/
│   │   │   └── route.ts
│   │   ├── timeline/
│   │   │   └── route.ts
│   │   ├── files/
│   │   │   ├── route.ts
│   │   │   ├── extract/
│   │   │   │   └── route.ts
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   ├── stock-in/
│   │   │   └── route.ts
│   │   └── shipment/
│   │       └── route.ts
├── work-orders/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── pdf/
│       │   └── route.ts
│       └── approve/
│           └── route.ts
├── contracts/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── sign/
│       │   └── route.ts
│       ├── pdf/
│       │   └── route.ts
│       └── verify/
│           └── route.ts
├── production/
│   └── [orderId]/
│       ├── route.ts
│       ├── logs/
│       │   └── route.ts
│       └── photos/
│           └── route.ts
├── inventory/
│   ├── route.ts
│   └── adjust/
│       └── route.ts
├── shipments/
│   └── [id]/
│       └── tracking/
│           └── route.ts
└── admin/
    ├── dashboard/
    │   └── route.ts
    └── approvals/
        └── route.ts
```

---

## 타입스크립트 타입 정의 (TypeScript Types)

```typescript
// API 요청/응답 타입은 src/types/database.ts를 참고하세요

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

---

## 지원 및 문의 (Support)

- 기술 문의: api@epackage-lab.com
- 버전: 1.0.0
- 최종 업데이트: 2025-12-31

---

_이 인덱스는 EPACKAGE Lab B2B API 문서의 빠른 참조를 제공합니다._
