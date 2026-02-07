# 관리자 페이지 테스트 시나리오

**작성일**: 2026-01-21
**목적**: 관리자가 시스템을 관리하는 시나리오

---

## 페이지 목록 (실제 존재 페이지 기반)

| # | 페이지 | 설명 | 파일 |
|---|--------|------|------|
| 1 | 로그인 & 대시보드 | 관리자 로그인 및 통계 확인 | [login-dashboard.md](./login-dashboard.md) |
| 2 | 견적 승인 | 견적 목록, 상세, 승인/거절 | [quotation-approval.md](./quotation-approval.md) |
| 3 | 회원 승인 | 회원 승인 대기 목록 및 승인/거절 | [approvals.md](./approvals.md) |
| 4 | 고객 관리 | 전체 고객 조회 및 관리 | [customers.md](./customers.md) |
| 5 | 주문 관리 | 주문 목록, 상세, 승인 | [orders.md](./orders.md) |
| 6 | 계약 관리 | 계약 워크플로우 및 서명 관리 | [contracts.md](./contracts.md) |
| 7 | 생산 관리 | 생산 작업 할당 및 진척 관리 | [production.md](./production.md) |
| 8 | 재고 관리 | 재고 현황 및 입고/출고 | [inventory.md](./inventory.md) |
| 9 | 배송 관리 | 배송 현황 및 운송장 관리 | [shipments.md](./shipments.md) |
| 10 | 리드 관리 | 영업 리드 관리 | [leads.md](./leads.md) |
| 11 | 쿠폰 관리 | 쿠폰 생성 및 관리 | [coupons.md](./coupons.md) |
| 12 | 시스템 관리 | 시스템 설정 및 구성 | [settings.md](./settings.md) |
| 13 | 관리자 알림 | 관리자 알림 센터 | [notifications.md](./notifications.md) |

---

## 공통 전제 조건

- **사용자**: 관리자(ADMIN 역할)
- **계정**: admin@test.epac.co.jp / Admin1234!
- **상태**: ACTIVE (활성화됨)
- **서버**: http://localhost:3002

---

## 상호 검증 흐름

각 시나리오에서 입력한 데이터가 회원 페이지에 반영되는지 확인:

```
관리자 액션 → 데이터베이스 업데이트 → 회원 페이지 확인
```

예시:
1. 관리자가 주문 승인 → DB status 변경 → 회원이 주문 상태 확인
2. 관리자가 쿠폰 생성 → DB 쿠폰 저장 → 회원이 쿠폰 사용 가능
3. 관리자가 계약 생성 → DB 계약 저장 → 회원이 계약 확인

---

## 테스트 완료 후 확인

### 데이터베이스 검증

```sql
-- 계약 확인
SELECT contract_number, status, customer_signed_at
FROM contracts
ORDER BY created_at DESC;

-- 쿠폰 확인
SELECT code, discount_type, discount_value, is_active
FROM coupons
ORDER BY created_at DESC;

-- 리드 확인
SELECT name, company, status, source
FROM leads
ORDER BY created_at DESC;
```

---

## 관리자 권한

관리자는 다음 작업을 수행할 수 있습니다:
- 모든 견적 조회 및 승인/거절
- 회원 가입 승인/거절
- 주문 승인 및 관리
- 계약 생성 및 관리
- 생산 작업 할당 및 진척 관리
- 재고 관리
- 배송 관리
- 리드 관리
- 쿠폰 생성 및 관리
- 시스템 설정 관리
- 모든 알림 확인

---

## 다음 단계

- 각 페이지 시나리오로 이동하여 테스트 실행
- [회원 페이지](../member/)와 상호 검증
- [통합 테스트](../integration/)로 이동
