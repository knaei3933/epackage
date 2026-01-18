# 크로스 레퍼런스 (Cross-Reference Indices)

Epackage Lab Web 시스템의 전체 페이지, API, 데이터베이스 테이블 간의 관계를 문서화합니다.

**최종 업데이트**: 2026-01-10
**B2B → Member API 마이그레이션 완료 반영**

---

## 요약 통계 (Summary Statistics)

| 항목 | 개수 | 비고 |
|------|------|------|
| **전체 페이지** | 78개 | B2B → Member 통합 완료 |
| **데이터베이스 테이블** | 30개 | Public schema 기준 |
| **API 엔드포인트** | 90+ | Member: 51, Admin: 39, 기타: 10+ |
| **버튼/액션 플로우** | ~165개 | |
| **성능 인덱스** | 28개 | |
| **외래 키 제약조건** | 19개 | |
| **데이터베이스 트리거** | 19개 | |

---

## 1. 페이지 → 테이블 매핑 (Page → Database Tables)

### 공개 페이지 (Public Pages)

| 페이지 URL | 사용 테이블 | 설명 |
|-----------|-----------|------|
| `/` | products, announcements | 메인 페이지 - 제품 카탈로그 + 공지사항 |
| `/about` | - | 회사 소개 |
| `/catalog` | products | 제품 카탈로그 목록 |
| `/catalog/[slug]` | products | 제품 상세 페이지 |
| `/service` | - | 서비스 소개 |
| `/guide/*` | - | 가이드 페이지 (색상, 사이즈, 이미지 등) |
| `/contact` | inquiries | 연락처 페이지 |
| `/contact/thank-you` | inquiries | 문의 완료 페이지 |
| `/samples` | products, sample_requests | 샘플 신청 페이지 |
| `/samples/thank-you` | sample_requests | 샘플 신청 완료 |
| `/quote-simulator` | - | 견적 시뮬레이터 |
| `/smart-quote` | - | 스마트 견적 |
| `/roi-calculator` | - | ROI 계산기 |
| `/compare` | products | 제품 비교 |
| `/pricing` | - | 가격 정책 |
| `/privacy` | - | 개인정보 처리방침 |
| `/terms` | - | 이용약관 |
| `/csr` | - | CSR 활동 |
| `/legal` | - | 법적 정보 |
| `/news` | announcements | 뉴스/공지사항 |
| `/print` | - | 인쇄 안내 |
| `/flow` | - | 업무 흐름 |
| `/data-templates` | - | 데이터 템플릿 |
| `/premium-content` | - | 프리미엄 콘텐츠 |
| `/simulation` | - | 시뮬레이션 |
| `/inquiry/detailed` | inquiries | 상세 문의 |
| `/cart` | - | 장바구니 |

### 인증 페이지 (Authentication Pages)

| 페이지 URL | 사용 테이블 | 설명 |
|-----------|-----------|------|
| `/auth/signin` | profiles | 로그인 |
| `/auth/register` | profiles | 일반 회원가입 (B2B/B2C 통합) |
| `/auth/pending` | profiles | 승인 대기 중 |
| `/auth/suspended` | profiles | 계정 정지됨 |
| `/auth/forgot-password` | profiles | 비밀번호 찾기 |
| `/auth/reset-password` | profiles | 비밀번호 재설정 |
| `/auth/signout` | - | 로그아웃 |
| `/auth/error` | - | 인증 에러 |

### 회원 포털 페이지 (Member Portal Pages)

| 페이지 URL | 사용 테이블 | 설명 |
|-----------|-----------|------|
| `/member/dashboard` | profiles, orders, quotations, sample_requests, inquiries, announcements | 회원 대시보드 |
| `/member/profile` | profiles, delivery_addresses, billing_addresses | 회원 프로필 |
| `/member/edit` | profiles | 프로필 수정 |
| `/member/settings` | profiles | 계정 설정 |
| `/member/orders` | orders, order_items | 주문 목록 |
| `/member/orders/new` | products | 새 주문 |
| `/member/orders/reorder` | orders, order_items | 재주문 |
| `/member/orders/[id]` | orders, order_items, production_orders, shipments, design_revisions | 주문 상세 |
| `/member/orders/[id]/confirmation` | orders | 주문 확인 |
| `/member/orders/[id]/data-receipt` | files, design_revisions, korea_corrections | 데이터 수령 |
| `/member/orders/history` | orders, order_items | 주문 내역 |
| `/member/quotations` | quotations, quotation_items | 견적 목록 |
| `/member/quotations/[id]` | quotations, quotation_items | 견적 상세 |
| `/member/quotations/[id]/confirm` | quotations | 견적 확인 |
| `/member/quotations/request` | products | 견적 요청 |
| `/member/samples` | sample_requests, sample_items | 샘플 요청 목록 |
| `/member/deliveries` | delivery_addresses, shipments | 배송지 관리 |
| `/member/contracts` | contracts, signatures, quotations, orders | 계약 관리 (모든 회원) |
| `/member/invoices` | - | 청구서 |
| `/member/inquiries` | inquiries | 문의 내역 |

### 관리자 페이지 (Admin Pages)

| 페이지 URL | 사용 테이블 | 설명 |
|-----------|-----------|------|
| `/admin/dashboard` | profiles, orders, quotations, sample_requests, inquiries, production_orders, shipments | 관리자 대시보드 |
| `/admin/orders` | orders, order_items, production_orders | 주문 관리 |
| `/admin/orders/[id]` | orders, order_items, production_orders, files, design_revisions | 주문 상세 |
| `/admin/approvals` | profiles, quotations | 승인 대기 목록 |
| `/admin/contracts` | contracts, signatures | 계약 관리 |
| `/admin/contracts/[id]` | contracts, signatures, quotations, orders | 계약 상세 |
| `/admin/production` | production_orders, stage_action_history | 생산 현황 |
| `/admin/production/[id]` | production_orders, stage_action_history, files, design_revisions | 생산 상세 |
| `/admin/inventory` | inventory, inventory_transactions | 재고 관리 |
| `/admin/shipments` | shipments, shipment_tracking_events | 배송 관리 |
| `/admin/shipments/[id]` | shipments, shipment_tracking_events | 배송 상세 |
| `/admin/shipping` | - | 배송 설정 |
| `/admin/leads` | inquiries, sample_requests | 리드 관리 |

### 포털 페이지 (Portal Pages)

| 페이지 URL | 사용 테이블 | 설명 |
|-----------|-----------|------|
| `/portal` | - | 포털 메인 |
| `/portal/orders` | orders | 주문 목록 |
| `/portal/orders/[id]` | orders | 주문 상세 |
| `/portal/profile` | profiles | 프로필 |
| `/portal/documents` | files, contracts, quotations | 문서 |
| `/portal/support` | inquiries | 지원 |

### 기타 페이지 (Other Pages)

| 페이지 URL | 사용 테이블 | 설명 |
|-----------|-----------|------|
| `/members` | profiles | 회원 목록 |
| `/profile` | profiles | 프로필 |
| `/archives` | - | 아카이브 |

---

## 2. API → 테이블 매핑 (API → Database Tables)

### 회원 API (Member APIs - 51 routes)

| API 엔드포인트 | HTTP | 사용 테이블 | 설명 |
|---------------|------|-----------|------|
| **인증 (Auth)** ||||
| `/api/member/auth/verify-email` | POST | profiles | 이메일 인증 |
| `/api/member/auth/resend-verification` | POST | profiles | 인증 이메일 재발송 |
| **초대 (Invites)** ||||
| `/api/member/invites/send` | POST | profiles, admin_notifications | 초대장 발송 |
| `/api/member/invites/accept` | POST | profiles | 초대장 수락 |
| **견적서 (Quotations)** ||||
| `/api/member/quotations` | GET/POST | quotations, quotation_items | 견적 목록/생성 |
| `/api/member/quotations/[id]` | GET/PATCH/DELETE | quotations, quotation_items | 견적 상세/수정/삭제 |
| `/api/member/quotations/[id]/approve` | POST | quotations, quotations | 견적 승인 |
| `/api/member/quotations/[id]/convert` | POST | orders, order_items, quotations | 견적 → 주문 변환 |
| `/api/member/quotations/[id]/export` | GET | quotations, quotation_items | 견적 내보내기 |
| `/api/member/quotations/[id]/invoice` | GET | quotations | 견적 송장 |
| `/api/member/quotations/[id]/confirm-payment` | POST | quotations | 결제 확인 |
| **주문 (Orders)** ||||
| `/api/member/orders` | GET | orders, order_items | 주문 목록 |
| `/api/member/orders/confirm` | POST | orders | 주문 확정 |
| `/api/member/orders/[id]/tracking` | GET | shipments, shipment_tracking_events | 배송 추적 |
| `/api/member/orders/[id]/production-logs` | GET | production_orders, stage_action_history | 생산 로그 |
| `/api/member/orders/[id]/data-receipt` | GET/POST | files, design_revisions | 데이터 수령 |
| `/api/member/orders/[id]/data-receipt/[fileId]` | DELETE | files | 파일 삭제 |
| `/api/member/orders/[id]/comments` | GET/POST | - | 주문 코멘트 |
| `/api/member/orders/[id]/production-data` | GET | production_orders | 생산 데이터 |
| **샘플 (Samples)** ||||
| `/api/member/samples` | GET | sample_requests, sample_items | 샘플 목록 |
| **송장 (Invoices)** ||||
| `/api/member/invoices` | GET | - | 송장 목록 |
| `/api/member/invoices/[invoiceId]/download` | GET | - | 송장 다운로드 |
| **문의 (Inquiries)** ||||
| `/api/member/inquiries` | GET/POST | inquiries | 문의 목록/생성 |
| **대시보드 (Dashboard)** ||||
| `/api/member/dashboard/stats` | GET | orders, quotations, sample_requests, inquiries, announcements | 대시보드 통계 |
| **설정 (Settings)** ||||
| `/api/member/settings` | GET/PUT | profiles | 계정 설정 |
| `/api/member/delete-account` | DELETE | profiles | 계정 삭제 |
| **주소 (Addresses)** ||||
| `/api/member/addresses/delivery` | GET/POST | delivery_addresses | 배송지 관리 |
| `/api/member/addresses/delivery/[id]` | PUT/DELETE | delivery_addresses | 배송지 수정/삭제 |
| `/api/member/addresses/billing` | GET/POST | billing_addresses | 청구지 관리 |
| `/api/member/addresses/billing/[id]` | PUT/DELETE | billing_addresses | 청구지 수정/삭제 |
| **AI 추출 (AI Extraction)** ||||
| `/api/member/ai-extraction/upload` | POST | files, design_revisions | AI 추출 업로드 |
| `/api/member/ai-extraction/status` | GET | design_revisions | 추출 상태 |
| `/api/member/ai-extraction/approve` | POST | design_revisions | 추출 승인 |
| **한국 통합 (Korea)** ||||
| `/api/member/korea/send-data` | POST | korea_transfer_log, korea_corrections | 한국 데이터 전송 |
| `/api/member/korea/corrections` | GET | korea_corrections | 수정 목록 |
| `/api/member/korea/corrections/[id]/upload` | POST | korea_corrections | 수정 파일 업로드 |
| **파일 (Files)** ||||
| `/api/member/files/upload` | POST | files | 파일 업로드 |
| `/api/member/files/[id]/extract` | POST | files, design_revisions | 파일 추출 |
| **문서 (Documents)** ||||
| `/api/member/documents/[id]/download` | GET | files | 문서 다운로드 |
| **스펙 시트 (Spec Sheets)** ||||
| `/api/member/spec-sheets/generate` | POST | design_revisions | 스펙 시트 생성 |
| `/api/member/spec-sheets/[id]/approve` | POST | design_revisions | 스펙 시트 승인 |
| `/api/member/spec-sheets/[id]/reject` | POST | design_revisions | 스펙 시트 거절 |
| **기타 (Misc)** ||||
| `/api/member/shipments` | GET | shipments | 배송 목록 |
| `/api/member/work-orders` | POST | production_orders | 작업 지시서 |
| `/api/member/stock-in` | POST | inventory, inventory_transactions | 입고 처리 |
| `/api/member/certificates/generate` | POST | - | 증명서 생성 |
| `/api/member/hanko/upload` | POST | signatures, signature_events | Hanko 서명 업로드 |

### 관리자 API (Admin APIs - 39 routes)

| API 엔드포인트 | HTTP | 사용 테이블 | 설명 |
|---------------|------|-----------|------|
| **사용자 관리 (Users)** ||||
| `/api/admin/users` | GET | profiles | 사용자 목록 |
| `/api/admin/users/pending` | GET | profiles | 승인 대기 목록 |
| `/api/admin/users/approve` | POST | profiles | 사용자 승인 |
| `/api/admin/users/reject` | POST | profiles | 사용자 거절 |
| `/api/admin/users/[id]/approve` | POST | profiles | 특정 사용자 승인 |
| `/api/admin/approve-member` | POST | profiles | 회원 승인 |
| **주문 관리 (Orders)** ||||
| `/api/admin/quotations` | GET | quotations, quotation_items | 견적 목록 |
| `/api/admin/convert-to-order` | POST | orders, order_items | 주문 변환 |
| `/api/admin/orders/statistics` | GET | orders | 주문 통계 |
| **생산 관리 (Production)** ||||
| `/api/admin/production/jobs` | GET | production_orders | 생산 작업 목록 |
| `/api/admin/production/jobs/[id]` | GET/PUT | production_orders, stage_action_history | 생산 작업 상세 |
| `/api/admin/production/[orderId]` | GET | production_orders, stage_action_history | 주문 생산 정보 |
| `/api/admin/production/update-status` | POST | production_orders, stage_action_history | 상태 업데이트 |
| `/api/admin/production-jobs` | GET | production_orders | 생산 작업 (별칭) |
| `/api/admin/production-jobs/[id]` | GET | production_orders | 생산 작업 상세 |
| **계약 관리 (Contracts)** ||||
| `/api/admin/contracts/workflow` | POST | contracts | 계약 워크플로우 |
| `/api/admin/contracts/request-signature` | POST | contracts, signatures | 서명 요청 |
| `/api/admin/contracts/send-reminder` | POST | contracts | 리마인더 발송 |
| `/api/admin/contracts/[contractId]/download` | GET | contracts | 계약 다운로드 |
| `/api/admin/contracts/[contractId]/send-signature` | POST | contracts, signatures | 서명 발송 |
| **재고 관리 (Inventory)** ||||
| `/api/admin/inventory/items` | GET | inventory, inventory_transactions | 재고 항목 |
| `/api/admin/inventory/record-entry` | POST | inventory, inventory_transactions | 입고 기록 |
| `/api/admin/inventory/adjust` | POST | inventory, inventory_transactions | 재고 조정 |
| `/api/admin/inventory/update` | PUT | inventory | 재고 업데이트 |
| `/api/admin/inventory/receipts` | GET | inventory_transactions | 입고증 목록 |
| `/api/admin/inventory/history/[productId]` | GET | inventory_transactions | 재고 이력 |
| **배송 관리 (Shipping)** ||||
| `/api/admin/shipping/tracking` | GET | shipments, shipment_tracking_events | 전체 추적 |
| `/api/admin/shipping/shipments` | GET | shipments | 배송 목록 |
| `/api/admin/shipping/deliveries/complete` | POST | shipments | 배송 완료 |
| `/api/admin/shipping/tracking/[id]` | GET | shipments, shipment_tracking_events | 추적 정보 |
| `/api/admin/shipments/[id]/tracking` | GET | shipments, shipment_tracking_events | 배송 추적 |
| `/api/admin/delivery/tracking/[orderId]` | GET | shipments | 주문 배송 추적 |
| **알림 (Notifications)** ||||
| `/api/admin/notifications` | GET/POST | admin_notifications | 알림 관리 |
| `/api/admin/notifications/[id]/read` | POST | admin_notifications | 알림 읽음 |
| `/api/admin/notifications/unread-count` | GET | admin_notifications | 읽지 않은 알림 수 |
| **대시보드 (Dashboard)** ||||
| `/api/admin/dashboard/statistics` | GET | profiles, orders, quotations, sample_requests, inquiries | 대시보드 통계 |
| `/api/admin/performance/metrics` | GET | - | 성능 메트릭 |
| **작업 지시서 (Work Orders)** ||||
| `/api/admin/generate-work-order` | POST | production_orders | 작업 지시서 생성 |

### 통합 API (Unified APIs)

| API 엔드포인트 | HTTP | 사용 테이블 | 설명 |
|---------------|------|-----------|------|
| `/api/contact` | POST | inquiries, admin_notifications | 문의 제출 |
| `/api/samples/request` | POST | sample_requests, sample_items, admin_notifications, delivery_addresses | 샘플 요청 |
| `/api/quotations/save` | POST | quotations, quotation_items | 견적 저장 |
| `/api/quotations/[id]/convert-to-order` | POST | orders, order_items, quotations | 견적 → 주문 |
| `/api/orders/create` | POST | orders, order_items | 주문 생성 |
| `/api/shipments/create` | POST | shipments | 배송 생성 |
| `/api/contract/workflow/action` | POST | contracts | 계약 워크플로우 액션 |
| `/api/ai-parser/extract` | POST | files, design_revisions | AI 추출 |
| `/api/products/filter` | POST | products | 제품 필터링 |
| `/api/products/search` | GET | products | 제품 검색 |

---

## 3. 데이터베이스 테이블 → 페이지 매핑 (Database Tables → Pages)

### profiles (회원 프로필)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/dashboard` | 회원 대시보드 |
| `/member/profile` | 프로필 조회 |
| `/member/edit` | 프로필 수정 |
| `/member/settings` | 계정 설정 |
| `/auth/register` | 회원가입 (B2B/B2C 통합) |
| `/auth/signin` | 로그인 |
| `/admin/approvals` | 회원 승인 |
| `/admin/dashboard` | 관리자 대시보드 |

### orders (주문)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/orders` | 주문 목록 |
| `/member/orders/[id]` | 주문 상세 |
| `/member/orders/new` | 새 주문 |
| `/member/orders/reorder` | 재주문 |
| `/admin/orders` | 주문 관리 |
| `/admin/orders/[id]` | 주문 상세 |
| `/admin/dashboard` | 주문 통계 |
| `/portal/orders` | 포털 주문 |

### quotations (견적)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/quotations` | 견적 목록 |
| `/member/quotations/[id]` | 견적 상세 |
| `/member/quotations/request` | 견적 요청 |
| `/member/contracts` | 계약 관련 견적 |
| `/admin/approvals` | 견적 승인 |
| `/admin/contracts` | 계약 견적 |
| `/quote-simulator` | 견적 시뮬레이터 |
| `/smart-quote` | 스마트 견적 |

### sample_requests (샘플 요청)

| 관련 페이지 | 설명 |
|-----------|------|
| `/samples` | 샘플 신청 |
| `/samples/thank-you` | 신청 완료 |
| `/member/samples` | 샘플 목록 |
| `/admin/leads` | 리드 관리 |
| `/member/dashboard` | 대시보드 요약 |

### inquiries (문의)

| 관련 페이지 | 설명 |
|-----------|------|
| `/contact` | 문의하기 |
| `/contact/thank-you` | 문의 완료 |
| `/member/inquiries` | 문의 내역 |
| `/admin/leads` | 리드 관리 |
| `/inquiry/detailed` | 상세 문의 |

### production_orders (생산 주문)

| 관련 페이지 | 설명 |
|-----------|------|
| `/admin/production` | 생산 현황 |
| `/admin/production/[id]` | 생산 상세 |
| `/member/orders/[id]` | 주문 생산 현황 |
| `/admin/dashboard` | 생산 통계 |

### shipments (배송)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/deliveries` | 배송지 관리 |
| `/member/orders/[id]` | 배송 추적 |
| `/admin/shipments` | 배송 관리 |
| `/admin/shipments/[id]` | 배송 상세 |
| `/portal/orders/[id]` | 포털 배송 |

### contracts (계약)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/contracts` | 계약 목록 (모든 회원) |
| `/admin/contracts` | 계약 관리 |
| `/admin/contracts/[id]` | 계약 상세 |
| `/portal/documents` | 계약 문서 |

### design_revisions (디자인 수정)

| 관련 페이지 | 설명 |
|-----------|------|
| `/admin/orders/[id]` | 디자인 수정 내역 |
| `/member/orders/[id]/data-receipt` | 데이터 수령 |
| `/admin/production/[id]` | 디자인 파일 관리 |

### files (파일)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/orders/[id]/data-receipt` | 파일 업로드 |
| `/admin/orders/[id]` | 파일 관리 |
| `/portal/documents` | 문서 다운로드 |

### announcements (공지사항)

| 관련 페이지 | 설명 |
|-----------|------|
| `/news` | 뉴스 페이지 |
| `/member/dashboard` | 대시보드 공지 |
| `/portal` | 포털 공지 |

### delivery_addresses (배송지)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/deliveries` | 배송지 관리 |
| `/member/profile` | 프로필 배송지 |
| `/samples` | 샘플 배송지 |

### billing_addresses (청구지)

| 관련 페이지 | 설명 |
|-----------|------|
| `/member/profile` | 청구지 관리 |
| `/member/quotations/[id]` | 견적 청구지 |

### korea_corrections (한국 수정)

| 관련 페이지 | 설명 |
|-----------|------|
| `/admin/orders/[id]` | 수정 내역 |
| `/admin/production` | 수정 요청 |

### stage_action_history (단계 액션 이력)

| 관련 페이지 | 설명 |
|-----------|------|
| `/admin/production` | 생산 이력 |
| `/admin/production/[id]` | 상세 이력 |

### korea_transfer_log (한국 전송 로그)

| 관련 페이지 | 설명 |
|-----------|------|
| `/admin/orders/[id]` | 전송 기록 |

---

## 4. API 그룹별 요약 (API Group Summary)

### 회원 API (Member API)

**총 51개 엔드포인트**

| 카테고리 | 엔드포인트 수 | 주요 경로 |
|---------|--------------|----------|
| 인증 | 2 | `/api/member/auth/*` |
| 초대 | 2 | `/api/member/invites/*` |
| 견적서 | 7 | `/api/member/quotations/*` |
| 주문 | 7 | `/api/member/orders/*` |
| 샘플 | 1 | `/api/member/samples` |
| 송장 | 2 | `/api/member/invoices/*` |
| 문의 | 1 | `/api/member/inquiries` |
| 대시보드 | 1 | `/api/member/dashboard/*` |
| 설정 | 2 | `/api/member/settings`, `/api/member/delete-account` |
| 주소 | 4 | `/api/member/addresses/*` |
| AI 추출 | 3 | `/api/member/ai-extraction/*` |
| 한국 | 3 | `/api/member/korea/*` |
| 파일 | 2 | `/api/member/files/*` |
| 문서 | 1 | `/api/member/documents/*` |
| 스펙 시트 | 3 | `/api/member/spec-sheets/*` |
| 기타 | 11 | `/api/member/shipments`, `/api/member/work-orders`, 등 |

### 관리자 API (Admin API)

**총 39개 엔드포인트**

| 카테고리 | 엔드포인트 수 | 주요 경로 |
|---------|--------------|----------|
| 사용자 | 5 | `/api/admin/users/*` |
| 주문 | 3 | `/api/admin/quotations`, `/api/admin/convert-to-order`, 등 |
| 생산 | 6 | `/api/admin/production/*` |
| 계약 | 5 | `/api/admin/contracts/*` |
| 재고 | 6 | `/api/admin/inventory/*` |
| 배송 | 6 | `/api/admin/shipping/*` |
| 알림 | 3 | `/api/admin/notifications/*` |
| 대시보드 | 2 | `/api/admin/dashboard/*`, `/api/admin/performance/*` |
| 작업 지시서 | 1 | `/api/admin/generate-work-order` |
| 기타 | 2 | `/api/admin/approve-member`, `/api/admin/delivery/*` |

---

## 5. 데이터베이스 테이블 요약 (Database Tables Summary)

### Public Schema Tables (30개)

| # | 테이블명 | 설명 |
|---|---------|------|
| 1 | profiles | 사용자 프로필 |
| 2 | orders | 주문 |
| 3 | order_items | 주문 항목 |
| 4 | quotations | 견적서 |
| 5 | quotation_items | 견적 항목 |
| 6 | contracts | 계약 |
| 7 | sample_requests | 샘플 요청 |
| 8 | sample_items | 샘플 항목 |
| 9 | products | 제품 |
| 10 | announcements | 공지사항 |
| 11 | billing_addresses | 청구지 주소 |
| 12 | companies | 기업 정보 |
| 13 | delivery_addresses | 배송지 주소 |
| 14 | files | 파일 관리 |
| 15 | inquiries | 문의 |
| 16 | inventory | 재고 |
| 17 | inventory_transactions | 재고 입출고 내역 |
| 18 | order_status_history | 주문 상태 변경 이력 |
| 19 | payment_confirmations | 결제 확인 |
| 20 | production_orders | 생산 주문 |
| 21 | shipment_tracking_events | 배송 추적 이벤트 |
| 22 | shipments | 배송 |
| 23 | admin_notifications | 관리자 알림 |
| 24 | contact_submissions | 연락처 제출 |
| 25 | notifications | 고객 알림 (customer_notifications) |
| 26 | contract_reminders | 계약 리마인더 |
| 27 | design_revisions | 디자인 수정 |
| 28 | korea_corrections | 한국어 교정 내역 |
| 29 | korea_transfer_log | 한국어 전송 로그 |
| 30 | stage_action_history | 단계 액션 이력 |

---

## 6. B2B → Member 통합 변경사항 (B2B to Member Migration Changes)

### 삭제된 B2B 전용 페이지
- `/b2b/login` → `/auth/signin` (통합 로그인)
- `/b2b/register` → `/auth/register` (통합 회원가입)
- `/b2b/contracts` → `/member/contracts` (모든 회원 사용 가능)

### API 경로 변경
| 이전 경로 | 새로운 경로 |
|----------|-----------|
| `/api/b2b/quotations` | `/api/member/quotations` |
| `/api/b2b/orders` | `/api/member/orders` |
| `/api/b2b/invoices` | `/api/member/invoices` |
| `/api/b2b/samples` | `/api/member/samples` |
| `/api/b2b/dashboard/stats` | `/api/member/dashboard/stats` |
| `/api/b2b/korea/*` | `/api/member/korea/*` |
| `/api/b2b/ai-extraction/*` | `/api/member/ai-extraction/*` |
| `/api/b2b/files/*` | `/api/member/files/*` |
| `/api/b2b/spec-sheets/*` | `/api/member/spec-sheets/*` |
| `/api/b2b/contracts/sign` | `/api/member/contracts/sign` |
| `/api/b2b/admin/*` | `/api/admin/*` |
| `/api/b2b/work-orders` | `/api/member/work-orders` |
| `/api/b2b/shipments` | `/api/member/shipments` |
| `/api/b2b/stock-in` | `/api/member/stock-in` |
| `/api/b2b/certificates/generate` | `/api/member/certificates/generate` |
| `/api/b2b/hanko/upload` | `/api/member/hanko/upload` |

---

**문서 버전**: 2.0
**최종 업데이트**: 2026-01-10
**작성자**: Claude Code (System Analysis Agent)
**변경사항**: B2B → Member API 마이그레이션 완료 반영, API 엔드포인트 90개로 갱신
