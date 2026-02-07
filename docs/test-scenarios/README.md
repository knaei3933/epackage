# EPAC 홈페이지 테스트 시나리오

**작성일**: 2026-01-21
**목적**: Playwright MCP를 사용한 통합 테스트 시나리오 문서

---

## 문서 구조

```
test-scenarios/
├── homepage/        # 홈페이지(게스트 사용자) 테스트
├── member/          # 회원 페이지 테스트
├── admin/           # 관리자 페이지 테스트
└── integration/     # 통합 E2E 테스트
```

---

## 카테고리별 테스트 시나리오

### 🏠 [홈페이지 테스트](./homepage/)

게스트 사용자(비로그인)가 홈페이지를 이용하는 시나리오

| 시나리오 | 설명 |
|---------|------|
| [견적 생성](./homepage/guest-quotation.md) | 게스트 견적 시뮬레이터를 통한 견적 생성 |
| [카탈로그 둘러보기](./homepage/catalog-browsing.md) | 제품 카탈로그 페이지 둘러보기 |
| [문의하기](./homepage/contact-form.md) | 문의 양식 작성 및 제출 |
| [사례 보기](./homepage/case-studies.md) | 도입 사례 페이지 확인 |

---

### 👤 [회원 페이지 테스트](./member/)

로그인한 회원이 서비스를 이용하는 시나리오

| 시나리오 | 설명 |
|---------|------|
| [로그인 & 대시보드](./member/login-dashboard.md) | 회원 로그인 및 대시보드 통계 확인 |
| [주문 관리](./member/order-management.md) | 새 주문 생성, 내역 조회, 배송 추적 |
| [견적 관리](./member/quotation-management.md) | 견적 목록 조회 및 승인 대기 상태 확인 |
| [프로필 & 알림](./member/profile-notifications.md) | 프로필 수정 및 알림 센터 이용 |

---

### 👨‍💼 [관리자 페이지 테스트](./admin/)

관리자가 시스템을 관리하는 시나리오

| 시나리오 | 설명 |
|---------|------|
| [로그인 & 대시보드](./admin/login-dashboard.md) | 관리자 로그인 및 통계 확인 |
| [견적 승인](./admin/quotation-approval.md) | 견적 목록, 상세, 승인/거절 |
| [회원 관리](./admin/member-management.md) | 회원 승인 대기 목록 및 승인/거절 |
| [주문 & 생산](./admin/order-production.md) | 주문 관리 및 생산 진척 관리 |
| [재고 & 배송](./admin/inventory-shipping.md) | 재고 현황 및 배송 관리 |
| [관리자 알림](./admin/admin-notifications.md) | 관리자 알림 센터 |

---

### 🔗 [통합 테스트](./integration/)

고객과 관리자 간의 종단 간(E2E) 워크플로우 테스트

| 시나리오 | 설명 |
|---------|------|
| [게스트 견적~관리자 승인](./integration/guest-quotation-flow.md) | 게스트 견적 생성부터 관리자 승인까지 |
| [회원 가입~이용 시작](./integration/member-registration-flow.md) | 회원 가입, 승인, 대시보드 이용 |
| [주문~배송](./integration/order-shipping-flow.md) | 견적→주문→생산→배송 완전 흐름 |
| [알림 연동](./integration/notification-flow.md) | 크로스 시스템 알림 검증 |
| [실시간 업데이트](./integration/realtime-updates.md) | Supabase Realtime 검증 |
| [오류 처리 & 성능](./integration/error-performance.md) | 에러 핸들링, 성능, 보안 검증 |

---

## 테스트 실행 방법

### 사전 준비

```bash
# 1. 개발 서버 시작
npm run dev
# 서버: http://localhost:3000

# 2. 테스트 데이터베이스 확인
# - 관리자 계정: admin@example.com / TestAdmin123!
# - 회원 계정: member@test.com / Test1234!

# 3. Playwright MCP 시작
# Playwright MCP 서비스가 실행 중인지 확인
```

### 시나리오 실행

각 시나리오 파일에는 Playwright MCP 명령어가 포함되어 있습니다:

```bash
# 예시: 브라우저 탐색
[Browser_navigate] http://localhost:3000

# 예시: 요소 클릭
[Browser_click] element="견적 시작 버튼"

# 예시: 텍스트 입력
[Browser_type] element="이메일" text="test@example.com"
```

---

## 데이터베이스 검증

각 시나리오에는 데이터베이스 검증 SQL이 포함되어 있습니다:

```sql
-- 예시: 생성된 견적 확인
SELECT quotation_number, customer_name, status, total_amount
FROM quotations
WHERE customer_email = 'guest@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 테스트 완료 기준

### ✅ 기능 요구사항
- [ ] 홈페이지에서 게스트 견적 생성 가능
- [ ] 회원 가입 및 로그인 가능
- [ ] 견적에서 주문 생성 가능
- [ ] 관리자 승인 기능 정상 작동
- [ ] 알림이 정상적으로 생성/전송됨
- [ ] 실시간 업데이트 기능

### ✅ 비기능 요구사항
- [ ] 페이지 로드 시간 3초 이내
- [ ] API 응답 시간 1초 이내
- [ ] 데이터 무결성 유지
- [ ] 권한 제어 정상 작동
- [ ] 보안 대책 구현됨

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|---------|
| 2026-01-21 | 1.0 | 초기 테스트 시나리오 작성 |
| 2026-01-21 | 1.1 | 파일 분리 및 README 추가 |

---

## 문의 사항

테스트 실행 중 문제가 발생하면 각 시나리오 파일 하단의 **성공 기준** 섹션을 확인하세요.
