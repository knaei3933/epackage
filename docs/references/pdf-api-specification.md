# PDF 생성 API 명세서

**버전**: 1.0
**작성일**: 2025-12-31
**베이스 URL**: `https://epackage-lab.com/api/b2b`

---

## 목차

1. [공통 사항](#1-공통-사항)
2. [견적서 PDF API](#2-견적서-pdf-api)
3. [사양서 PDF API](#3-사양서-pdf-api)
4. [계약서 PDF API](#4-계약서-pdf-api)
5. [전자 서명 API](#5-전자-서명-api)
6. [문서 다운로드 API](#6-문서-다운로드-api)
7. [에러 코드](#7-에러-코드)

---

## 1. 공통 사항

### 1.1 인증

모든 API 요청은 Bearer Token 인증이 필요합니다.

```http
Authorization: Bearer {jwt_token}
```

### 1.2 공통 헤더

```http
Content-Type: application/json
Accept: application/json
Accept-Language: ja, en;q=0.9, ko;q=0.8
```

### 1.3 공통 응답 형식

```typescript
// 성공 (200-299)
{
  success: true,
  data: {
    // API별 데이터
  },
  meta?: {
    timestamp: string,
    requestId: string
  }
}

// 에러 (400-599)
{
  success: false,
  error: {
    code: string,           // 에러 코드
    message: string,        // 일본어 메시지
    message_en?: string,    // 영어 메시지 (선택)
    details?: any,          // 추가 상세 정보
    stack?: string          // 개발 환경에서만
  }
}
```

### 1.4 상태 코드

| 코드 | 설명 | 사용 예시 |
|------|------|----------|
| 200 | OK | PDF 생성 성공 |
| 400 | Bad Request | 잘못된 파라미터 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 접근 권한 없음 |
| 404 | Not Found | 문서를 찾을 수 없음 |
| 409 | Conflict | 문서 이미 존재 |
| 422 | Unprocessable Entity | 검증 실패 |
| 429 | Too Many Requests | 요청 제한 초과 |
| 500 | Internal Server Error | 서버 에러 |
| 503 | Service Unavailable | 서비스 점검 중 |

---

## 2. 견적서 PDF API

### 2.1 PDF 생성

#### `GET /api/b2b/quotations/:id/pdf`

견적서 PDF를 생성합니다.

**Path Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 견적서 ID (예: `qt-2025-0001`) |

**Query Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `format` | string | No | `pdf` | 출력 형식: `pdf`, `excel` |
| `language` | string | No | `ja` | 언어: `ja`, `en` |
| `version` | string | No | `latest` | 문서 버전 |
| `force` | boolean | No | `false` | 캐시 무시하고 재생성 |

**Request Example**:

```http
GET /api/b2b/quotations/qt-2025-0001/pdf?format=pdf&language=ja
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example** (200 OK):

```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/v1/object/sign/pdf-documents/quotations/2025/QT-2025-0001.pdf?token=...",
    "fileName": "QT-2025-0001.pdf",
    "fileSize": 245678,
    "contentType": "application/pdf",
    "generatedAt": "2025-12-31T10:30:00Z",
    "expiresAt": "2026-01-07T10:30:00Z",
    "quotation": {
      "id": "qt-2025-0001",
      "quotationNumber": "QT-2025-0001",
      "customerName": "有限会社加豆フーズ",
      "totalAmount": 905500,
      "currency": "JPY",
      "status": "SENT"
    }
  },
  "meta": {
    "timestamp": "2025-12-31T10:30:00Z",
    "requestId": "req_abc123",
    "processingTime": 2340
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": {
    "code": "QUOTATION_NOT_FOUND",
    "message": "指定された見積書が見つかりません。",
    "message_en": "Quotation not found.",
    "details": {
      "id": "qt-2025-9999"
    }
  }
}
```

**Excel 다운로드**:

```http
GET /api/b2b/quotations/qt-2025-0001/pdf?format=excel
```

```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/v1/object/sign/...xlsx",
    "fileName": "QT-2025-0001.xlsx",
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

### 2.2 일괄 PDF 생성

#### `POST /api/b2b/quotations/batch-pdf`

여러 견적서의 PDF를 일괄 생성합니다.

**Request Body**:

```typescript
{
  quotationIds: string[],    // 견적서 ID 배열
  format: 'pdf' | 'excel',   // 기본: 'pdf'
  language: 'ja' | 'en',     // 기본: 'ja'
  compress: boolean          // 기본: false (ZIP 압축)
}
```

**Request Example**:

```json
{
  "quotationIds": ["qt-2025-0001", "qt-2025-0002", "qt-2025-0003"],
  "format": "pdf",
  "language": "ja",
  "compress": true
}
```

**Response Example** (200 OK):

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://xxx.supabase.co/storage/.../batch.zip",
    "fileName": "quotations-20251231.zip",
    "fileCount": 3,
    "totalSize": 734034,
    "documents": [
      {
        "id": "qt-2025-0001",
        "fileName": "QT-2025-0001.pdf",
        "status": "success"
      },
      {
        "id": "qt-2025-0002",
        "fileName": "QT-2025-0002.pdf",
        "status": "success"
      },
      {
        "id": "qt-2025-0003",
        "fileName": "QT-2025-0003.pdf",
        "status": "success"
      }
    ]
  }
}
```

---

## 3. 사양서 PDF API

### 3.1 PDF 생성

#### `GET /api/b2b/work-orders/:id/pdf`

작업 지시서/사양서 PDF를 생성합니다.

**Path Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 작업 지시서 ID (예: `wo-2025-0042`) |

**Query Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `includeSpecs` | boolean | No | `true` | 제품 사양서 포함 |
| `includeFlow` | boolean | No | `true` | 제조 공정 흐름 포함 |
| `includeQuality` | boolean | No | `true` | 품질 기준 포함 |
| `version` | string | No | `latest` | 문서 버전 (예: `v1.0`) |

**Request Example**:

```http
GET /api/b2b/work-orders/wo-2025-0042/pdf?includeSpecs=true&includeFlow=true&version=v1.0
```

**Response Example** (200 OK):

```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/...pdf",
    "fileName": "WO-2025-0042-v1.0.pdf",
    "fileSize": 512034,
    "pageCount": 8,
    "contentType": "application/pdf",
    "generatedAt": "2025-12-31T11:00:00Z",
    "expiresAt": "2026-01-07T11:00:00Z",
    "workOrder": {
      "id": "wo-2025-0042",
      "workOrderNumber": "WO-2025-0042",
      "title": "スタンドパウチ製造仕様書",
      "version": "v1.0",
      "status": "APPROVED",
      "sections": {
        "specifications": true,
        "productionFlow": true,
        "qualityStandards": true
      }
    }
  }
}
```

### 3.2 버전 목록

#### `GET /api/b2b/work-orders/:id/versions`

사양서 버전 목록을 조회합니다.

**Response Example**:

```json
{
  "success": true,
  "data": {
    "workOrderId": "wo-2025-0042",
    "versions": [
      {
        "version": "v1.0",
        "status": "active",
        "createdAt": "2025-12-01T00:00:00Z",
        "createdBy": "user_admin",
        "pdfUrl": "https://...",
        "changes": "초안 작성"
      },
      {
        "version": "v1.1",
        "status": "active",
        "createdAt": "2025-12-15T00:00:00Z",
        "createdBy": "user_admin",
        "pdfUrl": "https://...",
        "changes": "치수 수정 (130x130x60 → 140x140x70)"
      }
    ]
  }
}
```

---

## 4. 계약서 PDF API

### 4.1 PDF 생성 (초안)

#### `GET /api/b2b/contracts/:id/pdf`

계약서 PDF를 생성합니다 (서명 전 초안).

**Path Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 계약서 ID (예: `ctr-2025-0123`) |

**Query Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `stage` | string | No | `draft` | 단계: `draft`, `signed` |

**Response Example** (200 OK):

```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/...pdf",
    "fileName": "CTR-2025-0123-DRAFT.pdf",
    "fileSize": 145678,
    "contentType": "application/pdf",
    "generatedAt": "2025-12-31T12:00:00Z",
    "contract": {
      "id": "ctr-2025-0123",
      "contractNumber": "CTR-2025-0123",
      "status": "DRAFT",
      "totalAmount": 905500,
      "currency": "JPY",
      "parties": {
        "seller": "金井貿易株式会社",
        "buyer": "有限会社加豆フーズ"
      },
      "signatureStatus": {
        "customer": false,
        "admin": false
      }
    }
  }
}
```

### 4.2 서명된 PDF

**서명이 완료된 계약서**:

```http
GET /api/b2b/contracts/ctr-2025-0123/pdf?stage=signed
```

```json
{
  "success": true,
  "data": {
    "url": "https://xxx.supabase.co/storage/...SIGNED.pdf",
    "fileName": "CTR-2025-0123-SIGNED.pdf",
    "contract": {
      "status": "ACTIVE",
      "signatureStatus": {
        "customer": true,
        "customerSignedAt": "2025-12-30T15:30:00Z",
        "admin": true,
        "adminSignedAt": "2025-12-31T10:00:00Z"
      }
    }
  }
}
```

---

## 5. 전자 서명 API

### 5.1 서명 제출

#### `POST /api/b2b/contracts/:id/sign`

계약서에 전자 서명합니다.

**Path Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 계약서 ID |

**Request Body**:

```typescript
{
  party: 'customer' | 'admin',           // 서명 당사자
  signatureData: {
    imageData: string,                   // Base64 Canvas 데이터 (data:image/png;base64,...)
    timestamp: string,                   // ISO 8601 타임스탬프
    ipAddress: string,                   // IP 주소 (자동 수집)
    userAgent: string                    // User Agent (자동 수집)
  },
  acceptance: true,                      // 약관 동의
  acceptedTerms: string[]                // 동의한 약관 ID 배열
}
```

**Request Example**:

```json
{
  "party": "customer",
  "signatureData": {
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "timestamp": "2025-12-31T15:30:00Z",
    "ipAddress": "203.0.113.42",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
  },
  "acceptance": true,
  "acceptedTerms": ["terms_of_service", "privacy_policy", "electronic_signature_consent"]
}
```

**Response Example** (200 OK):

```json
{
  "success": true,
  "data": {
    "contractId": "ctr-2025-0123",
    "status": "CUSTOMER_SIGNED",
    "signedAt": "2025-12-31T15:30:00Z",
    "pdfUrl": "https://xxx.supabase.co/storage/...SIGNED.pdf",
    "signatureHash": "a1b2c3d4e5f6...",
    "signature": {
      "party": "customer",
      "signedBy": "user_abc123",
      "signedByName": "田中 太郎",
      "ipAddress": "203.0.113.42",
      "userAgent": "Mozilla/5.0...",
      "location": {
        "country": "JP",
        "region": "Tokyo",
        "city": "Shinjuku"
      }
    },
    "nextSteps": {
      "remainingSignatures": ["admin"],
      "autoActivation": true  // 관리자 서명 시 자동 활성화
    }
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "SIGNATURE_INVALID",
    "message": "署名データが無効です。",
    "message_en": "Invalid signature data.",
    "details": {
      "reason": "imageData format must be base64 PNG"
    }
  }
}
```

### 5.2 서명 취소

#### `DELETE /api/b2b/contracts/:id/sign`

서명을 취소합니다 (관리자만 가능).

**Response Example**:

```json
{
  "success": true,
  "data": {
    "contractId": "ctr-2025-0123",
    "status": "SENT",
    "cancelledAt": "2025-12-31T16:00:00Z",
    "reason": "고객 요청으로 인한 취소"
  }
}
```

### 5.3 서명 검증

#### `GET /api/b2b/contracts/:id/verify`

서명 무결성을 검증합니다.

**Response Example**:

```json
{
  "success": true,
  "data": {
    "contractId": "ctr-2025-0123",
    "isValid": true,
    "verifications": {
      "customerSignature": {
        "valid": true,
        "hash": "a1b2c3d4...",
        "timestamp": "2025-12-31T15:30:00Z",
        "ipAddress": "203.0.113.42"
      },
      "adminSignature": {
        "valid": true,
        "hash": "e5f6g7h8...",
        "timestamp": "2025-12-31T16:00:00Z",
        "ipAddress": "198.51.100.23"
      }
    },
    "auditTrail": [
      {
        "action": "CREATED",
        "timestamp": "2025-12-30T10:00:00Z",
        "actor": "system"
      },
      {
        "action": "SENT",
        "timestamp": "2025-12-30T10:05:00Z",
        "actor": "admin"
      },
      {
        "action": "CUSTOMER_SIGNED",
        "timestamp": "2025-12-31T15:30:00Z",
        "actor": "customer",
        "ipAddress": "203.0.113.42"
      },
      {
        "action": "ADMIN_SIGNED",
        "timestamp": "2025-12-31T16:00:00Z",
        "actor": "admin",
        "ipAddress": "198.51.100.23"
      }
    ]
  }
}
```

---

## 6. 문서 다운로드 API

### 6.1 직접 다운로드

#### `GET /api/b2b/documents/:id/download`

서명된 URL로 PDF 파일을 직접 다운로드합니다.

**Path Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | 문서 ID |

**Query Parameters**:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | string | Yes | - | 문서 타입: `quotation`, `work-order`, `contract` |

**Request Example**:

```http
GET /api/b2b/documents/qt-2025-0001/download?type=quotation
Authorization: Bearer {token}
```

**Response**:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="QT-2025-0001.pdf"
Content-Length: 245678
Cache-Control: private, max-age=604800

{PDF binary data}
```

### 6.2 미리보기

#### `GET /api/b2b/documents/:id/preview`

PDF를 브라우저에서 미리보기합니다.

**Response**:

```
Content-Type: application/pdf
Content-Disposition: inline; filename="QT-2025-0001.pdf"
Content-Length: 245678

{PDF binary data}
```

### 6.3 다운로드 기록

#### `GET /api/b2b/documents/:id/download-history`

문서 다운로드 기록을 조회합니다.

**Response Example**:

```json
{
  "success": true,
  "data": {
    "documentId": "qt-2025-0001",
    "totalDownloads": 15,
    "history": [
      {
        "downloadedAt": "2025-12-31T10:30:00Z",
        "downloadedBy": "user_abc123",
        "ipAddress": "203.0.113.42",
        "userAgent": "Mozilla/5.0..."
      },
      {
        "downloadedAt": "2025-12-30T14:20:00Z",
        "downloadedBy": "user_def456",
        "ipAddress": "198.51.100.23",
        "userAgent": "Chrome/120.0..."
      }
    ]
  }
}
```

---

## 7. 에러 코드

### 7.1 공통 에러 코드

| Code | HTTP | 메시지 (일본어) | 메시지 (영어) |
|------|------|----------------|--------------|
| `UNAUTHORIZED` | 401 | 認証されていません | Unauthorized |
| `FORBIDDEN` | 403 | アクセス権限がありません | Access forbidden |
| `NOT_FOUND` | 404 | リソースが見つかりません | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | リクエスト数の上限を超えました | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | サーバーエラーが発生しました | Internal server error |

### 7.2 견적서 에러 코드

| Code | HTTP | 설명 |
|------|------|------|
| `QUOTATION_NOT_FOUND` | 404 | 견적서를 찾을 수 없음 |
| `QUOTATION_ACCESS_DENIED` | 403 | 견적서 접근 권한 없음 |
| `TEMPLATE_MISSING` | 500 | Excel 템플릿 파일 없음 |
| `GENERATION_FAILED` | 500 | PDF 생성 실패 |
| `INVALID_FORMAT` | 400 | 지원하지 않는 형식 |

### 7.3 사양서 에러 코드

| Code | HTTP | 설명 |
|------|------|------|
| `WORK_ORDER_NOT_FOUND` | 404 | 작업 지시서를 찾을 수 없음 |
| `VERSION_NOT_FOUND` | 404 | 지정한 버전이 없음 |
| `SPEC_INCOMPLETE` | 400 | 사양 정보 불완전 |

### 7.4 계약서 에러 코드

| Code | HTTP | 설명 |
|------|------|------|
| `CONTRACT_NOT_FOUND` | 404 | 계약서를 찾을 수 없음 |
| `CONTRACT_ALREADY_SIGNED` | 409 | 이미 서명된 계약서 |
| `SIGNATURE_INVALID` | 400 | 서명 데이터 무효 |
| `TERMS_NOT_ACCEPTED` | 400 | 약관 동의 필요 |
| `SIGNATURE_EXPIRED` | 410 | 서명 기간 만료 |
| `INVALID_PARTY` | 400 | 잘못된 서명 당사자 |

### 7.5 스토리지 에러 코드

| Code | HTTP | 설명 |
|------|------|------|
| `STORAGE_UPLOAD_FAILED` | 500 | 파일 업로드 실패 |
| `STORAGE_DOWNLOAD_FAILED` | 500 | 파일 다운로드 실패 |
| `FILE_SIZE_EXCEEDED` | 413 | 파일 크기 초과 |
| `INVALID_FILE_TYPE` | 400 | 잘못된 파일 형식 |
| `URL_EXPIRED` | 410 | 다운로드 URL 만료 |

---

## 8. Webhook (추후 구현)

### 8.1 PDF 생성 완료

```json
{
  "event": "pdf.generated",
  "timestamp": "2025-12-31T10:30:00Z",
  "data": {
    "documentType": "quotation",
    "documentId": "qt-2025-0001",
    "pdfUrl": "https://...",
    "status": "success"
  }
}
```

### 8.2 서명 완료

```json
{
  "event": "contract.signed",
  "timestamp": "2025-12-31T15:30:00Z",
  "data": {
    "contractId": "ctr-2025-0123",
    "party": "customer",
    "status": "CUSTOMER_SIGNED",
    "pdfUrl": "https://..."
  }
}
```

---

**문서 끝**
