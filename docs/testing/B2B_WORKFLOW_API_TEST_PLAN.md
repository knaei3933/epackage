# B2B 워크플로우 API 통합 테스트 계획

## 개요

본 문서는 Epackage Lab B2B 주문 워크플로우 API의 통합 테스트 계획과 검증 결과를 정리한 것입니다.

## 테스트 대상 API

| # | API 경로 | 목적 | HTTP Method |
|---|---------|------|-------------|
| 1 | `/api/member/quotations/{id}/convert` | 견적 → 주문 변환 | POST |
| 2 | `/api/admin/orders/{id}/send-to-korea` | 한국 파트너 송부 | POST |
| 3 | `/api/admin/orders/{id}/correction` | 교정 데이터 저장 | POST |
| 4 | `/api/member/orders/{id}/spec-approval` | 사양 승인/재요청 | POST |
| 5 | `/api/admin/orders/{id}/payment-confirmation` | 입금 확인 | POST |
| 6 | `/api/admin/orders/{id}/start-production` | 제조 시작 | POST |
| 7 | `/api/admin/orders/{id}/shipping-info` | 배송 정보 입력 | POST |
| 8 | `/api/admin/orders/{id}/delivery-note` | 납품서 발송 | POST |
| 9 | `/api/cron/archive-orders` | 자동 아카이빙 | POST/GET |

---

## 1. API별 검증 결과

### 1.1 견적 → 주문 변환 API

**API 경로**: `POST /api/member/quotations/{id}/convert`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | `ConvertToOrderRequest` 인터페이스 정의됨 |
| 응답 형식 | ✅ | 성공 시 주문 데이터 반환 |
| 인증 | ✅ | DEV_MODE 지원 + 쿠키 기반 인증 |
| 권한 검증 | ✅ | 견적 소유자만 변환 가능 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 정상 변환 | ✅ | APPROVED 상태의 견적을 주문으로 변환 |
| 상태 검증 | ✅ | APPROVED 외 상태는 400 에러 |
| 만료 검증 | ✅ | valid_until 초과 시 400 에러 |
| 중복 변환 | ✅ | 이미 주문이 존재하면 200 + alreadyExists 플래그 |
| RPC 함수 사용 | ✅ | `create_order_from_quotation` RPC 사용 |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていないリクエストです。" | ✅ |
| 권한 없음 | 403 | "アクセス権限がありません。" | ✅ |
| 견적 없음 | 404 | "見積が見つかりません。" | ✅ |
| 승인되지 않음 | 400 | "承認された見積のみ注文に変換できます。" | ✅ |
| 만료됨 | 400 | "有効期限切れの見積です。" | ✅ |
| RPC 실패 | 500 | "注文作成中にエラーが発生しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 관리자 알림 | ⚠️ | 콘솔 로그만 존재, 실제 이메일 발송 없음 |
| 고객 알림 | ❌ | 없음 |

#### 문제점

1. **이메일 발송 누락**: 관리자에게 주문 생성 알림 이메일이 발송되지 않음 (콘솔 로그만 있음)
2. **배송 주소 미사용**: 요청 본문의 deliveryAddress가 실제로 사용되지 않음

---

### 1.2 한국 송부 API

**API 경로**: `POST /api/admin/orders/{id}/send-to-korea`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | `{ notes?: string }` |
| 응답 형식 | ✅ | SendToKoreaResponse 인터페이스 |
| 인증 | ✅ | 관리자 역할 검증 |
| CORS | ✅ | OPTIONS 핸들러 존재 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| AI 데이터 추출 | ✅ | 파일의 ai_extraction_data 집계 |
| 파일 첨부 | ✅ | design@epackage-lab.com → info@epackage-lab.com |
| 주문 이력 기록 | ✅ | order_history 테이블에 기록 |
| 상태 업데이트 | ✅ | current_stage = 'DATA_TO_KR' |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "管理者権限が必要です。" | ✅ |
| 주문 없음 | 404 | "注文が見つかりません。" | ✅ |
| 디자인 파일 없음 | 400 | "デザインファイルが見つかりません。" | ✅ |
| 이메일 발송 실패 | 500 | "韓国送付メールの送信に失敗しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 한국 파트너 이메일 | ✅ | sendKoreaDataTransferWithAttachments 함수 호출 |
| 첨부 파일 | ✅ | AI/PDF/PSD 파일 포함 |
| AI 추출 데이터 | ✅ | 사양, 인쇄, 디자인 정보 포함 |

#### 문제점

1. **파일 URL 처리**: 공개 URL을 사용하지만, 프라이빗 파일의 경우 다운로드 필요

---

### 1.3 교정 저장 API

**API 경로**: `POST /api/admin/orders/{id}/correction`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | FormData (preview_image, original_file, partner_comment) |
| 응답 형식 | ✅ | CorrectionUploadResponse |
| 인증 | ✅ | 관리자 역할 검증 |
| 파일 업로드 | ✅ | Supabase Storage 사용 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 리비전 번호 자동 증가 | ✅ | getNextRevisionNumber 함수 |
| 파일 업로드 | ✅ | correction-files 스토리지 버킷 |
| DB 저장 | ✅ | design_revisions 테이블 |
| 고객 알림 | ✅ | sendKoreaCorrectionNotificationEmail (선택적) |
| 상태 업데이트 | ✅ | current_stage = 'SPEC_REVIEW' |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "管理者権限が必要です。" | ✅ |
| 주문 없음 | 404 | "注文が見つかりません。" | ✅ |
| 필수 파일 누락 | 400 | "プレビュー画像と原版ファイルの両方が必須です。" | ✅ |
| 업로드 실패 | 500 | "ファイルアップロードに失敗しました。" | ✅ |
| DB 저장 실패 | 500 | "データベース保存に失敗しました。" (파일 정리 포함) | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 고객 알림 | ✅ | notify_customer = true 시 발송 |
| 파트너 코멘트 | ✅ | 이메일에 포함 |
| 미리보기 이미지 | ✅ | 링크 포함 |

#### 문제점

1. **이메일 실패 처리**: 이메일 발송 실패 시 업로드를 롤백하지 않음 (의도적인 설계일 수 있음)

---

### 1.4 사양 승인/재요청 API

**API 경로**: `POST /api/member/orders/{id}/spec-approval`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | `{ action, revisionId, comment }` |
| 액션 종류 | ✅ | approve, reject, cancel |
| 응답 형식 | ✅ | SpecApprovalResponse |

#### 비즈니스 로직 검증

| 액션 | 상태 변화 | 리비전 상태 | 상태 |
|------|-----------|-------------|------|
| approve | CONTRACT | approved | ✅ |
| reject | DATA_TO_KR | rejected | ✅ |
| cancel | CANCELLED | rejected | ✅ |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "この注文にアクセスする権限がありません。" | ✅ |
| 주문 없음 | 404 | "注文が見つかりません。" | ✅ |
| 필수 파라미터 누락 | 400 | "アクションとリビジョンIDは必須です。" | ✅ |
| reject 시 코멘트 없음 | 400 | "修正要求の場合はコメントを入力してください。" | ✅ |
| 리비전 없음 | 404 | "教正データが見つかりません。" | ✅ |
| 잘못된 액션 | 400 | "無効なアクションです。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 관리자 알림 (reject) | ❌ | TODO 주석만 존재 |
| 고객 알림 (approve) | ❌ | 없음 |

#### 문제점

1. **이메일 발송 누락**: reject 시 관리자에게 알림 이메일이 발송되지 않음
2. **계약서 단계 이동**: approve 후 CONTRACT 상태로 이동하지만, 계정서 생성 로직이 확인되지 않음

---

### 1.5 입금 확인 API

**API 경로**: `POST /api/admin/orders/{id}/payment-confirmation`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | `{ paymentAmount, paymentDate, paymentMethod }` |
| 응답 형식 | ✅ | PaymentConfirmationResponse |
| 인증 | ✅ | 관리자 역할 검증 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 입금 확인 | ✅ | payment_confirmed_at, payment_amount, payment_method 저장 |
| 금액 검증 | ✅ | paymentAmount > 0 검증 |
| 날짜 검증 | ✅ | paymentDate 필수 |
| 주문 이력 기록 | ✅ | order_history 테이블에 기록 |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "管理者権限が必要です。" | ✅ |
| 주문 없음 | 404 | "注文が見つかりません。" | ✅ |
| 잘못된 금액 | 400 | "有効な入金額を入力してください。" | ✅ |
| 날짜 누락 | 400 | "入金日を入力してください。" | ✅ |
| 업데이트 실패 | 500 | "入金確認の更新に失敗しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 고객 알림 | ✅ | sendTemplatedEmail('payment_confirmation') |
| 실패 처리 | ✅ | 이메일 실패 시에도 입금 확인 완료 |

#### 문제점

1. **상태 전이 없음**: 입금 확인 후 current_stage가 업데이트되지 않음

---

### 1.6 제조 시작 API

**API 경로**: `POST /api/admin/orders/{id}/start-production`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | 본문 없음 |
| 응답 형식 | ✅ | StartProductionResponse |
| 인증 | ✅ | 관리자 역할 검증 |
| 사전 검증 | ✅ | canStartProduction 함수 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 제조 시작 조건 검증 | ✅ | payment_confirmed_at, spec_approved_at, contract_signed_at |
| production_orders 생성 | ✅ | current_stage = 'data_received' |
| 주문 상태 업데이트 | ✅ | current_stage = 'PRODUCTION' |
| 주문 이력 기록 | ✅ | order_history 테이블에 기록 |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "管理者権限が必要です。" | ✅ |
| 주문 없음 | 404 | "注文が見つかりません。" | ✅ |
| 조건 불충족 | 400 | "製造開始には以下の条件が必要です：..." | ✅ |
| production_orders 생성 실패 | 500 | "製造注文の作成に失敗しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 고객 알림 | ❌ | 없음 |
| 관리자 알림 | ❌ | 없음 |

#### 문제점

1. **이메일 발송 누락**: 제조 시작 시 고객에게 알림이 발송되지 않음
2. **중복 시작 방지**: 이미 production_orders가 존재하는 경우 확인되지 않음

---

### 1.7 배송 정보 입력 API

**API 경로**: `POST /api/admin/orders/{id}/shipping-info`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | `{ trackingNumber, shippingMethod, estimatedDelivery }` |
| 응답 형식 | ✅ | ShippingInfoResponse |
| 인증 | ✅ | 관리자 역할 검증 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 배송 정보 저장 | ✅ | tracking_number_domestic, shipping_method, estimated_delivery_at |
| 발송일 기록 | ✅ | shipped_to_customer_at |
| 상태 업데이트 | ✅ | current_stage = 'SHIPPED' |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "管理者権限が必要です。" | ✅ |
| 필드 누락 | 400 | "送付状番号、配送業者、到着予定日は必須です。" | ✅ |
| 업데이트 실패 | 500 | "予期しないエラーが発生しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 고객 알림 | ❌ | 없음 |

#### 문제점

1. **이메일 발송 누락**: 배송 정보 입력 시 고객에게 알림이 발송되지 않음
2. **운송장 번호 검증**: trackingNumber 형식 검증 없음

---

### 1.8 납품서 발송 API

**API 경로**: `POST /api/admin/orders/{id}/delivery-note`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 요청 형식 | ✅ | 본문 없음 |
| 응답 형식 | ✅ | DeliveryNoteResponse |
| 인증 | ✅ | 관리자 역할 검증 |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 납품 완료 알림 | ✅ | sendTemplatedEmail('delivery_completion') |
| 배송 정보 포함 | ✅ | tracking_number_domestic, delivered_at |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "認証されていません。" | ✅ |
| 권한 없음 | 403 | "管理者権限が必要です。" | ✅ |
| 주문 없음 | 404 | "注文が見つかりません。" | ✅ |
| 이메일 발송 실패 | 500 | "予期しないエラーが発生しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 고객 알림 | ✅ | delivery_completion 템플릿 |
| 운송장 번호 | ✅ | 포함 |
| 배송업체 정보 | ✅ | 포함 |

#### 문제점

1. **상태 업데이트 없음**: delivered_at이 업데이트되지 않음
2. **중복 발송 방지**: 이미 납품서를 발송한 경우 확인되지 않음

---

### 1.9 자동 아카이빙 API

**API 경로**: `POST /api/cron/archive-orders`

#### API 스펙 검증

| 항목 | 상태 | 상세 |
|------|------|------|
| 인증 | ✅ | CRON_SECRET Bearer 토큰 |
| 수동 실행 | ✅ | GET 핸들러가 POST로 포워딩 |
| 응답 형식 | ✅ | ArchiveResponse |

#### 비즈니스 로직 검증

| 시나리오 | 상태 | 검증 항목 |
|----------|------|----------|
| 3개월 경과 주문 검색 | ✅ | delivered_at < 3개월 전 |
| 아카이브 처리 | ✅ | archived_at 설정 |
| 개수 반환 | ✅ | archivedCount 포함 |

#### 에러 처리 검증

| 에러 케이스 | HTTP 코드 | 에러 메시지 | 상태 |
|-------------|-----------|-------------|------|
| 인증 실패 | 401 | "Unauthorized" | ✅ |
| 대상 없음 | 200 | "アーカイブ対象の注文はありませんでした。" | ✅ |
| DB 에러 | 500 | "アーカイブ処理でエラーが発生しました。" | ✅ |

#### 이메일 발송 검증

| 항목 | 상태 | 비고 |
|------|------|------|
| 관리자 알림 | ❌ | 없음 |

#### 문제점

1. **이메일 발송 누락**: 아카이빙 완료 시 관리자에게 알림이 발송되지 않음
2. **부분 실패 처리**: 일부 주문 아카이빙 실패 시 로그만 남기고 계속 진행

---

## 2. 통합 테스트 시나리오

### 시나리오 1: 정상 주문 워크플로우

```typescript
{
  name: "정상 주문 처리 워크플로우",
  steps: [
    "1. 회원이 APPROVED 상태의 견적을 주문으로 변환",
    "2. 관리자가 한국 파트너에게 디자인 데이터 송부",
    "3. 관리자가 교정 데이터 업로드",
    "4. 회원이 사양 승인 (approve)",
    "5. 관리자가 입금 확인",
    "6. 관리자가 제조 시작",
    "7. 관리자가 배송 정보 입력",
    "8. 관리자가 납품서 발송",
    "9. 3개월 후 자동 아카이빙"
  ],
  expectedResults: [
    "주문 상태: PENDING → DATA_TO_KR → SPEC_REVIEW → CONTRACT → PRODUCTION → SHIPPED → DELIVERED",
    "각 단계별 order_history 기록 확인",
    "각 단계별 이메일 발송 확인"
  ]
}
```

### 시나리오 2: 교정 재요청 루프

```typescript
{
  name: "교정 재요청 루프",
  steps: [
    "1. 회원이 APPROVED 상태의 견적을 주문으로 변환",
    "2. 관리자가 한국 파트너에게 디자인 데이터 송부",
    "3. 관리자가 교정 데이터 업로드",
    "4. 회원이 사양 거부 (reject) + 코멘트",
    "5. 주문 상태가 DATA_TO_KR로 복귀",
    "6. 관리자가 한국 파트너에게 재송부",
    "7. 관리자가 새로운 교정 데이터 업로드",
    "8. 회원이 사양 승인 (approve)"
  ],
  expectedResults: [
    "주문 상태: ... → SPEC_REVIEW → DATA_TO_KR → SPEC_REVIEW → CONTRACT",
    "각 리비전의 approval_status 추적 가능",
    "거부 코멘트가 customer_comment에 저장"
  ]
}
```

### 시나리오 3: 주문 취소

```typescript
{
  name: "주문 취소 시나리오",
  steps: [
    "1. 회원이 APPROVED 상태의 견적을 주문으로 변환",
    "2. 관리자가 한국 파트너에게 디자인 데이터 송부",
    "3. 관리자가 교정 데이터 업로드",
    "4. 회원이 주문 취소 (cancel)"
  ],
  expectedResults: [
    "주문 상태: ... → SPEC_REVIEW → CANCELLED",
    "취소 사유가 주문 이력에 기록",
    "추가 진행 불가"
  ]
}
```

### 시나리오 4: 제조 시작 조건 불충족

```typescript
{
  name: "제조 시작 조건 검증",
  testCases: [
    {
      scenario: "입금 확인 누락",
      preconditions: ["spec_approved_at 있음", "contract_signed_at 있음", "payment_confirmed_at 없음"],
      expectedResult: "400 에러, '入金確認' 필요"
    },
    {
      scenario: "사양 승인 누락",
      preconditions: ["payment_confirmed_at 있음", "contract_signed_at 있음", "spec_approved_at 없음"],
      expectedResult: "400 에러, 'データ承認' 필요"
    },
    {
      scenario: "계약 서명 누락",
      preconditions: ["payment_confirmed_at 있음", "spec_approved_at 있음", "contract_signed_at 없음"],
      expectedResult: "400 에러, '契約署名' 필요"
    }
  ]
}
```

### 시나리오 5: 권한 검증

```typescript
{
  name: "API 권한 검증",
  testCases: [
    {
      api: "/api/member/quotations/{id}/convert",
      authorized: ["member (owner)"],
      unauthorized: ["other member", "non-authenticated"]
    },
    {
      api: "/api/admin/orders/{id}/send-to-korea",
      authorized: ["admin"],
      unauthorized: ["member", "non-authenticated"]
    },
    {
      api: "/api/member/orders/{id}/spec-approval",
      authorized: ["member (owner)"],
      unauthorized: ["other member", "admin", "non-authenticated"]
    },
    {
      api: "/api/cron/archive-orders",
      authorized: ["cron (with secret)"],
      unauthorized: ["any user without secret"]
    }
  ]
}
```

---

## 3. 누락된 항목

### 3.1 이메일 템플릿

| 템플릿 | 상태 | 비고 |
|--------|------|------|
| order_created_customer | ❌ | 주문 생성 시 고객 알림 |
| order_created_admin | ❌ | 주문 생성 시 관리자 알림 |
| spec_rejected_admin | ❌ | 사양 거부 시 관리자 알림 |
| production_started_customer | ❌ | 제조 시작 시 고객 알림 |
| shipping_info_customer | ❌ | 배송 정보 입력 시 고객 알림 |
| archive_completed_admin | ❌ | 아카이빙 완료 시 관리자 알림 |

### 3.2 상태 전이 로직

| 상태 전이 | 상태 | 비고 |
|-----------|------|------|
| PAYMENT_CONFIRMED | ❌ | 입금 확인 후 별도 상태 없음 |
| CONTRACT_SIGNED | ❌ | 계약 서명 단계 확인 필요 |
| FINAL_DELIVERY | ❌ | 배송 완료 상태 업데이트 필요 |

### 3.3 검증 로직

| 항목 | 상태 | 비고 |
|------|------|------|
| 중복 제조 시작 방지 | ❌ | production_orders 중복 생성 확인 |
| 배송 정보 형식 검증 | ❌ | trackingNumber 형식 검증 |
| 아카이빙 복구 기능 | ❌ | archived_at 해제 기능 |
| 이메일 발송 실패 알림 | ⚠️ | 일부 API에서만 로그 기록 |

### 3.4 테스트 커버리지

| 카테고리 | 커버리지 | 비고 |
|----------|----------|------|
| 단위 테스트 | ❌ | API route handler 단위 테스트 없음 |
| 통합 테스트 | ⚠️ | 일부 E2E 테스트만 존재 |
| 성능 테스트 | ❌ | 없음 |
| 부하 테스트 | ❌ | 없음 |

---

## 4. 권장 사항

### 4.1 우선순위 1 (즉시 필요)

1. **이메일 발송 완성**
   - order_created_customer 템플릿 구현
   - order_created_admin 템플릿 구현
   - production_started_customer 템플릿 구현
   - shipping_info_customer 템플릿 구현

2. **상태 전이 로직 보완**
   - 입금 확인 후 상태 업데이트
   - 계약 서명 단계 구현
   - 배송 완료 상태 업데이트

### 4.2 우선순위 2 (단기)

1. **검증 로직 강화**
   - 중복 제조 시작 방지
   - 배송 정보 형식 검증
   - 에러 메시지 국제화

2. **테스트 작성**
   - API 단위 테스트
   - 통합 테스트 시나리오 구현
   - 예외 케이스 테스트

### 4.3 우선순위 3 (중기)

1. **성능 최적화**
   - 대량 아카이빙 최적화
   - 파일 업로드 최적화
   - DB 쿼리 최적화

2. **모니터링**
   - 이메일 발송 모니터링
   - API 성능 모니터링
   - 에러 알림 시스템

---

## 5. 테스트 실행 방법

### 5.1 E2E 테스트 실행

```bash
# 전체 E2E 테스트
npm run test:e2e

# 특정 테스트 파일
npx playwright test tests/e2e/b2b-workflow-e2e.spec.ts

# UI 모드
npm run test:e2e:ui
```

### 5.2 API 직접 테스트

```bash
# 주문 변환
curl -X POST http://localhost:3000/api/member/quotations/{id}/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"notes": "테스트"}'

# 한국 송부
curl -X POST http://localhost:3000/api/admin/orders/{id}/send-to-korea \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"notes": "긴급"}'

# 아카이빙 (Cron)
curl -X POST http://localhost:3000/api/cron/archive-orders \
  -H "Authorization: Bearer {CRON_SECRET}"
```

---

## 6. 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-01-30 | 1.0 | 초기 테스트 계획 작성 |
