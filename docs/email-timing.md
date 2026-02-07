# Epackage Lab 이메일 발송 타이밍 문서

## 개요
이 문서는 Epackage Lab 시스템에서 어떤 상황에서 누구에게 이메일이 발송되는지 정리한 것입니다.

---

## 이메일 발송 매트릭스

| 트리거 | 발생 시점 | 수신자 | 템플릿/함수 | 내용 |
|--------|----------|--------|-------------|------|
| 회원가입 | 사용자가 `/api/auth/register` API 호출 | 사용자 | Supabase Auth 자동 발송 | 가입 환영, 이메일 인증 |
| 문의사항 제출 | Contact Form 제출 (`/api/contact`) | 사용자 + 관리자 | `sendContactEmail()` | 문의 접수 확인 |
| 견적서 저장 | 로그인 사용자가 견적 저장 (`/api/quotations/save`) | - | - | 이메일 없음 (DB 저장만) |
| 견적서 승인 | 관리자가 견적 승인 | 사용자 | `sendQuoteApprovedCustomerEmail()` | 견적 승인 알림 |
| 결제 확인 | 결제 확인 (`/api/payments/confirm`) | 사용자 | `sendPaymentConfirmationEmail()` | 입금 확인 |
| 입금 확인 | 사용자가 입금 정보 입력 (`/api/member/quotations/[id]/confirm-payment`) | 사용자 + 관리자 | `sendEmail()` (inline) | 입금 확인 알림 |
| 주문 수령 | 외부 주문 수령 (`/api/orders/receive`) | 사용자 | `sendOrderConfirmationEmail()` | 주문 접수 확인 |
| 주문 생성 | 주문 생성 | 사용자 + 관리자 | `sendOrderConfirmationEmail()` | 주문 확인 |
| 계약서 워크플로우 | 계약서 상태 변경 (`/api/contract/workflow/action`) | 관리자 | `sendApprovalEmail()` | 계약 상태 변경 알림 |
| 견적서 내보내기 | 견적서 Excel/PDF 생성 및 이메일 전송 요청 | 지정된 수신자 | `sendExportEmail()` | 견적서 파일 첨부 |
| 계정 삭제 | 사용자 계정 삭제 요청 (`/api/member/delete-account`) | - | `deleteAccount()` | 계정 삭제 완료 (옵션) |

---

## 1. 고객 이메일

### 회원가입 환영
- **트리거**: 사용자가 `/api/auth/register` API 호출
- **파일**: `src/app/api/auth/register/route.ts`
- **함수**: Supabase Auth 자동 처리
- **내용**: 가입 환영, 이메일 인증 메일, 관리자 승인 대기 안내

### 문의사항 접수 확인
- **트리거**: Contact Form 제출
- **파일**: `src/app/api/contact/route.ts`
- **함수**: `sendContactEmail()`
- **내용**: 문의 접수 확인, 담당자 연락 예정 안내

### 견적 승인 알림
- **트리거**: 관리자가 견적 승인
- **파일**: `src/lib/email/notificationService.ts`
- **함수**: `sendQuoteApprovedCustomerEmail()`
- **내용**: 견적이 승인되었음, 결제 진행 안내

### 결제 확인 (외부 시스템)
- **트리거**: 결제 게이트웨이로부터 웹훅 수신
- **파일**: `src/app/api/payments/confirm/route.ts`
- **함수**: `sendPaymentConfirmationEmail()`
- **내용**: 입금 확인, 제조 시작 예정 안내

### 입금 확인 (사용자 직접 입력)
- **트리거**: 사용자가 견적서에 대해 입금 정보 입력
- **파일**: `src/app/api/member/quotations/[id]/confirm-payment/route.ts`
- **함수**: `sendEmail()` (inline HTML)
- **내용**: 입금 확인, 제조 시작 예정 안내

### 주문 접수 확인
- **트리거**: 외부 시스템에서 주문 수령
- **파일**: `src/app/api/orders/receive/route.ts`
- **함수**: `sendOrderConfirmationEmail()`
- **내용**: 주문 접수 확인, 주문 내역 요약

### 견적서 파일 전송
- **트리거**: 사용자가 견적서 Excel/PDF 내보내기 요청
- **파일**: `src/app/api/member/quotations/[id]/export/route.ts`
- **함수**: `sendExportEmail()`
- **내용**: 견적서 파일 첨부

### 주문 상태 변경 알림 (B2B 워크플로우)
- **트리거**: 주문 상태 변경
- **파일**: `src/lib/email/order-status-emails.ts`
- **함수**:
  - `requestDataUpload()` - 데이터 입稿 요청
  - `notifyDataReceived()` - 데이터 수령 확인
  - `requestModification()` - 수정 요청
  - `notifyModificationApproved()` - 수정 승인
  - `notifyCorrectionReady()` - 교정 완료
  - `requestApproval()` - 승인 요청
  - `notifyProductionStarted()` - 제조 시작
  - `notifyReadyToShip()` - 출하 준비 완료
  - `notifyShipped()` - 발송 완료
  - `notifyOrderCancelled()` - 주문 취소

### 한국 팀 수정 요청
- **트리거**: 한국 파트너에게 수정 요청
- **파일**: `src/lib/email.ts`
- **함수**: `sendKoreaDataTransferEmail()`, `sendKoreaDataTransferWithAttachments()`
- **내용**: AI 추출 데이터 포함, 파일 첨부

### 계정 삭제 확인
- **트리거**: 사용자 계정 삭제 요청
- **파일**: `src/app/api/member/delete-account/route.ts`
- **함수**: `deleteAccount()` (옵션으로 이메일 발송)
- **내용**: 계정 삭제 완료 확인

---

## 2. 관리자 이메일

### 문의사항 알림
- **트리거**: Contact Form 제출
- **파일**: `src/app/api/contact/route.ts`
- **함수**: `sendContactEmail()` (관리자용)
- **수신자**: `ADMIN_EMAIL` (환경변수)
- **내용**: 새 문의 사항 내용, 고객 정보

### 견적 작성 알림
- **트리거**: 새 견적 생성
- **파일**: `src/lib/email/notificationService.ts`
- **함수**: `sendQuoteCreatedAdminEmail()`
- **수신자**: `ADMIN_EMAIL`
- **내용**: 새 견적 생성 알림, 고객 정보

### 입금 알림 (사용자 입력)
- **트리거**: 사용자가 입금 정보 입력
- **파일**: `src/app/api/member/quotations/[id]/confirm-payment/route.ts`
- **함수**: `sendEmail()` (inline HTML)
- **수신자**: `ADMIN_EMAIL`
- **내용**: 입금 정보, 고객 정보

### 주문 알림
- **트리거**: 새 주문 생성
- **파일**: `src/lib/email-order.ts`
- **함수**: `sendOrderConfirmationEmail()` (isAdmin=true)
- **수신자**: `ADMIN_EMAIL`
- **내용**: 새 주문 알림, 주문 내역

### 계약서 상태 변경
- **트리거**: 계약서 워크플로우 액션
- **파일**: `src/app/api/contract/workflow/action/route.ts`
- **함수**: `sendNotificationEmail()`
- **수신자**: `ADMIN_EMAIL`
- **내용**: 계약 승인/거부/서명 완료 알림

### 승인/거부 알림
- **트리거**: 각종 승인/거부 요청
- **파일**: `src/lib/email.ts`
- **함수**: `sendApprovalEmail()`, `sendRejectionEmail()`
- **수신자**: `ADMIN_EMAIL`
- **내용**: 승인/거부 내용

---

## 3. 한국 담당자 이메일

### 데이터 전송 (수정 요청)
- **트리거**: 디자인 데이터 한국 파트너 전송
- **파일**: `src/lib/email.ts`
- **함수**: `sendKoreaDataTransferEmail()`, `sendKoreaDataTransferWithAttachments()`
- **수신자**: `KOREA_PARTNER_EMAIL` (환경변수)
- **내용**: AI 추출 데이터 포함, 원본 파일 첨부 (AI 파일, 참조 이미지 등)

---

## 4. API 라우트별 이메일 발송 상세

### `/api/contact`
- **설명**: 문의사항 접수 시 이메일 발송
- **파일**: `src/app/api/contact/route.ts`
- **이메일**:
  - 고객 확인: `getContactConfirmationEmail()`
  - 관리자 알림: `getContactAdminNotificationEmail()`

### `/api/quotations/save`
- **설명**: 견적 저장 시 이메일 없음
- **파일**: `src/app/api/quotations/save/route.ts`
- **이메일**: 없음 (DB 저장만 수행)

### `/api/member/quotations/[id]/confirm-payment`
- **설명**: 입금 확인 시 이메일 발송
- **파일**: `src/app/api/member/quotations/[id]/confirm-payment/route.ts`
- **이메일**:
  - 고객 확인: inline HTML 템플릿
  - 관리자 알림: inline HTML 템플릿

### `/api/member/quotations/[id]/export`
- **설명**: 견적서 Excel/PDF 생성 및 이메일 전송
- **파일**: `src/app/api/member/quotations/[id]/export/route.ts`
- **이메일**: `sendExportEmail()` (Resend 사용)

### `/api/contract/workflow/action`
- **설명**: 계약서 워크플로우 액션 시 이메일 발송
- **파일**: `src/app/api/contract/workflow/action/route.ts`
- **이메일**: `sendNotificationEmail()` → `sendApprovalEmail()`

### `/api/orders/receive`
- **설명**: 외부 주문 수령 시 이메일 발송
- **파일**: `src/app/api/orders/receive/route.ts`
- **이메일**: `sendOrderConfirmationEmail()`

### `/api/payments/confirm`
- **설명**: 결제 확인 시 이메일 발송
- **파일**: `src/app/api/payments/confirm/route.ts`
- **이메일**: `sendPaymentConfirmationEmail()`

### `/api/member/delete-account`
- **설명**: 계정 삭제 시 이메일 발송 (옵션)
- **파일**: `src/app/api/member/delete-account/route.ts`
- **이메일**: `deleteAccount()` 함수 내 옵션 처리

---

## 5. 이메일 서비스 설정

### 사용 가능한 이메일 서비스 (우선순위 순)
1. **XServer SMTP** (일본 호스팅) - 개발/본환 환경 모두
2. **SendGrid** (국제 클라우드) - 백업
3. **AWS SES** (국제 클라우드 백업)
4. **Ethereal Email** (개발용 테스트)
5. **Console 출력** (최후 수단)

### 설정 파일
- **메인 이메일 라이브러리**: `src/lib/email.ts`
- **템플릿**: `src/lib/email-templates.ts`
- **B2B 템플릿**: `src/lib/email-templates-b2b.ts`
- **주문 이메일**: `src/lib/email-order.ts`
- **주문 상태 이메일**: `src/lib/email/order-status-emails.ts`
- **알림 서비스**: `src/lib/email/notificationService.ts`

### 환경변수 (.env.local)
```bash
FROM_EMAIL=info@package-lab.com
ADMIN_EMAIL=admin@package-lab.com
REPLY_TO_EMAIL=info@package-lab.com
KOREA_PARTNER_EMAIL=korea@epackage-lab.com

# XServer SMTP (일본 호스팅)
XSERVER_SMTP_HOST=sv12515.xserver.jp
XSERVER_SMTP_PORT=587
XSERVER_SMTP_USER=info@package-lab.com
XSERVER_SMTP_PASSWORD=vozlwl1109

# SendGrid
SENDGRID_API_KEY=SG....

# AWS SES
AWS_SES_SMTP_USERNAME=...
AWS_SES_SMTP_PASSWORD=...
```

---

## 6. B2B 주문 워크플로우 이메일

### 워크플로우 단계별 이메일

| 상태 | 이메일 함수 | 수신자 | 내용 |
|------|------------|--------|------|
| `data_upload_required` | `requestDataUpload()` | 고객 | 데이터 입稿 요청 |
| `data_received` | `notifyDataReceived()` | 고객 | 데이터 수령 확인 |
| `modification_required` | `requestModification()` | 고객 | 수정 요청 |
| `modification_approved` | `notifyModificationApproved()` | 고객 | 수정 승인 |
| `modification_rejected` | `notifyModificationRejected()` | 고객 | 수정 거부 |
| `correction_ready` | `notifyCorrectionReady()` | 고객 | 교정 완료 |
| `approval_pending` | `requestApproval()` | 고객 | 승인 요청 |
| `in_production` | `notifyProductionStarted()` | 고객 | 제조 시작 |
| `ready_to_ship` | `notifyReadyToShip()` | 고객 | 출하 준비 완료 |
| `shipped` | `notifyShipped()` | 고객 | 발송 완료 |
| `cancelled` | `notifyOrderCancelled()` | 고객 | 주문 취소 |
| `korea_correction_pending` | `requestKoreaCorrection()` | 한국 팀 | 교정 요청 |

### 자동 발송 함수
- **파일**: `src/lib/email/order-status-emails.ts`
- **함수**: `sendEmailForOrderStatus(status, config, metadata)`
- **기능**: 주문 상태에 따라 자동으로 적절한 이메일 발송

---

## 7. 이메일 템플릿 종류

### 템플릿 타입 (`src/lib/email-templates.ts`)
- `welcome_customer` - 회원가입 환영
- `approval_customer` - 승인 알림
- `rejection_customer` - 거부 알림
- `quote_created_customer` - 견적 작성 확인
- `order_status_update` - 주문 상태 변경
- `shipment_notification` - 발송 알림
- `admin_new_order` - 관리자 신규 주문 알림
- `admin_quote_request` - 관리자 견적 요청 알림
- `korea_data_transfer` - 한국 팀 데이터 전송
- `korea_correction_notification` - 한국 수정 알림
- `spec_sheet_approval` - 사양서 승인
- `spec_sheet_rejection` - 사양서 거부 (관리자)
- `signature_request` - 서명 요청
- `signature_completed` - 서명 완료
- `signature_declined` - 서명 거부
- `signature_reminder` - 서명 리마인더
- `shipping_status` - 배송 상태
- `delivery_completion` - 배송 완료

### B2B 템플릿 (`src/lib/email-templates-b2b.ts`)
- 주문 생성 알림 (고객/관리자)
- 사양 거부 알림 (관리자)
- 제조 시작 알림 (고객)
- 배송 정보 입력 알림 (고객)
- 아카이브 완료 알림 (관리자)

---

## 8. 참고 사항

### 이메일 발송 실패 처리
- 대부분의 이메일 발송은 실패해도 메인 프로세스를 방해하지 않도록 구현
- 실패 시 콘솔에 에러 로그 기록
- 고객용 이메일 실패 시 관리자에게 알림

### 보안 고려사항
- 사용자 입력은 `sanitize-html`로 처리 (XSS 방지)
- 이메일 주소 검증 (`isValidEmail()`)
- 일본어 이메일 주소 지원 (RFC 6531)

### 다국어 지원
- 주요 언어: 일본어
- 일부 템플릿은 영어도 지원

### 첨부파일 지원
- Resend 사용 (견적서 Excel/PDF)
- nodemailer 사용 (한국 팀 데이터 전송)
- Supabase Storage 연동

---

*문서 생성일: 2026-02-07*
*코드베이스 버전: feature/portal-admin-merge 브랜치*