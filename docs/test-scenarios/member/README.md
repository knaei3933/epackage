# 회원 페이지 테스트 시나리오

**작성일**: 2026-01-21
**목적**: 로그인한 회원이 서비스를 이용하는 시나리오

---

## 페이지 목록 (실제 존재 페이지 기반)

| # | 페이지 | 설명 | 파일 |
|---|--------|------|------|
| 1 | 로그인 & 대시보드 | 회원 로그인 및 통계 확인 | [login-dashboard.md](./login-dashboard.md) |
| 2 | 주문 관리 | 주문 내역, 상세, 추적 | [orders.md](./orders.md) |
| 3 | 견적 관리 | 견적 목록 및 상세 확인 | [quotations.md](./quotations.md) |
| 4 | 계약 관리 | 계약 목록 및 서명 | [contracts.md](./contracts.md) |
| 5 | 납품처 관리 | 납품처 정보 관리 | [deliveries.md](./deliveries.md) |
| 6 | 청구서 관리 | 청구서 발행 및 관리 | [invoices.md](./invoices.md) |
| 7 | 샘플 의뢰 | 제품 샘플 요청 | [samples.md](./samples.md) |
| 8 | 문의 | 문의 내역 및 관리 | [inquiries.md](./inquiries.md) |
| 9 | 프로필 | 프로필 정보 조회 | [profile.md](./profile.md) |
| 10 | 회원정보 편집 | 회원 정보 수정 | [edit.md](./edit.md) |
| 11 | 설정 | 계정 설정 | [settings.md](./settings.md) |
| 12 | 알림 센터 | 알림 확인 및 관리 | [notifications.md](./notifications.md) |

---

## 공통 전제 조건

- **사용자**: 회원(MEMBER 역할)
- **계정**: member@test.epac.co.jp / Member1234!
- **상태**: ACTIVE (활성화됨)
- **서버**: http://localhost:3002

---

## 상호 검증 흐름

관리자 액션과 회원 페이지 간의 상호 검증:

```
관리자 액션 → 데이터베이스 업데이트 → 회원 페이지 반영 확인
```

예시:
1. 관리자 주문 승인 → DB status 변경 → 회원 주문 상태 업데이트 확인
2. 관리자 계약 생성 → DB 계약 저장 → 회원 계약 목록 표시
3. 관리자 쿠폰 생성 → DB 쿠폰 저장 → 회원 쿠폰 사용 가능

---

## 데이터베이스 검증

```sql
-- 주문 확인
SELECT order_number, status, total_amount
FROM orders
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;

-- 견적 확인
SELECT quotation_number, status, total_amount
FROM quotations
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;

-- 계약 확인
SELECT contract_number, status
FROM contracts
WHERE user_id = 'member-uuid'
ORDER BY created_at DESC;
```

---

## 다음 단계

- 각 페이지 시나리오로 이동하여 테스트 실행
- [관리자 페이지](../admin/)와 상호 검증
- [통합 테스트](../integration/)로 이동
