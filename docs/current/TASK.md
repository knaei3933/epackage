# Epackage Lab Web - Task List (PRD v2.1 기반)

**Version**: 2.1
**Date**: 2026-01-01
**Based on**: PRD v2.1 (Complete B2B Workflow)

---

## Phase 1: 완료됨 ✅

- [x] 인증 시스템 (회원가입, 로그인, 역할 기반 접근 제어)
- [x] 견적 시스템 (가격 계산, PDF 생성)
- [x] 샘플 요청 시스템
- [x] 관리자 대시보드
- [x] 주문 관리 (상태 추적, 기본 워크플로우)
- [x] 연락처 양식
- [x] 이메일 시스템 (SendGrid)
- [x] 데이터베이스 (Supabase)

---

## Phase 2: B2B 워크플로우 완성 (12단계) 🚧

### Task 1: Stage 6 - 한국 파트너 이메일 데이터 송부
- **설명**: 고객이 업로드한 디자인 데이터를 AI 추출 결과와 함께 이메일로 한국 파트너에게 발송
- **API**: `POST /api/orders/{id}/send-to-korea`
- **발신**: design@package-lab.com → 수신: info@package-lab.com
- **의존성**: 없음
- **우선순위**: 높음

### Task 2: AI 추출 데이터 이메일 본문 포맷팅
- **설명**: AI가 추출한 디자인 사양을 이메일 본문에 상세히 기재
- **내용**: 주문 정보, 제품 사양, 인쇄 사양, 디자인 텍스트, 추가 요구사항, AI 신뢰도
- **의존성**: Task 1
- **우선순위**: 높음

### Task 3: Stage 7 - 교정 데이터 관리자 업로드 화면
- **설명**: 한국 파트너가 이메일로 보낸 교정 데이터를 관리자가 시스템에 업로드
- **페이지**: `/admin/orders/{id}/correction-upload`
- **기능**: JPG 프리뷰, 원본 파일, 교정 코멘트, 고객 승인 요청 체크
- **의존성**: 없음
- **우선순위**: 높음

### Task 4: JPG 프리뷰 요구사항 검증
- **설명**: 업로드된 JPG 프리뷰가 요구사항을 충족하는지 검증
- **요구사항**: JPEG, 1920x1080px+, sRGB, 2MB 이하
- **의존성**: Task 3
- **우선순위**: 중간

### Task 5: Stage 7 - 교정 데이터 DB 저장 및 고객 알림
- **설명**: 업로드된 교정 데이터를 DB에 저장하고 고객에게 승인 요청 알림 발송
- **테이블**: `design_revisions`
- **상태**: `orders.current_stage = 'SPEC_SEND'`
- **의존성**: Task 3, Task 4
- **우선순위**: 높음

### Task 6: Stage 8 - 사양서 생성 및 승인 워크플로우
- **설명**: AI 추출 데이터 + 교정 데이터를 통합한 사양서 생성, 고객 승인 프로세스
- **API**: `POST /api/orders/{id}/spec-sheet`
- **고객 액션**: 승인 / 수정 요청 / 취소
- **의존성**: Task 5
- **우선순위**: 높음

### Task 7: Stage 9 - DocuSign 전자 계약 통합
- **설명**: DocuSign API 연동으로 전자 계약 프로세스 구현
- **API**: `POST /api/orders/{id}/contract`
- **Webhook**: `POST /api/webhooks/docusign`
- **의존성**: Task 6
- **우선순위**: 높음

### Task 8: Stage 10 - 제작 추적 개선
- **설명**: 9단계 서브프로세스 추적 시스템 개선
- **서브프로세스**: design_received, work_order_created, material_prepared, printing, lamination, slitting, pouch_making, qc_passed, packaged
- **의존성**: Task 7
- **우선순위**: 중간

### Task 9: Stage 11 - EMS 배송 추적 이메일 수신
- **설명**: 한국 파트너가 이메일로 보내는 EMS 송장번호를 시스템에 등록
- **페이지**: `/admin/orders/{id}/shipping-kr`
- **발신**: info@package-lab.com → info@package-lab.com
- **의존성**: Task 8
- **우선순위**: 중간

### Task 10: Stage 12 - 일본 국내 배송 API 통합
- **설명**: 일본 국내 배송사 (야마토, 사가와, 우편) API 연동
- **대상**: 야마토 운송, 사가와 급배, 일본 우편
- **의존성**: Task 9
- **우선순위**: 중간

### Task 11: 납품서 PDF 생성 및 자동 발송
- **설명**: 배송 완료 시 납품서 PDF 생성 및 자동 이메일 발송
- **API**: `POST /api/orders/{id}/delivery-note`
- **의존성**: Task 10
- **우선순위**: 중간

### Task 12: 알림 시스템 개선
- **설명**: 12단계 각 단계별 이메일 템플릿 개선 및 멀티 채널 알림
- **채널**: 이메일 (SendGrid), SMS (Twilio), 인앱
- **테이블**: `notifications`
- **의존성**: 없음
- **우선순위**: 낮음

### Task 13: 고객 포털 12단계 진행률 시각화
- **설명**: 고객 포털에서 12단계 워크플로우 진행 상황을 시각적으로 표시
- **컴포넌트**: `OrderProgressTimeline`
- **의존성**: 없음
- **우선순위**: 중간

### Task 14: 관리자 대시보드 B2B 주문 관리 개선
- **설명**: 관리자 대시보드에서 B2B 주문의 현재 상태별로 그룹화하여 표시
- **필터**: 전체 / 액션 대기 / 수정 중 / 제작 중 / 배송 중
- **의존성**: Task 13
- **우선순위**: 중간

### Task 15: design_revisions 테이블 마이그레이션
- **설명**: 교정 데이터 이력을 저장하는 테이블 생성
- **의존성**: 없음
- **우선순위**: 높음

### Task 16: notifications 테이블 마이그레이션
- **설명**: 모든 이메일/SMS/인앱 알림 이력을 저장하는 테이블 생성
- **의존성**: 없음
- **우선순위**: 높음

### Task 17: 환경변수 설정
- **설명**: 이메일 통신에 필요한 환경변수 설정
- **변수**: DESIGN_EMAIL, KOREA_PARTNER_EMAIL, SHIPPING_EMAIL, DOCUSIGN_API_KEY, 배송사 API 키
- **의존성**: 없음
- **우선순위**: 높음

### Task 18: 이메일 템플릿 생성 (Stage 6, 7, 11)
- **설명**: 각 스테이지별 이메일 템플릿 생성
- **파일**: stage6-design-data-submission.ja.html, stage7-correction-complete.ja.html, stage11-shipping-ems.ja.html
- **의존성**: Task 17
- **우선순위**: 높음

### Task 19: API 라우트 구현 (Stage 6-12)
- **설명**: B2B 워크플로우 API 엔드포인트 구현
- **엔드포인트**: send-to-korea, correction, spec-sheet, contract, production-status, shipping-kr, delivery
- **의존성**: Task 15, Task 16, Task 18
- **우선순위**: 높음

### Task 20: E2E 테스트 작성 (B2B 워크플로우)
- **설명**: Playwright로 12단계 전체 워크플로우 E2E 테스트 작성
- **파일**: tests/e2e/b2b-workflow-complete.spec.ts
- **의존성**: Task 19
- **우선순위**: 중간

---

## 작업 우선순위

### 높음 (즉시 시작)
- Task 1, 2, 3, 5, 6, 7, 15, 16, 17, 18, 19

### 중간 (다음 단계)
- Task 4, 8, 9, 10, 11, 13, 14, 20

### 낮음 (나중에)
- Task 12

---

## 이메일 통신 구조

| 단계 | 발신자 | 수신자 |
|------|--------|--------|
| 6 (데이터 송부) | design@package-lab.com | info@package-lab.com |
| 7 (교정 반환) | info@package-lab.com | design@package-lab.com |
| 11 (배송 추적) | info@package-lab.com | info@package-lab.com |

---

**Last Updated**: 2026-01-01
