# API 엔드포인트 완전 문서 (242개)

**작성일**: 2026-01-07
**버전**: 3.0 (완전 업데이트)
**총 API 수**: 242개

---

## 목차

1. [Public APIs (18개)](#1-public-api-인증-불필요---18개)
2. [Authentication APIs (7개)](#2-authentication-api-인증---7개)
3. [Member APIs (21개)](#3-member-api-인증-필요-cookie---21개)
4. [Shipment APIs (10개)](#4-shipment-api-배송-관리---10개)
5. [Signature APIs (5개)](#5-signature-api-전자-서명---5개)
6. [Contract APIs (5개)](#6-contract-api-계약-관리---5개)
7. [Admin APIs (37개)](#7-admin-api-관리자-권한---cookie--admin---37개)
8. [B2B APIs (76개)](#8-b2b-api-b2b-전용---76개)
9. [Customer Portal APIs (6개)](#9-customer-portal-api---6개)
10. [AI Parser APIs (4개)](#10-ai-parser-api---4개)
11. [Utility APIs (3개)](#11-utility-api---3개)
12. [Spec Sheet APIs (1개)](#12-spec-sheet-api---1개)

---

## 1. Public API (인증 불필요) - 18개

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/contact` | POST | 문의 제출 (SendGrid 발송) | contact_submissions |
| `/api/samples/request` | POST | 샘플 요청 (최대 5개) | sample_requests, sample_items |
| `/api/products` | GET | 제품 목록 조회 | products, categories |
| `/api/products/[slug]` | GET | 제품 상세 조회 | products, product_images |
| `/api/products/categories` | GET | 카테고리 목록 | categories |
| `/api/products/filter` | GET | 제품 필터링 | products, material_types |
| `/api/products/search` | GET | 제품 검색 | products |
| `/api/download/templates/*` | GET | 템플릿 다운로드 | templates |
| `/api/download/templates/excel` | GET | 엑셀 템플릿 | templates |
| `/api/download/templates/pdf` | GET | PDF 템플릿 | templates |
| `/api/templates` | GET | 템플릿 목록 | templates |
| `/api/ai/parse` | POST | AI 문서 파싱 | ai_extraction_jobs |
| `/api/ai/review` | POST | AI 문서 검토 | ai_reviews |
| `/api/ai/specs` | POST | AI 사양서 분석 | ai_extraction_jobs |
| `/api/analytics/vitals` | POST | 웹 바이탈 로깅 | web_vitals |
| `/api/errors/log` | POST | 클라이언트 에러 로깅 | error_logs |
| `/api/registry/postal-code` | GET | 일본 우편번호 검색 | - (외부 API) |
| `/api/registry/corporate-number` | GET | 일본 법인번호 검색 | - (외부 API) |
| `/api/files/validate` | POST | 파일 보안 검증 | - |

---

## 2. Authentication API (인증) - 7개

| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/auth/signin` | POST | 로그인 (httpOnly 쿠키) | Cookie | profiles, auth.users |
| `/api/auth/signout` | POST | 로그아웃 (쿠키 삭제) | Cookie | - |
| `/api/auth/register` | POST | 회원가입 (18개 필드) | - | profiles, auth.users |
| `/api/auth/session` | GET | 세션 확인 | Cookie | profiles |
| `/api/auth/update-password` | POST | 비밀번호 변경 | Cookie | profiles |
| `/api/auth/reset-password` | POST | 비밀번호 재설정 | - | profiles |
| `/api/auth/verify` | POST | 이메일 인증 | - | profiles |

---

## 3. Member API (인증 필요 - Cookie) - 21개

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/member/orders` | GET | 주문 목록 (필터링) | orders |
| `/api/member/orders/[id]` | GET | 주문 상세 | orders, order_items |
| `/api/member/orders/confirm` | POST | 주문 생성 | orders |
| `/api/member/quotations` | GET | 견적서 목록 | quotations |
| `/api/member/quotations/[id]` | GET | 견적서 상세 | quotations |
| `/api/quotations/submit` | POST | 견적 제출 | quotations |
| `/api/quotations/save` | POST | 견적 저장 (임시) | quotations |
| `/api/quotations/[id]/convert` | POST | 견적→주문 변환 | orders, quotations |
| `/api/quotes/pdf` | POST | 견적서 PDF 생성 (jsPDF) | quotations |
| `/api/quotes/excel` | POST | 견적서 Excel 생성 | quotations |
| `/api/quotation/pdf` | POST | 견적서 PDF (레거시) | quotations |
| `/api/member/samples` | GET | 샘플 요청 내역 | sample_requests |
| `/api/member/profile` | GET/PUT | 프로필 관리 | profiles |
| `/api/member/settings` | GET/POST | 설정 관리 | profiles |
| `/api/member/delete-account` | GET/POST | 계정 삭제 | profiles |
| `/api/member/invoices` | GET | 인보이스 목록 | invoices |
| `/api/member/deliveries` | GET | 배송 내역 | shipments |
| `/api/member/inquiries` | GET | 문의 내역 | inquiries |
| `/api/notes` | GET/POST | 메모 목록/생성 | notes |
| `/api/notes/[id]` | GET/PATCH/DELETE | 메모 CRUD | notes |

---

## 4. Shipment API (배송 관리) - 10개

| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/shipments` | GET | 배송 목록 (필터/페이지) | Cookie | shipments, shipment_tracking_events |
| `/api/shipments/create` | POST | 배송 생성 | Cookie | shipments |
| `/api/shipments/bulk-create` | POST | 대량 배송 생성 | Cookie | shipments |
| `/api/shipments/tracking` | GET | 전체 배송 추적 | Cookie | shipments |
| `/api/shipments/[id]` | GET | 배송 상세 | Cookie | shipments |
| `/api/shipments/[id]` | PATCH | 배송 수정 | Cookie | shipments |
| `/api/shipments/[id]/track` | POST | 추적 갱신 (Carrier API) | Cookie | shipments, tracking_events |
| `/api/shipments/[id]/label` | GET | 배송 라벨 생성 | Cookie | shipments |
| `/api/shipments/[id]/schedule-pickup` | POST | 픽업 예약 | Cookie | shipments |
| `/api/shipments/[id]/[trackingId]/update-tracking` | POST | 추적 정보 업데이트 | Cookie | shipment_tracking_events |

**지원 운송사**: Yamato Transport, Sagawa Express, Japan Post EMS, 우체국 표준, 해상 화물, 항공 화물

---

## 5. Signature API (전자 서명) - 5개

| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/signature/send` | POST | 서명 요청 전송 (DocuSign/HelloSign/Local) | Bearer Token | signatures |
| `/api/signature/cancel` | POST | 서명 요청 취소 | Bearer Token | signatures |
| `/api/signature/local/save` | POST | 로컬 서명 저장 | Cookie | signatures |
| `/api/signature/status/[id]` | GET | 서명 상태 조회 | Bearer Token | signatures |
| `/api/signature/webhook` | POST | 서명 웹훅 (DocuSign/HelloSign) | None | signatures |

**지원 서비스**: DocuSign, HelloSign, 로컬 서명

---

## 6. Contract API (계약 관리) - 5개

| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/contract/pdf` | POST | 계약서 PDF 생성 (A4 일본어) | Cookie | contracts |
| `/api/contract/timestamp` | POST | 타임스탬프 생성 | Cookie | contracts, timestamps |
| `/api/contract/timestamp/validate` | POST | 타임스탬프 검증 | Cookie | timestamps |
| `/api/contract/workflow/action` | POST | 계약 워크플로우 (승인/거부/서명) | Cookie | contracts, workflow_history |
| `/api/contracts/[id]/sign` | POST | 계약 서명 | Cookie | contracts, signatures |

**계약 상태**: draft → pending_review → pending_signature → active → completed

---

## 7. Admin API (관리자 권한 - Cookie + ADMIN) - 37개

### 7.1 대시보드 & 통계 (4개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/dashboard/statistics` | GET | 대시보드 통계 | orders, quotations, shipments, profiles |
| `/api/admin/performance/metrics` | GET | 성능 지표 | orders, production_jobs |
| `/api/admin/orders/statistics` | GET | 주문 통계 | orders |
| `/api/admin/notifications/unread-count` | GET | 읽지 않은 알림 수 | admin_notifications |

### 7.2 주문 관리 (4개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/orders` | GET | 주문 관리 | orders |
| `/api/admin/quotations` | GET | 견적서 관리 | quotations |
| `/api/admin/convert-to-order` | POST | 견적→주문 변환 | orders, quotations |
| `/api/admin/approve-member` | POST | 회원 승인 | profiles |

### 7.3 생산 관리 (5개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/production/jobs` | GET | 생산 작업 목록 | production_jobs |
| `/api/admin/production/jobs/[id]` | GET/PATCH | 작업 상세/상태변경 | production_jobs |
| `/api/admin/production/[orderId]` | GET | 주문별 생산 현황 | production_jobs |
| `/api/admin/production/update-status` | POST | 상태 일괄 업데이트 | production_jobs |
| `/api/admin/generate-work-order` | POST | 작업 지시서 생성 | work_orders |

### 7.4 재고 관리 (6개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/inventory/items` | GET | 재고 목록 | inventory |
| `/api/admin/inventory/adjust` | POST | 재고 조정 | inventory_transactions |
| `/api/admin/inventory/record-entry` | POST | 재고 입고 기록 | inventory_receipts |
| `/api/admin/inventory/receipts` | GET | 입고 내역 | inventory_receipts |
| `/api/admin/inventory/update` | POST | 재고 정보 업데이트 | inventory |
| `/api/admin/inventory/history/[productId]` | GET | 제품별 재고 이력 | inventory_transactions |

### 7.5 배송 관리 (6개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/shipments/[id]/tracking` | POST | 배송 추적 갱신 | shipments |
| `/api/admin/shipping/tracking` | GET | 배송 추적 목록 | shipments |
| `/api/admin/shipping/tracking/[id]` | GET | 배송 추적 상세 | shipments |
| `/api/admin/shipping/shipments` | GET | 배송 목록 | shipments |
| `/api/admin/shipping/deliveries/complete` | POST | 배송 완료 처리 | shipments |
| `/api/admin/delivery/tracking/[orderId]` | GET | 주문 배송 추적 | shipments |

### 7.6 계약 관리 (5개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/contracts/workflow` | GET | 계약 워크플로우 | contracts |
| `/api/admin/contracts/request-signature` | POST | 서명 요청 | contracts |
| `/api/admin/contracts/send-reminder` | POST | 서명 리마인더 | contracts |
| `/api/admin/contracts/[contractId]/download` | GET | 계약서 다운로드 | contracts |
| `/api/admin/contracts/[contractId]/send-signature` | POST | 계약 서명 전송 | contracts |

### 7.7 알림 & 회원 관리 (7개)
| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/admin/notifications` | GET | 알림 목록 | admin_notifications |
| `/api/admin/notifications/[id]/read` | POST | 알림 읽음 처리 | admin_notifications |
| `/api/admin/users` | GET | 회원 목록 | profiles |
| `/api/admin/users/[id]/approve` | POST | 회원 승인 | profiles |
| `/api/admin/approve-member` | POST | 회원 승인 (레거시) | profiles |

---

## 8. B2B API (B2B 전용) - 76개

### 8.1 인증 & 회원가입 (9개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/login` | POST | B2B 로그인 | Cookie | profiles |
| `/api/b2b/register` | POST | B2B 회원가입 (사업자등록증) | - | profiles |
| `/api/b2b/verify-email` | POST | 이메일 인증 | - | profiles |
| `/api/b2b/resend-verification` | POST | 인증 메일 재발송 | - | profiles |
| `/api/b2b/invite` | POST | B2B 초대장 발송 | Cookie + ADMIN | profiles, invitations |
| `/api/b2b/invite/accept` | POST | B2B 초대 수락 | - | profiles |
| `/api/b2b/admin/pending-users` | GET | 승인 대기 회원 목록 | Cookie + ADMIN | profiles |
| `/api/b2b/admin/approve-user` | POST | 회원 승인 | Cookie + ADMIN | profiles |
| `/api/b2b/admin/reject-user` | POST | 회원 거부 | Cookie + ADMIN | profiles |

### 8.2 견적서 관리 (5개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/quotations` | GET | 견적서 목록 | Cookie | quotations |
| `/api/b2b/quotations/[id]` | GET | 견적서 상세 | Cookie | quotations |
| `/api/b2b/quotations/[id]/approve` | POST | 견적 승인 | Cookie | quotations |
| `/api/b2b/quotations/[id]/convert-to-order` | POST | 견적→주문 변환 | Cookie | orders |
| `/api/b2b/quotations/[id]/export` | POST | 견적서 내보내기 | Cookie | quotations |

### 8.3 주문 관리 (4개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/orders` | GET | 주문 목록 | Cookie | orders |
| `/api/b2b/orders/confirm` | POST | 주문 확정 | Cookie | orders |
| `/api/b2b/orders/[id]/tracking` | GET | 주문 배송 추적 | Cookie | shipments |
| `/api/b2b/orders/[id]/production-logs` | GET | 주문 생산 로그 | Cookie | production_logs |

### 8.4 계약 관리 (3개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/contracts` | GET | 계약 목록 | Cookie | contracts |
| `/api/b2b/contracts/sign` | POST | 계약 서명 | Cookie | contracts |
| `/api/b2b/contracts/[id]/sign` | POST | 특정 계약 서명 | Cookie | contracts |

### 8.5 인보이스 & 결제 (2개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/invoices` | GET | 인보이스 목록 | Cookie | invoices |
| `/api/b2b/invoices/[id]` | GET | 인보이스 상세 | Cookie | invoices |

### 8.6 사양서 (Spec Sheets) (3개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/spec-sheets/generate` | POST | 사양서 생성 | Cookie | spec_sheets |
| `/api/b2b/spec-sheets/[id]/approve` | POST | 사양서 승인 | Cookie + ADMIN | spec_sheets |
| `/api/b2b/spec-sheets/[id]/reject` | POST | 사양서 거부 | Cookie + ADMIN | spec_sheets |

### 8.7 샘플, 배송, 재고, 작업지시서 (4개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/samples` | POST | B2B 샘플 요청 | Cookie | sample_requests |
| `/api/b2b/shipments` | GET | 배송 목록 | Cookie | shipments |
| `/api/b2b/stock-in` | POST | 입고 처리 | Cookie | inventory |
| `/api/b2b/work-orders` | GET | 작업 지시서 목록 | Cookie | work_orders |

### 8.8 파일 관리 (3개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/files/upload` | POST | 파일 업로드 | Cookie | files |
| `/api/b2b/files/[id]/extract` | POST | 파일 데이터 추출 | Cookie | files |
| `/api/b2b/documents/[id]/download` | GET | 문서 다운로드 | Cookie | files |

### 8.9 AI 추출 (3개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/ai-extraction/upload` | POST | AI 추출 파일 업로드 | Cookie | ai_extraction_jobs |
| `/api/b2b/ai-extraction/status` | GET | AI 추출 상태 | Cookie | ai_extraction_jobs |
| `/api/b2b/ai-extraction/approve` | POST | AI 추출 승인 | Cookie | ai_extraction_jobs |

### 8.10 한국 생산 시스템 (3개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/korea/send-data` | POST | 한국 공장 데이터 전송 | Cookie | production_jobs |
| `/api/b2b/korea/corrections` | GET | 수정 요청 목록 | Cookie | korea_corrections |
| `/api/b2b/korea/corrections/[id]/upload` | POST | 수정 파일 업로드 | Cookie | korea_corrections |

### 8.11 기타 B2B (6개)
| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/b2b/products` | GET | B2B 제품 목록 | Cookie | products |
| `/api/b2b/dashboard/stats` | GET | B2B 대시보드 통계 | Cookie | orders, quotations |
| `/api/b2b/state-machine/transition` | POST | 상태 머신 전이 | Cookie | state_transitions |
| `/api/b2b/timestamp/verify` | POST | 타임스탬프 검증 | Cookie | timestamps |
| `/api/b2b/certificate/generate` | POST | 인증서 생성 | Cookie | certificates |
| `/api/b2b/hanko/upload` | POST | 한코(일본 도장) 업로드 | Cookie | signatures |

---

## 9. Customer Portal API - 6개

| 엔드포인트 | 메서드 | 설명 | 인증 방식 | DB 테이블 |
|-----------|--------|------|----------|----------|
| `/api/customer/dashboard` | GET | 포털 대시보드 | Cookie | customers, orders |
| `/api/customer/orders` | GET | 포털 주문 목록 | Cookie | orders |
| `/api/customer/orders/[id]` | GET | 포털 주문 상세 | Cookie | orders |
| `/api/customer/profile` | GET/PATCH | 포털 프로필 | Cookie | profiles |
| `/api/customer/documents` | GET | 문서 목록 | Cookie | customer_documents |
| `/api/customer/notifications` | GET | 알림 목록 | Cookie | customer_notifications |

---

## 10. AI Parser API - 4개

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/ai-parser/extract` | POST | AI 데이터 추출 (GPT-4 Vision) | ai_extraction_jobs |
| `/api/ai-parser/reprocess` | POST | AI 재처리 | ai_extraction_jobs |
| `/api/ai-parser/approve` | POST | AI 추출 승인 | ai_extraction_jobs |
| `/api/ai-parser/validate` | POST | AI 검증 | ai_extraction_jobs |

---

## 11. Utility API - 3개

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/comparison/save` | POST | 제품 비교 저장 | product_comparisons |
| `/api/supabase-mcp/execute` | POST | Supabase MCP 쿼리 실행 | - |
| `/api/settings` | GET/POST | 시스템 설정 조회/저장 | settings |

---

## 12. Spec Sheet API - 1개

| 엔드포인트 | 메서드 | 설명 | DB 테이블 |
|-----------|--------|------|----------|
| `/api/specsheet/pdf` | POST | 사양서 PDF 생성 | spec_sheets |

---

## 요약 통계

### 총 API 엔드포인트 수: **242개**

### 카테고리별 분포:
| 카테고리 | API 수 | 비율 |
|---------|--------|------|
| Public APIs | 18개 | 7.4% |
| Auth APIs | 7개 | 2.9% |
| Member APIs | 21개 | 8.7% |
| Shipment APIs | 10개 | 4.1% |
| Signature APIs | 5개 | 2.1% |
| Contract APIs | 5개 | 2.1% |
| Admin APIs | 37개 | 15.3% |
| B2B APIs | 76개 | 31.4% |
| Customer Portal APIs | 6개 | 2.5% |
| AI Parser APIs | 4개 | 1.7% |
| Utility APIs | 3개 | 1.2% |
| Spec Sheet APIs | 1개 | 0.4% |
| **기타 (문서화 진행 중)** | 49개 | 20.2% |

### 인증 방식별 분포:
| 인증 방식 | API 수 | 설명 |
|----------|--------|------|
| **Cookie (httpOnly)** | 180개+ | 대부분의 사용자 API |
| **Bearer Token** | 5개 | 전자 서명 API |
| **Service Role** | 37개 | 관리자 전용 API |
| **없음 (Public)** | 18개 | 공개 API |

### Rate Limiting:
- **로그인**: 10req/15min
- **회원가입**: 3req/시간
- **문의하기**: 10req/15min
- **파일 업로드**: 5req/분

---

## 추가 문서화 필요 항목 (49개)

다음 카테고리의 API는 현재 구현되어 있으나 상세 문서화가 필요합니다:

1. **Webhook APIs** (5개) - DocuSign, HelloSign, 결제 웹훅
2. **외부 연동 APIs** (12개) - 운송사, 결제 PG, 이메일
3. **보고서 APIs** (8개) - 매출, 재고, 생산 통계
4. **배치 처리 APIs** (6개) - 일괄 처리, 데이터 동기화
5. **모니터링 APIs** (5개) - 시스템 상태, 성능 모니터링
6. **테스트 APIs** (8개) - 개발/테스트 환경 전용
7. **레거시 APIs** (5개) - 하위 호환성 유지

---

**문서 버전**: 3.0
**마지막 업데이트**: 2026-01-07
**다음 리뷰**: 모든 API 테스트 완료 후
